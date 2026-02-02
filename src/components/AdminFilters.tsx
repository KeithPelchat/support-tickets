'use client';

interface Client {
  clientId: string;
  clientName: string;
}

interface AdminFiltersProps {
  clients: Client[];
  selectedClient: string;
  selectedType: string;
  selectedStatus: string;
  onClientChange: (clientId: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
}

const requestTypes = [
  'Technical Issue',
  'Feature Request',
  'Billing Question',
  'General Inquiry',
  'Other',
];

const statuses = ['new', 'in_progress', 'resolved', 'closed'];

export function AdminFilters({
  clients,
  selectedClient,
  selectedType,
  selectedStatus,
  onClientChange,
  onTypeChange,
  onStatusChange,
}: AdminFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div>
        <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700">
          Client
        </label>
        <select
          id="clientFilter"
          value={selectedClient}
          onChange={(e) => onClientChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        >
          <option value="">All Clients</option>
          {clients.map((client) => (
            <option key={client.clientId} value={client.clientId}>
              {client.clientName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="typeFilter"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        >
          <option value="">All Types</option>
          {requestTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === 'new' ? 'New' :
               status === 'in_progress' ? 'In Progress' :
               status === 'resolved' ? 'Resolved' : 'Closed'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
