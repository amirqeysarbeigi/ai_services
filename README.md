# AI Services Website

This is a full-stack web application that provides two AI-powered services:
1. Face Detection: Compare two images to detect if they contain the same face
2. Voice Cloning: Clone a voice from a reference audio and generate speech from text

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

## Setup

### Backend Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask backend:
```bash
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the React development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Usage

### Face Detection
1. Navigate to the Face Detection tab
2. Upload two images containing faces
3. Click "Detect Faces" to compare the faces
4. View the results showing if the faces match and the confidence level

### Voice Cloning
1. Navigate to the Voice Cloning tab
2. Upload a reference audio file containing the voice to clone
3. Enter the text you want to be spoken in the cloned voice
4. Click "Clone Voice" to generate the audio
5. Use the audio player to listen to the generated speech

## Technologies Used

- Backend:
  - Flask
  - face_recognition
  - TTS (Text-to-Speech)
  - NumPy
  - Pillow

- Frontend:
  - React
  - Material-UI
  - Axios
  - File API

## Notes

- The face detection service requires clear, front-facing images for best results
- The voice cloning service works best with clear, single-speaker audio samples
- Processing times may vary depending on the size of the input files and server load 