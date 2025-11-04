# Kodebaserte Forbedringsforslag

Basert på analyse av koden har jeg identifisert konkrete forbedringsmuligheter.

## 🔴 Kritiske mangler i koden

### 1. **Rediger/Slett egne poster** (data.js mangler funksjoner)
**Problem:** Brukere kan ikke redigere eller slette sine egne poster.

**Løsning:**
```javascript
// Legg til i data.js:
function updateUpload(uploadId, updatedData) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    const index = uploads.findIndex(u => u.id === uploadId);
    if (index !== -1) {
        uploads[index] = { ...uploads[index], ...updatedData, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(uploads));
        return { success: true };
    }
    return { success: false };
}

function canEditUpload(uploadId, userId) {
    const upload = getUploadById(uploadId);
    return upload && upload.uploadedBy === userId;
}
```

**Hvor:** Legges til i `view.html` - vis "Edit" knapp hvis bruker eier posten.

---

### 2. **Sortering av søkeresultater** (search.js mangler)
**Problem:** Ingen måte å sortere resultater på.

**Løsning:**
```javascript
// Legg til i search.js:
function sortResults(results, sortBy = 'date') {
    switch(sortBy) {
        case 'date':
            return results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        case 'year':
            return results.sort((a, b) => (b.year || 0) - (a.year || 0));
        case 'school':
            return results.sort((a, b) => (a.schoolName || '').localeCompare(b.schoolName || ''));
        default:
            return results;
    }
}
```

**UI:** Legg til dropdown i `search.html`:
```html
<select id="sortBy" class="search-input">
    <option value="date">Newest First</option>
    <option value="year">Year (Descending)</option>
    <option value="school">School Name (A-Z)</option>
</select>
```

---

### 3. **Favoritter/Bookmarks** (data.js mangler)
**Problem:** Ingen måte å lagre favorittposter.

**Løsning:**
```javascript
// Legg til i data.js:
const STORAGE_KEYS = {
    // ... eksisterende
    FAVORITES: 'yearbook_favorites'
};

function addFavorite(uploadId, userId) {
    initStorage();
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    if (!favorites.find(f => f.uploadId === uploadId && f.userId === userId)) {
        favorites.push({ uploadId, userId, addedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        return { success: true };
    }
    return { success: false, message: 'Already favorited' };
}

function getFavorites(userId) {
    initStorage();
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    return favorites.filter(f => f.userId === userId).map(f => f.uploadId);
}
```

**UI:** Legg til "❤️ Favorite" knapp i `view.html`.

---

### 4. **View Count Tracking** (data.js mangler)
**Problem:** Ingen telling av hvor mange ganger en post er vist.

**Løsning:**
```javascript
// Legg til i data.js:
function incrementViewCount(uploadId) {
    initStorage();
    const uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS));
    const upload = uploads.find(u => u.id === uploadId);
    if (upload) {
        upload.viewCount = (upload.viewCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(uploads));
    }
}
```

**Kall fra:** `view.js` når posten lastes.

---

### 5. **Bildekomprimering** (upload.js mangler)
**Problem:** Store bilder lagres som base64 uten komprimering.

**Løsning:**
```javascript
// Legg til i upload.js:
function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
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
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

**Bruk:** I stedet for `reader.readAsDataURL`, bruk `compressImage` først.

---

### 6. **Søkehistorikk** (data.js mangler)
**Problem:** Ingen lagring av tidligere søk.

**Løsning:**
```javascript
// Legg til i data.js:
const STORAGE_KEYS = {
    // ... eksisterende
    SEARCH_HISTORY: 'yearbook_search_history'
};

function saveSearchHistory(searchParams) {
    initStorage();
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
    history.unshift({
        ...searchParams,
        searchedAt: new Date().toISOString()
    });
    // Behold kun siste 10 søk
    const limited = history.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limited));
}

function getSearchHistory() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
}
```

**UI:** Legg til "Recent Searches" i `search.html`.

---

### 7. **Paginering** (search.js mangler)
**Problem:** Alle resultater vises på en gang - kan være tregt med mange poster.

**Løsning:**
```javascript
// Legg til i search.js:
const RESULTS_PER_PAGE = 12;
let currentPage = 1;

