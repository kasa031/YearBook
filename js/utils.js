// Utility functions for YearBook application

// Constants
const CONSTANTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    COMPRESSION_THRESHOLD: 2 * 1024 * 1024, // 2MB
    RESULTS_PER_PAGE: 12,
    MAX_SEARCH_HISTORY: 10,
    MAX_AUTOCOMPLETE_RESULTS: 5,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 6,
    RATE_LIMIT_UPLOADS: 10,
    RATE_LIMIT_REPORTS: 5,
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    LOCALSTORAGE_WARNING_THRESHOLD: 0.9 // 90% of quota
};

// Debug mode
const DEBUG = false; // Set to true for development

// Logging utility
function log(...args) {
    if (DEBUG) {
        console.log('[YearBook]', ...args);
    }
}

function logError(...args) {
    console.error('[YearBook Error]', ...args);
}

// Safe JSON parsing with error handling
function safeParseJSON(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return defaultValue;
        return JSON.parse(data);
    } catch (error) {
        logError(`Error parsing ${key}:`, error);
        // Remove corrupt data
        try {
            localStorage.removeItem(key);
        } catch (e) {
            logError('Could not remove corrupt data:', e);
        }
        return defaultValue;
    }
}

// Safe localStorage setItem with quota handling
function safeSetItem(key, value) {
    try {
        const jsonString = JSON.stringify(value);
        localStorage.setItem(key, jsonString);
        return { success: true };
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            logError('LocalStorage quota exceeded');
            // Try to cleanup old data
            const cleaned = cleanupOldData();
            if (cleaned) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return { success: true };
                } catch (e2) {
                    logError('Still quota exceeded after cleanup');
                    return { 
                        success: false, 
                        error: 'Storage full. Please delete some old data.',
                        type: 'quota'
                    };
                }
            }
            return { 
                success: false, 
                error: 'Storage full. Please delete some old data.',
                type: 'quota'
            };
        }
        logError('Error setting localStorage:', e);
        return { 
            success: false, 
            error: 'Failed to save data.',
            type: 'unknown'
        };
    }
}

// Cleanup old data to free up space
function cleanupOldData() {
    try {
        // Clean up old search history (keep only last 5)
        const history = safeParseJSON('yearbook_search_history', []);
        if (history.length > 5) {
            safeSetItem('yearbook_search_history', history.slice(0, 5));
            log('Cleaned up search history');
        }
        
        // Clean up old favorites (optional - could remove oldest)
        // For now, we'll just log
        log('Cleanup completed');
        return true;
    } catch (e) {
        logError('Error during cleanup:', e);
        return false;
    }
}

// Check localStorage quota
function checkStorageQuota() {
    try {
        if (!('storage' in navigator && 'estimate' in navigator.storage)) {
            return { available: true, percentUsed: 0 };
        }
        
        navigator.storage.estimate().then(estimate => {
            const percentUsed = (estimate.usage / estimate.quota) * 100;
            if (percentUsed > CONSTANTS.LOCALSTORAGE_WARNING_THRESHOLD * 100) {
                logError(`Storage quota warning: ${percentUsed.toFixed(2)}% used`);
            }
            return { 
                available: percentUsed < 100, 
                percentUsed: percentUsed.toFixed(2),
                usage: estimate.usage,
                quota: estimate.quota
            };
        });
        return { available: true, percentUsed: 0 };
    } catch (e) {
        logError('Error checking storage quota:', e);
        return { available: true, percentUsed: 0 };
    }
}

// Rate limiting
function checkRateLimit(action, userId, maxActions = null, timeWindow = null) {
    const max = maxActions || CONSTANTS.RATE_LIMIT_UPLOADS;
    const window = timeWindow || CONSTANTS.RATE_LIMIT_WINDOW;
    const key = `rateLimit_${action}_${userId || 'anonymous'}`;
    const now = Date.now();
    
    const data = safeParseJSON(key, { count: 0, resetAt: 0 });
    
    if (now > data.resetAt) {
        data.count = 0;
        data.resetAt = now + window;
    }
    
    if (data.count >= max) {
        const resetIn = Math.ceil((data.resetAt - now) / 1000);
        return { 
            allowed: false, 
            resetIn: resetIn,
            message: `Too many ${action} attempts. Please wait ${resetIn} seconds.`
        };
    }
    
    data.count++;
    safeSetItem(key, data);
    return { allowed: true, remaining: max - data.count };
}

// Input validation
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

function validateUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    return trimmed.length >= CONSTANTS.MIN_USERNAME_LENGTH && 
           trimmed.length <= CONSTANTS.MAX_USERNAME_LENGTH && 
           /^[a-zA-Z0-9_]+$/.test(trimmed);
}

function validatePassword(password) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= CONSTANTS.MIN_PASSWORD_LENGTH;
}

function validateSchoolName(schoolName) {
    if (!schoolName || typeof schoolName !== 'string') return false;
    return schoolName.trim().length >= 2;
}

function validateCity(city) {
    if (!city || typeof city !== 'string') return false;
    return city.trim().length >= 2;
}

function validateCountry(country) {
    if (!country || typeof country !== 'string') return false;
    return country.trim().length >= 2;
}

function validateYear(year) {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear;
}

function validateSchoolData(data) {
    const errors = [];
    
    if (!validateSchoolName(data.schoolName)) {
        errors.push('School name must be at least 2 characters');
    }
    
    if (!validateCity(data.city)) {
        errors.push('City must be at least 2 characters');
    }
    
    if (!validateCountry(data.country)) {
        errors.push('Country must be at least 2 characters');
    }
    
    if (!validateYear(data.year)) {
        errors.push(`Year must be between 1900 and ${new Date().getFullYear()}`);
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Escape HTML entities
function escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}

// Create safe HTML element
function createSafeElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}

// Toast notification system (moved from multiple files)
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = createSafeElement('div', `toast toast-${type}`, message);
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Error boundary handler
function setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
        logError('Global error:', event.error);
        if (event.error && event.error.message) {
            showToast('An error occurred. Please refresh the page if the problem persists.', 'error');
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        logError('Unhandled promise rejection:', event.reason);
        showToast('An error occurred. Please refresh the page if the problem persists.', 'error');
    });
}

// Initialize error handling on load
if (typeof window !== 'undefined') {
    setupErrorHandling();
}

