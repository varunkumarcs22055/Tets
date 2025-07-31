/**
 * TruthShield Video Detection Module
 * Version: 3.2.1
 * Last updated: 2025-06-24 00:23:07
 * Author: varunkumarcs22055
 */

// DOM Elements
const themeSwitch = document.getElementById("theme-switch");
const videoInput = document.getElementById("videoInput");
const browseVideoBtn = document.getElementById("browse-video-btn");
const uploadVideoBtn = document.getElementById("upload-video-btn");
const clearHistoryBtn = document.getElementById("clear-history");
const closeVideoResultsBtn = document.getElementById("close-video-results");
const saveVideoResultBtn = document.getElementById("save-video-result");
const shareVideoResultBtn = document.getElementById("share-video-result");
const downloadReportBtn = document.getElementById("download-report");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const videoDropArea = document.getElementById("video-drop-area");
const videoFileInfo = document.getElementById("video-file-info");
const loadingOverlay = document.getElementById("loading-overlay");
const videoResultsContainer = document.getElementById("video-results-container");
const historyList = document.getElementById("history-list");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastClose = document.getElementById("toast-close");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const videoPreview = document.getElementById("video-preview");
const framesContainer = document.getElementById("frames-container");

// State
let currentVideoFile = null;
let analysisHistory = JSON.parse(localStorage.getItem("videoAnalysisHistory")) || [];
let currentVideoResult = null;

// Config
const USER_DATA = {
    username: "varunkumarcs22055",
    timestamp: "2025-06-24 00:23:07"
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    console.log(`TruthShield Video Detection initialized by ${USER_DATA.username} at ${USER_DATA.timestamp}`);
    
    initTheme();
    renderHistory();
    setupEventListeners();
    initStats();

    // Check if dark mode is preferred
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-theme");
        themeSwitch.checked = true;
    }
    
    // Set the user timestamp in the UI
    const userTimestampEl = document.createElement('div');
    userTimestampEl.className = 'user-timestamp';
    userTimestampEl.dataset.user = USER_DATA.username;
    userTimestampEl.dataset.time = USER_DATA.timestamp;
    document.body.appendChild(userTimestampEl);
    
    // Update CSS variable for timestamp
    document.documentElement.style.setProperty('--user-timestamp', `"${USER_DATA.timestamp} by ${USER_DATA.username}"`);
});

// Initialize statistics counters
function initStats() {
    setTimeout(() => {
        animateCounter('accuracy-stat', 0, 90, '%', 2000);
        animateCounter('videos-stat', 0, 1, 'K+', 2500);
        animateTimeCounter('time-stat', 0, 2.5, 's', 1500);
    }, 500);
}

// Function to animate number counters
function animateCounter(elementId, start, end, suffix, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let startTime = null;
    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(animate);
        } else {
            element.textContent = end + suffix;
        }
    };
    
    window.requestAnimationFrame(animate);
}

