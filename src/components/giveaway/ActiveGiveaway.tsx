import React, { useEffect } from 'react';
import { Users, Calendar, Trophy, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MediaPreview from '@/components/media/MediaPreview';
import FinishMessages from './FinishMessages';
import { useGiveaway } from '@/hooks/useGiveaway';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { formatDate, formatDuration, getStatusColor, getStatusText } from '@/utils/formatting';

const ActiveGiveaway: React.FC = () => {
  const { activeGiveaway, loading } = useGiveaway();
  const { isConnected } = useRealTimeUpdates();

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

  const statusColor = getStatusColor(activeGiveaway.status);
  const statusText = getStatusText(activeGiveaway.status);
  const duration = formatDuration(activeGiveaway.created_at, activeGiveaway.finished_at);

  return (
    <div className="space-y-6" data-testid="active-giveaway">
      {/* Main Giveaway Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                {activeGiveaway.title}
              </CardTitle>
              <CardDescription>
                Created {formatDate(activeGiveaway.created_at)}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusColor}>
                {statusText}
              </Badge>
              {isConnected && activeGiveaway.status === 'active' && (
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
                {activeGiveaway.main_body}
              </p>
            </div>
          </div>

          {/* Media Preview */}
          {activeGiveaway.media_url && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Media</h4>
              <MediaPreview
                url={activeGiveaway.media_url}
                type={activeGiveaway.media_type || 'image/jpeg'}
                className="max-w-md"
              />
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Participants</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="participant-count">
                  {activeGiveaway.participant_count}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Winners</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeGiveaway.winner_count}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Duration</p>
                <p className="text-lg font-bold text-purple-600">
                  {duration}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator for Active Giveaways */}
          {activeGiveaway.status === 'active' && (
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Giveaway Progress</span>
                <span>
                  {activeGiveaway.messages_ready_for_finish ? 'Ready to finish' : 'Configure finish messages'}
                </span>
              </div>
              <Progress 
                value={activeGiveaway.messages_ready_for_finish ? 100 : 50} 
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finish Messages Configuration */}
      {activeGiveaway.status === 'active' && (
        <FinishMessages giveaway={activeGiveaway} />
      )}
    </div>
  );
};

export default ActiveGiveaway;

