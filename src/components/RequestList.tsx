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

interface SupportRequest {
  id: string;
  requestType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images?: ImageInfo[];
}

interface RequestListProps {
  requests: SupportRequest[];
}

export function RequestList({ requests }: RequestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<ImageInfo[] | null>(null);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  const openLightbox = (images: ImageInfo[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxInitialIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImages(null);
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

                {/* Images */}
                {request.images && request.images.length > 0 && (
                  <div className="mt-4">
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
