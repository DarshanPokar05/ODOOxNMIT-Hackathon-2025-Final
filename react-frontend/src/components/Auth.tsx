import React, { useState } from 'react';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';

interface AuthProps {
  onLogin: (token: string) => void;
}

type AuthMode = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    userId: '',
    role: 'operator'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(formData.email, formData.password);
      const { token } = response.data;
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      if (message.includes('verify your email')) {
        setError('Please verify your email first. Check your inbox for the OTP.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.signup(formData.name, formData.email, formData.password, formData.role);
      setFormData({ ...formData, userId: response.data.userId, otp: '' });
      setSuccess('OTP sent to your email. Please verify to complete registration.');
      setMode('verify');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp(formData.userId, formData.otp);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setSuccess('Email verified successfully!');
      onLogin(token);
    } catch (error: any) {
      setError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await authAPI.resendOtp(formData.userId);
      setSuccess('OTP resent successfully');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(formData.email);
      setFormData({ ...formData, userId: response.data.userId });
      setSuccess('Password reset OTP sent to your email');
      setMode('reset');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(formData.userId, formData.otp, formData.password);
      setSuccess('Password reset successfully! Please login with your new password.');
      setMode('login');
      setFormData({ ...formData, password: '', confirmPassword: '', otp: '' });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        );

      case 'signup':
        return (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="operator">Operator</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Resend OTP
            </button>
          </form>
        );

      case 'forgot':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'verify': return 'Verify Email';
      case 'forgot': return 'Forgot Password';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your manufacturing dashboard';
      case 'signup': return 'Join our manufacturing platform';
      case 'verify': return 'Check your email for the verification code';
      case 'forgot': return 'Enter your email to receive reset instructions';
      case 'reset': return 'Enter the OTP and your new password';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{getTitle()}</h1>
          <p className="text-blue-200">{getSubtitle()}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-6">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {renderForm()}

          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-blue-200 hover:text-white text-sm block w-full"
                >
                  Forgot your password?
                </button>
                <div>
                  <span className="text-white/60 text-sm">Don't have an account? </span>
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-200 hover:text-white text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}

            {(mode === 'signup' || mode === 'forgot') && (
              <button
                onClick={() => setMode('login')}
                className="text-blue-200 hover:text-white text-sm"
              >
                Back to Login
              </button>
            )}

            {mode === 'verify' && (
              <button
                onClick={() => setMode('signup')}
                className="text-blue-200 hover:text-white text-sm"
              >
                Back to Signup
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => setMode('forgot')}
                className="text-blue-200 hover:text-white text-sm"
              >
                Back to Forgot Password
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;