import type { FC } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { fibonacciNumbers } from '../../data/constants';

interface VotingAreaProps {
  showResults: boolean;
  selectedEstimate: string | number | null;
  handleVote: (estimate: number | string) => void;
}

const VotingArea: FC<VotingAreaProps> = ({ showResults, selectedEstimate, handleVote }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>Select Your Estimate</Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 3,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)'
          },
          ...(showResults && {
            pointerEvents: 'none',
            opacity: 0.6,
          }),
        }}
      >
        {fibonacciNumbers.map((num) => (
          <Card
            key={num}
            sx={{
              cursor: 'pointer',
              backgroundColor: selectedEstimate === num ? 'primary.main' : 'background.paper',
              color: selectedEstimate === num ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                backgroundColor: selectedEstimate === num ? 'primary.dark' : 'action.hover'
              },
              transition: 'all 0.2s'
            }}
            onClick={() => handleVote(num)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h4">{num}</Typography>
            </CardContent>
          </Card>
        ))}
        <Card
          sx={{
            cursor: 'pointer',
            backgroundColor: selectedEstimate === '?' ? 'primary.main' : 'background.paper',
            color: selectedEstimate === '?' ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              backgroundColor: selectedEstimate === '?' ? 'primary.dark' : 'action.hover'
            },
            transition: 'all 0.2s'
          }}
          onClick={() => handleVote('?')}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h4">?</Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default VotingArea;
