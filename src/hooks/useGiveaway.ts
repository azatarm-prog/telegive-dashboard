import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  createGiveaway,
  fetchActiveGiveaway,
  updateFinishMessages,
  finishGiveaway,
  fetchHistory,
  clearError,
  clearHistoryError,
  updateActiveGiveawayParticipantCount,
  setActiveGiveawayMessagesReady,
  clearActiveGiveaway,
} from '../store/slices/giveawaySlice';
import { CreateGiveawayRequest, FinishMessages } from '../types/giveaway';

export const useGiveaway = () => {
  const dispatch = useDispatch<AppDispatch>();
  const giveawayState = useSelector((state: RootState) => state.giveaway);

  const handleCreateGiveaway = useCallback(
    async (data: CreateGiveawayRequest) => {
      const result = await dispatch(createGiveaway(data));
      return result;
    },
    [dispatch]
  );

  const handleFetchActiveGiveaway = useCallback(
    async (accountId: number) => {
      const result = await dispatch(fetchActiveGiveaway(accountId));
      return result;
    },
    [dispatch]
  );

  const handleUpdateFinishMessages = useCallback(
    async (giveawayId: number, messages: FinishMessages) => {
      const result = await dispatch(updateFinishMessages({ giveawayId, messages }));
      return result;
    },
    [dispatch]
  );

  const handleFinishGiveaway = useCallback(
    async (giveawayId: number) => {
      const result = await dispatch(finishGiveaway(giveawayId));
      return result;
    },
    [dispatch]
  );

  const handleFetchHistory = useCallback(
    async (accountId: number, page?: number, limit?: number) => {
      const result = await dispatch(fetchHistory({ accountId, page, limit }));
      return result;
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearHistoryError = useCallback(() => {
    dispatch(clearHistoryError());
  }, [dispatch]);

  const handleUpdateParticipantCount = useCallback(
    (count: number) => {
      dispatch(updateActiveGiveawayParticipantCount(count));
    },
    [dispatch]
  );

  const handleSetMessagesReady = useCallback(
    (ready: boolean) => {
      dispatch(setActiveGiveawayMessagesReady(ready));
    },
    [dispatch]
  );

  const handleClearActiveGiveaway = useCallback(() => {
    dispatch(clearActiveGiveaway());
  }, [dispatch]);

  return {
    ...giveawayState,
    createGiveaway: handleCreateGiveaway,
    fetchActiveGiveaway: handleFetchActiveGiveaway,
    updateFinishMessages: handleUpdateFinishMessages,
    finishGiveaway: handleFinishGiveaway,
    fetchHistory: handleFetchHistory,
    clearError: handleClearError,
    clearHistoryError: handleClearHistoryError,
    updateParticipantCount: handleUpdateParticipantCount,
    setMessagesReady: handleSetMessagesReady,
    clearActiveGiveaway: handleClearActiveGiveaway,
  };
};

