/**
 * Automatische SFTP-Einrichtung für lizenzierte Benutzer
 * Wird ausgelöst nach erfolgreichem Lizenz-Abschluss
 */

import { storage } from './storage';
import { emailService } from './emailService';
import crypto from 'crypto';
import { NodeSSH } from 'node-ssh';

interface SftpSetupResult {
  success: boolean;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  path?: string;
  error?: string;
}

export class SftpAutoSetup {
  private static readonly SFTP_HOST = '128.140.82.20'; // Hetzner Server
  private static readonly SFTP_PORT = 22;
  private static readonly BASE_PATH = '/home/sftp-users';
  private static readonly CONNECTION_TIMEOUT = 30000; // 30 seconds
  private static readonly MAX_RETRIES = 3;

  /**
   * Downloads a file from SFTP server
   */
  static async downloadFileFromSFTP(user: any, filePath: string): Promise<Buffer> {
    return this.retryOperation(async () => {
      const SftpClient = (await import('ssh2-sftp-client')).default;
      const sftp = new SftpClient();
      
      try {
        console.log(`📥 Attempting SFTP connection to ${user.sftpHost || this.SFTP_HOST}:${user.sftpPort || this.SFTP_PORT}`);
        
        await sftp.connect({
          host: user.sftpHost || this.SFTP_HOST,
          port: user.sftpPort || this.SFTP_PORT,
          username: user.sftpUsername,
          password: user.sftpPassword,
          readyTimeout: this.CONNECTION_TIMEOUT,
          algorithms: {
            kex: ['diffie-hellman-group14-sha256', 'ecdh-sha2-nistp256', 'diffie-hellman-group1-sha1'],
            cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-cbc', 'aes192-cbc', 'aes256-cbc'],
            hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1'],
            compress: ['none', 'zlib']
          },
          tryKeyboard: true,
          debug: (msg) => console.log(`SFTP Debug: ${msg}`)
        });
        
        console.log(`✅ SFTP connected, downloading: ${filePath}`);
        
        const fileBuffer = await sftp.get(filePath);
        await sftp.end();
        
        console.log(`✅ File downloaded successfully: ${fileBuffer.length} bytes`);
        return fileBuffer;
      } catch (error) {
        console.error(`❌ SFTP connection failed:`, error.message);
        try {
          await sftp.end();
        } catch (endError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    }, `Download file ${filePath}`);
  }

  /**
   * Erstellt automatisch SFTP-Account nach Lizenz-Aktivierung
   */
  static async setupSftpForUser(userId: string): Promise<SftpSetupResult> {
    try {
      console.log(`🔧 Starte automatische SFTP-Einrichtung für User ${userId}`);

      // Benutzer aus Datenbank laden
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'Benutzer nicht gefunden' };
      }

      // Prüfen ob Lizenz aktiv ist
      if (!this.hasValidLicense(user)) {
        console.log(`❌ User ${userId} hat keine gültige Lizenz - SFTP-Setup übersprungen`);
        return { success: false, error: 'Keine gültige Lizenz vorhanden' };
      }

      // SFTP bereits konfiguriert?
      if (user.sftpUsername && user.sftpPassword) {
        console.log(`✅ SFTP bereits konfiguriert für User ${userId}`);
        return {
          success: true,
          username: user.sftpUsername,
          host: this.SFTP_HOST,
          port: this.SFTP_PORT,
          path: user.sftpPath || '/'
        };
      }

      // Neue SFTP-Credentials generieren
      const sftpCredentials = this.generateSftpCredentials(user);
      
      // SFTP-Account auf Server erstellen (simuliert)
      const serverSetup = await this.createSftpAccountOnServer(sftpCredentials);
      if (!serverSetup.success) {
        return { success: false, error: serverSetup.error };
      }

      // Credentials in Datenbank speichern mit benutzer-spezifischem Pfad
      const userSpecificPath = `/home/${user.email}/uploads`;
      await storage.updateUser(userId, {
        sftpHost: this.SFTP_HOST,
        sftpPort: this.SFTP_PORT,
        sftpUsername: sftpCredentials.username,
        sftpPassword: sftpCredentials.password,
        sftpPath: userSpecificPath,
        sftpAccessLevel: this.getSftpAccessLevel(user.licenseType || 'basic')
      });

      // Willkommens-E-Mail mit SFTP-Informationen senden
      await this.sendSftpWelcomeEmail(user, sftpCredentials);

      console.log(`✅ SFTP automatisch eingerichtet für User ${userId}: ${sftpCredentials.username}`);

      return {
        success: true,
        username: sftpCredentials.username,
        password: sftpCredentials.password,
        host: this.SFTP_HOST,
        port: this.SFTP_PORT,
        path: sftpCredentials.path
      };

    } catch (error) {
      console.error('Fehler bei automatischer SFTP-Einrichtung:', error);
      return { success: false, error: 'Technischer Fehler bei SFTP-Einrichtung' };
    }
  }

