import type { FC } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import type { Story, VoteMap } from '../../types';
import { getVotingResults } from '../../utils/results';

interface StoriesListProps {
  stories: Story[];
  currentStoryIndex: number;
  setCurrentStoryIndex: (index: number) => void;
  setAddStoryDialog: (open: boolean) => void;
  isRoomCreator?: boolean;
  votes?: VoteMap;
  showResults?: boolean;
}

const StoriesList: FC<StoriesListProps> = ({ stories, currentStoryIndex, setCurrentStoryIndex, setAddStoryDialog, isRoomCreator = false, votes = {}, showResults = false }) => {
  
  // Calculate final estimate for completed stories
  const getFinalEstimate = (story: Story, index: number) => {
    // For completed stories, first check if we have a stored final estimate
    if ((story.status === 'completed' || story.status === 'complete') && story.finalEstimate) {
      return `${story.finalEstimate} points`;
    }
    
    // For completed stories with stored votes, calculate the final estimate from votes
    if ((story.status === 'completed' || story.status === 'complete') && story.votes && Array.isArray(story.votes) && story.votes.length > 0) {
      const storyVotes: VoteMap = {};
      story.votes.forEach(({ participantId, vote }) => {
        storyVotes[participantId] = vote;
      });
      const results = getVotingResults(storyVotes);
      return `${results.mode} points`;
    }
    
    // For the current story with votes, calculate the final estimate dynamically
    if ((story.status === 'completed' || story.status === 'complete') && showResults && index === currentStoryIndex && Object.keys(votes).length > 0) {
      const results = getVotingResults(votes);
      return `${results.mode} points`;
    }
    
    // Fall back to the original estimate or "No estimate"
    return story.estimate !== null ? `${story.estimate} points` : 'No estimate';
  };

  return (
    <Paper sx={{ p: 2, mb: 2, maxHeight: '43vh', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Stories</Typography>
        {isRoomCreator && (
          <Button
            variant="text"
            onClick={() => setAddStoryDialog(true)}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            + Add
          </Button>
        )}
      </Box>
      <List dense>
        {stories.map((story, index) => (
          <ListItem key={story.id} disablePadding>
            <ListItemButton
              selected={index === currentStoryIndex}
              onClick={isRoomCreator ? () => setCurrentStoryIndex(index) : undefined}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor:
                  index === currentStoryIndex
                    ? 'primary.light'
                    : (story.status === 'completed' || story.status === 'complete')
                    ? 'success.light'
                    : 'transparent',
                color: 'inherit',
                borderLeft: '4px solid',
                borderColor:
                  index === currentStoryIndex
                    ? 'primary.main'
                    : (story.status === 'completed' || story.status === 'complete')
                    ? 'success.main'
                    : 'grey.300',
                cursor: isRoomCreator ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor:
                    index === currentStoryIndex
                      ? 'primary.light'
                      : (story.status === 'completed' || story.status === 'complete')
                      ? 'success.dark'
                      : 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={story.title}
                secondary={
                  (story.status === 'completed' || story.status === 'complete')
                    ? getFinalEstimate(story, index)
                    : story.status === 'votingInProgress'
                    ? 'Voting in progress...'
                    : story.status
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StoriesList;
