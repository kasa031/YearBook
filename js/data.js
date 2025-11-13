// Data storage using localStorage
const STORAGE_KEYS = {
    USERS: 'yearbook_users',
    UPLOADS: 'yearbook_uploads',
    REPORTS: 'yearbook_reports',
    FAVORITES: 'yearbook_favorites',
    LIKES: 'yearbook_likes',
    COMMENTS: 'yearbook_comments',
    SEARCH_HISTORY: 'yearbook_search_history',
    POPULAR_SEARCHES: 'yearbook_popular_searches',
    NOTIFICATIONS: 'yearbook_notifications',
    NOTIFICATIONS_READ: 'yearbook_notifications_read'
};

// Admin email (can be changed)
const ADMIN_EMAIL = 'admin@yearbook.com';

// User roles
const USER_ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
};

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
    if (!safeParseJSON(STORAGE_KEYS.LIKES, null)) {
        safeSetItem(STORAGE_KEYS.LIKES, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.COMMENTS, null)) {
        safeSetItem(STORAGE_KEYS.COMMENTS, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.POPULAR_SEARCHES, null)) {
        safeSetItem(STORAGE_KEYS.POPULAR_SEARCHES, {});
    }
    if (!safeParseJSON(STORAGE_KEYS.NOTIFICATIONS, null)) {
        safeSetItem(STORAGE_KEYS.NOTIFICATIONS, []);
    }
    if (!safeParseJSON(STORAGE_KEYS.NOTIFICATIONS_READ, null)) {
        safeSetItem(STORAGE_KEYS.NOTIFICATIONS_READ, []);
    }
}

// Check if user is admin (moderator, admin, or superadmin)
function isAdmin(user) {
    if (!user) return false;
    
    // Legacy: email-based admin check
    if (user.email === ADMIN_EMAIL) {
        // Upgrade legacy admin to superadmin
        if (!user.role || user.role === USER_ROLES.USER) {
            upgradeUserToSuperAdmin(user.id);
        }
        return true;
    }
    
    // Role-based admin check
    return user.role === USER_ROLES.MODERATOR || 
           user.role === USER_ROLES.ADMIN || 
           user.role === USER_ROLES.SUPERADMIN;
}

// Check if user is superadmin
function isSuperAdmin(user) {
    if (!user) return false;
    
    // Legacy: email-based admin check
    if (user.email === ADMIN_EMAIL) {
        return true;
    }
    
    return user.role === USER_ROLES.SUPERADMIN;
}

// Check if user is moderator or higher
function isModerator(user) {
    return isAdmin(user);
}

// Check if user can manage users (admin or superadmin only)
function canManageUsers(user) {
    if (!user) return false;
    if (user.email === ADMIN_EMAIL) return true;
    return user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN;
}

