import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Ticket, Menu, User, Search, LogOut, Settings, UserCircle, Bus, Train } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../ThemeToggle'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('[data-user-dropdown]')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isUserMenuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const getDashboardRoute = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin'
    return '/dashboard'
  }

  // Check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  // Navigation items configuration
  const publicNavItems = [
    { path: '/', label: 'Home', icon: null }
  ]

  const privateNavItems = [
    { path: '/tickets', label: 'All Tickets', icon: null, requireAuth: true }
  ]

  const dashboardNavItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      roles: ['user', 'vendor'], 
      icon: User 
    },
    { 
      path: '/admin', 
      label: 'Admin', 
      roles: ['admin'], 
      icon: Settings 
    }
  ]

  return (
    <header
      className={`bg-background glass transition-all duration-300 fixed top-0 z-50 ${
        isScrolled ? 'shadow-lg backdrop-blur-sm' : 'shadow-md'
      } w-full`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group transition-all duration-200 hover:scale-105"
            aria-label="TicketBari Home"
          >
            <div className="relative">
              <Bus className="h-7 w-7 text-primary" />
              <Train className="h-4 w-4 text-blue-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-xl lg:text-2xl font-bold transition-colors text-text-primary group-hover:text-primary">
              TicketBari
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-50 text-primary shadow-sm border border-blue-200'
                    : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {user && privateNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-50 text-primary shadow-sm border border-blue-200'
                    : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {dashboardNavItems.map((item) => {
              if (!hasRole(item.roles)) return null
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item.path)
                      ? 'bg-blue-50 text-primary shadow-sm border border-blue-200'
                      : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                  }`}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {user ? (
              <div className="relative" data-user-dropdown>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg transition-all duration-200 text-text-secondary hover:text-primary hover:bg-background-secondary"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 transition-all duration-200 ring-transparent hover:ring-primary"
                    />
                  ) : (
                    <UserCircle className="h-8 w-8 transition-colors text-text-tertiary hover:text-primary" />
                  )}
                  <span className="hidden sm:block text-sm font-medium max-w-20 lg:max-w-none truncate">
                    {user.name}
                  </span>
                  <svg
                    className={`hidden lg:block h-4 w-4 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Enhanced User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 border animate-in slide-in-from-top-2 duration-200 bg-background border-border">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="font-medium truncate text-text-primary">{user.name}</div>
                      <div className="text-sm truncate text-text-tertiary">{user.email}</div>
                      <div className="text-xs capitalize mt-1 inline-flex items-center text-primary">
                        <span className="w-2 h-2 rounded-full mr-2 bg-primary"></span>
                        {user.role}
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to={getDashboardRoute()}
                        className="flex items-center px-4 py-2 text-sm transition-colors text-text-secondary hover:bg-background-secondary hover:text-primary"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Dashboard
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm transition-colors text-text-secondary hover:bg-background-secondary hover:text-primary"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      
                      <hr className="my-1 border-border" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm transition-colors text-danger hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-text-secondary hover:text-primary hover:bg-background-secondary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
            
            {/* Enhanced Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg transition-all duration-200 relative text-text-secondary hover:text-primary hover:bg-background-secondary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                }`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-2 border-t backdrop-blur-sm bg-background border-border">
            {/* Public Navigation */}
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-50 text-primary shadow-sm border border-blue-200'
                    : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Private Navigation */}
            {user && privateNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-blue-50 text-primary shadow-sm border border-blue-200'
                    : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Dashboard Navigation */}
            {user && dashboardNavItems.map((item) => {
              if (!hasRole(item.roles)) return null
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActiveRoute(item.path)
                      ? 'bg-blue-50 text-primary shadow-sm border border-blue-200'
                      : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Authentication Actions */}
            {user ? (
              <div className="pt-4 border-t space-y-2 border-border">
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-text-primary">{user.name}</div>
                  <div className="text-sm text-text-tertiary">{user.email}</div>
                  <div className="text-xs capitalize mt-1 text-primary">{user.role}</div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-left text-danger hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t space-y-3 border-border">
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 text-center rounded-lg text-base font-medium transition-all duration-200 text-text-secondary hover:text-primary hover:bg-background-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg text-base font-medium transition-all duration-200 shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header