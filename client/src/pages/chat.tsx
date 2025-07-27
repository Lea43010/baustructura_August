import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  HelpCircle, 
  Settings,
  ArrowLeft
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
}

interface ChatRoomListItem {
  room: {
    id: number;
    type: 'project' | 'support' | 'direct';
    projectId?: number;
    name?: string;
    description?: string;
    createdAt: string;
  };
  project?: Project;
  unreadCount: number;
}

export default function ChatPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/chat/:projectId?');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    params?.projectId ? parseInt(params.projectId) : undefined
  );
  const [activeTab, setActiveTab] = useState<'rooms' | 'support' | 'direct'>('rooms');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's chat rooms
  const { data: chatRooms, isLoading: roomsLoading } = useQuery<ChatRoomListItem[]>({
    queryKey: ['/api/chat/rooms'],
    enabled: true,
  });

  // Fetch user's projects for creating project-based chats
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  const filteredRooms = chatRooms?.filter(item => {
    if (!searchTerm) return true;
    const roomName = item.room.name || `Projekt ${item.project?.name || item.room.projectId}`;
    return roomName.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleRoomSelect = (projectId?: number) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      setLocation(`/chat/${projectId}`);
    } else {
      setLocation('/chat');
    }
  };

  const handleBackToList = () => {
    setSelectedProjectId(undefined);
    setLocation('/chat');
  };

  const projectChatRooms = filteredRooms.filter(item => item.room.type === 'project');
  const supportChatRooms = filteredRooms.filter(item => item.room.type === 'support');
  const directChatRooms = filteredRooms.filter(item => item.room.type === 'direct');

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        
        {/* Chat Rooms List */}
        <div className={`lg:col-span-1 ${selectedProjectId !== undefined ? 'hidden lg:block' : ''}`}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat-Räume
                </span>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Neu
                </Button>
              </CardTitle>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Chat-Räume durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="rooms" className="text-xs">
                    Projekte ({projectChatRooms.length})
                  </TabsTrigger>
                  <TabsTrigger value="support" className="text-xs">
                    Support ({supportChatRooms.length})
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="text-xs">
                    Direkt ({directChatRooms.length})
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto h-full">
                  <TabsContent value="rooms" className="space-y-2 mt-0">
                    {roomsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse text-sm text-gray-500">
                          Lade Chat-Räume...
                        </div>
                      </div>
                    ) : projectChatRooms.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm text-gray-500 mb-4">
                          Noch keine Projekt-Chats
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                          Projekt-Chats werden automatisch erstellt, wenn Sie einen Chat in einem Projekt starten.
                        </p>
                      </div>
                    ) : (
                      projectChatRooms.map((item) => (
                        <div
                          key={item.room.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            selectedProjectId === item.room.projectId 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => handleRoomSelect(item.room.projectId)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm mb-1 truncate">
                                {item.room.name || `Projekt ${item.project?.name || item.room.projectId}`}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                {item.room.description || item.project?.description || 'Projekt-Chat'}
                              </p>
                              <div className="flex items-center mt-2">
                                <Badge variant="secondary" className="text-xs mr-2">
                                  Projekt
                                </Badge>
                                {item.project && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {item.project.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {item.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {item.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="support" className="space-y-2 mt-0">
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedProjectId === undefined 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleRoomSelect(undefined)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1 flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Support & Hilfe
                          </h3>
                          <p className="text-xs text-gray-500">
                            Allgemeiner Support-Chat für Fragen und Hilfestellungen
                          </p>
                          <Badge variant="secondary" className="text-xs mt-2">
                            Support
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="direct" className="space-y-2 mt-0">
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm text-gray-500 mb-2">
                        Direkte Nachrichten
                      </p>
                      <p className="text-xs text-gray-400">
                        Feature wird bald verfügbar sein
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className={`lg:col-span-2 ${selectedProjectId === undefined && activeTab !== 'support' ? 'hidden lg:block' : ''}`}>
          {selectedProjectId !== undefined || activeTab === 'support' ? (
            <div className="h-full flex flex-col">
              {/* Mobile header with back button */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToList}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zu Chat-Räumen
                </Button>
              </div>
              
              <ChatWindow
                projectId={selectedProjectId}
                title={selectedProjectId ? 'Projekt-Chat' : 'Support-Chat'}
                className="h-full"
              />
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                <h2 className="text-xl font-semibold mb-2">
                  Willkommen im Chat-System
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Wählen Sie einen Chat-Raum aus der linken Liste oder starten Sie den Support-Chat, 
                  um mit der Kommunikation zu beginnen.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setActiveTab('support')}
                    className="w-full max-w-xs"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Support-Chat öffnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}