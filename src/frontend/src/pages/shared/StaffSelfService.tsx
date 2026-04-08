import {
  Award,
  Briefcase,
  Camera,
  Clock,
  Edit,
  FileText,
  GraduationCap,
  Lock,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Save,
  User,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useCamera } from "../../camera/useCamera";
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
  type AuditEntry,
  addAuditEntry,
  fileToBase64,
  getAuditLogForEntity,
  getPhoto,
  savePhoto,
} from "../../utils/auditUtils";
import type { StaffProfile } from "../admin/StaffManagement";

// ─── Storage ───────────────────────────────────────────────────────────────────

const LS_KEY = "unidigital_staff_profiles";

function loadProfiles(): StaffProfile[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveProfiles(data: StaffProfile[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ─── Role → staff matching ────────────────────────────────────────────────────

const ROLE_DESIGNATIONS: Record<string, string[]> = {
  lecturer: [
    "Lecturer",
    "Senior Lecturer",
    "Assistant Lecturer",
    "Professor",
    "Associate Professor",
  ],
  hod: ["HOD", "Head of Department"],
  hr: ["HR Officer", "HR Manager"],
  bursary: ["Bursar", "Accountant", "Bursary Officer"],
};

function findStaffForRole(
  profiles: StaffProfile[],
  role: string,
): StaffProfile | null {
  const designations = ROLE_DESIGNATIONS[role.toLowerCase()] ?? [];
  const byDesignation = profiles.find((p) =>
    designations.some((d) =>
      p.designation.toLowerCase().includes(d.toLowerCase()),
    ),
  );
  if (byDesignation) return byDesignation;
  if (role.toLowerCase() === "hr") {
    const byDept = profiles.find(
      (p) =>
        p.department.toLowerCase().includes("hr") ||
        p.department.toLowerCase().includes("human"),
    );
    if (byDept) return byDept;
  }
  if (role.toLowerCase() === "bursary") {
    const byDept = profiles.find((p) =>
      p.department.toLowerCase().includes("bursary"),
    );
    if (byDept) return byDept;
  }
  return profiles[0] ?? null;
}

// ─── Read-only fields for non-admin staff ────────────────────────────────────

const LOCKED_FIELDS = new Set<keyof StaffProfile>([
  "staffId",
  "name",
  "dob",
  "gender",
  "nationality",
  "state",
  "lga",
  "designation",
  "gradeLevel",
  "department",
  "faculty",
  "salaryGrade",
  "dateOfAppointment",
  "employmentStatus",
  "employmentType",
]);

// ─── Photo Uploader ───────────────────────────────────────────────────────────

function PhotoUploader({
  staffId,
  onSaved,
}: { staffId: string; onSaved: () => void }) {
  const [mode, setMode] = useState<"idle" | "camera" | "preview">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "user" });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert("Photo must be under 5MB");
      return;
    }
    const b64 = await fileToBase64(f);
    setPreview(b64);
    setMode("preview");
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    setPreview(await fileToBase64(file));
    await stopCamera();
    setMode("preview");
  };

  const handleSave = () => {
    if (!preview) return;
    savePhoto(staffId, preview);
    onSaved();
    setMode("idle");
    setPreview(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : getPhoto(staffId) ? (
            <img
              src={getPhoto(staffId)!}
              alt="Current"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={28} className="text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          {mode === "idle" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  setMode("camera");
                  await startCamera();
                }}
              >
                <Camera size={13} className="mr-1" /> Webcam
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="block"
                onClick={() => fileRef.current?.click()}
              >
                <FileText size={13} className="mr-1" /> Upload Photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFile}
              />
            </>
          )}
          {mode === "preview" && (
            <>
              <Button
                type="button"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSave}
              >
                <Save size={13} className="mr-1" /> Save Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="block"
                onClick={() => {
                  setMode("idle");
                  setPreview(null);
                }}
              >
                <RefreshCw size={13} className="mr-1" /> Retake
              </Button>
            </>
          )}
        </div>
      </div>

      {mode === "camera" && (
        <div className="space-y-2">
          {isLoading && (
            <p className="text-xs text-muted-foreground">Starting camera…</p>
          )}
          {error && <p className="text-xs text-destructive">{error.message}</p>}
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ maxWidth: 280 }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            {isActive && (
              <Button
                type="button"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCapture}
              >
                <Camera size={13} className="mr-1" /> Capture
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                await stopCamera();
                setMode("idle");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Field ────────────────────────────────────────────────────────────

function PField({
  label,
  value,
  editable,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange?: (v: string) => void;
  multiline?: boolean;
}) {
  if (!editable) {
    return (
      <div>
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock size={10} className="opacity-60" /> {label}
        </Label>
        <p className="mt-1 text-sm font-medium text-foreground/80 bg-muted/50 border border-border rounded-md px-3 py-2 cursor-not-allowed min-h-[2.25rem]">
          {value || "—"}
        </p>
      </div>
    );
  }
  if (multiline) {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <textarea
          className="mt-1 w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );
  }
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        className="mt-1"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

// ─── Qualifications Editor ────────────────────────────────────────────────────

function QualificationsEditor({
  qualifications,
  onChange,
}: {
  qualifications: StaffProfile["qualifications"];
  onChange: (q: StaffProfile["qualifications"]) => void;
}) {
  const add = () =>
    onChange([
      ...qualifications,
      { degree: "", institution: "", year: "", grade: "" },
    ]);
  const remove = (i: number) =>
    onChange(qualifications.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string) =>
    onChange(
      qualifications.map((q, idx) =>
        idx === i ? { ...q, [field]: value } : q,
      ),
    );

  return (
    <div className="space-y-2">
      {qualifications.map((q, i) => (
        <div
          key={`${q.degree}-${q.institution}-${q.year}-${i}`}
          className="grid grid-cols-2 gap-2 p-2 bg-muted/30 rounded-lg border border-border relative pr-8"
        >
          <Input
            placeholder="Qualification/Degree"
            value={q.degree}
            onChange={(e) => update(i, "degree", e.target.value)}
            className="text-xs h-8"
          />
          <Input
            placeholder="Institution"
            value={q.institution}
            onChange={(e) => update(i, "institution", e.target.value)}
            className="text-xs h-8"
          />
          <Input
            placeholder="Year"
            value={q.year}
            onChange={(e) => update(i, "year", e.target.value)}
            className="text-xs h-8"
          />
          <Input
            placeholder="Grade/Class"
            value={q.grade ?? ""}
            onChange={(e) => update(i, "grade", e.target.value)}
            className="text-xs h-8"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs"
        onClick={add}
      >
        <Plus size={12} className="mr-1" /> Add Qualification
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StaffSelfServiceProps {
  /** The role of the current user, e.g. 'lecturer', 'hod', 'hr', 'bursary', 'admin' */
  role?: string;
  /** Legacy prop — same as role */
  userRole?: string;
  /** Optional: name hint for matching profile */
  userName?: string;
}

export function StaffSelfService({
  role,
  userRole,
  userName,
}: StaffSelfServiceProps) {
  const effectiveRole = role ?? userRole ?? "lecturer";
  const isAdmin = effectiveRole.toLowerCase() === "admin";

  const [allProfiles] = useState<StaffProfile[]>(() => loadProfiles());

  // Admin can browse all staff; other roles see only their own profile
  const ownProfile = isAdmin
    ? null
    : ((userName
        ? allProfiles.find(
            (p) =>
              p.name.toLowerCase().includes(userName.toLowerCase()) ||
              p.email.toLowerCase().includes(userName.toLowerCase()),
          )
        : null) ?? findStaffForRole(allProfiles, effectiveRole));

  const [selected, setSelected] = useState<StaffProfile | null>(
    isAdmin ? null : ownProfile,
  );
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<StaffProfile | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Admin list view filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const setField = (k: keyof StaffProfile, v: string) => {
    if (!form) return;
    setForm((f) => (f ? { ...f, [k]: v } : f));
  };

  const openProfile = (p: StaffProfile) => {
    setSelected(p);
    setForm({ ...p });
    setEditing(false);
  };

  const startEdit = () => {
    if (!selected) return;
    setForm({ ...selected });
    setEditing(true);
    setValidationError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(selected ? { ...selected } : null);
    setValidationError(null);
  };

  const handleSave = () => {
    if (!form || !selected) return;
    if (!form.phone?.trim()) {
      setValidationError("Phone number is required.");
      return;
    }
    if (!form.email?.trim()) {
      setValidationError("Email address is required.");
      return;
    }

    // Preserve locked fields for non-admin
    const finalRecord: StaffProfile = isAdmin
      ? form
      : (() => {
          const rec = { ...form };
          for (const field of LOCKED_FIELDS) {
            (rec as Record<string, unknown>)[field] = selected[field];
          }
          return rec;
        })();

    const before = allProfiles.find((p) => p.staffId === selected.staffId);
    const updated = allProfiles.map((p) =>
      p.staffId === selected.staffId ? finalRecord : p,
    );
    saveProfiles(updated);

    addAuditEntry(
      "edit",
      "staff",
      selected.staffId,
      finalRecord.name,
      isAdmin
        ? "Admin"
        : `${effectiveRole.charAt(0).toUpperCase()}${effectiveRole.slice(1)}`,
      {
        before: before as unknown as Record<string, unknown>,
        after: finalRecord as unknown as Record<string, unknown>,
      },
    );

    setSelected(finalRecord);
    setEditing(false);
    setSaved(true);
    setValidationError(null);
    setTimeout(() => setSaved(false), 3000);
  };

  const auditLog: AuditEntry[] = selected
    ? getAuditLogForEntity(selected.staffId).slice(0, 10)
    : [];

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    probation: "bg-amber-100 text-amber-700",
    retired: "bg-muted text-muted-foreground",
    exited: "bg-red-100 text-red-700",
  };

  const printProfile = () => {
    if (!selected) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const quals = selected.qualifications
      .map(
        (q) =>
          `<tr><td>${q.degree}</td><td>${q.institution}</td><td>${q.year}</td><td>${q.grade ?? "—"}</td></tr>`,
      )
      .join("");
    win.document.write(`<html><head><style>
      body{font-family:Arial,sans-serif;padding:30px;font-size:12px;color:#1e293b}
      h1{font-size:18px;color:#1e3a5f;text-align:center}
      h2{font-size:13px;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:4px;margin-top:18px}
      table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left}th{background:#f1f5f9;font-weight:bold}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.field{margin:4px 0}.label{font-weight:bold;color:#475569}
    </style></head><body>
    <h1>STAFF ACADEMIC/EMPLOYMENT RECORD</h1>
    <p style="text-align:center;color:#475569;font-size:11px">Federal University of Education, Kontagora (FUEK) — MIS</p>
    <h2>Personal Information</h2>
    <div class="grid2">
      <div class="field"><span class="label">Name:</span> ${selected.name}</div>
      <div class="field"><span class="label">Staff ID:</span> ${selected.staffId}</div>
      <div class="field"><span class="label">Date of Birth:</span> ${selected.dob}</div>
      <div class="field"><span class="label">Gender:</span> ${selected.gender}</div>
      <div class="field"><span class="label">Phone:</span> ${selected.phone}</div>
      <div class="field"><span class="label">Email:</span> ${selected.email}</div>
      <div class="field"><span class="label">Address:</span> ${selected.address}</div>
    </div>
    <h2>Current Employment</h2>
    <div class="grid2">
      <div class="field"><span class="label">Designation:</span> ${selected.designation}</div>
      <div class="field"><span class="label">Grade Level:</span> ${selected.gradeLevel}</div>
      <div class="field"><span class="label">Department:</span> ${selected.department}</div>
      <div class="field"><span class="label">Faculty:</span> ${selected.faculty}</div>
      <div class="field"><span class="label">Appointment Date:</span> ${selected.dateOfAppointment}</div>
      <div class="field"><span class="label">Salary Grade:</span> ${selected.salaryGrade}</div>
    </div>
    ${quals ? `<h2>Academic Qualifications</h2><table><thead><tr><th>Qualification</th><th>Institution</th><th>Year</th><th>Grade</th></tr></thead><tbody>${quals}</tbody></table>` : ""}
    <h2>Next of Kin</h2>
    <div class="grid2">
      <div class="field"><span class="label">Name:</span> ${selected.nokName}</div>
      <div class="field"><span class="label">Relationship:</span> ${selected.nokRelationship}</div>
      <div class="field"><span class="label">Phone:</span> ${selected.nokPhone}</div>
    </div>
    <p style="text-align:right;font-size:10px;margin-top:30px;color:#94a3b8">Printed: ${new Date().toLocaleString()} | FUEK MIS</p>
    </body></html>`);
    win.print();
  };

  // ── Admin list view ──────────────────────────────────────────────────────────
  if (isAdmin && !selected) {
    const depts = [...new Set(allProfiles.map((p) => p.department))].sort();
    const filtered = allProfiles.filter((p) => {
      const q = search.toLowerCase();
      const ms =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.staffId.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q);
      return (
        ms &&
        (deptFilter === "all" || p.department === deptFilter) &&
        (statusFilter === "all" || p.employmentStatus === statusFilter)
      );
    });

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Profiles</h1>
          <p className="text-muted-foreground text-sm">
            {allProfiles.length} staff members
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search staff…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-44 h-9"
            data-ocid="admin-staff-search"
          />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-9"
          >
            <option value="all">All Departments</option>
            {depts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-9"
          >
            <option value="all">All Status</option>
            {["active", "probation", "retired", "exited"].map((s) => (
              <option key={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            {filtered.length} results
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const photo = getPhoto(p.staffId);
            return (
              <button
                type="button"
                key={p.staffId}
                onClick={() => openProfile(p)}
                className="bg-card border rounded-xl p-4 text-left hover:shadow-md hover:border-primary/40 transition-all group"
                data-ocid={`staff-profile-${p.staffId}`}
              >
                <div className="flex items-start gap-3">
                  {photo ? (
                    <img
                      src={photo}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {p.staffId}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.designation} · {p.department}
                    </p>
                    <span
                      className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[p.employmentStatus] ?? ""}`}
                    >
                      {p.employmentStatus}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-card border rounded-xl p-10 text-center text-muted-foreground">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p>No staff match your filters</p>
          </div>
        )}
      </div>
    );
  }

  // ── No profile found ─────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <User size={40} className="text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">
          No staff profile found for your role ({effectiveRole}).
        </p>
        <p className="text-sm text-muted-foreground">
          Contact HR to set up your profile.
        </p>
      </div>
    );
  }

  // ── Profile view ─────────────────────────────────────────────────────────────
  const currentData = editing && form ? form : selected;
  const canEdit = (field: keyof StaffProfile) =>
    isAdmin || !LOCKED_FIELDS.has(field);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Admin back link */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setEditing(false);
          }}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          ← Back to staff list
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm">
            View and update your personal information
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <Award size={14} /> Saved!
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={printProfile}
            data-ocid="self-print-btn"
          >
            <Printer size={14} className="mr-1" /> Print Record
          </Button>
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
                data-ocid="self-save-btn"
              >
                <Save size={14} className="mr-1" /> Save Changes
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={startEdit}
              data-ocid="self-edit-btn"
            >
              <Edit size={14} className="mr-1" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Lock notice */}
      {editing && !isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
          <Lock size={13} className="mt-0.5 flex-shrink-0" />
          Fields with a lock icon are managed by HR/Admin. Contact HR to update
          them.
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive flex items-center gap-2">
          <X size={14} />
          {validationError}
          <button
            type="button"
            className="ml-auto"
            onClick={() => setValidationError(null)}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Hero card */}
      <Card className="border-t-4 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div
              key={photoVersion}
              className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-background shadow-md flex-shrink-0"
            >
              {getPhoto(selected.staffId) ? (
                <img
                  src={getPhoto(selected.staffId)!}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User size={40} className="text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selected.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {selected.designation} · {selected.department}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {selected.staffId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[selected.employmentStatus]}`}
                >
                  {selected.employmentStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone size={13} />
                  {selected.phone}
                </span>
                <span>{selected.email}</span>
                <span>Grade: {selected.gradeLevel}</span>
                <span>Salary: {selected.salaryGrade}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={14} /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PField
              label="Full Name (Legal)"
              value={selected.name}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Date of Birth"
              value={selected.dob}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Gender"
              value={selected.gender}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Nationality"
              value={selected.nationality}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="State of Origin"
              value={selected.state}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="LGA"
              value={selected.lga}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Phone Number"
              value={editing && form ? form.phone : selected.phone}
              editable={editing && canEdit("phone")}
              onChange={(v) => setField("phone", v)}
            />
            <PField
              label="Email Address"
              value={editing && form ? form.email : selected.email}
              editable={editing && canEdit("email")}
              onChange={(v) => setField("email", v)}
            />
            <PField
              label="Home Address"
              value={editing && form ? form.address : selected.address}
              editable={editing && canEdit("address")}
              onChange={(v) => setField("address", v)}
              multiline
            />
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase size={14} /> Current Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PField
              label="Staff ID"
              value={selected.staffId}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Designation"
              value={selected.designation}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Grade Level"
              value={selected.gradeLevel}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Department"
              value={selected.department}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Faculty"
              value={selected.faculty}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Date of Appointment"
              value={selected.dateOfAppointment}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Employment Type"
              value={selected.employmentType ?? "permanent"}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Salary Grade"
              value={selected.salaryGrade}
              editable={false}
              onChange={() => {}}
            />
            <PField
              label="Employment Status"
              value={selected.employmentStatus}
              editable={false}
              onChange={() => {}}
            />
          </CardContent>
        </Card>
      </div>

      {/* Qualifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap size={14} /> Academic Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <QualificationsEditor
              qualifications={form?.qualifications ?? selected.qualifications}
              onChange={(q) =>
                setForm((f) => (f ? { ...f, qualifications: q } : f))
              }
            />
          ) : (
            <>
              {currentData.qualifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No qualifications recorded.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                          Qualification
                        </th>
                        <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                          Institution
                        </th>
                        <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                          Year
                        </th>
                        <th className="text-left py-1 font-semibold text-muted-foreground">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.qualifications.map((q) => (
                        <tr
                          key={`${q.degree}-${q.year}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-1.5 pr-2 font-medium">
                            {q.degree}
                          </td>
                          <td className="py-1.5 pr-2 text-muted-foreground">
                            {q.institution}
                          </td>
                          <td className="py-1.5 pr-2">{q.year}</td>
                          <td className="py-1.5">{q.grade ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Next of Kin */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={14} /> Next of Kin / Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <PField
              label="NOK Name"
              value={editing && form ? form.nokName : selected.nokName}
              editable={editing && canEdit("nokName")}
              onChange={(v) => setField("nokName", v)}
            />
            <PField
              label="Relationship"
              value={
                editing && form
                  ? form.nokRelationship
                  : selected.nokRelationship
              }
              editable={editing && canEdit("nokRelationship")}
              onChange={(v) => setField("nokRelationship", v)}
            />
            <PField
              label="NOK Phone"
              value={editing && form ? form.nokPhone : selected.nokPhone}
              editable={editing && canEdit("nokPhone")}
              onChange={(v) => setField("nokPhone", v)}
            />
            <PField
              label="NOK Address"
              value={
                (editing && form ? form.nokAddress : selected.nokAddress) ?? ""
              }
              editable={editing}
              onChange={(v) =>
                setForm((f) => (f ? { ...f, nokAddress: v } : f))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Employment History */}
      {selected.employmentHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={14} /> Previous Employment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selected.employmentHistory.map((h) => (
                <div
                  key={`${h.employer}-${h.startYear}`}
                  className="flex justify-between items-start gap-2 p-2 bg-muted/30 rounded-lg text-sm"
                >
                  <div>
                    <p className="font-medium">{h.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.employer}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {h.startYear}–{h.endYear}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Balance */}
      <div className="grid sm:grid-cols-2 gap-4">
        {selected.leaveBalance && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wide">
                Leave Balance
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Annual",
                    value: selected.leaveBalance.annual,
                    max: 30,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Sick",
                    value: selected.leaveBalance.sick,
                    max: 30,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Maternity",
                    value: selected.leaveBalance.maternity,
                    max: 90,
                    color: "bg-pink-500",
                  },
                ].map((lb) => (
                  <div key={lb.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>{lb.label}</span>
                      <span className="font-medium">{lb.value} days</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className={`h-full rounded-full ${lb.color}`}
                        style={{
                          width: `${Math.min((lb.value / lb.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {selected.performanceRating !== undefined && (
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Performance Rating
              </p>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${selected.performanceRating >= 80 ? "border-green-400 text-green-600" : selected.performanceRating >= 60 ? "border-amber-400 text-amber-600" : "border-red-400 text-red-600"}`}
              >
                {selected.performanceRating}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selected.performanceRating >= 80
                  ? "Excellent"
                  : selected.performanceRating >= 60
                    ? "Satisfactory"
                    : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Photo Management */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera size={14} /> Update Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            staffId={selected.staffId}
            onSaved={() => setPhotoVersion((v) => v + 1)}
          />
        </CardContent>
      </Card>

      {/* Promotion History */}
      {(selected.promotionHistory?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award size={14} /> Promotion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selected.promotionHistory?.map((ph) => (
                <div
                  key={`${ph.date}-${ph.toPosition}`}
                  className="flex justify-between items-center p-2 bg-muted/30 rounded-lg text-sm"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{ph.date}</p>
                    <p>
                      {ph.fromPosition} →{" "}
                      <span className="text-green-600 font-medium">
                        {ph.toPosition}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {ph.newSalaryGrade}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit / Change History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={14} /> My Change History (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No changes recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {auditLog.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 text-xs p-2 rounded-lg bg-muted/40 border border-border"
                >
                  <Clock
                    size={12}
                    className="mt-0.5 text-muted-foreground flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium capitalize bg-primary/10 text-primary">
                        {e.action}
                      </span>
                      <span className="text-muted-foreground">by {e.user}</span>
                      <span className="text-muted-foreground">
                        {new Date(e.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom save buttons */}
      {editing && (
        <div className="flex gap-3 justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={cancelEdit}>
            <X size={14} className="mr-1" /> Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
            data-ocid="self-save-bottom-btn"
          >
            <Save size={14} className="mr-1" /> Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
