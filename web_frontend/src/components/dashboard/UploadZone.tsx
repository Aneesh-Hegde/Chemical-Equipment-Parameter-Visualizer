import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useCSVParser } from '@/hooks/useCSVParser';
import { Button } from '@/components/ui/button';

export const UploadZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const { setCurrentData, setStats, addToHistory, setIsLoading } = useDashboard();
  const { parseCSV, generateSampleData } = useCSVParser();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);

    try {
      const { data, stats } = await parseCSV(file);
      setCurrentData(data);
      setStats(stats);
      addToHistory({
        id: `history-${Date.now()}`,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        recordCount: data.length,
        data,
      });
      setUploadState('success');
      setTimeout(() => setUploadState('idle'), 3000);
    } catch (error) {
      setUploadState('error');
      setTimeout(() => setUploadState('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      processFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleLoadSample = () => {
    setIsLoading(true);
    setTimeout(() => {
      const { data, stats } = generateSampleData();
      setCurrentData(data);
      setStats(stats);
      addToHistory({
        id: `history-${Date.now()}`,
        fileName: 'sample-equipment-data.csv',
        uploadDate: new Date().toISOString(),
        recordCount: data.length,
        data,
      });
      setUploadState('success');
      setFileName('sample-equipment-data.csv');
      setTimeout(() => setUploadState('idle'), 3000);
      setIsLoading(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative"
    >
      {/* Breathing ring animation */}
      <div className="absolute inset-0 rounded-xl bg-primary/5 breathing-ring pointer-events-none" />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative z-10 p-8 rounded-xl border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]'
          }
        `}
      >
        <div className="flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {uploadState === 'success' ? (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-8 h-8 text-success" />
              </motion.div>
            ) : uploadState === 'error' ? (
              <motion.div
                key="error"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
              >
                <AlertCircle className="w-8 h-8 text-destructive" />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  opacity: 1,
                  y: isDragging ? -5 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                {isDragging ? (
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                ) : (
                  <Upload className="w-8 h-8 text-primary" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {uploadState === 'success' ? (
              <motion.div
                key="success-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-semibold text-success mb-1">Upload Successful!</h3>
                <p className="text-sm text-muted-foreground">{fileName} has been processed</p>
              </motion.div>
            ) : uploadState === 'error' ? (
              <motion.div
                key="error-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-semibold text-destructive mb-1">Upload Failed</h3>
                <p className="text-sm text-muted-foreground">Please check your CSV file format</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {isDragging ? 'Drop your file here' : 'Upload Equipment Data'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop a CSV file, or click to browse
                </p>

                <div className="flex gap-3 justify-center">
                  <label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="sr-only"
                    />
                    <Button
                      variant="outline"
                      className="btn-interactive cursor-pointer"
                      asChild
                    >
                      <span>Browse Files</span>
                    </Button>
                  </label>

                  <Button
                    variant="secondary"
                    onClick={handleLoadSample}
                    className="btn-interactive"
                  >
                    Load Sample Data
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
