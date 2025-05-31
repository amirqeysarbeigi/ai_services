from flask import Flask, request, jsonify
from flask_cors import cross_origin
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
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

# Flask-SQLAlchemy configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db' # Using SQLite database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Flask-Login configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a_very_secret_key_for_dev') # Change in production!
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login' # Optional: Set the login route

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Database Models

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    requests = db.relationship('ServiceRequest', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.now())
    result_data = db.Column(db.Text)

    def __repr__(self):
        return f"ServiceRequest('{self.service_type}', '{self.timestamp}')"

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'your-email@gmail.com')  # Set your email
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'your-app-password')  # Set your app password
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME', 'your-email@gmail.com')

mail = Mail(app)

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

def preprocess_image(img):
    # Resize large images while maintaining aspect ratio
    max_dimension = 1500
    height, width = img.shape[:2]
    
    if height > max_dimension or width > max_dimension:
        scale = max_dimension / max(height, width)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    return img

def detect_faces(image):
    if face_detector is None:
        raise Exception("Face detector model not loaded")
    
    # Set input size for the face detector
    face_detector.setInputSize((image.shape[1], image.shape[0]))
    faces = face_detector.detect(image)
    return faces

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
@login_required
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def face_detection():
    try:
        print("Received face detection request")
        if 'image1' not in request.files or 'image2' not in request.files:
            return jsonify({'error': 'Both images are required'}), 400

        image1 = request.files['image1']
        image2 = request.files['image2']
        
        print(f"Received images: image1={image1.filename}, image2={image2.filename}")
        
        # Read images
        img1 = cv2.imdecode(np.frombuffer(image1.read(), np.uint8), cv2.IMREAD_COLOR)
        img2 = cv2.imdecode(np.frombuffer(image2.read(), np.uint8), cv2.IMREAD_COLOR)
        
        if img1 is None or img2 is None:
            return jsonify({'error': 'Failed to read one or both images'}), 400
            
        print(f"Image shapes: img1={img1.shape}, img2={img2.shape}")
        
        # Preprocess images
        img1 = preprocess_image(img1)
        img2 = preprocess_image(img2)
        
        # Detect faces
        faces1 = detect_faces(img1)
        faces2 = detect_faces(img2)
        
        print(f"Detected faces: faces1={bool(faces1)}, faces2={bool(faces2)}")
        
        if not faces1 or not faces2:
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

        # Log the request if user is logged in
        if current_user.is_authenticated:
            try:
                request_log = ServiceRequest(
                    user_id=current_user.id,
                    service_type='face-detection',
                    result_data=jsonify(result).get_data(as_text=True) # Store result as JSON string
                )
                db.session.add(request_log)
                db.session.commit()
                print("Face detection request logged for user: ", current_user.username)
            except Exception as log_error:
                print(f"Error logging face detection request: {str(log_error)}")
                db.session.rollback() # Rollback log entry if it fails

        return jsonify(result)
        
    except Exception as e:
        print(f"Error in face detection: {str(e)}")
        # Log the error request if user is logged in
        if current_user.is_authenticated:
             try:
                 request_log = ServiceRequest(
                     user_id=current_user.id,
                     service_type='face-detection',
                     result_data=f'Error: {str(e)}' # Store error message
                 )
                 db.session.add(request_log)
                 db.session.commit()
                 print("Face detection error logged for user: ", current_user.username)
             except Exception as log_error:
                 print(f"Error logging face detection error: {str(log_error)}")
                 db.session.rollback()

        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-clone', methods=['POST'])
