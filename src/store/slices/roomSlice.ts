import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RoomApiResponse, ApiStory, ApiParticipant } from '../../types';
import { fetchRoomData, createRoom as createRoomApi } from '../api/roomApi';

export interface RoomState {
  data: RoomApiResponse | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean; // Track if we're in the process of creating a room
  pendingRoomData: { roomId: string; roomName: string; createdBy: string } | null; // Store pending room data
}

const initialState: RoomState = {
  data: null,
  loading: false,
  error: null,
  isCreating: false,
  pendingRoomData: null,
};

// Async thunk for creating a room
export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (payload: { roomId: string; roomName: string; createdBy: string }, { rejectWithValue }) => {
    try {
      console.log('Creating room:', payload);
      const response = await createRoomApi(payload);
      return { ...response, ...payload }; // Ensure we have all the data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create room');
    }
  }
);

// Async thunk for fetching room data
export const fetchRoom = createAsyncThunk(
  'room/fetchRoom',
  async (roomId: string, { rejectWithValue, getState }) => {
    try {
      // Check if participantId exists in localStorage before making API call
      const participantId = localStorage.getItem('participantId');
      if (!participantId) {
        console.log('Skipping API request - no participantId in localStorage');
        return rejectWithValue('No participant ID found - please enter your name first');
      }
      
      // Check if we're currently creating a room - if so, don't fetch yet
      const state = getState() as { room: RoomState };
      if (state.room.isCreating) {
        console.log('Skipping API request - room creation is in progress');
        return rejectWithValue('Room creation is in progress - waiting for room to be created first');
      }
      
      console.log('Making API request for room:', roomId);
      const response = await fetchRoomData(roomId);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch room data');
    }
  },
  {
    condition: (roomId, { getState }) => {
      const state = getState() as { room: RoomState };
      
      // First check if participantId exists in localStorage
      const participantId = localStorage.getItem('participantId');
      if (!participantId) {
        console.log('Skipping fetch - no participantId in localStorage');
        return false;
      }
      
      // Check if we're currently creating a room - if so, don't fetch yet
      if (state.room.isCreating) {
        console.log('Skipping fetch - room creation is in progress');
        return false;
      }
      
      // Only skip if we already have data for this exact room and no error
      if (state.room.data?.id === roomId && !state.room.error && !state.room.loading) {
        console.log('Skipping fetch - fresh data already exists for room:', roomId);
        return false;
      }
      return true;
    },
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearRoom: (state) => {
      state.data = null;
      state.error = null;
      state.isCreating = false;
      state.pendingRoomData = null;
    },
    setPendingRoomData: (state, action: PayloadAction<{ roomId: string; roomName: string; createdBy: string }>) => {
      state.pendingRoomData = action.payload;
      state.isCreating = true;
    },
    clearPendingRoomData: (state) => {
      state.pendingRoomData = null;
      state.isCreating = false;
    },
    updateRoomData: (state, action: PayloadAction<Partial<RoomApiResponse>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    addStory: (state, action: PayloadAction<ApiStory>) => {
      if (state.data) {
        if (!state.data.stories) {
          state.data.stories = [];
        }
        state.data.stories.push(action.payload);
      }
    },
    updateStoryStatus: (state, action: PayloadAction<{ 
      storyId: string; 
      status: 'pending' | 'completed' | 'complete' | 'votingInProgress'; 
      storyPoints?: string; 
      finalEstimate?: string;
      votes?: Array<{ participantId: string; vote: string; }>;
    }>) => {
      if (state.data && state.data.stories) {
        const storyIndex = state.data.stories.findIndex(story => story.storyId === action.payload.storyId);
        if (storyIndex !== -1) {
          state.data.stories[storyIndex].status = action.payload.status;
          if (action.payload.storyPoints !== undefined) {
            state.data.stories[storyIndex].storyPoints = action.payload.storyPoints;
          }
          if (action.payload.finalEstimate !== undefined) {
            // Store the final estimate for completed stories
            state.data.stories[storyIndex].finalEstimate = action.payload.finalEstimate;
          }
          if (action.payload.votes !== undefined) {
            // Store the votes for completed stories
            state.data.stories[storyIndex].votes = action.payload.votes;
          }
          console.log('Story status updated in Redux store:', action.payload);
        }
      }
    },
    addParticipant: (state, action: PayloadAction<ApiParticipant>) => {
      if (state.data) {
        // Initialize participants array if it doesn't exist
        if (!state.data.participants) {
          state.data.participants = [];
        }
        
        // Check if participant already exists (avoid duplicates)
        const existingParticipant = state.data.participants.find(
          p => p.participantId === action.payload.participantId
        );
        
        if (!existingParticipant) {
          state.data.participants.push(action.payload);
          state.data.totalParticipants = state.data.participants.length;
          console.log('Participant added to Redux store:', action.payload);
        } else {
          // Update existing participant data in case status changed
          const index = state.data.participants.findIndex(
            p => p.participantId === action.payload.participantId
          );
          if (index !== -1) {
            state.data.participants[index] = action.payload;
            console.log('Participant updated in Redux store:', action.payload);
          }
        }
      }
    },
    updateParticipant: (state, action: PayloadAction<{ participantId: string; status?: 'notVoted' | 'voted'; vote?: string | number }>) => {
      if (state.data) {
        // Initialize participants array if it doesn't exist
        if (!state.data.participants) {
          state.data.participants = [];
        }
        
        const participantIndex = state.data.participants.findIndex(
          p => p.participantId === action.payload.participantId
        );
        
        if (participantIndex !== -1) {
          // Update participant status and/or vote
          if (action.payload.status !== undefined) {
            state.data.participants[participantIndex].status = action.payload.status;
          }
          if (action.payload.vote !== undefined) {
            state.data.participants[participantIndex].vote = String(action.payload.vote);
          }
          console.log('Participant updated in Redux store:', state.data.participants[participantIndex]);
        } else {
          console.warn('Participant not found for update:', action.payload.participantId);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create room cases
      .addCase(createRoom.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isCreating = false;
        state.data = action.payload;
        state.error = null;
        state.pendingRoomData = null;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Fetch room cases
      .addCase(fetchRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRoom, setPendingRoomData, clearPendingRoomData, updateRoomData, addStory, updateStoryStatus, addParticipant, updateParticipant } = roomSlice.actions;
export default roomSlice.reducer;
