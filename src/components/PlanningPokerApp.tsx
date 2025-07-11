import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Link as LinkIcon, ExitToApp as LeaveIcon } from "@mui/icons-material";
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useRooms } from "../hooks/useRooms";
import HomePage from "./HomePage";
import RoomPage from "./RoomPage";
import CreateRoomDialog from "./CreateRoomDialog";
import SprintPlannerIcon from "./SprintPlannerIcon";
import type { Room } from "../types";

const RoomWrapper = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const handleLeaveRoom = () => {
    navigate('/');
  };
  
  // No need to check currentRoom, just render RoomPage with roomId from URL
  return roomId ? <RoomPage roomId={roomId} onLeaveRoom={handleLeaveRoom} /> : null;
}

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Check if we're on a room page
  const isRoomPage = location.pathname.startsWith('/room/');
  const roomId = isRoomPage ? location.pathname.split('/room/')[1] : null;

  const handleCopyToClipboard = async () => {
    if (roomId) {
      try {
        const inviteUrl = `${window.location.origin}/room/${roomId}`;
        await navigator.clipboard.writeText(inviteUrl);
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Failed to copy invite link:', error);
        // Fallback for older browsers or if clipboard API fails
        const textArea = document.createElement('textarea');
        textArea.value = `${window.location.origin}/room/${roomId}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setSnackbarOpen(true);
      }
    }
  };

  const handleLeaveRoom = () => {
    // Dispatch a custom event that the RoomPage can listen to
    window.dispatchEvent(new CustomEvent('leaveRoom'));
    
    // Navigate back to home page
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ backgroundColor: "white", borderBottom: "1px solid #e0e0e0", width: "100%" }  }
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <SprintPlannerIcon sx={{ color: "primary.main", mr: 1.5, fontSize: 32 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ color: "text.primary", fontWeight: "bold" }}
            >
              The Sprint Planner
            </Typography>
          </Box>
          <Box>
            {isRoomPage ? (
              <>
                <Tooltip title="Copy room URL to share with others">
                  <Button
                    color="inherit"
                    sx={{ color: "text.secondary", textTransform: "none", mr: 1 }}
                    startIcon={<LinkIcon />}
                    onClick={handleCopyToClipboard}
                  >
                    Copy Invite Link
                  </Button>
                </Tooltip>
                <Button
                  color="error"
                  sx={{ textTransform: "none" }}
                  startIcon={<LeaveIcon />}
                  onClick={handleLeaveRoom}
                >
                  Leave Room
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  sx={{ color: "text.secondary", textTransform: "none" }}
                >
                  How it works
                </Button>
                <Button
                  color="inherit"
                  sx={{ color: "text.secondary", textTransform: "none" }}
                >
                  About
                </Button>
                <Button
                  color="inherit"
                  sx={{ color: "text.secondary", textTransform: "none" }}
                >
                  Contact
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ paddingTop: "64px" }}>
        <Routes>
          <Route path="/" element={<PlanningPokerApp />} />
          <Route path="/room/:roomId" element={<RoomWrapper />} />
        </Routes>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          Invite link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

const PlanningPokerApp = () => {
  const navigate = useNavigate();

  const {
    rooms,
    createRoomDialog,
    newRoomName,
    isCreatingRoom,
    setCreateRoomDialog,
    setNewRoomName,
    handleCreateRoom,
    handleJoinRoom,
  } = useRooms();

  const handleJoinRoomAndSwitchView = (room: Room) => {
    handleJoinRoom(room);
    navigate(`/room/${room.id}`);
  };

  const handleJoinRoomByIdAndSwitchView = (roomId: string) => {
    // Navigate directly to the room page with the given room ID
    // The RoomPage component will handle fetching the room data and error handling
    navigate(`/room/${roomId}`);
  };

  const handleCreateRoomAndSwitchView = async () => {
    const result = await handleCreateRoom();
    if (result) {
      const { roomId } = result;
      
      // Navigate to room regardless - the Redux state will handle the pending room creation
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <>
      <HomePage
        rooms={rooms}
        handleJoinRoom={handleJoinRoomAndSwitchView}
        handleJoinRoomById={handleJoinRoomByIdAndSwitchView}
        setCreateRoomDialog={setCreateRoomDialog}
      />

      <CreateRoomDialog
        open={createRoomDialog}
        onClose={() => setCreateRoomDialog(false)}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        handleCreateRoom={handleCreateRoomAndSwitchView}
        isCreating={isCreatingRoom}
      />
    </>
  );
};

export default AppLayout;
