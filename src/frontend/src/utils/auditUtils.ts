// ─── Audit Utilities ────────────────────────────────────────────────────────
// Centralized audit trail for all entity changes (students, staff, JAMB, etc.)

const AUDIT_KEY = "unidigital_audit_trail";

export type AuditEntityType = "student" | "staff" | "jamb_student" | "system";
export type AuditAction =
  | "add"
  | "edit"
  | "delete"
  | "view"
  | "photo_update"
  | "login"
  | "logout";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  user: string;
  details?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    note?: string;
  };
}

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addAuditEntry(
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  user: string,
  details?: AuditEntry["details"],
): void {
  const entry: AuditEntry = {
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    entityId,
    entityName,
    user,
    details,
  };
  const log = getAuditLog();
  // Keep last 2000 entries
  const trimmed = [entry, ...log].slice(0, 2000);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
}

export function getAuditLogForEntity(entityId: string): AuditEntry[] {
  return getAuditLog().filter((e) => e.entityId === entityId);
}

export function getAuditLogByType(entityType: AuditEntityType): AuditEntry[] {
  return getAuditLog().filter((e) => e.entityType === entityType);
}

export function formatAuditTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

// ─── Photo Storage ────────────────────────────────────────────────────────────

const PHOTO_KEY = "unidigital_id_photos";

export function getPhotos(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PHOTO_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getPhoto(id: string): string | null {
  return getPhotos()[id] ?? null;
}

export function savePhoto(id: string, base64: string): void {
  const photos = getPhotos();
  photos[id] = base64;
  localStorage.setItem(PHOTO_KEY, JSON.stringify(photos));
}

export function deletePhoto(id: string): void {
  const photos = getPhotos();
  delete photos[id];
  localStorage.setItem(PHOTO_KEY, JSON.stringify(photos));
}

// ─── Shared helper: file → base64 ────────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
