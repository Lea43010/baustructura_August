import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'wouter';

interface TrialStatus {
  isTrialUser: boolean;
  trialEndDate?: string;
  daysRemaining?: number;
  hasTrialNotifications: boolean;
  notificationCount: number;
  licenseStatus: string;
}

const TrialStatusWidget = () => {
  const { data: trialStatus, isLoading } = useQuery<TrialStatus>({
    queryKey: ['/api/user/trial-status'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading || !trialStatus?.isTrialUser) {
    return null; // Nur für Trial-Benutzer anzeigen
  }

  const { daysRemaining = 0, trialEndDate, hasTrialNotifications, notificationCount, licenseStatus } = trialStatus;

  const getStatusColor = () => {
    if (licenseStatus === 'inactive' || daysRemaining <= 0) return 'bg-red-100 text-red-800 border-red-200';
    if (daysRemaining <= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (daysRemaining <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusIcon = () => {
    if (licenseStatus === 'inactive' || daysRemaining <= 0) return <AlertTriangle className="h-4 w-4" />;
    if (daysRemaining <= 7) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (licenseStatus === 'inactive') return 'Trial abgelaufen';
    if (daysRemaining <= 0) return 'Trial läuft heute ab';
    if (daysRemaining === 1) return '1 Tag verbleibend';
    return `${daysRemaining} Tage verbleibend`;
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>Trial-Status</span>
          </div>
          {hasTrialNotifications && notificationCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              {notificationCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-sm">{getStatusText()}</p>
          {trialEndDate && (
            <p className="text-xs opacity-75">
              Ende: {new Date(trialEndDate).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>
        
        {daysRemaining <= 7 && licenseStatus === 'active' && (
          <div className="space-y-2">
            <p className="text-xs">
              Sichern Sie sich jetzt Ihren dauerhaften Zugang!
            </p>
            <Link href="/pricing">
              <Button size="sm" className="w-full">
                Jetzt upgraden
              </Button>
            </Link>
          </div>
        )}
        
        {licenseStatus === 'inactive' && (
          <div className="space-y-2">
            <p className="text-xs">
              Ihre Testversion ist abgelaufen. Upgraden Sie für den weiteren Zugang.
            </p>
            <Link href="/pricing">
              <Button size="sm" className="w-full" variant="destructive">
                Zugang wiederherstellen
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialStatusWidget;