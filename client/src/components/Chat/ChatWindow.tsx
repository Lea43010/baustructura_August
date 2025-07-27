import React, { useState, useRef, useEffect } from 'react';
import { useChat, ChatMessage } from '../../hooks/useChat';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Smile, Users, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatWindowProps {
  projectId?: number;
  title?: string;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  projectId,
  title = 'Chat',
  className = ''
}) => {
  const {
    connected,
    loading,
    error,
    currentRoom,
    messages,
    typingUsers,
    joinProjectRoom,
    joinSupportRoom,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat(projectId);

  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join appropriate room based on props
  useEffect(() => {
    if (connected && !loading) {
      if (projectId) {
        joinProjectRoom(projectId);
      } else {
        joinSupportRoom();
      }
    }
  }, [connected, loading, projectId, joinProjectRoom, joinSupportRoom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !connected) return;

    sendMessage(messageInput.trim());
    setMessageInput('');
    
    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      stopTyping();
    }
  };

  const getMessageTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: de 
      });
    } catch {
      return 'gerade eben';
    }
  };

  const getUserInitials = (email?: string, displayName?: string) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  if (error) {
    return (
      <Card className={`h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">Verbindungsfehler</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-96 flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{currentRoom?.name || title}</span>
          <div className="flex items-center space-x-2">
            {connected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Chat
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-pulse text-sm text-gray-500">
                Lade Chat-Raum...
              </div>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500 mb-2">
                Noch keine Nachrichten
              </div>
              <p className="text-xs text-gray-400">
                Schreiben Sie die erste Nachricht!
              </p>
            </div>
          )}

          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === currentRoom?.createdBy 
                    ? 'justify-end' 
                    : 'justify-start'
                }`}
              >
                <div className={`flex max-w-[70%] ${
                  message.userId === currentRoom?.createdBy 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                }`}>
                  <Avatar className="h-8 w-8 mx-2">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(message.user?.email, message.user?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    message.userId === currentRoom?.createdBy
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {message.messageType === 'text' && (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>
                    )}
                    
                    {message.messageType === 'file' && (
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{message.fileName}</span>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 opacity-75 ${
                      message.userId === currentRoom?.createdBy
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}>
                      {getMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs">
                    {typingUsers.length === 1 ? 'tippt...' : 'mehrere tippen...'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={messageInput}
            onChange={handleInputChange}
            placeholder={connected ? "Nachricht schreiben..." : "Nicht verbunden"}
            disabled={!connected || loading}
            className="flex-1"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!connected}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!connected}
            className="shrink-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button
            type="submit"
            disabled={!connected || !messageInput.trim()}
            size="sm"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};