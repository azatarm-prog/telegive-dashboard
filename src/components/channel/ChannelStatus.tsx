import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, XCircle, AlertTriangle, Hash, Users, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChannel } from '@/hooks/useChannel';
import { useAuth } from '@/hooks/useAuth';
import ChannelConfigDialog from './ChannelConfigDialog';
import { ChannelConfig } from '@/services/ChannelService';

interface ChannelStatusProps {
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

const ChannelStatus: React.FC<ChannelStatusProps> = ({ 
  showTitle = true, 
  compact = false,
  className = '' 
}) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const { 
    config, 
    loading, 
    error, 
    fetchChannelConfig, 
    verifyChannelAccess,
    verificationResult,
    clearError 
  } = useChannel();
  const { account } = useAuth();

  useEffect(() => {
    if (account?.bot_id) {
      fetchChannelConfig(account.bot_id);
    }
  }, [account?.bot_id, fetchChannelConfig]);

  const handleConfigureChannel = () => {
    setConfigDialogOpen(true);
  };

  const handleConfigSaved = (newConfig: ChannelConfig) => {
    console.log('✅ Channel configuration saved:', newConfig);
    // The Redux state will be updated automatically
  };

  const handleVerifyChannel = async () => {
    if (config?.username && account?.bot_id) {
      await verifyChannelAccess(config.username, account.bot_id);
    }
  };

  const getStatusBadge = () => {
    if (!config) {
      return (
        <Badge variant="destructive" className="flex items-center">
          <XCircle className="mr-1 h-3 w-3" />
          Not Configured
        </Badge>
      );
    }

    if (!config.isVerified || !config.botHasAdminRights) {
      return (
        <Badge variant="secondary" className="flex items-center">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Needs Verification
        </Badge>
      );
    }

    // Check if verification is old (more than 24 hours)
    const lastVerified = config.lastVerified ? new Date(config.lastVerified) : null;
    const isStale = lastVerified && (Date.now() - lastVerified.getTime()) > 24 * 60 * 60 * 1000;

    if (isStale) {
      return (
        <Badge variant="outline" className="flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          Verification Stale
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center bg-green-600">
        <CheckCircle className="mr-1 h-3 w-3" />
        Verified
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (!config) {
      return {
        type: 'error' as const,
        message: 'No Telegram channel configured. Please configure your channel to publish giveaways.',
      };
    }

    if (!config.isVerified || !config.botHasAdminRights) {
      return {
        type: 'warning' as const,
        message: 'Channel configuration needs verification. Please verify that your bot has admin rights.',
      };
    }

    const lastVerified = config.lastVerified ? new Date(config.lastVerified) : null;
    const isStale = lastVerified && (Date.now() - lastVerified.getTime()) > 24 * 60 * 60 * 1000;

    if (isStale) {
      return {
        type: 'warning' as const,
        message: 'Channel verification is more than 24 hours old. Consider re-verifying to ensure bot permissions are still valid.',
      };
    }

    return {
      type: 'success' as const,
      message: 'Channel is properly configured and verified. Ready to publish giveaways!',
    };
  };

  const statusMessage = getStatusMessage();

  if (compact) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {config ? config.username : 'No channel configured'}
          </span>
          {getStatusBadge()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConfigureChannel}
          className="ml-2"
        >
          <Settings className="h-3 w-3 mr-1" />
          {config ? 'Edit' : 'Configure'}
        </Button>
        
        {account?.bot_id && (
          <ChannelConfigDialog
            open={configDialogOpen}
            onOpenChange={setConfigDialogOpen}
            currentConfig={config}
            accountId={account.bot_id}
            onSave={handleConfigSaved}
          />
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Hash className="mr-2 h-5 w-5" />
              Telegram Channel
            </span>
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Configure and verify your Telegram channel for publishing giveaways
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Channel Information */}
        {config ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Channel Username</label>
                <p className="text-sm font-mono">{config.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Channel Title</label>
                <p className="text-sm">{config.title}</p>
              </div>
            </div>
            
            {config.memberCount && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Members</label>
                <p className="text-sm flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {config.memberCount.toLocaleString()}
                </p>
              </div>
            )}
            
            {config.lastVerified && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Verified</label>
                <p className="text-sm flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {new Date(config.lastVerified).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Hash className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No Channel Configured</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure your Telegram channel to start publishing giveaways
            </p>
          </div>
        )}

        {/* Status Alert */}
        <Alert className={
          statusMessage.type === 'success' 
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
            : statusMessage.type === 'warning'
            ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
        }>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : statusMessage.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={
            statusMessage.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : statusMessage.type === 'warning'
              ? 'text-yellow-800 dark:text-yellow-200'
              : 'text-red-800 dark:text-red-200'
          }>
            {statusMessage.message}
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleConfigureChannel}
            className="flex-1"
            disabled={loading}
          >
            <Settings className="mr-2 h-4 w-4" />
            {config ? 'Reconfigure Channel' : 'Configure Channel'}
          </Button>
          
          {config && (
            <Button
              variant="outline"
              onClick={handleVerifyChannel}
              disabled={loading || !config.username}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-verify Channel
            </Button>
          )}
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <Alert className={verificationResult.success
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          }>
            {verificationResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={verificationResult.success
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
            }>
              <strong>Verification Result:</strong> {
                verificationResult.success 
                  ? 'Channel verified successfully!'
                  : verificationResult.error || 'Verification failed'
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Channel Configuration Dialog */}
      {account?.bot_id && (
        <ChannelConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          currentConfig={config}
          accountId={account.bot_id}
          onSave={handleConfigSaved}
        />
      )}
    </Card>
  );
};

export default ChannelStatus;

