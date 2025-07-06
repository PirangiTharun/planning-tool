import { useState } from 'react';
import type { Room } from '../types';
import { initialRooms } from '../data/mockData';
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
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

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
    setCreateRoomDialog,
    setNewRoomName,
    handleCreateRoom,
    completeRoomCreation,
    handleJoinRoom,
    setCurrentRoom
  };
};
