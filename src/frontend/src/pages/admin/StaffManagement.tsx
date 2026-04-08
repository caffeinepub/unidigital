import {
  Award,
  Briefcase,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  LogOut,
  Plus,
  Printer,
  Search,
  Shield,
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
import { StaffProfileView } from "./StaffProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffProfile {
  staffId: string;
  // Personal
  name: string;
  dob: string;
  gender: string;
  nationality: string;
  state: string;
  lga: string;
  address: string;
  phone: string;
  email: string;
  photoUrl?: string;
  // Qualifications
  qualifications: { degree: string; institution: string; year: string }[];
  // Employment history
  employmentHistory: {
    employer: string;
    role: string;
    startYear: string;
    endYear: string;
  }[];
  // Current employment
  designation: string;
  gradeLevel: string;
  department: string;
  faculty: string;
  dateOfAppointment: string;
  salaryGrade: string;
  // Next of kin
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  // Status
  employmentStatus: "active" | "probation" | "retired" | "exited";
  probationConfirmDate?: string;
  probationNotes?: string;
  retirementDate?: string;
  exitInterviewDone?: boolean;
  gratuityAmount?: number;
  clearanceStatus?: "not-started" | "in-progress" | "cleared";
}

const LS_KEY = "unidigital_staff_profiles";
const DEPT_LIST = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Education",
  "English",
  "History",
  "Administration",
  "Bursary",
  "Library",
  "Health Services",
];

const SEED_PROFILES: StaffProfile[] = [
  {
    staffId: "FUEK/STAFF/001",
    name: "Dr. Ahmed Musa",
    dob: "1975-04-12",
    gender: "Male",
    nationality: "Nigerian",
    state: "Niger",
    lga: "Kontagora",
    address: "No. 4 University Road, Kontagora",
    phone: "08012345678",
    email: "a.musa@fuek.edu.ng",
    qualifications: [
      {
        degree: "B.Sc Computer Science",
        institution: "ABU Zaria",
        year: "1998",
      },
      {
        degree: "M.Sc Computer Science",
        institution: "University of Lagos",
        year: "2002",
      },
      {
        degree: "Ph.D Computer Science",
        institution: "University of Ibadan",
        year: "2010",
      },
    ],
    employmentHistory: [
      {
        employer: "Kogi State University",
        role: "Lecturer II",
        startYear: "2003",
        endYear: "2010",
      },
    ],
    designation: "Senior Lecturer",
    gradeLevel: "CONUASS 5",
    department: "Computer Science",
    faculty: "Science",
    dateOfAppointment: "2010-09-01",
    salaryGrade: "GL 13",
    nokName: "Fatima Musa",
    nokRelationship: "Spouse",
    nokPhone: "08098765432",
    employmentStatus: "active",
  },
  {
    staffId: "FUEK/STAFF/002",
    name: "Mrs. Grace Okoye",
    dob: "1982-07-20",
    gender: "Female",
    nationality: "Nigerian",
    state: "Anambra",
    lga: "Awka",
    address: "Block C, Staff Quarters, FUEK",
    phone: "07034567890",
    email: "g.okoye@fuek.edu.ng",
    qualifications: [
      { degree: "B.Ed Mathematics", institution: "UNIJOS", year: "2004" },
      {
        degree: "M.Ed Mathematics Education",
        institution: "FUEK",
        year: "2012",
      },
    ],
    employmentHistory: [],
    designation: "Lecturer II",
    gradeLevel: "CONUASS 3",
    department: "Mathematics",
    faculty: "Science",
    dateOfAppointment: "2013-01-15",
    salaryGrade: "GL 10",
    nokName: "Emeka Okoye",
    nokRelationship: "Spouse",
    nokPhone: "08056781234",
    employmentStatus: "active",
  },
  {
    staffId: "FUEK/STAFF/003",
    name: "Mr. Bello Suleiman",
    dob: "1990-03-05",
    gender: "Male",
    nationality: "Nigerian",
    state: "Kebbi",
    lga: "Birnin Kebbi",
    address: "No. 12 Staff Road, Kontagora",
    phone: "08123456789",
    email: "b.suleiman@fuek.edu.ng",
    qualifications: [
      { degree: "B.Sc Physics", institution: "UDUS", year: "2013" },
    ],
    employmentHistory: [],
    designation: "Assistant Lecturer",
    gradeLevel: "CONUASS 2",
    department: "Physics",
    faculty: "Science",
    dateOfAppointment: "2022-07-01",
    salaryGrade: "GL 8",
    nokName: "Aisha Suleiman",
    nokRelationship: "Sibling",
    nokPhone: "08076543210",
    employmentStatus: "probation",
    probationConfirmDate: "2024-07-01",
    probationNotes: "Performing satisfactorily. On track for confirmation.",
  },
];

