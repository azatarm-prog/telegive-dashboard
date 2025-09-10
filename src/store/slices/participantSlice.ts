import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ParticipantState } from '../../types/participant';
import { ParticipantService } from '../../services/ParticipantService';

const initialState: ParticipantState = {
  participants: {},
  stats: {},
  loading: {},
  error: {},
};

// Async thunks
export const fetchParticipants = createAsyncThunk(
  'participant/fetchParticipants',
  async ({ giveawayId, page, limit }: { giveawayId: number; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await ParticipantService.getParticipants(giveawayId, page, limit);
      return { giveawayId, ...response };
    } catch (error: any) {
      return rejectWithValue({
        giveawayId,
        message: error.response?.data?.message || error.message || 'Failed to fetch participants'
      });
    }
  }
);

export const fetchParticipantStats = createAsyncThunk(
  'participant/fetchStats',
  async (giveawayId: number, { rejectWithValue }) => {
    try {
      const stats = await ParticipantService.getParticipantStats(giveawayId);
      return { giveawayId, stats };
    } catch (error: any) {
      return rejectWithValue({
        giveawayId,
        message: error.response?.data?.message || error.message || 'Failed to fetch participant stats'
      });
    }
  }
);

export const exportParticipants = createAsyncThunk(
  'participant/export',
  async (giveawayId: number, { rejectWithValue }) => {
    try {
      const blob = await ParticipantService.exportParticipants(giveawayId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `participants-giveaway-${giveawayId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return giveawayId;
    } catch (error: any) {
      return rejectWithValue({
        giveawayId,
        message: error.response?.data?.message || error.message || 'Failed to export participants'
      });
    }
  }
);

const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    clearError: (state, action: PayloadAction<number>) => {
      const giveawayId = action.payload;
      delete state.error[giveawayId];
    },
    clearParticipants: (state, action: PayloadAction<number>) => {
      const giveawayId = action.payload;
      delete state.participants[giveawayId];
      delete state.stats[giveawayId];
      delete state.loading[giveawayId];
      delete state.error[giveawayId];
    },
    updateParticipantCount: (state, action: PayloadAction<{ giveawayId: number; count: number }>) => {
      const { giveawayId, count } = action.payload;
      if (state.stats[giveawayId]) {
        state.stats[giveawayId].total = count;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch participants
      .addCase(fetchParticipants.pending, (state, action) => {
        const giveawayId = action.meta.arg.giveawayId;
        state.loading[giveawayId] = true;
        delete state.error[giveawayId];
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        const { giveawayId, participants, stats } = action.payload;
        state.loading[giveawayId] = false;
        state.participants[giveawayId] = participants;
        state.stats[giveawayId] = stats;
        delete state.error[giveawayId];
      })
      .addCase(fetchParticipants.rejected, (state, action) => {
        const { giveawayId, message } = action.payload as { giveawayId: number; message: string };
        state.loading[giveawayId] = false;
        state.error[giveawayId] = message;
      })
      // Fetch participant stats
      .addCase(fetchParticipantStats.pending, (state, action) => {
        const giveawayId = action.meta.arg;
        state.loading[giveawayId] = true;
        delete state.error[giveawayId];
      })
      .addCase(fetchParticipantStats.fulfilled, (state, action) => {
        const { giveawayId, stats } = action.payload;
        state.loading[giveawayId] = false;
        state.stats[giveawayId] = stats;
        delete state.error[giveawayId];
      })
      .addCase(fetchParticipantStats.rejected, (state, action) => {
        const { giveawayId, message } = action.payload as { giveawayId: number; message: string };
        state.loading[giveawayId] = false;
        state.error[giveawayId] = message;
      })
      // Export participants
      .addCase(exportParticipants.pending, (state, action) => {
        const giveawayId = action.meta.arg;
        state.loading[giveawayId] = true;
        delete state.error[giveawayId];
      })
      .addCase(exportParticipants.fulfilled, (state, action) => {
        const giveawayId = action.payload;
        state.loading[giveawayId] = false;
        delete state.error[giveawayId];
      })
      .addCase(exportParticipants.rejected, (state, action) => {
        const { giveawayId, message } = action.payload as { giveawayId: number; message: string };
        state.loading[giveawayId] = false;
        state.error[giveawayId] = message;
      });
  },
});

export const { clearError, clearParticipants, updateParticipantCount } = participantSlice.actions;
export default participantSlice.reducer;

