import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const giveawaySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  winnerCount: z.number()
    .min(1, 'Must have at least 1 winner')
    .max(100, 'Cannot have more than 100 winners'),
  duration: z.number()
    .min(1, 'Duration must be at least 1 hour')
    .max(168, 'Duration cannot exceed 168 hours (1 week)'),
  requirements: z.object({
    subscribeChannel: z.boolean().default(false),
    inviteFriends: z.number().min(0).max(50).default(0),
    sharePost: z.boolean().default(false),
  }),
});

type GiveawayFormData = z.infer<typeof giveawaySchema>;

interface GiveawayFormProps {
  onSubmit?: (data: GiveawayFormData) => void;
  initialData?: Partial<GiveawayFormData>;
}

const GiveawayForm: React.FC<GiveawayFormProps> = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<GiveawayFormData>({
    resolver: zodResolver(giveawaySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      winnerCount: initialData?.winnerCount || 1,
      duration: initialData?.duration || 24,
      requirements: {
        subscribeChannel: initialData?.requirements?.subscribeChannel || false,
        inviteFriends: initialData?.requirements?.inviteFriends || 0,
        sharePost: initialData?.requirements?.sharePost || false,
      },
    },
  });

  const watchedRequirements = watch('requirements');

  const onFormSubmit = async (data: GiveawayFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit?.(data);
    } catch (error) {
      console.error('Failed to create giveaway:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Giveaway</CardTitle>
        <CardDescription>
          Set up a new giveaway for your Telegram channel with advanced validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Giveaway Title *</Label>
              <Input
                id="title"
                type="text"
                {...register('title')}
                placeholder="Enter an exciting giveaway title"
                disabled={isSubmitting}
                data-testid="title-input"
              />
              {errors.title && (
                <p className="text-sm text-red-600" data-testid="title-error">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what participants can win and how to participate"
                rows={4}
                disabled={isSubmitting}
                data-testid="description-input"
              />
              {errors.description && (
                <p className="text-sm text-red-600" data-testid="description-error">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Giveaway Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Giveaway Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="winnerCount">Number of Winners *</Label>
                <Input
                  id="winnerCount"
                  type="number"
                  {...register('winnerCount', { valueAsNumber: true })}
                  min="1"
                  max="100"
                  disabled={isSubmitting}
                  data-testid="winner-count-input"
                />
                {errors.winnerCount && (
                  <p className="text-sm text-red-600" data-testid="winner-count-error">
                    {errors.winnerCount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours) *</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  min="1"
                  max="168"
                  disabled={isSubmitting}
                  data-testid="duration-input"
                />
                {errors.duration && (
                  <p className="text-sm text-red-600" data-testid="duration-error">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Participation Requirements</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribeChannel"
                  {...register('requirements.subscribeChannel')}
                  disabled={isSubmitting}
                />
                <Label htmlFor="subscribeChannel" className="text-sm font-medium">
                  Require channel subscription
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sharePost"
                  {...register('requirements.sharePost')}
                  disabled={isSubmitting}
                />
                <Label htmlFor="sharePost" className="text-sm font-medium">
                  Require post sharing
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteFriends">Required friend invitations (0 = none)</Label>
                <Input
                  id="inviteFriends"
                  type="number"
                  {...register('requirements.inviteFriends', { valueAsNumber: true })}
                  min="0"
                  max="50"
                  disabled={isSubmitting}
                  data-testid="invite-friends-input"
                />
                {errors.requirements?.inviteFriends && (
                  <p className="text-sm text-red-600">
                    {errors.requirements.inviteFriends.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-testid="create-button"
          >
            {isSubmitting ? 'Creating Giveaway...' : 'Create Giveaway'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GiveawayForm;

