import { useAuth } from "../hooks/useAuth";
import { usePerformanceMonitor, useMemoryMonitor } from "../hooks/usePerformanceMonitor";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ProjectCard } from "../components/project/project-card";
import { ProjectStats } from "../components/project/project-stats";
import { PageHeader } from "../components/layout/page-header";
import { AppLayout } from "../components/layout/app-layout";
import { NotificationBell } from "../components/notification-system";
import TrialStatusWidget from "../components/TrialStatusWidget";
import { useLicenseFeatures } from "../hooks/useLicenseFeatures";

import { 
  FolderOpen, 
  AlertCircle, 
  Camera,
  Shield,
  FileText, 
  MapPin, 
  Network,
  Bell,
  User,
  Server,
  Mic,
  Settings,
  Building2,
  Info,
  Plus,
  Crown,
  Lock,
  MessageSquare
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Project } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { features, currentLicense, canCreateProject, LicenseRestrictionModalComponent } = useLicenseFeatures();
  
  // Performance monitoring
  usePerformanceMonitor('Dashboard');
  useMemoryMonitor();
  
  // Debug-Ausgabe
  console.log('Dashboard Debug - User:', user);
  console.log('Dashboard Debug - User Role:', (user as any)?.role);
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const activeProjects = projects.filter(p => p.status === "active").length;
  const pendingTasks = projects.filter(p => p.status === "planning").length;

  const recentProjects = projects.slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5">
              <img 
                src="/logo.png" 
                alt="Sachverständigenbüro Logo" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  console.log('Logo loading failed, using fallback');
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">BS</div>';
                  }
                }}
              />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Bau-Structura</h1>
              <p className="text-xs text-gray-600">
                {(user as any)?.role === 'admin' ? 'Administrator Dashboard' : 'Projekt Management System'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationBell />
            {(user as any)?.role === "admin" && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/admin")}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Administration"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/profile")}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Profil bearbeiten"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Dashboard Content - Mobile optimiert */}
      <div className="p-3 sm:p-4 pb-20">
        {/* Trial Status Widget */}
        <div className="mb-6">
          <TrialStatusWidget />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ProjectStats
            title="Aktive Projekte"
            value={activeProjects}
            icon={<FolderOpen className="h-5 w-5" />}
            color="bg-green-500"
          />
          <ProjectStats
            title="Neue Aufgaben"
            value={pendingTasks}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-orange-500"
          />
        </div>

        {/* Recent Projects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aktuelle Projekte</h2>
            <Link href="/projects">
              <Button variant="link" className="text-green-600 text-sm font-medium p-0">
                Alle anzeigen
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Noch keine Projekte vorhanden</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Erstellen Sie Ihr erstes Projekt, um loszulegen
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Neues Projekt mit Lizenz-Beschränkung */}
            {((user as any)?.role === 'manager' || (user as any)?.role === 'admin') && (
              <Card 
                className={`p-3 text-center transition-shadow cursor-pointer ${canCreateProject(projects.length) ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (canCreateProject(projects.length)) {
                    setLocation("/projects?create=true");
                  }
                }}
              >
                <CardContent className="p-0">
                  <div className={`w-10 h-10 ${canCreateProject(projects.length) ? 'bg-green-600' : 'bg-gray-400'} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    {canCreateProject(projects.length) ? (
                      <Plus className="h-5 w-5 text-white" />
                    ) : (
                      <Lock className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {canCreateProject(projects.length) ? 'Neues Projekt' : 'Projekt-Limit'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {canCreateProject(projects.length) ? 'Projekt erstellen' : `${projects.length}/5 Basic-Limit`}
                  </p>
                </CardContent>
              </Card>
            )}



            <Link href="/camera">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Foto aufnehmen</p>
                  <p className="text-xs text-gray-600">Dokumentieren</p>
                </CardContent>
              </Card>
            </Link>
            


            <Link href="/flood-protection">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Hochwasserschutz</p>
                  <p className="text-xs text-gray-600">Checklisten & Anlagen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/documents">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Dokumente</p>
                  <p className="text-xs text-gray-600">Verwalten & Archiv</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/chat">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Chat</p>
                  <p className="text-xs text-gray-600">Kommunikation</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/help">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Hilfe & Infos</p>
                  <p className="text-xs text-gray-600">Anleitungen & Support</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/audio">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Sprachaufnahme</p>
                  <p className="text-xs text-gray-600">Berichte sprechen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/ai-assistant">
              <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">✨</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">KI-Assistent</p>
                  <p className="text-xs text-gray-600">Intelligente Hilfe</p>
                </CardContent>
              </Card>
            </Link>



          </div>
        </div>

        {/* Manager/Admin Tools */}
        {(true || (user as any)?.role === 'manager' || (user as any)?.role === 'admin') && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager-Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">


              <Link href="/customers">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Kundenverwaltung</p>
                      <p className="text-sm text-gray-600">Kunden & Firmen</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/companies">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Firmenverwaltung</p>
                      <p className="text-sm text-gray-600">Firmen & Ansprechpartner</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>

    <LicenseRestrictionModalComponent />
    </AppLayout>
  );
}
