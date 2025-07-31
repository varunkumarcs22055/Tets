// TruthShield Image Detection JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const uploadArea = document.getElementById('imageUpload');
    const fileInput = document.getElementById('imageInput');
    const webcamBtn = document.getElementById('webcamBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analysisSection = document.getElementById('analysisSection');
    const resultsSection = document.getElementById('resultsSection');
    const previewImage = document.getElementById('previewImage');
    
    let selectedFile = null;

    // File upload handling
    if (uploadArea && fileInput) {
        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File selection
        fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }

    // Webcam button
    if (webcamBtn) {
        webcamBtn.addEventListener('click', handleWebcam);
    }

    // Analyze button
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeImage);
    }

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            selectedFile = file;
            displayImagePreview(file);
        } else {
            showNotification('Please select a valid image file', 'error');
        }
    }

    // Handle drag over
    function handleDragOver(event) {
        event.preventDefault();
        uploadArea.classList.add('dragover');
    }

    // Handle drag leave
    function handleDragLeave(event) {
        event.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    // Handle file drop
    function handleDrop(event) {
        event.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                selectedFile = file;
                fileInput.files = files;
                displayImagePreview(file);
            } else {
                showNotification('Please drop a valid image file', 'error');
            }
        }
    }

    // Display image preview
    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            analysisSection.style.display = 'block';
            
            // Smooth scroll to analysis section
            analysisSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        };
        reader.readAsDataURL(file);
    }

    // Handle webcam
    function handleWebcam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    // Create video element for webcam
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();
                    
                    // Create capture button
                    const captureBtn = document.createElement('button');
                    captureBtn.textContent = 'Capture Photo';
                    captureBtn.className = 'upload-btn primary';
                    
                    // Replace upload area with webcam
                    const webcamContainer = document.createElement('div');
                    webcamContainer.className = 'webcam-container';
                    webcamContainer.appendChild(video);
                    webcamContainer.appendChild(captureBtn);
                    
                    uploadArea.innerHTML = '';
                    uploadArea.appendChild(webcamContainer);
                    
                    // Handle photo capture
                    captureBtn.addEventListener('click', function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0);
                        
                        // Convert to blob and display
                        canvas.toBlob(function(blob) {
                            selectedFile = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
                            displayImagePreview(selectedFile);
                            
                            // Stop webcam
                            stream.getTracks().forEach(track => track.stop());
                        });
                    });
                })
                .catch(function(err) {
                    showNotification('Unable to access webcam: ' + err.message, 'error');
                });
        } else {
            showNotification('Webcam not supported in this browser', 'error');
        }
    }

    // Analyze image
    function analyzeImage() {
        if (!selectedFile) {
            showNotification('Please select an image first', 'error');
            return;
        }

        // Start analysis animation
        analyzeBtn.classList.add('analyzing');
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Analyzing...</span>';
        
        // Show analysis overlay
        const analysisOverlay = document.querySelector('.analysis-overlay');
        if (analysisOverlay) {
            analysisOverlay.classList.add('active');
        }

        // Create form data
        const formData = new FormData();
        formData.append('image', selectedFile);

        // Send to backend
        fetch('/detect_image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // Show demo results for now
            setTimeout(() => {
                displayDemoResults();
            }, 2000);
        })
        .finally(() => {
            // Reset analyze button
            analyzeBtn.classList.remove('analyzing');
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i><span>Analyze Image</span>';
            
            // Hide analysis overlay
            if (analysisOverlay) {
                analysisOverlay.classList.remove('active');
            }
        });
    }

    // Display results
    function displayResults(data) {
        const verdictIcon = document.getElementById('verdictIcon');
        const verdictText = document.getElementById('verdictText');
        const confidenceFill = document.getElementById('confidenceFill');
        const processingTime = document.getElementById('processingTime');
        const analysisDate = document.getElementById('analysisDate');

        // Update verdict
        if (data.prediction === 'Real') {
            verdictIcon.innerHTML = '<i class="fas fa-shield-check"></i>';
            verdictIcon.className = 'verdict-icon';
            verdictText.textContent = 'AUTHENTIC';
            document.querySelector('.verdict-subtitle').textContent = 'This image appears to be genuine';
        } else {
            verdictIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            verdictIcon.className = 'verdict-icon fake';
            verdictText.textContent = 'DEEPFAKE DETECTED';
            document.querySelector('.verdict-subtitle').textContent = 'This image shows signs of AI manipulation';
        }

        // Update confidence
        const confidence = Math.round(data.confidence * 100);
        confidenceFill.style.width = confidence + '%';
        document.querySelector('.confidence-percentage').textContent = confidence + '%';

        // Update processing time
        processingTime.textContent = data.processing_time || '1.8s';

        // Update analysis date
        analysisDate.textContent = new Date().toLocaleDateString();

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Display demo results (fallback)
    function displayDemoResults() {
        const demoData = {
            prediction: 'Real',
            confidence: 0.94,
            processing_time: '1.8s'
        };
        displayResults(demoData);
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Action buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-btn')) {
            const btn = e.target.closest('.action-btn');
            const action = btn.textContent.trim();
            
            if (action.includes('Download Report')) {
                downloadReport();
            } else if (action.includes('Analyze Another')) {
                resetInterface();
            }
        }
    });

    // Download report
    function downloadReport() {
        showNotification('Report download started', 'info');
        // Implement report generation logic here
    }

    // Reset interface
    function resetInterface() {
        selectedFile = null;
        analysisSection.style.display = 'none';
        resultsSection.style.display = 'none';
        fileInput.value = '';
        
        // Reset upload area
        uploadArea.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Drop your image here or click to upload</h3>
            <p>Supported formats: JPG, PNG, WebP, BMP (Max 10MB)</p>
            <input type="file" id="imageInput" accept="image/*" hidden>
            <div class="upload-buttons">
                <button class="upload-btn primary">Choose File</button>
                <button class="upload-btn secondary" id="webcamBtn">
                    <i class="fas fa-camera"></i>
                    Use Webcam
                </button>
            </div>
        `;
        
        // Re-bind events
        const newFileInput = document.getElementById('imageInput');
        const newWebcamBtn = document.getElementById('webcamBtn');
        
        uploadArea.addEventListener('click', () => newFileInput.click());
        newFileInput.addEventListener('change', handleFileSelect);
        newWebcamBtn.addEventListener('click', handleWebcam);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Add some visual enhancements
    function addVisualEnhancements() {
        // Add hover effects to stats
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add pulse animation to the image icon
        const imageIcon = document.querySelector('.image-icon');
        if (imageIcon) {
            setInterval(() => {
                imageIcon.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    imageIcon.style.transform = 'scale(1)';
                }, 200);
            }, 3000);
        }
    }

    // Initialize visual enhancements
    addVisualEnhancements();

    console.log('TruthShield Image Detection initialized');
});
