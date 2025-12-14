import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock, Info, Loader } from 'lucide-react';
import { api } from '../../config/api';

const BookingModal = ({ isOpen, onClose, ticket, onBookingSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  });

  useEffect(() => {
    if (isOpen && ticket) {
      setQuantity(1);
      setError(null);
      setSuccess(false);
      setBookingData(null);
    }
  }, [isOpen, ticket]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (ticket?.availableQuantity || 1)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (ticket?.availableQuantity || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Booking request data:', {
        routeId: ticket._id,
        quantity: quantity,
        selectedDate: selectedDate,
        ticketData: ticket,
        ticketIdType: typeof ticket._id
      });

      const response = await api.post('/bookings', {
        routeId: ticket._id,
        quantity: quantity,
        bookingDate: selectedDate.toISOString()
      });

      setBookingData(response.data.data);
      setSuccess(true);

      // Wait 2 seconds before closing to show success message
      setTimeout(() => {
        onBookingSuccess(response.data.data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Booking error:', {
        response: err.response?.data,
        message: err.message,
        status: err.response?.status,
        fullError: err
      });
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !ticket) return null;

  const totalPrice = ticket?.pricing?.baseFare * quantity || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 mt-20">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Confirm Your Booking</h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Ticket Info */}
          <div className="bg-background-secondary rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text-primary">Route</span>
              <span className="text-sm font-medium text-primary bg-background-secondary px-2 py-1 rounded">
                {ticket.type} • {ticket.class}
              </span>
            </div>
            <div className="text-lg font-semibold text-text-primary mb-1">
              {typeof ticket.from?.city === 'string' ? ticket.from?.city : 'Departure'} → {typeof ticket.to?.city === 'string' ? ticket.to?.city : 'Arrival'}
            </div>
            <div className="text-sm text-text-secondary">
              {typeof ticket.operator?.name === 'string' ? ticket.operator?.name : 'Operator'} • {ticket.schedule?.[0]?.departureTime} - {ticket.schedule?.[0]?.arrivalTime}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">Number of Tickets</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isSubmitting}
                className="w-10 h-10 flex items-center justify-center bg-background-tertiary border border-border rounded-lg hover:bg-background-secondary disabled:opacity-50 transition-colors"
              >
                <span className="text-lg font-semibold">-</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={ticket.availableQuantity}
                className="w-16 text-center border border-border rounded-lg px-3 py-2 text-lg font-semibold text-text-primary"
                disabled={isSubmitting}
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= ticket.availableQuantity || isSubmitting}
                className="w-10 h-10 flex items-center justify-center bg-background-tertiary border border-border rounded-lg hover:bg-background-secondary disabled:opacity-50 transition-colors"
              >
                <span className="text-lg font-semibold">+</span>
              </button>
            </div>
            <div className="text-sm text-text-tertiary mt-1">
              Available: {ticket.availableQuantity} tickets
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">Travel Date</label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full border border-border rounded-lg px-3 py-2 text-text-primary"
              disabled={isSubmitting}
            />
            <div className="text-sm text-text-tertiary mt-1">
              Select a date within the next 7 days
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-background-secondary rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Base Price</span>
                <span className="font-semibold text-text-primary">
                  ৳{ticket.pricing?.baseFare?.toLocaleString()} × {quantity}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-primary">৳{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-background-secondary border border-border rounded-lg p-3 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-danger mr-2" />
              <span className="text-danger text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-background-secondary border border-border rounded-lg p-3 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-success mr-2" />
              <span className="text-success text-sm">
                Booking successful! Reference: {typeof bookingData?.bookingReference === 'string' ? bookingData?.bookingReference : 'N/A'}
              </span>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-background-secondary border border-border rounded-lg p-3 mb-6 flex items-center">
            <Info className="h-5 w-5 text-info mr-2" />
            <span className="text-info text-sm">
              Your booking will be created with "Pending" status and will appear in your "My Bookings" page.
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-text-inverse font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Clock className="h-5 w-5" />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;