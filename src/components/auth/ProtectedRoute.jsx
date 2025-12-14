import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRoles = [], redirectTo = '/login' }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    // Redirect to dashboard if user doesn't have required role
    const dashboardRoute = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;