// MomCare JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Always show sign-in modal on page load
    document.getElementById('signInModal').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Authentication functions
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    signInForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signInUsername').value.trim();
        const password = document.getElementById('signInPassword').value;
        
        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('momcare_users') || '{}');
        const userAccount = Object.values(users).find(user => user.username === username);
        
        if (!userAccount) {
            alert('User does not exist. Please sign up first.');
            return;
        }
        
        if (atob(userAccount.password) !== password) {
            alert('Incorrect password');
            return;
        }
        
        clearAllForms();
        localStorage.setItem('userSignedIn', 'true');
        localStorage.setItem('currentUser', username);
        document.getElementById('signInModal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        loadUserData(username);
        
        // Check if profile is complete and redirect accordingly
        if (!isProfileComplete()) {
            showProfileTab();
            alert(`Welcome back, ${userAccount.firstName}! Please complete your profile to access all features.`);
        } else {
            alert(`Welcome back, ${userAccount.firstName}!`);
        }
    });
    
    signUpForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('signUpFirstName').value.trim();
        const lastName = document.getElementById('signUpLastName').value.trim();
        const username = document.getElementById('signUpUsername').value.trim();
        const countryCode = document.getElementById('countryCode').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const birthDay = document.getElementById('birthDay').value;
        const birthMonth = document.getElementById('birthMonth').value;
        const birthYear = document.getElementById('birthYear').value;
        const dateOfBirth = birthDay && birthMonth && birthYear ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}` : '';
        
        // Basic validation
        if (!firstName || !lastName || !username || !countryCode || !phoneNumber || !password || !dateOfBirth) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            alert('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)');
            return;
        }
        
        if (username.length < 3 || username.length > 20) {
            alert('Username must be 3-20 characters');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('momcare_users') || '{}');
        
        // Check if username exists
        const existingUser = Object.values(users).find(user => user.username === username);
        if (existingUser) {
            alert('Username already exists');
            return;
        }
        
        const phoneKey = countryCode + phoneNumber;
        const fullName = `${firstName} ${lastName}`;
        
        users[phoneKey] = {
            name: fullName,
            firstName: firstName,
            lastName: lastName,
            username: username,
            phone: phoneKey,
            password: btoa(password),
            dateOfBirth: dateOfBirth,
            created: new Date().toISOString()
        };
        
        localStorage.setItem('momcare_users', JSON.stringify(users));
        
        alert(`Account created successfully! Please sign in with your username and password.`);
        
        // Clear the sign-up form
        document.getElementById('signUpForm').reset();
        
        // Redirect to sign-in page
        document.getElementById('signUpModal').style.display = 'none';
        document.getElementById('signInModal').style.display = 'flex';
    });
    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Check if profile is complete before allowing access to other tabs
            if (targetTab !== 'profile' && !isProfileComplete()) {
                alert('Please complete your profile first before accessing other features.');
                // Force redirect to profile tab
                showProfileTab();
                return;
            }
            
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
    
    function validateBirthDate(date) {
        if (!date) return false;
        const birthDate = new Date(date);
        const today = new Date();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return birthDate < today && age >= 9 && age <= 60;
    }
    
    saveBtn?.addEventListener('click', function() {
        const dueDateInput = document.getElementById('dueDate');
        const dueDate = dueDateInput.value;
        
        let isValid = true;
        
        if (!dueDate || !validateDate(dueDate)) {
            showError(dueDateInput, 'Please select a valid future date');
            isValid = false;
        } else {
            clearError(dueDateInput);
        }
        
        if (isValid) {
            const currentUser = localStorage.getItem('currentUser');
            const userKey = `user_${currentUser}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            const users = JSON.parse(localStorage.getItem('momcare_users') || '{}');
            
            // Get name from sign-up data
            const userSignUpData = Object.values(users).find(user => user.username === currentUser);
            const fullName = userSignUpData ? userSignUpData.name : currentUser;
            
            userData.motherName = fullName;
            userData.dueDate = dueDate;
            localStorage.setItem(userKey, JSON.stringify(userData));
            localStorage.setItem('motherName', fullName);
            localStorage.setItem('dueDate', dueDate);
            updatePregnancyInfo();
            setupSection.hidden = true;
            pregnancyInfo.hidden = false;
        }
    });
    
    // Calculate pregnancy week and days (extends to 5 years post-birth)
    function calculatePregnancy(dueDate) {
        const due = new Date(dueDate);
        const today = new Date();
        const pregnancyStart = new Date(due.getTime() - (280 * 24 * 60 * 60 * 1000)); // 40 weeks before due date
        const daysSinceStart = Math.floor((today - pregnancyStart) / (24 * 60 * 60 * 1000));
        const week = Math.floor(daysSinceStart / 7) + 1;
        const daysLeft = Math.ceil((due - today) / (24 * 60 * 60 * 1000));
        
        // If baby is born (past due date), calculate age
        if (today >= due) {
            const daysSinceBirth = Math.floor((today - due) / (24 * 60 * 60 * 1000));
            const monthsOld = Math.floor(daysSinceBirth / 30.44); // Average days per month
            const yearsOld = Math.floor(monthsOld / 12);
            
            if (yearsOld >= 5) {
                return { week: 'Complete', daysLeft: 'Journey Complete', trimester: 'Child (5+ years)', monthsOld, yearsOld };
            }
            
            return { week: 'Born', daysLeft: `${monthsOld} months old`, trimester: yearsOld > 0 ? `Child (${yearsOld}y ${monthsOld % 12}m)` : `Baby (${monthsOld}m)`, monthsOld, yearsOld };
        }
        
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
            updateMilestone(pregnancy.week, pregnancy.monthsOld, pregnancy.yearsOld);
            updateBabySize(pregnancy.week, pregnancy.monthsOld, pregnancy.yearsOld);
            
            // Store current week for other features
            localStorage.setItem('currentWeek', pregnancy.week);
            
            setupSection.hidden = true;
            pregnancyInfo.hidden = false;
        }
    }
    
    function updateMilestone(week, monthsOld = 0, yearsOld = 0) {
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
        
        if (week === 'Born' || week === 'Complete') {
            const postBirthMilestones = {
                0: '🎉 Baby is born! Welcome to parenthood',
                3: '😊 Baby starts smiling and recognizing faces',
                6: '🥰 Baby can sit up and eat solid foods',
                12: '🚼 First steps and first words',
                24: '🗣️ Talking in sentences and potty training',
                36: '🎲 Playing with others and learning colors',
                48: '🏭 Ready for preschool and writing letters',
                60: '🎓 Starting kindergarten - big kid now!'
            };
            
            const totalMonths = yearsOld * 12 + (monthsOld % 12);
            const milestoneMonths = Object.keys(postBirthMilestones).map(Number).sort((a, b) => a - b);
            const currentMilestone = milestoneMonths.find(m => totalMonths <= m) || 60;
            
            document.getElementById('currentMilestone').innerHTML = `
                <h4>${yearsOld > 0 ? `${yearsOld} years ${monthsOld % 12} months` : `${monthsOld} months`}</h4>
                <p>${postBirthMilestones[currentMilestone]}</p>
            `;
        } else {
            const milestoneWeeks = Object.keys(milestones).map(Number).sort((a, b) => a - b);
            const currentMilestone = milestoneWeeks.find(w => week <= w) || 40;
            
            document.getElementById('currentMilestone').innerHTML = `
                <h4>Week ${currentMilestone}</h4>
                <p>${milestones[currentMilestone]}</p>
            `;
        }
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
        
        // Save to user-specific storage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userKey = `user_${currentUser}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.healthTracking = existingData;
            localStorage.setItem(userKey, JSON.stringify(userData));
        }
        
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
    
    // Profile form functionality
    const profileForm = document.getElementById('profileForm');
    profileForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const profileData = Object.fromEntries(formData);
        
        // Validate required profile fields
        const requiredFields = ['profileFirstName', 'profileLastName', 'profileDateOfBirth', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinGender', 'kinPhone'];
        const missingFields = requiredFields.filter(field => !profileData[field] || profileData[field].trim() === '');
        
        if (missingFields.length > 0) {
            alert('Please fill in all required fields to complete your profile.');
            return;
        }
        
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        // Save to user-specific storage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userKey = `user_${currentUser}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.profile = profileData;
            localStorage.setItem(userKey, JSON.stringify(userData));
        }
        
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✅ Profile Saved!';
        submitBtn.style.background = '#28a745';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            // Redirect to dashboard after profile completion
            showDashboardTab();
        }, 2000);
    });
    
    // Children management
    let childCount = 0;
    const maxChildren = 10;
    
    document.getElementById('addChildBtn')?.addEventListener('click', function() {
        if (childCount >= maxChildren) {
            alert('Maximum 10 children allowed');
            return;
        }
        
        childCount++;
        const childDiv = document.createElement('div');
        childDiv.className = 'child-entry';
        childDiv.style.cssText = 'border:1px solid #ddd;padding:1rem;margin-bottom:1rem;border-radius:8px';
        childDiv.innerHTML = `
            <h4>Child ${childCount}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name:</label>
                    <input type="text" name="child${childCount}FirstName" maxlength="30">
                </div>
                <div class="form-group">
                    <label>Last Name:</label>
                    <input type="text" name="child${childCount}LastName" maxlength="30">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date of Birth:</label>
                    <input type="date" name="child${childCount}DateOfBirth">
                </div>
                <div class="form-group">
                    <label>Gender:</label>
                    <select name="child${childCount}Gender">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>
            <button type="button" onclick="removeChild(this)" style="background:#dc3545;color:white;border:none;padding:0.5rem;border-radius:4px">Remove Child</button>
        `;
        document.getElementById('childrenContainer').appendChild(childDiv);
    });
    
    window.removeChild = function(button) {
        button.parentElement.remove();
        childCount--;
    };
    
    // Load profile data
    function loadProfile() {
        const profileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('momcare_users') || '{}');
        const userSignUpData = Object.values(users).find(user => user.username === currentUser);
        
        // Auto-populate from sign-up data if profile is empty
        if (userSignUpData && Object.keys(profileData).length === 0) {
            document.getElementById('profileFirstName').value = userSignUpData.firstName || '';
            document.getElementById('profileLastName').value = userSignUpData.lastName || '';
            document.getElementById('profilePhone').value = userSignUpData.phone || '';
            document.getElementById('profileGender').value = 'female';
            
            // Set date of birth from sign-up data
            if (userSignUpData.dateOfBirth) {
                document.getElementById('profileDateOfBirth').value = userSignUpData.dateOfBirth;
            }
        } else {
            // Load saved profile data
            Object.keys(profileData).forEach(key => {
                const input = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (input) input.value = profileData[key];
            });
        }
        
        // Load children data
        for (let i = 1; i <= 10; i++) {
            if (profileData[`child${i}FirstName`]) {
                document.getElementById('addChildBtn').click();
            }
        }
    }
    
    // Immunization tracking functionality
    const immunizationForm = document.getElementById('immunizationForm');
    immunizationForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const vaccineData = Object.fromEntries(formData);
        vaccineData.id = Date.now();
        vaccineData.timestamp = new Date().toISOString();
        
        const vaccines = JSON.parse(localStorage.getItem('vaccinations') || '[]');
        vaccines.push(vaccineData);
        localStorage.setItem('vaccinations', JSON.stringify(vaccines));
        
        // Save to user-specific storage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userKey = `user_${currentUser}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.vaccinations = vaccines;
            localStorage.setItem(userKey, JSON.stringify(userData));
        }
        
        updateVaccineSchedule();
        updateImmunizationProgress();
        
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✅ Vaccination Added!';
        submitBtn.style.background = '#28a745';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 2000);
        
        this.reset();
    });
    
    function updateVaccineSchedule() {
        const vaccines = JSON.parse(localStorage.getItem('vaccinations') || '[]');
        const scheduleDiv = document.getElementById('vaccineSchedule');
        
        if (vaccines.length === 0) {
            scheduleDiv.innerHTML = '<p>No vaccination records yet. Add your first vaccination above!</p>';
            return;
        }
        
        scheduleDiv.innerHTML = vaccines.map(vaccine => `
            <div style="padding:1rem;background:#f8f9fa;border-radius:8px;margin-bottom:1rem;border-left:4px solid #28a745">
                <h4>${vaccine.vaccineName} - Dose ${vaccine.doseNumber}</h4>
                <p><strong>Date:</strong> ${new Date(vaccine.vaccineDate).toLocaleDateString()}</p>
                <p><strong>Age:</strong> ${vaccine.childAge}</p>
                ${vaccine.vaccineProvider ? `<p><strong>Provider:</strong> ${vaccine.vaccineProvider}</p>` : ''}
                ${vaccine.vaccineNotes ? `<p><strong>Notes:</strong> ${vaccine.vaccineNotes}</p>` : ''}
            </div>
        `).join('');
    }
    
    function updateImmunizationProgress() {
        const vaccines = JSON.parse(localStorage.getItem('vaccinations') || '[]');
        const progressDiv = document.getElementById('immunizationProgress');
        
        const requiredVaccines = {
            'hepatitisB': { required: 3, name: 'Hepatitis B' },
            'dtap': { required: 4, name: 'DTaP' },
            'hib': { required: 3, name: 'Hib' },
            'polio': { required: 4, name: 'Polio' },
            'pcv': { required: 4, name: 'PCV' },
            'mmr': { required: 2, name: 'MMR' },
            'varicella': { required: 2, name: 'Varicella' },
            'hepatitisA': { required: 2, name: 'Hepatitis A' }
        };
        
        let progressHTML = '<h4>Vaccination Progress:</h4>';
        
        Object.keys(requiredVaccines).forEach(vaccineKey => {
            const received = vaccines.filter(v => v.vaccineName === vaccineKey).length;
            const required = requiredVaccines[vaccineKey].required;
            const percentage = Math.min((received / required) * 100, 100);
            
            progressHTML += `
                <div style="margin-bottom:1rem">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                        <span>${requiredVaccines[vaccineKey].name}</span>
                        <span>${received}/${required}</span>
                    </div>
                    <div style="background:#e0e0e0;border-radius:10px;height:20px;overflow:hidden">
                        <div style="background:${percentage === 100 ? '#28a745' : '#ff9800'};height:100%;width:${percentage}%;transition:width 0.3s ease"></div>
                    </div>
                </div>
            `;
        });
        
        progressDiv.innerHTML = progressHTML;
    }
    
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
        
        const doctorName = sanitizeInput(doctorNameInput.value);
        if (!doctorName || doctorName.length < 2 || doctorName.length > 100) {
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
        
        // Sanitize inputs and save doctor to suggestions
        appointmentData.doctorName = sanitizeInput(appointmentData.doctorName);
        appointmentData.appointmentLocation = sanitizeInput(appointmentData.appointmentLocation || '');
        appointmentData.appointmentNotes = sanitizeInput(appointmentData.appointmentNotes || '');
        
        // Save doctor name for future suggestions
        saveDoctorSuggestion(appointmentData.doctorName);
        
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push({ ...appointmentData, id: Date.now() });
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Save to user-specific storage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userKey = `user_${currentUser}`;
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.appointments = appointments;
            localStorage.setItem(userKey, JSON.stringify(userData));
        }
        
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
        updateDoctorDatalist();
        loadProfile();
        updateVaccineSchedule();
        updateImmunizationProgress();
        
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
    
    // Baby size updates (pregnancy to 5 years)
    function updateBabySize(week, monthsOld = 0, yearsOld = 0) {
        const pregnancySizes = {
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
        
        const postBirthSizes = {
            0: 'newborn baby 👶',
            3: '3-month-old baby 🍼',
            6: '6-month-old baby 👶',
            12: '1-year-old toddler 🚼',
            24: '2-year-old child 🧒',
            36: '3-year-old child 👦👧',
            48: '4-year-old child 🧒',
            60: '5-year-old child 👦👧'
        };
        
        if (week === 'Born' || week === 'Complete') {
            const totalMonths = yearsOld * 12 + (monthsOld % 12);
            const milestones = Object.keys(postBirthSizes).map(Number).sort((a, b) => a - b);
            const currentMilestone = milestones.find(m => totalMonths <= m) || 60;
            document.getElementById('babySize').innerHTML = `👶 Your child is a ${postBirthSizes[currentMilestone]}`;
        } else {
            const sizeWeeks = Object.keys(pregnancySizes).map(Number).sort((a, b) => a - b);
            const currentSize = sizeWeeks.find(w => week <= w) || 40;
            document.getElementById('babySize').innerHTML = `👶 Baby is the size of a ${pregnancySizes[currentSize]}`;
        }
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#e91e63;color:white;padding:1rem;border-radius:8px;z-index:9999';
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
    
    // Populate birth year dropdown
    const birthYearSelect = document.getElementById('birthYear');
    if (birthYearSelect) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 9; year >= currentYear - 80; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            birthYearSelect.appendChild(option);
        }
    }
    
    // Check profile completion on app load
    setTimeout(() => {
        if (localStorage.getItem('userSignedIn') === 'true' && !isProfileComplete()) {
            showProfileTab();
        }
    }, 100);
    
    init();
});

