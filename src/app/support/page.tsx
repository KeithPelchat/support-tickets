'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { RequestForm } from '@/components/RequestForm';
import { RequestList } from '@/components/RequestList';
import { ClientDocs } from '@/components/ClientDocs';

interface SupportRequest {
  id: string;
  requestType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type View = 'new' | 'history' | 'help';

function SupportPortalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [clientName, setClientName] = useState<string | null>(null);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('new');

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

  const handleSubmitSuccess = useCallback(() => {
    fetchRequests();
    setActiveView('history');
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-900">Support Portal</h1>
          <p className="text-sm text-gray-600 truncate">{clientName}</p>
        </div>
        <nav className="p-2">
          <button
            onClick={() => setActiveView('new')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
              activeView === 'new'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
              activeView === 'history'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Past Requests
            {requests.length > 0 && (
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('help')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
              activeView === 'help'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {activeView === 'new' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit a New Request</h2>
              <RequestForm token={token} onSubmitSuccess={handleSubmitSuccess} />
            </div>
          )}

          {activeView === 'history' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Past Requests</h2>
              <RequestList requests={requests} token={token} onUpdate={fetchRequests} />
            </div>
          )}

          {activeView === 'help' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Help & Documentation</h2>
              <ClientDocs />
            </div>
          )}
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
