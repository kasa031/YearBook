document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
    const div = document.createElement('div');
    div.className = `report-item ${report.status}`;
    
    const schoolName = upload?.schoolName || 'Unknown School';
    const location = upload ? `${upload.city || ''}, ${upload.country || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Unknown location' : 'Unknown location';
    const reportedDate = new Date(report.reportedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="report-header">
            <div class="report-meta">
                <h3>${schoolName}</h3>
                <div class="report-info">
                    <span>Reported by: ${report.reportedByUsername}</span>
                    <span>•</span>
                    <span>${reportedDate}</span>
                    <span>•</span>
                    <span>${location}</span>
                </div>
            </div>
            <span class="report-status ${report.status}">${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
        </div>
        <div class="report-details">
            <div class="report-reason">
                <strong>Reason:</strong> ${report.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            ${report.description ? `
                <div class="report-description">
                    <strong>Details:</strong> ${report.description}
                </div>
            ` : ''}
        </div>
        ${report.status === 'pending' ? `
            <div class="report-actions">
                <a href="view.html?id=${report.uploadId}" class="btn-view-post" target="_blank">View Post</a>
                <button class="btn-dismiss" onclick="dismissReport('${report.id}')">Dismiss</button>
                <button class="btn-delete" onclick="deletePost('${report.uploadId}', '${report.id}')">Delete Post</button>
            </div>
        ` : `
            <div class="report-actions">
                <a href="view.html?id=${report.uploadId}" class="btn-view-post" target="_blank">View Post</a>
                ${report.reviewedBy ? `<span style="color: var(--text-light); font-size: 0.9rem;">Reviewed by admin</span>` : ''}
            </div>
        `}
    `;

    return div;
}

function dismissReport(reportId) {
    if (!confirm('Are you sure you want to dismiss this report? The post will remain visible.')) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const result = updateReportStatus(reportId, 'reviewed', currentUser.id);
    
    if (result.success) {
        loadReports('pending');
    } else {
        alert('Failed to dismiss report');
    }
}

function deletePost(uploadId, reportId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Delete the upload
    const deleteResult = deleteUpload(uploadId);
    
    if (deleteResult.success) {
        // Update report status
        updateReportStatus(reportId, 'reviewed', currentUser.id);
        
        // Reload reports
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        loadReports(activeTab);
        
        alert('Post deleted successfully');
    } else {
        alert('Failed to delete post');
    }
}

