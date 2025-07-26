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
  <Dialog 
    open={open} 
    onClose={onClose} 
    maxWidth="sm" 
    fullWidth
    PaperProps={{
      sx: { 
        mx: { xs: 2, sm: 'auto' },
        width: { xs: 'calc(100% - 16px)', sm: '100%' }
      }
    }}
  >
    <DialogTitle sx={{ 
      fontSize: { xs: '1.1rem', sm: '1.25rem' },
      py: { xs: 1.5, sm: 2 }
    }}>
      Enter Your Name
    </DialogTitle>
    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
      <TextField
        autoFocus
        margin="dense"
        label="Your Name"
        fullWidth
        variant="outlined"
        value={participantName}
        onChange={(e) => setParticipantName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
        inputProps={{ 
          style: { fontSize: window.innerWidth < 600 ? '0.9rem' : '1rem' }
        }}
        InputLabelProps={{ 
          style: { fontSize: window.innerWidth < 600 ? '0.9rem' : '1rem' }
        }}
      />
    </DialogContent>
    <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 2 } }}>
      <Button 
        onClick={handleSaveName} 
        variant="contained"
        size={window.innerWidth < 600 ? "small" : "medium"}
        sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}
      >
        Enter
      </Button>
    </DialogActions>
  </Dialog>
);

export default EnterNameDialog;
