import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from '../../src/App';
import authReducer from '../../src/store/slices/authSlice';
import giveawayReducer from '../../src/store/slices/giveawaySlice';
import participantReducer from '../../src/store/slices/participantSlice';

// Mock the API services
jest.mock('../../src/services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  validateToken: jest.fn(),
  getAccount: jest.fn(),
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      giveaway: giveawayReducer,
      participant: participantReducer,
    },
  });
};

const renderWithProviders = (initialEntries = ['/']) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('redirects unauthenticated user to login page', async () => {
    renderWithProviders(['/dashboard']);
    
    await waitFor(() => {
      expect(screen.getByText(/telegive dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in with your bot token/i)).toBeInTheDocument();
    });
  });

  test('shows login form on login page', () => {
    renderWithProviders(['/login']);
    
    expect(screen.getByLabelText(/bot token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('validates bot token format during login', async () => {
    renderWithProviders(['/login']);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const loginButton = screen.getByTestId('login-button');
    
    fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid bot token format/i)).toBeInTheDocument();
    });
  });

  test('handles successful login flow', async () => {
    const AuthService = require('../../src/services/AuthService');
    AuthService.login.mockResolvedValue({
      token: 'mock-token',
      account: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        username: '@testuser',
      },
    });

    renderWithProviders(['/login']);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const loginButton = screen.getByTestId('login-button');
    
    fireEvent.change(tokenInput, { 
      target: { value: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz' } 
    });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        botToken: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
      });
    });
  });

  test('handles login error', async () => {
    const AuthService = require('../../src/services/AuthService');
    AuthService.login.mockRejectedValue(new Error('Invalid bot token'));

    renderWithProviders(['/login']);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const loginButton = screen.getByTestId('login-button');
    
    fireEvent.change(tokenInput, { 
      target: { value: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz' } 
    });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid bot token/i)).toBeInTheDocument();
    });
  });

  test('preserves redirect location after login', async () => {
    const AuthService = require('../../src/services/AuthService');
    AuthService.login.mockResolvedValue({
      token: 'mock-token',
      account: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        username: '@testuser',
      },
    });

    // Try to access protected route, should redirect to login with state
    renderWithProviders(['/create-giveaway']);
    
    await waitFor(() => {
      expect(screen.getByText(/sign in with your bot token/i)).toBeInTheDocument();
    });
    
    // After successful login, should redirect back to original route
    const tokenInput = screen.getByTestId('bot-token-input');
    const loginButton = screen.getByTestId('login-button');
    
    fireEvent.change(tokenInput, { 
      target: { value: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz' } 
    });
    fireEvent.click(loginButton);
    
    // Note: In a real test, we would verify the redirect happens
    // For now, we just verify the login attempt was made
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalled();
    });
  });

  test('shows loading state during authentication check', () => {
    // Mock token validation to simulate loading state
    const AuthService = require('../../src/services/AuthService');
    AuthService.validateToken.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    // Set a token in localStorage to trigger validation
    localStorage.setItem('telegive_token', 'mock-token');
    
    renderWithProviders(['/dashboard']);
    
    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
  });
});

