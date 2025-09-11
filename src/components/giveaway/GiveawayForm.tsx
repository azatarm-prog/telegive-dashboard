import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Giveaway Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                placeholder="Enter an exciting giveaway title"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Describe what participants can win and how to participate"
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="winnerCount" className="block text-sm font-medium text-gray-700">
                  Number of Winners *
                </label>
                <input
                  id="winnerCount"
                  type="number"
                  {...register('winnerCount', { valueAsNumber: true })}
                  min="1"
                  max="100"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (hours) *
                </label>
                <input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  min="1"
                  max="168"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <input
                  id="subscribeChannel"
                  type="checkbox"
                  {...register('requirements.subscribeChannel')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="subscribeChannel" className="text-sm font-medium text-gray-700">
                  Require channel subscription
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="sharePost"
                  type="checkbox"
                  {...register('requirements.sharePost')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="sharePost" className="text-sm font-medium text-gray-700">
                  Require post sharing
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="inviteFriends" className="block text-sm font-medium text-gray-700">
                  Required friend invitations (0 = none)
                </label>
                <input
                  id="inviteFriends"
                  type="number"
                  {...register('requirements.inviteFriends', { valueAsNumber: true })}
                  min="0"
                  max="50"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

