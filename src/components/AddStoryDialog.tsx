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
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      Add New Story
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Story Title"
        fullWidth
        variant="outlined"
        value={newStoryTitle}
        onChange={(e) => setNewStoryTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        margin="dense"
        label="Description (Optional)"
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="Enter a more detailed description"
        value={newStoryDescription}
        onChange={(e) => setNewStoryDescription(e.target.value)}
        sx={{ mt: 2 }}
      />
    </DialogContent>
    <DialogActions sx={{ p: 3, pt: 2 }}>
      <Button onClick={onSaveAndNext} variant="outlined">
        Save and Next
      </Button>
      <Button onClick={onSaveAndClose} variant="contained">
        Save and Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default AddStoryDialog;
