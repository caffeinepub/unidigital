import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  History,
  RotateCcw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { ScrollArea } from "../../components/ui/scroll-area";
import { disable2FAForUser, is2FAEnabled } from "../../utils/authUtils";

const USER_REGISTRY_KEY = "unidigital_user_registry";
const ROLE_AUDIT_KEY = "unidigital_role_audit";

const ALL_ROLES = [
  { key: "student", label: "Student" },
  { key: "lecturer", label: "Lecturer" },
  { key: "hod", label: "Head of Department" },
  { key: "admin", label: "Administrator" },
  { key: "bursary", label: "Bursary Officer" },
  { key: "hr", label: "HR Officer" },
  { key: "registrar", label: "Registrar" },
  { key: "senate", label: "Senate Member" },
  { key: "alumni", label: "Alumni" },
  { key: "parent", label: "Parent / Guardian" },
];

interface UserEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  studyMode?: string;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
}

interface RoleAuditEntry {
  id: string;
  changedBy: string;
  targetUser: string;
  targetUserId: string;
  oldRole: string;
  newRole: string;
  timestamp: string;
}

function loadRegistry(): UserEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(USER_REGISTRY_KEY) || "[]",
    ) as UserEntry[];
  } catch {
    return [];
  }
}

function saveRegistry(users: UserEntry[]): void {
  try {
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function loadAudit(): RoleAuditEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem(ROLE_AUDIT_KEY) || "[]",
    ) as RoleAuditEntry[];
  } catch {
    return [];
  }
}

