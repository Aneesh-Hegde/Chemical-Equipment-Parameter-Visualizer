import sys
import os
import requests
import json
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QPushButton, QVBoxLayout, QHBoxLayout, 
    QWidget, QFileDialog, QLabel, QTableWidget, QTableWidgetItem, 
    QHeaderView, QTabWidget, QMessageBox, QLineEdit, QFormLayout, 
    QDialog, QDialogButtonBox, QProgressBar, QFrame, QSplitter
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QSize, QSettings
from PyQt5.QtGui import QFont, QIcon, QColor, QPalette
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.patches as patches

DARK_STYLESHEET = """
QMainWindow {
    background-color: #2b2b2b;
}
QWidget {
    background-color: #2b2b2b;
    color: #e0e0e0;
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    font-size: 14px;
}
QTabWidget::pane {
    border: 1px solid #444;
    background: #2b2b2b;
}
QTabBar::tab {
    background: #3c3f41;
    color: #bbb;
    padding: 10px 20px;
    border: 1px solid #444;
    border-bottom: none;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
QTabBar::tab:selected {
    background: #4e5254;
    color: #fff;
    font-weight: bold;
}
QPushButton {
    background-color: #0d6efd;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: bold;
}
QPushButton:hover {
    background-color: #0b5ed7;
}
QPushButton:disabled {
    background-color: #555;
    color: #888;
}
QLineEdit {
    padding: 6px;
    background-color: #3c3f41;
    border: 1px solid #555;
    color: #fff;
    border-radius: 3px;
}
QTableWidget {
    background-color: #3c3f41;
    gridline-color: #555;
    color: #fff;
    selection-background-color: #0d6efd;
}
QHeaderView::section {
    background-color: #4e5254;
    padding: 5px;
    border: 1px solid #555;
    color: #fff;
    font-weight: bold;
}
QLabel#Header {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10px;
}
"""

class ApiWorker(QThread):
    finished = pyqtSignal(object)

    def __init__(self, func, *args, **kwargs):
        super().__init__()
        self.func = func
        self.args = args
        self.kwargs = kwargs

    def run(self):
        try:
            result = self.func(*self.args, **self.kwargs)
            self.finished.emit((True, result))
        except Exception as e:
            self.finished.emit((False, str(e)))

class MplCanvas(FigureCanvas):
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        self.fig = Figure(figsize=(width, height), dpi=dpi, facecolor='#2b2b2b')
        self.axes = self.fig.add_subplot(111)
        self.axes.set_facecolor('#2b2b2b')
        
        self.axes.spines['bottom'].set_color('#ffffff')
        self.axes.spines['top'].set_color('#ffffff')
        self.axes.spines['left'].set_color('#ffffff')
        self.axes.spines['right'].set_color('#ffffff')
        self.axes.tick_params(axis='x', colors='#ffffff')
        self.axes.tick_params(axis='y', colors='#ffffff')
        self.axes.yaxis.label.set_color('#ffffff')
        self.axes.xaxis.label.set_color('#ffffff')
        self.axes.title.set_color('#ffffff')
        
        super(MplCanvas, self).__init__(self.fig)

class ChemicalApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer")
        self.setMinimumSize(1200, 800)
        
        self.api_url = "http://127.0.0.1:8000"
        self.current_dataset = None
        
        self.setup_ui()
        self.refresh_data(load_latest=True)

    def setup_ui(self):
        self.setStyleSheet(DARK_STYLESHEET)
        
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QVBoxLayout(central)
        
        header = QHBoxLayout()
        title = QLabel("🧪 Chemical Equipment Visualizer")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #ffffff;")
        header.addWidget(title)
        header.addStretch()
        
        main_layout.addLayout(header)
        
        self.tabs = QTabWidget()
        main_layout.addWidget(self.tabs)
        
        self.dashboard_tab = QWidget()
        self.setup_dashboard()
        self.tabs.addTab(self.dashboard_tab, "📊 Dashboard")
        
        self.history_tab = QWidget()
        self.setup_history()
        self.tabs.addTab(self.history_tab, "🕒 History")
        
        self.status = QLabel("Ready")
        self.status.setStyleSheet("padding: 5px; color: #888;")
        main_layout.addWidget(self.status)

    def setup_dashboard(self):
        layout = QHBoxLayout(self.dashboard_tab)
        
        left_panel = QFrame()
        left_panel.setFrameShape(QFrame.StyledPanel)
        left_panel.setFixedWidth(350)
        left_layout = QVBoxLayout(left_panel)
        left_layout.setSpacing(15)
        
        left_layout.addWidget(QLabel("Actions", objectName="Header"))
        
        self.upload_btn = QPushButton("📁 Upload CSV Dataset")
        self.upload_btn.setMinimumHeight(45)
        self.upload_btn.clicked.connect(self.upload_file)
        left_layout.addWidget(self.upload_btn)
        
        self.refresh_btn = QPushButton("🔄 Refresh Data")
        self.refresh_btn.setMinimumHeight(45)
        self.refresh_btn.setStyleSheet("background-color: #555;")
        self.refresh_btn.clicked.connect(lambda: self.refresh_data(load_latest=False))
        left_layout.addWidget(self.refresh_btn)
        
        self.download_btn = QPushButton("📄 Download PDF Report")
        self.download_btn.setMinimumHeight(45)
        self.download_btn.setStyleSheet("background-color: #198754;") 
        self.download_btn.setEnabled(False)
        self.download_btn.clicked.connect(self.download_pdf)
        left_layout.addWidget(self.download_btn)
        
        left_layout.addSpacing(20)
        left_layout.addWidget(QLabel("Dataset Summary", objectName="Header"))
        
        self.stats_container = QWidget()
        self.stats_container.setStyleSheet("background-color: #333; border-radius: 5px; padding: 10px;")
        stats_layout = QVBoxLayout(self.stats_container)
        
        self.lbl_total = QLabel("Total Records: -")
        self.lbl_flow = QLabel("Avg Flowrate: -")
        self.lbl_press = QLabel("Avg Pressure: -")
        self.lbl_temp = QLabel("Avg Temp: -")
        
        for lbl in [self.lbl_total, self.lbl_flow, self.lbl_press, self.lbl_temp]:
            lbl.setStyleSheet("font-size: 14px; font-weight: 500;")
            stats_layout.addWidget(lbl)
            
        left_layout.addWidget(self.stats_container)
        left_layout.addStretch()
        
        right_panel = QFrame()
        right_layout = QVBoxLayout(right_panel)
        
        right_layout.addWidget(QLabel("Equipment Distribution Analysis", objectName="Header"))
        
        self.chart_canvas = MplCanvas(self, width=5, height=4, dpi=100)
        right_layout.addWidget(self.chart_canvas)
        
        layout.addWidget(left_panel)
        layout.addWidget(right_panel)

    def setup_history(self):
        layout = QVBoxLayout(self.history_tab)
        
        layout.addWidget(QLabel("Last 5 Uploaded Datasets", objectName="Header"))
        
        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["ID", "Filename", "Uploaded At", "Info"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.cellDoubleClicked.connect(self.on_history_item_double_clicked)
        
        layout.addWidget(self.table)
        layout.addWidget(QLabel("Double-click a row to load it into the Dashboard."))

    def set_loading(self, loading=True, message="Processing..."):
        self.upload_btn.setEnabled(not loading)
        self.refresh_btn.setEnabled(not loading)
        self.status.setText(message if loading else "Ready")
        if loading:
            self.setCursor(Qt.WaitCursor)
        else:
            self.setCursor(Qt.ArrowCursor)

    def refresh_data(self, load_latest=False):
        self.set_loading(True, "Fetching datasets...")
        
        def fetch():
            return requests.get(f"{self.api_url}/datasets/").json()
            
        self.worker = ApiWorker(fetch)
        self.worker.finished.connect(lambda result: self.on_refresh_finished(result, load_latest))
        self.worker.start()

    def on_refresh_finished(self, result, load_latest):
        success, data = result
        self.set_loading(False)
        
        if success:
            self.populate_history(data)
            if load_latest and data:
                 self.load_dataset(data[0])
        else:
            QMessageBox.warning(self, "Error", f"Failed to refresh data: {data}")

    def populate_history(self, datasets):
        self.table.setRowCount(0)
        for d in datasets:
            row = self.table.rowCount()
            self.table.insertRow(row)
            
            self.table.setItem(row, 0, QTableWidgetItem(str(d['id'])))
            filename = os.path.basename(d['file'])
            self.table.setItem(row, 1, QTableWidgetItem(filename))
            self.table.setItem(row, 2, QTableWidgetItem(d.get('uploaded_at', '').split('T')[0]))
            
            summary = d.get('summary') or {}
            info = f"Count: {summary.get('total_count', 'N/A')}"
            self.table.setItem(row, 3, QTableWidgetItem(info))
            
            self.table.item(row, 0).setData(Qt.UserRole, d)

    def on_history_item_double_clicked(self, row, col):
        data = self.table.item(row, 0).data(Qt.UserRole)
        if data:
            self.load_dataset(data)
            self.tabs.setCurrentIndex(0)

    def load_dataset(self, data):
        self.current_dataset = data
        summary = data.get('summary')
        
        if not summary:
            self.status.setText(f"Dataset {data['id']} has no summary.")
            return

        self.lbl_total.setText(f"Total Records: {summary.get('total_count', 0)}")
        avgs = summary.get('averages', {})
        self.lbl_flow.setText(f"Avg Flowrate: {avgs.get('Flowrate', 0)}")
        self.lbl_press.setText(f"Avg Pressure: {avgs.get('Pressure', 0)}")
        self.lbl_temp.setText(f"Avg Temp: {avgs.get('Temperature', 0)}")
        
        dist = summary.get('type_distribution', {})
        self.update_chart(dist)
        
        self.download_btn.setEnabled(True)
        self.status.setText(f"Loaded dataset ID: {data['id']}")

    def update_chart(self, distribution):
        self.chart_canvas.axes.cla()
        
        if distribution:
            types = list(distribution.keys())
            counts = list(distribution.values())
            
            bars = self.chart_canvas.axes.bar(types, counts, color='#0d6efd', alpha=0.7)
            self.chart_canvas.axes.set_title("Distribution by Equipment Type", color='white', pad=20)
            self.chart_canvas.axes.set_ylabel("Count", color='white')
            self.chart_canvas.axes.tick_params(axis='x', rotation=45)
            
            for bar in bars:
                height = bar.get_height()
                self.chart_canvas.axes.text(bar.get_x() + bar.get_width()/2., height,
                        f'{int(height)}',
                        ha='center', va='bottom', color='white')
        else:
             self.chart_canvas.axes.text(0.5, 0.5, "No Data Available", 
                                         ha='center', va='center', color='white', transform=self.chart_canvas.axes.transAxes)
        
        self.chart_canvas.draw()

    def upload_file(self):
        path, _ = QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if not path:
            return
            
        self.set_loading(True, "Uploading file...")
        
        def upload():
            with open(path, 'rb') as f:
                return requests.post(
                    f"{self.api_url}/datasets/", 
                    files={'file': f}
                )
        
        self.worker = ApiWorker(upload)
        self.worker.finished.connect(self.on_upload_finished)
        self.worker.start()
        
    def on_upload_finished(self, result):
        success, response = result
        if success:
             if response.status_code == 201:
                 data = response.json()
                 self.refresh_data(load_latest=False)
                 self.load_dataset(data)
                 QMessageBox.information(self, "Success", "File uploaded successfully!")
             else:
                 self.set_loading(False)
                 QMessageBox.critical(self, "Upload Failed", f"Server returned: {response.text}")
        else:
            self.set_loading(False)
            QMessageBox.critical(self, "Error", f"Network error: {response}")

    def download_pdf(self):
        if not self.current_dataset:
            return
            
        d_id = self.current_dataset['id']
        path, _ = QFileDialog.getSaveFileName(self, "Save Report", f"report_{d_id}.pdf", "PDF Files (*.pdf)")
        if not path:
            return
            
        self.set_loading(True, "Generating PDF...")
        
        def download():
            return requests.get(f"{self.api_url}/datasets/{d_id}/pdf/")
            
        self.worker = ApiWorker(download)
        self.worker.finished.connect(lambda res: self.on_download_finished(res, path))
        self.worker.start()

    def on_download_finished(self, result, save_path):
        success, response = result
        self.set_loading(False)
        
        if success and response.status_code == 200:
            try:
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                QMessageBox.information(self, "Success", "PDF Report saved!")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save file: {e}")
        else:
            msg = response.text if success else str(response)
            QMessageBox.critical(self, "Download Failed", msg)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    window = ChemicalApp()
    window.show()
    sys.exit(app.exec_())
    
    
 