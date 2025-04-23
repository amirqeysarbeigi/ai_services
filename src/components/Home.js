import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  useTheme as useMuiTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FaceIcon from '@mui/icons-material/Face';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

function Home() {
  const theme = useMuiTheme();

  const features = [
    {
      title: 'Face Detection',
      description: 'Compare two images to detect if they contain the same person using advanced AI face recognition technology.',
      icon: <FaceIcon sx={{ fontSize: 60 }} />,
      path: '/face-detection',
      color: theme.palette.primary.main,
    },
    {
      title: 'Text to Speech',
      description: 'Convert your text into natural-sounding speech using the Kokoro TTS model with multiple voice options.',
      icon: <RecordVoiceOverIcon sx={{ fontSize: 60 }} />,
      path: '/voice-clone',
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 8,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
              : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
            borderRadius: '16px',
            p: 6,
            color: 'white',
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            AI Services Platform
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
            }}
          >
            Explore our advanced AI-powered tools for face detection and text-to-speech conversion
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={feature.title}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardMedia
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: feature.color,
                    color: 'white',
                  }}
                >
                  {feature.icon}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={feature.path}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      mt: 2,
                      background: feature.color,
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? theme.palette.primary.light
                          : theme.palette.primary.dark,
                      },
                    }}
                  >
                    Try Now
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Footer Section */}
        <Box
          sx={{
            mt: 8,
            textAlign: 'center',
            p: 4,
            borderRadius: '16px',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Choose a service above to begin using our AI-powered tools
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Home; 