// Check if user can manage roles (superadmin only)
function canManageRoles(user) {
    return isSuperAdmin(user);
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
    
    // Normalize email for comparison
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    
    // Check if user already exists (case-insensitive for email)
    const existingUser = users.find(u => {
        const storedEmail = (u.email || '').trim().toLowerCase();
        return storedEmail === normalizedEmail || u.username === normalizedUsername;
    });
    
    if (existingUser) {
        return { success: false, message: 'User already exists' };
    }

    const newUser = {
        id: Date.now().toString(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password, // In production, hash this!
        role: USER_ROLES.USER, // Default role
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
    
    if (!password || password.trim().length === 0) {
        return { success: false, message: 'Password is required' };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    
    // Normalize email for comparison
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find user by email (case-insensitive)
    const user = users.find(u => {
        const storedEmail = (u.email || '').trim().toLowerCase();
        return storedEmail === normalizedEmail;
    });
    
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    // Compare passwords (exact match, no trimming to preserve special characters)
    if (user.password !== password) {
        return { success: false, message: 'Invalid password' };
    }
    
    // Login successful
    const { password: _, ...userWithoutPassword } = user;
    const setResult = safeSetItem('currentUser', userWithoutPassword);
    if (!setResult.success) {
        return { success: false, message: 'Failed to save session' };
    }
    
    return { success: true, user: userWithoutPassword };
}

// Password reset functions
function resetPassword(email, newPassword, confirmPassword) {
    if (!validateEmail(email)) {
        return { success: false, message: 'Invalid email address' };
    }
    
    if (!newPassword || newPassword.trim().length === 0) {
        return { success: false, message: 'New password is required' };
    }
    
    if (!validatePassword(newPassword)) {
        return { success: false, message: `Password must be at least ${CONSTANTS.MIN_PASSWORD_LENGTH} characters` };
    }
    
    if (newPassword !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    
    // Normalize email for comparison
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find user by email
    const userIndex = users.findIndex(u => {
        const storedEmail = (u.email || '').trim().toLowerCase();
        return storedEmail === normalizedEmail;
    });
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found with this email address' };
    }
    
    // Update password
    users[userIndex].password = newPassword;
    users[userIndex].passwordResetAt = new Date().toISOString();
    
    const result = safeSetItem(STORAGE_KEYS.USERS, users);
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to reset password' };
    }
    
    return { success: true, message: 'Password reset successfully' };
}

// Admin user management functions
function getAllUsers() {
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    
    // Return users without passwords
    return users.map(({ password, ...user }) => {
        const role = user.email === ADMIN_EMAIL ? USER_ROLES.SUPERADMIN : (user.role || USER_ROLES.USER);
        return {
            ...user,
            role: role,
            isAdmin: isAdmin(user),
            isSuperAdmin: isSuperAdmin(user)
        };
    });
}

function getUserById(userId) {
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return null;
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    const role = user.email === ADMIN_EMAIL ? USER_ROLES.SUPERADMIN : (user.role || USER_ROLES.USER);
    return {
        ...userWithoutPassword,
        role: role,
        isAdmin: isAdmin(user),
        isSuperAdmin: isSuperAdmin(user)
    };
}

function deleteUser(userId, adminUserId) {
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser || !canManageUsers(currentUser)) {
        return { success: false, message: 'Only admins can delete users' };
    }
    
    // Prevent admin from deleting themselves
    if (userId === adminUserId || userId === currentUser.id) {
        return { success: false, message: 'You cannot delete your own account' };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) {
        return { success: false, message: 'User not found' };
    }
    
    // Prevent deleting superadmin accounts
    if (userToDelete.email === ADMIN_EMAIL || (userToDelete.role === USER_ROLES.SUPERADMIN && !isSuperAdmin(currentUser))) {
        return { success: false, message: 'Cannot delete superadmin account' };
    }
    
    // Delete user
    const filtered = users.filter(u => u.id !== userId);
    const result = safeSetItem(STORAGE_KEYS.USERS, filtered);
    
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to delete user' };
    }
    
    // Also delete all uploads by this user
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const userUploads = uploads.filter(u => u.uploadedBy === userId);
    if (userUploads.length > 0) {
        const remainingUploads = uploads.filter(u => u.uploadedBy !== userId);
        safeSetItem(STORAGE_KEYS.UPLOADS, remainingUploads);
    }
    
    // Delete user's favorites
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    const remainingFavorites = favorites.filter(f => f.userId !== userId);
    safeSetItem(STORAGE_KEYS.FAVORITES, remainingFavorites);
    
    // Delete user's likes
    const likes = safeParseJSON(STORAGE_KEYS.LIKES, []);
    const remainingLikes = likes.filter(l => l.userId !== userId);
    safeSetItem(STORAGE_KEYS.LIKES, remainingLikes);
    
    // Delete user's comments
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    const remainingComments = comments.filter(c => c.userId !== userId);
    safeSetItem(STORAGE_KEYS.COMMENTS, remainingComments);
    
    // If deleted user is currently logged in, log them out
    if (userId === currentUser.id) {
        localStorage.removeItem('currentUser');
    }
    
    return { success: true, message: 'User deleted successfully' };
}

function getUserStatistics(userId) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    const likes = safeParseJSON(STORAGE_KEYS.LIKES, []);
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    const reports = safeParseJSON(STORAGE_KEYS.REPORTS, []);
    
    const userUploads = uploads.filter(u => u.uploadedBy === userId);
    const userFavorites = favorites.filter(f => f.userId === userId);
    const userLikes = likes.filter(l => l.userId === userId);
    const userComments = comments.filter(c => c.userId === userId);
    const userReports = reports.filter(r => r.reportedBy === userId);
    
    return {
        uploadCount: userUploads.length,
        favoriteCount: userFavorites.length,
        likeCount: userLikes.length,
        commentCount: userComments.length,
        reportCount: userReports.length,
        lastActivity: userUploads.length > 0 
            ? userUploads.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0].uploadedAt
            : null
    };
}

