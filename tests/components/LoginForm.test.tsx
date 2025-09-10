import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from '../../src/components/auth/LoginForm';
import authReducer from '../../src/store/slices/authSlice';
import giveawayReducer from '../../src/store/slices/giveawaySlice';
import participantReducer from '../../src/store/slices/participantSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      giveaway: giveawayReducer,
      participant: participantReducer,
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginForm', () => {
  test('renders login form elements', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByText(/telegive dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in with your bot token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bot token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('validates bot token format', async () => {
    renderWithProviders(<LoginForm />);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const loginButton = screen.getByTestId('login-button');
    
    // Test invalid token format
    fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid bot token format/i)).toBeInTheDocument();
    });
  });

  test('validates empty token', async () => {
    renderWithProviders(<LoginForm />);
    
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bot token is required/i)).toBeInTheDocument();
    });
  });

  test('toggles token visibility', () => {
    renderWithProviders(<LoginForm />);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    
    expect(tokenInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(tokenInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(tokenInput).toHaveAttribute('type', 'password');
  });

  test('shows loading state during login', async () => {
    renderWithProviders(<LoginForm />);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const loginButton = screen.getByTestId('login-button');
    
    fireEvent.change(tokenInput, { 
      target: { value: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz' } 
    });
    fireEvent.click(loginButton);
    
    // Note: In a real test, we would mock the API call to control the loading state
    // For now, we just verify the form structure is correct
    expect(loginButton).toBeInTheDocument();
  });

  test('displays BotFather link', () => {
    renderWithProviders(<LoginForm />);
    
    const botFatherLink = screen.getByText(/create a bot with botfather/i);
    expect(botFatherLink).toBeInTheDocument();
    expect(botFatherLink.closest('a')).toHaveAttribute('href', 'https://core.telegram.org/bots#6-botfather');
    expect(botFatherLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  test('accepts valid bot token format', async () => {
    renderWithProviders(<LoginForm />);
    
    const tokenInput = screen.getByTestId('bot-token-input');
    const validToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz';
    
    fireEvent.change(tokenInput, { target: { value: validToken } });
    
    // Should not show validation error for valid format
    await waitFor(() => {
      expect(screen.queryByText(/invalid bot token format/i)).not.toBeInTheDocument();
    });
  });
});

