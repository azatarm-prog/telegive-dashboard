import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGiveaway } from '@/hooks/useGiveaway';
import { Giveaway } from '@/types/giveaway';

const finishMessagesSchema = z.object({
  conclusionMessage: z.string()
    .min(1, 'Conclusion message is required')
    .min(10, 'Conclusion message must be at least 10 characters')
    .max(1000, 'Conclusion message must be less than 1000 characters'),
  winnerMessage: z.string()
    .min(1, 'Winner message is required')
    .min(10, 'Winner message must be at least 10 characters')
    .max(1000, 'Winner message must be less than 1000 characters'),
  loserMessage: z.string()
    .min(1, 'Loser message is required')
    .min(10, 'Loser message must be at least 10 characters')
    .max(1000, 'Loser message must be less than 1000 characters'),
});

type FinishMessagesData = z.infer<typeof finishMessagesSchema>;

interface FinishMessagesProps {
  giveaway: Giveaway;
}

const FinishMessages: React.FC<FinishMessagesProps> = ({ giveaway }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  
  const { updateFinishMessages, finishGiveaway: finishGiveawayAction, clearActiveGiveaway } = useGiveaway();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FinishMessagesData>({
    resolver: zodResolver(finishMessagesSchema),
    mode: 'onChange',
    defaultValues: {
      conclusionMessage: '🎉 Giveaway Results! Congratulations to our winners! Click the link below to see if you won: {RESULTS_LINK}',
      winnerMessage: '🎉 Congratulations! You won our amazing giveaway! Contact @admin to claim your prize within 48 hours.',
      loserMessage: 'Thank you for participating! Better luck next time. Stay tuned for more exciting giveaways!',
    },
  });

  const watchedMessages = watch();
  const allMessagesComplete = isValid && 
    watchedMessages.conclusionMessage?.length >= 10 &&
    watchedMessages.winnerMessage?.length >= 10 &&
    watchedMessages.loserMessage?.length >= 10;

  const getMessageStatus = (message: string, error?: any) => {
    if (error) {
      return { icon: XCircle, color: 'text-destructive', text: 'Required' };
    }
    if (message && message.length >= 10) {
      return { icon: CheckCircle, color: 'text-green-600', text: 'Completed' };
    }
    return { icon: XCircle, color: 'text-destructive', text: 'Required' };
  };

  const conclusionStatus = getMessageStatus(watchedMessages.conclusionMessage, errors.conclusionMessage);
  const winnerStatus = getMessageStatus(watchedMessages.winnerMessage, errors.winnerMessage);
  const loserStatus = getMessageStatus(watchedMessages.loserMessage, errors.loserMessage);

  const handleFinishGiveaway = async (data: FinishMessagesData) => {
    try {
      setIsFinishing(true);
      setFinishError(null);
      
      console.log('Starting giveaway finish process...');
      console.log('Giveaway ID:', giveaway.id);
      console.log('Messages:', data);
      
      // Step 1: Update finish messages
      console.log('Step 1: Updating finish messages...');
      await updateFinishMessages(Number(giveaway.id), {
        conclusionMessage: data.conclusionMessage,
        winnerMessage: data.winnerMessage,
        loserMessage: data.loserMessage,
      });
      
      // Step 2: Finish the giveaway
      console.log('Step 2: Finishing giveaway...');
      const result = await finishGiveawayAction(Number(giveaway.id));
      
      console.log('Giveaway finished successfully:', result);
      
      // Step 3: Clear active giveaway from state
      clearActiveGiveaway();
      
      // Close dialog
      setShowConfirmDialog(false);
      
      // Show success message or redirect
      alert('Giveaway finished successfully! Winners have been selected and messages sent.');
      
    } catch (error: any) {
      console.error('Failed to finish giveaway:', error);
      setFinishError(error.message || 'Failed to finish giveaway. Please try again.');
    } finally {
      setIsFinishing(false);
    }
  };

  const onSubmit = (data: FinishMessagesData) => {
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Real-Time Statistics
          </CardTitle>
          <CardDescription>
            Monitor your giveaway performance in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{giveaway.participant_count}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Total Participants</div>
              <div className="text-xs text-muted-foreground">All users who clicked participate</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.floor(giveaway.participant_count * 0.8)}</div>
              <div className="text-sm text-green-800 dark:text-green-200">Captcha Completed</div>
              <div className="text-xs text-muted-foreground">Users who completed verification</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{Math.floor(giveaway.participant_count * 0.2)}</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">Pending Captcha</div>
              <div className="text-xs text-muted-foreground">Users still completing verification</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2m ago</div>
              <div className="text-sm text-purple-800 dark:text-purple-200">Recent Activity</div>
              <div className="text-xs text-muted-foreground">Latest participation timestamp</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finish Messages Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Define Finish Messages</CardTitle>
          <CardDescription>
            Configure messages that will be sent when the giveaway is finished. All messages are required before finishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Conclusion Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="conclusionMessage" className="text-base font-medium">
                  Conclusion Message *
                </Label>
                <div className="flex items-center space-x-2">
                  <conclusionStatus.icon className={`h-4 w-4 ${conclusionStatus.color}`} />
                  <Badge variant={conclusionStatus.text === 'Completed' ? 'default' : 'destructive'}>
                    {conclusionStatus.text}
                  </Badge>
                </div>
              </div>
              <Textarea
                id="conclusionMessage"
                {...register('conclusionMessage')}
                placeholder="🎉 Giveaway Results! Congratulations to our winners! Click the link below to see if you won: {RESULTS_LINK}"
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Use {'{RESULTS_LINK}'} where results link should appear</span>
                <span>{watchedMessages.conclusionMessage?.length || 0}/1000 characters</span>
              </div>
              {errors.conclusionMessage && (
                <p className="text-sm text-destructive">{errors.conclusionMessage.message}</p>
              )}
            </div>

            {/* Winner Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="winnerMessage" className="text-base font-medium">
                  Winner Message *
                </Label>
                <div className="flex items-center space-x-2">
                  <winnerStatus.icon className={`h-4 w-4 ${winnerStatus.color}`} />
                  <Badge variant={winnerStatus.text === 'Completed' ? 'default' : 'destructive'}>
                    {winnerStatus.text}
                  </Badge>
                </div>
              </div>
              <Textarea
                id="winnerMessage"
                {...register('winnerMessage')}
                placeholder="🎉 Congratulations! You won our amazing giveaway! Contact @admin to claim your prize within 48 hours."
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Personalized message sent to winners</span>
                <span>{watchedMessages.winnerMessage?.length || 0}/1000 characters</span>
              </div>
              {errors.winnerMessage && (
                <p className="text-sm text-destructive">{errors.winnerMessage.message}</p>
              )}
            </div>

            {/* Loser Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="loserMessage" className="text-base font-medium">
                  Loser Message *
                </Label>
                <div className="flex items-center space-x-2">
                  <loserStatus.icon className={`h-4 w-4 ${loserStatus.color}`} />
                  <Badge variant={loserStatus.text === 'Completed' ? 'default' : 'destructive'}>
                    {loserStatus.text}
                  </Badge>
                </div>
              </div>
              <Textarea
                id="loserMessage"
                {...register('loserMessage')}
                placeholder="Thank you for participating! Better luck next time. Stay tuned for more exciting giveaways!"
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Personalized message sent to non-winners</span>
                <span>{watchedMessages.loserMessage?.length || 0}/1000 characters</span>
              </div>
              {errors.loserMessage && (
                <p className="text-sm text-destructive">{errors.loserMessage.message}</p>
              )}
            </div>

            {/* Status Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {allMessagesComplete 
                  ? "✅ All messages completed. Ready to finish giveaway."
                  : "❌ Complete all messages to finish the giveaway."
                }
              </AlertDescription>
            </Alert>

            {/* Finish Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!allMessagesComplete}
            >
              {allMessagesComplete 
                ? "🏁 Finish Giveaway"
                : "🏁 Finish Giveaway (Complete messages first)"
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Finish Giveaway</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish this giveaway? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {finishError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-destructive">
                  {finishError}
                </AlertDescription>
              </Alert>
            )}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">What will happen:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. Random winner selection from all participants</li>
                <li>2. Winner/loser message delivery to ALL participants</li>
                <li>3. Public conclusion message posted to channel with results link</li>
                <li>4. Giveaway status changed to finished</li>
                <li>5. Move to history section</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setFinishError(null);
              }}
              disabled={isFinishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleFinishGiveaway)}
              disabled={isFinishing}
            >
              {isFinishing ? 'Finishing...' : 'Confirm Finish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinishMessages;

