import type { FC } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
// import the correct type from '../../types', or define VotingResult here if missing
// Example: If VotingResult is not exported, define it locally as a temporary fix:
export interface VotingResult {
  chartData: { estimate: string | number; votes: number }[];
  average: number;
  median: number;
  mode: number | string;
  range: string;
  consensus: string;
}

interface ResultsProps {
  results: VotingResult;
}

const Results: FC<ResultsProps> = ({ results }) => {
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        Voting Results
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 4 } }}>
        <Box sx={{ flex: { md: 2 } }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Vote Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estimate" />
              <YAxis allowDecimals={false} />
              <ChartTooltip />
              <Bar dataKey="votes" fill="#0284c7" barSize={window.innerWidth < 600 ? 20 : 30} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ flex: { md: 1 } }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Summary
          </Typography>
          <Box 
            sx={{ 
              '& > div': { 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1,
                fontSize: { xs: '0.85rem', sm: '1rem' }
              } 
            }}
          >
            <div>
              <Typography sx={{ fontSize: 'inherit' }}>Average</Typography>
              <Typography fontWeight="bold" sx={{ fontSize: 'inherit' }}>{results.average}</Typography>
            </div>
            <div>
              <Typography sx={{ fontSize: 'inherit' }}>Median</Typography>
              <Typography fontWeight="bold" sx={{ fontSize: 'inherit' }}>{results.median}</Typography>
            </div>
            <div>
              <Typography sx={{ fontSize: 'inherit' }}>Mode</Typography>
              <Typography fontWeight="bold" sx={{ fontSize: 'inherit' }}>{results.mode}</Typography>
            </div>
            <div>
              <Typography sx={{ fontSize: 'inherit' }}>Range</Typography>
              <Typography fontWeight="bold" sx={{ fontSize: 'inherit' }}>{results.range}</Typography>
            </div>
            <div>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 'inherit' }}>Consensus</Typography>
                <Tooltip title="Consensus measures how much the team agrees on the estimate. High consensus (80%+) means most people voted for the same value. Medium consensus (60-79%) shows reasonable agreement. Low consensus (<60%) indicates diverse opinions and may need discussion.">
                  <IconButton size="small" sx={{ p: 0.25 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography fontWeight="bold" sx={{ fontSize: 'inherit' }}>{results.consensus}</Typography>
            </div>
          </Box>
          <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Final Estimate
          </Typography>
          <Chip
            label={`${results.mode} points`}
            color="primary"
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{ mr: 1 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default Results;
