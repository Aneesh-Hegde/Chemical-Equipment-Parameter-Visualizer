import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EquipmentData, UploadHistory, DashboardStats, User } from '@/types/equipment';

interface DashboardContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentData: EquipmentData[];
  setCurrentData: (data: EquipmentData[]) => void;
  uploadHistory: UploadHistory[];
  addToHistory: (history: UploadHistory) => void;
  loadFromHistory: (historyId: string) => void;
  stats: DashboardStats;
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

const calculateStats = (data: EquipmentData[]): DashboardStats => {
  if (data.length === 0) {
    return {
      totalEquipment: 0,
      avgFlowrate: 0,
      avgPressure: 0,
      avgTemperature: 0,
      activeCount: 0,
      inactiveCount: 0,
    };
  }

  const totalEquipment = data.length;
  const avgFlowrate = data.reduce((sum, item) => sum + item.flowrate, 0) / totalEquipment;
  const avgPressure = data.reduce((sum, item) => sum + item.pressure, 0) / totalEquipment;
  const avgTemperature = data.reduce((sum, item) => sum + item.temperature, 0) / totalEquipment;
  const activeCount = data.filter(item => item.status === 'Active').length;
  const inactiveCount = data.filter(item => item.status !== 'Active').length;

  return {
    totalEquipment,
    avgFlowrate: Math.round(avgFlowrate * 100) / 100,
    avgPressure: Math.round(avgPressure * 100) / 100,
    avgTemperature: Math.round(avgTemperature * 100) / 100,
    activeCount,
    inactiveCount,
  };
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentData, setCurrentDataState] = useState<EquipmentData[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stats = calculateStats(currentData);

  const setCurrentData = useCallback((data: EquipmentData[]) => {
    setCurrentDataState(data);
  }, []);

  const addToHistory = useCallback((history: UploadHistory) => {
    setUploadHistory(prev => {
      const newHistory = [history, ...prev].slice(0, 5);
      return newHistory;
    });
  }, []);

  const loadFromHistory = useCallback((historyId: string) => {
    const historyItem = uploadHistory.find(h => h.id === historyId);
    if (historyItem) {
      setCurrentDataState(historyItem.data);
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
        addToHistory,
        loadFromHistory,
        stats,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
