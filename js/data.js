// Data storage using localStorage
const STORAGE_KEYS = {
    USERS: 'yearbook_users',
    UPLOADS: 'yearbook_uploads',
    REPORTS: 'yearbook_reports',
    FAVORITES: 'yearbook_favorites',
    SEARCH_HISTORY: 'yearbook_search_history'
};

// Admin email (can be changed)
const ADMIN_EMAIL = 'admin@yearbook.com';

// Initialize storage if empty
function initStorage() {
    if (!safeParseJSON(STORAGE_KEYS.USERS, null)) {
        safeSetItem(STORAGE_KEYS.USERS, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.UPLOADS, null)) {
        safeSetItem(STORAGE_KEYS.UPLOADS, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.REPORTS, null)) {
        safeSetItem(STORAGE_KEYS.REPORTS, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.FAVORITES, null)) {
        safeSetItem(STORAGE_KEYS.FAVORITES, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.SEARCH_HISTORY, null)) {
        safeSetItem(STORAGE_KEYS.SEARCH_HISTORY, []);
    }
}

// Check if user is admin
function isAdmin(user) {
    return user && user.email === ADMIN_EMAIL;
}

// User functions
function registerUser(username, email, password) {
    // Validation
    if (!validateUsername(username)) {
        return { success: false, message: `Username must be ${CONSTANTS.MIN_USERNAME_LENGTH}-${CONSTANTS.MAX_USERNAME_LENGTH} characters and contain only letters, numbers, and underscores` };
    }
    if (!validateEmail(email)) {
        return { success: false, message: 'Invalid email address' };
    }
    if (!validatePassword(password)) {
        return { success: false, message: `Password must be at least ${CONSTANTS.MIN_PASSWORD_LENGTH} characters` };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    
    // Check if user already exists
    if (users.find(u => u.email === email || u.username === username)) {
        return { success: false, message: 'User already exists' };
    }

    const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password, // In production, hash this!
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    const result = safeSetItem(STORAGE_KEYS.USERS, users);
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to save user' };
    }
    
    return { success: true, user: newUser };
}

function loginUser(email, password) {
    if (!validateEmail(email)) {
        return { success: false, message: 'Invalid email address' };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    
    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        safeSetItem('currentUser', userWithoutPassword);
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Invalid credentials' };
}

// Upload functions
function saveUpload(uploadData) {
    // Validation
    const validation = validateSchoolData(uploadData);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }
    
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const currentUser = safeParseJSON('currentUser', null);
    
    const newUpload = {
        id: Date.now().toString(),
        schoolName: uploadData.schoolName.trim(),
        city: uploadData.city.trim(),
        country: uploadData.country.trim(),
        year: parseInt(uploadData.year),
        grade: uploadData.grade ? uploadData.grade.trim() : null,
        description: uploadData.description ? uploadData.description.trim() : null,
        tags: uploadData.tags || [],
        imageUrl: uploadData.imageUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.id || 'anonymous',
        viewCount: 0
    };

    uploads.push(newUpload);
    const result = safeSetItem(STORAGE_KEYS.UPLOADS, uploads);
    if (!result.success) {
        return { success: false, error: result.error || 'Failed to save upload' };
    }
    
    return { success: true, upload: newUpload };
}

