document.addEventListener('DOMContentLoaded', () => {
    const currentUser = safeParseJSON('currentUser', null);
    const notAdmin = document.getElementById('notAdmin');
    const adminContent = document.getElementById('adminContent');

    // Check if user is admin (moderator, admin, or superadmin)
    if (!currentUser || !isAdmin(currentUser)) {
        notAdmin.classList.remove('hidden');
        return;
    }

    adminContent.classList.remove('hidden');
    
    // Hide certain tabs based on role
    const currentRole = getUserRole(currentUser.id);
    if (currentRole === USER_ROLES.MODERATOR) {
        // Moderators can only see reports, not users or dashboard
        const usersTab = document.querySelector('.tab-btn[data-tab="users"]');
        const dashboardTab = document.querySelector('.tab-btn[data-tab="dashboard"]');
        if (usersTab) usersTab.style.display = 'none';
        if (dashboardTab) dashboardTab.style.display = 'none';
    }
    
    // Initialize tabs
    initTabs();
    
    // Initialize notifications
    initNotifications();
    
    // Load dashboard by default (or reports if moderator)
    if (currentRole === USER_ROLES.MODERATOR) {
        const pendingTab = document.querySelector('.tab-btn[data-tab="pending"]');
        if (pendingTab) pendingTab.click();
    } else {
        loadDashboard();
    }
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const usersContainer = document.getElementById('usersContainer');
    const reportsContainer = document.getElementById('reportsContainer');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            
            // Show/hide containers based on tab
            if (tab === 'dashboard') {
                dashboardContainer.classList.remove('hidden');
                usersContainer.classList.add('hidden');
                reportsContainer.classList.add('hidden');
                loadDashboard();
            } else if (tab === 'users') {
                dashboardContainer.classList.add('hidden');
                usersContainer.classList.remove('hidden');
                reportsContainer.classList.add('hidden');
                loadUsers();
            } else {
                dashboardContainer.classList.add('hidden');
                usersContainer.classList.add('hidden');
                reportsContainer.classList.remove('hidden');
                loadReports(tab);
            }
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
        
        // Bulk actions toolbar (only for pending reports)
        if (status === 'pending' || status === 'all') {
            const bulkActionsBar = createBulkActionsBar(status);
            container.appendChild(bulkActionsBar);
        }
        
        // Reports list
        const reportsList = createSafeElement('div', 'reports-list');
        reportsList.id = 'reportsList';
        reports.forEach(report => {
            const reportElement = createReportElement(report, status);
            reportsList.appendChild(reportElement);
        });
        container.appendChild(reportsList);
        
        // Update bulk actions state
        updateBulkActionsState();
    }, 300);
}

function createBulkActionsBar(status) {
    const bar = createSafeElement('div', 'bulk-actions-bar');
    
    // Left side: Select all and count
    const leftSide = createSafeElement('div', 'bulk-actions-left');
    
    // Select all checkbox
    const selectAllContainer = createSafeElement('div', 'select-all-container');
    const selectAllCheckbox = createSafeElement('input', 'select-all-checkbox');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'selectAllReports';
    selectAllCheckbox.addEventListener('change', (e) => {
        const checked = e.target.checked;
        document.querySelectorAll('.report-checkbox').forEach(cb => {
            cb.checked = checked;
        });
        updateBulkActionsState();
    });
    
    const selectAllLabel = createSafeElement('label', 'select-all-label', 'Select All');
    selectAllLabel.setAttribute('for', 'selectAllReports');
    
    selectAllContainer.appendChild(selectAllCheckbox);
    selectAllContainer.appendChild(selectAllLabel);
    
    // Selected count
    const selectedCount = createSafeElement('span', 'selected-count', '0 selected');
    selectedCount.id = 'selectedCount';
    
    leftSide.appendChild(selectAllContainer);
    leftSide.appendChild(selectedCount);
    
    // Right side: Action buttons
    const rightSide = createSafeElement('div', 'bulk-actions-right');
    
    // Export button
    const exportBtn = createSafeElement('button', 'btn-export-csv');
    exportBtn.textContent = '📥 Export to CSV';
    exportBtn.onclick = () => exportReportsToCSV(status);
    
    // Bulk action buttons
    const bulkButtons = createSafeElement('div', 'bulk-buttons');
    
    const dismissSelectedBtn = createSafeElement('button', 'btn-bulk-dismiss');
    dismissSelectedBtn.textContent = 'Dismiss Selected';
    dismissSelectedBtn.onclick = () => bulkDismissReports();
    
    const deleteSelectedBtn = createSafeElement('button', 'btn-bulk-delete');
    deleteSelectedBtn.textContent = 'Delete Selected Posts';
    deleteSelectedBtn.onclick = () => bulkDeletePosts();
    
    bulkButtons.appendChild(dismissSelectedBtn);
    bulkButtons.appendChild(deleteSelectedBtn);
    
    rightSide.appendChild(exportBtn);
    rightSide.appendChild(bulkButtons);
    
    bar.appendChild(leftSide);
    bar.appendChild(rightSide);
    
    return bar;
}

