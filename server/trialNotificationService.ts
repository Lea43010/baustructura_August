import { storage } from "./storage";
import { emailService } from "./emailService";

interface TrialUser {
  externalId: string;
  email: string;
  firstName?: string | null;
  trialEndDate: Date;
  licenseStatus: string;
}

interface NotificationData {
  userId: string;
  type: '7_days_warning' | 'expired';
  trialEndDate: Date;
  emailMessageId?: string;
  status: 'sent' | 'failed' | 'pending';
}

class TrialNotificationService {
  private async getUsersNeedingNotifications(): Promise<TrialUser[]> {
    try {
      const now = new Date();
      const users = await storage.getAllUsers();
      
      return users.filter(user => {
        if (!user.trialEndDate || user.licenseStatus !== 'active') return false;
        
        const trialEnd = new Date(user.trialEndDate);
        const daysUntilEnd = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Benutzer die genau in 7 Tagen ablaufen oder am Ablauftag sind
        return daysUntilEnd === 7 || daysUntilEnd === 0;
      }).map(user => ({
        externalId: user.externalId!,
        email: user.email!,
        firstName: user.firstName,
        trialEndDate: new Date(user.trialEndDate!),
        licenseStatus: user.licenseStatus || 'active'
      }));
    } catch (error) {
      console.error('❌ Fehler beim Abrufen der Trial-Benutzer:', error);
      console.error('❌ Error Learning Service not available for trial notifications');
      return [];
    }
  }

  private async hasNotificationBeenSent(userId: string, type: string): Promise<boolean> {
    try {
      const notifications = await storage.getTrialNotifications(userId);
      return notifications.some(n => n.notificationType === type && n.status === 'sent');
    } catch (error) {
      console.error('❌ Fehler beim Prüfen bestehender Benachrichtigungen:', error);
      return false;
    }
  }

  private getNotificationType(daysUntilEnd: number): '7_days_warning' | 'expired' | null {
    // Nur noch wöchentliche Erinnerung + Ablauf-Benachrichtigung
    if (daysUntilEnd === 7) return '7_days_warning';
    if (daysUntilEnd === 0) return 'expired';
    return null;
  }

