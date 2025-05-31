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
import MemoryIcon from '@mui/icons-material/Memory';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

function Home() {
  const theme = useMuiTheme();

  const features = [
    {
      title: 'Face Detection',
      tagline: 'Unlock identities with precision',
      description: 'Compare two images to detect if they contain the same person using advanced AI face recognition technology.',
      icon: <MemoryIcon sx={{ fontSize: 70 }} />,
      path: '/face-detection',
      accentColor: theme.palette.primary.main,
    },
    {
      title: 'Text to Speech',
      tagline: 'Turn words into lifelike voices',
      description: 'Convert your text into natural-sounding speech using the Kokoro TTS model with multiple voice options.',
      icon: <GraphicEqIcon sx={{ fontSize: 70 }} />,
      path: '/text-to-speech',
      accentColor: theme.palette.secondary.main,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
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
              boxShadow: 6,
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
                letterSpacing: 1,
                textShadow: '0 2px 16px rgba(0,0,0,0.12)',
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
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={8} md={5} key={feature.title}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 8,
                    overflow: 'hidden',
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    position: 'relative',
                    transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.03)',
                      boxShadow: 16,
                    },
                  }}
                >
                  <CardMedia
                    sx={{
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { ...feature.icon.props.sx, color: feature.accentColor } })}
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography gutterBottom variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontStyle: 'italic', opacity: 0.85, color: theme.palette.text.secondary }}>
                      {feature.tagline}
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ color: theme.palette.text.primary, opacity: 0.95 }}>
                      {feature.description}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={feature.path}
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        mt: 2,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        background: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        boxShadow: 2,
                        borderRadius: 2,
                        '&:hover': {
                          background: theme.palette.primary.dark,
                          color: theme.palette.primary.contrastText,
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
              boxShadow: 2,
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
    </Box>
  );
}

export default Home; 