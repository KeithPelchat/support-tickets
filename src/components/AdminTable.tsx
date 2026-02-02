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

interface Message {
  id: string;
  content: string;
  senderType: string;
  createdAt: string;
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
  messages?: Message[];
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
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
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

  const handleSendReply = async (requestId: string) => {
    const content = replyContent[requestId]?.trim();
    if (!content) return;

    setUpdatingId(requestId);
    try {
      const response = await fetch(`/api/support/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword, internalNotes: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      setReplyContent((prev) => ({ ...prev, [requestId]: '' }));
      onUpdate();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
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
        {requests.map((request) => {
          const hasMessages = request.messages && request.messages.length > 0;
          const hasClientReply = request.messages?.some(m => m.senderType === 'client');

          return (
            <div
              key={request.id}
              className={`border rounded-lg bg-white shadow-sm ${
                updatingId === request.id ? 'opacity-50' : ''
              } ${hasClientReply ? 'border-l-4 border-l-green-500' : ''}`}
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
                    {hasMessages && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        hasClientReply ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {request.messages!.length} message{request.messages!.length > 1 ? 's' : ''}
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
                  {/* Original Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Original Request</h4>
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

                  {/* Conversation Thread */}
                  {hasMessages && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Conversation</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {request.messages!.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.senderType === 'admin'
                                ? 'bg-blue-50 border-l-4 border-blue-400'
                                : 'bg-green-50 border-l-4 border-green-400'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-medium ${
                                message.senderType === 'admin' ? 'text-blue-600' : 'text-green-600'
                              }`}>
                                {message.senderType === 'admin' ? 'You (Support)' : `Client (${getClientName(request.clientId)})`}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  {request.status !== 'closed' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Send Reply to Client</h4>
                      <textarea
                        value={replyContent[request.id] || ''}
                        onChange={(e) => setReplyContent((prev) => ({ ...prev, [request.id]: e.target.value }))}
                        className="w-full text-sm border rounded p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Type your reply to the client..."
                        disabled={updatingId === request.id}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          Client will receive an email notification with your reply.
                        </p>
                        <button
                          onClick={() => handleSendReply(request.id)}
                          disabled={updatingId === request.id || !replyContent[request.id]?.trim()}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {updatingId === request.id ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              Send Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {request.status === 'closed' && (
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
                      This request is closed. Change status to reply.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
