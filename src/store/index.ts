import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import giveawayReducer from './slices/giveawaySlice';
import participantReducer from './slices/participantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    giveaway: giveawayReducer,
    participant: participantReducer,
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

