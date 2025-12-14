import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Ban,
  Play,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  User,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { api } from '../../config/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setActionReason('');
    setShowActionModal(true);
    setDropdownOpen(null);
  };

  const executeAction = async () => {
    setActionLoading(true);
    try {
      const endpoint = `/admin/users/${selectedUser._id}/${actionType}`;
      const data = actionType === 'suspend' || actionType === 'mark-fraud' 
        ? { suspensionReason: actionReason, fraudReason: actionReason }
        : {};

      await api.put(endpoint, data);

      // Refresh users
      await fetchUsers();

      // Close modal
      setShowActionModal(false);
      setSelectedUser(null);
      setActionReason('');
    } catch (error) {
      console.error(`Error ${actionType}:`, error);
      alert(`Failed to ${actionType} user. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-danger">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>;
      case 'vendor':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-primary">
          <UserCheck className="w-3 h-3 mr-1" />
          Vendor
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-text-secondary">
          <User className="w-3 h-3 mr-1" />
          User
        </span>;
    }
  };

  const getStatusBadge = (user) => {
    if (user.isFraud) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-danger">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Fraudulent
      </span>;
    }
    if (user.isSuspended) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-warning">
        <Ban className="w-3 h-3 mr-1" />
        Suspended
      </span>;
    }
    if (user.isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-success">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-text-secondary">
      <XCircle className="w-3 h-3 mr-1" />
      Inactive
    </span>;
  };

  const getProfileCompletion = (user) => {
    let completed = 0;
    let total = 6;

    if (user.name) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.photoURL) completed++;
    if (user.role) completed++;
    if (user.createdAt) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Manage Users</h1>
              <p className="text-text-secondary">Control user roles and account status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary">Search</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md pl-10"
                  placeholder="Search users..."
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="fraud">Fraudulent</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-text-inverse bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Profile Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Account Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-background-secondary">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=fff`}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text-primary">
                          {user.name}
                        </div>
                        <div className="text-sm text-text-tertiary flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-text-tertiary flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 progress-bar-container rounded-full h-2 mr-2">
                        <div
                          className="progress-bar h-2 rounded-full"
                          style={{ width: `${getProfileCompletion(user)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-text-tertiary">
                        {getProfileCompletion(user)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                    {user.lastLogin && (
                      <div className="text-xs text-text-tertiary mt-1">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                        className="text-text-tertiary hover:text-text-primary"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {dropdownOpen === user._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg z-10 border border-border">
                          <div className="py-1">
                            {/* Role Management */}
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleAction(user, 'make-admin')}
                                className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-background-tertiary"
                              >
                                <Shield className="w-4 h-4 mr-3" />
                                Make Admin
                              </button>
                            )}
                            {user.role !== 'vendor' && (
                              <button
                                onClick={() => handleAction(user, 'make-vendor')}
                                className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-background-tertiary"
                              >
                                <UserCheck className="w-4 h-4 mr-3" />
                                Make Vendor
                              </button>
                            )}
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleAction(user, 'remove-admin')}
                                className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-background-tertiary"
                              >
                                <ShieldCheck className="w-4 h-4 mr-3" />
                                Remove Admin
                              </button>
                            )}

                            <div className="border-t border-border"></div>

                            {/* Account Management */}
                            {!user.isSuspended && !user.isFraud && (
                              <button
                                onClick={() => handleAction(user, 'suspend')}
                                className="flex items-center w-full px-4 py-2 text-sm text-danger hover:bg-background-secondary"
                              >
                                <Ban className="w-4 h-4 mr-3" />
                                Suspend User
                              </button>
                            )}
                            {user.isSuspended && (
                              <button
                                onClick={() => handleAction(user, 'activate')}
                                className="flex items-center w-full px-4 py-2 text-sm text-success hover:bg-background-secondary"
                              >
                                <Play className="w-4 h-4 mr-3" />
                                Activate User
                              </button>
                            )}

                            {/* Fraud Management - Only for vendors */}
                            {user.role === 'vendor' && !user.isFraud && (
                              <button
                                onClick={() => handleAction(user, 'mark-fraud')}
                                className="flex items-center w-full px-4 py-2 text-sm text-danger hover:bg-background-secondary"
                              >
                                <AlertTriangle className="w-4 h-4 mr-3" />
                                Mark as Fraud
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-surface px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-background-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-primary bg-surface hover:bg-background-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-primary">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-surface text-sm font-medium text-text-tertiary hover:bg-background-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-background-secondary border-primary text-primary'
                            : 'bg-surface border-border text-text-tertiary hover:bg-background-secondary'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-surface text-sm font-medium text-text-tertiary hover:bg-background-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-overlay transition-opacity" onClick={() => setShowActionModal(false)}></div>
            <div className="inline-block align-middle bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    actionType === 'suspend' || actionType === 'mark-fraud'
                      ? 'bg-background-secondary'
                      : actionType === 'activate' || actionType === 'make-admin' || actionType === 'make-vendor'
                      ? 'bg-background-secondary'
                      : 'bg-background-secondary'
                  }`}>
                    {actionType === 'suspend' || actionType === 'mark-fraud' ? (
                      <AlertTriangle className="h-6 w-6 text-danger" />
                    ) : actionType === 'activate' || actionType === 'make-admin' || actionType === 'make-vendor' ? (
                      <CheckCircle className="h-6 w-6 text-success" />
                    ) : (
                      <Shield className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-text-primary">
                      {actionType === 'make-admin' && 'Make Admin'}
                      {actionType === 'make-vendor' && 'Make Vendor'}
                      {actionType === 'remove-admin' && 'Remove Admin'}
                      {actionType === 'suspend' && 'Suspend User'}
                      {actionType === 'activate' && 'Activate User'}
                      {actionType === 'mark-fraud' && 'Mark as Fraud'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-text-tertiary mb-4">
                        {actionType === 'make-admin' && `Are you sure you want to make ${selectedUser?.name} an admin?`}
                        {actionType === 'make-vendor' && `Are you sure you want to make ${selectedUser?.name} a vendor?`}
                        {actionType === 'remove-admin' && `Are you sure you want to remove admin privileges from ${selectedUser?.name}?`}
                        {actionType === 'suspend' && `Are you sure you want to suspend ${selectedUser?.name}'s account?`}
                        {actionType === 'activate' && `Are you sure you want to activate ${selectedUser?.name}'s account?`}
                        {actionType === 'mark-fraud' && `Are you sure you want to mark ${selectedUser?.name} as fraudulent? This action will hide all their tickets and reject pending bookings.`}
                      </p>

                      {(actionType === 'suspend' || actionType === 'mark-fraud') && (
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            {actionType === 'suspend' ? 'Reason for suspension (required)' : 'Reason for fraud mark (required)'}
                          </label>
                          <textarea
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            rows={3}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md"
                            placeholder={`Enter reason for ${actionType}...`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background-secondary px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={executeAction}
                  disabled={actionLoading || ((actionType === 'suspend' || actionType === 'mark-fraud') && !actionReason.trim())}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-text-inverse focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${
                    actionType === 'suspend' || actionType === 'mark-fraud'
                      ? 'bg-danger hover:bg-danger-hover focus:ring-danger'
                      : actionType === 'activate' || actionType === 'make-admin' || actionType === 'make-vendor'
                      ? 'bg-success hover:bg-success-hover focus:ring-success'
                      : 'bg-primary hover:bg-primary-hover focus:ring-primary'
                  }`}
                >
                  {actionLoading ? 'Processing...' : (
                    actionType === 'make-admin' ? 'Make Admin' :
                    actionType === 'make-vendor' ? 'Make Vendor' :
                    actionType === 'remove-admin' ? 'Remove Admin' :
                    actionType === 'suspend' ? 'Suspend' :
                    actionType === 'activate' ? 'Activate' :
                    actionType === 'mark-fraud' ? 'Mark as Fraud' : 'Confirm'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActionModal(false);
                    setActionReason('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-surface text-base font-medium text-text-primary hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;