// Shared functionality for all pages
// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('.nav-link, .btn-logout');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Keyboard navigation support
function initKeyboardNavigation() {
    // ESC key to close mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const menuToggle = document.getElementById('menuToggle');
            const mainNav = document.getElementById('mainNav');
            if (menuToggle && mainNav && mainNav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Enter key on logo to go home
    const logoSection = document.querySelector('.logo-section');
    if (logoSection) {
        logoSection.setAttribute('tabindex', '0');
        logoSection.setAttribute('role', 'button');
        logoSection.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = 'index.html';
            }
        });
        logoSection.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// Scroll to top functionality
function initScrollToTop() {
    // Check if scroll-to-top button exists
    let scrollBtn = document.getElementById('scrollToTop');
    
    // Create button if it doesn't exist
    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollToTop';
        scrollBtn.className = 'scroll-to-top hidden';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.textContent = '↑';
        document.body.appendChild(scrollBtn);
    }
    
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

// Header search functionality
function initHeaderSearch() {
    const headerSearchForm = document.getElementById('headerSearchForm');
    const headerSearchInput = document.getElementById('headerSearchInput');
    
    if (!headerSearchForm || !headerSearchInput) return;
    
    headerSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = headerSearchInput.value.trim();
        
        if (!query) return;
        
        // Navigate to search page with query
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const searchUrl = `${basePath}pages/search.html?q=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
    });
    
    // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            headerSearchInput.focus();
            headerSearchInput.select();
        }
    });
}

// Breadcrumbs functionality
function initBreadcrumbs() {
    const breadcrumbsContainer = document.getElementById('breadcrumbs');
    if (!breadcrumbsContainer) return;
    
    const path = window.location.pathname;
    const basePath = path.includes('/pages/') ? '../' : './';
    
    let breadcrumbs = [
        { name: 'Home', url: `${basePath}index.html` }
    ];
    
    // Determine current page and add to breadcrumbs
    if (path.includes('search.html')) {
        breadcrumbs.push({ name: 'Search', url: null });
    } else if (path.includes('view.html')) {
        breadcrumbs.push({ name: 'Search', url: `${basePath}pages/search.html` });
        const urlParams = new URLSearchParams(window.location.search);
        const memoryId = urlParams.get('id');
        if (memoryId) {
            const memory = typeof getUploadById !== 'undefined' ? getUploadById(memoryId) : null;
            if (memory) {
                breadcrumbs.push({ name: memory.schoolName || 'View Memory', url: null });
            } else {
                breadcrumbs.push({ name: 'View Memory', url: null });
            }
        }
    } else if (path.includes('upload.html')) {
        breadcrumbs.push({ name: 'Upload', url: null });
    } else if (path.includes('edit.html')) {
        breadcrumbs.push({ name: 'Search', url: `${basePath}pages/search.html` });
        breadcrumbs.push({ name: 'Edit Post', url: null });
    } else if (path.includes('profile.html')) {
        breadcrumbs.push({ name: 'Profile', url: null });
    } else if (path.includes('admin.html')) {
        breadcrumbs.push({ name: 'Admin', url: null });
    } else if (path.includes('login.html')) {
        breadcrumbs.push({ name: 'Login', url: null });
    } else if (path.includes('register.html')) {
        breadcrumbs.push({ name: 'Register', url: null });
    }
    
    // Generate breadcrumbs HTML
    let html = '<nav class="breadcrumbs" aria-label="Breadcrumb">';
    breadcrumbs.forEach((crumb, index) => {
        if (index < breadcrumbs.length - 1) {
            html += `<a href="${crumb.url}" class="breadcrumb-link">${crumb.name}</a>`;
            html += '<span class="breadcrumb-separator">›</span>';
        } else {
            html += `<span class="breadcrumb-current">${crumb.name}</span>`;
        }
    });
    html += '</nav>';
    
    breadcrumbsContainer.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeaderScroll();
    initKeyboardNavigation();
    initScrollToTop();
    initHeaderSearch();
    initBreadcrumbs();
});

