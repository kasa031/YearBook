# Guide for å pushe YearBook til GitHub Pages

## Steg 1: Initialiser Git Repository

```bash
# I prosjektmappen (YearBook)
git init
```

## Steg 2: Legg til alle filer

```bash
git add .
```

## Steg 3: Lag første commit

```bash
git commit -m "Initial commit - YearBook v2.0 with report system and admin panel"
```

## Steg 4: Opprett repository på GitHub

1. Gå til https://github.com/kasa031
2. Klikk "New repository"
3. Navn: `YearBook` (eller hva du vil)
4. Beskrivelse: "Global school memories platform - Search and share yearbooks"
5. Velg **Public** (for GitHub Pages)
6. Ikke huk av "Initialize with README" (vi har allerede filer)
7. Klikk "Create repository"

## Steg 5: Koble til GitHub repository

```bash
# Erstatt [repository-name] med navnet du valgte
git remote add origin https://github.com/kasa031/[repository-name].git
```

## Steg 6: Push til GitHub

```bash
git branch -M main
git push -u origin main
```

## Steg 7: Aktiver GitHub Pages

1. Gå til repository på GitHub
2. Klikk på **Settings**
3. Scroll ned til **Pages** i venstre meny
4. Under **Source**, velg:
   - Branch: `main`
   - Folder: `/ (root)`
5. Klikk **Save**

## Steg 8: Din nettside er live!

Din nettside vil være tilgjengelig på:
```
https://kasa031.github.io/[repository-name]/
```

Det kan ta noen minutter før den er tilgjengelig første gang.

## Fremtidige oppdateringer

Når du gjør endringer:

```bash
git add .
git commit -m "Beskrivelse av endringene"
git push
```

GitHub Pages oppdateres automatisk!

## Tips

- **Commit-meldinger**: Vær beskrivende i commit-meldingene
- **Branch**: Vurder å bruke branches for større endringer
- **Backup**: Git er nå en backup av prosjektet ditt
- **Versjonering**: Se CHANGELOG.md for oversikt over endringer

