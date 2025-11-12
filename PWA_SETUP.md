# PWA (Progressive Web App) Setup Guide

YearBook er nå konfigurert som en Progressive Web App (PWA), som betyr at brukere kan installere appen på hjem-skjermen på mobil og desktop, og den fungerer offline!

## Funksjoner

✅ **Installerbar på alle enheter**
- Mobil (iOS, Android)
- Desktop (Windows, Mac, Linux)
- Støtter alle moderne nettlesere inkludert Brave

✅ **Offline-støtte**
- Service Worker cacher viktige filer
- Appen fungerer selv uten internett-tilkobling

✅ **App-lignende opplevelse**
- Starter i eget vindu (standalone mode)
- Ingen nettleser-adresselinje
- Rask oppstart

## Steg 1: Generer App-Ikoner

Før du kan deploye appen, må du lage app-ikoner i forskjellige størrelser:

1. **Åpne `generate-icons.html` i nettleseren**
2. **Last opp et kildebilde** (anbefalt: `assets/images/b2school.png`)
3. **Klikk "Generer Ikoner"**
4. **Last ned alle ikonene** og lagre dem i `assets/icons/` mappen

Ikonene må ha følgende navn:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## Steg 2: Test PWA Lokalt

1. **Start en lokal server** (PWA krever HTTPS eller localhost):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Eller Node.js
   npx http-server -p 8000
   ```

2. **Åpne nettleseren** og gå til `http://localhost:8000`

3. **Test installasjonen**:
   - **Chrome/Edge**: Se etter install-ikonet i adresselinjen
   - **Firefox**: Gå til meny → "Installer"
   - **Safari (iOS)**: Trykk del-knappen → "Legg til på hjem-skjerm"
   - **Brave**: Trykk på Brave-ikonet i adresselinjen → "Installer"

## Steg 3: Deploy til Produksjon

Når du deployer til produksjon (f.eks. GitHub Pages), må du sørge for:

1. **HTTPS er aktivert** (PWA krever HTTPS, unntatt localhost)
2. **Alle ikonene er lastet opp** til `assets/icons/`
3. **Service Worker er tilgjengelig** på `/service-worker.js`
4. **Manifest er tilgjengelig** på `/manifest.json`

## Nettleser-støtte

✅ **Full støtte:**
- Chrome/Edge (Android, Desktop)
- Firefox (Android, Desktop)
- Safari (iOS 11.3+, macOS)
- Brave (alle plattformer)
- Samsung Internet

⚠️ **Begrenset støtte:**
- Internet Explorer (ikke støttet)

## Installasjonsinstruksjoner for Brukere

### iOS (Safari)
1. Åpne YearBook i Safari
2. Trykk på del-knappen (□↑) nederst
3. Velg "Legg til på hjem-skjerm"
4. Trykk "Legg til"

### Android (Chrome/Firefox)
1. Åpne YearBook i nettleseren
2. Trykk på meny-ikonet (tre prikker)
3. Velg "Legg til på hjem-skjerm" eller "Installer app"
4. Bekreft installasjonen

### Desktop (Chrome/Edge/Firefox)
1. Se etter install-ikonet i adresselinjen
2. Klikk på ikonet
3. Bekreft installasjonen

### Brave
1. Trykk på Brave-ikonet i adresselinjen
2. Velg "Installer" eller "Legg til på hjem-skjerm"
3. Bekreft installasjonen

## Feilsøking

### Service Worker registreres ikke
- Sjekk at du bruker HTTPS eller localhost
- Sjekk nettleserens konsoll for feilmeldinger
- Sjekk at `service-worker.js` er tilgjengelig

### Ikoner vises ikke
- Sjekk at alle ikonene er lastet opp til `assets/icons/`
- Sjekk at stiene i `manifest.json` er korrekte
- Sjekk nettleserens konsoll for 404-feil

### Appen installeres ikke
- Sjekk at alle PWA-krav er oppfylt (HTTPS, manifest, service worker)
- Sjekk nettleserens PWA-diagnostikk (Chrome DevTools → Application → Manifest)

## Tekniske Detaljer

- **Manifest**: `manifest.json`
- **Service Worker**: `service-worker.js`
- **Registrering**: `js/pwa.js`
- **Cache-strategi**: Network first, fallback til cache

## Oppdateringer

Når du oppdaterer appen, vil brukere automatisk få beskjed om at en ny versjon er tilgjengelig. De kan velge å oppdatere med en gang eller senere.

