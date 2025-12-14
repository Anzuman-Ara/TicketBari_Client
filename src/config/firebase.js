import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate and load Firebase configuration with proper error handling
const loadFirebaseConfig = () => {
  // Validate required environment variables
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  // Check if any required environment variables are missing or empty
  const missingVars = requiredEnvVars.filter(varName => {
    const value = import.meta.env[varName];
    return !value || value === 'undefined' || value.trim() === '';
  });

  if (missingVars.length > 0) {
    console.error('Firebase configuration error: Missing required environment variables:', missingVars);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingVars.join(', ')}`);
  }

  // Validate API key format (basic validation)
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey.startsWith('AIzaSy') || apiKey.length !== 39) {
    console.error('Firebase configuration error: Invalid API key format');
    throw new Error('Invalid Firebase API key format');
  }

  // Return validated configuration
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
};

// Initialize Firebase with validated configuration
let app;
try {
  const firebaseConfig = loadFirebaseConfig();
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error.message);
  // In production, you might want to show a user-friendly error or fallback UI
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    // You could redirect to a maintenance page or show an error boundary
    console.error('Firebase initialization failed in production. Application may not function properly.');
  }
  // Create a more secure error that doesn't expose sensitive configuration details
  const secureError = new Error('Firebase initialization failed. Please check your configuration.');
  throw secureError; // Re-throw to ensure the application doesn't continue without Firebase
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;