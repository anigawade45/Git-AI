import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import PageLoader from '@/components/common/PageLoader';

// Lazy Loaded Application Modules
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Repository = lazy(() => import('@/pages/Repository'));
const AIChat = lazy(() => import('@/pages/AIChat'));
const CodeAnalysis = lazy(() => import('@/pages/CodeAnalysis'));
const Documentation = lazy(() => import('@/pages/Documentation'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Dashboard & Settings */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Scalable Repository Workspace Routes (Single ID & Owner/Repo Slugs) */}
                <Route
                  path="/repository/:id"
                  element={
                    <ProtectedRoute>
                      <Repository />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:id/files"
                  element={
                    <ProtectedRoute>
                      <Repository />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:id/chat"
                  element={
                    <ProtectedRoute>
                      <AIChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:id/analysis"
                  element={
                    <ProtectedRoute>
                      <CodeAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:id/docs"
                  element={
                    <ProtectedRoute>
                      <Documentation />
                    </ProtectedRoute>
                  }
                />

                {/* Multi-segment Owner/Repo Routes */}
                <Route
                  path="/repository/:owner/:repo"
                  element={
                    <ProtectedRoute>
                      <Repository />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:owner/:repo/files"
                  element={
                    <ProtectedRoute>
                      <Repository />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:owner/:repo/chat"
                  element={
                    <ProtectedRoute>
                      <AIChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:owner/:repo/analysis"
                  element={
                    <ProtectedRoute>
                      <CodeAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repository/:owner/:repo/docs"
                  element={
                    <ProtectedRoute>
                      <Documentation />
                    </ProtectedRoute>
                  }
                />

                {/* Unmatched 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
}
