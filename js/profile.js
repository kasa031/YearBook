document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const notLoggedIn = document.getElementById('notLoggedIn');
    const profileContent = document.getElementById('profileContent');

    if (!currentUser) {
        notLoggedIn.classList.remove('hidden');
        return;
    }

    profileContent.classList.remove('hidden');
    
    // Populate user info
    document.getElementById('username').textContent = currentUser.username || 'N/A';
    document.getElementById('email').textContent = currentUser.email || 'N/A';
    
    if (currentUser.createdAt) {
        const createdDate = new Date(currentUser.createdAt);
        document.getElementById('memberSince').textContent = createdDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else {
        document.getElementById('memberSince').textContent = 'Unknown';
    }

    // Load user's uploads
    loadUserUploads(currentUser.id);
    loadFavorites(currentUser.id);
    
    // Initialize tabs
    initTabs();
});

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
        favorites.forEach(upload => {
            const card = createUploadCard(upload);
            myFavorites.appendChild(card);
        });
        myFavorites.classList.remove('hidden');
    }
    if (noFavorites) noFavorites.classList.add('hidden');
}

function loadUserUploads(userId) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
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
    const card = document.createElement('div');
    card.className = 'upload-card';
    
    const imageUrl = upload.imageUrl || '../assets/images/classroom.jpg';
    const schoolName = upload.schoolName || 'Unknown School';
    const location = [upload.city, upload.country].filter(Boolean).join(', ') || 'Unknown location';
    const year = upload.year || 'Unknown';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const canEdit = currentUser && upload.uploadedBy === currentUser.id;

    card.innerHTML = `
        <img src="${imageUrl}" alt="${schoolName}" onerror="this.src='../assets/images/classroom.jpg'">
        <div class="upload-card-info">
            <h4>${schoolName}</h4>
            <div class="upload-card-meta">
                ${location} • ${year}
                ${upload.viewCount ? ` • ${upload.viewCount} views` : ''}
            </div>
            ${canEdit ? `
                <div class="upload-card-actions">
                    <button class="btn-edit-small" onclick="event.stopPropagation(); window.location.href='edit.html?id=${upload.id}'">Edit</button>
                    <button class="btn-delete-small" onclick="event.stopPropagation(); deleteMyPost('${upload.id}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `;

    card.addEventListener('click', () => {
        window.location.href = `view.html?id=${upload.id}`;
    });

    return card;
}

// Toast notification system
function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function deleteMyPost(uploadId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    const result = deleteUpload(uploadId);
    if (result.success) {
        showToast('Post deleted successfully', 'success');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        loadUserUploads(currentUser.id);
        loadFavorites(currentUser.id);
    } else {
        showToast('Failed to delete post', 'error');
    }
}

