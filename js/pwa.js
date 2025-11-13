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
let deferredPrompt = null;
let installButton = null;

// Initialiser installasjonsknapp når DOM er klar
document.addEventListener('DOMContentLoaded', () => {
    initInstallButton();
});

function initInstallButton() {
    // Finn eller opprett installasjonsknapp
    installButton = document.getElementById('installButton');
    
    if (!installButton) {
        // Opprett knapp hvis den ikke finnes
        installButton = document.createElement('button');
        installButton.id = 'installButton';
        installButton.className = 'btn-install-pwa hidden';
        
        // Bestem tekst basert på enhet
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            installButton.innerHTML = '📱 Legg til på hjem-skjerm';
            installButton.setAttribute('aria-label', 'Installer app på hjem-skjerm');
        } else {
            installButton.innerHTML = '💻 Installer app';
            installButton.setAttribute('aria-label', 'Installer app');
        }
        
        // Legg til i header eller før footer
        const header = document.querySelector('.header .container');
        if (header) {
            const nav = header.querySelector('.nav');
            if (nav) {
                nav.appendChild(installButton);
            } else {
                header.appendChild(installButton);
            }
        } else {
            // Fallback: legg til før footer
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.insertAdjacentElement('beforebegin', installButton);
            } else {
                document.body.appendChild(installButton);
            }
        }
    }
    
    // Legg til event listener
    installButton.addEventListener('click', handleInstallClick);
    
    // Sjekk om appen allerede er installert
    checkIfInstalled();
    
    // Vis knappen for alle nettlesere (mobil og desktop) hvis appen ikke er installert
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isBrave = navigator.brave && navigator.brave.isBrave;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Vis knappen for iOS Safari, Brave, og desktop-nettlesere
    // (Chrome/Edge på desktop vil få beforeinstallprompt, men vi viser knappen allikevel for instruksjoner)
    if (!checkIfInstalled() && installButton) {
        // Vis alltid knappen hvis appen ikke er installert
        installButton.classList.remove('hidden');
    }
}

// Sjekk om appen allerede er installert
function checkIfInstalled() {
    // For standalone mode (installert PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        if (installButton) {
            installButton.classList.add('hidden');
        }
        return true;
    }
    return false;
}

window.addEventListener('beforeinstallprompt', (e) => {
    // Forhindre standard prompt
    e.preventDefault();
    // Lagre event for senere bruk
    deferredPrompt = e;
    
    // Vis installasjonsknapp
    if (installButton) {
        installButton.classList.remove('hidden');
    } else {
        initInstallButton();
    }
});

// Håndter når appen er installert
window.addEventListener('appinstalled', () => {
    console.log('App installert!');
    deferredPrompt = null;
    if (installButton) {
        installButton.classList.add('hidden');
    }
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        showToast('App installert! Du finner den på hjem-skjermen.', 'success');
    } else {
        showToast('App installert! Du finner den i app-listen eller på skrivebordet.', 'success');
    }
});

// Håndter klikk på installasjonsknapp
function handleInstallClick() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isBrave = navigator.brave && navigator.brave.isBrave;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isMacOS = /Macintosh|Mac OS X/.test(navigator.userAgent);
    
    // Hvis beforeinstallprompt er tilgjengelig (Chrome, Edge, Brave på desktop/mobil)
    if (deferredPrompt) {
        // Vis installasjonsprompt
        deferredPrompt.prompt();
        
        // Vent på brukerens svar
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Brukeren aksepterte installasjonen');
                showToast('App installert! Du finner den på hjem-skjermen eller i app-listen.', 'success');
            } else {
                console.log('Brukeren avviste installasjonen');
            }
            deferredPrompt = null;
            
            if (installButton) {
                installButton.classList.add('hidden');
            }
        });
        return;
    }
    
    // iOS Safari (mobil) - vis instruksjoner
    if (isIOS && isSafari && isMobile) {
        showIOSInstallInstructions();
        return;
    }
    
    // Safari på macOS (desktop) - vis instruksjoner
    if (isSafari && isMacOS && !isMobile) {
        showSafariDesktopInstructions();
        return;
    }
    
    // Brave - vis instruksjoner for både mobil og desktop
    if (isBrave) {
        if (isMobile) {
            showBraveMobileInstructions();
        } else {
            showBraveDesktopInstructions();
        }
        return;
    }
    
    // Chrome/Edge på desktop - vis instruksjoner
    if ((isChrome || isEdge) && !isMobile) {
        showChromeDesktopInstructions();
        return;
    }
    
    // Firefox - vis instruksjoner
    if (isFirefox) {
        showFirefoxInstructions();
        return;
    }
    
    // Generelle instruksjoner for andre nettlesere
    showManualInstallInstructions();
}

