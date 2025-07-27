# Changelog - Bau-Structura

## [3.3.0] - 2025-07-15

### 🎉 Neue Features
- **Willkommens-E-Mail überarbeitet**: Fokus auf App-Vorteile statt technische SFTP-Details
- **E-Mail-System aktiviert**: Echte BREVO-E-Mail-Integration statt Mock-System
- **Intelligentes Fehlerlernsystem**: Live-Dashboard mit Echtzeit-Statistiken
- **Admin-Rollenverwaltung**: Dialog-Interface für Rollenänderungen mit Sicherheitsfeatures

### 🔧 Verbesserungen
- **Frontend-Sicherheit**: Alle Routes durch ProtectedRoute geschützt
- **User-Isolation**: Vollständige Datenbankoperationen mit user_id-Filter
- **E-Mail-Templates**: Moderne, übersichtliche Darstellung
- **Error-Handling**: Benutzerfreundliche Fehlermeldungen

### 🐛 Bugfixes
- **Admin-Seite**: Syntax-Fehler in E-Mail-Test-Button behoben
- **E-Mail-Versand**: Mock-System durch echte BREVO-Route ersetzt
- **Authentifizierung**: Passwort-Format-Konflikt zwischen bcrypt und scrypt gelöst
- **Routing**: Alle ungeschützten Frontend-Routes abgesichert

### 🔒 Sicherheit
- **Rate Limiting**: Verschiedene Limits für Auth/Admin/Standard-APIs
- **CORS**: Produktions-Domain-Konfiguration
- **Input-Validierung**: Erweiterte Sicherheitsmaßnahmen
- **Session-Security**: Verbesserte Session-Verwaltung

### 📊 Monitoring
- **Error Learning**: Automatische Mustererkennung
- **Live-Dashboard**: 30-Sekunden Auto-Refresh
- **Audit-Logging**: Vollständige Aktivitätsverfolgung
- **Performance**: Optimierte Datenbankabfragen

## [3.2.0] - 2025-07-10

### 🎉 Neue Features
- **GitHub-Paket v3.2.0**: Vollständiges Repository-Backup
- **Bereinigtes Package**: Optimierte Größe (6.9MB statt 34MB)
- **Deployment-Anleitung**: Umfassende Setup-Dokumentation
- **SFTP-Integration**: Vollständige Implementierung

### 🔧 Verbesserungen
- **Logout-Funktion**: GET-Route für bessere Kompatibilität
- **Passwort-Reset**: Erweiterte Admin-Funktionalität
- **E-Mail-System**: BREVO-Integration optimiert
- **Benutzerfreundlichkeit**: Verbesserte Fehlermeldungen

### 🐛 Bugfixes
- **Authentifizierung**: Kritischer Passwort-Format-Fehler behoben
- **Registrierung**: "Failed to execute fetch" Problem gelöst
- **Admin-Panel**: Passwort-Reset-Funktion repariert
- **E-Mail-Versand**: BREVO-Integration getestet und funktional

## [3.1.0] - 2025-07-09

### 🎉 Neue Features
- **Testzeitraum-System**: Von 14 auf 30 Tage erweitert
- **E-Mail-Benachrichtigungen**: Automatische Lizenz-Angebote über BREVO
- **Sicherheitsarchitektur**: Umfassende CORS und Rate Limiting
- **Intelligentes Fehlerlernsystem**: Vollständige Implementierung

### 🔧 Verbesserungen
- **User-Isolation**: Erweiterte Datenbankabfragen
- **DSGVO-Compliance**: Einverständnis-System implementiert
- **Profil-Funktionalität**: Erweiterte Benutzereinstellungen
- **SFTP-Integration**: Automatische Account-Erstellung

### 🐛 Bugfixes
- **Mobile Login**: Auth-Loop mit 401-Anfragen behoben
- **PDF-Generator**: Vereinheitlichung der Funktionen
- **Hilfe-System**: Runtime-Fehler in security.js behoben
- **Datenbank-Schema**: Fehlende user_id Spalten hinzugefügt

## [3.0.0] - 2025-07-08

### 🎉 Neue Features
- **Eigenständige Authentifizierung**: Lokales Username/Passwort-System
- **Passport.js Integration**: Verschlüsselte Passwörter
- **Mobile Optimierung**: Responsive Hochwasserschutz-Module
- **E-Mail-System**: BREVO SMTP-Integration

### 🔧 Verbesserungen
- **Unabhängigkeit**: Vollständige Entfernung der Replit-Abhängigkeit
- **Sicherheit**: Erweiterte Authentifizierungsarchitektur
- **Benutzerfreundlichkeit**: Professionelle Anmelde-/Registrierungsseite
- **Dokumentation**: Umfassende Setup-Anleitungen

### 🐛 Bugfixes
- **Dialog-Struktur**: Hochwasserschutz-Buttons Problem behoben
- **Session-Management**: Cookie-Übertragung optimiert
- **API-Routen**: Konsistente Fehlerbehandlung
- **Mobile UI**: Touch-Optimierung für alle Formulare

---

**Für detaillierte Informationen zu allen Versionen, siehe die vollständige Dokumentation im `/docs` Verzeichnis.**