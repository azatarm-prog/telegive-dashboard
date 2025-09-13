import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  GiveawayState, 
  CreateGiveawayRequest, 
  FinishMessages
} from '../../types/giveaway';
import { GiveawayService } from '../../services/GiveawayService';
import { PAGINATION } from '../../utils/constants';

const initialState: GiveawayState = {
  activeGiveaway: null,
  history: [],
  loading: false,
  error: null,
  historyLoading: false,
  historyError: null,
  pagination: {
    page: 1,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const createGiveaway = createAsyncThunk(
  'giveaway/create',
  async (data: CreateGiveawayRequest, { rejectWithValue }) => {
    try {
      return await GiveawayService.createGiveaway(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create giveaway');
    }
  }
);

export const fetchActiveGiveaway = createAsyncThunk(
  'giveaway/fetchActive',
  async (accountId: number, { rejectWithValue }) => {
    try {
      return await GiveawayService.getActiveGiveaway(accountId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch active giveaway');
    }
  }
);

export const updateFinishMessages = createAsyncThunk(
  'giveaway/updateFinishMessages',
  async ({ giveawayId, messages }: { giveawayId: number; messages: FinishMessages }, { rejectWithValue }) => {
    try {
      await GiveawayService.updateFinishMessages(giveawayId, messages);
      return { giveawayId, messages };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update finish messages');
    }
  }
);

export const finishGiveaway = createAsyncThunk(
  'giveaway/finish',
  async (giveawayId: number, { rejectWithValue }) => {
    try {
      const result = await GiveawayService.finishGiveaway(giveawayId);
      return { giveawayId, result };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to finish giveaway');
    }
  }
);

export const fetchHistory = createAsyncThunk(
  'giveaway/fetchHistory',
  async ({ accountId, page, limit }: { accountId: number; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      return await GiveawayService.getHistory(accountId, page, limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch giveaway history');
    }
  }
);

const giveawaySlice = createSlice({
  name: 'giveaway',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHistoryError: (state) => {
      state.historyError = null;
    },
    updateActiveGiveawayParticipantCount: (state, action: PayloadAction<number>) => {
      if (state.activeGiveaway) {
        state.activeGiveaway.participant_count = action.payload;
      }
    },
    setActiveGiveawayMessagesReady: (state, action: PayloadAction<boolean>) => {
      if (state.activeGiveaway) {
        state.activeGiveaway.messages_ready_for_finish = action.payload;
      }
    },
    setActiveGiveaway: (state, action: PayloadAction<any>) => {
      state.activeGiveaway = action.payload;
    },
    clearActiveGiveaway: (state) => {
      state.activeGiveaway = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create giveaway
      .addCase(createGiveaway.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGiveaway.fulfilled, (state, action) => {
        state.loading = false;
        state.activeGiveaway = action.payload;
        state.error = null;
      })
      .addCase(createGiveaway.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch active giveaway
      .addCase(fetchActiveGiveaway.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveGiveaway.fulfilled, (state, action) => {
        state.loading = false;
        state.activeGiveaway = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveGiveaway.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update finish messages
      .addCase(updateFinishMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFinishMessages.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeGiveaway && state.activeGiveaway.id === action.payload.giveawayId) {
          state.activeGiveaway.messages_ready_for_finish = true;
          state.activeGiveaway.conclusion_message = action.payload.messages.conclusionMessage;
          state.activeGiveaway.winner_message = action.payload.messages.winnerMessage;
          state.activeGiveaway.loser_message = action.payload.messages.loserMessage;
        }
        state.error = null;
      })
      .addCase(updateFinishMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Finish giveaway
      .addCase(finishGiveaway.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finishGiveaway.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeGiveaway && state.activeGiveaway.id === action.payload.giveawayId) {
          state.activeGiveaway.status = 'finished';
          state.activeGiveaway.finished_at = new Date().toISOString();
        }
        state.error = null;
      })
      .addCase(finishGiveaway.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch history
      .addCase(fetchHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload.giveaways;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
        state.historyError = null;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearHistoryError,
  updateActiveGiveawayParticipantCount,
  setActiveGiveawayMessagesReady,
  setActiveGiveaway,
  clearActiveGiveaway,
} = giveawaySlice.actions;

export default giveawaySlice.reducer;

