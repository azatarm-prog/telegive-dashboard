import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChannelService, ChannelConfig, ChannelVerificationResult } from '../../services/ChannelService';

interface ChannelState {
  config: ChannelConfig | null;
  loading: boolean;
  error: string | null;
  verificationLoading: boolean;
  verificationResult: ChannelVerificationResult | null;
}

const initialState: ChannelState = {
  config: null,
  loading: false,
  error: null,
  verificationLoading: false,
  verificationResult: null,
};

// Async thunks
export const verifyChannelAccess = createAsyncThunk(
  'channel/verifyAccess',
  async ({ channelUsername, accountId }: { channelUsername: string; accountId: number }, { rejectWithValue }) => {
    try {
      return await ChannelService.verifyChannelAccess(channelUsername, accountId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify channel access');
    }
  }
);

export const saveChannelConfig = createAsyncThunk(
  'channel/saveConfig',
  async ({ accountId, config }: { accountId: number; config: ChannelConfig }, { rejectWithValue }) => {
    try {
      await ChannelService.saveChannelConfig(accountId, config);
      return config;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save channel configuration');
    }
  }
);

export const fetchChannelConfig = createAsyncThunk(
  'channel/fetchConfig',
  async (accountId: number, { rejectWithValue }) => {
    try {
      return await ChannelService.getChannelConfig(accountId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch channel configuration');
    }
  }
);

export const deleteChannelConfig = createAsyncThunk(
  'channel/deleteConfig',
  async (accountId: number, { rejectWithValue }) => {
    try {
      await ChannelService.deleteChannelConfig(accountId);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete channel configuration');
    }
  }
);

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVerificationResult: (state) => {
      state.verificationResult = null;
    },
    setChannelConfig: (state, action: PayloadAction<ChannelConfig | null>) => {
      state.config = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify channel access
      .addCase(verifyChannelAccess.pending, (state) => {
        state.verificationLoading = true;
        state.verificationResult = null;
        state.error = null;
      })
      .addCase(verifyChannelAccess.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.verificationResult = action.payload;
        state.error = null;
      })
      .addCase(verifyChannelAccess.rejected, (state, action) => {
        state.verificationLoading = false;
        state.error = action.payload as string;
        state.verificationResult = {
          success: false,
          channelExists: false,
          botIsAdmin: false,
          botCanPostMessages: false,
          error: action.payload as string,
        };
      })
      // Save channel config
      .addCase(saveChannelConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveChannelConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.error = null;
      })
      .addCase(saveChannelConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch channel config
      .addCase(fetchChannelConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
        state.error = null;
      })
      .addCase(fetchChannelConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete channel config
      .addCase(deleteChannelConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChannelConfig.fulfilled, (state) => {
        state.loading = false;
        state.config = null;
        state.error = null;
      })
      .addCase(deleteChannelConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearVerificationResult,
  setChannelConfig,
} = channelSlice.actions;

export default channelSlice.reducer;

