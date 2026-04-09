import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  GraduationCap,
  PauseCircle,
  PlusCircle,
  Printer,
  Search,
  Settings,
  ToggleLeft,
  ToggleRight,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { StatCard } from "../../components/StatCard";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

type DLStatus = "Active" | "On Hold" | "Withdrawn" | "Graduated";

interface DLStudent {
  id: string;
  name: string;
  matric: string;
  department: string;
  level: string;
  semester: string;
  programme: string;
  status: DLStatus;
  feeStatus: "Paid" | "Partial" | "Outstanding";
  cgpa: number;
}

const DEPARTMENTS = [
  "Computer Science",
  "Biology",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Integrated Science",
  "Environmental Education",
  "Human Kinetics",
  "Health Education",
];

const PROGRAMMES = [
  "DL-NCE",
  "DL-B.Sc(Ed)",
  "DL-PGD",
  "DL-PGDE",
  "DL-Certificate",
];

const initialStudents: DLStudent[] = [
  {
    id: "DL001",
    name: "Aminu Bello Usman",
    matric: "FUEK/DL/2022/001",
    department: "Computer Science",
    level: "200",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.8,
  },
  {
    id: "DL002",
    name: "Fatima Ibrahim Garba",
    matric: "FUEK/DL/2022/002",
    department: "Mathematics",
    level: "300",
    semester: "Second",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Partial",
    cgpa: 3.5,
  },
  {
    id: "DL003",
    name: "Emmanuel Okonkwo",
    matric: "FUEK/DL/2021/003",
    department: "Chemistry",
    level: "400",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.9,
  },
  {
    id: "DL004",
    name: "Halima Sani Yusuf",
    matric: "FUEK/DL/2022/004",
    department: "Biology",
    level: "200",
    semester: "First",
    programme: "DL-NCE",
    status: "On Hold",
    feeStatus: "Outstanding",
    cgpa: 2.7,
  },
  {
    id: "DL005",
    name: "Abdullahi Musa Danladi",
    matric: "FUEK/DL/2021/005",
    department: "Physics",
    level: "300",
    semester: "Second",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.2,
  },
  {
    id: "DL006",
    name: "Grace Ogbonna Nwosu",
    matric: "FUEK/DL/2020/006",
    department: "Integrated Science",
    level: "400",
    semester: "Second",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 4.0,
  },
  {
    id: "DL007",
    name: "Ibrahim Tanko Aliyu",
    matric: "FUEK/DL/2023/007",
    department: "Environmental Education",
    level: "100",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 0,
  },
  {
    id: "DL008",
    name: "Blessing Chukwu Emeka",
    matric: "FUEK/DL/2022/008",
    department: "Human Kinetics",
    level: "200",
    semester: "First",
    programme: "DL-NCE",
    status: "Active",
    feeStatus: "Partial",
    cgpa: 3.1,
  },
  {
    id: "DL009",
    name: "Suleiman Ahmad Kwara",
    matric: "FUEK/DL/2021/009",
    department: "Mathematics",
    level: "400",
    semester: "Second",
    programme: "DL-PGD",
    status: "Graduated",
    feeStatus: "Paid",
    cgpa: 3.7,
  },
  {
    id: "DL010",
    name: "Ngozi Adaeze Obi",
    matric: "FUEK/DL/2022/010",
    department: "Health Education",
    level: "300",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.4,
  },
  {
    id: "DL011",
    name: "Yakubu Dalhatu Zaria",
    matric: "FUEK/DL/2020/011",
    department: "Chemistry",
    level: "400",
    semester: "Second",
    programme: "DL-PGDE",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.6,
  },
  {
    id: "DL012",
    name: "Chidinma Okafor Peace",
    matric: "FUEK/DL/2023/012",
    department: "Biology",
    level: "100",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 0,
  },
  {
    id: "DL013",
    name: "Musa Salihu Katsina",
    matric: "FUEK/DL/2022/013",
    department: "Physics",
    level: "200",
    semester: "Second",
    programme: "DL-B.Sc(Ed)",
    status: "Withdrawn",
    feeStatus: "Outstanding",
    cgpa: 1.8,
  },
  {
    id: "DL014",
    name: "Aisha Lawal Mohammed",
    matric: "FUEK/DL/2021/014",
    department: "Integrated Science",
    level: "300",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.3,
  },
  {
    id: "DL015",
    name: "Victor Oduya Ekwere",
    matric: "FUEK/DL/2020/015",
    department: "Computer Science",
    level: "400",
    semester: "Second",
    programme: "DL-Certificate",
    status: "Graduated",
    feeStatus: "Paid",
    cgpa: 3.8,
  },
  {
    id: "DL016",
    name: "Zainab Haruna Sokoto",
    matric: "FUEK/DL/2022/016",
    department: "Mathematics",
    level: "200",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.0,
  },
  {
    id: "DL017",
    name: "Chike Nnamdi Onuoha",
    matric: "FUEK/DL/2023/017",
    department: "Health Education",
    level: "100",
    semester: "First",
    programme: "DL-NCE",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 0,
  },
  {
    id: "DL018",
    name: "Ramatu Bello Kebbi",
    matric: "FUEK/DL/2021/018",
    department: "Environmental Education",
    level: "300",
    semester: "Second",
    programme: "DL-B.Sc(Ed)",
    status: "On Hold",
    feeStatus: "Partial",
    cgpa: 2.5,
  },
  {
    id: "DL019",
    name: "Francis Eze Anambra",
    matric: "FUEK/DL/2020/019",
    department: "Chemistry",
    level: "400",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.9,
  },
  {
    id: "DL020",
    name: "Hauwa Idris Bauchi",
    matric: "FUEK/DL/2022/020",
    department: "Human Kinetics",
    level: "200",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.2,
  },
  {
    id: "DL021",
    name: "Tunde Olawale Abiona",
    matric: "FUEK/DL/2021/021",
    department: "Biology",
    level: "300",
    semester: "Second",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.5,
  },
  {
    id: "DL022",
    name: "Nkechi Uchenna Mbah",
    matric: "FUEK/DL/2022/022",
    department: "Physics",
    level: "200",
    semester: "First",
    programme: "DL-NCE",
    status: "Active",
    feeStatus: "Partial",
    cgpa: 2.9,
  },
  {
    id: "DL023",
    name: "Bashir Abubakar Yola",
    matric: "FUEK/DL/2023/023",
    department: "Mathematics",
    level: "100",
    semester: "First",
    programme: "DL-B.Sc(Ed)",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 0,
  },
  {
    id: "DL024",
    name: "Stella Ugwu Enugu",
    matric: "FUEK/DL/2021/024",
    department: "Integrated Science",
    level: "400",
    semester: "Second",
    programme: "DL-PGDE",
    status: "Active",
    feeStatus: "Paid",
    cgpa: 3.7,
  },
];