function load(): StaffProfile[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function save(data: StaffProfile[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

type Tab = "directory" | "probation" | "retirement" | "idcard";

export function StaffManagement() {
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [tab, setTab] = useState<Tab>("directory");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<StaffProfile | null>(null);
  const [editing, setEditing] = useState<StaffProfile | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm] = useState<Partial<StaffProfile>>({});

  useEffect(() => {
    const data = load();
    setProfiles(data.length ? data : SEED_PROFILES);
  }, []);

  const persist = (updated: StaffProfile[]) => {
    setProfiles(updated);
    save(updated);
  };

  const filtered = profiles.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.staffId.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || p.department === deptFilter;
    const matchStatus =
      statusFilter === "all" || p.employmentStatus === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const openEdit = (p: StaffProfile) => {
    setEditing(p);
    setForm({ ...p });
    setAddDialog(true);
  };

  const saveForm = () => {
    const entry = form as StaffProfile;
    if (!entry.staffId) entry.staffId = `FUEK/STAFF/${Date.now()}`;
    if (!entry.qualifications) entry.qualifications = [];
    if (!entry.employmentHistory) entry.employmentHistory = [];
    const updated = editing
      ? profiles.map((p) => (p.staffId === editing.staffId ? entry : p))
      : [...profiles, entry];
    persist(updated);
    setAddDialog(false);
    setEditing(null);
    setForm({});
  };

  const updateStatus = (
    staffId: string,
    status: StaffProfile["employmentStatus"],
  ) => {
    persist(
      profiles.map((p) =>
        p.staffId === staffId ? { ...p, employmentStatus: status } : p,
      ),
    );
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    probation: "bg-amber-100 text-amber-700",
    retired: "bg-slate-100 text-slate-600",
    exited: "bg-red-100 text-red-700",
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "directory", label: "Staff Directory", icon: <Users size={16} /> },
    {
      key: "probation",
      label: "Probation Tracking",
      icon: <Shield size={16} />,
    },
    {
      key: "retirement",
      label: "Retirement / Exit",
      icon: <LogOut size={16} />,
    },
    { key: "idcard", label: "ID Card Generation", icon: <Award size={16} /> },
  ];

  if (viewing)
    return (
      <StaffProfileView
        profile={viewing}
        onBack={() => setViewing(null)}
        onEdit={() => {
          openEdit(viewing);
          setViewing(null);
        }}
      />
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
        <p className="text-slate-500 text-sm">
          Comprehensive staff records, onboarding, probation & exit management
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/60"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-slate-400"
                />
                <Input
                  className="pl-8 w-52"
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPT_LIST.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="exited">Exited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setEditing(null);
                setForm({
                  qualifications: [],
                  employmentHistory: [],
                  employmentStatus: "active",
                });
                setAddDialog(true);
              }}
            >
              <Plus size={14} className="mr-1" /> Add Staff
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Staff ID",
                      "Name",
                      "Designation",
                      "Department",
                      "Grade",
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
                  {filtered.map((p) => (
                    <tr
                      key={p.staffId}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 py-2 font-mono text-blue-600 text-xs">
                        {p.staffId}
                      </td>
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {p.designation}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {p.department}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {p.gradeLevel}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[p.employmentStatus]}`}
                        >
                          {p.employmentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewing(p)}
                          >
                            <Eye size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(p)}
                          >
                            <Edit size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "probation" && (
        <ProbationTab
          profiles={profiles.filter((p) => p.employmentStatus === "probation")}
          onUpdate={(p) =>
            persist(profiles.map((x) => (x.staffId === p.staffId ? p : x)))
          }
          onConfirm={(id) => updateStatus(id, "active")}
        />
      )}

      {tab === "retirement" && (
        <RetirementTab
          profiles={profiles}
          onUpdate={(p) =>
            persist(profiles.map((x) => (x.staffId === p.staffId ? p : x)))
          }
        />
      )}

      {tab === "idcard" && <IDCardTab profiles={filtered} />}

      {/* Add/Edit Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Staff Profile" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Staff ID</Label>
                <Input
                  className="mt-1"
                  value={form.staffId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, staffId: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  className="mt-1"
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.dob ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dob: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nationality</Label>
                <Input
                  className="mt-1"
                  value={form.nationality ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nationality: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>State of Origin</Label>
                <Input
                  className="mt-1"
                  value={form.state ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>LGA</Label>
                <Input
                  className="mt-1"
                  value={form.lga ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lga: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input
                  className="mt-1"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Current Employment
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Designation</Label>
                <Input
                  className="mt-1"
                  value={form.designation ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, designation: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Grade Level (CONUASS)</Label>
                <Input
                  className="mt-1"
                  value={form.gradeLevel ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, gradeLevel: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department ?? ""}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, department: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPT_LIST.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Faculty</Label>
                <Input
                  className="mt-1"
                  value={form.faculty ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, faculty: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Date of Appointment</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.dateOfAppointment ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      dateOfAppointment: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Salary Grade</Label>
                <Input
                  className="mt-1"
                  value={form.salaryGrade ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salaryGrade: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Employment Status</Label>
                <Select
                  value={form.employmentStatus ?? "active"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      employmentStatus: v as StaffProfile["employmentStatus"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Next of Kin
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input
                  className="mt-1"
                  value={form.nokName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nokName: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Relationship</Label>
                <Input
                  className="mt-1"
                  value={form.nokRelationship ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nokRelationship: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={form.nokPhone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nokPhone: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveForm}
            >
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Probation Tab ────────────────────────────────────────────────────────────

function ProbationTab({
  profiles,
  onUpdate,
  onConfirm,
}: {
  profiles: StaffProfile[];
  onUpdate: (p: StaffProfile) => void;
  onConfirm: (id: string) => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Staff on Probation
        </h2>
        <p className="text-sm text-slate-500">
          {profiles.length} staff currently on probation
        </p>
      </div>
      {profiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            No staff currently on probation.
          </CardContent>
        </Card>
      )}
      {profiles.map((p) => (
        <Card key={p.staffId} className="border-l-4 border-amber-400">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {p.staffId} · {p.designation} · {p.department}
                </p>
                <p className="text-sm text-slate-500">
                  Appointed: {p.dateOfAppointment} · Expected Confirmation:{" "}
                  <span className="font-medium text-amber-700">
                    {p.probationConfirmDate ?? "Not set"}
                  </span>
                </p>
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onConfirm(p.staffId)}
              >
                <Award size={13} className="mr-1" /> Confirm Appointment
              </Button>
            </div>
            <div>
              <Label className="text-xs">Performance Notes</Label>
              <Textarea
                className="mt-1 text-sm"
                rows={2}
                value={notes[p.staffId] ?? p.probationNotes ?? ""}
                onChange={(e) =>
                  setNotes((n) => ({ ...n, [p.staffId]: e.target.value }))
                }
                placeholder="Add probation performance notes..."
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-1.5"
                onClick={() =>
                  onUpdate({
                    ...p,
                    probationNotes: notes[p.staffId] ?? p.probationNotes ?? "",
                  })
                }
              >
                Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Retirement Tab ───────────────────────────────────────────────────────────

function RetirementTab({
  profiles,
  onUpdate,
}: { profiles: StaffProfile[]; onUpdate: (p: StaffProfile) => void }) {
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<StaffProfile | null>(null);
  const [form, setForm] = useState<Partial<StaffProfile>>({});

  const nearing = profiles.filter(
    (p) => p.employmentStatus === "active" && p.retirementDate,
  );
  const retired = profiles.filter((p) => p.employmentStatus === "retired");
  const exited = profiles.filter((p) => p.employmentStatus === "exited");

  const openRetirement = (p: StaffProfile) => {
    setSelected(p);
    setForm({ ...p });
    setDialog(true);
  };

  const saveRetirement = () => {
    if (!selected) return;
    onUpdate({ ...selected, ...form } as StaffProfile);
    setDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {nearing.length}
            </p>
            <p className="text-sm text-slate-500">Nearing Retirement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">
              {retired.length}
            </p>
            <p className="text-sm text-slate-500">Retired</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{exited.length}</p>
            <p className="text-sm text-slate-500">Exited</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-700 mb-3">
          All Active Staff — Retirement Management
        </h3>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Staff Name",
                    "Dept",
                    "Appointment Date",
                    "Retirement Date",
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
                {profiles.map((p) => (
                  <tr
                    key={p.staffId}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-slate-500">{p.department}</td>
                    <td className="px-3 py-2">{p.dateOfAppointment}</td>
                    <td className="px-3 py-2">
                      {p.retirementDate ?? (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {p.employmentStatus}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRetirement(p)}
                      >
                        <Edit size={13} className="mr-1" /> Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Retirement / Exit Management — {selected?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employment Status</Label>
              <Select
                value={form.employmentStatus ?? "active"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    employmentStatus: v as StaffProfile["employmentStatus"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="exited">Exited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Retirement / Exit Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.retirementDate ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, retirementDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Gratuity Amount (₦)</Label>
              <Input
                type="number"
                className="mt-1"
                value={form.gratuityAmount ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gratuityAmount: +e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="exit-interview"
                checked={!!form.exitInterviewDone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    exitInterviewDone: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-blue-600"
              />
              <Label htmlFor="exit-interview">Exit Interview Completed</Label>
            </div>
            <div>
              <Label>Clearance Status</Label>
              <Select
                value={form.clearanceStatus ?? "not-started"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    clearanceStatus: v as StaffProfile["clearanceStatus"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
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
              onClick={saveRetirement}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ID Card Tab ──────────────────────────────────────────────────────────────

function IDCardTab({ profiles }: { profiles: StaffProfile[] }) {
  const printCard = (p: StaffProfile) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><style>
        body{font-family:Arial,sans-serif;display:flex;justify-content:center;padding:20px}
        .card{width:340px;border:3px solid #1e3a5f;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2)}
        .header{background:#1e3a5f;color:white;padding:12px 16px;text-align:center}
        .header h2{font-size:13px;margin:0;font-weight:bold;letter-spacing:0.5px}
        .header p{font-size:10px;margin:2px 0 0;opacity:0.8}
        .body{padding:16px;display:flex;gap:12px;align-items:flex-start}
        .photo{width:70px;height:80px;background:#e2e8f0;border:2px solid #1e3a5f;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#64748b;flex-shrink:0}
        .info h3{font-size:14px;font-weight:bold;color:#1e3a5f;margin:0 0 4px}
        .info p{font-size:10px;color:#475569;margin:1px 0}
        .footer{background:#f1f5f9;padding:8px 16px;display:flex;justify-content:space-between;border-top:2px solid #1e3a5f}
        .footer p{font-size:9px;color:#475569;margin:0}
        .badge{background:#1e3a5f;color:white;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:bold}
      </style></head><body>
      <div class="card">
        <div class="header"><h2>FEDERAL UNIVERSITY OF EDUCATION, KONTAGORA</h2><p>STAFF IDENTITY CARD</p></div>
        <div class="body">
          <div class="photo">PHOTO</div>
          <div class="info">
            <h3>${p.name}</h3>
            <p><b>ID:</b> ${p.staffId}</p>
            <p><b>Designation:</b> ${p.designation}</p>
            <p><b>Department:</b> ${p.department}</p>
            <p><b>Faculty:</b> ${p.faculty}</p>
            <p><b>Phone:</b> ${p.phone}</p>
            <p><b>Email:</b> ${p.email}</p>
          </div>
        </div>
        <div class="footer"><p>Issued: ${new Date().getFullYear()} &nbsp;|&nbsp; FUEK MIS</p><span class="badge">${p.employmentStatus.toUpperCase()}</span></div>
      </div></body></html>
    `);
    win.print();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Click "Print ID Card" to generate a printable staff identity card.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {profiles.map((p) => (
          <Card key={p.staffId}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                <User size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {p.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {p.designation}
                </p>
                <p className="text-xs text-slate-400">{p.staffId}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => printCard(p)}>
                <Printer size={13} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
