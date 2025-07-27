import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ChatMessage {
  id: number;
  roomId: number;
  userId: string;
  message?: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  isEdited: boolean;
  editedAt?: Date;
  replyToMessageId?: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    externalId: string;
    email: string;
    displayName?: string;
  };
}

export interface ChatRoom {
  id: number;
  type: 'project' | 'support' | 'direct';
  projectId?: number;
  name?: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  unreadCount?: number;
}

export interface ChatUser {
  userId: string;
  isTyping: boolean;
}

export const useChat = (projectId?: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize socket connection
  useEffect(() => {
    if (!user?.externalId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log('🔌 Connecting to Socket.IO:', wsUrl);
    
    const newSocket = io(wsUrl, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      setConnected(true);
      setError(null);
      
      // Authenticate with server
      newSocket.emit('authenticate', { userId: user.externalId });
    });

    newSocket.on('authenticated', (data) => {
      console.log('🔐 Socket.IO authenticated:', data);
    });

    newSocket.on('authentication_error', (data) => {
      console.error('❌ Socket.IO authentication failed:', data);
      setError('Authentifizierung fehlgeschlagen');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      setConnected(false);
      
      // Auto-reconnect after 5 seconds
      if (reason === 'io server disconnect') {
        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect();
        }, 5000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setError('Verbindungsfehler');
      setConnected(false);
    });

    newSocket.on('room_joined', (data: { room: ChatRoom; messages: ChatMessage[] }) => {
      console.log('🏠 Joined room:', data.room);
      setCurrentRoom(data.room);
      setMessages(data.messages);
    });

    newSocket.on('new_message', (message: ChatMessage) => {
      console.log('💬 New message:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_joined_room', (data: { userId: string; roomId: number }) => {
      console.log('👥 User joined room:', data);
      // Could show notification or update UI
    });

    newSocket.on('user_typing', (data: { userId: string; roomId: number; isTyping: boolean }) => {
      if (data.userId === user.externalId) return; // Don't show own typing
      
      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add or update typing user
          const existing = prev.find(u => u.userId === data.userId);
          if (existing) return prev;
          return [...prev, { userId: data.userId, isTyping: true }];
        } else {
          // Remove typing user
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    newSocket.on('message_reaction_updated', (data: {
      messageId: number;
      emoji: string;
      userId: string;
      action: 'added' | 'removed';
    }) => {
      console.log('👍 Message reaction updated:', data);
      // Update message reactions in UI
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('❌ Socket.IO error:', data);
      toast({
        title: "Chat-Fehler",
        description: data.message,
        variant: "destructive"
      });
    });

    setSocket(newSocket);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.disconnect();
    };
  }, [user?.externalId, toast]);

  // Join project room automatically if projectId is provided
  useEffect(() => {
    if (socket && connected && projectId && user?.externalId) {
      joinProjectRoom(projectId);
    }
  }, [socket, connected, projectId, user?.externalId]);

  const joinProjectRoom = useCallback((projectId: number) => {
    if (!socket || !connected) return;
    
    setLoading(true);
    socket.emit('join_project_room', { projectId });
  }, [socket, connected]);

  const joinSupportRoom = useCallback(() => {
    if (!socket || !connected) return;
    
    setLoading(true);
    socket.emit('join_support_room');
  }, [socket, connected]);

  const sendMessage = useCallback((
    message: string,
    messageType: 'text' | 'file' | 'image' = 'text',
    fileData?: {
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
    }
  ) => {
    if (!socket || !connected || !currentRoom) return;

    const messageData = {
      roomId: currentRoom.id,
      message: messageType === 'text' ? message : '',
      messageType,
      ...fileData
    };

    socket.emit('send_message', messageData);
  }, [socket, connected, currentRoom]);

  const startTyping = useCallback(() => {
    if (!socket || !connected || !currentRoom) return;
    
    socket.emit('typing_start', { roomId: currentRoom.id });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, connected, currentRoom]);

  const stopTyping = useCallback(() => {
    if (!socket || !connected || !currentRoom) return;
    
    socket.emit('typing_stop', { roomId: currentRoom.id });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [socket, connected, currentRoom]);

  const reactToMessage = useCallback((messageId: number, emoji: string) => {
    if (!socket || !connected) return;
    
    socket.emit('react_to_message', { messageId, emoji });
  }, [socket, connected]);

  const leaveRoom = useCallback(() => {
    if (!socket || !connected || !currentRoom) return;
    
    // Leave current room (Socket.IO handles this automatically when joining new room)
    setCurrentRoom(null);
    setMessages([]);
    setTypingUsers([]);
  }, [socket, connected, currentRoom]);

  return {
    // Connection state
    connected,
    loading,
    error,
    
    // Room state
    currentRoom,
    messages,
    typingUsers,
    
    // Actions
    joinProjectRoom,
    joinSupportRoom,
    sendMessage,
    startTyping,
    stopTyping,
    reactToMessage,
    leaveRoom
  };
};