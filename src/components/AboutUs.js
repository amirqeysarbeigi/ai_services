import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';

const MotionPaper = motion(Paper);

function AboutUs() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, rgba(200, 220, 255, 0.5) 0%, rgba(200, 220, 255, 0.3) 100%)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom align="center">
              About Us
            </Typography>
            <Typography variant="body1" paragraph align="center" sx={{ maxWidth: '800px', mx: 'auto' }}>
              Welcome to our AI Services platform, a showcase of cutting-edge artificial intelligence technologies
              developed for academic and research purposes. Our mission is to demonstrate the practical applications
              of AI in everyday scenarios while making these technologies accessible and understandable.
            </Typography>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ p: 3, height: '100%', textAlign: 'center' }}
          >
            <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Our Technology
            </Typography>
            <Typography variant="body2">
              We utilize state-of-the-art AI models and frameworks to provide
              accurate and efficient services in face recognition and text-to-speech
              conversion.
            </Typography>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ p: 3, height: '100%', textAlign: 'center' }}
          >
            <PsychologyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body2">
              To bridge the gap between academic research and practical applications
              of AI, making these technologies more accessible and understandable
              for everyone.
            </Typography>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            sx={{ p: 3, height: '100%', textAlign: 'center' }}
          >
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Academic Focus
            </Typography>
            <Typography variant="body2">
              This project serves as a platform for academic research and learning,
              demonstrating the practical applications of AI in real-world scenarios.
            </Typography>
          </MotionPaper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AboutUs; 