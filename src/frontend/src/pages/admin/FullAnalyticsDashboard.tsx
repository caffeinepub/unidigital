import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Filter,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import {
  getLocalInvoices,
  getLocalResults,
  getLocalStaff,
  getLocalStudents,
} from "../../utils/sampleData";

// ── Chart helpers (pure CSS/SVG, no external lib) ─────────────────────────

const DEPT_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-cyan-500",
];

const FILL_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#14b8a6",
  "#6366f1",
  "#f97316",
  "#06b6d4",
];

function MiniBar({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-40 truncate flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full flex items-center justify-end pr-2 transition-all`}
          style={{ width: `${pct}%`, minWidth: pct > 0 ? "2rem" : "0" }}
        >
          <span className="text-[10px] text-white font-bold">{value}</span>
        </div>
      </div>
    </div>
  );
}

function DonutChart({
  percentage,
  label,
  color,
}: {
  percentage: number;
  label: string;
  color: string;
}) {
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full -rotate-90"
        role="img"
        aria-label={label}
      >
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${percentage} ${100 - percentage}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{percentage}%</span>
        <span className="text-[9px] text-slate-500 text-center leading-tight px-1">
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

interface DrillDownDept {
  name: string;
  studentCount: number;
  passRate: number;
  avgGPA: number;
  students: { matric: string; name: string; gpa: number; status: string }[];
}

// ── Main Component ──────────────────────────────────────────────────────────

export function FullAnalyticsDashboard() {
  const students = getLocalStudents();
  const staff = getLocalStaff();
  const invoices = getLocalInvoices();
  const allResults = getLocalResults();
  const { examResults } = useResultProcessing();

  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterProgramme, setFilterProgramme] = useState("all");
  const [drilldownDept, setDrilldownDept] = useState<DrillDownDept | null>(
    null,
  );

  // ── Computed values ────────────────────────────────────────────────────

  const filteredStudents = students.filter((s) => {
    if (filterDept !== "all" && s.department !== filterDept) return false;
    if (filterLevel !== "all" && s.level !== filterLevel) return false;
    if (filterProgramme !== "all") {
      const mode = s.studyMode ?? "full-time";
      if (filterProgramme === "full-time" && mode !== "full-time") return false;
      if (
        filterProgramme === "distance-learning" &&
        mode !== "distance-learning"
      )
        return false;
      if (filterProgramme === "part-time" && mode !== "part-time") return false;
    }
    return true;
  });

  const totalStudents = filteredStudents.length;
  const totalStaff = staff.length;
  const totalFees = invoices.reduce((s, i) => s + i.amount, 0);
  const collected = invoices.reduce((s, i) => s + i.paid, 0);
  const collectionRate =
    totalFees > 0 ? Math.round((collected / totalFees) * 100) : 0;

  const publishedResults = examResults.filter((r) => r.status === "published");
  const overallPassRate =
    publishedResults.length > 0
      ? Math.round(
          (publishedResults.filter((r) => r.grade !== "F").length /
            publishedResults.length) *
            100,
        )
      : 72;

  const hostelApps = JSON.parse(
    localStorage.getItem("unidigital_hostel_apps") || "[]",
  );
  const approvedHostel = hostelApps.filter(
    (h: { status: string }) => h.status === "approved",
  ).length;
  const hostelOccupancy =
    hostelApps.length > 0
      ? Math.round((approvedHostel / hostelApps.length) * 100)
      : 68;

  // GPA calculation from allResults
  const studentGPAs: Record<string, number> = {};
  for (const s of filteredStudents) {
    const sr = allResults.filter((r) => r.studentMatric === s.matricNumber);
    if (sr.length === 0) {
      studentGPAs[s.matricNumber] = 3.0 + Math.random() * 1.5;
    } else {
      const totalPoints = sr.reduce((sum, r) => sum + r.gradePoint, 0);
      studentGPAs[s.matricNumber] =
        Math.round((totalPoints / sr.length) * 100) / 100;
    }
  }
  const avgGPA =
    filteredStudents.length > 0
      ? Math.round(
          (Object.values(studentGPAs).reduce((s, g) => s + g, 0) /
            filteredStudents.length) *
            100,
        ) / 100
      : 3.24;

  // Depts
  const allDepts = [...new Set(students.map((s) => s.department))].filter(
    Boolean,
  );
  const deptStats = allDepts.map((dept, idx) => {
    const deptStudents = filteredStudents.filter((s) => s.department === dept);
    const deptMatrics = deptStudents.map((s) => s.matricNumber);
    const deptResults = publishedResults.filter((r) =>
      deptMatrics.includes(r.studentMatric),
    );
    const passCount = deptResults.filter((r) => r.grade !== "F").length;
    const rate =
      deptResults.length > 0
        ? Math.round((passCount / deptResults.length) * 100)
        : 65 + ((idx * 7) % 30);
    const avgDeptGPA =
      deptStudents.length > 0
        ? Math.round(
            (deptStudents.reduce(
              (s, st) => s + (studentGPAs[st.matricNumber] ?? 3.0),
              0,
            ) /
              deptStudents.length) *
              100,
          ) / 100
        : 3.0 + ((idx * 0.2) % 1);
    return {
      name: dept,
      studentCount: deptStudents.length,
      passRate: rate,
      avgGPA: avgDeptGPA,
      colorBg: DEPT_COLORS[idx % DEPT_COLORS.length],
      colorFill: FILL_COLORS[idx % FILL_COLORS.length],
      students: deptStudents.slice(0, 10).map((s) => ({
        matric: s.matricNumber,
        name: s.name,
        gpa: studentGPAs[s.matricNumber] ?? 3.0,
        status: s.level,
      })),
    };
  });

  const maxStudentCount = Math.max(...deptStats.map((d) => d.studentCount), 1);

  // Enrollment trend (simulated)
  const sessions = [
    "2019/2020",
    "2020/2021",
    "2021/2022",
    "2022/2023",
    "2023/2024",
  ];
  const enrollmentTrend = [280, 310, 345, 390, totalStudents];
  const maxEnroll = Math.max(...enrollmentTrend);

  // Level distribution
  const levels = [...new Set(students.map((s) => s.level))].sort();
  const levelCounts = levels.map((l) => ({
    level: l,
    count: filteredStudents.filter((s) => s.level === l).length,
  }));

  // Class of degree distribution (simulated from GPAs)
  const gpas = Object.values(studentGPAs);
  const classDist = [
    {
      label: "First Class (≥4.5)",
      count: gpas.filter((g) => g >= 4.5).length,
      color: "bg-blue-500",
    },
    {
      label: "Second Class Upper (≥3.5)",
      count: gpas.filter((g) => g >= 3.5 && g < 4.5).length,
      color: "bg-emerald-500",
    },
    {
      label: "Second Class Lower (≥2.4)",
      count: gpas.filter((g) => g >= 2.4 && g < 3.5).length,
      color: "bg-amber-500",
    },
    {
      label: "Third Class (≥1.5)",
      count: gpas.filter((g) => g >= 1.5 && g < 2.4).length,
      color: "bg-orange-500",
    },
    {
      label: "Fail / At Risk (<1.5)",
      count: gpas.filter((g) => g < 1.5).length,
      color: "bg-rose-500",
    },
  ];

  // Fee by source (simulated)
  const feeSources = [
    { label: "Tuition Fee", amount: Math.round(collected * 0.62) },
    { label: "Development Levy", amount: Math.round(collected * 0.18) },
    { label: "Hostel Fee", amount: Math.round(collected * 0.12) },
    { label: "Library & Lab", amount: Math.round(collected * 0.05) },
    { label: "Exam Fee", amount: Math.round(collected * 0.03) },
  ];
  const maxFeeSource = Math.max(...feeSources.map((f) => f.amount), 1);

  // Course popularity (top 10 from registrations)
  const registrations = JSON.parse(
    localStorage.getItem("unidigital_registrations") || "[]",
  );
  const courseCounts: Record<string, number> = {};
  for (const r of registrations) {
    courseCounts[r.courseCode] = (courseCounts[r.courseCode] ?? 0) + 1;
  }
  const topCourses = Object.entries(courseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  // Staff performance (simulated)
  const staffPerf = staff.slice(0, 5).map((s, i) => ({
    name: s.name,
    dept: s.department,
    courseLoad: 3 + (i % 3),
    gradingTimeliness: 80 + ((i * 7) % 20),
    attendanceManagement: 85 + ((i * 5) % 15),
  }));

  const handleExport = (format: string) => {
    const header = "Department,Students,PassRate,AvgGPA\n";
    const rows = deptStats
      .map((d) => `${d.name},${d.studentCount},${d.passRate}%,${d.avgGPA}`)
      .join("\n");
    const content = header + rows;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_export_${format}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Institution-wide KPIs, trends, drill-downs, and performance metrics
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            data-ocid="analytics.export.csv"
          >
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            data-ocid="analytics.export.excel"
          >
            <Download size={14} className="mr-1.5" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Filters
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger
                className="h-8 text-xs w-48"
                data-ocid="analytics.filter.dept"
              >
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {allDepts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger
                className="h-8 text-xs w-36"
                data-ocid="analytics.filter.level"
              >
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}L
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProgramme} onValueChange={setFilterProgramme}>
              <SelectTrigger
                className="h-8 text-xs w-44"
                data-ocid="analytics.filter.programme"
              >
                <SelectValue placeholder="All Programmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programmes</SelectItem>
                <SelectItem value="full-time">Full-Time</SelectItem>
                <SelectItem value="distance-learning">
                  Distance Learning
                </SelectItem>
                <SelectItem value="part-time">Part-Time</SelectItem>
              </SelectContent>
            </Select>
            {(filterDept !== "all" ||
              filterLevel !== "all" ||
              filterProgramme !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-500"
                onClick={() => {
                  setFilterDept("all");
                  setFilterLevel("all");
                  setFilterProgramme("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Students",
            value: totalStudents,
            icon: <GraduationCap size={18} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Total Staff",
            value: totalStaff,
            icon: <Users size={18} />,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Overall Pass Rate",
            value: `${overallPassRate}%`,
            icon: <Award size={18} />,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Fee Collection",
            value: `${collectionRate}%`,
            icon: <Wallet size={18} />,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Avg GPA",
            value: avgGPA.toFixed(2),
            icon: <TrendingUp size={18} />,
            color: "text-cyan-600 bg-cyan-50",
          },
          {
            label: "Hostel Occupancy",
            value: `${hostelOccupancy}%`,
            icon: <Building2 size={18} />,
            color: "text-rose-600 bg-rose-50",
          },
        ].map((kpi, i) => (
          <Card key={kpi.label} data-ocid={`analytics.kpi.${i + 1}`}>
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}
              >
                {kpi.icon}
              </div>
              <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drill-down panel */}
      {drilldownDept && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                <ChevronDown size={16} /> Drill-down: {drilldownDept.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 text-xs"
                onClick={() => setDrilldownDept(null)}
              >
                Close ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Students", value: drilldownDept.studentCount },
                { label: "Pass Rate", value: `${drilldownDept.passRate}%` },
                { label: "Avg GPA", value: drilldownDept.avgGPA.toFixed(2) },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold text-blue-700">{s.value}</p>
                  <p className="text-xs text-blue-600">{s.label}</p>
                </div>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-2 px-3 text-xs text-blue-700 font-semibold">
                    Matric No.
                  </th>
                  <th className="text-left py-2 px-3 text-xs text-blue-700 font-semibold">
                    Name
                  </th>
                  <th className="text-left py-2 px-3 text-xs text-blue-700 font-semibold">
                    Level
                  </th>
                  <th className="text-right py-2 px-3 text-xs text-blue-700 font-semibold">
                    GPA
                  </th>
                </tr>
              </thead>
              <tbody>
                {drilldownDept.students.map((s) => (
                  <tr
                    key={s.matric}
                    className="border-b border-blue-100 last:border-0"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-blue-600">
                      {s.matric}
                    </td>
                    <td className="py-2 px-3 font-medium">{s.name}</td>
                    <td className="py-2 px-3 text-slate-600">{s.status}L</td>
                    <td className="py-2 px-3 text-right">
                      <Badge
                        className={
                          s.gpa >= 3.5
                            ? "bg-green-100 text-green-700 text-xs"
                            : s.gpa >= 2.4
                              ? "bg-amber-100 text-amber-700 text-xs"
                              : "bg-red-100 text-red-700 text-xs"
                        }
                      >
                        {s.gpa.toFixed(2)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">
            <BarChart3 size={13} className="mr-1" /> Overview
          </TabsTrigger>
          <TabsTrigger value="enrollment">
            <TrendingUp size={13} className="mr-1" /> Enrollment
          </TabsTrigger>
          <TabsTrigger value="results">
            <Award size={13} className="mr-1" /> Results
          </TabsTrigger>
          <TabsTrigger value="finance">
            <Wallet size={13} className="mr-1" /> Finance
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users size={13} className="mr-1" /> Staff
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen size={13} className="mr-1" /> Courses
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Enrollment by dept */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users size={14} className="text-blue-500" /> Students by
                  Department
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deptStats.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    className="w-full text-left"
                    data-ocid={`analytics.dept.${d.name.replace(/\s+/g, "_")}`}
                    onClick={() => setDrilldownDept(d)}
                    title="Click to drill down"
                  >
                    <MiniBar
                      value={d.studentCount}
                      max={maxStudentCount}
                      color={d.colorBg}
                      label={d.name}
                    />
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick KPI donut trio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-around">
                  <DonutChart
                    percentage={overallPassRate}
                    label="Pass Rate"
                    color="#10b981"
                  />
                  <DonutChart
                    percentage={collectionRate}
                    label="Fee Collected"
                    color="#8b5cf6"
                  />
                  <DonutChart
                    percentage={hostelOccupancy}
                    label="Hostel Occ."
                    color="#f59e0b"
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    {
                      label: "Staff:Student",
                      value: `1:${totalStaff > 0 ? (totalStudents / totalStaff).toFixed(0) : "N/A"}`,
                    },
                    { label: "Avg GPA", value: avgGPA.toFixed(2) },
                    { label: "Departments", value: allDepts.length },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-lg p-2">
                      <p className="text-sm font-bold text-slate-800">
                        {s.value}
                      </p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pass rate by dept */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award size={14} className="text-emerald-500" /> Pass Rate by
                Department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deptStats
                .sort((a, b) => b.passRate - a.passRate)
                .map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-40 truncate flex-shrink-0">
                      {d.name}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full flex items-center justify-end pr-2 ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
                        style={{ width: `${d.passRate}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">
                          {d.passRate}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">
                      {d.avgGPA.toFixed(1)}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Enrollment ── */}
        <TabsContent value="enrollment" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Trend chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-500" /> Enrollment
                  Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 flex-shrink-0">
                      {s}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{
                          width: `${Math.round((enrollmentTrend[i] / maxEnroll) * 100)}%`,
                        }}
                      >
                        <span className="text-[10px] text-white font-bold">
                          {enrollmentTrend[i]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Level distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Students by Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {levelCounts.map((lc, i) => (
                  <div key={lc.level} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20 flex-shrink-0">
                      {lc.level}L
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
                        style={{
                          width: `${totalStudents > 0 ? Math.round((lc.count / totalStudents) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-8 text-right">
                      {lc.count}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Programme breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Programme Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Full-Time",
                    mode: "full-time",
                    color: "text-blue-600 bg-blue-50",
                    icon: <Clock size={18} />,
                  },
                  {
                    label: "Distance Learning",
                    mode: "distance-learning",
                    color: "text-indigo-600 bg-indigo-50",
                    icon: <BookOpen size={18} />,
                  },
                  {
                    label: "Part-Time",
                    mode: "part-time",
                    color: "text-teal-600 bg-teal-50",
                    icon: <Users size={18} />,
                  },
                ].map((p) => {
                  const count = students.filter(
                    (s) => (s.studyMode ?? "full-time") === p.mode,
                  ).length;
                  const pct =
                    totalStudents > 0
                      ? Math.round((count / students.length) * 100)
                      : 0;
                  return (
                    <div
                      key={p.label}
                      className={`rounded-xl p-4 text-center ${p.color}`}
                    >
                      <div className="flex justify-center mb-2">{p.icon}</div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs opacity-70">{pct}% of total</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Student cohort analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Cohort Analysis — Class of Degree Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {classDist.map((c) => {
                  const pct =
                    gpas.length > 0
                      ? Math.round((c.count / gpas.length) * 100)
                      : 0;
                  return (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-52 flex-shrink-0">
                        {c.label}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full ${c.color} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-16 text-right">
                        {c.count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Results ── */}
        <TabsContent value="results" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award size={14} /> Pass/Fail Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <DonutChart
                    percentage={overallPassRate}
                    label="Pass Rate"
                    color="#10b981"
                  />
                  <div className="space-y-3 flex-1">
                    {[
                      {
                        label: "Passed",
                        value: publishedResults.filter((r) => r.grade !== "F")
                          .length,
                        color: "bg-emerald-500",
                      },
                      {
                        label: "Failed",
                        value: publishedResults.filter((r) => r.grade === "F")
                          .length,
                        color: "bg-rose-500",
                      },
                      {
                        label: "Total Published",
                        value: publishedResults.length,
                        color: "bg-blue-500",
                      },
                    ].map((r) => (
                      <div
                        key={r.label}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${r.color}`}
                          />
                          <span className="text-sm text-slate-600">
                            {r.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {(["A", "B", "C", "D", "E", "F"] as const).map((grade) => {
                  const count = publishedResults.filter(
                    (r) => r.grade === grade,
                  ).length;
                  const pct =
                    publishedResults.length > 0
                      ? Math.round((count / publishedResults.length) * 100)
                      : 0;
                  const colorMap: Record<string, string> = {
                    A: "bg-blue-500",
                    B: "bg-emerald-500",
                    C: "bg-amber-500",
                    D: "bg-orange-500",
                    E: "bg-rose-400",
                    F: "bg-red-600",
                  };
                  return (
                    <div key={grade} className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-slate-600 w-6">
                        {grade}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full ${colorMap[grade]} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-20 text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Dept pass rates drill-down */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ChevronRight size={14} /> Department Performance — Click to
                Drill Down
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {deptStats.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    data-ocid={`analytics.drilldown.${d.name.replace(/\s+/g, "_")}`}
                    onClick={() => setDrilldownDept(d)}
                    className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <p className="text-xs font-semibold text-slate-700 mb-1 truncate group-hover:text-blue-700">
                      {d.name}
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {d.passRate}%
                    </p>
                    <p className="text-xs text-slate-500">Pass rate</p>
                    <p className="text-xs text-slate-400">
                      {d.studentCount} students · GPA {d.avgGPA.toFixed(1)}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Finance ── */}
        <TabsContent value="finance" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet size={14} className="text-purple-500" /> Fee
                  Collection Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <DonutChart
                    percentage={collectionRate}
                    label="Collected"
                    color="#8b5cf6"
                  />
                  <div className="space-y-3 flex-1">
                    {[
                      {
                        label: "Total Expected",
                        value: totalFees,
                        color: "bg-slate-400",
                      },
                      {
                        label: "Collected",
                        value: collected,
                        color: "bg-purple-500",
                      },
                      {
                        label: "Outstanding",
                        value: totalFees - collected,
                        color: "bg-rose-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                          />
                          <span className="text-slate-600">{item.label}</span>
                        </div>
                        <span className="font-semibold">
                          ₦{item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-500" /> Fee
                  Collection by Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feeSources.map((fs, i) => (
                  <div key={fs.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-32 flex-shrink-0 truncate">
                      {fs.label}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${DEPT_COLORS[i % DEPT_COLORS.length]} rounded-full`}
                        style={{
                          width: `${Math.round((fs.amount / maxFeeSource) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-24 text-right">
                      ₦{fs.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Staff ── */}
        <TabsContent value="staff" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Staff by Designation</CardTitle>
              </CardHeader>
              <CardContent>
                {[...new Set(staff.map((s) => s.designation))].map((des, i) => {
                  const count = staff.filter(
                    (s) => s.designation === des,
                  ).length;
                  return (
                    <div key={des} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-slate-600 w-24 capitalize">
                        {des}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full ${DEPT_COLORS[i % DEPT_COLORS.length]} rounded-full`}
                          style={{
                            width: `${Math.round((count / totalStaff) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-6">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Staff Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-semibold text-slate-500">
                        Staff
                      </th>
                      <th className="text-center py-2 text-xs font-semibold text-slate-500">
                        Course Load
                      </th>
                      <th className="text-center py-2 text-xs font-semibold text-slate-500">
                        Grading
                      </th>
                      <th className="text-center py-2 text-xs font-semibold text-slate-500">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerf.map((s) => (
                      <tr key={s.name} className="border-b last:border-0">
                        <td className="py-2">
                          <p className="font-medium text-xs truncate max-w-[120px]">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-400">{s.dept}</p>
                        </td>
                        <td className="py-2 text-center">
                          <Badge variant="outline" className="text-xs">
                            {s.courseLoad} courses
                          </Badge>
                        </td>
                        <td className="py-2 text-center text-xs font-semibold text-emerald-600">
                          {s.gradingTimeliness}%
                        </td>
                        <td className="py-2 text-center text-xs font-semibold text-blue-600">
                          {s.attendanceManagement}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Courses ── */}
        <TabsContent value="courses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-500" /> Top 10 Most
                Registered Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCourses.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No registration data available yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {topCourses.map(({ code, count }, i) => (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">
                        {i + 1}
                      </span>
                      <span className="text-xs font-mono text-blue-600 w-24 flex-shrink-0">
                        {code}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full ${DEPT_COLORS[i % DEPT_COLORS.length]} rounded-full flex items-center justify-end pr-2`}
                          style={{
                            width: `${Math.round((count / topCourses[0].count) * 100)}%`,
                          }}
                        >
                          <span className="text-[10px] text-white font-bold">
                            {count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
