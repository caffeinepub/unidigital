import type { StudentRecord } from "./sampleData";

export type RegistrationSource =
  | "manual"
  | "bulk_csv"
  | "ai_scan"
  | "ai_bulk_upload";
export type RegistrationStatus = "pending_approval" | "approved" | "rejected";

export interface ExtendedStudentRecord extends StudentRecord {
  registrationSource?: RegistrationSource;
  registrationStatus?: RegistrationStatus;
  registrationId?: string;
  batchId?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  photoUrl?: string;
  rejectionReason?: string;
  registeredAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface DocumentArchiveEntry {
  id: string;
  studentMatric: string;
  studentName: string;
  documentUrl: string;
  sourceType: RegistrationSource;
  documentType: string;
  extractedData: Record<string, string>;
  confidenceScores: Record<string, number>;
  uploadedAt: string;
  status: "extracted" | "pending" | "failed";
}

export interface RegistrationAuditLog {
  id: string;
  registrationId: string;
  studentMatric: string;
  action: "created" | "approved" | "rejected" | "edited" | "ai_extracted";
  performedBy: string;
  timestamp: string;
  previousStatus?: RegistrationStatus;
  newStatus?: RegistrationStatus;
  reason?: string;
  aiCorrections?: Array<{ field: string; original: string; corrected: string }>;
}

// LocalStorage keys
const EXTENDED_STUDENTS_KEY = "unidigital_extended_students";
const DOC_ARCHIVE_KEY = "registrationDocumentArchive";
const AUDIT_LOG_KEY = "unidigital_registration_audit";

// ---- Extended students ----
export function getExtendedStudents(): ExtendedStudentRecord[] {
  return JSON.parse(localStorage.getItem(EXTENDED_STUDENTS_KEY) || "[]");
}
export function saveExtendedStudents(data: ExtendedStudentRecord[]) {
  localStorage.setItem(EXTENDED_STUDENTS_KEY, JSON.stringify(data));
}
export function upsertExtendedStudent(student: ExtendedStudentRecord) {
  const all = getExtendedStudents();
  const idx = all.findIndex((s) => s.matricNumber === student.matricNumber);
  if (idx >= 0) {
    all[idx] = student;
  } else {
    all.push(student);
  }
  saveExtendedStudents(all);
}

// ---- Document archive ----
export function getDocumentArchive(): DocumentArchiveEntry[] {
  return JSON.parse(localStorage.getItem(DOC_ARCHIVE_KEY) || "[]");
}
export function saveDocumentArchive(data: DocumentArchiveEntry[]) {
  localStorage.setItem(DOC_ARCHIVE_KEY, JSON.stringify(data));
}
export function addDocumentArchiveEntry(entry: DocumentArchiveEntry) {
  const all = getDocumentArchive();
  saveDocumentArchive([entry, ...all]);
}

// ---- Audit log ----
export function getRegistrationAuditLog(): RegistrationAuditLog[] {
  return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || "[]");
}
export function addRegistrationAuditLog(entry: RegistrationAuditLog) {
  const all = getRegistrationAuditLog();
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([entry, ...all]));
}

// ---- ID generators ----
export function generateRegistrationId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `REG-${year}-${seq}`;
}
export function generateBatchId(): string {
  return `BATCH-${Date.now()}`;
}

// ---- Validation ----
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isMatricDuplicate(
  matric: string,
  existingMatrics: string[],
): boolean {
  return existingMatrics
    .map((m) => m.toUpperCase())
    .includes(matric.toUpperCase());
}
export function normalizeMatric(matric: string): string {
  return matric.trim().toUpperCase();
}
export function normalizeName(name: string): string {
  return name
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ---- AI simulation ----
const AI_DEMO_NAMES = [
  "Amara Okonkwo",
  "Emeka Nwosu",
  "Fatima Bello",
  "Chukwudi Eze",
  "Ngozi Adeyemi",
  "Taiwo Afolabi",
  "Ifeanyi Obi",
  "Chidera Eze",
  "Musa Ibrahim",
  "Adaeze Obi",
];
const AI_DEMO_DEPTS = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
  "Physics",
  "Mathematics",
  "Chemistry",
];
const AI_DEMO_LEVELS = ["100", "200", "300", "400"];

