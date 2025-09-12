import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  AlertTriangle, 
  RefreshCw,
  CheckCircle 
} from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  onReconnect?: () => void;
  showReconnectButton?: boolean;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  onReconnect,
  showReconnectButton = true,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          label: 'Connected',
          description: 'Real-time updates active',
          badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          iconClass: 'text-green-600',
          showAlert: false,
        };
      
      case 'connecting':
        return {
          icon: Loader2,
          label: 'Connecting',
          description: 'Establishing connection...',
          badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          iconClass: 'text-blue-600 animate-spin',
          showAlert: false,
        };
      
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          description: 'Real-time updates unavailable',
          badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          iconClass: 'text-gray-600',
          showAlert: true,
          alertVariant: 'default' as const,
        };
      
      case 'error':
        return {
          icon: AlertTriangle,
          label: 'Connection Error',
          description: 'Failed to connect to real-time service',
          badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          iconClass: 'text-red-600',
          showAlert: true,
          alertVariant: 'destructive' as const,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={className}>
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge className={config.badgeClass}>
          <IconComponent className={`mr-1 h-3 w-3 ${config.iconClass}`} />
          {config.label}
        </Badge>
        
        {showReconnectButton && (status === 'disconnected' || status === 'error') && onReconnect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </div>

      {/* Alert for disconnected/error states */}
      {config.showAlert && (
        <Alert variant={config.alertVariant} className="mt-2">
          <IconComponent className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{config.description}</span>
              {showReconnectButton && onReconnect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReconnect}
                  className="ml-2"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Reconnect
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectionStatus;

