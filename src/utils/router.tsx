import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from './constants';

// Lazy load components for better performance
import { lazy } from 'react';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CreateGiveawayPage = lazy(() => import('../pages/CreateGiveawayPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));

// Auth guard component
const AuthGuard = lazy(() => import('../components/auth/AuthGuard'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AuthGuard>
        <DashboardPage />
      </AuthGuard>
    ),
  },
  {
    path: ROUTES.CREATE_GIVEAWAY,
    element: (
      <AuthGuard>
        <CreateGiveawayPage />
      </AuthGuard>
    ),
  },
  {
    path: ROUTES.HISTORY,
    element: (
      <AuthGuard>
        <HistoryPage />
      </AuthGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);

