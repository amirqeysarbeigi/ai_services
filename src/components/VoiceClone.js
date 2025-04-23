import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  CircularProgress,
  useTheme as useMuiTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const MotionPaper = motion(Paper);

const API_BASE_URL = 'http://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function VoiceClone() {
  const theme = useMuiTheme();
  const [audioFile, setAudioFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [error, setError] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  // Check backend health on component mount with retry logic
  useEffect(() => {
    let retryCount = 0;
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setIsBackendAvailable(data.status === 'ok');
        if (!data.tts_available) {
          setError('Voice generation service is currently unavailable. Please try again later.');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setIsBackendAvailable(false);
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(checkBackendHealth, RETRY_DELAY);
        } else {
          setError('Cannot connect to the server. Please make sure the backend server is running on port 5000.');
        }
      }
    };

    checkBackendHealth();
  }, []);

  // Cleanup audio resources on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioElement, audioUrl]);

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please upload a file smaller than 10MB.');
        return;
      }
      
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mp3', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a WAV, MP3, or OGG file.');
        return;
      }

      setAudioFile(file);
      setAudioUrl(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!audioFile || !text) return;
    if (!isBackendAvailable) {
      setError('Cannot connect to the server. Please make sure the backend server is running.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('reference_audio', audioFile);
      formData.append('text', text);

      const response = await fetch(`${API_BASE_URL}/api/voice-clone`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.details || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Clean up previous audio resources
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      // Convert base64 audio to blob URL
      const audioBlob = new Blob(
        [Buffer.from(data.audio, 'base64')],
        { type: 'audio/wav' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Create new audio element
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    } catch (error) {
      console.error('Error generating voice:', error);
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend server is running on port 5000.';
      } else if (errorMessage.includes('TTS model not available')) {
        errorMessage = 'The voice generation service is currently unavailable. Please try again in a few moments.';
      } else if (errorMessage.includes('Failed to generate voice')) {
        errorMessage = 'Failed to generate voice. Please try with different text or audio input.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const AudioUploadBox = () => (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.02)',
        border: '2px dashed',
        borderColor: audioFile ? 'primary.main' : 'divider',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
        },
      }}
      onClick={() => document.getElementById('audio-upload').click()}
    >
      <input
        type="file"
        id="audio-upload"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleAudioUpload}
      />
      {audioFile ? (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {audioFile.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('audio-upload').click();
            }}
          >
            Change Audio
          </Button>
        </Box>
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload Reference Audio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click to upload an audio file
          </Typography>
        </>
      )}
    </MotionPaper>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 700,
            mb: 4,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
              : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Voice Cloning
        </Typography>

        {!isBackendAvailable && (
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              mb: 4,
              p: 3,
              bgcolor: 'error.main',
              color: 'error.contrastText',
            }}
          >
            <Typography>
              Cannot connect to the server. Please make sure the backend server is running on port 5000.
            </Typography>
          </MotionPaper>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <AudioUploadBox />
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Enter Text to Clone
              </Typography>
              <TextField
                multiline
                rows={6}
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to clone..."
                fullWidth
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={!audioFile || !text || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <VolumeUpIcon />}
                sx={{
                  mt: 'auto',
                  py: 1.5,
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
                    : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                  '&:hover': {
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)'
                      : 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  },
                }}
              >
                {loading ? 'Generating...' : 'Generate Voice'}
              </Button>
            </MotionPaper>
          </Grid>
        </Grid>

        {error && (
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              mt: 4,
              p: 3,
              bgcolor: 'error.main',
              color: 'error.contrastText',
            }}
          >
            <Typography>{error}</Typography>
          </MotionPaper>
        )}

        <AnimatePresence>
          {audioUrl && (
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              sx={{
                mt: 4,
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handlePlayPause}
                startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                }}
              >
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
            </MotionPaper>
          )}
        </AnimatePresence>
      </Box>
    </Container>
  );
}

export default VoiceClone; 