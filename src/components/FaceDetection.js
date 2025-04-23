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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const MotionPaper = motion(Paper);

function FaceDetection() {
  const theme = useMuiTheme();
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
            mb: 4,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
              : 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Face Detection
        </Typography>

        <Grid container spacing={4}>
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
              px: 4,
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Compare Faces'}
          </Button>
        </Box>

        <AnimatePresence>
          {result && (
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
                background: result.match
                  ? 'rgba(76, 175, 80, 0.1)'
                  : result.error
                  ? 'rgba(244, 67, 54, 0.1)'
                  : 'rgba(33, 150, 243, 0.1)',
              }}
            >
              {result.match ? (
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              ) : result.error ? (
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
              ) : (
                <ErrorIcon color="info" sx={{ fontSize: 40 }} />
              )}
              <Typography variant="h6">
                {result.match
                  ? 'The faces match!'
                  : result.error
                  ? result.error
                  : 'The faces do not match.'}
              </Typography>
            </MotionPaper>
          )}
        </AnimatePresence>
      </Box>
    </Container>
  );
}

export default FaceDetection; 