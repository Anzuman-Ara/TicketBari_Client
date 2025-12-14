import React from 'react';
import { Calendar, Clock, MapPin, Star, Users, Wifi, Snowflake, UtensilsCrossed, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TicketCard = ({ ticket, onBook }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const {
    _id,
    from,
    to,
    type,
    class: travelClass,
    operator,
    schedule,
    pricing,
    capacity,
    rating,
    perks = [],
    availableQuantity,
    imageUrl,
    description
  } = ticket;

  const transportTypeIcons = {
    bus: '🚌',
    train: '🚆',
    flight: '✈️',
    launch: '🚢',
    ferry: '⛴️'
  };

  const perkIcons = {
      'AC': <Snowflake className="h-4 w-4 text-primary" />,
      'WiFi': <Wifi className="h-4 w-4 text-success" />,
      'Breakfast': <UtensilsCrossed className="h-4 w-4 text-warning" />,
      'USB Charging': <Car className="h-4 w-4 text-info" />,
      'Entertainment': <Star className="h-4 w-4 text-warning" />
    };

  const navigate = useNavigate();

  const formatTime = (time) => {
    return time || 'N/A';
  };

  const formatDuration = (duration) => {
    return duration || 'N/A';
  };

  const getTypeColor = (type) => {
      const colors = {
        bus: 'bg-background-secondary text-text-primary',
        train: 'bg-background-secondary text-text-primary',
        flight: 'bg-background-secondary text-text-primary',
        launch: 'bg-background-secondary text-text-primary',
        ferry: 'bg-background-secondary text-text-primary'
      };
      return colors[type] || 'bg-background-secondary text-text-primary';
    };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-warning text-warning" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-warning text-warning" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-text-tertiary" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Image with fallback */}
      <div className="h-48 bg-gradient-primary relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${from.city} to ${to.city} by ${operator.name}`}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl">{transportTypeIcons[type] || '🚗'}</div>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getTypeColor(type)}`}>
            {type}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Ticket Title */}
        <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center space-x-2">
          <span className="text-xl">{transportTypeIcons[type] || '🚗'}</span>
          <span>{from.city} → {to.city}</span>
        </h3>

        {/* Operator and Class */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-text-primary">{operator.name}</p>
          <span className="text-xs bg-background-secondary text-text-primary px-2 py-1 rounded-full font-medium">
            {travelClass}
          </span>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mb-3 bg-background-secondary rounded-lg p-3">
          <div>
            <div className="text-xl font-bold text-primary">
              ৳{pricing.baseFare.toLocaleString()}
            </div>
            <div className="text-xs text-text-tertiary">per person</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-text-primary">{availableQuantity} available</div>
            <div className="text-xs text-text-tertiary">seats</div>
          </div>
        </div>

        {/* Departure Date & Time */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
            <Calendar className="h-4 w-4 text-text-tertiary" />
            <span className="font-medium">Departure:</span>
            <span>{schedule?.[0]?.departureTime || 'N/A'}</span>
          </div>
        </div>

        {/* Perks */}
        {perks.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {perks.slice(0, 5).map((perk, index) => (
                <div
                   key={index}
                   className="flex items-center space-x-1 bg-background-tertiary rounded-full px-2 py-1 text-xs"
                   title={perk}
                 >
                   {perkIcons[perk] || <Star className="h-3 w-3 text-text-tertiary" />}
                   <span className="text-text-primary">{perk}</span>
                 </div>
              ))}
              {perks.length > 5 && (
                <div className="bg-background-tertiary rounded-full px-2 py-1 text-xs">
                   <span className="text-text-secondary">+{perks.length - 5} more</span>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {rating.average > 0 && (
          <div className="flex items-center justify-center space-x-1 mb-4">
            <div className="flex">
              {renderStars(rating.average)}
            </div>
            <span className="text-xs text-text-secondary font-medium">
               {rating.average.toFixed(1)} ({rating.totalReviews} reviews)
             </span>
          </div>
        )}

        {/* See Details Button */}
        <button
           onClick={() => navigate(`/tickets/${ticket._id}`)}
           className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
         >
           <span>See Details</span>
         </button>
      </div>
    </div>
  );
};

export default TicketCard;