function createReportElement(report, status) {
    const upload = getUploadById(report.uploadId);
    const div = createSafeElement('div', `report-item ${report.status}`);
    
    // Add checkbox for bulk selection (only for pending or all reports)
    if (status === 'pending' || status === 'all') {
        const checkboxContainer = createSafeElement('div', 'report-checkbox-container');
        const checkbox = createSafeElement('input', 'report-checkbox');
        checkbox.type = 'checkbox';
        checkbox.value = report.id;
        checkbox.dataset.uploadId = report.uploadId;
        checkbox.addEventListener('change', updateBulkActionsState);
        checkboxContainer.appendChild(checkbox);
        div.appendChild(checkboxContainer);
    }
    
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

function updateBulkActionsState() {
    const checkboxes = document.querySelectorAll('.report-checkbox');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    const selectedCount = document.getElementById('selectedCount');
    const selectAllCheckbox = document.getElementById('selectAllReports');
    const bulkButtons = document.querySelectorAll('.btn-bulk-dismiss, .btn-bulk-delete');
    
    if (selectedCount) {
        selectedCount.textContent = `${checked.length} selected`;
    }
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
        selectAllCheckbox.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
    }
    
    // Enable/disable bulk action buttons
    bulkButtons.forEach(btn => {
        btn.disabled = checked.length === 0;
        btn.style.opacity = checked.length === 0 ? '0.5' : '1';
        btn.style.cursor = checked.length === 0 ? 'not-allowed' : 'pointer';
    });
}

function bulkDismissReports() {
    const checked = Array.from(document.querySelectorAll('.report-checkbox:checked'));
    if (checked.length === 0) {
        showToast('Please select at least one report', 'error');
        return;
    }
    
    const count = checked.length;
    if (!confirm(`Are you sure you want to dismiss ${count} report(s)? The posts will remain visible.`)) {
        return;
    }
    
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        showToast('Not logged in', 'error');
        return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    checked.forEach(checkbox => {
        const reportId = checkbox.value;
        const result = updateReportStatus(reportId, 'reviewed', currentUser.id);
        if (result.success) {
            successCount++;
        } else {
            failCount++;
        }
    });
    
    if (successCount > 0) {
        showToast(`Dismissed ${successCount} report(s) successfully`, 'success');
    }
    if (failCount > 0) {
        showToast(`Failed to dismiss ${failCount} report(s)`, 'error');
    }
    
    // Reload reports
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'pending';
    loadReports(activeTab);
}

function bulkDeletePosts() {
    const checked = Array.from(document.querySelectorAll('.report-checkbox:checked'));
    if (checked.length === 0) {
        showToast('Please select at least one report', 'error');
        return;
    }
    
    const count = checked.length;
    const confirmMessage = `Are you sure you want to delete ${count} post(s)?\n\nThis will permanently delete:\n- ${count} post(s)\n- All associated reports\n\nThis action cannot be undone!`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        showToast('Not logged in', 'error');
        return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    checked.forEach(checkbox => {
        const uploadId = checkbox.dataset.uploadId;
        const reportId = checkbox.value;
        
        // Delete the upload
        const deleteResult = deleteUpload(uploadId);
        
        if (deleteResult.success) {
            // Update report status
            updateReportStatus(reportId, 'reviewed', currentUser.id);
            successCount++;
        } else {
            failCount++;
        }
    });
    
    if (successCount > 0) {
        showToast(`Deleted ${successCount} post(s) successfully`, 'success');
    }
    if (failCount > 0) {
        showToast(`Failed to delete ${failCount} post(s)`, 'error');
    }
    
    // Reload reports or dashboard
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'pending';
    if (activeTab === 'dashboard') {
        loadDashboard();
    } else {
        loadReports(activeTab);
    }
}

