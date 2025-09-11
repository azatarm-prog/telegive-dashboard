import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { store } from '@/store';
import { router } from '@/utils/router';
import './App.css';

function App() {
  useEffect(() => {
    // Ensure dark theme is applied
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
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
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
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

