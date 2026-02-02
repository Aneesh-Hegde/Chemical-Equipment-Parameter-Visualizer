import { useCallback } from 'react';
import Papa from 'papaparse';
import { EquipmentData, DashboardStats } from '@/types/equipment';

interface ParseResult {
  data: EquipmentData[];
  stats: DashboardStats;
}

const calculateStats = (data: EquipmentData[]): DashboardStats => {
  if (data.length === 0) {
    return {
      total_count: 0,
      averages: { Flowrate: 0, Pressure: 0, Temperature: 0 },
      type_distribution: {},
    };
  }

  const total_count = data.length;

  // Calculate averages
  const avgFlowrate = data.reduce((sum, item) => sum + item.flowrate, 0) / total_count;
  const avgPressure = data.reduce((sum, item) => sum + item.pressure, 0) / total_count;
  const avgTemperature = data.reduce((sum, item) => sum + item.temperature, 0) / total_count;

  // Calculate type distribution
  const type_distribution: Record<string, number> = {};
  data.forEach(item => {
    const type = item.equipmentType;
    type_distribution[type] = (type_distribution[type] || 0) + 1;
  });

  return {
    total_count,
    averages: {
      Flowrate: Math.round(avgFlowrate * 100) / 100,
      Pressure: Math.round(avgPressure * 100) / 100,
      Temperature: Math.round(avgTemperature * 100) / 100,
    },
    type_distribution,
  };
};

export const useCSVParser = () => {
  const parseCSV = useCallback((file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data: EquipmentData[] = results.data.map((row: any, index: number) => ({
              id: `eq-${Date.now()}-${index}`,
              equipmentName: row['Equipment Name'] || row['equipmentName'] || row['name'] || `Equipment ${index + 1}`,
              equipmentType: row['Type'] || row['Equipment Type'] || row['equipmentType'] || row['type'] || 'Unknown',
              flowrate: parseFloat(row['Flowrate'] || row['flowrate'] || row['flow_rate']) || 0,
              pressure: parseFloat(row['Pressure'] || row['pressure']) || 0,
              temperature: parseFloat(row['Temperature'] || row['temperature'] || row['temp']) || 0,
              status: (['Active', 'Inactive', 'Maintenance'].includes(row['Status'] || row['status'])
                ? row['Status'] || row['status']
                : 'Active') as 'Active' | 'Inactive' | 'Maintenance',
              lastUpdated: row['Last Updated'] || row['lastUpdated'] || new Date().toISOString(),
            }));

            const stats = calculateStats(data);
            resolve({ data, stats });
          } catch (error) {
            reject(new Error('Failed to parse CSV data'));
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }, []);

  const generateSampleData = useCallback((): ParseResult => {
    const types = ['Pump', 'Valve', 'Compressor', 'HeatExchanger', 'Reactor', 'Condenser'];
    const statuses: ('Active' | 'Inactive' | 'Maintenance')[] = ['Active', 'Inactive', 'Maintenance'];

    const data = Array.from({ length: 15 }, (_, i) => ({
      id: `eq-sample-${i}`,
      equipmentName: `${types[i % types.length]}-${Math.floor(i / types.length) + 1}`,
      equipmentType: types[i % types.length],
      flowrate: Math.round((Math.random() * 100 + 50) * 100) / 100,
      pressure: Math.round((Math.random() * 8 + 3) * 100) / 100,
      temperature: Math.round((Math.random() * 50 + 90) * 100) / 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const stats = calculateStats(data);
    return { data, stats };
  }, []);

  return { parseCSV, generateSampleData };
};
