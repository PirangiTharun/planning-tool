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
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 }, 
      maxHeight: { xs: '35vh', md: '43vh' }, 
      overflowY: 'auto' 
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        Participants ({participants.length})
      </Typography>
      <List dense sx={{ py: 0 }}>
        {participants.map((participant) => (
          <ListItem 
            key={participant.participantId}
            sx={{ 
              py: { xs: 0.5, sm: 1 }
            }}
          >
            <Box
              sx={{
                width: { xs: 24, sm: 32 },
                height: { xs: 24, sm: 32 },
                borderRadius: '50%',
                backgroundColor: getColorByParticipantId(participant.id),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: '10px', sm: '12px' },
                fontWeight: 'bold',
                mr: { xs: 1, sm: 2 }
              }}
            >
              {participant.initials}
            </Box>
            <ListItemText 
              primary={
                <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.9375rem' } }}>
                  {participant.name}
                </Typography>
              }
            />
            {showResults ? (
              <Chip
                label={votes[participant.participantId] ?? 'N/A'}
                color="primary"
                size="small"
                // variant="outlined"
                // sx={{ height: { xs: 24, sm: 32 }, fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                variant={votes[participant.participantId] ? "filled" : "outlined"}
                sx={{ 
                  height: { xs: 24, sm: 32 }, 
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  fontWeight: votes[participant.participantId] ? 'bold' : 'normal',
                  boxShadow: votes[participant.participantId] ? 1 : 0
                }}
              />
            ) : (
              <Chip
                label={votes[participant.participantId] ? 'Voted' : 'Voting...'}
                color={votes[participant.participantId] ? 'success' : 'default'}
                size="small"
                sx={{ height: { xs: 24, sm: 32 }, fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ParticipantsList;
