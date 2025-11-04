// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Populate search form with URL parameters
document.addEventListener('DOMContentLoaded', () => {
    const schoolInput = document.getElementById('schoolName');
    const cityInput = document.getElementById('city');
    const countryInput = document.getElementById('country');
    const yearInput = document.getElementById('year');
    const gradeInput = document.getElementById('grade');

    if (urlParams.get('school')) schoolInput.value = urlParams.get('school');
    if (urlParams.get('city')) cityInput.value = urlParams.get('city');
    if (urlParams.get('country')) countryInput.value = urlParams.get('country');

    // Perform initial search if URL params exist
    if (urlParams.get('school') || urlParams.get('city') || urlParams.get('country')) {
        performSearch();
    }
});

// Search form handler
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });
}

function performSearch() {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    // Show loading state
    resultsGrid.innerHTML = '<div class="loading-spinner"></div>';
    resultsCount.textContent = 'Searching...';
    noResults.classList.add('hidden');

    // Simulate slight delay for better UX (even though it's instant)
    setTimeout(() => {
        const schoolName = document.getElementById('schoolName').value.trim();
        const city = document.getElementById('city').value.trim();
        const country = document.getElementById('country').value.trim();
        const year = document.getElementById('year').value;
        const grade = document.getElementById('grade').value.trim();

        const filters = {};
        if (schoolName) filters.school = schoolName;
        if (city) filters.city = city;
        if (country) filters.country = country;
        if (year) filters.year = parseInt(year);
        if (grade) filters.grade = grade;

        const results = getUploads(filters);
        displayResults(results);
    }, 300);
}

function displayResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');

    resultsGrid.innerHTML = '';
    noResults.classList.add('hidden');

    if (results.length === 0) {
        noResults.classList.remove('hidden');
        resultsCount.textContent = 'No results found';
        return;
    }

    resultsCount.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;

    results.forEach(result => {
        const card = createResultCard(result);
        resultsGrid.appendChild(card);
    });
}

function createResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card fade-in';
    card.addEventListener('click', () => {
        window.location.href = `view.html?id=${result.id}`;
    });

    const imageUrl = result.imageUrl || '../assets/images/classroom.jpg';
    const schoolName = result.schoolName || 'Unknown School';
    const city = result.city || '';
    const country = result.country || '';
    const year = result.year || '';
    const grade = result.grade || '';

    card.innerHTML = `
        <div class="result-image-wrapper">
            <img src="${imageUrl}" alt="${schoolName}" class="result-image" loading="lazy" onerror="this.src='../assets/images/classroom.jpg'">
            <div class="result-overlay">
                <span class="view-text">View Details</span>
            </div>
        </div>
        <div class="result-info">
            <h3>${schoolName}</h3>
            <div class="result-meta">
                ${city ? `${city}, ` : ''}${country || 'Unknown location'}
                ${year ? ` • ${year}` : ''}
                ${grade ? ` • ${grade}` : ''}
            </div>
            ${result.tags && result.tags.length > 0 ? `
                <div class="result-tags">
                    ${result.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${result.tags.length > 3 ? `<span class="tag">+${result.tags.length - 3}</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;

    return card;
}

