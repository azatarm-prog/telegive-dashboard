import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Settings, Shield, Users, Hash, Trophy, Eye } from 'lucide-react';

interface DefaultSettingsPanelProps {
  channelName?: string;
  className?: string;
}

const DefaultSettingsPanel: React.FC<DefaultSettingsPanelProps> = ({ 
  channelName = '@yourchannel',
  className = '' 
}) => {
  const defaultSettings = [
    {
      icon: Users,
      label: 'Subscription Required',
      value: 'Always enabled',
      description: 'Users must be subscribed to the channel to participate',
      status: 'enabled' as const,
    },
    {
      icon: Hash,
      label: 'Channel',
      value: channelName,
      description: 'Auto-detected channel where giveaways will be posted',
      status: 'configured' as const,
    },
    {
      icon: Shield,
      label: 'Captcha',
      value: 'Math captcha for first-time users',
      description: 'Prevents bot participation and ensures real users',
      status: 'enabled' as const,
    },
    {
      icon: Trophy,
      label: 'Winner Selection',
      value: 'Random cryptographic selection',
      description: 'Provably fair winner selection using cryptographic randomness',
      status: 'enabled' as const,
    },
    {
      icon: Eye,
      label: 'Result Checking',
      value: 'VIEW RESULTS button automatically added',
      description: 'Participants can check their status via bot DMs',
      status: 'enabled' as const,
    },
  ];

  const getStatusBadge = (status: 'enabled' | 'configured') => {
    switch (status) {
      case 'enabled':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Always Enabled</Badge>;
      case 'configured':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Auto-detected</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Default Settings
        </CardTitle>
        <CardDescription>
          These settings are automatically configured and cannot be changed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {defaultSettings.map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-muted-foreground mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {setting.label}
                    </h4>
                    {getStatusBadge(setting.status)}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {setting.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Optimized for Security & Fairness
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                These settings ensure your giveaways are secure, fair, and compliant with Telegram's terms of service.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefaultSettingsPanel;

