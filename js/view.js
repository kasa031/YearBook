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
        showNotFound();
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

    loading.classList.add('hidden');
    memoryView.classList.remove('hidden');
    
    // Initialize report functionality
    initReportFunctionality(memoryId);
}

function showNotFound() {
    const loading = document.getElementById('loading');
    const notFound = document.getElementById('notFound');
    loading.classList.add('hidden');
    notFound.classList.remove('hidden');
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