// Role management functions
function setUserRole(userId, newRole, adminUserId) {
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser || !canManageRoles(currentUser)) {
        return { success: false, message: 'Only superadmins can manage user roles' };
    }
    
    // Prevent changing own role
    if (userId === adminUserId || userId === currentUser.id) {
        return { success: false, message: 'You cannot change your own role' };
    }
    
    // Validate role
    if (!Object.values(USER_ROLES).includes(newRole)) {
        return { success: false, message: 'Invalid role' };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found' };
    }
    
    const user = users[userIndex];
    
    // Prevent downgrading superadmin
    if (user.email === ADMIN_EMAIL && newRole !== USER_ROLES.SUPERADMIN) {
        return { success: false, message: 'Cannot change role of primary admin account' };
    }
    
    // Update role
    users[userIndex].role = newRole;
    users[userIndex].roleUpdatedAt = new Date().toISOString();
    users[userIndex].roleUpdatedBy = currentUser.id;
    
    const result = safeSetItem(STORAGE_KEYS.USERS, users);
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to update user role' };
    }
    
    return { success: true, message: `User role updated to ${newRole}` };
}

function upgradeUserToSuperAdmin(userId) {
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1 && users[userIndex].email === ADMIN_EMAIL) {
        users[userIndex].role = USER_ROLES.SUPERADMIN;
        safeSetItem(STORAGE_KEYS.USERS, users);
    }
}

function getUserRole(userId) {
    const user = getUserById(userId);
    if (!user) return USER_ROLES.USER;
    
    // Legacy: email-based admin
    if (user.email === ADMIN_EMAIL) {
        return USER_ROLES.SUPERADMIN;
    }
    
    return user.role || USER_ROLES.USER;
}

function checkEmailExists(email) {
    if (!validateEmail(email)) {
        return { success: false, exists: false, message: 'Invalid email address' };
    }
    
    initStorage();
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    
    // Normalize email for comparison
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = users.find(u => {
        const storedEmail = (u.email || '').trim().toLowerCase();
        return storedEmail === normalizedEmail;
    });
    
    return { success: true, exists: !!user };
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
        viewCount: 0,
        likeCount: 0, // Number of likes
        isPrivate: uploadData.isPrivate || false // Private mode flag
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
    const currentUser = safeParseJSON('currentUser', null);

    // Filter out private posts (only show them to the owner)
    uploads = uploads.filter(upload => {
        if (upload.isPrivate) {
            // Only show private posts to the owner
            return currentUser && upload.uploadedBy === currentUser.id;
        }
        return true; // Show all public posts
    });

    // Determine filter logic (AND or OR) - default to AND
    const filterLogic = filters.filterLogic || 'AND';
    
    // Collect all active filters
    const activeFilters = [];
    
    // School filter
    if (filters.school) {
        activeFilters.push((u) => 
            u.schoolName?.toLowerCase().includes(filters.school.toLowerCase()) ||
            u.tags?.some(tag => tag.toLowerCase().includes(filters.school.toLowerCase()))
        );
    }

    // City filter
    if (filters.city) {
        activeFilters.push((u) => 
            u.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
    }

    // Country filter
    if (filters.country) {
        activeFilters.push((u) => 
            u.country?.toLowerCase().includes(filters.country.toLowerCase())
        );
    }

    // Year range filter (yearFrom and yearTo)
    if (filters.yearFrom || filters.yearTo) {
        activeFilters.push((u) => {
            const year = u.year;
            if (filters.yearFrom && filters.yearTo) {
                return year >= filters.yearFrom && year <= filters.yearTo;
            } else if (filters.yearFrom) {
                return year >= filters.yearFrom;
            } else if (filters.yearTo) {
                return year <= filters.yearTo;
            }
            return true;
        });
    } else if (filters.year) {
        // Legacy single year filter
        activeFilters.push((u) => 
            u.year === filters.year || 
            u.tags?.some(tag => tag.includes(filters.year.toString()))
        );
    }

    // Grade filter
    if (filters.grade) {
        activeFilters.push((u) => 
            u.grade === filters.grade ||
            u.tags?.some(tag => tag.toLowerCase().includes(filters.grade.toLowerCase()))
        );
    }

    // Username filter
    if (filters.username) {
        initStorage();
        const users = safeParseJSON(STORAGE_KEYS.USERS, []);
        const matchingUsers = users.filter(u => 
            u.username?.toLowerCase().includes(filters.username.toLowerCase())
        );
        const userIds = matchingUsers.map(u => u.id);
        
        if (userIds.length > 0) {
            activeFilters.push((u) => userIds.includes(u.uploadedBy));
        } else {
            // No matching users, return empty results for AND logic
            if (filterLogic === 'AND') {
                return [];
            }
        }
    }

    // Tags filter
    if (filters.tags) {
        const tagArray = Array.isArray(filters.tags) ? filters.tags : filters.tags.split(',').map(t => t.trim());
        activeFilters.push((u) => 
            tagArray.some(filterTag => 
                u.tags?.some(uploadTag => 
                    uploadTag.toLowerCase().includes(filterTag.toLowerCase())
                )
            )
        );
    }

    // Apply filters based on logic
    if (activeFilters.length === 0) {
        return uploads; // No filters, return all
    }

    if (filterLogic === 'OR') {
        // OR logic: at least one filter must match
        uploads = uploads.filter(upload => 
            activeFilters.some(filterFn => filterFn(upload))
        );
    } else {
        // AND logic: all filters must match (default)
        uploads = uploads.filter(upload => 
            activeFilters.every(filterFn => filterFn(upload))
        );
    }

    return uploads;
}

function getUploadById(id) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const upload = uploads.find(u => u.id === id);
    
    // Check if upload is private and user has access
    if (upload && upload.isPrivate) {
        const currentUser = safeParseJSON('currentUser', null);
        // Only show private posts to the owner
        if (!currentUser || upload.uploadedBy !== currentUser.id) {
            return null; // Don't show private posts to others
        }
    }
    
    return upload;
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
    
    // Create notification for admin
    createReportNotification(newReport);
    
    return { success: true, report: newReport };
}

