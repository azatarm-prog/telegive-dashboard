import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FinishMessagesProps {
  onFinish?: (messages: any) => void;
}

const FinishMessages: React.FC<FinishMessagesProps> = ({ onFinish }) => {
  const [winnerMessage, setWinnerMessage] = useState('');
  const [loserMessage, setLoserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onFinish?.({ winnerMessage, loserMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish Messages</CardTitle>
        <CardDescription>
          Configure messages for winners and participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="winner" className="block text-sm font-medium text-gray-700">
              Winner Message
            </label>
            <textarea
              id="winner"
              value={winnerMessage}
              onChange={(e) => setWinnerMessage(e.target.value)}
              placeholder="Message for winners"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="loser" className="block text-sm font-medium text-gray-700">
              Participant Message
            </label>
            <textarea
              id="loser"
              value={loserMessage}
              onChange={(e) => setLoserMessage(e.target.value)}
              placeholder="Message for other participants"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Messages'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinishMessages;
