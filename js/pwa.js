// Progressive Web App (PWA) Registration and Installation
// Støtter installasjon på alle nettlesere inkludert Brave

// Registrer Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = './service-worker.js';
        navigator.serviceWorker.register(swPath)
            .then((registration) => {
                console.log('Service Worker registrert:', registration.scope);
                
                // Sjekk for oppdateringer
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Ny versjon tilgjengelig
                            console.log('Ny versjon av appen er tilgjengelig!');
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker registrering feilet:', error);
            });
    });
    
    // Håndter Service Worker oppdateringer
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

// Installer prompt håndtering
let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
    // Forhindre standard prompt
    e.preventDefault();
    // Lagre event for senere bruk
    deferredPrompt = e;
    
    // Vis installasjonsknapp hvis den finnes
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', installApp);
    } else {
        // Vis en toast eller melding
        showInstallPrompt();
    }
});

// Funksjon for å installere appen
function installApp() {
    if (!deferredPrompt) {
        // Hvis beforeinstallprompt ikke er støttet, vis instruksjoner
        showManualInstallInstructions();
        return;
    }
    
    // Vis installasjonsprompt
    deferredPrompt.prompt();
    
    // Vent på brukerens svar
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Brukeren aksepterte installasjonen');
        } else {
            console.log('Brukeren avviste installasjonen');
        }
        deferredPrompt = null;
        
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
}

// Vis installasjonsprompt for nettlesere som støtter det
function showInstallPrompt() {
    // Lag en toast-melding
    const toast = document.createElement('div');
    toast.className = 'pwa-install-toast';
    toast.innerHTML = `
        <div class="pwa-toast-content">
            <p>Installer YearBook på hjem-skjermen for rask tilgang!</p>
            <button id="pwaInstallBtn" class="pwa-install-btn">Installer</button>
            <button id="pwaDismissBtn" class="pwa-dismiss-btn">×</button>
        </div>
    `;
    document.body.appendChild(toast);
    
    document.getElementById('pwaInstallBtn').addEventListener('click', installApp);
    document.getElementById('pwaDismissBtn').addEventListener('click', () => {
        toast.remove();
    });
    
    // Fjern automatisk etter 10 sekunder
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 10000);
}

// Vis manuelle installasjonsinstruksjoner
function showManualInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isBrave = navigator.brave && navigator.brave.isBrave;
    
    let instructions = '';
    
    if (isIOS) {
        instructions = `
            <strong>Installer på iOS:</strong><br>
            1. Trykk på del-knappen (□↑) nederst<br>
            2. Velg "Legg til på hjem-skjerm"<br>
            3. Trykk "Legg til"
        `;
    } else if (isAndroid) {
        instructions = `
            <strong>Installer på Android:</strong><br>
            1. Trykk på meny-ikonet (tre prikker) i nettleseren<br>
            2. Velg "Legg til på hjem-skjerm" eller "Installer app"<br>
            3. Bekreft installasjonen
        `;
    } else if (isBrave) {
        instructions = `
            <strong>Installer i Brave:</strong><br>
            1. Trykk på Brave-ikonet i adresselinjen<br>
            2. Velg "Installer" eller "Legg til på hjem-skjerm"<br>
            3. Bekreft installasjonen
        `;
    } else {
        instructions = `
            <strong>Installer appen:</strong><br>
            For Chrome/Edge: Trykk på install-ikonet i adresselinjen<br>
            For Firefox: Gå til meny → "Installer"<br>
            For Safari: Del → "Legg til på hjem-skjerm"
        `;
    }
    
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-modal-content">
            <h3>Installer YearBook</h3>
            <div class="pwa-instructions">${instructions}</div>
            <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Vis oppdateringsvarsel
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
        <div class="pwa-update-content">
            <p>Ny versjon tilgjengelig!</p>
            <button id="pwaUpdateBtn" class="pwa-update-btn">Oppdater nå</button>
            <button id="pwaUpdateLaterBtn" class="pwa-update-later-btn">Senere</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    document.getElementById('pwaUpdateBtn').addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('pwaUpdateLaterBtn').addEventListener('click', () => {
        notification.remove();
    });
}

// Eksporter installApp for global tilgang
window.installApp = installApp;

