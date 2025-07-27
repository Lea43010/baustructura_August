import express from 'express';
import { emailService } from './emailService';

interface ForwardingRule {
  from: string;
  to: string;
  active: boolean;
}

// E-Mail-Weiterleitungsregeln
const forwardingRules: ForwardingRule[] = [
  {
    from: 'support@bau-structura.de',
    to: 'lea.zimmer@gmx.net', // Admin-E-Mail für Weiterleitung
    active: true
  }
];

class EmailForwardingService {
  
  // BREVO Inbound Webhook Handler für eingehende E-Mails
  async handleInboundEmail(req: express.Request, res: express.Response) {
    try {
      const inboundData = req.body;
      
      console.log('📧 Eingehende E-Mail erhalten:', {
        to: inboundData.to,
        from: inboundData.from,
        subject: inboundData.subject,
        timestamp: new Date().toISOString()
      });

      // Finde passende Weiterleitungsregel
      const rule = forwardingRules.find(r => 
        r.active && 
        inboundData.to?.toLowerCase().includes(r.from.toLowerCase())
      );

      if (rule) {
        // E-Mail weiterleiten
        await this.forwardEmail(inboundData, rule.to);
        
        res.status(200).json({ 
          success: true, 
          message: 'E-Mail erfolgreich weitergeleitet',
          forwardedTo: rule.to
        });
      } else {
        console.log('⚠️ Keine Weiterleitungsregel gefunden für:', inboundData.to);
        res.status(200).json({ 
          success: false, 
          message: 'Keine Weiterleitungsregel gefunden' 
        });
      }

    } catch (error) {
      console.error('❌ Fehler bei E-Mail-Weiterleitung:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Weiterleitung fehlgeschlagen' 
      });
    }
  }

  // E-Mail weiterleiten mit BREVO
  private async forwardEmail(inboundData: any, forwardTo: string) {
    const forwardSubject = `[Weitergeleitet] ${inboundData.subject || 'Kein Betreff'}`;
    
    const forwardContent = `
      <div style="border-left: 4px solid #22c55e; padding-left: 16px; margin: 16px 0;">
        <h3>📧 Weitergeleitete E-Mail von support@bau-structura.de</h3>
        <p><strong>Von:</strong> ${inboundData.from?.name || inboundData.from?.email || 'Unbekannt'}</p>
        <p><strong>An:</strong> ${inboundData.to || 'support@bau-structura.de'}</p>
        <p><strong>Betreff:</strong> ${inboundData.subject || 'Kein Betreff'}</p>
        <p><strong>Gesendet:</strong> ${inboundData.date || new Date().toLocaleString('de-DE')}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h4>📄 Nachrichteninhalt:</h4>
        <div style="white-space: pre-wrap; font-family: Arial, sans-serif;">
          ${inboundData.html || inboundData.text || 'Kein Inhalt verfügbar'}
        </div>
      </div>
      
      <div style="background: #e8f5e8; padding: 12px; border-radius: 6px; font-size: 12px; color: #2d5a2d;">
        💡 Diese E-Mail wurde automatisch von Bau-Structura weitergeleitet.
        Antworten Sie direkt an den ursprünglichen Absender.
      </div>
    `;

    await emailService.sendEmail({
      to: forwardTo,
      subject: forwardSubject,
      html: forwardContent,
      text: this.convertToText(inboundData)
    });

    console.log('✅ E-Mail erfolgreich weitergeleitet an:', forwardTo);
  }

  // HTML zu Text für Fallback
  private convertToText(inboundData: any): string {
    return `
WEITERGELEITETE E-MAIL von support@bau-structura.de
=================================================

Von: ${inboundData.from?.name || inboundData.from?.email || 'Unbekannt'}
An: ${inboundData.to || 'support@bau-structura.de'}
Betreff: ${inboundData.subject || 'Kein Betreff'}
Gesendet: ${inboundData.date || new Date().toLocaleString('de-DE')}

Nachrichteninhalt:
${inboundData.text || inboundData.html || 'Kein Inhalt verfügbar'}

---
Diese E-Mail wurde automatisch von Bau-Structura weitergeleitet.
    `;
  }

  // Weiterleitungsregeln verwalten
  getForwardingRules(): ForwardingRule[] {
    return forwardingRules;
  }

  updateForwardingRule(from: string, to: string, active: boolean = true): boolean {
    const ruleIndex = forwardingRules.findIndex(r => r.from === from);
    
    if (ruleIndex >= 0) {
      forwardingRules[ruleIndex].to = to;
      forwardingRules[ruleIndex].active = active;
      return true;
    } else {
      forwardingRules.push({ from, to, active });
      return true;
    }
  }

  // Setup-Anweisungen für BREVO Inbound API
  getSetupInstructions(): string {
    return `
📧 BREVO E-Mail-Weiterleitung Setup-Anleitung

1. BREVO-Dashboard öffnen (brevo.com)
2. Zu "Inbound Parsing" oder "Email API" navigieren
3. Neue Inbound Route erstellen:
   - E-Mail: support@bau-structura.de
   - Webhook URL: https://bau-structura.com/api/inbound-email
   - HTTP Method: POST
   - Content Type: application/json

4. Domain-Verifizierung:
   - MX-Record für bau-structura.de zu BREVO umleiten
   - SPF/DKIM-Records konfigurieren

5. Test-E-Mail an support@bau-structura.de senden
   - Automatische Weiterleitung an lea.zimmer@gmx.net
   - Log-Einträge in der Konsole prüfen

Aktueller Status: Bereit für BREVO Inbound API Setup
    `;
  }
}

export const emailForwardingService = new EmailForwardingService();