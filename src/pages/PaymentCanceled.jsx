import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home, Ticket, MapPin, Calendar, Users } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const PaymentCanceled = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Cancelled Card */}
        <div className="bg-background rounded-xl shadow-lg overflow-hidden">
          <div className="bg-background-secondary p-8 text-center">
            <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-danger" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Canceled</h2>
            <p className="text-text-secondary">
              Your payment was not completed. You can try again or choose another payment method.
            </p>
          </div>

          {booking && (
            <div className="p-8 border-t border-border">
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-background-secondary rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center">
                      <Ticket className="h-5 w-5 mr-2 text-primary" />
                      Your Booking
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
                      <span>Amount to Pay</span>
                      <span className="text-xl text-primary">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/booking-details/${booking._id}`)}
                    className="flex-1 px-4 py-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Try Payment Again
                  </button>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex-1 px-4 py-3 bg-background-tertiary text-text-primary rounded-lg hover:bg-background-secondary transition-colors flex items-center justify-center"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    View My Bookings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-text-tertiary">
          <p>Need help with your payment? Contact our support team at support@ticketbari.com or call +880 1234 567890</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled;