# 🎨 Guide for Ikon-Generering

Det finnes flere måter å generere app-ikonene på. Velg den som passer best for deg!

## Metode 1: Automatisk HTML-verktøy (Anbefalt - Enklest) ⭐

### Steg:
1. **Åpne `generate-icons-auto.html`** i nettleseren
2. **Last opp kildebildet** (`assets/images/b2school.png`)
3. **Klikk "Generer alle ikoner"**
4. **Klikk "Last ned alle"** - alle ikonene lastes ned automatisk!
5. **Flytt alle nedlastede filer** til `assets/icons/` mappen

### Fordeler:
- ✅ Ingen installasjon nødvendig
- ✅ Fungerer i alle nettlesere
- ✅ Automatisk nedlasting av alle filer
- ✅ Visuell forhåndsvisning

---

## Metode 2: Python Script (Raskest)

### Forutsetninger:
```bash
pip install Pillow
```

### Steg:
1. **Kjør scriptet:**
   ```bash
   python generate-icons.py
   ```
   
   Eller spesifiser et annet bilde:
   ```bash
   python generate-icons.py assets/images/b2school.png
   ```

2. **Ikonene genereres automatisk** i `assets/icons/` mappen

### Fordeler:
- ✅ Raskest metode
- ✅ Alle ikoner genereres på en gang
- ✅ Ingen manuell nedlasting

---

## Metode 3: Original HTML-verktøy

### Steg:
1. **Åpne `generate-icons.html`** i nettleseren
2. **Last opp kildebildet**
3. **Klikk "Generer Ikoner"**
4. **Last ned hvert ikon manuelt** ved å klikke "Last ned" på hvert ikon
5. **Lagre alle filer** i `assets/icons/` mappen

---

## 📋 Nødvendige Ikoner

Følgende ikoner må være i `assets/icons/` mappen:

- ✅ `icon-72x72.png`
- ✅ `icon-96x96.png`
- ✅ `icon-128x128.png`
- ✅ `icon-144x144.png`
- ✅ `icon-152x152.png`
- ✅ `icon-192x192.png`
- ✅ `icon-384x384.png`
- ✅ `icon-512x512.png`

## ✅ Verifisering

Etter at alle ikonene er generert, sjekk at:

1. **Alle filer eksisterer:**
   ```bash
   # Windows PowerShell
   Get-ChildItem assets\icons\icon-*.png | Select-Object Name
   ```

2. **Filer har riktig navn:**
   - Alle filer skal starte med `icon-`
   - Alle filer skal ende med `.png`
   - Størrelser må matche: 72, 96, 128, 144, 152, 192, 384, 512

3. **Test i nettleseren:**
   - Åpne `index.html` i nettleseren
   - Sjekk nettleserens konsoll for feilmeldinger
   - Test PWA-installasjonen

## 🐛 Feilsøking

### "Ikoner vises ikke"
- Sjekk at alle filer er i `assets/icons/` mappen
- Sjekk at filnavnene er nøyaktig riktige (case-sensitive)
- Sjekk nettleserens konsoll for 404-feil

### "Python script fungerer ikke"
- Installer Pillow: `pip install Pillow`
- Sjekk at Python er installert: `python --version`
- Sjekk at kildebildet eksisterer

### "HTML-verktøy laster ikke ned"
- Prøv en annen nettleser
- Sjekk at popup-blokkering er deaktivert
- Last ned hvert ikon manuelt i stedet

## 💡 Tips

- **Bruk firkantede bilder** for beste resultat
- **Minimum størrelse**: Kildebildet bør være minst 512x512 px
- **PNG-format**: Alle ikoner må være PNG med transparent bakgrunn
- **Hvit bakgrunn**: Ikonene får automatisk hvit bakgrunn

## 🎯 Neste Steg

Når alle ikonene er generert:
1. ✅ Verifiser at alle filer er på plass
2. ✅ Test PWA-installasjonen lokalt
3. ✅ Deploy til produksjon med HTTPS