// Notification functions
function createReportNotification(report) {
    initStorage();
    const notifications = safeParseJSON(STORAGE_KEYS.NOTIFICATIONS, []);
    const upload = getUploadById(report.uploadId);
    
    const notification = {
        id: `notification-${report.id}`,
        type: 'new_report',
        reportId: report.id,
        uploadId: report.uploadId,
        title: `New Report: ${upload?.schoolName || 'Unknown School'}`,
        message: `Reported by ${report.reportedByUsername}: ${report.reason.replace('_', ' ')}`,
        createdAt: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification); // Add to beginning
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications.splice(50);
    }
    
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

function getUnreadNotifications() {
    initStorage();
    const notifications = safeParseJSON(STORAGE_KEYS.NOTIFICATIONS, []);
    const readIds = safeParseJSON(STORAGE_KEYS.NOTIFICATIONS_READ, []);
    
    return notifications.filter(n => !readIds.includes(n.id));
}

function getAllNotifications() {
    initStorage();
    return safeParseJSON(STORAGE_KEYS.NOTIFICATIONS, []);
}

function markNotificationAsRead(notificationId) {
    initStorage();
    const readIds = safeParseJSON(STORAGE_KEYS.NOTIFICATIONS_READ, []);
    
    if (!readIds.includes(notificationId)) {
        readIds.push(notificationId);
        safeSetItem(STORAGE_KEYS.NOTIFICATIONS_READ, readIds);
    }
}

function markAllNotificationsAsRead() {
    initStorage();
    const notifications = safeParseJSON(STORAGE_KEYS.NOTIFICATIONS, []);
    const readIds = notifications.map(n => n.id);
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS_READ, readIds);
}

function getUnreadNotificationCount() {
    return getUnreadNotifications().length;
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
            isPrivate: updatedData.isPrivate !== undefined ? updatedData.isPrivate : uploads[index].isPrivate || false,
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

// Like functions
function toggleLike(uploadId, userId) {
    initStorage();
    const likes = safeParseJSON(STORAGE_KEYS.LIKES, []);
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    
    const existingLike = likes.find(l => l.uploadId === uploadId && l.userId === userId);
    const upload = uploads.find(u => u.id === uploadId);
    
    if (!upload) {
        return { success: false, message: 'Post not found' };
    }
    
    if (existingLike) {
        // Unlike - remove like
        const filteredLikes = likes.filter(l => !(l.uploadId === uploadId && l.userId === userId));
        safeSetItem(STORAGE_KEYS.LIKES, filteredLikes);
        
        // Decrement like count
        upload.likeCount = Math.max(0, (upload.likeCount || 0) - 1);
        safeSetItem(STORAGE_KEYS.UPLOADS, uploads);
        
        return { success: true, liked: false, likeCount: upload.likeCount };
    } else {
        // Like - add like
        likes.push({
            uploadId,
            userId,
            likedAt: new Date().toISOString()
        });
        safeSetItem(STORAGE_KEYS.LIKES, likes);
        
        // Increment like count
        upload.likeCount = (upload.likeCount || 0) + 1;
        safeSetItem(STORAGE_KEYS.UPLOADS, uploads);
        
        return { success: true, liked: true, likeCount: upload.likeCount };
    }
}

function isLiked(uploadId, userId) {
    if (!userId) return false;
    initStorage();
    const likes = safeParseJSON(STORAGE_KEYS.LIKES, []);
    return likes.some(l => l.uploadId === uploadId && l.userId === userId);
}

function getLikeCount(uploadId) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const upload = uploads.find(u => u.id === uploadId);
    return upload ? (upload.likeCount || 0) : 0;
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
    
    // Update popular searches
    updatePopularSearches(searchParams);
}

