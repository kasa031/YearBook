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
});

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
    card.addEventListener('click', () => {
        window.location.href = `view.html?id=${upload.id}`;
    });

    const imageUrl = upload.imageUrl || '../assets/images/classroom.jpg';
    const schoolName = upload.schoolName || 'Unknown School';
    const location = [upload.city, upload.country].filter(Boolean).join(', ') || 'Unknown location';
    const year = upload.year || 'Unknown';

    card.innerHTML = `
        <img src="${imageUrl}" alt="${schoolName}" onerror="this.src='../assets/images/classroom.jpg'">
        <div class="upload-card-info">
            <h4>${schoolName}</h4>
            <div class="upload-card-meta">
                ${location} • ${year}
            </div>
        </div>
    `;

    return card;
}

