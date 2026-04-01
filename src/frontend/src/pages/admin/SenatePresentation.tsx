import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BookOpen,
  Download,
  Printer,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { downloadCSV } from "../../utils/csvUtils";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

type SortKey =
  | "dept"
  | "students"
  | "passRate"
  | "avgGpa"
  | "firstClass"
  | "carryovers";
type SortDir = "asc" | "desc";

export function SenatePresentation() {
  const { examResults, computeStudentCGPA } = useResultProcessing();
  const allStudents = getLocalStudents();
  const allCourses = getLocalCourses();

  const semesters = useMemo(
    () => [...new Set(examResults.map((r) => r.semester).filter(Boolean))],
    [examResults],
  );
  const sessions = useMemo(
    () => [...new Set(examResults.map((r) => r.session).filter(Boolean))],
    [examResults],
  );

  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSession, setSelectedSession] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("dept");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [resolution, setResolution] = useState("");
  const [presidingOfficer, setPresidingOfficer] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");
  const [resolutionSaved, setResolutionSaved] = useState(false);

  const creditMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allCourses) map[c.code] = c.creditUnits;
    return map;
  }, [allCourses]);

  const filteredResults = useMemo(
    () =>
      examResults.filter(
        (r) =>
          (selectedSemester === "all" || r.semester === selectedSemester) &&
          (selectedSession === "all" || r.session === selectedSession),
      ),
    [examResults, selectedSemester, selectedSession],
  );

  // Overall stats
  const overallStats = useMemo(() => {
    const total = allStudents.length;
    const passCount = filteredResults.filter((r) => r.totalScore >= 40).length;
    const passRate = filteredResults.length
      ? Math.round((passCount / filteredResults.length) * 100)
      : 0;
    const gpas = allStudents.map((s) =>
      computeStudentCGPA(s.matricNumber, creditMap),
    );
    const firstClass = gpas.filter((g) => g >= 4.5).length;
    const withCarryovers = allStudents.filter((s) =>
      filteredResults.some(
        (r) => r.studentMatric === s.matricNumber && r.totalScore < 40,
      ),
    ).length;
    return { total, passRate, firstClass, withCarryovers };
  }, [allStudents, filteredResults, computeStudentCGPA, creditMap]);

  // Class of degree distribution
  const classDist = useMemo(() => {
    const bins = [
      { label: "First Class", min: 4.5, max: 5.1, color: "#16a34a" },
      {
        label: "Second Class Upper (2:1)",
        min: 3.5,
        max: 4.5,
        color: "#2563eb",
      },
      {
        label: "Second Class Lower (2:2)",
        min: 2.5,
        max: 3.5,
        color: "#7c3aed",
      },
      { label: "Third Class", min: 1.5, max: 2.5, color: "#d97706" },
      { label: "Pass", min: 1.0, max: 1.5, color: "#ea580c" },
      { label: "Fail", min: 0, max: 1.0, color: "#dc2626" },
    ];
    const gpas = allStudents.map((s) =>
      computeStudentCGPA(s.matricNumber, creditMap),
    );
    const total = gpas.length || 1;
    return bins.map((b) => {
      const count = gpas.filter((g) => g >= b.min && g < b.max).length;
      return { ...b, count, pct: Math.round((count / total) * 100) };
    });
  }, [allStudents, computeStudentCGPA, creditMap]);

  // Department performance
  const deptPerf = useMemo(() => {
    const depts = [
      ...new Set(allStudents.map((s) => s.department).filter(Boolean)),
    ];
    return depts.map((dept) => {
      const students = allStudents.filter((s) => s.department === dept);
      const matricSet = new Set(students.map((s) => s.matricNumber));
      const deptResults = filteredResults.filter((r) =>
        matricSet.has(r.studentMatric),
      );
      const gpas = students.map((s) =>
        computeStudentCGPA(s.matricNumber, creditMap),
      );
      const avgGpa = gpas.length
        ? gpas.reduce((a, b) => a + b, 0) / gpas.length
        : 0;
      const passCount = deptResults.filter((r) => r.totalScore >= 40).length;
      const passRate = deptResults.length
        ? Math.round((passCount / deptResults.length) * 100)
        : 0;
      const firstClass = gpas.filter((g) => g >= 4.5).length;
      const carryovers = students.filter((s) =>
        deptResults.some(
          (r) => r.studentMatric === s.matricNumber && r.totalScore < 40,
        ),
      ).length;
      return {
        dept,
        students: students.length,
        passRate,
        avgGpa,
        firstClass,
        carryovers,
      };
    });
  }, [allStudents, filteredResults, computeStudentCGPA, creditMap]);

  const sortedDeptPerf = useMemo(() => {
    return [...deptPerf].sort((a, b) => {
      let va: number | string = a[sortKey];
      let vb: number | string = b[sortKey];
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
  }, [deptPerf, sortKey, sortDir]);

  // Top 10 students
  const top10 = useMemo(() => {
    return allStudents
      .map((s) => ({
        ...s,
        cgpa: computeStudentCGPA(s.matricNumber, creditMap),
      }))
      .sort((a, b) => b.cgpa - a.cgpa)
      .slice(0, 10);
  }, [allStudents, computeStudentCGPA, creditMap]);

  // High failure rate courses
  const highFailCourses = useMemo(() => {
    return allCourses
      .map((course) => {
        const results = filteredResults.filter(
          (r) => r.courseCode === course.code,
        );
        const enrolled = results.length;
        const passCount = results.filter((r) => r.totalScore >= 40).length;
        const passRate = enrolled
          ? Math.round((passCount / enrolled) * 100)
          : 100;
        const avgScore = enrolled
          ? Math.round(results.reduce((a, r) => a + r.totalScore, 0) / enrolled)
          : 0;
        return { course, enrolled, passRate, avgScore };
      })
      .filter((c) => c.enrolled > 0 && c.passRate < 50)
      .sort((a, b) => a.passRate - b.passRate);
  }, [allCourses, filteredResults]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleSaveResolution() {
    if (!resolution.trim() || !presidingOfficer.trim()) {
      toast.error("Please fill in resolution text and presiding officer name.");
      return;
    }
    const saved = JSON.parse(
      localStorage.getItem("senate_resolutions") ?? "[]",
    );
    saved.push({
      resolution,
      presidingOfficer,
      date: resolutionDate,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("senate_resolutions", JSON.stringify(saved));
    setResolutionSaved(true);
    toast.success("Senate resolution recorded successfully.");
  }

  function handleDownloadCSV() {
    const rows: string[][] = [
      [
        "Department",
        "Students",
        "Pass Rate",
        "Avg GPA",
        "First Class",
        "Carryovers",
      ],
      ...sortedDeptPerf.map((d) => [
        d.dept,
        String(d.students),
        `${d.passRate}%`,
        d.avgGpa.toFixed(2),
        String(d.firstClass),
        String(d.carryovers),
      ]),
    ];
    downloadCSV(`senate-presentation-${selectedSession}.csv`, rows);
  }

  const rankMedal = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return String(i + 1);
  };

  const thCls = (key: SortKey) =>
    `py-2 pr-4 text-left cursor-pointer select-none hover:text-foreground transition-colors ${sortKey === key ? "text-foreground font-semibold" : "text-muted-foreground"}`;

  return (
    <div className="space-y-6 p-4 md:p-6 print:p-2">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white print:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Academic Board / Senate Result Presentation
              </h1>
              <p className="text-blue-300 text-sm mt-0.5">
                Formal Result Report for Senate Review
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => window.print()}
              data-ocid="senate.primary_button"
            >
              <Printer size={14} className="mr-1" /> Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={handleDownloadCSV}
              data-ocid="senate.secondary_button"
            >
              <Download size={14} className="mr-1" /> Download Report
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 print:hidden">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-blue-300">Semester</span>
            <Select
              value={selectedSemester}
              onValueChange={setSelectedSemester}
            >
              <SelectTrigger
                className="w-40 border-white/20 bg-white/10 text-white"
                data-ocid="senate.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-blue-300">Session</span>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-40 border-white/20 bg-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {sessions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Students Examined",
            value: overallStats.total,
            color: "text-blue-600",
          },
          {
            label: "Overall Pass Rate",
            value: `${overallStats.passRate}%`,
            color:
              overallStats.passRate >= 60 ? "text-green-600" : "text-red-600",
          },
          {
            label: "First Class Honours",
            value: overallStats.firstClass,
            color: "text-yellow-600",
          },
          {
            label: "Students with Carryovers",
            value: overallStats.withCarryovers,
            color: "text-orange-600",
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground leading-tight">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class of Degree Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Class of Degree Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classDist.map((bin) => (
              <div key={bin.label} className="flex items-center gap-3">
                <span className="w-44 text-xs font-medium text-right">
                  {bin.label}
                </span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <div
                    style={{ width: `${bin.pct}%`, backgroundColor: bin.color }}
                    className="h-full rounded transition-all duration-700 flex items-center justify-end pr-2"
                  >
                    {bin.pct >= 10 && (
                      <span className="text-white text-xs font-medium">
                        {bin.pct}%
                      </span>
                    )}
                  </div>
                </div>
                <span className="w-28 text-xs text-muted-foreground">
                  {bin.count} students ({bin.pct}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Performance</CardTitle>
          <p className="text-xs text-muted-foreground">
            Click column headers to sort
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {sortedDeptPerf.length === 0 ? (
            <p
              className="text-muted-foreground text-sm py-4 text-center"
              data-ocid="senate.empty_state"
            >
              No department data available.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th
                    className={thCls("dept")}
                    onClick={() => toggleSort("dept")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleSort("dept");
                    }}
                  >
                    Department{" "}
                    {sortKey === "dept" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    className={thCls("students")}
                    onClick={() => toggleSort("students")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleSort("students");
                    }}
                  >
                    Students{" "}
                    {sortKey === "students"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className={thCls("passRate")}
                    onClick={() => toggleSort("passRate")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleSort("passRate");
                    }}
                  >
                    Pass Rate{" "}
                    {sortKey === "passRate"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className={thCls("avgGpa")}
                    onClick={() => toggleSort("avgGpa")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleSort("avgGpa");
                    }}
                  >
                    Avg GPA{" "}
                    {sortKey === "avgGpa"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className={thCls("firstClass")}
                    onClick={() => toggleSort("firstClass")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleSort("firstClass");
                    }}
                  >
                    1st Class{" "}
                    {sortKey === "firstClass"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                  <th
                    className={thCls("carryovers")}
                    onClick={() => toggleSort("carryovers")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleSort("carryovers");
                    }}
                  >
                    Carryovers{" "}
                    {sortKey === "carryovers"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDeptPerf.map((d, idx) => (
                  <tr
                    key={d.dept}
                    className="border-b hover:bg-muted/40 transition-colors"
                    data-ocid={`senate.item.${idx + 1}`}
                  >
                    <td className="py-2 pr-4 font-medium">{d.dept}</td>
                    <td className="py-2 pr-4">{d.students}</td>
                    <td
                      className={`py-2 pr-4 font-semibold ${d.passRate >= 60 ? "text-green-600" : d.passRate >= 40 ? "text-amber-600" : "text-red-600"}`}
                    >
                      {d.passRate}%
                    </td>
                    <td className="py-2 pr-4">{d.avgGpa.toFixed(2)}</td>
                    <td className="py-2 pr-4">{d.firstClass}</td>
                    <td className="py-2">{d.carryovers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Top 10 Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy size={16} className="text-yellow-500" /> Top 10 Students
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Rank</th>
                <th className="py-2 pr-4">Matric</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">CGPA</th>
                <th className="py-2">Class of Degree</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((s, i) => (
                <tr
                  key={s.matricNumber}
                  className={`border-b hover:bg-muted/40 transition-colors ${
                    i === 0
                      ? "bg-yellow-50 dark:bg-yellow-950/20"
                      : i === 1
                        ? "bg-slate-50 dark:bg-slate-900/30"
                        : i === 2
                          ? "bg-orange-50 dark:bg-orange-950/20"
                          : ""
                  }`}
                  data-ocid={`senate.row.${i + 1}`}
                >
                  <td className="py-2 pr-4 text-lg">{rankMedal(i)}</td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {s.matricNumber}
                  </td>
                  <td className="py-2 pr-4 font-semibold">{s.name}</td>
                  <td className="py-2 pr-4 text-xs">{s.department}</td>
                  <td className="py-2 pr-4 font-bold text-blue-700">
                    {s.cgpa.toFixed(2)}
                  </td>
                  <td className="py-2">
                    <Badge variant="secondary" className="text-xs">
                      {classifyDegree(s.cgpa)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* High Failure Rate Courses */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-700">
            <AlertTriangle size={16} /> High Failure Rate Courses (Pass Rate
            &lt; 50%)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {highFailCourses.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No courses with high failure rates.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Enrolled</th>
                  <th className="py-2 pr-4">Pass Rate</th>
                  <th className="py-2">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {highFailCourses.map(
                  ({ course, enrolled, passRate, avgScore }, idx) => (
                    <tr
                      key={course.code}
                      className="border-b hover:bg-red-50/50 transition-colors"
                      data-ocid={`senate.row.${idx + 1}`}
                    >
                      <td className="py-2 pr-4 font-mono text-xs">
                        {course.code}
                      </td>
                      <td className="py-2 pr-4">{course.title}</td>
                      <td className="py-2 pr-4">{enrolled}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="destructive" className="text-xs">
                          {passRate}%
                        </Badge>
                      </td>
                      <td className="py-2 font-semibold text-red-700">
                        {avgScore}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Senate Resolution Panel */}
      <Card className={resolutionSaved ? "border-green-500" : ""}>
        <CardHeader>
          <CardTitle className="text-base">Senate Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="presiding-officer">Presiding Officer</Label>
              <Input
                id="presiding-officer"
                placeholder="Vice Chancellor / Board Chair"
                value={presidingOfficer}
                onChange={(e) => setPresidingOfficer(e.target.value)}
                disabled={resolutionSaved}
                data-ocid="senate.input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="resolution-date">Date</Label>
              <Input
                id="resolution-date"
                type="date"
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                disabled={resolutionSaved}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="resolution-text">Resolution Text</Label>
              <Textarea
                id="resolution-text"
                placeholder="Enter the senate resolution text..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={resolutionSaved}
                rows={4}
                data-ocid="senate.textarea"
              />
            </div>
          </div>
          {resolutionSaved ? (
            <p className="mt-4 text-green-700 font-medium text-sm flex items-center gap-1">
              ✓ Resolution recorded and saved
            </p>
          ) : (
            <Button
              className="mt-4 bg-slate-800 hover:bg-slate-900"
              onClick={handleSaveResolution}
              data-ocid="senate.submit_button"
            >
              Record Resolution
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
