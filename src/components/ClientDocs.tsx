'use client';

import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function ClientDocs() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div className="space-y-3">
          <p>Welcome to the Support Portal. Here you can:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Submit new support requests</li>
            <li>Track the status of your existing requests</li>
            <li>Communicate with our support team</li>
            <li>View your complete request history</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Bookmark this page for easy access. Your unique portal link
              keeps your requests secure and accessible only to you.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'new-request',
      title: 'Submitting a New Request',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">How to Submit</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click <strong>&quot;New Request&quot;</strong> in the sidebar</li>
            <li>Select a <strong>Request Type</strong> that best describes your issue</li>
            <li>Provide a detailed <strong>Description</strong> of your request</li>
            <li>Optionally attach screenshots or images</li>
            <li>Click <strong>&quot;Submit Request&quot;</strong></li>
          </ol>

          <h4 className="font-medium text-gray-800 mt-4">Request Types</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li><strong>Bug Report:</strong> Something isn&apos;t working as expected</li>
            <li><strong>Feature Request:</strong> Suggest a new feature or improvement</li>
            <li><strong>General Inquiry:</strong> Questions or general help</li>
            <li><strong>Account Issue:</strong> Login, access, or account-related problems</li>
            <li><strong>Billing Question:</strong> Invoices, payments, or subscription queries</li>
          </ul>

          <h4 className="font-medium text-gray-800 mt-4">Writing Good Descriptions</h4>
          <p className="text-gray-600">
            The more detail you provide, the faster we can help. Consider including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
            <li>What you were trying to do</li>
            <li>What happened vs. what you expected</li>
            <li>Any error messages you saw</li>
            <li>Steps to reproduce the issue</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'attachments',
      title: 'Adding Screenshots & Images',
      content: (
        <div className="space-y-3">
          <p className="text-gray-600">
            You can attach up to 5 images to each request. Images help us understand
            your issue faster.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Three Ways to Add Images</h4>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">1. Click to Browse</p>
              <p className="text-sm text-gray-600">
                Click the upload area to open your file browser and select images.
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">2. Drag and Drop</p>
              <p className="text-sm text-gray-600">
                Drag image files from your computer directly onto the upload area.
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">3. Paste from Clipboard</p>
              <p className="text-sm text-gray-600">
                Take a screenshot, then press <kbd className="bg-gray-200 px-1 rounded">Ctrl+V</kbd> (or <kbd className="bg-gray-200 px-1 rounded">Cmd+V</kbd> on Mac)
                anywhere on the form to paste it directly.
              </p>
            </div>
          </div>

          <h4 className="font-medium text-gray-800 mt-4">Supported Formats</h4>
          <p className="text-gray-600 text-sm">
            PNG, JPEG, GIF, and WebP images up to 5MB each.
          </p>
        </div>
      ),
    },
    {
      id: 'tracking',
      title: 'Tracking Your Requests',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Viewing Past Requests</h4>
          <p className="text-gray-600">
            Click <strong>&quot;Past Requests&quot;</strong> in the sidebar to see all your submitted requests.
            Click on any request to expand it and see full details.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Understanding Status</h4>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">New</span>
              <span className="text-gray-600 text-sm">Request received, waiting for review</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">In Progress</span>
              <span className="text-gray-600 text-sm">Being actively worked on by our team</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">Resolved</span>
              <span className="text-gray-600 text-sm">Solution provided, please confirm it works</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">Closed</span>
              <span className="text-gray-600 text-sm">Request completed</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'communication',
      title: 'Communicating with Support',
      content: (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Viewing Messages</h4>
          <p className="text-gray-600">
            When our support team responds, you&apos;ll see their messages in the conversation
            section of your request. Messages are color-coded:
          </p>
          <div className="space-y-2 mt-2">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-sm">
              <span className="text-blue-600 font-medium">Blue</span> = Messages from our Support Team
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-2 text-sm">
              <span className="text-green-600 font-medium">Green</span> = Your messages
            </div>
          </div>

          <h4 className="font-medium text-gray-800 mt-4">Sending Replies</h4>
          <p className="text-gray-600">
            To reply to a request, expand it and use the &quot;Send a Reply&quot; form at the bottom.
            You can send multiple messages back and forth until your issue is resolved.
          </p>

          <h4 className="font-medium text-gray-800 mt-4">Email Notifications</h4>
          <p className="text-gray-600">
            If your account has an email address on file, you&apos;ll receive email notifications
            when our team responds. These emails include the full message content and a link
            back to the portal.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Once a request is marked as &quot;Closed,&quot; you can no longer
              send replies. If you need further help, please submit a new request.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'tips',
      title: 'Tips for Faster Support',
      content: (
        <div className="space-y-3">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">1.</span>
              <div>
                <p className="font-medium text-gray-800">Be Specific</p>
                <p className="text-gray-600 text-sm">
                  Include specific details like error messages, URLs, or steps to reproduce.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">2.</span>
              <div>
                <p className="font-medium text-gray-800">Add Screenshots</p>
                <p className="text-gray-600 text-sm">
                  A picture is worth a thousand words. Take a screenshot and paste it directly
                  with <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl+V</kbd> (or <kbd className="bg-gray-200 px-1 rounded text-xs">Cmd+V</kbd> on Mac).
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">3.</span>
              <div>
                <p className="font-medium text-gray-800">Choose the Right Type</p>
                <p className="text-gray-600 text-sm">
                  Selecting the correct request type helps route your issue to the right team.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">4.</span>
              <div>
                <p className="font-medium text-gray-800">Check Past Requests</p>
                <p className="text-gray-600 text-sm">
                  Before submitting a new request, check if you&apos;ve already reported this issue.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold">5.</span>
              <div>
                <p className="font-medium text-gray-800">Respond Promptly</p>
                <p className="text-gray-600 text-sm">
                  When we ask for more information, quick responses help resolve issues faster.
                </p>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        Click on a topic below to learn more about using the support portal.
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
