import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { db } from './db';
import { chatRooms, chatMessages, chatRoomMembers, chatMessageReactions, users } from '@shared/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { emailService } from './emailService';
import type { 
  ChatRoom, 
  ChatMessage, 
  ChatRoomMember, 
  InsertChatRoom, 
  InsertChatMessage, 
  InsertChatRoomMember 
} from '@shared/schema';

export interface AuthenticatedSocket {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data: any) => void;
  to: (room: string) => any;
  broadcast: any;
  on: (event: string, callback: (data?: any) => void) => void;
}

export interface ChatService {
  io: SocketIOServer;
  setupSocketIO: (httpServer: HTTPServer) => void;
  handleConnection: (socket: AuthenticatedSocket) => void;
}

class ChatServiceImpl implements ChatService {
  public io!: SocketIOServer;

  setupSocketIO(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      path: '/socket.io',
      cors: {
        origin: [
          'http://localhost:5173',
          'https://bau-structura.com',
          'https://www.bau-structura.com',
          'https://bau-structura.de',
          'https://www.bau-structura.de',
          process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : ''
        ].filter(Boolean),
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket: any) => {
      console.log('🔌 Socket connected:', socket.id);
      this.handleConnection(socket as AuthenticatedSocket);
    });

    console.log('🚀 Socket.IO server initialized on /socket.io');
  }

  handleConnection(socket: AuthenticatedSocket): void {
    // Authentication middleware
    socket.on('authenticate', async (data: { userId: string; token?: string }) => {
      try {
        // In production, verify token here
        // For now, use session-based auth
        socket.userId = data.userId;
        socket.emit('authenticated', { success: true });
        
        // Join user to their personal room
        socket.join(`user_${data.userId}`);
        
        console.log(`✅ User ${data.userId} authenticated and joined personal room`);
      } catch (error) {
        socket.emit('authentication_error', { message: 'Authentication failed' });
      }
    });

    // Join document chat room
    socket.on('join_document_room', async (data: { documentId: number }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const roomName = `document_${data.documentId}`;
        socket.join(roomName);
        
        // Create or get document chat room
        let [room] = await db
          .select()
          .from(chatRooms)
          .where(and(
            eq(chatRooms.type, 'document'),
            eq(chatRooms.documentId, data.documentId)
          ));

        if (!room) {
          const newRoom: InsertChatRoom = {
            type: 'document',
            documentId: data.documentId,
            name: `Dokument ${data.documentId} Chat`,
            description: 'Dokumenten-bezogene Diskussion',
            createdBy: socket.userId
          };

          [room] = await db.insert(chatRooms).values(newRoom).returning();
        }

        // Add user as room member if not already
        const existingMember = await db
          .select()
          .from(chatRoomMembers)
          .where(and(
            eq(chatRoomMembers.roomId, room.id),
            eq(chatRoomMembers.userId, socket.userId)
          ));

        if (existingMember.length === 0) {
          const newMember: InsertChatRoomMember = {
            roomId: room.id,
            userId: socket.userId,
            role: 'member'
          };
          await db.insert(chatRoomMembers).values(newMember);
        }

        // Load recent messages
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.roomId, room.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(50);

        socket.emit('document_room_joined', { 
          room, 
          messages: messages.reverse() // Show oldest first
        });

        console.log(`📄 User ${socket.userId} joined document room ${data.documentId}`);
      } catch (error) {
        console.error('Error joining document room:', error);
        socket.emit('error', { message: 'Failed to join document room' });
      }
    });

    // Join project chat room
    socket.on('join_project_room', async (data: { projectId: number }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const roomName = `project_${data.projectId}`;
        socket.join(roomName);
        
        // Create or get project chat room
        let [room] = await db
          .select()
          .from(chatRooms)
          .where(and(
            eq(chatRooms.type, 'project'),
            eq(chatRooms.projectId, data.projectId)
          ));

        if (!room) {
          const newRoom: InsertChatRoom = {
            type: 'project',
            projectId: data.projectId,
            name: `Projekt ${data.projectId} Chat`,
            description: 'Projekt-bezogene Diskussion',
            createdBy: socket.userId
          };

          [room] = await db.insert(chatRooms).values(newRoom).returning();
        }

        // Add user as room member if not already
        const existingMember = await db
          .select()
          .from(chatRoomMembers)
          .where(and(
            eq(chatRoomMembers.roomId, room.id),
            eq(chatRoomMembers.userId, socket.userId)
          ));

        if (existingMember.length === 0) {
          const newMember: InsertChatRoomMember = {
            roomId: room.id,
            userId: socket.userId,
            role: 'member'
          };
          await db.insert(chatRoomMembers).values(newMember);
        }

        // Load recent messages
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.roomId, room.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(50);

        socket.emit('room_joined', { 
          room, 
          messages: messages.reverse() // Show oldest first
        });

        // Notify other room members
        socket.to(roomName).emit('user_joined_room', {
          userId: socket.userId,
          roomId: room.id
        });

        console.log(`👥 User ${socket.userId} joined project room ${data.projectId}`);
      } catch (error) {
        console.error('Error joining project room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Join support room
    socket.on('join_support_room', async () => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const roomName = 'support';
        socket.join(roomName);

        // Create or get support room
        let [room] = await db
          .select()
          .from(chatRooms)
          .where(eq(chatRooms.type, 'support'));

        if (!room) {
          const newRoom: InsertChatRoom = {
            type: 'support',
            name: 'Support Chat',
            description: 'Allgemeiner Support und Hilfe',
            createdBy: socket.userId
          };

          [room] = await db.insert(chatRooms).values(newRoom).returning();
        }

        // Add user as room member
        const existingMember = await db
          .select()
          .from(chatRoomMembers)
          .where(and(
            eq(chatRoomMembers.roomId, room.id),
            eq(chatRoomMembers.userId, socket.userId)
          ));

        if (existingMember.length === 0) {
          const newMember: InsertChatRoomMember = {
            roomId: room.id,
            userId: socket.userId,
            role: 'member'
          };
          await db.insert(chatRoomMembers).values(newMember);
        }

        // Load recent messages
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.roomId, room.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(50);

        socket.emit('room_joined', { 
          room, 
          messages: messages.reverse()
        });

        console.log(`🆘 User ${socket.userId} joined support room`);
      } catch (error) {
        console.error('Error joining support room:', error);
        socket.emit('error', { message: 'Failed to join support room' });
      }
    });

    // Send message
    socket.on('send_message', async (data: {
      roomId: number;
      message?: string;
      messageType?: 'text' | 'file' | 'image';
      fileName?: string;
      filePath?: string;
      fileSize?: number;
      mimeType?: string;
      replyToMessageId?: number;
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const newMessage: InsertChatMessage = {
          roomId: data.roomId,
          userId: socket.userId,
          message: data.message || '',
          messageType: data.messageType || 'text',
          fileName: data.fileName,
          filePath: data.filePath,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          replyToMessageId: data.replyToMessageId
        };

        const [message] = await db.insert(chatMessages).values(newMessage).returning();

        // Get room info to determine broadcast target
        const [room] = await db
          .select()
          .from(chatRooms)
          .where(eq(chatRooms.id, data.roomId));

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Broadcast to room members
        const roomName = room.type === 'project' ? `project_${room.projectId}` : room.type;
        this.io.to(roomName).emit('new_message', message);

        // Send email notification for support messages
        if (room.type === 'support' && data.message) {
          await this.sendSupportChatNotification(socket.userId, data.message);
        }

        console.log(`💬 Message sent to room ${roomName} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Message reactions
    socket.on('react_to_message', async (data: {
      messageId: number;
      emoji: string;
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Toggle reaction
        const existingReaction = await db
          .select()
          .from(chatMessageReactions)
          .where(and(
            eq(chatMessageReactions.messageId, data.messageId),
            eq(chatMessageReactions.userId, socket.userId),
            eq(chatMessageReactions.emoji, data.emoji)
          ));

        if (existingReaction.length > 0) {
          // Remove reaction
          await db
            .delete(chatMessageReactions)
            .where(and(
              eq(chatMessageReactions.messageId, data.messageId),
              eq(chatMessageReactions.userId, socket.userId),
              eq(chatMessageReactions.emoji, data.emoji)
            ));
        } else {
          // Add reaction
          await db.insert(chatMessageReactions).values({
            messageId: data.messageId,
            userId: socket.userId,
            emoji: data.emoji
          });
        }

        // Get message to determine room
        const [message] = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.id, data.messageId));

        if (message) {
          const [room] = await db
            .select()
            .from(chatRooms)
            .where(eq(chatRooms.id, message.roomId));

          if (room) {
            const roomName = room.type === 'project' ? `project_${room.projectId}` : 
                           room.type === 'document' ? `document_${room.documentId}` :
                           room.type;
            this.io.to(roomName).emit('message_reaction_updated', {
              messageId: data.messageId,
              emoji: data.emoji,
              userId: socket.userId,
              action: existingReaction.length > 0 ? 'removed' : 'added'
            });
          }
        }
      } catch (error) {
        console.error('Error handling message reaction:', error);
        socket.emit('error', { message: 'Failed to update reaction' });
      }
    });

    // User typing indicators
    socket.on('typing_start', (data: { roomId: number }) => {
      if (socket.userId) {
        socket.broadcast.emit('user_typing', {
          userId: socket.userId,
          roomId: data.roomId,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', (data: { roomId: number }) => {
      if (socket.userId) {
        socket.broadcast.emit('user_typing', {
          userId: socket.userId,
          roomId: data.roomId,
          isTyping: false
        });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id, 'User:', socket.userId);
    });
  }

  private async sendSupportChatNotification(userId: string, message: string): Promise<void> {
    try {
      // Get user info
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.externalId, userId));

      if (!user) {
        console.error('User not found for support chat notification:', userId);
        return;
      }

      const emailData = {
        to: 'lea.zimmer@gmx.net',
        subject: `Neue Support-Chat-Nachricht von ${user.email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Neue Support-Chat-Nachricht</h2>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #555; margin: 0 0 10px 0;">Benutzer:</h3>
              <p style="margin: 0; font-weight: bold;">${user.email}</p>
            </div>
            
            <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #555; margin: 0 0 10px 0;">Nachricht:</h3>
              <p style="margin: 0; line-height: 1.6;">${message}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Diese E-Mail wurde automatisch vom Bau-Structura Support-Chat-System generiert.
            </p>
          </div>
        `,
        text: `
Neue Support-Chat-Nachricht

Benutzer: ${user.email}

Nachricht:
${message}

Diese E-Mail wurde automatisch vom Bau-Structura Support-Chat-System generiert.
        `.trim()
      };

      await emailService.sendEmail(emailData);
      console.log(`📧 Support-Chat-Benachrichtigung an lea.zimmer@gmx.net gesendet für Nachricht von ${user.email}`);
    } catch (error) {
      console.error('Fehler beim Senden der Support-Chat-Benachrichtigung:', error);
    }
  }
}

export const chatService = new ChatServiceImpl();