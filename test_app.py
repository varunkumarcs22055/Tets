#!/usr/bin/env python3
"""
Simple test script to check if the application can start without errors
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("🔍 Testing imports...")
    
    # Test basic imports
    import flask
    print("✅ Flask imported successfully")
    
    import cv2
    print("✅ OpenCV imported successfully")
    
    import tensorflow as tf
    print("✅ TensorFlow imported successfully")
    
    import numpy as np
    print("✅ NumPy imported successfully")
    
    # Test optional imports for report generation
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate
        print("✅ ReportLab imported successfully")
    except ImportError as e:
        print(f"⚠️ ReportLab not available: {e}")
    
    try:
        from PIL import Image
        print("✅ Pillow imported successfully")
    except ImportError as e:
        print(f"⚠️ Pillow not available: {e}")
    
    try:
        import seaborn as sns
        print("✅ Seaborn imported successfully")
    except ImportError as e:
        print(f"⚠️ Seaborn not available: {e}")
    
    # Test model files exist
    image_model_path = os.path.join('model', 'new_xception.h5')
    video_model_path = os.path.join('model', 'deepfake_detection_model.h5')
    
    if os.path.exists(image_model_path):
        print(f"✅ Image model found: {image_model_path}")
    else:
        print(f"⚠️ Image model not found: {image_model_path}")
        
    if os.path.exists(video_model_path):
        print(f"✅ Video model found: {video_model_path}")
    else:
        print(f"⚠️ Video model not found: {video_model_path}")
    
    # Test logo file
    logo_path = os.path.join('static', 'images', 'logo.png')
    if os.path.exists(logo_path):
        print(f"✅ Logo file found: {logo_path}")
    else:
        print(f"⚠️ Logo file not found: {logo_path}")
    
    print("\n🚀 Basic imports test completed successfully!")
    print("📝 You can now try running: python app.py")
    
except Exception as e:
    print(f"❌ Error during testing: {e}")
    import traceback
    traceback.print_exc()
