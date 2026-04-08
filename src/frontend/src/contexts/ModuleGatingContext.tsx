import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

export interface ModuleSettings {
  courseRegistrationOpen: boolean;
  resultEntryEnabled: boolean;
  resultPublicationEnabled: boolean;
  hostelApplicationsOpen: boolean;
  libraryAccessEnabled: boolean;
  cbtExamsEnabled: boolean;
  studentPortalActive: boolean;
  staffPortalActive: boolean;
  certificateCoursesEnabled: boolean;
}

const DEFAULT_SETTINGS: ModuleSettings = {
  courseRegistrationOpen: true,
  resultEntryEnabled: true,
  resultPublicationEnabled: false,
  hostelApplicationsOpen: true,
  libraryAccessEnabled: true,
  cbtExamsEnabled: true,
  studentPortalActive: true,
  staffPortalActive: true,
  certificateCoursesEnabled: true,
};

// Map of page key -> which ModuleSettings key gates it
export const MODULE_GATE_MAP: Record<string, keyof ModuleSettings> = {
  registration: "courseRegistrationOpen",
  "registration-admin": "courseRegistrationOpen",
  "bulk-registration": "courseRegistrationOpen",
  "manual-registration": "courseRegistrationOpen",
  "ai-scan-registration": "courseRegistrationOpen",
  "ai-bulk-registration": "courseRegistrationOpen",
  "registration-management": "courseRegistrationOpen",
  "ca-entry": "resultEntryEnabled",
  "result-entry": "resultEntryEnabled",
  "result-approval-admin": "resultEntryEnabled",
  "result-approval-hod": "resultEntryEnabled",
  "result-entry-review": "resultEntryEnabled",
  "result-publication": "resultPublicationEnabled",
  results: "resultPublicationEnabled",
  "result-slip": "resultPublicationEnabled",
  "course-history": "resultPublicationEnabled",
  hostel: "hostelApplicationsOpen",
  "hostel-admin": "hostelApplicationsOpen",
  "hostel-allocation": "hostelApplicationsOpen",
  "hostel-transfers": "hostelApplicationsOpen",
  "hostel-room-inventory": "hostelApplicationsOpen",
  library: "libraryAccessEnabled",
  "library-admin": "libraryAccessEnabled",
  exams: "cbtExamsEnabled",
  cbt: "cbtExamsEnabled",
  "cbt-analytics": "cbtExamsEnabled",
  "cbt-resit": "cbtExamsEnabled",
  "certificate-courses": "certificateCoursesEnabled",
  "my-certificates": "certificateCoursesEnabled",
};

export const MODULE_LABELS: Record<keyof ModuleSettings, string> = {
  courseRegistrationOpen: "Course Registration",
  resultEntryEnabled: "Result Entry",
  resultPublicationEnabled: "Result Publication",
  hostelApplicationsOpen: "Hostel Applications",
  libraryAccessEnabled: "Library Access",
  cbtExamsEnabled: "CBT Exams",
  studentPortalActive: "Student Portal",
  staffPortalActive: "Staff Portal",
  certificateCoursesEnabled: "Certificate Courses",
};

const STORAGE_KEY = "unidigital_institution_settings";

function loadModuleSettings(): ModuleSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const toggles = parsed?.toggles ?? {};
      return { ...DEFAULT_SETTINGS, ...toggles };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

interface ModuleGatingContextType {
  moduleSettings: ModuleSettings;
  isModuleEnabled: (pageKey: string) => boolean;
  getDisabledModuleName: (pageKey: string) => string | null;
  refreshSettings: () => void;
}

const ModuleGatingContext = createContext<ModuleGatingContextType>({
  moduleSettings: DEFAULT_SETTINGS,
  isModuleEnabled: () => true,
  getDisabledModuleName: () => null,
  refreshSettings: () => {},
});

export function ModuleGatingProvider({ children }: { children: ReactNode }) {
  const [moduleSettings, setModuleSettings] =
    useState<ModuleSettings>(loadModuleSettings);

  const refreshSettings = useCallback(() => {
    setModuleSettings(loadModuleSettings());
  }, []);

  // Poll for changes every 2s (in case settings page updates localStorage)
  useEffect(() => {
    const id = setInterval(refreshSettings, 2000);
    return () => clearInterval(id);
  }, [refreshSettings]);

  const isModuleEnabled = useCallback(
    (pageKey: string): boolean => {
      const gateKey = MODULE_GATE_MAP[pageKey];
      if (!gateKey) return true;
      return moduleSettings[gateKey] !== false;
    },
    [moduleSettings],
  );

  const getDisabledModuleName = useCallback(
    (pageKey: string): string | null => {
      const gateKey = MODULE_GATE_MAP[pageKey];
      if (!gateKey) return null;
      if (moduleSettings[gateKey] !== false) return null;
      return MODULE_LABELS[gateKey];
    },
    [moduleSettings],
  );

  return (
    <ModuleGatingContext.Provider
      value={{
        moduleSettings,
        isModuleEnabled,
        getDisabledModuleName,
        refreshSettings,
      }}
    >
      {children}
    </ModuleGatingContext.Provider>
  );
}

export function useModuleGating() {
  return useContext(ModuleGatingContext);
}