function exportReportsToCSV(status) {
    let reports;
    if (status === 'all') {
        reports = getReports();
    } else if (status === 'reviewed') {
        reports = getReports('reviewed');
    } else {
        reports = getReports('pending');
    }
    
    if (reports.length === 0) {
        showToast('No reports to export', 'error');
        return;
    }
    
    // CSV Headers
    const headers = [
        'Report ID',
        'Upload ID',
        'School Name',
        'City',
        'Country',
        'Year',
        'Reason',
        'Description',
        'Reported By',
        'Reported By Username',
        'Reported At',
        'Status',
        'Reviewed By',
        'Reviewed At'
    ];
    
    // Convert reports to CSV rows
    const rows = reports.map(report => {
        const upload = getUploadById(report.uploadId);
        const reviewedByUser = report.reviewedBy ? getUserById(report.reviewedBy) : null;
        
        return [
            escapeCSV(report.id),
            escapeCSV(report.uploadId),
            escapeCSV(upload?.schoolName || 'Unknown'),
            escapeCSV(upload?.city || ''),
            escapeCSV(upload?.country || ''),
            escapeCSV(upload?.year || ''),
            escapeCSV(report.reason.replace('_', ' ')),
            escapeCSV(report.description || ''),
            escapeCSV(report.reportedBy || 'anonymous'),
            escapeCSV(report.reportedByUsername || 'Anonymous'),
            escapeCSV(new Date(report.reportedAt).toLocaleString()),
            escapeCSV(report.status),
            escapeCSV(reviewedByUser?.username || report.reviewedBy || ''),
            escapeCSV(report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : '')
        ];
    });
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const statusLabel = status === 'all' ? 'all' : status;
    link.setAttribute('download', `yearbook-reports-${statusLabel}-${timestamp}.csv`);
    
    // Trigger download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${reports.length} report(s) to CSV`, 'success');
}

function escapeCSV(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
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
        if (activeTab === 'dashboard') {
            loadDashboard();
        } else {
            loadReports(activeTab);
        }
        
        showToast('Post deleted successfully', 'success');
    } else {
        showToast(deleteResult.message || 'Failed to delete post', 'error');
    }
}

function loadUsers() {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '<div class="loading-spinner"></div>';

    setTimeout(() => {
        const users = getAllUsers();
        
        if (users.length === 0) {
            container.innerHTML = '<div class="no-reports">No users found</div>';
            return;
        }

        container.innerHTML = '';
        
        // Create search/filter bar
        const searchBar = createSafeElement('div', 'users-search-bar');
        const searchInput = createSafeElement('input', 'users-search-input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search users by username or email...';
        searchInput.addEventListener('input', (e) => {
            filterUsers(e.target.value);
        });
        searchBar.appendChild(searchInput);
        container.appendChild(searchBar);
        
        // Create users list container
        const usersList = createSafeElement('div', 'users-list');
        usersList.id = 'usersList';
        container.appendChild(usersList);
        
        // Render users
        renderUsers(users);
    }, 300);
}

function renderUsers(users) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const stats = getUserStatistics(user.id);
        const userElement = createUserElement(user, stats);
        usersList.appendChild(userElement);
    });
}

function filterUsers(searchTerm) {
    const allUsers = getAllUsers();
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        renderUsers(allUsers);
        return;
    }
    
    const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
    
    renderUsers(filtered);
}

