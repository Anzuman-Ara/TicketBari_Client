import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

const SortControls = ({ 
  onSortChange, 
  initialSort = { sortBy: 'createdAt', sortOrder: 'desc' },
  className = '' 
}) => {
  const [sortBy, setSortBy] = useState(initialSort.sortBy);
  const [sortOrder, setSortOrder] = useState(initialSort.sortOrder);

  const sortOptions = [
    {
      value: 'createdAt',
      label: 'Recently Added',
      icon: <ArrowUpDown className="h-4 w-4" />
    },
    {
      value: 'price',
      label: 'Price',
      icon: sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
    },
    {
      value: 'rating',
      label: 'Rating',
      icon: sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
    },
    {
      value: 'departureTime',
      label: 'Departure Time',
      icon: sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
    }
  ];

  const handleSortChange = (newSortBy) => {
    let newSortOrder = sortOrder;
    
    // If clicking the same sort option, toggle order
    if (sortBy === newSortBy) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // If changing sort option, default to ascending for price, descending for others
      newSortBy === 'price' ? 'asc' : 'desc';
      newSortOrder = newSortBy === 'price' ? 'asc' : 'desc';
    }

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const clearSort = () => {
    const defaultSort = { sortBy: 'createdAt', sortOrder: 'desc' };
    setSortBy(defaultSort.sortBy);
    setSortOrder(defaultSort.sortOrder);
    onSortChange(defaultSort);
  };

  const getSortDisplayText = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    if (!option) return 'Sort by';
    
    if (sortBy === 'price' || sortBy === 'rating' || sortBy === 'departureTime') {
      return `${option.label} (${sortOrder === 'asc' ? 'Low to High' : 'High to Low'})`;
    }
    return option.label;
  };

  const isActive = sortBy !== 'createdAt' || sortOrder !== 'desc';

  return (
    <div className={`bg-surface rounded-lg shadow-md ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5" />
            <span>Sort By</span>
          </h3>
          {isActive && (
            <button
              onClick={clearSort}
              className="flex items-center space-x-1 text-sm text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Current Sort Display */}
        <div className="mb-4 p-3 bg-background-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary">Current:</span>
            <span className="text-sm text-primary">{getSortDisplayText()}</span>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          {sortOptions.map((option) => {
            const isSelected = sortBy === option.value;
            const showOrderIcon = isSelected && (sortBy === 'price' || sortBy === 'rating' || sortBy === 'departureTime');
            
            return (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                 isSelected
                   ? 'bg-background-secondary border-2 border-primary text-primary'
                   : 'bg-background-tertiary border-2 border-transparent text-text-primary hover:bg-background-secondary'
               }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isSelected ? 'text-primary' : 'text-text-tertiary'}>
                    {option.icon}
                  </span>
                  <span className="font-medium">{option.label}</span>
                </div>
                
                {showOrderIcon && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-background-secondary text-primary px-2 py-1 rounded-full">
                      {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort Instructions */}
        <div className="mt-4 p-3 bg-background-secondary rounded-lg">
          <p className="text-xs text-text-secondary">
            <strong>Tip:</strong> Click the same option to toggle between ascending and descending order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SortControls;