import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Zap } from "lucide-react";

interface LicenseRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  message: string;
  requiredLicense: 'professional' | 'enterprise';
  currentLicense: 'basic' | 'professional' | 'enterprise';
  upgradeUrl?: string;
}

const LicenseRestrictionModal: React.FC<LicenseRestrictionModalProps> = ({
  isOpen,
  onClose,
  feature,
  message,
  requiredLicense,
  currentLicense,
  upgradeUrl
}) => {
  const handleUpgrade = () => {
    if (upgradeUrl) {
      window.location.href = upgradeUrl;
    } else {
      // Fallback zur Landing Page
      window.location.href = `/checkout?plan=${requiredLicense}`;
    }
  };

  const getLicenseIcon = (license: string) => {
    switch (license) {
      case 'professional': return <Crown className="h-5 w-5" />;
      case 'enterprise': return <Zap className="h-5 w-5" />;
      default: return <Lock className="h-5 w-5" />;
    }
  };

  const getLicenseColor = (license: string) => {
    switch (license) {
      case 'professional': return 'text-blue-600 dark:text-blue-400';
      case 'enterprise': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLicensePrice = (license: string) => {
    switch (license) {
      case 'professional': return '39€/Monat';
      case 'enterprise': return '89€/Monat';
      default: return '';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <Lock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold">
            Premium Feature
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <div className="text-gray-700 dark:text-gray-300">
              <strong>{feature}</strong> ist ein Premium-Feature.
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Aktuell:</span>
                <span className="ml-2 font-medium capitalize">{currentLicense}</span>
              </div>
              <div className="text-sm flex items-center">
                <span className="text-gray-500">Benötigt:</span>
                <span className={`ml-2 font-medium flex items-center gap-1 capitalize ${getLicenseColor(requiredLicense)}`}>
                  {getLicenseIcon(requiredLicense)}
                  {requiredLicense}
                  <span className="text-xs text-gray-500">({getLicensePrice(requiredLicense)})</span>
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={onClose} className="w-full sm:w-auto">
            Später
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
          >
            Jetzt upgraden
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LicenseRestrictionModal;