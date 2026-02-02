'use client';

import { useState } from 'react';

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

interface AdminTableProps {
  requests: SupportRequest[];
  clients: Client[];
  adminPassword: string;
  onUpdate: () => void;
}

const statuses = ['new', 'in_progress', 'resolved', 'closed'];

export function AdminTable({ requests, clients, adminPassword, onUpdate }: AdminTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.clientId === clientId);
    return client?.clientName || clientId;
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setUpdatingId(requestId);
    try {
      const response = await fetch(`/api/support/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotesEdit = (request: SupportRequest) => {
    setEditingNotesId(request.id);
    setNotesValue(request.internalNotes || '');
  };

  const handleNotesSave = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      const response = await fetch(`/api/support/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword, internalNotes: notesValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      setEditingNotesId(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes');
    } finally {
      setUpdatingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Internal Notes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className={updatingId === request.id ? 'opacity-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {getClientName(request.clientId)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.requestType}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                <div className="truncate" title={request.description}>
                  {request.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(request.id, e.target.value)}
                  disabled={updatingId === request.id}
                  className="text-sm border rounded p-1"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'new' ? 'New' :
                       status === 'in_progress' ? 'In Progress' :
                       status === 'resolved' ? 'Resolved' : 'Closed'}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                {editingNotesId === request.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      className="text-sm border rounded p-1 w-full"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNotesSave(request.id)}
                        disabled={updatingId === request.id}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => handleNotesEdit(request)}
                  >
                    {request.internalNotes || (
                      <span className="text-gray-400 italic">Click to add notes</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
