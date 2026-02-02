from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from .models import UploadedDataset
from .serializers import UploadedDatasetSerializer
from .utils import generate_pdf_report

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = UploadedDataset.objects.all().order_by('-uploaded_at')
    serializer_class = UploadedDatasetSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        ids = UploadedDataset.objects.order_by('-uploaded_at').values_list('id', flat=True)[:5]
        UploadedDataset.objects.exclude(id__in=ids).delete()

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        dataset = self.get_object()
        if not dataset.summary:
            return Response({"error": "No summary available for this dataset"}, status=400)
            
        pdf_buffer = generate_pdf_report(dataset)
        return FileResponse(pdf_buffer, as_attachment=True, filename=f'report_{pk}.pdf')
