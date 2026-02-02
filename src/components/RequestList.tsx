'use client';

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';

interface SupportRequest {
  id: string;
  requestType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RequestListProps {
  requests: SupportRequest[];
}

export function RequestList({ requests }: RequestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No previous requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div
            className="flex justify-between items-start cursor-pointer"
            onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{request.requestType}</span>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Submitted: {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              {expandedId === request.id ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>

          {expandedId === request.id && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              {request.updatedAt !== request.createdAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {new Date(request.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
