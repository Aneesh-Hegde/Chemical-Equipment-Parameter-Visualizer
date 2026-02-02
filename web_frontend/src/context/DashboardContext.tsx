import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EquipmentData, UploadHistory, DashboardStats, User } from '@/types/equipment';

interface DashboardContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentData: EquipmentData[];
  setCurrentData: (data: EquipmentData[]) => void;
  uploadHistory: UploadHistory[];
  setUploadHistory: (history: UploadHistory[]) => void;
  addToHistory: (history: UploadHistory) => void;
  removeFromHistory: (historyId: string) => void;
  loadFromHistory: (historyId: string) => void;
  stats: DashboardStats;
  setStats: (stats: DashboardStats) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentData, setCurrentDataState] = useState<EquipmentData[]>([]);
  const [uploadHistory, setUploadHistoryState] = useState<UploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStatsState] = useState<DashboardStats>({
    total_count: 0,
    averages: {
      Flowrate: 0,
      Pressure: 0,
      Temperature: 0,
    },
    type_distribution: {},
  });

  const setCurrentData = useCallback((data: EquipmentData[]) => {
    setCurrentDataState(data);
  }, []);

  const setStats = useCallback((newStats: DashboardStats) => {
    setStatsState(newStats);
  }, []);

  const setUploadHistory = useCallback((history: UploadHistory[]) => {
    setUploadHistoryState(history);
  }, []);

  const addToHistory = useCallback((history: UploadHistory) => {
    setUploadHistoryState(prev => {
      const newHistory = [history, ...prev].slice(0, 5);
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((historyId: string) => {
    setUploadHistoryState(prev => prev.filter(h => h.id !== historyId));
  }, []);

  const loadFromHistory = useCallback((historyId: string) => {
    const historyItem = uploadHistory.find(h => h.id === historyId);
    if (historyItem) {
      setCurrentDataState(historyItem.data);
      if (historyItem.summary) {
        setStatsState(historyItem.summary);
      }
    }
  }, [uploadHistory]);

  return (
    <DashboardContext.Provider
      value={{
        user,
        setUser,
        currentData,
        setCurrentData,
        uploadHistory,
        setUploadHistory,
        addToHistory,
        removeFromHistory,
        loadFromHistory,
        stats,
        setStats,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
