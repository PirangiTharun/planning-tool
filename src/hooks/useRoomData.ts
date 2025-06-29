import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRoom } from '../store/slices/roomSlice';

export const useRoomData = (roomId: string) => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.room);
  const hasInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Only fetch if we haven't initialized yet or if the room ID changed
    if (roomId && (!hasInitialized.current || (data && data.id !== roomId))) {
      console.log('Fetching room data for:', roomId);
      hasInitialized.current = true;
      dispatch(fetchRoom(roomId));
    }
  }, [dispatch, roomId, data]);

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
