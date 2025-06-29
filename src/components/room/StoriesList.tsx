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
import type { Story } from '../../types';

interface StoriesListProps {
  stories: Story[];
  currentStoryIndex: number;
  setCurrentStoryIndex: (index: number) => void;
  setAddStoryDialog: (open: boolean) => void;
}

const StoriesList: FC<StoriesListProps> = ({ stories, currentStoryIndex, setCurrentStoryIndex, setAddStoryDialog }) => {
  return (
    <Paper sx={{ p: 2, mb: 2, maxHeight: '43vh', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Stories</Typography>
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
      </Box>
      <List dense>
        {stories.map((story, index) => (
          <ListItem key={story.id} disablePadding>
            <ListItemButton
              selected={index === currentStoryIndex}
              onClick={() => setCurrentStoryIndex(index)}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor:
                  index === currentStoryIndex
                    ? 'primary.light'
                    : story.status === 'completed'
                    ? 'success.light'
                    : 'transparent',
                color: 'inherit',
                borderLeft: '4px solid',
                borderColor:
                  index === currentStoryIndex
                    ? 'primary.main'
                    : story.status === 'completed'
                    ? 'success.main'
                    : 'grey.300',
                '&:hover': {
                  backgroundColor:
                    index === currentStoryIndex
                      ? 'primary.light'
                      : story.status === 'completed'
                      ? 'success.dark'
                      : undefined,
                },
              }}
            >
              <ListItemText
                primary={story.title}
                secondary={story.status === 'completed' ? `${story.estimate} points` : story.status}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StoriesList;