// Authentication helper functions
function showSignUp() {
    document.getElementById('signInModal').style.display = 'none';
    document.getElementById('signUpModal').style.display = 'flex';
}

function showSignIn() {
    document.getElementById('signUpModal').style.display = 'none';
    document.getElementById('signInModal').style.display = 'flex';
}

function signOut() {
    clearAllForms();
    localStorage.removeItem('userSignedIn');
    localStorage.removeItem('currentUser');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('signInModal').style.display = 'flex';
    showNotification('Signed out successfully', 'info');
}

function clearAllForms() {
    // Clear all form inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Reset setup section visibility
    const setupSection = document.getElementById('setupSection');
    const pregnancyInfo = document.getElementById('pregnancyInfo');
    if (setupSection && pregnancyInfo) {
        setupSection.hidden = false;
        pregnancyInfo.hidden = true;
    }
    
    // Clear dynamic content
    document.getElementById('recentActivity').innerHTML = '<p>No recent activity. Start tracking your health!</p>';
    document.getElementById('appointmentsList').innerHTML = '<p>No appointments scheduled. Add your first appointment above!</p>';
    document.getElementById('vaccineSchedule').innerHTML = '<p>No vaccination records yet. Add your first vaccination above!</p>';
    document.getElementById('childrenContainer').innerHTML = '';
    
    // Reset counters
    childCount = 0;
}

