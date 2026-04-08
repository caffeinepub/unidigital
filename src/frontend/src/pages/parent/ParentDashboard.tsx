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

function computeGPALocal(results: Result[]): number {
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
      course: `${dept}101 Introduction to ${dept}`,
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

const PARENT_ID = "parent_portal_user";
type ParentPage = "dashboard" | "ward" | "link-ward" | "announcements";

export function ParentDashboard() {
  const [linkedWards, setLinkedWards] = useState<string[]>([]);
  const [selectedWard, setSelectedWard] = useState<StudentRecord | null>(null);
  const [wardResults, setWardResults] = useState<Result[]>([]);
  const [wardInvoices, setWardInvoices] = useState<FeeInvoice[]>([]);
  const [wardAttendance, setWardAttendance] = useState<CourseAttendance[]>([]);
  const [wardDisciplinary, setWardDisciplinary] = useState<DisciplinaryEntry[]>(
    [],
  );
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [activePage, setActivePage] = useState<ParentPage>("dashboard");
  const printRef = useRef<HTMLDivElement>(null);

  const allStudents = getLocalStudents();
  const allResults = getLocalResults();
  const allInvoices: FeeInvoice[] = JSON.parse(
    localStorage.getItem("unidigital_invoices") || "[]",
  );

  const loadWardData = (student: StudentRecord) => {
    setSelectedWard(student);
    setWardResults(
      allResults.filter((r) => r.studentMatric === student.matricNumber),
    );
    setWardInvoices(
      allInvoices.filter((inv) => inv.studentMatric === student.matricNumber),
    );
    setWardAttendance(computeWardAttendance(student.matricNumber));
    setWardDisciplinary(getWardDisciplinary(student.matricNumber));
  };

  useEffect(() => {
    const students = getLocalStudents();
    const wards = getLinkedWards(PARENT_ID);
    setLinkedWards(wards);
    if (wards.length > 0) {
      const student = students.find((s) => s.matricNumber === wards[0]);
      if (student) {
        const invoices: FeeInvoice[] = JSON.parse(
          localStorage.getItem("unidigital_invoices") || "[]",
        );
        setSelectedWard(student);
        setWardResults(
          getLocalResults().filter(
            (r) => r.studentMatric === student.matricNumber,
          ),
        );
        setWardInvoices(
          invoices.filter((inv) => inv.studentMatric === student.matricNumber),
        );
        setWardAttendance(computeWardAttendance(student.matricNumber));
        setWardDisciplinary(getWardDisciplinary(student.matricNumber));
      }
    }
    setNotifications(getLocalAnnouncements().filter((a) => a.target === "all"));
  }, []);

  const handleLinkWard = () => {
    setLinkError("");
    const matric = linkInput.trim().toUpperCase();
    if (!matric) {
      setLinkError("Please enter a matric number.");
      return;
    }
    if (linkedWards.includes(matric)) {
      setLinkError("This ward is already linked.");
      return;
    }
    const student = allStudents.find((s) => s.matricNumber === matric);
    if (!student) {
      setLinkError(
        "No student found with this matric number. Please check and try again.",
      );
      return;
    }
    addWardLink(PARENT_ID, matric);
    const updated = [...linkedWards, matric];
    setLinkedWards(updated);
    setLinkInput("");
    toast.success(`Ward ${student.name} linked successfully`);
    loadWardData(student);
    setActivePage("dashboard");
  };

  const handleUnlink = (matric: string) => {
    removeWardLink(PARENT_ID, matric);
    const updated = linkedWards.filter((w) => w !== matric);
    setLinkedWards(updated);
    if (selectedWard?.matricNumber === matric) {
      setSelectedWard(null);
      setWardResults([]);
      setWardInvoices([]);
    }
    toast.success("Ward unlinked");
  };

  const handlePrint = () => window.print();

  const cgpa = computeGPALocal(wardResults);
  const totalFees = wardInvoices.reduce((s, i) => s + i.amount, 0);
  const paidFees = wardInvoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = totalFees - paidFees;
  const avgAttendance = wardAttendance.length
    ? Math.round(
        (wardAttendance.reduce(
          (s, a) => s + (a.total > 0 ? a.present / a.total : 0),
          0,
        ) /
          wardAttendance.length) *
          100,
      )
    : 0;

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
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex-col hidden md:flex">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">Parent Portal</p>
              <p className="text-xs text-slate-400">UniDigital</p>
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
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        {linkedWards.length > 0 && (
          <div className="p-3 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2 px-1">Linked Wards</p>
            {linkedWards.map((matric) => {
              const student = allStudents.find(
                (s) => s.matricNumber === matric,
              );
              return (
                <button
                  key={matric}
                  type="button"
                  onClick={() => {
                    if (student) {
                      loadWardData(student);
                      setActivePage("dashboard");
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedWard?.matricNumber === matric
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <GraduationCap size={14} />
                  <span className="truncate">{student?.name ?? matric}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="p-3 border-t border-slate-700">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {activePage === "dashboard" && "Parent Dashboard"}
              {activePage === "ward" && "Ward Profile"}
              {activePage === "link-ward" && "Link a Ward"}
              {activePage === "announcements" && "Announcements"}
            </h1>
            {selectedWard &&
              activePage !== "link-ward" &&
              activePage !== "announcements" && (
                <p className="text-sm text-slate-500">
                  Monitoring:{" "}
                  <span className="font-medium text-blue-600">
                    {selectedWard.name}
                  </span>
                </p>
              )}
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-0">
            {linkedWards.length} Ward{linkedWards.length !== 1 ? "s" : ""}{" "}
            Linked
          </Badge>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* DASHBOARD PAGE */}
          {activePage === "dashboard" && (
            <div className="space-y-6">
              {linkedWards.length === 0 ? (
                <Card data-ocid="parent-dashboard.empty_state">
                  <CardContent className="p-12 text-center">
                    <Link2 size={48} className="mx-auto mb-4 text-slate-300" />
                    <h2 className="text-lg font-semibold text-slate-700 mb-2">
                      No Ward Linked Yet
                    </h2>
                    <p className="text-slate-500 text-sm mb-4">
                      Link your ward using their matric number to start
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
              ) : (
                <>
                  {/* KPI Cards */}
                  <div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    data-ocid="parent-dashboard.kpi_cards"
                  >
                    <Card className="bg-blue-50 border-blue-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp size={20} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 font-medium">
                              CGPA
                            </p>
                            <p className="text-2xl font-bold text-blue-800">
                              {cgpa.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={`border-0 ${outstanding > 0 ? "bg-red-50" : "bg-green-50"}`}
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
                    <Card className="bg-purple-50 border-purple-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <ClipboardList
                            size={20}
                            className="text-purple-600"
                          />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">
                              Attendance
                            </p>
                            <p className="text-2xl font-bold text-purple-800">
                              {avgAttendance}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={`border-0 ${wardDisciplinary.length > 0 ? "bg-orange-50" : "bg-slate-50"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            size={20}
                            className={
                              wardDisciplinary.length > 0
                                ? "text-orange-500"
                                : "text-slate-400"
                            }
                          />
                          <div>
                            <p
                              className={`text-xs font-medium ${wardDisciplinary.length > 0 ? "text-orange-600" : "text-slate-500"}`}
                            >
                              Notices
                            </p>
                            <p
                              className={`text-2xl font-bold ${wardDisciplinary.length > 0 ? "text-orange-800" : "text-slate-700"}`}
                            >
                              {wardDisciplinary.length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedWard && (
                    <Tabs defaultValue="results">
                      <TabsList>
                        <TabsTrigger
                          value="results"
                          data-ocid="parent-dashboard.tab_results"
                        >
                          Results
                        </TabsTrigger>
                        <TabsTrigger
                          value="timetable"
                          data-ocid="parent-dashboard.tab_timetable"
                        >
                          Timetable
                        </TabsTrigger>
                        <TabsTrigger
                          value="fees"
                          data-ocid="parent-dashboard.tab_fees"
                        >
                          Fees
                        </TabsTrigger>
                        <TabsTrigger
                          value="attendance"
                          data-ocid="parent-dashboard.tab_attendance"
                        >
                          Attendance
                        </TabsTrigger>
                        <TabsTrigger
                          value="disciplinary"
                          data-ocid="parent-dashboard.tab_disciplinary"
                        >
                          Notices
                          {wardDisciplinary.length > 0 && (
                            <span className="ml-1 bg-orange-500 text-white rounded-full px-1.5 text-xs">
                              {wardDisciplinary.length}
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
                              <Printer size={14} className="mr-1" /> Print
                              Record
                            </Button>
                          </CardHeader>
                          <CardContent>
                            {wardResults.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-4">
                                No results published yet.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2 text-slate-500 font-medium">
                                        Course
                                      </th>
                                      <th className="text-left py-2 text-slate-500 font-medium">
                                        Semester
                                      </th>
                                      <th className="text-right py-2 text-slate-500 font-medium">
                                        Score
                                      </th>
                                      <th className="text-right py-2 text-slate-500 font-medium">
                                        Grade
                                      </th>
                                      <th className="text-right py-2 text-slate-500 font-medium">
                                        GP
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {wardResults.map((r) => (
                                      <tr
                                        key={r.id}
                                        className="border-b last:border-0"
                                      >
                                        <td className="py-2 font-medium text-slate-800">
                                          {r.courseCode}
                                        </td>
                                        <td className="py-2 text-slate-500">
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
                                                  : "bg-blue-100 text-blue-700"
                                            }`}
                                          >
                                            {r.grade}
                                          </Badge>
                                        </td>
                                        <td className="py-2 text-right text-slate-600">
                                          {r.gradePoint}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                                  <span className="text-slate-500">
                                    Cumulative GPA
                                  </span>
                                  <span className="font-bold text-blue-700">
                                    {cgpa.toFixed(2)}/5.00
                                  </span>
                                </div>
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
                                    <th className="text-left py-2 text-slate-500 font-medium">
                                      Day
                                    </th>
                                    <th className="text-left py-2 text-slate-500 font-medium">
                                      Time
                                    </th>
                                    <th className="text-left py-2 text-slate-500 font-medium">
                                      Course
                                    </th>
                                    <th className="text-left py-2 text-slate-500 font-medium">
                                      Venue
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getWardTimetable(selectedWard).map(
                                    (slot, i) => (
                                      <tr
                                        key={`${slot.day}-${slot.time}-${i}`}
                                        className="border-b last:border-0"
                                      >
                                        <td className="py-2 font-medium text-slate-700">
                                          {slot.day}
                                        </td>
                                        <td className="py-2 text-slate-500">
                                          {slot.time}
                                        </td>
                                        <td className="py-2 text-slate-800">
                                          {slot.course}
                                        </td>
                                        <td className="py-2 text-slate-500">
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
                              <div className="bg-slate-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-slate-500">
                                  Total Billed
                                </p>
                                <p className="font-bold text-slate-800">
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
                            {wardInvoices.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-4">
                                No invoices found.
                              </p>
                            ) : (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 text-slate-500 font-medium">
                                      Description
                                    </th>
                                    <th className="text-left py-2 text-slate-500 font-medium">
                                      Session
                                    </th>
                                    <th className="text-right py-2 text-slate-500 font-medium">
                                      Amount
                                    </th>
                                    <th className="text-right py-2 text-slate-500 font-medium">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {wardInvoices.map((inv) => (
                                    <tr
                                      key={inv.id}
                                      className="border-b last:border-0"
                                    >
                                      <td className="py-2 text-slate-800">
                                        {inv.description}
                                      </td>
                                      <td className="py-2 text-slate-500">
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
                            {wardAttendance.length === 0 ? (
                              <div className="space-y-2">
                                {[
                                  "Mathematics",
                                  "Physics",
                                  "Chemistry",
                                  "Biology",
                                  "GST",
                                ].map((sub, i) => (
                                  <div
                                    key={sub}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="text-sm text-slate-700 w-32 truncate">
                                      {sub}
                                    </span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${65 + i * 6}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-slate-500">
                                      {65 + i * 6}%
                                    </span>
                                  </div>
                                ))}
                                <p className="text-xs text-slate-400 mt-2">
                                  * Sample attendance data
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {wardAttendance.map((a) => {
                                  const pct =
                                    a.total > 0
                                      ? Math.round((a.present / a.total) * 100)
                                      : 0;
                                  return (
                                    <div
                                      key={a.courseCode}
                                      className="flex items-center gap-3"
                                    >
                                      <span className="text-sm text-slate-700 w-32 truncate">
                                        {a.courseCode}
                                      </span>
                                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            pct >= 75
                                              ? "bg-green-500"
                                              : pct >= 50
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-slate-500">
                                        {pct}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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
                            {wardDisciplinary.length === 0 ? (
                              <div className="text-center py-6 text-slate-400">
                                <CheckCircle
                                  size={32}
                                  className="mx-auto mb-2 text-green-400"
                                />
                                No disciplinary records.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {wardDisciplinary.map((d) => (
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
                                          Case No: {d.caseNo} &bull; {d.date}
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
                  )}
                </>
              )}
            </div>
          )}

          {/* WARD PROFILE PAGE */}
          {activePage === "ward" && (
            <div className="space-y-6">
              {!selectedWard ? (
                <Card>
                  <CardContent className="p-8 text-center text-slate-400">
                    <User size={40} className="mx-auto mb-3 opacity-30" />
                    No ward selected. Please link a ward first.
                  </CardContent>
                </Card>
              ) : (
                <div ref={printRef} className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                          {selectedWard.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-slate-800">
                            {selectedWard.name}
                          </h2>
                          <p className="text-slate-500 text-sm">
                            {selectedWard.matricNumber}
                          </p>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
                            <div>
                              <span className="text-slate-400">
                                Department:
                              </span>
                              <span className="ml-2 font-medium text-slate-700">
                                {selectedWard.department}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Level:</span>
                              <span className="ml-2 font-medium text-slate-700">
                                {selectedWard.level}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Email:</span>
                              <span className="ml-2 font-medium text-slate-700">
                                {selectedWard.email}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">CGPA:</span>
                              <span className="ml-2 font-bold text-blue-700">
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
                              Number.parseInt(selectedWard.level, 10) || 100;
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
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {done ? "✓" : i + 1}
                                </div>
                                <span
                                  className={`text-xs ${
                                    active
                                      ? "text-blue-700 font-semibold"
                                      : done
                                        ? "text-green-600"
                                        : "text-slate-400"
                                  }`}
                                >
                                  {lvl}
                                </span>
                                {i < 3 && (
                                  <ChevronRight
                                    size={14}
                                    className="text-slate-300"
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
                  <p className="text-sm text-slate-500">
                    Enter your ward's matric number to link their academic
                    record to your portal.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Ward's Matric Number</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleLinkWard()
                          }
                          placeholder="e.g. CSC/2021/001"
                          data-ocid="parent-link.matric_input"
                        />
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
                        const student = allStudents.find(
                          (s) => s.matricNumber === matric,
                        );
                        return (
                          <div
                            key={matric}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                                {student?.name.charAt(0) ?? "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {student?.name ?? matric}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {matric} &bull; {student?.department}
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
                  <CardContent className="p-8 text-center text-slate-400">
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
                        <h3 className="font-semibold text-slate-800">
                          {n.title}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs ml-2">
                          {n.target}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        By {n.author} &bull; {n.date}
                      </p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        {n.body}
                      </p>
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
