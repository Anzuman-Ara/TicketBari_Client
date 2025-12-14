import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  DollarSign,
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { format, parseISO } from 'date-fns';

const TransactionHistory = () => {
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const { data: transactionsData, isLoading, error, refetch } = useQuery(
    ['userTransactions', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/users/transactions?${params}`);
      return response.data;
    }
  );

  const handleFilterSubmit = (data) => {
    setFilters({
      ...filters,
      ...data,
      page: 1 // Reset to first page when applying filters
    });
    refetch();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      page: 1
    };
    setFilters(clearedFilters);
    reset();
    refetch();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/users/transactions/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Transaction history exported successfully!');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    refetch();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM dd, yyyy • hh:mm a');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-tertiary rounded w-1/4"></div>
          <div className="bg-surface rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-background-tertiary rounded"></div>
              ))}
            </div>
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
            <p className="text-danger">Failed to load transaction history</p>
          </div>
        </div>
      </div>
    );
  }

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination || { page: 1, pages: 1, total: 0 };

  // Calculate summary stats
  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'processing').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Transaction History</h1>
        <p className="text-text-secondary mt-2">View and manage your payment history</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-primary mr-3" />
            <div>
              <div className="text-2xl font-bold text-primary">{pagination.total}</div>
              <div className="text-text-secondary">Total Transactions</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-success mr-3" />
            <div>
              <div className="text-2xl font-bold text-success">{completedTransactions}</div>
              <div className="text-text-secondary">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-warning mr-3" />
            <div>
              <div className="text-2xl font-bold text-warning">{pendingTransactions}</div>
              <div className="text-text-secondary">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-info mr-3" />
            <div>
              <div className="text-2xl font-bold text-info">{formatCurrency(totalAmount)}</div>
              <div className="text-text-secondary">Total Amount</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-surface rounded-lg shadow-md mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Search & Filter</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background-secondary rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-3 py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by ticket title or booking reference..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <form onSubmit={handleSubmit(handleFilterSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" />
                    <input
                      type="date"
                      {...register('endDate')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Min Amount (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('minAmount')}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Max Amount (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('maxAmount')}
                    placeholder="9999.99"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background-secondary rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-text-primary">Transactions</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No transactions found</h3>
            <p className="text-text-tertiary">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-background-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Ticket Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-background-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">
                          {transaction.paymentGateway?.transactionId || 'N/A'}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {transaction.booking?.bookingReference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {transaction.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-primary">
                          {transaction.booking?.route?.title || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-primary">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-text-primary">
                      {transaction.paymentGateway?.transactionId || 'N/A'}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </span>
                  </div>
  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Amount:</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Ticket:</span>
                      <span className="text-sm text-text-primary">
                        {transaction.booking?.route?.title || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Date:</span>
                      <span className="text-sm text-text-primary">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Booking:</span>
                      <span className="text-sm text-text-tertiary">
                        {transaction.booking?.bookingReference}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm font-medium text-text-tertiary hover:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
  
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        pagination.page === i + 1
                          ? 'bg-primary text-white'
                          : 'text-text-tertiary hover:text-text-secondary hover:bg-background-secondary'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-text-tertiary hover:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;