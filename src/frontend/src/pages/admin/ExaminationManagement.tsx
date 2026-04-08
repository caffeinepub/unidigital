import {
  AlertCircle,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  ClipboardList,
  Edit,
  Eye,
  Plus,
  Printer,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { getLocalStaff, getLocalStudents } from "../../utils/sampleData";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExamVenue {
  id: string;
  name: string;
  capacity: number;
  type: "hall" | "lab" | "classroom" | "outdoor";
  location: string;
  available: boolean;
}

interface ExamEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  startTime: string;
  duration: number;
  venueId: string;
  level: string;
  department: string;
  chiefSupervisorId: string;
  invigilatorIds: string[];
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

interface InvigilationRecord {
  id: string;
  examId: string;
  staffId: string;
  role: "chief-invigilator" | "invigilator" | "observer";
  attended: boolean;
}

interface AttendanceEntry {
  matricNumber: string;
  studentName: string;
  present: boolean;
  seatNumber: string;
}

interface MalpracticeReport {
  id: string;
  examId: string;
  examDate: string;
  courseCode: string;
  reportedBy: string;
  studentMatric: string;
  studentName: string;
  offenseType: string;
  description: string;
  evidence: string;
  recommendedAction: string;
  status: "pending" | "under-investigation" | "resolved" | "dismissed";
  createdAt: string;
  adminNotes?: string;
}

interface ConflictAlert {
  type: "venue" | "supervisor";
  message: string;
  examIds: string[];
}

const LS = {
  timetable: "unidigital_exam_timetable",
  venues: "unidigital_venues",
  invigilation: "unidigital_invigilation",
  malpractice: "unidigital_malpractice_reports",
  attendance: "unidigital_exam_attendance",
};

const SEED_VENUES: ExamVenue[] = [
  {
    id: "V001",
    name: "Main Examination Hall",
    capacity: 500,
    type: "hall",
    location: "Block A, Ground Floor",
    available: true,
  },
  {
    id: "V002",
    name: "Science Laboratory Complex",
    capacity: 150,
    type: "lab",
    location: "Science Block",
    available: true,
  },
  {
    id: "V003",
    name: "ICT Hall",
    capacity: 200,
    type: "hall",
    location: "ICT Building",
    available: true,
  },
  {
    id: "V004",
    name: "Faculty Lecture Hall 1",
    capacity: 300,
    type: "hall",
    location: "Faculty Building",
    available: true,
  },
  {
    id: "V005",
    name: "Mini Hall B",
    capacity: 100,
    type: "classroom",
    location: "Block B, 1st Floor",
    available: true,
  },
];

const SEED_EXAMS: ExamEntry[] = [
  {
    id: "EX001",
    courseCode: "CSC301",
    courseTitle: "Data Structures & Algorithms",
    date: "2025-06-10",
    startTime: "09:00",
    duration: 180,
    venueId: "V001",
    level: "300",
    department: "Computer Science",
    chiefSupervisorId: "",
    invigilatorIds: [],
    status: "scheduled",
  },
  {
    id: "EX002",
    courseCode: "MAT201",
    courseTitle: "Mathematical Methods II",
    date: "2025-06-11",
    startTime: "10:00",
    duration: 120,
    venueId: "V004",
    level: "200",
    department: "Mathematics",
    chiefSupervisorId: "",
    invigilatorIds: [],
    status: "scheduled",
  },
  {
    id: "EX003",
    courseCode: "PHY101",
    courseTitle: "General Physics I",
    date: "2025-06-12",
    startTime: "08:00",
    duration: 180,
    venueId: "V001",
    level: "100",
    department: "Physics",
    chiefSupervisorId: "",
    invigilatorIds: [],
    status: "scheduled",
  },
  {
    id: "EX004",
    courseCode: "CSC201",
    courseTitle: "Object-Oriented Programming",
    date: "2025-06-13",
    startTime: "09:00",
    duration: 120,
    venueId: "V003",
    level: "200",
    department: "Computer Science",
    chiefSupervisorId: "",
    invigilatorIds: [],
    status: "scheduled",
  },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

type Tab =
  | "timetable"
  | "venues"
  | "invigilation"
  | "attendance"
  | "malpractice";

// ─── Conflict Detection ───────────────────────────────────────────────────────

function detectConflicts(exams: ExamEntry[]): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  const timeOverlaps = (a: ExamEntry, b: ExamEntry) => {
    if (a.date !== b.date || a.id === b.id) return false;
    const aStart = a.startTime.replace(":", "");
    const bStart = b.startTime.replace(":", "");
    const aEnd = String(
      Number(aStart) + Math.floor(a.duration / 60) * 100 + (a.duration % 60),
    ).padStart(4, "0");
    const bEnd = String(
      Number(bStart) + Math.floor(b.duration / 60) * 100 + (b.duration % 60),
    ).padStart(4, "0");
    return aStart < bEnd && bStart < aEnd;
  };

  for (let i = 0; i < exams.length; i++) {
    for (let j = i + 1; j < exams.length; j++) {
      const a = exams[i];
      const b = exams[j];
      if (timeOverlaps(a, b)) {
        if (a.venueId === b.venueId && a.venueId) {
          alerts.push({
            type: "venue",
            message: `Venue conflict: ${a.courseCode} & ${b.courseCode} share venue on ${a.date} at overlapping times`,
            examIds: [a.id, b.id],
          });
        }
        const aStaff = [a.chiefSupervisorId, ...a.invigilatorIds].filter(
          Boolean,
        );
        const bStaff = [b.chiefSupervisorId, ...b.invigilatorIds].filter(
          Boolean,
        );
        const shared = aStaff.filter((s) => bStaff.includes(s));
        if (shared.length > 0) {
          alerts.push({
            type: "supervisor",
            message: `Supervisor conflict: Same staff assigned to ${a.courseCode} & ${b.courseCode} on ${a.date}`,
            examIds: [a.id, b.id],
          });
        }
      }
    }
  }
  return alerts;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ExaminationManagement() {
  const [tab, setTab] = useState<Tab>("timetable");
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [venues, setVenues] = useState<ExamVenue[]>([]);
  const [malpractice, setMalpractice] = useState<MalpracticeReport[]>([]);
  const [invigilation, setInvigilation] = useState<InvigilationRecord[]>([]);
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceEntry[]>
  >({});

  const staff = getLocalStaff();
  const students = getLocalStudents();

  useEffect(() => {
    const v = load<ExamVenue[]>(LS.venues, []);
    setVenues(v.length ? v : SEED_VENUES);
    const e = load<ExamEntry[]>(LS.timetable, []);
    setExams(e.length ? e : SEED_EXAMS);
    setMalpractice(load<MalpracticeReport[]>(LS.malpractice, []));
    setInvigilation(load<InvigilationRecord[]>(LS.invigilation, []));
    setAttendance(load<Record<string, AttendanceEntry[]>>(LS.attendance, {}));
  }, []);

  const conflicts = useMemo(() => detectConflicts(exams), [exams]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "timetable", label: "Exam Timetable", icon: <Calendar size={16} /> },
    { key: "venues", label: "Venues / Halls", icon: <Building size={16} /> },
    { key: "invigilation", label: "Supervision", icon: <Users size={16} /> },
    {
      key: "attendance",
      label: "Attendance",
      icon: <ClipboardList size={16} />,
    },
    {
      key: "malpractice",
      label: "Malpractice Reports",
      icon: <Shield size={16} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Examination Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Timetable, venues, supervision, attendance & malpractice
          </p>
        </div>
        {conflicts.length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            <AlertCircle size={15} />
            <span className="font-medium">
              {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}{" "}
              detected
            </span>
          </div>
        )}
      </div>

      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((c) => (
            <div
              key={c.message}
              className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700"
            >
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{c.message}</span>
              <Badge variant="destructive" className="ml-auto text-xs">
                {c.type}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 bg-muted p-1 rounded-lg flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/60"}`}
          >
            {t.icon} {t.label}
            {t.key === "malpractice" &&
              malpractice.filter((r) => r.status === "pending").length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {malpractice.filter((r) => r.status === "pending").length}
                </span>
              )}
          </button>
        ))}
      </div>

      {tab === "timetable" && (
        <TimetableTab
          exams={exams}
          venues={venues}
          staff={staff}
          conflicts={conflicts}
          onChange={(updated) => {
            setExams(updated);
            save(LS.timetable, updated);
          }}
        />
      )}
      {tab === "venues" && (
        <VenuesTab
          venues={venues}
          exams={exams}
          onChange={(updated) => {
            setVenues(updated);
            save(LS.venues, updated);
          }}
        />
      )}
      {tab === "invigilation" && (
        <InvigilationTab
          exams={exams}
          venues={venues}
          staff={staff}
          invigilation={invigilation}
          onChange={(updated) => {
            setInvigilation(updated);
            save(LS.invigilation, updated);
          }}
        />
      )}
      {tab === "attendance" && (
        <AttendanceTab
          exams={exams}
          students={students}
          attendance={attendance}
          onChange={(updated) => {
            setAttendance(updated);
            save(LS.attendance, updated);
          }}
        />
      )}
      {tab === "malpractice" && (
        <MalpracticeTab
          exams={exams}
          staff={staff}
          malpractice={malpractice}
          onChange={(updated) => {
            setMalpractice(updated);
            save(LS.malpractice, updated);
          }}
        />
      )}
    </div>
  );
}

