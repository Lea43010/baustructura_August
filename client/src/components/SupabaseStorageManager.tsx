import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, Trash2, FileText, Image, Music, Video, Archive, AlertCircle, CheckCircle, Cloud, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StorageFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageProvider: 'supabase' | 'local';
  createdAt: string;
  externalUrl?: string;
  filePath?: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  usedSpace: number;
  availableSpace: number;
}

interface SupabaseStorageManagerProps {
  projectId?: number;
  className?: string;
}

export default function SupabaseStorageManager({ projectId, className }: SupabaseStorageManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch files from Supabase Storage
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['storage', 'files', projectId],
    queryFn: () => apiRequest(`/api/storage/files${projectId ? `?projectId=${projectId}` : ''}`)
  });

  // Fetch storage statistics
  const { data: stats, isLoading: statsLoading } = useQuery<StorageStats>({
    queryKey: ['storage', 'stats'],
    queryFn: () => apiRequest('/api/storage/stats')
  });

  // Test storage connection
  const { data: connectionTest } = useQuery({
    queryKey: ['storage', 'test'],
    queryFn: () => apiRequest('/api/storage/test'),
    refetchInterval: 30000 // Test every 30 seconds
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) {
        formData.append('projectId', projectId.toString());
      }

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        setTimeout(() => setUploadProgress(0), 1000);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Upload erfolgreich",
        description: `${data.file.name} wurde hochgeladen via ${data.file.provider}`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['storage'] });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Unbekannter Fehler beim Hochladen",
        variant: "destructive"
      });
    }
  });

  const getFileIcon = (mimeType: string, size: number = 20) => {
    if (mimeType.startsWith('image/')) return <Image size={size} className="text-green-600" />;
    if (mimeType.startsWith('audio/')) return <Music size={size} className="text-purple-600" />;
    if (mimeType.startsWith('video/')) return <Video size={size} className="text-red-600" />;
    if (mimeType === 'application/pdf') return <FileText size={size} className="text-red-600" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive size={size} className="text-yellow-600" />;
    return <FileText size={size} className="text-blue-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  if (filesLoading || statsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Supabase Storage wird geladen...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filesList = files?.files || [];
  const storageStats = stats || { totalFiles: 0, totalSize: 0, usedSpace: 0, availableSpace: 5 * 1024 * 1024 * 1024 };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connectionTest?.provider === 'Supabase Storage' ? (
            <>
              <Cloud className="w-5 h-5 text-green-600" />
              <span>Supabase Storage</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verbunden
              </Badge>
            </>
          ) : (
            <>
              <HardDrive className="w-5 h-5 text-orange-600" />
              <span>Lokaler Speicher</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Fallback
              </Badge>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {connectionTest?.message || 'Storage-Service wird getestet...'}
          {projectId && ` • Projekt ${projectId}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Statistics */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Speicher verwendet</span>
            <span>{formatFileSize(storageStats.usedSpace)} / {formatFileSize(storageStats.availableSpace)}</span>
          </div>
          <Progress 
            value={(storageStats.usedSpace / storageStats.availableSpace) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{storageStats.totalFiles} Dateien</span>
            <span>{formatFileSize(storageStats.availableSpace - storageStats.usedSpace)} verfügbar</span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600 mt-2">Datei auswählen oder hierher ziehen</p>
          </div>
          
          <Input
            type="file"
            onChange={handleFileSelect}
            disabled={uploadMutation.isPending}
          />
          
          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.type)}
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">({formatFileSize(selectedFile.size)})</span>
              </div>
              <Button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                size="sm"
              >
                {uploadMutation.isPending ? 'Hochladen...' : 'Hochladen'}
              </Button>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-gray-600">{uploadProgress}% hochgeladen</p>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Dateien ({filesList.length})</h3>
          
          {filesList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p>Keine Dateien vorhanden</p>
              <p className="text-xs">Laden Sie Ihre erste Datei hoch</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filesList.map((file: StorageFile) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <Badge variant="outline" size="sm">
                          {file.storageProvider === 'supabase' ? (
                            <><Cloud className="w-3 h-3 mr-1" />Supabase</>
                          ) : (
                            <><HardDrive className="w-3 h-3 mr-1" />Lokal</>
                          )}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.externalUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.externalUrl, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/download/${file.id}`, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}