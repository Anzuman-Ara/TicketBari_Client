import React, { useState, useEffect } from 'react';
import { Filter, X, Check, RotateCcw } from 'lucide-react';
import { useQuery } from 'react-query';
import api from '../../config/api';

const FilterPanel = ({ 
  onFilterChange, 
  initialFilters = {}, 
  className = '' 
}) => {
  const [selectedTypes, setSelectedTypes] = useState(initialFilters.type ? initialFilters.type.split(',') : []);
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.minPrice || '',
    max: initialFilters.maxPrice || ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch transport types with counts
  const { data: transportTypes, isLoading } = useQuery(
    'transportTypes',
    async () => {
      const response = await api.get('/tickets/types');
      return response.data.data;
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const transportTypeIcons = {
    bus: '🚌',
    train: '🚆',
    flight: '✈️',
    launch: '🚢',
    ferry: '⛴️'
  };

  const handleTypeChange = (type) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    
    const filters = {
      ...priceRange,
      type: newSelectedTypes.join(',')
    };
    
    // Remove empty values
    Object.keys(filters).forEach(key => {
      if (!filters[key]) {
        delete filters[key];
      }
    });
    
    onFilterChange(filters);
  };

  const handlePriceChange = (field, value) => {
    const newPriceRange = {
      ...priceRange,
      [field]: value
    };
    setPriceRange(newPriceRange);
    
    // Debounce price updates
    setTimeout(() => {
      const filters = {
        ...newPriceRange,
        type: selectedTypes.join(',')
      };
      
      // Remove empty values
      Object.keys(filters).forEach(key => {
        if (!filters[key]) {
          delete filters[key];
        }
      });
      
      onFilterChange(filters);
    }, 500);
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setPriceRange({ min: '', max: '' });
    onFilterChange({});
  };

  const hasActiveFilters = selectedTypes.length > 0 || priceRange.min || priceRange.max;

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedTypes.length > 0) count++;
    if (priceRange.min) count++;
    if (priceRange.max) count++;
    return count;
  };

  return (
    <div className={`bg-surface rounded-lg shadow-md ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-text-secondary" />
            <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
            {hasActiveFilters && (
              <span className="bg-background-secondary text-primary text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-1 text-sm text-text-secondary hover:text-text-primary"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden text-text-secondary hover:text-text-primary"
            >
              {isExpanded ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block p-4 space-y-6`}>
        {/* Transport Types Filter */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Transport Type</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-background-tertiary rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {transportTypes?.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => handleTypeChange(type.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedTypes.includes(type.value)
                        ? 'bg-primary border-primary'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {selectedTypes.includes(type.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{transportTypeIcons[type.value]}</span>
                      <span className="text-sm font-medium text-text-primary">{type.label}</span>
                    </div>
                    <div className="text-xs text-text-tertiary">
                      <span className="bg-background-secondary px-2 py-1 rounded-full">
                        {type.count}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Price Range (BDT)</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Minimum Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                placeholder="Min price"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Maximum Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                placeholder="Max price"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-text-primary mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map(type => (
                <span
                  key={type}
                  className="inline-flex items-center space-x-1 bg-background-secondary text-primary text-xs font-medium px-2 py-1 rounded-full"
                >
                  <span>{transportTypeIcons[type]}</span>
                  <span>{transportTypes?.find(t => t.value === type)?.label}</span>
                  <button
                    onClick={() => handleTypeChange(type)}
                    className="hover:bg-background-tertiary rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {priceRange.min && (
                <span className="inline-flex items-center space-x-1 bg-background-secondary text-success text-xs font-medium px-2 py-1 rounded-full">
                  <span>Min: ৳{priceRange.min}</span>
                  <button
                    onClick={() => handlePriceChange('min', '')}
                    className="hover:bg-background-tertiary rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center space-x-1 bg-background-secondary text-success text-xs font-medium px-2 py-1 rounded-full">
                  <span>Max: ৳{priceRange.max}</span>
                  <button
                    onClick={() => handlePriceChange('max', '')}
                    className="hover:bg-background-tertiary rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;