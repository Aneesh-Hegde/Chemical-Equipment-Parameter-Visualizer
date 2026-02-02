import { motion } from 'framer-motion';
import { FileDown, User, LogOut, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

interface HeaderProps {
  onLogout: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  const { user, currentData } = useDashboard();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogout = () => {
    // Clear stored auth credentials
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authPassword');
    onLogout();
  };

  const handleGeneratePDF = async () => {
    if (currentData.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) return;

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`equipment-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-16 bg-card border-b border-border px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Beaker className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Chemical Equipment Visualizer</h1>
          <p className="text-xs text-muted-foreground">Parameter Analysis Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleGeneratePDF}
            disabled={currentData.length === 0 || isGenerating}
            className="btn-interactive glow-effect bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <FileDown className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate PDF Report'}
          </Button>
        </motion.div>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{user?.name || 'User'}</span>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
