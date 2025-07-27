import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  Send, 
  X, 
  Users, 
  FileText,
  Minimize2,
  Maximize2
} from "lucide-react";
import io, { Socket } from 'socket.io-client';

interface DocumentChatProps {
  documentId: number;
  documentName: string;
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface ChatMessage {
  id: number;
  userId: string;
  message: string;
  messageType: string;
  createdAt: string;
  userName?: string;
}

interface ChatRoom {
  id: number;
  type: string;
  documentId: number;
  name: string;
  description: string;
}

export function DocumentChat({ 
  documentId, 
  documentName, 
  onClose, 
  isMinimized = false, 
  onToggleMinimize 
}: DocumentChatProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.io connection
  useEffect(() => {
    if (!user?.externalId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const socketInstance = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('📄 Document chat connected');
      setIsConnected(true);
      
      // Authenticate
      socketInstance.emit('authenticate', { userId: user.externalId });
    });

    socketInstance.on('authenticated', () => {
      console.log('📄 Document chat authenticated');
      // Join document room
      socketInstance.emit('join_document_room', { documentId });
    });

    socketInstance.on('document_room_joined', (data: { room: ChatRoom; messages: ChatMessage[] }) => {
      console.log('📄 Joined document room:', data.room);
      setRoom(data.room);
      setMessages(data.messages || []);
    });

    socketInstance.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('disconnect', () => {
      console.log('📄 Document chat disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.externalId, documentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !room) return;

    socket.emit('send_message', {
      roomId: room.id,
      message: newMessage,
      messageType: 'text'
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {messages.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-red-500">
              {messages.length > 9 ? '9+' : messages.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 z-50 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium truncate">
              Chat: {documentName}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isConnected ? 'Verbunden' : 'Getrennt'}</span>
          <Users className="h-3 w-3 ml-2" />
          <span>{onlineUsers.length} online</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.userId === user?.externalId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    message.userId === user?.externalId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="font-medium text-xs mb-1">
                    {message.userId === user?.externalId ? 'Du' : message.userName || 'Unbekannt'}
                  </div>
                  <div>{message.message}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Noch keine Nachrichten zu diesem Dokument.
                <br />
                Starte die Diskussion!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht eingeben..."
              className="text-sm"
              disabled={!isConnected}
            />
            <Button
              onClick={sendMessage}
              size="sm"
              disabled={!newMessage.trim() || !isConnected}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}