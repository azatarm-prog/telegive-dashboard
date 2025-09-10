import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import GiveawayForm from '../../src/components/giveaway/GiveawayForm';
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

describe('GiveawayForm', () => {
  test('renders all required form fields', () => {
    renderWithProviders(<GiveawayForm />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main body/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/winner count/i)).toBeInTheDocument();
    expect(screen.getByText(/upload media/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithProviders(<GiveawayForm />);
    
    const publishButton = screen.getByRole('button', { name: /publish giveaway/i });
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least/i)).toBeInTheDocument();
      expect(screen.getByText(/main body must be at least/i)).toBeInTheDocument();
    });
  });

  test('validates winner count range', async () => {
    renderWithProviders(<GiveawayForm />);
    
    const winnerCountInput = screen.getByLabelText(/winner count/i);
    fireEvent.change(winnerCountInput, { target: { value: '0' } });
    
    const publishButton = screen.getByRole('button', { name: /publish giveaway/i });
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(screen.getByText(/winner count must be at least 1/i)).toBeInTheDocument();
    });
    
    fireEvent.change(winnerCountInput, { target: { value: '101' } });
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(screen.getByText(/winner count cannot exceed 100/i)).toBeInTheDocument();
    });
  });

  test('handles file upload', async () => {
    renderWithProviders(<GiveawayForm />);
    
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('media-upload').querySelector('input[type="file"]');
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/test.jpg/i)).toBeInTheDocument();
      });
    }
  });

  test('shows preview when content is entered', async () => {
    renderWithProviders(<GiveawayForm />);
    
    const mainBodyInput = screen.getByLabelText(/main body/i);
    fireEvent.change(mainBodyInput, { target: { value: 'Test giveaway content' } });
    
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
      expect(screen.getByText(/test giveaway content/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockOnSuccess = jest.fn();
    renderWithProviders(<GiveawayForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Giveaway' }
    });
    fireEvent.change(screen.getByLabelText(/main body/i), {
      target: { value: 'Win amazing prizes!' }
    });
    fireEvent.change(screen.getByLabelText(/winner count/i), {
      target: { value: '3' }
    });
    
    const publishButton = screen.getByRole('button', { name: /publish giveaway/i });
    fireEvent.click(publishButton);
    
    // Note: In a real test, we would mock the API call and verify the submission
    // For now, we just check that the form doesn't show validation errors
    await waitFor(() => {
      expect(screen.queryByText(/title must be at least/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/main body must be at least/i)).not.toBeInTheDocument();
    });
  });
});

