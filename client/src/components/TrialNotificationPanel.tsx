import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TrialNotification {
  id: number;
  userId: string;
  notificationType: string;
  status: 'sent' | 'failed' | 'pending';
  trialEndDate: string;
  emailMessageId?: string;
  sentAt?: string;
  errorMessage?: string;
}

interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  last24h: number;
}

interface TrialNotificationData {
  notifications: TrialNotification[];
  stats: NotificationStats;
}

const TrialNotificationPanel = () => {
  const queryClient = useQueryClient();
  const [isManualCheck, setIsManualCheck] = useState(false);

  const { data, isLoading, error } = useQuery<TrialNotificationData>({
    queryKey: ['/api/admin/trial-notifications'],
    refetchInterval: 30000, // Auto-refresh alle 30 Sekunden
  });

  const checkNotificationsMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/trial-notifications/check', 'POST'),
    onSuccess: (result) => {
      console.log('✅ Trial notification check completed:', result);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trial-notifications'] });
      setIsManualCheck(false);
    },
    onError: (error) => {
      console.error('❌ Trial notification check failed:', error);
      setIsManualCheck(false);
    }
  });

  const handleManualCheck = () => {
    setIsManualCheck(true);
    checkNotificationsMutation.mutate();
  };

  const formatNotificationType = (type: string) => {
    switch (type) {
      case '14_days_warning': return '14 Tage Warnung';
      case '7_days_warning': return '7 Tage Warnung';
      case '1_day_warning': return '1 Tag Warnung';
      case 'expired': return 'Abgelaufen';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Lade Trial-Benachrichtigungen...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Fehler beim Laden der Trial-Benachrichtigungen</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.stats || { total: 0, sent: 0, failed: 0, last24h: 0 };
  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesendet</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fehlgeschlagen</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Letzte 24h</p>
                <p className="text-2xl font-bold text-orange-600">{stats.last24h}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manuelle Überprüfung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trial-Benachrichtigungen verwalten</span>
            <Button 
              onClick={handleManualCheck}
              disabled={isManualCheck || checkNotificationsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(isManualCheck || checkNotificationsMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Benachrichtigungen prüfen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Das System prüft automatisch alle 12 Stunden nach fälligen Trial-Benachrichtigungen.
            Sie können auch manuell eine Überprüfung starten.
          </p>
        </CardContent>
      </Card>

      {/* Benachrichtigungshistorie */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungshistorie</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Benachrichtigungen vorhanden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(notification.status)}
                    <div>
                      <p className="font-medium">
                        {formatNotificationType(notification.notificationType)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Trial Ende: {new Date(notification.trialEndDate).toLocaleDateString('de-DE')}
                      </p>
                      {notification.sentAt && (
                        <p className="text-xs text-gray-500">
                          Gesendet: {new Date(notification.sentAt).toLocaleString('de-DE')}
                        </p>
                      )}
                      {notification.errorMessage && (
                        <p className="text-xs text-red-500">
                          Fehler: {notification.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(notification.status)}>
                      {notification.status === 'sent' ? 'Gesendet' :
                       notification.status === 'failed' ? 'Fehlgeschlagen' : 'Ausstehend'}
                    </Badge>
                    {notification.emailMessageId && (
                      <Badge variant="outline" className="text-xs">
                        ID: {notification.emailMessageId.substring(0, 8)}...
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialNotificationPanel;