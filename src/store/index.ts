import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import giveawayReducer from './slices/giveawaySlice';
import participantReducer from './slices/participantSlice';
import channelReducer from './slices/channelSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    giveaway: giveawayReducer,
    participant: participantReducer,
    channel: channelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

