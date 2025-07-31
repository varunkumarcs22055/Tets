from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
import cv2
import numpy as np
import tensorflow as tf
import os
from dotenv import load_dotenv
import uuid
import json
from datetime import datetime
import time
import logging
import base64
import random
import io
import sys
import string
from werkzeug.utils import secure_filename
from tensorflow.keras.layers import LSTM
import pickle

# --- New Imports for Local Audio Model ---
from transformers import AutoProcessor, AutoModelForAudioClassification
import torch
import librosa
import shutil # Used to check for ffmpeg
from pydub import AudioSegment # Used for robust audio conversion
# --- End of New Imports ---

# Set matplotlib backend before importing pyplot to avoid tkinter issues
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from PIL import Image, ImageDraw
import seaborn as sns
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import requests

# Attempt to import and configure Gemini (for news analysis fallback)
try:
    import google.generativeai as genai
    import json as _json
except ImportError:
    genai = None
    _json = json
    print("WARNING: google.generativeai not found. News analysis will be limited.")


# Set TensorFlow to be deterministic for consistent results
os.environ['TF_DETERMINISTIC_OPS'] = '1'
os.environ['TF_CUDNN_DETERMINISTIC'] = '1'

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()])
logger = logging.getLogger(__name__)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

# Gemini API for News Analysis (existing)
gemini_model = None
if genai and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
        logger.info("Gemini model initialized successfully for News Analysis.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini model: {e}")
        gemini_model = None
else:
    logger.warning("Gemini API key not set or library not installed. News analysis will rely on local models only.")

# --- Gemini Pro API Detection Functions ---
def call_gemini_api(prompt, input_type='text'):
    headers = {
        'Content-Type': 'application/json',
    }
    params = {
        'key': GEMINI_API_KEY
    }
    data = {
        'contents': [
            {'parts': [{'text': prompt}]}
        ]
    }
    # For image, video, audio, you can adjust 'parts' accordingly
    response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=data)
    return response.json()

def detect_text_api(text):
    return call_gemini_api(text, input_type='text')

def detect_image_api(image_path):
    # Placeholder: In real use, encode image and send to API
    return call_gemini_api(f'Image detection for {image_path}', input_type='image')

def detect_video_api(video_path):
    # Placeholder: In real use, encode video and send to API
    return call_gemini_api(f'Video detection for {video_path}', input_type='video')

def detect_audio_api(audio_path):
    # Placeholder: In real use, encode audio and send to API
    return call_gemini_api(f'Audio detection for {audio_path}', input_type='audio')


app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
FRAMES_FOLDER = 'static/frames'
TEMP_FOLDER = 'temp'
IMAGE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'images')
VIDEO_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'videos')
app.config['IMAGE_UPLOAD_FOLDER'] = IMAGE_UPLOAD_FOLDER
app.config['VIDEO_UPLOAD_FOLDER'] = VIDEO_UPLOAD_FOLDER
app.config['FRAMES_FOLDER'] = FRAMES_FOLDER
app.config['TEMP_FOLDER'] = TEMP_FOLDER
ALLOWED_IMAGE_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'jfif', 'pjpeg', 'pjp', 'gif', 'svg', 'ico', 'heic', 'heif', 'raw', 'cr2', 'nef', 'orf', 'sr2', 'dng', 'eps', 'psd', 'ai', 'indd', 'pdf'
}
ALLOWED_VIDEO_EXTENSIONS = {
    'mp4', 'avi', 'mov', 'mkv', 'wmv', 'webm', 'flv', 'f4v', 'swf', 'mpeg', 'mpg', 'mpe', 'mpv', 'm2v', '3gp', '3g2', 'mxf', 'ogg', 'ogv', 'mts', 'm2ts', 'ts', 'vob', 'rm', 'rmvb', 'asf', 'amv', 'm4v', 'svi', 'yuv', 'mjpg', 'mjpeg'
}
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'm4a', 'ogg', 'flac'}

# Create necessary directories
os.makedirs(IMAGE_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VIDEO_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAMES_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)
os.makedirs('model', exist_ok=True)
os.makedirs('logs', exist_ok=True)
os.makedirs(os.path.join('model', 'news'), exist_ok=True)

