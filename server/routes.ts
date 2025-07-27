import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { setupLocalAuth, isAuthenticated, hashPassword, comparePasswords } from "./localAuth";
import { insertProjectSchema, insertCustomerSchema, insertCompanySchema, insertPersonSchema } from "@shared/schema";
import { z } from "zod";
import { emailService } from "./emailService";


import { emailInboxService } from "./emailInboxService";
import Stripe from "stripe";
import rateLimit from 'express-rate-limit';
import { 
  authRateLimitConfig,
  adminRateLimitConfig
} from './security';
import { registerErrorLearningRoutes } from './routes/error-learning';
import { 
  createSecurityChain, 
  validateResourceOwnership, 
  requireAdmin, 
  requireManagerOrAdmin,
  enforceUserIsolation,
  type SecurityRequest 
} from './security-middleware';
import { requireFeature, checkProjectLimit, checkCustomerLimit, getLicenseFeatures } from "./middleware/licenseMiddleware";
import { registerTrialAdminRoutes } from './admin-trial-api';

import { emailForwardingService } from './emailForwarding';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// Configure multer for file uploads
const upload = multer({ dest: 'temp/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupLocalAuth(app);

  // Direct logout route - must be registered after auth setup
  app.get("/api/logout", (req: any, res: any) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect('/auth?error=logout_failed');
      }
      
      // Clear session data
      req.session.destroy((sessionErr: any) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        
        // Redirect to auth page
        res.redirect('/auth?message=logged_out');
      });
    });
  });

  // Apply specific rate limiting for auth routes
  app.use('/api/auth/login', rateLimit(authRateLimitConfig));
  app.use('/api/auth/register', rateLimit(authRateLimitConfig));
  app.use('/api/auth/forgot-password', rateLimit(authRateLimitConfig));
  
  // Apply admin rate limiting
  app.use('/api/admin', rateLimit(adminRateLimitConfig));

  // Register Error Learning API routes
  registerErrorLearningRoutes(app);
  
  // Register Trial Admin API routes
  registerTrialAdminRoutes(app);
  
  // Import and register Chat routes
  const { chatRouter } = await import('./routes/chat');
  app.use('/', chatRouter);

  // Note: Auth routes are now handled in localAuth.ts

  // Multer-Konfiguration für lokale Uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = req.user?.id?.toString() || 'anonymous';
      const uploadDir = path.join(process.cwd(), 'uploads', userId);
      
      // Verzeichnis erstellen falls nicht vorhanden
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Originaler Dateiname mit Timestamp
      const timestamp = Date.now();
      const originalName = file.originalname;
      cb(null, `${timestamp}-${originalName}`);
    }
  });

  const uploadMiddleware = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB Limit
    }
  });

  // Standard File Upload Route
  app.post('/api/upload', isAuthenticated, uploadMiddleware.single('file'), async (req: any, res) => {
    try {
      console.log('🔄 Upload-Request erhalten:', {
        file: req.file ? req.file.originalname : 'keine Datei',
        userId: req.user?.id,
        projectId: req.body.projectId
      });
      
      if (!req.file) {
        console.error('❌ Upload-Fehler: Keine Datei erhalten');
        return res.status(400).json({ message: 'Keine Datei hochgeladen' });
      }

      const userId = req.user.id;
      const projectId = req.body.projectId ? parseInt(req.body.projectId) : null;

      // Datei in Datenbank speichern
      try {
        const attachmentData = {
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          projectId: projectId,
          uploadedBy: userId,
          storageProvider: 'local'
        };

        const attachment = await storage.createAttachment(attachmentData);
        console.log('✅ Attachment in DB gespeichert:', attachment.id);

        const result = {
          id: attachment.id,
          success: true,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          message: 'Datei erfolgreich hochgeladen und gespeichert',
          storage: 'local'
        };

        res.json(result);
      } catch (dbError) {
        console.error('❌ Datenbank-Fehler beim Speichern des Attachments:', dbError);
        // Datei wurde trotzdem hochgeladen, nur DB-Eintrag fehlgeschlagen
        const result = {
          success: true,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          message: 'Datei hochgeladen, Datenbank-Eintrag fehlgeschlagen',
          warning: 'Datenbank-Synchronisation fehlgeschlagen',
          storage: 'local'
        };
        res.json(result);
      }
      
    } catch (error: unknown) {
      console.error('❌ Upload-Fehler:', error);
      res.status(500).json({ 
        success: false,
        message: 'Upload fehlgeschlagen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler')
      });
    }
  });

  // Config routes
  app.get('/api/config/maps-key', isAuthenticated, async (req, res) => {
    try {
      res.json({ 
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
      });
    } catch (error) {
      console.error("Error fetching maps config:", error);
      res.status(500).json({ message: "Failed to fetch maps config" });
    }
  });



  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      console.log("Profile update request:");
      console.log("  User ID:", userId);
      console.log("  Update data:", updateData);
      
      // Validate allowed fields
      const allowedFields = [
        'firstName', 'lastName', 'displayName', 'position', 'phone', 
        'location', 'timezone', 'language', 'privacyConsent', 'sftpHost', 
        'sftpPort', 'sftpUsername', 'sftpPassword', 'sftpPath', 
        'emailNotificationsEnabled'
      ];
      
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      console.log("  Filtered data:", filteredData);

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updatedUser = await storage.updateUser(userId, filteredData);
      console.log("  Update successful:", updatedUser.firstName, updatedUser.lastName);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  });

  // Erweiterte SFTP-Test Route mit neuen Features
  app.post('/api/profile/test-sftp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`🧪 Testing SFTP connection for user: ${user.email}`);

      // Verwende die neue SftpAutoSetup-Klasse für den Test
      const { SftpAutoSetup } = await import('./sftpAutoSetup');
      const testResult = await SftpAutoSetup.testSftpConnection(user);

      res.json(testResult);

    } catch (error) {
      console.error("SFTP test error:", error);
      res.status(500).json({ 
        success: false, 
        message: "SFTP-Test fehlgeschlagen", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // SFTP-Dateien auflisten
  app.get("/api/sftp/list/:directory?", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      const directory = req.params.directory ? decodeURIComponent(req.params.directory) : '/';
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { SftpAutoSetup } = await import('./sftpAutoSetup');
      const files = await SftpAutoSetup.listSftpFiles(user, directory);

      res.json({ success: true, files, directory, totalFiles: files.length });

    } catch (error) {
      console.error("SFTP list error:", error);
      res.status(500).json({ 
        success: false, 
        message: "SFTP-Dateiliste fehlgeschlagen", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Password change endpoint
  app.post('/api/profile/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update user password
      await storage.updateUser(userId, { password: hashedNewPassword });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Profile image upload endpoint
  app.post('/api/profile/upload-image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For now, we'll simulate the file upload
      // In a real implementation, you would use multer or similar for file handling
      const profileImageUrl = `/uploads/profile-images/${userId}-${Date.now()}.jpg`;
      
      // Update user with new profile image URL
      await storage.updateUser(userId, { profileImageUrl });
      
      res.json({ 
        message: "Profile image uploaded successfully",
        profileImageUrl 
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  // Project roles endpoint
  // Projects API - Admin sees all, users see their own
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let projects;
      
      if (user.role === 'admin') {
        // Admin sees all projects
        console.log(`🔑 Admin ${user.email} requesting all projects`);
        projects = await storage.getProjects(); // No userId = all projects
      } else if (user.role === 'manager') {
        // Manager sees their own projects (same logic as regular users)
        console.log(`👔 Manager ${user.email} requesting their own projects`);
        projects = await storage.getProjects(user.externalId);
      } else {
        // Regular user sees only their projects
        console.log(`👤 User ${user.email} requesting their own projects`);
        projects = await storage.getProjects(user.externalId);
      }
      
      console.log(`📋 Returning ${projects.length} projects for ${user.role}: ${user.email}`);
      res.json(projects);
      
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Single project endpoint - Admin can see all, users see only their own
  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isAdmin = user.role === 'admin';
      
      console.log(`🔍 PROJECT ACCESS: ProjectID: ${projectId}, UserID: ${userId}, Role: ${user.role}, IsAdmin: ${isAdmin}`);
      
      // Admin kann alle Projekte sehen, normale Benutzer nur ihre eigenen
      const project = await storage.getProject(projectId, isAdmin ? undefined : user.externalId);
      
      if (!project) {
        console.log(`🚫 PROJECT NOT FOUND: ProjectID: ${projectId}, UserID: ${userId}`);
        return res.status(404).json({ message: "Projekt nicht gefunden" });
      }
      
      console.log(`✅ PROJECT ACCESS GRANTED: ProjectID: ${projectId}, UserID: ${userId}`);
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get('/api/profile/project-roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectRoles = await storage.getUserProjectRoles(userId);
      res.json(projectRoles);
    } catch (error) {
      console.error("Error fetching project roles:", error);
      res.status(500).json({ message: "Failed to fetch project roles" });
    }
  });



  // Attachments/Documents API endpoints
  app.get('/api/attachments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      
      // Get attachments based on user role
      const attachments = user?.role === 'admin' 
        ? await storage.getAttachments()  // Admin sees all
        : await storage.getAttachmentsByUser(userId);  // User sees only theirs
      
      // Fetch projects for name mapping
      const projects = await storage.getProjects(userId);
      const projectMap = new Map(projects.map(p => [p.id, p.name]));
      
      // Drizzle returns camelCase field names automatically
      const formattedAttachments = attachments.map(attachment => ({
        id: attachment.id,
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        projectId: attachment.projectId,
        projectName: attachment.projectId ? projectMap.get(attachment.projectId) : null,
        uploadedBy: attachment.uploadedBy,
        sftpPath: attachment.sftpPath,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt
      }));
      
      res.json(formattedAttachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.post('/api/attachments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { fileName, filePath, fileSize, mimeType, projectId, sftpPath } = req.body;
      
      if (!fileName || !filePath) {
        return res.status(400).json({ message: "File name and path are required" });
      }

      const attachment = await storage.createAttachment({
        fileName,
        filePath,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        projectId: projectId || null,
        uploadedBy: userId,
        sftpPath: sftpPath || null,
        sftpBackupStatus: 'completed'
      });

      res.json({ 
        success: true, 
        attachment,
        message: "Document uploaded successfully" 
      });
    } catch (error) {
      console.error("Error creating attachment:", error);
      res.status(500).json({ message: "Failed to create attachment" });
    }
  });

  // Download attachment endpoint
  app.get('/api/download/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      const attachmentId = parseInt(req.params.id);
      
      // Get attachment details
      const attachment = await storage.getAttachment(attachmentId);
      if (!attachment) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Check permissions - only allow download if user owns it or is admin
      if (user?.role !== 'admin' && attachment.uploadedBy !== userId) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      // ÜBERGANGSLÖSUNG: Verwende lokalen Speicher statt SFTP
      // Prüfe zuerst, ob Datei lokal existiert
      const fs = await import('fs');
      const path = await import('path');
      
      try {
        let localFilePath: string;
        
        // Verschiedene mögliche lokale Pfade versuchen
        const possiblePaths = [
          attachment.filePath, // Originaler Pfad aus Datenbank
          path.join(process.cwd(), 'uploads', userId, attachment.fileName), // User-spezifischer Ordner
          path.join(process.cwd(), attachment.filePath.replace(/^\//, '')), // Relativer Pfad ohne führenden Slash
        ];
        
        // Ersten verfügbaren Pfad finden
        let fileFound = false;
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            localFilePath = testPath;
            fileFound = true;
            console.log(`✅ Datei lokal gefunden: ${testPath}`);
            break;
          }
        }
        
        if (fileFound) {
          // Datei lokal laden und streamen
          const fileBuffer = fs.readFileSync(localFilePath);
          
          // Set appropriate headers for file streaming
          res.set({
            'Content-Type': attachment.mimeType || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${attachment.fileName}"`,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'no-cache'
          });
          
          console.log(`✅ Streaming lokale Datei ${attachment.fileName} (${fileBuffer.length} bytes) to browser`);
          res.send(fileBuffer);
          return;
        } else {
          throw new Error(`Datei nicht gefunden in lokalen Pfaden: ${possiblePaths.join(', ')}`);
        }
        
      } catch (localError) {
        console.error(`❌ Lokaler Download fehlgeschlagen für ${attachment.fileName}:`, localError.message);
        
        // Create a simple HTML page with interim solution information
        const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Datei nicht verfügbar - ${attachment.fileName}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                margin: 0;
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
              }
              .error { color: #dc2626; margin: 20px 0; font-weight: 500; }
              .info { color: #059669; margin: 10px 0; }
              .tech-info { color: #6b7280; font-size: 14px; margin-top: 20px; }
              .retry-btn {
                background: #3b82f6;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 20px;
                font-size: 16px;
              }
              .retry-btn:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>📄 Datei konnte nicht geöffnet werden</h2>
              <div class="info"><strong>Datei:</strong> ${attachment.fileName}</div>
              <div class="info"><strong>Größe:</strong> ${Math.round(attachment.fileSize / 1024)} KB</div>
              <div class="info"><strong>Typ:</strong> ${attachment.mimeType}</div>
              <div class="error">Datei nicht verfügbar</div>
              <p>Die Datei konnte nicht geladen werden. Dies kann während der Einrichtungsphase vorkommen.</p>
              <div class="info">💡 <strong>Übergangslösung aktiv:</strong> Dateien werden lokal gespeichert</div>
              <button class="retry-btn" onclick="window.location.reload()">Erneut versuchen</button>
              <div class="tech-info">
                Status: Lokale Speicherung<br>
                Fehler: ${localError.message}<br>
                SFTP-Server wird eingerichtet für erweiterte Funktionen
              </div>
            </div>
          </body>
          </html>
        `;
        
        res.set('Content-Type', 'text/html');
        res.send(errorHtml);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.delete('/api/attachments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      const attachmentId = parseInt(req.params.id);
      
      // Check if attachment exists and user has permission
      const attachment = await storage.getAttachment(attachmentId);
      if (!attachment) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only allow deletion if user owns it or is admin
      if (user?.role !== 'admin' && attachment.uploadedBy !== userId) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      await storage.deleteAttachment(attachmentId);
      res.json({ 
        success: true, 
        message: "Document deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Supabase Storage Management endpoints (replacing SFTP)
  app.get('/api/storage/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUserById(userId);
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      const { supabaseStorage } = await import('./supabaseStorage');
      const files = await supabaseStorage.listUserFiles(userId, projectId);
      
      res.json({
        success: true,
        files: files,
        provider: "Supabase Storage",
        path: projectId ? `projects/${projectId}` : 'general'
      });

    } catch (error) {
      console.error("Storage list files failed:", error);
      res.status(500).json({ 
        message: "Failed to list storage files", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/storage/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Keine Datei hochgeladen" });
      }

      const userId = req.user.externalId;
      const user = await storage.getUserById(userId);
      const { supabaseStorage } = await import('./supabaseStorage');
      
      // Read file buffer
      const fileBuffer = await fs.readFile(req.file.path);
      
      // Upload to Supabase Storage (with local fallback)
      const uploadResult = await supabaseStorage.uploadFile(
        userId, 
        fileBuffer, 
        req.file.originalname,
        req.body.projectId ? parseInt(req.body.projectId) : undefined
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: "Upload fehlgeschlagen",
          error: uploadResult.error
        });
      }

      // Create database entry
      const attachment = await storage.createAttachment({
        fileName: req.file.originalname,
        filePath: uploadResult.filePath || req.file.path,
        externalUrl: uploadResult.url,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: userId,
        projectId: req.body.projectId ? parseInt(req.body.projectId) : null,
        storageProvider: uploadResult.url ? "supabase" : "local",
        storageStatus: "uploaded"
      });

      // Clean up local temp file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      console.log(`✅ File uploaded successfully: ${req.file.originalname} via ${uploadResult.url ? 'Supabase' : 'Local'}`);

      res.json({
        success: true,
        message: `Datei erfolgreich hochgeladen via ${uploadResult.url ? 'Supabase Storage' : 'lokalen Speicher'}`,
        file: {
          id: attachment.id,
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          url: uploadResult.url,
          path: uploadResult.filePath,
          provider: uploadResult.url ? "Supabase Storage" : "Local Storage"
        }
      });

    } catch (error) {
      console.error('Storage-Upload-Fehler:', error);
      res.status(500).json({ 
        message: "Fehler beim Datei-Upload",
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  });


  // Storage Stats API for Supabase
  app.get("/api/storage/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.externalId;
      const { supabaseStorage } = await import("./supabaseStorage");
      const stats = await supabaseStorage.getStorageStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error("Storage stats error:", error);
      res.status(500).json({ 
        message: "Failed to get storage stats",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Storage Connection Test API
  app.get("/api/storage/test", isAuthenticated, async (req: any, res) => {
    try {
      const { supabaseStorage } = await import("./supabaseStorage");
      const testResult = await supabaseStorage.testConnection();
      
      res.json(testResult);
    } catch (error) {
      console.error("Storage connection test error:", error);
      res.status(500).json({ 
        message: "Connection test failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Complete SFTP-to-Supabase migration finished
  const httpServer = createServer(app);
  return httpServer;
}
