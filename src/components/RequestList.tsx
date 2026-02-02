'use client';

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
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
  requestType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images?: ImageInfo[];
  messages?: Message[];
}

interface RequestListProps {
  requests: SupportRequest[];
  token: string;
  onUpdate: () => void;
}

export function RequestList({ requests, token, onUpdate }: RequestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<ImageInfo[] | null>(null);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openLightbox = (images: ImageInfo[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxInitialIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImages(null);
  };

  const handleReply = async (requestId: string) => {
    const content = replyContent[requestId]?.trim();
    if (!content) return;

    setSubmitting(requestId);
    setError(null);

    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          requestId,
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send reply');
      }

      setReplyContent((prev) => ({ ...prev, [requestId]: '' }));
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No previous requests found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => {
          const hasMessages = request.messages && request.messages.length > 0;

          return (
            <div
              key={request.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{request.requestType}</span>
                    <StatusBadge status={request.status} />
                    {request.images && request.images.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {request.images.length}
                      </span>
                    )}
                    {hasMessages && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {request.messages!.length}
                      </span>
                    )}
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
                  {/* Original Description */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Original Request:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                  </div>

                  {/* Images */}
                  {request.images && request.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {request.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => openLightbox(request.images!, index)}
                            className="relative aspect-square rounded-lg overflow-hidden border hover:border-blue-500 transition-colors group"
                          >
                            <img
                              src={image.imageUrl}
                              alt={image.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages Thread */}
                  {hasMessages && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Conversation:</p>
                      <div className="space-y-3">
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
                                {message.senderType === 'admin' ? 'Support Team' : 'You'}
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

                  {/* Reply Form - only show if request is not closed */}
                  {request.status !== 'closed' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Send a Reply:</p>
                      {error && (
                        <div className="mb-2 text-sm text-red-600">{error}</div>
                      )}
                      <textarea
                        value={replyContent[request.id] || ''}
                        onChange={(e) => setReplyContent((prev) => ({ ...prev, [request.id]: e.target.value }))}
                        placeholder="Type your message here..."
                        className="w-full border rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        disabled={submitting === request.id}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleReply(request.id)}
                          disabled={submitting === request.id || !replyContent[request.id]?.trim()}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submitting === request.id ? (
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
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 italic">
                        This request has been closed. Please submit a new request if you need further assistance.
                      </p>
                    </div>
                  )}

                  {request.updatedAt !== request.createdAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(request.updatedAt).toLocaleString()}
                    </p>
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
        />
      )}
    </>
  );
}
