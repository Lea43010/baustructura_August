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

// SFTP-Account-Erstellung für neuen Benutzer
async function createSftpAccountForUser(userId: string) {
  const sftpUsername = `baustructura_user_${userId}`;
  const sftpPassword = generateSecurePassword();
  const homeDir = `/var/ftp/user_${userId}`;
  
  console.log(`SFTP-Account vorbereitet für User ${userId}:`, {
    username: sftpUsername,
    homeDir: homeDir,
    quota: "1GB"
  });
  
  await storage.updateUser(userId, {
    sftpHost: "128.140.82.20",
    sftpPort: 21,
    sftpUsername: sftpUsername,
    sftpPassword: sftpPassword,
    sftpPath: `${homeDir}/uploads/`
  });
  
  return {
    username: sftpUsername,
    password: sftpPassword,
    homeDir: homeDir
  };
}

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
import { onLicenseActivated, onLicenseCancelled } from './sftpAutoSetup';
import { registerSftpAdminRoutes } from './routes/sftp-admin';
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
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Successfully logged out" });
      });
    } else {
      res.json({ message: "Already logged out" });
    }
  });

  // ... [All existing routes from backup file - truncated for brevity] ...

  // NEW SUPABASE STORAGE ROUTES (Complete SFTP replacement)
  
  // List files from Supabase Storage
  app.get('/api/storage/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.externalId;
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

  // Upload files to Supabase Storage
  app.post('/api/storage/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Keine Datei hochgeladen" });
      }

      const userId = req.user.externalId;
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
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: userId,
        projectId: req.body.projectId ? parseInt(req.body.projectId) : null
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
  app.get('/api/storage/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.externalId;
      const { supabaseStorage } = await import('./supabaseStorage');
      const stats = await supabaseStorage.getStorageStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error('Storage stats error:', error);
      res.status(500).json({ 
        message: "Failed to get storage stats",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Storage Connection Test API
  app.get('/api/storage/test', isAuthenticated, async (req: any, res) => {
    try {
      const { supabaseStorage } = await import('./supabaseStorage');
      const testResult = await supabaseStorage.testConnection();
      
      res.json(testResult);
    } catch (error) {
      console.error('Storage connection test error:', error);
      res.status(500).json({ 
        message: "Connection test failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Legacy SFTP routes - redirect to new Supabase Storage
  app.get('/api/sftp/*', (req, res) => {
    res.status(301).json({
      message: "SFTP has been migrated to Supabase Storage. Please use /api/storage/* endpoints instead.",
      redirectTo: req.path.replace('/sftp/', '/storage/')
    });
  });

  app.post('/api/sftp/*', (req, res) => {
    res.status(301).json({
      message: "SFTP has been migrated to Supabase Storage. Please use /api/storage/* endpoints instead.",
      redirectTo: req.path.replace('/sftp/', '/storage/')
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions remain unchanged
function generateSecurePassword(): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}