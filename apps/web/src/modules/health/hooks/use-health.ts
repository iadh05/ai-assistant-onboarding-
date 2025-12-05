import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/health.api';
import type { HealthResponse } from '../types/health.model';

export const useHealthCheck = (refetchInterval?: number) => {
  return useQuery<HealthResponse, Error>({
    queryKey: ['health'],
    queryFn: () => healthApi.check(),
    refetchInterval: refetchInterval || 5000, // Auto-refresh every 5 seconds by default
  });
};

export const healthHelpers = {
  isAllServicesHealthy: (healthResponse: HealthResponse): boolean => {
    const { services } = healthResponse;
    return (
      services.documents.toLowerCase() === 'healthy' &&
      services.chat.toLowerCase() === 'healthy' &&
      services.system.toLowerCase() === 'healthy'
    );
  },

  getUnhealthyServices: (healthResponse: HealthResponse): string[] => {
    const { services } = healthResponse;
    const unhealthy: string[] = [];

    if (services.documents.toLowerCase() !== 'healthy') {
      unhealthy.push('Document Service');
    }
    if (services.chat.toLowerCase() !== 'healthy') {
      unhealthy.push('Chat Service');
    }
    if (services.system.toLowerCase() !== 'healthy') {
      unhealthy.push('System Service');
    }

    return unhealthy;
  },
};
