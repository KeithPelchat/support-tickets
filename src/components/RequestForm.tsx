'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface RequestFormProps {
  token: string;
  onSubmitSuccess: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const requestTypes = [
  'Technical Issue',
  'Feature Request',
  'Billing Question',
  'General Inquiry',
  'Other',
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

export function RequestForm({ token, onSubmitSuccess }: RequestFormProps) {
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMessage, setPasteMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Invalid file type. Allowed: PNG, JPEG, GIF, WebP`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File too large. Maximum size: 5MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (files.length + validFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        break;
      }

      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  }, [files.length]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      const itemsArray = Array.from(items);
      for (let i = 0; i < itemsArray.length; i++) {
        const item = itemsArray[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const newFile = new File([file], `screenshot-${timestamp}.png`, {
              type: file.type,
            });
            imageFiles.push(newFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        addFiles(imageFiles);
        setPasteMessage('Screenshot pasted!');
        setTimeout(() => setPasteMessage(null), 2000);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [addFiles]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      files.forEach((f) => URL.revokeObjectURL(f.preview));
    };
    // Intentionally empty - cleanup only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!requestType) {
      setError('Please select a request type');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('requestType', requestType);
      formData.append('description', description);

      files.forEach((f) => {
        formData.append('files', f.file);
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/support/submit', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      const data = await response.json();

      if (data.uploadErrors && data.uploadErrors.length > 0) {
        setError(`Request submitted, but some files failed:\n${data.uploadErrors.join('\n')}`);
      }

      setSuccess(true);
      setRequestType('');
      setDescription('');
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      onSubmitSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="requestType" className="block text-sm font-medium text-gray-700">
          Request Type
        </label>
        <select
          id="requestType"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        >
          <option value="">Select a type...</option>
          {requestTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe your request in detail... (Tip: Paste screenshots with Ctrl+V)"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
      </div>

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Screenshots / Images (optional)
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-sm text-gray-600"
          >
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Click to upload
            </span>{' '}
            or drag and drop
            <br />
            <span className="text-xs text-gray-500">
              PNG, JPG, GIF, WebP up to 5MB (max {MAX_FILES} files)
            </span>
          </label>
        </div>

        {pasteMessage && (
          <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {pasteMessage}
          </div>
        )}

        {/* File Previews */}
        {files.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((f) => (
              <div
                key={f.id}
                className="relative group border rounded-lg overflow-hidden bg-gray-50"
              >
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity" />
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {formatFileSize(f.file.size)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isSubmitting && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">Request submitted successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Uploading...
          </>
        ) : (
          `Submit Request${files.length > 0 ? ` (${files.length} image${files.length > 1 ? 's' : ''})` : ''}`
        )}
      </button>
    </form>
  );
}
