import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { login, logout, validateToken, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const handleLogin = useCallback(
    async (botToken: string) => {
      const result = await dispatch(login({ botToken }));
      return result;
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleValidateToken = useCallback(async () => {
    const result = await dispatch(validateToken());
    return result;
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    validateToken: handleValidateToken,
    clearError: handleClearError,
  };
};

