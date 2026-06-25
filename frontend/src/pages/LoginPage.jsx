import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { LoginIllustration } from '../components/Illustrations';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setIsLoading } = useUI();
  const [loadingLocal, setLoadingLocal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoadingLocal(true);
      setIsLoading(true);
      const res = await login(data.email, data.password);
      if (res && res.success) {
        // Redirection is handled by the Router, but we'll navigate to /register/personal 
        // and let route protection determine if we should redirect to a later stage.
        navigate('/register/personal');
      }
    } finally {
      setLoadingLocal(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 animate-fade-in">
      {/* Header & Illustration */}
      <div className="text-center">
        <LoginIllustration />
        <h2 className="text-2xl font-bold text-slate-800 mt-4">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-1">Please login to manage your registration</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email Address */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="login-email"
              type="email"
              placeholder="john.doe@example.com"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.email ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Enter a valid email address'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative text-left">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-purple-100 ${
                errors.password ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-purple-500'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-rose-500 mt-1.5">{errors.password.message}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          id="btn-login-submit"
          type="submit"
          disabled={loadingLocal}
          className="mt-4 w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-2xl font-semibold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-purple-100"
        >
          {loadingLocal ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Redirect Links */}
      <div className="text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-purple-600 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
