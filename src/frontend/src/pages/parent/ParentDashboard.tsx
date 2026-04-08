import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Home,
  Link2,
  LogOut,
  Printer,
  Search,
  Shield,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  type Announcement,
  type FeeInvoice,
  type Result,
  type StudentRecord,
  getLocalAnnouncements,
  getLocalResults,
  getLocalStudents,
} from "../../utils/sampleData";

const STORAGE_KEY = "unidigital_parent_links";

interface ParentLink {
  parentId: string;
  wardMatric: string;
  linkedAt: string;
}

interface CourseAttendance {
  courseCode: string;
  courseTitle: string;
  present: number;
  total: number;
}

interface DisciplinaryEntry {
  studentMatric: string;
  caseNo: string;
  offence: string;
  date: string;
  status: string;
}

function getLinkedWards(parentId: string): string[] {
  const all: ParentLink[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]",
  );
  return all.filter((l) => l.parentId === parentId).map((l) => l.wardMatric);
}

function addWardLink(parentId: string, wardMatric: string) {
  const all: ParentLink[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]",
  );
  if (
    !all.find((l) => l.parentId === parentId && l.wardMatric === wardMatric)
  ) {
    all.push({ parentId, wardMatric, linkedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

function removeWardLink(parentId: string, wardMatric: string) {
  const all: ParentLink[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]",
  );
  const updated = all.filter(
    (l) => !(l.parentId === parentId && l.wardMatric === wardMatric),
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function computeWardAttendance(matric: string): CourseAttendance[] {
  const raw: {
    courseCode: string;
    courseTitle: string;
    studentMatric: string;
    status: string;
  }[] = JSON.parse(
    localStorage.getItem("unidigital_student_attendance") || "[]",
  );
  const byCourse: Record<
    string,
    { title: string; present: number; total: number }
  > = {};
  for (const r of raw.filter((r) => r.studentMatric === matric)) {
    if (!byCourse[r.courseCode])
      byCourse[r.courseCode] = {
        title: r.courseTitle || r.courseCode,
        present: 0,
        total: 0,
      };
    byCourse[r.courseCode].total++;
    if (r.status === "present") byCourse[r.courseCode].present++;
  }
  return Object.entries(byCourse).map(([code, v]) => ({
    courseCode: code,
    courseTitle: v.title,
    present: v.present,
    total: v.total,
  }));
}

function getWardDisciplinary(matric: string): DisciplinaryEntry[] {
  const all: DisciplinaryEntry[] = JSON.parse(
    localStorage.getItem("unidigital_disciplinary_records") || "[]",
  );
  return all.filter((r) => r.studentMatric === matric);
}

function computeGPA(results: Result[]): number {
  if (!results.length) return 0;
  const total = results.reduce((s, r) => s + r.gradePoint, 0);
  return Math.round((total / results.length) * 100) / 100;
}

function getWardTimetable(
  student: StudentRecord,
): { day: string; time: string; course: string; venue: string }[] {
  const dept = student.department.split(" ")[0].toUpperCase().substring(0, 3);
  return [
    {
      day: "Monday",
      time: "8:00 - 9:00",
      course: `${dept}101 Introduction`,
      venue: "LT1",
    },
    {
      day: "Monday",
      time: "10:00 - 11:00",
      course: `${dept}103 Fundamentals`,
      venue: "LT2",
    },
    {
      day: "Tuesday",
      time: "9:00 - 10:00",
      course: `${dept}201 Advanced Topics`,
      venue: "Lab A",
    },
    {
      day: "Wednesday",
      time: "11:00 - 12:00",
      course: `${dept}205 Research Methods`,
      venue: "Sem Room 3",
    },
    {
      day: "Thursday",
      time: "8:00 - 9:00",
      course: `${dept}203 Applied ${dept}`,
      venue: "LT1",
    },
    {
      day: "Friday",
      time: "9:00 - 11:00",
      course: "GST101 Communication Skills",
      venue: "Auditorium",
    },
  ];
}

// Alert thresholds
const LOW_ATTENDANCE_THRESHOLD = 75;
const POOR_GRADE_CODES = ["F", "D"];

interface WardData {
  student: StudentRecord;
  results: Result[];
  invoices: FeeInvoice[];
  attendance: CourseAttendance[];
  disciplinary: DisciplinaryEntry[];
}

const PARENT_ID = "parent_portal_user";
type ParentPage = "dashboard" | "ward" | "link-ward" | "announcements";

export function ParentDashboard() {
  const [linkedWards, setLinkedWards] = useState<string[]>([]);
  const [wardsData, setWardsData] = useState<Record<string, WardData>>({});
  const [activeWardMatric, setActiveWardMatric] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [activePage, setActivePage] = useState<ParentPage>("dashboard");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function loadWardData(student: StudentRecord): WardData {
      const invoices: FeeInvoice[] = JSON.parse(
        localStorage.getItem("unidigital_invoices") || "[]",
      );
      return {
        student,
        results: getLocalResults().filter(
          (r) => r.studentMatric === student.matricNumber,
        ),
        invoices: invoices.filter(
          (inv) => inv.studentMatric === student.matricNumber,
        ),
        attendance: computeWardAttendance(student.matricNumber),
        disciplinary: getWardDisciplinary(student.matricNumber),
      };
    }

    const allStudents = getLocalStudents();
    const wards = getLinkedWards(PARENT_ID);
    setLinkedWards(wards);
    if (wards.length > 0) {
      const dataMap: Record<string, WardData> = {};
      for (const matric of wards) {
        const student = allStudents.find((s) => s.matricNumber === matric);
        if (student) dataMap[matric] = loadWardData(student);
      }
      setWardsData(dataMap);
      setActiveWardMatric(wards[0]);
    }
    setNotifications(getLocalAnnouncements().filter((a) => a.target === "all"));
  }, []);

  const handleLinkWard = () => {
    setLinkError("");
    const input = linkInput.trim();
    if (!input) {
      setLinkError("Please enter a matric number or student name.");
      return;
    }
    if (linkedWards.includes(input.toUpperCase())) {
      setLinkError("This ward is already linked.");
      return;
    }

    // Search by matric number OR name
    const allStudentsNow = getLocalStudents();
    const student =
      allStudentsNow.find((s) => s.matricNumber === input.toUpperCase()) ||
      allStudentsNow.find((s) =>
        s.name.toLowerCase().includes(input.toLowerCase()),
      );

    if (!student) {
      setLinkError(
        "No student found with this matric number or name. Please check and try again.",
      );
      return;
    }
    if (linkedWards.includes(student.matricNumber)) {
      setLinkError("This ward is already linked.");
      return;
    }

    addWardLink(PARENT_ID, student.matricNumber);
    const updated = [...linkedWards, student.matricNumber];
    setLinkedWards(updated);
    const invoices: FeeInvoice[] = JSON.parse(
      localStorage.getItem("unidigital_invoices") || "[]",
    );
    const newWardData: WardData = {
      student,
      results: getLocalResults().filter(
        (r) => r.studentMatric === student.matricNumber,
      ),
      invoices: invoices.filter(
        (inv) => inv.studentMatric === student.matricNumber,
      ),
      attendance: computeWardAttendance(student.matricNumber),
      disciplinary: getWardDisciplinary(student.matricNumber),
    };
    setWardsData((prev) => ({ ...prev, [student.matricNumber]: newWardData }));
    if (!activeWardMatric) setActiveWardMatric(student.matricNumber);
    setLinkInput("");
    toast.success(`Ward ${student.name} linked successfully`);
    setActivePage("dashboard");
  };

  const handleUnlink = (matric: string) => {
    removeWardLink(PARENT_ID, matric);
    const updated = linkedWards.filter((w) => w !== matric);
    setLinkedWards(updated);
    setWardsData((prev) => {
      const copy = { ...prev };
      delete copy[matric];
      return copy;
    });
    if (activeWardMatric === matric) {
      setActiveWardMatric(updated[0] ?? null);
    }
    toast.success("Ward unlinked");
  };

  const handlePrint = () => window.print();

  const activeWard = activeWardMatric ? wardsData[activeWardMatric] : null;
  const cgpa = activeWard ? computeGPA(activeWard.results) : 0;
  const totalFees = activeWard?.invoices.reduce((s, i) => s + i.amount, 0) ?? 0;
  const paidFees = activeWard?.invoices.reduce((s, i) => s + i.paid, 0) ?? 0;
  const outstanding = totalFees - paidFees;
  const avgAttendance = activeWard?.attendance.length
    ? Math.round(
        (activeWard.attendance.reduce(
          (s, a) => s + (a.total > 0 ? a.present / a.total : 0),
          0,
        ) /
          activeWard.attendance.length) *
          100,
      )
    : 0;

  // Alert counts for badge
  const lowAttendanceCourses = (activeWard?.attendance ?? []).filter(
    (a) =>
      a.total > 0 && (a.present / a.total) * 100 < LOW_ATTENDANCE_THRESHOLD,
  );
  const poorGradeResults = (activeWard?.results ?? []).filter((r) =>
    POOR_GRADE_CODES.includes(r.grade),
  );
  const alertCount =
    lowAttendanceCourses.length +
    poorGradeResults.length +
    (outstanding > 0 ? 1 : 0) +
    (activeWard?.disciplinary.length ?? 0);

  const navItems: {
    key: ParentPage;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "ward", label: "Ward Profile", icon: User },
    { key: "link-ward", label: "Link Ward", icon: Link2 },
    { key: "announcements", label: "Announcements", icon: Bell },
  ];

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0 flex-col hidden md:flex">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Shield size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Parent Portal
              </p>
              <p className="text-xs text-muted-foreground">UniDigital</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActivePage(key)}
              data-ocid={`parent-sidebar.nav.${key}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activePage === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
              {key === "dashboard" && alertCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Ward switcher */}
        {linkedWards.length > 0 && (
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 px-1 font-medium">
              Linked Wards
            </p>
            {linkedWards.map((matric) => {
              const data = wardsData[matric];
              const wardCgpa = data ? computeGPA(data.results) : 0;
              const wardInvoices = data?.invoices ?? [];
              const wardOutstanding = wardInvoices.reduce(
                (s, i) => s + i.amount - i.paid,
                0,
              );
              return (
                <button
                  key={matric}
                  type="button"
                  onClick={() => {
                    setActiveWardMatric(matric);
                    setActivePage("dashboard");
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    activeWardMatric === matric
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <GraduationCap size={14} />
                  <span className="truncate flex-1">
                    {data?.student.name ?? matric}
                  </span>
                  {wardOutstanding > 0 && (
                    <span
                      className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                      title="Overdue fees"
                    />
                  )}
                  {wardCgpa > 0 && (
                    <span
                      className={`text-xs font-semibold ${wardCgpa >= 3.5 ? "text-green-600" : wardCgpa < 2.0 ? "text-red-600" : "text-foreground"}`}
                    >
                      {wardCgpa.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="p-3 border-t border-border">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {activePage === "dashboard" && "Parent Dashboard"}
              {activePage === "ward" && "Ward Profile"}
              {activePage === "link-ward" && "Link a Ward"}
              {activePage === "announcements" && "Announcements"}
            </h1>
            {activeWard &&
              activePage !== "link-ward" &&
              activePage !== "announcements" && (
                <p className="text-sm text-muted-foreground">
                  Monitoring:{" "}
                  <span className="font-medium text-primary">
                    {activeWard.student.name}
                  </span>
                </p>
              )}
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <Badge className="bg-red-100 text-red-700 border-0 flex items-center gap-1">
                <AlertTriangle size={12} /> {alertCount} Alert
                {alertCount !== 1 ? "s" : ""}
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary border-0">
              {linkedWards.length} Ward{linkedWards.length !== 1 ? "s" : ""}{" "}
              Linked
            </Badge>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* DASHBOARD PAGE */}
          {activePage === "dashboard" && (
            <div className="space-y-6">
              {linkedWards.length === 0 ? (
                <Card data-ocid="parent-dashboard.empty_state">
                  <CardContent className="p-12 text-center">
                    <Link2
                      size={48}
                      className="mx-auto mb-4 text-muted-foreground/30"
                    />
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      No Ward Linked Yet
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      Link your ward using their matric number or name to start
                      monitoring their academic progress.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setActivePage("link-ward")}
                      data-ocid="parent-dashboard.cta_link_ward"
                    >
                      <Link2 size={16} className="mr-2" /> Link a Ward
                    </Button>
                  </CardContent>
                </Card>
              ) : activeWard ? (
                <>
                  {/* Multi-ward tab switcher */}
                  {linkedWards.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                      {linkedWards.map((matric) => {
                        const data = wardsData[matric];
                        return (
                          <button
                            key={matric}
                            type="button"
                            onClick={() => setActiveWardMatric(matric)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                              activeWardMatric === matric
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-foreground hover:bg-muted"
                            }`}
                            data-ocid={`parent-dashboard.ward-tab.${matric}`}
                          >
                            <GraduationCap size={14} />
                            {data?.student.name ?? matric}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Alert banner */}
                  {alertCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600" />
                        {alertCount} issue{alertCount !== 1 ? "s" : ""} require
                        attention for {activeWard.student.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {outstanding > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            Overdue Fees: ₦{outstanding.toLocaleString()}
                          </span>
                        )}
                        {lowAttendanceCourses.map((a) => (
                          <span
                            key={a.courseCode}
                            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium"
                          >
                            Low attendance: {a.courseCode} (
                            {Math.round((a.present / a.total) * 100)}%)
                          </span>
                        ))}
                        {poorGradeResults.map((r) => (
                          <span
                            key={r.id}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium"
                          >
                            Poor grade: {r.courseCode} ({r.grade})
                          </span>
                        ))}
                        {activeWard.disciplinary.length > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                            {activeWard.disciplinary.length} disciplinary notice
                            {activeWard.disciplinary.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* KPI Cards */}
                  <div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    data-ocid="parent-dashboard.kpi_cards"
                  >
                    <Card
                      className={
                        cgpa >= 3.5
                          ? "bg-green-50 border-green-100"
                          : cgpa < 2.0
                            ? "bg-red-50 border-red-100"
                            : "bg-blue-50 border-blue-100"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp
                            size={20}
                            className={
                              cgpa >= 3.5
                                ? "text-green-600"
                                : cgpa < 2.0
                                  ? "text-red-500"
                                  : "text-blue-600"
                            }
                          />
                          <div>
                            <p
                              className={`text-xs font-medium ${cgpa >= 3.5 ? "text-green-600" : cgpa < 2.0 ? "text-red-600" : "text-blue-600"}`}
                            >
                              CGPA
                            </p>
                            <p
                              className={`text-2xl font-bold ${cgpa >= 3.5 ? "text-green-800" : cgpa < 2.0 ? "text-red-800" : "text-blue-800"}`}
                            >
                              {cgpa.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={
                        outstanding > 0
                          ? "bg-red-50 border-red-100"
                          : "bg-green-50 border-green-100"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {outstanding > 0 ? (
                            <XCircle size={20} className="text-red-500" />
                          ) : (
                            <CheckCircle size={20} className="text-green-600" />
                          )}
                          <div>
                            <p
                              className={`text-xs font-medium ${outstanding > 0 ? "text-red-600" : "text-green-600"}`}
                            >
                              Outstanding Fees
                            </p>
                            <p
                              className={`text-xl font-bold ${outstanding > 0 ? "text-red-800" : "text-green-800"}`}
                            >
                              ₦{outstanding.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={
                        avgAttendance < LOW_ATTENDANCE_THRESHOLD
                          ? "bg-orange-50 border-orange-100"
                          : "bg-purple-50 border-purple-100"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <ClipboardList
                            size={20}
                            className={
                              avgAttendance < LOW_ATTENDANCE_THRESHOLD
                                ? "text-orange-500"
                                : "text-purple-600"
                            }
                          />
                          <div>
                            <p
                              className={`text-xs font-medium ${avgAttendance < LOW_ATTENDANCE_THRESHOLD ? "text-orange-600" : "text-purple-600"}`}
                            >
                              Attendance
                            </p>
                            <p
                              className={`text-2xl font-bold ${avgAttendance < LOW_ATTENDANCE_THRESHOLD ? "text-orange-800" : "text-purple-800"}`}
                            >
                              {avgAttendance}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={
                        activeWard.disciplinary.length > 0
                          ? "bg-orange-50 border-orange-100"
                          : "bg-muted/30"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            size={20}
                            className={
                              activeWard.disciplinary.length > 0
                                ? "text-orange-500"
                                : "text-muted-foreground"
                            }
                          />
                          <div>
                            <p
                              className={`text-xs font-medium ${activeWard.disciplinary.length > 0 ? "text-orange-600" : "text-muted-foreground"}`}
                            >
                              Notices
                            </p>
                            <p
                              className={`text-2xl font-bold ${activeWard.disciplinary.length > 0 ? "text-orange-800" : "text-foreground"}`}
                            >
                              {activeWard.disciplinary.length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detail tabs */}
                  <Tabs defaultValue="results">
                    <TabsList>
                      <TabsTrigger
                        value="results"
                        data-ocid="parent-dashboard.tab_results"
                      >
                        Results
                        {poorGradeResults.length > 0 && (
                          <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-xs">
                            {poorGradeResults.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="fees"
                        data-ocid="parent-dashboard.tab_fees"
                      >
                        Fees
                        {outstanding > 0 && (
                          <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-xs">
                            !
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="attendance"
                        data-ocid="parent-dashboard.tab_attendance"
                      >
                        Attendance
                        {lowAttendanceCourses.length > 0 && (
                          <span className="ml-1 bg-orange-500 text-white rounded-full px-1.5 text-xs">
                            {lowAttendanceCourses.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="timetable"
                        data-ocid="parent-dashboard.tab_timetable"
                      >
                        Timetable
                      </TabsTrigger>
                      <TabsTrigger
                        value="disciplinary"
                        data-ocid="parent-dashboard.tab_disciplinary"
                      >
                        Notices
                        {activeWard.disciplinary.length > 0 && (
                          <span className="ml-1 bg-orange-500 text-white rounded-full px-1.5 text-xs">
                            {activeWard.disciplinary.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    {/* Results Tab */}
                    <TabsContent value="results">
                      <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                          <CardTitle className="text-base">
                            Latest Results
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={handlePrint}
                            data-ocid="parent-dashboard.print_record"
                          >
                            <Printer size={14} className="mr-1" /> Print Record
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {activeWard.results.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No results published yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    {[
                                      "Course",
                                      "Semester",
                                      "Score",
                                      "Grade",
                                      "GP",
                                    ].map((h) => (
                                      <th
                                        key={h}
                                        className="py-2 text-left text-muted-foreground font-medium"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeWard.results.map((r) => (
                                    <tr
                                      key={r.id}
                                      className="border-b last:border-0"
                                    >
                                      <td className="py-2 font-medium text-foreground">
                                        {r.courseCode}
                                      </td>
                                      <td className="py-2 text-muted-foreground">
                                        {r.semester}
                                      </td>
                                      <td className="py-2 text-right">
                                        {r.score}
                                      </td>
                                      <td className="py-2 text-right">
                                        <Badge
                                          className={`text-xs border-0 ${
                                            r.grade === "A"
                                              ? "bg-green-100 text-green-700"
                                              : r.grade === "F"
                                                ? "bg-red-100 text-red-700"
                                                : r.grade === "D"
                                                  ? "bg-orange-100 text-orange-700"
                                                  : "bg-blue-100 text-blue-700"
                                          }`}
                                        >
                                          {r.grade}
                                        </Badge>
                                      </td>
                                      <td className="py-2 text-right text-muted-foreground">
                                        {r.gradePoint}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Cumulative GPA
                                </span>
                                <span className="font-bold text-primary">
                                  {cgpa.toFixed(2)}/5.00
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Fees Tab */}
                    <TabsContent value="fees">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Fee Payment Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-muted/30 rounded-lg p-3 text-center">
                              <p className="text-xs text-muted-foreground">
                                Total Billed
                              </p>
                              <p className="font-bold text-foreground">
                                ₦{totalFees.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-green-600">Paid</p>
                              <p className="font-bold text-green-700">
                                ₦{paidFees.toLocaleString()}
                              </p>
                            </div>
                            <div
                              className={`${outstanding > 0 ? "bg-red-50" : "bg-green-50"} rounded-lg p-3 text-center`}
                            >
                              <p
                                className={`text-xs ${outstanding > 0 ? "text-red-600" : "text-green-600"}`}
                              >
                                Outstanding
                              </p>
                              <p
                                className={`font-bold ${outstanding > 0 ? "text-red-700" : "text-green-700"}`}
                              >
                                ₦{outstanding.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {activeWard.invoices.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No invoices found.
                            </p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  {[
                                    "Description",
                                    "Session",
                                    "Amount",
                                    "Status",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className="py-2 text-left text-muted-foreground font-medium"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {activeWard.invoices.map((inv) => (
                                  <tr
                                    key={inv.id}
                                    className="border-b last:border-0"
                                  >
                                    <td className="py-2 text-foreground">
                                      {inv.description}
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                      {inv.session}
                                    </td>
                                    <td className="py-2 text-right">
                                      ₦{inv.amount.toLocaleString()}
                                    </td>
                                    <td className="py-2 text-right">
                                      {inv.paid >= inv.amount ? (
                                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                          Paid
                                        </Badge>
                                      ) : inv.paid > 0 ? (
                                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                                          Partial
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                          Unpaid
                                        </Badge>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Attendance by Course
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {activeWard.attendance.length === 0 ? (
                            <div className="space-y-3">
                              {[
                                "Mathematics",
                                "Physics",
                                "Chemistry",
                                "Biology",
                                "GST",
                              ].map((sub, i) => {
                                const pct = 65 + i * 6;
                                return (
                                  <div
                                    key={sub}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="text-sm text-foreground w-32 truncate">
                                      {sub}
                                    </span>
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${pct >= 75 ? "bg-green-500" : "bg-orange-500"}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-medium ${pct < 75 ? "text-orange-600" : "text-muted-foreground"}`}
                                    >
                                      {pct}%
                                    </span>
                                    {pct < 75 && (
                                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                        Low
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              <p className="text-xs text-muted-foreground mt-2">
                                * Sample attendance data
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {activeWard.attendance.map((a) => {
                                const pct =
                                  a.total > 0
                                    ? Math.round((a.present / a.total) * 100)
                                    : 0;
                                const isLow = pct < LOW_ATTENDANCE_THRESHOLD;
                                return (
                                  <div
                                    key={a.courseCode}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="text-sm text-foreground w-28 truncate">
                                      {a.courseCode}
                                    </span>
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-medium ${isLow ? "text-orange-600" : "text-muted-foreground"}`}
                                    >
                                      {pct}% ({a.present}/{a.total})
                                    </span>
                                    {isLow && (
                                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                        ⚠ Low
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Timetable Tab */}
                    <TabsContent value="timetable">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Weekly Timetable
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  {["Day", "Time", "Course", "Venue"].map(
                                    (h) => (
                                      <th
                                        key={h}
                                        className="py-2 text-left text-muted-foreground font-medium"
                                      >
                                        {h}
                                      </th>
                                    ),
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {getWardTimetable(activeWard.student).map(
                                  (slot, i) => (
                                    <tr
                                      key={`${slot.day}-${slot.time}-${i}`}
                                      className="border-b last:border-0"
                                    >
                                      <td className="py-2 font-medium text-foreground">
                                        {slot.day}
                                      </td>
                                      <td className="py-2 text-muted-foreground">
                                        {slot.time}
                                      </td>
                                      <td className="py-2 text-foreground">
                                        {slot.course}
                                      </td>
                                      <td className="py-2 text-muted-foreground">
                                        {slot.venue}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Disciplinary Tab */}
                    <TabsContent value="disciplinary">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle
                              size={16}
                              className="text-orange-500"
                            />
                            Disciplinary Notices
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {activeWard.disciplinary.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <CheckCircle
                                size={32}
                                className="mx-auto mb-2 text-green-400"
                              />
                              No disciplinary records.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {activeWard.disciplinary.map((d) => (
                                <div
                                  key={d.caseNo}
                                  className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium text-orange-800">
                                        {d.offence}
                                      </p>
                                      <p className="text-xs text-orange-600 mt-1">
                                        Case No: {d.caseNo} • {d.date}
                                      </p>
                                    </div>
                                    <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                                      {d.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              ) : null}
            </div>
          )}

          {/* WARD PROFILE PAGE */}
          {activePage === "ward" && (
            <div className="space-y-6">
              {!activeWard ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <User size={40} className="mx-auto mb-3 opacity-30" />
                    No ward selected. Please link a ward first.
                  </CardContent>
                </Card>
              ) : (
                <div ref={printRef} className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                          {activeWard.student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-foreground">
                            {activeWard.student.name}
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            {activeWard.student.matricNumber}
                          </p>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Department:
                              </span>
                              <span className="ml-2 font-medium text-foreground">
                                {activeWard.student.department}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Level:
                              </span>
                              <span className="ml-2 font-medium text-foreground">
                                {activeWard.student.level}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                              <span className="ml-2 font-medium text-foreground">
                                {activeWard.student.email}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                CGPA:
                              </span>
                              <span className="ml-2 font-bold text-primary">
                                {cgpa.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={handlePrint}
                          data-ocid="parent-ward.print_button"
                        >
                          <Printer size={14} className="mr-1" /> Print Record
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Academic Progression
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(["100L", "200L", "300L", "400L"] as const).map(
                          (lvl, i) => {
                            const current =
                              Number.parseInt(activeWard.student.level, 10) ||
                              100;
                            const thisLvl = (i + 1) * 100;
                            const done = current > thisLvl;
                            const active = current === thisLvl;
                            return (
                              <div
                                key={lvl}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    done
                                      ? "bg-green-500 text-white"
                                      : active
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {done ? "✓" : i + 1}
                                </div>
                                <span
                                  className={`text-xs ${active ? "text-primary font-semibold" : done ? "text-green-600" : "text-muted-foreground"}`}
                                >
                                  {lvl}
                                </span>
                                {i < 3 && (
                                  <ChevronRight
                                    size={14}
                                    className="text-muted-foreground"
                                  />
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* LINK WARD PAGE */}
          {activePage === "link-ward" && (
            <div className="max-w-lg space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Link a Ward</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter your ward's matric number or full name to link their
                    academic record.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Ward's Matric Number or Name</Label>
                      <div className="flex gap-2 mt-1">
                        <div className="relative flex-1">
                          <Search
                            size={14}
                            className="absolute left-3 top-3 text-muted-foreground"
                          />
                          <Input
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleLinkWard()
                            }
                            placeholder="Matric number or student name"
                            className="pl-9"
                            data-ocid="parent-link.matric_input"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleLinkWard}
                          data-ocid="parent-link.submit_button"
                        >
                          <Link2 size={16} className="mr-2" /> Link
                        </Button>
                      </div>
                      {linkError && (
                        <p className="text-red-500 text-xs mt-1">{linkError}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {linkedWards.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Linked Wards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="space-y-2"
                      data-ocid="parent-link.wards_list"
                    >
                      {linkedWards.map((matric) => {
                        const data = wardsData[matric];
                        return (
                          <div
                            key={matric}
                            className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                {data?.student.name.charAt(0) ?? "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {data?.student.name ?? matric}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {matric} • {data?.student.department}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleUnlink(matric)}
                              data-ocid={`parent-link.unlink.${matric}`}
                            >
                              <XCircle size={16} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ANNOUNCEMENTS PAGE */}
          {activePage === "announcements" && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Bell size={40} className="mx-auto mb-3 opacity-30" />
                    No announcements at this time.
                  </CardContent>
                </Card>
              ) : (
                notifications.map((n, i) => (
                  <Card
                    key={n.id}
                    data-ocid={`parent-announcements.item.${i + 1}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {n.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {n.body}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {n.date
                              ? new Date(n.date).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
