from django.db import models
import pandas as pd
import os

class UploadedDataset(models.Model):
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    summary = models.JSONField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.file and not self.summary:
            try:
                self.file.open()
                df = pd.read_csv(self.file)
                df.columns = df.columns.str.strip()
                required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
                if all(col in df.columns for col in required_cols):
                    for col in ['Flowrate', 'Pressure', 'Temperature']:
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                    self.summary = {
                        "total_count": len(df),
                        "averages": {
                            "Flowrate": round(df['Flowrate'].mean(), 2),
                            "Pressure": round(df['Pressure'].mean(), 2),
                            "Temperature": round(df['Temperature'].mean(), 2),
                        },
                        "type_distribution": df['Type'].value_counts().to_dict()
                    }
            except Exception as e:
                print(f"Error parsing CSV in model: {e}")

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)
