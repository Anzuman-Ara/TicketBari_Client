import React, { useState, useEffect } from 'react';
import {
  Search,
  Megaphone,
  MegaphoneOff,
  Eye,
  TrendingUp,
  DollarSign,
  MapPin,
  User,
  Star,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { api } from '../../config/api';

const AdvertiseTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [transportFilter, setTransportFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchTickets();
  }, [currentPage, transportFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        status: 'approved',
        ...(transportFilter && { transportType: transportFilter })
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTickets();
  };

  const toggleAdvertisement = async (ticketId) => {
    try {
      setActionLoading(prev => ({ ...prev, [ticketId]: true }));
      await api.put(`/admin/advertised-tickets/${ticketId}/toggle`);
      
      // Refresh tickets
      await fetchTickets();
    } catch (error) {
      console.error('Error toggling advertisement:', error);
      alert('Failed to toggle advertisement. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleImageError = (ticketId) => {
    setImageErrors(prev => ({ ...prev, [ticketId]: true }));
  };

  // Get transport type icon
  const getTransportIcon = (type) => {
    const icons = {
      bus: '🚌',
      train: '🚆',
      flight: '✈️',
      launch: '🚢',
      ferry: '⛴️'
    };
    return icons[type] || '🚌';
  };

  const getTicketImage = (ticket) => {
    if (ticket.imageUrl && !imageErrors[ticket._id]) {
      return (
        <img
          className="h-12 w-12 rounded-lg object-cover"
          src={ticket.imageUrl}
          alt={ticket.operator?.name}
          onError={() => handleImageError(ticket._id)}
        />
      );
    } else {
      return (
        <div className="h-12 w-12 rounded-lg bg-background-secondary flex items-center justify-center text-2xl">
          {getTransportIcon(ticket.type)}
        </div>
      );
    }
  };

  const getAdvertisedTickets = () => tickets.filter(t => t.isAdvertised);
  const getUnadvertisedTickets = () => tickets.filter(t => !t.isAdvertised && t.verificationStatus === 'approved');

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const advertisedCount = getAdvertisedTickets().length;
  const canAdvertiseMore = advertisedCount < 6;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Advertise Tickets</h1>
              <p className="text-text-secondary">Manage ticket advertisements on homepage</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">
                  {advertisedCount}/6 Advertised
                </div>
                <div className="text-xs text-text-tertiary">
                  {canAdvertiseMore ? 'Can advertise more tickets' : 'Maximum limit reached'}
                </div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    strokeDasharray={`${(advertisedCount / 6) * 100}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-text-primary">{advertisedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div className="sm:col-span-2">
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

            {/* Transport Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary">Transport</label>
              <select
                value={transportFilter}
                onChange={(e) => setTransportFilter(e.target.value)}
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
          </div>
          <div className="mt-4">
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Advertised Tickets Section */}
      {getAdvertisedTickets().length > 0 && (
        <div className="bg-surface shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Megaphone className="w-5 h-5 text-primary mr-2" />
              <h3 className="text-lg font-medium text-text-primary">
                Currently Advertised ({getAdvertisedTickets().length})
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getAdvertisedTickets().map((ticket) => (
                <div key={ticket._id} className="border border-border rounded-lg p-4 bg-background-tertiary">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {getTicketImage(ticket)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-text-primary">
                          {ticket.operator?.name}
                        </div>
                        <div className="text-xs text-text-tertiary flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {ticket.from?.city} → {ticket.to?.city}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAdvertisement(ticket._id)}
                      disabled={actionLoading[ticket._id]}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-text-inverse bg-danger hover:bg-danger-hover rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                    >
                      <MegaphoneOff className="w-4 h-4 mr-1" />
                      {actionLoading[ticket._id] ? 'Processing...' : 'Unadvertise'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-medium text-text-primary">৳{ticket.pricing?.baseFare}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Vendor:</span>
                      <span className="text-text-primary">{ticket.vendor?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Advertised:</span>
                      <span className="text-success">
                        {ticket.advertisedAt ? new Date(ticket.advertisedAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {ticket.advertisementMetrics && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-text-primary">{ticket.advertisementMetrics.views}</div>
                          <div className="text-text-tertiary">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-text-primary">{ticket.advertisementMetrics.clicks}</div>
                          <div className="text-text-tertiary">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-text-primary">{ticket.advertisementMetrics.bookings}</div>
                          <div className="text-text-tertiary">Bookings</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-text-primary">৳{ticket.advertisementMetrics.revenue}</div>
                          <div className="text-text-tertiary">Revenue</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Tickets Section */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-text-secondary mr-2" />
            <h3 className="text-lg font-medium text-text-primary">
              Available Tickets ({getUnadvertisedTickets().length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-secondary">
                <tr>
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
                    Performance Potential
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {getUnadvertisedTickets().map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-background-secondary">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {getTicketImage(ticket)}
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
                        <User className="w-3 h-3 mr-1" />
                        {ticket.vendor?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ৳{ticket.pricing?.baseFare}
                      </div>
                      {ticket.schedule?.[0] && (
                        <div className="text-sm text-text-tertiary flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {ticket.schedule[0].departureTime}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-warning mr-1" />
                          <span>High Potential</span>
                        </div>
                        <div className="text-xs text-text-tertiary mt-1">
                          Popular route
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleAdvertisement(ticket._id)}
                        disabled={!canAdvertiseMore || actionLoading[ticket._id]}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 ${
                          canAdvertiseMore
                            ? 'text-text-inverse bg-primary hover:bg-primary-hover'
                            : 'text-text-tertiary bg-background-secondary cursor-not-allowed'
                        }`}
                      >
                        <Megaphone className="w-4 h-4 mr-1" />
                        {actionLoading[ticket._id] ? 'Processing...' : 'Advertise'}
                      </button>
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
      </div>

      {/* Analytics Section */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-text-secondary mr-2" />
            <h3 className="text-lg font-medium text-text-primary">Advertisement Analytics</h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-background-secondary overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-6 w-6 text-text-tertiary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-text-tertiary truncate">
                        Total Views
                      </dt>
                      <dd className="text-lg font-medium text-text-primary">
                        {tickets.reduce((sum, t) => sum + (t.advertisementMetrics?.views || 0), 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-secondary overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-6 w-6 text-text-tertiary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-text-tertiary truncate">
                        Total Clicks
                      </dt>
                      <dd className="text-lg font-medium text-text-primary">
                        {tickets.reduce((sum, t) => sum + (t.advertisementMetrics?.clicks || 0), 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-secondary overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-text-tertiary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-text-tertiary truncate">
                        Total Bookings
                      </dt>
                      <dd className="text-lg font-medium text-text-primary">
                        {tickets.reduce((sum, t) => sum + (t.advertisementMetrics?.bookings || 0), 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-secondary overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-text-tertiary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-text-tertiary truncate">
                        Revenue Generated
                      </dt>
                      <dd className="text-lg font-medium text-text-primary">
                        ৳{tickets.reduce((sum, t) => sum + (t.advertisementMetrics?.revenue || 0), 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiseTickets;