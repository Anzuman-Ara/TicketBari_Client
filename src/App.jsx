import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'
import VendorDashboardLayout from './components/layout/VendorDashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AllTickets from './pages/AllTickets'
import BookingDetails from './pages/BookingDetails'
import TicketDetails from './pages/TicketDetails'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MyBookings from './pages/MyBookings'
import UserProfile from './pages/UserProfile'
import TransactionHistory from './pages/TransactionHistory'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCanceled from './pages/PaymentCanceled'
// Vendor Dashboard Components
import AddTicket from './pages/vendor/AddTicket'
import MyAddedTickets from './pages/vendor/MyAddedTickets'
import RequestedBookings from './pages/vendor/RequestedBookings'
import RevenueOverview from './pages/vendor/RevenueOverview'
import VendorProfile from './pages/vendor/VendorProfile'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes with MainLayout */}
              <Route path="/" element={
                <MainLayout>
                  <Home />
                </MainLayout>
              } />
              <Route path="/tickets" element={
                <MainLayout>
                  <AllTickets />
                </MainLayout>
              } />
              <Route path="/tickets/:id" element={
                <MainLayout>
                  <TicketDetails />
                </MainLayout>
              } />
              <Route path="/booking/:id" element={
                <MainLayout>
                  <BookingDetails />
                </MainLayout>
              } />
                            
              {/* Payment routes */}
              <Route path="/payment-success" element={
                <MainLayout>
                  <PaymentSuccess />
                </MainLayout>
              } />
              <Route path="/payment-canceled" element={
                <MainLayout>
                  <PaymentCanceled />
                </MainLayout>
              } />
                            
              {/* Auth routes with MainLayout */}
              <Route path="/login" element={
                <MainLayout>
                  <Login />
                </MainLayout>
              } />
              <Route path="/register" element={
                <MainLayout>
                  <Register />
                </MainLayout>
              } />
               
              {/* Protected dashboard routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute requiredRoles={['user', 'vendor', 'admin']}>
                    <MainLayout>
                      <UserDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
                
              {/* Admin Dashboard Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <MainLayout>
                      <AdminDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
                
              {/* Vendor Dashboard Routes */}
              <Route
                path="/vendor/*"
                element={
                  <ProtectedRoute requiredRoles={['vendor']}>
                    <MainLayout>
                      <VendorDashboardLayout>
                        <Routes>
                          <Route path="add-ticket" element={<AddTicket />} />
                          <Route path="tickets" element={<MyAddedTickets />} />
                          <Route path="bookings" element={<RequestedBookings />} />
                          <Route path="revenue" element={<RevenueOverview />} />
                          <Route path="profile" element={<VendorProfile />} />
                          <Route path="dashboard" element={<VendorProfile />} />
                          <Route index element={<VendorProfile />} />
                        </Routes>
                      </VendorDashboardLayout>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
               
              {/* Catch all route - 404 */}
              <Route path="*" element={
                <MainLayout>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-6">Page not found</p>
                      <a 
                        href="/" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Go Home
                      </a>
                    </div>
                  </div>
                </MainLayout>
              } />
            </Routes>
             
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-inverse)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: {
                  style: {
                    background: 'var(--color-success)',
                  },
                },
                error: {
                  style: {
                    background: 'var(--color-danger)',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App