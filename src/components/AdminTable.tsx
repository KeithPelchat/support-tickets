'use client';

import { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<ImageInfo[] | null>(null);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

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

  const openLightbox = (images: ImageInfo[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxInitialIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImages(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No requests found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`border rounded-lg bg-white shadow-sm ${
              updatingId === request.id ? 'opacity-50' : ''
            }`}
          >
            {/* Header Row */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">
                    {getClientName(request.clientId)}
                  </span>
                  <span className="text-sm text-gray-500">{request.requestType}</span>
                  {request.images && request.images.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {request.images.length} image{request.images.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={request.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(request.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
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
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === request.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === request.id && (
              <div className="border-t px-4 py-4 space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {request.description}
                  </p>
                </div>

                {/* Images */}
                {request.images && request.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Attachments ({request.images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {request.images.map((image, index) => (
                        <div key={image.id} className="space-y-1">
                          <button
                            onClick={() => openLightbox(request.images!, index)}
                            className="relative aspect-square w-full rounded-lg overflow-hidden border hover:border-blue-500 transition-colors group"
                          >
                            <img
                              src={image.imageUrl}
                              alt={image.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </button>
                          <div className="text-xs text-gray-500 truncate" title={image.filename}>
                            {image.filename}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatFileSize(image.size)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internal Notes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Internal Notes</h4>
                  {editingNotesId === request.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        className="w-full text-sm border rounded p-2"
                        rows={3}
                        placeholder="Add internal notes..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNotesSave(request.id)}
                          disabled={updatingId === request.id}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded border border-dashed border-gray-200"
                      onClick={() => handleNotesEdit(request)}
                    >
                      {request.internalNotes || (
                        <span className="text-gray-400 italic">Click to add notes...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxInitialIndex}
          onClose={closeLightbox}
          showDownload
          showMetadata
        />
      )}
    </>
  );
}
