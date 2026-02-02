'use client';

import { useState } from 'react';

interface ClientToken {
  token: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  requestCount: number;
}

interface TokenManagerProps {
  tokens: ClientToken[];
  adminPassword: string;
  onUpdate: () => void;
}

export function TokenManager({ tokens, adminPassword, onUpdate }: TokenManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingToken, setDeletingToken] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword,
          clientId: newClientId.toLowerCase().trim(),
          clientName: newClientName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create token');
      }

      setSuccess(`Token created: ${data.token.token}`);
      setNewClientId('');
      setNewClientName('');
      setIsCreating(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (token: string) => {
    if (!confirm('Are you sure you want to delete this token? This cannot be undone.')) {
      return;
    }

    setError(null);
    setDeletingToken(token);

    try {
      const params = new URLSearchParams({ adminPassword, token });
      const response = await fetch(`/api/support/tokens?${params.toString()}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete token');
      }

      setSuccess('Token deleted successfully');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingToken(null);
    }
  };

  const copyToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getPortalUrl = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/support?token=${token}`;
  };

  const copyPortalUrl = async (token: string) => {
    try {
      await navigator.clipboard.writeText(getPortalUrl(token));
      setCopiedToken(`url-${token}`);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Client Tokens</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Token
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              placeholder="e.g., acme, techcorp"
              className="mt-1 block w-full rounded-md border p-2 text-sm"
              pattern="[a-z0-9_-]+"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Lowercase letters, numbers, underscores, hyphens only</p>
          </div>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              id="clientName"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              className="mt-1 block w-full rounded-md border p-2 text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Token'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewClientId('');
                setNewClientName('');
                setError(null);
              }}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tokens.length === 0 ? (
          <p className="text-gray-500 text-sm">No client tokens found.</p>
        ) : (
          tokens.map((token) => (
            <div
              key={token.token}
              className={`border rounded-lg p-4 bg-white ${
                deletingToken === token.token ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{token.clientName}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {token.clientId}
                    </span>
                    {token.requestCount > 0 && (
                      <span className="text-xs bg-blue-100 px-2 py-0.5 rounded text-blue-700">
                        {token.requestCount} request{token.requestCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                      {token.token}
                    </code>
                    <button
                      onClick={() => copyToClipboard(token.token)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title="Copy token"
                    >
                      {copiedToken === token.token ? (
                        <span className="text-green-600">Copied!</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={() => copyPortalUrl(token.token)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {copiedToken === `url-${token.token}` ? (
                        <span className="text-green-600">URL Copied!</span>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Copy Portal URL
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(token.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(token.token)}
                  disabled={deletingToken === token.token || token.requestCount > 0}
                  className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  title={token.requestCount > 0 ? 'Cannot delete: has associated requests' : 'Delete token'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
