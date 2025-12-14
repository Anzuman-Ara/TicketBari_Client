import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Ticket, Clock, MapPin, Calendar, Users, AlertTriangle } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const bookingId = searchParams.get('booking_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        toast.error('Invalid booking reference');
        navigate('/');
        return;
      }

      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      return location.city || location.terminal || location.state || location.country || 'N/A';
    }
    return 'N/A';
  };

  const updatePaymentStatus = async () => {
    if (!bookingId) {
      console.error('No booking ID available');
      return;
    }

    try {
      const response = await api.post('/payments/update-payment-status', {
        bookingId,
        sessionId
      });

      console.log('Payment status updated successfully:', response.data);
      toast.success('Payment confirmed successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-md">
          <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-danger" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Booking Not Found</h3>
          <p className="text-text-secondary mb-4">
            We couldn't find your booking information. Please check your email for confirmation.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Home className="h-4 w-4 inline mr-1" />
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-background rounded-xl shadow-lg overflow-hidden">
          <div className="bg-background-secondary p-8 text-center">
            <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Successful!</h2>
            <p className="text-text-secondary">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-8 border-t border-border">
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-background-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    <Ticket className="h-5 w-5 mr-2 text-primary" />
                    Booking Confirmed
                  </h3>
                  <span className="text-sm bg-background-secondary text-primary px-3 py-1 rounded-full font-medium">
                    {booking.bookingReference}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-text-tertiary" />
                    <span>{formatLocation(booking.route?.from)} → {formatLocation(booking.route?.to)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-text-tertiary" />
                    <span>{formatDate(booking.route?.departureTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-text-tertiary" />
                    <span>{booking.bookingQuantity || booking.passengers?.length || 1} passenger(s)</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between items-center font-semibold text-text-primary">
                    <span>Total Paid</span>
                    <span className="text-xl text-success">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-background-secondary rounded-lg p-6">
                <h4 className="font-semibold text-text-primary mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  What happens next?
                </h4>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start">
                    <span className="text-success mr-2 mt-0.5">•</span>
                    <span>A confirmation email has been sent to your email address</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2 mt-0.5">•</span>
                    <span>Your e-ticket will be available in your account within 15 minutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-success mr-2 mt-0.5">•</span>
                    <span>Show this confirmation at the terminal for boarding</span>
                  </li>
                </ul>
              </div>

              {/* Important Notice */}
              <div className="bg-background-tertiary border border-border rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text-primary mb-1">
                      Important: Complete Your Booking
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Your payment has been processed successfully. To finalize your booking and receive your e-ticket,
                      please click the <strong className="text-text-primary">Checkout</strong> button below. Your booking will not be complete until you do so.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={async () => {
                    await updatePaymentStatus();
                    navigate('/dashboard/bookings');
                  }}
                  className="flex-1 px-4 py-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center font-semibold"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Checkout & Get E-Ticket
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-text-tertiary">
          <p>Need help? Contact our support team at support@ticketbari.com or call +880 1234 567890</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;