// Special function for time with decimal points
function animateTimeCounter(elementId, start, end, suffix, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let startTime = null;
    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = (progress * (end - start) + start).toFixed(1);
        element.textContent = value + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(animate);
        } else {
            element.textContent = end + suffix;
        }
    };
    
    window.requestAnimationFrame(animate);
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            menuToggle.classList.toggle("active");
        });
    }

    // Theme Toggle
    if (themeSwitch) {
        themeSwitch.addEventListener("change", () => {
            document.body.classList.toggle("dark-theme");
            showToast(themeSwitch.checked ? "Dark mode enabled" : "Light mode enabled");
        });
    }

    // Tab Navigation
    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");

            // Remove active class from all tabs
            tabBtns.forEach((b) => b.classList.remove("active"));
            tabContents.forEach((c) => c.classList.remove("active"));

            // Add active class to selected tab
            btn.classList.add("active");
            document.getElementById(`${tabId}-tab`).classList.add("active");
        });
    });

    // Video Upload
    if (browseVideoBtn) {
        browseVideoBtn.addEventListener("click", () => {
            videoInput.click();
        });
    }

    if (videoInput) {
        videoInput.addEventListener("change", (e) => {
            handleVideoSelect(e.target.files[0]);
        });
    }

    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener("click", () => {
            if (currentVideoFile) {
                uploadAndAnalyzeVideo(currentVideoFile);
            }
        });
    }

    // Drag and Drop for Videos
    if (videoDropArea) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            videoDropArea.addEventListener(eventName, preventDefaults, false);
        });

        ["dragenter", "dragover"].forEach((eventName) => {
            videoDropArea.addEventListener(eventName, () => {
                videoDropArea.classList.add("drag-over");
            });
        });

        ["dragleave", "drop"].forEach((eventName) => {
            videoDropArea.addEventListener(eventName, () => {
                videoDropArea.classList.remove("drag-over");
            });
        });

        videoDropArea.addEventListener("drop", (e) => {
            const file = e.dataTransfer.files[0];
            handleVideoSelect(file);
        });
    }

    // Results controls
    if (closeVideoResultsBtn) {
        closeVideoResultsBtn.addEventListener("click", () => {
            if (videoResultsContainer) {
                videoResultsContainer.style.display = "none";
            }
        });
    }

    if (saveVideoResultBtn) {
        saveVideoResultBtn.addEventListener("click", saveVideoToHistory);
    }

    if (shareVideoResultBtn) {
        shareVideoResultBtn.addEventListener("click", shareVideoResults);
    }
    
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener("click", downloadReport);
    }
    
    // Fullscreen video control
    if (fullscreenBtn && videoPreview) {
        fullscreenBtn.addEventListener("click", () => {
            toggleFullscreen(videoPreview);
        });
    }

    // History controls
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", clearHistory);
    }

    // Toast
    if (toastClose) {
        toastClose.addEventListener("click", hideToast);
    }
}

// Fullscreen toggle function with cross-browser support
function toggleFullscreen(element) {
    if (!element) return;
    
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
        // Enter fullscreen
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        showToast("Entering fullscreen mode");
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        showToast("Exiting fullscreen mode");
    }
}

// Theme Toggle
function initTheme() {
    if (!themeSwitch) return;
    
    // Always use dark theme for this page
    document.body.classList.add("dark-theme");
    themeSwitch.checked = true;
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleVideoSelect(file) {
    if (!file) return;

    // Check if file is a video
    if (!file.type.match("video.*")) {
        showToast("Please select a video file", "error");
        return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
        showToast("File size exceeds 100MB limit", "error");
        return;
    }

    currentVideoFile = file;
    videoFileInfo.innerHTML = `
        <strong>${file.name}</strong> 
        <span>(${formatFileSize(file.size)})</span>
    `;
    uploadVideoBtn.disabled = false;

    // Show preview
    const url = URL.createObjectURL(file);
    videoPreview.src = url;
    videoPreview.onloadedmetadata = () => {
        // Display video metadata
        const duration = formatDuration(videoPreview.duration);
        videoFileInfo.innerHTML += `<br>Duration: ${duration}`;
    };
    
    // Ensure controls are enabled and video is visible
    videoPreview.setAttribute('controls', 'true');
    videoPreview.style.display = 'block';
    
    showToast("Video ready for analysis", "success");
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Analysis
function uploadAndAnalyzeVideo(file) {
    showLoading(true);
    trackAnalysisProgress(); // Add progress tracking

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", USER_DATA.username);

    fetch("/upload-video", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            showLoading(false);

            if (data.error) {
                showToast(data.error, "error");
            } else {
                displayVideoResults(data, file);
                logAnalysis(file.name, data.result, data.confidence);
            }
        })
        .catch((error) => {
            showLoading(false);
            console.error("Error:", error);
            showToast("An error occurred during video analysis", "error");
        });
}

function trackAnalysisProgress() {
    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 95) {
            clearInterval(progressInterval);
            return;
        }
        
        // Update progress bars
        const progressBar1 = document.getElementById('progress-1');
        const progressBar2 = document.getElementById('progress-2');
        const progressBar3 = document.getElementById('progress-3');
        
        if (progress < 40) {
            if (progressBar1) progressBar1.style.width = `${progress * 2.5}%`;
        } else if (progress < 70) {
            if (progressBar2) progressBar2.style.width = `${(progress - 40) * 3.3}%`;
        } else {
            if (progressBar3) progressBar3.style.width = `${(progress - 70) * 4}%`;
        }
    }, 300);
}

