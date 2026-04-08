import { useEffect, useMemo, useRef, useState } from "react";
import { addAuditEntry, getAuditLogForEntity } from "../../utils/auditUtils";
import {
  DEPARTMENTS,
  type DepartmentInfo,
  type JambStudent,
  addJambStudent,
  deleteJambStudent,
  getAllJambStudents,
  getDeptStudents,
  getJambStats,
  initJambStudents,
  isJambRegNoDuplicate,
  updateJambStudent,
} from "../../utils/jambData";

// ─── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3500);
  };
  return { msg, show };
}

// ─── Color maps ───────────────────────────────────────────────────────────────

const DEPT_HEADER_COLORS: Record<string, string> = {
  BIO: "bg-emerald-700",
  CHE: "bg-sky-700",
  MTH: "bg-violet-700",
  PHY: "bg-orange-700",
  CSC: "bg-blue-700",
  ENT: "bg-amber-700",
  HED: "bg-rose-700",
  HKE: "bg-teal-700",
};
const DEPT_CARD_COLORS: Record<string, string> = {
  BIO: "border-emerald-400 bg-emerald-50 text-emerald-900",
  CHE: "border-sky-400 bg-sky-50 text-sky-900",
  MTH: "border-violet-400 bg-violet-50 text-violet-900",
  PHY: "border-orange-400 bg-orange-50 text-orange-900",
  CSC: "border-blue-400 bg-blue-50 text-blue-900",
  ENT: "border-amber-400 bg-amber-50 text-amber-900",
  HED: "border-rose-400 bg-rose-50 text-rose-900",
  HKE: "border-teal-400 bg-teal-50 text-teal-900",
};
const DEPT_TAB_ACTIVE: Record<string, string> = {
  BIO: "bg-emerald-700 text-white",
  CHE: "bg-sky-700 text-white",
  MTH: "bg-violet-700 text-white",
  PHY: "bg-orange-700 text-white",
  CSC: "bg-blue-700 text-white",
  ENT: "bg-amber-700 text-white",
  HED: "bg-rose-700 text-white",
  HKE: "bg-teal-700 text-white",
};

const STATUS_COLORS: Record<string, string> = {
  Admitted: "bg-green-100 text-green-800",
  Deferred: "bg-amber-100 text-amber-800",
  Waitlisted: "bg-blue-100 text-blue-800",
  Withdrawn: "bg-red-100 text-red-800",
};

