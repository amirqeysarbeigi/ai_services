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
  Stack,
  Tooltip,
  IconButton,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import WaveformSVG from './ui/WaveformSVG';

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
    <Container maxWidth="md" sx={{ py: 8, minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box
        sx={{
          mx: 'auto',
          maxWidth: 700,
          borderRadius: 5,
          boxShadow: 8,
          p: 0,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%) 1',
          overflow: 'hidden',
        }}
      >
        {/* Step Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3, background: 'rgba(33,150,243,0.07)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mr: 2 }}>
            1. Enter Text
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mx: 2 }}>
            →
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mr: 2 }}>
            2. Choose Voice
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mx: 2 }}>
            →
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
            3. Convert & Listen
          </Typography>
        </Box>

        {/* Illustration */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 1 }}>
          <WaveformSVG width={120} height={60} color="#2196f3" />
        </Box>

        <Box sx={{ px: { xs: 2, sm: 6 }, pb: 4, pt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
            Text to Speech
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Convert your text into natural-sounding speech with multiple voice options.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={12}
            variant="outlined"
            placeholder="Type or paste the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{
              mb: 3,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 2,
              fontSize: '1.2rem',
              boxShadow: 1,
              '& .MuiInputBase-input': {
                fontSize: '1.2rem',
                fontWeight: 500,
                color: theme.palette.text.primary,
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel id="voice-select-label">Voice</InputLabel>
              <Select
                labelId="voice-select-label"
                id="voice-select"
                value={voice}
                label="Voice"
                onChange={(e) => setVoice(e.target.value)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.95)',
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { borderRadius: 2, boxShadow: 4 },
                  },
                }}
              >
                <MenuItem value="af_heart"><AudiotrackIcon sx={{ mr: 1, color: 'primary.main' }} />English (Default)</MenuItem>
                <MenuItem value="en_GB"><AudiotrackIcon sx={{ mr: 1, color: 'secondary.main' }} />English (British)</MenuItem>
                <MenuItem value="en_AU"><AudiotrackIcon sx={{ mr: 1, color: 'success.main' }} />English (Australian)</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={handleGenerate}
              disabled={loading || !text}
              sx={{
                px: 5,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: 2,
                boxShadow: 3,
                minWidth: 200,
                background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
                transition: 'transform 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #21cbf3 0%, #2196f3 100%)',
                  transform: 'scale(1.04)',
                },
              }}
              startIcon={<VolumeUpIcon />}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Convert to Speech'}
            </Button>
          </Stack>

          {/* Animated Output Area */}
          <Box
            sx={{
              mt: 4,
              textAlign: 'center',
              minHeight: 120,
              p: 3,
              borderRadius: 3,
              background: audioUrl ? 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)' : 'rgba(0,0,0,0.03)',
              boxShadow: audioUrl ? 6 : 1,
              transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
              border: audioUrl ? '2px solid #2196f3' : '2px dashed #bdbdbd',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {audioUrl ? (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                  Playback
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                  <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                    <IconButton
                      color="primary"
                      size="large"
                      onClick={handlePlayPause}
                      sx={{
                        background: isPlaying ? theme.palette.primary.light : 'rgba(0,0,0,0.05)',
                        borderRadius: 2,
                        boxShadow: 1,
                        '&:hover': {
                          background: theme.palette.primary.main,
                          color: 'white',
                        },
                        transition: 'all 0.2s',
                        transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {isPlaying ? <StopIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                    </IconButton>
                  </Tooltip>
                  <audio src={audioUrl} style={{ display: 'none' }} />
                </Stack>
              </>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Generated audio will appear here
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default TextToSpeech; 