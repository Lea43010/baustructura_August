# Hetzner Firewall-Einrichtung für SFTP

## Wichtige Firewall-Regeln für Bau-Structura SFTP

### 1. In der Hetzner Console: Firewalls

Gehen Sie zu **CLOUD > Firewalls** und klicken Sie "Firewall erstellen":

#### Eingehende Regeln (Inbound Rules):
```
SSH (Port 22)     - 0.0.0.0/0 (überall)
FTP (Port 21)     - 0.0.0.0/0 (überall) 
HTTP (Port 80)    - 0.0.0.0/0 (überall)
HTTPS (Port 443)  - 0.0.0.0/0 (überall)
FTP-Data (20-21)  - 0.0.0.0/0 (überall)
SFTP (Port 22)    - 0.0.0.0/0 (überall)
```

#### Ausgehende Regeln (Outbound Rules):
```
Alle ausgehenden Verbindungen erlauben
```

### 2. Firewall dem Server zuweisen

1. Wählen Sie Ihren Server "replit-sftp" (128.140.82.20)
2. Gehen Sie zu "Firewalls" Tab
3. Klicken Sie "Firewall hinzufügen"
4. Wählen Sie Ihre erstellte Firewall

### 3. Sofortiger Test

Nach der Firewall-Einrichtung sollten SFTP-Verbindungen funktionieren.

### 4. ProFTPD Installation (Optional)

Wenn Sie ProFTPD noch nicht installiert haben:

```bash
sudo apt update
sudo apt install proftpd-basic
sudo systemctl enable proftpd
sudo systemctl start proftpd
```

## Testen der Verbindung

Nach der Firewall-Einrichtung testen Sie die SFTP-Verbindung in Bau-Structura:
- Gehen Sie zu Dokumente
- Klicken Sie "Öffnen" bei einer Datei
- Die Verbindung sollte jetzt funktionieren

## Häufige Probleme

- **Timeout Fehler**: Firewall blockiert Port 22/21
- **Connection refused**: ProFTPD nicht installiert
- **Authentication failed**: Falsche Benutzerdaten

Bei Problemen kontaktieren Sie den Support.