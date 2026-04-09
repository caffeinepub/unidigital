import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Globe,
  LogIn,
  LogOut,
  Monitor,
  Shield,
  ShieldCheck,
  Smartphone,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  type PasswordResetLogEntry,
  type TwoFAAuditEntry,
  get2FAAuditLog,
  getPasswordResetLog,
} from "../../utils/authUtils";
import {
  type SessionRecord,
  exportSessionsToCSV,
  formatDuration,
  getAllSessionsForAdmin,
} from "../../utils/sessionUtils";

interface Props {
  userRole?: string;
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

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  student: "bg-blue-100 text-blue-700",
  lecturer: "bg-green-100 text-green-700",
  hod: "bg-cyan-100 text-cyan-700",
  hr: "bg-orange-100 text-orange-700",
  bursary: "bg-amber-100 text-amber-700",
  alumni: "bg-pink-100 text-pink-700",
  parent: "bg-indigo-100 text-indigo-700",
};

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-800 leading-none">
            {value}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const TWO_FA_EVENT_COLORS: Record<string, string> = {
  "2fa-enabled": "bg-green-100 text-green-700",
  "2fa-verified": "bg-green-100 text-green-700",
  "2fa-disabled": "bg-orange-100 text-orange-700",
  "2fa-recovery": "bg-orange-100 text-orange-700",
  "2fa-failed": "bg-red-100 text-red-700",
  "2fa-lockout": "bg-red-100 text-red-700",
};

const TWO_FA_EVENT_LABELS: Record<string, string> = {
  "2fa-enabled": "🔒 2FA Enabled",
  "2fa-verified": "✓ 2FA Verified",
  "2fa-disabled": "🔓 2FA Disabled",
  "2fa-recovery": "⚠ 2FA Recovery",
  "2fa-failed": "✗ 2FA Failed",
  "2fa-lockout": "🚫 2FA Lockout",
};

type MergedSecurityEntry =
  | { kind: "reset"; entry: PasswordResetLogEntry; timestamp: string }
  | { kind: "2fa"; entry: TwoFAAuditEntry; timestamp: string };

