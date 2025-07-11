import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import VoiceStudio from './pages/VoiceStudio';
import PersonalityForge from './pages/PersonalityForge';
import AgentAcademy from './pages/AgentAcademy';
import QuickClips from './pages/QuickClips';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import { UserRole } from './types/auth.types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="voice-studio" element={<VoiceStudio />} />
                <Route path="personality-forge" element={<PersonalityForge />} />
                <Route
                  path="agent-academy"
                  element={
                    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                      <AgentAcademy />
                    </ProtectedRoute>
                  }
                />
                <Route path="quick-clips" element={<QuickClips />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;