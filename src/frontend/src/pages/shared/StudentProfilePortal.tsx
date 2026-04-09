import { useEffect, useRef, useState } from "react";
import { useCamera } from "../../camera/useCamera";
import {
  addAuditEntry,
  fileToBase64,
  getAuditLogForEntity,
  getPhoto,
  savePhoto,
} from "../../utils/auditUtils";
import {
  DEPARTMENTS,
  type JambStudent,
  getAllJambStudents,
  updateJambStudent,
} from "../../utils/jambData";
import {
  type StudentProgrammeType,
  type StudentRecord,
  getLocalStudents,
  saveLocalStudents,
} from "../../utils/sampleData";

// ─── Extended Student Profile ────────────────────────────────────────────────

interface StudentProfile extends StudentRecord {
  jambRegNo?: string;
  sex?: string;
  state?: string;
  lga?: string;
  session?: string;
  faculty?: string;
  deptCode?: string;
  status?: string;
  dob?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  nationality?: string;
}

const PROGRAMME_LABELS: Record<StudentProgrammeType, string> = {
  "full-time": "Full-Time Studies",
  "distance-learning": "Distance Learning",
  "part-time": "Part-Time Studies",
};

const PROGRAMME_BADGE_STYLES: Record<StudentProgrammeType, string> = {
  "full-time": "bg-blue-500/80 text-white",
  "distance-learning": "bg-indigo-500/80 text-white",
  "part-time": "bg-emerald-500/80 text-white",
};

function getProgrammeLabel(pt: StudentProgrammeType | undefined): string {
  if (!pt) return "Full-Time Studies";
  return PROGRAMME_LABELS[pt] ?? "Full-Time Studies";
}

function getProgrammeBadgeStyle(pt: StudentProgrammeType | undefined): string {
  if (!pt) return PROGRAMME_BADGE_STYLES["full-time"];
  return PROGRAMME_BADGE_STYLES[pt] ?? PROGRAMME_BADGE_STYLES["full-time"];
}

