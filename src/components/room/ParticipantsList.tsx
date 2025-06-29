import type { FC } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  Box,
  ListItemText,
  Chip,
} from '@mui/material';
import type { Participant, VoteMap } from '../../types';
import { participantColors } from '../../data/constants';

const getColorByParticipantId = (id: number) => {
  return participantColors[id % participantColors.length];
};

interface ParticipantsListProps {
  participants: Participant[];
  votes: VoteMap;
  showResults: boolean;
}

const ParticipantsList: FC<ParticipantsListProps> = ({ participants, votes, showResults }) => {
  return (
    <Paper sx={{ p: 2, maxHeight: '43vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>Participants ({participants.length})</Typography>
      <List dense>
        {participants.map((participant) => (
          <ListItem key={participant.id}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: getColorByParticipantId(participant.id),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                mr: 2
              }}
            >
              {participant.initials}
            </Box>
            <ListItemText primary={participant.name} />
            {showResults ? (
              <Chip
                label={votes[participant.id] ?? 'N/A'}
                color="primary"
                size="small"
                variant="outlined"
              />
            ) : (
              <Chip
                label={votes[participant.id] ? 'Voted' : 'Voting...'}
                color={votes[participant.id] ? 'success' : 'default'}
                size="small"
              />
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ParticipantsList;
