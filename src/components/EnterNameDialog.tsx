import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from '@mui/material';

interface EnterNameDialogProps {
  open: boolean;
  onClose: () => void;
  participantName: string;
  setParticipantName: (name: string) => void;
  handleSaveName: () => void;
}

const EnterNameDialog: FC<EnterNameDialogProps> = ({ open, onClose, participantName, setParticipantName, handleSaveName }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Enter Your Name</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Your Name"
        fullWidth
        variant="outlined"
        value={participantName}
        onChange={(e) => setParticipantName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleSaveName} variant="contained">Enter</Button>
    </DialogActions>
  </Dialog>
);

export default EnterNameDialog;