const PRINT_STYLE = `
@media print {
  .no-print { display: none !important; }
  @page { size: A4 landscape; margin: 12mm; }
  table { border-collapse: collapse; width: 100%; font-size: 10pt; }
  th, td { border: 1px solid #000; padding: 3px 6px; }
  thead { background: #1e3a5f !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .dept-header-row td { background: #2563eb !important; color: #fff !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterState = {
  search: string;
  statusFilter: string;
  sessionFilter: string;
  levelFilter: string;
};

const BLANK_FILTER: FilterState = {
  search: "",
  statusFilter: "all",
  sessionFilter: "all",
  levelFilter: "all",
};

type FormData = {
  jambRegNo: string;
  fullName: string;
  deptCode: string;
  state: string;
  lga: string;
  sex: "M" | "F";
  status: string;
  session: string;
  level: string;
  email: string;
};

const BLANK_FORM: FormData = {
  jambRegNo: "",
  fullName: "",
  deptCode: "CSC",
  state: "",
  lga: "",
  sex: "M",
  status: "Admitted",
  session: "2025/2026",
  level: "NCE I",
  email: "",
};

// ─── Student Row ──────────────────────────────────────────────────────────────

function StudentRow({
  student,
  idx,
  showDept,
  onEdit,
  onDelete,
  onView,
}: {
  student: JambStudent;
  idx: number;
  showDept: boolean;
  onEdit: (s: JambStudent) => void;
  onDelete: (s: JambStudent) => void;
  onView: (s: JambStudent) => void;
}) {
  return (
    <tr className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
      <td className="px-2 py-1.5 text-sm text-slate-500 text-center w-8">
        {student.sn}
      </td>
      <td className="px-2 py-1.5 text-sm font-mono font-semibold text-blue-700 whitespace-nowrap">
        {student.matricNumber}
      </td>
      <td className="px-2 py-1.5 text-sm font-mono text-slate-600 whitespace-nowrap">
        {student.jambRegNo}
      </td>
      <td className="px-2 py-1.5 text-sm font-medium text-slate-800">
        <button
          type="button"
          onClick={() => onView(student)}
          className="hover:text-blue-700 hover:underline text-left"
        >
          {student.fullName}
        </button>
      </td>
      {showDept && (
        <td className="px-2 py-1.5 text-xs text-slate-600">
          {student.department}
        </td>
      )}
      <td className="px-2 py-1.5 text-sm text-slate-600">{student.state}</td>
      <td className="px-2 py-1.5 text-sm text-slate-600">{student.lga}</td>
      <td className="px-2 py-1.5 text-sm text-center">
        <span
          className={
            student.sex === "F"
              ? "text-pink-600 font-semibold"
              : "text-blue-600 font-semibold"
          }
        >
          {student.sex}
        </span>
      </td>
      <td className="px-2 py-1.5 text-sm text-center">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[student.status] ?? "bg-slate-100 text-slate-700"}`}
        >
          {student.status}
        </span>
      </td>
      <td className="px-2 py-1.5 no-print">
        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => onView(student)}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded"
            title="View"
          >
            👁
          </button>
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded"
            title="Edit"
          >
            ✏
          </button>
          <button
            type="button"
            onClick={() => onDelete(student)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Dept Group ───────────────────────────────────────────────────────────────

function DeptGroup({
  dept,
  students,
  filter,
  onEdit,
  onDelete,
  onView,
}: {
  dept: DepartmentInfo;
  students: JambStudent[];
  filter: FilterState;
  onEdit: (s: JambStudent) => void;
  onDelete: (s: JambStudent) => void;
  onView: (s: JambStudent) => void;
}) {
  const filtered = applyFilters(students, filter);
  if (filtered.length === 0) return null;
  return (
    <tbody>
      <tr
        className={`${DEPT_HEADER_COLORS[dept.code]} text-white dept-header-row`}
      >
        <td colSpan={10} className="px-3 py-2 text-sm font-bold tracking-wide">
          {dept.fullName} — {filtered.length} student
          {filtered.length !== 1 ? "s" : ""}
        </td>
      </tr>
      {filtered.map((s, i) => (
        <StudentRow
          key={s.id}
          student={s}
          idx={i}
          showDept={false}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </tbody>
  );
}

function applyFilters(students: JambStudent[], f: FilterState): JambStudent[] {
  return students.filter((s) => {
    const q = f.search.toLowerCase();
    const matchSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.jambRegNo.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.lga.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.sex.toLowerCase().includes(q);
    const matchStatus = f.statusFilter === "all" || s.status === f.statusFilter;
    const matchSession =
      f.sessionFilter === "all" || s.session === f.sessionFilter;
    const matchLevel = f.levelFilter === "all" || s.level === f.levelFilter;
    return matchSearch && matchStatus && matchSession && matchLevel;
  });
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(students: JambStudent[], filename: string) {
  const headers = [
    "S/N",
    "Matric Number",
    "JAMB Reg No",
    "Full Name",
    "Department",
    "State",
    "LGA",
    "Sex",
    "Status",
    "Session",
    "Level",
    "Email",
  ];
  const rows = students.map((s) => [
    s.sn,
    s.matricNumber,
    s.jambRegNo,
    `"${s.fullName}"`,
    `"${s.department}"`,
    s.state,
    s.lga,
    s.sex,
    s.status,
    s.session,
    s.level,
    s.email,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Student Form Modal ───────────────────────────────────────────────────────

function StudentFormModal({
  mode,
  initial,
  onSave,
  onClose,
}: {
  mode: "add" | "edit";
  initial: FormData;
  onSave: (data: FormData, error: string | null) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const set = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [err, setErr] = useState("");

  const handleSave = () => {
    if (!form.jambRegNo.trim()) return setErr("JAMB Reg No is required");
    if (!form.fullName.trim()) return setErr("Full Name is required");
    if (!form.deptCode) return setErr("Department is required");
    if (!form.state.trim()) return setErr("State is required");
    if (!form.lga.trim()) return setErr("LGA is required");
    setErr("");
    onSave(form, null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
          <h2 className="font-bold text-base">
            {mode === "add" ? "➕ Add New Student" : "✏ Edit Student"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-3">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {err}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label
                htmlFor="sf-jamb-reg"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                JAMB Reg No *
              </label>
              <input
                id="sf-jamb-reg"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.jambRegNo}
                onChange={(e) => set("jambRegNo", e.target.value)}
                placeholder="e.g. 2025XXXXX"
              />
            </div>
            <div className="col-span-2">
              <label
                htmlFor="sf-full-name"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Full Name *
              </label>
              <input
                id="sf-full-name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="sf-dept"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Department *
              </label>
              <select
                id="sf-dept"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.deptCode}
                onChange={(e) => set("deptCode", e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="sf-sex"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Sex *
              </label>
              <select
                id="sf-sex"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.sex}
                onChange={(e) => set("sex", e.target.value as "M" | "F")}
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="sf-state"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                State *
              </label>
              <input
                id="sf-state"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="sf-lga"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                LGA *
              </label>
              <input
                id="sf-lga"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.lga}
                onChange={(e) => set("lga", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="sf-status"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Status
              </label>
              <select
                id="sf-status"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {["Admitted", "Deferred", "Waitlisted", "Withdrawn"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="sf-session"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Session
              </label>
              <input
                id="sf-session"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.session}
                onChange={(e) => set("session", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="sf-level"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Level
              </label>
              <select
                id="sf-level"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
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
            <div className="col-span-2">
              <label
                htmlFor="sf-email"
                className="text-xs font-semibold text-slate-600 block mb-1"
              >
                Email (optional)
              </label>
              <input
                id="sf-email"
                type="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
          >
            {mode === "add" ? "Add Student" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  student,
  onConfirm,
  onClose,
}: { student: JambStudent; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-red-700">⚠ Delete Student</h2>
        <p className="text-sm text-slate-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{student.fullName}</span>? This cannot
          be undone.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 space-y-1">
          <p>
            <strong>Matric:</strong> {student.matricNumber}
          </p>
          <p>
            <strong>JAMB Reg:</strong> {student.jambRegNo}
          </p>
          <p>
            <strong>Department:</strong> {student.department}
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
          >
            Delete Student
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Detail Modal ─────────────────────────────────────────────────────

function StudentDetailModal({
  student,
  onClose,
  onEdit,
}: { student: JambStudent; onClose: () => void; onEdit: () => void }) {
  const auditLog = getAuditLogForEntity(student.id).slice(0, 10);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
          <h2 className="font-bold text-base">👁 Student Detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {student.fullName}
              </h3>
              <p className="text-sm text-blue-700 font-mono">
                {student.matricNumber}
              </p>
              <p className="text-sm text-slate-600">{student.department}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["JAMB Reg No", student.jambRegNo],
              ["Session", student.session],
              ["Level", student.level],
              ["Status", student.status],
              ["State", student.state],
              ["LGA", student.lga],
              ["Sex", student.sex === "F" ? "Female" : "Male"],
              ["Faculty", student.faculty],
              ["Email", student.email || "—"],
              ["Institution", student.institutionCategory],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-medium text-slate-800 truncate">{value}</p>
              </div>
            ))}
          </div>
          {auditLog.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Recent Activity
              </h4>
              <div className="space-y-1">
                {auditLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded px-2 py-1"
                  >
                    <span className="text-slate-400">
                      {new Date(entry.timestamp).toLocaleString("en-NG")}
                    </span>
                    <span className="capitalize font-medium text-blue-700">
                      {entry.action}
                    </span>
                    <span>by {entry.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
          >
            Edit Student
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function JAMBAdmissionPortal() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filter, setFilter] = useState<FilterState>(BLANK_FILTER);
  const { msg: toastMsg, show: showToast } = useToast();
  const printStyleRef = useRef(false);

  // force re-render after mutations
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<JambStudent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JambStudent | null>(null);
  const [viewTarget, setViewTarget] = useState<JambStudent | null>(null);

  useEffect(() => {
    if (printStyleRef.current) return;
    printStyleRef.current = true;
    const style = document.createElement("style");
    style.id = "jamb-print-style";
    style.textContent = PRINT_STYLE;
    document.head.appendChild(style);
    return () => {
      document.getElementById("jamb-print-style")?.remove();
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: version triggers refresh
  const allStudents = useMemo(() => getAllJambStudents(), [version]);
  const stats = useMemo(() => {
    const perDept: Record<string, number> = {};
    for (const d of DEPARTMENTS) {
      perDept[d.code] = allStudents.filter((s) => s.deptCode === d.code).length;
    }
    return { total: allStudents.length, perDept };
  }, [allStudents]);

  const displayedStudents = useMemo(() => {
    const base =
      activeTab === "all"
        ? allStudents
        : allStudents.filter((s) => s.deptCode === activeTab);
    return applyFilters(base, filter);
  }, [activeTab, allStudents, filter]);

  const clearFilters = () => setFilter(BLANK_FILTER);
  const hasActiveFilters =
    filter.search ||
    filter.statusFilter !== "all" ||
    filter.sessionFilter !== "all" ||
    filter.levelFilter !== "all";

  // ── CRUD handlers ──

  const handleAdd = (data: FormData) => {
    if (isJambRegNoDuplicate(data.jambRegNo)) {
      showToast("❌ JAMB Reg No already exists!");
      return;
    }
    const dept = DEPARTMENTS.find((d) => d.code === data.deptCode);
    const newStudent = addJambStudent({
      jambRegNo: data.jambRegNo,
      fullName: data.fullName,
      department: dept?.fullName ?? data.deptCode,
      deptCode: data.deptCode,
      faculty: "Faculty of Science Education",
      state: data.state,
      lga: data.lga,
      sex: data.sex,
      status: data.status,
      session: data.session,
      level: data.level,
      institutionCategory: "college_of_education",
      email:
        data.email ||
        `${data.fullName.split(" ")[0].toLowerCase()}@fuek.edu.ng`,
    });
    addAuditEntry(
      "add",
      "jamb_student",
      newStudent.id,
      data.fullName,
      "Admin",
      { after: data as unknown as Record<string, unknown> },
    );
    refresh();
    setShowAdd(false);
    showToast(`✅ ${data.fullName} added successfully!`);
  };

  const handleEdit = (data: FormData) => {
    if (!editTarget) return;
    if (isJambRegNoDuplicate(data.jambRegNo, editTarget.id)) {
      showToast("❌ JAMB Reg No already used by another student!");
      return;
    }
    const before = { ...editTarget };
    const dept = DEPARTMENTS.find((d) => d.code === data.deptCode);
    const updated: JambStudent = {
      ...editTarget,
      jambRegNo: data.jambRegNo,
      fullName: data.fullName,
      department: dept?.fullName ?? data.deptCode,
      deptCode: data.deptCode,
      state: data.state,
      lga: data.lga,
      sex: data.sex,
      status: data.status,
      session: data.session,
      level: data.level,
      email: data.email,
    };
    updateJambStudent(updated);
    addAuditEntry(
      "edit",
      "jamb_student",
      editTarget.id,
      data.fullName,
      "Admin",
      {
        before: before as unknown as Record<string, unknown>,
        after: updated as unknown as Record<string, unknown>,
      },
    );
    refresh();
    setEditTarget(null);
    showToast(`✅ ${data.fullName} updated successfully!`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteJambStudent(deleteTarget.id);
    addAuditEntry(
      "delete",
      "jamb_student",
      deleteTarget.id,
      deleteTarget.fullName,
      "Admin",
      { note: "Deleted from JAMB portal" },
    );
    refresh();
    setDeleteTarget(null);
    showToast(`🗑 ${deleteTarget.fullName} deleted`);
  };

  const handleSync = () => {
    initJambStudents();
    showToast(
      `✅ ${stats.total} JAMB students synced to Student Records successfully!`,
    );
  };

  const activeDept = DEPARTMENTS.find((d) => d.code === activeTab);
  const tableHeaders = [
    "S/N",
    "Matric Number",
    "JAMB Reg No",
    "Full Name",
    ...(activeTab === "all" ? ["Department"] : []),
    "State",
    "LGA",
    "Sex",
    "Status",
    "Actions",
  ];

  const editFormData: FormData | null = editTarget
    ? {
        jambRegNo: editTarget.jambRegNo,
        fullName: editTarget.fullName,
        deptCode: editTarget.deptCode,
        state: editTarget.state,
        lga: editTarget.lga,
        sex: editTarget.sex as "M" | "F",
        status: editTarget.status,
        session: editTarget.session,
        level: editTarget.level,
        email: editTarget.email,
      }
    : null;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="no-print fixed top-4 right-4 z-[100] bg-green-700 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <StudentFormModal
          mode="add"
          initial={BLANK_FORM}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editTarget && editFormData && (
        <StudentFormModal
          mode="edit"
          initial={editFormData}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          student={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {viewTarget && (
        <StudentDetailModal
          student={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => {
            setEditTarget(viewTarget);
            setViewTarget(null);
          }}
        />
      )}

      {/* Print-only header */}
      <div className="hidden print:block mb-4 text-center">
        <p className="text-base font-bold uppercase">
          Federal University of Education, Kontagora
        </p>
        <p className="text-sm font-semibold">Faculty of Science Education</p>
        <p className="text-sm">
          Admitted Students List — 2025/2026 Academic Session
        </p>
        {activeDept && (
          <p className="text-sm font-semibold mt-1">{activeDept.fullName}</p>
        )}
        <hr className="my-2" />
      </div>

      {/* Screen header */}
      <div className="no-print">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-5 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                JAMB Admission Portal — 2025/2026 Academic Session
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Federal University of Education, Kontagora &nbsp;|&nbsp; Faculty
                of Science Education
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="bg-white text-blue-900 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                data-ocid="jamb-add-btn"
              >
                ➕ Add Student
              </button>
              <button
                type="button"
                onClick={handleSync}
                className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                data-ocid="jamb-sync-btn"
              >
                🔄 Sync to Records
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Total Admitted", value: stats.total },
              { label: "Departments", value: DEPARTMENTS.length },
              { label: "Academic Session", value: "2025/2026" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 rounded-lg p-3 text-center"
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
          {DEPARTMENTS.map((dept) => (
            <button
              type="button"
              key={dept.code}
              onClick={() => {
                setActiveTab(dept.code);
                setFilter(BLANK_FILTER);
              }}
              className={`border-2 rounded-lg p-2 text-center cursor-pointer transition-all hover:shadow-md ${DEPT_CARD_COLORS[dept.code]} ${activeTab === dept.code ? "ring-2 ring-offset-1 ring-blue-500 shadow-lg scale-105" : ""}`}
              data-ocid={`dept-card-${dept.code.toLowerCase()}`}
            >
              <p className="text-xl font-bold">
                {stats.perDept[dept.code] ?? 0}
              </p>
              <p className="text-xs font-semibold leading-tight mt-0.5">
                {dept.code}
              </p>
              <p className="text-xs leading-tight opacity-80 mt-0.5">
                {dept.name}
              </p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setFilter(BLANK_FILTER);
            }}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "all" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            data-ocid="tab-all"
          >
            All Depts{" "}
            <span className="ml-1.5 text-xs opacity-80">({stats.total})</span>
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              type="button"
              key={dept.code}
              onClick={() => {
                setActiveTab(dept.code);
                setFilter(BLANK_FILTER);
              }}
              className={`px-3 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === dept.code ? DEPT_TAB_ACTIVE[dept.code] : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              data-ocid={`tab-${dept.code.toLowerCase()}`}
            >
              {dept.code}{" "}
              <span className="ml-1 text-xs opacity-80">
                ({stats.perDept[dept.code]})
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-3 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search by name, JAMB Reg, State, LGA, email..."
              value={filter.search}
              onChange={(e) =>
                setFilter((f) => ({ ...f, search: e.target.value }))
              }
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-0"
              data-ocid="jamb-search"
            />
            <select
              value={filter.statusFilter}
              onChange={(e) =>
                setFilter((f) => ({ ...f, statusFilter: e.target.value }))
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Status</option>
              {["Admitted", "Deferred", "Waitlisted", "Withdrawn"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={filter.sessionFilter}
              onChange={(e) =>
                setFilter((f) => ({ ...f, sessionFilter: e.target.value }))
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Sessions</option>
              {["2024/2025", "2025/2026", "2023/2024"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={filter.levelFilter}
              onChange={(e) =>
                setFilter((f) => ({ ...f, levelFilter: e.target.value }))
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {displayedStudents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {stats.total}
              </span>{" "}
              students
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-full font-medium transition-colors"
              >
                ✕ Clear Filters
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() =>
                  exportCSV(
                    displayedStudents,
                    activeTab === "all"
                      ? "FUEK_JAMB_2025_All.csv"
                      : `FUEK_JAMB_2025_${activeTab}.csv`,
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                data-ocid="jamb-export-csv"
              >
                ⬇ Export CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                data-ocid="jamb-print"
              >
                🖨 Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-blue-900 text-white">
              <tr>
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {activeTab === "all" ? (
              DEPARTMENTS.map((dept) => (
                <DeptGroup
                  key={dept.code}
                  dept={dept}
                  students={allStudents.filter((s) => s.deptCode === dept.code)}
                  filter={filter}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  onView={setViewTarget}
                />
              ))
            ) : (
              <tbody>
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-slate-400 text-sm"
                    >
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((s, i) => (
                    <StudentRow
                      key={s.id}
                      student={s}
                      idx={i}
                      showDept={false}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                      onView={setViewTarget}
                    />
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Print footer */}
      <div className="hidden print:block mt-4 text-xs text-center text-slate-500 border-t pt-2">
        FUEK MIS &nbsp;|&nbsp; Date Printed:{" "}
        {new Date().toLocaleDateString("en-NG")} &nbsp;|&nbsp; 2025/2026
        Academic Session
      </div>

      {/* Per-dept action bar */}
      {activeTab !== "all" && activeDept && (
        <div className="no-print flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm flex-wrap gap-2">
          <span className="font-semibold text-slate-700">
            {activeDept.fullName} —{" "}
            {allStudents.filter((s) => s.deptCode === activeTab).length} total
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              ➕ Add to {activeDept.code}
            </button>
            <button
              type="button"
              onClick={() =>
                exportCSV(displayedStudents, `FUEK_JAMB_2025_${activeTab}.csv`)
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
              data-ocid="jamb-dept-export"
            >
              Export {activeDept.code} CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
              data-ocid="jamb-dept-print"
            >
              Print {activeDept.code} List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