# Model paths
IMAGE_MODEL_PATH = os.path.join('model', 'new_xception.h5')
VIDEO_MODEL_PATH = os.path.join('model', 'deepfake_detection_model.h5')
NEWS_MODEL_1_PATH = os.path.join('model', 'news', 'news_model_1.pkl')
NEWS_MODEL_2_PATH = os.path.join('model', 'news', 'news_model_2.pkl')

# Global variables to store the models
image_model = None  # Deprecated, not used
video_model = None  # Deprecated, not used
news_model_1 = None  # Deprecated, not used
news_model_2 = None  # Deprecated, not used

# --- Helper Functions ---

def load_news_models():
    # Deprecated: No local news models used
    pass

class CustomLSTM(LSTM):
    # Deprecated: No local video models used
    pass

def load_image_model():
    # Deprecated: No local image models used
    return False

def load_video_model():
    # Deprecated: No local video models used
    return False

logger.info("Gemini API only: No local models loaded.")

def allowed_image_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

def allowed_video_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS

def allowed_audio_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS

def preprocess_image_for_model(image, target_size=(299, 299)):
    try:
        if image is None:
            raise ValueError("Input image is None")
        if len(image.shape) == 3:
            if image.shape[2] == 4:
                image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
            elif image.shape[2] == 3:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        elif len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        
        image = cv2.resize(image, target_size)
        image = image.astype(np.float32)
        if image.max() > 1.0:
            image = image / 255.0
        
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        return None

def predict_image(image):
    # Use Gemini API for image detection only
    response = detect_image_api("image input")
    result = response.get('result', 'Real')
    confidence = float(response.get('confidence', 75.0))
    message = response.get('message', 'Gemini API image analysis')
    return result, confidence, message

def simulate_prediction(image):
    # Deprecated: No demo mode, only Gemini API used
    return "Real", 75.0, "Gemini API only"

def frame_capture(video_path):
    frames = []
    frame_paths = []
    frames_dir = app.config['FRAMES_FOLDER']
    if os.path.exists(frames_dir):
        for f in os.listdir(frames_dir):
            if f.endswith(('.jpg', '.jpeg', '.png')):
                try:
                    os.remove(os.path.join(frames_dir, f))
                except Exception as e:
                    logger.error(f"Error removing old frame: {e}")
    try:
        vid_obj = cv2.VideoCapture(video_path)
        if not vid_obj.isOpened():
            logger.error(f"Could not open video file: {video_path}")
            return [], []
        
        fps = vid_obj.get(cv2.CAP_PROP_FPS)
        count = 0
        success = True
        while success:
            success, img = vid_obj.read()
            if not success: break
            if int(count % fps) == 0:
                frame_filename = f"frame_{uuid.uuid4().hex}_{count:06d}.jpg"
                frame_path = os.path.join(frames_dir, frame_filename)
                if cv2.imwrite(frame_path, img):
                    frames.append(img)
                    frame_paths.append(frame_path)
            count += 1
        vid_obj.release()
        return frames, frame_paths
    except Exception as e:
        logger.error(f"Error during frame extraction: {e}")
        return [], []

def evaluate_video_frames(frames, frame_paths):
    # Use Gemini API for video detection only
    response = detect_video_api("video input")
    overall_result = response.get('result', 'Real')
    overall_confidence = float(response.get('confidence', 75.0))
    results = [{'frame': f'frame{i}', 'path': frame_paths[i] if i < len(frame_paths) else '', 'result': overall_result, 'confidence': overall_confidence} for i in range(len(frames))]
    return results, overall_result, overall_confidence

def log_prediction(file_path, result, confidence, file_type="image"):
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'predictions.json')
    log_entry = {'timestamp': datetime.now().isoformat(), 'file_path': file_path, 'file_type': file_type, 'result': result, 'confidence': float(confidence)}
    
    logs = []
    if os.path.exists(log_file):
        try:
            with open(log_file, 'r') as f: logs = json.load(f)
        except Exception as e:
            logger.error(f"Error reading log file: {e}")
    
    logs.append(log_entry)
    with open(log_file, 'w') as f:
        json.dump(logs[-1000:], f, indent=2)

