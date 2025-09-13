import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, CheckCircle, XCircle, AlertTriangle, Hash, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChannel } from '@/hooks/useChannel';
import { ChannelConfig } from '@/services/ChannelService';

const channelConfigSchema = z.object({
  channelUsername: z.string()
    .min(1, 'Channel username is required')
    .regex(/^@?[a-zA-Z0-9_]{5,32}$/, 'Invalid channel username format (e.g., @mychannel or mychannel)')
    .transform(val => val.startsWith('@') ? val : `@${val}`),
  channelTitle: z.string()
    .min(1, 'Channel title is required')
    .max(100, 'Channel title must be less than 100 characters'),
});

type ChannelConfigData = z.infer<typeof channelConfigSchema>;

interface ChannelConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig?: ChannelConfig | null;
  accountId: number;
  onSave?: (config: ChannelConfig) => void;
}

const ChannelConfigDialog: React.FC<ChannelConfigDialogProps> = ({
  open,
  onOpenChange,
  currentConfig,
  accountId,
  onSave,
}) => {
  const { 
    verifyChannelAccess, 
    saveChannelConfig, 
    verificationLoading, 
    verificationResult,
    loading,
    error,
    clearVerificationResult 
  } = useChannel();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<ChannelConfigData>({
    resolver: zodResolver(channelConfigSchema),
    mode: 'onChange',
    defaultValues: {
      channelUsername: currentConfig?.username || '',
      channelTitle: currentConfig?.title || '',
    },
  });

  const watchedValues = watch();

  const handleVerifyChannel = async () => {
    if (!isValid) return;

    try {
      console.log('🔍 Verifying channel:', watchedValues.channelUsername);
      const result = await verifyChannelAccess(watchedValues.channelUsername);
      
      if (result.type === 'channel/verifyAccess/fulfilled') {
        const verificationData = result.payload;
        
        // Auto-fill channel title if verification was successful and title is available
        if (verificationData.success && verificationData.channelTitle && !watchedValues.channelTitle) {
          setValue('channelTitle', verificationData.channelTitle);
        }
      }
    } catch (error: any) {
      console.error('❌ Channel verification failed:', error);
    }
  };

  const handleSaveConfig = async (data: ChannelConfigData) => {
    if (!verificationResult?.success || !verificationResult.botIsAdmin) {
      return;
    }

    try {
      const config: ChannelConfig = {
        username: data.channelUsername,
        title: data.channelTitle,
        memberCount: verificationResult.memberCount,
        isVerified: true,
        botHasAdminRights: true,
        lastVerified: new Date().toISOString(),
      };

      const result = await saveChannelConfig(accountId, config);
      
      if (result.type === 'channel/saveConfig/fulfilled') {
        console.log('✅ Channel configuration saved successfully');
        onSave?.(config);
        onOpenChange(false);
        reset();
        clearVerificationResult();
      }
    } catch (error: any) {
      console.error('❌ Failed to save channel config:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
    clearVerificationResult();
  };

  const getVerificationMessage = () => {
    if (!verificationResult) return null;

    if (verificationResult.success && verificationResult.botIsAdmin && verificationResult.botCanPostMessages) {
      return {
        type: 'success' as const,
        message: 'Channel verified successfully! Bot has admin rights and can post messages.',
        details: verificationResult,
      };
    } else if (verificationResult.success && verificationResult.channelExists && !verificationResult.botIsAdmin) {
      return {
        type: 'error' as const,
        message: 'Channel found, but bot does not have admin rights. Please add the bot as an admin with "Post Messages" permission.',
        details: verificationResult,
      };
    } else if (verificationResult.success && verificationResult.botIsAdmin && !verificationResult.botCanPostMessages) {
      return {
        type: 'error' as const,
        message: 'Bot is admin but cannot post messages. Please grant "Post Messages" permission.',
        details: verificationResult,
      };
    } else if (!verificationResult.success && !verificationResult.channelExists) {
      return {
        type: 'error' as const,
        message: 'Channel not found or bot cannot access it. Please check the channel username and ensure the bot is added to the channel.',
        details: verificationResult,
      };
    } else {
      return {
        type: 'error' as const,
        message: verificationResult.error || 'Channel verification failed. Please try again.',
        details: verificationResult,
      };
    }
  };

  const verificationMessage = getVerificationMessage();
  const canSave = verificationResult?.success && verificationResult.botIsAdmin && verificationResult.botCanPostMessages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Configure Telegram Channel
          </DialogTitle>
          <DialogDescription>
            Specify your Telegram channel and verify that your bot has admin rights to publish giveaways.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSaveConfig)} className="space-y-6">
          {/* Channel Username Input */}
          <div className="space-y-2">
            <Label htmlFor="channelUsername" className="flex items-center">
              <Hash className="mr-1 h-4 w-4" />
              Channel Username
            </Label>
            <Input
              id="channelUsername"
              placeholder="@mychannel or mychannel"
              {...register('channelUsername')}
              className={errors.channelUsername ? 'border-red-500' : ''}
            />
            {errors.channelUsername && (
              <p className="text-sm text-red-600">{errors.channelUsername.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your channel username (with or without @). Example: @mychannel
            </p>
          </div>

          {/* Channel Title Input */}
          <div className="space-y-2">
            <Label htmlFor="channelTitle" className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              Channel Title
            </Label>
            <Input
              id="channelTitle"
              placeholder="My Awesome Channel"
              {...register('channelTitle')}
              className={errors.channelTitle ? 'border-red-500' : ''}
            />
            {errors.channelTitle && (
              <p className="text-sm text-red-600">{errors.channelTitle.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The display name of your channel (will be auto-filled after verification)
            </p>
          </div>

          {/* Verification Button */}
          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleVerifyChannel}
              disabled={!isValid || verificationLoading}
              variant="outline"
              className="w-full"
            >
              {verificationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Verifying Channel...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Channel & Bot Permissions
                </>
              )}
            </Button>

            {/* Verification Result */}
            {verificationMessage && (
              <Alert className={verificationMessage.type === 'success'
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
              }>
                {verificationMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={verificationMessage.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
                }>
                  {verificationMessage.message}
                  {verificationMessage.details?.memberCount && (
                    <div className="mt-2 text-sm">
                      <strong>Channel Info:</strong> {verificationMessage.details.memberCount.toLocaleString()} members
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="space-y-1">
                <p><strong>1. Add Bot to Channel:</strong></p>
                <p className="text-muted-foreground ml-4">
                  Go to your Telegram channel → Add Members → Search for your bot → Add as Admin
                </p>
              </div>
              <div className="space-y-1">
                <p><strong>2. Grant Admin Rights:</strong></p>
                <p className="text-muted-foreground ml-4">
                  Ensure the bot has "Post Messages" and "Edit Messages" permissions
                </p>
              </div>
              <div className="space-y-1">
                <p><strong>3. Verify Configuration:</strong></p>
                <p className="text-muted-foreground ml-4">
                  Click "Verify Channel" to confirm the bot can access your channel
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!canSave || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelConfigDialog;

