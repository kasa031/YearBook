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
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.UPLOADS)) {
        localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify([]));
    }
}

// Check if user is admin
function isAdmin(user) {
    return user && user.email === ADMIN_EMAIL;
}

// User functions
function registerUser(username, email, password) {
    initStorage();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    
    // Check if user already exists
    if (users.find(u => u.email === email || u.username === username)) {
        return { success: false, message: 'User already exists' };
    }

    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // In production, hash this!
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return { success: true, user: newUser };
}

function loginUser(email, password) {
    initStorage();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Invalid credentials' };
}

// Upload functions
function saveUpload(uploadData) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    
    const newUpload = {
        id: Date.now().toString(),
        ...uploadData,
        uploadedAt: new Date().toISOString(),
        uploadedBy: JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
    };

    uploads.push(newUpload);
    localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(uploads));
    
    return newUpload;
}

function getUploads(filters = {}) {
    initStorage();
    let uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));

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
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    return uploads.find(u => u.id === id);
}

// Report functions
function reportUpload(uploadId, reason, description) {
    initStorage();
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
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
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    
    return { success: true, report: newReport };
}

function getReports(status = null) {
    initStorage();
    let reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS));
    
    if (status) {
        reports = reports.filter(r => r.status === status);
    }
    
    // Sort by most recent first
    return reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
}

function getReportById(id) {
    initStorage();
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS));
    return reports.find(r => r.id === id);
}

function updateReportStatus(reportId, status, reviewedBy) {
    initStorage();
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS));
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        report.status = status;
        report.reviewedBy = reviewedBy;
        report.reviewedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        return { success: true, report };
    }
    
    return { success: false, message: 'Report not found' };
}

function deleteUpload(uploadId) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    const filtered = uploads.filter(u => u.id !== uploadId);
    localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(filtered));
    
    // Also remove from favorites
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    const filteredFavorites = favorites.filter(f => f.uploadId !== uploadId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filteredFavorites));
    
    return { success: true };
}

// Update upload function
function updateUpload(uploadId, updatedData) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    const index = uploads.findIndex(u => u.id === uploadId);
    
    if (index !== -1) {
        uploads[index] = { 
            ...uploads[index], 
            ...updatedData, 
            updatedAt: new Date().toISOString() 
        };
        localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(uploads));
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
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    
    if (!favorites.find(f => f.uploadId === uploadId && f.userId === userId)) {
        favorites.push({ 
            uploadId, 
            userId, 
            addedAt: new Date().toISOString() 
        });
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        return { success: true };
    }
    
    return { success: false, message: 'Already favorited' };
}

function removeFavorite(uploadId, userId) {
    initStorage();
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    const filtered = favorites.filter(f => !(f.uploadId === uploadId && f.userId === userId));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    return { success: true };
}

function isFavorited(uploadId, userId) {
    initStorage();
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    return favorites.some(f => f.uploadId === uploadId && f.userId === userId);
}

function getFavorites(userId) {
    initStorage();
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    return favorites.filter(f => f.userId === userId).map(f => f.uploadId);
}

function getFavoriteUploads(userId) {
    const favoriteIds = getFavorites(userId);
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS)) || [];
    return uploads.filter(u => favoriteIds.includes(u.id));
}

// View count function
function incrementViewCount(uploadId) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    const upload = uploads.find(u => u.id === uploadId);
    
    if (upload) {
        upload.viewCount = (upload.viewCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(uploads));
        return upload.viewCount;
    }
    
    return 0;
}

// Search history functions
function saveSearchHistory(searchParams) {
    initStorage();
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
    history.unshift({
        ...searchParams,
        searchedAt: new Date().toISOString()
    });
    // Keep only last 10 searches
    const limited = history.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limited));
}

function getSearchHistory() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
}

// Get autocomplete suggestions
function getAutocompleteSuggestions(query, field = 'school') {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS)) || [];
    
    if (field === 'school') {
        const schools = [...new Set(uploads.map(u => u.schoolName).filter(Boolean))];
        return schools.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    } else if (field === 'city') {
        const cities = [...new Set(uploads.map(u => u.city).filter(Boolean))];
        return cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    } else if (field === 'country') {
        const countries = [...new Set(uploads.map(u => u.country).filter(Boolean))];
        return countries.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
    
    return [];
}

// Initialize on load
initStorage();

