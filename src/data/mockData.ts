import type { Room, Story, Participant } from '../types';

export const initialRooms: Room[] = [
  { id: 'a1b2c3d4', name: 'Sprint 24 Planning', created: '2 mins ago', participants: 5, status: 'Active' },
  { id: 'e5f6g7h8', name: 'Backend Tasks', created: '15 mins ago', participants: 3, status: 'Active' },
  { id: 'i9j0k1l2', name: 'UI Redesign', created: '45 mins ago', participants: 4, status: 'Paused' }
];

export const initialStories: Story[] = [
  { id: 1, title: 'Implement user authentication', description: 'Implement user authentication with OAuth 2.0 and add support for Google and GitHub login options.', status: 'completed', estimate: 8 },
  { id: 2, title: 'Create responsive dashboard UI', description: '', status: 'pending', estimate: null },
  { id: 3, title: 'Fix payment gateway integration bugs', description: '', status: 'pending', estimate: null },
  { id: 4, title: 'Set up automated testing', description: '', status: 'pending', estimate: null }
];

export const initialParticipants: Participant[] = [
  { id: 1, name: 'John Doe', initials: 'JD', voted: false },
  { id: 2, name: 'Alice Smith', initials: 'AS', voted: false },
  { id: 3, name: 'Robert Johnson', initials: 'RJ', voted: false },
  { id: 4, name: 'Emma Wilson', initials: 'EW', voted: false },
  { id: 5, name: 'Mike Brown', initials: 'MB', voted: false },
  { id: 6, name: 'Sophia Lee', initials: 'SL', voted: false },
  { id: 7, name: 'David Kim', initials: 'DK', voted: false },
  { id: 8, name: 'Olivia Martinez', initials: 'OM', voted: false },
  { id: 9, name: 'James Anderson', initials: 'JA', voted: false },
  { id: 10, name: 'Isabella Thomas', initials: 'IT', voted: false },
  { id: 11, name: 'William Harris', initials: 'WH', voted: false },
  { id: 12, name: 'Mia Clark', initials: 'MC', voted: false },
  { id: 13, name: 'Benjamin Lewis', initials: 'BL', voted: false },
  { id: 14, name: 'Charlotte Walker', initials: 'CW', voted: false },
  { id: 15, name: 'Lucas Young', initials: 'LY', voted: false }
];
