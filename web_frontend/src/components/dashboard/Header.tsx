import { motion } from 'framer-motion';
import { User, LogOut, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface HeaderProps {
  onLogout: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  const { user } = useDashboard();

  const handleLogout = () => {
    // Clear stored auth credentials
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authPassword');
    onLogout();
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
        {/* Lottie Animation */}
        <div className="w-12 h-12 flex items-center justify-center">
          <DotLottieReact
            src="https://lottie.host/3bb4d5e4-a9f2-46c1-9bb2-8b90a936fae2/gliwQPO3vJ.lottie"
            loop
            autoplay
            style={{ width: '48px', height: '48px' }}
          />
        </div>

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
