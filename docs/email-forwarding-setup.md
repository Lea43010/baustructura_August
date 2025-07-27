# E-Mail-Weiterleitung Setup für Bau-Structura

## ✅ Status: Implementiert und bereit für BREVO Inbound API

### 🎯 Ziel
Automatische Weiterleitung aller E-Mails an `support@bau-structura.de` an die Admin-E-Mail `lea.zimmer@gmx.net`.

### 🔧 Implementierte Funktionen

**Backend-Services:**
- ✅ `EmailForwardingService` erstellt (`server/emailForwarding.ts`)
- ✅ BREVO Inbound Webhook Handler (`/api/inbound-email`)
- ✅ Admin-APIs für Weiterleitungsregeln-Verwaltung
- ✅ Setup-Anweisungen-API (`/api/email-forwarding/setup`)

**API-Endpunkte:**
- `POST /api/inbound-email` - BREVO Webhook für eingehende E-Mails
- `GET /api/email-forwarding/rules` - Aktuelle Weiterleitungsregeln abrufen
- `POST /api/email-forwarding/rules` - Weiterleitungsregeln bearbeiten
- `GET /api/email-forwarding/setup` - Setup-Anweisungen anzeigen

### 📋 BREVO Inbound API Setup-Schritte

**1. BREVO Dashboard konfigurieren:**
1. Bei brevo.com anmelden
2. "Inbound Parsing" oder "Email API" öffnen
3. Neue Inbound Route erstellen:
   - **E-Mail:** `support@bau-structura.de`
   - **Webhook URL:** `https://bau-structura.com/api/inbound-email`
   - **HTTP Method:** `POST`
   - **Content Type:** `application/json`

**2. Domain-Konfiguration:**
1. **MX-Record für bau-structura.de:**
   ```
   Type: MX
   Host: @
   Value: mx.sendinblue.com
   Priority: 10
   ```

2. **SPF-Record hinzufügen:**
   ```
   Type: TXT
   Host: @
   Value: "v=spf1 include:spf.sendinblue.com ~all"
   ```

3. **DKIM-Records konfigurieren** (bereitgestellt von BREVO)

**3. Test der Weiterleitung:**
1. E-Mail an `support@bau-structura.de` senden
2. Automatische Weiterleitung an `lea.zimmer@gmx.net` prüfen
3. Log-Einträge in der Server-Konsole überprüfen

### 🔄 Weiterleitung-Funktionalität

**Aktuell konfigurierte Regel:**
- **Von:** `support@bau-structura.de`
- **Nach:** `lea.zimmer@gmx.net`
- **Status:** ✅ Aktiv

**E-Mail-Format der Weiterleitung:**
- Betreff: `[Weitergeleitet] [Original-Betreff]`
- Ursprüngliche Absender-/Empfänger-Informationen eingebettet
- Original-Nachricht vollständig erhalten
- Bau-Structura-Branding hinzugefügt

### 🔧 Admin-Verwaltung

**Weiterleitungsregeln ändern:**
```javascript
// API-Aufruf für neue Regel
POST /api/email-forwarding/rules
{
  "from": "support@bau-structura.de",
  "to": "neue-email@example.com", 
  "active": true
}
```

**Setup-Anweisungen abrufen:**
```javascript
GET /api/email-forwarding/setup
// Gibt detaillierte Setup-Anweisungen zurück
```

### 📱 Integration in Admin-Panel

**Zur Admin-Seite hinzufügen:**
1. Neuer Tab "E-Mail-Weiterleitung" im Admin-Interface
2. Anzeige aktueller Weiterleitungsregeln
3. Setup-Anweisungen für BREVO Inbound API
4. Test-Funktionalität für E-Mail-Weiterleitung

### 🚧 Nächste Schritte

1. **BREVO Inbound API konfigurieren** (erfordert Domain-Zugriff)
2. **DNS-Records aktualisieren** (MX, SPF, DKIM)
3. **Admin-UI erweitern** (Optional: grafische Verwaltung)
4. **Test mit echter E-Mail** durchführen

### ⚠️ Wichtige Hinweise

- Webhook-URL muss öffentlich erreichbar sein
- BREVO verarbeitet nur E-Mails von verifizierten Domains
- DNS-Änderungen können 24-48h dauern
- Ohne BREVO Inbound API Setup funktioniert nur ausgehende E-Mail

### 🔍 Debugging

**Log-Ausgaben bei eingehenden E-Mails:**
```javascript
📧 Eingehende E-Mail erhalten: {
  to: 'support@bau-structura.de',
  from: 'kunde@example.com',
  subject: 'Hilfeanfrage',
  timestamp: '2025-07-22T...'
}
✅ E-Mail erfolgreich weitergeleitet an: lea.zimmer@gmx.net
```

**API-Test:**
```bash
curl -X POST https://bau-structura.com/api/inbound-email \
  -H "Content-Type: application/json" \
  -d '{"to":"support@bau-structura.de","from":{"email":"test@example.com","name":"Test User"},"subject":"Test","text":"Test-Nachricht"}'
```

---
*Erstellt: 22. Juli 2025*  
*Status: Bereit für BREVO Inbound API Setup*