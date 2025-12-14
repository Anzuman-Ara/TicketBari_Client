import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  MapPin,
  Bus,
  User,
  Phone,
  Mail,
  DollarSign,
  Package,
  Clock,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../../config/api';

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    transportType: '',
    vendor: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionType, setActionType] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/admin/tickets?${params}`);
      setTickets(response.data.data.tickets);
      setTotalPages(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTickets();
  };

  const handleSelectTicket = (ticketId) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t._id)));
    }
  };

  const handleApprove = (ticket) => {
    setSelectedTicket(ticket);
    setActionType('approve');
    setShowApprovalModal(true);
  };

  const handleReject = (ticket) => {
    setSelectedTicket(ticket);
    setActionType('reject');
    setShowRejectionModal(true);
  };

  const executeAction = async () => {
    setActionLoading(true);
    try {
      const endpoint = actionType === 'approve' 
        ? `/admin/tickets/${selectedTicket._id}/approve`
        : `/admin/tickets/${selectedTicket._id}/reject`;

      await api.put(endpoint, { adminNotes });

      // Refresh tickets
      await fetchTickets();

      // Close modals
      setShowApprovalModal(false);
      setShowRejectionModal(false);
      setSelectedTicket(null);
      setAdminNotes('');
    } catch (error) {
      console.error(`Error ${actionType}ing ticket:`, error);
      alert(`Failed to ${actionType} ticket. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-danger">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-warning">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
    }
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'bus':
        return <Bus className="w-4 h-4" />;
      default:
        return <Bus className="w-4 h-4" />;
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Manage Tickets</h1>
              <p className="text-text-secondary">Review and approve vendor-submitted tickets</p>
            </div>
            <div className="flex space-x-2">
              {selectedTickets.size > 0 && (
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-success hover:bg-success-hover">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Selected ({selectedTickets.size})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary">Search</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md pl-10"
                  placeholder="Search tickets..."
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Transport Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary">Transport</label>
              <select
                value={filters.transportType}
                onChange={(e) => handleFilterChange('transportType', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
                <option value="launch">Launch</option>
                <option value="ferry">Ferry</option>
              </select>
            </div>

            {/* Action Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  <button
                    onClick={handleSelectAll}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    {selectedTickets.size === tickets.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Ticket Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Pricing & Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-background-secondary">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectTicket(ticket._id)}
                      className="text-text-tertiary hover:text-text-primary"
                    >
                      {selectedTickets.has(ticket._id) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={ticket.imageUrl || '/api/placeholder/48/48'}
                          alt={ticket.operator?.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text-primary">
                          {ticket.operator?.name}
                        </div>
                        <div className="text-sm text-text-tertiary flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {ticket.from?.city} → {ticket.to?.city}
                        </div>
                        <div className="text-sm text-text-tertiary flex items-center">
                          {getTransportIcon(ticket.type)}
                          <span className="ml-1 capitalize">{ticket.type}</span>
                          <span className="mx-2">•</span>
                          {ticket.class}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">{ticket.vendor?.name}</div>
                    <div className="text-sm text-text-tertiary flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {ticket.vendor?.email}
                    </div>
                    <div className="text-sm text-text-tertiary flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {ticket.vendor?.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ৳{ticket.pricing?.baseFare}
                    </div>
                    <div className="text-sm text-text-tertiary flex items-center">
                      <Package className="w-3 h-3 mr-1" />
                      {ticket.availableQuantity} seats
                    </div>
                    {ticket.schedule?.[0] && (
                      <div className="text-sm text-text-tertiary flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {ticket.schedule[0].departureTime}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(ticket.verificationStatus)}
                    {ticket.adminNotes && (
                      <div className="text-xs text-text-tertiary mt-1">
                        {ticket.adminNotes}
                      </div>
                    )}
                    <div className="text-xs text-text-tertiary mt-1">
                      {ticket.adminReviewedAt && new Date(ticket.adminReviewedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(ticket)}
                        disabled={ticket.verificationStatus === 'approved'}
                        className="text-success hover:text-success disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(ticket)}
                        disabled={ticket.verificationStatus === 'rejected'}
                        className="text-danger hover:text-danger disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-surface px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-background-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-background-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-primary">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-surface text-sm font-medium text-text-tertiary hover:bg-background-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-background-secondary border-primary text-primary'
                            : 'bg-surface border-border text-text-tertiary hover:bg-background-secondary'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-surface text-sm font-medium text-text-tertiary hover:bg-background-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-overlay transition-opacity" onClick={() => setShowApprovalModal(false)}></div>
            <div className="inline-block align-middle bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-background-secondary sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-text-primary">
                      Approve Ticket
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-text-tertiary">
                        Are you sure you want to approve this ticket from {selectedTicket?.vendor?.name}?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background-secondary px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={executeAction}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-success text-base font-medium text-text-inverse hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-surface text-base font-medium text-text-primary hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-overlay transition-opacity" onClick={() => setShowRejectionModal(false)}></div>
            <div className="inline-block align-middle bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-background-secondary sm:mx-0 sm:h-10 sm:w-10">
                    <XCircle className="h-6 w-6 text-danger" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-text-primary">
                      Reject Ticket
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-text-tertiary mb-4">
                        Are you sure you want to reject this ticket from {selectedTicket?.vendor?.name}?
                      </p>
                      <label className="block text-sm font-medium text-text-primary">
                        Reason for rejection (required)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md"
                        placeholder="Enter reason for rejection..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background-secondary px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={executeAction}
                  disabled={actionLoading || !adminNotes.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-danger text-base font-medium text-text-inverse hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setAdminNotes('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-surface text-base font-medium text-text-primary hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTickets;