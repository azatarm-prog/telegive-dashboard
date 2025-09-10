import { useEffect, useCallback, useRef } from 'react';
import { useGiveaway } from './useGiveaway';
import { useAuth } from './useAuth';

interface RealTimeUpdateData {
  type: 'participant_joined' | 'participant_count_updated' | 'giveaway_finished';
  giveawayId: number;
  data: any;
}

export const useRealTimeUpdates = () => {
  const { activeGiveaway, updateParticipantCount } = useGiveaway();
  const { account } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!account || !activeGiveaway) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}/ws/giveaway/${activeGiveaway.id}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      
      // Send authentication
      ws.send(JSON.stringify({
        type: 'auth',
        token: localStorage.getItem('authToken'),
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: RealTimeUpdateData = JSON.parse(event.data);
        
        switch (data.type) {
          case 'participant_joined':
          case 'participant_count_updated':
            if (data.giveawayId === activeGiveaway.id) {
              updateParticipantCount(data.data.count);
            }
            break;
          case 'giveaway_finished':
            if (data.giveawayId === activeGiveaway.id) {
              // Refresh the active giveaway to get updated status
              window.location.reload();
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [account, activeGiveaway, updateParticipantCount]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    const isRealTimeEnabled = import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true';
    
    if (isRealTimeEnabled && activeGiveaway && activeGiveaway.status === 'active') {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [activeGiveaway, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    connect,
    disconnect,
  };
};

