import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AI Services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Empowering innovation through artificial intelligence.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              About Us
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" display="block">
              Contact Us
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Services
            </Typography>
            <Link component={RouterLink} to="/face-detection" color="inherit" display="block" sx={{ mb: 1 }}>
              Face Detection
            </Link>
            <Link component={RouterLink} to="/text-to-speech" color="inherit" display="block">
              Text to Speech
            </Link>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' AI Services. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 