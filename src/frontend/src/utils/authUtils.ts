// ─── Auth Utilities ─────────────────────────────────────────────────────────
// Local portal password / PIN management and security question verification.
// NOTE: Internet Identity handles primary authentication.
// These utilities manage the secondary local access credential (password/PIN).

const PROFILE_SETTINGS_KEY = "unidigital_profile_settings";
const PW_RESET_LOG_KEY = "unidigital_pw_reset_log";

interface StoredProfileSettings {
  photo?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  phone?: string;
  hasCompletedSetup?: boolean;
  localPasswordHash?: string;
}

export interface PasswordResetLogEntry {
  id: string;
  timestamp: string;
  method: "security-question";
  status: "success" | "failed";
  ipHint: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function loadProfileSettings(): StoredProfileSettings {
  try {
    return JSON.parse(
      localStorage.getItem(PROFILE_SETTINGS_KEY) || "{}",
    ) as StoredProfileSettings;
  } catch {
    return {};
  }
}

function saveProfileSettings(patch: Partial<StoredProfileSettings>): void {
  try {
    const existing = loadProfileSettings();
    localStorage.setItem(
      PROFILE_SETTINGS_KEY,
      JSON.stringify({ ...existing, ...patch }),
    );
  } catch {
    // silently ignore storage errors
  }
}

/** Simple obfuscation — not cryptographic, but prevents plain-text storage. */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns true if the user has set a local password/PIN. */
export function hasLocalPassword(): boolean {
  return !!loadProfileSettings().localPasswordHash;
}

/** Verify the current local password/PIN. */
export function verifyLocalPassword(password: string): boolean {
  const { localPasswordHash } = loadProfileSettings();
  if (!localPasswordHash) return false;
  return simpleHash(password) === localPasswordHash;
}

/** Save a new local password/PIN. */
export function saveLocalPassword(password: string): void {
  saveProfileSettings({ localPasswordHash: simpleHash(password) });
}

/** Clear local password (e.g. after reset). */
export function clearLocalPassword(): void {
  saveProfileSettings({ localPasswordHash: undefined });
}

/** Get the stored security question (for forgot password UI). */
export function getSecurityQuestion(): string {
  return loadProfileSettings().securityQuestion ?? "";
}

/** Verify the security answer (case-insensitive trimmed comparison). */
export function verifySecurityAnswer(answer: string): boolean {
  const stored = loadProfileSettings().securityAnswer;
  if (!stored) return false;
  return stored.trim().toLowerCase() === answer.trim().toLowerCase();
}

/** Returns true if the user has a security question configured. */
export function hasSecurityQuestion(): boolean {
  const s = loadProfileSettings();
  return !!(s.securityQuestion && s.securityAnswer);
}

// ── Password Reset Log ────────────────────────────────────────────────────────

function getResetLog(): PasswordResetLogEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(PW_RESET_LOG_KEY) || "[]",
    ) as PasswordResetLogEntry[];
  } catch {
    return [];
  }
}

export function logPasswordReset(
  status: "success" | "failed",
): PasswordResetLogEntry {
  const entry: PasswordResetLogEntry = {
    id: `PWR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    method: "security-question",
    status,
    ipHint: "192.168.x.x",
  };
  const log = getResetLog();
  localStorage.setItem(
    PW_RESET_LOG_KEY,
    JSON.stringify([entry, ...log].slice(0, 100)),
  );
  return entry;
}

export function getPasswordResetLog(): PasswordResetLogEntry[] {
  return getResetLog();
}

/** Validate password strength. Returns null if OK, else error string. */
export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 6) return "Password must be at least 6 characters.";
  return null;
}

/** Calculate password strength 0–4. */
export function passwordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 6) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
