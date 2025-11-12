// Get memory ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memoryId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (!memoryId) {
        showNotFound();
        return;
    }

    loadMemory(memoryId);
});

function loadMemory(id) {
    const loading = document.getElementById('loading');
    const memoryView = document.getElementById('memoryView');
    const notFound = document.getElementById('notFound');

    const memory = getUploadById(id);

    if (!memory) {
        loading.classList.add('hidden');
        // Check if it's a private post
        const uploads = safeParseJSON(STORAGE_KEYS.UPLOADS, []);
        const upload = uploads.find(u => u.id === id);
        if (upload && upload.isPrivate) {
            showNotFound('This post is private and only visible to the owner.');
        } else {
            showNotFound();
        }
        return;
    }

    // Populate memory data
    document.getElementById('memoryImage').src = memory.imageUrl || '../assets/images/classroom.jpg';
    document.getElementById('schoolName').textContent = memory.schoolName || 'Unknown School';
    
    const locationParts = [];
    if (memory.city) locationParts.push(memory.city);
    if (memory.country) locationParts.push(memory.country);
    document.getElementById('location').textContent = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown location';
    
    document.getElementById('year').textContent = memory.year || 'Unknown';
    
    if (memory.grade) {
        document.getElementById('grade').textContent = memory.grade;
        document.getElementById('gradeItem').style.display = 'flex';
    } else {
        document.getElementById('gradeItem').style.display = 'none';
    }

    const uploadedDate = new Date(memory.uploadedAt);
    document.getElementById('uploadedDate').textContent = uploadedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    if (memory.description) {
        document.getElementById('description').textContent = memory.description;
        document.getElementById('descriptionSection').style.display = 'block';
    } else {
        document.getElementById('descriptionSection').style.display = 'none';
    }

    if (memory.tags && memory.tags.length > 0) {
        const tagsDisplay = document.getElementById('tagsDisplay');
        tagsDisplay.innerHTML = '';
        memory.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsDisplay.appendChild(tagElement);
        });
        document.getElementById('tagsSection').style.display = 'block';
    } else {
        document.getElementById('tagsSection').style.display = 'none';
    }

    // Increment view count
    incrementViewCount(id);
    const viewCount = getUploadById(id)?.viewCount || 0;
    
    // Display view count
    const viewCountElement = document.getElementById('viewCount');
    if (viewCountElement) {
        viewCountElement.textContent = `${viewCount} view${viewCount !== 1 ? 's' : ''}`;
    }

    loading.classList.add('hidden');
    memoryView.classList.remove('hidden');
    
    // Initialize all functionalities
    initReportFunctionality(memoryId);
    initFavoriteFunctionality(memoryId);
    initDownloadFunctionality(memoryId);
    initShareFunctionality(memoryId);
    initEditDeleteFunctionality(memoryId);
    initNavigationFunctionality(memoryId);
    initScrollToTop();
}

function showNotFound(message) {
    const loading = document.getElementById('loading');
    const notFound = document.getElementById('notFound');
    loading.classList.add('hidden');
    notFound.classList.remove('hidden');
    
    // Update message if provided
    if (message && notFound.querySelector('p')) {
        notFound.querySelector('p').textContent = message;
    }
}

// Report functionality
function initReportFunctionality(uploadId) {
    const reportBtn = document.getElementById('reportBtn');
    const reportModal = document.getElementById('reportModal');
    const reportForm = document.getElementById('reportForm');
    const cancelBtn = document.getElementById('cancelReport');
    const closeBtn = reportModal?.querySelector('.report-modal-close');
    
    if (!reportBtn || !reportModal) return;
    
    // Open modal
    reportBtn.addEventListener('click', () => {
        reportModal.classList.remove('hidden');
    });
    
    // Close modal
    const closeModal = () => {
        reportModal.classList.add('hidden');
        reportForm.reset();
        const messageDiv = document.getElementById('reportMessage');
        if (messageDiv) {
            messageDiv.className = '';
            messageDiv.textContent = '';
        }
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            closeModal();
        }
    });
    
    // Submit report
    if (reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const reason = document.getElementById('reportReason').value;
            const description = document.getElementById('reportDescription').value.trim();
            const messageDiv = document.getElementById('reportMessage');
            
            if (!reason) {
                messageDiv.className = 'error-message show';
                messageDiv.textContent = 'Please select a reason';
                return;
            }
            
            const result = reportUpload(uploadId, reason, description);
            
            if (result.success) {
                messageDiv.className = 'success-message show';
                messageDiv.textContent = 'Thank you for your report. We will review it shortly.';
                
                setTimeout(() => {
                    closeModal();
                }, 2000);
            } else {
                messageDiv.className = 'error-message show';
                messageDiv.textContent = result.message || 'Failed to submit report. Please try again.';
            }
        });
    }
}