function createUserElement(user, stats) {
    const div = createSafeElement('div', 'user-item');
    const currentUser = safeParseJSON('currentUser', null);
    
    // User info
    const info = createSafeElement('div', 'user-info');
    const header = createSafeElement('div', 'user-header');
    
    const name = createSafeElement('h3', 'user-name', escapeHTML(user.username));
    
    // Role badge
    const role = user.role || USER_ROLES.USER;
    const roleBadge = createSafeElement('span', `role-badge role-${role}`, getRoleLabel(role));
    name.appendChild(roleBadge);
    
    const email = createSafeElement('div', 'user-email', escapeHTML(user.email));
    const createdAt = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const date = createSafeElement('div', 'user-date', `Joined: ${createdAt}`);
    
    header.appendChild(name);
    header.appendChild(email);
    info.appendChild(header);
    info.appendChild(date);
    
    // User statistics
    const statsDiv = createSafeElement('div', 'user-stats');
    statsDiv.innerHTML = `
        <div class="user-stat-item">
            <span class="stat-label">Posts:</span>
            <span class="stat-value">${stats.uploadCount}</span>
        </div>
        <div class="user-stat-item">
            <span class="stat-label">Favorites:</span>
            <span class="stat-value">${stats.favoriteCount}</span>
        </div>
        <div class="user-stat-item">
            <span class="stat-label">Likes:</span>
            <span class="stat-value">${stats.likeCount}</span>
        </div>
        <div class="user-stat-item">
            <span class="stat-label">Comments:</span>
            <span class="stat-value">${stats.commentCount}</span>
        </div>
        <div class="user-stat-item">
            <span class="stat-label">Reports:</span>
            <span class="stat-value">${stats.reportCount}</span>
        </div>
    `;
    
    if (stats.lastActivity) {
        const lastActivity = new Date(stats.lastActivity).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const activityDiv = createSafeElement('div', 'user-activity', `Last activity: ${lastActivity}`);
        statsDiv.appendChild(activityDiv);
    }
    
    // Actions
    const actions = createSafeElement('div', 'user-actions');
    
    // View user's posts button
    const viewPostsBtn = createSafeElement('button', 'btn-view-posts');
    viewPostsBtn.textContent = 'View Posts';
    viewPostsBtn.onclick = () => {
        window.location.href = `search.html?user=${encodeURIComponent(user.username)}`;
    };
    actions.appendChild(viewPostsBtn);
    
    // Role management (only for superadmins)
    if (currentUser && canManageRoles(currentUser) && currentUser.id !== user.id && user.email !== ADMIN_EMAIL) {
        const roleSelect = createSafeElement('select', 'user-role-select');
        roleSelect.value = role;
        
        Object.entries(USER_ROLES).forEach(([key, value]) => {
            const option = createSafeElement('option', '', getRoleLabel(value));
            option.value = value;
            if (value === role) {
                option.selected = true;
            }
            roleSelect.appendChild(option);
        });
        
        roleSelect.addEventListener('change', (e) => {
            changeUserRole(user.id, e.target.value);
        });
        
        const roleLabel = createSafeElement('label', 'role-label', 'Role:');
        const roleContainer = createSafeElement('div', 'role-container');
        roleContainer.appendChild(roleLabel);
        roleContainer.appendChild(roleSelect);
        actions.appendChild(roleContainer);
    }
    
    // Delete user button (only for non-admin users, or admins can delete regular users)
    if (currentUser && canManageUsers(currentUser) && currentUser.id !== user.id) {
        if (!user.isSuperAdmin && user.email !== ADMIN_EMAIL) {
            const deleteBtn = createSafeElement('button', 'btn-delete-user');
            deleteBtn.textContent = 'Delete User';
            deleteBtn.onclick = () => deleteUserAccount(user.id);
            actions.appendChild(deleteBtn);
        }
    }
    
    div.appendChild(info);
    div.appendChild(statsDiv);
    div.appendChild(actions);
    
    return div;
}

function getRoleLabel(role) {
    const labels = {
        [USER_ROLES.USER]: 'User',
        [USER_ROLES.MODERATOR]: 'Moderator',
        [USER_ROLES.ADMIN]: 'Admin',
        [USER_ROLES.SUPERADMIN]: 'Super Admin'
    };
    return labels[role] || 'User';
}

function changeUserRole(userId, newRole) {
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        showToast('Not logged in', 'error');
        return;
    }
    
    const user = getUserById(userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    
    if (user.email === ADMIN_EMAIL && newRole !== USER_ROLES.SUPERADMIN) {
        showToast('Cannot change role of primary admin account', 'error');
        return;
    }
    
    if (userId === currentUser.id) {
        showToast('You cannot change your own role', 'error');
        return;
    }
    
    const result = setUserRole(userId, newRole, currentUser.id);
    
    if (result.success) {
        showToast(result.message || 'Role updated successfully', 'success');
        loadUsers();
    } else {
        showToast(result.message || 'Failed to update role', 'error');
    }
}

