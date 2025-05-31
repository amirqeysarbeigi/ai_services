import React, { useEffect } from 'react';
import { Navigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography, Button, Container, AppBar, Toolbar, useTheme } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
      console.log('ProtectedRoute rendered. isAuthenticated:', isAuthenticated, 'Loading:', loading, 'Location:', location.pathname);
  });

  if (loading) {
    // Show a loading spinner while checking auth status
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Always render children, but overlay with message if not authenticated
  return (
    <>
      {children}
      {!isAuthenticated && (
        <Box
          sx={{
            position: 'fixed',
            // Position below the Navbar (standard AppBar height is 64px, add a little buffer)
            top: '64px',
            left: 0,
            width: '100%',
            // Calculate height to cover the rest of the viewport below the Navbar
            height: 'calc(100vh - 64px)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark overlay
            backdropFilter: 'blur(5px)', // Apply blur to the background
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            // Z-index lower than typical Navbar (often 1200-1300+), but above page content
            zIndex: 1000,
            p: 2,
            overflowY: 'auto' // Add scroll if content overflows
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              background: theme.palette.background.paper,
              textAlign: 'center',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              border: `2px solid ${theme.palette.divider}`, // Increased border thickness to 2px
            }}
          >
            <LockOpenIcon color="primary" sx={{ fontSize: 60 }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Login Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Please log in or sign up to access this feature.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/auth"
              state={{ from: location }}
              sx={{ px: 4, py: 1.5, fontWeight: 700 }}
            >
              Go to Login / Sign Up
            </Button>
          </motion.div>
        </Box>
      )}
    </>
  );
};

export default ProtectedRoute; 