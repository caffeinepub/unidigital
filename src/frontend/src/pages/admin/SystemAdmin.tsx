import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Database,
  Key,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
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
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { getLocalStaff, getLocalStudents } from "../../utils/sampleData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

interface SystemConfig {
  maintenanceMode: boolean;
  systemNotice: string;
  lastBackup: string;
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

const ACCOUNTS_KEY = "unidigital_user_accounts";
const AUDIT_KEY = "unidigital_system_audit";
const CONFIG_KEY = "unidigital_system_config";

function loadAccounts(): UserAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (raw) return JSON.parse(raw);

  // Bootstrap from students & staff
  const students = getLocalStudents();
  const staff = getLocalStaff();
  const accounts: UserAccount[] = [
    {
      id: "admin-001",
      name: "Super Admin",
      email: "admin@fuek.edu.ng",
      role: "admin",
      status: "active",
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    ...staff.map((s, i) => ({
      id: `staff-${String(i + 1).padStart(3, "0")}`,
      name: s.name,
      email: s.email,
      role:
        s.designation === "hr"
          ? "hr"
          : s.designation === "bursary"
            ? "bursary"
            : "lecturer",
      status: "active" as const,
      lastLogin: new Date(
        Date.now() - Math.random() * 86400000 * 7,
      ).toISOString(),
      createdAt: "2024-01-05T08:00:00.000Z",
    })),
    ...students.slice(0, 20).map((s, i) => ({
      id: `stu-${String(i + 1).padStart(3, "0")}`,
      name: s.name,
      email: s.email,
      role: "student",
      status: (i % 7 === 0 ? "inactive" : "active") as "active" | "inactive",
      lastLogin: new Date(
        Date.now() - Math.random() * 86400000 * 14,
      ).toISOString(),
      createdAt: "2024-01-10T08:00:00.000Z",
    })),
  ];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
}

function saveAccounts(data: UserAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data));
}

function loadAudit(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
}

function addAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const log = loadAudit();
  const newEntry: AuditEntry = {
    ...entry,
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(
    AUDIT_KEY,
    JSON.stringify([newEntry, ...log].slice(0, 200)),
  );
}

function loadConfig(): SystemConfig {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (raw) return JSON.parse(raw);
  return {
    maintenanceMode: false,
    systemNotice: "",
    lastBackup: new Date().toISOString(),
  };
}

function saveConfig(cfg: SystemConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  lecturer: "bg-blue-100 text-blue-700",
  student: "bg-emerald-100 text-emerald-700",
  hr: "bg-violet-100 text-violet-700",
  bursary: "bg-amber-100 text-amber-700",
  hod: "bg-cyan-100 text-cyan-700",
  alumni: "bg-slate-100 text-slate-700",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  suspended: "bg-red-100 text-red-600",
};