// Favorite functionality
function initFavoriteFunctionality(uploadId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;
    
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        favoriteBtn.style.display = 'none';
        return;
    }
    
    const isFav = isFavorited(uploadId, currentUser.id);
    updateFavoriteButton(favoriteBtn, isFav);
    
    favoriteBtn.addEventListener('click', () => {
        if (isFavorited(uploadId, currentUser.id)) {
            removeFavorite(uploadId, currentUser.id);
            updateFavoriteButton(favoriteBtn, false);
            showToast('Removed from favorites', 'success');
        } else {
            addFavorite(uploadId, currentUser.id);
            updateFavoriteButton(favoriteBtn, true);
            showToast('Added to favorites', 'success');
        }
    });
}

function updateFavoriteButton(btn, isFavorite) {
    if (isFavorite) {
        btn.textContent = '❤️ Favorited';
        btn.classList.add('favorited');
    } else {
        btn.textContent = '🤍 Add to Favorites';
        btn.classList.remove('favorited');
    }
}

// Share functionality
function initShareFunctionality(uploadId) {
    const shareBtn = document.getElementById('shareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            sharePost(uploadId);
        });
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            copyPostLink(uploadId);
        });
    }
}

function sharePost(uploadId) {
    const url = `${window.location.origin}${window.location.pathname}?id=${uploadId}`;
    const title = document.getElementById('schoolName')?.textContent || 'YearBook Memory';
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: 'Check out this school memory on YearBook!',
            url: url
        }).catch(() => {
            copyPostLink(uploadId);
        });
    } else {
        copyPostLink(uploadId);
    }
}

function copyPostLink(uploadId) {
    const url = `${window.location.origin}${window.location.pathname}?id=${uploadId}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Link copied to clipboard!', 'success');
    });
}

// Edit/Delete functionality
function initEditDeleteFunctionality(uploadId) {
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) return;
    
    const canEdit = canEditUpload(uploadId, currentUser.id);
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (canEdit) {
        if (editBtn) editBtn.classList.remove('hidden');
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                window.location.href = `edit.html?id=${uploadId}`;
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                showDeleteConfirmModal(uploadId);
            });
        }
    }
}

// Navigation functionality (previous/next)
function initNavigationFunctionality(uploadId) {
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Get current search context from sessionStorage or URL
    const searchFilters = JSON.parse(sessionStorage.getItem('lastSearchFilters') || '{}');
    const allPosts = getUploads(searchFilters);
    const sortedPosts = sortResults(allPosts, 'date');
    const currentIndex = sortedPosts.findIndex(p => p.id === uploadId);
    
    if (currentIndex > 0 && previousBtn) {
        previousBtn.classList.remove('hidden');
        previousBtn.addEventListener('click', () => {
            window.location.href = `view.html?id=${sortedPosts[currentIndex - 1].id}`;
        });
    }
    
    if (currentIndex < sortedPosts.length - 1 && nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.addEventListener('click', () => {
            window.location.href = `view.html?id=${sortedPosts[currentIndex + 1].id}`;
        });
    }
}

// Download functionality
function initDownloadFunctionality(uploadId) {
    const downloadBtn = document.getElementById('downloadBtn');
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', () => {
        const memory = getUploadById(uploadId);
        if (!memory || !memory.imageUrl) {
            showToast('Image not available for download', 'error');
            return;
        }
        
        downloadImage(memory.imageUrl, memory.schoolName || 'YearBook Memory');
    });
}

function downloadImage(imageUrl, filename) {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename.replace(/[^a-z0-9]/gi, '_')}.jpg`;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Image download started', 'success');
}

// Delete confirmation modal
function showDeleteConfirmModal(uploadId) {
    const modal = document.getElementById('deleteConfirmModal');
    const cancelBtn = document.getElementById('cancelDelete');
    const confirmBtn = document.getElementById('confirmDelete');
    
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    const closeModal = () => {
        modal.classList.add('hidden');
    };
    
    if (cancelBtn) {
        cancelBtn.onclick = closeModal;
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const result = deleteUpload(uploadId);
            if (result.success) {
                showToast('Post deleted successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                showToast(result.message || 'Failed to delete post', 'error');
                closeModal();
            }
        };
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on ESC key
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Scroll to top functionality
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    if (!scrollBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.remove('hidden');
        } else {
            scrollBtn.classList.add('hidden');
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// showToast is now in utils.js - no need to redefine

