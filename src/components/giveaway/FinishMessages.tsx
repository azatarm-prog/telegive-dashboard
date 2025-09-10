import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGiveaway } from '@/hooks/useGiveaway';
import { finishMessagesSchema } from '@/utils/validation';
import { FinishMessages as FinishMessagesType, Giveaway } from '@/types/giveaway';

interface FinishMessagesProps {
  giveaway: Giveaway;
}

const FinishMessages: React.FC<FinishMessagesProps> = ({ giveaway }) => {
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const { updateFinishMessages, finishGiveaway, loading, error, clearError } = useGiveaway();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<FinishMessagesType>({
    resolver: zodResolver(finishMessagesSchema),
    defaultValues: {
      conclusionMessage: giveaway.conclusion_message || '',
      winnerMessage: giveaway.winner_message || '',
      loserMessage: giveaway.loser_message || '',
    },
  });

  const watchedValues = watch();

  // Update form values when giveaway data changes
  useEffect(() => {
    if (giveaway.conclusion_message) {
      setValue('conclusionMessage', giveaway.conclusion_message);
    }
    if (giveaway.winner_message) {
      setValue('winnerMessage', giveaway.winner_message);
    }
    if (giveaway.loser_message) {
      setValue('loserMessage', giveaway.loser_message);
    }
  }, [giveaway, setValue]);

  const onSubmit = async (data: FinishMessagesType) => {
    clearError();

    try {
      const result = await updateFinishMessages(giveaway.id, data);
      
      if (result.type === 'giveaway/updateFinishMessages/fulfilled') {
        // Messages updated successfully
      }
    } catch (err) {
      console.error('Error updating finish messages:', err);
    }
  };

  const handleFinishGiveaway = async () => {
    clearError();

    try {
      const result = await finishGiveaway(giveaway.id);
      
      if (result.type === 'giveaway/finish/fulfilled') {
        setShowFinishDialog(false);
        // Giveaway finished successfully
      }
    } catch (err) {
      console.error('Error finishing giveaway:', err);
    }
  };

  const isFormValid = !Object.keys(errors).length && 
    watchedValues.conclusionMessage && 
    watchedValues.winnerMessage && 
    watchedValues.loserMessage;

  const canFinish = giveaway.messages_ready_for_finish && giveaway.participant_count > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Finish Messages Configuration
          </CardTitle>
          <CardDescription>
            Configure the messages that will be sent when the giveaway is finished
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {giveaway.messages_ready_for_finish && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Finish messages are configured and ready. You can now finish the giveaway.
                </AlertDescription>
              </Alert>
            )}

            {/* Public Conclusion Message */}
            <div className="space-y-2">
              <Label htmlFor="conclusionMessage">
                Public Conclusion Message
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="conclusionMessage"
                placeholder="Thank you all for participating! The giveaway has ended and winners have been selected."
                rows={3}
                {...register('conclusionMessage')}
                className={errors.conclusionMessage ? 'border-red-500' : ''}
                data-testid="conclusion-message-input"
              />
              {errors.conclusionMessage && (
                <p className="text-sm text-red-500">{errors.conclusionMessage.message}</p>
              )}
              <p className="text-xs text-gray-500">
                This message will be posted publicly in the channel when the giveaway ends
              </p>
            </div>

            {/* Winner Message */}
            <div className="space-y-2">
              <Label htmlFor="winnerMessage">
                Winner Private Message
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="winnerMessage"
                placeholder="Congratulations! You have won our giveaway! Please contact us to claim your prize."
                rows={3}
                {...register('winnerMessage')}
                className={errors.winnerMessage ? 'border-red-500' : ''}
                data-testid="winner-message-input"
              />
              {errors.winnerMessage && (
                <p className="text-sm text-red-500">{errors.winnerMessage.message}</p>
              )}
              <p className="text-xs text-gray-500">
                This message will be sent privately to each winner
              </p>
            </div>

            {/* Loser Message */}
            <div className="space-y-2">
              <Label htmlFor="loserMessage">
                Non-Winner Private Message
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="loserMessage"
                placeholder="Thank you for participating in our giveaway! Better luck next time."
                rows={3}
                {...register('loserMessage')}
                className={errors.loserMessage ? 'border-red-500' : ''}
                data-testid="loser-message-input"
              />
              {errors.loserMessage && (
                <p className="text-sm text-red-500">{errors.loserMessage.message}</p>
              )}
              <p className="text-xs text-gray-500">
                This message will be sent privately to participants who didn't win
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="outline"
                disabled={loading || !isDirty}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save Messages
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => setShowFinishDialog(true)}
                disabled={!canFinish || loading}
                className="flex-1"
                data-testid="finish-button"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finish Giveaway
              </Button>
            </div>

            {!canFinish && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {giveaway.participant_count === 0 
                    ? 'Cannot finish giveaway: No participants yet'
                    : 'Please save the finish messages before finishing the giveaway'
                  }
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent data-testid="finish-confirmation">
          <DialogHeader>
            <DialogTitle>Finish Giveaway</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish this giveaway? This action cannot be undone.
              Winners will be selected randomly and all configured messages will be sent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p><strong>Participants:</strong> {giveaway.participant_count}</p>
              <p><strong>Winners to select:</strong> {giveaway.winner_count}</p>
              <p><strong>Messages configured:</strong> ✅ Ready</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinishGiveaway}
              disabled={loading}
              data-testid="confirm-finish"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Finishing...
                </>
              ) : (
                'Finish Giveaway'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinishMessages;

