'use client';

import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function AdminDocs() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div className="space-y-3">
          <p>Welcome to the Support Ticket Admin Dashboard. This system allows you to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>View and manage support requests from all clients</li>
            <li>Communicate with clients through a messaging system</li>
            <li>Track request status through the workflow</li>
            <li>Manage client access tokens</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'requests',
      title: 'Managing Support Requests',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Viewing Requests</h4>
          <p className="text-gray-600">
            Click on any request row to expand it and see the full details including the original
            description, any attached images, and the conversation history.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Filtering</h4>
          <p className="text-gray-600">
            Use the filter dropdowns at the top to narrow down requests by client, request type, or status.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Status Workflow</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">New</span>
              <span className="text-gray-400">→</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">In Progress</span>
              <span className="text-gray-400">→</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Resolved</span>
              <span className="text-gray-400">→</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Closed</span>
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
            <li><strong>New:</strong> Fresh request, not yet reviewed</li>
            <li><strong>In Progress:</strong> Being actively worked on (auto-set when you reply)</li>
            <li><strong>Resolved:</strong> Solution provided, awaiting client confirmation</li>
            <li><strong>Closed:</strong> Completed - client can no longer reply</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'messaging',
      title: 'Client Communication',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Sending Replies</h4>
          <p className="text-gray-600">
            Expand a request and use the &quot;Send Reply to Client&quot; form at the bottom. Your message will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Appear in the conversation thread (visible to both you and the client)</li>
            <li>Trigger an email notification to the client (if they have an email on file)</li>
            <li>Automatically change status from &quot;New&quot; to &quot;In Progress&quot;</li>
          </ul>

          <h4 className="font-medium text-gray-800 mt-4">Client Replies</h4>
          <p className="text-gray-600">
            When a client responds, you&apos;ll receive an email notification. Requests with client replies
            are highlighted with a <span className="inline-block w-3 h-3 bg-green-500 rounded-sm align-middle"></span> green
            border on the left side.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Conversation History</h4>
          <p className="text-gray-600">
            All messages are displayed in chronological order:
          </p>
          <div className="space-y-2 mt-2">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-sm">
              <span className="text-blue-600 font-medium">Blue</span> = Your messages (Support Team)
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-2 text-sm">
              <span className="text-green-600 font-medium">Green</span> = Client messages
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'tokens',
      title: 'Client Tokens',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">What are Tokens?</h4>
          <p className="text-gray-600">
            Each client needs a unique token to access the support portal. Tokens are included in the
            portal URL: <code className="bg-gray-100 px-1 rounded text-sm">/support?token=xxx</code>
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Creating a Token</h4>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>Click &quot;+ New Token&quot;</li>
            <li>Enter a Client ID (lowercase, no spaces - e.g., &quot;acme&quot;, &quot;techcorp&quot;)</li>
            <li>Enter the Client Name (display name - e.g., &quot;Acme Corporation&quot;)</li>
            <li>Optionally add a Client Email for notifications</li>
            <li>Click &quot;Create Token&quot;</li>
          </ol>

          <h4 className="font-medium text-gray-800 mt-4">Sharing with Clients</h4>
          <p className="text-gray-600">
            Use the &quot;Copy Portal URL&quot; button to get the full URL with token. Send this to
            your client - they can bookmark it for future access.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Client Email</h4>
          <p className="text-gray-600">
            Adding a client email enables automatic notifications when you reply to their requests
            or change status. You can add/edit emails anytime using the &quot;Edit&quot; link.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Deleting Tokens</h4>
          <p className="text-gray-600">
            Tokens can only be deleted if they have no associated support requests. This prevents
            orphaned data.
          </p>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Email Notifications',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Notifications You Receive</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li><strong>New Request:</strong> When any client submits a new support request</li>
            <li><strong>Client Reply:</strong> When a client responds to a conversation</li>
          </ul>

          <h4 className="font-medium text-gray-800 mt-4">Notifications Clients Receive</h4>
          <p className="text-gray-600 text-sm italic mb-2">
            (Only if they have an email address on their token)
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li><strong>Your Reply:</strong> Full message content with link to portal</li>
            <li><strong>Status Change:</strong> When you change status without sending a reply</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> If you change status AND send a reply at the same time,
              only the reply notification is sent (to avoid duplicate emails).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Workflow Tips</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>
              <strong>Check the sidebar counts</strong> - &quot;New&quot; and &quot;In Progress&quot; badges help you
              prioritize work
            </li>
            <li>
              <strong>Look for green borders</strong> - These indicate requests with client replies
              that may need your attention
            </li>
            <li>
              <strong>Use &quot;Resolved&quot; before &quot;Closed&quot;</strong> - This gives clients a chance to
              confirm the solution works before you close the ticket
            </li>
            <li>
              <strong>Add client emails</strong> - This ensures clients stay informed without
              needing to check the portal
            </li>
          </ul>

          <h4 className="font-medium text-gray-800 mt-4">Auto-Refresh</h4>
          <p className="text-gray-600">
            The request list automatically refreshes every 60 seconds to show new requests
            and updates.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        Click on a section below to expand it and learn more about using the admin dashboard.
      </p>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span className="font-medium text-gray-900">{section.title}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === section.id && (
              <div className="p-4 bg-white border-t">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
