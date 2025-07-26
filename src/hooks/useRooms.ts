import { useState, useEffect } from 'react';
import type { Room } from '../types';
import { useAppDispatch } from '../store/hooks';
import { createRoom as createRoomAction, setPendingRoomData } from '../store/slices/roomSlice';

const generateRoomId = () => {
  // Generate a unique 8-character room ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useRooms = () => {
  const dispatch = useAppDispatch();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms from API only if participantId exists in localStorage
  useEffect(() => {
    const fetchRooms = async () => {
      // Check if participantId exists in localStorage
      const participantId = localStorage.getItem('participantId');
      if (!participantId) {
        console.log('No participantId found, skipping room fetch');
        return; // Skip API call if no participant ID
      }
      
      setLoading(true);
      setError(null);
      try {
        // Add participant_id as a query parameter
        const url = new URL('https://xppvg6zy35.execute-api.us-east-1.amazonaws.com/default/fetchRooms');
        url.searchParams.append('participant_id', participantId);
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.rooms && Array.isArray(data.rooms)) {
          const formattedRooms: Room[] = data.rooms.map((room: { 
            roomId?: string; 
            name?: string; 
            created?: string;
            participants?: number;
          }) => {
            // Format date to a readable string
            const createdDate = room.created ? new Date(room.created) : new Date();
            const dateOptions: Intl.DateTimeFormatOptions = { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            };
            const formattedDate = createdDate.toLocaleString(undefined, dateOptions);
            
            return {
              id: room.roomId || '',
              name: room.name || 'Unnamed Room',
              created: formattedDate,
              participants: room.participants || 0,
              status: 'Active'
            };
          });
          
          setRooms(formattedRooms);
        } else {
          console.error('Expected rooms array but got:', data);
          setRooms([]);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleCreateRoom = async (): Promise<{ roomId: string; roomName: string; needsParticipantInfo: boolean } | null> => {
    if (!newRoomName.trim()) return null;

    const roomId = generateRoomId();
    const roomName = newRoomName.trim();
    
    // Check if participant exists in localStorage
    const participantId = localStorage.getItem('participantId');
    
    if (participantId) {
      // Participant exists - create room immediately using Redux
      try {
        setIsCreatingRoom(true);
        
        const apiPayload = {
          roomId,
          roomName,
          createdBy: participantId
        };
        
        await dispatch(createRoomAction(apiPayload)).unwrap();
        
        // Update local room list
        const newRoom = {
          id: roomId,
          name: roomName,
          created: 'Just now',
          participants: 1,
          status: 'Active' as const
        };
        setRooms([newRoom, ...rooms]);
        setCurrentRoom(newRoom);
        setCreateRoomDialog(false);
        setNewRoomName('');
        
        return { roomId, roomName, needsParticipantInfo: false };
      } catch (error) {
        console.error('Error creating room:', error);
        // For now, still create a local room even if API fails
        const newRoom = {
          id: roomId,
          name: roomName,
          created: 'Just now',
          participants: 1,
          status: 'Active' as const
        };
        setRooms([newRoom, ...rooms]);
        setCurrentRoom(newRoom);
        setCreateRoomDialog(false);
        setNewRoomName('');
        
        return { roomId, roomName, needsParticipantInfo: false };
      } finally {
        setIsCreatingRoom(false);
      }
    } else {
      // No participant - set pending room data in Redux and return room info
      const pendingData = {
        roomId,
        roomName,
        createdBy: '' // Will be filled when participant enters name
      };
      
      dispatch(setPendingRoomData(pendingData));
      setCreateRoomDialog(false);
      setNewRoomName('');
      return { roomId, roomName, needsParticipantInfo: true };
    }
  };

  // Function to complete room creation after participant info is collected
  const completeRoomCreation = async (roomId: string, roomName: string, participantId: string): Promise<void> => {
    try {
      const apiPayload = {
        roomId,
        roomName,
        createdBy: participantId
      };
      
      await dispatch(createRoomAction(apiPayload)).unwrap();
      
      // Update local room list
      const newRoom = {
        id: roomId,
        name: roomName,
        created: 'Just now',
        participants: 1,
        status: 'Active' as const
      };
      setRooms([newRoom, ...rooms]);
      setCurrentRoom(newRoom);
    } catch (error) {
      console.error('Error completing room creation:', error);
      // Create local room even if API fails
      const newRoom = {
        id: roomId,
        name: roomName,
        created: 'Just now',
        participants: 1,
        status: 'Active' as const
      };
      setRooms([newRoom, ...rooms]);
      setCurrentRoom(newRoom);
    }
  };

  const handleJoinRoom = (room: Room) => {
    setCurrentRoom(room);
  };

  return {
    rooms,
    currentRoom,
    createRoomDialog,
    newRoomName,
    isCreatingRoom,
    loading,
    error,
    setCreateRoomDialog,
    setNewRoomName,
    handleCreateRoom,
    completeRoomCreation,
    handleJoinRoom,
    setCurrentRoom
  };
};
