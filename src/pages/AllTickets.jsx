import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Filter, Search, SlidersHorizontal, Grid, List, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../config/api';

// Components
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/filters/FilterPanel';
import SortControls from '../components/sort/SortControls';
import PaginationControls from '../components/pagination/PaginationControls';
import TicketCard from '../components/tickets/TicketCard';

const AllTickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState({
    search: searchParams.get('search') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || ''
  });

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  });

  const [sort, setSort] = useState({
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 9
  });

  // Fetch tickets with React Query
  const {
    data: ticketsData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery(
    ['allTickets', { ...searchQuery, ...filters, ...sort, ...pagination }],
    fetchTickets,
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  async function fetchTickets({ queryKey }) {
    const params = new URLSearchParams();
    
    // Add search parameters
    Object.entries(queryKey[1]).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await api.get(`/tickets?${params}`);
    return response.data;
  }

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    Object.entries(sort).forEach(([key, value]) => {
      if (value !== 'createdAt' && value !== 'desc') {
        params.append(key, value);
      }
    });
    
    if (pagination.page !== 1) params.append('page', pagination.page.toString());
    if (pagination.limit !== 9) params.append('limit', pagination.limit.toString());

    setSearchParams(params);
  }, [searchQuery, filters, sort, pagination, setSearchParams]);

  // Handle search
  const handleSearch = (searchData) => {
    setSearchQuery(searchData);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle sort changes
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Tickets refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh tickets');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle book ticket
  const handleBookTicket = (ticket) => {
    navigate(`/booking/${ticket._id}`);
  };

  // Handle empty state
  const hasActiveFilters = searchQuery.search || searchQuery.from || searchQuery.to || 
                          filters.type || filters.minPrice || filters.maxPrice;

  const renderEmptyState = () => {
    if (!isLoading && ticketsData?.data?.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mb-4">
            <Search className="h-16 w-16 text-text-tertiary mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No tickets found</h3>
          <p className="text-text-secondary mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or filters'
              : 'No tickets are currently available'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery({ search: '', from: '', to: '' });
                setFilters({});
                setSort({ sortBy: 'createdAt', sortOrder: 'desc' });
                setPagination({ page: 1, limit: 9 });
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  const renderLoadingState = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-background-tertiary animate-pulse"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-background-tertiary rounded animate-pulse"></div>
                <div className="h-4 bg-background-tertiary rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-background-tertiary rounded animate-pulse w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-background-tertiary rounded animate-pulse w-20"></div>
                  <div className="h-8 bg-background-tertiary rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">All Tickets</h1>
          <p className="text-text-secondary">
            Find and book tickets for buses, trains, flights, and more
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            initialSearch={searchQuery.search}
            initialFrom={searchQuery.from}
            initialTo={searchQuery.to}
          />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Left side - Filter toggle and view controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background-secondary transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-background-secondary text-primary text-xs font-medium px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2 bg-surface border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-secondary'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-secondary'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right side - Sort and refresh */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Filters and Sort */}
          <div className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SortControls
              onSortChange={handleSortChange}
              initialSort={sort}
            />
            <FilterPanel
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            {ticketsData && (
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-text-secondary">
                  {isFetching ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </span>
                  ) : (
                    <span>
                      Showing {ticketsData.pagination.currentPage * ticketsData.pagination.itemsPerPage - ticketsData.pagination.itemsPerPage + 1}-
                      {Math.min(ticketsData.pagination.currentPage * ticketsData.pagination.itemsPerPage, ticketsData.pagination.totalItems)} of {ticketsData.pagination.totalItems} tickets
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-background-secondary border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-danger" />
                  <span className="text-danger font-medium">Error loading tickets</span>
                </div>
                <p className="text-danger mt-1">{error.message}</p>
              </div>
            )}

            {/* Tickets Grid/List */}
            {renderLoadingState()}
            
            {!isLoading && ticketsData?.data?.length > 0 && (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }`}>
                {ticketsData.data.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onBook={handleBookTicket}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {renderEmptyState()}

            {/* Pagination */}
            {ticketsData?.pagination && ticketsData.pagination.totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls
                  pagination={ticketsData.pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTickets;