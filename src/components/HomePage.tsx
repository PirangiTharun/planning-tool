import { type FC, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, BarChart as ChartIcon } from '@mui/icons-material';
import type { Room } from '../types';

interface HomePageProps {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  handleJoinRoom: (room: Room) => void;
  handleJoinRoomById: (roomId: string) => void;
  setCreateRoomDialog: (open: boolean) => void;
}

const HomePage: FC<HomePageProps> = ({ 
  rooms, 
  loading, 
  error, 
  handleJoinRoom, 
  handleJoinRoomById, 
  setCreateRoomDialog 
}) => {
  const [joinRoomId, setJoinRoomId] = useState('');
  const hasParticipantId = !!localStorage.getItem('participantId');

  const handleJoinWithId = () => {
    const trimmedRoomId = joinRoomId.trim();
    if (trimmedRoomId) {
      handleJoinRoomById(trimmedRoomId);
    } else {
      alert('Please enter a valid Room ID');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
        The Sprint Planner
      </Typography>
      <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6 }}>
        Simplify your planning sessions with our intuitive sprint planning tool for agile teams.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6 }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3,
            transition: 'box-shadow .3s',
            '&:hover': {
              boxShadow: 8,
            }
          }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <AddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Create a Room
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 3 }}>
                Start a new planning session and invite your team members.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => setCreateRoomDialog(true)}
              >
                Create Room
              </Button>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3,
            transition: 'box-shadow .3s',
            '&:hover': {
              boxShadow: 8,
            }
          }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
              <ChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Join a Room
              </Typography>
              <Typography color="textSecondary" sx={{ mb: 3 }}>
                Enter an existing room to participate in a planning session.
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Room ID"
                variant="outlined"
                sx={{ mb: 2 }}
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinWithId()}
              />
              <Button variant="outlined" size="large" fullWidth onClick={handleJoinWithId}>
                Join Room
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Open Rooms
        </Typography>
      </Box>
      
      <TableContainer component={Paper} sx={{
        boxShadow: 3,
        transition: 'box-shadow .3s',
        '&:hover': {
          boxShadow: 8,
        },
        mb: 4
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Name</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Loading rooms...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="error" sx={{ mb: 1 }}>
                    {error}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please try again later.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && !error && rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    No rooms available
                  </Typography>
                  {hasParticipantId ? (
                    <Typography variant="body2" color="text.secondary">
                      Create a new room to get started
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Please create a room first. This will automatically create your participant profile.
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
            
            {!loading && !error && rooms.length > 0 && rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.created}</TableCell>
                <TableCell>{room.participants}</TableCell>
                <TableCell>
                  <Chip
                    label={room.status}
                    color={room.status === 'Active' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => handleJoinRoom(room)}
                  >
                    Join
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default HomePage;
