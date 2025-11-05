# Sikkerhetsguide - API-nøkler og sensitiv informasjon

## ⚠️ VIKTIG: Ikke committ sensitiv informasjon

**ALDRIG** committ følgende typer informasjon til Git/GitHub:

- API-nøkler (OpenRouter, OpenAI, osv.)
- Passord
- Tokens og access keys
- Database-tilkoblingsstrenger
- Private keys
- Personopplysninger
- Andre hemmeligheter

## Hvordan bruke API-nøkler sikkert

### 1. Bruk config.js (ikke committet)

1. **Kopier `config.js.example` til `config.js`**
   ```bash
   cp config.js.example config.js
   ```

2. **Legg til din API-nøkkel i `config.js`**
   ```javascript
   const CONFIG = {
       OPENROUTER_API_KEY: 'din-api-nøkkel-her'
   };
   ```

3. **Inkluder `config.js` i HTML-filene**
   ```html
   <script src="config.js"></script>
   <script src="js/main.js"></script>
   ```

4. **Bruk konfigurasjonen i koden**
   ```javascript
   // I din JavaScript-fil
   const apiKey = CONFIG.OPENROUTER_API_KEY;
   ```

### 2. Sjekk at .gitignore fungerer

`config.js` er allerede lagt til i `.gitignore`, så den vil ikke bli committet.

Test dette ved å kjøre:
```bash
git status
```

Hvis `config.js` vises i output, er den IKKE ignorert. Sjekk at `.gitignore` er korrekt.

### 3. Hvis du har committet en API-nøkkel ved uhell

**UMIDDELBART:**
1. **Roter API-nøkkelen** på leverandørens side (OpenRouter dashboard)
2. **Fjern den fra Git-historikken** (se nedenfor)
3. **Legg til filen i `.gitignore`**
4. **Opprett en ny API-nøkkel**

**Fjerne fra Git-historikk:**
```bash
# Fjern filen fra Git (men behold den lokalt)
git rm --cached config.js

# Commit endringen
git commit -m "Remove sensitive config file"

# Push til GitHub
git push origin main
```

**For fullstendig fjerning fra historikk** (krever force push):
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config.js" \
  --prune-empty --tag-name-filter cat -- --all
  
git push origin --force --all
```

⚠️ **Advarsel:** Force push kan påvirke andre som har klonet repositoriet.

## Sjekkliste før hver commit

- [ ] Har jeg sjekket `git status` for nye filer?
- [ ] Er alle API-nøkler i `config.js` (ikke hardkodet)?
- [ ] Er `config.js` i `.gitignore`?
- [ ] Har jeg testet at `config.js` ikke dukker opp i `git status`?
- [ ] Har jeg fjernet alle hardkodede nøkler fra koden?

## Best practices

1. **Bruk alltid eksempel-filer** (`config.js.example`) for å vise struktur
2. **Legg til i .gitignore først**, før du lager config-filen
3. **Bruk miljøvariabler** i produksjon (hvis mulig)
4. **Roter nøkler umiddelbart** hvis de lekker ut
5. **Ikke del screenshots** med API-nøkler synlig

## Hjelp

Hvis du er usikker, sjekk alltid `git status` før du committer!

