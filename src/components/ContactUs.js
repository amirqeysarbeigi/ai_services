import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

const MotionPaper = motion(Paper);

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSnackbar({
        open: true,
        message: data.message || 'Thank you for your message! We will get back to you soon.',
        severity: 'success',
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to send message. Please try again later.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph align="center" sx={{ maxWidth: '800px', mx: 'auto' }}>
              Have questions or feedback? We'd love to hear from you. Fill out the form below
              and we'll get back to you as soon as possible.
            </Typography>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ p: 3, height: '100%' }}
          >
            <Typography variant="h6" gutterBottom>
              Get in Touch
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
              />
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
              <TextField
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<SendIcon />}
                sx={{ mt: 2 }}
              >
                Send Message
              </Button>
            </Box>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ p: 3, height: '100%' }}
          >
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  Email: amir.gheysarbeygi@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  Phone: +98 935 215 2461
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  Telegram: amirqeysarbeigi
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                We typically respond to all inquiries within 24-48 hours.
                For urgent matters, please include "URGENT" in your message subject.
              </Typography>
            </Box>
          </MotionPaper>
        </Grid>
      </Grid>

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
    </Container>
  );
}

export default ContactUs; 