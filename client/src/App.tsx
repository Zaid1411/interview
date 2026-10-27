import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { AppShell } from './components/layout/AppShell.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';

// Pages
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { QuestionLibraryPage } from './pages/QuestionLibraryPage.js';
import { CodingWorkspacePage } from './pages/CodingWorkspacePage.js';
import { InterviewSetupPage } from './pages/InterviewSetupPage.js';
import { InterviewRoomPage } from './pages/InterviewRoomPage.js';
import { InterviewResultPage } from './pages/InterviewResultPage.js';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* AppShell Layout for public & authenticated routes */}
              <Route element={<AppShell />}>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/questions" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/questions" element={<QuestionLibraryPage />} />
                <Route path="/questions/:slug" element={<CodingWorkspacePage />} />

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/interview/setup" element={<InterviewSetupPage />} />
                  <Route path="/interview/room/:id" element={<InterviewRoomPage />} />
                  <Route path="/interview/results/:id" element={<InterviewResultPage />} />
                  <Route path="/interview/history" element={<InterviewHistoryPage />} />
                </Route>

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
