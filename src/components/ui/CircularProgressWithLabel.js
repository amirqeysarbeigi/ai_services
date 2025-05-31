import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function CircularProgressWithLabel({ value, label, color = 'primary', size = 80 }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        color={color}
        size={size}
        thickness={5}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          color="text.primary"
          sx={{ fontWeight: 700 }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default CircularProgressWithLabel; 