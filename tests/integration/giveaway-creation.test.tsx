import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CreateGiveawayPage from '../../src/pages/CreateGiveawayPage';
import authReducer from '../../src/store/slices/authSlice';
import giveawayReducer from '../../src/store/slices/giveawaySlice';
import participantReducer from '../../src/store/slices/participantSlice';

// Mock the API services
jest.mock('../../src/services/GiveawayService', () => ({
  createGiveaway: jest.fn(),
  getActiveGiveaway: jest.fn(),
}));

jest.mock('../../src/services/MediaService', () => ({
  uploadMedia: jest.fn(),
}));

const mockAuthenticatedState = {
  auth: {
    isAuthenticated: true,
    loading: false,
    error: null,
    token: 'mock-token',
    account: {
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      username: '@testuser',
    },
  },
};

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      giveaway: giveawayReducer,
      participant: participantReducer,
    },
    preloadedState: {
      ...mockAuthenticatedState,
      giveaway: {
        activeGiveaway: null,
        history: [],
        loading: false,
        error: null,
        historyLoading: false,
        historyError: null,
        pagination: { page: 1, totalPages: 1, total: 0 },
      },
      participant: {
        participants: {},
        stats: {},
        loading: {},
        error: {},
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('Giveaway Creation Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create giveaway page with form', () => {
    renderWithProviders(<CreateGiveawayPage />);
    
    expect(screen.getByText(/create giveaway/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main body/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/winner count/i)).toBeInTheDocument();
  });

  test('shows information alert about bot permissions', () => {
    renderWithProviders(<CreateGiveawayPage />);
    
    expect(screen.getByText(/before you start/i)).toBeInTheDocument();
    expect(screen.getByText(/make sure your bot is added/i)).toBeInTheDocument();
  });

  test('validates form fields before submission', async () => {
    renderWithProviders(<CreateGiveawayPage />);
    
    const publishButton = screen.getByTestId('publish-button');
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least/i)).toBeInTheDocument();
      expect(screen.getByText(/main body must be at least/i)).toBeInTheDocument();
    });
  });

  test('handles successful giveaway creation', async () => {
    const GiveawayService = require('../../src/services/GiveawayService');
    GiveawayService.createGiveaway.mockResolvedValue({
      id: 1,
      title: 'Test Giveaway',
      main_body: 'Win amazing prizes!',
      winner_count: 3,
      status: 'active',
    });

    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    renderWithProviders(<CreateGiveawayPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Giveaway' }
    });
    fireEvent.change(screen.getByLabelText(/main body/i), {
      target: { value: 'Win amazing prizes!' }
    });
    fireEvent.change(screen.getByLabelText(/winner count/i), {
      target: { value: '3' }
    });
    
    const publishButton = screen.getByTestId('publish-button');
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(GiveawayService.createGiveaway).toHaveBeenCalledWith({
        title: 'Test Giveaway',
        mainBody: 'Win amazing prizes!',
        winnerCount: 3,
        mediaFile: undefined,
      });
    });
  });

  test('handles file upload in giveaway creation', async () => {
    const MediaService = require('../../src/services/MediaService');
    MediaService.uploadMedia.mockResolvedValue({
      url: 'https://example.com/image.jpg',
      type: 'image/jpeg',
    });

    renderWithProviders(<CreateGiveawayPage />);
    
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('media-upload').querySelector('input[type="file"]');
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByTestId('uploaded-file')).toBeInTheDocument();
        expect(screen.getByText(/test.jpg/i)).toBeInTheDocument();
      });
    }
  });

  test('shows preview when content is entered', async () => {
    renderWithProviders(<CreateGiveawayPage />);
    
    fireEvent.change(screen.getByLabelText(/main body/i), {
      target: { value: 'Test giveaway content for preview' }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
      expect(screen.getByText(/how participants will see/i)).toBeInTheDocument();
      expect(screen.getByText(/test giveaway content for preview/i)).toBeInTheDocument();
    });
  });

  test('handles giveaway creation error', async () => {
    const GiveawayService = require('../../src/services/GiveawayService');
    GiveawayService.createGiveaway.mockRejectedValue(new Error('Failed to create giveaway'));

    renderWithProviders(<CreateGiveawayPage />);
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Giveaway' }
    });
    fireEvent.change(screen.getByLabelText(/main body/i), {
      target: { value: 'Win amazing prizes!' }
    });
    fireEvent.change(screen.getByLabelText(/winner count/i), {
      target: { value: '3' }
    });
    
    const publishButton = screen.getByTestId('publish-button');
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to create giveaway/i)).toBeInTheDocument();
    });
  });

  test('redirects if active giveaway exists', () => {
    const stateWithActiveGiveaway = {
      giveaway: {
        activeGiveaway: {
          id: 1,
          title: 'Existing Giveaway',
          status: 'active',
        },
        history: [],
        loading: false,
        error: null,
        historyLoading: false,
        historyError: null,
        pagination: { page: 1, totalPages: 1, total: 0 },
      },
    };

    renderWithProviders(<CreateGiveawayPage />, stateWithActiveGiveaway);
    
    // Should redirect to dashboard, so the create giveaway form should not be visible
    expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
  });

  test('shows how it works section', () => {
    renderWithProviders(<CreateGiveawayPage />);
    
    expect(screen.getByText(/how it works/i)).toBeInTheDocument();
    expect(screen.getByText(/fill in the giveaway details/i)).toBeInTheDocument();
    expect(screen.getByText(/optionally upload an image/i)).toBeInTheDocument();
    expect(screen.getByText(/click "publish giveaway"/i)).toBeInTheDocument();
    expect(screen.getByText(/monitor participants/i)).toBeInTheDocument();
  });
});