@login_required
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def voice_clone():
    if not tts_manager.is_available():
        # Log error if user is logged in and TTS is unavailable
        if current_user.is_authenticated:
            try:
                request_log = ServiceRequest(
                    user_id=current_user.id,
                    service_type='text-to-speech',
                    result_data='Error: TTS model not available'
                )
                db.session.add(request_log)
                db.session.commit()
                print("TTS unavailable error logged for user: ", current_user.username)
            except Exception as log_error:
                print(f"Error logging TTS unavailable error: {str(log_error)}")
                db.session.rollback()

        return jsonify({
            'error': 'TTS model not available. Please try again in a few moments or contact support if the issue persists.',
            'details': 'The text-to-speech model failed to initialize. This could be due to missing model files or insufficient system resources.'
        }), 503
        
    try:
        # Get text to convert to speech
        text_to_speak = request.form.get('text', '').strip()
        voice_option = request.form.get('voice', 'af_heart')

        if not text_to_speak:
            return jsonify({'error': 'No text provided'}), 400
            
        # Create temporary file for output
        output_path = tempfile.mktemp(suffix='.wav')
        
        try:
            # Generate speech
            tts_manager.generate_speech(text_to_speak, output_path, voice=voice_option)
        except Exception as tts_error:
            print(f"Error during TTS generation: {str(tts_error)}")
            if os.path.exists(output_path):
                os.unlink(output_path)

            # Log TTS generation error if user is logged in
            if current_user.is_authenticated:
                 try:
                     request_log = ServiceRequest(
                         user_id=current_user.id,
                         service_type='text-to-speech',
                         result_data=f'Error: {str(tts_error)}'
                     )
                     db.session.add(request_log)
                     db.session.commit()
                     print("TTS generation error logged for user: ", current_user.username)
                 except Exception as log_error:
                     print(f"Error logging TTS generation error: {str(log_error)}")
                     db.session.rollback()

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

        # Log the successful request if user is logged in
        if current_user.is_authenticated:
             try:
                 request_log = ServiceRequest(
                     user_id=current_user.id,
                     service_type='text-to-speech',
                     result_data=f'Text: {text_to_speak[:100]}..., Voice: {voice_option}' # Log first 100 chars and voice
                 )
                 db.session.add(request_log)
                 db.session.commit()
                 print("Text to speech request logged for user: ", current_user.username)
             except Exception as log_error:
                 print(f"Error logging text to speech request: {str(log_error)}")
                 db.session.rollback()

        return jsonify({
            'audio': audio_base64,
            'success': True
        })
            
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")
        # Log the general error request if user is logged in
        if current_user.is_authenticated:
             try:
                 request_log = ServiceRequest(
                     user_id=current_user.id,
                     service_type='text-to-speech',
                     result_data=f'Error: {str(e)}'
                 )
                 db.session.add(request_log)
                 db.session.commit()
                 print("Text to speech general error logged for user: ", current_user.username)
             except Exception as log_error:
                 print(f"Error logging text to speech general error: {str(log_error)}")
                 db.session.rollback()

        return jsonify({
            'error': 'Failed to process text-to-speech request',
            'details': str(e)
        }), 500

# Add a new endpoint specifically for TTS
@app.route('/api/tts', methods=['POST'])
@login_required
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def text_to_speech():
    # This is an alias for the voice-clone endpoint for better API naming
    return voice_clone()

# Add a health check endpoint
@app.route('/api/health', methods=['GET'])
@cross_origin(origins="*", methods=["GET", "OPTIONS"], supports_credentials=False)
def health_check():
    return jsonify({
        'status': 'ok',
        'tts_available': tts_manager.is_available(),
        'face_detection_available': face_detector is not None,
        'face_recognition_available': face_recognizer is not None
    })

@app.route('/api/contact', methods=['POST'])
@cross_origin(origins="*", methods=["POST", "OPTIONS"], supports_credentials=False)
def contact():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not all([name, email, message]):
            return jsonify({'error': 'All fields are required'}), 400

        # Create email message
        msg = Message(
            subject=f'New Contact Form Submission from {name}',
            recipients=[app.config['MAIL_USERNAME']],  # Send to yourself
            body=f'''
            Name: {name}
            Email: {email}
            
            Message:
            {message}
            ''',
            reply_to=email  # Set reply-to as the sender's email
        )

        # Send email
        mail.send(msg)

        return jsonify({
            'success': True,
            'message': 'Your message has been sent successfully!'
        })

    except Exception as e:
        print(f"Error sending contact form: {str(e)}")
        return jsonify({
            'error': 'Failed to send message',
            'details': str(e)
        }), 500

@app.route('/api/signup', methods=['POST'])
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'All fields are required'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 409

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({'error': 'Email already exists'}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/api/login', methods=['POST'])
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        login_user(user) # Log in the user using Flask-Login
        return jsonify({'message': 'Login successful!', 'user': {'username': user.username, 'email': user.email}}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def logout():
    logout_user() # Log out the user using Flask-Login
    return jsonify({'message': 'Logout successful!'}), 200

@app.route('/api/current_user', methods=['GET'])
@login_required
@cross_origin(origins="http://localhost:3000", methods=["GET", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def get_current_user():
    return jsonify({'user': {'username': current_user.username, 'email': current_user.email}}), 200

# New endpoint to get user's service request history
@app.route('/api/history', methods=['GET'])
@login_required
@cross_origin(origins="http://localhost:3000", methods=["GET", "OPTIONS"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
def get_request_history():
    """Endpoint to fetch the service request history for the logged-in user."""
    try:
        # Query ServiceRequest entries for the current user, ordered by timestamp
        requests = ServiceRequest.query.filter_by(user_id=current_user.id).order_by(ServiceRequest.timestamp.desc()).all()

        # Prepare the data for JSON response
        history_data = []
        for req in requests:
            history_data.append({
                'id': req.id,
                'service_type': req.service_type,
                'timestamp': req.timestamp.isoformat(), # Format timestamp as ISO string
                'result_data': req.result_data # Include the result data
            })

        return jsonify(history_data), 200

    except Exception as e:
        print(f"Error fetching request history: {str(e)}")
        return jsonify({'error': 'Failed to fetch request history', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False) 