// Popular searches functions
function updatePopularSearches(searchParams) {
    initStorage();
    const popularSearches = safeParseJSON(STORAGE_KEYS.POPULAR_SEARCHES, {});
    
    // Create a search key from the parameters
    const searchKey = createSearchKey(searchParams);
    
    if (searchKey) {
        if (!popularSearches[searchKey]) {
            popularSearches[searchKey] = {
                count: 0,
                params: searchParams,
                lastSearched: new Date().toISOString()
            };
        }
        popularSearches[searchKey].count++;
        popularSearches[searchKey].lastSearched = new Date().toISOString();
        
        safeSetItem(STORAGE_KEYS.POPULAR_SEARCHES, popularSearches);
    }
}

function createSearchKey(searchParams) {
    // Create a unique key from search parameters
    const parts = [];
    if (searchParams.school) parts.push(`school:${searchParams.school.toLowerCase()}`);
    if (searchParams.city) parts.push(`city:${searchParams.city.toLowerCase()}`);
    if (searchParams.country) parts.push(`country:${searchParams.country.toLowerCase()}`);
    if (searchParams.year) parts.push(`year:${searchParams.year}`);
    if (searchParams.yearFrom || searchParams.yearTo) {
        parts.push(`yearRange:${searchParams.yearFrom || ''}-${searchParams.yearTo || ''}`);
    }
    if (searchParams.grade) parts.push(`grade:${searchParams.grade.toLowerCase()}`);
    if (searchParams.tags) parts.push(`tags:${searchParams.tags.toLowerCase()}`);
    if (searchParams.username) parts.push(`user:${searchParams.username.toLowerCase()}`);
    
    return parts.length > 0 ? parts.join('|') : null;
}

function getPopularSearches(limit = 10) {
    initStorage();
    const popularSearches = safeParseJSON(STORAGE_KEYS.POPULAR_SEARCHES, {});
    
    // Convert to array and sort by count
    const searches = Object.entries(popularSearches)
        .map(([key, data]) => ({
            key,
            ...data
        }))
        .sort((a, b) => {
            // Sort by count (descending), then by last searched (descending)
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return new Date(b.lastSearched) - new Date(a.lastSearched);
        })
        .slice(0, limit);
    
    return searches;
}

function getPopularSearchTerms(field = null, limit = 5) {
    initStorage();
    const popularSearches = safeParseJSON(STORAGE_KEYS.POPULAR_SEARCHES, {});
    const termCounts = {};
    
    Object.values(popularSearches).forEach(search => {
        const params = search.params;
        
        if (field) {
            // Get specific field
            if (params[field]) {
                const term = String(params[field]).toLowerCase();
                termCounts[term] = (termCounts[term] || 0) + search.count;
            }
        } else {
            // Get all terms
            Object.entries(params).forEach(([key, value]) => {
                if (key !== 'searchedAt' && value) {
                    const term = String(value).toLowerCase();
                    termCounts[term] = (termCounts[term] || 0) + search.count;
                }
            });
        }
    });
    
    // Sort and return top terms
    return Object.entries(termCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([term, count]) => ({ term, count }));
}

function getSearchHistory() {
    initStorage();
    return safeParseJSON(STORAGE_KEYS.SEARCH_HISTORY, []);
}

function removeSearchHistoryItem(index) {
    initStorage();
    const history = safeParseJSON(STORAGE_KEYS.SEARCH_HISTORY, []);
    if (index >= 0 && index < history.length) {
        history.splice(index, 1);
        safeSetItem(STORAGE_KEYS.SEARCH_HISTORY, history);
    }
}

