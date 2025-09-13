import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar, Users, Trophy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ParticipantList from '@/components/participants/ParticipantList';
import MediaPreview from '@/components/media/MediaPreview';
import EnhancedParticipantDetails from './EnhancedParticipantDetails';
import { useGiveaway } from '@/hooks/useGiveaway';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDuration, getStatusColor, getStatusText, truncateText } from '@/utils/formatting';
import { Giveaway } from '@/types/giveaway';

const GiveawayHistory: React.FC = () => {
  const [expandedGiveaways, setExpandedGiveaways] = useState<Set<number>>(new Set());
  const { history, historyLoading, historyError, pagination, fetchHistory, clearHistoryError } = useGiveaway();
  const { account } = useAuth();

  useEffect(() => {
    if (account) {
      fetchHistory(account.id);
    }
  }, [account, fetchHistory]);

  const toggleExpanded = (giveawayId: number) => {
    const newExpanded = new Set(expandedGiveaways);
    if (newExpanded.has(giveawayId)) {
      newExpanded.delete(giveawayId);
    } else {
      newExpanded.add(giveawayId);
    }
    setExpandedGiveaways(newExpanded);
  };

  const loadMore = () => {
    if (account && pagination.page < pagination.totalPages) {
      fetchHistory(account.id, pagination.page + 1);
    }
  };

  if (historyLoading && history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner size="lg" text="Loading giveaway history..." />
        </CardContent>
      </Card>
    );
  }

  if (historyError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            Error loading history: {historyError}
          </div>
          <Button onClick={() => {
            clearHistoryError();
            if (account) fetchHistory(account.id);
          }}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Giveaway History
          </h3>
          <p className="text-muted-foreground">
            Your completed giveaways will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Giveaway History</CardTitle>
          <CardDescription>
            View and manage your past giveaways ({pagination.total} total)
          </CardDescription>
        </CardHeader>
      </Card>

      {history.map((giveaway) => (
        <GiveawayHistoryItem
          key={giveaway.id}
          giveaway={giveaway}
          isExpanded={expandedGiveaways.has(giveaway.id)}
          onToggleExpanded={() => toggleExpanded(giveaway.id)}
        />
      ))}

      {pagination.page < pagination.totalPages && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={historyLoading}
          >
            {historyLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

interface GiveawayHistoryItemProps {
  giveaway: Giveaway;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const GiveawayHistoryItem: React.FC<GiveawayHistoryItemProps> = ({
  giveaway,
  isExpanded,
  onToggleExpanded,
}) => {
  const statusColor = getStatusColor(giveaway?.status || 'unknown');
  const statusText = getStatusText(giveaway?.status || 'unknown');
  const duration = formatDuration(giveaway?.created_at, giveaway?.finished_at);

  return (
    <Card data-testid="history-item">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">
                    {truncateText(giveaway.title, 50)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColor}>
                      {statusText}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <CardDescription>
                  {truncateText(giveaway.main_body, 100)}
                </CardDescription>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(giveaway.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {giveaway?.participant_count || 0} participants
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    {giveaway?.winner_count || 0} winners
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Giveaway Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={statusColor} variant="outline">
                        {statusText}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(giveaway.created_at)}</span>
                    </div>
                    {giveaway.finished_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Finished:</span>
                        <span>{formatDate(giveaway.finished_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Participants:</span>
                      <span className="font-medium">{giveaway?.participant_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Winners Selected:</span>
                      <span className="font-medium">{giveaway?.winner_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium">
                        {(giveaway?.participant_count || 0) > 0 
                          ? `${(((giveaway?.winner_count || 0) / (giveaway?.participant_count || 1)) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Message */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Full Message</h4>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {giveaway.main_body}
                  </p>
                </div>
              </div>

              {/* Media */}
              {giveaway.media_url && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Media</h4>
                  <MediaPreview
                    url={giveaway.media_url}
                    type={giveaway.media_type || 'image/jpeg'}
                    className="max-w-md"
                  />
                </div>
              )}

              {/* Participants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">Participants</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="expand-participants-button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </Button>
                </div>
                <ParticipantList giveawayId={giveaway.id} />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default GiveawayHistory;

