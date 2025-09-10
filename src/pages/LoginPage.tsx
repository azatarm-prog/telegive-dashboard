import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoginForm />
    </div>
  );
};

export default LoginPage;

