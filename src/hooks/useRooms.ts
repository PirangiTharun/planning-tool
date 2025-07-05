import { useState } from 'react';
import type { Room } from '../types';
import { initialRooms } from '../data/mockData';
import { createRoom, fetchRoomData } from '../store/api/roomApi';

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
      // Participant exists - call createRoom API immediately
      try {
        setIsCreatingRoom(true);
        
        const apiPayload = {
          roomId,
          roomName,
          createdBy: participantId
        };
        
        await createRoom(apiPayload);
        
        // Call getRoomDetails to get the complete room data (only if participantId exists)
        if (participantId) {
          await fetchRoomData(roomId);
        }
        
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
      // No participant - return room info so the caller can navigate and show name dialog
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
      
      await createRoom(apiPayload);
      
      // Call getRoomDetails to get the complete room data (only if participantId exists)
      if (participantId) {
        await fetchRoomData(roomId);
      }
      
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
