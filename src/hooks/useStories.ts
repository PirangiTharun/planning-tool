import { useState } from 'react';
import type { Story } from '../types';
import { initialStories } from '../data/mockData';

export const useStories = (
  sendMessage: (message: { action: string; body: unknown }) => void,
  roomId: string | null,
) => {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [addStoryDialog, setAddStoryDialog] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');
  const [allStoriesReviewed, setAllStoriesReviewed] = useState(false);

  const onSave = () => {
    if (newStoryTitle.trim()) {
      const newStory: Story = {
        id: stories.length + 1,
        title: newStoryTitle,
        description: newStoryDescription,
        status: 'pending',
        estimate: null,
      };
      setStories([...stories, newStory]);
      if (roomId) {
        sendMessage({
          action: 'addStory',
          body: {
            roomId,
            story: newStory.title,
          },
        });
      }
      setNewStoryTitle('');
      setNewStoryDescription('');
      setAllStoriesReviewed(false);
    }
  };

  const onSaveAndNext = () => {
    onSave();
  };

  const onSaveAndClose = () => {
    onSave();
    setAddStoryDialog(false);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setAllStoriesReviewed(true);
    }
  };

  const handleSkipStory = () => {
    handleNextStory();
  };

  const resetStories = () => {
    setStories(initialStories);
    setCurrentStoryIndex(0);
    setAllStoriesReviewed(false);
  };

  return {
    stories,
    currentStoryIndex,
    addStoryDialog,
    newStoryTitle,
    newStoryDescription,
    setAddStoryDialog,
    setNewStoryTitle,
    setNewStoryDescription,
    onSaveAndNext,
    onSaveAndClose,
    handleNextStory,
    handleSkipStory,
    setCurrentStoryIndex,
    allStoriesReviewed,
    setAllStoriesReviewed,
    resetStories,
  };
};
