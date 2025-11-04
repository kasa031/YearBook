let selectedTags = [];
let imageFile = null;
let imageDataUrl = null;

// File input handler
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewImage = document.getElementById('previewImage');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--okra-primary)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--okra-light)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--okra-light)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// MAX_FILE_SIZE is now in CONSTANTS

function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        showToast(`File is too large. Maximum size is ${CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB. Compressing...`, 'info');
    }

    imageFile = file;
    
    try {
        // Compress image if it's large
        let dataUrl;
        if (file.size > CONSTANTS.COMPRESSION_THRESHOLD) {
            showToast('Compressing image...', 'info');
            dataUrl = await compressImage(file);
        } else {
            const reader = new FileReader();
            dataUrl = await new Promise((resolve, reject) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        imageDataUrl = dataUrl;
        previewImage.src = imageDataUrl;
        previewImage.classList.remove('hidden');
        uploadPlaceholder.classList.add('hidden');
        
        if (file.size > CONSTANTS.COMPRESSION_THRESHOLD) {
            showToast('Image compressed successfully', 'success');
        }
    } catch (error) {
        showToast('Error processing image. Please try another file.', 'error');
        console.error(error);
    }
}

// Tags input handler
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

function updateTagsDisplay() {
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

// Upload form handler
const uploadForm = document.getElementById('uploadForm');
const btnSubmit = uploadForm?.querySelector('.btn-submit');

if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable submit button
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Uploading...';
        }
        
        // Check if user is logged in
        const currentUser = safeParseJSON('currentUser', null);
        if (!currentUser) {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Upload Memory';
            }
            const messageDiv = document.getElementById('uploadMessage');
            messageDiv.className = 'error-message show';
            messageDiv.textContent = 'Please login to upload memories. Redirecting...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const schoolName = document.getElementById('schoolName').value.trim();
        const city = document.getElementById('city').value.trim();
        const country = document.getElementById('country').value.trim();
        const year = document.getElementById('year').value;
        const grade = document.getElementById('grade').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!imageDataUrl) {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Upload Memory';
            }
            const messageDiv = document.getElementById('uploadMessage');
            messageDiv.className = 'error-message show';
            messageDiv.textContent = 'Please select an image';
            return;
        }

        const uploadData = {
            schoolName,
            city,
            country,
            year: parseInt(year),
            grade: grade || null,
            description: description || null,
            tags: selectedTags,
            imageUrl: imageDataUrl // Store as base64 for now
        };

        // Rate limiting
        const rateLimit = checkRateLimit('upload', currentUser.id, CONSTANTS.RATE_LIMIT_UPLOADS);
        if (!rateLimit.allowed) {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Upload Memory';
            }
            showToast(rateLimit.message, 'error');
            return;
        }
        
        // Simulate upload delay for better UX
        setTimeout(() => {
            const result = saveUpload(uploadData);
            
            if (result.success) {
                showToast('Upload successful! Your memory has been saved. Redirecting...', 'success');
                
                // Reset form
                uploadForm.reset();
                selectedTags = [];
                updateTagsDisplay();
                previewImage.classList.add('hidden');
                uploadPlaceholder.classList.remove('hidden');
                imageFile = null;
                imageDataUrl = null;

                setTimeout(() => {
                    window.location.href = 'search.html';
                }, 2000);
            } else {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Upload Memory';
                }
                const errorMsg = result.errors ? result.errors.join(', ') : (result.error || 'Upload failed. Please try again.');
                showToast(errorMsg, 'error');
            }
        }, 500);
    });
}