function getUploads(filters = {}) {
    initStorage();
    let uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);

    // Apply filters
    if (filters.school) {
        uploads = uploads.filter(u => 
            u.schoolName?.toLowerCase().includes(filters.school.toLowerCase()) ||
            u.tags?.some(tag => tag.toLowerCase().includes(filters.school.toLowerCase()))
        );
    }

    if (filters.city) {
        uploads = uploads.filter(u => 
            u.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
    }

    if (filters.country) {
        uploads = uploads.filter(u => 
            u.country?.toLowerCase().includes(filters.country.toLowerCase())
        );
    }

    if (filters.year) {
        uploads = uploads.filter(u => 
            u.year === filters.year || 
            u.tags?.some(tag => tag.includes(filters.year.toString()))
        );
    }

    if (filters.grade) {
        uploads = uploads.filter(u => 
            u.grade === filters.grade ||
            u.tags?.some(tag => tag.toLowerCase().includes(filters.grade.toLowerCase()))
        );
    }

    if (filters.tags) {
        const tagArray = Array.isArray(filters.tags) ? filters.tags : filters.tags.split(',').map(t => t.trim());
        uploads = uploads.filter(u => 
            tagArray.some(filterTag => 
                u.tags?.some(uploadTag => 
                    uploadTag.toLowerCase().includes(filterTag.toLowerCase())
                )
            )
        );
    }

    return uploads;
}

function getUploadById(id) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    return uploads.find(u => u.id === id);
}

// Report functions
function reportUpload(uploadId, reason, description) {
    // Rate limiting
    const currentUser = safeParseJSON('currentUser', null);
    const userId = currentUser?.id || 'anonymous';
    const rateLimit = checkRateLimit('report', userId, CONSTANTS.RATE_LIMIT_REPORTS);
    if (!rateLimit.allowed) {
        return { success: false, message: rateLimit.message };
    }
    
    initStorage();
    const reports = safeParseJSON(STORAGE_KEYS.REPORTS, []);
    
    // Check if user already reported this upload
    const existingReport = reports.find(r => 
        r.uploadId === uploadId && 
        r.reportedBy === (currentUser?.id || 'anonymous')
    );
    
    if (existingReport) {
        return { success: false, message: 'You have already reported this post' };
    }
    
    const newReport = {
        id: Date.now().toString(),
        uploadId,
        reason,
        description: description || '',
        reportedBy: currentUser?.id || 'anonymous',
        reportedByUsername: currentUser?.username || 'Anonymous',
        reportedAt: new Date().toISOString(),
        status: 'pending', // pending, reviewed, dismissed
        reviewedBy: null,
        reviewedAt: null
    };
    
    reports.push(newReport);
    const result = safeSetItem(STORAGE_KEYS.REPORTS, reports);
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to save report' };
    }
    
    return { success: true, report: newReport };
}

function getReports(status = null) {
    initStorage();
    let reports = safeParseJSON(STORAGE_KEYS.REPORTS, []);
    
    if (status) {
        reports = reports.filter(r => r.status === status);
    }
    
    // Sort by most recent first
    return reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
}

function getReportById(id) {
    initStorage();
    const reports = safeParseJSON(STORAGE_KEYS.REPORTS, []);
    return reports.find(r => r.id === id);
}

function updateReportStatus(reportId, status, reviewedBy) {
    initStorage();
    const reports = safeParseJSON(STORAGE_KEYS.REPORTS, []);
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        report.status = status;
        report.reviewedBy = reviewedBy;
        report.reviewedAt = new Date().toISOString();
        const result = safeSetItem(STORAGE_KEYS.REPORTS, reports);
        if (!result.success) {
            return { success: false, message: result.error || 'Failed to update report' };
        }
        return { success: true, report };
    }
    
    return { success: false, message: 'Report not found' };
}

function deleteUpload(uploadId) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const filtered = uploads.filter(u => u.id !== uploadId);
    const result = safeSetItem(STORAGE_KEYS.UPLOADS, filtered);
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to delete upload' };
    }
    
    // Also remove from favorites
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    const filteredFavorites = favorites.filter(f => f.uploadId !== uploadId);
    safeSetItem(STORAGE_KEYS.FAVORITES, filteredFavorites);
    
    return { success: true };
}

