import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { MapPin, Clock, Star, Users, Wifi, Snowflake, UtensilsCrossed, Car, ArrowLeft, Calendar, DollarSign, ShieldCheck, Info, AlertCircle } from 'lucide-react';
import BookingModal from '../components/tickets/BookingModal';

// Countdown Timer Component
const CountdownTimer = ({ departureTime }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  // Parse the departure time using the same logic as isDeparturePassed
  const parseDepartureTime = (timeString) => {
    if (!timeString) return null;

    // Try ISO format first (full datetime from backend)
    if (timeString.includes('T')) {
      return new Date(timeString);
    }
    // Try date+time format (e.g., "2023-12-10 14:30:00")
    else if (timeString.includes(' ') && timeString.includes('-')) {
      const [datePart, timePart] = timeString.split(' ');
      if (datePart && timePart) {
        const [year, month, day] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(year, month - 1, day, hours, minutes, seconds || 0);
      }
    }
    // Handle time-only format (e.g., "08:00") - assume today/tomorrow based on current time
    else if (timeString.includes(':')) {
      const now = new Date();
      const [hours, minutes] = timeString.split(':');
      const departureHours = parseInt(hours);
      const departureMinutes = parseInt(minutes || 0);

      // Create a date object for the departure time
      const departureDate = new Date();

      // If the departure time is earlier than current time, assume it's for tomorrow
      if (departureHours < now.getHours() ||
          (departureHours === now.getHours() && departureMinutes < now.getMinutes())) {
        departureDate.setDate(departureDate.getDate() + 1);
      }

      departureDate.setHours(departureHours, departureMinutes, 0, 0);
      return departureDate;
    }
    // Fallback to direct parsing
    else {
      return new Date(timeString);
    }
  };

  useEffect(() => {
    const parsedTime = parseDepartureTime(departureTime);
    if (!parsedTime || isNaN(parsedTime.getTime())) {
      setExpired(true);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = parsedTime.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [departureTime]);

  if (expired) {
    return (
      <div className="text-danger text-sm flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        <span>Departure time has passed</span>
      </div>
    );
  }

  return (
    <div className="text-sm text-text-secondary flex items-center">
      <Clock className="h-4 w-4 mr-1" />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s until departure
      </span>
    </div>
  );
};

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/routes/${id}`);
        console.log('Ticket data received:', response.data.data);
        setTicket(response.data.data);
      } catch (err) {
        setError('Failed to load ticket details');
        console.error('Error fetching ticket:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

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

  const handleBookNow = () => {
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingData) => {
    setBookingSuccess(true);
    // Refresh bookings or show notification
    console.log('Booking successful:', bookingData);
  };

  const isDeparturePassed = () => {
    if (!ticket?.schedule?.[0]?.departureTime) return false;
    
    // Try to parse the departure time - handle different formats
    let departureTime;
    const rawTime = ticket.schedule[0].departureTime;
  
    try {
      // Try ISO format first (full datetime from backend)
      if (rawTime.includes('T')) {
        departureTime = new Date(rawTime);
      }
      // Try date+time format (e.g., "2023-12-10 14:30:00")
      else if (rawTime.includes(' ') && rawTime.includes('-')) {
        const [datePart, timePart] = rawTime.split(' ');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-');
          const [hours, minutes, seconds] = timePart.split(':');
          departureTime = new Date(year, month - 1, day, hours, minutes, seconds || 0);
        }
      }
      // Handle time-only format (e.g., "08:00") - assume today/tomorrow based on current time
      else if (rawTime.includes(':')) {
        const now = new Date();
        const [hours, minutes] = rawTime.split(':');
        const departureHours = parseInt(hours);
        const departureMinutes = parseInt(minutes || 0);
  
        // Create a date object for the departure time
        departureTime = new Date();
  
        // If the departure time is earlier than current time, assume it's for tomorrow
        if (departureHours < now.getHours() ||
            (departureHours === now.getHours() && departureMinutes < now.getMinutes())) {
          departureTime.setDate(departureTime.getDate() + 1);
        }
  
        departureTime.setHours(departureHours, departureMinutes, 0, 0);
      }
      // Fallback to direct parsing
      else {
        departureTime = new Date(rawTime);
      }
    } catch (error) {
      console.error('Error parsing departure time:', error);
      // If parsing fails, consider it as passed to disable booking
      return true;
    }
    
    const now = new Date();
    const result = departureTime <= now;
    
    console.log('Departure time check:', {
      rawDepartureTime: rawTime,
      parsedDepartureTime: isNaN(departureTime.getTime()) ? 'Invalid Date' : departureTime.toISOString(),
      now: now.toISOString(),
      isValidDate: !isNaN(departureTime.getTime()),
      result: result
    });
    
    // Return true if departure time is invalid (can't parse) or if it's in the past
    return isNaN(departureTime.getTime()) || result;
  };

  const isBookNowDisabled = () => {
    const disabled = (
      !ticket ||
      ticket.availableQuantity <= 0 ||
      isDeparturePassed() ||
      quantity > ticket.availableQuantity
    );
    console.log('Book Now disabled check:', {
      noTicket: !ticket,
      noQuantity: ticket?.availableQuantity <= 0,
      departurePassed: isDeparturePassed(),
      quantityExceeds: quantity > ticket?.availableQuantity,
      finalResult: disabled
    });
    return disabled;
  };

  const getDisabledReason = () => {
    if (!ticket) return "Loading ticket information...";
    if (ticket.availableQuantity <= 0) return "No tickets available";
    if (isDeparturePassed()) return "Departure time has passed";
    if (quantity > ticket.availableQuantity) return "Quantity exceeds available tickets";
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-text-secondary">Loading ticket details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-background-secondary border border-danger rounded-lg p-6 text-center">
          <Info className="h-8 w-8 text-danger mx-auto mb-3" />
          <h3 className="text-lg font-medium text-danger mb-2">Error Loading Ticket</h3>
          <p className="text-danger">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-danger text-text-inverse rounded-lg hover:bg-danger-hover transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-background-secondary border border-warning rounded-lg p-6 text-center">
          <Info className="h-8 w-8 text-warning mx-auto mb-3" />
          <h3 className="text-lg font-medium text-warning mb-2">Ticket Not Found</h3>
          <p className="text-warning">The requested ticket does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-warning text-text-inverse rounded-lg hover:bg-warning-hover transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Format time display
  const formatTime = (time) => {
    return time || 'N/A';
  };

  // Format duration display
  const formatDuration = (duration) => {
    return duration || 'N/A';
  };

  // Get departure day label (Today/Tomorrow)
  const getDepartureDayLabel = () => {
    if (!ticket?.schedule?.[0]?.departureTime) return 'Today';

    const rawTime = ticket.schedule[0].departureTime;
    const now = new Date();

    // If it's already a full datetime, check if it's today or tomorrow
    if (rawTime.includes('T')) {
      const departureDate = new Date(rawTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (departureDate >= tomorrow) {
        return 'Tomorrow';
      } else {
        return 'Today';
      }
    }
    // If it's a time-only format, check if it's already passed today
    else if (rawTime.includes(':')) {
      const [hours, minutes] = rawTime.split(':');
      const departureHours = parseInt(hours);
      const departureMinutes = parseInt(minutes || 0);

      // If departure time has already passed today, it's for tomorrow
      if (departureHours < now.getHours() ||
          (departureHours === now.getHours() && departureMinutes < now.getMinutes())) {
        return 'Tomorrow';
      } else {
        return 'Today';
      }
    }

    // Default to Today
    return 'Today';
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

  // Get perk icons
  const getPerkIcon = (perk) => {
    const icons = {
      'AC': <Snowflake className="h-5 w-5 text-primary" />,
      'WiFi': <Wifi className="h-5 w-5 text-success" />,
      'Breakfast': <UtensilsCrossed className="h-5 w-5 text-warning" />,
      'USB Charging': <Car className="h-5 w-5 text-info" />,
      'Entertainment': <Star className="h-5 w-5 text-warning" />
    };
    return icons[perk] || <Star className="h-5 w-5 text-text-tertiary" />;
  };

  // Calculate total price
  const totalPrice = ticket?.pricing?.baseFare * quantity || 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-primary hover:text-primary-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to previous page
        </button>

        <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
          {/* Ticket Header with Image */}
          {ticket.imageUrl && !imageError && (
            <div className="h-64 md:h-80 bg-background-secondary overflow-hidden">
              <img
                src={ticket.imageUrl}
                alt={`${ticket.from?.city} to ${ticket.to?.city}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  setImageError(true);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Ticket Title and Basic Info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getTransportIcon(ticket.type)}</span>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                      {ticket.from?.city} → {ticket.to?.city}
                    </h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-medium text-text-secondary">{ticket.operator?.name}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium uppercase bg-background-secondary text-primary">
                        {ticket.type}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium uppercase bg-background-secondary text-success">
                        {ticket.class}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {ticket.rating?.average > 0 && (
                  <div className="flex items-center space-x-2 bg-background-secondary px-3 py-2 rounded-lg">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => {
                        const fill = i < Math.floor(ticket.rating.average) ? 'fill-warning' :
                                      i < ticket.rating.average ? 'fill-warning' : 'text-text-tertiary';
                        return <Star key={i} className={`h-4 w-4 ${fill} text-warning`} />;
                      })}
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {ticket.rating.average.toFixed(1)} ({ticket.rating.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Route Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Departure Info */}
              <div className="bg-background-secondary rounded-lg p-4">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                  <MapPin className="h-5 w-5 text-danger mr-2" />
                  Departure
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">{getDepartureDayLabel()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">
                      {formatTime(ticket.schedule?.[0]?.departureTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">
                      {ticket.from?.terminal?.name || 'Main Terminal'}
                    </span>
                  </div>
                  {/* Countdown Timer */}
                  {ticket.schedule?.[0]?.departureTime && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <CountdownTimer departureTime={ticket.schedule[0].departureTime} />
                    </div>
                  )}
                </div>
              </div>

              {/* Arrival Info */}
              <div className="bg-background-secondary rounded-lg p-4">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                  <MapPin className="h-5 w-5 text-success mr-2" />
                  Arrival
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">{getDepartureDayLabel()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">
                      {formatTime(ticket.schedule?.[0]?.arrivalTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">
                      {ticket.to?.terminal?.name || 'Main Terminal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Info */}
            <div className="bg-background-secondary rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                <Clock className="h-5 w-5 text-info mr-2" />
                Journey Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">Duration:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-text-tertiary" />
                    <span className="text-sm text-text-secondary">Available Seats:</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-text-primary">
                    {formatDuration(ticket.schedule?.[0]?.duration)}
                  </div>
                  <div className="text-sm font-medium text-text-primary">
                    {ticket.availableQuantity} seats
                  </div>
                </div>
              </div>
            </div>

            {/* Perks Section */}
            {ticket.perks && ticket.perks.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                  <Star className="h-5 w-5 text-warning mr-2" />
                  Included Perks
                </h3>
                <div className="flex flex-wrap gap-3">
                  {ticket.perks.map((perk, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-surface border border-border rounded-lg px-3 py-2"
                    >
                      {getPerkIcon(perk)}
                      <span className="text-sm text-text-primary">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {ticket.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                  <Info className="h-5 w-5 text-primary mr-2" />
                  Description
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {ticket.description}
                </p>
              </div>
            )}

            {/* Booking Section */}
            <div className="bg-background-secondary rounded-lg p-6">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                Booking Information
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Base Price:</span>
                  <span className="text-lg font-bold text-text-primary">
                    ৳{ticket.pricing?.baseFare?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg hover:bg-background-secondary disabled:opacity-50 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={ticket.availableQuantity}
                      className="w-12 text-center border border-border rounded-lg px-2 py-1 text-sm"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= ticket.availableQuantity}
                      className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg hover:bg-background-secondary disabled:opacity-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-lg font-semibold text-text-primary">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">
                    ৳{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={isBookNowDisabled()}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  isBookNowDisabled()
                    ? 'bg-background-secondary text-text-tertiary cursor-not-allowed pointer-events-none'
                    : 'bg-primary hover:bg-primary-hover text-text-inverse'
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Book Now</span>
              </button>

              {isBookNowDisabled() && (
                <p className="text-sm text-danger text-center mt-3 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getDisabledReason()}
                </p>
              )}

              <p className="text-xs text-text-tertiary text-center mt-3">
                Secure booking • Instant confirmation • 24/7 customer support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        ticket={ticket}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Countdown Timer in Journey Info */}
      {ticket.schedule?.[0]?.departureTime && (
        <div className="mt-4">
          <CountdownTimer departureTime={ticket.schedule[0].departureTime} />
        </div>
      )}
    </div>
  );
};

export default TicketDetails;