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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

const MotionPaper = motion(Paper);

const API_BASE_URL = 'http://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function TextToSpeech() {
  const theme = useMuiTheme();
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('af_heart');
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
          setError('Text-to-speech service is currently unavailable. Please try again later.');
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

  const handleGenerate = async () => {
    if (!text) {
      setError('Please enter some text to convert to speech.');
      return;
    }
    
    if (!isBackendAvailable) {
      setError('Cannot connect to the server. Please make sure the backend server is running.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('voice', voice);

      const response = await fetch(`${API_BASE_URL}/api/tts`, {
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
        [new Uint8Array([...atob(data.audio)].map(char => char.charCodeAt(0)))],
        { type: 'audio/wav' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Create new audio element
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
    } catch (error) {
      console.error('Error generating speech:', error);
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please make sure the backend server is running on port 5000.';
      } else if (errorMessage.includes('TTS model not available')) {
        errorMessage = 'The text-to-speech service is currently unavailable. Please try again in a few moments.';
      } else if (errorMessage.includes('Failed to generate speech')) {
        errorMessage = 'Failed to generate speech. Please try with different text.';
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

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              p: 3,
              mb: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(40, 40, 80, 0.5) 0%, rgba(40, 40, 80, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(200, 220, 255, 0.5) 0%, rgba(200, 220, 255, 0.3) 100%)',
              borderRadius: 2,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(10, 10, 30, 0.3)'
                : '0 8px 32px rgba(100, 120, 160, 0.1)',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Text to Speech
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Convert your text into natural-sounding speech using the Kokoro TTS model.
            </Typography>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={7}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Enter your text
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Type or paste the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="voice-select-label">Voice</InputLabel>
              <Select
                labelId="voice-select-label"
                id="voice-select"
                value={voice}
                label="Voice"
                onChange={(e) => setVoice(e.target.value)}
              >
                <MenuItem value="af_heart">English (Default)</MenuItem>
                <MenuItem value="en_GB">English (British)</MenuItem>
                <MenuItem value="en_AU">English (Australian)</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleGenerate}
                disabled={loading || !text.trim() || !isBackendAvailable}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <VolumeUpIcon />}
              >
                {loading ? 'Generating...' : 'Generate Speech'}
              </Button>
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={5}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Generated Audio
            </Typography>
            
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.1)'
                  : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 1,
                mb: 2,
              }}
            >
              {audioUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" gutterBottom>
                    Your audio is ready to play
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePlayPause}
                    startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
                    sx={{ mt: 2 }}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary" variant="body1">
                  Generated audio will appear here
                </Typography>
              )}
            </Box>
            
            {audioUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Tips for best results:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>Use proper punctuation for natural pauses</li>
                  <li>Try different voices for variety</li>
                  <li>Keep text length reasonable for best performance</li>
                </ul>
              </Box>
            )}
          </MotionPaper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TextToSpeech; 