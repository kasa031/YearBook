// Make currentUser available globally for export button
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        currentUser = safeParseJSON('currentUser', null);
        const notLoggedIn = document.getElementById('notLoggedIn');
        const profileContent = document.getElementById('profileContent');

        if (!notLoggedIn || !profileContent) {
            console.error('Profile page elements not found');
            return;
        }

        if (!currentUser) {
            notLoggedIn.classList.remove('hidden');
            return;
        }

        profileContent.classList.remove('hidden');
        
        // Populate user info
        const usernameEl = document.getElementById('username');
        const emailEl = document.getElementById('email');
        const memberSinceEl = document.getElementById('memberSince');
        
        if (usernameEl) usernameEl.textContent = currentUser.username || 'N/A';
        if (emailEl) emailEl.textContent = currentUser.email || 'N/A';
        
        if (memberSinceEl) {
            if (currentUser.createdAt) {
                try {
                    const createdDate = new Date(currentUser.createdAt);
                    memberSinceEl.textContent = createdDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                } catch (e) {
                    memberSinceEl.textContent = 'Unknown';
                }
            } else {
                memberSinceEl.textContent = 'Unknown';
            }
        }

        // Load user's uploads
        try {
            loadUserUploads(currentUser.id);
        } catch (e) {
            console.error('Error loading user uploads:', e);
            showToast('Error loading uploads', 'error');
        }
        
        // Load favorites
        try {
            loadFavorites(currentUser.id);
        } catch (e) {
            console.error('Error loading favorites:', e);
            showToast('Error loading favorites', 'error');
        }
        
        // Initialize tabs
        try {
            initTabs();
        } catch (e) {
            console.error('Error initializing tabs:', e);
        }
        
        // Setup export/import
        setupBackupRestore();
    } catch (error) {
        console.error('Error in profile page:', error);
        showToast('An error occurred. Please refresh the page.', 'error');
    }
});

function setupBackupRestore() {
    // Export button is handled inline in HTML
    // Import is handled by handleImport function
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showToast('Please select a valid JSON file', 'error');
        return;
    }
    
    importUserData(file).then(() => {
        // Reload data
        const currentUser = safeParseJSON('currentUser', null);
        if (currentUser) {
            loadUserUploads(currentUser.id);
            loadFavorites(currentUser.id);
        }
        // Reset file input
        event.target.value = '';
    }).catch(() => {
        event.target.value = '';
    });
}

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide content
            const tab = btn.dataset.tab;
            document.getElementById('uploadsTab').classList.toggle('hidden', tab !== 'uploads');
            document.getElementById('favoritesTab').classList.toggle('hidden', tab !== 'favorites');
        });
    });
}

function loadFavorites(userId) {
    const favorites = getFavoriteUploads(userId);
    const myFavorites = document.getElementById('myFavorites');
    const noFavorites = document.getElementById('noFavorites');

    if (favorites.length === 0) {
        if (myFavorites) myFavorites.classList.add('hidden');
        if (noFavorites) noFavorites.classList.remove('hidden');
        return;
    }

    if (myFavorites) {
        myFavorites.innerHTML = '';
        
        // Add header with count
        const header = createSafeElement('div', 'favorites-header');
        const countText = createSafeElement('span', 'favorites-count', `${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`);
        header.appendChild(countText);
        myFavorites.appendChild(header);
        
        favorites.forEach(upload => {
            const card = createFavoriteCard(upload, userId);
            myFavorites.appendChild(card);
        });
        myFavorites.classList.remove('hidden');
    }
    if (noFavorites) noFavorites.classList.add('hidden');
}

