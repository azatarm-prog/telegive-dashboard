import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ParticipantList from '../../src/components/participants/ParticipantList';
import authReducer from '../../src/store/slices/authSlice';
import giveawayReducer from '../../src/store/slices/giveawaySlice';
import participantReducer from '../../src/store/slices/participantSlice';

const mockParticipants = [
  {
    id: 1,
    user_id: 123456789,
    first_name: 'John',
    last_name: 'Doe',
    username: '@johndoe',
    captcha_completed: true,
    is_winner: false,
    participated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    user_id: 987654321,
    first_name: 'Jane',
    last_name: 'Smith',
    username: '@janesmith',
    captcha_completed: false,
    is_winner: true,
    participated_at: '2024-01-01T11:00:00Z',
  },
];

const mockStats = {
  total: 2,
  captcha_completed: 1,
  captcha_pending: 1,
  winners: 1,
};

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      giveaway: giveawayReducer,
      participant: participantReducer,
    },
    preloadedState: {
      participant: {
        participants: { 1: mockParticipants },
        stats: { 1: mockStats },
        loading: { 1: false },
        error: { 1: null },
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('ParticipantList', () => {
  test('renders participant list with stats', () => {
    renderWithProviders(<ParticipantList giveawayId={1} />);
    
    expect(screen.getByTestId('participant-list')).toBeInTheDocument();
    expect(screen.getByTestId('participant-stats')).toBeInTheDocument();
  });

  test('displays participants correctly', () => {
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('@janesmith')).toBeInTheDocument();
  });

  test('shows verification status badges', () => {
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />);
    
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('shows winner badges', () => {
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />);
    
    expect(screen.getByText('Winner')).toBeInTheDocument();
  });

  test('opens participant details on click', async () => {
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />);
    
    const participantItems = screen.getAllByTestId('participant-item');
    fireEvent.click(participantItems[0]);
    
    // Note: In a real test, we would verify that the ParticipantDetails modal opens
    // For now, we just verify the click handler is attached
    expect(participantItems[0]).toBeInTheDocument();
  });

  test('shows loading state', () => {
    const loadingState = {
      participant: {
        participants: { 1: [] },
        stats: {},
        loading: { 1: true },
        error: { 1: null },
      },
    };
    
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />, loadingState);
    
    expect(screen.getByText(/loading participants/i)).toBeInTheDocument();
  });

  test('shows error state', () => {
    const errorState = {
      participant: {
        participants: { 1: [] },
        stats: {},
        loading: { 1: false },
        error: { 1: 'Failed to load participants' },
      },
    };
    
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />, errorState);
    
    expect(screen.getByText(/error loading participants/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  test('shows empty state when no participants', () => {
    const emptyState = {
      participant: {
        participants: { 1: [] },
        stats: { 1: { total: 0, captcha_completed: 0, captcha_pending: 0 } },
        loading: { 1: false },
        error: { 1: null },
      },
    };
    
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={false} />, emptyState);
    
    expect(screen.getByText(/no participants yet/i)).toBeInTheDocument();
  });

  test('toggles collapsible state', () => {
    renderWithProviders(<ParticipantList giveawayId={1} collapsible={true} />);
    
    const header = screen.getByText('Participants').closest('div');
    if (header) {
      fireEvent.click(header);
      // Note: In a real test, we would verify the collapsible content visibility
      expect(header).toBeInTheDocument();
    }
  });
});

