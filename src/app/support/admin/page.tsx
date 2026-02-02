'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminFilters } from '@/components/AdminFilters';
import { AdminTable } from '@/components/AdminTable';
import { TokenManager } from '@/components/TokenManager';
import { AdminDocs } from '@/components/AdminDocs';

interface ImageInfo {
  id: string;
  imageUrl: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

interface SupportRequest {
  id: string;
  clientId: string;
  requestType: string;
  description: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  images?: ImageInfo[];
}

interface Client {
  clientId: string;
  clientName: string;
}

interface Counts {
  new: number;
  in_progress: number;
}

interface ClientToken {
  token: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  createdAt: string;
  requestCount: number;
}

type View = 'requests' | 'tokens' | 'docs';

export default function AdminDashboard() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<View>('requests');

  // Requests state
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [counts, setCounts] = useState<Counts>({ new: 0, in_progress: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Tokens state
  const [tokens, setTokens] = useState<ClientToken[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('adminPassword');
    if (stored) {
      setAdminPassword(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    console.log('fetchData called', { adminPassword: adminPassword ? 'set' : 'not set' });
    if (!adminPassword) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ adminPassword });
      if (selectedClient) params.append('clientId', selectedClient);
      if (selectedType) params.append('requestType', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);

      console.log('Fetching requests from API...');
      const response = await fetch(`/api/support/requests?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminPassword');
          setAdminPassword(null);
          setIsAuthenticated(false);
          setAuthError('Invalid password');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log('Fetched requests:', data.requests?.length, 'requests');
      console.log('First request status:', data.requests?.[0]?.status, 'notes:', data.requests?.[0]?.internalNotes);
      setRequests(data.requests);
      setClients(data.clients);
      setCounts(data.counts);
      setAuthError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [adminPassword, selectedClient, selectedType, selectedStatus]);

  const fetchTokens = useCallback(async () => {
    if (!adminPassword) return;

    setIsLoadingTokens(true);
    try {
      const params = new URLSearchParams({ adminPassword });
      const response = await fetch(`/api/support/tokens?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    if (isAuthenticated && adminPassword) {
      fetchData();
      fetchTokens();
    }
  }, [isAuthenticated, adminPassword, fetchData, fetchTokens]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const params = new URLSearchParams({ adminPassword: passwordInput });
    const response = await fetch(`/api/support/requests?${params.toString()}`);

    if (response.ok) {
      localStorage.setItem('adminPassword', passwordInput);
      setAdminPassword(passwordInput);
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setAdminPassword(null);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            {authError && (
              <div className="mb-4 text-red-600 text-sm">{authError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Status Counts */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">New</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                {counts.new}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">In Progress</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                {counts.in_progress}
              </span>
            </div>
          </div>
        </div>

        <nav className="p-2 flex-1">
          <button
            onClick={() => setActiveView('requests')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
              activeView === 'requests'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Support Requests
            {requests.length > 0 && (
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('tokens')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
              activeView === 'tokens'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Client Tokens
            {tokens.length > 0 && (
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {tokens.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('docs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
              activeView === 'docs'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Documentation
          </button>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeView === 'requests' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Requests</h2>
            <AdminFilters
              clients={clients}
              selectedClient={selectedClient}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
              onClientChange={setSelectedClient}
              onTypeChange={setSelectedType}
              onStatusChange={setSelectedStatus}
            />

            {isLoading ? (
              <div className="text-center py-6 text-gray-500">Loading...</div>
            ) : (
              <AdminTable
                requests={requests}
                clients={clients}
                adminPassword={adminPassword!}
                onUpdate={fetchData}
              />
            )}
          </div>
        )}

        {activeView === 'tokens' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Tokens</h2>
            {isLoadingTokens ? (
              <div className="text-center py-6 text-gray-500">Loading...</div>
            ) : (
              <TokenManager
                tokens={tokens}
                adminPassword={adminPassword!}
                onUpdate={fetchTokens}
              />
            )}
          </div>
        )}

        {activeView === 'docs' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documentation</h2>
            <AdminDocs />
          </div>
        )}
      </div>
    </div>
  );
}
