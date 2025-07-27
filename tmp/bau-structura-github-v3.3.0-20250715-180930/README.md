# Bau-Structura v3.3.0 - Construction Project Management System

## 🚧 Projekt-Status: Produktionsbereit

**Letztes Update:** 15. Juli 2025  
**Version:** 3.3.0  
**Backup erstellt:** $(date '+%d.%m.%Y %H:%M:%S')

## 🌟 Neue Features in v3.3.0

### ✅ Willkommens-E-Mail-System überarbeitet
- Fokus auf App-Vorteile statt technische SFTP-Details
- Benutzer-Berechtigungen klar erklärt
- Moderne, übersichtliche Darstellung
- Mobile-First Design, KI-Unterstützung, Hochwasserschutz hervorgehoben

### ✅ E-Mail-System vollständig aktiviert
- Echte BREVO-E-Mail-Integration aktiviert
- Test-E-Mail-Funktionalität über authentische SMTP-Relay
- Automatische Benachrichtigungen für Support-Tickets
- Willkommens-E-Mails bei Registrierung

### ✅ Intelligentes Fehlerlernsystem
- Live-Dashboard mit Echtzeit-Statistiken
- Automatische Mustererkennung und Fehlerdokumentation
- Proaktive Präventionsmaßnahmen
- 30-Sekunden Auto-Refresh für Admin-Monitoring

### ✅ Vollständige Sicherheitsarchitektur
- Alle Frontend-Routes durch ProtectedRoute geschützt
- User-Isolation für alle Datenbankoperationen
- Rollenbasierte Berechtigungen (Admin/Manager/User)
- Rate Limiting und CORS-Konfiguration

### ✅ Administratoren-Rollenverwaltung
- Dialog-Interface für Rollenänderungen
- Sicherheitsfeatures (Admins können eigene Rolle nicht ändern)
- Audit-Logging für alle Rollenänderungen
- Benutzerfreundliche Fehlermeldungen

## 🏗️ Technische Architektur

### Frontend
- **React 18** mit TypeScript und Vite
- **Tailwind CSS** für responsives Design
- **shadcn/ui** Komponenten
- **TanStack Query** für Server-State-Management
- **Wouter** für Client-seitiges Routing

### Backend
- **Node.js** mit Express.js
- **TypeScript** mit ES Modules
- **PostgreSQL** mit Drizzle ORM
- **Passport.js** für lokale Authentifizierung
- **BREVO SMTP** für E-Mail-Versand

### Features
- **Progressive Web App (PWA)** mit Offline-Unterstützung
- **KI-Integration** mit OpenAI GPT-4
- **Hochwasserschutz-Modul** mit Checklisten
- **GPS-Integration** und Karten-Funktionalität
- **Kamera & Audio** für mobile Dokumentation
- **SFTP-Server** für Datei-Management

## 🚀 Installation

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Setup
```bash
# Repository klonen
git clone https://github.com/YOUR-USERNAME/bau-structura.git
cd bau-structura

# Dependencies installieren
npm install

# Datenbank konfigurieren
cp .env.example .env
# DATABASE_URL in .env anpassen

# Datenbank-Schema erstellen
npm run db:push

# Entwicklungsserver starten
npm run dev
```

## 🔧 Konfiguration

### Umgebungsvariablen
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/baustructura
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-user
SMTP_PASS=your-brevo-key
```

### Produktionsdeployment
```bash
# Frontend build
npm run build

# Server starten
npm start
```

## 📊 Systemanforderungen

### Minimum
- **Server:** 1 CPU, 1GB RAM, 10GB SSD
- **Datenbank:** PostgreSQL 14+
- **Node.js:** Version 18+

### Empfohlen
- **Server:** 2 CPU, 4GB RAM, 50GB SSD
- **Backup:** Automatische Datenbank-Backups
- **SSL:** TLS 1.3 Verschlüsselung

## 🔒 Sicherheitsfeatures

- **Authentifizierung:** Lokales Passport.js-System
- **Autorisierung:** Rollenbasierte Zugriffskontrolle
- **Datenschutz:** Vollständige User-Isolation
- **Verschlüsselung:** bcrypt Passwort-Hashing
- **Rate Limiting:** Schutz vor Brute-Force-Attacken

## 🤝 Support

- **Dokumentation:** `/docs` Verzeichnis
- **GitHub Issues:** Für Bug-Reports und Feature-Requests
- **E-Mail:** support@bau-structura.de

## 📝 Lizenz

Proprietäre Software - Alle Rechte vorbehalten
© 2025 Bau-Structura Project Management System

---

**Entwickelt mit ❤️ für die Baubranche**