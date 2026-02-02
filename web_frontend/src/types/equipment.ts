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
  fileName: string;
  uploadDate: string;
  recordCount: number;
  data: EquipmentData[];
}

export interface DashboardStats {
  totalEquipment: number;
  avgFlowrate: number;
  avgPressure: number;
  avgTemperature: number;
  activeCount: number;
  inactiveCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
