import { Router } from 'express';
import { db } from '../db';
import { chatRooms, chatMessages, chatRoomMembers, users, projects } from '@shared/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { isAuthenticated } from '../localAuth';
import type { ChatRoom, ChatMessage, ChatRoomMember } from '@shared/schema';

export const chatRouter = Router();

// Get all chat rooms for a user
chatRouter.get('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get rooms where user is a member
    const userRooms = await db
      .select({
        room: chatRooms,
        member: chatRoomMembers,
        project: projects,
        unreadCount: sql<number>`COUNT(CASE WHEN ${chatMessages.createdAt} > ${chatRoomMembers.lastSeenAt} THEN 1 END)`.as('unreadCount')
      })
      .from(chatRooms)
      .innerJoin(chatRoomMembers, eq(chatRoomMembers.roomId, chatRooms.id))
      .leftJoin(projects, eq(projects.id, chatRooms.projectId))
      .leftJoin(chatMessages, eq(chatMessages.roomId, chatRooms.id))
      .where(eq(chatRoomMembers.userId, userId))
      .groupBy(chatRooms.id, chatRoomMembers.id, projects.id);

    res.json({ rooms: userRooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

// Get messages for a specific room
chatRouter.get('/api/chat/rooms/:roomId/messages', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user is a member of the room
    const membership = await db
      .select()
      .from(chatRoomMembers)
      .where(and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      ));

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not authorized to access this room' });
    }

    // Get messages with user info
    const messages = await db
      .select({
        message: chatMessages,
        user: {
          externalId: users.externalId,
          email: users.email,
          displayName: users.displayName
        }
      })
      .from(chatMessages)
      .innerJoin(users, eq(users.externalId, chatMessages.userId))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);

    // Update last read message
    await db
      .update(chatRoomMembers)
      .set({ 
        lastSeenAt: new Date(),
        lastReadMessageId: messages.length > 0 ? messages[0].message.id : undefined
      })
      .where(and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      ));

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new project-based chat room
chatRouter.post('/api/chat/rooms/project/:projectId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    const projectId = parseInt(req.params.projectId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if room already exists
    const existingRoom = await db
      .select()
      .from(chatRooms)
      .where(and(
        eq(chatRooms.type, 'project'),
        eq(chatRooms.projectId, projectId)
      ));

    if (existingRoom.length > 0) {
      return res.json({ room: existingRoom[0] });
    }

    // Get project info
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create new room
    const [newRoom] = await db
      .insert(chatRooms)
      .values({
        type: 'project',
        projectId,
        name: `${project[0].name} - Projekt-Chat`,
        description: `Chat-Raum für Projekt: ${project[0].name}`,
        createdBy: userId
      })
      .returning();

    // Add creator as admin member
    await db.insert(chatRoomMembers).values({
      roomId: newRoom.id,
      userId,
      role: 'admin'
    });

    res.json({ room: newRoom });
  } catch (error) {
    console.error('Error creating project chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// Join a chat room
chatRouter.post('/api/chat/rooms/:roomId/join', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(chatRoomMembers)
      .where(and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      ));

    if (existingMember.length > 0) {
      return res.json({ message: 'Already a member' });
    }

    // Add user as member
    await db.insert(chatRoomMembers).values({
      roomId,
      userId,
      role: 'member'
    });

    res.json({ message: 'Successfully joined room' });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room members
chatRouter.get('/api/chat/rooms/:roomId/members', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user is a member
    const membership = await db
      .select()
      .from(chatRoomMembers)
      .where(and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      ));

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get all members with user info
    const members = await db
      .select({
        member: chatRoomMembers,
        user: {
          externalId: users.externalId,
          email: users.email,
          displayName: users.displayName,
          role: users.role
        }
      })
      .from(chatRoomMembers)
      .innerJoin(users, eq(users.externalId, chatRoomMembers.userId))
      .where(eq(chatRoomMembers.roomId, roomId));

    res.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Upload file to chat
chatRouter.post('/api/chat/rooms/:roomId/upload', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user is a member
    const membership = await db
      .select()
      .from(chatRoomMembers)
      .where(and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      ));

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // This would integrate with the existing file upload system
    // For now, return success with placeholder data
    res.json({
      success: true,
      message: 'File upload functionality will be integrated with existing upload system'
    });
  } catch (error) {
    console.error('Error uploading file to chat:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete message (only author or room admin)
chatRouter.delete('/api/chat/messages/:messageId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = (req as any).user?.externalId;
    const messageId = parseInt(req.params.messageId);

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get message and check ownership
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId));

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is message author or room admin
    const isAuthor = message.userId === userId;
    const roomMembership = await db
      .select()
      .from(chatRoomMembers)
      .where(and(
        eq(chatRoomMembers.roomId, message.roomId),
        eq(chatRoomMembers.userId, userId)
      ));

    const isRoomAdmin = roomMembership.length > 0 && 
                      (roomMembership[0].role === 'admin' || roomMembership[0].role === 'moderator');

    if (!isAuthor && !isRoomAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    // Delete message
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.id, messageId));

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});