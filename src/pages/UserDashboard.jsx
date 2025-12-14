import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import UserProfile from './UserProfile';
import MyBookings from './MyBookings';
import TransactionHistory from './TransactionHistory';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();

  // Redirect non-user roles to their appropriate dashboard
  if (user?.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/bookings" replace />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/transactions" element={<TransactionHistory />} />
      </Routes>
    </DashboardLayout>
  );
};

export default UserDashboard;