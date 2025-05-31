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
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

const MotionPaper = motion(Paper);

function ContactUs() {
  const theme = useTheme();
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
        {/* Communication Illustration */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4,
          background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
         }}>
          <MarkEmailReadIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
        <Box sx={{ px: { xs: 2, sm: 6 }, pb: 4, pt: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph align="center" sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
            Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 3, boxShadow: 3,
                background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
                    sx={{
                      mt: 2, px: 5, py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, boxShadow: 2,
                      background: theme.palette.mode === 'dark' ? theme.palette.primary.dark : 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
                       '&:hover': {
                         background: theme.palette.mode === 'dark' ? theme.palette.primary.main : 'linear-gradient(90deg, #21cbf3 0%, #2196f3 100%)',
                         transform: 'scale(1.04)'
                        }
                     }}
                  >
                    Send Message
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 3, boxShadow: 3,
                 background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                 height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Contact Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Email: amir.gheysarbeygi@gmail.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Phone: +98 935 215 2461
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Telegram: amirqeysarbeigi
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    We typically respond to all inquiries within 24-48 hours. For urgent matters, please include "URGENT" in your message subject.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
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