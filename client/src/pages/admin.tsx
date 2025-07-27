import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Link } from "wouter";
import { 
  Users, 
  Database, 
  FileText, 
  Key,
  CreditCard,
  BarChart, 
  TestTube2, 
  Download,
  Shield,
  Activity,
  ArrowLeft,
  Settings,
  Mail,
  Brain,
  Server,
  TrendingUp,
  Forward
} from "lucide-react";
import { ErrorLearningDashboard } from "@/components/error-learning-dashboard";
import TrialNotificationPanel from '@/components/TrialNotificationPanel';

interface SystemStats {
  activeUsers: number;
  newUsersThisMonth: number;
  dbSize: string;
  lastBackup: string;
  activeLicenses: number;
  expiringLicenses: number;
  availableLicenses: number;
  totalProjects: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  basicLicenses: number;
  professionalLicenses: number;
  enterpriseLicenses: number;
  paymentsThisMonth: number;
  totalRevenue: number;
}

export default function AdminTabbed() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user",
    licenseType: "basic"
  });

  // Role change mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const response = await apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/role`, "PUT", { role: newRole });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Rolle konnte nicht geändert werden");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rolle erfolgreich geändert",
        description: data.message + " Keine Neuanmeldung erforderlich.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== 'admin')) {
      toast({
        title: "Zugriff verweigert",
        description: "Nur Administratoren können auf diesen Bereich zugreifen.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch real system stats from API
  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  // Fetch users list
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("/api/admin/users", "POST", userData);
      return await response.json();
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setNewUser({ username: "", email: "", role: "user", licenseType: "basic" });
      toast({
        title: "Benutzer erstellt",
        description: response.message || "Der neue Benutzer wurde erfolgreich erstellt und das Passwort per E-Mail versendet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Erstellen des Benutzers",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Lade Administrationsbereich...</div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Systemverwaltung und Benutzermanagement
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.newUsersThisMonth || 0} neue diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenbankgröße</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.dbSize || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Letztes Backup: {systemStats?.lastBackup || "Nie"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Lizenzen</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeLicenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.expiringLicenses || 0} ablaufend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Projekte gesamt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail
          </TabsTrigger>
          <TabsTrigger value="trials" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            Trial-System
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Zahlungen
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Benutzerstatistiken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Administratoren:</span>
                  <Badge variant="destructive">{systemStats?.adminUsers || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Manager:</span>
                  <Badge variant="default">{systemStats?.managerUsers || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Benutzer:</span>
                  <Badge variant="secondary">{systemStats?.regularUsers || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Lizenzen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Basic:</span>
                  <Badge variant="outline">{systemStats?.basicLicenses || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Professional:</span>
                  <Badge variant="default">{systemStats?.professionalLicenses || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Enterprise:</span>
                  <Badge variant="destructive">{systemStats?.enterpriseLicenses || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Umsatz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold">€{systemStats?.totalRevenue || 0}</div>
                <div className="text-sm text-muted-foreground">
                  {systemStats?.paymentsThisMonth || 0} Zahlungen diesen Monat
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benutzerverwaltung</CardTitle>
              <CardDescription>
                Benutzerkonten, Rollen und Berechtigungen verwalten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create User Form */}
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="text-lg font-medium mb-4">Neuen Benutzer erstellen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Benutzername</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="z.B. max.mustermann"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="max@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rolle</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rolle auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Benutzer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Lizenztyp</Label>
                    <Select value={newUser.licenseType} onValueChange={(value) => setNewUser({...newUser, licenseType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Lizenz auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (21€/Monat)</SelectItem>
                        <SelectItem value="professional">Professional (39€/Monat)</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => createUserMutation.mutate(newUser)}
                  disabled={createUserMutation.isPending || !newUser.username || !newUser.email}
                  className="w-full mt-4"
                >
                  {createUserMutation.isPending ? "Erstelle Benutzer..." : "Benutzer erstellen"}
                </Button>
              </div>

              {/* Users List */}
              <div>
                <h3 className="text-lg font-medium mb-4">Alle Benutzer ({Array.isArray(users) ? users.length : 0})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.isArray(users) && users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge 
                          variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'secondary'}
                        >
                          {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'User'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                        >
                          Rolle ändern
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-Mail System
              </CardTitle>
              <CardDescription>
                BREVO Integration für E-Mail-Versand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Konfiguration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">✅ Konfiguriert</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMTP Server:</span>
                      <span className="font-mono text-xs">smtp-relay.brevo.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Port:</span>
                      <span className="font-mono text-xs">587/TLS</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test & Funktionen</h3>
                  <Button 
                    onClick={async () => {
                      try {
                        toast({
                          title: "E-Mail Test läuft...",
                          description: "Echte BREVO-E-Mail wird versendet",
                        });
                        
                        const response = await fetch('/api/test-brevo', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          toast({
                            title: "E-Mail Test erfolgreich",
                            description: data.message,
                            variant: "default",
                          });
                        } else {
                          const error = await response.json();
                          toast({
                            title: "E-Mail Test fehlgeschlagen",
                            description: error.message || "Unbekannter Fehler",
                            variant: "destructive",
                          });
                        }
                      } catch (error: any) {
                        toast({
                          title: "E-Mail Test fehlgeschlagen",
                          description: error.message || "Netzwerkfehler",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full"
                  >
                    <TestTube2 className="h-4 w-4 mr-2" />
                    Test-E-Mail senden
                  </Button>
                  <div className="text-xs text-gray-500">
                    BREVO SMTP • Support-Tickets • Willkommens-E-Mails • Hochwasserschutz-Export
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* E-Mail-Weiterleitung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Forward className="h-5 w-5" />
                E-Mail-Weiterleitung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Aktuelle Regel</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Von:</span>
                      <span className="font-mono text-xs">support@bau-structura.de</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Nach:</span>
                      <span className="font-mono text-xs">lea.zimmer@gmx.net</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">✅ Aktiv</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test & Setup</h3>
                  <Button 
                    onClick={async () => {
                      try {
                        toast({
                          title: "E-Mail-Weiterleitung wird getestet...",
                          description: "Test-E-Mail wird an support@ gesendet",
                        });
                        
                        const response = await fetch('/api/inbound-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            to: 'support@bau-structura.de',
                            from: { email: 'admin@bau-structura.de', name: 'Admin Test' },
                            subject: 'Test der E-Mail-Weiterleitung',
                            text: 'Das ist eine Test-Nachricht der automatischen E-Mail-Weiterleitung.',
                            html: '<p>Das ist eine <strong>Test-Nachricht</strong> der automatischen E-Mail-Weiterleitung.</p>'
                          })
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          toast({
                            title: "Weiterleitung erfolgreich",
                            description: `E-Mail wurde an ${data.forwardedTo} weitergeleitet`,
                            variant: "default",
                          });
                        } else {
                          const error = await response.json();
                          toast({
                            title: "Weiterleitung fehlgeschlagen",
                            description: error.message || "Unbekannter Fehler",
                            variant: "destructive",
                          });
                        }
                      } catch (error: any) {
                        toast({
                          title: "Test fehlgeschlagen",
                          description: error.message || "Netzwerkfehler",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full"
                  >
                    <Forward className="h-4 w-4 mr-2" />
                    Weiterleitung testen
                  </Button>
                  <div className="text-xs text-gray-500">
                    ⚠️ Benötigt BREVO Inbound API Setup für echte E-Mails
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Notification Management Tab */}
        <TabsContent value="trials" className="space-y-6">
          <TrialNotificationPanel />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Datenbank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Größe:</span>
                    <span className="font-medium">{systemStats?.dbSize || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Letztes Backup:</span>
                    <span className="font-medium">{systemStats?.lastBackup || "Nie"}</span>
                  </div>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Backup erstellen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sicherheit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Rate Limiting:</span>
                    <span className="text-green-600 font-medium">✅ Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CORS:</span>
                    <span className="text-green-600 font-medium">✅ Konfiguriert</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session Security:</span>
                    <span className="text-green-600 font-medium">✅ Aktiv</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Intelligentes Fehlerlernsystem
              </CardTitle>
              <CardDescription>
                Automatische Fehlererkennung und -analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorLearningDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Zahlungsübersicht
              </CardTitle>
              <CardDescription>
                Stripe-Integration und Umsatzstatistiken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold">€{systemStats?.totalRevenue || 0}</div>
                  <div className="text-sm text-muted-foreground">Gesamtumsatz</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold">{systemStats?.paymentsThisMonth || 0}</div>
                  <div className="text-sm text-muted-foreground">Zahlungen diesen Monat</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold">{systemStats?.activeLicenses || 0}</div>
                  <div className="text-sm text-muted-foreground">Aktive Lizenzen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rolle ändern</DialogTitle>
              <DialogDescription>
                Rolle für {editingUser.username} ({editingUser.email}) ändern
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Aktuelle Rolle</Label>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={editingUser.role === 'admin' ? 'destructive' : editingUser.role === 'manager' ? 'default' : 'secondary'}
                  >
                    {editingUser.role === 'admin' ? 'Administrator' : editingUser.role === 'manager' ? 'Manager' : 'Benutzer'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Neue Rolle</Label>
                <div className="space-y-2">
                  <Button
                    variant={editingUser.role === 'user' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    disabled={editingUser.role === 'user' || changeRoleMutation.isPending}
                    onClick={() => {
                      if (editingUser.role !== 'user') {
                        changeRoleMutation.mutate({ userId: editingUser.id || editingUser.email, newRole: 'user' });
                      }
                    }}
                  >
                    <Badge variant="secondary" className="mr-2">Benutzer</Badge>
                    Grundlegende Berechtigungen
                  </Button>
                  
                  <Button
                    variant={editingUser.role === 'manager' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    disabled={editingUser.role === 'manager' || changeRoleMutation.isPending}
                    onClick={() => {
                      if (editingUser.role !== 'manager') {
                        changeRoleMutation.mutate({ userId: editingUser.id || editingUser.email, newRole: 'manager' });
                      }
                    }}
                  >
                    <Badge variant="default" className="mr-2">Manager</Badge>
                    Projekt- und Kundenverwaltung
                  </Button>
                  
                  <Button
                    variant={editingUser.role === 'admin' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    disabled={editingUser.role === 'admin' || changeRoleMutation.isPending || editingUser.id === user?.id}
                    onClick={() => {
                      if (editingUser.role !== 'admin' && editingUser.id !== user?.id) {
                        changeRoleMutation.mutate({ userId: editingUser.id || editingUser.email, newRole: 'admin' });
                      }
                    }}
                  >
                    <Badge variant="destructive" className="mr-2">Administrator</Badge>
                    Vollzugriff auf alle Funktionen
                  </Button>
                </div>
              </div>
              
              {editingUser.id === user?.id && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Sie können Ihre eigene Rolle nicht ändern.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingUser(null)}
                  disabled={changeRoleMutation.isPending}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}