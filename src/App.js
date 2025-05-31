import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './components/Home';
import FaceDetection from './components/FaceDetection';
import TextToSpeech from './components/VoiceClone';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import AuthPage from './components/AuthPage';
import HistoryPage from './components/HistoryPage';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected Routes */}
                <Route
                  path="/face-detection"
                  element={
                    <ProtectedRoute>
                      <FaceDetection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/text-to-speech"
                  element={
                    <ProtectedRoute>
                      <TextToSpeech />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 