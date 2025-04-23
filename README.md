# AI Services

A full-stack web application providing AI-powered services:

1. **Face Detection and Recognition**: Upload and compare images to detect and recognize faces.
2. **Text-to-Speech (TTS)**: Convert text to natural-sounding speech using the Kokoro TTS model.

## Features

### Face Detection and Recognition
- Upload two images to detect if they contain the same person
- Advanced face detection using OpenCV and YuNet model
- Face feature matching with confidence scores
- Visual feedback with match results

### Text-to-Speech
- Convert any text to natural-sounding speech
- Multiple voice options (Default, British, Australian)
- Real-time audio playback in the browser
- High-quality audio generation using Kokoro TTS model

## Technology Stack

### Backend
- **Python** with **Flask** for the REST API
- **OpenCV** for face detection and recognition
- **Kokoro TTS** for text-to-speech generation
- **NumPy** and **SoundFile** for audio processing

### Frontend
- **React** for the UI components and state management
- **Material-UI** for modern, responsive design
- **Framer Motion** for smooth animations
- **React Router** for navigation

## Installation

```bash
# Clone the repository
git clone https://github.com/amirqeysarbeigi/ai_services.git
cd ai_services

# Install Python dependencies
pip install -r requirements.txt

# Install JS dependencies
npm install
```

## Usage

1. Start the backend server:
```bash
python app.py
```

2. Start the frontend development server:
```bash
npm start
```

3. Access the application at http://localhost:3000

## API Endpoints

### Face Detection
- **POST** `/api/face-detection`
  - Upload two images for comparison
  - Returns match result and confidence scores

### Text-to-Speech
- **POST** `/api/tts`
  - Convert text to speech
  - Parameters: `text` (required), `voice` (optional)
  - Returns base64-encoded audio

### Health Check
- **GET** `/api/health`
  - Check if all services are operational

## Project Structure

```
ai_services/
├── app.py                 # Flask backend server
├── tts_manager.py         # TTS service implementation
├── requirements.txt       # Python dependencies
├── public/                # Static files
├── src/                   # React application
│   ├── components/        # UI components
│   │   ├── FaceDetection.js
│   │   ├── TextToSpeech.js
│   │   ├── Home.js
│   │   └── Navbar.js
│   ├── App.js             # Main React component
│   └── index.js           # Entry point
└── models/                # ML models for face detection
```

## Development

This project was developed as a final university project, demonstrating the integration of AI services into a web application. It uses pre-trained models for both face recognition and text-to-speech synthesis.

### Future Improvements
- Add user accounts and history
- Support for more TTS voices
- Batch processing for multiple images
- Improved error handling and feedback

## Credits

- Face detection models: YuNet and SFace
- Text-to-speech model: Kokoro-82M 