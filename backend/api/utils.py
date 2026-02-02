from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
import io
import matplotlib
import matplotlib.pyplot as plt

matplotlib.use('Agg')

def generate_chart(summary):
    """
    Generates a bar chart of Equipment Type Distribution and returns it as an image buffer.
    """
    buffer = io.BytesIO()
    data = summary.get('type_distribution', {})
    types = list(data.keys())
    counts = list(data.values())
    plt.figure(figsize=(6, 4))
    bars = plt.bar(types, counts, color='#4F81BD')
    plt.title('Equipment Type Distribution', fontsize=12, fontweight='bold')
    plt.xlabel('Equipment Type', fontsize=10)
    plt.ylabel('Count', fontsize=10)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                 f'{int(height)}',
                 ha='center', va='bottom')

    plt.tight_layout()
    plt.savefig(buffer, format='png', dpi=100)
    plt.close()
    
    buffer.seek(0)
    return buffer

def draw_header(c, width, height, dataset_id, date):
    c.setFillColor(colors.HexColor("#2C3E50"))
    c.rect(0, height - 80, width, 80, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(30, height - 50, "Analytical Data Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(30, height - 70, f"Dataset ID: #{dataset_id}  |  Generated: {date.strftime('%Y-%m-%d %H:%M')}")

def generate_pdf_report(dataset_instance):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    summary = dataset_instance.summary
    draw_header(c, width, height, dataset_instance.id, dataset_instance.uploaded_at)

    y_position = height - 120

    if summary:
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(30, y_position, "1. Executive Summary")
        y_position -= 30
        metrics = [
            ("Total Records", str(summary.get('total_count', 0))),
            ("Avg Flowrate", f"{summary['averages'].get('Flowrate', 0)}"),
            ("Avg Pressure", f"{summary['averages'].get('Pressure', 0)}")
        ]
        
        x_offset = 30
        for title, value in metrics:
            c.setFillColor(colors.HexColor("#ECF0F1"))
            c.roundRect(x_offset, y_position - 40, 150, 50, 6, fill=1, stroke=0)
            c.setFillColor(colors.HexColor("#7F8C8D"))
            c.setFont("Helvetica", 10)
            c.drawString(x_offset + 10, y_position - 10, title)
            
            c.setFillColor(colors.HexColor("#2C3E50"))
            c.setFont("Helvetica-Bold", 18)
            c.drawString(x_offset + 10, y_position - 30, value)
            
            x_offset += 170
        
        y_position -= 80
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(30, y_position, "2. Parameter Statistics")
        y_position -= 20
        avgs = summary.get('averages', {})
        table_data = [['Parameter', 'Average Value', 'Unit (Est.)']]
        table_data.append(['Flowrate', f"{avgs.get('Flowrate', 0)}", 'm³/h'])
        table_data.append(['Pressure', f"{avgs.get('Pressure', 0)}", 'bar'])
        table_data.append(['Temperature', f"{avgs.get('Temperature', 0)}", '°C'])
        t = Table(table_data, colWidths=[200, 150, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#34495E")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#ECF0F1")),
            ('GRID', (0, 0), (-1, -1), 1, colors.white)
        ]))
        
        t.wrapOn(c, width, height)
        t.drawOn(c, 30, y_position - 80)
        y_position -= 130
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(30, y_position, "3. Equipment Distribution Analysis")
        y_position -= 15
        try:
            chart_buffer = generate_chart(summary)
            from reportlab.lib.utils import ImageReader
            img = ImageReader(chart_buffer)
            c.drawImage(img, 30, y_position - 300, width=500, height=300)
            y_position -= 320
        except Exception as e:
            c.drawString(30, y_position - 30, f"Could not generate chart: {e}")

        dist = summary.get('type_distribution', {})
        if dist:
            most_common = max(dist, key=dist.get)
            count = dist[most_common]
            total = summary.get('total_count', 1)
            percentage = (count / total) * 100
            
            c.setFont("Helvetica-Oblique", 11)
            c.setFillColor(colors.HexColor("#2C3E50"))
            insight_text = (f"Insight: The data is dominated by '{most_common}' units, which make up "
                            f"{percentage:.1f}% of the total equipment inventory.")
            c.drawString(30, y_position, insight_text)

    else:
        c.drawString(30, y_position, "No summary data available to analyze.")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
