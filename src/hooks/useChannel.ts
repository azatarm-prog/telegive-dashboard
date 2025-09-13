import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  verifyChannelAccess,
  saveChannelConfig,
  fetchChannelConfig,
  deleteChannelConfig,
  clearError,
  clearVerificationResult,
  setChannelConfig,
} from '../store/slices/channelSlice';
import { ChannelConfig } from '../services/ChannelService';

export const useChannel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const channelState = useSelector((state: RootState) => state.channel);

  const handleVerifyChannelAccess = useCallback(
    async (channelUsername: string, accountId: number) => {
      const result = await dispatch(verifyChannelAccess({ channelUsername, accountId }));
      return result;
    },
    [dispatch]
  );

  const handleSaveChannelConfig = useCallback(
    async (accountId: number, config: ChannelConfig) => {
      const result = await dispatch(saveChannelConfig({ accountId, config }));
      return result;
    },
    [dispatch]
  );

  const handleFetchChannelConfig = useCallback(
    async (accountId: number) => {
      const result = await dispatch(fetchChannelConfig(accountId));
      return result;
    },
    [dispatch]
  );

  const handleDeleteChannelConfig = useCallback(
    async (accountId: number) => {
      const result = await dispatch(deleteChannelConfig(accountId));
      return result;
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearVerificationResult = useCallback(() => {
    dispatch(clearVerificationResult());
  }, [dispatch]);

  const handleSetChannelConfig = useCallback((config: ChannelConfig | null) => {
    dispatch(setChannelConfig(config));
  }, [dispatch]);

  return {
    ...channelState,
    verifyChannelAccess: handleVerifyChannelAccess,
    saveChannelConfig: handleSaveChannelConfig,
    fetchChannelConfig: handleFetchChannelConfig,
    deleteChannelConfig: handleDeleteChannelConfig,
    clearError: handleClearError,
    clearVerificationResult: handleClearVerificationResult,
    setChannelConfig: handleSetChannelConfig,
  };
};

