import type { FC } from 'react';
import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

interface LoadingOverlayProps {
  active: boolean;
  message?: string;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ active, message }) => {
  return (
    <Backdrop
      open={active}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        bgcolor: 'rgba(0,0,0,0.45)',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress sx={{ color: '#fff' }} thickness={5} />
        {message ? (
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
            {message}
          </Typography>
        ) : null}
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
