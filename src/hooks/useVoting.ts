import { useState } from 'react';
import type { VoteMap } from '../types';

export const useVoting = () => {
  const [votes, setVotes] = useState<VoteMap>({});
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<string | number | null>(null);
  const [cardsRevealed, setCardsRevealed] = useState(false);

  const handleStartVoting = () => {
    setVotingInProgress(true);
    setShowResults(false);
    setVotes({});
    setCardsRevealed(false);
    setSelectedEstimate(null);
  };

  const handleVote = (estimate: number | string) => {
    setSelectedEstimate(estimate);
    const newVotes: VoteMap = { ...votes };
    newVotes[1] = estimate; // Simulating current user vote
    setVotes(newVotes);

    // Simulate other participants voting
    setTimeout(() => {
      const simulatedVotes: VoteMap = { ...newVotes };
      simulatedVotes[2] = Math.random() > 0.5 ? 3 : 5;
      simulatedVotes[3] = Math.random() > 0.5 ? 5 : 8;
      simulatedVotes[4] = Math.random() > 0.5 ? 8 : 13;
      simulatedVotes[5] = Math.random() > 0.5 ? 5 : 8;
      setVotes(simulatedVotes);
    }, 2000);
  };

  const handleShowVotes = () => {
    setShowResults(true);
    setCardsRevealed(true);
    setVotingInProgress(false);
  };

  const resetVoting = () => {
    setVotingInProgress(false);
    setShowResults(false);
    setVotes({});
    setCardsRevealed(false);
    setSelectedEstimate(null);
  };

  return {
    votes,
    votingInProgress,
    showResults,
    selectedEstimate,
    cardsRevealed,
    handleStartVoting,
    handleVote,
    resetVoting,
    handleShowVotes,
  };
};
