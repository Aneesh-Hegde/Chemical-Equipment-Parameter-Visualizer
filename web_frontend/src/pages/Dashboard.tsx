import { motion } from 'framer-motion';
import { Header } from '@/components/dashboard/Header';
import { UploadZone } from '@/components/dashboard/UploadZone';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { ChartsContainer } from '@/components/dashboard/ChartsContainer';
import { DataTable } from '@/components/dashboard/DataTable';
import { HistorySidebar } from '@/components/dashboard/HistorySidebar';
import { useDashboard } from '@/context/DashboardContext';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const { isLoading, currentData } = useDashboard();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onLogout={onLogout} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div id="dashboard-content" className="p-6 space-y-6">
            {/* Upload Zone */}
            <UploadZone />

            {/* Loading Overlay */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="text-muted-foreground">Processing data...</span>
                </div>
              </motion.div>
            )}

            {/* Content - Only show if we have data */}
            {!isLoading && currentData.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <StatsGrid />

                {/* Charts */}
                <ChartsContainer />

                {/* Data Table */}
                <DataTable />
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && currentData.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
                >
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Data Loaded
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Upload a CSV file containing your chemical equipment parameters to start analyzing. 
                  You can also load sample data to explore the dashboard features.
                </p>
              </motion.div>
            )}
          </div>
        </main>

        {/* History Sidebar */}
        <HistorySidebar />
      </div>
    </div>
  );
};

export default Dashboard;
