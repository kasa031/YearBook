# YearBook - Forbedringsliste og TODO

## 🎯 Høy prioritet

### Brukeropplevelse (UX)
- [ ] **Bekreftelsesmodal ved sletting** - Legg til "Er du sikker?"-modal før sletting av poster
- [ ] **Søkehistorikk** - Lagre brukerens søkehistorikk for rask tilgang
- [ ] **Favoritter/Bookmarks** - La brukere lagre favorittposter
- [ ] **Sortering av resultater** - Sorter etter dato, mest populære, alfabetisk
- [ ] **Paginering** - Del opp søkeresultater i sider (f.eks. 12 per side)
- [ ] **Innlogging med "Husk meg"** - Lagre innloggingsstatus
- [ ] **Glemt passord** - Funksjon for å nullstille passord

### Funksjonalitet
- [ ] **Rediger egne poster** - La brukere redigere poster de har lagt opp
- [ ] **Slett egne poster** - La brukere slette sine egne poster
- [ ] **Kommentarer på poster** - La brukere kommentere på poster
- [ ] **Like/Favoritt på poster** - Enkel "lik" funksjon
- [ ] **Del poster** - Mulighet til å dele poster via link
- [ ] **Eksporter data** - La brukere eksportere sine egne poster som JSON/CSV
- [ ] **Import data** - Importer poster fra fil
- [ ] **Bulk upload** - Last opp flere bilder samtidig

### Søk og filter
- [ ] **Avansert søk** - Kombinér flere filtre med AND/OR-logikk
- [ ] **Søk med tags** - Filtrer direkte på tags
- [ ] **Autocomplete** - Forslag ved skriving i søkefelt
- [ ] **Populære søk** - Vis mest søkte termer
- [ ] **Søk etter bruker** - Finn alle poster fra en spesifikk bruker
- [ ] **Dato-range filter** - Søk mellom to årstall

### Admin-forbedringer
- [ ] **Statistikk-dashboard** - Oversikt over antall poster, brukere, rapporter
- [ ] **Brukeradministrasjon** - Admin kan se alle brukere og moderere
- [ ] **Masse-handlinger** - Slett/flagg flere poster samtidig
- [ ] **Rapport-eksport** - Eksporter rapporter til CSV
- [ ] **E-post varsler** - Send e-post til admin ved nye rapporter
- [ ] **Admin-roller** - Flere nivåer av admin (moderator, superadmin)

## 🚀 Middels prioritet

### Design og UI
- [ ] **Mørk modus** - Toggle for mørk/lys tema
- [ ] **Tilpassbar fargepalett** - La brukere velge sin egen farge
- [ ] **Visningstilstander** - Grid/liste-visning for søkeresultater
- [ ] **Bildeslideshow** - Vis flere bilder i samme post som slideshow
- [ ] **Zoom på bilder** - Klikk for å se bilder i full størrelse
- [ ] **Laster indikator** - Bedre loading states overalt
- [ ] **Toast notifications** - Bedre varsling i stedet for alert()
- [ ] **Forbedret error-handling** - Mer informative feilmeldinger

### Ytelse og optimalisering
- [ ] **Bildekomprimering** - Komprimer bilder før upload
- [ ] **Thumbnail generering** - Lag thumbnails for raskere lasting
- [ ] **Lazy loading** - Last inn bilder kun når de er synlige
- [ ] **Service Worker** - Offline-støtte og caching
- [ ] **Data-eksport/import** - Backup/restore funksjonalitet
- [ ] **Komprimer LocalStorage** - Komprimer store data i LocalStorage

### Sikkerhet
- [ ] **Password hashing** - Hash passord i stedet for å lagre klartekst
- [ ] **Input validering** - Valider alle input på server-side (når backend)
- [ ] **XSS beskyttelse** - Sanitize all brukerinput
- [ ] **Rate limiting** - Begrens antall uploads/rapporter per bruker
- [ ] **CAPTCHA** - Legg til CAPTCHA for registrering/upload

### Sosiale funksjoner
- [ ] **Brukerprofiler** - Vis offentlige profiler med brukerens poster
- [ ] **Følg brukere** - Følg favoritt-brukere
- [ ] **Meldinger** - Privat melding mellom brukere
- [ ] **Notifikasjoner** - Varsler når noen kommenterer/liker dine poster
- [ ] **Aktivitetsfeed** - Oversikt over nye poster fra brukere du følger

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

## 🔧 Quick Wins (Lett å implementere)

- [x] ✅ Rapporteringssystem - **Ferdig!**
- [x] ✅ Admin-panel - **Ferdig!**
- [x] ✅ Hamburger-meny - **Ferdig!**
- [x] ✅ Smooth animations - **Ferdig!**
- [ ] **"Last ned bildet"** - Knapp for å laste ned bilder
- [ ] **Kopier link** - Knapp for å kopiere delingslink
- [ ] **Tilbake-knapp** - Bedre navigasjon tilbake fra visning
- [ ] **Tastatursnarveier** - ESC for å lukke modaler, Enter for søk
- [ ] **Breadcrumbs** - Navigasjonsbrødsmuler
- [ ] **Scroll to top** - Knapp for å scrolle til toppen
- [ ] **Søkebar i header** - Rask søk fra alle sider
- [ ] **Visningsteller** - Tell hvor mange ganger en post er vist

## 📝 Dokumentasjon

- [ ] **Oppdater README** - Legg til alle nye funksjoner
- [ ] **Bruker-guide** - Steg-for-steg guide for brukere
- [ ] **Admin-guide** - Guide for admin-funksjoner
- [ ] **Contributing guide** - Hvordan bidra til prosjektet
- [ ] **Changelog** - Dokumenter alle endringer

---

**Sist oppdatert:** 2025-11-04

**Tips:** Start med Quick Wins for rask gevinst, deretter fokuser på høy prioritet basert på brukerbehov.

