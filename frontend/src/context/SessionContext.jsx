import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({
    currentStage: 1,
    personalInfo: null,
    educationalDetails: null,
    paymentDetails: null
  });
  const [loadingSession, setLoadingSession] = useState(true);
  const { showToast } = useUI();
  const { user, loadingAuth } = useAuth();

  const fetchSession = async () => {
    try {
      setLoadingSession(true);
      const response = await axios.get('/api/application/session');
      if (response.data && response.data.success) {
        setSession(response.data.data);
      }
    } catch (error) {
      // 401 is expected when the user is not authenticated — skip the toast.
      if (error.response?.status !== 401) {
        console.error('Error fetching session:', error);
        showToast('Failed to load your registration session.', 'error');
      }
    } finally {
      setLoadingSession(false);
    }
  };

  const resetSession = async () => {
    try {
      const response = await axios.post('/api/application/reset');
      if (response.data && response.data.success) {
        setSession({
          currentStage: 1,
          personalInfo: null,
          educationalDetails: null,
          paymentDetails: null
        });
        showToast('Registration reset successfully.', 'success');
      }
    } catch (error) {
      console.error('Error resetting session:', error);
      showToast('Failed to reset session.', 'error');
    }
  };

  // Only fetch once we know the auth state, and only when authenticated.
  useEffect(() => {
    if (loadingAuth) return;
    if (user) {
      fetchSession();
    } else {
      setLoadingSession(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAuth, user]);

  return (
    <SessionContext.Provider value={{ session, setSession, loadingSession, fetchSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
