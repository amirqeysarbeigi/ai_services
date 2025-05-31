import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include credentials (like cookies) for Flask-Login
            'Access-Control-Allow-Credentials': 'true'
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch history');
        }

        setHistory(data);

      } catch (error) {
        console.error('Error fetching history:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to load history.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []); // Empty dependency array means this runs once on mount

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 8, minHeight: '90vh' }}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: 6,
          background: 'linear-gradient(135deg, rgba(200, 220, 255, 0.5) 0%, rgba(200, 220, 255, 0.3) 100%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Request History
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
            No service requests found yet.
          </Typography>
        ) : (
          <Paper elevation={3} sx={{ mt: 4, maxHeight: '500px', overflowY: 'auto' }}>
            <List>
              {history.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="subtitle1"
                          color="text.primary"
                        >
                          {item.service_type.replace('-', ' ').toUpperCase()}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            Date: {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            Details: {item.result_data ? JSON.stringify(item.result_data, null, 2).substring(0, 200) + '...' : 'N/A'} {/* Display simplified result */}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < history.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

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
      </MotionBox>
    </Container>
  );
}

export default HistoryPage; 