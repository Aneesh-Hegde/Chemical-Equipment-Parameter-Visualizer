from rest_framework import serializers
from .models import UploadedDataset

class UploadedDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedDataset
        fields = ['id', 'file', 'uploaded_at', 'summary']
        read_only_fields = ['summary', 'uploaded_at']