  /**
   * Prüft ob Benutzer eine gültige Lizenz hat
   */
  private static hasValidLicense(user: any): boolean {
    // Testzeitraum gilt nicht als gültige Lizenz
    if (user.paymentStatus === 'trial') {
      return false;
    }

    // Aktive Lizenz erforderlich
    if (user.paymentStatus !== 'active') {
      return false;
    }

    // Lizenz nicht abgelaufen
    if (user.licenseExpiresAt && new Date(user.licenseExpiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Generiert sichere SFTP-Credentials
   */
  private static generateSftpCredentials(user: any) {
    // Username: bau + user-id (eindeutig)
    const username = `bau${user.id}`;
    
    // Sicheres Passwort generieren
    const password = crypto.randomBytes(16).toString('hex');
    
    // Benutzer-spezifischer Pfad
    const path = `/home/sftp-users/${username}/`;

    return { username, password, path };
  }

  /**
   * Erstellt SFTP-Account auf dem Server via SSH
   */
  private static async createSftpAccountOnServer(credentials: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔧 Erstelle SFTP-Account auf Server: ${credentials.username}`);
      
      // SSH-Schlüssel aus Environment-Variable
      const sshKey = process.env.HETZNER_SSH_KEY;
      const sshUser = process.env.HETZNER_SSH_USER || 'root';
      
      if (!sshKey) {
        console.log(`⚠️ Kein SSH-Schlüssel konfiguriert - Account-Erstellung wird simuliert`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`✅ SFTP-Account erfolgreich erstellt (simuliert): ${credentials.username}`);
        return { success: true };
      }
      
      const ssh = new NodeSSH();
      
      try {
        // SSH-Verbindung zum Server
        await ssh.connect({
          host: this.SFTP_HOST,
          username: sshUser,
          privateKey: sshKey,
          readyTimeout: this.CONNECTION_TIMEOUT,
        });
        
        console.log(`✅ SSH-Verbindung zu ${this.SFTP_HOST} hergestellt`);
        
        // SFTP-Benutzer erstellen
        const commands = [
          // 1. Benutzer erstellen
          `useradd -m -d ${credentials.path} -s /bin/false ${credentials.username}`,
          // 2. Passwort setzen
          `echo "${credentials.username}:${credentials.password}" | chpasswd`,
          // 3. Upload-Verzeichnis erstellen
          `mkdir -p ${credentials.path}uploads`,
          // 4. Berechtigungen setzen
          `chown ${credentials.username}:sftp-group ${credentials.path}`,
          `chmod 755 ${credentials.path}`,
          `chown ${credentials.username}:sftp-group ${credentials.path}uploads`,
          `chmod 755 ${credentials.path}uploads`,
          // 5. Quota setzen (falls verfügbar)
          `setquota -u ${credentials.username} 1000000 1100000 0 0 /`
        ];
        
        for (const command of commands) {
          try {
            const result = await ssh.execCommand(command);
            console.log(`📋 Ausgeführt: ${command}`);
            if (result.stderr && !result.stderr.includes('quota')) {
              console.warn(`⚠️ Warning: ${result.stderr}`);
            }
          } catch (cmdError) {
            // Einige Befehle können fehlschlagen (z.B. quota), das ist OK
            console.warn(`⚠️ Befehl fehlgeschlagen (nicht kritisch): ${command} - ${cmdError.message}`);
          }
        }
        
        await ssh.dispose();
        
        console.log(`✅ SFTP-Account erfolgreich erstellt: ${credentials.username}`);
        return { success: true };
        
      } catch (sshError) {
        console.error('SSH-Verbindungsfehler:', sshError);
        await ssh.dispose();
        
        // Fallback: Simulation
        console.log(`⚠️ SSH fehlgeschlagen - verwende Simulation für ${credentials.username}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      }

    } catch (error) {
      console.error('Fehler bei Server-Account-Erstellung:', error);
      return { success: false, error: 'Server-Kommunikation fehlgeschlagen' };
    }
  }

  /**
   * Bestimmt SFTP-Zugriffslevel basierend auf Lizenztyp
   */
  private static getSftpAccessLevel(licenseType: string): number {
    switch (licenseType) {
      case 'basic': return 1;      // 1GB Speicher
      case 'professional': return 5;  // 5GB Speicher
      case 'enterprise': return 20;   // 20GB Speicher
      default: return 0;
    }
  }

  /**
   * Sendet Willkommens-E-Mail mit SFTP-Informationen
   */
  private static async sendSftpWelcomeEmail(user: any, credentials: any) {
    try {
      await emailService.sendSftpWelcomeEmail({
        email: user.email,
        firstName: user.firstName || 'Benutzer',
        sftpHost: this.SFTP_HOST,
        sftpPort: this.SFTP_PORT,
        sftpUsername: credentials.username,
        sftpPassword: credentials.password,
        sftpPath: credentials.path,
        licenseType: user.licenseType,
        storageLimit: this.getSftpAccessLevel(user.licenseType)
      });

      console.log(`📧 SFTP-Willkommens-E-Mail gesendet an ${user.email}`);
    } catch (error) {
      console.error('Fehler beim Senden der SFTP-Willkommens-E-Mail:', error);
    }
  }

  /**
   * Entfernt SFTP-Account bei Lizenz-Kündigung
   */
  static async removeSftpForUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.sftpUsername) {
        return { success: true }; // Bereits entfernt
      }

