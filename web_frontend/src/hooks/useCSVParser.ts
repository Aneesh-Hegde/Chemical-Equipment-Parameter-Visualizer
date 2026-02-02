import { useCallback } from 'react';
import Papa from 'papaparse';
import { EquipmentData } from '@/types/equipment';

export const useCSVParser = () => {
  const parseCSV = useCallback((file: File): Promise<EquipmentData[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data: EquipmentData[] = results.data.map((row: any, index: number) => ({
              id: `eq-${Date.now()}-${index}`,
              equipmentName: row['Equipment Name'] || row['equipmentName'] || row['name'] || `Equipment ${index + 1}`,
              equipmentType: row['Equipment Type'] || row['equipmentType'] || row['type'] || 'Unknown',
              flowrate: parseFloat(row['Flowrate'] || row['flowrate'] || row['flow_rate']) || 0,
              pressure: parseFloat(row['Pressure'] || row['pressure']) || 0,
              temperature: parseFloat(row['Temperature'] || row['temperature'] || row['temp']) || 0,
              status: (['Active', 'Inactive', 'Maintenance'].includes(row['Status'] || row['status']) 
                ? row['Status'] || row['status'] 
                : 'Active') as 'Active' | 'Inactive' | 'Maintenance',
              lastUpdated: row['Last Updated'] || row['lastUpdated'] || new Date().toISOString(),
            }));
            resolve(data);
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

  const generateSampleData = useCallback((): EquipmentData[] => {
    const types = ['Pump', 'Reactor', 'Heat Exchanger', 'Compressor', 'Tank', 'Valve'];
    const statuses: ('Active' | 'Inactive' | 'Maintenance')[] = ['Active', 'Inactive', 'Maintenance'];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `eq-sample-${i}`,
      equipmentName: `${types[i % types.length]}-${String(i + 1).padStart(3, '0')}`,
      equipmentType: types[i % types.length],
      flowrate: Math.round((Math.random() * 500 + 100) * 100) / 100,
      pressure: Math.round((Math.random() * 150 + 50) * 100) / 100,
      temperature: Math.round((Math.random() * 200 + 50) * 100) / 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }, []);

  return { parseCSV, generateSampleData };
};
