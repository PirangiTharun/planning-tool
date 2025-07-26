/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';

interface SocketMessage {
  action?: string;  // For outgoing messages
  event?: string;   // For incoming messages
  body: any;
}

export const useSocket = (roomId: string | null, participantId?: string | null, shouldConnect: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const hasConnected = useRef<boolean>(false);
  const currentRoomId = useRef<string | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const connectionStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!roomId || !shouldConnect) return;

    // Prevent duplicate connections for the same room
    if (hasConnected.current && currentRoomId.current === roomId && ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected for room:', roomId);
      return;
    }

    // Close existing connection if it exists
    if (ws.current) {
      ws.current.close();
    }

    console.log('Creating new WebSocket connection for room:', roomId);
    const socket = new WebSocket('wss://p36qj64mw7.execute-api.us-east-1.amazonaws.com/production');
    ws.current = socket;
    currentRoomId.current = roomId;

    // Add beforeunload listener to cleanup on page refresh/close
    const handleBeforeUnload = () => {
      if (participantId && socket.readyState === WebSocket.OPEN) {
        // Use sendBeacon for reliable message delivery during page unload
        const disconnectMessage = JSON.stringify({
          action: 'disconnectSocket',
          body: { participantId }
        });
        
        // Try WebSocket first, fallback to sendBeacon
        try {
          socket.send(disconnectMessage);
        } catch {
          // If WebSocket fails, use sendBeacon as fallback
          navigator.sendBeacon('data:application/json', disconnectMessage);
        }
      }
    };

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      hasConnected.current = true;
      connectionStartTime.current = Date.now();
      
      // Don't send connectSocket automatically anymore
      // This will be handled by connectAndAddParticipant method
      
      // Add the beforeunload listener after successful connection
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Set up heartbeat to prevent WebSocket from disconnecting due to inactivity
      // AWS API Gateway WebSockets disconnect after 10 minutes of inactivity
      // We'll send a heartbeat every 8 minutes
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      
      heartbeatInterval.current = setInterval(() => {
        // Check if we've been connected for more than 1 and half hour (5400000 ms)
        const connectionDuration = Date.now() - (connectionStartTime.current || 0);
        if (connectionDuration > 90 * 60 * 1000) { 
          // Stop sending heartbeats after 1 and half hour
          if (heartbeatInterval.current) {
            console.log('Stopping heartbeat after 1 and half hour of connection');
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
          }
          return;
        }
        
        // Send heartbeat if socket is open
        if (socket.readyState === WebSocket.OPEN) {
          const heartbeatMessage = JSON.stringify({
            action: 'heartbeat',
            body: { roomId, timestamp: Date.now() }
          });
          socket.send(heartbeatMessage);
          console.log('Sent heartbeat to keep WebSocket alive');
        }
      }, 8 * 60 * 1000); // 8 minutes (8 * 60 * 1000 = 480000 ms)
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // Handle heartbeat responses separately
      if (message.action === 'heartbeat' || 
          (message.type === 'heartbeat' && message.body?.action === 'heartbeat')) {
        console.log('Received heartbeat response from server');
        return; // Don't update lastMessage for heartbeats
      }
      
      setLastMessage(message);
    };

    socket.onclose = (event) => {
      console.log('WebSocket disconnected', event);
      setIsConnected(false);
      // Remove the beforeunload listener when the socket is closed
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clear the heartbeat interval when the socket is closed
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      console.log('Cleaning up WebSocket connection');
      hasConnected.current = false;
      currentRoomId.current = null;
      
      // Clear the heartbeat interval when the component is unmounted
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      // Remove the beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Send disconnect message if participant exists before closing
      if (participantId && socket.readyState === WebSocket.OPEN) {
        try {
          const disconnectMessage = JSON.stringify({
            action: 'disconnectSocket',
            body: { participantId }
          });
          socket.send(disconnectMessage);
        } catch {
          // Socket might already be closed
          console.log('Could not send disconnect message - socket already closed');
        }
      }
      
      socket.close();
    };
  }, [roomId, participantId, shouldConnect]);

  const sendMessage = useCallback((message: SocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log('Sent message:', JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  }, []);

  const disconnectSocket = useCallback((participantId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const disconnectMessage = {
        action: 'disconnectSocket',
        body: { participantId }
      };
      ws.current.send(JSON.stringify(disconnectMessage));
      console.log('Sent disconnect message:', JSON.stringify(disconnectMessage));
      
      // Add small delay to let server process the disconnect message before closing
      setTimeout(() => {
        if (ws.current) {
          ws.current.close();
          console.log('WebSocket connection closed after delay');
        }
      }, 100);
    } else {
      console.error('WebSocket is not connected.');
    }
  }, []);

  const connectSocket = useCallback((participantId: string) => {
    if (!roomId || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send connectSocket: WebSocket not connected or room ID missing');
      return;
    }

    const connectMessage = {
      action: 'connectSocket',
      body: { roomId, participantId }
    };
    console.log('Sending connectSocket message:', JSON.stringify(connectMessage));
    ws.current.send(JSON.stringify(connectMessage));
  }, [roomId]);

  const connectAndAddParticipant = useCallback((participantData: { participantId: string; name: string }) => {
    if (!roomId || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send participant data: WebSocket not connected or room ID missing');
      return;
    }

    // First send connectSocket message
    const connectMessage = {
      action: 'connectSocket',
      body: { roomId, participantId: participantData.participantId }
    };
    console.log('Sending connectSocket message:', JSON.stringify(connectMessage));
    ws.current.send(JSON.stringify(connectMessage));

    // Then send participantAdded message
    const participantAddedMessage = {
      action: 'participantAdded',
      body: {
        name: participantData.name,
        participantId: participantData.participantId,
        roomId: roomId
      }
    };
    console.log('Sending participantAdded message:', JSON.stringify(participantAddedMessage));
    ws.current.send(JSON.stringify(participantAddedMessage));
  }, [roomId]);

  return { isConnected, lastMessage, sendMessage, disconnectSocket, connectSocket, connectAndAddParticipant };
};
