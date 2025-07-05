import { useState, useEffect } from 'react';

const generateParticipantId = () => {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
};

export const useParticipant = () => {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [nameDialog, setNameDialog] = useState(false);

  useEffect(() => {
    const storedParticipantId = localStorage.getItem('participantId');

    if (storedParticipantId) {
      setParticipantId(storedParticipantId);
    } else {
      setNameDialog(true);
    }
  }, []);

  const handleSetParticipantName = (name: string) => {
    const newId = generateParticipantId();
    setParticipantId(newId);
    setParticipantName(name);
    localStorage.setItem('participantId', newId);
    setNameDialog(false);
  };

  return {
    participantId,
    participantName,
    nameDialog,
    handleSetParticipantName,
    setNameDialog,
  };
};
