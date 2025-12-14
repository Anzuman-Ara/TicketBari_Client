import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Ticket, CreditCard, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = window.innerWidth < 1024;

  // Only show user-specific navigation for users with 'user' role
  const navigation = user?.role === 'user' ? [
    { name: 'User Profile', href: '/dashboard/profile', icon: User },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: Ticket },
    { name: 'Transaction History', href: '/dashboard/transactions', icon: CreditCard },
  ] : [];

  const isActive = (href) => {
    return location.pathname === href;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Initialize sidebar state based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">User Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {user?.name || 'User'}!</p>
        </div>

        {/* Navigation and Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Toggle Button (Mobile) */}
          <div className="lg:hidden mb-4">
            <button
              onClick={toggleSidebar}
              className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background-secondary transition-colors"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className={`lg:w-64 flex-shrink-0 transition-all duration-300 ease-in-out ${
            (sidebarCollapsed && isMobile) ? 'hidden' : (sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:hidden' : 'lg:w-64')
          }`}>
            <div className="bg-surface rounded-lg shadow-sm border border-border p-6 h-fit">
              <div className="flex flex-col h-full">
                {/* Sidebar Header with Toggle (Desktop only) */}
                <div className="flex items-center justify-between mb-6">
                  {!sidebarCollapsed && (
                    <h2 className="text-lg font-semibold text-text-primary">Navigation</h2>
                  )}
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2 flex-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Sidebar Toggle Button (Desktop) */}
          <div className="lg:block hidden mb-4">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-background-secondary transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-text-secondary" />
              )}
            </button>
          </div>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ease-in-out lg:ml-0`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;