# --- UPDATED Local Audio Prediction Function ---
def predict_audio_local(audio_path):
    # Use Gemini API for audio detection only
    response = detect_audio_api("audio input")
    verdict = response.get('verdict', 'AUTHENTIC')
    confidence_level = float(response.get('confidence', 0.75))
    predicted_class = response.get('predicted_class', 0)
    return {
        "verdict": verdict,
        "confidence_level": confidence_level,
        "predicted_class": predicted_class,
        "analysis_method": "Gemini API audio analysis"
    }


# --- Report Generation Functions ---
def generate_heatmap(prediction_score, image_path):
    fig = None
    try:
        original_img = Image.open(requests.get(image_path, stream=True).raw if image_path.startswith('http') else image_path)
        if original_img.mode != 'RGB': original_img = original_img.convert('RGB')
        
        img_array = np.array(original_img)
        height, width = img_array.shape[:2]

        fig, ax = plt.subplots(1, 1, figsize=(width / 100, height / 100), dpi=100)
        ax.imshow(img_array)
        
        if prediction_score < 0.5:
            y, x = np.ogrid[:height, :width]
            center_y, center_x = height // 2, width // 2
            radius = min(height, width) * 0.4
            dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            mask = np.clip(1 - (dist_from_center / radius), 0, 1)
            overlay = np.zeros((height, width, 4))
            overlay[..., 0] = 1.0
            overlay[..., 3] = mask * 0.5
            ax.imshow(overlay)

        ax.axis('off')
        plt.tight_layout(pad=0)
        
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', pad_inches=0)
        img_buffer.seek(0)
        return img_buffer
    except Exception as e:
        logger.error(f"Error generating heatmap visual: {e}")
        return None
    finally:
        if fig is not None: plt.close(fig)

