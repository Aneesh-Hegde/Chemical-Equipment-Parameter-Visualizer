export interface EquipmentData {
  id: string;
  equipmentName: string;
  equipmentType: string;
  flowrate: number;
  pressure: number;
  temperature: number;
  status: 'Active' | 'Inactive' | 'Maintenance';
  lastUpdated: string;
}

export interface UploadHistory {
  id: string;
  datasetId?: number; // Backend dataset ID for API operations
  fileName: string;
  uploadDate: string;
  recordCount: number;
  data: EquipmentData[];
  summary?: DashboardStats;
}

export interface DashboardStats {
  total_count: number;
  averages: {
    Flowrate: number;
    Pressure: number;
    Temperature: number;
  };
  type_distribution: Record<string, number>;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
