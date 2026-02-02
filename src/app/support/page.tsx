'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { RequestForm } from '@/components/RequestForm';
import { RequestList } from '@/components/RequestList';

interface SupportRequest {
  id: string;
  requestType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function SupportPortalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [clientName, setClientName] = useState<string | null>(null);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/support/requests?token=${encodeURIComponent(token)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch requests');
      }

      const data = await response.json();
      setClientName(data.clientName);
      setRequests(data.requests);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">A valid token is required to access the support portal.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Portal</h1>
          <p className="text-gray-600">Welcome, {clientName}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit a New Request</h2>
          <RequestForm token={token} onSubmitSuccess={fetchRequests} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Previous Requests</h2>
          <RequestList requests={requests} />
        </div>
      </div>
    </div>
  );
}

export default function SupportPortal() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <SupportPortalContent />
    </Suspense>
  );
}
