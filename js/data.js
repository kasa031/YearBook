// Data storage using localStorage
const STORAGE_KEYS = {
    USERS: 'yearbook_users',
    UPLOADS: 'yearbook_uploads',
    REPORTS: 'yearbook_reports'
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
    return { success: true };
}

// Initialize on load
initStorage();

