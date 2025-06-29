import type { RoomApiResponse, ApiStory, ApiParticipant, Story, Participant } from '../types';

// Transform API story to local story format
export const transformApiStoryToStory = (apiStory: ApiStory, index: number): Story => ({
  id: index + 1, // Start from 1 instead of 0
  title: apiStory.description,
  description: apiStory.description,
  status: apiStory.status,
  estimate: apiStory.storyPoints === 'n/a' ? null : parseInt(apiStory.storyPoints, 10) || null,
});

// Transform API participant to local participant format
export const transformApiParticipantToParticipant = (apiParticipant: ApiParticipant, index: number): Participant => {
  const nameParts = apiParticipant.name.split(' ');
  const initials = nameParts.map(part => part[0]?.toUpperCase() || '').join('').slice(0, 2);
  
  return {
    id: index + 1, // Start from 1 instead of 0
    name: apiParticipant.name,
    initials: initials || 'U', // Fallback to 'U' for unknown
    voted: apiParticipant.status === 'voted',
  };
};

// Transform full API response to local data structures
export const transformRoomApiResponse = (apiResponse: RoomApiResponse) => ({
  stories: apiResponse.stories.map(transformApiStoryToStory),
  participants: apiResponse.participants.map(transformApiParticipantToParticipant),
  roomName: apiResponse.name,
  totalParticipants: apiResponse.totalParticipants,
  createdDate: apiResponse.createdDate,
  roomId: apiResponse.id,
});
