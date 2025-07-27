# Bau-Structura Installation & Setup

## 🚀 Schritt-für-Schritt Installation

### 1. Systemvoraussetzungen
```bash
# Node.js 18+ installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL installieren
sudo apt-get install -y postgresql postgresql-contrib

# Git installieren
sudo apt-get install -y git
```

### 2. Datenbank einrichten
```bash
# PostgreSQL starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Datenbank erstellen
sudo -u postgres createdb baustructura
sudo -u postgres createuser --interactive
```

### 3. Projekt klonen und installieren
```bash
# Repository klonen
git clone https://github.com/YOUR-USERNAME/bau-structura.git
cd bau-structura

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
nano .env
```

### 4. .env Konfiguration
```env
# Datenbank
DATABASE_URL=postgresql://username:password@localhost:5432/baustructura

# Session
SESSION_SECRET=your-very-long-random-secret-key

# E-Mail (BREVO)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-user@smtp-brevo.com
SMTP_PASS=your-brevo-smtp-key

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key
```

### 5. Datenbank-Schema erstellen
```bash
# Schema in Datenbank pushen
npm run db:push

# Entwicklungsserver starten
npm run dev
```

### 6. Produktionsdeployment
```bash
# Frontend build
npm run build

# PM2 für Prozess-Management
npm install -g pm2

# Server starten
pm2 start server/index.js --name "bau-structura"
pm2 save
pm2 startup
```

## 🔧 Nginx Konfiguration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Gesundheitscheck
```bash
# Service Status prüfen
curl http://localhost:5000/api/health

# Logs anzeigen
pm2 logs bau-structura

# Datenbank-Verbindung testen
npm run db:studio
```

## 🚨 Troubleshooting

### Häufige Probleme
1. **Port bereits belegt:** `sudo lsof -i :5000`
2. **Datenbankfehler:** PostgreSQL Service prüfen
3. **E-Mail-Versand:** BREVO-Credentials validieren
4. **Berechtigungen:** Rolle in Datenbank prüfen

### Debug-Modus
```bash
# Entwicklung mit Debug-Logs
DEBUG=* npm run dev

# Produktionsüberwachung
pm2 monit
```

## 🔒 Sicherheits-Checklist

### Produktionsserver
- [ ] Firewall konfiguriert (nur Port 80, 443, 22)
- [ ] SSL/TLS Zertifikat installiert
- [ ] Automatische Updates aktiviert
- [ ] Regelmäßige Backups eingerichtet
- [ ] Monitoring/Logging aktiviert

### Anwendung
- [ ] Starke SESSION_SECRET generiert
- [ ] Datenbank-Passwörter geändert
- [ ] Rate Limiting aktiviert
- [ ] CORS für Produktions-Domain konfiguriert
- [ ] Admin-Account erstellt

## 📞 Support

Bei Problemen:
1. Logs prüfen (`pm2 logs`)
2. Error Learning Dashboard checken
3. GitHub Issues für Bug-Reports
4. E-Mail: support@bau-structura.de