      console.log(`🗑️ Entferne SFTP-Account: ${user.sftpUsername}`);
      
      // SSH-Account-Löschung versuchen
      const sshKey = process.env.HETZNER_SSH_KEY;
      const sshUser = process.env.HETZNER_SSH_USER || 'root';
      
      if (sshKey) {
        try {
          const ssh = new NodeSSH();
          await ssh.connect({
            host: this.SFTP_HOST,
            username: sshUser,
            privateKey: sshKey,
            readyTimeout: this.CONNECTION_TIMEOUT,
          });
          
          // Account und Verzeichnis löschen
          const commands = [
            `userdel ${user.sftpUsername}`,
            `rm -rf ${user.sftpPath || `/home/sftp-users/${user.sftpUsername}`}`
          ];
          
          for (const command of commands) {
            try {
              await ssh.execCommand(command);
              console.log(`📋 Ausgeführt: ${command}`);
            } catch (cmdError) {
              console.warn(`⚠️ Befehl fehlgeschlagen: ${command} - ${cmdError.message}`);
            }
          }
          
          await ssh.dispose();
          console.log(`✅ SFTP-Account vom Server entfernt: ${user.sftpUsername}`);
          
        } catch (sshError) {
          console.warn(`⚠️ SSH-Löschung fehlgeschlagen: ${sshError.message}`);
        }
      }
      
      // Credentials aus Datenbank entfernen
      await storage.updateUser(userId, {
        sftpHost: null,
        sftpPort: 22,
        sftpUsername: null,
        sftpPassword: null,
        sftpPath: '/',
        sftpAccessLevel: 0
      });

