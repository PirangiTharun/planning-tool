import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from '@mui/material';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  handleCreateRoom: () => void;
}

const CreateRoomDialog: FC<CreateRoomDialogProps> = ({ open, onClose, newRoomName, setNewRoomName, handleCreateRoom }) => (
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
        onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={handleCreateRoom} variant="contained">Create Room</Button>
    </DialogActions>
  </Dialog>
);

export default CreateRoomDialog;
