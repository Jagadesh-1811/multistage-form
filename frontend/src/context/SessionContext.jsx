import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUI } from './UIContext';

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

  const fetchSession = async () => {
    try {
      setLoadingSession(true);
      const response = await axios.get('/api/application/session');
      if (response.data && response.data.success) {
        setSession(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      showToast('Failed to load your registration session.', 'error');
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

  useEffect(() => {
    fetchSession();
  }, []);

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
