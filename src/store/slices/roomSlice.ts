import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RoomApiResponse, ApiStory, ApiParticipant } from '../../types';
import { fetchRoomData } from '../api/roomApi';

export interface RoomState {
  data: RoomApiResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk for fetching room data
export const fetchRoom = createAsyncThunk(
  'room/fetchRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      // Check if participantId exists in localStorage before making API call
      const participantId = localStorage.getItem('participantId');
      if (!participantId) {
        console.log('Skipping API request - no participantId in localStorage');
        return rejectWithValue('No participant ID found - please enter your name first');
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
    },
    updateRoomData: (state, action: PayloadAction<Partial<RoomApiResponse>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    addStory: (state, action: PayloadAction<ApiStory>) => {
      if (state.data) {
        state.data.stories.push(action.payload);
      }
    },
    updateStoryStatus: (state, action: PayloadAction<{ storyId: string; status: 'pending' | 'completed' | 'votingInProgress'; storyPoints?: string }>) => {
      if (state.data) {
        const storyIndex = state.data.stories.findIndex(story => story.storyId === action.payload.storyId);
        if (storyIndex !== -1) {
          state.data.stories[storyIndex].status = action.payload.status;
          if (action.payload.storyPoints !== undefined) {
            state.data.stories[storyIndex].storyPoints = action.payload.storyPoints;
          }
          console.log('Story status updated in Redux store:', action.payload);
        }
      }
    },
    addParticipant: (state, action: PayloadAction<ApiParticipant>) => {
      if (state.data) {
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
  },
  extraReducers: (builder) => {
    builder
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

export const { clearRoom, updateRoomData, addStory, updateStoryStatus, addParticipant } = roomSlice.actions;
export default roomSlice.reducer;
