import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from './constants';

// Direct imports to avoid dynamic loading issues
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CreateGiveawayPage from '../pages/CreateGiveawayPage';
import ActiveGiveawayPage from '../pages/ActiveGiveawayPage';
import HistoryPage from '../pages/HistoryPage';
import AuthGuard from '../components/auth/AuthGuard';

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
    path: ROUTES.ACTIVE_GIVEAWAY,
    element: (
      <AuthGuard>
        <ActiveGiveawayPage />
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

