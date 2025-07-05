export interface Room {
  id: string;
  name: string;
  created: string;
  participants: number;
  status: string;
}

// API Response types
export interface ApiStory {
  storyId: string;
  storyPoints: string;
  description: string;
  status: 'pending' | 'completed' | 'complete' | 'votingInProgress';
  finalEstimate?: string; // Store the calculated final estimate for completed stories
  votes?: Array<{
    participantId: string;
    vote: string;
  }>;
}

export interface ApiParticipant {
  name: string;
  participantId: string;
  vote: string;
  status: 'notVoted' | 'voted';
}

export interface RoomApiResponse {
  totalParticipants: number;
  createdDate: string;
  stories: ApiStory[];
  participants: ApiParticipant[];
  id: string;
  name: string;
  createdBy: string;
  currentSelectedStory?: string; // ID of the currently selected story
}

// Existing types (keeping for compatibility)
export interface Story {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'complete' | 'pending' | 'votingInProgress';
  estimate: number | null;
  finalEstimate?: string; // Store the calculated final estimate for completed stories
  votes?: Array<{
    participantId: string;
    vote: string;
  }>; // Store votes for completed stories
}

export interface Participant {
  id: number;
  participantId: string; // Add the actual participantId from API
  name: string;
  initials: string;
  voted: boolean;
}

export interface VoteMap {
  [participantId: string]: number | string; // Change to string keys to match participantId
}
