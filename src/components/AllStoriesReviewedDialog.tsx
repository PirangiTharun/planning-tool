import type { FC } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface AllStoriesReviewedDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMoreStories: () => void;
  onCloseRoom: () => void;
  onReset: () => void;
}

const AllStoriesReviewedDialog: FC<AllStoriesReviewedDialogProps> = ({ open, onClose, onAddMoreStories, onCloseRoom, onReset }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>All Stories Reviewed</DialogTitle>
    <DialogContent>
      <DialogContentText>
        You have reviewed all the stories. Would you like to add more stories or close the room?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onAddMoreStories}>Add More Stories</Button>
      <Button onClick={onReset}>Reset and Add More</Button>
      <Button onClick={onCloseRoom} color="primary">
        Close Room
      </Button>
    </DialogActions>
  </Dialog>
);

export default AllStoriesReviewedDialog;
