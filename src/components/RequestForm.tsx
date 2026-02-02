'use client';

import { useState } from 'react';

interface RequestFormProps {
  token: string;
  onSubmitSuccess: () => void;
}

const requestTypes = [
  'Technical Issue',
  'Feature Request',
  'Billing Question',
  'General Inquiry',
  'Other',
];

export function RequestForm({ token, onSubmitSuccess }: RequestFormProps) {
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, requestType, description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess(true);
      setRequestType('');
      setDescription('');
      onSubmitSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Please describe your request in detail..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
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
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
