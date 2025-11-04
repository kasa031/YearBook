document.addEventListener('DOMContentLoaded', () => {
    const currentUser = safeParseJSON('currentUser', null);
    const notAdmin = document.getElementById('notAdmin');
    const adminContent = document.getElementById('adminContent');

    // Check if user is admin
    if (!currentUser || !isAdmin(currentUser)) {
        notAdmin.classList.remove('hidden');
        return;
    }

    adminContent.classList.remove('hidden');
    
    // Initialize tabs
    initTabs();
    
    // Load reports
    loadReports('pending');
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            btn.classList.add('active');
            // Load reports for selected tab
            loadReports(btn.dataset.tab);
        });
    });
}

function loadReports(status) {
    const container = document.getElementById('reportsContainer');
    container.innerHTML = '<div class="loading-spinner"></div>';

    setTimeout(() => {
        let reports;
        if (status === 'all') {
            reports = getReports();
        } else if (status === 'reviewed') {
            reports = getReports('reviewed');
        } else {
            reports = getReports('pending');
        }

        if (reports.length === 0) {
            container.innerHTML = '<div class="no-reports">No reports found</div>';
            return;
        }

        container.innerHTML = '';
        reports.forEach(report => {
            const reportElement = createReportElement(report);
            container.appendChild(reportElement);
        });
    }, 300);
}

function createReportElement(report) {
    const upload = getUploadById(report.uploadId);
    const div = createSafeElement('div', `report-item ${report.status}`);
    
    const schoolName = escapeHTML(upload?.schoolName || 'Unknown School');
    const location = upload ? escapeHTML(`${upload.city || ''}, ${upload.country || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown location') : 'Unknown location';
    const reportedByUsername = escapeHTML(report.reportedByUsername || 'Unknown');
    const reportedDate = new Date(report.reportedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const reason = escapeHTML(report.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
    const description = report.description ? escapeHTML(report.description) : '';
    const statusText = escapeHTML(report.status.charAt(0).toUpperCase() + report.status.slice(1));

    // Header
    const header = createSafeElement('div', 'report-header');
    const meta = createSafeElement('div', 'report-meta');
    const h3 = createSafeElement('h3', '', schoolName);
    const info = createSafeElement('div', 'report-info');
    
    const reportedBySpan = createSafeElement('span', '', `Reported by: ${reportedByUsername}`);
    const dot1 = createSafeElement('span', '', '•');
    const dateSpan = createSafeElement('span', '', reportedDate);
    const dot2 = createSafeElement('span', '', '•');
    const locationSpan = createSafeElement('span', '', location);
    
    info.appendChild(reportedBySpan);
    info.appendChild(dot1);
    info.appendChild(dateSpan);
    info.appendChild(dot2);
    info.appendChild(locationSpan);
    
    meta.appendChild(h3);
    meta.appendChild(info);
    
    const statusSpan = createSafeElement('span', `report-status ${report.status}`, statusText);
    
    header.appendChild(meta);
    header.appendChild(statusSpan);
    
    // Details
    const details = createSafeElement('div', 'report-details');
    const reasonDiv = createSafeElement('div', 'report-reason');
    reasonDiv.innerHTML = `<strong>Reason:</strong> ${reason}`;
    details.appendChild(reasonDiv);
    
    if (description) {
        const descDiv = createSafeElement('div', 'report-description');
        descDiv.innerHTML = `<strong>Details:</strong> ${description}`;
        details.appendChild(descDiv);
    }
    
    // Actions
    const actions = createSafeElement('div', 'report-actions');
    const viewLink = createSafeElement('a', 'btn-view-post');
    viewLink.href = `view.html?id=${report.uploadId}`;
    viewLink.target = '_blank';
    viewLink.textContent = 'View Post';
    actions.appendChild(viewLink);
    
    if (report.status === 'pending') {
        const dismissBtn = createSafeElement('button', 'btn-dismiss');
        dismissBtn.textContent = 'Dismiss';
        dismissBtn.onclick = () => dismissReport(report.id);
        actions.appendChild(dismissBtn);
        
        const deleteBtn = createSafeElement('button', 'btn-delete');
        deleteBtn.textContent = 'Delete Post';
        deleteBtn.onclick = () => deletePost(report.uploadId, report.id);
        actions.appendChild(deleteBtn);
    } else if (report.reviewedBy) {
        const reviewedSpan = createSafeElement('span', '');
        reviewedSpan.style.cssText = 'color: var(--text-light); font-size: 0.9rem;';
        reviewedSpan.textContent = 'Reviewed by admin';
        actions.appendChild(reviewedSpan);
    }
    
    div.appendChild(header);
    div.appendChild(details);
    div.appendChild(actions);

    return div;
}

function dismissReport(reportId) {
    if (!confirm('Are you sure you want to dismiss this report? The post will remain visible.')) {
        return;
    }

    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        showToast('Not logged in', 'error');
        return;
    }
    const result = updateReportStatus(reportId, 'reviewed', currentUser.id);
    
    if (result.success) {
        showToast('Report dismissed', 'success');
        loadReports('pending');
    } else {
        showToast(result.message || 'Failed to dismiss report', 'error');
    }
}

function deletePost(uploadId, reportId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        showToast('Not logged in', 'error');
        return;
    }
    
    // Delete the upload
    const deleteResult = deleteUpload(uploadId);
    
    if (deleteResult.success) {
        // Update report status
        updateReportStatus(reportId, 'reviewed', currentUser.id);
        
        // Reload reports
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'pending';
        loadReports(activeTab);
        
        showToast('Post deleted successfully', 'success');
    } else {
        showToast(deleteResult.message || 'Failed to delete post', 'error');
    }
}