// Update upload function
function updateUpload(uploadId, updatedData) {
    // Validation
    const validation = validateSchoolData(updatedData);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }
    
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const index = uploads.findIndex(u => u.id === uploadId);
    
    if (index !== -1) {
        uploads[index] = { 
            ...uploads[index],
            schoolName: updatedData.schoolName.trim(),
            city: updatedData.city.trim(),
            country: updatedData.country.trim(),
            year: parseInt(updatedData.year),
            grade: updatedData.grade ? updatedData.grade.trim() : null,
            description: updatedData.description ? updatedData.description.trim() : null,
            tags: updatedData.tags || [],
            updatedAt: new Date().toISOString() 
        };
        const result = safeSetItem(STORAGE_KEYS.UPLOADS, uploads);
        if (!result.success) {
            return { success: false, message: result.error || 'Failed to update upload' };
        }
        return { success: true, upload: uploads[index] };
    }
    
    return { success: false, message: 'Upload not found' };
}

// Check if user can edit upload
function canEditUpload(uploadId, userId) {
    const upload = getUploadById(uploadId);
    return upload && upload.uploadedBy === userId;
}

// Favorites functions
function addFavorite(uploadId, userId) {
    initStorage();
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    
    if (!favorites.find(f => f.uploadId === uploadId && f.userId === userId)) {
        favorites.push({ 
            uploadId, 
            userId, 
            addedAt: new Date().toISOString() 
        });
        const result = safeSetItem(STORAGE_KEYS.FAVORITES, favorites);
        if (!result.success) {
            return { success: false, message: result.error || 'Failed to add favorite' };
        }
        return { success: true };
    }
    
    return { success: false, message: 'Already favorited' };
}

function removeFavorite(uploadId, userId) {
    initStorage();
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    const filtered = favorites.filter(f => !(f.uploadId === uploadId && f.userId === userId));
    const result = safeSetItem(STORAGE_KEYS.FAVORITES, filtered);
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to remove favorite' };
    }
    return { success: true };
}

function isFavorited(uploadId, userId) {
    initStorage();
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    return favorites.some(f => f.uploadId === uploadId && f.userId === userId);
}

function getFavorites(userId) {
    initStorage();
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    return favorites.filter(f => f.userId === userId).map(f => f.uploadId);
}

function getFavoriteUploads(userId) {
    const favoriteIds = getFavorites(userId);
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    return uploads.filter(u => favoriteIds.includes(u.id));
}

// View count function
function incrementViewCount(uploadId) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const upload = uploads.find(u => u.id === uploadId);
    
    if (upload) {
        upload.viewCount = (upload.viewCount || 0) + 1;
        safeSetItem(STORAGE_KEYS.UPLOADS, uploads);
        return upload.viewCount;
    }
    
    return 0;
}

// Search history functions
function saveSearchHistory(searchParams) {
    initStorage();
    const history = safeParseJSON(STORAGE_KEYS.SEARCH_HISTORY, []);
    history.unshift({
        ...searchParams,
        searchedAt: new Date().toISOString()
    });
    // Keep only last searches
    const limited = history.slice(0, CONSTANTS.MAX_SEARCH_HISTORY);
    safeSetItem(STORAGE_KEYS.SEARCH_HISTORY, limited);
}

function getSearchHistory() {
    initStorage();
    return safeParseJSON(STORAGE_KEYS.SEARCH_HISTORY, []);
}

// Get autocomplete suggestions
function getAutocompleteSuggestions(query, field = 'school') {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    
    if (field === 'school') {
        const schools = [...new Set(uploads.map(u => u.schoolName).filter(Boolean))];
        return schools.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, CONSTANTS.MAX_AUTOCOMPLETE_RESULTS);
    } else if (field === 'city') {
        const cities = [...new Set(uploads.map(u => u.city).filter(Boolean))];
        return cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, CONSTANTS.MAX_AUTOCOMPLETE_RESULTS);
    } else if (field === 'country') {
        const countries = [...new Set(uploads.map(u => u.country).filter(Boolean))];
        return countries.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, CONSTANTS.MAX_AUTOCOMPLETE_RESULTS);
    }
    
    return [];
}

// Initialize on load
initStorage();

