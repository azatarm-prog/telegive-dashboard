import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { validateBotToken } from '@/utils/validation';

const loginSchema = z.object({
  token: z.string()
    .min(1, 'Bot token is required')
    .refine(validateBotToken, 'Invalid bot token format'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login, loading, error } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.token);
      onSuccess?.();
    } catch (err: any) {
      // Provide more specific error messages
      let errorMessage = 'Authentication failed';
      
      if (err.payload) {
        errorMessage = err.payload;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Check if it's a network error
      if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
      }
      
      setFormError('token', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Telegive Dashboard</CardTitle>
            <CardDescription>
              Enter your Telegram bot token. If this is your first time, we'll automatically register your bot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Bot Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Enter your bot token (e.g., 123456789:ABCdef...)"
                  {...register('token')}
                  disabled={loading || isSubmitting}
                  data-testid="token-input"
                />
                {errors.token && (
                  <p className="text-sm text-red-600" data-testid="token-error">
                    {errors.token.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Don't have a bot? Create one with @BotFather on Telegram
                </p>
              </div>

              {error && (
                <Alert variant="destructive" data-testid="login-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || isSubmitting}
                data-testid="login-button"
              >
                {loading || isSubmitting ? 'Authenticating...' : 'Login / Sign Up'}
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Existing users will be logged in • New bots will be automatically registered
                </p>
              </div>
            </form>
            
            {/* Instructions for new users */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">How to get a bot token:</h4>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Open Telegram and search for @BotFather</li>
                <li>2. Send /newbot command</li>
                <li>3. Choose a name and username for your bot</li>
                <li>4. Copy the token and paste it above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;