function SecurityEventsTab({
  resetLog,
  twoFALog,
}: {
  resetLog: PasswordResetLogEntry[];
  twoFALog: TwoFAAuditEntry[];
}) {
  const merged: MergedSecurityEntry[] = [
    ...resetLog.map((e) => ({
      kind: "reset" as const,
      entry: e,
      timestamp: e.timestamp,
    })),
    ...twoFALog.map((e) => ({
      kind: "2fa" as const,
      entry: e,
      timestamp: e.timestamp,
    })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          Security Events — Password Reset &amp; 2FA Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {merged.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No password reset or 2FA security events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs uppercase font-semibold">
                    #
                  </TableHead>
                  <TableHead className="text-xs uppercase font-semibold">
                    Event ID
                  </TableHead>
                  <TableHead className="text-xs uppercase font-semibold">
                    User / Source
                  </TableHead>
                  <TableHead className="text-xs uppercase font-semibold">
                    Event Type
                  </TableHead>
                  <TableHead className="text-xs uppercase font-semibold">
                    Details
                  </TableHead>
                  <TableHead className="text-xs uppercase font-semibold">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merged.map((row, i) => {
                  if (row.kind === "reset") {
                    const e = row.entry;
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs text-slate-500">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {e.id}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {e.ipHint}
                        </TableCell>
                        <TableCell>
                          {e.method === "email-demo" ? (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              📧 Email Reset (Demo)
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              🔐 Security Question
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {e.status === "success" ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              ✓ Success
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              ✗ Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(e.timestamp).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  const e = row.entry;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs text-slate-500">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {e.id}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">
                        {e.userId}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${TWO_FA_EVENT_COLORS[e.eventType] ?? "bg-slate-100 text-slate-700"}`}
                        >
                          {TWO_FA_EVENT_LABELS[e.eventType] ?? e.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-[180px] truncate">
                        {e.details ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(e.timestamp).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LoginAuditLog({ userRole = "admin" }: Props) {
  void userRole;
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [resetLog, setResetLog] = useState<PasswordResetLogEntry[]>([]);
  const [twoFALog, setTwoFALog] = useState<TwoFAAuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"sessions" | "reset-log">(
    "sessions",
  );
  const [filterRole, setFilterRole] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSessions(getAllSessionsForAdmin());
    setResetLog(getPasswordResetLog());
    setTwoFALog(get2FAAuditLog());
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filterRole !== "all" && s.role !== filterRole) return false;
      if (filterDate) {
        const sessionDate = new Date(s.loginTime).toISOString().slice(0, 10);
        if (sessionDate !== filterDate) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.userId.toLowerCase().includes(q) &&
          !s.role.toLowerCase().includes(q) &&
          !s.sessionId.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [sessions, filterRole, filterDate, search]);

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => !s.logoutTime).length;
  const suspiciousCount = sessions.filter((s) => s.suspicious).length;
  const uniqueUsers = new Set(sessions.map((s) => s.userId)).size;

  const handleExportCSV = () => {
    const csv = exportSessionsToCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const roleOptions = [
    "all",
    "admin",
    "student",
    "lecturer",
    "hod",
    "hr",
    "bursary",
    "alumni",
    "parent",
  ];

  return (
    <div className="space-y-6" data-ocid="audit-log.root">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} />
          <h1 className="text-2xl font-bold">Login Audit Log</h1>
        </div>
        <p className="text-purple-200 text-sm">
          System-wide record of all user logins and logouts. Monitor activity,
          detect anomalies, and export for compliance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity size={20} className="text-blue-600" />}
          label="Total Sessions"
          value={totalSessions}
          color="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle size={20} className="text-green-600" />}
          label="Active Now"
          value={activeSessions}
          color="bg-green-50"
        />
        <StatCard
          icon={<Globe size={20} className="text-slate-600" />}
          label="Unique Users"
          value={uniqueUsers}
          color="bg-slate-100"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-red-600" />}
          label="Suspicious Flags"
          value={suspiciousCount}
          color="bg-red-50"
        />
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(["sessions", "reset-log"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "sessions" ? (
              <Activity size={14} />
            ) : (
              <ShieldCheck size={14} />
            )}
            {t === "sessions" ? "Login Sessions" : "Password Reset & 2FA Log"}
          </button>
        ))}
      </div>

      {/* ── Reset / 2FA Log Tab ── */}
      {activeTab === "reset-log" && (
        <SecurityEventsTab resetLog={resetLog} twoFALog={twoFALog} />
      )}

      {/* ── Sessions Tab ── */}
      {activeTab === "sessions" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <CardTitle className="text-base">All Login Events</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                data-ocid="audit-log.export-csv"
                className="flex items-center gap-2"
              >
                <Download size={14} />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <Input
                placeholder="Search by user, role, session ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
                data-ocid="audit-log.search"
              />
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger
                  className="w-44"
                  data-ocid="audit-log.role-filter"
                >
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r === "all" ? "All Roles" : (ROLE_LABELS[r] ?? r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-44"
                data-ocid="audit-log.date-filter"
              />
              {(filterRole !== "all" || filterDate || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterRole("all");
                    setFilterDate("");
                    setSearch("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Showing {filtered.length} of {totalSessions} sessions
            </p>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs uppercase font-semibold">
                      Session ID
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      User
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Role
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Login
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Logout
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
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-12 text-slate-400"
                      >
                        No sessions found. Start using the portal to see login
                        activity here.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((s) => (
                    <TableRow
                      key={s.sessionId}
                      className={s.suspicious ? "bg-red-50/60" : undefined}
                      data-ocid="audit-log.session-row"
                    >
                      <TableCell className="font-mono text-xs text-slate-500">
                        {s.sessionId.length > 22
                          ? `${s.sessionId.slice(0, 22)}…`
                          : s.sessionId}
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[180px] truncate">
                        {s.userId}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${ROLE_COLORS[s.role] ?? "bg-slate-100 text-slate-700"}`}
                        >
                          {ROLE_LABELS[s.role] ?? s.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <LogIn
                            size={12}
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
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {s.logoutTime ? (
                          <div className="flex items-center gap-1.5">
                            <LogOut
                              size={12}
                              className="text-red-400 flex-shrink-0"
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
                          <span className="text-green-600 font-medium text-xs">
                            Still Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {formatDuration(s.duration)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {s.deviceInfo.includes("Mobile") ? (
                            <Smartphone
                              size={12}
                              className="text-slate-400 flex-shrink-0"
                            />
                          ) : (
                            <Monitor
                              size={12}
                              className="text-slate-400 flex-shrink-0"
                            />
                          )}
                          {s.deviceInfo}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {s.browser}
                      </TableCell>
                      <TableCell>
                        {s.suspicious ? (
                          <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1 w-fit">
                            <AlertTriangle size={10} />
                            Suspicious
                          </Badge>
                        ) : s.logoutTime ? (
                          <Badge className="bg-slate-100 text-slate-600 text-xs">
                            Ended
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {suspiciousCount > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-red-700">
                  <strong>
                    {suspiciousCount} suspicious session
                    {suspiciousCount !== 1 ? "s" : ""} detected
                  </strong>{" "}
                  — multiple logins from the same user within 5 minutes. Review
                  highlighted rows above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
