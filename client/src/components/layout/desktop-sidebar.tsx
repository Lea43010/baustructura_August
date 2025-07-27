import { Button } from "@/components/ui/button";
import { Home, FolderOpen, Map, MessageCircle, MessageSquare, User, FileText, Settings, Shield, Building2, Users, Camera, Mic, CloudSnow } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const mainNavItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/projects", icon: FolderOpen, label: "Projekte" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/maps", icon: Map, label: "Karte" },
    { href: "/camera", icon: Camera, label: "Kamera" },
    { href: "/audio", icon: Mic, label: "Audio" },
    { href: "/documents", icon: FileText, label: "Dokumente" },
  ];

  const toolItems = [
    { href: "/flood-protection", icon: CloudSnow, label: "Hochwasserschutz" },
    { href: "/ai-assistant", icon: MessageCircle, label: "KI-Assistent" },
  ];

  const managerItems = user?.role === 'admin' || user?.role === 'manager' ? [
    { href: "/customers", icon: Users, label: "Kunden" },
    { href: "/companies", icon: Building2, label: "Firmen" },
    { href: "/sftp", icon: Settings, label: "SFTP" },
  ] : [];

  const adminItems = user?.role === 'admin' ? [
    { href: "/admin", icon: Shield, label: "Administration" },
    { href: "/email-inbox", icon: MessageCircle, label: "E-Mail Inbox" },
  ] : [];

  const supportItems = [
    { href: "/support", icon: MessageCircle, label: "Support" },
    { href: "/help", icon: FileText, label: "Hilfe" },
  ];

  const NavSection = ({ title, items }: { title: string; items: any[] }) => (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-2 h-auto font-normal",
                  isActive(item.href)
                    ? "bg-green-50 text-green-700 border-r-2 border-green-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <img 
            src="/logo.png" 
            alt="Bau-Structura Logo" 
            className="h-8 w-8 object-contain"
            onError={(e) => {
              // Fallback zu grünem Icon wenn Logo nicht lädt
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center" 
            style={{display: 'none'}}
          >
            <span className="text-white font-bold text-sm">BS</span>
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">Bau-Structura</span>
        </div>

        {/* Navigation */}
        <div className="mt-5 flex-grow flex flex-col px-4">
          <NavSection title="Hauptmenü" items={mainNavItems} />
          <NavSection title="Tools" items={toolItems} />
          {managerItems.length > 0 && <NavSection title="Manager" items={managerItems} />}
          {adminItems.length > 0 && <NavSection title="Administration" items={adminItems} />}
          <NavSection title="Support" items={supportItems} />
        </div>

        {/* User Info */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Benutzer'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}