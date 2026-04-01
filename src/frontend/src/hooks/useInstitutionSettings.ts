// Reads institution settings from localStorage (saved by InstitutionSettings.tsx)
// Key: unidigital_institution_settings

export interface SystemToggles {
  courseRegistrationOpen: boolean;
  resultEntryEnabled: boolean;
  resultPublicationEnabled: boolean;
  hostelApplicationsOpen: boolean;
  libraryAccessEnabled: boolean;
  cbtExamsEnabled: boolean;
  studentPortalActive: boolean;
  staffPortalActive: boolean;
}

export interface InstitutionProfile {
  name: string;
  motto: string;
  address: string;
  city: string;
  state: string;
  accreditationNumber: string;
  institutionType: string;
  logoUrl: string;
}

export interface AcademicConfig {
  currentSession: string;
  currentSemester: string;
  semesterStart: string;
  semesterEnd: string;
  resultDeadline: string;
}

export interface InstitutionSettings {
  confirmed: boolean;
  toggles: SystemToggles;
  profile: InstitutionProfile;
  academicConfig: AcademicConfig;
}

const DEFAULT_TOGGLES: SystemToggles = {
  courseRegistrationOpen: true,
  resultEntryEnabled: true,
  resultPublicationEnabled: true,
  hostelApplicationsOpen: true,
  libraryAccessEnabled: true,
  cbtExamsEnabled: true,
  studentPortalActive: true,
  staffPortalActive: true,
};

const DEFAULT_PROFILE: InstitutionProfile = {
  name: "Federal University of Technology",
  motto: "Knowledge for Service",
  address: "1 University Road",
  city: "Minna",
  state: "Niger State",
  accreditationNumber: "NUC/ACC/2023/001",
  institutionType: "university",
  logoUrl: "",
};

const DEFAULT_ACADEMIC_CONFIG: AcademicConfig = {
  currentSession: "2024/2025",
  currentSemester: "first",
  semesterStart: "2025-01-15",
  semesterEnd: "2025-05-30",
  resultDeadline: "2025-06-15",
};

export function getInstitutionSettings(): InstitutionSettings {
  try {
    const raw = localStorage.getItem("unidigital_institution_settings");
    if (!raw) {
      return {
        confirmed: false,
        toggles: DEFAULT_TOGGLES,
        profile: DEFAULT_PROFILE,
        academicConfig: DEFAULT_ACADEMIC_CONFIG,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      confirmed: parsed?.institutionStatus?.confirmed ?? false,
      toggles: { ...DEFAULT_TOGGLES, ...(parsed?.toggles ?? {}) },
      profile: { ...DEFAULT_PROFILE, ...(parsed?.profile ?? {}) },
      academicConfig: {
        ...DEFAULT_ACADEMIC_CONFIG,
        ...(parsed?.academicConfig ?? {}),
      },
    };
  } catch {
    return {
      confirmed: false,
      toggles: DEFAULT_TOGGLES,
      profile: DEFAULT_PROFILE,
      academicConfig: DEFAULT_ACADEMIC_CONFIG,
    };
  }
}
