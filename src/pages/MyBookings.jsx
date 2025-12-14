import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Ticket,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { format, parseISO } from 'date-fns';

// Countdown Timer Component
const CountdownTimer = ({ departureTime, expired }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (expired) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(departureTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [departureTime, expired]);

  if (expired) {
    return (
      <div className="text-danger text-sm">
        <AlertCircle className="inline h-4 w-4 mr-1" />
        Expired
      </div>
    );
  }

  return (
    <div className="text-sm text-text-secondary">
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4" />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </div>
    </div>
  );
};

// Main My Bookings Component
const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading, error, refetch } = useQuery(
    'userBookings',
    async () => {
      const response = await api.get('/users/bookings');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 30000
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-danger" />;
      default:
        return <AlertCircle className="h-5 w-5 text-text-tertiary" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-success';
      case 'accepted':
        return 'bg-blue-100 text-primary';
      case 'pending':
        return 'bg-yellow-100 text-warning';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-danger';
      default:
        return 'bg-gray-100 text-text-secondary';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-success';
      case 'pending':
        return 'bg-yellow-100 text-warning';
      case 'failed':
        return 'bg-red-100 text-danger';
      case 'refunded':
        return 'bg-blue-100 text-primary';
      default:
        return 'bg-gray-100 text-text-secondary';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • hh:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const handlePayNow = async (booking) => {
    try {
      const response = await api.post('/payments/create-checkout-session', {
        bookingId: booking._id,
        successUrl: `${window.location.origin}/payment-success?booking_id=${booking._id}`,
        cancelUrl: `${window.location.origin}/payment-canceled?booking_id=${booking._id}`
      });

      // Redirect directly to Stripe checkout
      window.location.href = response.data.data.sessionUrl;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(message);
    }
  };

  const canPay = (booking) => {
    // Can pay if booking is accepted and payment is pending
    if (booking.bookingStatus !== 'accepted' || booking.paymentStatus === 'paid') {
      return false;
    }
    
    // Check if departure date and time have already passed
    const currentTime = new Date();
    const departureTime = new Date(booking.route?.departureTime || booking.departureDate);
    if (departureTime < currentTime) {
      return false;
    }
    
    return true;
  };

  const filterBookings = (bookings) => {
    if (activeTab === 'all') return bookings;
    if (activeTab === 'pending') return bookings.filter(b => b.bookingStatus === 'pending');
    if (activeTab === 'accepted') return bookings.filter(b => b.bookingStatus === 'accepted');
    if (activeTab === 'confirmed') return bookings.filter(b => b.bookingStatus === 'confirmed' || b.paymentStatus === 'paid');
    if (activeTab === 'cancelled') return bookings.filter(b => b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected');
    return bookings;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface rounded-lg shadow-md p-6">
                <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-background-secondary rounded mb-4"></div>
                <div className="h-4 bg-background-secondary rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-danger mr-2" />
            <p className="text-danger">Failed to load bookings</p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-danger hover:text-danger-hover flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const bookings = bookingsData?.data || [];
  const filteredBookings = filterBookings(bookings);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed' || b.paymentStatus === 'paid').length;
  const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending').length;
  const acceptedBookings = bookings.filter(b => b.bookingStatus === 'accepted' && b.paymentStatus !== 'paid').length;
  const totalSpent = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Bookings</h1>
          <p className="text-text-secondary mt-2">Manage your tickets and bookings</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh bookings"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-surface p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-primary mr-3" />
            <div>
              <div className="text-2xl font-bold text-primary">{totalBookings}</div>
              <div className="text-sm text-text-secondary">Total</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-warning mr-3" />
            <div>
              <div className="text-2xl font-bold text-warning">{pendingBookings}</div>
              <div className="text-sm text-text-secondary">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-warning mr-3" />
            <div>
              <div className="text-2xl font-bold text-warning">{acceptedBookings}</div>
              <div className="text-sm text-text-secondary">To Pay</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-success mr-3" />
            <div>
              <div className="text-2xl font-bold text-success">{confirmedBookings}</div>
              <div className="text-sm text-text-secondary">Confirmed</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg shadow-md col-span-2 md:col-span-1">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-info mr-3" />
            <div>
              <div className="text-2xl font-bold text-info">৳{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-text-secondary">Total Spent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-surface rounded-lg shadow-md mb-6">
        <div className="flex overflow-x-auto border-b border-border">
          {[
            { id: 'all', label: 'All Bookings', count: totalBookings },
            { id: 'pending', label: 'Pending', count: pendingBookings },
            { id: 'accepted', label: 'Awaiting Payment', count: acceptedBookings },
            { id: 'confirmed', label: 'Confirmed', count: confirmedBookings },
            { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-100 text-primary' : 'bg-background-secondary text-text-tertiary'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-surface rounded-lg shadow-md p-12 text-center">
          <Ticket className="h-16 w-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No bookings found</h3>
          <p className="text-text-tertiary">
            {activeTab === 'all'
              ? 'Start by searching for your first trip'
              : `No ${activeTab} bookings at the moment`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Booking Image */}
              <div className="h-40 bg-gradient-primary relative">
                {booking.route?.image ? (
                  <img
                    src={booking.route.image}
                    alt={booking.route.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Ticket className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                    {getStatusIcon(booking.bookingStatus)}
                    <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Booking Reference */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary font-mono">
                    #{booking.bookingReference}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus === 'paid' ? '✓ Paid' : booking.paymentStatus}
                  </span>
                </div>

                {/* Title and Route */}
                <div className="flex items-center text-lg text-text-primary mb-2">
                  <MapPin className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="truncate font-bold">{(typeof booking.route?.from === 'string' ? booking.route?.from : booking.route?.from?.city) || 'Departure'} → {(typeof booking.route?.to === 'string' ? booking.route?.to : booking.route?.to?.city) || 'Arrival'}</span>
                </div>

                {/* Date and Time */}
                <div className="flex items-center text-sm text-text-secondary mb-2">
                  <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{formatDateTime(typeof booking.route?.departureTime === 'string' ? booking.route?.departureTime : booking.departureDate)}</span>
                </div>

                {/* Passengers */}
                <div className="flex items-center text-sm text-text-secondary mb-3">
                  <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{booking.bookingQuantity || booking.passengers?.length || 1} passenger(s)</span>
                </div>

                {/* Countdown Timer */}
                {booking.countdown && !booking.countdown.expired && booking.bookingStatus !== 'cancelled' && (
                  <div className="mb-3 p-2 bg-background-secondary rounded-lg">
                    <CountdownTimer
                      departureTime={booking.route?.departureTime || booking.departureDate}
                      expired={booking.countdown.expired}
                    />
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <div className="text-lg font-bold text-text-primary">
                      ৳{booking.totalAmount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {booking.bookingQuantity || booking.passengers?.length || 1} × ৳{booking.baseFare?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Payment Actions */}
                {booking.bookingStatus === 'accepted' && booking.paymentStatus !== 'paid' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {canPay(booking) ? (
                      <button
                        onClick={() => handlePayNow(booking)}
                        className="w-full bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center font-medium"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now - ৳{booking.totalAmount?.toLocaleString()}
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-danger flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {canPay(booking) ? 'Payment not available' : 'Cannot make payment - departure date and time have already passed'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Status Message */}
                {booking.bookingStatus === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-warning flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Waiting for vendor approval
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MyBookings;
