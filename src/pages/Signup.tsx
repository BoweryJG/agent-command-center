import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { SignupCredentials } from '../types/auth.types';

const Signup: React.FC = () => {
  const { signup, loginWithGoogle, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState<SignupCredentials>({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (value && value !== credentials.password) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    } else {
      setCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      if (name === 'password' && confirmPassword && value !== confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
    
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (credentials.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      await signup(credentials);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const handleGoogleSignup = async () => {
    try {
      if (loginWithGoogle) {
        await loginWithGoogle();
      }
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neural-darker">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="neural-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-text-secondary mt-2">
              Join the Agent Command Center
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || passwordError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error || passwordError}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={credentials.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={credentials.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-text-muted">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-purple focus:outline-none focus:ring-2 focus:ring-electric-purple/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-neural-accent/20 text-electric-purple focus:ring-electric-purple/20 mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 text-sm">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-electric-purple hover:text-electric-pink transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-electric-purple hover:text-electric-pink transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!passwordError}
              className="w-full neural-button py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neural-accent/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neural-dark text-text-muted">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-neural-accent/20 rounded-lg hover:bg-neural-light transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-neural-accent/20 rounded-lg hover:bg-neural-light transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-electric-purple hover:text-electric-pink transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;