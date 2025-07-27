import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import LicenseRestrictionModal from "@/components/LicenseRestrictionModal";

export type LicenseType = 'basic' | 'professional' | 'enterprise';

export interface LicenseFeatures {
  maxProjects: number | null; // null bedeutet unbegrenzt
  allowsHochwasserschutz: boolean;
  allowsAI: boolean;
  allowsSFTP: boolean;
  allowsAdvancedMaps: boolean;
  allowsGPS: boolean;
  supportLevel: 'basic' | 'priority' | 'premium';
}

export const getLicenseFeatures = (licenseType: LicenseType): LicenseFeatures => {
  switch (licenseType) {
    case 'basic':
      return {
        maxProjects: 5,
        allowsHochwasserschutz: false,
        allowsAI: false,
        allowsSFTP: false,
        allowsAdvancedMaps: false,
        allowsGPS: false,
        supportLevel: 'basic'
      };
    case 'professional':
      return {
        maxProjects: null, // unbegrenzt
        allowsHochwasserschutz: true,
        allowsAI: false,
        allowsSFTP: true,
        allowsAdvancedMaps: true,
        allowsGPS: true,
        supportLevel: 'priority'
      };
    case 'enterprise':
      return {
        maxProjects: null, // unbegrenzt
        allowsHochwasserschutz: true,
        allowsAI: true,
        allowsSFTP: true,
        allowsAdvancedMaps: true,
        allowsGPS: true,
        supportLevel: 'premium'
      };
    default:
      return getLicenseFeatures('basic');
  }
};

export const useLicenseFeatures = () => {
  const { user } = useAuth();
  const [restrictionModal, setRestrictionModal] = useState<{
    isOpen: boolean;
    feature: string;
    message: string;
    requiredLicense: 'professional' | 'enterprise';
    upgradeUrl?: string;
  }>({
    isOpen: false,
    feature: '',
    message: '',
    requiredLicense: 'professional'
  });

  const currentLicense = (user?.licenseType as LicenseType) || 'basic';
  const features = getLicenseFeatures(currentLicense);

  const checkFeatureAccess = (
    feature: keyof LicenseFeatures,
    featureName: string,
    requiredLicense: 'professional' | 'enterprise' = 'professional'
  ): boolean => {
    if (features[feature]) {
      return true;
    }

    // Zeige Lizenz-Beschränkungs-Modal
    const messages: Record<string, string> = {
      allowsHochwasserschutz: 'Das Hochwasserschutz-Modul erfordert eine Professional oder Enterprise Lizenz für erweiterte Funktionen.',
      allowsAI: 'KI-Features sind exklusiv für Enterprise-Kunden verfügbar.',
      allowsSFTP: 'SFTP-Datei-Upload erfordert eine Professional oder Enterprise Lizenz.',
      allowsAdvancedMaps: 'Erweiterte Karten-Features sind nur in Professional und Enterprise verfügbar.',
      allowsGPS: 'GPS-Integration und Standorterfassung sind Premium-Features für Professional und Enterprise Kunden.',
      maxProjects: 'Unbegrenzte Projekte erfordern eine Professional oder Enterprise Lizenz.',
      supportLevel: 'Erweiterte Support-Features sind nur in höheren Lizenzen verfügbar.'
    };

    setRestrictionModal({
      isOpen: true,
      feature: featureName,
      message: messages[feature as string] || `Dieses Feature erfordert eine ${requiredLicense} Lizenz.`,
      requiredLicense,
      upgradeUrl: `/checkout?plan=${requiredLicense}`
    });

    return false;
  };

  const canCreateProject = (currentProjectCount: number): boolean => {
    if (features.maxProjects === null) {
      return true; // unbegrenzt
    }
    
    if (currentProjectCount >= features.maxProjects) {
      toast({
        title: "Projekt-Limit erreicht",
        description: `Basic-Lizenz erlaubt maximal ${features.maxProjects} Projekte. Upgraden Sie für unbegrenzte Projekte.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const LicenseRestrictionModalComponent = () => (
    <LicenseRestrictionModal
      isOpen={restrictionModal.isOpen}
      onClose={() => setRestrictionModal(prev => ({ ...prev, isOpen: false }))}
      feature={restrictionModal.feature}
      message={restrictionModal.message}
      requiredLicense={restrictionModal.requiredLicense}
      currentLicense={currentLicense}
      upgradeUrl={restrictionModal.upgradeUrl}
    />
  );

  return {
    currentLicense,
    features,
    checkFeatureAccess,
    canCreateProject,
    LicenseRestrictionModalComponent
  };
};