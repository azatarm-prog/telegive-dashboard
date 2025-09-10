import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginRequest, Account } from '../../types/auth';
import { AuthService } from '../../services/AuthService';

const initialState: AuthState = {
  isAuthenticated: AuthService.isAuthenticated(),
  token: AuthService.getStoredToken(),
  account: AuthService.getStoredAccount(),
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Login failed');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const result = await AuthService.validateToken();
      if (!result.valid) {
        AuthService.logout();
        return rejectWithValue('Token is invalid');
      }
      return result.account;
    } catch (error: any) {
      AuthService.logout();
      return rejectWithValue('Token validation failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      AuthService.logout();
      state.isAuthenticated = false;
      state.token = null;
      state.account = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAccount: (state, action: PayloadAction<Account>) => {
      state.account = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.account = action.payload.account;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.account = null;
        state.error = action.payload as string;
      })
      // Validate token
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        if (action.payload) {
          state.account = action.payload;
        }
      })
      .addCase(validateToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.account = null;
      });
  },
});

export const { logout, clearError, setAccount } = authSlice.actions;
export default authSlice.reducer;

