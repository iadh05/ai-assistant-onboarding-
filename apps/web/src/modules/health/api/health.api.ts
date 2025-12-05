import { apiClient } from '../../../core';
import type { HealthResponse } from '../types/health.model';

export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/api/health');
    return response.data;
  },
};
