import sys
import pandas as pd
from PyQt5.QtWidgets import (QApplication, QMainWindow, QPushButton, QVBoxLayout, 
                             QHBoxLayout, QWidget, QFileDialog, QLabel, QTableWidget, 
                             QTableWidgetItem, QHeaderView)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

class MplCanvas(FigureCanvas):
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        # Setting up the Matplotlib figure
        self.fig = Figure(figsize=(width, height), dpi=dpi)
        self.axes = self.fig.add_subplot(111)
        super(MplCanvas, self).__init__(self.fig)

class ChemicalApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer")
        self.setMinimumSize(1000, 700)

        # Main Layout (Horizontal)
        main_layout = QHBoxLayout()
        
        # --- LEFT SIDEBAR (Controls) ---
        sidebar = QVBoxLayout()
        self.status_label = QLabel("Ready to Upload")
        self.status_label.setStyleSheet("font-weight: bold; color: #555;")
        
        self.upload_btn = QPushButton("📁 Upload Equipment CSV")
        self.upload_btn.setFixedHeight(40)
        self.upload_btn.clicked.connect(self.handle_upload)
        
        sidebar.addWidget(QLabel("<h3>Controls</h3>"))
        sidebar.addWidget(self.upload_btn)
        sidebar.addWidget(self.status_label)
        sidebar.addStretch() # Push everything up

        # --- RIGHT CONTENT AREA ---
        content_layout = QVBoxLayout()
        
        # 1. Table for Data Preview
        self.table = QTableWidget()
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        
        # 2. Matplotlib Chart
        self.canvas = MplCanvas(self, width=6, height=4)
        
        content_layout.addWidget(QLabel("<b>Equipment List:</b>"))
        content_layout.addWidget(self.table, 2) # Ratio 2
        content_layout.addWidget(QLabel("<b>Analytics: Avg Pressure by Type</b>"))
        content_layout.addWidget(self.canvas, 3) # Ratio 3

        # Assemble
        main_layout.addLayout(sidebar, 1)
        main_layout.addLayout(content_layout, 4)

        container = QWidget()
        container.setLayout(main_layout)
        self.setCentralWidget(container)

    def handle_upload(self):
        # Open file dialog
        path, _ = QFileDialog.getOpenFileName(self, "Open CSV", "", "CSV Files (*.csv)")
        
        if path:
            try:
                # Load data with Pandas
                df = pd.read_csv(path)
                self.populate_table(df)
                self.update_chart(df)
                self.status_label.setText(f"Loaded: {len(df)} items")
            except Exception as e:
                self.status_label.setText(f"Error: {str(e)}")

    def populate_table(self, df):
        self.table.setRowCount(df.shape[0])
        self.table.setColumnCount(df.shape[1])
        self.table.setHorizontalHeaderLabels(df.columns)
        
        for i in range(df.shape[0]):
            for j in range(df.shape[1]):
                self.table.setItem(i, j, QTableWidgetItem(str(df.iloc[i, j])))

    def update_chart(self, df):
        # Clear the old chart
        self.canvas.axes.cla()
        
        # Group by Equipment Type and get average pressure
        if 'Type' in df.columns and 'Pressure' in df.columns:
            avg_pressure = df.groupby('Type')['Pressure'].mean()
            
            # Plotting
            avg_pressure.plot(kind='bar', ax=self.canvas.axes, color='#2c3e50')
            self.canvas.axes.set_ylabel("Pressure (Bar)")
            self.canvas.axes.set_title("Mean Pressure per Equipment Category")
            self.canvas.axes.tick_params(axis='x', rotation=45)
            
            # Tight layout to prevent label cutoff
            self.canvas.fig.tight_layout()
            self.canvas.draw()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    # Applying a simple fusion style for a cleaner look on Linux
    app.setStyle("Fusion")
    window = ChemicalApp()
    window.show()
    sys.exit(app.exec_())