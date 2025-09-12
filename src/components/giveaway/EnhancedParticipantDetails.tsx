import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Trophy, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Participant {
  id: string;
  username?: string;
  firstName: string;
  lastName?: string;
  participationTimestamp: string;
  captchaStatus: 'completed' | 'not_completed' | 'pending';
  isWinner: boolean;
  previousParticipations: number;
  joinDate: string;
  winLossRecord: {
    wins: number;
    participations: number;
  };
}

interface ParticipantStats {
  totalParticipants: number;
  captchaCompleted: number;
  captchaCompletionRate: number;
  winners: number;
  averageParticipationTime: string;
}

interface EnhancedParticipantDetailsProps {
  giveawayId: string;
  giveawayTitle: string;
  participants: Participant[];
  stats: ParticipantStats;
  onExportList: () => void;
}

const EnhancedParticipantDetails: React.FC<EnhancedParticipantDetailsProps> = ({
  giveawayId,
  giveawayTitle,
  participants,
  stats,
  onExportList,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'winners' | 'captcha_completed' | 'captcha_pending'>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = !searchTerm || 
      participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'winners' && participant.isWinner) ||
      (filterStatus === 'captcha_completed' && participant.captchaStatus === 'completed') ||
      (filterStatus === 'captcha_pending' && participant.captchaStatus !== 'completed');

    return matchesSearch && matchesFilter;
  });

  const formatUsername = (participant: Participant) => {
    const displayName = `${participant.firstName} ${participant.lastName || ''}`.trim();
    return participant.username ? `@${participant.username}` : displayName;
  };

  const getCaptchaStatusBadge = (status: Participant['captchaStatus']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✅ Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⏳ Pending</Badge>;
      case 'not_completed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">❌ Not Completed</Badge>;
    }
  };

  const getCaptchaIcon = (status: Participant['captchaStatus']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'not_completed':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Participant Details
            </CardTitle>
            <CardDescription>
              View and manage participants for "{giveawayTitle}"
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Expand Participants
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Participant Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.totalParticipants}</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Total Participants</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.captchaCompleted}</p>
            <p className="text-sm text-green-800 dark:text-green-200">Captcha Completed</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.winners}</p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">Winners Selected</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.captchaCompletionRate.toFixed(1)}%</p>
            <p className="text-sm text-purple-800 dark:text-purple-200">Success Rate</p>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'winners' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('winners')}
                >
                  <Trophy className="mr-1 h-3 w-3" />
                  Winners
                </Button>
                <Button
                  variant={filterStatus === 'captcha_completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('captcha_completed')}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportList}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>

            {/* Participant List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {participant.isWinner ? (
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      ) : (
                        getCaptchaIcon(participant.captchaStatus)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-foreground">
                          {formatUsername(participant)}
                        </p>
                        {participant.isWinner && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            🏆 Winner
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Joined: {new Date(participant.participationTimestamp).toLocaleDateString()}
                        </span>
                        <span>
                          Previous: {participant.previousParticipations} giveaways
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getCaptchaStatusBadge(participant.captchaStatus)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Participant Details</DialogTitle>
                          <DialogDescription>
                            Detailed information for {formatUsername(participant)}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedParticipant && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                <p className="text-sm text-foreground">{selectedParticipant.id}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Join Date</p>
                                <p className="text-sm text-foreground">
                                  {new Date(selectedParticipant.joinDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Participations</p>
                                <p className="text-sm text-foreground">{selectedParticipant.winLossRecord.participations}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Wins</p>
                                <p className="text-sm text-foreground">{selectedParticipant.winLossRecord.wins}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Win Rate</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${(selectedParticipant.winLossRecord.wins / Math.max(selectedParticipant.winLossRecord.participations, 1)) * 100}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-foreground">
                                  {((selectedParticipant.winLossRecord.wins / Math.max(selectedParticipant.winLossRecord.participations, 1)) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No participants found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedParticipantDetails;

