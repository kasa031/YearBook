// Backup and restore functionality for YearBook

/**
 * Export all user data to JSON file
 */
function exportUserData(userId) {
    try {
        const data = {
            user: safeParseJSON('currentUser', null),
            uploads: safeParseJSON(STORAGE_KEYS.UPLOADS, []).filter(u => u.uploadedBy === userId),
            favorites: safeParseJSON(STORAGE_KEYS.FAVORITES, []).filter(f => f.userId === userId),
            searchHistory: safeParseJSON(STORAGE_KEYS.SEARCH_HISTORY, []),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yearbook-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully', 'success');
        return { success: true };
    } catch (error) {
        logError('Export error:', error);
        showToast('Failed to export data', 'error');
        return { success: false, error: error.message };
    }
}

/**
 * Import user data from JSON file
 */
function importUserData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.version || !data.exportDate) {
                    throw new Error('Invalid backup file format');
                }
                
                // Import uploads
                if (data.uploads && Array.isArray(data.uploads)) {
                    const existingUploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
                    // Merge uploads (avoid duplicates by ID)
                    data.uploads.forEach(upload => {
                        if (!existingUploads.find(eu => eu.id === upload.id)) {
                            existingUploads.push(upload);
                        }
                    });
                    safeSetItem(STORAGE_KEYS.UPLOADS, existingUploads);
                }
                
                // Import favorites
                if (data.favorites && Array.isArray(data.favorites)) {
                    const existingFavorites = safeParseJSON(STORAGE_KEYS.FAVORITES, []);
                    data.favorites.forEach(fav => {
                        if (!existingFavorites.find(ef => ef.uploadId === fav.uploadId && ef.userId === fav.userId)) {
                            existingFavorites.push(fav);
                        }
                    });
                    safeSetItem(STORAGE_KEYS.FAVORITES, existingFavorites);
                }
                
                showToast('Data imported successfully', 'success');
                resolve({ success: true });
            } catch (error) {
                logError('Import error:', error);
                showToast('Failed to import data: ' + error.message, 'error');
                reject({ success: false, error: error.message });
            }
        };
        
        reader.onerror = () => {
            const error = 'Failed to read file';
            showToast(error, 'error');
            reject({ success: false, error });
        };
        
        reader.readAsText(file);
    });
}

