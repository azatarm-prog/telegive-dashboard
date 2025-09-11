import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const finishMessagesSchema = z.object({
  winnerMessage: z.string()
    .min(1, 'Winner message is required')
    .min(10, 'Winner message must be at least 10 characters')
    .max(500, 'Winner message must be less than 500 characters'),
  participantMessage: z.string()
    .min(1, 'Participant message is required')
    .min(10, 'Participant message must be at least 10 characters')
    .max(500, 'Participant message must be less than 500 characters'),
  notificationSettings: z.object({
    sendToWinners: z.boolean().default(true),
    sendToParticipants: z.boolean().default(true),
    sendToChannel: z.boolean().default(false),
    delayMinutes: z.number().min(0).max(60).default(0),
  }),
  messageFormat: z.object({
    includeGiveawayTitle: z.boolean().default(true),
    includeParticipantCount: z.boolean().default(true),
    includeTimestamp: z.boolean().default(false),
    customSignature: z.string().max(100).optional(),
  }),
});

type FinishMessagesData = z.infer<typeof finishMessagesSchema>;

interface FinishMessagesProps {
  onFinish?: (messages: FinishMessagesData) => void;
  initialData?: Partial<FinishMessagesData>;
  giveawayTitle?: string;
}

const FinishMessages: React.FC<FinishMessagesProps> = ({ 
  onFinish, 
  initialData,
  giveawayTitle = "Your Giveaway"
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FinishMessagesData>({
    resolver: zodResolver(finishMessagesSchema),
    defaultValues: {
      winnerMessage: initialData?.winnerMessage || '🎉 Congratulations! You won our giveaway!',
      participantMessage: initialData?.participantMessage || 'Thank you for participating in our giveaway!',
      notificationSettings: {
        sendToWinners: initialData?.notificationSettings?.sendToWinners ?? true,
        sendToParticipants: initialData?.notificationSettings?.sendToParticipants ?? true,
        sendToChannel: initialData?.notificationSettings?.sendToChannel ?? false,
        delayMinutes: initialData?.notificationSettings?.delayMinutes ?? 0,
      },
      messageFormat: {
        includeGiveawayTitle: initialData?.messageFormat?.includeGiveawayTitle ?? true,
        includeParticipantCount: initialData?.messageFormat?.includeParticipantCount ?? true,
        includeTimestamp: initialData?.messageFormat?.includeTimestamp ?? false,
        customSignature: initialData?.messageFormat?.customSignature || '',
      },
    },
  });

  const watchedSettings = watch('notificationSettings');
  const watchedFormat = watch('messageFormat');

  const onFormSubmit = async (data: FinishMessagesData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onFinish?.(data);
    } catch (error) {
      console.error('Failed to save finish messages:', error);
    }
  };

  const insertTemplate = (field: 'winnerMessage' | 'participantMessage', template: string) => {
    const currentValue = watch(field);
    setValue(field, currentValue + template);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish Messages Configuration</CardTitle>
        <CardDescription>
          Configure personalized messages for winners and participants with advanced options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Message Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Message Content</h3>
            
            <div className="space-y-2">
              <label htmlFor="winnerMessage" className="block text-sm font-medium text-gray-700">
                Winner Message *
              </label>
              <textarea
                id="winnerMessage"
                {...register('winnerMessage')}
                placeholder="🎉 Congratulations! You won our giveaway!"
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
                data-testid="winner-message-input"
              />
              {errors.winnerMessage && (
                <p className="text-sm text-red-600" data-testid="winner-message-error">
                  {errors.winnerMessage.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => insertTemplate('winnerMessage', ' {username}')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + Username
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('winnerMessage', ' {giveaway_title}')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + Giveaway Title
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('winnerMessage', ' {prize}')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + Prize
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="participantMessage" className="block text-sm font-medium text-gray-700">
                Participant Message *
              </label>
              <textarea
                id="participantMessage"
                {...register('participantMessage')}
                placeholder="Thank you for participating in our giveaway!"
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
                data-testid="participant-message-input"
              />
              {errors.participantMessage && (
                <p className="text-sm text-red-600" data-testid="participant-message-error">
                  {errors.participantMessage.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => insertTemplate('participantMessage', ' {username}')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + Username
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('participantMessage', ' {giveaway_title}')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + Giveaway Title
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('participantMessage', ' {total_participants}')}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  + Total Participants
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="sendToWinners"
                  type="checkbox"
                  {...register('notificationSettings.sendToWinners')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="sendToWinners" className="text-sm font-medium text-gray-700">
                  Send notifications to winners
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="sendToParticipants"
                  type="checkbox"
                  {...register('notificationSettings.sendToParticipants')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="sendToParticipants" className="text-sm font-medium text-gray-700">
                  Send notifications to all participants
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="sendToChannel"
                  type="checkbox"
                  {...register('notificationSettings.sendToChannel')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="sendToChannel" className="text-sm font-medium text-gray-700">
                  Post results to channel
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="delayMinutes" className="block text-sm font-medium text-gray-700">
                  Delay notifications (minutes)
                </label>
                <input
                  id="delayMinutes"
                  type="number"
                  {...register('notificationSettings.delayMinutes', { valueAsNumber: true })}
                  min="0"
                  max="60"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  data-testid="delay-input"
                />
                {errors.notificationSettings?.delayMinutes && (
                  <p className="text-sm text-red-600">
                    {errors.notificationSettings.delayMinutes.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message Format */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Message Format Options</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="includeGiveawayTitle"
                  type="checkbox"
                  {...register('messageFormat.includeGiveawayTitle')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="includeGiveawayTitle" className="text-sm font-medium text-gray-700">
                  Include giveaway title in messages
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="includeParticipantCount"
                  type="checkbox"
                  {...register('messageFormat.includeParticipantCount')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="includeParticipantCount" className="text-sm font-medium text-gray-700">
                  Include total participant count
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="includeTimestamp"
                  type="checkbox"
                  {...register('messageFormat.includeTimestamp')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="includeTimestamp" className="text-sm font-medium text-gray-700">
                  Include timestamp in messages
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="customSignature" className="block text-sm font-medium text-gray-700">
                  Custom signature (optional)
                </label>
                <input
                  id="customSignature"
                  type="text"
                  {...register('messageFormat.customSignature')}
                  placeholder="e.g., - Your Brand Team"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  data-testid="signature-input"
                />
                {errors.messageFormat?.customSignature && (
                  <p className="text-sm text-red-600">
                    {errors.messageFormat.customSignature.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-testid="save-messages-button"
          >
            {isSubmitting ? 'Saving Messages...' : 'Save Finish Messages'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinishMessages;

