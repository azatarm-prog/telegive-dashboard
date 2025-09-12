import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Users, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle, 
  Plus,
  Eye,
  Crown
} from 'lucide-react';

interface Winner {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  participationDate: string;
}

interface MessageDeliveryStats {
  totalParticipants: number;
  winnersNotified: number;
  losersNotified: number;
  deliveryRate: number;
}

interface PostFinishResultsProps {
  giveawayId: string;
  giveawayTitle: string;
  winners: Winner[];
  messageStats: MessageDeliveryStats;
  channelPostUrl?: string;
  onCreateNewGiveaway: () => void;
  onViewInChannel: () => void;
}

const PostFinishResults: React.FC<PostFinishResultsProps> = ({
  giveawayId,
  giveawayTitle,
  winners,
  messageStats,
  channelPostUrl,
  onCreateNewGiveaway,
  onViewInChannel,
}) => {
  const formatUsername = (winner: Winner) => {
    const displayName = `${winner.firstName} ${winner.lastName || ''}`.trim();
    return winner.username ? `@${winner.username}` : displayName;
  };

  const getDeliveryStatusColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDeliveryStatusBadge = (rate: number) => {
    if (rate >= 95) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>;
    if (rate >= 85) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Needs Attention</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Giveaway finished successfully!</strong> Winners have been selected and notifications sent.
        </AlertDescription>
      </Alert>

      {/* Winners Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
            Winners Selected
          </CardTitle>
          <CardDescription>
            {winners.length} winner{winners.length !== 1 ? 's' : ''} selected for "{giveawayTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {winners.map((winner, index) => (
              <div key={winner.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      {formatUsername(winner)}
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Participated: {new Date(winner.participationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Winner #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Delivery Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
            Message Delivery Statistics
          </CardTitle>
          <CardDescription>
            Notification delivery status for all participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{messageStats.totalParticipants}</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">Total Participants</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{messageStats.winnersNotified}</p>
              <p className="text-sm text-green-800 dark:text-green-200">Winners Notified</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{messageStats.losersNotified}</p>
              <p className="text-sm text-purple-800 dark:text-purple-200">Participants Notified</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Overall Delivery Rate</p>
              <p className="text-sm text-muted-foreground">
                {messageStats.winnersNotified + messageStats.losersNotified} of {messageStats.totalParticipants} messages delivered
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getDeliveryStatusBadge(messageStats.deliveryRate)}
              <span className={`text-lg font-bold ${getDeliveryStatusColor(messageStats.deliveryRate)}`}>
                {messageStats.deliveryRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Post Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5 text-purple-600" />
            Public Results Posted
          </CardTitle>
          <CardDescription>
            Conclusion message with VIEW RESULTS button posted to channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div>
              <p className="font-medium text-purple-900 dark:text-purple-100">
                Public conclusion with VIEW RESULTS button posted to channel
              </p>
              <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                Participants can now click VIEW RESULTS button to check their status in bot DMs
              </p>
            </div>
            <Button 
              onClick={onViewInChannel}
              variant="outline" 
              size="sm"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View in Channel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onCreateNewGiveaway}
          className="flex-1"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Giveaway
        </Button>
        <Button 
          onClick={onViewInChannel}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <ExternalLink className="mr-2 h-5 w-5" />
          View Results in Channel
        </Button>
      </div>

      {/* Additional Info */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          This giveaway has been moved to your history. You can view detailed participant information and statistics in the History section.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PostFinishResults;

