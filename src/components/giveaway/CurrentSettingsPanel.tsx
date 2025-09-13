import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Webhook, Users, Hash, Shield, Trophy, Eye, CheckCircle } from 'lucide-react';
import { Giveaway } from '@/types/giveaway';

interface CurrentSettingsPanelProps {
  giveaway: Giveaway;
  className?: string;
}

const CurrentSettingsPanel: React.FC<CurrentSettingsPanelProps> = ({ 
  giveaway,
  className = '' 
}) => {
  const currentSettings = [
    {
      icon: Database,
      label: 'Database',
      value: 'PostgreSQL',
      description: 'Secure and reliable data storage',
      status: 'active' as const,
    },
    {
      icon: Webhook,
      label: 'Bot Mode',
      value: 'Webhook',
      description: 'Real-time message processing',
      status: 'active' as const,
    },
    {
      icon: Users,
      label: 'Subscription',
      value: 'Required',
      description: 'Users must be subscribed to participate',
      status: 'enforced' as const,
    },
    {
      icon: Hash,
      label: 'Channel',
      value: giveaway.channel_name || '@yourchannel',
      description: 'Target channel for this giveaway',
      status: 'configured' as const,
    },
    {
      icon: Shield,
      label: 'Captcha',
      value: 'Math captcha for new users',
      description: 'Anti-bot protection system',
      status: 'active' as const,
    },
    {
      icon: Trophy,
      label: 'Winner Selection',
      value: 'Random cryptographic',
      description: 'Provably fair selection algorithm',
      status: 'active' as const,
    },
    {
      icon: Eye,
      label: 'Result Checking',
      value: 'VIEW RESULTS button',
      description: 'Automatic result checking via bot DMs',
      status: 'active' as const,
    },
  ];

  const getStatusBadge = (status: 'active' | 'enforced' | 'configured') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'enforced':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Enforced</Badge>;
      case 'configured':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Configured</Badge>;
    }
  };

  const getStatusColor = (status: 'active' | 'enforced' | 'configured') => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'enforced':
        return 'text-blue-600';
      case 'configured':
        return 'text-purple-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
          Current Settings
        </CardTitle>
        <CardDescription>
          Active configuration for "{giveaway.title}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentSettings.map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-4 w-4 ${getStatusColor(setting.status)}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {setting.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(setting.status)}
                  <p className="text-xs font-medium text-foreground">
                    {setting.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                System Status: Operational
              </p>
              <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                All systems are running normally. Participants can join and interact with the giveaway.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
            <p className="text-lg font-bold text-blue-600">{giveaway?.participant_count || 0}</p>
            <p className="text-xs text-blue-800 dark:text-blue-200">Total Participants</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded">
            <p className="text-lg font-bold text-purple-600">{giveaway?.winner_count || 0}</p>
            <p className="text-xs text-purple-800 dark:text-purple-200">Winners to Select</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSettingsPanel;

