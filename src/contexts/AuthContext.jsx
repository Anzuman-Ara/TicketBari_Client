import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRegistering = useRef(false);

  // Initialize user from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip if we're in the middle of registration to avoid duplicate calls
      if (isRegistering.current && firebaseUser) {
        return;
      }
      
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Send token to our backend to get our JWT and user data
          const response = await authAPI.firebaseLogin(idToken);
          
          const userData = response.data.data;
          setUser(userData);
          
          // Store in localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          setError(null);
        } catch (error) {
          console.error('Error getting user data:', error);
          setError('Failed to authenticate user');
          
          // Clear any stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        // User signed out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
      }
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signup = async (email, password, name, role = 'user') => {
    try {
      setLoading(true);
      setError(null);
      
      // Set flag to indicate we're registering
      isRegistering.current = true;
      
      // Create Firebase user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      // Get ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Register with our backend
      const response = await authAPI.firebaseRegister(idToken, role);
      
      const userData = response.data.data;
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      // Reset the registration flag after a short delay
      // This ensures the onAuthStateChanged listener won't trigger for this user
      setTimeout(() => {
        isRegistering.current = false;
      }, 2000);
    }
  };

  // Sign in with email and password
 const login = async (email, password) => {
   try {
     setLoading(true);
     setError(null);
      
     // Sign in with Firebase
     const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
     // Get ID token
     const idToken = await firebaseUser.getIdToken();
      
     // Send token to our backend
     const response = await authAPI.firebaseLogin(idToken);
      
     const userData = response.data.data;
     setUser(userData);
      
     // Store in localStorage
     localStorage.setItem('token', response.data.token);
     localStorage.setItem('user', JSON.stringify(userData));
      
     toast.success('Logged in successfully!');
     return { success: true };
   } catch (error) {
     console.error('Login error:', error);
     let errorMessage = 'Failed to log in';
      
     // Handle network and CORS errors
     if (error.code === 'ERR_NETWORK') {
       errorMessage = 'Unable to connect to the server. Please check your internet connection.';
     } else if (error.response?.status === 429) {
       errorMessage = 'Too many login attempts. Please try again later.';
     } else if (error.response?.status === 403) {
       errorMessage = 'Access denied. Please check your credentials.';
     } else if (error.code === 'auth/user-not-found') {
       errorMessage = 'No account found with this email';
     } else if (error.code === 'auth/wrong-password') {
       errorMessage = 'Incorrect password';
     } else if (error.code === 'auth/invalid-email') {
       errorMessage = 'Invalid email address';
     } else if (error.code === 'auth/too-many-requests') {
       errorMessage = 'Too many failed attempts. Please try again later';
     }
      
     setError(errorMessage);
     toast.error(errorMessage);
     return { success: false, error: errorMessage };
   } finally {
     setLoading(false);
   }
 };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with Google popup
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
      
      // Get ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Send token to our backend
      const response = await authAPI.firebaseLogin(idToken);
      
      const userData = response.data.data;
      setUser(userData);
      
      // Store in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Logged in with Google successfully!');
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Failed to log in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups and try again';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      setError(null);
      
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      
      const response = await authAPI.updateProfile(profileData);
      const userData = response.data.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Profile updated successfully!');
      return { success: true, data: userData };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user information directly
  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    updateUser,
    hasRole,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};