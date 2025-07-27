import { Request, Response, NextFunction } from 'express';

// Lizenz-Feature-Matrix
const LICENSE_FEATURES = {
  basic: {
    maxProjects: 5,
    maxCustomers: 10,
    maxCompanies: 3,
    allowsHochwasserschutz: false,
    allowsAI: false,
    allowsAdvancedReports: false,
    allowsCustomBranding: false,
    sftpStorageGB: 1,
    maxPhotosPerProject: 50,
    maxAudioRecordings: 20,
    supportLevel: 'standard'
  },
  professional: {
    maxProjects: -1, // unbegrenzt
    maxCustomers: 100,
    maxCompanies: 20,
    allowsHochwasserschutz: true,
    allowsAI: false,
    allowsAdvancedReports: true,
    allowsCustomBranding: false,
    sftpStorageGB: 5,
    maxPhotosPerProject: 200,
    maxAudioRecordings: 100,
    supportLevel: 'priority'
  },
  enterprise: {
    maxProjects: -1, // unbegrenzt
    maxCustomers: -1, // unbegrenzt
    maxCompanies: -1, // unbegrenzt
    allowsHochwasserschutz: true,
    allowsAI: true,
    allowsAdvancedReports: true,
    allowsCustomBranding: true,
    sftpStorageGB: 20,
    maxPhotosPerProject: -1, // unbegrenzt
    maxAudioRecordings: -1, // unbegrenzt
    supportLevel: 'premium'
  }
};

export interface LicenseFeatures {
  maxProjects: number;
  maxCustomers: number;
  maxCompanies: number;
  allowsHochwasserschutz: boolean;
  allowsAI: boolean;
  allowsAdvancedReports: boolean;
  allowsCustomBranding: boolean;
  sftpStorageGB: number;
  maxPhotosPerProject: number;
  maxAudioRecordings: number;
  supportLevel: string;
}

export function getLicenseFeatures(licenseType: string): LicenseFeatures {
  return LICENSE_FEATURES[licenseType as keyof typeof LICENSE_FEATURES] || LICENSE_FEATURES.basic;
}

export function requireFeature(feature: keyof LicenseFeatures, requiredValue?: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const licenseFeatures = getLicenseFeatures(user.licenseType || 'basic');
    const hasFeature = licenseFeatures[feature];

    if (typeof hasFeature === 'boolean' && !hasFeature) {
      return res.status(403).json({ 
        error: 'Feature not available', 
        message: `Diese Funktion erfordert eine Professional oder Enterprise Lizenz.`,
        requiredLicense: feature === 'allowsAI' ? 'enterprise' : 'professional'
      });
    }

    if (typeof hasFeature === 'number' && requiredValue !== undefined) {
      if (hasFeature !== -1 && hasFeature < requiredValue) {
        return res.status(403).json({ 
          error: 'License limit exceeded',
          message: `Ihr ${user.licenseType} Plan erlaubt maximal ${hasFeature} ${feature}.`,
          current: requiredValue,
          limit: hasFeature
        });
      }
    }

    next();
  };
}

export function checkProjectLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const licenseFeatures = getLicenseFeatures(user.licenseType || 'basic');
    
    if (licenseFeatures.maxProjects === -1) {
      return next(); // Unbegrenzt
    }

    try {
      // Projekte des Benutzers zählen
      const storage = req.app.get('storage');
      const userProjects = await storage.getProjectsByUserId(user.externalId);
      
      if (userProjects.length >= licenseFeatures.maxProjects) {
        return res.status(403).json({
          error: 'Project limit reached',
          message: `Ihr ${user.licenseType} Plan erlaubt maximal ${licenseFeatures.maxProjects} Projekte. Upgraden Sie für unbegrenzte Projekte.`,
          currentCount: userProjects.length,
          limit: licenseFeatures.maxProjects,
          upgradeRequired: 'professional'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking project limit:', error);
      next();
    }
  };
}

export function checkCustomerLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const licenseFeatures = getLicenseFeatures(user.licenseType || 'basic');
    
    if (licenseFeatures.maxCustomers === -1) {
      return next(); // Unbegrenzt
    }

    try {
      const storage = req.app.get('storage');
      const userCustomers = await storage.getCustomersByUserId(user.externalId);
      
      if (userCustomers.length >= licenseFeatures.maxCustomers) {
        return res.status(403).json({
          error: 'Customer limit reached',
          message: `Ihr ${user.licenseType} Plan erlaubt maximal ${licenseFeatures.maxCustomers} Kunden.`,
          currentCount: userCustomers.length,
          limit: licenseFeatures.maxCustomers,
          upgradeRequired: 'professional'
        });
      }

      next();
    } catch (error) {
      console.error('Error checking customer limit:', error);
      next();
    }
  };
}