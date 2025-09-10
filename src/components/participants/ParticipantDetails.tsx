import React from 'react';
import { useSelector } from 'react-redux';
import { X, User, Calendar, CheckCircle, Clock, Crown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RootState } from '@/store';
import { formatUsername, formatFullName, formatDate } from '@/utils/formatting';

interface ParticipantDetailsProps {
  participantId: number;
  giveawayId: number;
  onClose: () => void;
}

const ParticipantDetails: React.FC<ParticipantDetailsProps> = ({
  participantId,
  giveawayId,
  onClose,
}) => {
  const participants = useSelector((state: RootState) => state.participant.participants[giveawayId] || []);
  const participant = participants.find(p => p.id === participantId);

  if (!participant) {
    return null;
  }

  const getInitials = (firstName: string, lastName?: string) => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  const openTelegramProfile = () => {
    if (participant.username) {
      window.open(`https://t.me/${participant.username.replace('@', '')}`, '_blank');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Participant Details</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(participant.first_name, participant.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatFullName(participant.first_name, participant.last_name)}
              </h3>
              <p className="text-gray-500">
                {formatUsername(participant.username)}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {participant.captcha_completed ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Verification
                  </Badge>
                )}
                
                {participant.is_winner && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-600">User ID</label>
                <p className="text-gray-900">{participant.user_id}</p>
              </div>
              <div>
                <label className="font-medium text-gray-600">Participant ID</label>
                <p className="text-gray-900">{participant.id}</p>
              </div>
            </div>

            <div>
              <label className="font-medium text-gray-600">Joined Date</label>
              <p className="text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(participant.participated_at)}
              </p>
            </div>

            <div>
              <label className="font-medium text-gray-600">Verification Status</label>
              <div className="mt-1">
                {participant.captcha_completed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Captcha completed successfully</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Captcha verification pending</span>
                  </div>
                )}
              </div>
            </div>

            {participant.is_winner && (
              <div>
                <label className="font-medium text-gray-600">Winner Status</label>
                <div className="mt-1 flex items-center text-yellow-600">
                  <Crown className="h-4 w-4 mr-2" />
                  <span>Selected as winner</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="space-y-2">
            {participant.username && (
              <Button
                variant="outline"
                className="w-full"
                onClick={openTelegramProfile}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Telegram Profile
              </Button>
            )}
          </div>

          {/* Additional Information */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                This participant joined the giveaway on {formatDate(participant.participated_at)}.
              </p>
              {participant.captcha_completed ? (
                <p>
                  They have successfully completed the verification process and are eligible to win.
                </p>
              ) : (
                <p>
                  They have not yet completed the verification process and may not be eligible for selection.
                </p>
              )}
              {participant.is_winner && (
                <p className="text-yellow-600 font-medium">
                  This participant was selected as a winner in this giveaway.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantDetails;

