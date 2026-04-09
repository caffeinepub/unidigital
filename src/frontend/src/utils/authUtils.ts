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
  method: "security-question" | "email-demo";
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

/** Save security question and answer to profile settings (single source of truth). */
export function saveSecurityQA(question: string, answer: string): void {
  saveProfileSettings({
    securityQuestion: question,
    securityAnswer: answer.trim().toLowerCase(),
  });
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
  method: "security-question" | "email-demo" = "security-question",
): PasswordResetLogEntry {
  const entry: PasswordResetLogEntry = {
    id: `PWR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    method,
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

// ── Reset via email (demo) ────────────────────────────────────────────────────

/** Save new password for a specific user (email-based demo reset). */
export function resetPasswordViaEmail(
  _userId: string,
  newPassword: string,
): void {
  saveLocalPassword(newPassword);
  logPasswordReset("success", "email-demo");
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 2FA Utilities ─────────────────────────────────────────────────────────────
// TOTP-style 2FA (deterministic, localStorage-backed, demo-safe)
// ══════════════════════════════════════════════════════════════════════════════

const TWO_FA_LOCKOUT_PREFIX = "unidigital_2fa_lockout_";
const TWO_FA_ATTEMPTS_PREFIX = "unidigital_2fa_attempts_";
const TWO_FA_AUDIT_KEY = "unidigital_2fa_audit";

export interface TwoFAAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  eventType:
    | "2fa-enabled"
    | "2fa-disabled"
    | "2fa-verified"
    | "2fa-failed"
    | "2fa-lockout"
    | "2fa-recovery";
  details?: string;
}

/** Log a 2FA security event to localStorage. */
export function log2FAEvent(
  userId: string,
  eventType: TwoFAAuditEntry["eventType"],
  details?: string,
): void {
  try {
    const entry: TwoFAAuditEntry = {
      id: `2FA-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      userId,
      eventType,
      details,
    };
    const existing: TwoFAAuditEntry[] = get2FAAuditLog();
    localStorage.setItem(
      TWO_FA_AUDIT_KEY,
      JSON.stringify([entry, ...existing].slice(0, 200)),
    );
  } catch {
    // ignore
  }
}

/** Retrieve all 2FA audit events, newest first. */
export function get2FAAuditLog(): TwoFAAuditEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(TWO_FA_AUDIT_KEY) || "[]",
    ) as TwoFAAuditEntry[];
  } catch {
    return [];
  }
}

export interface TwoFAConfig {
  enabled: boolean;
  secret: string;
  backupCodes: string[];
  usedCodes: string[];
}

/** Get the localStorage key for a user's 2FA config. */
function get2FAKey(userId: string): string {
  return `unidigital_2fa_${userId}`;
}

/** Load the 2FA config for a user. */
export function get2FAConfig(userId: string): TwoFAConfig | null {
  try {
    const raw = localStorage.getItem(get2FAKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as TwoFAConfig;
  } catch {
    return null;
  }
}

/** Save the 2FA config for a user. */
export function save2FAConfig(userId: string, config: TwoFAConfig): void {
  try {
    const previous = get2FAConfig(userId);
    localStorage.setItem(get2FAKey(userId), JSON.stringify(config));
    if (config.enabled && !previous?.enabled) {
      log2FAEvent(userId, "2fa-enabled", "2FA enabled via setup wizard");
    }
  } catch {
    // ignore
  }
}

/** Returns true if 2FA is enabled for this user. */
export function is2FAEnabled(userId: string): boolean {
  return get2FAConfig(userId)?.enabled === true;
}

/** Generate a random 16-char base32-style secret. */
export function generate2FASecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/** Generate backup codes — array of 8-char alphanumeric strings. */
export function generateBackupCodes(count = 10): string[] {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    codes.push(code);
  }
  return codes;
}

/**
 * Get the current TOTP-style 6-digit code from a secret.
 * Uses a 30-second time window — deterministic.
 */
export function getTOTPCode(secret: string): string {
  const timeWindow = Math.floor(Date.now() / 30000);
  // Derive a numeric hash from secret + time window
  let hash = timeWindow;
  for (let i = 0; i < secret.length; i++) {
    hash = (hash * 31 + secret.charCodeAt(i)) | 0;
  }
  // Get 6 digits (always positive, zero-padded)
  const code = (Math.abs(hash) % 1000000).toString().padStart(6, "0");
  return code;
}

