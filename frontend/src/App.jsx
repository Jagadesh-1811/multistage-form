import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

import { UIProvider } from './context/UIContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';

// Components & Pages
import StepProgress from './components/StepProgress';
import PersonalStage from './pages/PersonalStage';
import EducationStage from './pages/EducationStage';
import PaymentStage from './pages/PaymentStage';
import ConfirmationStage from './pages/ConfirmationStage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Protected Route: Requires user to be logged in
const ProtectedRoute = ({ children, requiredStage }) => {
  const { user, loadingAuth } = useAuth();
  const { session, loadingSession } = useSession();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading your registration...</p>
        </div>
      </div>
    );
  }

  const getStagePath = (stage) => {
    switch (stage) {
      case 1: return '/register/personal';
      case 2: return '/register/education';
      case 3: return '/register/payment';
      case 4: return '/register/confirmation';
      default: return '/register/personal';
    }
  };

  // Redirect if stage order sequence is skipped
  if (session.currentStage < requiredStage) {
    return <Navigate to={getStagePath(session.currentStage)} replace />;
  }

  return children;
};

// Guest Route: Prevents logged in users from seeing login/signup pages
const GuestRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/register/personal" replace />;
  }

  return children;
};

// Top Header bar for profile/logout actions
const UserHeaderBar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="w-full flex justify-between items-center bg-white border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)] px-5 py-3 rounded-2xl mb-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
          <User className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Logged in as</p>
          <p className="text-sm font-bold text-slate-700">{user.name}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl transition-all cursor-pointer focus:outline-none"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

const RegistrationLayout = ({ children, showProgress = true }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center justify-start">
      {/* Container */}
      <div className="w-full max-w-[500px]">
        {/* Accessible Page Heading for SEO */}
        <h1 className="sr-only">Multi-Stage Registration Portal</h1>

        {/* Dynamic User Profile Header */}
        <UserHeaderBar />

        {/* Progress Step Indicator */}
        {showProgress && (
          <div className="mb-8">
            <StepProgress />
          </div>
        )}

        {/* Form Card Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <SessionProvider>
          <BrowserRouter>
            <Routes>
              {/* Authenticated / Register Routes */}
              <Route 
                path="/register/personal" 
                element={
                  <ProtectedRoute requiredStage={1}>
                    <RegistrationLayout showProgress={true}>
                      <PersonalStage />
                    </RegistrationLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/register/education" 
                element={
                  <ProtectedRoute requiredStage={2}>
                    <RegistrationLayout showProgress={true}>
                      <EducationStage />
                    </RegistrationLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/register/payment" 
                element={
                  <ProtectedRoute requiredStage={3}>
                    <RegistrationLayout showProgress={true}>
                      <PaymentStage />
                    </RegistrationLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/register/confirmation" 
                element={
                  <ProtectedRoute requiredStage={4}>
                    <RegistrationLayout showProgress={true}>
                      <ConfirmationStage />
                    </RegistrationLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Guest / Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <GuestRoute>
                    <RegistrationLayout showProgress={false}>
                      <LoginPage />
                    </RegistrationLayout>
                  </GuestRoute>
                } 
              />

              <Route 
                path="/signup" 
                element={
                  <GuestRoute>
                    <RegistrationLayout showProgress={false}>
                      <SignupPage />
                    </RegistrationLayout>
                  </GuestRoute>
                } 
              />

              {/* Fallback Redirections */}
              <Route path="/" element={<Navigate to="/register/personal" replace />} />
              <Route path="*" element={<Navigate to="/register/personal" replace />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;
