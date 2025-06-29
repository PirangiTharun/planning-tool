import type { FC } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Voting Results</Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: { md: 2 } }}>
          <Typography variant="subtitle1" gutterBottom>Vote Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estimate" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="votes" fill="#0284c7" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ flex: { md: 1 } }}>
          <Typography variant="subtitle1" gutterBottom>Summary</Typography>
          <Box sx={{ '& > div': { display: 'flex', justifyContent: 'space-between', mb: 1 } }}>
            <div>
              <Typography>Average</Typography>
              <Typography fontWeight="bold">{Math.round(results.average)}</Typography>
            </div>
            <div>
              <Typography>Median</Typography>
              <Typography fontWeight="bold">{results.median}</Typography>
            </div>
            <div>
              <Typography>Mode</Typography>
              <Typography fontWeight="bold">{results.mode}</Typography>
            </div>
            <div>
              <Typography>Range</Typography>
              <Typography fontWeight="bold">{results.range}</Typography>
            </div>
            <div>
              <Typography>Consensus</Typography>
              <Typography fontWeight="bold">{results.consensus} (60%)</Typography>
            </div>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Final Estimate</Typography>
          <Chip
            label={`${results.mode} points`}
            color="primary"
            size="medium"
            sx={{ mr: 1 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default Results;
