import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'flowbite-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import EntityDefinitionsPage from './components/EntityDefinitionsPage';
import EntityDefinitionFormPage from './components/EntityDefinitionFormPage';
import EntityContentPage from './components/EntityContentPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { customTheme } from './theme/flowbite-theme';
import './App.css';

const AppContent: React.FC = () => {

  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="entity-definitions" replace />} />
        <Route path="entity-definitions" element={<EntityDefinitionsPage />} />
        <Route path="entity-definitions/new" element={<EntityDefinitionFormPage />} />
        <Route path="entity-definitions/edit/:entityName" element={<EntityDefinitionFormPage />} />
        <Route path="content/:entityName" element={<EntityContentPage />} />
        <Route path="overview" element={<DashboardHome />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
