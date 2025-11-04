# Kodegjennomgang og Forbedringsforslag

## 🔴 Kritiske problemer (Sikkerhet og Stabilitet)

### 1. **XSS-sårbarhet (Cross-Site Scripting)**
**Problem:** Bruker `innerHTML` direkte med brukerdata uten sanitization.

**Lokasjoner:**
- `js/admin.js` linje 77-113: `div.innerHTML = ...` med brukerdata
- `js/search.js` linje 197: `card.innerHTML = ...` med brukerdata
- `js/profile.js` linje 106: `card.innerHTML = ...` med brukerdata

**Risiko:** Hackere kan injisere skadelig JavaScript kode.

**Løsning:**
```javascript
// I stedet for innerHTML, bruk textContent eller sanitize:
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Eller bruk textContent:
element.textContent = userInput;
```

---

### 2. **Manglende feilbehandling for JSON.parse**
**Problem:** Hvis localStorage er korrupt, vil hele appen crashe.

**Lokasjoner:** Alle filer som bruker `JSON.parse(localStorage.getItem(...))`

**Løsning:**
```javascript
function safeParseJSON(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return defaultValue;
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        localStorage.removeItem(key); // Fjern korrupt data
        return defaultValue;
    }
}
```

---

### 3. **Duplisert showToast funksjon**
**Problem:** Samme funksjon er definert i 4+ filer (view.js, edit.js, profile.js, upload.js).

**Løsning:** Flytt til `js/shared.js` eller `js/utils.js`:
```javascript
// I shared.js eller ny utils.js:
function showToast(message, type = 'info') {
    // ... eksisterende kode
}
```

---

### 4. **Ingen localStorage quota-håndtering**
**Problem:** LocalStorage kan fylles opp (vanligvis 5-10MB limit), og hele appen vil feile.

**Løsning:**
```javascript
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            // Prøv å rydde opp
            cleanupOldData();
            // Prøv igjen
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e2) {
                showToast('Storage full. Please delete some old data.', 'error');
                return false;
            }
        }
        return false;
    }
}

function cleanupOldData() {
    // Slett gamle søkehistorikk
    const history = getSearchHistory();
    if (history.length > 5) {
        saveSearchHistory(history.slice(0, 5));
    }
}
```

---

## 🟡 Viktige forbedringer (Kvalitet og UX)

### 5. **Manglende input-validering**
**Problem:** Ingen proper validering av email, username, file size, etc.

**Lokasjoner:**
- `js/auth.js`: Email og password validering er minimal
- `js/upload.js`: Ingen validering av skolenavn, by, etc.

**Løsning:**
```javascript
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
}

function validateSchoolData(data) {
    const errors = [];
    if (!data.schoolName || data.schoolName.trim().length < 2) {
        errors.push('School name must be at least 2 characters');
    }
    if (!data.city || data.city.trim().length < 2) {
        errors.push('City must be at least 2 characters');
    }
    if (!data.country || data.country.trim().length < 2) {
        errors.push('Country must be at least 2 characters');
    }
    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear()) {
        errors.push('Year must be between 1900 and current year');
    }
    return errors;
}
```

---

### 6. **Ingen rate limiting**
**Problem:** Brukere kan spamme uploads, reports, eller favoritter.

**Løsning:**
```javascript
function checkRateLimit(action, userId, maxActions = 10, timeWindow = 60000) {
    const key = `rateLimit_${action}_${userId}`;
    const now = Date.now();
    const data = JSON.parse(localStorage.getItem(key) || '{"count": 0, "resetAt": 0}');
    
    if (now > data.resetAt) {
        data.count = 0;
        data.resetAt = now + timeWindow;
    }
    
    if (data.count >= maxActions) {
        return { allowed: false, resetIn: Math.ceil((data.resetAt - now) / 1000) };
    }
    
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    return { allowed: true };
}
```

---

### 7. **Hardkodet paths med '../'**
**Problem:** Hvis filstruktur endres, vil paths feile.

**Lokasjoner:** Overalt i HTML-filene og JavaScript.

**Løsning:**
```javascript
// I shared.js:
const BASE_PATH = window.location.pathname.includes('/pages/') ? '../' : './';
```

