import { useState } from 'react';
import type { Room } from '../types';
import { initialRooms } from '../data/mockData';

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      const newRoom = {
        id: generateRandomId(),
        name: newRoomName,
        created: 'Just now',
        participants: 1,
        status: 'Active' as const
      };
      setRooms([newRoom, ...rooms]);
      setCurrentRoom(newRoom);
      setCreateRoomDialog(false);
      setNewRoomName('');
      return newRoom;
    }
    return null;
  };

  const handleJoinRoom = (room: Room) => {
    setCurrentRoom(room);
  };

  return {
    rooms,
    currentRoom,
    createRoomDialog,
    newRoomName,
    setCreateRoomDialog,
    setNewRoomName,
    handleCreateRoom,
    handleJoinRoom,
    setCurrentRoom
  };
};
