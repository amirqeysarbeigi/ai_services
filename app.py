from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import tempfile
import base64
import cv2
from pathlib import Path
from tts_manager import TTSManager

app = Flask(__name__)
# Enable CORS for all routes during development
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins during development
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Initialize TTS manager
print("Initializing TTS manager...")
tts_manager = TTSManager()
if not tts_manager.is_available():
    print("WARNING: TTS model failed to initialize. Voice cloning will not be available.")
else:
    print("TTS model initialized successfully")

# Load face detection and recognition models
FACE_DETECTION_MODEL = os.path.join('models', 'face_detection_yunet_2023mar.onnx')
FACE_RECOGNITION_MODEL = os.path.join('models', 'face_recognition_sface_2021dec.onnx')

try:
    face_detector = cv2.FaceDetectorYN.create(
        FACE_DETECTION_MODEL, "", (320, 320), 0.8, 0.3, 5000
    )
    face_recognizer = cv2.FaceRecognizerSF.create(FACE_RECOGNITION_MODEL, "")
    print("Successfully loaded face detection and recognition models")
except Exception as e:
    print(f"Error loading models: {str(e)}")
    face_detector = None
    face_recognizer = None

def detect_faces(image):
    if face_detector is None:
        raise Exception("Face detector model not loaded")
    
    img_width = int(image.shape[1])
    img_height = int(image.shape[0])
    image = cv2.resize(image, (img_width, img_height))
    
    face_detector.setInputSize(input_size=(image.shape[1], image.shape[0]))
    faces = face_detector.detect(image=image)
    return image, faces

def extract_features(image, faces):
    if face_recognizer is None:
        raise Exception("Face recognizer model not loaded")
    
    if faces[1] is None or len(faces[1]) == 0:
        return None
    
    face_align = face_recognizer.alignCrop(image, faces[1][0])
    face_features = face_recognizer.feature(face_align)
    return face_features

def compare_faces(features1, features2):
    if face_recognizer is None:
        raise Exception("Face recognizer model not loaded")
    
    l2_score = face_recognizer.match(
        face_feature1=features1,
        face_feature2=features2,
        dis_type=cv2.FACE_RECOGNIZER_SF_FR_NORM_L2,
    )
    
    cosine_score = face_recognizer.match(
        face_feature1=features1,
        face_feature2=features2,
        dis_type=cv2.FACE_RECOGNIZER_SF_FR_COSINE,
    )
    
    return {
        'l2_score': float(l2_score),
        'cosine_score': float(cosine_score)
    }

@app.route('/api/face-detection', methods=['POST'])
def face_detection():
    try:
        print("Received face detection request")
        # Get images from request
        if 'image1' not in request.files or 'image2' not in request.files:
            print("Missing image files in request")
            return jsonify({'error': 'Both image1 and image2 are required'}), 400
            
        image1 = request.files['image1']
        image2 = request.files['image2']
        
        print(f"Received images: image1={image1.filename}, image2={image2.filename}")
        
        # Convert to numpy arrays
        img1 = cv2.imdecode(np.frombuffer(image1.read(), np.uint8), cv2.IMREAD_COLOR)
        img2 = cv2.imdecode(np.frombuffer(image2.read(), np.uint8), cv2.IMREAD_COLOR)
        
        print(f"Image shapes: img1={img1.shape}, img2={img2.shape}")
        
        # Detect faces
        img1, faces1 = detect_faces(img1)
        img2, faces2 = detect_faces(img2)
        
        print(f"Detected faces: faces1={faces1[1] is not None}, faces2={faces2[1] is not None}")
        
        if faces1[1] is None or faces2[1] is None:
            return jsonify({'error': 'No faces found in one or both images'}), 400
        
        # Extract features
        features1 = extract_features(img1, faces1)
        features2 = extract_features(img2, faces2)
        
        if features1 is None or features2 is None:
            return jsonify({'error': 'Could not extract features from faces'}), 400
        
        # Compare faces
        scores = compare_faces(features1, features2)
        
        # Determine match based on thresholds
        l2_threshold = 1.128
        cosine_threshold = 0.363
        
        is_match = (scores['l2_score'] <= l2_threshold) and (scores['cosine_score'] >= cosine_threshold)
        
        result = {
            'match': bool(is_match),
            'confidence': {
                'l2_score': scores['l2_score'],
                'cosine_score': scores['cosine_score']
            }
        }
        
        print(f"Comparison result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in face detection: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-clone', methods=['POST'])
def voice_clone():
    if not tts_manager.is_available():
        return jsonify({
            'error': 'TTS model not available. Please try again in a few moments or contact support if the issue persists.',
            'details': 'The text-to-speech model failed to initialize. This could be due to missing model files or insufficient system resources.'
        }), 503
        
    try:
        # Get text to convert to speech
        text_to_speak = request.form.get('text', '').strip()
        if not text_to_speak:
            return jsonify({'error': 'No text provided'}), 400
            
        # Create temporary file for output
        output_path = tempfile.mktemp(suffix='.wav')
        
        try:
            # Generate speech with default voice
            voice = request.form.get('voice', 'af_heart')  # Default voice
            tts_manager.generate_speech(text_to_speak, output_path, voice=voice)
        except Exception as tts_error:
            print(f"Error during TTS generation: {str(tts_error)}")
            if os.path.exists(output_path):
                os.unlink(output_path)
            return jsonify({
                'error': 'Failed to generate speech',
                'details': str(tts_error)
            }), 500
        
        # Read the generated audio and encode as base64
        with open(output_path, 'rb') as f:
            audio_data = f.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
        # Clean up temporary file
        if os.path.exists(output_path):
            os.unlink(output_path)
                
        return jsonify({
            'audio': audio_base64,
            'success': True
        })
            
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")
        return jsonify({
            'error': 'Failed to process text-to-speech request',
            'details': str(e)
        }), 500

# Add a new endpoint specifically for TTS
@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    # This is an alias for the voice-clone endpoint for better API naming
    return voice_clone()

# Add a health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'tts_available': tts_manager.is_available(),
        'face_detection_available': face_detector is not None,
        'face_recognition_available': face_recognizer is not None
    })

if __name__ == '__main__':
    app.run(debug=False) 