import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Link as MuiLink,
  CircularProgress,
  useTheme
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);

function AuthPage() {
  const theme = useTheme();
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleForm = () => {
    setIsSignup(!isSignup);
    // Clear form data when switching
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setSnackbar({ ...snackbar, open: false }); // Close snackbar on toggle
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        setSnackbar({
          open: true,
          message: 'Passwords do not match.',
          severity: 'error',
        });
        return;
      }
    }

    setLoading(true);
    setSnackbar({ ...snackbar, open: false });

    const url = isSignup ? 'http://localhost:5000/api/signup' : 'http://localhost:5000/api/login';
    const payload = isSignup ?
      {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }
      :
      {
        username: formData.username,
        password: formData.password,
      };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isSignup ? 'Signup failed.' : 'Login failed.'));
      }

      setSnackbar({
        open: true,
        message: data.message || (isSignup ? 'Signup successful! Redirecting to login...' : 'Login successful! Redirecting...'),
        severity: 'success',
      });

      if (!isSignup) {
        login(data.user);
      }

      // Redirect based on action
      if (isSignup) {
        // Redirect to login after signup
        setTimeout(() => {
          setIsSignup(false);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' }); // Clear form for login
          setSnackbar({ ...snackbar, open: false }); // Close snackbar
        }, 2000);
      } else {
        // Redirect to home after login
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Redirect to home if already authenticated
  const { isAuthenticated, loading: authLoading } = useAuth();
  if (isAuthenticated && !authLoading) {
    navigate('/');
    return null; // Render nothing while redirecting
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: 6,
          background: theme.palette.background.paper,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {isSignup ? 'Sign Up' : 'Login'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {isSignup ? 'Create your account to access all features.' : 'Welcome back! Log in to your account.'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            margin="normal"
          />
          {isSignup && (
             <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
          />
          {isSignup && (
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
              helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || (isSignup && formData.password !== formData.confirmPassword)}
            sx={{ mt: 3, px: 5, py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, boxShadow: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isSignup ? 'Sign Up' : 'Login')}
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{ ' ' }
            <MuiLink component="button" onClick={toggleForm} sx={{ cursor: 'pointer' }}>
              {isSignup ? 'Login' : 'Sign Up'}
            </MuiLink>
          </Typography>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </MotionBox>
    </Container>
  );
}

export default AuthPage; 