/** Get seconds remaining in the current 30-second TOTP window. */
export function getTOTPSecondsRemaining(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

/**
 * Verify a TOTP or backup code for a user.
 * Checks current AND previous 30-second window to handle clock skew.
 */
export function verify2FACode(
  userId: string,
  code: string,
): "totp-valid" | "backup-valid" | "invalid" {
  const config = get2FAConfig(userId);
  if (!config?.enabled) return "invalid";

  const trimmedCode = code.trim();

  // Check current and previous time window for TOTP
  const currentWindow = Math.floor(Date.now() / 30000);
  for (const windowOffset of [0, -1]) {
    const testWindow = currentWindow + windowOffset;
    let hash = testWindow;
    for (let i = 0; i < config.secret.length; i++) {
      hash = (hash * 31 + config.secret.charCodeAt(i)) | 0;
    }
    const expected = (Math.abs(hash) % 1000000).toString().padStart(6, "0");
    if (trimmedCode === expected) {
      return "totp-valid";
    }
  }

  // Check backup codes (case-insensitive, unused only)
  const upperCode = trimmedCode.toUpperCase();
  const backupIdx = config.backupCodes.findIndex(
    (bc) => bc.toUpperCase() === upperCode,
  );
  if (
    backupIdx >= 0 &&
    !config.usedCodes.includes(config.backupCodes[backupIdx])
  ) {
    // Mark as used
    const updated: TwoFAConfig = {
      ...config,
      usedCodes: [...config.usedCodes, config.backupCodes[backupIdx]],
    };
    save2FAConfig(userId, updated);
    return "backup-valid";
  }

  return "invalid";
}

// ── Lockout tracking ──────────────────────────────────────────────────────────

interface LockoutRecord {
  lockedUntil: number;
}

interface AttemptsRecord {
  count: number;
  lastAttempt: number;
}

/** Returns true if the user is currently locked out of 2FA. */
export function is2FALockedOut(userId: string): boolean {
  try {
    const raw = localStorage.getItem(`${TWO_FA_LOCKOUT_PREFIX}${userId}`);
    if (!raw) return false;
    const rec = JSON.parse(raw) as LockoutRecord;
    return Date.now() < rec.lockedUntil;
  } catch {
    return false;
  }
}

/** Get the remaining lockout time in seconds (0 if not locked). */
export function get2FALockoutSecondsRemaining(userId: string): number {
  try {
    const raw = localStorage.getItem(`${TWO_FA_LOCKOUT_PREFIX}${userId}`);
    if (!raw) return 0;
    const rec = JSON.parse(raw) as LockoutRecord;
    const remaining = Math.ceil((rec.lockedUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

/** Record a failed 2FA attempt. After 5 attempts, lock for 5 minutes. */
export function record2FAFailure(userId: string): void {
  try {
    const raw = localStorage.getItem(`${TWO_FA_ATTEMPTS_PREFIX}${userId}`);
    const attempts: AttemptsRecord = raw
      ? (JSON.parse(raw) as AttemptsRecord)
      : { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    localStorage.setItem(
      `${TWO_FA_ATTEMPTS_PREFIX}${userId}`,
      JSON.stringify(attempts),
    );
    log2FAEvent(userId, "2fa-failed", `Failed attempt #${attempts.count}`);
    if (attempts.count >= 5) {
      const lockout: LockoutRecord = {
        lockedUntil: Date.now() + 5 * 60 * 1000,
      };
      localStorage.setItem(
        `${TWO_FA_LOCKOUT_PREFIX}${userId}`,
        JSON.stringify(lockout),
      );
      log2FAEvent(
        userId,
        "2fa-lockout",
        "Account locked for 5 minutes after 5 failed attempts",
      );
      // Reset attempt count after lockout set
      localStorage.removeItem(`${TWO_FA_ATTEMPTS_PREFIX}${userId}`);
    }
  } catch {
    // ignore
  }
}

/** Get the current failed attempt count for 2FA. */
export function get2FAAttemptCount(userId: string): number {
  try {
    const raw = localStorage.getItem(`${TWO_FA_ATTEMPTS_PREFIX}${userId}`);
    if (!raw) return 0;
    return (JSON.parse(raw) as AttemptsRecord).count;
  } catch {
    return 0;
  }
}

/** Reset failed 2FA attempt counter. */
export function reset2FAAttempts(userId: string): void {
  try {
    localStorage.removeItem(`${TWO_FA_ATTEMPTS_PREFIX}${userId}`);
    localStorage.removeItem(`${TWO_FA_LOCKOUT_PREFIX}${userId}`);
  } catch {
    // ignore
  }
}

/** Admin: disable 2FA for a user. */
export function disable2FAForUser(userId: string): void {
  try {
    localStorage.removeItem(get2FAKey(userId));
    reset2FAAttempts(userId);
    log2FAEvent(userId, "2fa-disabled", "2FA disabled");
  } catch {
    // ignore
  }
}
