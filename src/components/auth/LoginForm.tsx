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
    } catch (err) {
      setFormError('token', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Login failed',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Login to Telegive Dashboard</CardTitle>
            <CardDescription>
              Enter your bot token to access the giveaway management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Bot Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Enter your bot token"
                  {...register('token')}
                  disabled={loading || isSubmitting}
                  data-testid="token-input"
                />
                {errors.token && (
                  <p className="text-sm text-red-600" data-testid="token-error">
                    {errors.token.message}
                  </p>
                )}
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
                {loading || isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;