// Funksjon for å installere appen (backward compatibility)
function installApp() {
    handleInstallClick();
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

// Vis iOS installasjonsinstruksjoner
function showIOSInstallInstructions() {
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-modal-content">
            <h3>📱 Legg til på hjem-skjerm (iOS)</h3>
            <div class="pwa-instructions">
                <ol style="text-align: left; padding-left: 1.5rem;">
                    <li>Trykk på <strong>del-knappen</strong> (□↑) nederst i Safari</li>
                    <li>Scroll ned og velg <strong>"Legg til på hjem-skjerm"</strong></li>
                    <li>Trykk <strong>"Legg til"</strong> i øvre høyre hjørne</li>
                </ol>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Appen vil nå vises på hjem-skjermen som en egen app!
                </p>
            </div>
            <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Vis Brave installasjonsinstruksjoner (mobil)
function showBraveMobileInstructions() {
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-modal-content">
            <h3>📱 Legg til på hjem-skjerm (Brave - Mobil)</h3>
            <div class="pwa-instructions">
                <ol style="text-align: left; padding-left: 1.5rem;">
                    <li>Trykk på <strong>meny-ikonet</strong> (tre prikker) øverst til høyre</li>
                    <li>Velg <strong>"Legg til på hjem-skjerm"</strong> eller <strong>"Installer app"</strong></li>
                    <li>Bekreft installasjonen</li>
                </ol>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Alternativt: Se etter install-ikonet i adresselinjen.
                </p>
            </div>
            <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Vis Brave installasjonsinstruksjoner (desktop)
function showBraveDesktopInstructions() {
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-modal-content">
            <h3>💻 Installer app (Brave - Desktop)</h3>
            <div class="pwa-instructions">
                <ol style="text-align: left; padding-left: 1.5rem;">
                    <li>Se etter <strong>install-ikonet</strong> (➕) i adresselinjen til høyre</li>
                    <li>Klikk på ikonet for å installere appen</li>
                    <li>Bekreft installasjonen i popup-vinduet</li>
                </ol>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Alternativt: Gå til meny (tre prikker) → <strong>"Installer YearBook"</strong>
                </p>
            </div>
            <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Vis Chrome/Edge desktop instruksjoner
function showChromeDesktopInstructions() {
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-modal-content">
            <h3>💻 Installer app (Chrome/Edge - Desktop)</h3>
            <div class="pwa-instructions">
                <ol style="text-align: left; padding-left: 1.5rem;">
                    <li>Se etter <strong>install-ikonet</strong> (➕) i adresselinjen til høyre</li>
                    <li>Klikk på ikonet for å installere appen</li>
                    <li>Bekreft installasjonen i popup-vinduet</li>
                </ol>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Appen vil vises i app-listen og kan åpnes som et eget vindu uten nettleser-verktøylinje.
                </p>
            </div>
            <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Vis Safari desktop instruksjoner
function showSafariDesktopInstructions() {
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    modal.innerHTML = `
        <div class="pwa-modal-content">
            <h3>💻 Legg til på Dock (Safari - macOS)</h3>
            <div class="pwa-instructions">
                <ol style="text-align: left; padding-left: 1.5rem;">
                    <li>Klikk på <strong>"Deling"</strong>-ikonet (□↑) i verktøylinjen</li>
                    <li>Velg <strong>"Legg til på Dock"</strong></li>
                    <li>Appen vil nå vises i Dock</li>
                </ol>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    Du kan også dra ikonet fra adresselinjen til Dock.
                </p>
            </div>
            <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Vis Firefox instruksjoner
function showFirefoxInstructions() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const modal = document.createElement('div');
    modal.className = 'pwa-install-modal';
    
    if (isMobile) {
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <h3>📱 Installer app (Firefox - Mobil)</h3>
                <div class="pwa-instructions">
                    <ol style="text-align: left; padding-left: 1.5rem;">
                        <li>Trykk på <strong>meny-ikonet</strong> (tre prikker) øverst til høyre</li>
                        <li>Velg <strong>"Installer"</strong> eller <strong>"Legg til på hjem-skjerm"</strong></li>
                        <li>Bekreft installasjonen</li>
                    </ol>
                </div>
                <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div class="pwa-modal-content">
                <h3>💻 Installer app (Firefox - Desktop)</h3>
                <div class="pwa-instructions">
                    <ol style="text-align: left; padding-left: 1.5rem;">
                        <li>Klikk på <strong>meny-ikonet</strong> (tre linjer) øverst til høyre</li>
                        <li>Velg <strong>"Mer verktøy"</strong> → <strong>"Installer"</strong></li>
                        <li>Bekreft installasjonen</li>
                    </ol>
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                        Appen vil åpnes som et eget vindu uten nettleser-verktøylinje.
                    </p>
                </div>
                <button class="pwa-close-btn" onclick="this.closest('.pwa-install-modal').remove()">Lukk</button>
            </div>
        `;
    }
    document.body.appendChild(modal);
}

// Vis manuelle installasjonsinstruksjoner
function showManualInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
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

