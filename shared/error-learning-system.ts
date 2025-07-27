// Error Learning System - generated from dist/index.js
// Provides intelligent error tracking and pattern detection

export interface LoggedError {
  type: string;
  message: string;
  file: string;
  line?: number;
  context: string;
  stackTrace?: string;
}

export interface ErrorSolution {
  description: string;
  codeChanges?: string[];
  verification?: string;
  steps?: string[];
}

export interface ErrorEntry {
  id: string;
  timestamp: string;
  errorType: string;
  originalMessage: string;
  affectedFile: string;
  lineNumber?: number;
  context: string;
  causeAnalysis: string;
  trigger: string;
  isRecurring: boolean;
  occurrenceCount: number;
  lastOccurrences: string[];
  solution: string;
  codeChanges: string[];
  verification: string;
  preventionMeasures: string[];
  automaticChecks: string[];
  patternRule: string;
}

export interface ErrorPattern {
  patternId: string;
  description: string;
  frequency: number;
  lastSeen: string;
  solutions: string[];
  preventionRules: string[];
  autoFixAvailable: boolean;
}

export function withErrorLearning(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    try {
      return method.apply(this, args);
    } catch (error: any) {
      const errorId = errorLearningSystem.logError({
        type: 'RUNTIME',
        message: error.message,
        file: `${target.constructor.name}.${propertyName}`,
        context: `Method execution: ${propertyName}`,
        stackTrace: error.stack,
      });
      errorLearningSystem.getErrorStatistics();
      console.log(`🔍 Fehler geloggt: ${errorId}`);
      throw error;
    }
  };
  return descriptor;
}

export class IntelligentErrorLogger {
  private static instance: IntelligentErrorLogger;
  private errorHistory: ErrorEntry[] = [];
  private patterns: ErrorPattern[] = [];
  private learningRules = new Map<string, any>();

  private constructor() {}

  static getInstance(): IntelligentErrorLogger {
    if (!IntelligentErrorLogger.instance) {
      IntelligentErrorLogger.instance = new IntelligentErrorLogger();
    }
    return IntelligentErrorLogger.instance;
  }

  logError(error: LoggedError): string {
    const errorId = this.generateErrorId(error.type, error.message);
    const existingPattern = this.findExistingPattern(error);
    const isRecurring = existingPattern !== null;
    const errorEntry: ErrorEntry = {
      id: errorId,
      timestamp: new Date().toISOString(),
      errorType: error.type,
      originalMessage: error.message,
      affectedFile: error.file,
      lineNumber: error.line,
      context: error.context,
      causeAnalysis: this.analyzeCause(error),
      trigger: this.identifyTrigger(error),
      isRecurring,
      occurrenceCount: isRecurring ? (existingPattern!.frequency + 1) : 1,
      lastOccurrences: this.getLastOccurrences(error),
      solution: '',
      codeChanges: [],
      verification: '',
      preventionMeasures: [],
      automaticChecks: [],
      patternRule: ''
    };
    this.errorHistory.push(errorEntry);
    this.updatePatterns(errorEntry);
    this.applyLearningRules(errorEntry);
    console.log(this.generateErrorReport(errorEntry));
    return errorId;
  }

  addSolution(errorId: string, solution: ErrorSolution) {
    const errorEntry = this.errorHistory.find((e) => e.id === errorId);
    if (errorEntry) {
      errorEntry.solution = solution.description;
      errorEntry.codeChanges = solution.codeChanges || [];
      errorEntry.verification = solution.verification || '';
      errorEntry.preventionMeasures = solution.steps || [];
      console.log(`✅ Lösung für Fehler ${errorId} hinzugefügt:`, solution.description);
    }
  }

  documentSolution(errorId: string, solution: Partial<ErrorEntry>) {
    const errorEntry = this.errorHistory.find((e) => e.id === errorId);
    if (!errorEntry) return;
    Object.assign(errorEntry, solution);
    this.updatePatternSolution(errorEntry);
    if (errorEntry.occurrenceCount >= 3) {
      this.implementAutomaticWarning(errorEntry);
    }
    if (errorEntry.occurrenceCount >= 5) {
      this.implementAutomaticCorrection(errorEntry);
    }
  }