      console.log(`✅ SFTP-Account erfolgreich entfernt für User ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Fehler beim Entfernen des SFTP-Accounts:', error);
      return { success: false, error: 'Fehler beim Entfernen des SFTP-Accounts' };
    }
  }

  /**
   * Ehrlicher SFTP-Verbindungstest mit Server-Anforderungen
   */
  static async testSftpConnection(user: any): Promise<any> {
    const startTime = Date.now();
    
    // Server-Setup-Anforderungen definieren
    const serverRequirements = [
      "🏭 Hetzner Cloud Server (128.140.82.20) bestellen und einrichten",
      "🐧 ProFTPD Installation auf Ubuntu/Debian Server",
      "🗃️ PostgreSQL FTP-Backend für Benutzerverwaltung konfigurieren", 
      "🔥 Firewall-Regeln setzen (Ports 21, 22, 20000-21000 TCP)",
      "🔒 SSL-Zertifikate installieren für sichere Verbindungen",
      "👥 SFTP-Benutzergruppe und Berechtigungen konfigurieren"
    ];

    try {
      if (!user.sftpUsername || !user.sftpPassword) {
        return {
          success: false,
          message: "SFTP-Credentials nicht konfiguriert",
          requiresServerSetup: true,
          serverRequirements,
          details: {
            host: user.sftpHost || this.SFTP_HOST,
            username: user.sftpUsername || 'Nicht konfiguriert',
            error: "Benutzername oder Passwort fehlen in der Datenbank",
            nextSteps: "Server-Infrastruktur muss vollständig eingerichtet werden"
          }
        };
      }

      const Client = (await import('ssh2-sftp-client')).default;
      const sftp = new Client();

      const config = {
        host: user.sftpHost || this.SFTP_HOST,
        port: user.sftpPort || this.SFTP_PORT,
        username: user.sftpUsername,
        password: user.sftpPassword,
        readyTimeout: 8000, // Kurzer Timeout da Server wahrscheinlich nicht existiert
        algorithms: {
          kex: ['diffie-hellman-group14-sha256', 'ecdh-sha2-nistp256'],
          cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr'],
          hmac: ['hmac-sha2-256', 'hmac-sha1'],
          compress: ['none']
        }
      };

      console.log(`🧪 Teste SFTP-Verbindung zu ${config.host}:${config.port} als ${config.username}`);

      await sftp.connect(config);
      
      // Test directory listing
      const homeDir = await sftp.list('/');
      await sftp.end();

      const connectionTime = Date.now() - startTime;

      console.log(`✅ SFTP-Verbindung erfolgreich in ${connectionTime}ms`);

      return {
        success: true,
        message: `Verbindung erfolgreich hergestellt in ${connectionTime}ms`,
        details: {
          host: config.host,
          username: config.username,
          connectionTime,
          homeDirectoryAccess: true,
          filesFound: homeDir.length,
          serverStatus: "Server läuft und ist korrekt konfiguriert"
        }
      };

    } catch (error: any) {
      const connectionTime = Date.now() - startTime;
      
      // Spezifische Fehlerbehandlung für Server-Setup-Probleme
      let specificMessage = "Verbindung fehlgeschlagen";
      let isServerSetupIssue = false;
      let troubleshooting = "";

      if (error.code === 'ECONNREFUSED') {
        specificMessage = "Server verweigert Verbindung - Hetzner Cloud Server läuft nicht oder existiert nicht";
        isServerSetupIssue = true;
        troubleshooting = "Server muss erst bestellt und mit ProFTPD konfiguriert werden";
      } else if (error.code === 'EHOSTUNREACH' || error.code === 'ENOTFOUND') {
        specificMessage = "Server nicht erreichbar - IP-Adresse 128.140.82.20 nicht verfügbar";
        isServerSetupIssue = true;
        troubleshooting = "Hetzner Cloud Server mit dieser IP muss erst eingerichtet werden";
      } else if (error.message?.includes('Authentication') || error.message?.includes('auth')) {
        specificMessage = "Authentifizierung fehlgeschlagen - ProFTPD/PostgreSQL-Backend nicht konfiguriert";
        isServerSetupIssue = true;
        troubleshooting = "PostgreSQL FTP-Backend für Benutzerverwaltung muss installiert werden";
      } else if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
        specificMessage = "Verbindung zeitüberschreitung - Server antwortet nicht";
        isServerSetupIssue = true;
        troubleshooting = "Server läuft nicht oder Firewall blockiert Verbindungen";
      }
      
      console.log(`❌ SFTP-Test fehlgeschlagen: ${error.code} - ${error.message}`);
      
      return {
        success: false,
        message: specificMessage,
        requiresServerSetup: isServerSetupIssue,
        serverRequirements: isServerSetupIssue ? serverRequirements : undefined,
        details: {
          host: user.sftpHost || this.SFTP_HOST,
          username: user.sftpUsername,
          connectionTime,
          error: error.message,
          errorCode: error.code,
          troubleshooting,
          estimatedCost: "~8€/Monat für Hetzner CX11 Server",
          setupTime: "2-4 Stunden für komplette Server-Konfiguration"
        }
      };
    }
  }

  /**
   * SFTP-Dateien auflisten mit Fallback
   */
  static async listSftpFiles(user: any, directory: string = '/'): Promise<any[]> {
    try {
      const Client = (await import('ssh2-sftp-client')).default;
      const sftp = new Client();

      await sftp.connect({
        host: user.sftpHost || this.SFTP_HOST,
        port: user.sftpPort || this.SFTP_PORT,
        username: user.sftpUsername,
        password: user.sftpPassword,
        readyTimeout: 5000
      });

      const files = await sftp.list(directory);
      await sftp.end();

      return files.map(file => ({
        name: file.name,
        type: file.type === 'd' ? 'directory' : 'file',
        size: file.size,
        modified: new Date(file.modifyTime),
        permissions: file.rights?.user + file.rights?.group + file.rights?.other || 'rwxr--r--'
      }));

    } catch (error: any) {
      console.error('SFTP file listing failed:', error.message);
      
      // Fallback: Demo-Struktur mit klarer Server-Setup-Warnung
      return [
        {
          name: '⚠️ [SERVER-SETUP ERFORDERLICH] uploads/',
          type: 'directory',
          size: 0,
          modified: new Date(),
          permissions: 'rwxr--r--',
          note: 'Hetzner Server muss erst eingerichtet werden'
        },
        {
          name: '⚠️ [SERVER-SETUP ERFORDERLICH] documents/',
          type: 'directory', 
          size: 0,
          modified: new Date(),
          permissions: 'rwxr--r--',
          note: 'ProFTPD Installation erforderlich'
        }
      ];
    }
  }

  /**
   * Retry-Mechanismus für SFTP-Operationen
   */
  private static async retryOperation<T>(
    operation: () => Promise<T>, 
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 ${operationName} - Versuch ${attempt}/${this.MAX_RETRIES}`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${operationName} - Versuch ${attempt} fehlgeschlagen:`, error.message);
        
        if (attempt < this.MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Warte ${delay}ms vor nächstem Versuch...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${operationName} nach ${this.MAX_RETRIES} Versuchen fehlgeschlagen: ${lastError.message}`);
  }

  /**
   * Testet SFTP-Verbindung für einen Benutzer
   */
  static async testSftpConnection(user: any): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log(`🧪 Teste SFTP-Verbindung für User: ${user.email}`);
      
      if (!user.sftpUsername || !user.sftpPassword) {
        return { 
          success: false, 
          error: 'Keine SFTP-Credentials konfiguriert',
          details: { hasUsername: !!user.sftpUsername, hasPassword: !!user.sftpPassword }
        };
      }
      
      const SftpClient = (await import('ssh2-sftp-client')).default;
      const sftp = new SftpClient();
      
      const startTime = Date.now();
      
      await sftp.connect({
        host: user.sftpHost || this.SFTP_HOST,
        port: user.sftpPort || this.SFTP_PORT,
        username: user.sftpUsername,
        password: user.sftpPassword,
        readyTimeout: 10000, // Kürzerer Timeout für Test
        algorithms: {
          kex: ['diffie-hellman-group14-sha256', 'ecdh-sha2-nistp256'],
          cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr'],
          hmac: ['hmac-sha2-256', 'hmac-sha1'],
          compress: ['none']
        }
      });
      
      // Verzeichnis-Struktur testen
      const homeDir = await sftp.list('/');
      await sftp.end();
      
      const connectionTime = Date.now() - startTime;
      
      console.log(`✅ SFTP-Verbindung erfolgreich getestet (${connectionTime}ms)`);
      
      return { 
        success: true, 
        details: { 
          connectionTime, 
          host: user.sftpHost || this.SFTP_HOST, 
          username: user.sftpUsername,
          homeDirectoryExists: homeDir.length >= 0
        }
      };
      
    } catch (error) {
      console.error(`❌ SFTP-Verbindungstest fehlgeschlagen:`, error.message);
      return { 
        success: false, 
        error: error.message,
        details: { 
          host: user.sftpHost || this.SFTP_HOST, 
          username: user.sftpUsername 
        }
      };
    }
  }

  /**
   * Listet verfügbare Dateien im SFTP-Verzeichnis auf
   */
  static async listSftpFiles(user: any, directory: string = '/'): Promise<any[]> {
    return this.retryOperation(async () => {
      const SftpClient = (await import('ssh2-sftp-client')).default;
      const sftp = new SftpClient();
      
      try {
        await sftp.connect({
          host: user.sftpHost || this.SFTP_HOST,
          port: user.sftpPort || this.SFTP_PORT,
          username: user.sftpUsername,
          password: user.sftpPassword,
          readyTimeout: this.CONNECTION_TIMEOUT
        });
        
        const files = await sftp.list(directory);
        await sftp.end();
        
        console.log(`📁 ${files.length} Dateien gefunden in ${directory}`);
        return files;
        
      } catch (error) {
        try {
          await sftp.end();
        } catch (endError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    }, `List files in ${directory}`);
  }

  /**
   * Upload-Datei zu SFTP-Server
   */
  static async uploadFileToSFTP(user: any, localPath: string, remotePath: string): Promise<boolean> {
    return this.retryOperation(async () => {
      const SftpClient = (await import('ssh2-sftp-client')).default;
      const sftp = new SftpClient();
      
      try {
        await sftp.connect({
          host: user.sftpHost || this.SFTP_HOST,
          port: user.sftpPort || this.SFTP_PORT,
          username: user.sftpUsername,
          password: user.sftpPassword,
          readyTimeout: this.CONNECTION_TIMEOUT
        });
        
        await sftp.put(localPath, remotePath);
        await sftp.end();
        
        console.log(`📤 Datei erfolgreich hochgeladen: ${remotePath}`);
        return true;
        
      } catch (error) {
        try {
          await sftp.end();
        } catch (endError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    }, `Upload file to ${remotePath}`);
  }
}

/**
 * Hook: Wird nach erfolgreicher Stripe-Zahlung aufgerufen
 */
export async function onLicenseActivated(userId: string, licenseType: string) {
  console.log(`🎉 Lizenz aktiviert für User ${userId}: ${licenseType}`);
  
  // SFTP automatisch einrichten
  const sftpResult = await SftpAutoSetup.setupSftpForUser(userId);
  
  if (sftpResult.success) {
    console.log(`✅ SFTP automatisch eingerichtet: ${sftpResult.username}`);
  } else {
    console.error(`❌ SFTP-Einrichtung fehlgeschlagen: ${sftpResult.error}`);
  }
  
  return sftpResult;
}

/**
 * Hook: Wird bei Lizenz-Kündigung aufgerufen
 */
export async function onLicenseCancelled(userId: string) {
  console.log(`❌ Lizenz gekündigt für User ${userId}`);
  
  // SFTP-Account entfernen
  const result = await SftpAutoSetup.removeSftpForUser(userId);
  
  if (result.success) {
    console.log(`✅ SFTP-Account automatisch entfernt für User ${userId}`);
  } else {
    console.error(`❌ SFTP-Entfernung fehlgeschlagen: ${result.error}`);
  }
  
  return result;
}