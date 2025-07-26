import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface AddStoryDialogProps {
  open: boolean;
  onClose: () => void;
  newStoryTitle: string;
  setNewStoryTitle: (title: string) => void;
  newStoryDescription: string;
  setNewStoryDescription: (description: string) => void;
  onSaveAndNext: () => void;
  onSaveAndClose: () => void;
}

const AddStoryDialog: FC<AddStoryDialogProps> = ({
  open,
  onClose,
  newStoryTitle,
  setNewStoryTitle,
  newStoryDescription,
  setNewStoryDescription,
  onSaveAndNext,
  onSaveAndClose,
}) => (
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
      Add New Story
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
      <TextField
        autoFocus
        margin="dense"
        label="Story Title"
        fullWidth
        variant="outlined"
        value={newStoryTitle}
        onChange={(e) => setNewStoryTitle(e.target.value)}
        sx={{ mb: 2 }}
        inputProps={{ 
          style: { fontSize: window.innerWidth < 600 ? '0.9rem' : '1rem' }
        }}
        InputLabelProps={{ 
          style: { fontSize: window.innerWidth < 600 ? '0.9rem' : '1rem' }
        }}
      />
      <TextField
        margin="dense"
        label="Description (Optional)"
        fullWidth
        multiline
        rows={window.innerWidth < 600 ? 2 : 3}
        variant="outlined"
        placeholder="Enter a more detailed description"
        value={newStoryDescription}
        onChange={(e) => setNewStoryDescription(e.target.value)}
        sx={{ mt: 2 }}
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
        onClick={onSaveAndNext} 
        variant="outlined"
        size={window.innerWidth < 600 ? "small" : "medium"}
        sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}
      >
        Save and Next
      </Button>
      <Button 
        onClick={onSaveAndClose} 
        variant="contained"
        size={window.innerWidth < 600 ? "small" : "medium"}
        sx={{ fontSize: { xs: '0.8rem', sm: 'inherit' } }}
      >
        Save and Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default AddStoryDialog;
