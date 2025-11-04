// User Authentication
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Check if user is logged in
function checkAuth() {
    const loginLink = document.getElementById('loginLink');
    const profileLink = document.getElementById('profileLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLink = document.getElementById('adminLink');

    if (currentUser) {
        if (loginLink) loginLink.classList.add('hidden');
        if (profileLink) profileLink.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        
        // Show admin link if user is admin
        if (adminLink && isAdmin(currentUser)) {
            adminLink.classList.remove('hidden');
        } else if (adminLink) {
            adminLink.classList.add('hidden');
        }
    } else {
        if (loginLink) loginLink.classList.remove('hidden');
        if (profileLink) profileLink.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Main search form
const mainSearchForm = document.getElementById('mainSearchForm');
if (mainSearchForm) {
    mainSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const schoolName = document.getElementById('schoolName').value.trim();
        const city = document.getElementById('city').value.trim();
        const country = document.getElementById('country').value.trim();

        if (!schoolName && !city && !country) {
            alert('Please enter at least one search criteria');
            return;
        }

        // Redirect to search results page
        const params = new URLSearchParams();
        if (schoolName) params.append('school', schoolName);
        if (city) params.append('city', city);
        if (country) params.append('country', country);
        
        window.location.href = `pages/search.html?${params.toString()}`;
    });
}

// Add fade-in animation to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll('.feature-card, .search-container, .hero-content');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

