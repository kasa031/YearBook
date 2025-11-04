const urlParams = new URLSearchParams(window.location.search);
const uploadId = urlParams.get('id');

let selectedTags = [];
let currentUpload = null;

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

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    if (!uploadId) {
        window.location.href = 'profile.html';
        return;
    }
    
    currentUpload = getUploadById(uploadId);
    
    if (!currentUpload) {
        window.location.href = 'profile.html';
        return;
    }
    
    // Check if user can edit
    if (!canEditUpload(uploadId, currentUser.id)) {
        showToast('You do not have permission to edit this post', 'error');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
        return;
    }
    
    // Populate form
    populateForm();
    
    // Setup tags
    setupTags();
    
    // Setup form submission
    setupFormSubmission();
});

function populateForm() {
    document.getElementById('schoolName').value = currentUpload.schoolName || '';
    document.getElementById('city').value = currentUpload.city || '';
    document.getElementById('country').value = currentUpload.country || '';
    document.getElementById('year').value = currentUpload.year || '';
    document.getElementById('grade').value = currentUpload.grade || '';
    document.getElementById('description').value = currentUpload.description || '';
    document.getElementById('previewImage').src = currentUpload.imageUrl || '../assets/images/classroom.jpg';
    
    selectedTags = currentUpload.tags || [];
    updateTagsDisplay();
}

function setupTags() {
    const tagInput = document.getElementById('tagInput');
    const tagsDisplay = document.getElementById('tagsDisplay');
    
    tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.value.trim();
            if (tag && !selectedTags.includes(tag)) {
                selectedTags.push(tag);
                tagInput.value = '';
                updateTagsDisplay();
            }
        }
    });
}

function updateTagsDisplay() {
    const tagsDisplay = document.getElementById('tagsDisplay');
    tagsDisplay.innerHTML = '';
    selectedTags.forEach((tag, index) => {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-item';
        tagItem.innerHTML = `
            <span>${tag}</span>
            <span class="tag-remove" data-index="${index}">×</span>
        `;
        tagItem.querySelector('.tag-remove').addEventListener('click', () => {
            selectedTags.splice(index, 1);
            updateTagsDisplay();
        });
        tagsDisplay.appendChild(tagItem);
    });
}

function setupFormSubmission() {
    const editForm = document.getElementById('editForm');
    const btnSubmit = editForm.querySelector('.btn-submit');
    
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Saving...';
        }
        
        const schoolName = document.getElementById('schoolName').value.trim();
        const city = document.getElementById('city').value.trim();
        const country = document.getElementById('country').value.trim();
        const year = document.getElementById('year').value;
        const grade = document.getElementById('grade').value.trim();
        const description = document.getElementById('description').value.trim();
        
        const updatedData = {
            schoolName,
            city,
            country,
            year: parseInt(year),
            grade: grade || null,
            description: description || null,
            tags: selectedTags
        };
        
        setTimeout(() => {
            const result = updateUpload(uploadId, updatedData);
            
            if (result.success) {
                showToast('Changes saved successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = `view.html?id=${uploadId}`;
                }, 1500);
            } else {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Save Changes';
                }
                showToast(result.message || 'Failed to save changes. Please try again.', 'error');
            }
        }, 500);
    });
}