// ─── Timetable Tab ────────────────────────────────────────────────────────────

function TimetableTab({
  exams,
  venues,
  staff,
  conflicts,
  onChange,
}: {
  exams: ExamEntry[];
  venues: ExamVenue[];
  staff: ReturnType<typeof getLocalStaff>;
  conflicts: ConflictAlert[];
  onChange: (e: ExamEntry[]) => void;
}) {
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<ExamEntry | null>(null);
  const [form, setForm] = useState<Partial<ExamEntry>>({});
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v]));
  const staffMap = Object.fromEntries(staff.map((s) => [s.staffId, s.name]));
  const depts = [...new Set(exams.map((e) => e.department))];
  const conflictExamIds = new Set(conflicts.flatMap((c) => c.examIds));

  const filtered = exams
    .filter((e) => filterDept === "all" || e.department === filterDept)
    .filter((e) => filterStatus === "all" || e.status === filterStatus)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
    );

  const openAdd = () => {
    setEditing(null);
    setForm({ status: "scheduled", invigilatorIds: [], duration: 180 });
    setDialog(true);
  };
  const openEdit = (e: ExamEntry) => {
    setEditing(e);
    setForm({ ...e });
    setDialog(true);
  };
  const saveForm = () => {
    const entry = { ...form } as ExamEntry;
    if (!entry.id) entry.id = `EX${Date.now()}`;
    if (!entry.invigilatorIds) entry.invigilatorIds = [];
    const updated = editing
      ? exams.map((e) => (e.id === editing.id ? entry : e))
      : [...exams, entry];
    onChange(updated);
    setDialog(false);
  };
  const remove = (id: string) => onChange(exams.filter((e) => e.id !== id));

  const statusColor: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-700",
  };

  const printTimetable = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = filtered
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => {
        const chief = staffMap[e.chiefSupervisorId] ?? "—";
        const venue = venueMap[e.venueId]?.name ?? e.venueId;
        return `<tr><td>${e.date}</td><td>${e.startTime}</td><td>${e.courseCode}</td><td>${e.courseTitle}</td><td>${e.level}L</td><td>${e.department}</td><td>${venue}</td><td>${e.duration} min</td><td>${chief}</td><td>${e.status}</td></tr>`;
      })
      .join("");
    win.document.write(
      `<html><head><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#1e3a5f;color:white}tr:nth-child(even){background:#f8fafc}h2{color:#1e3a5f}@media print{button{display:none}}</style></head><body><h2>Examination Timetable — FUEK</h2><p>Printed: ${new Date().toLocaleString()}</p><table><thead><tr><th>Date</th><th>Time</th><th>Code</th><th>Course Title</th><th>Level</th><th>Dept</th><th>Venue</th><th>Duration</th><th>Chief Supervisor</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
    );
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue placeholder="All Depts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {depts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {["scheduled", "ongoing", "completed", "cancelled"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printTimetable}>
            <Printer size={14} className="mr-1" /> Print Timetable
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={openAdd}
          >
            <Plus size={14} className="mr-1" /> Add Exam
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 border-b">
              <tr>
                {[
                  "Date",
                  "Time",
                  "Course",
                  "Title",
                  "Level",
                  "Dept",
                  "Venue",
                  "Cap",
                  "Duration",
                  "Chief Supervisor",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-3 py-8 text-center text-muted-foreground text-sm"
                  >
                    No exams scheduled
                  </td>
                </tr>
              )}
              {filtered.map((e) => {
                const venue = venueMap[e.venueId];
                const isConflict = conflictExamIds.has(e.id);
                return (
                  <tr
                    key={e.id}
                    className={`border-b last:border-0 hover:bg-muted/30 ${isConflict ? "bg-red-50" : ""}`}
                  >
                    <td className="px-3 py-2 font-medium whitespace-nowrap">
                      {e.date}
                      {isConflict && (
                        <AlertTriangle
                          size={12}
                          className="inline ml-1 text-red-500"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {e.startTime}
                    </td>
                    <td className="px-3 py-2 font-mono text-blue-600 font-semibold">
                      {e.courseCode}
                    </td>
                    <td className="px-3 py-2 max-w-[160px] truncate">
                      {e.courseTitle}
                    </td>
                    <td className="px-3 py-2">{e.level}L</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {e.department}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs max-w-[120px] truncate">
                      {venue?.name ?? e.venueId}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {venue?.capacity ?? "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {e.duration}min
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {staffMap[e.chiefSupervisorId] ?? (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[e.status]}`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(e)}
                        >
                          <Edit size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => remove(e.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Exam" : "Schedule Exam"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Course Code</Label>
              <Input
                className="mt-1"
                value={form.courseCode ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, courseCode: e.target.value }))
                }
                placeholder="e.g. CSC301"
              />
            </div>
            <div>
              <Label>Level</Label>
              <Select
                value={form.level ?? "100"}
                onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["100", "200", "300", "400", "500"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}L
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Course Title</Label>
              <Input
                className="mt-1"
                value={form.courseTitle ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, courseTitle: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                className="mt-1"
                value={form.department ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Select
                value={form.venueId ?? ""}
                onValueChange={(v) => setForm((f) => ({ ...f, venueId: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues
                    .filter((v) => v.available)
                    .map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} (cap: {v.capacity})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.date ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                className="mt-1"
                value={form.startTime ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                className="mt-1"
                value={form.duration ?? 180}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: +e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status ?? "scheduled"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as ExamEntry["status"] }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["scheduled", "ongoing", "completed", "cancelled"].map(
                    (s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chief Supervisor</Label>
              <Select
                value={form.chiefSupervisorId ?? ""}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, chiefSupervisorId: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.staffId} value={s.staffId}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Invigilators (select up to 3)</Label>
              <Select
                onValueChange={(v) => {
                  const current = form.invigilatorIds ?? [];
                  if (!current.includes(v) && current.length < 3)
                    setForm((f) => ({ ...f, invigilatorIds: [...current, v] }));
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Add invigilator" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.staffId} value={s.staffId}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(form.invigilatorIds ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(form.invigilatorIds ?? []).map((id) => (
                    <span
                      key={id}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs"
                    >
                      {staffMap[id] ?? id}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            invigilatorIds: (f.invigilatorIds ?? []).filter(
                              (x) => x !== id,
                            ),
                          }))
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={saveForm}
            >
              Save Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Venues Tab ───────────────────────────────────────────────────────────────

function VenuesTab({
  venues,
  exams,
  onChange,
}: {
  venues: ExamVenue[];
  exams: ExamEntry[];
  onChange: (v: ExamVenue[]) => void;
}) {
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<ExamVenue | null>(null);
  const [form, setForm] = useState<Partial<ExamVenue>>({});

  const openAdd = () => {
    setEditing(null);
    setForm({ type: "hall", available: true });
    setDialog(true);
  };
  const openEdit = (v: ExamVenue) => {
    setEditing(v);
    setForm({ ...v });
    setDialog(true);
  };
  const saveForm = () => {
    const entry = { ...form } as ExamVenue;
    if (!entry.id) entry.id = `V${Date.now()}`;
    const updated = editing
      ? venues.map((v) => (v.id === editing.id ? entry : v))
      : [...venues, entry];
    onChange(updated);
    setDialog(false);
  };
  const toggleAvailability = (id: string) =>
    onChange(
      venues.map((v) => (v.id === id ? { ...v, available: !v.available } : v)),
    );

  const getUsageCount = (venueId: string) =>
    exams.filter((e) => e.venueId === venueId && e.status === "scheduled")
      .length;

  const typeColor: Record<string, string> = {
    hall: "bg-blue-100 text-blue-700",
    lab: "bg-purple-100 text-purple-700",
    classroom: "bg-green-100 text-green-700",
    outdoor: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {venues.length} venues registered ·{" "}
          {venues.filter((v) => v.available).length} available
        </p>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={openAdd}
        >
          <Plus size={14} className="mr-1" /> Add Venue
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {venues.map((v) => (
          <Card key={v.id} className={`${!v.available ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {v.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.location}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>
                  <Edit size={13} />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColor[v.type]}`}
                >
                  {v.type}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Cap: {v.capacity}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {getUsageCount(v.id)} exams
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${v.available ? "text-green-600" : "text-red-500"}`}
                >
                  {v.available ? "● Available" : "● Unavailable"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleAvailability(v.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {v.available ? "Mark Unavailable" : "Mark Available"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Venue" : "Add Venue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Venue Name</Label>
              <Input
                className="mt-1"
                value={form.name ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                className="mt-1"
                value={form.location ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Block A, Ground Floor"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type ?? "hall"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, type: v as ExamVenue["type"] }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["hall", "lab", "classroom", "outdoor"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.capacity ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: +e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="avail"
                checked={form.available ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, available: e.target.checked }))
                }
                className="w-4 h-4 accent-blue-600"
              />
              <Label htmlFor="avail">Available for use</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={saveForm}
            >
              Save Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Invigilation Tab ─────────────────────────────────────────────────────────

function InvigilationTab({
  exams,
  venues,
  staff,
  invigilation,
  onChange,
}: {
  exams: ExamEntry[];
  venues: ExamVenue[];
  staff: ReturnType<typeof getLocalStaff>;
  invigilation: InvigilationRecord[];
  onChange: (r: InvigilationRecord[]) => void;
}) {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<Partial<InvigilationRecord>>({});

  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v.name]));
  const staffMap = Object.fromEntries(staff.map((s) => [s.staffId, s.name]));
  const examRecords = invigilation.filter((r) => r.examId === selectedExam);
  const exam = exams.find((e) => e.id === selectedExam);

  const chiefCount = examRecords.filter(
    (r) => r.role === "chief-invigilator",
  ).length;
  const invigCount = examRecords.filter((r) => r.role === "invigilator").length;

  const addAssignment = () => {
    const entry: InvigilationRecord = {
      id: `INV${Date.now()}`,
      examId: selectedExam,
      staffId: form.staffId ?? "",
      role: form.role ?? "invigilator",
      attended: false,
    };
    onChange([...invigilation, entry]);
    setDialog(false);
    setForm({});
  };

  const toggleAttended = (id: string) =>
    onChange(
      invigilation.map((r) =>
        r.id === id ? { ...r, attended: !r.attended } : r,
      ),
    );

  const printSchedule = () => {
    if (!exam) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = examRecords
      .map(
        (r) =>
          `<tr><td>${staffMap[r.staffId] ?? r.staffId}</td><td>${r.role.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td><td>${exam.courseCode} — ${exam.courseTitle}</td><td>${exam.date} ${exam.startTime}</td><td>${venueMap[exam.venueId] ?? exam.venueId}</td><td>${r.attended ? "Yes" : "No"}</td></tr>`,
      )
      .join("");
    win.document.write(
      `<html><head><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:5px 8px}th{background:#1e3a5f;color:white}h2{color:#1e3a5f}</style></head><body><h2>Invigilation Schedule — ${exam.courseCode}: ${exam.courseTitle}</h2><p>Date: ${exam.date} | Time: ${exam.startTime} | Venue: ${venueMap[exam.venueId] ?? exam.venueId} | Duration: ${exam.duration}min</p><table><thead><tr><th>Staff Name</th><th>Role</th><th>Course</th><th>Date & Time</th><th>Venue</th><th>Attended</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
    );
    win.print();
  };

  const roleColor: Record<string, string> = {
    "chief-invigilator": "bg-blue-100 text-blue-700",
    invigilator: "bg-green-100 text-green-700",
    observer: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Select Exam
          </Label>
          <div className="mt-2 space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedExam(e.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedExam === e.id ? "border-blue-500 bg-blue-50" : "border-border hover:border-primary/50 bg-card"}`}
              >
                <p className="font-semibold text-foreground">{e.courseCode}</p>
                <p className="text-xs text-muted-foreground">
                  {e.date} · {e.startTime}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {venueMap[e.venueId] ?? e.venueId}
                </p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded">
                    {invigilation.filter((r) => r.examId === e.id).length} staff
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          {!selectedExam ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl p-8">
              <div className="text-center">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p>Select an exam to manage supervision</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {exam?.courseCode} — {exam?.courseTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exam?.date} · {exam?.startTime} ·{" "}
                    {venueMap[exam?.venueId ?? ""] ?? exam?.venueId} ·{" "}
                    {exam?.duration}min
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {chiefCount} chief
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {invigCount} invigilators
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={printSchedule}>
                    <Printer size={13} className="mr-1" /> Print
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setForm({ role: "invigilator" });
                      setDialog(true);
                    }}
                  >
                    <Plus size={13} className="mr-1" /> Assign
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        {["Staff Name", "Role", "Attended", "Remove"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {examRecords.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-6 text-center text-muted-foreground text-sm"
                          >
                            No staff assigned to this exam yet
                          </td>
                        </tr>
                      )}
                      {examRecords.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">
                            {staffMap[r.staffId] ?? r.staffId}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColor[r.role]}`}
                            >
                              {r.role.replace(/-/g, " ")}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleAttended(r.id)}
                              className={`flex items-center gap-1 text-xs font-medium ${r.attended ? "text-green-600" : "text-muted-foreground"}`}
                            >
                              <CheckCircle size={14} />{" "}
                              {r.attended ? "Attended" : "Mark Attended"}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() =>
                                onChange(
                                  invigilation.filter((x) => x.id !== r.id),
                                )
                              }
                            >
                              <X size={13} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff to Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Staff Member</Label>
              <Select
                value={form.staffId ?? ""}
                onValueChange={(v) => setForm((f) => ({ ...f, staffId: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.staffId} value={s.staffId}>
                      {s.name} — {s.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role ?? "invigilator"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    role: v as InvigilationRecord["role"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chief-invigilator">
                    Chief Invigilator
                  </SelectItem>
                  <SelectItem value="invigilator">Invigilator</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={addAssignment}
            >
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────

function AttendanceTab({
  exams,
  students,
  attendance,
  onChange,
}: {
  exams: ExamEntry[];
  students: ReturnType<typeof getLocalStudents>;
  attendance: Record<string, AttendanceEntry[]>;
  onChange: (a: Record<string, AttendanceEntry[]>) => void;
}) {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const exam = exams.find((e) => e.id === selectedExam);
  const list: AttendanceEntry[] = attendance[selectedExam] ?? [];

  const initAttendance = () => {
    const entries = students
      .filter((s) => !exam || s.level === exam.level)
      .map((s, i) => ({
        matricNumber: s.matricNumber,
        studentName: s.name,
        present: false,
        seatNumber: `${i + 1}`,
      }));
    onChange({ ...attendance, [selectedExam]: entries });
  };

  const togglePresent = (matric: string) => {
    const updated = list.map((e) =>
      e.matricNumber === matric ? { ...e, present: !e.present } : e,
    );
    onChange({ ...attendance, [selectedExam]: updated });
  };

  const presentCount = list.filter((e) => e.present).length;
  const absentCount = list.length - presentCount;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Select Exam
        </Label>
        <div className="mt-2 space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {exams.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelectedExam(e.id)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedExam === e.id ? "border-blue-500 bg-blue-50" : "border-border hover:border-primary/50 bg-card"}`}
            >
              <p className="font-semibold">{e.courseCode}</p>
              <p className="text-xs text-muted-foreground">
                {e.date} · {e.startTime}
              </p>
              {attendance[e.id] && (
                <p className="text-xs text-green-600">
                  {attendance[e.id].filter((a) => a.present).length}/
                  {attendance[e.id].length} present
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {!selectedExam ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl p-8">
            <div className="text-center">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
              <p>Select an exam to mark attendance</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {exam?.courseCode} — Attendance Register
                </p>
                {list.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {presentCount} present · {absentCount} absent ·{" "}
                    {list.length} total
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {list.length === 0 && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={initAttendance}
                  >
                    Load Students
                  </Button>
                )}
              </div>
            </div>
            {list.length > 0 && (
              <div className="flex gap-2 mb-2">
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center flex-1">
                  <p className="text-lg font-bold text-green-700">
                    {presentCount}
                  </p>
                  <p className="text-xs text-green-600">Present</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center flex-1">
                  <p className="text-lg font-bold text-red-700">
                    {absentCount}
                  </p>
                  <p className="text-xs text-red-600">Absent</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center flex-1">
                  <p className="text-lg font-bold text-blue-700">
                    {list.length > 0
                      ? Math.round((presentCount / list.length) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-blue-600">Attendance</p>
                </div>
              </div>
            )}
            <Card>
              <CardContent className="p-0 max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b sticky top-0">
                    <tr>
                      {["Seat", "Matric No.", "Student Name", "Present"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((e) => (
                      <tr
                        key={e.matricNumber}
                        className={`border-b last:border-0 ${e.present ? "bg-green-50/40" : ""}`}
                      >
                        <td className="px-3 py-2 text-muted-foreground">
                          {e.seatNumber}
                        </td>
                        <td className="px-3 py-2 font-mono text-blue-600 text-xs">
                          {e.matricNumber}
                        </td>
                        <td className="px-3 py-2">{e.studentName}</td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={e.present}
                            onChange={() => togglePresent(e.matricNumber)}
                            className="w-4 h-4 accent-blue-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Malpractice Tab ──────────────────────────────────────────────────────────

function MalpracticeTab({
  exams,
  staff,
  malpractice,
  onChange,
}: {
  exams: ExamEntry[];
  staff: ReturnType<typeof getLocalStaff>;
  malpractice: MalpracticeReport[];
  onChange: (r: MalpracticeReport[]) => void;
}) {
  const [dialog, setDialog] = useState(false);
  const [viewing, setViewing] = useState<MalpracticeReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [form, setForm] = useState<Partial<MalpracticeReport>>({});
  const [filterStatus, setFilterStatus] = useState("all");
  const students = getLocalStudents();

  const filtered = malpractice.filter(
    (r) => filterStatus === "all" || r.status === filterStatus,
  );

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    "under-investigation": "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-slate-100 text-slate-600",
  };

  const submit = () => {
    const selectedExam = exams.find((e) => e.id === form.examId);
    const entry: MalpracticeReport = {
      id: `MP${Date.now()}`,
      examId: form.examId ?? "",
      examDate: selectedExam?.date ?? "",
      courseCode: selectedExam?.courseCode ?? "",
      reportedBy: form.reportedBy ?? "",
      studentMatric: form.studentMatric ?? "",
      studentName:
        students.find((s) => s.matricNumber === form.studentMatric)?.name ??
        form.studentName ??
        form.studentMatric ??
        "",
      offenseType: form.offenseType ?? "",
      description: form.description ?? "",
      evidence: form.evidence ?? "",
      recommendedAction: form.recommendedAction ?? "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    onChange([entry, ...malpractice]);
    setDialog(false);
    setForm({});
  };

  const updateStatus = (id: string, status: MalpracticeReport["status"]) => {
    onChange(malpractice.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const saveNotes = (id: string) => {
    onChange(malpractice.map((r) => (r.id === id ? { ...r, adminNotes } : r)));
    setViewing(null);
  };

  const counts = {
    pending: malpractice.filter((r) => r.status === "pending").length,
    "under-investigation": malpractice.filter(
      (r) => r.status === "under-investigation",
    ).length,
    resolved: malpractice.filter((r) => r.status === "resolved").length,
    dismissed: malpractice.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          ["pending", "under-investigation", "resolved", "dismissed"] as const
        ).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`p-3 rounded-lg border text-center transition-colors ${filterStatus === s ? "border-blue-500 bg-blue-50" : "border-border bg-card"}`}
          >
            <p
              className={`text-2xl font-bold ${s === "pending" ? "text-amber-600" : s === "under-investigation" ? "text-blue-600" : s === "resolved" ? "text-green-600" : "text-slate-500"}`}
            >
              {counts[s]}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {s.replace(/-/g, " ")}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} report{filtered.length !== 1 ? "s" : ""} · showing{" "}
          {filterStatus === "all" ? "all" : filterStatus}
        </p>
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => {
            setForm({});
            setDialog(true);
          }}
        >
          <AlertTriangle size={14} className="mr-1" /> File Report
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Shield size={32} className="mx-auto mb-2 opacity-30" />
              <p>No malpractice reports for this filter</p>
            </CardContent>
          </Card>
        )}
        {filtered.map((r) => (
          <Card
            key={r.id}
            className={`border-l-4 ${r.status === "pending" ? "border-l-amber-400" : r.status === "under-investigation" ? "border-l-blue-400" : r.status === "resolved" ? "border-l-green-400" : "border-l-slate-300"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">
                    {r.studentName}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      ({r.studentMatric})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {r.courseCode} ·{" "}
                    <span className="italic">{r.offenseType}</span> ·{" "}
                    {r.examDate}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {r.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status]}`}
                  >
                    {r.status.replace(/-/g, " ")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewing(r);
                      setAdminNotes(r.adminNotes ?? "");
                    }}
                  >
                    <Eye size={13} />
                  </Button>
                  <Select
                    value={r.status}
                    onValueChange={(v) =>
                      updateStatus(r.id, v as MalpracticeReport["status"])
                    }
                  >
                    <SelectTrigger className="h-7 text-xs w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-investigation">
                        Under Investigation
                      </SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File Report Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>File Malpractice Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Exam</Label>
                <Select
                  value={form.examId ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, examId: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.courseCode} — {e.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reported By</Label>
                <Select
                  value={form.reportedBy ?? ""}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, reportedBy: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select invigilator" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.staffId} value={s.staffId}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Student Matric No.</Label>
                <Input
                  className="mt-1"
                  value={form.studentMatric ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentMatric: e.target.value }))
                  }
                  placeholder="e.g. FUEK/SCI/001"
                />
              </div>
              <div>
                <Label>Student Name</Label>
                <Input
                  className="mt-1"
                  value={form.studentName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentName: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </div>
            </div>
            <div>
              <Label>Incident Type</Label>
              <Select
                value={form.offenseType ?? ""}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, offenseType: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Copying from neighbour",
                    "Impersonation",
                    "Use of mobile phone",
                    "Smuggling of materials",
                    "Possession of unauthorized material",
                    "Disturbance",
                    "Verbal abuse of invigilator",
                    "Other",
                  ].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description of Incident</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe in detail what occurred..."
              />
            </div>
            <div>
              <Label>Evidence Description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.evidence ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, evidence: e.target.value }))
                }
                placeholder="e.g. Cheat sheet found in pocket, phone seized..."
              />
            </div>
            <div>
              <Label>Recommended Action</Label>
              <Input
                className="mt-1"
                value={form.recommendedAction ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recommendedAction: e.target.value }))
                }
                placeholder="e.g. Cancel exam result, disciplinary hearing"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={submit}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Malpractice Report — Admin Review</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Student
                  </p>
                  <p className="font-semibold">{viewing.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Matric No.
                  </p>
                  <p className="font-mono">{viewing.studentMatric}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Course
                  </p>
                  <p>{viewing.courseCode}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Exam Date
                  </p>
                  <p>{viewing.examDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Offense
                  </p>
                  <p className="text-red-600 font-medium">
                    {viewing.offenseType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Status
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[viewing.status]}`}
                  >
                    {viewing.status.replace(/-/g, " ")}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Description
                </p>
                <p className="mt-1 text-foreground">{viewing.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Evidence
                </p>
                <p className="mt-1 text-foreground">
                  {viewing.evidence || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Recommended Action
                </p>
                <p className="mt-1 text-foreground">
                  {viewing.recommendedAction || "—"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">
                  Admin Notes / Resolution
                </Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes, resolution details, or action taken..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => saveNotes(viewing.id)}
              >
                Save Notes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