const feeSchedule = [
  { programme: "DL-NCE", tuition: 85000, techFee: 15000, materialsFee: 8000 },
  {
    programme: "DL-B.Sc(Ed)",
    tuition: 95000,
    techFee: 18000,
    materialsFee: 10000,
  },
  { programme: "DL-PGD", tuition: 120000, techFee: 20000, materialsFee: 12000 },
  {
    programme: "DL-PGDE",
    tuition: 130000,
    techFee: 20000,
    materialsFee: 12000,
  },
  {
    programme: "DL-Certificate",
    tuition: 45000,
    techFee: 10000,
    materialsFee: 5000,
  },
];

const statusColors: Record<DLStatus, string> = {
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Withdrawn: "bg-red-100 text-red-700",
  Graduated: "bg-blue-100 text-blue-700",
};

const feeColors: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Partial: "bg-amber-100 text-amber-700",
  Outstanding: "bg-red-100 text-red-700",
};

export function DistanceLearningAdmin() {
  const [students, setStudents] = useState<DLStudent[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<DLStudent | null>(null);
  const [regOpen, setRegOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);
  const [enrollForm, setEnrollForm] = useState({
    name: "",
    matric: "",
    department: "",
    level: "100",
    programme: "DL-B.Sc(Ed)",
  });
  const [calendarDates, setCalendarDates] = useState({
    semStart: "2024-09-01",
    semEnd: "2025-01-31",
    examStart: "2025-01-15",
    resultsDate: "2025-02-28",
  });
  const [fees, setFees] = useState(feeSchedule);
  const [saveMsg, setSaveMsg] = useState("");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matric.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || s.department === filterDept;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchLevel = filterLevel === "all" || s.level === filterLevel;
    return matchSearch && matchDept && matchStatus && matchLevel;
  });

  const totalActive = students.filter((s) => s.status === "Active").length;
  const totalOnHold = students.filter((s) => s.status === "On Hold").length;
  const totalGraduated = students.filter(
    (s) => s.status === "Graduated",
  ).length;

  const eligibleForGrad = students.filter(
    (s) => s.level === "400" && s.status === "Active" && s.cgpa >= 1.5,
  );

  const deptCounts = DEPARTMENTS.map((d) => ({
    dept: d,
    count: students.filter((s) => s.department === d).length,
  })).filter((d) => d.count > 0);

  const progCounts = PROGRAMMES.map((p) => ({
    prog: p,
    count: students.filter((s) => s.programme === p).length,
  })).filter((p) => p.count > 0);

  const maxDeptCount = Math.max(...deptCounts.map((d) => d.count), 1);

  const handleEnroll = () => {
    const newStudent: DLStudent = {
      id: `DL${String(students.length + 1).padStart(3, "0")}`,
      name: enrollForm.name,
      matric: enrollForm.matric,
      department: enrollForm.department,
      level: enrollForm.level,
      semester: "First",
      programme: enrollForm.programme,
      status: "Active",
      feeStatus: "Outstanding",
      cgpa: 0,
    };
    setStudents((prev) => [...prev, newStudent]);
    setEnrollDialog(false);
    setEnrollForm({
      name: "",
      matric: "",
      department: "",
      level: "100",
      programme: "DL-B.Sc(Ed)",
    });
  };

  const openEdit = (student: DLStudent) => {
    setEditingStudent({ ...student });
    setEditDialog(true);
  };

  const saveEdit = () => {
    if (!editingStudent) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? editingStudent : s)),
    );
    setEditDialog(false);
    setEditingStudent(null);
  };

  const approveGraduation = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Graduated" } : s)),
    );
  };

  const handleSaveSettings = () => {
    setSaveMsg("Settings saved successfully.");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleExportCSV = () => {
    const rows = [
      [
        "ID",
        "Name",
        "Matric",
        "Department",
        "Level",
        "Programme",
        "Status",
        "Fee Status",
        "CGPA",
      ],
      ...filtered.map((s) => [
        s.id,
        s.name,
        s.matric,
        s.department,
        s.level,
        s.programme,
        s.status,
        s.feeStatus,
        s.cgpa,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dl_students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Distance Learning Administration
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Federal University of Education, Kontagora — DL Centre
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            data-ocid="dl-admin.export_csv"
          >
            <Download size={15} className="mr-1.5" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="dl-admin.print_report"
          >
            <Printer size={15} className="mr-1.5" /> Print Report
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setEnrollDialog(true)}
            data-ocid="dl-admin.enroll_student"
          >
            <PlusCircle size={15} className="mr-1.5" /> Enroll Student
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total DL Students"
          value={students.length}
          icon={<Users size={20} />}
          color="blue"
        />
        <StatCard
          title="Active"
          value={totalActive}
          icon={<CheckCircle size={20} />}
          color="green"
        />
        <StatCard
          title="On Hold"
          value={totalOnHold}
          icon={<PauseCircle size={20} />}
          color="amber"
        />
        <StatCard
          title="Graduated (All Time)"
          value={totalGraduated}
          icon={<GraduationCap size={20} />}
          color="purple"
        />
      </div>

      <Tabs defaultValue="enrollment">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="enrollment" data-ocid="dl-admin.tab_enrollment">
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="metrics" data-ocid="dl-admin.tab_metrics">
            Metrics
          </TabsTrigger>
          <TabsTrigger value="calendar" data-ocid="dl-admin.tab_calendar">
            Academic Calendar
          </TabsTrigger>
          <TabsTrigger value="fees" data-ocid="dl-admin.tab_fees">
            Fee Management
          </TabsTrigger>
          <TabsTrigger value="graduation" data-ocid="dl-admin.tab_graduation">
            Graduation
          </TabsTrigger>
          <TabsTrigger value="reports" data-ocid="dl-admin.tab_reports">
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search name or matric..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="dl-admin.search_input"
              />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-44" data-ocid="dl-admin.filter_dept">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-28" data-ocid="dl-admin.filter_level">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {["100", "200", "300", "400"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}L
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                className="w-32"
                data-ocid="dl-admin.filter_status"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(
                  ["Active", "On Hold", "Withdrawn", "Graduated"] as DLStatus[]
                ).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Matric No.",
                        "Name",
                        "Department",
                        "Level",
                        "Programme",
                        "Status",
                        "Fee Status",
                        "CGPA",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                        data-ocid={`dl-admin.student_row.${s.id}`}
                      >
                        <td className="px-4 py-3 font-mono text-blue-600 whitespace-nowrap">
                          {s.matric}
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {s.department}
                        </td>
                        <td className="px-4 py-3 text-center">{s.level}L</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {s.programme}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${feeColors[s.feeStatus]}`}
                          >
                            {s.feeStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {s.cgpa > 0 ? s.cgpa.toFixed(2) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(s)}
                            data-ocid={`dl-admin.edit_student.${s.id}`}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          No students match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t text-xs text-slate-400">
                Showing {filtered.length} of {students.length} students
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 size={16} className="text-blue-600" /> DL Students
                  by Department
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deptCounts.map(({ dept, count }) => (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 truncate">{dept}</span>
                      <span className="font-semibold text-slate-800 shrink-0 ml-2">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(count / maxDeptCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users size={16} className="text-purple-600" /> Programme
                  Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progCounts.map(({ prog, count }) => {
                  const pct = Math.round((count / students.length) * 100);
                  const colors = [
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-green-500",
                    "bg-amber-500",
                    "bg-pink-500",
                  ];
                  const idx = PROGRAMMES.indexOf(prog);
                  return (
                    <div key={prog} className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${colors[idx % colors.length]}`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="text-slate-600">{prog}</span>
                          <span className="font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${colors[idx % colors.length]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Enrolment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {["Active", "On Hold", "Withdrawn", "Graduated"].map((st) => (
                  <div key={st} className="flex justify-between">
                    <span className="text-slate-500">{st}</span>
                    <span className="font-bold">
                      {students.filter((s) => s.status === st).length}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fee Collection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {["Paid", "Partial", "Outstanding"].map((fs) => (
                  <div key={fs} className="flex justify-between">
                    <span className="text-slate-500">{fs}</span>
                    <span className="font-bold">
                      {students.filter((s) => s.feeStatus === fs).length}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Level Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {["100", "200", "300", "400"].map((lv) => (
                  <div key={lv} className="flex justify-between">
                    <span className="text-slate-500">{lv}L</span>
                    <span className="font-bold">
                      {students.filter((s) => s.level === lv).length}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Calendar Tab */}
        <TabsContent value="calendar" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" /> DL Academic
                Calendar — 2024/2025 Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Semester Start Date", key: "semStart" as const },
                  { label: "Semester End Date", key: "semEnd" as const },
                  {
                    label: "Examination Period Start",
                    key: "examStart" as const,
                  },
                  {
                    label: "Results Release Date",
                    key: "resultsDate" as const,
                  },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <Label className="text-sm">{label}</Label>
                    <Input
                      type="date"
                      className="mt-1"
                      value={calendarDates[key]}
                      onChange={(e) =>
                        setCalendarDates((d) => ({
                          ...d,
                          [key]: e.target.value,
                        }))
                      }
                      data-ocid={`dl-admin.calendar.${key}`}
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-sm text-slate-700">
                  Portal Access Controls
                </h3>
                {[
                  {
                    label: "DL Course Registration",
                    sublabel: "Allow DL students to register courses",
                    state: regOpen,
                    setter: setRegOpen,
                    key: "reg",
                  },
                  {
                    label: "DL Result Access",
                    sublabel: "Allow DL students to view semester results",
                    state: resultsOpen,
                    setter: setResultsOpen,
                    key: "results",
                  },
                ].map(({ label, sublabel, state, setter, key }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {label}
                      </p>
                      <p className="text-xs text-slate-500">{sublabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setter((v) => !v)}
                      className="flex items-center gap-2 text-sm font-medium"
                      data-ocid={`dl-admin.toggle.${key}`}
                    >
                      {state ? (
                        <>
                          <ToggleRight size={28} className="text-green-500" />
                          <span className="text-green-600">Open</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={28} className="text-slate-400" />
                          <span className="text-slate-400">Closed</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {saveMsg && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
                  <CheckCircle size={15} /> {saveMsg}
                </div>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveSettings}
                data-ocid="dl-admin.save_calendar"
              >
                <Settings size={15} className="mr-1.5" /> Save Calendar Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Management Tab */}
        <TabsContent value="fees" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" /> DL Fee
                Schedule — 2024/2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Programme",
                        "Tuition (₦)",
                        "Technology Fee (₦)",
                        "Materials Fee (₦)",
                        "Total (₦)",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f, i) => (
                      <tr key={f.programme} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">{f.programme}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={f.tuition}
                            onChange={(e) =>
                              setFees((prev) =>
                                prev.map((p, pi) =>
                                  pi === i
                                    ? { ...p, tuition: +e.target.value }
                                    : p,
                                ),
                              )
                            }
                            className="w-28 h-7 text-sm"
                            data-ocid={`dl-admin.fee.tuition.${f.programme}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={f.techFee}
                            onChange={(e) =>
                              setFees((prev) =>
                                prev.map((p, pi) =>
                                  pi === i
                                    ? { ...p, techFee: +e.target.value }
                                    : p,
                                ),
                              )
                            }
                            className="w-28 h-7 text-sm"
                            data-ocid={`dl-admin.fee.tech.${f.programme}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={f.materialsFee}
                            onChange={(e) =>
                              setFees((prev) =>
                                prev.map((p, pi) =>
                                  pi === i
                                    ? { ...p, materialsFee: +e.target.value }
                                    : p,
                                ),
                              )
                            }
                            className="w-28 h-7 text-sm"
                            data-ocid={`dl-admin.fee.materials.${f.programme}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-700">
                          ₦
                          {(
                            f.tuition +
                            f.techFee +
                            f.materialsFee
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveSettings}
                data-ocid="dl-admin.save_fees"
              >
                Save Fee Schedule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-500" /> Fee Payment
                Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {["Matric", "Name", "Programme", "Fee Status"].map(
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
                    {students.slice(0, 10).map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="px-3 py-2 font-mono text-blue-600 text-xs">
                          {s.matric}
                        </td>
                        <td className="px-3 py-2">{s.name}</td>
                        <td className="px-3 py-2 text-slate-500">
                          {s.programme}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${feeColors[s.feeStatus]}`}
                          >
                            {s.feeStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-slate-400 px-3 py-2">
                  Showing first 10 records. Export CSV for full list.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Graduation Tab */}
        <TabsContent value="graduation" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-600" /> DL
                Graduation — Eligible Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eligibleForGrad.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <GraduationCap
                    size={36}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p>No students currently eligible for graduation approval.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {[
                          "Matric",
                          "Name",
                          "Department",
                          "Programme",
                          "CGPA",
                          "Clearance",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {eligibleForGrad.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`dl-admin.graduation.${s.id}`}
                        >
                          <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                            {s.matric}
                          </td>
                          <td className="px-4 py-3 font-medium">{s.name}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {s.department}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{s.programme}</Badge>
                          </td>
                          <td className="px-4 py-3 font-bold text-green-700">
                            {s.cgpa.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.feeStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {s.feeStatus === "Paid" ? "Cleared" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                              onClick={() => approveGraduation(s.id)}
                              disabled={s.feeStatus !== "Paid"}
                              data-ocid={`dl-admin.approve_grad.${s.id}`}
                            >
                              Approve
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Enrollment Report",
                desc: "Full list of all DL students with department, level, programme, and status breakdown for 2024/2025 session.",
                icon: <BookOpen size={20} className="text-blue-600" />,
                key: "enrollment",
              },
              {
                title: "Result Summary",
                desc: "Average GPA per department, pass/fail rates, and academic status distribution for DL students.",
                icon: <BarChart3 size={20} className="text-purple-600" />,
                key: "results",
              },
              {
                title: "Fee Collection Report",
                desc: "Summary of paid, partial, and outstanding fees across all DL programmes and departments.",
                icon: <DollarSign size={20} className="text-green-600" />,
                key: "fees",
              },
              {
                title: "Graduation Eligibility Report",
                desc: "List of 400L DL students meeting graduation requirements with CGPA and clearance status.",
                icon: <GraduationCap size={20} className="text-amber-600" />,
                key: "graduation",
              },
            ].map((r) => (
              <Card key={r.key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {r.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleExportCSV}
                      data-ocid={`dl-admin.report_export.${r.key}`}
                    >
                      <Download size={13} className="mr-1" /> Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.print()}
                      data-ocid={`dl-admin.report_print.${r.key}`}
                    >
                      <Printer size={13} className="mr-1" /> Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enroll Dialog */}
      <Dialog open={enrollDialog} onOpenChange={setEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll New DL Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input
                className="mt-1"
                value={enrollForm.name}
                onChange={(e) =>
                  setEnrollForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Student full name"
                data-ocid="dl-admin.enroll_form.name"
              />
            </div>
            <div>
              <Label>Matric Number</Label>
              <Input
                className="mt-1"
                value={enrollForm.matric}
                onChange={(e) =>
                  setEnrollForm((f) => ({ ...f, matric: e.target.value }))
                }
                placeholder="FUEK/DL/2024/XXX"
                data-ocid="dl-admin.enroll_form.matric"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select
                value={enrollForm.department}
                onValueChange={(v) =>
                  setEnrollForm((f) => ({ ...f, department: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="dl-admin.enroll_form.department"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Level</Label>
                <Select
                  value={enrollForm.level}
                  onValueChange={(v) =>
                    setEnrollForm((f) => ({ ...f, level: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="dl-admin.enroll_form.level"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["100", "200", "300", "400"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}L
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Programme</Label>
                <Select
                  value={enrollForm.programme}
                  onValueChange={(v) =>
                    setEnrollForm((f) => ({ ...f, programme: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="dl-admin.enroll_form.programme"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMMES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialog(false)}>
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleEnroll}
              disabled={
                !enrollForm.name || !enrollForm.matric || !enrollForm.department
              }
              data-ocid="dl-admin.enroll_submit"
            >
              <PlusCircle size={14} className="mr-1" /> Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit DL Student Status</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-slate-800">
                  {editingStudent.name}
                </p>
                <p className="text-slate-500 font-mono text-xs mt-0.5">
                  {editingStudent.matric}
                </p>
              </div>
              <div>
                <Label>Enrolment Status</Label>
                <Select
                  value={editingStudent.status}
                  onValueChange={(v) =>
                    setEditingStudent((s) =>
                      s ? { ...s, status: v as DLStatus } : s,
                    )
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="dl-admin.edit_status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "Active",
                        "On Hold",
                        "Withdrawn",
                        "Graduated",
                      ] as DLStatus[]
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fee Payment Status</Label>
                <Select
                  value={editingStudent.feeStatus}
                  onValueChange={(v) =>
                    setEditingStudent((s) =>
                      s ? { ...s, feeStatus: v as DLStudent["feeStatus"] } : s,
                    )
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="dl-admin.edit_fee_status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Paid", "Partial", "Outstanding"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveEdit}
              data-ocid="dl-admin.save_edit"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
