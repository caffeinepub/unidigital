import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  LogIn,
  LogOut,
  Monitor,
  Search,
  Shield,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  type SessionRecord,
  exportSessionsToCSV,
  formatDuration,
  getActiveUserSessions,
  getLastLoginTime,
  getUserSessions,
  terminateSession,
} from "../../utils/sessionUtils";

export interface LoginActivityDashboardProps {
  userId: string;
  userName: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  student: "Student",
  lecturer: "Lecturer",
  hod: "Head of Department",
  hr: "HR Officer",
  bursary: "Bursary Officer",
  alumni: "Alumni",
  parent: "Parent/Guardian",
};

function SummaryCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-foreground leading-none">
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type TabType = "history" | "active" | "alerts";

export function LoginActivityDashboard({
  userId,
  userName,
  role,
}: LoginActivityDashboardProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionRecord[]>([]);
  const [lastLogin, setLastLogin] = useState<string>("–");
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSessions(getUserSessions(userId));
    setActiveSessions(getActiveUserSessions(userId));
    setLastLogin(getLastLoginTime(userId));
  }, [userId]);

  const reload = () => {
    setSessions(getUserSessions(userId));
    setActiveSessions(getActiveUserSessions(userId));
    setLastLogin(getLastLoginTime(userId));
  };

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) => s.logoutTime !== null,
  ).length;
  const activeCount = sessions.filter((s) => s.logoutTime === null).length;
  const suspiciousCount = sessions.filter((s) => s.suspicious).length;

  const avgDuration = useMemo(() => {
    const completed = sessions.filter((s) => s.duration !== null);
    if (completed.length === 0) return 0;
    return Math.round(
      completed.reduce((acc, s) => acc + (s.duration ?? 0), 0) /
        completed.length,
    );
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.browser.toLowerCase().includes(q) ||
        s.deviceInfo.toLowerCase().includes(q) ||
        s.sessionId.toLowerCase().includes(q) ||
        (s.ipAddress ?? "").toLowerCase().includes(q),
    );
  }, [sessions, search]);

  const suspiciousSessions = useMemo(
    () => sessions.filter((s) => s.suspicious),
    [sessions],
  );

  function handleTerminate(sessionId: string) {
    terminateSession(sessionId);
    reload();
  }

  function handleExportCSV() {
    const csv = exportSessionsToCSV(sessions);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login-activity-${userId.replace(/\W/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "history", label: "Session History", count: totalSessions },
    { key: "active", label: "Active Sessions", count: activeSessions.length },
    { key: "alerts", label: "Security Alerts", count: suspiciousCount },
  ];

  return (
    <div className="space-y-6" data-ocid="login-activity.root">
      {/* Header */}
      <div className="bg-primary rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-1">
          <Activity size={22} />
          <h1 className="text-2xl font-bold">My Login Activity</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm">
          {userName} &bull; {ROLE_LABELS[role] ?? role} &bull; Last login:{" "}
          <span className="font-semibold text-primary-foreground">
            {lastLogin}
          </span>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<LogIn size={18} className="text-green-600" />}
          label="Total Logins"
          value={totalSessions}
          colorClass="bg-green-500/10"
        />
        <SummaryCard
          icon={<CheckCircle size={18} className="text-blue-600" />}
          label="Completed Sessions"
          value={completedSessions}
          colorClass="bg-blue-500/10"
        />
        <SummaryCard
          icon={<Clock size={18} className="text-amber-600" />}
          label="Avg. Duration"
          value={formatDuration(avgDuration)}
          colorClass="bg-amber-500/10"
        />
        <SummaryCard
          icon={<Shield size={18} className="text-purple-600" />}
          label="Active Sessions"
          value={activeCount}
          colorClass="bg-purple-500/10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            data-ocid={`login-activity.tab.${t.key}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  t.key === "alerts"
                    ? "bg-destructive/20 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Session History ── */}
      {activeTab === "history" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity size={16} />
                Session History
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search sessions…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm w-48"
                    data-ocid="login-activity.search"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-8 text-xs gap-1.5"
                  data-ocid="login-activity.export-csv"
                >
                  <Download size={12} />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="login-activity.empty-state"
              >
                <Activity
                  size={40}
                  className="mx-auto text-muted-foreground/30 mb-3"
                />
                <p className="text-muted-foreground font-medium">
                  No session history yet
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  Your login sessions will appear here once you start using the
                  portal.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs uppercase font-semibold">
                        Session ID
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        Login Time
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        Logout Time
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        Duration
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        Device
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        Browser
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        IP Address
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((s) => (
                      <TableRow
                        key={s.sessionId}
                        className={
                          s.suspicious ? "bg-destructive/5" : undefined
                        }
                        data-ocid="login-activity.session-row"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {s.sessionId.slice(0, 20)}…
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <LogIn
                              size={11}
                              className="text-green-500 flex-shrink-0"
                            />
                            {new Date(s.loginTime).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {s.logoutTime ? (
                            <div className="flex items-center gap-1.5">
                              <LogOut
                                size={11}
                                className="text-destructive/70 flex-shrink-0"
                              />
                              {new Date(s.logoutTime).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          ) : (
                            <span className="text-green-600 font-medium">
                              Current
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <div className="flex items-center gap-1">
                            <Clock
                              size={11}
                              className="text-muted-foreground"
                            />
                            {formatDuration(s.duration)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5">
                            {s.deviceInfo.includes("Mobile") ? (
                              <Smartphone
                                size={12}
                                className="text-muted-foreground flex-shrink-0"
                              />
                            ) : (
                              <Monitor
                                size={12}
                                className="text-muted-foreground flex-shrink-0"
                              />
                            )}
                            {s.deviceInfo}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.browser}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {s.ipAddress ?? "–"}
                        </TableCell>
                        <TableCell>
                          {s.suspicious ? (
                            <Badge className="bg-destructive/10 text-destructive text-xs flex items-center gap-1 w-fit border-destructive/20">
                              <AlertTriangle size={10} />
                              Suspicious
                            </Badge>
                          ) : s.logoutTime ? (
                            <Badge variant="secondary" className="text-xs">
                              Ended
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/10 text-green-700 text-xs border-green-500/20">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Active Sessions ── */}
      {activeTab === "active" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <div
                className="text-center py-10"
                data-ocid="login-activity.no-other-sessions"
              >
                <CheckCircle
                  size={36}
                  className="mx-auto text-green-500 mb-3"
                />
                <p className="font-semibold text-foreground">
                  Only your current session is active
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  No other sessions detected. Your account is secure.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  {activeSessions.length} other active session
                  {activeSessions.length !== 1 ? "s" : ""} detected. Terminate
                  any you don't recognise.
                </p>
                {activeSessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="flex items-center justify-between p-4 border border-border rounded-xl"
                    data-ocid="login-activity.active-session-row"
                  >
                    <div className="flex items-center gap-3">
                      {s.deviceInfo.includes("Mobile") ? (
                        <Smartphone
                          size={18}
                          className="text-muted-foreground"
                        />
                      ) : (
                        <Monitor size={18} className="text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {s.deviceInfo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.browser} &bull; {s.ipAddress ?? "–"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started{" "}
                          {new Date(s.loginTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTerminate(s.sessionId)}
                      className="text-xs gap-1.5"
                      data-ocid="login-activity.terminate-btn"
                    >
                      <XCircle size={13} />
                      Terminate
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    for (const s of activeSessions)
                      terminateSession(s.sessionId);
                    reload();
                  }}
                  className="text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                  data-ocid="login-activity.terminate-all-btn"
                >
                  <Trash2 size={12} />
                  Terminate All Other Sessions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Security Alerts ── */}
      {activeTab === "alerts" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={16} />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suspiciousSessions.length === 0 ? (
              <div className="text-center py-10">
                <Shield size={36} className="mx-auto text-green-500 mb-3" />
                <p className="font-semibold text-foreground">
                  No suspicious activity
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  All your recent sessions look normal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="text-destructive mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Suspicious activity detected
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {suspiciousSessions.length} session
                      {suspiciousSessions.length !== 1 ? "s were" : " was"}{" "}
                      flagged because multiple logins occurred within 5 minutes.
                      If you don't recognise this, contact your system
                      administrator immediately.
                    </p>
                  </div>
                </div>
                {suspiciousSessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="border border-destructive/20 rounded-xl p-4 bg-destructive/5"
                    data-ocid="login-activity.suspicious-row"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs gap-1 flex items-center">
                        <AlertTriangle size={10} />
                        Suspicious Login
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {s.sessionId.slice(0, 20)}…
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Time: </span>
                        <span className="text-foreground font-medium">
                          {new Date(s.loginTime).toLocaleString("en-GB")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Device: </span>
                        <span className="text-foreground">{s.deviceInfo}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Browser: </span>
                        <span className="text-foreground">{s.browser}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IP: </span>
                        <span className="text-foreground font-mono">
                          {s.ipAddress ?? "–"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
