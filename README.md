# AI Services

This full-stack web application provides AI-powered services:

1. **Face Detection and Recognition**: Upload images to detect and recognize faces.
2. **Text-to-Speech (TTS)**: Convert text to natural-sounding speech using the Kokoro TTS model.

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai_services.git
cd ai_services

# Install Python dependencies
pip install -r requirements.txt

# Install JS dependencies
npm install
```

## Usage

1. Start the backend:
```bash
python app.py
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Access the application at http://localhost:3000

## Features

- Face detection with bounding boxes
- Text-to-speech generation
- Modern responsive UI
- RESTful API endpoints

## Technologies

- **Backend**: Python, Flask, Kokoro TTS, OpenCV
- **Frontend**: React, Material-UI
- **ML Models**: Kokoro for TTS, YuNet for face detection 