let selectedTags = [];
let imageFiles = []; // Changed to array for multiple files
let imageDataUrls = []; // Changed to array for multiple data URLs

// File input handler
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPreview = document.getElementById('uploadPreview');
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        handleFilesSelect(files);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        handleFilesSelect(files);
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

async function handleFilesSelect(files) {
    // Filter only image files
    const imageFilesArray = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFilesArray.length === 0) {
        showToast('Please select image files only', 'error');
        return;
    }

    // Limit to 10 files max
    if (imageFilesArray.length > 10) {
        showToast('Maximum 10 images allowed. Only the first 10 will be processed.', 'info');
        imageFilesArray.splice(10);
    }

    // Clear previous previews
    imageFiles = [];
    imageDataUrls = [];
    uploadPreview.innerHTML = '';
    uploadPlaceholder.classList.add('hidden');

    // Show loading indicator
    const loadingDiv = createSafeElement('div', 'upload-loading', 'Processing images...');
    uploadPreview.appendChild(loadingDiv);

    // Process all files
    try {
        for (let i = 0; i < imageFilesArray.length; i++) {
            const file = imageFilesArray[i];
            
            if (file.size > CONSTANTS.MAX_FILE_SIZE) {
                showToast(`File "${file.name}" is too large. Compressing...`, 'info');
            }

            imageFiles.push(file);
            
            // Compress image if it's large
            let dataUrl;
            if (file.size > CONSTANTS.COMPRESSION_THRESHOLD) {
                dataUrl = await compressImage(file);
            } else {
                const reader = new FileReader();
                dataUrl = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
            
            imageDataUrls.push(dataUrl);
        }

        // Remove loading indicator
        loadingDiv.remove();

        // Display all previews
        imageDataUrls.forEach((dataUrl, index) => {
            const previewContainer = createSafeElement('div', 'preview-item');
            const previewImage = createSafeElement('img', 'preview-image');
            previewImage.src = dataUrl;
            previewImage.alt = `Preview ${index + 1}`;
            
            const removeBtn = createSafeElement('button', 'preview-remove', '×');
            removeBtn.setAttribute('aria-label', 'Remove image');
            removeBtn.onclick = () => {
                imageFiles.splice(index, 1);
                imageDataUrls.splice(index, 1);
                updatePreviews();
            };
            
            previewContainer.appendChild(previewImage);
            previewContainer.appendChild(removeBtn);
            uploadPreview.appendChild(previewContainer);
        });

        if (imageFiles.length > 0) {
            showToast(`${imageFiles.length} image(s) ready for upload`, 'success');
        }
    } catch (error) {
        showToast('Error processing images. Please try again.', 'error');
        console.error(error);
        uploadPreview.innerHTML = '';
        uploadPlaceholder.classList.remove('hidden');
    }
}

function updatePreviews() {
    uploadPreview.innerHTML = '';
    
    if (imageDataUrls.length === 0) {
        uploadPlaceholder.classList.remove('hidden');
        return;
    }
    
    uploadPlaceholder.classList.add('hidden');
    
    imageDataUrls.forEach((dataUrl, index) => {
        const previewContainer = createSafeElement('div', 'preview-item');
        const previewImage = createSafeElement('img', 'preview-image');
        previewImage.src = dataUrl;
        previewImage.alt = `Preview ${index + 1}`;
        
        const removeBtn = createSafeElement('button', 'preview-remove', '×');
        removeBtn.setAttribute('aria-label', 'Remove image');
        removeBtn.onclick = () => {
            imageFiles.splice(index, 1);
            imageDataUrls.splice(index, 1);
            updatePreviews();
        };
        
        previewContainer.appendChild(previewImage);
        previewContainer.appendChild(removeBtn);
        uploadPreview.appendChild(previewContainer);
    });
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

        if (imageDataUrls.length === 0) {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Upload Memory';
            }
            const messageDiv = document.getElementById('uploadMessage');
            messageDiv.className = 'error-message show';
            messageDiv.textContent = 'Please select at least one image';
            return;
        }

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

        // Upload all images
        let successCount = 0;
        let failCount = 0;
        const totalImages = imageDataUrls.length;

        if (btnSubmit) {
            btnSubmit.textContent = `Uploading 0/${totalImages}...`;
        }

        for (let i = 0; i < imageDataUrls.length; i++) {
        const isPrivate = document.getElementById('isPrivate')?.checked || false;
        
        const uploadData = {
            schoolName,
            city,
            country,
            year: parseInt(year),
            grade: grade || null,
            description: description || null,
            tags: selectedTags,
            imageUrl: imageDataUrls[i], // Store as base64 for now
            isPrivate: isPrivate, // Private mode flag
            uploadedBy: currentUser.id
        };

            const result = saveUpload(uploadData);
            
            if (result.success) {
                successCount++;
            } else {
                failCount++;
                console.error('Upload failed for image', i + 1, result);
            }

            // Update progress
            if (btnSubmit) {
                btnSubmit.textContent = `Uploading ${i + 1}/${totalImages}...`;
            }
        }

        // Reset form
        uploadForm.reset();
        selectedTags = [];
        updateTagsDisplay();
        uploadPreview.innerHTML = '';
        uploadPlaceholder.classList.remove('hidden');
        imageFiles = [];
        imageDataUrls = [];

        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Upload Memory';
        }

        // Show result
        if (successCount > 0) {
            if (failCount > 0) {
                showToast(`${successCount} image(s) uploaded successfully, ${failCount} failed. Redirecting...`, 'info');
            } else {
                showToast(`${successCount} image(s) uploaded successfully! Redirecting...`, 'success');
            }
            setTimeout(() => {
                window.location.href = 'search.html';
            }, 2000);
        } else {
            showToast('All uploads failed. Please try again.', 'error');
        }
    });
}

