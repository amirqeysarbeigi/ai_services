import React, { useState } from 'react';
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

function VoiceClone() {
  const theme = useMuiTheme();
  const [audioFile, setAudioFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!audioFile || !text) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('reference_audio', audioFile);
      formData.append('text', text);

      const response = await fetch('http://localhost:5000/api/voice-clone', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
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
      setResult({
        error: `Failed to generate voice: ${error.message}. Please check if the backend server is running on port 5000.`
      });
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
                  px: 4,
                  py: 1.5,
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                }}
              >
                {isPlaying ? 'Stop' : 'Play'} Generated Audio
              </Button>
            </MotionPaper>
          )}
        </AnimatePresence>
      </Box>
    </Container>
  );
}

export default VoiceClone; 
