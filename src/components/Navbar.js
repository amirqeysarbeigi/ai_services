import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme as useMuiTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../context/ThemeContext';
import FaceIcon from '@mui/icons-material/Face';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';

function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = useMuiTheme();

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
          : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          AI Services
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/face-detection"
            startIcon={<FaceIcon />}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Face Detection
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/text-to-speech"
            startIcon={<RecordVoiceOverIcon />}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Text to Speech
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/about"
            startIcon={<InfoIcon />}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            About
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/contact"
            startIcon={<ContactMailIcon />}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Contact
          </Button>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 