import { type FC, useEffect, useState, useCallback, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  SkipNext as SkipIcon,
  Visibility as EyeIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import type { Story, Participant, VoteMap } from '../types';
import { getVotingResults } from '../utils/results';
import StoriesList from './room/StoriesList';
import ParticipantsList from './room/ParticipantsList';
import CurrentStory from './room/CurrentStory';
import VotingArea from './room/VotingArea';
import Results from './room/Results';
import AddStoryDialog from './AddStoryDialog';
import EnterNameDialog from './EnterNameDialog';
import { useSocket } from '../hooks/useSocket';
import { useRoomData } from '../hooks/useRoomData';
import { transformRoomApiResponse } from '../utils/dataTransformers';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addStory, addParticipant, updateStoryStatus, updateParticipant, createRoom, clearPendingRoomData } from '../store/slices/roomSlice';

interface RoomPageProps {
  roomId: string;
  onLeaveRoom?: () => void;
}

const RoomPage: FC<RoomPageProps> = ({ roomId, onLeaveRoom }) => {
  // Participant management state
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [showEnterNameDialog, setShowEnterNameDialog] = useState(false);
  const [isParticipantReady, setIsParticipantReady] = useState(false);
  const [isNewParticipant, setIsNewParticipant] = useState(false); // Track if this is a new participant
  
  // Ref to track if we've already sent participant data for this session
  const participantDataSent = useRef(false);
  const lastProcessedMessageId = useRef<string | null>(null);
  const initialStoryIndexSet = useRef(false); // Track if we've set the initial story index from API
  
  // Connect to WebSocket when room is loaded, but don't send connectSocket yet
  const { lastMessage, sendMessage, disconnectSocket, isConnected, connectSocket, connectAndAddParticipant } = useSocket(roomId, null, true);
  const { roomData, loading, error } = useRoomData(roomId);
  const dispatch = useAppDispatch();
  
  // Get pending room data from Redux
  const { pendingRoomData } = useAppSelector((state) => state.room);
  
  // Local state for room functionality
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [votes, setVotes] = useState<VoteMap>({});
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<string | number | null>(null);
  const [cardsRevealed, setCardsRevealed] = useState(false);
  
  // Add story dialog state
  const [addStoryDialogOpen, setAddStoryDialogOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');

  // Transform API data to local format with error handling
  let transformedData = null;
  try {
    transformedData = roomData ? transformRoomApiResponse(roomData) : null;
  } catch (error) {
    console.error('Error transforming room data:', error, 'Room data:', roomData);
    transformedData = null;
  }
  
  const apiStories: Story[] = transformedData?.stories || [];
  const stories: Story[] = apiStories; // Only use API stories, no local stories
  const participants: Participant[] = transformedData?.participants || [];
  const roomName = transformedData?.roomName || '';
  
  // Check if the current participant is the room creator
  const isRoomCreator = !!(participantId && roomData?.createdBy === participantId);
  
  // Debug logging for room creator status
  console.log('Room creator check:', {
    participantId,
    createdBy: roomData?.createdBy,
    isRoomCreator
  });

  // Initialize participant on component mount
  useEffect(() => {
    // Clear tracking flags for fresh behavior on page load
    localStorage.removeItem('participantSent');
    participantDataSent.current = false;
    
    const storedId = localStorage.getItem('participantId');
    const storedName = localStorage.getItem('participantName');
    
    if (storedId && storedName) {
      // Participant exists in localStorage - this is an existing participant
      setParticipantId(storedId);
      setParticipantName(storedName);
      setIsParticipantReady(true);
      setIsNewParticipant(false); // Mark as existing participant
      
      // If there's pending room data in Redux, complete room creation
      if (pendingRoomData && pendingRoomData.roomId === roomId) {
        const apiPayload = {
          ...pendingRoomData,
          createdBy: storedId
        };
        
        // Create room using Redux and then clear pending data
        dispatch(createRoom(apiPayload)).then(() => {
          dispatch(clearPendingRoomData());
          console.log('Room creation completed successfully');
        }).catch((error) => {
          console.error('Error completing room creation:', error);
          dispatch(clearPendingRoomData()); // Clear even on error to prevent retry loops
        });
      }
    } else {
      // No participant in localStorage, show name dialog
      setShowEnterNameDialog(true);
      setIsNewParticipant(true); // Will be a new participant
    }
  }, [dispatch, pendingRoomData, roomId]); // Include dependencies

  // Handle WebSocket connection and participant data sending
  useEffect(() => {
    // Only send if all conditions are met and we haven't sent yet
    if (isConnected && isParticipantReady && participantId && participantName && !participantDataSent.current) {
      console.log('Sending participant data:', { participantId, participantName, isNewParticipant });
      
      // Mark as sent immediately to prevent duplicate calls
      participantDataSent.current = true;
      localStorage.setItem('participantSent', 'true');
      
      if (isNewParticipant) {
        // For new participants: send both connectSocket and participantAdded
        // Server will echo back the participantAdded event which we'll handle in useEffect
        console.log('New participant - sending connectSocket and participantAdded');
        connectAndAddParticipant({
          participantId: participantId,
          name: participantName
        });
      } else {
        // For existing participants: only send connectSocket
        console.log('Existing participant - sending only connectSocket');
        connectSocket(participantId);
      }
    }
  }, [isConnected, isParticipantReady, participantId, participantName, isNewParticipant, connectSocket, connectAndAddParticipant]);

  useEffect(() => {
    if (lastMessage) {
      // Create a unique message ID to prevent duplicate processing
      const messageId = `${lastMessage.event}-${JSON.stringify(lastMessage.body)}`;
      
      // Skip if we've already processed this exact message
      if (lastProcessedMessageId.current === messageId) {
        return;
      }
      
      lastProcessedMessageId.current = messageId;
      console.log('Received message:', lastMessage);
      
      // Handle incoming messages based on lastMessage.event
      if (lastMessage.event === 'storyAdded' && lastMessage.body) {
        // Add the new story to Redux store for data consistency
        const newApiStory = {
          storyId: lastMessage.body.storyId,
          storyPoints: lastMessage.body.storyPoints,
          description: lastMessage.body.description,
          status: lastMessage.body.status as 'pending' | 'completed'
        };
        
        dispatch(addStory(newApiStory));
        console.log('Story added to Redux store:', newApiStory);
      } else if (lastMessage.event === 'participantAdded' && lastMessage.body) {
        // Add the new participant to Redux store
        const newApiParticipant = {
          name: lastMessage.body.name,
          participantId: lastMessage.body.participantId,
          status: lastMessage.body.status as 'notVoted' | 'voted',
          vote: lastMessage.body.vote
        };
        
        dispatch(addParticipant(newApiParticipant));
        console.log('Participant added to Redux store:', newApiParticipant);
      } else if (lastMessage.event === 'storySelected' && lastMessage.body) {
        // Handle story selection updates
        const { storyId } = lastMessage.body;
        console.log('Story selected via WebSocket:', storyId);
        
        // Find the index of the selected story
        if (roomData?.stories) {
          const storyIndex = roomData.stories.findIndex(story => story.storyId === storyId);
          if (storyIndex !== -1) {
            setCurrentStoryIndex(storyIndex);
            console.log(`Story selection updated to index ${storyIndex} for story: ${storyId}`);
          } else {
            console.warn('Selected story not found in current room data:', storyId);
          }
        }
      } else if (lastMessage.event === 'storyStatusUpdated' && lastMessage.body) {
        // Handle story status updates in real-time
        const { storyId, status, storyPoints, votes: storyVotes } = lastMessage.body;
        console.log('Story status updated:', lastMessage.body);
        
        // If status is complete and we have votes, update the votes state
        if (status === 'complete' && storyVotes && Array.isArray(storyVotes)) {
          const votesMap: VoteMap = {};
          storyVotes.forEach(({ participantId, vote }) => {
            votesMap[participantId] = vote;
            
            // Update participant status in Redux store
            dispatch(updateParticipant({
              participantId,
              status: 'voted',
              vote: vote
            }));
          });
          
          // Calculate and store the final estimate
          const results = getVotingResults(votesMap);
          const finalEstimate = results.mode;
          
          // Update the story status in Redux store with final estimate and votes
          dispatch(updateStoryStatus({ 
            storyId, 
            status: status as 'pending' | 'completed' | 'complete' | 'votingInProgress',
            storyPoints,
            finalEstimate: finalEstimate,
            votes: storyVotes
          }));
          
          // Update local votes state
          setVotes(votesMap);
          console.log('Updated votes from storyStatusUpdated:', votesMap);
          console.log('Calculated and stored final estimate:', finalEstimate);
        } else {
          // For other statuses, update without final estimate
          dispatch(updateStoryStatus({ 
            storyId, 
            status: status as 'pending' | 'completed' | 'complete' | 'votingInProgress',
            storyPoints 
          }));
        }
        
        // Find the story index that matches the storyId from current roomData
        // We need to use a callback to get the latest roomData state
        if (roomData?.stories) {
          const storyIndex = roomData.stories.findIndex(story => story.storyId === storyId);
          
          if (storyIndex !== undefined && storyIndex !== -1) {
            // Update the current story index to match the updated story (only if different)
            setCurrentStoryIndex(prevIndex => {
              if (storyIndex !== prevIndex) {
                console.log(`Switching to story index ${storyIndex} for voting`);
                return storyIndex;
              }
              return prevIndex;
            });
            
            // Update voting state based on the new status
            if (status === 'votingInProgress') {
              console.log('Starting voting session for all users for story:', storyId);
              setVotingInProgress(true);
              setShowResults(false);
              setCardsRevealed(false);
              setVotes({});
              setSelectedEstimate(null);
            } else if (status === 'completed' || status === 'complete') {
              // Story voting is completed
              setVotingInProgress(false);
              setShowResults(true);
              setCardsRevealed(true);
            } else if (status === 'pending') {
              // Story is back to pending state
              setVotingInProgress(false);
              setShowResults(false);
              setCardsRevealed(false);
              setVotes({});
              setSelectedEstimate(null);
            }
          } else {
            console.warn('Story with ID not found in current room data:', storyId);
          }
        }
      } else if (lastMessage.event === 'voteUpdated' && lastMessage.body) {
        // Handle vote updates in real-time
        const { participantId: votedParticipantId, vote, storyId } = lastMessage.body;
        console.log('Vote updated:', lastMessage.body);
        
        // Update the participant status to "voted" in Redux store
        dispatch(updateParticipant({
          participantId: votedParticipantId,
          status: 'voted',
          vote: vote
        }));
        
        // Only update local votes state if this vote is for the current story
        const currentApiStory = roomData?.stories?.[currentStoryIndex];
        if (currentApiStory && storyId === currentApiStory.storyId) {
          // Update the votes state with the new vote
          setVotes(prev => ({
            ...prev,
            [votedParticipantId]: vote
          }));
          
          // If this is the current participant's vote, update selectedEstimate
          if (votedParticipantId === participantId) {
            setSelectedEstimate(vote);
            console.log('Updated current participant selected estimate:', vote);
          }
          
          console.log('Updated votes for current story:', { [votedParticipantId]: vote });
        } else {
          console.log('Vote received for different story, not updating local votes state');
        }
      } else if (lastMessage.event === 'currentStoryUpdated' && lastMessage.body) {
        // Handle current story updates from the server
        const { currentSelectedStory } = lastMessage.body;
        console.log('Current story updated via WebSocket:', currentSelectedStory);
        
        // Find the index of the selected story
        if (roomData?.stories && currentSelectedStory) {
          const storyIndex = roomData.stories.findIndex(story => story.storyId === currentSelectedStory);
          if (storyIndex !== -1) {
            setCurrentStoryIndex(storyIndex);
            console.log(`Current story updated to index ${storyIndex} for story: ${currentSelectedStory}`);
          } else {
            console.warn('Selected story not found in current room data:', currentSelectedStory);
          }
        }
      }
    }
  }, [lastMessage, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (roomData && participantId && participantName) {
      console.log('Room data loaded from API:', roomData);
      
      // Set the current story index based on currentSelectedStory from API
      if (roomData.stories && roomData.stories.length > 0 && !initialStoryIndexSet.current) {
        let targetStoryIndex = 0; // Default to first story
        
        if (roomData.currentSelectedStory) {
          // Find the index of the story that matches currentSelectedStory
          const foundIndex = roomData.stories.findIndex(story => story.storyId === roomData.currentSelectedStory);
          if (foundIndex !== -1) {
            targetStoryIndex = foundIndex;
            console.log(`Setting story index to ${targetStoryIndex} based on currentSelectedStory: ${roomData.currentSelectedStory}`);
          } else {
            console.log(`currentSelectedStory ${roomData.currentSelectedStory} not found, defaulting to first story`);
          }
        } else {
          console.log('No currentSelectedStory specified, defaulting to first story');
        }
        
        // Set the story index and mark as set
        setCurrentStoryIndex(targetStoryIndex);
        initialStoryIndexSet.current = true;
        console.log(`Initial story index set to: ${targetStoryIndex}`);
      }
      
      // Calculate and store final estimates for all completed stories that have votes
      if (roomData.stories && roomData.stories.length > 0) {
        roomData.stories.forEach((apiStory) => {
          if ((apiStory.status === 'complete' || apiStory.status === 'completed') && apiStory.votes && Array.isArray(apiStory.votes) && apiStory.votes.length > 0) {
            // Calculate final estimate from votes
            const storyVotes: VoteMap = {};
            apiStory.votes.forEach(({ participantId: voteParticipantId, vote }) => {
              storyVotes[voteParticipantId] = vote;
            });
            
            const results = getVotingResults(storyVotes);
            const finalEstimate = results.mode;
            
            // Update the story in Redux store with the calculated final estimate and votes
            dispatch(updateStoryStatus({
              storyId: apiStory.storyId,
              status: apiStory.status,
              finalEstimate: finalEstimate,
              votes: apiStory.votes
            }));
            
            console.log(`Calculated final estimate for story ${apiStory.storyId}: ${finalEstimate}`);
          }
        });
        
        // Note: Vote loading for current story is handled in the separate useEffect that watches currentStoryIndex
      }
      
      // Check if current participant exists in the room's participant list
      const currentParticipantExists = roomData.participants?.some(
        participant => participant.participantId === participantId
      );
      
      if (!currentParticipantExists) {
        console.log('Current participant not found in room data, adding via WebSocket...');
        
        // Send participantAdded message via WebSocket if participant doesn't exist
        if (isConnected && sendMessage) {
          const participantAddedMessage = {
            action: 'participantAdded',
            body: {
              name: participantName,
              participantId: participantId,
              roomId: roomId
            }
          };
          
          console.log('Sending participantAdded message:', JSON.stringify(participantAddedMessage));
          sendMessage(participantAddedMessage);
        } else {
          console.log('WebSocket not connected, cannot add participant');
        }
      } else {
        console.log('Current participant already exists in room data');
      }
    }
  }, [roomData, participantId, participantName, isConnected, sendMessage, roomId, dispatch]);

  // Handle vote updates when switching between stories
  useEffect(() => {
    if (roomData?.stories && roomData.stories.length > 0) {
      const currentApiStory = roomData.stories[currentStoryIndex];
      
      if (currentApiStory && (currentApiStory.status === 'complete' || currentApiStory.status === 'completed') && currentApiStory.votes && Array.isArray(currentApiStory.votes)) {
        // Load votes for the current story
        const currentStoryVotes: VoteMap = {};
        
        currentApiStory.votes.forEach(({ participantId: voteParticipantId, vote }) => {
          currentStoryVotes[voteParticipantId] = vote;
        });
        
        setVotes(currentStoryVotes);
        setShowResults(true);
        setCardsRevealed(true);
        
        // Update selected estimate if current participant has voted
        if (participantId && currentStoryVotes[participantId]) {
          setSelectedEstimate(currentStoryVotes[participantId]);
        } else {
          setSelectedEstimate(null);
        }
        
        console.log('Switched to completed story, loaded votes:', currentStoryVotes);
      } else {
        // For non-complete stories, only clear votes if story is pending
        // Keep votes for votingInProgress stories
        if (currentApiStory?.status === 'pending') {
          setVotes({});
          setSelectedEstimate(null);
          setShowResults(false);
          setCardsRevealed(false);
          setVotingInProgress(false);
          console.log('Switched to pending story, cleared votes');
        } else if (currentApiStory?.status === 'votingInProgress') {
          // Keep existing votes for voting in progress stories
          setShowResults(false);
          setCardsRevealed(false);
          setVotingInProgress(true);
          console.log('Switched to voting in progress story, keeping existing votes');
        }
      }
    }
  }, [currentStoryIndex, roomData, participantId]);

  // Define handleLeaveRoom with useCallback to prevent unnecessary re-renders
  const handleLeaveRoom = useCallback(() => {
    if (participantId) {
      // Send disconnect message with participant ID
      disconnectSocket(participantId);
      
      // Clean up session-specific data but keep participant data for future use
      localStorage.removeItem('participantSent');
      participantDataSent.current = false;
    }
    
    // Reset participant state
    setIsNewParticipant(false);
    
    // Use the provided onLeaveRoom callback or navigate directly
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      window.location.href = '/';
    }
  }, [participantId, disconnectSocket, onLeaveRoom]);

  // Listen for leave room event from app bar
  useEffect(() => {
    const handleLeaveRoomEvent = () => {
      handleLeaveRoom();
    };

    window.addEventListener('leaveRoom', handleLeaveRoomEvent);
    
    return () => {
      window.removeEventListener('leaveRoom', handleLeaveRoomEvent);
    };
  }, [handleLeaveRoom]);

  // Event handlers
  const handleStartVoting = () => {
    // Get the current story ID from the original API data
    const currentApiStory = roomData?.stories?.[currentStoryIndex];
    
    if (!roomData?.stories || roomData.stories.length === 0) {
      console.warn('Cannot start voting: no stories available');
      return;
    }
    
    if (currentApiStory && sendMessage) {
      // Send startVoting message via WebSocket
      const startVotingMessage = {
        action: 'startVoting',
        body: {
          roomId: roomId,
          storyId: currentApiStory.storyId,
          status: 'votingInProgress'
        }
      };
      
      console.log('Sending startVoting message:', JSON.stringify(startVotingMessage));
      sendMessage(startVotingMessage);
    } else {
      console.warn('Cannot start voting: missing story data or WebSocket connection');
    }
    
    // Update local state
    setVotingInProgress(true);
    setShowResults(false);
    setCardsRevealed(false);
    setVotes({});
    setSelectedEstimate(null);
  };

  const handleVote = (estimate: number | string) => {
    // Send participantVoted message via WebSocket
    const currentApiStory = roomData?.stories?.[currentStoryIndex];
    
    if (currentApiStory && participantId && sendMessage) {
      const participantVotedMessage = {
        action: 'participantVoted',
        body: {
          roomId: roomId,
          storyId: currentApiStory.storyId,
          participantId: participantId,
          vote: String(estimate) // Ensure vote is always sent as a string
        }
      };
      
      console.log('Sending participantVoted message:', JSON.stringify(participantVotedMessage));
      sendMessage(participantVotedMessage);
      
      // Update local state for immediate UI feedback
      setSelectedEstimate(estimate);
      setVotes(prev => ({
        ...prev,
        [participantId]: String(estimate)
      }));
      
      console.log('Updated local vote for immediate feedback:', { participantId, vote: String(estimate) });
    } else {
      console.warn('Cannot send vote: missing story data, participant ID, or WebSocket connection');
    }
  };

  const handleShowVotes = () => {
    // Get the current story ID from the original API data
    const currentApiStory = roomData?.stories?.[currentStoryIndex];
    
    if (currentApiStory && sendMessage) {
      // Send startVoting message with status "complete" via WebSocket
      const showVotesMessage = {
        action: 'startVoting',
        body: {
          roomId: roomId,
          storyId: currentApiStory.storyId,
          status: 'complete'
        }
      };
      
      console.log('Sending show votes message:', JSON.stringify(showVotesMessage));
      sendMessage(showVotesMessage);
    } else {
      console.warn('Cannot show votes: missing story data or WebSocket connection');
    }
    
    // Update local state for immediate UI feedback
    setShowResults(true);
    setCardsRevealed(true);
    setVotingInProgress(false);
  };

  const handleNextStory = () => {
    // Before moving to the next story, save the final estimate and votes for the current story if it has votes
    const currentApiStory = roomData?.stories?.[currentStoryIndex];
    if (currentApiStory && (currentApiStory.status === 'completed' || currentApiStory.status === 'complete') && 
        Object.keys(votes).length > 0) {
      
      const results = getVotingResults(votes);
      const finalEstimate = results.mode;
      
      // Convert current votes to the format expected by the API
      const votesArray = Object.entries(votes).map(([participantId, vote]) => ({
        participantId,
        vote: String(vote)
      }));
      
      // Update the story in Redux store with the final estimate and votes
      dispatch(updateStoryStatus({
        storyId: currentApiStory.storyId,
        status: currentApiStory.status,
        finalEstimate: finalEstimate,
        votes: votesArray
      }));
      
      console.log(`Saved final estimate and votes for story ${currentApiStory.storyId}: ${finalEstimate}`, votesArray);
    }

    if (currentStoryIndex < stories.length - 1) {
      const nextStoryIndex = currentStoryIndex + 1;
      const nextStory = roomData?.stories?.[nextStoryIndex];
      
      if (nextStory && sendMessage) {
        // Send nextStory WebSocket message
        const nextStoryMessage = {
          action: 'nextStory',
          body: {
            roomId: roomId,
            nextStoryId: nextStory.storyId
          }
        };
        
        console.log('Sending nextStory message:', JSON.stringify(nextStoryMessage));
        sendMessage(nextStoryMessage);
      }
      
      setCurrentStoryIndex(nextStoryIndex);
      // Note: State updates are handled by useEffect that watches currentStoryIndex
    }
  };

  const handleSkipStory = () => {
    // Get the current story ID from the original API data
    const currentApiStory = roomData?.stories?.[currentStoryIndex];
    
    if (!roomData?.stories || roomData.stories.length === 0) {
      console.warn('Cannot skip story: no stories available');
      return;
    }
    
    if (currentApiStory && sendMessage) {
      // Move to the next story and send nextStory message
      if (currentStoryIndex < stories.length - 1) {
        const nextStoryIndex = currentStoryIndex + 1;
        const nextStory = roomData?.stories?.[nextStoryIndex];
        
        if (nextStory) {
          // Send nextStory WebSocket message
          const nextStoryMessage = {
            action: 'nextStory',
            body: {
              roomId: roomId,
              nextStoryId: nextStory.storyId
            }
          };
          
          console.log('Sending nextStory message after skip:', JSON.stringify(nextStoryMessage));
          sendMessage(nextStoryMessage);
        }
        
        setCurrentStoryIndex(nextStoryIndex);
      }
    } else {
      console.warn('Cannot skip story: missing story data or WebSocket connection');
    }
  };

  // Handle story selection from the stories list
  const handleStorySelection = (newStoryIndex: number) => {
    if (newStoryIndex === currentStoryIndex) {
      // No change needed if selecting the same story
      return;
    }
    
    const selectedStory = roomData?.stories?.[newStoryIndex];
    
    if (selectedStory && sendMessage) {
      // Send nextStory WebSocket message
      const nextStoryMessage = {
        action: 'nextStory',
        body: {
          roomId: roomId,
          nextStoryId: selectedStory.storyId
        }
      };
      
      console.log('Sending nextStory message for story selection:', JSON.stringify(nextStoryMessage));
      sendMessage(nextStoryMessage);
    }
    
    setCurrentStoryIndex(newStoryIndex);
  };

  // Participant name dialog handlers
  const handleSaveName = () => {
    if (!participantName.trim()) return;

    // Generate new participant ID and save to localStorage
    const newParticipantId = uuidv4();
    setParticipantId(newParticipantId);
    
    localStorage.setItem('participantId', newParticipantId);
    localStorage.setItem('participantName', participantName.trim());
    
    // Dispatch event to notify hooks about participant update
    window.dispatchEvent(new CustomEvent('participantUpdated'));
    
    setIsParticipantReady(true);
    setIsNewParticipant(true); // Mark as new participant since they just entered name
    setShowEnterNameDialog(false);

    // Check if there's pending room data in Redux to complete
    if (pendingRoomData && pendingRoomData.roomId === roomId) {
      const apiPayload = {
        ...pendingRoomData,
        createdBy: newParticipantId
      };
      
      // Create room using Redux and then clear pending data
      dispatch(createRoom(apiPayload)).then(() => {
        dispatch(clearPendingRoomData());
        console.log('Room creation completed successfully');
      }).catch((error) => {
        console.error('Error completing room creation:', error);
        dispatch(clearPendingRoomData()); // Clear even on error to prevent retry loops
      });
    } else {
      // No pending room creation, but we still need to fetch room data
      // The useRoomData hook should automatically trigger now that participantId exists
      console.log('Participant name saved, useRoomData should trigger room fetch');
    }

    // The useEffect hook will handle sending the WebSocket messages
    // Don't send here to avoid duplicate calls
  };

  // Check if participant data exists in localStorage before allowing dialog close
  const canCloseEnterNameDialog = () => {
    const storedParticipantId = localStorage.getItem('participantId');
    const storedParticipantName = localStorage.getItem('participantName');
    return !!(storedParticipantId && storedParticipantName);
  };

  const handleEnterNameDialogClose = () => {
    // Only allow closing if participant data exists in localStorage
    if (canCloseEnterNameDialog()) {
      setShowEnterNameDialog(false);
    }
  };

  // Add story dialog handlers
  const handleSetAddStoryDialog = (open: boolean) => {
    setAddStoryDialogOpen(open);
    if (!open) {
      // Reset form when closing
      setNewStoryTitle('');
      setNewStoryDescription('');
    }
  };

  const handleSaveStory = (closeDialog: boolean = true) => {
    if (!newStoryTitle.trim()) return;

    // Generate a unique story ID using uuid
    const storyId = uuidv4();

    // Send addStory message via WebSocket with new format
    sendMessage({
      action: 'addStory',
      body: {
        roomId: roomId,
        story: {
          description: newStoryTitle.trim(),
          status: 'pending',
          storyId: storyId,
          storyPoints: 'n/a'
        }
      }
    });

    // Don't add to local state - wait for WebSocket confirmation
    
    if (closeDialog) {
      handleSetAddStoryDialog(false);
    } else {
      // Clear form for next story
      setNewStoryTitle('');
      setNewStoryDescription('');
    }
  };

  const handleSaveAndNext = () => {
    handleSaveStory(false);
  };

  const handleSaveAndClose = () => {
    handleSaveStory(true);
  };

  const currentStory = stories[currentStoryIndex];
  const results = showResults ? getVotingResults(votes) : null;

  // Show loading state
  if (loading || !isParticipantReady) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
        
        <EnterNameDialog
          open={showEnterNameDialog}
          onClose={handleEnterNameDialogClose}
          participantName={participantName}
          setParticipantName={setParticipantName}
          handleSaveName={handleSaveName}
        />
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading room data: {error}
        </Alert>
      </Container>
    );
  }

  // Show message if no room data
  if (!roomData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No room data available.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Sidebar */}
        <Box sx={{ flexBasis: { xs: '100%', md: '25%' }, flexShrink: 0 }}>
          <StoriesList
            stories={stories}
            currentStoryIndex={currentStoryIndex}
            setCurrentStoryIndex={handleStorySelection}
            setAddStoryDialog={handleSetAddStoryDialog}
            isRoomCreator={isRoomCreator}
            votes={votes}
            showResults={showResults || (currentStory?.status === 'complete' || currentStory?.status === 'completed')}
          />
          <ParticipantsList 
            participants={participants} 
            votes={votes} 
            showResults={showResults || (currentStory?.status === 'complete' || currentStory?.status === 'completed')} 
          />
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <CurrentStory currentStory={currentStory} roomName={roomName} roomId={roomId} />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {isRoomCreator && (
                <>
                  {/* Left side buttons */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!votingInProgress ? (
                      <Tooltip 
                        title={
                          (currentStory?.status === 'completed' || currentStory?.status === 'complete') 
                            ? "Story is already completed" 
                            : ""
                        }
                      >
                        <span>
                          <Button
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={handleStartVoting}
                            disabled={!stories || stories.length === 0 || (currentStory?.status === 'completed' || currentStory?.status === 'complete')}
                          >
                            Start Voting
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="contained"
                        disabled
                      >
                        Voting in progress...
                      </Button>
                    )}
                    <Tooltip 
                      title={
                        (currentStory?.status === 'completed' || currentStory?.status === 'complete') 
                          ? "Cannot skip completed story" 
                          : ""
                      }
                    >
                      <span>
                        <Button
                          variant="outlined"
                          startIcon={<SkipIcon />}
                          onClick={handleSkipStory}
                          disabled={currentStory?.status === 'completed' || currentStory?.status === 'complete'}
                        >
                          Skip
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>
                  
                  {/* Right side buttons */}
                  <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                    <Tooltip 
                      title={
                        (currentStory?.status === 'completed' || currentStory?.status === 'complete') 
                          ? "Votes are already shown for completed story" 
                          : Object.keys(votes).length === 0 ? "No votes to show" : ""
                      }
                    >
                      <span>
                        <Button
                          variant="outlined"
                          startIcon={<EyeIcon />}
                          onClick={handleShowVotes}
                          disabled={Object.keys(votes).length === 0 || (currentStory?.status === 'completed' || currentStory?.status === 'complete')}
                        >
                          Show Votes
                        </Button>
                      </span>
                    </Tooltip>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNextStory}
                      endIcon={<ChevronRightIcon />}
                      disabled={!cardsRevealed && !(currentStory?.status === 'completed' || currentStory?.status === 'complete')}
                    >
                      Next Story
                    </Button>
                  </Box>
                </>
              )}
            </Box>

            {/* Show voting area based on current story status */}
            {currentStory && (currentStory.status === 'votingInProgress' || currentStory.status === 'completed' || currentStory.status === 'complete') && (
              <VotingArea
                showResults={currentStory.status === 'completed' || currentStory.status === 'complete' || showResults}
                selectedEstimate={selectedEstimate}
                handleVote={currentStory.status === 'votingInProgress' ? handleVote : undefined}
              />
            )}

            {showResults && results && <Results results={results} />}
          </Paper>
        </Box>
      </Box>

      {isRoomCreator && (
        <AddStoryDialog
          open={addStoryDialogOpen}
          onClose={() => handleSetAddStoryDialog(false)}
          newStoryTitle={newStoryTitle}
          setNewStoryTitle={setNewStoryTitle}
          newStoryDescription={newStoryDescription}
          setNewStoryDescription={setNewStoryDescription}
          onSaveAndNext={handleSaveAndNext}
          onSaveAndClose={handleSaveAndClose}
        />
      )}

      <EnterNameDialog
        open={showEnterNameDialog}
        onClose={handleEnterNameDialogClose}
        participantName={participantName}
        setParticipantName={setParticipantName}
        handleSaveName={handleSaveName}
      />
    </Container>
  );
};

export default RoomPage;
