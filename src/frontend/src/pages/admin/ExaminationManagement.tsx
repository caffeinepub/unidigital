import {
  AlertTriangle,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Plus,
  Printer,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
}

interface ExamEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  startTime: string;
  duration: number; // minutes
  venueId: string;
  level: string;
  department: string;
  supervisors: string[]; // staffIds
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
  courseCode: string;
  reportedBy: string; // staffId
  studentMatric: string;
  studentName: string;
  offenseType: string;
  description: string;
  evidence: string;
  recommendedAction: string;
  status: "pending" | "under-investigation" | "resolved" | "dismissed";
  createdAt: string;
}

const LS_KEYS = {
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
  },
  {
    id: "V002",
    name: "Science Laboratory Complex",
    capacity: 150,
    type: "lab",
    location: "Science Block",
  },
  {
    id: "V003",
    name: "ICT Hall",
    capacity: 200,
    type: "hall",
    location: "ICT Building",
  },
  {
    id: "V004",
    name: "Faculty Lecture Hall 1",
    capacity: 300,
    type: "hall",
    location: "Faculty Building",
  },
  {
    id: "V005",
    name: "Mini Hall B",
    capacity: 100,
    type: "classroom",
    location: "Block B, 1st Floor",
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
    supervisors: [],
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
    supervisors: [],
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
    supervisors: [],
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

// ─── Sub-components ───────────────────────────────────────────────────────────

type Tab =
  | "timetable"
  | "venues"
  | "invigilation"
  | "attendance"
  | "malpractice";

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
    const v = load<ExamVenue[]>(LS_KEYS.venues, []);
    setVenues(v.length ? v : SEED_VENUES);
    const e = load<ExamEntry[]>(LS_KEYS.timetable, []);
    setExams(e.length ? e : SEED_EXAMS);
    setMalpractice(load<MalpracticeReport[]>(LS_KEYS.malpractice, []));
    setInvigilation(load<InvigilationRecord[]>(LS_KEYS.invigilation, []));
    setAttendance(
      load<Record<string, AttendanceEntry[]>>(LS_KEYS.attendance, {}),
    );
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "timetable", label: "Exam Timetable", icon: <Calendar size={16} /> },
    { key: "venues", label: "Venues / Halls", icon: <Building size={16} /> },
    { key: "invigilation", label: "Invigilation", icon: <Users size={16} /> },
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Examination Management
        </h1>
        <p className="text-slate-500 text-sm">
          Timetable, venues, supervision, attendance & malpractice
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "timetable" && (
        <TimetableTab
          exams={exams}
          venues={venues}
          onChange={(updated) => {
            setExams(updated);
            save(LS_KEYS.timetable, updated);
          }}
        />
      )}
      {tab === "venues" && (
        <VenuesTab
          venues={venues}
          onChange={(updated) => {
            setVenues(updated);
            save(LS_KEYS.venues, updated);
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
            save(LS_KEYS.invigilation, updated);
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
            save(LS_KEYS.attendance, updated);
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
            save(LS_KEYS.malpractice, updated);
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
  onChange,
}: {
  exams: ExamEntry[];
  venues: ExamVenue[];
  onChange: (e: ExamEntry[]) => void;
}) {
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<ExamEntry | null>(null);
  const [form, setForm] = useState<Partial<ExamEntry>>({});

  const openAdd = () => {
    setEditing(null);
    setForm({ status: "scheduled", supervisors: [], duration: 180 });
    setDialog(true);
  };
  const openEdit = (e: ExamEntry) => {
    setEditing(e);
    setForm({ ...e });
    setDialog(true);
  };
  const save = () => {
    const entry = form as ExamEntry;
    if (!entry.id) entry.id = `EX${Date.now()}`;
    const updated = editing
      ? exams.map((e) => (e.id === editing.id ? entry : e))
      : [...exams, entry];
    onChange(updated);
    setDialog(false);
  };
  const remove = (id: string) => onChange(exams.filter((e) => e.id !== id));

  const venueMap = Object.fromEntries(venues.map((v) => [v.id, v.name]));
  const statusColor: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-700",
  };

  const printTimetable = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = exams
      .map(
        (e) =>
          `<tr><td>${e.date}</td><td>${e.startTime}</td><td>${e.courseCode}</td><td>${e.courseTitle}</td><td>${e.level}L</td><td>${e.department}</td><td>${venueMap[e.venueId] ?? e.venueId}</td><td>${e.duration} min</td><td>${e.status}</td></tr>`,
      )
      .join("");
    win.document.write(
      `<html><body><h2>Examination Timetable - FUEK</h2><table border="1" cellpadding="4" style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr><th>Date</th><th>Time</th><th>Code</th><th>Course</th><th>Level</th><th>Dept</th><th>Venue</th><th>Duration</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
    );
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{exams.length} scheduled exams</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printTimetable}>
            <Printer size={14} className="mr-1" /> Print Timetable
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={openAdd}
          >
            <Plus size={14} className="mr-1" /> Add Exam
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {[
                  "Date",
                  "Time",
                  "Course",
                  "Title",
                  "Level",
                  "Dept",
                  "Venue",
                  "Duration",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr
                  key={e.id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 font-medium">{e.date}</td>
                  <td className="px-3 py-2">{e.startTime}</td>
                  <td className="px-3 py-2 font-mono text-blue-600">
                    {e.courseCode}
                  </td>
                  <td className="px-3 py-2 max-w-[160px] truncate">
                    {e.courseTitle}
                  </td>
                  <td className="px-3 py-2">{e.level}L</td>
                  <td className="px-3 py-2 text-slate-500">{e.department}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {venueMap[e.venueId] ?? e.venueId}
                  </td>
                  <td className="px-3 py-2">{e.duration}min</td>
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
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
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
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={save}>
              Save
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
  onChange,
}: { venues: ExamVenue[]; onChange: (v: ExamVenue[]) => void }) {
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<ExamVenue | null>(null);
  const [form, setForm] = useState<Partial<ExamVenue>>({});

  const openAdd = () => {
    setEditing(null);
    setForm({ type: "hall" });
    setDialog(true);
  };
  const openEdit = (v: ExamVenue) => {
    setEditing(v);
    setForm({ ...v });
    setDialog(true);
  };
  const save = () => {
    const entry = form as ExamVenue;
    if (!entry.id) entry.id = `V${Date.now()}`;
    const updated = editing
      ? venues.map((v) => (v.id === editing.id ? entry : v))
      : [...venues, entry];
    onChange(updated);
    setDialog(false);
  };

  const typeColor: Record<string, string> = {
    hall: "bg-blue-100 text-blue-700",
    lab: "bg-purple-100 text-purple-700",
    classroom: "bg-green-100 text-green-700",
    outdoor: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {venues.length} venues registered
        </p>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={openAdd}
        >
          <Plus size={14} className="mr-1" /> Add Venue
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {venues.map((v) => (
          <Card key={v.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {v.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{v.location}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>
                  <Edit size={13} />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColor[v.type]}`}
                >
                  {v.type}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Cap: {v.capacity}
                </span>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={save}>
              Save
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

  const toggleAttended = (id: string) => {
    onChange(
      invigilation.map((r) =>
        r.id === id ? { ...r, attended: !r.attended } : r,
      ),
    );
  };

  const printSchedule = () => {
    if (!exam) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = examRecords
      .map(
        (r) =>
          `<tr><td>${staffMap[r.staffId] ?? r.staffId}</td><td>${r.role}</td><td>${exam.courseCode} — ${exam.courseTitle}</td><td>${exam.date} ${exam.startTime}</td><td>${venueMap[exam.venueId] ?? exam.venueId}</td></tr>`,
      )
      .join("");
    win.document.write(
      `<html><body><h2>Invigilation Schedule — ${exam.courseCode}</h2><table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr><th>Staff Name</th><th>Role</th><th>Course</th><th>Date & Time</th><th>Venue</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
    );
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label className="text-xs text-slate-500 uppercase tracking-wide">
            Select Exam
          </Label>
          <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedExam(e.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedExam === e.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <p className="font-semibold">{e.courseCode}</p>
                <p className="text-xs text-slate-500">
                  {e.date} · {e.startTime}
                </p>
                <p className="text-xs text-slate-500">
                  {venueMap[e.venueId] ?? e.venueId}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          {!selectedExam ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select an exam to manage invigilation
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">
                    {exam?.courseCode} — {exam?.courseTitle}
                  </p>
                  <p className="text-xs text-slate-500">
                    {exam?.date} · {exam?.startTime} ·{" "}
                    {venueMap[exam?.venueId ?? ""] ?? exam?.venueId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={printSchedule}>
                    <Printer size={13} className="mr-1" /> Print Schedule
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setForm({ role: "invigilator" });
                      setDialog(true);
                    }}
                  >
                    <Plus size={13} className="mr-1" /> Assign Staff
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Staff Name", "Role", "Attended", ""].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {examRecords.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-6 text-center text-slate-400 text-sm"
                          >
                            No staff assigned yet
                          </td>
                        </tr>
                      )}
                      {examRecords.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">
                            {staffMap[r.staffId] ?? r.staffId}
                          </td>
                          <td className="px-3 py-2 capitalize text-slate-600">
                            {r.role}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleAttended(r.id)}
                              className={`flex items-center gap-1 text-xs font-medium ${r.attended ? "text-green-600" : "text-slate-400"}`}
                            >
                              <CheckCircle size={14} />{" "}
                              {r.attended ? "Yes" : "No"}
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
                      {s.name}
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={addAssignment}
            >
              Assign
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
    const updated = { ...attendance, [selectedExam]: entries };
    onChange(updated);
  };

  const togglePresent = (matric: string) => {
    const updated = list.map((e) =>
      e.matricNumber === matric ? { ...e, present: !e.present } : e,
    );
    onChange({ ...attendance, [selectedExam]: updated });
  };

  const presentCount = list.filter((e) => e.present).length;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-slate-500 uppercase tracking-wide">
            Select Exam
          </Label>
          <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedExam(e.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedExam === e.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <p className="font-semibold">{e.courseCode}</p>
                <p className="text-xs text-slate-500">
                  {e.date} · {e.startTime}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          {!selectedExam ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select an exam to mark attendance
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">
                  {exam?.courseCode} Attendance
                </p>
                <div className="flex gap-2 items-center">
                  {list.length > 0 && (
                    <span className="text-sm text-slate-500">
                      {presentCount}/{list.length} present
                    </span>
                  )}
                  {list.length === 0 && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={initAttendance}
                    >
                      Load Students
                    </Button>
                  )}
                </div>
              </div>
              <Card>
                <CardContent className="p-0 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b sticky top-0">
                      <tr>
                        {["Seat", "Matric No.", "Student Name", "Present"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
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
                          className="border-b last:border-0"
                        >
                          <td className="px-3 py-2 text-slate-500">
                            {e.seatNumber}
                          </td>
                          <td className="px-3 py-2 font-mono text-blue-600">
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
  const [form, setForm] = useState<Partial<MalpracticeReport>>({});

  const students = getLocalStudents();
  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    "under-investigation": "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-slate-100 text-slate-600",
  };

  const submit = () => {
    const entry: MalpracticeReport = {
      id: `MP${Date.now()}`,
      examId: form.examId ?? "",
      courseCode: exams.find((e) => e.id === form.examId)?.courseCode ?? "",
      reportedBy: form.reportedBy ?? "",
      studentMatric: form.studentMatric ?? "",
      studentName:
        students.find((s) => s.matricNumber === form.studentMatric)?.name ??
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          {(
            [
              "pending",
              "under-investigation",
              "resolved",
              "dismissed",
            ] as MalpracticeReport["status"][]
          ).map((s) => (
            <span key={s} className="text-slate-600">
              <span className="font-semibold">
                {malpractice.filter((r) => r.status === s).length}
              </span>{" "}
              {s}
            </span>
          ))}
        </div>
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            setForm({});
            setDialog(true);
          }}
        >
          <AlertTriangle size={14} className="mr-1" /> File Report
        </Button>
      </div>

      <div className="space-y-3">
        {malpractice.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-slate-400">
              No malpractice reports filed.
            </CardContent>
          </Card>
        )}
        {malpractice.map((r) => (
          <Card
            key={r.id}
            className="border-l-4"
            style={{
              borderLeftColor:
                r.status === "pending"
                  ? "#f59e0b"
                  : r.status === "under-investigation"
                    ? "#3b82f6"
                    : r.status === "resolved"
                      ? "#22c55e"
                      : "#94a3b8",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">
                    {r.studentName}{" "}
                    <span className="font-mono text-xs text-slate-500">
                      ({r.studentMatric})
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {r.courseCode} ·{" "}
                    <span className="italic">{r.offenseType}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status]}`}
                  >
                    {r.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewing(r)}
                  >
                    <Eye size={13} />
                  </Button>
                  <Select
                    value={r.status}
                    onValueChange={(v) =>
                      updateStatus(r.id, v as MalpracticeReport["status"])
                    }
                  >
                    <SelectTrigger className="h-7 text-xs w-36">
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
                    <SelectValue placeholder="Select staff" />
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
                />
              </div>
              <div>
                <Label>Offense Type</Label>
                <Select
                  value={form.offenseType ?? ""}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, offenseType: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Impersonation",
                      "Smuggling of materials",
                      "Copying from neighbour",
                      "Use of mobile phone",
                      "Possession of unauthorized material",
                      "Disturbance",
                      "Other",
                    ].map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={submit}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Malpractice Report Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Student</p>
                  <p className="font-semibold">{viewing.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Matric No.</p>
                  <p className="font-mono">{viewing.studentMatric}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Course</p>
                  <p>{viewing.courseCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Offense</p>
                  <p>{viewing.offenseType}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Description</p>
                <p className="mt-1 text-slate-700">{viewing.description}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Evidence</p>
                <p className="mt-1 text-slate-700">{viewing.evidence}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Recommended Action
                </p>
                <p className="mt-1 text-slate-700">
                  {viewing.recommendedAction}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