---

### 8. **Manglende loading states**
**Problem:** Noen operasjoner har ikke loading indicators.

**Lokasjoner:**
- `js/profile.js`: loadFavorites har ingen loading state
- `js/edit.js`: Ingen loading state ved save

**Løsning:** Legg til loading states overalt.

---

### 9. **Memory leaks - Event listeners**
**Problem:** Event listeners blir aldri fjernet, kan forårsake memory leaks.

**Lokasjoner:** Alle filer med event listeners.

**Løsning:**
```javascript
// Bruk AbortController for å kunne fjerne listeners:
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
// Når du vil fjerne:
controller.abort();
```

---

### 10. **getUploads kan returnere undefined**
**Problem:** Hvis localStorage er tom, kan `getUploads()` returnere undefined.

**Løsning:**
```javascript
function getUploads(filters = {}) {
    initStorage();
    let uploads = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADS)) || []; // Legg til || []
    // ... resten av koden
}
```

---

## 🟢 Forbedringer (Kodekvalitet og vedlikehold)

### 11. **Manglende TypeScript/JSDoc**
**Problem:** Ingen type-informasjon, vanskelig å vedlikeholde.

**Løsning:** Legg til JSDoc kommentarer:
```javascript
/**
 * @param {string} uploadId 
 * @param {string} userId 
 * @returns {boolean}
 */
function canEditUpload(uploadId, userId) {
    // ...
}
```

---

### 12. **Magic numbers og strings**
**Problem:** Hardkodede verdier overalt.

**Løsning:**
```javascript
const CONSTANTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    COMPRESSION_THRESHOLD: 2 * 1024 * 1024, // 2MB
    RESULTS_PER_PAGE: 12,
    MAX_SEARCH_HISTORY: 10,
    MAX_AUTOCOMPLETE_RESULTS: 5
};
```

---

### 13. **Manglende error boundaries**
**Problem:** Hvis noe feiler, kan hele siden crashe.

**Løsning:**
```javascript
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An error occurred. Please refresh the page.', 'error');
});
```

---

### 14. **Manglende accessibility (A11y)**
**Problem:** Mangler ARIA-labels, keyboard navigation, etc.

**Løsning:**
- Legg til `aria-label` på alle ikoner og knapper
- Sørg for at alle interaktive elementer er keyboard-navigerbare
- Legg til `role` attributter der nødvendig

---

### 15. **Ingen debouncing på søk**
**Problem:** Autocomplete kan være tregt med mange uploads.

**Løsning:** Du har allerede debouncing i `setupAutocomplete()`, men vurder å øke delay.

---

### 16. **Manglende offline-støtte**
**Problem:** Hvis nettleseren går offline, vil appen ikke fungere.

**Løsning:** Vurder Service Worker for offline caching.

---

### 17. **getUploads er ineffektiv**
**Problem:** Filtrerer gjennom alle uploads hver gang, kan være tregt med mange poster.

**Løsning:** Vurder å cache resultater eller bruke indeksering.

---

### 18. **Ingen batch-operasjoner**
**Problem:** Hver operasjon skriver til localStorage separat.

**Løsning:** Batch flere operasjoner sammen.

---

### 19. **Manglende logging**
**Problem:** Vanskelig å debugge problemer i produksjon.

**Løsning:**
```javascript
const DEBUG = true; // Sett til false i produksjon
function log(...args) {
    if (DEBUG) console.log('[YearBook]', ...args);
}
```

---

### 20. **Ingen backup/restore**
**Problem:** Hvis localStorage slettes, går alt data tapt.

**Løsning:** Legg til eksport/import funksjonalitet.

---

## 📝 Prioritering

**Start med disse 5 først:**
1. ✅ XSS-beskyttelse (innerHTML → textContent/sanitize)
2. ✅ JSON.parse error handling
3. ✅ Flytt showToast til shared.js
4. ✅ Input-validering
5. ✅ localStorage quota handling

**Deretter:**
6. Rate limiting
7. Loading states
8. Error boundaries
9. Accessibility
10. Code cleanup (magic numbers, etc.)

---

Vil du at jeg skal implementere noen av disse forbedringene?

