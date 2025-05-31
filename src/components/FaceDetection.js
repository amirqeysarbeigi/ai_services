import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  useTheme as useMuiTheme,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsightsIcon from '@mui/icons-material/Insights';
import CircularProgressWithLabel from './ui/CircularProgressWithLabel';

const MotionPaper = motion(Paper);

function FaceDetection() {
  const theme = useMuiTheme();
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulate daily requests
  const dailyRequests = 42;

  const handleImageUpload = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if (!image1 || !image2) return;

    setLoading(true);
    try {
      // Convert base64 images to files
      const base64ToFile = (base64String, filename) => {
        const arr = base64String.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const image1File = base64ToFile(image1, 'image1.jpg');
      const image2File = base64ToFile(image2, 'image2.jpg');

      const formData = new FormData();
      formData.append('image1', image1File);
      formData.append('image2', image2File);

      const response = await fetch('http://localhost:5000/api/face-detection', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error comparing faces:', error);
      setResult({
        match: false,
        error: `Failed to compare faces: ${error.message}. Please check if the backend server is running on port 5000.`
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper for similarity percentage
  const getSimilarity = () => {
    if (result && result.confidence && typeof result.confidence.cosine_score === 'number') {
      // Map cosine score (0.0-1.0) to percentage
      return Math.round(result.confidence.cosine_score * 100);
    }
    return null;
  };

  const ImageUploadBox = ({ image, onUpload, label }) => (
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
        borderColor: image ? 'primary.main' : 'divider',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
        },
      }}
      onClick={() => document.getElementById(`file-upload-${label}`).click()}
    >
      <input
        type="file"
        id={`file-upload-${label}`}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleImageUpload(e, onUpload)}
      />
      {image ? (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={image}
            alt={`Uploaded ${label}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById(`file-upload-${label}`).click();
            }}
          >
            Change Image
          </Button>
        </Box>
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click to upload an image
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
            mb: 2,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
              : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Face Detection
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
          Upload two images to compare faces using advanced AI recognition
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<InsightsIcon />}
            label={`Today's Requests: ${dailyRequests}`}
            color="primary"
            sx={{ fontWeight: 600, fontSize: '1.1rem', px: 2, py: 1, borderRadius: 2, boxShadow: 2 }}
          />
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <ImageUploadBox
              image={image1}
              onUpload={setImage1}
              label="First Image"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ImageUploadBox
              image={image2}
              onUpload={setImage2}
              label="Second Image"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<CompareArrowsIcon />}
            onClick={handleCompare}
            disabled={!image1 || !image2 || loading}
            sx={{
              px: 5,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            Compare Faces
          </Button>
        </Box>

        {/* Analysis Results Section */}
        <Box
          sx={{
            mt: 6,
            mx: 'auto',
            maxWidth: 500,
            p: 4,
            borderRadius: 4,
            background: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.03)',
            boxShadow: 4,
            border: '2px solid',
            borderColor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
            textAlign: 'center',
            minHeight: 220,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Analysis Results
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {loading ? (
            <CircularProgress size={48} color="primary" />
          ) : result ? (
            result.error ? (
              <Box>
                <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="error" sx={{ fontWeight: 600 }}>{result.error}</Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CircularProgressWithLabel
                    value={getSimilarity() ?? 0}
                    label={`${getSimilarity() ?? '--'}% Similarity`}
                    color={result.match ? 'success' : 'warning'}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {result.match ? (
                    <span style={{ color: theme.palette.success.main }}>
                      <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Faces Match
                    </span>
                  ) : (
                    <span style={{ color: theme.palette.warning.main }}>
                      <ErrorIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      No Match
                    </span>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  L2 Score: {result.confidence?.l2_score?.toFixed(3) ?? '--'}<br />
                  Cosine Score: {result.confidence?.cosine_score?.toFixed(3) ?? '--'}
                </Typography>
              </Box>
            )
          ) : (
            <Typography color="text.secondary" sx={{ mt: 4 }}>
              Upload two images and click "Compare Faces" to see the results here.
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default FaceDetection; 