function mergeStudentData(): StudentProfile[] {
  const base = getLocalStudents();
  const jamb = getAllJambStudents();
  const jambMap = new Map<string, JambStudent>(
    jamb.map((j) => [j.matricNumber, j]),
  );
  return base.map((s) => {
    const j = jambMap.get(s.matricNumber);
    return j
      ? {
          ...s,
          jambRegNo: j.jambRegNo,
          sex: j.sex,
          state: j.state,
          lga: j.lga,
          session: j.session,
          faculty: j.faculty,
          deptCode: j.deptCode,
          status: j.status,
        }
      : s;
  });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  id,
  name,
  size = "md",
}: { id: string; name: string; size?: "sm" | "md" | "lg" }) {
  const photo = getPhoto(id);
  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-sm"
      : size === "lg"
        ? "w-20 h-20 text-2xl"
        : "w-12 h-12 text-base";
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border-2 border-white shadow`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Photo Uploader ───────────────────────────────────────────────────────────

function PhotoUploader({
  studentId,
  onSaved,
}: { studentId: string; onSaved: () => void }) {
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
    const b64 = await fileToBase64(f);
    setPreview(b64);
    setMode("preview");
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const b64 = await fileToBase64(file);
    setPreview(b64);
    await stopCamera();
    setMode("preview");
  };

  const handleSave = () => {
    if (!preview) return;
    savePhoto(studentId, preview);
    onSaved();
    setMode("idle");
    setPreview(null);
  };

  const handleStartCamera = async () => {
    setMode("camera");
    await startCamera();
  };

  return (
    <div className="space-y-2">
      {mode === "idle" && (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleStartCamera}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-medium"
          >
            📷 Webcam
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium"
          >
            📁 Upload Photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}
      {mode === "camera" && (
        <div className="space-y-2">
          {isLoading && (
            <p className="text-xs text-slate-500">Starting camera...</p>
          )}
          {error && (
            <p className="text-xs text-red-600">
              Camera error: {error.message}
            </p>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-xs rounded-lg border"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            {isActive && (
              <button
                type="button"
                onClick={handleCapture}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                📸 Capture
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await stopCamera();
                setMode("idle");
              }}
              className="text-xs border px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {mode === "preview" && preview && (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-300 shadow"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              ✅ Save Photo
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setPreview(null);
              }}
              className="text-xs border px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Profile View ─────────────────────────────────────────────────────

function StudentProfileView({
  student,
  isAdmin,
  onBack,
  onSaved,
}: {
  student: StudentProfile;
  isAdmin: boolean;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<StudentProfile>({ ...student });
  const [photoVersion, setPhotoVersion] = useState(0);
  const [showDelete, setShowDelete] = useState(false);

  const set = (k: keyof StudentProfile, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    const students = getLocalStudents();
    const before = students.find(
      (s) => s.matricNumber === student.matricNumber,
    );
    const updated = students.map((s) =>
      s.matricNumber === student.matricNumber
        ? {
            ...s,
            name: form.name,
            email: form.email,
            level: form.level,
            department: form.department,
            studyMode: form.studyMode,
          }
        : s,
    );
    saveLocalStudents(updated);

    // Also update JAMB record if applicable
    const jamb = getAllJambStudents();
    const jambRec = jamb.find((j) => j.matricNumber === student.matricNumber);
    if (jambRec) {
      updateJambStudent({
        ...jambRec,
        fullName: form.name,
        email: form.email,
        state: form.state ?? jambRec.state,
        lga: form.lga ?? jambRec.lga,
        status: form.status ?? jambRec.status,
      });
    }

    addAuditEntry(
      "edit",
      "student",
      student.matricNumber,
      form.name,
      isAdmin ? "Admin" : "Student",
      {
        before: before as unknown as Record<string, unknown>,
        after: form as unknown as Record<string, unknown>,
      },
    );
    setEditing(false);
    onSaved();
  };

  const handleDelete = () => {
    const students = getLocalStudents();
    saveLocalStudents(
      students.filter((s) => s.matricNumber !== student.matricNumber),
    );
    addAuditEntry(
      "delete",
      "student",
      student.matricNumber,
      student.name,
      "Admin",
      { note: "Deleted from Student Profile Portal" },
    );
    onBack();
    onSaved();
  };

  const readOnly = !isAdmin;
  const auditLog = getAuditLogForEntity(student.matricNumber).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-700 hover:underline flex items-center gap-1"
        >
          ← Back to list
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 text-white flex items-start gap-4">
          <div key={photoVersion}>
            <Avatar id={student.matricNumber} name={student.name} size="lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-blue-200 font-mono text-sm">
              {student.matricNumber}
            </p>
            <p className="text-blue-200 text-sm">
              {student.department} · {student.level}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {student.status && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${student.status === "Admitted" ? "bg-green-500" : "bg-amber-500"} text-white`}
                >
                  {student.status}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getProgrammeBadgeStyle(student.studyMode as StudentProgrammeType | undefined)}`}
              >
                {getProgrammeLabel(
                  student.studyMode as StudentProgrammeType | undefined,
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
              >
                ✏ Edit Profile
              </button>
            )}
            {isAdmin && !editing && (
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
              >
                🗑 Delete
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Photo management */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Profile Photo
            </h3>
            <PhotoUploader
              studentId={student.matricNumber}
              onSaved={() => setPhotoVersion((v) => v + 1)}
            />
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 border-b pb-1">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField
                label="Full Name"
                value={form.name}
                editing={editing}
                onChange={(v) => set("name", v)}
              />
              <ProfileField
                label="Date of Birth"
                value={form.dob ?? ""}
                editing={editing}
                onChange={(v) => set("dob", v)}
                type="date"
              />
              <ProfileField
                label="Sex"
                value={form.sex ?? ""}
                editing={editing}
                onChange={(v) => set("sex", v)}
                readOnly={readOnly}
              />
              <ProfileField
                label="Nationality"
                value={form.nationality ?? "Nigerian"}
                editing={editing}
                onChange={(v) => set("nationality", v)}
              />
              <ProfileField
                label="State of Origin"
                value={form.state ?? ""}
                editing={editing}
                onChange={(v) => set("state", v)}
              />
              <ProfileField
                label="LGA"
                value={form.lga ?? ""}
                editing={editing}
                onChange={(v) => set("lga", v)}
              />
              <ProfileField
                label="Address"
                value={form.address ?? ""}
                editing={editing}
                onChange={(v) => set("address", v)}
                className="sm:col-span-2"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 border-b pb-1">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField
                label="Phone"
                value={form.phone ?? ""}
                editing={editing}
                onChange={(v) => set("phone", v)}
              />
              <ProfileField
                label="Email"
                value={form.email}
                editing={editing}
                onChange={(v) => set("email", v)}
              />
              <ProfileField
                label="Guardian Name"
                value={form.guardianName ?? ""}
                editing={editing}
                onChange={(v) => set("guardianName", v)}
              />
              <ProfileField
                label="Guardian Phone"
                value={form.guardianPhone ?? ""}
                editing={editing}
                onChange={(v) => set("guardianPhone", v)}
              />
              <ProfileField
                label="Guardian Relationship"
                value={form.guardianRelationship ?? ""}
                editing={editing}
                onChange={(v) => set("guardianRelationship", v)}
              />
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 border-b pb-1">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField
                label="Matric Number"
                value={form.matricNumber}
                editing={false}
                onChange={() => {}}
                readOnly
              />
              <ProfileField
                label="JAMB Reg No"
                value={form.jambRegNo ?? "—"}
                editing={false}
                onChange={() => {}}
                readOnly
              />
              <ProfileField
                label="Department"
                value={form.department}
                editing={isAdmin && editing}
                onChange={(v) => set("department", v)}
              />
              <ProfileField
                label="Faculty"
                value={form.faculty ?? "Faculty of Science Education"}
                editing={false}
                onChange={() => {}}
                readOnly
              />
              <ProfileField
                label="Level"
                value={form.level}
                editing={isAdmin && editing}
                onChange={(v) => set("level", v)}
              />
              <ProfileField
                label="Session"
                value={form.session ?? "2025/2026"}
                editing={false}
                onChange={() => {}}
                readOnly
              />
              <ProfileField
                label="Programme"
                value={form.institutionCategory ?? "college_of_education"}
                editing={false}
                onChange={() => {}}
                readOnly
              />
              <ProfileField
                label="Admission Status"
                value={form.status ?? "Admitted"}
                editing={isAdmin && editing}
                onChange={(v) => set("status", v)}
              />
              {/* Programme Type — editable by student and admin */}
              <div className={editing ? "" : ""}>
                <p className="text-xs text-slate-500 mb-1">Programme Type</p>
                {editing ? (
                  <select
                    value={form.studyMode ?? "full-time"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        studyMode: e.target.value as StudentProgrammeType,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="full-time">Full-Time Studies</option>
                    <option value="distance-learning">Distance Learning</option>
                    <option value="part-time">Part-Time Studies</option>
                  </select>
                ) : (
                  <p
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${getProgrammeBadgeStyle(form.studyMode as StudentProgrammeType | undefined)}`}
                  >
                    {getProgrammeLabel(
                      form.studyMode as StudentProgrammeType | undefined,
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Audit trail */}
          {auditLog.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Recent Activity
              </h3>
              <div className="space-y-1">
                {auditLog.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded px-2 py-1.5"
                  >
                    <span className="text-slate-400">
                      {new Date(e.timestamp).toLocaleString("en-NG")}
                    </span>
                    <span className="capitalize font-medium text-blue-700">
                      {e.action}
                    </span>
                    <span>by {e.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {editing && (
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-semibold"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({ ...student });
                }}
                className="border px-5 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print text-xs text-slate-600 border px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
          >
            🖨 Print Profile
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-red-700">
              ⚠ Delete Student Profile
            </h2>
            <p className="text-sm text-slate-700">
              Are you sure you want to permanently delete{" "}
              <strong>{student.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  readOnly = false,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {editing && !readOnly ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <p className="text-sm font-medium text-slate-800 bg-slate-50 rounded-lg px-3 py-1.5 min-h-[2rem]">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StudentProfilePortalProps {
  userRole: "admin" | "student" | "lecturer" | "hod" | "hr" | "bursary";
  userEmail?: string;
}

export function StudentProfilePortal({
  userRole,
  userEmail,
}: StudentProfilePortalProps) {
  const isAdmin = userRole === "admin";
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewing, setViewing] = useState<StudentProfile | null>(null);
  const [version, setVersion] = useState(0);

  // Create-profile form state (shown when student has no record)
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: userEmail ?? "",
    phone: "",
    department: DEPARTMENTS[0]?.name ?? "Computer Science",
    level: "100",
    dob: "",
    gender: "Male",
  });
  const [createSaved, setCreateSaved] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: version triggers reload
  useEffect(() => {
    const merged = mergeStudentData();
    setStudents(merged);

    // For student role: find their own profile
    if (!isAdmin && userEmail) {
      const own = merged.find(
        (s) => s.email?.toLowerCase() === userEmail.toLowerCase(),
      );
      if (own) setViewing(own);
    }
  }, [version, isAdmin, userEmail]);

  const depts = [...new Set(students.map((s) => s.department))].sort();

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.matricNumber.toLowerCase().includes(q) ||
        (s.jambRegNo?.toLowerCase().includes(q) ?? false) ||
        (s.email?.toLowerCase().includes(q) ?? false);
      return (
        matchSearch &&
        (deptFilter === "all" || s.department === deptFilter) &&
        (levelFilter === "all" || s.level === levelFilter) &&
        (sexFilter === "all" || (s.sex ?? "") === sexFilter) &&
        (statusFilter === "all" || (s.status ?? "Admitted") === statusFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "matric")
        return a.matricNumber.localeCompare(b.matricNumber);
      return 0;
    });

  if (viewing) {
    return (
      <StudentProfileView
        student={viewing}
        isAdmin={isAdmin}
        onBack={() => setViewing(null)}
        onSaved={() => {
          setVersion((v) => v + 1);
          setViewing(null);
        }}
      />
    );
  }

  // Student role — no list, show own profile only (handled above)
  if (!isAdmin) {
    // Show success confirmation after creating profile
    if (createSaved) {
      return (
        <div className="p-8 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Profile Created!
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your student profile has been saved. It will appear here going
            forward.
          </p>
          <button
            type="button"
            onClick={() => {
              setCreateSaved(false);
              setVersion((v) => v + 1);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            View My Profile
          </button>
        </div>
      );
    }

    // Show create-profile form
    if (creating) {
      const handleCreate = () => {
        if (!createForm.name.trim()) return;
        const newMatric = `STU/${Date.now().toString().slice(-6)}`;
        const newRecord: StudentProfile = {
          matricNumber: newMatric,
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          level: createForm.level,
          department: createForm.department,
          dob: createForm.dob,
          phone: createForm.phone,
          sex: createForm.gender,
        };
        const existing = getLocalStudents();
        saveLocalStudents([...existing, newRecord]);
        addAuditEntry(
          "add",
          "student",
          newMatric,
          newRecord.name,
          userEmail ?? "student",
          { after: newRecord as unknown as Record<string, unknown> },
        );
        setCreateSaved(true);
        setCreating(false);
      };

      const field = (
        label: string,
        key: keyof typeof createForm,
        type = "text",
      ) => (
        <div>
          <label
            htmlFor={`create-${key}`}
            className="text-xs font-medium text-slate-600 block mb-1"
          >
            {label}
          </label>
          <input
            id={`create-${key}`}
            type={type}
            value={createForm[key]}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, [key]: e.target.value }))
            }
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      );

      return (
        <div className="max-w-lg mx-auto p-6">
          <div className="bg-card border rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Create Your Profile
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                No profile was found for your account. Fill in your details
                below to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {field("Full Name *", "name")}
              {field("Email Address", "email", "email")}
              {field("Phone Number", "phone", "tel")}
              {field("Date of Birth", "dob", "date")}

              <div>
                <label
                  htmlFor="create-department"
                  className="text-xs font-medium text-slate-600 block mb-1"
                >
                  Department *
                </label>
                <select
                  id="create-department"
                  value={createForm.department}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, department: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="create-level"
                  className="text-xs font-medium text-slate-600 block mb-1"
                >
                  Level *
                </label>
                <select
                  id="create-level"
                  value={createForm.level}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, level: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {[
                    "100",
                    "200",
                    "300",
                    "400",
                    "NCE I",
                    "NCE II",
                    "NCE III",
                    "ND I",
                    "ND II",
                    "HND I",
                    "HND II",
                  ].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="create-gender"
                  className="text-xs font-medium text-slate-600 block mb-1"
                >
                  Gender
                </label>
                <select
                  id="create-gender"
                  value={createForm.gender}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, gender: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!createForm.name.trim()}
                data-ocid="profile.create.submit"
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default: profile not found prompt
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          No Profile Found
        </h2>
        <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
          Your student profile hasn't been set up yet. You can create one now or
          contact the registry for assistance.
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          data-ocid="profile.create.open"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Create My Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Student Profiles
          </h1>
          <p className="text-muted-foreground text-sm">
            {students.length} students · click a row to view full profile
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name, matric, JAMB reg, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Departments</option>
            {depts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Levels</option>
            {[
              "100",
              "200",
              "300",
              "400",
              "NCE I",
              "NCE II",
              "NCE III",
              "ND I",
              "ND II",
              "HND I",
              "HND II",
            ].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Sexes</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            {["Admitted", "Active", "Deferred", "Withdrawn"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="matric">Matric No</option>
          </select>
          {(search ||
            deptFilter !== "all" ||
            levelFilter !== "all" ||
            sexFilter !== "all" ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDeptFilter("all");
                setLevelFilter("all");
                setSexFilter("all");
                setStatusFilter("all");
              }}
              className="text-sm text-slate-600 border px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              ✕ Clear
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {students.length} students
        </p>
      </div>

      {/* Student grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border rounded-xl p-10 text-center text-muted-foreground">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">No students found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((s) => {
            const photo = getPhoto(s.matricNumber);
            return (
              <button
                type="button"
                key={s.matricNumber}
                onClick={() => setViewing(s)}
                className="bg-card border rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all group"
                data-ocid={`student-card-${s.matricNumber}`}
              >
                <div className="flex items-start gap-3">
                  {photo ? (
                    <img
                      src={photo}
                      alt={s.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-blue-700">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {s.matricNumber}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.department}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {s.level}
                      </span>
                      {s.sex && (
                        <span
                          className={`text-xs font-medium ${s.sex === "F" ? "text-pink-600" : "text-blue-600"}`}
                        >
                          {s.sex === "F" ? "Female" : "Male"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
