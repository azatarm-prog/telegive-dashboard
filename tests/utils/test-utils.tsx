import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { RootState } from '../../src/store';
import authReducer from '../../src/store/slices/authSlice';
import giveawayReducer from '../../src/store/slices/giveawaySlice';
import participantReducer from '../../src/store/slices/participantSlice';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState<RootState>;
  store?: ReturnType<typeof setupStore>;
}

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      giveaway: giveawayReducer,
      participant: participantReducer,
    },
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock data factories
export const createMockAccount = (overrides = {}) => ({
  id: 1,
  first_name: 'Test',
  last_name: 'User',
  username: '@testuser',
  ...overrides,
});

export const createMockGiveaway = (overrides = {}) => ({
  id: 1,
  title: 'Test Giveaway',
  main_body: 'Win amazing prizes!',
  winner_count: 3,
  participant_count: 10,
  status: 'active' as const,
  created_at: '2024-01-01T10:00:00Z',
  finished_at: null,
  media_url: null,
  media_type: null,
  conclusion_message: null,
  winner_message: null,
  loser_message: null,
  messages_ready_for_finish: false,
  ...overrides,
});

export const createMockParticipant = (overrides = {}) => ({
  id: 1,
  user_id: 123456789,
  first_name: 'John',
  last_name: 'Doe',
  username: '@johndoe',
  captcha_completed: true,
  is_winner: false,
  participated_at: '2024-01-01T10:00:00Z',
  ...overrides,
});

export const createMockParticipantStats = (overrides = {}) => ({
  total: 10,
  captcha_completed: 8,
  captcha_pending: 2,
  winners: 3,
  ...overrides,
});

// Mock authenticated state
export const createAuthenticatedState = (accountOverrides = {}) => ({
  auth: {
    isAuthenticated: true,
    loading: false,
    error: null,
    token: 'mock-token',
    account: createMockAccount(accountOverrides),
  },
});

// Mock unauthenticated state
export const createUnauthenticatedState = () => ({
  auth: {
    isAuthenticated: false,
    loading: false,
    error: null,
    token: null,
    account: null,
  },
});

// Mock giveaway state
export const createGiveawayState = (overrides = {}) => ({
  giveaway: {
    activeGiveaway: null,
    history: [],
    loading: false,
    error: null,
    historyLoading: false,
    historyError: null,
    pagination: { page: 1, totalPages: 1, total: 0 },
    ...overrides,
  },
});

// Mock participant state
export const createParticipantState = (overrides = {}) => ({
  participant: {
    participants: {},
    stats: {},
    loading: {},
    error: {},
    ...overrides,
  },
});

// File upload helpers
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Form helpers
export const fillGiveawayForm = async (screen: any, data = {}) => {
  const defaultData = {
    title: 'Test Giveaway',
    mainBody: 'Win amazing prizes!',
    winnerCount: '3',
    ...data,
  };

  const titleInput = screen.getByLabelText(/title/i);
  const mainBodyInput = screen.getByLabelText(/main body/i);
  const winnerCountInput = screen.getByLabelText(/winner count/i);

  await titleInput.clear();
  await titleInput.type(defaultData.title);
  
  await mainBodyInput.clear();
  await mainBodyInput.type(defaultData.mainBody);
  
  await winnerCountInput.clear();
  await winnerCountInput.type(defaultData.winnerCount);
};

// Wait helpers
export const waitForLoadingToFinish = async (screen: any) => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  try {
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  } catch {
    // Loading element might not exist, which is fine
  }
};

// Mock API responses
export const mockApiSuccess = (data: any) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

export const mockApiError = (message = 'API Error', status = 400) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
});

// Local storage helpers
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Setup global mocks
export const setupGlobalMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
  });

  // Mock fetch
  global.fetch = jest.fn();

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  });
};

// Cleanup helpers
export const cleanup = () => {
  jest.clearAllMocks();
  localStorage.clear();
};

