import React from 'react';
import { useHealthCheck } from '../hooks/use-health';

export const HealthCheck: React.FC = () => {
  const { data, isLoading, isError, refetch } = useHealthCheck(5000);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return '✓';
      case 'unhealthy':
        return '✗';
      default:
        return '⚠';
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🏥 Health Check</h2>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium transition-colors text-sm"
          >
            {isLoading ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600 py-8">
            <p>Checking system health...</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium text-lg mb-2">
              ✗ Unable to connect to backend
            </p>
            <p className="text-red-500 text-sm">
              Make sure the API server is running on port 8080
            </p>
          </div>
        )}

        {data && data.services && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div
              className={`border-2 rounded-lg p-6 ${getStatusColor(data.status)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">Overall Status</p>
                  <p className="text-2xl font-bold">
                    {getStatusIcon(data.status)} {data.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Services */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`border rounded-lg p-4 ${getStatusColor(data.services.documents)}`}>
                <p className="text-xs font-medium opacity-75 mb-1">Document Service</p>
                <p className="text-lg font-bold">
                  {getStatusIcon(data.services.documents)} {data.services.documents}
                </p>
              </div>

              <div className={`border rounded-lg p-4 ${getStatusColor(data.services.chat)}`}>
                <p className="text-xs font-medium opacity-75 mb-1">Chat Service</p>
                <p className="text-lg font-bold">
                  {getStatusIcon(data.services.chat)} {data.services.chat}
                </p>
              </div>

              <div className={`border rounded-lg p-4 ${getStatusColor(data.services.system)}`}>
                <p className="text-xs font-medium opacity-75 mb-1">System Service</p>
                <p className="text-lg font-bold">
                  {getStatusIcon(data.services.system)} {data.services.system}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Auto-refreshing every 5 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
