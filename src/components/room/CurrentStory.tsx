import { type FC, useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import type { Story } from '../../types';

interface CurrentStoryProps {
  currentStory: Story | undefined;
  roomName: string;
  roomId: string;
}

const CurrentStory: FC<CurrentStoryProps> = ({ currentStory, roomName, roomId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>{roomName}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Room ID: {roomId}
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy ID'}>
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, mb: 3 }}>
        <Typography variant="body1">
          {currentStory?.description || currentStory?.title}
        </Typography>
      </Box>
    </>
  );
};

export default CurrentStory;
