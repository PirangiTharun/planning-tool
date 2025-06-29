import type { VoteMap } from '../types';

export const getVotingResults = (votes: VoteMap) => {
  const voteValues = Object.values(votes);
  const voteDistribution: { [key: string]: number } = {};

  voteValues.forEach(vote => {
    voteDistribution[String(vote)] = (voteDistribution[String(vote)] || 0) + 1;
  });

  const chartData = Object.entries(voteDistribution).map(([value, count]) => ({
    estimate: value,
    votes: count
  }));

  const numericVotes = voteValues.filter((vote): vote is number => typeof vote === 'number');
  const average = numericVotes.length > 0
    ? numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length
    : 0;
  const sortedVotes = [...numericVotes].sort((a, b) => a - b);
  const median = sortedVotes.length > 0
    ? sortedVotes[Math.floor(sortedVotes.length / 2)]
    : 0;
  const mode = Object.keys(voteDistribution).reduce((a, b) => voteDistribution[a] > voteDistribution[b] ? a : b);
  const range = numericVotes.length > 0
    ? `${Math.min(...numericVotes)} - ${Math.max(...numericVotes)}`
    : 'N/A';
  const consensus = voteValues.length > 0 && voteValues.every(vote => vote === voteValues[0]) ? 'High' : 'Medium';

  return { chartData, average, median, mode, range, consensus };
};
