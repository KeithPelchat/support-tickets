'use client';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-blue-100 text-blue-800',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-800',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
