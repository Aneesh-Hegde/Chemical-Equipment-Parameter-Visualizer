import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, FileSpreadsheet, Clock, ChevronRight, Trash2, FileDown, Loader2 } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { formatDistanceToNow } from 'date-fns';
import { listDatasets, deleteDataset, downloadDatasetPdf, fetchAndParseCSV } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export const HistorySidebar = () => {
  const { uploadHistory, setUploadHistory, loadFromHistory, removeFromHistory, setCurrentData, setStats, setIsLoading } = useDashboard();
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load history from API on mount
  useEffect(() => {
    const loadHistoryFromApi = async () => {
      setIsLoadingHistory(true);
      try {
        const datasets = await listDatasets();
        const history = await Promise.all(
          datasets.map(async (dataset) => {
            try {
              const data = await fetchAndParseCSV(dataset.file);
              return {
                id: `history-${dataset.id}`,
                datasetId: dataset.id,
                fileName: dataset.file.split('/').pop() || 'Unknown',
                uploadDate: dataset.uploaded_at,
                recordCount: dataset.summary?.total_count || data.length,
                data,
                summary: dataset.summary || undefined,
              };
            } catch {
              return {
                id: `history-${dataset.id}`,
                datasetId: dataset.id,
                fileName: dataset.file.split('/').pop() || 'Unknown',
                uploadDate: dataset.uploaded_at,
                recordCount: dataset.summary?.total_count || 0,
                data: [],
                summary: dataset.summary || undefined,
              };
            }
          })
        );
        setUploadHistory(history);
      } catch (error: any) {
        console.error('Failed to load history:', error);
        // Don't show error toast if it's just an auth issue - user hasn't logged in yet
        if (error.status !== 401 && error.status !== 403) {
          toast({
            title: 'Failed to load history',
            description: error.message || 'Could not fetch upload history',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistoryFromApi();
  }, []);

  const handleDelete = async (e: React.MouseEvent, historyId: string, datasetId?: number) => {
    e.stopPropagation();
    if (!datasetId) {
      removeFromHistory(historyId);
      return;
    }

    setDeletingId(historyId);
    try {
      await deleteDataset(datasetId);
      removeFromHistory(historyId);
      toast({
        title: 'Dataset deleted',
        description: 'The dataset has been removed successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Could not delete the dataset',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async (e: React.MouseEvent, datasetId?: number) => {
    e.stopPropagation();
    if (!datasetId) {
      toast({
        title: 'PDF not available',
        description: 'This dataset was not uploaded to the server.',
        variant: 'destructive',
      });
      return;
    }

    setDownloadingId(`history-${datasetId}`);
    try {
      await downloadDatasetPdf(datasetId);
      toast({
        title: 'PDF Downloaded',
        description: 'The report has been downloaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message || 'Could not download the PDF report',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLoadItem = async (item: typeof uploadHistory[0]) => {
    setIsLoading(true);
    try {
      setCurrentData(item.data);
      if (item.summary) {
        setStats(item.summary);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading history...</p>
          </div>
        ) : uploadHistory.length === 0 ? (
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
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="history-item p-3 rounded-lg bg-card hover:bg-sidebar-accent border border-transparent hover:border-sidebar-border transition-all duration-200 group"
              >
                <button
                  onClick={() => handleLoadItem(item)}
                  className="w-full text-left"
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
                </button>

                {/* Action buttons */}
                <div className="flex gap-1 mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={(e) => handleDownloadPdf(e, item.datasetId)}
                    disabled={downloadingId === item.id || !item.datasetId}
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <FileDown className="w-3 h-3 mr-1" />
                    )}
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(e, item.id, item.datasetId)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
};
