from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import UploadedDataset

@admin.register(UploadedDataset)
class UploadedDatasetAdmin(admin.ModelAdmin):
    list_display = ('id', 'uploaded_at', 'file_name', 'download_pdf')
    readonly_fields = ('uploaded_at', 'summary')

    def file_name(self, obj):
        return obj.file.name

    def download_pdf(self, obj):
        url = reverse('dataset-pdf', args=[obj.id])
        return format_html('<a class="button" href="{}">Download Report</a>', url)

    download_pdf.short_description = 'PDF Report'
    download_pdf.allow_tags = True