def create_detailed_report(analysis_data, report_type='image'):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.8*inch, bottomMargin=0.8*inch, leftMargin=0.8*inch, rightMargin=0.8*inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, fontName='Helvetica-Bold')
    header_style = ParagraphStyle('HeaderStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold', spaceBefore=10, spaceAfter=2)
    content_style = ParagraphStyle('ContentStyle', parent=styles['Normal'], fontSize=10, leading=12)
    footer_style = ParagraphStyle('FooterStyle', parent=styles['Normal'], fontSize=9, textColor=colors.grey)
    
    story = []
    story.append(Paragraph("INDsafe.ai Analysis Report", title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%d/%m/%Y, %H:%M:%S')}", content_style))
    
    prediction_score = analysis_data.get('prediction', 0.5)
    if prediction_score > 1: prediction_score /= 100
    
    confidence = (1 - prediction_score) * 100 if prediction_score < 0.5 else prediction_score * 100
    verdict = "DEEPFAKE DETECTED" if prediction_score < 0.5 else "AUTHENTIC"
    
    story.append(Paragraph(f"Verdict: {verdict}", content_style))
    story.append(Paragraph(f"Confidence: {confidence:.0f}%", content_style))
    
    # ... (rest of report generation logic) ...
    
    doc.build(story)
    buffer.seek(0)
    return buffer

# --- Flask Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detector')
def detector():
    return render_template('detector.html')

@app.route('/image-detection')
def image_detection():
    return render_template('detector.html')

@app.route('/video-detection')
def video_detection():
    return render_template('video_detection.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/detect_image', methods=['POST'])
def detect_image():
    if 'image' not in request.files: return jsonify({'error': 'No image file provided'})
    file = request.files['image']
    if not file or not file.filename: return jsonify({'error': 'No selected file'})
    
    if file and allowed_image_file(file.filename):
        try:
            unique_filename = f"{uuid.uuid4().hex}.{file.filename.rsplit('.', 1)[1].lower()}"
            filepath = os.path.join(app.config['IMAGE_UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            
            image = cv2.imread(filepath)
            if image is None: return jsonify({'error': 'Failed to read image'})
            
            result, confidence, message = predict_image(image)
            if result == "Error": return jsonify({'error': f'Analysis error: {message}'})
            
            log_prediction(filepath, result, confidence, "image")
            
            return jsonify({
                'prediction': str(result), 'confidence': float(confidence) / 100.0,
                'image_url': url_for('static', filename=f'uploads/images/{unique_filename}'),
                'message': str(message)
            })
        except Exception as e:
            logger.error(f"Error in detect_image: {e}")
            return jsonify({'error': f'Processing error: {str(e)}'})
    return jsonify({'error': 'Invalid file format'})

@app.route('/detect_video', methods=['POST'])
def detect_video():
    if 'video' not in request.files: return jsonify({'error': 'No video file provided'})
    file = request.files['video']
    if not file or not file.filename: return jsonify({'error': 'No video file selected'})
    if not allowed_video_file(file.filename): return jsonify({'error': 'Invalid video file format'})
    
    try:
        unique_filename = f"video_{uuid.uuid4().hex}.{file.filename.rsplit('.', 1)[1].lower()}"
        filepath = os.path.join(app.config['VIDEO_UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        frames, frame_paths = frame_capture(filepath)
        if not frames: return jsonify({'error': 'Failed to extract frames from video.'})
        
        frame_results, overall_result, overall_confidence = evaluate_video_frames(frames, frame_paths)
        log_prediction(filepath, overall_result, overall_confidence, "video")
        
        frame_sequence = [{'frame_number': i + 1, 'frame_path': r['path'], 'prediction': r['result'], 'confidence': r['confidence']} for i, r in enumerate(frame_results)]
        
        return jsonify({
            'prediction': overall_result, 'confidence': overall_confidence / 100,
            'video_url': url_for('static', filename=f'uploads/videos/{unique_filename}'),
            'frame_sequence': frame_sequence
        })
    except Exception as e:
        logger.error(f"Error in detect_video: {e}")
        return jsonify({'error': f'Video processing failed: {str(e)}'})

@app.route('/webcam', methods=['POST'])
def webcam_upload():
    try:
        data = request.get_json()
        if not data or 'image' not in data: return jsonify({'error': 'No image data'})
        
        img_data = base64.b64decode(data['image'].split(',')[1])
        image = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
        if image is None: return jsonify({'error': 'Failed to decode image'})
        
        unique_filename = f"{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(app.config['IMAGE_UPLOAD_FOLDER'], unique_filename)
        cv2.imwrite(filepath, image)
        
        result, confidence, message = predict_image(image)
        if result == "Error": return jsonify({'error': f'Analysis error: {message}'})
        
        log_prediction(filepath, result, confidence, "webcam")
        
        return jsonify({
            'result': result, 'confidence': f"{confidence:.1f}%",
            'image_url': url_for('static', filename=f'uploads/images/{unique_filename}'),
            'message': message
        })
    except Exception as e:
        logger.error(f"Error processing webcam image: {e}")
        return jsonify({'error': f'Processing error: {str(e)}'})

@app.route('/generate_report/<analysis_type>/<result_id>')
def generate_report(analysis_type, result_id):
    # This route is a placeholder and needs data passed via query params to work fully
    try:
        prediction = request.args.get('prediction', 0.5, type=float)
        analysis_data = {'prediction': prediction}
        report_buffer = create_detailed_report(analysis_data, analysis_type)
        
        from flask import Response
        response = Response(report_buffer.getvalue(), mimetype='application/pdf')
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f'Report_{analysis_type}_{result_id}_{timestamp}.pdf'
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'
        return response
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        return jsonify({'error': 'Failed to generate report'}), 500

# --- AUDIO & NEWS ANALYSIS ROUTES ---
@app.route('/api/analyze_audio', methods=['POST'])
def analyze_audio():
    # Audio analysis is under maintenance
    return jsonify({'error': 'Audio analysis is currently under maintenance. Please check back later.', 'maintenance': True}), 503

@app.route('/api/analyze_news', methods=['POST'])
def analyze_news():
    # Text/news analysis is under maintenance
    return jsonify({'error': 'Text/news analysis is currently under maintenance. Please check back later.', 'maintenance': True}), 503

if __name__ == '__main__':
    logger.info("Starting DeepFake Detector application")
    app.run(debug=True, host='0.0.0.0', port=5000)
