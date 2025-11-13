# YearBook - TODO Liste

**Sist oppdatert:** 2025-11-10  
**Status:** Konsolidert og verifisert - alle ferdige oppgaver er fjernet

---

## ✅ FERDIG (Bekreftet implementert)

- ✅ **Rapporteringssystem** - Brukere kan rapportere innlegg
- ✅ **Admin-panel** - Komplett admin-grensesnitt for moderering
- ✅ **Hamburger-meny** - Mobilvennlig navigasjon
- ✅ **Smooth animations** - Fade-in effekter og overganger
- ✅ **Service Worker** - Offline-støtte og caching
- ✅ **PWA (Progressive Web App)** - Installérbar på hjem-skjerm
- ✅ **App-ikoner** - Alle 8 størrelser generert
- ✅ **Manifest.json** - PWA-konfigurasjon
- ✅ **Pre-commit hook** - Sikkerhetssjekk for nøkler
- ✅ **Oppdatert .gitignore** - Omfattende sikkerhetsregler
- ✅ **Rediger egne poster** - Edit-funksjonalitet implementert (edit.html, updateUpload)
- ✅ **Slett egne poster** - Delete-funksjonalitet implementert (deleteUpload)
- ✅ **Favoritter/Bookmarks** - Favoritt-funksjonalitet implementert (loadFavorites, getFavoriteUploads)
- ✅ **Eksporter data** - Backup/restore funksjonalitet implementert (setupBackupRestore)
- ✅ **Tastatursnarveier** - ESC for å lukke, Enter for navigasjon (initKeyboardNavigation)
- ✅ **Input validering** - Validering for email, username, school data (validateSchoolData, validateEmail)
- ✅ **XSS beskyttelse** - sanitizeHTML og escapeHTML funksjoner implementert
- ✅ **LocalStorage quota handling** - safeSetItem og cleanupOldData implementert
- ✅ **Rate limiting** - checkRateLimit funksjon implementert

---

## 🎯 Høy prioritet

### Brukeropplevelse (UX)
- [x] ✅ **Bekreftelsesmodal ved sletting** - Modal i stedet for confirm() dialog (implementert)
- [x] ✅ **Søkehistorikk UI** - Vis søkehistorikk i brukergrensesnittet (forbedret med slett-funksjonalitet)
- [x] ✅ **Favoritter UI-forbedring** - Forbedre visning og håndtering av favoritter (forbedret med badge, teller og fjern-knapp)
- [x] ✅ **Sortering av resultater** - Sorter etter dato, år, skolenavn, visninger, lokasjon (7 alternativer)
- [x] ✅ **Paginering** - Del opp søkeresultater i sider (12 per side, allerede implementert)
- [x] ✅ **Innlogging med "Husk meg"** - Lagre innloggingsstatus (implementert)
- [x] ✅ **Innloggingsfeil fikset** - Forbedret e-post normalisering og passord-sammenligning (fikset "Invalid credentials" problem)
- [x] ✅ **Glemt passord** - Funksjon for å nullstille passord (forgot-password.html, resetPassword og checkEmailExists implementert)

### Funksjonalitet
- [x] ✅ **Kommentarer på poster** - La brukere kommentere på poster (addComment, getComments, deleteComment implementert med UI i view.html)
- [x] ✅ **Like/Favoritt på poster** - Enkel "lik" funksjon (toggleLike, isLiked, getLikeCount implementert med like-knapp i view.html)
- [x] ✅ **Del poster** - Mulighet til å dele poster via link (sharePost og copyPostLink implementert)
- [x] ✅ **Import data** - Importer poster fra fil (importUserData implementert i backup.js)
- [x] ✅ **Bulk upload** - Last opp flere bilder samtidig (støtter opptil 10 bilder med preview og progress)

### Søk og filter
- [x] ✅ **Avansert søk** - Kombinér flere filtre med AND/OR-logikk (filterLogic parameter og UI implementert)
- [x] ✅ **Søk med tags** - Filtrer direkte på tags (tagSearch input og filters.tags implementert)
- [x] ✅ **Autocomplete UI** - Vis autocomplete-forslag i søkefeltet (implementert i search.js med dropdown)
- [x] ✅ **Populære søk** - Vis mest søkte termer (getPopularSearches, updatePopularSearches implementert med UI)
- [x] ✅ **Søk etter bruker** - Finn alle poster fra en spesifikk bruker (userSearch felt og filters.username implementert)
- [x] ✅ **Dato-range filter** - Søk mellom to årstall (yearFrom og yearTo felter implementert)

