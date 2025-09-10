import React from 'react';
import { Users, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ParticipantStats as ParticipantStatsType } from '@/types/participant';
import { formatNumber, formatPercentage } from '@/utils/formatting';

interface ParticipantStatsProps {
  stats: ParticipantStatsType;
  className?: string;
}

const ParticipantStats: React.FC<ParticipantStatsProps> = ({ stats, className }) => {
  const completionRate = stats.total > 0 ? (stats.captcha_completed / stats.total) * 100 : 0;
  const winnerRate = stats.winners && stats.total > 0 ? (stats.winners / stats.total) * 100 : 0;

  return (
    <div className={className} data-testid="participant-stats">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(stats.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.captcha_completed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(stats.captcha_pending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.winners !== undefined && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Winners</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatNumber(stats.winners)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Indicators */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Verification Rate</span>
            <span>{formatPercentage(stats.captcha_completed, stats.total)}</span>
          </div>
          <Progress value={completionRate} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">
            {formatNumber(stats.captcha_completed)} of {formatNumber(stats.total)} participants have completed verification
          </p>
        </div>

        {stats.winners !== undefined && stats.winners > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Winner Rate</span>
              <span>{formatPercentage(stats.winners, stats.total)}</span>
            </div>
            <Progress value={winnerRate} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(stats.winners)} winners selected from {formatNumber(stats.total)} participants
            </p>
          </div>
        )}
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Breakdown</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Participants:</span>
            <span className="font-medium">{formatNumber(stats.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Verification Rate:</span>
            <span className="font-medium">{formatPercentage(stats.captcha_completed, stats.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Verified Users:</span>
            <span className="font-medium text-green-600">{formatNumber(stats.captcha_completed)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Users:</span>
            <span className="font-medium text-orange-600">{formatNumber(stats.captcha_pending)}</span>
          </div>
          {stats.winners !== undefined && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Winners:</span>
                <span className="font-medium text-yellow-600">{formatNumber(stats.winners)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Winner Rate:</span>
                <span className="font-medium">{formatPercentage(stats.winners, stats.total)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantStats;