export function simulateAIExtraction(fileName: string): {
  fields: Record<string, string>;
  confidenceScores: Record<string, number>;
} {
  const nameIdx = fileName.charCodeAt(0) % AI_DEMO_NAMES.length;
  const deptIdx = fileName.length % AI_DEMO_DEPTS.length;
  const levelIdx = (fileName.charCodeAt(1) || 0) % AI_DEMO_LEVELS.length;
  const year = 2020 + ((fileName.charCodeAt(2) || 0) % 4);
  const seq = String(100 + ((fileName.charCodeAt(3) || 0) % 900)).padStart(
    3,
    "0",
  );
  const dept = AI_DEMO_DEPTS[deptIdx];
  const deptCode = dept.slice(0, 3).toUpperCase();
  const matric = `${deptCode}/${year}/${seq}`;

  return {
    fields: {
      name: AI_DEMO_NAMES[nameIdx],
      matric_number: matric,
      email: `${AI_DEMO_NAMES[nameIdx].split(" ")[0].toLowerCase()}@student.edu`,
      phone: `080${String(10000000 + Math.floor(Math.random() * 89999999))}`,
      department: dept,
      level: AI_DEMO_LEVELS[levelIdx],
    },
    confidenceScores: {
      name: 0.92 + Math.random() * 0.07,
      matric_number: 0.85 + Math.random() * 0.12,
      email: 0.7 + Math.random() * 0.2,
      phone: 0.62 + Math.random() * 0.25,
      department: 0.88 + Math.random() * 0.1,
      level: 0.82 + Math.random() * 0.15,
    },
  };
}

// AI column mapping simulation
export const CANONICAL_FIELDS = [
  "matric_number",
  "first_name",
  "last_name",
  "email",
  "phone",
  "department",
  "level",
  "subject_combination",
  "date_of_birth",
];

const HEADER_ALIASES: Record<string, string> = {
  reg_no: "matric_number",
  registration_number: "matric_number",
  matric: "matric_number",
  "matric no": "matric_number",
  surname: "last_name",
  family_name: "last_name",
  lastname: "last_name",
  firstname: "first_name",
  given_name: "first_name",
  dept: "department",
  faculty: "department",
  year: "level",
  class: "level",
  yr: "level",
  dob: "date_of_birth",
  birth_date: "date_of_birth",
  mobile: "phone",
  telephone: "phone",
  tel: "phone",
  combo: "subject_combination",
  combination: "subject_combination",
};

export function simulateAIColumnMapping(
  headers: string[],
): Array<{ detected: string; mapped: string; confidence: number }> {
  return headers.map((h) => {
    const lower = h.toLowerCase().replace(/[\s-]/g, "_");
    const canonical =
      CANONICAL_FIELDS.find((f) => f === lower) ||
      HEADER_ALIASES[lower] ||
      HEADER_ALIASES[h.toLowerCase()];
    const confidence = canonical
      ? 0.8 + Math.random() * 0.18
      : 0.4 + Math.random() * 0.35;
    return {
      detected: h,
      mapped: canonical || "unknown",
      confidence,
    };
  });
}

// Auto-correct suggestions
export function suggestCorrections(fields: Record<string, string>): Array<{
  field: string;
  original: string;
  suggested: string;
  reason: string;
}> {
  const corrections: Array<{
    field: string;
    original: string;
    suggested: string;
    reason: string;
  }> = [];
  if (fields.name) {
    const normalized = normalizeName(fields.name);
    if (normalized !== fields.name) {
      corrections.push({
        field: "name",
        original: fields.name,
        suggested: normalized,
        reason: "Name casing normalized",
      });
    }
  }
  if (fields.matric_number || fields.matric) {
    const raw = fields.matric_number || fields.matric;
    const upper = raw.trim().toUpperCase();
    if (upper !== raw) {
      corrections.push({
        field: "matric_number",
        original: raw,
        suggested: upper,
        reason: "Matric uppercased",
      });
    }
  }
  if (fields.email) {
    const trimmed = fields.email.trim().toLowerCase();
    if (trimmed !== fields.email) {
      corrections.push({
        field: "email",
        original: fields.email,
        suggested: trimmed,
        reason: "Email trimmed/lowercased",
      });
    }
  }
  return corrections;
}

export const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
  "Economics",
  "Education",
  "Agricultural Science",
];
export const LEVELS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "NCE I",
  "NCE II",
  "NCE III",
  "ND I",
  "ND II",
  "HND I",
  "HND II",
];
export const INSTITUTION_CATEGORIES = [
  { value: "university", label: "University" },
  { value: "college_of_education", label: "College of Education" },
  { value: "polytechnic", label: "Polytechnic" },
];
