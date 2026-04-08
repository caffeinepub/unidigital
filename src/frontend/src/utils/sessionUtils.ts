// Session tracking utilities for login/logout activity

export interface SessionRecord {
  sessionId: string;
  userId: string;
  role: string;
  loginTime: string; // ISO string
  logoutTime: string | null; // ISO string or null if still active
  duration: number | null; // seconds, null if still active
  deviceInfo: string;
  browser: string;
  suspicious: boolean;
}

const STORAGE_KEY = "unidigital_login_activity";

function parseUserAgent(ua: string): { browser: string } {
  if (ua.includes("Firefox")) return { browser: "Firefox" };
  if (ua.includes("Edg/") || ua.includes("Edge"))
    return { browser: "Microsoft Edge" };
  if (ua.includes("OPR") || ua.includes("Opera")) return { browser: "Opera" };
  if (ua.includes("Chrome")) return { browser: "Chrome" };
  if (ua.includes("Safari")) return { browser: "Safari" };
  return { browser: "Unknown Browser" };
}

function getDeviceInfo(): { deviceInfo: string; browser: string } {
  const ua = navigator.userAgent;
  const { browser } = parseUserAgent(ua);

  let device = "Desktop";
  if (/Mobi|Android/i.test(ua)) device = "Mobile";
  else if (/Tablet|iPad/i.test(ua)) device = "Tablet";

  let os = "Unknown OS";
  if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return {
    deviceInfo: `${device} · ${os}`,
    browser,
  };
}

function getAllSessions(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: SessionRecord[]): void {
  // Keep only last 500 sessions to prevent localStorage bloat
  const trimmed = sessions.slice(-500);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Record a new session start. Returns the sessionId.
 */
export function recordSessionStart(userId: string, role: string): string {
  const sessions = getAllSessions();
  const { deviceInfo, browser } = getDeviceInfo();
  const now = new Date().toISOString();
  const sessionId = `SES-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  // Check for suspicious activity: same user logged in within last 5 minutes
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentSessions = sessions.filter(
    (s) =>
      s.userId === userId &&
      new Date(s.loginTime).getTime() > fiveMinutesAgo &&
      s.sessionId !== sessionId,
  );
  const suspicious = recentSessions.length > 0;

  const newSession: SessionRecord = {
    sessionId,
    userId,
    role,
    loginTime: now,
    logoutTime: null,
    duration: null,
    deviceInfo,
    browser,
    suspicious,
  };

  saveSessions([...sessions, newSession]);

  // Store active session ID for this tab
  sessionStorage.setItem("unidigital_active_session", sessionId);

  return sessionId;
}

/**
 * Record session end for the current active session.
 */
export function recordSessionEnd(): void {
  const activeSessionId = sessionStorage.getItem("unidigital_active_session");
  if (!activeSessionId) return;

  const sessions = getAllSessions();
  const now = new Date().toISOString();

  const updated = sessions.map((s) => {
    if (s.sessionId === activeSessionId && !s.logoutTime) {
      const loginMs = new Date(s.loginTime).getTime();
      const logoutMs = new Date(now).getTime();
      return {
        ...s,
        logoutTime: now,
        duration: Math.round((logoutMs - loginMs) / 1000),
      };
    }
    return s;
  });

  saveSessions(updated);
  sessionStorage.removeItem("unidigital_active_session");
}

/**
 * Get sessions for a specific user (personal activity).
 */
export function getUserSessions(userId: string): SessionRecord[] {
  return getAllSessions()
    .filter((s) => s.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime(),
    );
}

/**
 * Get all sessions for admin audit log.
 */
export function getAllSessionsForAdmin(): SessionRecord[] {
  return getAllSessions().sort(
    (a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime(),
  );
}

/**
 * Format duration in seconds to human-readable string.
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "Active";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

/**
 * Get last login time for a user (for welcome card).
 */
export function getLastLoginTime(userId: string): string {
  const sessions = getUserSessions(userId);
  // Skip the current active session (most recent) to get "last login"
  const previous = sessions.filter((s) => s.logoutTime !== null);
  if (previous.length === 0) return "First login";

  const lastLogin = new Date(previous[0].loginTime);
  const diff = Date.now() - lastLogin.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

/**
 * Export sessions to CSV string.
 */
export function exportSessionsToCSV(sessions: SessionRecord[]): string {
  const headers = [
    "Session ID",
    "User ID",
    "Role",
    "Login Time",
    "Logout Time",
    "Duration",
    "Device",
    "Browser",
    "Suspicious",
  ];
  const rows = sessions.map((s) => [
    s.sessionId,
    s.userId,
    s.role,
    new Date(s.loginTime).toLocaleString(),
    s.logoutTime ? new Date(s.logoutTime).toLocaleString() : "Active",
    formatDuration(s.duration),
    s.deviceInfo,
    s.browser,
    s.suspicious ? "Yes" : "No",
  ]);
  return [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
}

/**
 * Seed demo sessions for testing purposes when no real sessions exist.
 */
export function seedDemoSessions(): void {
  const existing = getAllSessions();
  if (existing.length > 0) return;

  const roles = ["admin", "student", "lecturer", "hod", "hr", "bursary"];
  const demoUsers = [
    { userId: "admin@unidigital.edu.ng", role: "admin" },
    { userId: "alice.johnson@student.edu.ng", role: "student" },
    { userId: "dr.emeka@lecturer.edu.ng", role: "lecturer" },
    { userId: "prof.hassan@hod.edu.ng", role: "hod" },
    { userId: "hr.officer@edu.ng", role: "hr" },
    { userId: "bursary@edu.ng", role: "bursary" },
  ];
  void roles;

  const now = Date.now();
  const demSessions: SessionRecord[] = demoUsers.flatMap((u, i) => {
    const sessions: SessionRecord[] = [];
    for (let j = 0; j < 3; j++) {
      const loginMs =
        now - (i * 3600000 + j * 7200000 + Math.random() * 1800000);
      const durationSec = Math.floor(600 + Math.random() * 3600);
      const logoutMs = loginMs + durationSec * 1000;
      sessions.push({
        sessionId: `SES-DEMO-${i}-${j}`,
        userId: u.userId,
        role: u.role,
        loginTime: new Date(loginMs).toISOString(),
        logoutTime:
          j === 0 && i === 0 ? null : new Date(logoutMs).toISOString(),
        duration: j === 0 && i === 0 ? null : durationSec,
        deviceInfo: j % 2 === 0 ? "Desktop · Windows" : "Mobile · Android",
        browser: ["Chrome", "Firefox", "Safari"][j % 3],
        suspicious: i === 2 && j === 1,
      });
    }
    return sessions;
  });

  saveSessions(demSessions);
}
