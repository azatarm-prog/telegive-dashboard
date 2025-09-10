import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { store } from '@/store';
import { router } from '@/utils/router';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading application..." />
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </div>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