function loadUserData(username) {
    const userKey = `user_${username}`;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
    const users = JSON.parse(localStorage.getItem('momcare_users') || '{}');
    const userSignUpData = Object.values(users).find(user => user.username === username);
    
    // Set welcome message with sign-up name
    if (userSignUpData) {
        const welcomeName = userSignUpData.name || `${userSignUpData.firstName} ${userSignUpData.lastName}`;
        document.querySelector('.welcome-card h2').textContent = `Welcome Back, ${welcomeName}! 👋`;
    }
    
    if (userData.motherName) {
        localStorage.setItem('motherName', userData.motherName);
    }
    if (userData.dueDate) {
        localStorage.setItem('dueDate', userData.dueDate);
        updatePregnancyInfo();
    }
    
    // Load user-specific data
    if (userData.profile) {
        localStorage.setItem('userProfile', JSON.stringify(userData.profile));
        loadProfile();
    }
    if (userData.healthTracking) {
        localStorage.setItem('healthTracking', JSON.stringify(userData.healthTracking));
    }
    if (userData.appointments) {
        localStorage.setItem('appointments', JSON.stringify(userData.appointments));
    }
    if (userData.vaccinations) {
        localStorage.setItem('vaccinations', JSON.stringify(userData.vaccinations));
    }
    
    // Refresh displays
    updateStats();
    updateAppointmentsList();
    updateVaccineSchedule();
    updateImmunizationProgress();
}

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

