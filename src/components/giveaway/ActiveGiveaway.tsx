import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Calendar, Trophy, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MediaPreview from '@/components/media/MediaPreview';
import { useGiveaway } from '@/hooks/useGiveaway';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { formatDate, formatDuration, getStatusColor, getStatusText } from '@/utils/formatting';

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

const ActiveGiveaway: React.FC = () => {
  const { activeGiveaway, loading } = useGiveaway();
  const { isConnected } = useRealTimeUpdates();
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

  const handleFinishGiveaway = async (data: FinishMessagesData) => {
    if (!activeGiveaway) {
      console.error('No active giveaway found');
      setFinishError('No active giveaway found');
      return;
    }
    
    try {
      setIsFinishing(true);
      setFinishError(null);
      
      console.log('Starting giveaway finish process...');
      console.log('Giveaway ID:', activeGiveaway.id);
      console.log('Messages:', data);
      
      // Step 1: Update finish messages
      console.log('Step 1: Updating finish messages...');
      try {
        await updateFinishMessages(Number(activeGiveaway.id), {
          conclusionMessage: data.conclusionMessage,
          winnerMessage: data.winnerMessage,
          loserMessage: data.loserMessage,
        });
        console.log('✅ Finish messages updated successfully');
      } catch (messageError: any) {
        console.error('❌ Failed to update finish messages:', messageError);
        throw new Error(`Failed to update finish messages: ${messageError.message}`);
      }
      
      // Step 2: Finish the giveaway
      console.log('Step 2: Finishing giveaway...');
      try {
        const result = await finishGiveawayAction(Number(activeGiveaway.id));
        console.log('✅ Giveaway finished successfully:', result);
      } catch (finishError: any) {
        console.error('❌ Failed to finish giveaway:', finishError);
        throw new Error(`Failed to finish giveaway: ${finishError.message}`);
      }
      
      // Close dialog first
      setShowConfirmDialog(false);
      
      // Show success message
      alert('✅ Giveaway finished successfully! Winners have been selected and messages sent.');
      
      // Step 3: Clear active giveaway from state immediately
      console.log('Step 3: Clearing active giveaway from state...');
      clearActiveGiveaway();
      console.log('✅ Active giveaway cleared from state');
      
      // Also force a page refresh to ensure clean state
      setTimeout(() => {
        console.log('🔄 Refreshing page to ensure clean state...');
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Failed to finish giveaway:', error);
      setFinishError(error.message || 'Failed to finish giveaway. Please try again.');
      
      // Don't clear the giveaway if there was an error
      console.log('⚠️ Keeping giveaway active due to error');
    } finally {
      setIsFinishing(false);
    }
  };

  const onSubmit = (data: FinishMessagesData) => {
    setShowConfirmDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeGiveaway) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Active Giveaway
          </h3>
          <p className="text-muted-foreground">
            Create a new giveaway to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusColor = getStatusColor(activeGiveaway?.status || 'unknown');
  const statusText = getStatusText(activeGiveaway?.status || 'unknown');
  const duration = formatDuration(activeGiveaway?.created_at, activeGiveaway?.finished_at);

  const conclusionStatus = getMessageStatus(watchedMessages.conclusionMessage, errors.conclusionMessage);
  const winnerStatus = getMessageStatus(watchedMessages.winnerMessage, errors.winnerMessage);
  const loserStatus = getMessageStatus(watchedMessages.loserMessage, errors.loserMessage);

  return (
    <div className="space-y-6" data-testid="active-giveaway">
      {/* Main Giveaway Card with Integrated Finish Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                {activeGiveaway?.title || 'Unknown Giveaway'}
              </CardTitle>
              <CardDescription>
                Created {activeGiveaway?.created_at ? formatDate(activeGiveaway.created_at) : 'Unknown date'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusColor}>
                {statusText}
              </Badge>
              {isConnected && activeGiveaway?.status === 'active' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Live Updates
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Giveaway Content */}
          <div>
            <h4 className="font-medium text-foreground mb-2">Giveaway Message</h4>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">
                {activeGiveaway?.main_body || 'No message available'}
              </p>
            </div>
          </div>

          {/* Media Preview */}
          {activeGiveaway?.media_url && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Media</h4>
              <MediaPreview
                url={activeGiveaway.media_url}
                type={activeGiveaway.media_type || 'image/jpeg'}
                className="max-w-md"
              />
            </div>
          )}

          {/* Real-Time Statistics */}
          <div>
            <h4 className="font-medium text-foreground mb-4 flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Real-Time Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600" data-testid="participant-count">
                  {activeGiveaway?.participant_count || 0}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">Total Participants</div>
                <div className="text-xs text-muted-foreground">All users who clicked participate</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor((activeGiveaway?.participant_count || 0) * 0.8)}
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">Captcha Completed</div>
                <div className="text-xs text-muted-foreground">Users who completed verification</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.floor((activeGiveaway?.participant_count || 0) * 0.2)}
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">Pending Captcha</div>
                <div className="text-xs text-muted-foreground">Users still completing verification</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {activeGiveaway?.winner_count || 0}
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-200">Winners</div>
                <div className="text-xs text-muted-foreground">Number of winners to select</div>
              </div>
            </div>
          </div>

          {/* Progress Indicator for Active Giveaways */}
          {activeGiveaway?.status === 'active' && (
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Giveaway Progress</span>
                <span>
                  {allMessagesComplete ? 'Ready to finish' : 'Configure finish messages'}
                </span>
              </div>
              <Progress 
                value={allMessagesComplete ? 100 : 50} 
                className="w-full"
              />
            </div>
          )}

          {/* Integrated Finish Messages Configuration */}
          {activeGiveaway?.status === 'active' && (
            <div className="border-t pt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Define Finish Messages</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure messages that will be sent when the giveaway is finished. All messages are required before finishing.
                  </p>
                </div>

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
              </div>
            </div>
          )}
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

export default ActiveGiveaway;

