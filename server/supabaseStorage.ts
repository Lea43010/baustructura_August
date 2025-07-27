import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join } from 'path';

// Supabase Configuration (Environment Variables)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'demo_key';

// Initialize Supabase Client
let supabaseClient: any = null;

try {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
  console.warn('⚠️ Supabase client initialization failed. Using local fallback.', error);
}

export interface UploadResult {
  success: boolean;
  url?: string;
  filePath?: string;
  error?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  usedSpace: number;
  availableSpace: number;
}

export class SupabaseStorageService {
  private bucketName = 'bau-structura-files';

  async uploadFile(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    projectId?: number
  ): Promise<UploadResult> {
    try {
      // Try Supabase Storage first
      if (supabaseClient && SUPABASE_URL !== 'https://demo.supabase.co') {
        const filePath = this.generateFilePath(userId, fileName, projectId);
        
        const { data, error } = await supabaseClient.storage
          .from(this.bucketName)
          .upload(filePath, fileBuffer, {
            contentType: this.getMimeType(fileName),
            upsert: false
          });

        if (!error && data) {
          // Get public URL
          const { data: urlData } = supabaseClient.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

          return {
            success: true,
            url: urlData.publicUrl,
            filePath: filePath
          };
        } else {
          console.warn('Supabase upload failed:', error?.message);
        }
      }

      // Fallback to local storage
      return await this.uploadToLocalStorage(userId, fileBuffer, fileName, projectId);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Ultimate fallback to local storage
      try {
        return await this.uploadToLocalStorage(userId, fileBuffer, fileName, projectId);
      } catch (localError: any) {
        return {
          success: false,
          error: `Upload failed: ${error.message}. Local fallback also failed: ${localError.message}`
        };
      }
    }
  }

  private async uploadToLocalStorage(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    projectId?: number
  ): Promise<UploadResult> {
    try {
      const uploadDir = join(process.cwd(), 'uploads', userId);
      await fs.mkdir(uploadDir, { recursive: true });

      const localPath = join(uploadDir, fileName);
      await fs.writeFile(localPath, fileBuffer);

      return {
        success: true,
        filePath: localPath
      };
    } catch (error: any) {
      throw new Error(`Local storage failed: ${error.message}`);
    }
  }

  async listUserFiles(userId: string, projectId?: number): Promise<any[]> {
    try {
      // Try Supabase Storage first
      if (supabaseClient && SUPABASE_URL !== 'https://demo.supabase.co') {
        const folderPath = projectId ? `users/${userId}/projects/${projectId}` : `users/${userId}`;
        
        const { data, error } = await supabaseClient.storage
          .from(this.bucketName)
          .list(folderPath);

        if (!error && data) {
          return data.map((file: any) => ({
            id: file.id,
            fileName: file.name,
            fileSize: file.metadata?.size || 0,
            mimeType: file.metadata?.mimetype || 'application/octet-stream',
            storageProvider: 'supabase',
            createdAt: file.created_at,
            externalUrl: this.getPublicUrl(`${folderPath}/${file.name}`)
          }));
        } else {
          console.warn('Supabase list files failed:', error?.message);
        }
      }

      // Fallback to local storage
      return await this.listLocalFiles(userId, projectId);

    } catch (error: any) {
      console.error('List files error:', error);
      return await this.listLocalFiles(userId, projectId);
    }
  }

  private async listLocalFiles(userId: string, projectId?: number): Promise<any[]> {
    try {
      const uploadDir = join(process.cwd(), 'uploads', userId);
      
      try {
        const files = await fs.readdir(uploadDir);
        const fileList = await Promise.all(
          files.map(async (fileName) => {
            const filePath = join(uploadDir, fileName);
            const stats = await fs.stat(filePath);
            
            return {
              id: fileName,
              fileName: fileName,
              fileSize: stats.size,
              mimeType: this.getMimeType(fileName),
              storageProvider: 'local',
              createdAt: stats.birthtime.toISOString(),
              filePath: filePath
            };
          })
        );
        
        return fileList;
      } catch (dirError) {
        // Directory doesn't exist or is empty
        return [];
      }
    } catch (error: any) {
      console.error('Local list files error:', error);
      return [];
    }
  }

  async getStorageStats(userId: string): Promise<StorageStats> {
    try {
      const files = await this.listUserFiles(userId);
      const totalSize = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
      
      return {
        totalFiles: files.length,
        totalSize: totalSize,
        usedSpace: totalSize,
        availableSpace: 1024 * 1024 * 1024 * 5 // 5GB default limit
      };
    } catch (error: any) {
      console.error('Storage stats error:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        usedSpace: 0,
        availableSpace: 1024 * 1024 * 1024 * 5
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; provider: string; message: string }> {
    try {
      if (supabaseClient && SUPABASE_URL !== 'https://demo.supabase.co') {
        // Test Supabase connection
        const { data, error } = await supabaseClient.storage.listBuckets();
        
        if (!error) {
          return {
            success: true,
            provider: 'Supabase Storage',
            message: 'Verbindung zu Supabase Storage erfolgreich'
          };
        } else {
          console.warn('Supabase test failed:', error);
        }
      }

      // Test local storage fallback
      const testDir = join(process.cwd(), 'uploads');
      await fs.mkdir(testDir, { recursive: true });
      
      return {
        success: true,
        provider: 'Local Storage',
        message: 'Lokaler Speicher verfügbar (Supabase nicht konfiguriert)'
      };
      
    } catch (error: any) {
      return {
        success: false,
        provider: 'Unknown',
        message: `Verbindungstest fehlgeschlagen: ${error.message}`
      };
    }
  }

  private generateFilePath(userId: string, fileName: string, projectId?: number): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const basePath = projectId 
      ? `users/${userId}/projects/${projectId}/${timestamp}` 
      : `users/${userId}/general/${timestamp}`;
    
    return `${basePath}/${fileName}`;
  }

  private getPublicUrl(filePath: string): string {
    if (supabaseClient && SUPABASE_URL !== 'https://demo.supabase.co') {
      const { data } = supabaseClient.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    }
    
    return `${SUPABASE_URL}/storage/v1/object/public/${this.bucketName}/${filePath}`;
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4'
    };
    
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

export const supabaseStorage = new SupabaseStorageService();