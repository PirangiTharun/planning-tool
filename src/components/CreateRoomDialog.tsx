import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  handleCreateRoom: () => void;
  isCreating?: boolean;
}

const CreateRoomDialog: FC<CreateRoomDialogProps> = ({ 
  open, 
  onClose, 
  newRoomName, 
  setNewRoomName, 
  handleCreateRoom,
  isCreating = false
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Create New Room</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Room Name"
        fullWidth
        variant="outlined"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !isCreating && handleCreateRoom()}
        disabled={isCreating}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isCreating}>Cancel</Button>
      <Button 
        onClick={handleCreateRoom} 
        variant="contained" 
        disabled={isCreating || !newRoomName.trim()}
        startIcon={isCreating ? <CircularProgress size={20} /> : null}
      >
        {isCreating ? 'Creating...' : 'Create Room'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default CreateRoomDialog;
