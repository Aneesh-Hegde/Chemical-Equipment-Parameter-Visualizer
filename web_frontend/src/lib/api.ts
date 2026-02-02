import { DashboardStats, EquipmentData } from '@/types/equipment';

// API Base URL - adjust this for your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types matching backend response
export interface DatasetResponse {
    id: number;
    file: string;
    uploaded_at: string;
    summary: DashboardStats | null;
}

export interface ApiError {
    message: string;
    status: number;
}

// Helper to get auth credentials
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('authUsername');
    const password = localStorage.getItem('authPassword');

    console.log('Auth Debug:', { token, username, password: password ? '***' : null });

    // Try token auth first, then basic auth
    if (token) {
        return { 'Authorization': `Token ${token}` };
    } else if (username && password) {
        const credentials = btoa(`${username}:${password}`);
        console.log('Using Basic Auth header:', `Basic ${credentials}`);
        return { 'Authorization': `Basic ${credentials}` };
    }
    console.warn('No auth credentials found!');
    return {};
};

/**
 * Upload a CSV file to the backend
 * POST /datasets/
 */
export const uploadDataset = async (file: File): Promise<DatasetResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/datasets/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
            message: error.detail || error.message || 'Failed to upload dataset',
            status: response.status
        } as ApiError;
    }

    return response.json();
};

/**
 * Get list of all uploaded datasets (history)
 * GET /datasets/
 */
export const listDatasets = async (): Promise<DatasetResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/datasets/`, {
        method: 'GET',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
            message: error.detail || error.message || 'Failed to fetch datasets',
            status: response.status
        } as ApiError;
    }

    return response.json();
};

/**
 * Get details of a specific dataset
 * GET /datasets/:id/
 */
export const getDataset = async (id: number): Promise<DatasetResponse> => {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}/`, {
        method: 'GET',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
            message: error.detail || error.message || 'Failed to fetch dataset',
            status: response.status
        } as ApiError;
    }

    return response.json();
};

/**
 * Download PDF report for a dataset
 * GET /datasets/:id/pdf/
 */
export const downloadDatasetPdf = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}/pdf/`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
            message: error.detail || error.message || 'Failed to download PDF',
            status: response.status
        } as ApiError;
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Delete a dataset
 * DELETE /datasets/:id/
 */
export const deleteDataset = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/datasets/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok && response.status !== 204) {
        const error = await response.json().catch(() => ({}));
        throw {
            message: error.detail || error.message || 'Failed to delete dataset',
            status: response.status
        } as ApiError;
    }
};

/**
 * Parse CSV file content from URL
 * Helper to fetch and parse CSV file from backend storage
 */
export const fetchAndParseCSV = async (fileUrl: string): Promise<EquipmentData[]> => {
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;

    const response = await fetch(fullUrl, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw { message: 'Failed to fetch CSV file', status: response.status } as ApiError;
    }

    const text = await response.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const data: EquipmentData[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
            row[header] = values[i] || '';
        });

        return {
            id: `eq-${Date.now()}-${index}`,
            equipmentName: row['Equipment Name'] || `Equipment ${index + 1}`,
            equipmentType: row['Type'] || 'Unknown',
            flowrate: parseFloat(row['Flowrate']) || 0,
            pressure: parseFloat(row['Pressure']) || 0,
            temperature: parseFloat(row['Temperature']) || 0,
            status: 'Active' as const,
            lastUpdated: new Date().toISOString(),
        };
    });

    return data;
};
