// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Populate search form with URL parameters
document.addEventListener('DOMContentLoaded', () => {
    const schoolInput = document.getElementById('schoolName');
    const cityInput = document.getElementById('city');
    const countryInput = document.getElementById('country');
    const yearInput = document.getElementById('year');
    const gradeInput = document.getElementById('grade');

    // Handle quick search query from header
    const quickQuery = urlParams.get('q');
    if (quickQuery) {
        // Split query into words and try to match to fields
        const words = quickQuery.trim().split(/\s+/);
        if (words.length > 0) {
            schoolInput.value = words[0] || '';
            if (words.length > 1) cityInput.value = words[1] || '';
            if (words.length > 2) countryInput.value = words[2] || '';
        } else {
            schoolInput.value = quickQuery;
        }
        performSearch();
    } else {
        if (urlParams.get('school')) schoolInput.value = urlParams.get('school');
        if (urlParams.get('city')) cityInput.value = urlParams.get('city');
        if (urlParams.get('country')) countryInput.value = urlParams.get('country');

        // Perform initial search if URL params exist
        if (urlParams.get('school') || urlParams.get('city') || urlParams.get('country')) {
            performSearch();
        }
    }
    
    // Load search history
    loadSearchHistory();
    
    // Setup autocomplete
    setupAutocomplete();
    
    // Setup sort change listener
    const sortBySelect = document.getElementById('sortBy');
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            if (allResults.length > 0) {
                const sortBy = sortBySelect.value;
                allResults = sortResults(allResults, sortBy);
                currentPage = 1;
                displayResults();
            }
        });
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

let currentPage = 1;
const RESULTS_PER_PAGE = 12;
let allResults = [];

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
        const tagSearch = document.getElementById('tagSearch')?.value.trim() || '';

        const filters = {};
        if (schoolName) filters.school = schoolName;
        if (city) filters.city = city;
        if (country) filters.country = country;
        if (year) filters.year = parseInt(year);
        if (grade) filters.grade = grade;
        if (tagSearch) filters.tags = tagSearch;

        // Save search history
        saveSearchHistory(filters);

        // Get results
        allResults = getUploads(filters);
        
        // Apply sorting
        const sortBy = document.getElementById('sortBy')?.value || 'date';
        allResults = sortResults(allResults, sortBy);
        
        // Store filters for navigation
        sessionStorage.setItem('lastSearchFilters', JSON.stringify(filters));
        
        // Reset to first page
        currentPage = 1;
        
        // Display paginated results
        displayResults();
    }, 300);
}

function sortResults(results, sortBy = 'date') {
    const sorted = [...results];
    
    switch(sortBy) {
        case 'date':
            return sorted.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
        case 'year':
            return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
        case 'year-oldest':
            return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
        case 'school':
            return sorted.sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || ''));
        case 'school-desc':
            return sorted.sort((a, b) => (b.schoolName || '').localeCompare(a.schoolName || ''));
        case 'views':
            return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        case 'location':
            return sorted.sort((a, b) => {
                const locA = `${a.city || ''}, ${a.country || ''}`.toLowerCase();
                const locB = `${b.city || ''}, ${b.country || ''}`.toLowerCase();
                return locA.localeCompare(locB);
            });
        default:
            return sorted;
    }
}

function paginateResults(results) {
    const start = (currentPage - 1) * CONSTANTS.RESULTS_PER_PAGE;
    const end = start + CONSTANTS.RESULTS_PER_PAGE;
    return {
        items: results.slice(start, end),
        totalPages: Math.ceil(results.length / CONSTANTS.RESULTS_PER_PAGE),
        currentPage,
        total: results.length
    };
}

function displayResults() {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');

    resultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    if (pagination) pagination.innerHTML = '';

    if (allResults.length === 0) {
        noResults.classList.remove('hidden');
        resultsCount.textContent = 'No results found';
        return;
    }

    const paginated = paginateResults(allResults);
    resultsCount.textContent = `Found ${paginated.total} result${paginated.total !== 1 ? 's' : ''} (Page ${paginated.currentPage} of ${paginated.totalPages})`;

    paginated.items.forEach(result => {
        const card = createResultCard(result);
        resultsGrid.appendChild(card);
    });

    // Display pagination
    if (pagination && paginated.totalPages > 1) {
        displayPagination(paginated);
    }
}

