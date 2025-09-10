import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp, Users, CheckCircle, Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ParticipantStats from './ParticipantStats';
import ParticipantDetails from './ParticipantDetails';
import { RootState, AppDispatch } from '@/store';
import { fetchParticipants } from '@/store/slices/participantSlice';
import { formatUsername, formatFullName, formatDate } from '@/utils/formatting';

interface ParticipantListProps {
  giveawayId: number;
  showStats?: boolean;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  giveawayId,
  showStats = true,
  collapsible = true,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const participants = useSelector((state: RootState) => state.participant.participants[giveawayId] || []);
  const stats = useSelector((state: RootState) => state.participant.stats[giveawayId]);
  const loading = useSelector((state: RootState) => state.participant.loading[giveawayId] || false);
  const error = useSelector((state: RootState) => state.participant.error[giveawayId]);

  useEffect(() => {
    if (isExpanded && participants.length === 0 && !loading) {
      dispatch(fetchParticipants({ giveawayId }));
    }
  }, [dispatch, giveawayId, isExpanded, participants.length, loading]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderParticipantItem = (participant: any, index: number) => (
    <div
      key={participant.id}
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => setSelectedParticipant(participant.id)}
      data-testid="participant-item"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {index + 1}
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">
              {formatFullName(participant.first_name, participant.last_name)}
            </p>
            {participant.is_winner && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formatUsername(participant.username)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge
          variant={participant.captcha_completed ? "default" : "secondary"}
          className={participant.captcha_completed ? "bg-green-100 text-green-800" : ""}
        >
          {participant.captcha_completed ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </>
          )}
        </Badge>
        
        {participant.is_winner && (
          <Badge className="bg-yellow-100 text-yellow-800">
            Winner
          </Badge>
        )}
      </div>
    </div>
  );

  const content = (
    <div className="space-y-4" data-testid="participant-list">
      {showStats && stats && (
        <ParticipantStats stats={stats} />
      )}

      {loading && participants.length === 0 ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" text="Loading participants..." />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Error loading participants: {error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => dispatch(fetchParticipants({ giveawayId }))}
          >
            Try Again
          </Button>
        </div>
      ) : participants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No participants yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant, index) => 
            renderParticipantItem(participant, index)
          )}
        </div>
      )}

      {/* Participant Details Modal */}
      {selectedParticipant && (
        <ParticipantDetails
          participantId={selectedParticipant}
          giveawayId={giveawayId}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );

  if (!collapsible) {
    return content;
  }

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Participants
                {stats && (
                  <Badge variant="outline" className="ml-2">
                    {stats.total}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            {content}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ParticipantList;

