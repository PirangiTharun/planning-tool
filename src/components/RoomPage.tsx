import { type FC, useEffect, useState, useCallback, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
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
import { useAppDispatch } from '../store/hooks';
import { addStory, addParticipant } from '../store/slices/roomSlice';

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
  
  // Connect to WebSocket when room is loaded, but don't send connectSocket yet
  const { lastMessage, sendMessage, disconnectSocket, isConnected, connectSocket, connectAndAddParticipant } = useSocket(roomId, null, true);
  const { roomData, loading, error } = useRoomData(roomId);
  const dispatch = useAppDispatch();
  
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

  // Transform API data to local format
  const transformedData = roomData ? transformRoomApiResponse(roomData) : null;
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
    const pendingRoomCreation = localStorage.getItem('pendingRoomCreation');
    
    if (storedId && storedName) {
      // Participant exists in localStorage - this is an existing participant
      setParticipantId(storedId);
      setParticipantName(storedName);
      setIsParticipantReady(true);
      setIsNewParticipant(false); // Mark as existing participant
      
      // If there's a pending room creation, complete it now
      if (pendingRoomCreation) {
        const { roomId: pendingRoomId, roomName: pendingRoomName } = JSON.parse(pendingRoomCreation);
        localStorage.removeItem('pendingRoomCreation');
        
        // Call the API directly to complete room creation
        import('../store/api/roomApi').then(({ createRoom, fetchRoomData }) => {
          const apiPayload = {
            roomId: pendingRoomId,
            roomName: pendingRoomName,
            createdBy: storedId
          };
          
          createRoom(apiPayload).then(() => {
            // Only call getRoomDetails if participantId exists
            if (storedId) {
              return fetchRoomData(pendingRoomId);
            }
          }).catch((error) => {
            console.error('Error completing room creation:', error);
          });
        });
      }
    } else {
      // No participant in localStorage, show name dialog
      setShowEnterNameDialog(true);
      setIsNewParticipant(true); // Will be a new participant
    }
  }, []); // Only run once on mount

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
      }
    }
  }, [lastMessage, dispatch]);

  useEffect(() => {
    if (roomData && participantId && participantName) {
      console.log('Room data loaded from API:', roomData);
      
      // Check if current participant exists in the room's participant list
      const currentParticipantExists = roomData.participants.some(
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
  }, [roomData, participantId, participantName, isConnected, sendMessage, roomId]);

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
    setVotingInProgress(true);
    setShowResults(false);
    setCardsRevealed(false);
    setVotes({});
    setSelectedEstimate(null);
  };

  const handleVote = (estimate: number | string) => {
    setSelectedEstimate(estimate);
    // In a real app, you'd send this to the server
    // For now, just store locally
    setVotes(prev => ({
      ...prev,
      [1]: estimate // Using participant ID 1 as example
    }));
  };

  const handleShowVotes = () => {
    setShowResults(true);
    setCardsRevealed(true);
    setVotingInProgress(false);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      // Reset voting state for next story
      setVotes({});
      setVotingInProgress(false);
      setShowResults(false);
      setCardsRevealed(false);
      setSelectedEstimate(null);
    }
  };

  const handleSkipStory = () => {
    handleNextStory();
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

    // Check if there's a pending room creation to complete
    const pendingRoomCreation = localStorage.getItem('pendingRoomCreation');
    if (pendingRoomCreation) {
      const { roomId: pendingRoomId, roomName: pendingRoomName } = JSON.parse(pendingRoomCreation);
      localStorage.removeItem('pendingRoomCreation');
      
      // Call the API to complete room creation
      import('../store/api/roomApi').then(({ createRoom, fetchRoomData }) => {
        const apiPayload = {
          roomId: pendingRoomId,
          roomName: pendingRoomName,
          createdBy: newParticipantId
        };
        
        createRoom(apiPayload).then(() => {
          // Only call getRoomDetails if participantId exists
          if (newParticipantId) {
            return fetchRoomData(pendingRoomId);
          }
        }).catch((error) => {
          console.error('Error completing room creation:', error);
        });
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
            setCurrentStoryIndex={setCurrentStoryIndex}
            setAddStoryDialog={handleSetAddStoryDialog}
            isRoomCreator={isRoomCreator}
          />
          <ParticipantsList participants={participants} votes={votes} showResults={showResults} />
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <CurrentStory currentStory={currentStory} roomName={roomName} roomId={roomId} />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {isRoomCreator && (
                <>
                  {!votingInProgress ? (
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={handleStartVoting}
                    >
                      Start Voting
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      disabled
                    >
                      Voting in progress...
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<SkipIcon />}
                    onClick={handleSkipStory}
                  >
                    Skip
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EyeIcon />}
                    onClick={handleShowVotes}
                    sx={{ ml: 'auto' }}
                    disabled={Object.keys(votes).length === 0}
                  >
                    Show Votes
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextStory}
                    endIcon={<ChevronRightIcon />}
                    disabled={!cardsRevealed}
                  >
                    Next Story
                  </Button>
                </>
              )}
            </Box>

            {(votingInProgress || showResults) && (
              <VotingArea
                showResults={showResults}
                selectedEstimate={selectedEstimate}
                handleVote={handleVote}
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