function displayPagination(paginated) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    let html = '<div class="pagination">';
    
    // Previous button
    if (paginated.currentPage > 1) {
        html += `<button onclick="goToPage(${paginated.currentPage - 1})" class="page-btn">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= paginated.totalPages; i++) {
        if (i === 1 || i === paginated.totalPages || (i >= paginated.currentPage - 2 && i <= paginated.currentPage + 2)) {
            html += `<button onclick="goToPage(${i})" class="page-btn ${i === paginated.currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === paginated.currentPage - 3 || i === paginated.currentPage + 3) {
            html += `<span class="page-dots">...</span>`;
        }
    }
    
    // Next button
    if (paginated.currentPage < paginated.totalPages) {
        html += `<button onclick="goToPage(${paginated.currentPage + 1})" class="page-btn">Next →</button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createResultCard(result) {
    const card = createSafeElement('div', 'result-card fade-in');
    card.addEventListener('click', () => {
        window.location.href = `view.html?id=${result.id}`;
    });

    const imageUrl = result.imageUrl || '../assets/images/classroom.jpg';
    const schoolName = escapeHTML(result.schoolName || 'Unknown School');
    const city = escapeHTML(result.city || '');
    const country = escapeHTML(result.country || 'Unknown location');
    const year = result.year || '';
    const grade = escapeHTML(result.grade || '');
    const viewCount = result.viewCount || 0;

    // Image wrapper
    const imageWrapper = createSafeElement('div', 'result-image-wrapper');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = schoolName;
    img.className = 'result-image';
    img.loading = 'lazy';
    img.onerror = function() { this.src = '../assets/images/classroom.jpg'; };
    
    const overlay = createSafeElement('div', 'result-overlay');
    const viewText = createSafeElement('span', 'view-text', 'View Details');
    overlay.appendChild(viewText);
    
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(overlay);
    
    if (viewCount > 0) {
        const viewBadge = createSafeElement('div', 'view-badge', `👁️ ${viewCount}`);
        imageWrapper.appendChild(viewBadge);
    }
    
    // Info section
    const info = createSafeElement('div', 'result-info');
    const h3 = createSafeElement('h3', '', schoolName);
    const meta = createSafeElement('div', 'result-meta');
    
    const locationText = city ? `${city}, ${country}` : country;
    meta.textContent = locationText + (year ? ` • ${year}` : '') + (grade ? ` • ${grade}` : '');
    
    info.appendChild(h3);
    info.appendChild(meta);
    
    // Tags
    if (result.tags && result.tags.length > 0) {
        const tagsDiv = createSafeElement('div', 'result-tags');
        result.tags.slice(0, 3).forEach(tag => {
            const tagSpan = createSafeElement('span', 'tag', escapeHTML(tag));
            tagsDiv.appendChild(tagSpan);
        });
        if (result.tags.length > 3) {
            const moreTag = createSafeElement('span', 'tag', `+${result.tags.length - 3}`);
            tagsDiv.appendChild(moreTag);
        }
        info.appendChild(tagsDiv);
    }
    
    card.appendChild(imageWrapper);
    card.appendChild(info);

    return card;
}

function loadSearchHistory() {
    const history = getSearchHistory();
    const historyContainer = document.getElementById('searchHistory');
    
    if (!historyContainer) return;
    
    // Clear previous content
    historyContainer.innerHTML = '';
    
    if (history.length === 0) {
        historyContainer.classList.add('hidden');
        return;
    }
    
    historyContainer.classList.remove('hidden');
    const h4 = createSafeElement('h4', '', '🔍 Recent Searches');
    historyContainer.appendChild(h4);
    
    const historyList = createSafeElement('div', 'history-list');
    
    history.slice(0, 5).forEach((search, index) => {
        const item = createSafeElement('div', 'history-item');
        
        const searchText = Object.entries(search)
            .filter(([k, v]) => k !== 'searchedAt' && v)
            .map(([k, v]) => {
                const label = k === 'school' ? 'School' : k === 'city' ? 'City' : k === 'country' ? 'Country' : k === 'year' ? 'Year' : k;
                return `${label}: ${escapeHTML(String(v))}`;
            })
            .join(' • ') || 'Recent search';
        
        const textSpan = createSafeElement('span', 'history-text', searchText);
        item.appendChild(textSpan);
        
        // Add delete button
        const deleteBtn = createSafeElement('button', 'history-delete', '×');
        deleteBtn.setAttribute('aria-label', 'Delete search history item');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSearchHistoryItem(index);
            loadSearchHistory();
        });
        item.appendChild(deleteBtn);
        
        item.addEventListener('click', (e) => {
            if (e.target === deleteBtn) return;
            // Populate form with search history
            if (search.school) document.getElementById('schoolName').value = search.school;
            if (search.city) document.getElementById('city').value = search.city;
            if (search.country) document.getElementById('country').value = search.country;
            if (search.year) document.getElementById('year').value = search.year;
            if (search.grade) document.getElementById('grade').value = search.grade;
            performSearch();
        });
        
        historyList.appendChild(item);
    });
    
    // Add clear all button
    if (history.length > 0) {
        const clearBtn = createSafeElement('button', 'history-clear', 'Clear All');
        clearBtn.addEventListener('click', () => {
            clearSearchHistory();
            loadSearchHistory();
        });
        historyContainer.appendChild(clearBtn);
    }
    
    historyContainer.appendChild(historyList);
}

function setupAutocomplete() {
    const schoolInput = document.getElementById('schoolName');
    const cityInput = document.getElementById('city');
    const countryInput = document.getElementById('country');
    
    [schoolInput, cityInput, countryInput].forEach((input, index) => {
        if (!input) return;
        
        const field = ['school', 'city', 'country'][index];
        let timeout;
        
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
                if (dropdown) dropdown.remove();
                return;
            }
            
            timeout = setTimeout(() => {
                const suggestions = getAutocompleteSuggestions(query, field);
                showAutocompleteSuggestions(input, suggestions);
            }, 300);
        });
        
        input.addEventListener('blur', () => {
            setTimeout(() => {
                const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
                if (dropdown) dropdown.remove();
            }, 200);
        });
    });
}

function showAutocompleteSuggestions(input, suggestions) {
    // Remove existing dropdown
    const existing = input.parentElement.querySelector('.autocomplete-dropdown');
    if (existing) existing.remove();
    
    if (suggestions.length === 0) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            input.value = suggestion;
            dropdown.remove();
        });
        dropdown.appendChild(item);
    });
    
    input.parentElement.appendChild(dropdown);
}