  private async sendTrialWarningEmail(user: TrialUser, type: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      const daysUntilEnd = Math.ceil((user.trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      let subject: string;
      let message: string;
      
      switch (type) {
        case '7_days_warning':
          subject = '🔔 Ihre Bau-Structura Testversion läuft in 7 Tagen ab';
          message = `Hallo ${user.firstName || 'Lieber Nutzer'},\n\nIhre 14-tägige Testversion von Bau-Structura läuft am ${user.trialEndDate.toLocaleDateString('de-DE')} ab.\n\nSichern Sie sich jetzt Ihren dauerhaften Zugang:\n- Professional (39€/Monat): Erweiterte Funktionen\n- Enterprise (99€/Monat): Vollumfängliche Lösung\n\nJetzt upgraden: https://bau-structura.com/pricing\n\nIhr Bau-Structura Team`;
          break;

        case 'expired':
          subject = '❌ Ihre Bau-Structura Testversion ist abgelaufen';
          message = `Hallo ${user.firstName || 'Lieber Nutzer'},\n\nIhre Testversion ist am ${user.trialEndDate.toLocaleDateString('de-DE')} abgelaufen.\n\nUm wieder Zugang zu erhalten:\n\n🔗 Jetzt upgraden: https://bau-structura.com/pricing\n\nIhre Daten sind sicher gespeichert und werden nach dem Upgrade sofort wieder verfügbar.\n\nIhr Bau-Structura Team`;
          break;
        default:
          return { success: false };
      }

      const emailResponse = await emailService.sendEmail({
        to: user.email,
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2563eb;">${subject}</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <h3 style="color: #dc2626;">⏰ Zeitbegrenztes Angebot</h3>
            <p><strong>Professional:</strong> 39€/Monat - Alle Grundfunktionen</p>
            <p><strong>Enterprise:</strong> 99€/Monat - Vollumfängliche Lösung</p>
            <a href="https://bau-structura.com/pricing" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Jetzt upgraden</a>
          </div>
        </div>`
      });

      console.log(`✅ Trial-Warnung (${type}) erfolgreich gesendet an ${user.email}`);
      return { 
        success: true, 
        messageId: emailResponse?.messageId || emailResponse?.response 
      };
    } catch (error) {
      console.error(`❌ Fehler beim Senden der Trial-Warnung (${type}) an ${user.email}:`, error);
      console.error(`❌ Trial notification email failed: ${type}`);
      return { success: false };
    }
  }

  private async recordNotification(data: NotificationData): Promise<void> {
    try {
      await storage.createTrialNotification({
        userId: data.userId,
        notificationType: data.type,
        status: data.status,
        trialEndDate: data.trialEndDate,
        emailMessageId: data.emailMessageId
      });
      console.log(`📝 Trial-Benachrichtigung ${data.type} für ${data.userId} gespeichert`);
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Trial-Benachrichtigung:', error);
      console.error('❌ Trial notification recording failed');
    }
  }

  public async checkAndSendNotifications(): Promise<{ sent: number; failed: number; skipped: number }> {
    console.log('🔍 Prüfe Trial-Benachrichtigungen...');
    
    const stats = { sent: 0, failed: 0, skipped: 0 };
    const users = await this.getUsersNeedingNotifications();
    
    if (users.length === 0) {
      console.log('✅ Keine Trial-Benachrichtigungen erforderlich');
      return stats;
    }

    console.log(`📧 ${users.length} Benutzer für Trial-Benachrichtigungen gefunden`);

    for (const user of users) {
      try {
        const now = new Date();
        const daysUntilEnd = Math.ceil((user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const notificationType = this.getNotificationType(daysUntilEnd);
        
        if (!notificationType) {
          stats.skipped++;
          continue;
        }

        // Prüfe ob Benachrichtigung bereits gesendet wurde
        const alreadySent = await this.hasNotificationBeenSent(user.externalId, notificationType);
        if (alreadySent) {
          console.log(`⏭️  ${notificationType} bereits gesendet an ${user.email}`);
          stats.skipped++;
          continue;
        }

        // Sende E-Mail
        const emailResult = await this.sendTrialWarningEmail(user, notificationType);
        
        // Speichere Benachrichtigung in Datenbank
        await this.recordNotification({
          userId: user.externalId,
          type: notificationType,
          trialEndDate: user.trialEndDate,
          emailMessageId: emailResult.messageId,
          status: emailResult.success ? 'sent' : 'failed'
        });

        if (emailResult.success) {
          stats.sent++;
        } else {
          stats.failed++;
        }

        // Kurze Pause zwischen E-Mails
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Fehler bei Trial-Benachrichtigung für ${user.email}:`, error);
        stats.failed++;
      }
    }

    console.log(`📊 Trial-Benachrichtigungen: ${stats.sent} gesendet, ${stats.failed} fehlgeschlagen, ${stats.skipped} übersprungen`);
    return stats;
  }

  public async getNotificationHistory(userId?: string): Promise<any[]> {
    try {
      if (userId) {
        return await storage.getTrialNotifications(userId);
      } else {
        // Alle Benachrichtigungen für Admin-Dashboard
        return await storage.getAllTrialNotifications();
      }
    } catch (error) {
      console.error('❌ Fehler beim Abrufen der Benachrichtigungshistorie:', error);
      return [];
    }
  }
}

export const trialNotificationService = new TrialNotificationService();

// Auto-Check alle 24 Stunden (um 10:00 Uhr täglich)
setInterval(async () => {
  try {
    await trialNotificationService.checkAndSendNotifications();
  } catch (error) {
    console.error('❌ Automatischer Trial-Check fehlgeschlagen:', error);
  }
}, 24 * 60 * 60 * 1000); // 24 Stunden

console.log('🔔 Trial-Benachrichtigungsservice gestartet (Auto-Check alle 24 Stunden)');