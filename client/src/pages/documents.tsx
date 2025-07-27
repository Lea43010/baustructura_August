import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentChat } from "@/components/chat/document-chat";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  FileText,
  Image,
  Music,
  FileArchive,
  Eye,
  Download,
  Plus,
  FolderPlus,
  Calendar,
  Folder,
  Trash2,
  MessageCircle
} from "lucide-react";

// Interfaces
interface UserDocument {
  id: number;
  fileName: string;
  name: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  type: "image" | "audio" | "pdf" | "document" | "archive";
  size: string;
  uploadDate: string;
  projectId?: number;
  projectName?: string;
  category: "photos" | "audio" | "plans" | "documents" | "other";
  url?: string;
  thumbnail?: string;
  sftpPath?: string;
  uploadedBy?: string;
  createdAt?: string;
}

// Helper functions
const getFileType = (mimeTypeOrFileName?: string): "image" | "audio" | "pdf" | "document" | "archive" => {
  if (!mimeTypeOrFileName) return 'document';
  if (mimeTypeOrFileName.startsWith('image/')) return 'image';
  if (mimeTypeOrFileName.startsWith('audio/')) return 'audio';
  if (mimeTypeOrFileName.includes('pdf')) return 'pdf';
  if (mimeTypeOrFileName.includes('zip') || mimeTypeOrFileName.includes('rar') || mimeTypeOrFileName.includes('tar')) return 'archive';
  return 'document';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getCategoryFromType = (mimeTypeOrFileName?: string): "photos" | "audio" | "plans" | "documents" | "other" => {
  if (!mimeTypeOrFileName) return 'other';
  if (mimeTypeOrFileName.startsWith('image/')) return 'photos';
  if (mimeTypeOrFileName.startsWith('audio/')) return 'audio';
  if (mimeTypeOrFileName.includes('pdf') || mimeTypeOrFileName.includes('plan') || mimeTypeOrFileName.includes('drawing')) return 'plans';
  if (mimeTypeOrFileName.includes('doc') || mimeTypeOrFileName.includes('txt')) return 'documents';
  return 'other';
};

export default function Documents() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTab, setSelectedTab] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch {
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });
  
  // Document Chat State
  const [activeChatDocument, setActiveChatDocument] = useState<{ id: number; name: string } | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  // Project Selection State
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Fetch documents from API with proper error handling
  const { data: attachments = [], isLoading, error } = useQuery({
    queryKey: ["/api/attachments"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/attachments", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        console.log("📁 API Response:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.log("No documents found yet - this is normal for new users");
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  // Convert database attachments to UserDocument format
  const userDocuments: UserDocument[] = attachments.map((attachment: any) => {
    console.log("📁 Processing attachment:", attachment);
    
    // Datum richtig formatieren
    let formattedDate = 'Unbekanntes Datum';
    if (attachment.createdAt) {
      try {
        const date = new Date(attachment.createdAt);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('de-DE');
        }
      } catch (error) {
        console.log("Datum konnte nicht formatiert werden:", attachment.createdAt);
      }
    }
    
    return {
      id: attachment.id,
      fileName: attachment.fileName || 'Unbekannte Datei',
      filePath: attachment.filePath || '',
      fileSize: attachment.fileSize || 0,
      mimeType: attachment.mimeType || 'application/octet-stream',
      name: attachment.fileName || 'Unbekannte Datei',
      type: getFileType(attachment.mimeType || attachment.fileName),
      size: formatFileSize(attachment.fileSize || 0),
      uploadDate: formattedDate,
      projectId: attachment.projectId || null,
      projectName: attachment.projectName || null,
      category: getCategoryFromType(attachment.mimeType || attachment.fileName),
      sftpPath: attachment.sftpPath || '',
      uploadedBy: attachment.uploadedBy || '',
      createdAt: attachment.createdAt || new Date().toISOString()
    };
  });

  // Filter documents
  const filteredDocuments = userDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.projectName && doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesTab = selectedTab === "all" || doc.category === selectedTab;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Upload mutation - vereinfacht zu einem einzigen API-Call
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; projectId?: number }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      // Verwende selectedProjectId wenn keine spezifische projectId übergeben wird
      const projectIdToUse = data.projectId || selectedProjectId;
      if (projectIdToUse) {
        formData.append("projectId", String(projectIdToUse));
      }
      
      console.log('📤 Starte Upload:', data.file.name, data.file.size, 'bytes');
      
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload fehlgeschlagen:', response.status, errorText);
        throw new Error(`Upload fehlgeschlagen: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload erfolgreich:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 Upload-Response:', data);
      const isLocal = data.storage === 'local';
      toast({
        title: "Upload erfolgreich!",
        description: `${data.fileName} wurde erfolgreich hochgeladen (${data.storage}).`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attachments"] });
    },
    onError: (error) => {
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Das Dokument konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest(`/api/attachments/${documentId}`, "DELETE");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dokument gelöscht",
        description: "Das Dokument wurde erfolgreich entfernt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attachments"] });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast({
        title: "Fehler",
        description: error?.message || "Das Dokument konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const categories = ["all", "photos", "audio", "plans", "documents", "other"];

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Bulk-Upload für mehrere Dateien
      Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist größer als 10MB`,
            variant: "destructive",
          });
          return;
        }
        
        console.log('📤 Uploading file:', file.name, file.size, 'bytes', selectedProjectId ? `to project ${selectedProjectId}` : 'without project');
        uploadMutation.mutate({ file, projectId: selectedProjectId || undefined });
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist größer als 10MB`,
            variant: "destructive",
          });
          return;
        }
        
        console.log('📤 Drag & Drop Upload:', file.name, file.size, 'bytes', selectedProjectId ? `to project ${selectedProjectId}` : 'without project');
        uploadMutation.mutate({ file, projectId: selectedProjectId || undefined });
      });
    }
  };

  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Möchten Sie dieses Dokument wirklich löschen?")) {
      deleteMutation.mutate(documentId);
    }
  };

  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/download/${documentId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download erfolgreich",
        description: `${fileName} wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download fehlgeschlagen",
        description: error instanceof Error ? error.message : "Datei konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-5 w-5 text-green-600" />;
      case "audio": return <Music className="h-5 w-5 text-purple-600" />;
      case "pdf": return <FileText className="h-5 w-5 text-red-600" />;
      case "document": return <FileText className="h-5 w-5 text-blue-600" />;
      case "archive": return <FileArchive className="h-5 w-5 text-yellow-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-green-100 text-green-800";
      case "audio": return "bg-purple-100 text-purple-800";
      case "pdf": return "bg-red-100 text-red-800";
      case "document": return "bg-blue-100 text-blue-800";
      case "archive": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Meine Dokumente</h1>
          </div>
        </div>
      </PageHeader>
      
      <div className="container mx-auto px-4 py-6">
        
        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Fehler beim Laden der Dokumente
                </h3>
                <p className="text-red-700 mb-4">
                  Die Dokumente konnten nicht geladen werden. Bitte versuchen Sie es erneut.
                </p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/attachments"] })}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Erneut versuchen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Kompakte Upload-Leiste */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button 
            onClick={handleFileUpload}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? "Upload läuft..." : "Dateien hochladen"}
          </Button>
          
          {/* Projekt-Auswahl */}
          {projects.length > 0 && (
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Kein Projekt zuordnen</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg flex-1">
            <span className="font-medium">Speicher:</span>
            <span className="text-blue-600">
              {formatFileSize(userDocuments.reduce((total, doc) => total + (doc.fileSize || 0), 0))} / 1 GB
            </span>
            <div className="w-16 h-1.5 bg-blue-200 rounded-full ml-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ 
                  width: `${Math.min((userDocuments.reduce((total, doc) => total + (doc.fileSize || 0), 0) / (1024 * 1024 * 1024)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            className="hidden"
          />
        </div>
        
        {uploadMutation.isPending && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse w-24"></div>
              <span className="text-sm text-green-700">Datei wird verarbeitet...</span>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Dokumente durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>



        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Dokumente werden geladen...</p>
          </div>
        )}

        {/* Empty State für neue Nutzer */}
        {!isLoading && !error && userDocuments.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="bg-blue-100 rounded-full p-8 mb-6 inline-block">
                  <FileText className="h-20 w-20 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Willkommen in Ihrem Dokumentenbereich!
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Hier können Sie alle wichtigen Dateien für Ihre Bauprojekte verwalten: 
                  Fotos von Baustellen, Baupläne, Sprachaufnahmen, Berichte und andere Dokumente.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Verwenden Sie den grünen SFTP-Upload-Button oben, um Ihr erstes Dokument hochzuladen.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p><strong>Unterstützte Dateiformate:</strong></p>
                    <p>📷 Bilder (JPG, PNG, GIF)</p>
                    <p>🎵 Audio (MP3, WAV, M4A)</p>
                    <p>📄 Dokumente (PDF, DOC, XLS)</p>
                    <p>📦 Archive (ZIP, RAR)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State für gefilterte Ergebnisse */}
        {!isLoading && !error && userDocuments.length > 0 && filteredDocuments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-sm mx-auto">
                <div className="bg-gray-100 rounded-full p-6 mb-4 inline-block">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Keine passenden Dokumente gefunden
                </h3>
                <p className="text-gray-600 mb-4">
                  Versuchen Sie andere Suchbegriffe oder ändern Sie die Filtereinstellungen.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedTab("all");
                  }}
                  variant="outline"
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Display - Grid View */}
        {!isLoading && !error && filteredDocuments.length > 0 && viewMode === "grid" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500">{doc.uploadDate}</p>
                      </div>
                    </div>

                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="secondary" className={getTypeColor(doc.type)}>
                        {doc.type.toUpperCase()}
                      </Badge>
                      <span className="text-gray-500">{doc.size}</span>
                    </div>
                    
                    {doc.projectName && (
                      <p className="text-xs text-blue-600 truncate">
                        📁 {doc.projectName}
                      </p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {doc.uploadDate}
                    </div>
                    
                    <div className="flex space-x-1 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setActiveChatDocument({ id: doc.id, name: doc.name });
                          setIsChatMinimized(false);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Documents Display - List View */}
        {!isLoading && !error && filteredDocuments.length > 0 && viewMode === "list" && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {filteredDocuments.map((doc, index) => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                      index !== filteredDocuments.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{doc.size}</span>
                          <span>{doc.uploadDate}</span>
                          {doc.projectName && (
                            <span className="text-blue-600">📁 {doc.projectName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getTypeColor(doc.type)}>
                        {doc.type.toUpperCase()}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setActiveChatDocument({ id: doc.id, name: doc.name });
                          setIsChatMinimized(false);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{userDocuments.length}</p>
                <p className="text-xs text-gray-600">Gesamt</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Image className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userDocuments.filter(d => d.type === "image").length}
                </p>
                <p className="text-xs text-gray-600">Fotos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userDocuments.filter(d => d.type === "audio").length}
                </p>
                <p className="text-xs text-gray-600">Audio</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userDocuments.filter(d => d.type === "pdf" || d.type === "document").length}
                </p>
                <p className="text-xs text-gray-600">Dokumente</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Document Chat Integration */}
      {activeChatDocument && (
        <DocumentChat
          documentId={activeChatDocument.id}
          documentName={activeChatDocument.name}
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
          onClose={() => {
            setActiveChatDocument(null);
            setIsChatMinimized(false);
          }}
        />
      )}
    </AppLayout>
  );
}