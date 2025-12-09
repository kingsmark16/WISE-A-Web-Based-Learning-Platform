import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModeContext } from './modeContext';

// Re-export ModeContext so consumers can import from this file
export { ModeContext };

export const ModeProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('admin'); // 'admin' or 'instructor'
  const isInitialMount = useRef(true);
  const previousUserRef = useRef(null);

  useEffect(() => {
    // Only process when user data is loaded
    if (!isLoaded) return;

    // Check if user logged out
    if (previousUserRef.current && !user) {
      // User logged out, reset mode and don't navigate
      setMode('admin');
      previousUserRef.current = null;
      return;
    }

    // Reset to admin mode when user is ADMIN
    if (user?.publicMetadata?.role === 'ADMIN') {
      setMode('admin');
      previousUserRef.current = user;
    } else if (user) {
      // For non-admin users, reset mode to prevent navigation issues
      setMode('admin');
      previousUserRef.current = user;
    }
  }, [user, isLoaded]);

  // Navigate based on mode changes (but not on initial mount or when user is not loaded)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't navigate if user is not loaded or logged out
    if (!isLoaded || !user) {
      return;
    }

    // Only navigate if user is actually ADMIN
    if (user?.publicMetadata?.role !== 'ADMIN') {
      return;
    }

    // Navigate based on current mode
    if (mode === 'admin') {
      // Only navigate if not already on an admin route
      if (!location.pathname.startsWith('/admin')) {
        navigate('/admin/analytics');
      }
    } else if (mode === 'instructor') {
      // Only navigate if not already on a faculty route
      if (!location.pathname.startsWith('/faculty')) {
        navigate('/faculty/faculty-dashboard');
      }
    }
  }, [mode, navigate, location.pathname, user, isLoaded]);

  const switchToInstructor = () => {
    // Only allow switch if user is admin
    if (user?.publicMetadata?.role === 'ADMIN') {
      setMode('instructor');
    }
  };

  const switchToAdmin = () => {
    setMode('admin');
  };

  return (
    <ModeContext.Provider value={{ mode, switchToInstructor, switchToAdmin }}>
      {children}
    </ModeContext.Provider>
  );
};

