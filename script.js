// MomCare JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Remove active class from all tabs and buttons
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.hidden = true;
            });
            
            // Add active class to clicked button and corresponding tab
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.hidden = false;
            }
        });
    });
    
    // Pregnancy setup
    const saveBtn = document.querySelector('.save-btn');
    const setupSection = document.getElementById('setupSection');
    const pregnancyInfo = document.getElementById('pregnancyInfo');
    
    // Input sanitization function
    function sanitizeInput(input) {
        return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                   .replace(/<[^>]*>/g, '')
                   .trim();
    }
    
    // Validation functions
    function validateName(name) {
        const namePattern = /^[a-zA-Z]+$/;
        return name && name.length >= 2 && name.length <= 30 && namePattern.test(name);
    }
    
    function validateDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 1);
        return selectedDate >= today && selectedDate <= maxDate;
    }
    
    function validateWeight(weight) {
        return weight && weight >= 30 && weight <= 200;
    }
    
    function validateBloodPressure(bp) {
        return bp && /^[0-9]{2,3}\/[0-9]{2,3}$/.test(bp);
    }
    
    function validateWeek(week) {
        return week && week >= 1 && week <= 42;
    }
    
    function showError(element, message) {
        element.style.borderColor = '#dc3545';
        let errorDiv = element.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '0.25rem';
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }
        errorDiv.textContent = message;
    }
    
    function clearError(element) {
        element.style.borderColor = '';
        const errorDiv = element.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.remove();
        }
    }
    
    saveBtn?.addEventListener('click', function() {
        const dueDateInput = document.getElementById('dueDate');
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        
        const dueDate = dueDateInput.value;
        const firstName = sanitizeInput(firstNameInput.value);
        const lastName = sanitizeInput(lastNameInput.value);
        
        let isValid = true;
        
        if (!dueDate || !validateDate(dueDate)) {
            showError(dueDateInput, 'Please select a valid future date');
            isValid = false;
        } else {
            clearError(dueDateInput);
        }
        
        if (!validateName(firstName)) {
            showError(firstNameInput, 'First name: 2-30 letters only');
            isValid = false;
        } else {
            clearError(firstNameInput);
        }
        
        if (!validateName(lastName)) {
            showError(lastNameInput, 'Last name: 2-30 letters only');
            isValid = false;
        } else {
            clearError(lastNameInput);
        }
        
        if (isValid) {
            const fullName = `${firstName} ${lastName}`;
            localStorage.setItem('dueDate', dueDate);
            localStorage.setItem('motherName', fullName);
            updatePregnancyInfo();
            setupSection.hidden = true;
            pregnancyInfo.hidden = false;
        }
    });
    
    // Calculate pregnancy week and days
    function calculatePregnancy(dueDate) {
        const due = new Date(dueDate);
        const today = new Date();
        const pregnancyStart = new Date(due.getTime() - (280 * 24 * 60 * 60 * 1000)); // 40 weeks before due date
        const daysSinceStart = Math.floor((today - pregnancyStart) / (24 * 60 * 60 * 1000));
        const week = Math.floor(daysSinceStart / 7) + 1;
        const daysLeft = Math.ceil((due - today) / (24 * 60 * 60 * 1000));
        
        return { week: Math.max(1, Math.min(42, week)), daysLeft, trimester: getTrimester(week) };
    }
    
    function getTrimester(week) {
        if (week <= 12) return '1st';
        if (week <= 27) return '2nd';
        return '3rd';
    }
    
    function updatePregnancyInfo() {
        const dueDate = localStorage.getItem('dueDate');
        const motherName = localStorage.getItem('motherName');
        
        if (dueDate && motherName) {
            const pregnancy = calculatePregnancy(dueDate);
            
            // Update header status
            document.getElementById('currentWeek').textContent = `Week ${pregnancy.week}`;
            document.getElementById('currentTrimester').textContent = `${pregnancy.trimester} Trimester`;
            document.getElementById('daysLeft').textContent = `${pregnancy.daysLeft} days to go`;
            
            // Update dashboard
            document.getElementById('welcomeName').textContent = `Hello, ${motherName}!`;
            document.getElementById('dashboardWeek').textContent = pregnancy.week;
            document.getElementById('dashboardTrimester').textContent = pregnancy.trimester;
            document.getElementById('dashboardDueDate').textContent = new Date(dueDate).toLocaleDateString();
            document.getElementById('dashboardDaysLeft').textContent = pregnancy.daysLeft;
            
            // Update milestone and baby size
            updateMilestone(pregnancy.week);
            updateBabySize(pregnancy.week);
            
            // Store current week for other features
            localStorage.setItem('currentWeek', pregnancy.week);
            
            setupSection.hidden = true;
            pregnancyInfo.hidden = false;
        }
    }
    
    function updateMilestone(week) {
        const milestones = {
            1: '🌱 Conception and implantation',
            4: '💗 Heart begins to beat',
            8: '👶 Baby is now called a fetus',
            12: '🎉 End of first trimester',
            16: '👂 Baby can hear sounds',
            20: '🔍 Anatomy scan time',
            24: '👀 Eyes can open and close',
            28: '🧠 Brain development accelerates',
            32: '🫁 Lungs are maturing',
            36: '📅 Baby is considered full-term soon',
            40: '🎊 Due date is here!'
        };
        
        const milestoneWeeks = Object.keys(milestones).map(Number).sort((a, b) => a - b);
        const currentMilestone = milestoneWeeks.find(w => week <= w) || 40;
        
        document.getElementById('currentMilestone').innerHTML = `
            <h4>Week ${currentMilestone}</h4>
            <p>${milestones[currentMilestone]}</p>
        `;
    }
    
    // Health tracking form
    const healthForm = document.getElementById('healthTrackingForm');
    const trackingDate = document.getElementById('trackingDate');
    const moodRating = document.getElementById('moodRating');
    const moodValue = document.getElementById('moodValue');
    
    // Update mood value display
    moodRating?.addEventListener('input', function() {
        moodValue.textContent = this.value;
    });
    
    trackingDate?.addEventListener('change', function() {
        const dueDate = localStorage.getItem('dueDate');
        if (dueDate) {
            const selectedDate = new Date(this.value);
            const due = new Date(dueDate);
            const pregnancyStart = new Date(due.getTime() - (280 * 24 * 60 * 60 * 1000));
            const daysSinceStart = Math.floor((selectedDate - pregnancyStart) / (24 * 60 * 60 * 1000));
            const week = Math.max(1, Math.min(42, Math.floor(daysSinceStart / 7) + 1));
            document.getElementById('pregnancyWeek').value = week;
        }
    });
    
    healthForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const trackingDateInput = this.querySelector('#trackingDate');
        const pregnancyWeekInput = this.querySelector('#pregnancyWeek');
        const currentWeightInput = this.querySelector('#currentWeight');
        const bloodPressureInput = this.querySelector('#bloodPressure');
        const healthNotesInput = this.querySelector('#healthNotes');
        
        let isValid = true;
        
        // Validate required fields
        if (!trackingDateInput.value) {
            showError(trackingDateInput, 'Date is required');
            isValid = false;
        } else {
            clearError(trackingDateInput);
        }
        
        if (!validateWeek(parseInt(pregnancyWeekInput.value))) {
            showError(pregnancyWeekInput, 'Week must be between 1-42');
            isValid = false;
        } else {
            clearError(pregnancyWeekInput);
        }
        
        if (!validateWeight(parseFloat(currentWeightInput.value))) {
            showError(currentWeightInput, 'Weight must be between 30-200 kg');
            isValid = false;
        } else {
            clearError(currentWeightInput);
        }
        
        if (!validateBloodPressure(bloodPressureInput.value)) {
            showError(bloodPressureInput, 'Format: 120/80');
            isValid = false;
        } else {
            clearError(bloodPressureInput);
        }
        
        if (!isValid) return;
        
        const formData = new FormData(this);
        const trackingData = Object.fromEntries(formData);
        
        // Sanitize text inputs
        trackingData.healthNotes = sanitizeInput(trackingData.healthNotes || '');
        
        // Get selected symptoms
        const symptoms = Array.from(this.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);
        trackingData.symptoms = symptoms;
        
        // Save to localStorage with encryption-like encoding
        const existingData = JSON.parse(localStorage.getItem('healthTracking') || '[]');
        const encryptedData = btoa(JSON.stringify({ ...trackingData, timestamp: new Date().toISOString() }));
        existingData.push(encryptedData);
        localStorage.setItem('healthTracking', JSON.stringify(existingData));
        
        // Update stats and recent activity
        updateStats();
        updateRecentActivity();
        
        // Show success message
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✅ Saved!';
        submitBtn.style.background = '#28a745';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 2000);
        
        this.reset();
        moodValue.textContent = '7';
        moodRating.value = '7';
    });
    
    function updateRecentActivity() {
        const healthData = JSON.parse(localStorage.getItem('healthTracking') || '[]');
        const recentActivity = document.getElementById('recentActivity');
        
        if (healthData.length === 0) {
            recentActivity.innerHTML = '<p>No recent activity. Start tracking your health!</p>';
            return;
        }
        
        const recent = healthData.slice(-3).reverse().map(encryptedEntry => {
            try {
                return JSON.parse(atob(encryptedEntry));
            } catch {
                return encryptedEntry; // Fallback for old unencrypted data
            }
        });
        
        recentActivity.innerHTML = recent.map(entry => `
            <div style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <strong>${new Date(entry.timestamp).toLocaleDateString()}</strong>
                ${entry.currentWeight ? `- Weight: ${entry.currentWeight}kg` : ''}
                ${entry.bloodPressure ? `- BP: ${entry.bloodPressure}` : ''}
            </div>
        `).join('');
    }
    
    function updateStats() {
        const healthData = JSON.parse(localStorage.getItem('healthTracking') || '[]');
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        document.getElementById('totalCheckups').textContent = healthData.length;
        
        if (healthData.length > 0) {
            try {
                const lastEntry = JSON.parse(atob(healthData[healthData.length - 1]));
                document.getElementById('lastWeight').textContent = lastEntry.currentWeight || '--';
            } catch {
                // Fallback for old unencrypted data
                const lastEntry = healthData[healthData.length - 1];
                document.getElementById('lastWeight').textContent = lastEntry.currentWeight || '--';
            }
        }
        
        // Find next appointment
        const today = new Date();
        const upcomingAppts = appointments.filter(apt => new Date(apt.appointmentDate) >= today)
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        
        if (upcomingAppts.length > 0) {
            const nextApt = new Date(upcomingAppts[0].appointmentDate);
            const daysUntil = Math.ceil((nextApt - today) / (24 * 60 * 60 * 1000));
            document.getElementById('nextAppointment').textContent = daysUntil === 0 ? 'Today' : `${daysUntil} days`;
        } else {
            document.getElementById('nextAppointment').textContent = '--';
        }
    }
    
    // Trimester tabs functionality
    const trimesterBtns = document.querySelectorAll('.trimester-btn');
    const trimesterContents = document.querySelectorAll('.trimester-content');
    
    trimesterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTrimester = btn.dataset.trimester;
            
            trimesterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            trimesterContents.forEach(content => {
                content.classList.remove('active');
                content.hidden = true;
            });
            
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const targetContent = document.getElementById(`${targetTrimester}-trimester`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.hidden = false;
            }
        });
    });
    
    // Community post functionality
    const postBtn = document.querySelector('.post-btn');
    const newPostTextarea = document.getElementById('newPost');
    const communityPosts = document.getElementById('communityPosts');
    
    postBtn?.addEventListener('click', function() {
        const postText = sanitizeInput(newPostTextarea.value.trim());
        
        if (postText.length < 10) {
            showError(newPostTextarea, 'Post must be at least 10 characters');
            return;
        }
        
        if (postText.length > 1000) {
            showError(newPostTextarea, 'Post must be less than 1000 characters');
            return;
        }
        
        clearError(newPostTextarea);
        
        const postElement = document.createElement('div');
        postElement.className = 'community-post';
        postElement.innerHTML = `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                <p><strong>You:</strong> ${postText}</p>
                <small style="color: #666;">${new Date().toLocaleString()}</small>
            </div>
        `;
        communityPosts.insertBefore(postElement, communityPosts.firstChild);
        newPostTextarea.value = '';
    });
    
    // Appointment form functionality
    const appointmentForm = document.getElementById('appointmentForm');
    appointmentForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const doctorNameInput = this.querySelector('#doctorName');
        const appointmentDateInput = this.querySelector('#appointmentDate');
        const appointmentTimeInput = this.querySelector('#appointmentTime');
        const appointmentTypeInput = this.querySelector('#appointmentType');
        
        let isValid = true;
        
        if (!validateName(doctorNameInput.value)) {
            showError(doctorNameInput, 'Doctor name is required (2-100 characters)');
            isValid = false;
        } else {
            clearError(doctorNameInput);
        }
        
        if (!appointmentDateInput.value) {
            showError(appointmentDateInput, 'Date is required');
            isValid = false;
        } else {
            clearError(appointmentDateInput);
        }
        
        if (!appointmentTimeInput.value) {
            showError(appointmentTimeInput, 'Time is required');
            isValid = false;
        } else {
            clearError(appointmentTimeInput);
        }
        
        if (!appointmentTypeInput.value) {
            showError(appointmentTypeInput, 'Appointment type is required');
            isValid = false;
        } else {
            clearError(appointmentTypeInput);
        }
        
        if (!isValid) return;
        
        const formData = new FormData(this);
        const appointmentData = Object.fromEntries(formData);
        
        // Sanitize inputs
        appointmentData.doctorName = sanitizeInput(appointmentData.doctorName);
        appointmentData.appointmentLocation = sanitizeInput(appointmentData.appointmentLocation || '');
        appointmentData.appointmentNotes = sanitizeInput(appointmentData.appointmentNotes || '');
        
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push({ ...appointmentData, id: Date.now() });
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        updateAppointmentsList();
        this.reset();
    });
    
    function updateAppointmentsList() {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const appointmentsList = document.getElementById('appointmentsList');
        
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>No appointments scheduled. Add your first appointment above!</p>';
            return;
        }
        
        appointmentsList.innerHTML = appointments.map(apt => `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                <h4>${apt.appointmentType || 'Appointment'}</h4>
                <p><strong>Date:</strong> ${apt.appointmentDate} at ${apt.appointmentTime}</p>
                <p><strong>Doctor:</strong> ${apt.doctorName}</p>
                ${apt.appointmentLocation ? `<p><strong>Location:</strong> ${apt.appointmentLocation}</p>` : ''}
            </div>
        `).join('');
    }
    
    // Initialize app
    function init() {
        const dueDate = localStorage.getItem('dueDate');
        const motherName = localStorage.getItem('motherName');
        
        if (dueDate && motherName) {
            updatePregnancyInfo();
        }
        
        updateStats();
        updateAppointmentsList();
        
        // Set today's date as default
        if (trackingDate) {
            trackingDate.value = new Date().toISOString().split('T')[0];
            trackingDate.dispatchEvent(new Event('change'));
        }
        
        // Set minimum date for due date (today)
        const dueDateInput = document.getElementById('dueDate');
        if (dueDateInput) {
            dueDateInput.min = new Date().toISOString().split('T')[0];
        }
        
        // Set minimum date for appointment date (today)
        const appointmentDateInput = document.getElementById('appointmentDate');
        if (appointmentDateInput) {
            appointmentDateInput.min = new Date().toISOString().split('T')[0];
        }
    }
    
    // Dark mode toggle
    document.getElementById('darkModeToggle')?.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    // Font size toggle
    document.getElementById('fontSizeToggle')?.addEventListener('click', function() {
        const currentSize = document.documentElement.getAttribute('data-font-size') || 'normal';
        const sizes = ['normal', 'large', 'xlarge'];
        const currentIndex = sizes.indexOf(currentSize);
        const newSize = sizes[(currentIndex + 1) % sizes.length];
        document.documentElement.setAttribute('data-font-size', newSize);
        localStorage.setItem('fontSize', newSize);
    });
    
    // Export data
    document.getElementById('exportData')?.addEventListener('click', function() {
        const data = {
            profile: {
                name: localStorage.getItem('motherName'),
                dueDate: localStorage.getItem('dueDate')
            },
            healthTracking: JSON.parse(localStorage.getItem('healthTracking') || '[]'),
            appointments: JSON.parse(localStorage.getItem('appointments') || '[]'),
            kicks: JSON.parse(localStorage.getItem('kicks') || '[]'),
            photos: JSON.parse(localStorage.getItem('photos') || '[]')
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `momcare-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    // Baby size updates
    function updateBabySize(week) {
        const sizes = {
            4: 'poppy seed 🌱',
            8: 'raspberry 🫐',
            12: 'lime 🟢',
            16: 'avocado 🥑',
            20: 'banana 🍌',
            24: 'corn 🌽',
            28: 'eggplant 🍆',
            32: 'pineapple 🍍',
            36: 'watermelon 🍉',
            40: 'pumpkin 🎃'
        };
        
        const sizeWeeks = Object.keys(sizes).map(Number).sort((a, b) => a - b);
        const currentSize = sizeWeeks.find(w => week <= w) || 40;
        
        document.getElementById('babySize').innerHTML = `👶 Baby is the size of a ${sizes[currentSize]}`;
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Add smooth scrolling for better UX
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    });
    
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const darkModeBtn = document.getElementById('darkModeToggle');
        if (darkModeBtn) darkModeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.setAttribute('data-font-size', savedFontSize);
    }
    
    init();
});

// Modal functions
function openKickCounter() {
    document.getElementById('kickCounterModal').style.display = 'block';
    loadKickData();
}

function openContractionTimer() {
    document.getElementById('contractionModal').style.display = 'block';
}

function openPhotoJournal() {
    document.getElementById('photoModal').style.display = 'block';
    loadPhotos();
}

function openSleepTracker() {
    document.getElementById('sleepModal').style.display = 'block';
    initSleepTracker();
}

function openNutritionLog() {
    document.getElementById('nutritionModal').style.display = 'block';
    loadMeals();
}

function openRiskAssessment() {
    document.getElementById('riskModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Kick counter functions
let kickCount = 0;
let kickStartTime = null;

function addKick() {
    if (!kickStartTime) kickStartTime = new Date();
    kickCount++;
    document.getElementById('kickCount').textContent = kickCount;
    
    const progress = Math.min((kickCount / 10) * 100, 100);
    document.getElementById('kickProgress').style.width = progress + '%';
    
    const kicks = JSON.parse(localStorage.getItem('kicks') || '[]');
    kicks.push({ time: new Date().toISOString(), count: kickCount });
    localStorage.setItem('kicks', JSON.stringify(kicks));
    
    if (kickCount >= 10) {
        showNotification('Great! You\'ve reached 10 kicks! 👶', 'success');
    }
}

function resetKicks() {
    kickCount = 0;
    kickStartTime = null;
    document.getElementById('kickCount').textContent = '0';
    document.getElementById('kickProgress').style.width = '0%';
}

function loadKickData() {
    const kicks = JSON.parse(localStorage.getItem('kicks') || '[]');
    const today = new Date().toDateString();
    const todayKicks = kicks.filter(k => new Date(k.time).toDateString() === today);
    kickCount = todayKicks.length;
    document.getElementById('kickCount').textContent = kickCount;
    const progress = Math.min((kickCount / 10) * 100, 100);
    document.getElementById('kickProgress').style.width = progress + '%';
}

// Contraction timer functions
let contractionStart = null;
let contractionInterval = null;
let contractions = [];

function toggleContraction() {
    const btn = document.getElementById('contractionBtn');
    const timer = document.getElementById('contractionTimer');
    
    if (!contractionStart) {
        contractionStart = new Date();
        btn.textContent = 'Stop';
        contractionInterval = setInterval(() => {
            const elapsed = new Date() - contractionStart;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    } else {
        clearInterval(contractionInterval);
        const duration = new Date() - contractionStart;
        contractions.push({ start: contractionStart, duration });
        updateContractionLog();
        contractionStart = null;
        btn.textContent = 'Start';
        timer.textContent = '00:00';
    }
}

function updateContractionLog() {
    const log = document.getElementById('contractionLog');
    log.innerHTML = '<h4>Recent Contractions:</h4>' + 
        contractions.slice(-5).map(c => 
            `<p>${new Date(c.start).toLocaleTimeString()} - ${Math.floor(c.duration/1000)}s</p>`
        ).join('');
}

// Photo journal functions
function addPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photos = JSON.parse(localStorage.getItem('photos') || '[]');
            photos.push({ 
                data: e.target.result, 
                date: new Date().toISOString(),
                week: localStorage.getItem('currentWeek') || 'Unknown'
            });
            localStorage.setItem('photos', JSON.stringify(photos));
            loadPhotos();
        };
        reader.readAsDataURL(file);
    }
}

function loadPhotos() {
    const photos = JSON.parse(localStorage.getItem('photos') || '[]');
    const gallery = document.getElementById('photoGallery');
    gallery.innerHTML = photos.map((photo, index) => 
        `<div class="photo-item">
            <img src="${photo.data}" alt="Week ${photo.week}">
            <p>Week ${photo.week}</p>
        </div>`
    ).join('');
}

// Sleep tracker functions
function initSleepTracker() {
    const tracker = document.getElementById('sleepTracker');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    tracker.innerHTML = days.map(day => 
        `<div class="sleep-day" onclick="toggleSleep(this, '${day}')">${day}</div>`
    ).join('');
}

function toggleSleep(element, day) {
    const classes = ['', 'poor', 'good'];
    const current = element.className.split(' ').find(c => classes.includes(c)) || '';
    const currentIndex = classes.indexOf(current);
    const newClass = classes[(currentIndex + 1) % classes.length];
    
    element.className = `sleep-day ${newClass}`;
    
    const sleepData = JSON.parse(localStorage.getItem('sleepData') || '{}');
    sleepData[day] = newClass;
    localStorage.setItem('sleepData', JSON.stringify(sleepData));
}

// Nutrition functions
function addMeal() {
    const input = document.getElementById('mealInput');
    const meal = input.value.trim();
    if (meal) {
        const meals = JSON.parse(localStorage.getItem('meals') || '[]');
        meals.push({ meal, time: new Date().toISOString() });
        localStorage.setItem('meals', JSON.stringify(meals));
        input.value = '';
        loadMeals();
    }
}

function loadMeals() {
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const today = new Date().toDateString();
    const todayMeals = meals.filter(m => new Date(m.time).toDateString() === today);
    
    document.getElementById('mealList').innerHTML = todayMeals.map(m => 
        `<p>🍽️ ${m.meal} - ${new Date(m.time).toLocaleTimeString()}</p>`
    ).join('');
}

// Risk assessment
function assessRisk() {
    const headache = document.getElementById('headache').value;
    const vision = document.getElementById('vision').value;
    const swelling = document.getElementById('swelling').value;
    
    let riskLevel = 'low';
    let message = 'Your symptoms appear normal. Continue regular monitoring.';
    
    if (headache === 'yes' || vision === 'yes' || swelling === 'yes') {
        riskLevel = 'high';
        message = '⚠️ URGENT: Contact your healthcare provider immediately. These symptoms may indicate pre-eclampsia.';
    }
    
    document.getElementById('riskResult').innerHTML = 
        `<div class="risk-indicator risk-${riskLevel}">${message}</div>`;
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});