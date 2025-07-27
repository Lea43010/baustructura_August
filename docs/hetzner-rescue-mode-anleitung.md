# Hetzner Server - Root-Passwort via Rescue Mode setzen

## Problem: "login incorrect" bei frischem Server
Server: replit-sftp (128.140.82.20)
Ursache: Kein root-Passwort aktiviert

## Lösung: Rescue Mode verwenden

### 1. Rescue Mode aktivieren
1. **Hetzner Cloud Dashboard** → **Server** → **replit-sftp**
2. **"Rescue"** Tab klicken
3. **"Enable rescue & power cycle"** 
4. **Root-Passwort notieren** (wird angezeigt)
5. Server wird automatisch neu gestartet

### 2. In Rescue Console anmelden
1. **Console** öffnen (nach Neustart)
2. Login: `root`
3. Passwort: Das angezeigte Rescue-Passwort

### 3. Festplatte mounten und Passwort setzen
```bash
# Festplatte finden
fdisk -l

# Normalerweise /dev/sda1 mounten
mount /dev/sda1 /mnt

# In das System wechseln
chroot /mnt

# Root-Passwort setzen
passwd root
# Neues Passwort eingeben: z.B. "Hetzner2025!"

# SSH-Server installieren
apt update
apt install openssh-server -y
systemctl enable ssh

# Aus chroot raus
exit
umount /mnt
```

### 4. Rescue Mode deaktivieren
1. **Hetzner Dashboard** → **Rescue** Tab
2. **"Disable rescue & power cycle"**
3. Server startet normal mit neuem root-Passwort

### 5. Normal anmelden
- Login: `root`  
- Passwort: Das selbst gesetzte Passwort
- SSH funktioniert jetzt

## Schnelle Alternative: Cloud-Init Script
Falls verfügbar, Server mit folgendem Cloud-Init neu erstellen:
```yaml
#cloud-config
password: Hetzner2025!
chpasswd: { expire: False }
ssh_pwauth: True
```

---
**Rescue Mode ist der sicherste Weg für root-Passwort-Reset**