import { apiClient } from '../../global/api/client';
import type { HealthResponse } from '../types/health.model';

/**
 * Health API - Raw HTTP calls
 */

export const healthApi = {
  /**
   * Check system health status
   */
  check: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/api/health');
    return response.data;
  },
};
