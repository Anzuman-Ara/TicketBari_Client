import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  UserCheck,
  AlertTriangle,
  Eye,
  Calendar
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import AdminProfile from '../components/admin/AdminProfile';
import ManageTickets from '../components/admin/ManageTickets';
import ManageUsers from '../components/admin/ManageUsers';
import AdvertiseTickets from '../components/admin/AdvertiseTickets';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      vendors: 0,
      admins: 0,
      suspended: 0,
      fraud: 0
    },
    tickets: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      advertised: 0
    },
    bookings: {
      total: 0,
      recent: []
    },
    revenue: {
      total: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return 'bg-background-secondary text-success';
      case 'pending':
        return 'bg-background-secondary text-warning';
      case 'rejected':
      case 'cancelled':
        return 'bg-background-secondary text-danger';
      case 'completed':
        return 'bg-background-secondary text-primary';
      default:
        return 'bg-background-secondary text-text-secondary';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-surface overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-16 w-16 rounded-full"
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=6366f1&color=fff`}
                      alt={user?.name || 'Admin'}
                    />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-text-primary">
                      Welcome back, {user?.name || 'Admin'}!
                    </h1>
                    <p className="text-text-secondary">
                      Here's what's happening with your platform today.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-text-tertiary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-tertiary truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-text-primary">
                          {stats.users.total.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-success font-medium">
                      Vendors: {stats.users.vendors}
                    </span>
                    <span className="text-text-tertiary mx-2">•</span>
                    <span className="text-primary font-medium">
                      Admins: {stats.users.admins}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Ticket className="h-6 w-6 text-text-tertiary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-tertiary truncate">
                          Total Tickets
                        </dt>
                        <dd className="text-lg font-medium text-text-primary">
                          {stats.tickets.total.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-warning font-medium">
                      Pending: {stats.tickets.pending}
                    </span>
                    <span className="text-text-tertiary mx-2">•</span>
                    <span className="text-success font-medium">
                      Approved: {stats.tickets.approved}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-text-tertiary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-tertiary truncate">
                          Total Bookings
                        </dt>
                        <dd className="text-lg font-medium text-text-primary">
                          {stats.bookings.total.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-primary font-medium">
                      Advertised: {stats.tickets.advertised}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-text-tertiary" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-text-tertiary truncate">
                          Total Revenue
                        </dt>
                        <dd className="text-lg font-medium text-text-primary">
                          ৳{stats.revenue.total.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-danger font-medium">
                      Suspended: {stats.users.suspended}
                    </span>
                    <span className="text-text-tertiary mx-2">•</span>
                    <span className="text-danger font-medium">
                      Fraud: {stats.users.fraud}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-surface shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
                  Recent Bookings
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                      {stats.bookings.recent.length > 0 ? (
                        stats.bookings.recent.map((booking) => (
                          <tr key={booking._id} className="hover:bg-background-secondary">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                              {booking.bookingReference}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                              {booking.user?.name || 'Unknown User'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                              {booking.route?.from?.city} → {booking.route?.to?.city}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                              ৳{booking.totalAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-text-tertiary">
                            No recent bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="bg-surface overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/tickets')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Ticket className="h-8 w-8 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-text-primary">Manage Tickets</h3>
                      <p className="text-sm text-text-secondary">
                        Review and approve vendor tickets
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-warning font-medium">
                      {stats.tickets.pending} pending approval
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="bg-surface overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/users')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-success" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-text-primary">Manage Users</h3>
                      <p className="text-sm text-text-secondary">
                        Control user roles and permissions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-primary font-medium">
                      {stats.users.total} total users
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="bg-surface overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/advertise')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-info" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-text-primary">Advertise Tickets</h3>
                      <p className="text-sm text-text-secondary">
                        Promote approved tickets on homepage
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-background-secondary px-5 py-3">
                  <div className="text-sm">
                    <span className="text-info font-medium">
                      {stats.tickets.advertised}/6 advertised
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/tickets" element={<ManageTickets />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/advertise" element={<AdvertiseTickets />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;