import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { HardDrive, FileText, Image, Music, Archive } from "lucide-react";

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: {
    images: number;
    documents: number;
    audio: number;
    archives: number;
    others: number;
  };
  sizeByType: {
    images: number;
    documents: number;
    audio: number;
    archives: number;
    others: number;
  };
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function StorageOverview() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery<StorageStats>({
    queryKey: ["/api/storage/stats"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Speicher-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const maxStorage = 1024 * 1024 * 1024; // 1GB
  const usagePercent = (stats.totalSize / maxStorage) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Speicher-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gesamt-Speicherverbrauch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Speicherplatz belegt</span>
            <span className="font-medium">
              {formatFileSize(stats.totalSize)} / 1 GB
            </span>
          </div>
          <Progress value={Math.min(usagePercent, 100)} className="h-2" />
          <p className="text-xs text-gray-500">
            {stats.totalFiles} Dateien gespeichert
          </p>
        </div>

        {/* Status-Anzeige */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-800 font-medium">
              Lokaler Speicher aktiv
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            SFTP-Server wird eingerichtet für erweiterte Funktionen
          </p>
        </div>

        {/* Dateityp-Aufschlüsselung */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <Image className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs font-medium text-green-800">Bilder</p>
              <p className="text-xs text-green-600">{stats.filesByType.images}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs font-medium text-blue-800">Dokumente</p>
              <p className="text-xs text-blue-600">{stats.filesByType.documents}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
            <Music className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs font-medium text-purple-800">Audio</p>
              <p className="text-xs text-purple-600">{stats.filesByType.audio}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <Archive className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-xs font-medium text-yellow-800">Archive</p>
              <p className="text-xs text-yellow-600">{stats.filesByType.archives}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}