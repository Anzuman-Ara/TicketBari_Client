import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Clock } from 'lucide-react';
import { useQuery } from 'react-query';

const SearchBar = ({ 
  onSearch, 
  initialSearch = '', 
  initialFrom = '', 
  initialTo = '',
  placeholder = 'Search tickets, routes, operators...',
  showAdvanced = true,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [fromLocation, setFromLocation] = useState(initialFrom);
  const [toLocation, setToLocation] = useState(initialTo);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
   
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  // Fetch search suggestions
  const { data: suggestions, isLoading } = useQuery(
    ['searchSuggestions', searchQuery, fromLocation, toLocation],
    () => fetchSuggestions(searchQuery || fromLocation || toLocation),
    {
      enabled: (searchQuery || fromLocation || toLocation).length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || fromLocation || toLocation) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fromLocation, toLocation]);
  
  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('ticketbari_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `/api/tickets/suggestions?query=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
    return { from: [], to: [], operators: [] };
  };

  const performSearch = () => {
    const searchData = {
      search: searchQuery.trim(),
      from: fromLocation.trim(),
      to: toLocation.trim()
    };

    // Add to search history
    const historyItem = {
      search: searchQuery,
      from: fromLocation,
      to: toLocation,
      timestamp: Date.now()
    };

    const updatedHistory = [
      historyItem,
      ...searchHistory.filter(item => 
        !(item.search === historyItem.search && 
          item.from === historyItem.from && 
          item.to === historyItem.to)
      )
    ].slice(0, 5);

    setSearchHistory(updatedHistory);
    localStorage.setItem('ticketbari_search_history', JSON.stringify(updatedHistory));

    onSearch(searchData);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFromLocation('');
    setToLocation('');
    onSearch({ search: '', from: '', to: '' });
  };

  const useHistoryItem = (item) => {
    setSearchQuery(item.search || '');
    setFromLocation(item.from || '');
    setToLocation(item.to || '');
    onSearch({
      search: item.search || '',
      from: item.from || '',
      to: item.to || ''
    });
    setShowSuggestions(false);
  };

  const handleInputFocus = (field) => {
    setActiveField(field);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion, type) => {
    if (type === 'from') {
      setFromLocation(suggestion);
    } else if (type === 'to') {
      setToLocation(suggestion);
    }
    setShowSuggestions(false);
  };

  const renderSuggestions = () => {
    if (!showSuggestions || (!suggestions && searchHistory.length === 0)) return null;

    return (
      <div className="absolute z-50 w-full mt-1 bg-surface border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
        {/* Search History */}
        {searchHistory.length > 0 && activeField === 'search' && (
          <div className="p-3 border-b border-background-tertiary">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-text-tertiary" />
              <span className="text-sm text-text-tertiary font-medium">Recent Searches</span>
            </div>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => useHistoryItem(item)}
                className="w-full text-left p-2 hover:bg-background-secondary rounded text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-3 w-3 text-text-tertiary" />
                  <span>{item.search || `${item.from} → ${item.to}`}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search Suggestions */}
        {suggestions && (
          <>
            {suggestions.from?.length > 0 && (
              <div className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm text-text-tertiary font-medium">From</span>
                </div>
                {suggestions.from.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(city, 'from')}
                    className="w-full text-left p-2 hover:bg-background-secondary rounded text-sm"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            {suggestions.to?.length > 0 && (
              <div className="p-3 border-t border-background-tertiary">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-success" />
                  <span className="text-sm text-text-tertiary font-medium">To</span>
                </div>
                {suggestions.to.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(city, 'to')}
                    className="w-full text-left p-2 hover:bg-background-secondary rounded text-sm"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            {suggestions.operators?.length > 0 && (
              <div className="p-3 border-t border-background-tertiary">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="h-4 w-4 text-info" />
                  <span className="text-sm text-text-tertiary font-medium">Operators</span>
                </div>
                {suggestions.operators.map((operator, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(operator)}
                    className="w-full text-left p-2 hover:bg-background-secondary rounded text-sm"
                  >
                    {operator}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="p-3 text-center">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={searchBarRef} className={`bg-surface border border-gray-200 rounded-lg shadow-md p-4 ${className}`}>
      {/* Main Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => handleInputFocus('search')}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-surface border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {renderSuggestions()}
      </div>

      {/* Advanced Search Fields */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary mb-1">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <input
                ref={fromInputRef}
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                onFocus={() => handleInputFocus('from')}
                placeholder="Departure city"
                className="w-full pl-10 pr-4 py-2 bg-surface border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* To Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-text-primary mb-1">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <input
                ref={toInputRef}
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                onFocus={() => handleInputFocus('to')}
                placeholder="Destination city"
                className="w-full pl-10 pr-4 py-2 bg-surface border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Clear Search Button */}
      {(searchQuery || fromLocation || toLocation) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearSearch}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-gray-200 rounded-lg hover:bg-background-secondary transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;