// Health data export functions
function exportHealthData() {
    const healthData = JSON.parse(localStorage.getItem('healthTracking') || '[]');
    const decodedData = healthData.map(encryptedEntry => {
        try {
            return JSON.parse(atob(encryptedEntry));
        } catch {
            return encryptedEntry;
        }
    });
    
    const csvContent = convertToCSV(decodedData);
    downloadFile(csvContent, 'health-tracking-data.csv', 'text/csv');
}

function exportHealthPDF() {
    const healthData = JSON.parse(localStorage.getItem('healthTracking') || '[]');
    const decodedData = healthData.map(encryptedEntry => {
        try {
            return JSON.parse(atob(encryptedEntry));
        } catch {
            return encryptedEntry;
        }
    });
    
    const htmlContent = generateHealthReport(decodedData);
    downloadFile(htmlContent, 'health-report.html', 'text/html');
}

function convertToCSV(data) {
    if (data.length === 0) return 'No health data available';
    
    const headers = ['Date', 'Week', 'Weight (kg)', 'Blood Pressure', 'Symptoms', 'Baby Movement', 'Mood', 'Notes'];
    const csvRows = [headers.join(',')];
    
    data.forEach(entry => {
        const row = [
            entry.trackingDate || '',
            entry.pregnancyWeek || '',
            entry.currentWeight || '',
            entry.bloodPressure || '',
            Array.isArray(entry.symptoms) ? entry.symptoms.join('; ') : '',
            entry.babyMovement || '',
            entry.moodRating || '',
            (entry.healthNotes || '').replace(/,/g, ';')
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function generateHealthReport(data) {
    const motherName = localStorage.getItem('motherName') || 'Patient';
    const dueDate = localStorage.getItem('dueDate') || 'Not set';
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Health Report - ${motherName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #ff69b4; color: white; padding: 20px; text-align: center; }
            .summary { margin: 20px 0; padding: 15px; background: #f8f9fa; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #ff69b4; color: white; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🤱 MomCare Health Report</h1>
            <p>Patient: ${motherName}</p>
            <p>Due Date: ${new Date(dueDate).toLocaleDateString()}</p>
            <p>Report Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
            <h2>Summary</h2>
            <p>Total Health Records: ${data.length}</p>
            <p>Date Range: ${data.length > 0 ? new Date(data[0].trackingDate).toLocaleDateString() + ' - ' + new Date(data[data.length-1].trackingDate).toLocaleDateString() : 'No data'}</p>
        </div>
        
        <h2>Health Tracking Records</h2>
        <table>
            <tr>
                <th>Date</th>
                <th>Week</th>
                <th>Weight (kg)</th>
                <th>Blood Pressure</th>
                <th>Symptoms</th>
                <th>Baby Movement</th>
                <th>Mood (1-10)</th>
                <th>Notes</th>
            </tr>`;
    
    data.forEach(entry => {
        html += `
            <tr>
                <td>${new Date(entry.trackingDate).toLocaleDateString()}</td>
                <td>${entry.pregnancyWeek}</td>
                <td>${entry.currentWeight}</td>
                <td>${entry.bloodPressure}</td>
                <td>${Array.isArray(entry.symptoms) ? entry.symptoms.join(', ') : ''}</td>
                <td>${entry.babyMovement || ''}</td>
                <td>${entry.moodRating || ''}</td>
                <td>${entry.healthNotes || ''}</td>
            </tr>`;
    });
    
    html += `
        </table>
        
        <div class="footer">
            <p>This report is generated from MomCare pregnancy tracking application.</p>
            <p>Please share this report with your healthcare provider for medical consultation.</p>
        </div>
    </body>
    </html>`;
    
    return html;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification(`${filename} downloaded successfully! 📄`, 'success');
}

// Doctor suggestions functionality
function saveDoctorSuggestion(doctorName) {
    if (!doctorName || doctorName.length < 2) return;
    
    const suggestions = JSON.parse(localStorage.getItem('doctorSuggestions') || '[]');
    if (!suggestions.includes(doctorName)) {
        suggestions.push(doctorName);
        localStorage.setItem('doctorSuggestions', JSON.stringify(suggestions));
        updateDoctorDatalist();
    }
}

function updateDoctorDatalist() {
    const datalist = document.getElementById('doctorSuggestions');
    const savedSuggestions = JSON.parse(localStorage.getItem('doctorSuggestions') || '[]');
    
    // Add saved suggestions to existing options
    savedSuggestions.forEach(suggestion => {
        const existingOption = Array.from(datalist.options).find(option => option.value === suggestion);
        if (!existingOption) {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        }
    });
}

// Profile completion check
function isProfileComplete() {
    const profileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const requiredFields = ['profileFirstName', 'profileLastName', 'profileDateOfBirth', 'kinFirstName', 'kinLastName', 'kinRelationship', 'kinGender', 'kinPhone'];
    return requiredFields.every(field => profileData[field] && profileData[field].trim() !== '');
}

function showProfileTab() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs
    tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.hidden = true;
    });
    
    // Activate profile tab
    const profileBtn = document.querySelector('[data-tab="profile"]');
    const profileContent = document.getElementById('profile-tab');
    if (profileBtn && profileContent) {
        profileBtn.classList.add('active');
        profileBtn.setAttribute('aria-selected', 'true');
        profileContent.classList.add('active');
        profileContent.hidden = false;
    }
}

function showDashboardTab() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs
    tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.hidden = true;
    });
    
    // Activate dashboard tab
    const dashboardBtn = document.querySelector('[data-tab="dashboard"]');
    const dashboardContent = document.getElementById('dashboard-tab');
    if (dashboardBtn && dashboardContent) {
        dashboardBtn.classList.add('active');
        dashboardBtn.setAttribute('aria-selected', 'true');
        dashboardContent.classList.add('active');
        dashboardContent.hidden = false;
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});