function paginateResults(results) {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE;
    return {
        items: results.slice(start, end),
        totalPages: Math.ceil(results.length / RESULTS_PER_PAGE),
        currentPage
    };
}
```

**UI:** Legg til paginering-kontroller i `search.html`.

---

### 8. **Del-funksjon** (view.js mangler)
**Problem:** Ingen enkel måte å dele poster.

**Løsning:**
```javascript
// Legg til i view.js:
function sharePost(uploadId) {
    const url = `${window.location.origin}${window.location.pathname}?id=${uploadId}`;
    if (navigator.share) {
        navigator.share({
            title: document.getElementById('schoolName').textContent,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        // Vis toast: "Link copied!"
    }
}
```

**UI:** Legg til "Share" knapp i `view.html`.

---

### 9. **Tag-søk direkte** (search.js mangler)
**Problem:** Kan ikke søke direkte på tags.

**Løsning:**
```javascript
// Utvid getUploads i data.js:
if (filters.tags) {
    const tagArray = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    uploads = uploads.filter(u => 
        tagArray.some(filterTag => 
            u.tags?.some(uploadTag => 
                uploadTag.toLowerCase().includes(filterTag.toLowerCase())
            )
        )
    );
}
```

**UI:** Legg til tag-input i søkefeltet.

---

### 10. **Forrige/Neste navigation** (view.js mangler)
**Problem:** Ingen måte å navigere mellom relaterte poster.

**Løsning:**
```javascript
// Legg til i view.js:
function getRelatedPosts(currentId, filters = {}) {
    const allPosts = getUploads(filters);
    const currentIndex = allPosts.findIndex(p => p.id === currentId);
    return {
        previous: allPosts[currentIndex - 1],
        next: allPosts[currentIndex + 1]
    };
}
```

**UI:** Legg til "← Previous" og "Next →" knapper i `view.html`.

---

## 🟡 Middels prioritet forbedringer

### 11. **Bulk Upload**
**Problem:** Kan bare laste opp ett bilde om gangen.

**Løsning:** Endre `fileInput` til å akseptere flere filer:
```html
<input type="file" id="fileInput" accept="image/*" multiple>
```

### 12. **Autocomplete i søk**
**Problem:** Ingen forslag når man skriver.

**Løsning:** Bruk eksisterende data for å lage forslag:
```javascript
function getAutocompleteSuggestions(query) {
    const uploads = getUploads();
    const schools = [...new Set(uploads.map(u => u.schoolName))];
    return schools.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
}
```

### 13. **Validering av filstørrelse**
**Problem:** Ingen begrensning på filstørrelse.

**Løsning:** Legg til i `upload.js`:
```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
    alert('File is too large. Maximum size is 10MB.');
    return;
}
```

### 14. **Toast Notifications**
**Problem:** Bruker `alert()` som er dårlig UX.

**Løsning:** Lag en toast-komponent:
```javascript
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
```

### 15. **Eksporter data**
**Problem:** Ingen backup-funksjon.

**Løsning:** Legg til eksport-funksjon i `data.js`:
```javascript
function exportUserData(userId) {
    const uploads = getUploads().filter(u => u.uploadedBy === userId);
    const dataStr = JSON.stringify(uploads, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yearbook-backup-${Date.now()}.json`;
    a.click();
}
```

---

## 🟢 Quick Wins (Lett å implementere)

### 16. **Kopier link-knapp**
Legg til i `view.html`:
```html
<button onclick="copyLink()" class="btn-secondary">📋 Copy Link</button>
```

### 17. **Scroll to top**
Legg til fast knapp nederst på siden.

### 18. **Tastatursnarveier**
- `Ctrl+F` / `Cmd+F` for søk
- `ESC` for å lukke modaler
- `Enter` for å søke

### 19. **Breadcrumbs**
Vis navigasjonssti: Home > Search > View Post

### 20. **Last ned bildet**
Legg til knapp for å laste ned bildet i full størrelse.

---

## 📊 Prioritering

**Start med disse 5 først:**
1. ✅ Rediger/Slett egne poster
2. ✅ Favoritter/Bookmarks  
3. ✅ Sortering av resultater
4. ✅ View count tracking
5. ✅ Del-funksjon

**Deretter:**
6. Paginering
7. Bildekomprimering
8. Søkehistorikk
9. Toast notifications
10. Tag-søk

---

## 💡 Bonus-ideer

- **"Lignende poster"** - Vis relaterte poster basert på tags/location
- **Statistikk på profil** - Vis antall poster, visninger, favoritter
- **RSS feed** - For nye poster
- **Skjermdump** - Lagre søkeresultater som bilde
- **Print-vennlig visning** - Spesialvisning for utskrift

---

**Vil du at jeg skal implementere noen av disse?** Jeg kan starte med de 5 viktigste først!

