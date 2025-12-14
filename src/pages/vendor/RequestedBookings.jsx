import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Ticket, 
  DollarSign,
  MapPin,
  AlertCircle,
  Loader2,
  CalendarDays,
  Eye,
  MessageSquare
} from 'lucide-react'
import { api } from '../../config/api'
import { format } from 'date-fns'

const RequestedBookings = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [responseNotes, setResponseNotes] = useState('')
  const [responseType, setResponseType] = useState('')

  // Fetch vendor bookings
  const { data: bookingsData, isLoading, error } = useQuery(
    ['vendorBookings', { search: searchTerm, status: statusFilter, date: dateFilter }],
    async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFilter) params.append('startDate', dateFilter)
      
      const response = await api.get(`/vendor/bookings?${params}`)
      return response.data
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  const bookings = bookingsData?.data || []

  // Accept booking mutation
  const acceptBookingMutation = useMutation(
    async ({ bookingId, notes }) => {
      const response = await api.put(`/vendor/bookings/${bookingId}/accept`, { notes })
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success('Booking accepted successfully!')
        queryClient.invalidateQueries('vendorBookings')
        queryClient.invalidateQueries('vendorRevenue')
        setIsResponseModalOpen(false)
        setSelectedBooking(null)
        setResponseNotes('')
        setResponseType('')
      },
      onError: (error) => {
        console.error('Accept booking error:', error)
        toast.error(error.response?.data?.message || 'Failed to accept booking')
      }
    }
  )

  // Reject booking mutation
  const rejectBookingMutation = useMutation(
    async ({ bookingId, notes }) => {
      const response = await api.put(`/vendor/bookings/${bookingId}/reject`, { notes })
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success('Booking rejected successfully!')
        queryClient.invalidateQueries('vendorBookings')
        setIsResponseModalOpen(false)
        setSelectedBooking(null)
        setResponseNotes('')
        setResponseType('')
      },
      onError: (error) => {
        console.error('Reject booking error:', error)
        toast.error(error.response?.data?.message || 'Failed to reject booking')
      }
    }
  )

  // Handle booking response
  const handleBookingResponse = (booking, type) => {
    setSelectedBooking(booking)
    setResponseType(type)
    setIsResponseModalOpen(true)
  }

  const handleResponseSubmit = () => {
    if (!selectedBooking || !responseType) return

    const mutationData = {
      bookingId: selectedBooking._id,
      notes: responseNotes
    }

    if (responseType === 'accept') {
      acceptBookingMutation.mutate(mutationData)
    } else {
      rejectBookingMutation.mutate(mutationData)
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-warning', icon: Clock, text: 'Pending' },
      accepted: { color: 'bg-green-100 text-success', icon: CheckCircle, text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-danger', icon: XCircle, text: 'Rejected' },
      completed: { color: 'bg-blue-100 text-primary', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-background-tertiary text-text-tertiary', icon: XCircle, text: 'Cancelled' }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  // Get action buttons based on status
  const getActionButtons = (booking) => {
    if (booking.bookingStatus !== 'pending') {
      return (
        <span className="text-text-tertiary text-sm">
          {booking.bookingStatus === 'accepted' ? 'Accepted' :
           booking.bookingStatus === 'rejected' ? 'Rejected' : 'Processed'}
        </span>
      )
    }

    return (
      <div className="flex space-x-2">
        <button
          onClick={() => handleBookingResponse(booking, 'accept')}
          disabled={acceptBookingMutation.isLoading || rejectBookingMutation.isLoading}
          className="bg-success hover:bg-success-hover disabled:bg-surface-secondary disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Accept
        </button>
        <button
          onClick={() => handleBookingResponse(booking, 'reject')}
          disabled={acceptBookingMutation.isLoading || rejectBookingMutation.isLoading}
          className="bg-danger hover:bg-danger-hover disabled:bg-surface-secondary disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </button>
      </div>
    )
  }

  // Calculate total amount
  const calculateTotalAmount = (booking) => {
    return booking.totalAmount || (booking.route?.pricing?.baseFare * booking.bookingQuantity)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-background min-h-screen p-6">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-text-secondary">Loading bookings...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg shadow-md mx-6">
        <AlertCircle className="mx-auto h-12 w-12 text-danger" />
        <h3 className="mt-2 text-sm font-medium text-text-primary">Error loading bookings</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {error.response?.data?.message || 'Something went wrong. Please try again.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background min-h-screen p-6">
      {/* Header */}
      <div className="bg-surface rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center">
              <Calendar className="mr-3 h-6 w-6 text-primary" />
              Requested Bookings
            </h1>
            <p className="text-text-secondary mt-1">
              Manage incoming booking requests from customers
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{bookings.length}</span> total requests
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-surface rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-5 w-5" />
              <input
                type="text"
                placeholder="Search by user name, email, or booking reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              placeholder="Filter by date"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg shadow-md">
          <Calendar className="mx-auto h-12 w-12 text-text-tertiary" />
          <h3 className="mt-2 text-sm font-medium text-text-primary">No bookings found</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {searchTerm || statusFilter !== 'all' || dateFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'No booking requests have been made yet.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    User Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Booking Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-background-secondary">
                    {/* User Information */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-background-tertiary flex items-center justify-center">
                            <User className="h-5 w-5 text-text-tertiary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-primary">
                            {booking.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-text-secondary flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {booking.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Ticket Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        <div className="font-medium">{booking.route?.operator?.name || 'N/A'}</div>
                        <div className="text-text-secondary flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-primary" />
                          {booking.route?.from?.city || 'N/A'} → {booking.route?.to?.city || 'N/A'}
                        </div>
                        <div className="text-text-tertiary text-xs mt-1">
                          {booking.route?.type || 'N/A'} • ৳{booking.route?.pricing?.baseFare || 'N/A'}
                        </div>
                      </div>
                    </td>

                    {/* Booking Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-1 text-info" />
                          <span className="font-medium">{booking.bookingQuantity}</span> tickets
                        </div>
                        <div className="text-text-tertiary text-xs mt-1">
                          Ref: {booking.bookingReference || 'N/A'}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-success" />
                        ৳{calculateTotalAmount(booking).toLocaleString()}
                      </div>
                      <div className="text-text-tertiary text-xs">
                        ৳{booking.route?.pricing?.baseFare || 'N/A'} per ticket
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.bookingStatus)}
                      {booking.vendorResponseNotes && (
                        <div className="text-xs text-text-tertiary mt-1 flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Response added
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1 text-warning" />
                        <div>
                          <div>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</div>
                          <div className="text-xs">{format(new Date(booking.createdAt), 'HH:mm')}</div>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {getActionButtons(booking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {isResponseModalOpen && (
        <div className="fixed inset-0 bg-overlay overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md glass">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text-primary">
                  {responseType === 'accept' ? 'Accept' : 'Reject'} Booking Request
                </h3>
                <button
                  onClick={() => {
                    setIsResponseModalOpen(false)
                    setSelectedBooking(null)
                    setResponseNotes('')
                    setResponseType('')
                  }}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {selectedBooking && (
                <div className="mb-4 p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Booking Details</h4>
                  <div className="text-sm text-text-secondary space-y-1">
                    <div>User: {selectedBooking.user?.name} ({selectedBooking.user?.email})</div>
                    <div>Route: {selectedBooking.route?.from?.city} → {selectedBooking.route?.to?.city}</div>
                    <div>Tickets: {selectedBooking.bookingQuantity}</div>
                    <div>Amount: ৳{calculateTotalAmount(selectedBooking).toLocaleString()}</div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Response Notes (Optional)
                </label>
                <textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  placeholder={`Add notes for ${responseType === 'accept' ? 'accepting' : 'rejecting'} this booking...`}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsResponseModalOpen(false)
                    setSelectedBooking(null)
                    setResponseNotes('')
                    setResponseType('')
                  }}
                  className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponseSubmit}
                  disabled={acceptBookingMutation.isLoading || rejectBookingMutation.isLoading}
                  className={`px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                    responseType === 'accept'
                      ? 'bg-success hover:bg-success-hover'
                      : 'bg-danger hover:bg-danger-hover'
                  }`}
                >
                  {acceptBookingMutation.isLoading || rejectBookingMutation.isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {responseType === 'accept' ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept Booking
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Booking
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestedBookings