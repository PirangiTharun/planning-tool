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

  // Convert string votes to numbers, excluding non-numeric votes like "?" or "c"
  const numericVotes = voteValues
    .map(vote => {
      const num = Number(vote);
      return !isNaN(num) ? num : null;
    })
    .filter((vote): vote is number => vote !== null);

  const average = numericVotes.length > 0
    ? Math.round((numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length) * 10) / 10
    : 0;
    
  const sortedVotes = [...numericVotes].sort((a, b) => a - b);
  const median = sortedVotes.length > 0
    ? sortedVotes[Math.floor(sortedVotes.length / 2)]
    : 0;
    
  const mode = Object.keys(voteDistribution).reduce((a, b) => voteDistribution[a] > voteDistribution[b] ? a : b);
  
  const range = numericVotes.length > 1
    ? `${Math.min(...numericVotes)} - ${Math.max(...numericVotes)}`
    : numericVotes.length === 1
    ? String(numericVotes[0])
    : 'N/A';

  // Calculate consensus based on vote distribution
  const totalVotes = voteValues.length;
  const maxVoteCount = Math.max(...Object.values(voteDistribution));
  const consensusPercentage = totalVotes > 0 ? Math.round((maxVoteCount / totalVotes) * 100) : 0;
  
  let consensus = 'Low';
  if (consensusPercentage >= 80) {
    consensus = `High (${consensusPercentage}%)`;
  } else if (consensusPercentage >= 60) {
    consensus = `Medium (${consensusPercentage}%)`;
  } else {
    consensus = `Low (${consensusPercentage}%)`;
  }

  return { chartData, average, median, mode, range, consensus };
};
