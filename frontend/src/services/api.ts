import {
  HealthResponse,
  ModelInfo,
  PredictionResponse,
  ReportResponse,
  StatsResponse,
  DatasetCatalogResponse,
} from '../types';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If body is not JSON
        }
        throw new Error(errorMessage);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error(
          `Unable to connect to SONARX backend at ${this.baseUrl}. Please verify the FastAPI server is running.`
        );
      }
      throw err;
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>('/api/model');
  }

  async getDatasets(): Promise<DatasetCatalogResponse> {
    return this.request<DatasetCatalogResponse>('/api/datasets');
  }

  async predict(
    file: File,
    confidence?: number,
    latitude?: number,
    longitude?: number,
    pipeline: string = 'debris'
  ): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (confidence !== undefined && confidence !== null) {
      formData.append('confidence', confidence.toString());
    }
    if (latitude !== undefined && latitude !== null) {
      formData.append('latitude', latitude.toString());
    }
    if (longitude !== undefined && longitude !== null) {
      formData.append('longitude', longitude.toString());
    }
    formData.append('pipeline', pipeline);

    const response = await fetch(`${this.baseUrl}/api/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let msg = `Prediction failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          msg = errorData.detail;
        }
      } catch {
        // Fallback
      }
      throw new Error(msg);
    }

    return (await response.json()) as PredictionResponse;
  }

  async listScans(limit = 50, offset = 0): Promise<PredictionResponse[]> {
    return this.request<PredictionResponse[]>(
      `/api/scans?limit=${limit}&offset=${offset}`
    );
  }

  async getScan(scanId: string): Promise<PredictionResponse> {
    return this.request<PredictionResponse>(`/api/scans/${scanId}`);
  }

  async deleteScan(scanId: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(
      `/api/scans/${scanId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/api/stats');
  }

  async getReport(scanId: string): Promise<ReportResponse> {
    return this.request<ReportResponse>(`/api/scans/${scanId}/report`);
  }
}

export const api = new ApiClient(API_BASE_URL);