### Admin-forbedringer
- [x] ✅ **Statistikk-dashboard** - Oversikt over antall poster, brukere, rapporter (implementert med dashboard-tab, stat-kort, topp-brukere og topp-poster)
- [x] ✅ **Brukeradministrasjon** - Admin kan se alle brukere og moderere (implementert med users-tab, søk, statistikk og slett-funksjonalitet)
- [x] ✅ **Masse-handlinger** - Slett/flagg flere poster samtidig (implementert med checkboxes, select all, og bulk action buttons)
- [x] ✅ **Rapport-eksport** - Eksporter rapporter til CSV (implementert med CSV-generering, Excel-kompatibilitet og automatisk nedlasting)
- [x] ✅ **E-post varsler** - Send e-post til admin ved nye rapporter (implementert med notifikasjonssystem, badge-indikator, dropdown og mailto-link)
- [x] ✅ **Admin-roller** - Flere nivåer av admin (moderator, admin, superadmin) (implementert med rollebasert tilgangskontroll, rollebadges og rolleadministrasjon)

### Juridiske forbedringer
- [x] ✅ **Personvernpolicy og vilkår** - Personvernpolicy, vilkår og betingelser, og juridisk guide implementert
- [x] ✅ **Consent-checkbox ved opplasting** - Påkrevd bekreftelse om samtykke før opplasting
- [ ] **Juridisk gjennomgang** - Få en jurist til å gjennomgå dokumentene (anbefalt)
- [ ] **Oversettelse til engelsk** - Oversett personvernpolicy og vilkår til engelsk for internasjonal bruk
- [ ] **Kontaktinformasjon for personvern** - Legg til e-postadresse for personvernhenvendelser
- [ ] **Cookie-banner** - Hvis cookies brukes (bortsett fra LocalStorage)
- [ ] **Databehandleravtale** - Hvis tredjeparts-tjenester brukes

---

## 🚀 Middels prioritet

### Design og UI
- [x] ✅ **Mørk modus** - Toggle for mørk/lys tema (implementert med CSS-variabler, toggle-knapp i header, og LocalStorage-lagring)
- [ ] **Tilpassbar fargepalett** - La brukere velge sin egen farge
- [ ] **Visningstilstander** - Grid/liste-visning for søkeresultater
- [ ] **Bildeslideshow** - Vis flere bilder i samme post som slideshow
- [x] ✅ **Zoom på bilder** - Klikk for å se bilder i full størrelse (implementert med lightbox-modal, zoom-effekt, og støtte for ESC-tast)
- [ ] **Laster indikator** - Bedre loading states overalt
- [ ] **Toast notifications** - Bedre varsling i stedet for alert() (showToast eksisterer, men ikke konsistent brukt)
- [ ] **Forbedret error-handling** - Mer informative feilmeldinger

### Ytelse og optimalisering
- [ ] **Bildekomprimering** - Komprimer bilder før upload
- [ ] **Thumbnail generering** - Lag thumbnails for raskere lasting
- [ ] **Lazy loading** - Last inn bilder kun når de er synlige
- [ ] **Komprimer LocalStorage** - Komprimer store data i LocalStorage

### Sikkerhet
- [ ] **Password hashing** - Hash passord i stedet for å lagre klartekst
- [ ] **Input validering server-side** - Valider alle input på server-side (når backend)
- [ ] **Rate limiting implementasjon** - Implementer rate limiting i upload/rapport-funksjoner (funksjon eksisterer, men ikke brukt overalt)
- [ ] **CAPTCHA** - Legg til CAPTCHA for registrering/upload

### Sosiale funksjoner
- [ ] **Brukerprofiler** - Vis offentlige profiler med brukerens poster
- [ ] **Følg brukere** - Følg favoritt-brukere
- [ ] **Meldinger** - Privat melding mellom brukere
- [ ] **Notifikasjoner** - Varsler når noen kommenterer/liker dine poster
- [ ] **Aktivitetsfeed** - Oversikt over nye poster fra brukere du følger