function logRoleChange(entry: Omit<RoleAuditEntry, "id" | "timestamp">): void {
  try {
    const log = loadAudit();
    log.unshift({
      ...entry,
      id: `RA-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(ROLE_AUDIT_KEY, JSON.stringify(log.slice(0, 500)));
  } catch {
    // ignore
  }
}

const roleBadgeColor: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  student: "bg-emerald-100 text-emerald-700",
  lecturer: "bg-purple-100 text-purple-700",
  hod: "bg-amber-100 text-amber-700",
  bursary: "bg-rose-100 text-rose-700",
  hr: "bg-cyan-100 text-cyan-700",
  alumni: "bg-indigo-100 text-indigo-700",
  parent: "bg-teal-100 text-teal-700",
  registrar: "bg-orange-100 text-orange-700",
  senate: "bg-violet-100 text-violet-700",
};

type ViewTab = "users" | "audit";

export function UserManagementPage() {
  const [tab, setTab] = useState<ViewTab>("users");
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [audit, setAudit] = useState<RoleAuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [success, setSuccess] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsers(loadRegistry());
    setAudit(loadAudit());
  }, []);

  function handleToggleStatus(user: UserEntry) {
    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            status:
              u.status === "active"
                ? ("inactive" as const)
                : ("active" as const),
          }
        : u,
    );
    saveRegistry(updated);
    setUsers(updated);
  }

  function handleResetPassword(user: UserEntry) {
    try {
      localStorage.setItem(`unidigital_force_reset_${user.id}`, "true");
    } catch {
      // ignore
    }
    setSuccess(
      `Password reset flag set for ${user.name}. They will be prompted to reset on next login.`,
    );
    setTimeout(() => setSuccess(""), 4000);
  }

  function handleReset2FA(user: UserEntry) {
    disable2FAForUser(user.id);
    setSuccess(
      `2FA disabled for ${user.name}. They can re-enable it from their profile.`,
    );
    setTimeout(() => setSuccess(""), 4000);
  }

  function handleRoleChange() {
    if (!selectedUser || !newRole) return;
    const oldRole = selectedUser.role;
    const updated = users.map((u) =>
      u.id === selectedUser.id ? { ...u, role: newRole } : u,
    );
    saveRegistry(updated);
    logRoleChange({
      changedBy: "admin",
      targetUser: selectedUser.name,
      targetUserId: selectedUser.id,
      oldRole,
      newRole,
    });
    setUsers(updated);
    setAudit(loadAudit());
    setShowRoleModal(false);
    setSuccess(`Role updated: ${selectedUser.name} is now ${newRole}`);
    setTimeout(() => setSuccess(""), 4000);
  }

  function handleDeleteUser(user: UserEntry) {
    const updated = users.filter((u) => u.id !== user.id);
    saveRegistry(updated);
    setUsers(updated);
  }

  function handleBulkCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      let changed = 0;
      const current = loadRegistry();
      for (const line of lines.slice(1)) {
        const [name, email, role] = line.split(",").map((s) => s.trim());
        if (!name || !email || !role) continue;
        const idx = current.findIndex(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (idx >= 0) {
          const oldRole = current[idx].role;
          current[idx].role = role;
          logRoleChange({
            changedBy: "admin (csv)",
            targetUser: name,
            targetUserId: current[idx].id,
            oldRole,
            newRole: role,
          });
          changed++;
        }
      }
      saveRegistry(current);
      setUsers(current);
      setSuccess(`Bulk update complete: ${changed} user(s) updated.`);
      setTimeout(() => setSuccess(""), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleExportCSV() {
    const headers = "Name,Email,Role,Department,Status,Last Login\n";
    const rows = users
      .map((u) =>
        [
          u.name,
          u.email,
          u.role,
          u.department ?? "",
          u.status,
          u.lastLogin ?? "",
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unidigital_users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department ?? "").toLowerCase().includes(q);
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage roles, permissions, and password resets for all portal users
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download size={14} /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => csvRef.current?.click()}
            className="gap-2"
            data-ocid="user-mgmt.bulk-csv-btn"
          >
            <Upload size={14} /> Bulk CSV
          </Button>
          <input
            ref={csvRef}
            type="file"
            accept=".csv"
            onChange={handleBulkCSV}
            className="hidden"
          />
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
          <CheckCircle2 size={14} className="flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "text-primary" },
          {
            label: "Active",
            value: users.filter((u) => u.status === "active").length,
            color: "text-green-600",
          },
          {
            label: "Inactive",
            value: users.filter((u) => u.status === "inactive").length,
            color: "text-amber-600",
          },
          {
            label: "Admins",
            value: users.filter((u) => u.role === "admin").length,
            color: "text-rose-600",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(["users", "audit"] as ViewTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "users" ? <Users size={14} /> : <History size={14} />}
            {t === "users" ? "Users" : "Role Audit Trail"}
          </button>
        ))}
      </div>

      {/* ── Users Tab ── */}
      {tab === "users" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search by name, email, department…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                  data-ocid="user-mgmt.search-input"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="user-mgmt.role-filter"
              >
                <option value="">All Roles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Users size={40} className="mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  No registered users yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Users appear here after they complete onboarding.
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        {[
                          "S/N",
                          "Name",
                          "Email",
                          "Role",
                          "2FA",
                          "Department",
                          "Status",
                          "Last Login",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((user, i) => (
                        <tr
                          key={user.id}
                          className="hover:bg-muted/20 transition-colors"
                          data-ocid="user-mgmt.row"
                        >
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[user.role] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {is2FAEnabled(user.id) ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                ON
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                                OFF
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {user.department ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString(
                                  "en-GB",
                                )
                              : "Never"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                title="View profile"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowProfileModal(true);
                                }}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-primary"
                                data-ocid="user-mgmt.view-profile-btn"
                              >
                                <UserCheck size={14} />
                              </button>
                              <button
                                type="button"
                                title="Change role"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setShowRoleModal(true);
                                }}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-amber-600"
                                data-ocid="user-mgmt.change-role-btn"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                type="button"
                                title="Reset password"
                                onClick={() => handleResetPassword(user)}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-blue-600"
                                data-ocid="user-mgmt.reset-password-btn"
                              >
                                <RotateCcw size={14} />
                              </button>
                              {is2FAEnabled(user.id) && (
                                <button
                                  type="button"
                                  title="Reset / disable 2FA"
                                  onClick={() => handleReset2FA(user)}
                                  className="p-1.5 rounded hover:bg-muted transition-colors text-purple-600"
                                  data-ocid="user-mgmt.reset-2fa-btn"
                                >
                                  <ShieldOff size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                title={
                                  user.status === "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                onClick={() => handleToggleStatus(user)}
                                className={`p-1.5 rounded hover:bg-muted transition-colors ${user.status === "active" ? "text-rose-600" : "text-green-600"}`}
                                data-ocid="user-mgmt.toggle-status-btn"
                              >
                                {user.status === "active" ? (
                                  <UserX size={14} />
                                ) : (
                                  <UserCheck size={14} />
                                )}
                              </button>
                              <button
                                type="button"
                                title="Delete"
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-destructive"
                                data-ocid="user-mgmt.delete-btn"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Audit Trail Tab ── */}
      {tab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Role Change Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {audit.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No role changes recorded yet.
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        {[
                          "#",
                          "User",
                          "Old Role",
                          "New Role",
                          "Changed By",
                          "Timestamp",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {audit.map((entry, i) => (
                        <tr
                          key={entry.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {entry.targetUser}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[entry.oldRole] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {entry.oldRole}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[entry.newRole] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {entry.newRole}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {entry.changedBy}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleString("en-GB")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Profile Modal ── */}
      {showProfileModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowProfileModal(false);
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-base">User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Full Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role },
                { label: "Department", value: selectedUser.department ?? "—" },
                { label: "Study Mode", value: selectedUser.studyMode ?? "—" },
                { label: "Status", value: selectedUser.status },
                {
                  label: "Last Login",
                  value: selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString("en-GB")
                    : "Never",
                },
                {
                  label: "Registered",
                  value: new Date(selectedUser.createdAt).toLocaleString(
                    "en-GB",
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between text-sm border-b pb-2 last:border-0"
                >
                  <span className="text-muted-foreground font-medium">
                    {row.label}
                  </span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setShowProfileModal(false)}
                className="w-full mt-2"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Role Change Modal ── */}
      {showRoleModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowRoleModal(false);
          }}
          onClick={() => setShowRoleModal(false)}
        >
          <Card
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-base">Change Role</CardTitle>
              <p className="text-xs text-muted-foreground">
                Changing role for: <strong>{selectedUser.name}</strong>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current role:</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[selectedUser.role] ?? "bg-muted text-muted-foreground"}`}
                >
                  {selectedUser.role}
                </span>
              </div>

              <div className="space-y-1.5">
                <Label>New Role</Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="user-mgmt.new-role-select"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                This change is permanent and will be logged to the audit trail.
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRoleChange}
                  disabled={newRole === selectedUser.role}
                  className="flex-1"
                  data-ocid="user-mgmt.confirm-role-btn"
                >
                  Confirm Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
