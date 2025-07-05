import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRoom } from '../store/slices/roomSlice';

export const useRoomData = (roomId: string) => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.room);
  const hasInitialized = useRef<boolean>(false);
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Monitor participantId changes
  useEffect(() => {
    const checkParticipantId = () => {
      const currentParticipantId = localStorage.getItem('participantId');
      setParticipantId(currentParticipantId);
    };

    // Check initially
    checkParticipantId();

    // Listen for participant updates
    const handleParticipantUpdate = () => {
      checkParticipantId();
    };

    window.addEventListener('participantUpdated', handleParticipantUpdate);
    
    // Fallback: Set up an interval to check for changes
    const interval = setInterval(checkParticipantId, 2000);

    return () => {
      window.removeEventListener('participantUpdated', handleParticipantUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Only fetch if we have both roomId and participantId, and haven't initialized yet or room ID changed
    if (roomId && participantId && (!hasInitialized.current || (data && data.id !== roomId))) {
      console.log('Fetching room data for:', roomId, 'with participant:', participantId);
      hasInitialized.current = true;
      dispatch(fetchRoom(roomId));
    } else if (roomId && !participantId) {
      console.log('Waiting for participant ID before fetching room data');
      // Reset initialization if participant ID is missing
      hasInitialized.current = false;
    }
  }, [dispatch, roomId, data, participantId]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, []);

  return {
    roomData: data,
    loading,
    error,
  };
};
