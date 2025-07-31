// Detector JavaScript for INDsafe.ai
document.addEventListener('DOMContentLoaded', function() {
    
    // Page navigation
    const aiDetectorBtn = document.getElementById('aiDetectorBtn');
    const backBtn = document.getElementById('backBtn');
    const homepage = document.getElementById('homepage');
    const dashboard = document.getElementById('dashboard');
    
    // Module switching
    const moduleButtons = document.querySelectorAll('.module-btn');
    const detectionModules = document.querySelectorAll('.detection-module');
    
    // Upload elements
    const imageUpload = document.getElementById('imageUpload');
    const videoUpload = document.getElementById('videoUpload');
    const audioUpload = document.getElementById('audioUpload');
    const imageInput = document.getElementById('imageInput');
    const videoInput = document.getElementById('videoInput');
    const audioInput = document.getElementById('audioInput');
    const textInput = document.getElementById('textInput');
    
    // Analysis
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsPanel = document.getElementById('resultsPanel');
    
    // Initialize glitch effect
    initGlitchEffect();
    
    // Page Navigation
    aiDetectorBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
            homepage.classList.remove('active');
            dashboard.classList.add('active');
        }, 150);
    });
    
    backBtn.addEventListener('click', function() {
        dashboard.classList.remove('active');
        homepage.classList.add('active');
        resetDashboard();
    });
    
    // Module Switching
    moduleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetModule = this.dataset.module;
            
            // Update active button
            moduleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active module
            detectionModules.forEach(module => module.classList.remove('active'));
            document.getElementById(targetModule + 'Module').classList.add('active');
            
            // Hide results panel
            resultsPanel.style.display = 'none';
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // File Upload Handlers
    imageUpload.addEventListener('click', () => imageInput.click());
    videoUpload.addEventListener('click', () => videoInput.click());
    audioUpload.addEventListener('click', () => audioInput.click());
    
    // Drag and Drop
    setupDragAndDrop(imageUpload, imageInput);
    setupDragAndDrop(videoUpload, videoInput);
    setupDragAndDrop(audioUpload, audioInput);
    
    // File Input Changes
    imageInput.addEventListener('change', function() {
        handleFileUpload(this, 'image');
    });
    
    videoInput.addEventListener('change', function() {
        handleFileUpload(this, 'video');
    });
    
    audioInput.addEventListener('change', function() {
        handleFileUpload(this, 'audio');
    });
    
    // Analyze Button
    analyzeBtn.addEventListener('click', function() {
        performAnalysis();
    });
    
    // Generate Report Button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.generate-report-btn')) {
            generateReport();
        }
    });
    
    // Functions
    function initGlitchEffect() {
        const glitchText = document.querySelector('.glitch-text');
        if (glitchText) {
            setInterval(() => {
                glitchText.style.animation = 'none';
                setTimeout(() => {
                    glitchText.style.animation = '';
                }, 100);
            }, 5000);
        }
    }
    
    function setupDragAndDrop(uploadArea, fileInput) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--neon-blue)';
            this.style.background = 'rgba(0, 212, 255, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--glass-border)';
            this.style.background = '';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--glass-border)';
            this.style.background = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        });
    }
    
    function handleFileUpload(input, type) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            showPreview(e.result, type, file);
        };
        
        if (type === 'image') {
            reader.readAsDataURL(file);
        } else if (type === 'video') {
            reader.readAsDataURL(file);
        } else if (type === 'audio') {
            reader.readAsDataURL(file);
        }
    }
    
    function showPreview(src, type, file) {
        const uploadSection = document.querySelector(`#${type}Module .upload-section`);
        const previewSection = document.querySelector(`#${type}Module .preview-section`);
        
        uploadSection.style.display = 'none';
        previewSection.style.display = 'block';
        
        if (type === 'image') {
            const img = document.getElementById('previewImg');
            img.src = src;
            
            // Simulate analysis overlay
            setTimeout(() => {
                const analysisOverlay = document.querySelector('.analysis-overlay');
                analysisOverlay.style.display = 'block';
            }, 500);
            
        } else if (type === 'video') {
            const video = document.getElementById('previewVideo');
            video.src = src;
            
            // Simulate frame analysis
            setTimeout(() => {
                const frameItems = document.querySelectorAll('.frame-item');
                frameItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.background = `linear-gradient(45deg, var(--neon-blue), var(--neon-purple))`;
                    }, index * 300);
                });
            }, 1000);
            
        } else if (type === 'audio') {
            const audio = document.getElementById('previewAudio');
            audio.src = src;
            
            // Animate waveform
            setTimeout(() => {
                const bars = document.querySelectorAll('.waveform-bars .bar');
                bars.forEach(bar => {
                    bar.style.animationDuration = '0.5s';
                });
            }, 500);
        }
    }
    
    function performAnalysis() {
        // Get current active module
        const activeModule = document.querySelector('.module-btn.active').dataset.module;
        
        // Check if content is ready for analysis
        let hasContent = false;
        
        if (activeModule === 'image') {
            hasContent = document.getElementById('previewImg').src !== '';
        } else if (activeModule === 'video') {
            hasContent = document.getElementById('previewVideo').src !== '';
        } else if (activeModule === 'audio') {
            hasContent = document.getElementById('previewAudio').src !== '';
        } else if (activeModule === 'text') {
            hasContent = textInput.value.trim() !== '';
        }
        
        if (!hasContent) {
            showNotification('Please upload content or enter text before analyzing.', 'warning');
            return;
        }
        
        // Show loading state
        analyzeBtn.innerHTML = `
            <div class="btn-content">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Analyzing...</span>
            </div>
            <div class="btn-glow"></div>
        `;
        analyzeBtn.disabled = true;
        
        // Simulate AI analysis
        setTimeout(() => {
            const isFake = Math.random() > 0.6; // 40% chance of being fake
            const confidence = Math.floor(Math.random() * 20) + 80; // 80-100% confidence
            
            showResults(isFake, confidence);
            
            // Reset button
            analyzeBtn.innerHTML = `
                <div class="btn-content">
                    <i class="fas fa-search"></i>
                    <span>Analyze Content</span>
                </div>
                <div class="btn-glow"></div>
            `;
            analyzeBtn.disabled = false;
            
        }, 3000 + Math.random() * 2000); // 3-5 seconds
    }
    
    function showResults(isFake, confidence) {
        const verdictIcon = document.getElementById('verdictIcon');
        const verdictText = document.getElementById('verdictText');
        const confidenceFill = document.getElementById('confidenceFill');
        const confidencePercentage = document.getElementById('confidencePercentage');
        const analysisTime = document.getElementById('analysisTime');
        const processingTime = document.getElementById('processingTime');
        
        // Set verdict
        if (isFake) {
            verdictIcon.className = 'verdict-icon fake';
            verdictIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            verdictText.textContent = 'FAKE';
            verdictText.className = 'verdict-text fake';
            confidenceFill.className = 'meter-fill fake';
        } else {
            verdictIcon.className = 'verdict-icon real';
            verdictIcon.innerHTML = '<i class="fas fa-shield-check"></i>';
            verdictText.textContent = 'REAL';
            verdictText.className = 'verdict-text real';
            confidenceFill.className = 'meter-fill real';
        }
        
        // Set confidence
        confidenceFill.style.width = confidence + '%';
        confidencePercentage.textContent = confidence + '%';
        
        // Set timing
        const time = (2 + Math.random() * 3).toFixed(1) + 's';
        analysisTime.textContent = time;
        processingTime.textContent = time;
        
        // Show results panel
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    function generateReport() {
        showNotification('Generating PDF report...', 'info');
        
        // Simulate PDF generation
        setTimeout(() => {
            showNotification('Report generated successfully!', 'success');
            
            // Create a simple text report (in real implementation, this would be a PDF)
            const reportContent = generateReportContent();
            downloadReport(reportContent);
        }, 2000);
    }
    
    function generateReportContent() {
        const activeModule = document.querySelector('.module-btn.active').dataset.module;
        const verdictText = document.getElementById('verdictText').textContent;
        const confidence = document.getElementById('confidencePercentage').textContent;
        const timestamp = new Date().toLocaleString();
        
        return `
INDsafe.ai - Deepfake Detection Report
=====================================

Analysis Date: ${timestamp}
Content Type: ${activeModule.toUpperCase()}
Verdict: ${verdictText}
Confidence Level: ${confidence}

Technical Details:
- Algorithm: XceptionNet-V4
- Model Version: 2024.12.1
- Processing Time: ${document.getElementById('processingTime').textContent}

This report was generated by INDsafe.ai's AI-powered deepfake detection system.
        `.trim();
    }
    
    function downloadReport(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INDsafe_Report_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            padding: 1rem 1.5rem;
            backdrop-filter: blur(20px);
            color: var(--text-primary);
            animation: slideInRight 0.3s ease-out;
            transform: translateX(100%);
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                to { transform: translateX(0); }
            }
            .notification.success { border-left: 4px solid var(--neon-green); }
            .notification.warning { border-left: 4px solid var(--saffron); }
            .notification.info { border-left: 4px solid var(--neon-blue); }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 4000);
    }
    
    function resetDashboard() {
        // Reset all modules to initial state
        document.querySelectorAll('.upload-section').forEach(section => {
            section.style.display = 'block';
        });
        
        document.querySelectorAll('.preview-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.value = '';
        });
        
        // Clear text input
        if (textInput) {
            textInput.value = '';
        }
        
        // Hide results panel
        resultsPanel.style.display = 'none';
        
        // Reset to image module
        moduleButtons.forEach(btn => btn.classList.remove('active'));
        moduleButtons[0].classList.add('active');
        
        detectionModules.forEach(module => module.classList.remove('active'));
        detectionModules[0].classList.add('active');
    }
    
    // Add some interactive effects
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (this.querySelector('.btn-glow')) {
                this.querySelector('.btn-glow').style.opacity = '0.6';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (this.querySelector('.btn-glow')) {
                this.querySelector('.btn-glow').style.opacity = '0';
            }
        });
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate in
    document.querySelectorAll('.detection-module, .results-panel').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
});