function displayVideoResults(data, file) {
    // Store current video result
    currentVideoResult = {
        file: file,
        result: data.result,
        confidence: data.confidence,
        videoUrl: data.video_url,
        frames: data.frames,
        timestamp: new Date().toISOString(),
        type: "video",
    };

    // Display video - ensure proper video display
    if (videoPreview) {
        // Reset any previous video state
        videoPreview.pause();
        videoPreview.removeAttribute('src');
        videoPreview.load();
        
        // Set new source and ensure controls are visible
        videoPreview.src = data.video_url;
        videoPreview.setAttribute('controls', 'true');
        videoPreview.style.display = 'block';
        videoPreview.style.width = '100%';
        
        // Add event handlers for video loading
        videoPreview.onloadeddata = () => {
            console.log("Video loaded successfully");
        };
        
        videoPreview.onerror = (e) => {
            console.error("Error loading video:", e);
            showToast("Error loading video", "error");
        };
        
        // Force reload
        videoPreview.load();
    }

    // Display verdict
    const resultVerdict = document.getElementById("video-result-verdict");
    let verdictClass = "";
    let verdictText = "";

    if (data.result === "Real") {
        verdictClass = "verdict-real";
        verdictText = `<i class="fas fa-check-circle"></i> This video appears to be Real`;
    } else {
        verdictClass = "verdict-fake";
        verdictText = `<i class="fas fa-exclamation-triangle"></i> This video appears to be Fake`;
    }

    if (resultVerdict) {
        resultVerdict.className = "result-verdict " + verdictClass;
        resultVerdict.innerHTML = verdictText;
    }

    // Display confidence meter
    const confidenceMeter = document.getElementById("video-confidence-meter");
    const confidenceValueEl = document.getElementById("video-confidence-value");

    if (confidenceMeter && confidenceValueEl) {
        confidenceMeter.style.width = "0%";
        confidenceMeter.className = "meter-fill";

        if (data.result === "Real") {
            confidenceMeter.classList.add("real");
        } else {
            confidenceMeter.classList.add("fake");
        }

        // Extract numeric value from percentage string
        const confidenceValue = parseFloat(data.confidence);
        confidenceValueEl.textContent = `${confidenceValue.toFixed(1)}%`;

        // Animate confidence meter
        setTimeout(() => {
            confidenceMeter.style.width = `${confidenceValue}%`;
        }, 100);
    }

    // Display frames with confidence scores - WITHOUT POPUP FUNCTIONALITY
    if (framesContainer) {
        framesContainer.innerHTML = "";

        if (data.frames && data.frames.length > 0) {
            // Create a grid layout for frames
            const framesGrid = document.createElement("div");
            framesGrid.className = "frames-grid";
            framesContainer.appendChild(framesGrid);

            data.frames.forEach((frame, index) => {
                const frameItem = document.createElement("div");
                frameItem.className = `frame-item ${frame.result.toLowerCase()}`;

                // Extract confidence value from percentage string
                const confidenceValue = parseFloat(frame.confidence);

                // Create image element with proper error handling
                const frameImage = document.createElement("img");
                frameImage.className = "frame-image";
                frameImage.alt = `Frame ${index + 1}`;
                frameImage.src = frame.path;
                frameImage.loading = "lazy"; // Lazy load images

                // Add error handling for broken images
                frameImage.onerror = function () {
                    this.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className = "frame-placeholder";
                    placeholder.innerHTML = `<i class="fas fa-image"></i><span>Frame ${index + 1}</span>`;
                    this.parentNode.insertBefore(placeholder, this);
                };

                frameItem.innerHTML = `
                    <div class="frame-image-container"></div>
                    <div class="frame-info">
                        <div class="frame-header">
                            <span class="frame-number">Frame ${index + 1}</span>
                            <span class="frame-result ${frame.result.toLowerCase()}">${frame.result}</span>
                        </div>
                        <div class="frame-confidence">
                            <div class="mini-meter-container">
                                <div class="mini-meter-bar">
                                    <div class="mini-meter-fill ${frame.result.toLowerCase()}" style="width: ${confidenceValue}%;"></div>
                                </div>
                                <span class="mini-meter-value">${frame.confidence}</span>
                            </div>
                        </div>
                    </div>
                `;

                // Insert the image into the container
                frameItem.querySelector(".frame-image-container").appendChild(frameImage);
                
                // NO CLICK EVENT - We deliberately don't add any click event to avoid popup
                
                framesGrid.appendChild(frameItem);
            });
        } else {
            framesContainer.innerHTML = `
                <div class="no-frames">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No frames were extracted for analysis.</p>
                </div>
            `;
        }
    }

    // Display explanation
    const explanation = document.getElementById("video-result-explanation");
    if (explanation) {
        if (data.result === "Real") {
            explanation.innerHTML = `
                <div class="explanation-content">
                    <p>Our AI analysis indicates this video is likely <strong>authentic</strong> with ${data.confidence} confidence. 
                    We analyzed ${data.frames ? data.frames.length : 'multiple'} frames and found no significant manipulation markers.</p>
                    
                    <p>Key factors in our determination:</p>
                    <ul>
                        <li>Consistent lighting and shadows across frames</li>
                        <li>Natural facial movement and expressions</li>
                        <li>Consistent video quality and metadata</li>
                        <li>No detectable splicing or composition markers</li>
                    </ul>
                    
                    <div class="warning-note">
                        <i class="fas fa-info-circle"></i>
                        <p>Even with high confidence results, advanced deepfakes can sometimes evade detection. Always verify important content through multiple sources.</p>
                    </div>
                </div>
            `;
        } else {
            explanation.innerHTML = `
                <div class="explanation-content">
                    <p>Our AI analysis detected manipulation patterns consistent with <strong>deepfakes</strong>, with ${data.confidence} confidence.
                    Multiple frames in this video show artificial characteristics that don't appear in authentic footage.</p>
                    
                    <p>Detected manipulation indicators:</p>
                    <ul>
                        <li>Inconsistent facial features across video frames</li>
                        <li>Unnatural lighting transitions or reflections</li>
                        <li>Artifacts around facial boundaries or key features</li>
                        <li>Inconsistent video quality in specific regions</li>
                    </ul>
                    
                    <div class="warning-note">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>This type of manipulated content is increasingly common online and may be used to spread misinformation. We recommend not sharing this content without disclosure of its manipulated nature.</p>
                    </div>
                </div>
            `;
        }
    }

    // Show video results container with animation
    if (videoResultsContainer) {
        videoResultsContainer.style.display = "block";

        // Scroll to results with smooth animation
        videoResultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// History Management
function saveVideoToHistory() {
    if (!currentVideoResult) {
        showToast("No results to save", "error");
        return;
    }

    // Check if this analysis is already in history
    const existingIndex = analysisHistory.findIndex(item => 
        item.timestamp === currentVideoResult.timestamp
    );

    if (existingIndex >= 0) {
        showToast("This result is already saved in history", "info");
        return;
    }

    // Create a URL for the file if it exists
    let fileUrl = null;
    if (currentVideoResult.file) {
        fileUrl = URL.createObjectURL(currentVideoResult.file);
    }

    const historyItem = {
        ...currentVideoResult,
        id: Date.now().toString(),
        fileUrl: fileUrl || currentVideoResult.videoUrl,
        savedAt: new Date().toISOString()
    };

    analysisHistory.unshift(historyItem);

    // Limit history to 20 items
    if (analysisHistory.length > 20) {
        analysisHistory.pop();
    }

    localStorage.setItem("videoAnalysisHistory", JSON.stringify(analysisHistory));
    renderHistory();
    showToast("Video result saved to history", "success");

    // Switch to history tab
    tabBtns.forEach((btn) => {
        if (btn.getAttribute("data-tab") === "history") {
            btn.click();
        }
    });
}

function renderHistory() {
    if (!historyList) return;

    if (analysisHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <p>Your video analysis history will appear here</p>
                <p class="empty-subtext">Results are stored locally on your device</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = "";

    analysisHistory.forEach((item) => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();

        const fileNameParts = item.file ? item.file.name.split('.') : ['Unknown_Video'];
        const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : 'mp4';
        const fileName = fileNameParts.join('.');
        
        // Extract frame count
        const frameCount = item.frames ? item.frames.length : '?';

        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        historyItem.innerHTML = `
            <div class="history-thumbnail">
                <i class="fas fa-film"></i>
            </div>
            <div class="history-details">
                <div class="history-header">
                    <span class="history-filename">${fileName}</span>
                    <span class="history-result ${item.result.toLowerCase()}">${item.result}</span>
                </div>
                <div class="history-meta">
                    <span><i class="fas fa-film"></i> ${frameCount} frames</span>
                    <span><i class="fas fa-percent"></i> ${item.confidence}</span>
                    <span><i class="fas fa-clock"></i> ${formattedDate}</span>
                </div>
                <p class="history-format">${fileExt.toUpperCase()} format</p>
            </div>
        `;

        historyItem.addEventListener("click", () => {
            // Load this video result
            if (videoPreview) {
                // Reset video state
                videoPreview.pause();
                videoPreview.removeAttribute('src');
                videoPreview.load();
                
                // Set new source and ensure video is displayed properly
                videoPreview.src = item.videoUrl || item.fileUrl;
                videoPreview.setAttribute('controls', 'true');
                videoPreview.style.display = 'block';
                
                // Force reload
                videoPreview.load();
            }

            // Display video results
            displayVideoResults(
                {
                    result: item.result,
                    confidence: item.confidence,
                    video_url: item.videoUrl || item.fileUrl,
                    frames: item.frames || [],
                },
                null
            );
        });

        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    if (!analysisHistory.length) {
        showToast("History is already empty", "info");
        return;
    }

    if (confirm("Are you sure you want to clear your history? This cannot be undone.")) {
        analysisHistory = [];
        localStorage.removeItem("videoAnalysisHistory");
        renderHistory();
        showToast("History cleared", "success");
    }
}

function shareVideoResults() {
    if (!currentVideoResult) {
        showToast("No results to share", "error");
        return;
    }

    if (navigator.share) {
        navigator
            .share({
                title: "TruthShield Video Analysis Result",
                text: `This video was analyzed as ${currentVideoResult.result} with ${currentVideoResult.confidence} confidence.`,
                url: window.location.href,
            })
            .then(() => showToast("Shared successfully", "success"))
            .catch((err) => {
                console.error("Share error:", err);
                showToast("Error sharing: " + (err.message || "Unknown error"), "error");
            });
    } else {
        // Fallback for browsers that don't support Web Share API
        const dummyInput = document.createElement("input");
        document.body.appendChild(dummyInput);
        dummyInput.value = `TruthShield Video Analysis: ${currentVideoResult.result} (${currentVideoResult.confidence} confidence)`;
        dummyInput.select();
        document.execCommand("copy");
        document.body.removeChild(dummyInput);
        showToast("Result copied to clipboard", "success");
    }
}

function downloadReport() {
    if (!currentVideoResult) {
        showToast("No results to download", "error");
        return;
    }

    // Create report content
    const reportDate = new Date().toLocaleString();
    const frameCount = currentVideoResult.frames ? currentVideoResult.frames.length : 0;
    
    let reportContent = `
TruthShield Video Analysis Report
================================
Generated: ${reportDate}
Analyzed by: ${USER_DATA.username}

VIDEO ANALYSIS RESULTS
---------------------
Verdict: ${currentVideoResult.result}
Confidence: ${currentVideoResult.confidence}
File: ${currentVideoResult.file ? currentVideoResult.file.name : 'Unknown'}
Size: ${currentVideoResult.file ? formatFileSize(currentVideoResult.file.size) : 'Unknown'}
Frames analyzed: ${frameCount}

FRAME BY FRAME RESULTS
---------------------
`;

    if (currentVideoResult.frames && currentVideoResult.frames.length > 0) {
        currentVideoResult.frames.forEach((frame, index) => {
            reportContent += `Frame ${index + 1}: ${frame.result} (${frame.confidence} confidence)\n`;
        });
    } else {
        reportContent += "No individual frames were analyzed.\n";
    }

    reportContent += `
ANALYSIS SUMMARY
--------------
${currentVideoResult.result === "Real" 
    ? "This video appears to be authentic with no significant manipulation markers detected." 
    : "This video appears to be manipulated with AI-generated content detected."
}

TruthShield - Protecting truth in the digital age
Report ID: ${Date.now().toString(36)}
`;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `TruthShield-Report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("Report downloaded successfully", "success");
}

// Utility Functions
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add("active");
            loadingOverlay.innerHTML = `
                <div class="loader">
                    <div class="scan-animation">
                        <div class="scan-line"></div>
                    </div>
                    <svg class="circular" viewBox="25 25 50 50">
                        <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/>
                    </svg>
                </div>
                <p class="loading-text">Analyzing video with AI...</p>
                <div class="loading-stats">
                    <div class="loading-stat">
                        <span class="loading-label">Extracting frames</span>
                        <div class="loading-progress">
                            <div class="loading-bar" id="progress-1"></div>
                        </div>
                    </div>
                    <div class="loading-stat">
                        <span class="loading-label">Analyzing content</span>
                        <div class="loading-progress">
                            <div class="loading-bar" id="progress-2"></div>
                        </div>
                    </div>
                    <div class="loading-stat">
                        <span class="loading-label">Processing results</span>
                        <div class="loading-progress">
                            <div class="loading-bar" id="progress-3"></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            loadingOverlay.classList.remove("active");
        }
    }
}

function showToast(message, type = "info") {
    if (toast && toastMessage) {
        // Set icon based on type
        const iconElement = toast.querySelector('.toast-icon i');
        if (iconElement) {
            iconElement.className = ''; // Clear existing classes
            
            switch (type) {
                case "success":
                    iconElement.className = "fas fa-check-circle";
                    toast.className = "toast active success";
                    break;
                case "error":
                    iconElement.className = "fas fa-exclamation-circle";
                    toast.className = "toast active error";
                    break;
                case "warning":
                    iconElement.className = "fas fa-exclamation-triangle";
                    toast.className = "toast active warning";
                    break;
                default:
                    iconElement.className = "fas fa-info-circle";
                    toast.className = "toast active";
            }
        }
        
        toastMessage.textContent = message;
        toast.classList.add("active");

        // Auto hide after 3 seconds
        setTimeout(() => {
            hideToast();
        }, 3000);
    }
}

function hideToast() {
    if (toast) {
        toast.classList.remove("active");
    }
}

function logAnalysis(filename, result, confidence) {
    console.log(`[${USER_DATA.timestamp}] Analysis by ${USER_DATA.username}: ${filename} - ${result} (${confidence})`);
}

// Special fix for video display issues - ensure video elements work correctly
window.addEventListener('load', () => {
    if (videoPreview) {
        // Ensure video has proper attributes and event handlers
        videoPreview.setAttribute('playsinline', '');
        videoPreview.setAttribute('controls', 'true');
        
        // Safari sometimes needs special treatment
        videoPreview.playsInline = true;
        
        // Fix for iOS
        videoPreview.addEventListener('loadedmetadata', function() {
            if (videoPreview.videoHeight === 0) {
                videoPreview.load();
            }
        });
    }
});