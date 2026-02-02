import { motion } from 'framer-motion';
import { History, FileSpreadsheet, Clock, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { formatDistanceToNow } from 'date-fns';

export const HistorySidebar = () => {
  const { uploadHistory, loadFromHistory } = useDashboard();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-72 bg-sidebar border-l border-sidebar-border h-full overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sidebar-primary" />
          <h2 className="font-semibold text-sidebar-foreground">Upload History</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Last 5 uploads</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {uploadHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
            >
              <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <p className="text-sm text-muted-foreground">No uploads yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a CSV file to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {uploadHistory.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => loadFromHistory(item.id)}
                className="w-full history-item p-3 rounded-lg bg-card hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.fileName}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.uploadDate), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.recordCount} records
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
};
