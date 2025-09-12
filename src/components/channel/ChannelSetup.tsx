import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Users, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChannelInfo {
  id: string;
  name: string;
  username: string;
  subscriberCount: number;
  permissions: {
    canPost: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

interface ChannelSetupProps {
  onChannelConfigured?: (channel: ChannelInfo) => void;
}

const ChannelSetup: React.FC<ChannelSetupProps> = ({ onChannelConfigured }) => {
  const { account } = useAuth();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedChannel, setDetectedChannel] = useState<ChannelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'instructions' | 'detecting' | 'success' | 'error'>('instructions');

  const handleDetectChannel = async () => {
    if (!account) return;

    setIsDetecting(true);
    setError(null);
    setSetupStep('detecting');

    try {
      // Call Channel Service to detect channels
      const response = await fetch(`https://telegive-channel-service.railway.app/api/channels/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          accountId: account.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to detect channel');
      }

      const channelData = await response.json();
      
      // Mock channel data for now (replace with actual API response)
      const mockChannel: ChannelInfo = {
        id: channelData.id || '-1001234567890',
        name: channelData.name || 'Test Giveaway Channel',
        username: channelData.username || '@testgiveawaychannel',
        subscriberCount: channelData.subscriberCount || 1250,
        permissions: {
          canPost: channelData.permissions?.canPost ?? true,
          canEdit: channelData.permissions?.canEdit ?? true,
          canDelete: channelData.permissions?.canDelete ?? false,
        },
      };

      setDetectedChannel(mockChannel);
      setSetupStep('success');
      onChannelConfigured?.(mockChannel);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setSetupStep('error');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRetry = () => {
    setSetupStep('instructions');
    setError(null);
    setDetectedChannel(null);
  };

  if (setupStep === 'success' && detectedChannel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            Channel Configured Successfully
          </CardTitle>
          <CardDescription>
            Your bot is properly configured and ready for giveaways
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-900 dark:text-green-100">
                {detectedChannel.name}
              </h4>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200 mb-3">
              {detectedChannel.username}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  {detectedChannel.subscriberCount.toLocaleString()} subscribers
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  {detectedChannel.permissions.canPost ? 'Can post' : 'Cannot post'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  {detectedChannel.permissions.canEdit ? 'Can edit' : 'Cannot edit'}
                </span>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your channel is ready for giveaways! You can now create and manage giveaways.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Channel Setup Required
        </CardTitle>
        <CardDescription>
          Configure your Telegram channel to start creating giveaways
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {setupStep === 'instructions' && (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please add your bot as admin to a channel first
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Setup Instructions:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>Add <code className="bg-muted px-1 rounded">@{account?.username || 'yourbotname'}</code> as admin to your channel</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>Give the bot posting and editing permissions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>Click "Detect Channel" below</span>
                </li>
              </ol>
            </div>

            <Button 
              onClick={handleDetectChannel}
              disabled={isDetecting}
              className="w-full"
            >
              {isDetecting ? 'Detecting Channel...' : 'Detect Channel'}
            </Button>
          </>
        )}

        {setupStep === 'detecting' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Detecting channel...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few seconds
            </p>
          </div>
        )}

        {setupStep === 'error' && error && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Common issues:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Bot is not added as admin to any channel</li>
                <li>Bot has insufficient permissions (needs posting and editing rights)</li>
                <li>Multiple channels detected (remove bot from other channels)</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleDetectChannel} disabled={isDetecting} className="flex-1">
                {isDetecting ? 'Detecting...' : 'Retry Detection'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelSetup;