function deleteUserAccount(userId) {
    const currentUser = safeParseJSON('currentUser', null);
    if (!currentUser) {
        showToast('Not logged in', 'error');
        return;
    }
    
    const user = getUserById(userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    
    if (user.isAdmin) {
        showToast('Cannot delete admin account', 'error');
        return;
    }
    
    const confirmMessage = `Are you sure you want to delete user "${user.username}"?\n\nThis will permanently delete:\n- User account\n- All posts by this user (${getUserStatistics(userId).uploadCount} posts)\n- All favorites, likes, and comments by this user\n\nThis action cannot be undone!`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const result = deleteUser(userId, currentUser.id);
    
    if (result.success) {
        showToast(result.message || 'User deleted successfully', 'success');
        loadUsers();
        // Reload dashboard if it was showing
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        if (activeTab === 'dashboard') {
            loadDashboard();
        }
    } else {
        showToast(result.message || 'Failed to delete user', 'error');
    }
}

function initNotifications() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (!notificationsBtn || !notificationsDropdown || !notificationBadge) return;
    
    // Update notification badge
    updateNotificationBadge();
    
    // Toggle dropdown
    notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsDropdown.classList.toggle('hidden');
        if (!notificationsDropdown.classList.contains('hidden')) {
            loadNotifications();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
            notificationsDropdown.classList.add('hidden');
        }
    });
    
    // Update notifications every 30 seconds
    setInterval(() => {
        updateNotificationBadge();
    }, 30000);
}

function updateNotificationBadge() {
    const notificationBadge = document.getElementById('notificationBadge');
    if (!notificationBadge) return;
    
    const count = getUnreadNotificationCount();
    if (count > 0) {
        notificationBadge.textContent = count > 99 ? '99+' : count;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }
}

function loadNotifications() {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    if (!notificationsDropdown) return;
    
    const notifications = getAllNotifications();
    const unreadNotifications = getUnreadNotifications();
    
    notificationsDropdown.innerHTML = '';
    
    if (notifications.length === 0) {
        const emptyMsg = createSafeElement('div', 'notification-empty', 'No notifications');
        notificationsDropdown.appendChild(emptyMsg);
        return;
    }
    
    // Header
    const header = createSafeElement('div', 'notifications-header');
    const title = createSafeElement('h3', '', 'Notifications');
    const markAllReadBtn = createSafeElement('button', 'btn-mark-all-read');
    markAllReadBtn.textContent = unreadNotifications.length > 0 ? 'Mark all as read' : 'All read';
    markAllReadBtn.disabled = unreadNotifications.length === 0;
    markAllReadBtn.onclick = () => {
        markAllNotificationsAsRead();
        loadNotifications();
        updateNotificationBadge();
    };
    
    header.appendChild(title);
    header.appendChild(markAllReadBtn);
    notificationsDropdown.appendChild(header);
    
    // Notifications list
    const list = createSafeElement('div', 'notifications-list');
    
    notifications.slice(0, 10).forEach(notification => {
        const item = createNotificationItem(notification);
        list.appendChild(item);
    });
    
    if (notifications.length > 10) {
        const moreMsg = createSafeElement('div', 'notification-more', `+ ${notifications.length - 10} more notifications`);
        list.appendChild(moreMsg);
    }
    
    notificationsDropdown.appendChild(list);
}

function createNotificationItem(notification) {
    const item = createSafeElement('div', `notification-item ${notification.read ? 'read' : 'unread'}`);
    
    const title = createSafeElement('div', 'notification-title', notification.title);
    const message = createSafeElement('div', 'notification-message', notification.message);
    const date = createSafeElement('div', 'notification-date', formatNotificationDate(notification.createdAt));
    
    const actions = createSafeElement('div', 'notification-actions');
    
    if (notification.type === 'new_report') {
        const viewBtn = createSafeElement('button', 'btn-notification-view', 'View Report');
        viewBtn.onclick = () => {
            markNotificationAsRead(notification.id);
            window.location.href = `admin.html#pending`;
            loadNotifications();
            updateNotificationBadge();
        };
        
        const emailBtn = createSafeElement('button', 'btn-notification-email', '📧 Email');
        emailBtn.onclick = () => {
            sendEmailNotification(notification);
        };
        
        actions.appendChild(viewBtn);
        actions.appendChild(emailBtn);
    }
    
    item.appendChild(title);
    item.appendChild(message);
    item.appendChild(date);
    if (actions.children.length > 0) {
        item.appendChild(actions);
    }
    
    // Mark as read on click
    item.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            markNotificationAsRead(notification.id);
            item.classList.remove('unread');
            item.classList.add('read');
            updateNotificationBadge();
        }
    });
    
    return item;
}

function formatNotificationDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function sendEmailNotification(notification) {
    const report = getReportById(notification.reportId);
    const upload = getUploadById(notification.uploadId);
    
    if (!report || !upload) {
        showToast('Could not find report details', 'error');
        return;
    }
    
    const subject = encodeURIComponent(`New Report: ${upload.schoolName || 'Unknown School'}`);
    const body = encodeURIComponent(
        `A new report has been submitted:\n\n` +
        `School: ${upload.schoolName || 'Unknown'}\n` +
        `Location: ${upload.city || ''}, ${upload.country || ''}\n` +
        `Year: ${upload.year || 'Unknown'}\n\n` +
        `Reason: ${report.reason.replace('_', ' ')}\n` +
        `Description: ${report.description || 'None'}\n\n` +
        `Reported by: ${report.reportedByUsername}\n` +
        `Reported at: ${new Date(report.reportedAt).toLocaleString()}\n\n` +
        `View report: ${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}pages/admin.html#pending`
    );
    
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
}

function loadDashboard() {
    const stats = getAdminStatistics();
    
    // Update stat cards
    document.getElementById('totalUploads').textContent = stats.uploads.total;
    document.getElementById('publicUploads').textContent = stats.uploads.public;
    document.getElementById('privateUploads').textContent = stats.uploads.private;
    
    document.getElementById('totalUsers').textContent = stats.users.total;
    document.getElementById('activeUsers').textContent = stats.users.active;
    
    document.getElementById('totalReports').textContent = stats.reports.total;
    document.getElementById('pendingReports').textContent = stats.reports.pending;
    document.getElementById('reviewedReports').textContent = stats.reports.reviewed;
    
    document.getElementById('totalLikes').textContent = stats.likes;
    document.getElementById('totalComments').textContent = stats.comments;
    document.getElementById('totalFavorites').textContent = stats.favorites;
    
    // Load top users
    const topUsersList = document.getElementById('topUsersList');
    topUsersList.innerHTML = '';
    
    if (stats.topUsers.length === 0) {
        topUsersList.innerHTML = '<div class="no-data">No users yet</div>';
    } else {
        stats.topUsers.forEach((user, index) => {
            const item = createSafeElement('div', 'top-item');
            const info = createSafeElement('div', 'top-item-info');
            const name = createSafeElement('div', 'top-item-name', `${index + 1}. ${escapeHTML(user.username)}`);
            const meta = createSafeElement('div', 'top-item-meta', escapeHTML(user.email));
            const count = createSafeElement('div', 'top-item-count', `${user.uploadCount} posts`);
            
            info.appendChild(name);
            info.appendChild(meta);
            item.appendChild(info);
            item.appendChild(count);
            topUsersList.appendChild(item);
        });
    }
    
    // Load top posts
    const topPostsList = document.getElementById('topPostsList');
    topPostsList.innerHTML = '';
    
    if (stats.topPosts.length === 0) {
        topPostsList.innerHTML = '<div class="no-data">No posts yet</div>';
    } else {
        stats.topPosts.forEach((post, index) => {
            const item = createSafeElement('div', 'top-item');
            const info = createSafeElement('div', 'top-item-info');
            const name = createSafeElement('div', 'top-item-name', `${index + 1}. ${escapeHTML(post.schoolName)}`);
            const meta = createSafeElement('div', 'top-item-meta', `${escapeHTML(post.location)} • ${post.year} • ${post.views} views`);
            const count = createSafeElement('div', 'top-item-count', `${post.likes}❤️`);
            
            // Make item clickable
            item.style.cursor = 'pointer';
            item.onclick = () => {
                window.open(`view.html?id=${post.id}`, '_blank');
            };
            
            info.appendChild(name);
            info.appendChild(meta);
            item.appendChild(info);
            item.appendChild(count);
            topPostsList.appendChild(item);
        });
    }
}