const ALL_MODULES = [
  "Course Registration",
  "Result Entry",
  "CBT Exams",
  "Timetable",
  "Attendance",
  "Hostel Management",
  "Library",
  "Bursary",
  "Payroll",
  "HR Management",
  "JAMB Portal",
  "Research Portal",
  "Alumni Portal",
  "Staff Training",
  "Document Verification",
  "Analytics",
];

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function genAccessCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function estimateStorage(): { count: number; sizeKB: number } {
  let count = 0;
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || "";
    if (k.startsWith("unidigital")) {
      count++;
      size += (k.length + (localStorage.getItem(k) || "").length) * 2;
    }
  }
  return { count, sizeKB: Math.round(size / 1024) };
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SystemAdmin() {
  const [accounts, setAccounts] = useState<UserAccount[]>(loadAccounts);
  const [audit, setAudit] = useState<AuditEntry[]>(loadAudit);
  const [config, setConfig] = useState<SystemConfig>(loadConfig);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatedCode, setGeneratedCode] = useState<{
    userId: string;
    code: string;
  } | null>(null);
  const [noticeInput, setNoticeInput] = useState(config.systemNotice);
  const [storageInfo] = useState(estimateStorage);
  const [tab, setTab] = useState("users");

  // Persist config
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (a) =>
        (roleFilter === "all" || a.role === roleFilter) &&
        (statusFilter === "all" || a.status === statusFilter) &&
        (search === "" ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())),
    );
  }, [accounts, roleFilter, statusFilter, search]);

  function updateAccount(
    id: string,
    changes: Partial<UserAccount>,
    auditAction: string,
  ) {
    const updated = accounts.map((a) =>
      a.id === id ? { ...a, ...changes } : a,
    );
    setAccounts(updated);
    saveAccounts(updated);
    const target = accounts.find((a) => a.id === id);
    addAudit({
      adminId: "admin-001",
      adminName: "Super Admin",
      action: auditAction,
      target: target?.email ?? id,
      details: JSON.stringify(changes),
    });
    setAudit(loadAudit());
  }

  function handleDeactivate(id: string) {
    updateAccount(id, { status: "inactive" }, "DEACTIVATE_USER");
  }
  function handleReactivate(id: string) {
    updateAccount(id, { status: "active" }, "REACTIVATE_USER");
  }
  function handleSuspend(id: string) {
    updateAccount(id, { status: "suspended" }, "SUSPEND_USER");
  }
  function handleRoleChange(id: string, newRole: string) {
    updateAccount(id, { role: newRole }, "CHANGE_ROLE");
  }
  function handleGenCode(userId: string) {
    const code = genAccessCode();
    setGeneratedCode({ userId, code });
    addAudit({
      adminId: "admin-001",
      adminName: "Super Admin",
      action: "GEN_ACCESS_CODE",
      target: userId,
      details: `Code: ${code}`,
    });
    setAudit(loadAudit());
  }
  function handleForceLogout(userId: string) {
    addAudit({
      adminId: "admin-001",
      adminName: "Super Admin",
      action: "FORCE_LOGOUT",
      target: userId,
      details: "Session invalidated",
    });
    setAudit(loadAudit());
    alert("Session for user has been invalidated.");
  }
  function handleSaveNotice() {
    const updated = { ...config, systemNotice: noticeInput };
    setConfig(updated);
    addAudit({
      adminId: "admin-001",
      adminName: "Super Admin",
      action: "UPDATE_NOTICE",
      target: "system",
      details: noticeInput,
    });
    setAudit(loadAudit());
  }
  function handleToggleMaintenance() {
    const next = !config.maintenanceMode;
    const updated = { ...config, maintenanceMode: next };
    setConfig(updated);
    addAudit({
      adminId: "admin-001",
      adminName: "Super Admin",
      action: next ? "ENABLE_MAINTENANCE" : "DISABLE_MAINTENANCE",
      target: "system",
      details: "",
    });
    setAudit(loadAudit());
  }
  function handleBackup() {
    const updated = { ...config, lastBackup: new Date().toISOString() };
    setConfig(updated);
    addAudit({
      adminId: "admin-001",
      adminName: "Super Admin",
      action: "MANUAL_BACKUP",
      target: "system",
      details: "Triggered via System Admin panel",
    });
    setAudit(loadAudit());
    alert("Backup snapshot saved to localStorage.");
  }

  const activeSessions = accounts.filter((a) => {
    const diff = Date.now() - new Date(a.lastLogin).getTime();
    return diff < 3600000 && a.status === "active";
  });

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === "active").length,
    inactive: accounts.filter((a) => a.status === "inactive").length,
    suspended: accounts.filter((a) => a.status === "suspended").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            System Administration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            User accounts, roles, sessions, health monitoring &amp; audit log
          </p>
        </div>
        {config.maintenanceMode && (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle size={12} className="mr-1" /> Maintenance Mode Active
          </Badge>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: stats.total,
            icon: <Users size={18} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active",
            value: stats.active,
            icon: <UserCheck size={18} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: <UserMinus size={18} />,
            color: "text-slate-600",
            bg: "bg-slate-100",
          },
          {
            label: "Active Sessions",
            value: activeSessions.length,
            icon: <Activity size={18} />,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
        ].map((k, i) => (
          <Card key={k.label} data-ocid={`sysadmin.kpi.${i + 1}`}>
            <CardContent className="p-4">
              <div
                className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center mb-3 ${k.color}`}
              >
                {k.icon}
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger
            value="users"
            className="text-xs gap-1"
            data-ocid="sysadmin.tab.users"
          >
            <Users size={12} /> Users
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="text-xs gap-1"
            data-ocid="sysadmin.tab.sessions"
          >
            <Activity size={12} /> Sessions
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="text-xs gap-1"
            data-ocid="sysadmin.tab.health"
          >
            <Monitor size={12} /> Health
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="text-xs gap-1"
            data-ocid="sysadmin.tab.config"
          >
            <Settings size={12} /> Config
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="text-xs gap-1"
            data-ocid="sysadmin.tab.audit"
          >
            <Shield size={12} /> Audit Log
          </TabsTrigger>
        </TabsList>

        {/* ── USERS TAB ─────────────────────────────────────────── */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                data-ocid="sysadmin.users.search"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger
                className="w-36 h-8 text-xs"
                data-ocid="sysadmin.users.filter.role"
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "all",
                  "admin",
                  "lecturer",
                  "student",
                  "hr",
                  "bursary",
                  "hod",
                  "alumni",
                ].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "all"
                      ? "All Roles"
                      : r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-32 h-8 text-xs"
                data-ocid="sysadmin.users.filter.status"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {["all", "active", "inactive", "suspended"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all"
                      ? "All Status"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {generatedCode && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-medium">
                  One-Time Access Code Generated
                </p>
                <p className="text-lg font-mono font-bold text-emerald-800 tracking-widest">
                  {generatedCode.code}
                </p>
                <p className="text-xs text-emerald-600">
                  For user ID: {generatedCode.userId} — share securely, expires
                  in 30 minutes.
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setGeneratedCode(null)}
                className="text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Name / Email",
                    "Role",
                    "Status",
                    "Last Login",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.slice(0, 30).map((u) => (
                  <tr
                    key={u.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid="sysadmin.user.row"
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800 truncate max-w-[160px]">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">
                        {u.email}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.id, val)}
                      >
                        <SelectTrigger className="h-6 text-xs border-0 p-0 w-auto gap-1 focus:ring-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {u.role}
                          </span>
                          <ChevronRight size={10} className="text-slate-400" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "admin",
                            "lecturer",
                            "student",
                            "hr",
                            "bursary",
                            "hod",
                            "alumni",
                          ].map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {formatRelative(u.lastLogin)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {u.status === "active" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[11px] px-2 gap-1"
                              onClick={() => handleDeactivate(u.id)}
                              data-ocid="sysadmin.user.deactivate"
                            >
                              <UserMinus size={10} /> Deactivate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[11px] px-2 gap-1 text-red-600 border-red-200"
                              onClick={() => handleSuspend(u.id)}
                              data-ocid="sysadmin.user.suspend"
                            >
                              <Trash2 size={10} /> Suspend
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[11px] px-2 gap-1 text-emerald-600 border-emerald-200"
                            onClick={() => handleReactivate(u.id)}
                            data-ocid="sysadmin.user.reactivate"
                          >
                            <UserCog size={10} /> Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[11px] px-2 gap-1"
                          onClick={() => handleGenCode(u.id)}
                          data-ocid="sysadmin.user.gencode"
                        >
                          <Key size={10} /> Code
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[11px] px-2 gap-1 text-amber-600"
                          onClick={() => handleForceLogout(u.id)}
                          data-ocid="sysadmin.user.logout"
                        >
                          <LogOut size={10} /> Logout
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAccounts.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No users match the current filters.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── SESSIONS TAB ─────────────────────────────────────────── */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity size={16} className="text-violet-500" /> Active
                Sessions ({activeSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No active sessions detected.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeSessions.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                      data-ocid="sysadmin.session.row"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {u.email} ·{" "}
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] ${ROLE_COLORS[u.role] ?? ""}`}
                          >
                            {u.role}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Last active {formatRelative(u.lastLogin)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 text-amber-600 border-amber-300"
                        onClick={() => handleForceLogout(u.id)}
                        data-ocid="sysadmin.session.force-logout"
                      >
                        <LogOut size={12} /> Force Logout
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HEALTH TAB ─────────────────────────────────────────── */}
        <TabsContent value="health" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database size={16} className="text-blue-500" /> Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    UniDigital keys in localStorage
                  </span>
                  <span className="font-bold text-blue-600">
                    {storageInfo.count}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estimated storage used</span>
                  <span className="font-bold text-blue-600">
                    {storageInfo.sizeKB} KB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Last backup</span>
                  <span className="font-medium text-slate-700">
                    {formatRelative(config.lastBackup)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs gap-1"
                  onClick={handleBackup}
                  data-ocid="sysadmin.health.backup"
                >
                  <RefreshCw size={12} /> Run Backup Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor size={16} className="text-emerald-500" /> Module
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {ALL_MODULES.map((mod) => (
                    <div
                      key={mod}
                      className="flex items-center gap-2 text-xs border rounded-md px-2 py-1.5"
                    >
                      <CheckCircle
                        size={12}
                        className="text-emerald-500 flex-shrink-0"
                      />
                      <span className="truncate text-slate-700">{mod}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── CONFIG TAB ─────────────────────────────────────────── */}
        <TabsContent value="config" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings size={16} className="text-slate-500" /> System
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4 border rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When enabled, users see a maintenance banner and some
                    features may be restricted.
                  </p>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={handleToggleMaintenance}
                  data-ocid="sysadmin.config.maintenance"
                />
              </div>

              {config.maintenanceMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  Maintenance mode is currently <strong>ON</strong>. All users
                  will see a maintenance notice at login.
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  System-wide Notice
                </Label>
                <Textarea
                  value={noticeInput}
                  onChange={(e) => setNoticeInput(e.target.value)}
                  placeholder="Enter a notice visible to all logged-in users…"
                  className="text-sm resize-none"
                  rows={3}
                  data-ocid="sysadmin.config.notice"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotice}
                  className="gap-1 text-xs"
                  data-ocid="sysadmin.config.notice.save"
                >
                  Save Notice
                </Button>
              </div>

              {config.systemNotice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <strong>Current notice:</strong> {config.systemNotice}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AUDIT LOG TAB ─────────────────────────────────────────── */}
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={16} className="text-red-500" /> Audit Log
                <Badge variant="secondary" className="ml-auto text-xs">
                  {audit.length} entries
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audit.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  No audit entries yet. Actions taken in this panel will be
                  logged here.
                </p>
              ) : (
                <div className="divide-y max-h-[480px] overflow-y-auto">
                  {audit.map((entry) => (
                    <div
                      key={entry.id}
                      className="py-2.5 flex items-start gap-3"
                      data-ocid="sysadmin.audit.row"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield size={14} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-800">
                            {entry.adminName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {entry.action}
                          </Badge>
                          {entry.target && (
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">
                              → {entry.target}
                            </span>
                          )}
                        </div>
                        {entry.details && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {entry.details}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
