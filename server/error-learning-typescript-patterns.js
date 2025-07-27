// TypeScript Error Learning Patterns - Integration
// Erweiterung des intelligenten Fehlerlernsystems um TypeScript-spezifische Patterns

const typescriptErrorPatterns = [
  {
    id: 'typescript_schema_import_paths',
    type: 'TYPESCRIPT',
    pattern: 'Schema import path inconsistency',
    description: 'Inkonsistente Import-Pfade zwischen relativen (../../shared/schema) und absoluten (@shared/schema) Importen',
    frequency: 8,
    severity: 'critical',
    firstOccurred: new Date('2025-07-20'),
    lastOccurred: new Date('2025-07-20'),
    errorSignatures: [
      "Cannot find module '../../shared/schema'",
      "Module not found: ../../shared/schema",
      "import type { } from \"../../shared/schema\""
    ],
    solutions: [
      {
        description: 'Vereinheitliche alle Schema-Imports auf @shared/schema Alias',
        code: 'str_replace: "../../shared/schema" → "@shared/schema"',
        confidence: 0.95
      },
      {
        description: 'ESLint-Regel für konsistente Import-Pfade einrichten',
        code: '"import/no-relative-parent-imports": ["error", { "commonjs": true, "amd": false }]',
        confidence: 0.85
      }
    ],
    prevention: [
      'Verwende immer @shared Alias für Schema-Imports',
      'ESLint-Regel für Import-Konsistenz aktivieren',
      'TypeScript Path-Mapping in tsconfig.json konfigurieren'
    ],
    affectedFiles: [
      'client/src/pages/customers.tsx',
      'client/src/pages/camera.tsx', 
      'client/src/pages/audio-recorder.tsx',
      'client/src/pages/maps-fullscreen.tsx',
      'client/src/pages/project-details.tsx',
      'client/src/pages/project-edit-contacts.tsx',
      'client/src/pages/project-edit-simple.tsx',
      'client/src/pages/project-edit.tsx'
    ],
    status: 'resolved',
    autoFixAvailable: true
  },
  
  {
    id: 'typescript_render_return_null',
    type: 'TYPESCRIPT',
    pattern: 'React render function null return type error',
    description: 'React-Render-Funktionen geben null zurück aber ReactElement wird erwartet',
    frequency: 2,
    severity: 'high',
    firstOccurred: new Date('2025-07-20'),
    lastOccurred: new Date('2025-07-20'),
    errorSignatures: [
      "Type 'null' is not assignable to type 'ReactElement'",
      "render function return type mismatch",
      "(): React.JSX.Element | null' is not assignable to type 'ReactElement'"
    ],
    solutions: [
      {
        description: 'Explizite Return-Type-Annotation mit ReactElement',
        code: 'const render = (status: Status): React.ReactElement => { ... }',
        confidence: 0.90
      },
      {
        description: 'Null-Returns durch leere <div /> oder Fragment ersetzen',
        code: 'return null; → return <div />;',
        confidence: 0.85
      }
    ],
    prevention: [
      'Verwende explizite Return-Type-Annotations für React-Komponenten',
      'Vermeide null-Returns in Render-Funktionen',
      'Nutze Fragments oder leere Elements statt null'
    ],
    affectedFiles: [
      'client/src/components/maps/google-map.tsx',
      'client/src/components/maps/address-autocomplete.tsx'
    ],
    status: 'resolved',
    autoFixAvailable: true
  },

  {
    id: 'typescript_api_request_parameters',
    type: 'TYPESCRIPT',
    pattern: 'API request parameter order mismatch',
    description: 'Falsche Parameter-Reihenfolge bei apiRequest-Aufrufen führt zu Type-Fehlern',
    frequency: 3,
    severity: 'high',
    firstOccurred: new Date('2025-07-20'),
    lastOccurred: new Date('2025-07-20'),
    errorSignatures: [
      "Argument of type '{ method: string; body: string; }' is not assignable to parameter of type 'string'",
      "apiRequest parameter order incorrect",
      "Expected (method, url, data) got (url, options)"
    ],
    solutions: [
      {
        description: 'Korrekte apiRequest-Parameter-Reihenfolge verwenden',
        code: 'apiRequest("POST", "/api/endpoint", data) // statt apiRequest("/api/endpoint", { method: "POST", body: data })',
        confidence: 0.95
      },
      {
        description: 'TypeScript-Überladungen für apiRequest implementieren',
        code: 'function apiRequest(method: string, url: string, data?: any): Promise<Response>',
        confidence: 0.80
      }
    ],
    prevention: [
      'Verwende immer korrekte Parameter-Reihenfolge: method, url, data',
      'TypeScript-Überladungen für bessere Type-Safety',
      'Dokumentation der apiRequest-Signatur in Code-Kommentaren'
    ],
    affectedFiles: [
      'client/src/components/project/project-form-with-map.tsx'
    ],
    status: 'resolved',
    autoFixAvailable: true
  },

  {
    id: 'typescript_unknown_array_operations',
    type: 'TYPESCRIPT',
    pattern: 'Unknown type array operations without guards',
    description: 'Array-Operationen auf unknown-Types ohne Array-Checks führen zu Runtime-Fehlern',
    frequency: 4,
    severity: 'medium',
    firstOccurred: new Date('2025-07-20'),
    lastOccurred: new Date('2025-07-20'),
    errorSignatures: [
      "'users' is of type 'unknown'",
      "'contacts' is of type 'unknown'",
      ".map is not a function",
      "Cannot read properties of undefined"
    ],
    solutions: [
      {
        description: 'Array.isArray() Guards vor Array-Operationen',
        code: 'Array.isArray(users) && users.map(...) // statt users.map(...)',
        confidence: 0.90
      },
      {
        description: 'Sichere Length-Berechnung mit Fallback',
        code: 'Array.isArray(users) ? users.length : 0',
        confidence: 0.85
      },
      {
        description: 'Bessere API-Response-Typisierung implementieren',
        code: 'const { data: users = [] } = useQuery<User[]>({ ... })',
        confidence: 0.75
      }
    ],
    prevention: [
      'Immer Array.isArray() Checks vor Array-Methoden',
      'Striktere API-Response-Interface-Definitionen',
      'Default-Werte bei Array-Destructuring verwenden'
    ],
    affectedFiles: [
      'client/src/pages/admin.tsx',
      'client/src/pages/customers.tsx'
    ],
    status: 'resolved',
    autoFixAvailable: true
  },
  
  {
    id: 'typescript_pageheader_props_mismatch',
    type: 'TYPESCRIPT',
    pattern: 'PageHeader component props interface mismatch',
    description: 'PageHeader Komponente erhält Props die nicht im Interface definiert sind (title, subtitle)',
    frequency: 3,
    severity: 'medium',
    firstOccurred: new Date('2025-07-20'),
    lastOccurred: new Date('2025-07-20'),
    errorSignatures: [
      "Property 'title' does not exist on type 'IntrinsicAttributes & PageHeaderProps'",
      "Property 'subtitle' does not exist on type 'IntrinsicAttributes & PageHeaderProps'",
      "Type '{ title: string; subtitle: string; onBack: () => void; }' is not assignable"
    ],
    solutions: [
      {
        description: 'PageHeader durch einfache HTML-Struktur ersetzen',
        code: '<div className="p-4 bg-white/80 backdrop-blur-sm border-b"><h1>{title}</h1><p>{subtitle}</p></div>',
        confidence: 0.90
      },
      {
        description: 'PageHeader Props-Interface erweitern oder korrigieren',
        code: 'interface PageHeaderProps { title?: string; subtitle?: string; onBack?: () => void; }',
        confidence: 0.75
      }
    ],
    prevention: [
      'Props-Interfaces vor Verwendung überprüfen',
      'TypeScript-Strict-Mode für Component-Props aktivieren',
      'Konsistente Component-API-Definitionen'
    ],
    affectedFiles: [
      'client/src/pages/help.tsx'
    ],
    status: 'resolved',
    autoFixAvailable: true
  }
];

// Export für Integration in bestehendes Error Learning System
module.exports = { typescriptErrorPatterns };