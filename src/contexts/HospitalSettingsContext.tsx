import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hospitalSettingService, type HospitalSetting } from '@/services/hospitalSettingService';

interface HospitalSettingsContextType {
  settings: HospitalSetting | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const HospitalSettingsContext = createContext<HospitalSettingsContextType | undefined>(undefined);

export const HospitalSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<HospitalSetting | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await hospitalSettingService.get();
      setSettings(data);
      
      // Update document title
      if (data.hospital_name) {
        document.title = `${data.hospital_name} - Hospital Management`;
      }
      
      // Update favicon if logo exists
      if (data.hospital_logo) {
        updateFavicon(data.hospital_logo);
      }
    } catch (error) {
      console.error('Error fetching hospital settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFavicon = (logoUrl: string) => {
    // Remove existing favicons
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(favicon => favicon.remove());
    
    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = logoUrl;
    document.head.appendChild(link);
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <HospitalSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </HospitalSettingsContext.Provider>
  );
};

export const useHospitalSettings = () => {
  const context = useContext(HospitalSettingsContext);
  if (context === undefined) {
    throw new Error('useHospitalSettings must be used within a HospitalSettingsProvider');
  }
  return context;
};
