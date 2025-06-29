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
  status: 'pending' | 'completed';
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
}

// Existing types (keeping for compatibility)
export interface Story {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'pending';
  estimate: number | null;
}

export interface Participant {
  id: number;
  name: string;
  initials: string;
  voted: boolean;
}

export interface VoteMap {
  [participantId: number]: number | string;
}
