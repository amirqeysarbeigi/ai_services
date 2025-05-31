import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const MotionPaper = motion(Paper);

function AboutUs() {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 8, minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box
        sx={{
          mx: 'auto',
          maxWidth: 800,
          borderRadius: 5,
          boxShadow: 8,
          p: 0,
          background: theme.palette.background.paper,
          border: '3px solid',
          borderColor: theme.palette.primary.main,
          overflow: 'hidden',
        }}
      >
        {/* AI Illustration */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4,
           background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
          }}>
          <SmartToyIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
        <Box sx={{ px: { xs: 2, sm: 6 }, pb: 4, pt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
            About Us
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
            Welcome to our AI Services platform, a showcase of cutting-edge artificial intelligence technologies developed for academic and research purposes. Our mission is to demonstrate the practical applications of AI in everyday scenarios while making these technologies accessible and understandable.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, borderRadius: 3, boxShadow: 3,
                background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                textAlign: 'center', height: '100%' }}>
                <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Our Technology
                </Typography>
                <Typography variant="body2">
                  We utilize state-of-the-art AI models and frameworks to provide accurate and efficient services in face recognition and text-to-speech conversion.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, borderRadius: 3, boxShadow: 3,
                 background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                 textAlign: 'center', height: '100%' }}>
                <PsychologyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Our Mission
                </Typography>
                <Typography variant="body2">
                  To bridge the gap between academic research and practical applications of AI, making these technologies more accessible and understandable for everyone.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, borderRadius: 3, boxShadow: 3,
                 background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                 textAlign: 'center', height: '100%' }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Academic Focus
                </Typography>
                <Typography variant="body2">
                  This project serves as a platform for academic research and learning, demonstrating the practical applications of AI in real-world scenarios.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default AboutUs; 