---

## 📊 Lav prioritet / Fremtidige ideer

### Avanserte funksjoner
- [ ] **AI-basert tagging** - Auto-generer tags med AI
- [ ] **Face recognition** - Gjenkjenn personer på bilder
- [ ] **Kart-visning** - Vis alle poster på et interaktivt kart
- [ ] **Tidslinje** - Vis poster i tidslinje-format
- [ ] **Sammenligning** - Sammenlign poster side-ved-side
- [ ] **PDF-generering** - Generer PDF-årbøker fra poster
- [ ] **Print-funksjon** - Print-vennlig visning

### Internasjonalisering
- [ ] **Flerspråklig støtte** - Norsk, engelsk, flere språk
- [ ] **Oversettelse av tags** - Automatisk oversettelse av tags
- [ ] **Land-spesifikke funksjoner** - Tilpasset for ulike land

### Integrasjoner
- [ ] **Social media sharing** - Del direkte til Facebook, Twitter, etc.
- [ ] **Email sharing** - Send poster via e-post
- [ ] **Google Maps integration** - Vis skoler på kart
- [ ] **RSS feed** - RSS feed for nye poster
- [ ] **API** - RESTful API for ekstern tilgang

### Analytics og rapportering
- [ ] **Brukerstatistikk** - Vis egne statistikk (antall poster, visninger)
- [ ] **Admin analytics** - Detaljert statistikk for admin
- [ ] **Popularitetsscore** - Rangér poster basert på views/likes
- [ ] **Søketrender** - Vis hva som er populært å søke på

### Teknisk forbedring
- [ ] **Backend migrasjon** - Flytt fra LocalStorage til backend
- [ ] **Database integration** - Bruk riktig database (PostgreSQL, MongoDB)
- [ ] **Bildehosting** - Bruk cloud storage (AWS S3, Cloudinary)
- [ ] **CDN** - Content Delivery Network for raskere lasting
- [ ] **Testing** - Unit tests og integration tests
- [ ] **CI/CD** - Automatisk deployment pipeline
- [ ] **Documentation** - API dokumentasjon og kode-kommentarer

---

## 🔧 Quick Wins (Lett å implementere)

- [x] ✅ **"Last ned bildet"** - Knapp for å laste ned bilder
- [x] ✅ **Kopier link** - Knapp for å kopiere delingslink (allerede implementert)
- [x] ✅ **Tilbake-knapp** - Bedre navigasjon tilbake fra visning (allerede implementert)
- [x] ✅ **Bekreftelsesmodal ved sletting** - Modal i stedet for confirm() dialog
- [x] ✅ **Scroll to top** - Knapp for å scrolle til toppen (på alle sider)
- [x] ✅ **Breadcrumbs** - Navigasjonsbrødsmuler (på alle sider)
- [x] ✅ **Søkebar i header** - Rask søk fra alle sider (med Ctrl+K/Cmd+K shortcut)
- [x] ✅ **Visningsteller** - Tell hvor mange ganger en post er vist (allerede implementert)

---

## 📝 Dokumentasjon

- [ ] **Oppdater README** - Legg til alle nye funksjoner (PWA, sikkerhet, etc.)
- [ ] **Bruker-guide** - Steg-for-steg guide for brukere
- [ ] **Admin-guide** - Guide for admin-funksjoner
- [ ] **Contributing guide** - Hvordan bidra til prosjektet
- [ ] **Changelog** - Dokumenter alle endringer (delvis oppdatert)

---

## 🧪 Testing (Valgfritt - PWA)

- [ ] **Teste PWA-installasjon lokalt** - Verifiser at alle ikoner fungerer
- [ ] **Teste på forskjellige nettlesere** - Chrome, Firefox, Safari, Brave
- [ ] **Teste på mobil** - iOS og Android

---

## 📊 Oppsummering

**Totalt:** 60 oppgaver gjenstår  
**Ferdig:** 30 oppgaver bekreftet implementert

**Tips:** 
- Start med Quick Wins for rask gevinst
- Fokuser på høy prioritet basert på brukerbehov
- Infrastruktur eksisterer allerede for: søkehistorikk, favoritter, autocomplete, rate limiting, XSS beskyttelse, input validering