function clearSearchHistory() {
    initStorage();
    safeSetItem(STORAGE_KEYS.SEARCH_HISTORY, []);
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

// Comment functions
function addComment(uploadId, text) {
    if (!text || text.trim().length === 0) {
        return { success: false, message: 'Comment cannot be empty' };
    }
    
    if (text.trim().length > 1000) {
        return { success: false, message: 'Comment is too long (max 1000 characters)' };
    }
    
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        return { success: false, message: 'You must be logged in to comment' };
    }
    
    initStorage();
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    
    // Check if upload exists
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) {
        return { success: false, message: 'Post not found' };
    }
    
    const newComment = {
        id: Date.now().toString(),
        uploadId,
        userId: currentUser.id,
        username: currentUser.username,
        text: sanitizeHTML(text.trim()),
        createdAt: new Date().toISOString()
    };
    
    comments.push(newComment);
    const result = safeSetItem(STORAGE_KEYS.COMMENTS, comments);
    
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to save comment' };
    }
    
    return { success: true, comment: newComment };
}

function getComments(uploadId) {
    initStorage();
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    return comments
        .filter(c => c.uploadId === uploadId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function deleteComment(commentId) {
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        return { success: false, message: 'You must be logged in' };
    }
    
    initStorage();
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
        return { success: false, message: 'Comment not found' };
    }
    
    // Check if user owns the comment or is admin
    if (comment.userId !== currentUser.id && !isAdmin(currentUser)) {
        return { success: false, message: 'You can only delete your own comments' };
    }
    
    const filtered = comments.filter(c => c.id !== commentId);
    const result = safeSetItem(STORAGE_KEYS.COMMENTS, filtered);
    
    if (!result.success) {
        return { success: false, message: result.error || 'Failed to delete comment' };
    }
    
    return { success: true };
}

function getCommentCount(uploadId) {
    initStorage();
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    return comments.filter(c => c.uploadId === uploadId).length;
}

// Admin statistics functions
function getAdminStatistics() {
    initStorage();
    
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const users = safeParseJSON(STORAGE_KEYS.USERS, []);
    const reports = safeParseJSON(STORAGE_KEYS.REPORTS, []);
    const likes = safeParseJSON(STORAGE_KEYS.LIKES, []);
    const comments = safeParseJSON(STORAGE_KEYS.COMMENTS, []);
    const favorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
    
    // Calculate statistics
    const totalUploads = uploads.length;
    const publicUploads = uploads.filter(u => !u.isPrivate).length;
    const privateUploads = uploads.filter(u => u.isPrivate).length;
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
        // User is active if they have uploaded something in the last 30 days
        const userUploads = uploads.filter(up => up.uploadedBy === u.id);
        if (userUploads.length === 0) return false;
        const lastUpload = userUploads.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
        const daysSinceLastUpload = (new Date() - new Date(lastUpload.uploadedAt)) / (1000 * 60 * 60 * 24);
        return daysSinceLastUpload <= 30;
    }).length;
    
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const reviewedReports = reports.filter(r => r.status === 'reviewed').length;
    
    const totalLikes = likes.length;
    const totalComments = comments.length;
    const totalFavorites = favorites.length;
    
    // Get top users by upload count
    const userUploadCounts = {};
    uploads.forEach(upload => {
        userUploadCounts[upload.uploadedBy] = (userUploadCounts[upload.uploadedBy] || 0) + 1;
    });
    
    const topUsers = Object.entries(userUploadCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => {
            const user = users.find(u => u.id === userId);
            return {
                id: userId,
                username: user?.username || 'Unknown',
                email: user?.email || 'Unknown',
                uploadCount: count
            };
        });
    
    // Get top posts by views and likes
    const topPosts = uploads
        .map(upload => {
            const likeCount = getLikeCount(upload.id);
            const commentCount = getCommentCount(upload.id);
            const viewCount = upload.viewCount || 0;
            const popularityScore = likeCount * 2 + commentCount * 1.5 + viewCount * 0.1;
            
            return {
                id: upload.id,
                schoolName: upload.schoolName || 'Unknown School',
                location: `${upload.city || ''}, ${upload.country || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown',
                year: upload.year,
                views: viewCount,
                likes: likeCount,
                comments: commentCount,
                popularityScore: popularityScore
            };
        })
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, 10);
    
    return {
        uploads: {
            total: totalUploads,
            public: publicUploads,
            private: privateUploads
        },
        users: {
            total: totalUsers,
            active: activeUsers
        },
        reports: {
            total: totalReports,
            pending: pendingReports,
            reviewed: reviewedReports
        },
        likes: totalLikes,
        comments: totalComments,
        favorites: totalFavorites,
        topUsers: topUsers,
        topPosts: topPosts
    };
}

// Initialize on load
initStorage();

