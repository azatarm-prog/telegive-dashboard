import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Gift, Users, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const giveawaySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  winnerCount: z.coerce.number()
    .min(1, 'Must have at least 1 winner')
    .max(100, 'Cannot have more than 100 winners'),
  duration: z.coerce.number()
    .min(1, 'Duration must be at least 1 hour')
    .max(168, 'Duration cannot exceed 168 hours (1 week)'),
  channelId: z.string()
    .min(1, 'Channel ID is required')
    .regex(/^@[a-zA-Z0-9_]+$/, 'Channel ID must start with @ and contain only letters, numbers, and underscores'),
});

type GiveawayFormData = z.infer<typeof giveawaySchema>;

interface GiveawayFormProps {
  onSuccess?: () => void;
  initialData?: Partial<GiveawayFormData>;
}

const GiveawayForm: React.FC<GiveawayFormProps> = ({ onSuccess, initialData }) => {
  const { account } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GiveawayFormData>({
    resolver: zodResolver(giveawaySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      winnerCount: initialData?.winnerCount || 1,
      duration: initialData?.duration || 24,
      channelId: initialData?.channelId || '',
    },
  });

  const onFormSubmit = async (data: GiveawayFormData) => {
    if (!account) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call the giveaway service API
      const response = await fetch(`${import.meta.env.VITE_GIVEAWAY_SERVICE_URL}/api/v1/giveaways`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.access_token}`,
        },
        body: JSON.stringify({
          bot_id: account.id,
          title: data.title,
          description: data.description,
          winner_count: data.winnerCount,
          duration_hours: data.duration,
          channel_id: data.channelId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSuccess(true);
      reset();
      
      // Show success message for 2 seconds, then call onSuccess
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (err: any) {
      console.error('Failed to create giveaway:', err);
      
      let errorMessage = 'Failed to create giveaway. Please try again.';
      
      if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        errorMessage = 'Unable to connect to giveaway service. Please check your internet connection.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid giveaway data. Please check your inputs.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Giveaway Created Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Your giveaway has been published to your Telegram channel. Redirecting to dashboard...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Gift className="mr-2 h-5 w-5" />
          Create New Giveaway
        </CardTitle>
        <CardDescription>
          Set up a new giveaway for your Telegram channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center">
              <Gift className="mr-2 h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Giveaway Title *</Label>
              <Input
                id="title"
                type="text"
                {...register('title')}
                placeholder="Enter an exciting giveaway title"
                disabled={isSubmitting || isCreating}
                className="bg-background"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your giveaway, prizes, and rules..."
                rows={4}
                disabled={isSubmitting || isCreating}
                className="bg-background"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelId" className="text-foreground">Telegram Channel ID *</Label>
              <Input
                id="channelId"
                type="text"
                {...register('channelId')}
                placeholder="@your_channel_username"
                disabled={isSubmitting || isCreating}
                className="bg-background"
              />
              {errors.channelId && (
                <p className="text-sm text-red-500">{errors.channelId.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your channel username starting with @ (e.g., @mychannel)
              </p>
            </div>
          </div>

          {/* Giveaway Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Giveaway Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="winnerCount" className="text-foreground">Number of Winners *</Label>
                <Input
                  id="winnerCount"
                  type="number"
                  min="1"
                  max="100"
                  {...register('winnerCount')}
                  disabled={isSubmitting || isCreating}
                  className="bg-background"
                />
                {errors.winnerCount && (
                  <p className="text-sm text-red-500">{errors.winnerCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground">Duration (hours) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="168"
                  {...register('duration')}
                  disabled={isSubmitting || isCreating}
                  className="bg-background"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 168 hours (1 week)
                </p>
              </div>
            </div>
          </div>

          {/* Information */}
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Before you start:</strong> Make sure your bot is added to your Telegram channel 
              as an administrator with permission to post messages and manage the channel.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting || isCreating}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isCreating}
              className="min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Create Giveaway
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GiveawayForm;

