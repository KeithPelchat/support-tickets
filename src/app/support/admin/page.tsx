'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminFilters } from '@/components/AdminFilters';
import { AdminTable } from '@/components/AdminTable';

interface SupportRequest {
  id: string;
  clientId: string;
  requestType: string;
  description: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  clientId: string;
  clientName: string;
}

interface Counts {
  new: number;
  in_progress: number;
}

export default function AdminDashboard() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [counts, setCounts] = useState<Counts>({ new: 0, in_progress: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('adminPassword');
    if (stored) {
      setAdminPassword(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!adminPassword) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ adminPassword });
      if (selectedClient) params.append('clientId', selectedClient);
      if (selectedType) params.append('requestType', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);

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

  useEffect(() => {
    if (isAuthenticated && adminPassword) {
      fetchData();
    }
  }, [isAuthenticated, adminPassword, fetchData]);

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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex gap-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                New: {counts.new}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                In Progress: {counts.in_progress}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
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
      </div>
    </div>
  );
}
