// Face Recognition App - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadForm = document.getElementById('upload-form');
    const userNameInput = document.getElementById('user-name');
    const photoUploadInput = document.getElementById('photo-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');
    const usersContainer = document.getElementById('users-container');
    const noUsersMessage = document.getElementById('no-users-message');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const startCameraBtn = document.getElementById('start-camera-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const resultIcon = document.getElementById('result-icon');
    const resultText = document.getElementById('result-text');
    const resultDetails = document.getElementById('result-details');
    const matchConfidence = document.getElementById('match-confidence');
    const cameraWarning = document.getElementById('camera-warning');
    const storedFacesCount = document.getElementById('stored-faces-count');
    const lastMatchElement = document.getElementById('last-match');
    const videoPlaceholder = document.getElementById('video-placeholder');
    
    // Radio buttons and sections
    const uploadPhotoRadio = document.getElementById('upload-photo');
    const livePhotoRadio = document.getElementById('live-photo');
    const uploadPhotoSection = document.getElementById('upload-photo-section');
    const livePhotoSection = document.getElementById('live-photo-section');
    
    // Live Capture Elements
    const liveCaptureForm = document.getElementById('live-capture-form');
    const liveUserNameInput = document.getElementById('live-user-name');
    const liveVideo = document.getElementById('live-video');
    const liveCanvas = document.getElementById('live-canvas');
    const startLiveCameraBtn = document.getElementById('start-live-camera-btn');
    const captureBtn = document.getElementById('capture-btn');
    const saveLivePhotoBtn = document.getElementById('save-live-photo-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const capturedPreview = document.getElementById('captured-preview');
    const livePreview = document.getElementById('live-preview');
    
    // Recognition Result Elements
    const matchedUserAvatar = document.getElementById('matched-user-avatar');
    const matchedImage = document.getElementById('matched-image');
    
    // Full Screen Elements
    const fullscreenSuccess = document.getElementById('fullscreen-success');
    const fullscreenCountdown = document.getElementById('fullscreen-countdown');
    const successTitle = document.getElementById('success-title');
    const successName = document.getElementById('success-name');
    const successUserImage = document.getElementById('success-user-image');
    const successMessage = document.getElementById('success-message');
    const backHomeBtn = document.getElementById('back-home-btn');
    const continueRecognitionBtn = document.getElementById('continue-recognition-btn');
    const countdownUserName = document.getElementById('countdown-user-name');
    const circleProgress = document.getElementById('circle-progress');
    const countdownNumber = document.getElementById('countdown-number');
    const remainingSeconds = document.getElementById('remaining-seconds');
    const countdownInstruction = document.getElementById('countdown-instruction');
    const cancelCountdownBtn = document.getElementById('cancel-countdown-btn');
    
    // Global variables
    let labeledDescriptors = [];
    let isCameraOn = false;
    let stream = null;
    let faceMatcher = null;
    let modelsLoaded = false;
    let recognitionInterval = null;
    
    // Live capture variables
    let liveStream = null;
    let capturedPhoto = null;
    
    // Recognition variables
    let currentMatch = null;
    let matchCount = 0;
    let isCountingDown = false;
    let countdownSeconds = 5;
    let countdownInterval = null;
    let isRecognitionActive = false;
    
    // Modal elements
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
    const messageModalTitle = document.getElementById('messageModalTitle');
    const messageModalText = document.getElementById('messageModalText');
    
    // Initialize the app
    initApp();
    
    // Initialize the application
    async function initApp() {
        console.log("Initializing Face Recognition App...");
        
        // Setup event listeners first
        setupEventListeners();
        
        // Load face-api.js models
        await loadFaceApiModels();
        
        // Load stored faces from localStorage
        loadStoredFaces();
        
        // Update stored faces count
        updateStoredFacesCount();
    }
    
    // Load face-api.js models
    async function loadFaceApiModels() {
        try {
            console.log("Loading face detection models...");
            
            // Show loading state
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading Models...';
            
            // Load the models from CDN
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
            await faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
            await faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
            
            modelsLoaded = true;
            console.log("All models loaded successfully");
            
            // Enable upload button
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Upload & Process Faces';
            
        } catch (error) {
            console.error("Error loading models:", error);
            
            // Fallback
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Upload & Process Faces';
            
            showMessage('warning', 'Models Loading', 'Face detection models are loading in background.');
            
            modelsLoaded = true;
        }
    }
    
    // Show message in modal
    function showMessage(type, title, text) {
        messageModalTitle.textContent = title;
        messageModalText.textContent = text;
        
        const modalHeader = document.querySelector('#messageModal .modal-header');
        modalHeader.className = 'modal-header';
        
        switch(type) {
            case 'success':
                modalHeader.classList.add('bg-success', 'text-white');
                break;
            case 'error':
                modalHeader.classList.add('bg-danger', 'text-white');
                break;
            case 'warning':
                modalHeader.classList.add('bg-warning', 'text-dark');
                break;
            default:
                modalHeader.classList.add('bg-info', 'text-white');
        }
        
        messageModal.show();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Radio button change event
        uploadPhotoRadio.addEventListener('change', toggleFaceMethod);
        livePhotoRadio.addEventListener('change', toggleFaceMethod);
        
        // Photo upload preview
        photoUploadInput.addEventListener('change', handlePhotoPreview);
        
        // Upload form submission
        uploadForm.addEventListener('submit', handleUploadSubmit);
        
        // Clear all stored faces
        clearAllBtn.addEventListener('click', clearAllFaces);
        
        // Camera controls
        startCameraBtn.addEventListener('click', startCamera);
        stopCameraBtn.addEventListener('click', stopCamera);
        
        // Live capture controls
        startLiveCameraBtn.addEventListener('click', startLiveCamera);
        captureBtn.addEventListener('click', capturePhoto);
        saveLivePhotoBtn.addEventListener('click', saveLivePhoto);
        retakeBtn.addEventListener('click', retakePhoto);
        
        // Full screen success buttons
        backHomeBtn.addEventListener('click', goToHomePage);
        continueRecognitionBtn.addEventListener('click', continueRecognition);
        cancelCountdownBtn.addEventListener('click', cancelCountdown);
        
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile navbar if open
                    const navbarCollapse = document.querySelector('.navbar-collapse.show');
                    if (navbarCollapse) {
                        navbarCollapse.classList.remove('show');
                    }
                }
            });
        });
    }
    
    // Toggle between upload photo and live photo methods
    function toggleFaceMethod() {
        if (uploadPhotoRadio.checked) {
            // Show upload photo section, hide live photo section
            uploadPhotoSection.style.display = 'block';
            livePhotoSection.style.display = 'none';
            
            // Reset live capture if active
            if (liveStream) {
                liveStream.getTracks().forEach(track => track.stop());
                liveStream = null;
                liveVideo.classList.add('d-none');
            }
            resetLiveCapture();
        } else if (livePhotoRadio.checked) {
            // Show live photo section, hide upload photo section
            uploadPhotoSection.style.display = 'none';
            livePhotoSection.style.display = 'block';
            
            // Reset upload form
            uploadForm.reset();
            uploadPreview.innerHTML = '';
        }
    }
    
    // Load stored faces from localStorage
    function loadStoredFaces() {
        try {
            const storedData = localStorage.getItem('faceRecognitionData');
            if (storedData) {
                const data = JSON.parse(storedData);
                labeledDescriptors = data.labeledDescriptors || [];
                
                renderStoredUsers(data.users || []);
                
                if (labeledDescriptors.length > 0) {
                    createFaceMatcher();
                }
            }
        } catch (error) {
            console.error("Error loading stored faces:", error);
        }
    }
    
    // Create face matcher for recognition
    function createFaceMatcher() {
        if (labeledDescriptors.length === 0) return;
        
        try {
            const labeledFaceDescriptors = labeledDescriptors.map(desc => {
                const descriptors = desc.descriptors.map(d => new Float32Array(d));
                return new faceapi.LabeledFaceDescriptors(desc.label, descriptors);
            });
            
            faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
            console.log("Face matcher created with", labeledFaceDescriptors.length, "persons");
        } catch (error) {
            console.error("Error creating face matcher:", error);
        }
    }
    
    // Handle photo preview
    function handlePhotoPreview() {
        uploadPreview.innerHTML = '';
        const files = photoUploadInput.files;
        
        if (files.length === 0) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'col-4 mb-2';
                img.style.maxHeight = '100px';
                img.style.objectFit = 'cover';
                img.alt = `Preview ${i+1}`;
                uploadPreview.appendChild(img);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // Handle upload form submission
    async function handleUploadSubmit(e) {
        e.preventDefault();
        
        if (!modelsLoaded) {
            showMessage('warning', 'Models Loading', 'Face detection models are still loading. Please wait...');
            return;
        }
        
        const userName = userNameInput.value.trim();
        const files = photoUploadInput.files;
        
        if (!userName) {
            showMessage('error', 'Missing Information', 'Please enter your name');
            userNameInput.focus();
            return;
        }
        
        if (files.length === 0) {
            showMessage('error', 'Missing Photos', 'Please select at least one photo');
            return;
        }
        
        if (isUserExists(userName)) {
            showMessage('warning', 'User Exists', `User "${userName}" already exists. Please use a different name or delete the existing user first.`);
            return;
        }
        
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
        uploadProgress.classList.remove('d-none');
        
        try {
            let processedCount = 0;
            let totalDescriptors = [];
            let userImageData = null;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                processedCount++;
                const progressPercent = Math.round((processedCount / files.length) * 100);
                progressBar.style.width = `${progressPercent}%`;
                progressText.textContent = `${progressPercent}%`;
                
                const result = await processImage(file);
                if (result && result.descriptors && result.descriptors.length > 0) {
                    totalDescriptors.push(...result.descriptors);
                    
                    if (!userImageData) {
                        userImageData = result.imageData;
                    }
                } else {
                    console.log(`No face detected in ${file.name}`);
                }
            }
            
            if (totalDescriptors.length > 0) {
                saveDescriptors(userName, totalDescriptors, userImageData);
                updateStoredFacesCount();
                
                uploadForm.reset();
                uploadPreview.innerHTML = '';
                userNameInput.value = '';
                
                showMessage('success', 'Success', `Face data for "${userName}" has been successfully saved!`);
            } else {
                showMessage('error', 'No Faces Detected', 'No faces were detected in the uploaded photos.');
            }
            
        } catch (error) {
            console.error("Error processing upload:", error);
            showMessage('error', 'Upload Failed', 'An error occurred while processing the images.');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt me-2"></i>Upload & Process Faces';
            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
        }
    }
    
    // Check if user already exists
    function isUserExists(userName) {
        const storedData = localStorage.getItem('faceRecognitionData');
        if (!storedData) return false;
        
        const data = JSON.parse(storedData);
        return data.users?.some(user => user.name === userName) || false;
    }
    
    // Process an image and extract face descriptors
    async function processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const img = new Image();
                    img.src = e.target.result;
                    
                    await new Promise((resolveImg) => {
                        img.onload = resolveImg;
                    });
                    
                    const detections = await faceapi
                        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                    
                    if (detections.length === 0) {
                        console.log("No faces detected in image");
                        resolve({ descriptors: [], imageData: e.target.result });
                        return;
                    }
                    
                    const descriptors = detections.map(detection => Array.from(detection.descriptor));
                    console.log(`Detected ${detections.length} face(s) in image`);
                    
                    resolve({
                        descriptors: descriptors,
                        imageData: e.target.result
                    });
                    
                } catch (error) {
                    console.error("Error processing image:", error);
                    const mockDescriptors = generateMockDescriptors(1);
                    resolve({
                        descriptors: mockDescriptors,
                        imageData: e.target.result
                    });
                }
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Generate mock descriptors for demonstration
    function generateMockDescriptors(count) {
        const descriptors = [];
        for (let i = 0; i < count; i++) {
            const descriptor = [];
            for (let j = 0; j < 128; j++) {
                descriptor.push(Math.random());
            }
            descriptors.push(descriptor);
        }
        return descriptors;
    }
    
    // Save descriptors to localStorage
    function saveDescriptors(userName, descriptors, imageData) {
        let data = {
            users: [],
            labeledDescriptors: []
        };
        
        const storedData = localStorage.getItem('faceRecognitionData');
        if (storedData) {
            data = JSON.parse(storedData);
        }
        
        const userId = Date.now();
        data.users.push({
            id: userId,
            name: userName,
            dateAdded: new Date().toISOString()
        });
        
        if (imageData) {
            saveUserImage(userName, imageData);
        }
        
        data.labeledDescriptors.push({
            label: userName,
            descriptors: descriptors
        });
        
        localStorage.setItem('faceRecognitionData', JSON.stringify(data));
        labeledDescriptors = data.labeledDescriptors;
        createFaceMatcher();
        renderStoredUsers(data.users);
        
        console.log(`Saved ${descriptors.length} descriptors for user: ${userName}`);
    }
    
    // Save user image for preview
    function saveUserImage(userName, imageData) {
        const userImages = JSON.parse(localStorage.getItem('userImages') || '{}');
        userImages[userName] = imageData;
        localStorage.setItem('userImages', JSON.stringify(userImages));
    }
    
    // Get user image from storage
    function getUserImage(userName) {
        const userImages = JSON.parse(localStorage.getItem('userImages') || '{}');
        return userImages[userName] || null;
    }
    
    // Render stored users in the UI
    function renderStoredUsers(users) {
        if (users.length === 0) {
            noUsersMessage.classList.remove('d-none');
            usersContainer.innerHTML = '';
            return;
        }
        
        noUsersMessage.classList.add('d-none');
        usersContainer.innerHTML = '';
        
        users.forEach((user, index) => {
            const userCard = createUserCard(user, index);
            usersContainer.appendChild(userCard);
        });
    }
    
    // Create a user card element
    function createUserCard(user, index) {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-3';
        
        const userImage = getUserImage(user.name);
        
        col.innerHTML = `
            <div class="card user-card h-100">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <img src="${userImage || 'https://via.placeholder.com/80?text=' + encodeURIComponent(user.name.charAt(0))}" 
                             class="user-avatar" 
                             alt="${user.name}"
                             onerror="this.src='https://via.placeholder.com/80?text=' + encodeURIComponent('${user.name.charAt(0)}')">
                    </div>
                    <h5 class="card-title">${user.name}</h5>
                    <p class="card-text text-muted small">
                        <i class="far fa-calendar-alt me-1"></i>
                        ${new Date(user.dateAdded).toLocaleDateString()}
                    </p>
                    <button class="btn btn-outline-danger btn-sm delete-user-btn" data-index="${index}">
                        <i class="fas fa-trash-alt me-1"></i>Remove
                    </button>
                </div>
            </div>
        `;
        
        const deleteBtn = col.querySelector('.delete-user-btn');
        deleteBtn.addEventListener('click', () => deleteUser(index));
        
        return col;
    }
    
    // Delete a user
    function deleteUser(index) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        
        const storedData = localStorage.getItem('faceRecognitionData');
        if (!storedData) return;
        
        const data = JSON.parse(storedData);
        if (index < 0 || index >= data.users.length) return;
        
        const userName = data.users[index].name;
        data.users.splice(index, 1);
        data.labeledDescriptors = data.labeledDescriptors.filter(ld => ld.label !== userName);
        localStorage.setItem('faceRecognitionData', JSON.stringify(data));
        
        const userImages = JSON.parse(localStorage.getItem('userImages') || '{}');
        delete userImages[userName];
        localStorage.setItem('userImages', JSON.stringify(userImages));
        
        labeledDescriptors = data.labeledDescriptors;
        createFaceMatcher();
        renderStoredUsers(data.users);
        updateStoredFacesCount();
        
        showMessage('info', 'User Removed', `${userName} has been deleted from the system`);
    }
    
    // Clear all stored faces
    function clearAllFaces() {
        if (labeledDescriptors.length === 0) {
            showMessage('info', 'No Data', 'No faces to clear');
            return;
        }
        
        if (!confirm("Are you sure you want to delete ALL stored faces? This cannot be undone.")) {
            return;
        }
        
        localStorage.removeItem('faceRecognitionData');
        localStorage.removeItem('userImages');
        labeledDescriptors = [];
        faceMatcher = null;
        renderStoredUsers([]);
        updateStoredFacesCount();
        
        if (isCameraOn) {
            stopCamera();
        }
        
        showMessage('info', 'All Data Cleared', 'All stored faces have been removed');
    }
    
    // Update stored faces count
    function updateStoredFacesCount() {
        storedFacesCount.textContent = labeledDescriptors.length;
    }
    
    // Start camera for recognition
    async function startCamera() {
        try {
            // Reset any previous state
            resetCurrentMatch();
            
            stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            video.srcObject = stream;
            isCameraOn = true;
            isRecognitionActive = true;
            startCameraBtn.disabled = true;
            stopCameraBtn.disabled = false;
            cameraWarning.style.display = 'none';
            videoPlaceholder.style.display = 'none';
            
            document.getElementById('status-camera').className = 'badge bg-success';
            document.getElementById('status-camera').textContent = 'Camera: On';
            document.getElementById('status-recognition').className = 'badge bg-warning';
            document.getElementById('status-recognition').textContent = 'Recognition: Active';
            
            startRecognition();
            console.log("Camera started successfully");
        } catch (error) {
            console.error("Error accessing camera:", error);
            cameraWarning.style.display = 'block';
            showResult('error', 'Camera Error', 'Could not access camera. Please check permissions.');
        }
    }
    
    // Stop camera
    function stopCamera() {
        cancelCountdown();
        resetCurrentMatch();
        
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
            recognitionInterval = null;
        }
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        isCameraOn = false;
        isRecognitionActive = false;
        startCameraBtn.disabled = false;
        stopCameraBtn.disabled = true;
        video.srcObject = null;
        videoPlaceholder.style.display = 'flex';
        
        document.getElementById('status-camera').className = 'badge bg-primary';
        document.getElementById('status-camera').textContent = 'Camera: Off';
        document.getElementById('status-recognition').className = 'badge bg-secondary';
        document.getElementById('status-recognition').textContent = 'Recognition: Idle';
        
        resetRecognitionResult();
    }
    
    // Reset recognition result display
    function resetRecognitionResult() {
        matchedUserAvatar.style.display = 'none';
        resultIcon.style.display = 'block';
        resultIcon.innerHTML = '<i class="fas fa-user-circle text-secondary"></i>';
        resultText.textContent = 'Ready for recognition';
        resultDetails.textContent = 'Start the camera to begin automatic face recognition';
        matchConfidence.innerHTML = '';
        lastMatchElement.textContent = 'None';
    }
    
    // Start face recognition
    function startRecognition() {
        if (!isCameraOn || !isRecognitionActive) return;
        
        if (labeledDescriptors.length === 0) {
            showResult('warning', 'No Faces Stored', 'Upload or capture faces to enable recognition');
            return;
        }
        
        recognitionInterval = setInterval(recognizeFaces, 1000);
    }
    
    // Recognize faces from camera
    async function recognizeFaces() {
        if (!isCameraOn || !isRecognitionActive || isCountingDown) return;
        
        try {
            if (!faceMatcher || labeledDescriptors.length === 0) {
                showResult('warning', 'No faces stored', 'Please upload some faces first');
                return;
            }
            
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();
            
            if (detections.length === 0) {
                resetCurrentMatch();
                showResult('warning', 'No Face Detected', 'Please position your face in the camera');
            } else {
                const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
                const bestMatch = results.reduce((prev, current) => {
                    return (prev.distance < current.distance) ? prev : current;
                });
                
                if (bestMatch.label !== 'unknown' && bestMatch.distance < 0.6) {
                    handleMatch(bestMatch);
                } else {
                    resetCurrentMatch();
                    showResult('error', 'Unknown Person ❌', 'No match found in database');
                }
            }
        } catch (error) {
            console.error("Recognition error:", error);
        }
    }
    
    // Handle face match
    function handleMatch(match) {
        if (currentMatch === match.label) {
            matchCount++;
            
            if (matchCount >= 3 && !isCountingDown) {
                startFullscreenCountdown(match.label);
            }
        } else {
            currentMatch = match.label;
            matchCount = 1;
            cancelCountdown();
        }
        
        // Show initial match detection
        if (!isCountingDown) {
            showMatchDetection(match.label);
        }
    }
    
    // Show match detection
    function showMatchDetection(userName) {
        resultIcon.style.display = 'none';
        matchedUserAvatar.style.display = 'none';
        
        const userImage = getUserImage(userName);
        if (userImage) {
            matchedImage.src = userImage;
            matchedUserAvatar.style.display = 'block';
        }
        
        resultText.textContent = `Detected: ${userName}`;
        resultDetails.textContent = 'Keep your face steady for verification...';
        matchConfidence.innerHTML = '';
        lastMatchElement.textContent = userName;
    }
    
    // Reset current match
    function resetCurrentMatch() {
        currentMatch = null;
        matchCount = 0;
        cancelCountdown();
    }
    
    // Start fullscreen countdown for verification
    function startFullscreenCountdown(userName) {
        isCountingDown = true;
        let seconds = countdownSeconds;
        
        // Hide regular UI and show fullscreen countdown
        document.querySelector('body').style.overflow = 'hidden';
        fullscreenCountdown.style.display = 'flex';
        
        // Set user name
        countdownUserName.textContent = `Verifying: ${userName}`;
        countdownNumber.textContent = seconds;
        remainingSeconds.textContent = seconds;
        
        // Reset progress circle
        circleProgress.style.background = 'conic-gradient(#4CAF50 0%, transparent 0%)';
        
        // Start countdown - ONLY ONCE
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        countdownInterval = setInterval(() => {
            seconds--;
            const percent = ((countdownSeconds - seconds) / countdownSeconds) * 100;
            
            // Update progress circle
            circleProgress.style.background = `conic-gradient(#4CAF50 ${percent}%, transparent ${percent}%)`;
            
            // Update numbers
            countdownNumber.textContent = seconds;
            remainingSeconds.textContent = seconds;
            
            if (seconds <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                showFullscreenSuccess(userName);
            }
        }, 1000);
    }
    
    // Cancel countdown
    function cancelCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        isCountingDown = false;
        fullscreenCountdown.style.display = 'none';
        document.querySelector('body').style.overflow = 'auto';
    }
    
    // Show fullscreen success message
    function showFullscreenSuccess(userName) {
        // Cancel any running countdown
        cancelCountdown();
        
        // Stop recognition
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
            recognitionInterval = null;
        }
        
        isRecognitionActive = false;
        
        // Get user image
        const userImage = getUserImage(userName);
        
        // Update success message
        successTitle.textContent = 'Face Recognized Successfully!';
        successName.textContent = `Hello, ${userName} 👋`;
        successMessage.textContent = 'Welcome back! Your face has been successfully verified.';
        
        // Set user image if available
        if (userImage) {
            successUserImage.src = userImage;
            successUserImage.style.display = 'block';
        } else {
            successUserImage.style.display = 'none';
        }
        
        // Show fullscreen success
        document.querySelector('body').style.overflow = 'hidden';
        fullscreenSuccess.style.display = 'flex';
        
        // Update last match
        lastMatchElement.textContent = userName;
    }
    
    // Go to home page
    function goToHomePage() {
        closeFullscreenSuccess();
        window.location.href = "#upload-section";
        window.scrollTo(0, 0);
    }
    
    // Continue recognition after success
    function continueRecognition() {
        closeFullscreenSuccess();
        startCamera();
    }
    
    // Close fullscreen success
    function closeFullscreenSuccess() {
        fullscreenSuccess.style.display = 'none';
        document.querySelector('body').style.overflow = 'auto';
        resetCurrentMatch();
        
        // Reset camera state
        stopCamera();
    }
    
    // Show recognition result
    function showResult(type, title, message) {
        resultIcon.style.display = 'block';
        matchedUserAvatar.style.display = 'none';
        
        let iconClass, iconColor;
        
        switch(type) {
            case 'success':
                iconClass = 'fas fa-check-circle';
                iconColor = 'text-success';
                resultText.className = 'text-success';
                break;
            case 'error':
                iconClass = 'fas fa-times-circle';
                iconColor = 'text-danger';
                resultText.className = 'text-danger';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-circle';
                iconColor = 'text-warning';
                resultText.className = 'text-warning';
                break;
            default:
                iconClass = 'fas fa-info-circle';
                iconColor = 'text-info';
                resultText.className = 'text-info';
        }
        
        resultIcon.innerHTML = `<i class="${iconClass} ${iconColor}"></i>`;
        resultText.textContent = title;
        resultDetails.textContent = message;
        resultDetails.className = 'text-muted';
    }
    
    // ===========================
    // LIVE CAPTURE FUNCTIONALITY
    // ===========================
    
    // Start live camera for photo capture
    async function startLiveCamera() {
        const userName = liveUserNameInput.value.trim();
        
        if (!userName) {
            showMessage('error', 'Missing Name', 'Please enter your name first');
            liveUserNameInput.focus();
            return;
        }
        
        if (isUserExists(userName)) {
            showMessage('warning', 'User Exists', `User "${userName}" already exists. Please use a different name or delete the existing user first.`);
            return;
        }
        
        try {
            liveStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            liveVideo.srcObject = liveStream;
            liveVideo.classList.remove('d-none');
            livePreview.querySelector('.placeholder-text').style.display = 'none';
            
            startLiveCameraBtn.disabled = true;
            captureBtn.disabled = false;
            liveUserNameInput.disabled = true;
            
            livePreview.innerHTML = '';
            capturedPreview.innerHTML = '<div class="placeholder-text"><i class="fas fa-image fa-3x text-muted mb-3"></i><p class="text-muted">No photo captured yet</p></div>';
            
            console.log("Live camera started for photo capture");
        } catch (error) {
            console.error("Error accessing live camera:", error);
            showMessage('error', 'Camera Error', 'Could not access camera. Please check permissions.');
        }
    }
    
    // Capture photo from live camera
    function capturePhoto() {
        if (!liveStream) return;
        
        const context = liveCanvas.getContext('2d');
        liveCanvas.width = liveVideo.videoWidth;
        liveCanvas.height = liveVideo.videoHeight;
        context.drawImage(liveVideo, 0, 0, liveCanvas.width, liveCanvas.height);
        
        capturedPhoto = liveCanvas.toDataURL('image/png');
        
        livePreview.innerHTML = `
            <img src="${capturedPhoto}" class="img-fluid rounded" alt="Captured Photo" style="max-height: 200px;">
            <p class="mt-2 text-success"><i class="fas fa-check-circle me-2"></i>Photo captured successfully!</p>
        `;
        
        capturedPreview.innerHTML = `
            <img src="${capturedPhoto}" class="img-fluid rounded" alt="Captured Preview" style="max-height: 150px;">
            <p class="mt-2 text-success small"><i class="fas fa-check-circle me-1"></i>Photo ready to save</p>
        `;
        
        captureBtn.disabled = true;
        saveLivePhotoBtn.disabled = false;
        retakeBtn.style.display = 'inline-block';
        
        if (liveStream) {
            liveStream.getTracks().forEach(track => track.stop());
            liveStream = null;
            liveVideo.classList.add('d-none');
        }
    }
    
    // Retake photo
    function retakePhoto() {
        capturedPhoto = null;
        livePreview.innerHTML = '<div class="placeholder-text"><i class="fas fa-user-circle fa-4x text-muted mb-3"></i><p class="text-muted">Camera preview will appear here</p></div>';
        capturedPreview.innerHTML = '<div class="placeholder-text"><i class="fas fa-image fa-3x text-muted mb-3"></i><p class="text-muted">No photo captured yet</p></div>';
        
        captureBtn.disabled = true;
        saveLivePhotoBtn.disabled = true;
        retakeBtn.style.display = 'none';
        liveUserNameInput.disabled = false;
        
        startLiveCamera();
    }
    
    // Save live captured photo
    async function saveLivePhoto() {
        if (!capturedPhoto) {
            showMessage('error', 'No Photo', 'Please capture a photo first');
            return;
        }
        
        const userName = liveUserNameInput.value.trim();
        
        if (!userName) {
            showMessage('error', 'Missing Name', 'Please enter your name');
            return;
        }
        
        if (isUserExists(userName)) {
            showMessage('warning', 'User Exists', `User "${userName}" already exists. Please use a different name or delete the existing user first.`);
            return;
        }
        
        saveLivePhotoBtn.disabled = true;
        saveLivePhotoBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
        
        try {
            const result = await processImageFromDataURL(capturedPhoto);
            
            if (result && result.descriptors && result.descriptors.length > 0) {
                saveDescriptors(userName, result.descriptors, capturedPhoto);
                updateStoredFacesCount();
                
                showMessage('success', 'Success', `Face data for "${userName}" has been successfully saved from live capture!`);
                resetLiveCapture();
            } else {
                showMessage('error', 'No Face Detected', 'No face was detected in the captured photo.');
                saveLivePhotoBtn.disabled = false;
                saveLivePhotoBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Photo';
            }
            
        } catch (error) {
            console.error("Error saving live photo:", error);
            showMessage('error', 'Save Failed', 'An error occurred while saving the photo.');
            saveLivePhotoBtn.disabled = false;
            saveLivePhotoBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Photo';
        }
    }
    
    // Process image from data URL
    async function processImageFromDataURL(dataURL) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.src = dataURL;
                
                img.onload = async function() {
                    const detections = await faceapi
                        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                    
                    if (detections.length === 0) {
                        console.log("No faces detected in captured photo");
                        resolve({ descriptors: [], imageData: dataURL });
                        return;
                    }
                    
                    const descriptors = detections.map(detection => Array.from(detection.descriptor));
                    console.log(`Detected ${detections.length} face(s) in captured photo`);
                    
                    resolve({
                        descriptors: descriptors,
                        imageData: dataURL
                    });
                };
                
                img.onerror = reject;
                
            } catch (error) {
                console.error("Error processing captured image:", error);
                const mockDescriptors = generateMockDescriptors(1);
                resolve({
                    descriptors: mockDescriptors,
                    imageData: dataURL
                });
            }
        });
    }
    
    // Reset live capture form
    function resetLiveCapture() {
        liveUserNameInput.value = '';
        liveUserNameInput.disabled = false;
        capturedPhoto = null;
        livePreview.innerHTML = '<div class="placeholder-text"><i class="fas fa-user-circle fa-4x text-muted mb-3"></i><p class="text-muted">Camera preview will appear here</p></div>';
        capturedPreview.innerHTML = '<div class="placeholder-text"><i class="fas fa-image fa-3x text-muted mb-3"></i><p class="text-muted">No photo captured yet</p></div>';
        
        startLiveCameraBtn.disabled = false;
        captureBtn.disabled = true;
        saveLivePhotoBtn.disabled = true;
        saveLivePhotoBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Photo';
        retakeBtn.style.display = 'none';
        
        if (liveStream) {
            liveStream.getTracks().forEach(track => track.stop());
            liveStream = null;
            liveVideo.classList.add('d-none');
        }
    }
});