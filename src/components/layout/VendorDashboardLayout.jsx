import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Ticket, 
  Plus, 
  Calendar, 
  BarChart3, 
  Building,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VendorDashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  // Vendor-specific navigation
  const navigation = [
    { 
      name: 'Vendor Profile', 
      href: '/vendor/profile', 
      icon: User,
      current: location.pathname === '/vendor/profile' || location.pathname === '/vendor/dashboard'
    }, 
    { 
      name: 'Add Ticket', 
      href: '/vendor/add-ticket', 
      icon: Plus,
      current: location.pathname === '/vendor/add-ticket'
    }, 
    { 
      name: 'My Added Tickets', 
      href: '/vendor/tickets', 
      icon: Ticket,
      current: location.pathname === '/vendor/tickets'
    }, 
    { 
      name: 'Requested Bookings', 
      href: '/vendor/bookings', 
      icon: Calendar,
      current: location.pathname === '/vendor/bookings'
    }, 
    { 
      name: 'Revenue Overview', 
      href: '/vendor/revenue', 
      icon: BarChart3,
      current: location.pathname === '/vendor/revenue'
    }, 
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Initialize sidebar state based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
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

  // Check if user is vendor or admin
  if (!hasRole(['vendor', 'admin'])) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">You need vendor privileges to access this area.</p>
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vendor Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Vendor'}!</p>
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
                {/* Sidebar Header */}
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
                          item.current
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

export default VendorDashboardLayout;