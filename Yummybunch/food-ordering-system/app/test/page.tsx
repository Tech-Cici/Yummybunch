'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function TestPage() {
  const [status, setStatus] = useState<string>('Checking connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await apiClient.testConnection();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setStatus(`Backend is running: ${response.data.status}`);
        }
      } catch (err) {
        setError('Failed to test connection');
        console.error('Test error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Backend Connection Test
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="p-4 border border-gray-300 rounded-md">
              <p className="text-sm font-medium text-gray-700">Status:</p>
              <p className="mt-1 text-sm text-gray-900">{status}</p>
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 