function createFavoriteCard(upload, userId) {
    const card = createSafeElement('div', 'upload-card favorite-card');
    
    const imageUrl = upload.imageUrl || '../assets/images/classroom.jpg';
    const schoolName = escapeHTML(upload.schoolName || 'Unknown School');
    const location = escapeHTML([upload.city, upload.country].filter(Boolean).join(', ') || 'Unknown location');
    const year = upload.year || 'Unknown';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = schoolName;
    img.onerror = function() { this.src = '../assets/images/classroom.jpg'; };
    
    const info = createSafeElement('div', 'upload-card-info');
    const h4 = createSafeElement('h4', '', schoolName);
    const meta = createSafeElement('div', 'upload-card-meta');
    meta.textContent = `${location} • ${year}${upload.viewCount ? ` • ${upload.viewCount} views` : ''}`;
    
    // Add favorite badge
    const favoriteBadge = createSafeElement('span', 'favorite-badge', '❤️ Favorited');
    
    // Add remove favorite button
    const actions = createSafeElement('div', 'upload-card-actions');
    const removeBtn = createSafeElement('button', 'btn-remove-favorite');
    removeBtn.innerHTML = '🗑️ Remove';
    removeBtn.setAttribute('aria-label', 'Remove from favorites');
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeFavorite(upload.id, userId);
        showToast('Removed from favorites', 'success');
        loadFavorites(userId);
    };
    
    actions.appendChild(favoriteBadge);
    actions.appendChild(removeBtn);
    
    info.appendChild(h4);
    info.appendChild(meta);
    info.appendChild(actions);
    
    card.appendChild(img);
    card.appendChild(info);

    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on action buttons
        if (e.target.closest('.upload-card-actions')) return;
        window.location.href = `view.html?id=${upload.id}`;
    });

    return card;
}

function loadUserUploads(userId) {
    initStorage();
    const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
    const userUploads = uploads.filter(upload => upload.uploadedBy === userId);

    const myUploads = document.getElementById('myUploads');
    const noUploads = document.getElementById('noUploads');

    if (userUploads.length === 0) {
        myUploads.classList.add('hidden');
        noUploads.classList.remove('hidden');
        return;
    }

    myUploads.innerHTML = '';
    userUploads.forEach(upload => {
        const card = createUploadCard(upload);
        myUploads.appendChild(card);
    });
}

function createUploadCard(upload) {
    const card = createSafeElement('div', 'upload-card');
    
    const imageUrl = upload.imageUrl || '../assets/images/classroom.jpg';
    const schoolName = escapeHTML(upload.schoolName || 'Unknown School');
    const location = escapeHTML([upload.city, upload.country].filter(Boolean).join(', ') || 'Unknown location');
    const year = upload.year || 'Unknown';
    const currentUser = safeParseJSON('currentUser', null);
    const canEdit = currentUser && upload.uploadedBy === currentUser.id;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = schoolName;
    img.onerror = function() { this.src = '../assets/images/classroom.jpg'; };
    
    const info = createSafeElement('div', 'upload-card-info');
    const h4 = createSafeElement('h4', '', schoolName);
    const meta = createSafeElement('div', 'upload-card-meta');
    meta.textContent = `${location} • ${year}${upload.viewCount ? ` • ${upload.viewCount} views` : ''}`;
    
    info.appendChild(h4);
    info.appendChild(meta);
    
    if (canEdit) {
        const actions = createSafeElement('div', 'upload-card-actions');
        const editBtn = createSafeElement('button', 'btn-edit-small');
        editBtn.textContent = 'Edit';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `edit.html?id=${upload.id}`;
        };
        
        const deleteBtn = createSafeElement('button', 'btn-delete-small');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteMyPost(upload.id);
        };
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        info.appendChild(actions);
    }
    
    card.appendChild(img);
    card.appendChild(info);

    card.addEventListener('click', () => {
        window.location.href = `view.html?id=${upload.id}`;
    });

    return card;
}

// showToast is now in utils.js - no need to redefine

function deleteMyPost(uploadId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    const result = deleteUpload(uploadId);
    if (result.success) {
        showToast('Post deleted successfully', 'success');
        const currentUser = safeParseJSON('currentUser', null);
        if (currentUser) {
            loadUserUploads(currentUser.id);
            loadFavorites(currentUser.id);
        }
    } else {
        showToast('Failed to delete post', 'error');
    }
}