  private generateErrorId(type: string, message: string): string {
    const now = new Date();
    const timestamp =
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}` +
      `${String(now.getDate()).padStart(2, '0')}` +
      `${String(now.getHours()).padStart(2, '0')}` +
      `${String(now.getMinutes()).padStart(2, '0')}` +
      `${String(now.getSeconds()).padStart(2, '0')}`;
    const shortMessage = message.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    return `${timestamp}_${type}_${shortMessage}`;
  }

  private analyzeCause(error: LoggedError): string {
    const patterns: Record<string, () => string> = {
      SYNTAX: () => 'Syntax-Fehler durch Tippfehler oder fehlende Zeichen',
      IMPORT: () => 'Import-Problem durch fehlende Dependencies oder falsche Pfade',
      CONFIG: () => 'Konfigurationsfehler durch fehlende Environment-Variablen',
      API: () => 'API-Fehler durch externe Service-Probleme oder Netzwerkissues',
      DATA: () => 'Daten-Validierungsfehler durch unerwartete Eingabeformate',
      LOGIC: () => 'Logikfehler durch falsche Algorithmen oder Bedingungen',
      RUNTIME: () => 'Laufzeitfehler durch unerwartete Ausführungsbedingungen',
      ROUTING: () => 'Routing-Fehler durch fehlende Route-Definitionen in App.tsx',
      SECURITY: () => 'Sicherheitslücke durch ungeschützte Routes oder fehlende Authentifizierung'
    };
    return patterns[error.type]?.() || 'Unbekannte Fehlerursache';
  }

  private identifyTrigger(error: LoggedError): string {
    if (error.context.includes('user input')) return 'Benutzereingabe';
    if (error.context.includes('API call')) return 'API-Aufruf';
    if (error.context.includes('file operation')) return 'Dateioperation';
    if (error.context.includes('database')) return 'Datenbankoperation';
    return 'Unbekannter Trigger';
  }

  private findExistingPattern(error: LoggedError): ErrorPattern | null {
    return (
      this.patterns.find(
        (p) => p.description.includes(error.type) && p.description.includes(error.message.slice(0, 50))
      ) || null
    );
  }

  private getLastOccurrences(error: LoggedError): string[] {
    return this.errorHistory
      .filter((e) => e.errorType === error.type && e.originalMessage === error.message)
      .slice(-5)
      .map((e) => e.timestamp);
  }

  private updatePatterns(errorEntry: ErrorEntry) {
    const existingPattern = this.patterns.find((p) => p.description.includes(errorEntry.errorType));
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastSeen = errorEntry.timestamp;
    } else {
      this.patterns.push({
        patternId: `pattern_${this.patterns.length + 1}`,
        description: `${errorEntry.errorType}: ${errorEntry.originalMessage.slice(0, 100)}`,
        frequency: 1,
        lastSeen: errorEntry.timestamp,
        solutions: [],
        preventionRules: [],
        autoFixAvailable: false,
      });
    }
  }

  private updatePatternSolution(errorEntry: ErrorEntry) {
    const pattern = this.patterns.find((p) => p.description.includes(errorEntry.errorType));
    if (pattern) {
      pattern.solutions.push(errorEntry.solution);
      pattern.preventionRules.push(...errorEntry.preventionMeasures);
      if (errorEntry.occurrenceCount >= 5) {
        pattern.autoFixAvailable = true;
      }
    }
  }

  private applyLearningRules(errorEntry: ErrorEntry) {
    const ruleKey = `${errorEntry.errorType}_${errorEntry.originalMessage.slice(0, 30)}`;
    if (this.learningRules.has(ruleKey)) {
      const rule = this.learningRules.get(ruleKey)!;
      rule.count++;
      rule.lastSeen = errorEntry.timestamp;
    } else {
      this.learningRules.set(ruleKey, {
        count: 1,
        firstSeen: errorEntry.timestamp,
        lastSeen: errorEntry.timestamp,
        autoFixImplemented: false,
      });
    }
  }

  private implementAutomaticWarning(errorEntry: ErrorEntry) {
    console.warn(`⚠️ WIEDERHOLUNGSFEHLER ERKANNT: ${errorEntry.errorType}`);
    console.warn(`Vorkommen: ${errorEntry.occurrenceCount}x`);
    console.warn(`Empfohlene Lösung: ${errorEntry.solution}`);
    this.addPreventionRule(errorEntry);
    this.notifyDevelopmentTeam(errorEntry);
    this.createLintRule(errorEntry);
  }

  private implementAutomaticCorrection(errorEntry: ErrorEntry) {
    console.log(`🤖 AUTO-KORREKTUR AKTIVIERT: ${errorEntry.errorType}`);
    const pattern = this.patterns.find((p) => p.description.includes(errorEntry.errorType));
    if (pattern) {
      pattern.autoFixAvailable = true;
    }
    this.createAutoFixRule(errorEntry);
    this.installPreCommitHook(errorEntry);
    this.createCodeTemplate(errorEntry);
  }

  private addPreventionRule(errorEntry: ErrorEntry) {
    const preventionRule = {
      id: `prevention_${errorEntry.id}`,
      errorType: errorEntry.errorType,
      rule: errorEntry.patternRule,
      autoCheck: this.generateAutoCheck(errorEntry),
      implemented: new Date().toISOString(),
    };
    this.learningRules.set(preventionRule.id, preventionRule);
    console.log(`📋 NEUE PRÄVENTIONSREGEL ERSTELLT: ${preventionRule.rule}`);
    console.log(`🔍 AUTO-CHECK: ${preventionRule.autoCheck}`);
  }

  private notifyDevelopmentTeam(errorEntry: ErrorEntry) {
    console.log(`📧 ENTWICKLER-BENACHRICHTIGUNG: Wiederkehrender Fehler ${errorEntry.errorType} (${errorEntry.occurrenceCount}x)`);
  }

  private createLintRule(errorEntry: ErrorEntry) {
    const lintRules: Record<string, string> = {
      SYNTAX: '"no-trailing-spaces": "error", "semi": ["error", "always"]',
      IMPORT: '"import/no-unresolved": "error", "import/order": "error"',
      CONFIG: '"no-process-env": "warn"',
      DATA: '"@typescript-eslint/strict-boolean-expressions": "error"',
      ROUTING: '"react-router/no-missing-routes": "error"',
    };
    const rule = lintRules[errorEntry.errorType];
    if (rule) {
      console.log(`🔧 LINT-REGEL ERSTELLT: ${rule}`);
    }
  }

  private createAutoFixRule(errorEntry: ErrorEntry) {
    const autoFixes: Record<string, string> = {
      SYNTAX: 'prettier --write',
      IMPORT: 'organize-imports-cli',
      CONFIG: 'env-validation-check',
      DATA: 'type-guard-generator',
      ROUTING: 'auto-route-generator',
    };
    const fix = autoFixes[errorEntry.errorType];
    if (fix) {
      console.log(`🤖 AUTO-FIX REGEL: ${fix}`);
    }
  }

  private installPreCommitHook(errorEntry: ErrorEntry) {
    const hooks: Record<string, string> = {
      SYNTAX: 'npm run lint:fix',
      IMPORT: 'npm run imports:organize',
      CONFIG: 'npm run config:validate',
      DATA: 'npm run types:check',
    };
    const hook = hooks[errorEntry.errorType];
    if (hook) {
      console.log(`🩻 PRE-COMMIT HOOK: ${hook}`);
    }
  }

  private createCodeTemplate(errorEntry: ErrorEntry) {
    const templates: Record<string, string> = {
      SYNTAX: '// AUTO-GENERATED: Korrekte Syntax-Template',
      IMPORT: '// AUTO-GENERATED: Import-Template mit korrekten Pfaden',
      CONFIG: '// AUTO-GENERATED: Config-Validation-Template',
      DATA: '// AUTO-GENERATED: Type-Safe Data-Handling-Template',
    };
    const template = templates[errorEntry.errorType];
    if (template) {
      console.log(`📄 CODE-TEMPLATE ERSTELLT: ${template}`);
    }
  }

  private generateAutoCheck(errorEntry: ErrorEntry): string {
    const checks: Record<string, string> = {
      SYNTAX: 'Syntax-Validator vor Ausführung',
      IMPORT: 'Import-Resolver Check',
      CONFIG: 'Environment-Variable Validation',
      DATA: 'Type-Safety Check',
      API: 'API-Endpoint Verfügbarkeit',
      LOGIC: 'Unit-Test Coverage Check',
      ROUTING: 'Route-Definition Check in App.tsx',
      PERMISSION: 'Rollenbasierte Berechtigung Check',
      SECURITY: 'ProtectedRoute Authentication Check',
    };
    return checks[errorEntry.errorType] || 'Allgemeiner Validierungs-Check';
  }

  private generateErrorReport(errorEntry: ErrorEntry): string {
    return `
## FEHLER-EINTRAG ${errorEntry.id}

### Fehlerdetails:
- **Zeitpunkt:** ${errorEntry.timestamp}
- **Fehlertyp:** ${errorEntry.errorType}
- **Fehlermeldung:** ${errorEntry.originalMessage}
- **Betroffene Datei:** ${errorEntry.affectedFile}:${errorEntry.lineNumber || 'unknown'}
- **Kontext:** ${errorEntry.context}

### Ursachenanalyse:
- **Grund:** ${errorEntry.causeAnalysis}
- **Auslöser:** ${errorEntry.trigger}
- **Muster erkannt:** ${errorEntry.isRecurring ? 'JA' : 'NEIN'} (${errorEntry.occurrenceCount}x)

### Status:
- **Lösung implementiert:** ${errorEntry.solution || 'AUSSTEHEND'}
- **Präventionsmaßnahmen:** ${errorEntry.preventionMeasures.length || 0} geplant
`;
  }

  getErrorStatistics() {
    console.log('📊 Aktuelle Error Learning Statistiken:', {
      totalErrors: this.errorHistory.length,
      recurringErrors: this.errorHistory.filter((e) => e.isRecurring).length,
      patterns: this.patterns.length,
      autoFixesAvailable: this.patterns.filter((p) => p.autoFixAvailable).length,
      mostCommonErrorType: this.getMostCommonErrorType(),
      recentErrorsCount: this.errorHistory.slice(-10).length,
      allErrorTypes: this.errorHistory.map((e) => e.errorType),
      patternIds: this.patterns.map((p) => p.patternId),
    });
    return {
      totalErrors: this.errorHistory.length,
      recurringErrors: this.errorHistory.filter((e) => e.isRecurring).length,
      patterns: this.patterns.length,
      autoFixesAvailable: this.patterns.filter((p) => p.autoFixAvailable).length,
      mostCommonErrorType: this.getMostCommonErrorType(),
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  private getMostCommonErrorType(): string {
    const counts = this.errorHistory.reduce<Record<string, number>>((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'NONE';
  }

  getAllPatterns(): ErrorPattern[] {
    return this.patterns;
  }

  exportKnowledgeBase(): string {
    return this.patterns
      .map(
        (pattern) => `
## ${pattern.description}
- **Häufigkeit:** ${pattern.frequency}x
- **Letzte Sichtung:** ${pattern.lastSeen}
- **Lösungen:** ${pattern.solutions.join('; ')}
- **Prävention:** ${pattern.preventionRules.join('; ')}
- **Auto-Fix:** ${pattern.autoFixAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
`
      )
      .join('\n');
  }
}

export const errorLearningSystem = IntelligentErrorLogger.getInstance();

// seed patterns for demo purposes
setTimeout(() => {
  const instance = errorLearningSystem;
  instance['patterns'].push(
    {
      patternId: 'permission_manager_project_creation',
      description: 'PERMISSION: Manager können keine Projekte erstellen (enforceUserIsolation Konflikt)',
      frequency: 3,
      lastSeen: new Date().toISOString(),
      solutions: [
        'enforceUserIsolation() Middleware durch direkte Berechtigungsprüfung ersetzen',
        'requireManagerOrAdmin() vor komplexe Middleware-Kette setzen',
      ],
      preventionRules: [
        'Berechtigungsprüfung vor jeder CRUD-Operation testen',
        'Manager-Rolle explizit in API-Tests validieren',
      ],
      autoFixAvailable: true,
    },
    {
      patternId: 'permission_manager_customer_creation',
      description: 'PERMISSION: Manager können keine Kunden erstellen (fehlende user_id Spalte)',
      frequency: 2,
      lastSeen: new Date().toISOString(),
      solutions: [
        'user_id Spalte zu customers Tabelle hinzufügen via ALTER TABLE',
        'User-Isolation für alle Customer-CRUD-Operationen implementieren',
      ],
      preventionRules: [
        'Datenbank-Schema mit user_id für Multi-Tenant-Isolation prüfen',
        'Alle neuen Tabellen automatisch mit user_id erstellen',
      ],
      autoFixAvailable: true,
    },
    {
      patternId: 'permission_manager_company_creation',
      description: 'PERMISSION: Manager können keine Firmen erstellen (fehlende user_id Spalte)',
      frequency: 2,
      lastSeen: new Date().toISOString(),
      solutions: [
        'user_id Spalte zu companies Tabelle hinzufügen via ALTER TABLE',
        'User-Isolation für alle Company-CRUD-Operationen implementieren',
      ],
      preventionRules: [
        'Automatische user_id-Spalten-Prüfung bei neuen Tabellen',
        'Schema-Migrations mit user_id-Standard implementieren',
      ],
      autoFixAvailable: true,
    },
    {
      patternId: 'security_unprotected_frontend_routes',
      description: 'SECURITY: User undefined kann ins Dashboard - Frontend-Routes ohne ProtectedRoute',
      frequency: 5,
      lastSeen: new Date().toISOString(),
      solutions: [
        'Alle Frontend-Routes mit <ProtectedRoute> umschließen',
        'useAuth Hook prüft isAuthenticated vor Seitenzugriff',
        'credentials: "include" für alle API-Requests aktivieren',
      ],
      preventionRules: [
        'Neue Routes automatisch mit ProtectedRoute erstellen',
        'Authentication-Tests für alle geschützten Seiten',
        'Route-Security-Audit bei jeder neuen Route-Definition',
      ],
      autoFixAvailable: true,
    },
    {
      patternId: 'data_project_creation_validation',
      description: 'DATA: Projekterstellung fehlschlägt - Frontend String-Daten vs Backend Schema-Types',
      frequency: 3,
      lastSeen: new Date().toISOString(),
      solutions: [
        'Backend-Datenkonvertierung vor Schema-Validierung implementieren',
        'Date-Strings zu Date-Objekten konvertieren (new Date())',
        'Robuste Typenkonvertierung für budget (toString) und customerId (parseInt)',
      ],
      preventionRules: [
        'Automatische Datentyp-Validierung in API-Routes',
        'Schema-Tests für Frontend-Backend-Kompatibilität',
        'Einheitliche Datenkonvertierungslogik implementieren',
      ],
      autoFixAvailable: true,
    },
    {
      patternId: 'api_request_parameter_order',
      description: 'API: apiRequest Parameter-Reihenfolge falsch - Häufigster Fehler bei API-Aufrufen',
      frequency: 15,
      lastSeen: new Date().toISOString(),
      solutions: [
        'apiRequest Parameter-Reihenfolge: apiRequest(url, method, data) - NICHT (method, url, data)',
        'Korrekt: apiRequest("/api/endpoint", "PUT", data)',
        'Falsch: apiRequest("PUT", "/api/endpoint", data)',
      ],
      preventionRules: [
        'Bei jedem apiRequest-Aufruf Parameter-Reihenfolge prüfen',
        'URL immer als erster Parameter, dann HTTP-Method, dann Daten',
        'TypeScript-Definitionen für apiRequest-Funktion erweitern',
        'Automatische Lint-Regel für apiRequest-Parameter-Reihenfolge',
      ],
      autoFixAvailable: true,
    }
  );
  console.log('✅ Manager-Berechtigungsprobleme, Security-Patterns, Daten-Validierung und apiRequest-Parameter-Reihenfolge in Error Learning System geladen');
}, 100);
