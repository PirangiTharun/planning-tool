import type { RoomApiResponse, ApiStory, ApiParticipant, Story, Participant } from '../types';

// Transform API story to local story format
export const transformApiStoryToStory = (apiStory: ApiStory, index: number): Story => ({
  id: index + 1, // Start from 1 instead of 0
  title: apiStory.description,
  description: apiStory.description,
  status: apiStory.status as 'completed' | 'complete' | 'pending' | 'votingInProgress', // Cast to include 'complete'
  estimate: apiStory.storyPoints === 'n/a' ? null : parseInt(apiStory.storyPoints, 10) || null,
  finalEstimate: apiStory.finalEstimate, // Preserve the final estimate for completed stories
  votes: apiStory.votes, // Preserve the votes for completed stories
});

// Transform API participant to local participant format
export const transformApiParticipantToParticipant = (apiParticipant: ApiParticipant, index: number): Participant => {
  const nameParts = apiParticipant.name.split(' ');
  const initials = nameParts.map(part => part[0]?.toUpperCase() || '').join('').slice(0, 2);
  
  return {
    id: index + 1, // Start from 1 instead of 0
    participantId: apiParticipant.participantId, // Preserve the actual participantId
    name: apiParticipant.name,
    initials: initials || 'U', // Fallback to 'U' for unknown
    voted: apiParticipant.status === 'voted',
  };
};

// Transform full API response to local data structures
export const transformRoomApiResponse = (apiResponse: RoomApiResponse) => {
  // Add null/undefined checks for the entire response
  if (!apiResponse) {
    return {
      stories: [],
      participants: [],
      roomName: '',
      totalParticipants: 0,
      createdDate: '',
      roomId: '',
    };
  }
  
  return {
    stories: Array.isArray(apiResponse.stories) ? apiResponse.stories.map(transformApiStoryToStory) : [],
    participants: Array.isArray(apiResponse.participants) ? apiResponse.participants.map(transformApiParticipantToParticipant) : [],
    roomName: apiResponse.name || '',
    totalParticipants: apiResponse.totalParticipants || 0,
    createdDate: apiResponse.createdDate || '',
    roomId: apiResponse.id || '',
  };
};
