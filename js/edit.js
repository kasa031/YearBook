const urlParams = new URLSearchParams(window.location.search);
const uploadId = urlParams.get('id');

let selectedTags = [];
let currentUpload = null;

// showToast is now in utils.js - no need to redefine

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = safeParseJSON('currentUser', null);
    
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
        const tagItem = createSafeElement('div', 'tag-item');
        const tagSpan = createSafeElement('span', '', escapeHTML(tag));
        const removeSpan = createSafeElement('span', 'tag-remove', '×');
        removeSpan.addEventListener('click', () => {
            selectedTags.splice(index, 1);
            updateTagsDisplay();
        });
        tagItem.appendChild(tagSpan);
        tagItem.appendChild(removeSpan);
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

