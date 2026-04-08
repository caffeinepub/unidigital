import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Printer,
  Send,
} from "lucide-react";
import { useState } from "react";
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
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import { downloadCSV } from "../../utils/csvUtils";
import {
  type ExamResult,
  getLocalCombinedCourses,
  getLocalCombinedResults,
  getLocalCourses,
  getLocalExamResults,
  getLocalStudents,
  saveLocalExamResults,
} from "../../utils/sampleData";
import {
  type ScoreSheetStudent,
  computeGrade,
  downloadFilledScoreSheet,
  gradeColorClass,
  printScoreSheet,
} from "../../utils/scoreSheetUtils";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  hod_approved: "bg-amber-100 text-amber-700",
  faculty_approved: "bg-purple-100 text-purple-700",
  senate_approved: "bg-indigo-100 text-indigo-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const SEMESTERS = [
  "2023/2024 First",
  "2023/2024 Second",
  "2022/2023 First",
  "2022/2023 Second",
  "2024/2025 First",
  "2024/2025 Second",
];

export function ScoreSheetResults() {
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const combinations = getLocalCombinedCourses();
  const settings = getInstitutionSettings();

  const [semester, setSemester] = useState("2023/2024 First");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const departments = [
    ...new Set(courses.map((c) => c.department).filter(Boolean)),
  ];

  const examResults = getLocalExamResults();

  // Group exam results by course
  const courseSummary = courses
    .filter((c) => {
      if (deptFilter !== "all" && c.department !== deptFilter) return false;
      if (c.semester !== semester) return false;
      if (
        search &&
        !c.title.toLowerCase().includes(search.toLowerCase()) &&
        !c.code.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .map((c) => {
      const courseResults = examResults.filter(
        (r) => r.courseCode === c.code && r.semester === semester,
      );
      const dominant =
        courseResults.length === 0
          ? "pending"
          : courseResults.every((r) => r.status === "published")
            ? "published"
            : courseResults.some((r) => r.status === "submitted")
              ? "submitted"
              : courseResults.some((r) => r.status === "hod_approved")
                ? "hod_approved"
                : courseResults.some((r) => r.status === "draft")
                  ? "draft"
                  : (courseResults[0]?.status ?? "pending");
      return { course: c, results: courseResults, status: dominant };
    })
    .filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });

  const comboSummary = combinations.map((combo) => {
    const comboResults = getLocalCombinedResults().filter(
      (r) =>
        r.combinationCode === combo.combinationCode && r.semester === semester,
    );
    return { combo, results: comboResults };
  });

  // Bulk approve all submitted
  const handleApproveAll = () => {
    const updated = getLocalExamResults().map((r) =>
      r.semester === semester && r.status === "submitted"
        ? { ...r, status: "hod_approved" as const }
        : r,
    );
    saveLocalExamResults(updated);
    toast.success("All submitted results approved by HOD");
  };

  // Forward individual course to HOD
  const handleForward = (courseCode: string) => {
    const updated = getLocalExamResults().map((r) =>
      r.courseCode === courseCode &&
      r.semester === semester &&
      r.status === "draft"
        ? { ...r, status: "submitted" as const }
        : r,
    );
    saveLocalExamResults(updated);
    toast.success(`${courseCode} results forwarded to HOD`);
  };

  // Export all results to CSV
  const handleExportAll = () => {
    const allResults = getLocalExamResults().filter(
      (r) => r.semester === semester,
    );
    const rows = [
      [
        "Student Matric",
        "Course Code",
        "Exam Score",
        "Total",
        "Grade",
        "Remarks",
        "Status",
        "Semester",
      ],
      ...allResults.map((r) => [
        r.studentMatric,
        r.courseCode,
        String(r.examScore),
        String(r.totalScore),
        r.grade,
        r.remark,
        r.status,
        r.semester,
      ]),
    ];
    downloadCSV(`all-results-${semester.replace(/ /g, "-")}.csv`, rows);
    toast.success(`${allResults.length} results exported`);
  };

  // Download score sheet for a course
  const handleDownloadSheet = (courseCode: string) => {
    const course = courses.find((c) => c.code === courseCode);
    if (!course) return;
    const courseResults = examResults.filter(
      (r) => r.courseCode === courseCode && r.semester === semester,
    );
    const rows: ScoreSheetStudent[] = students.map((s, i) => {
      const result = courseResults.find(
        (r) => r.studentMatric === s.matricNumber,
      );
      const total = result?.totalScore ?? 0;
      const { grade, remarks } = computeGrade(total);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca: result ? total - (result.examScore ?? 0) : "–",
        exam: result?.examScore ?? "–",
        total: result ? total : "–",
        grade: result ? result.grade : grade,
        remarks: result ? result.remark : remarks,
      };
    });
    downloadFilledScoreSheet(
      {
        faculty: "Faculty of Education",
        department: course.department,
        courseTitle: course.title,
        courseCode: course.code,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      rows,
    );
    toast.success(`Score sheet downloaded for ${courseCode}`);
  };

  // Print a course score sheet
  const handlePrint = (courseCode: string) => {
    const course = courses.find((c) => c.code === courseCode);
    if (!course) return;
    const courseResults = examResults.filter(
      (r) => r.courseCode === courseCode && r.semester === semester,
    );
    const rows: ScoreSheetStudent[] = students.map((s, i) => {
      const result = courseResults.find(
        (r) => r.studentMatric === s.matricNumber,
      );
      const total = result?.totalScore ?? 0;
      const { grade, remarks } = computeGrade(total);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca: result ? total - (result.examScore ?? 0) : "–",
        exam: result?.examScore ?? "–",
        total: result ? total : "–",
        grade: result ? result.grade : grade,
        remarks: result ? result.remark : remarks,
      };
    });
    printScoreSheet(
      {
        faculty: "Faculty of Education",
        department: course.department,
        courseTitle: course.title,
        courseCode: course.code,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      rows,
    );
  };

  const instName =
    settings.profile.name || "Federal University of Education Kontagora";

  const submittedCount = courseSummary.filter(
    (cs) => cs.status === "submitted",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Score Sheet Results
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {instName} — Review, approve, and export result score sheets
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Courses",
            value: courseSummary.length,
            color: "text-blue-600",
          },
          {
            label: "Pending Entry",
            value: courseSummary.filter((cs) => cs.status === "pending").length,
            color: "text-slate-500",
          },
          {
            label: "Awaiting HOD",
            value: submittedCount,
            color: "text-amber-600",
          },
          {
            label: "Published",
            value: courseSummary.filter((cs) => cs.status === "published")
              .length,
            color: "text-green-600",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 size={20} className={stat.color} />
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-52">
          <Label>Semester</Label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Label>Department</Label>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "all",
                "pending",
                "draft",
                "submitted",
                "hod_approved",
                "published",
                "rejected",
              ].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label>Search</Label>
          <Input
            className="mt-1"
            placeholder="Course code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {submittedCount > 0 && (
            <Button
              onClick={handleApproveAll}
              className="bg-green-600 hover:bg-green-700"
              data-ocid="score_results.approve_all_button"
            >
              <CheckCircle size={15} className="mr-1.5" /> Approve All (
              {submittedCount})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleExportAll}
            data-ocid="score_results.export_button"
          >
            <Download size={15} className="mr-1.5" /> Export All CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="regular">
        <TabsList>
          <TabsTrigger value="regular">Regular Courses</TabsTrigger>
          <TabsTrigger value="combination">Combination Courses</TabsTrigger>
        </TabsList>

        {/* Regular Courses Tab */}
        <TabsContent value="regular" className="mt-4 space-y-3">
          {courseSummary.length === 0 && (
            <Card>
              <CardContent
                className="p-12 text-center text-slate-400"
                data-ocid="score_results.empty_state"
              >
                <Filter size={40} className="mx-auto mb-3 text-slate-300" />
                <p>No courses match the current filters.</p>
              </CardContent>
            </Card>
          )}
          {courseSummary.map(({ course, results, status }) => {
            const isExpanded = expandedCourse === course.code;
            const passCount = results.filter((r) => r.remark === "Pass").length;
            return (
              <Card
                key={course.code}
                data-ocid={`score_results.course.${course.code}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCourse(isExpanded ? null : course.code)
                        }
                        className="text-slate-400 hover:text-slate-700"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {course.code} — {course.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {course.department} &bull; {results.length} entries
                          {results.length > 0 && (
                            <span className="ml-2 text-green-600">
                              {passCount} passed
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"} border-0 text-xs capitalize`}
                      >
                        {status.replace(/_/g, " ")}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSheet(course.code)}
                        data-ocid="score_results.download_button"
                      >
                        <Download size={13} className="mr-1" /> Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(course.code)}
                        data-ocid="score_results.print_button"
                      >
                        <Printer size={13} className="mr-1" /> Print
                      </Button>
                      {status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleForward(course.code)}
                          data-ocid="score_results.forward_button"
                        >
                          <Send size={13} className="mr-1" /> Forward to HOD
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[700px] text-sm">
                        <thead className="bg-slate-800 text-white">
                          <tr>
                            {[
                              "S/N",
                              "Student",
                              "Matric",
                              "Exam",
                              "Total",
                              "Grade",
                              "Remarks",
                              "Status",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2.5 text-left text-xs font-semibold uppercase"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s, idx) => {
                            const result = results.find(
                              (r) => r.studentMatric === s.matricNumber,
                            );
                            const { grade: ag, remarks: ar } = computeGrade(
                              result?.totalScore ?? 0,
                            );
                            return (
                              <tr
                                key={s.matricNumber}
                                className="border-b last:border-0 hover:bg-slate-50"
                              >
                                <td className="px-3 py-2 text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2 font-medium">
                                  {s.name}
                                </td>
                                <td className="px-3 py-2 font-mono text-xs text-blue-600">
                                  {s.matricNumber}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {result?.examScore ?? "–"}
                                </td>
                                <td className="px-3 py-2 font-bold text-center">
                                  {result?.totalScore ?? "–"}
                                </td>
                                <td className="px-3 py-2">
                                  {result ? (
                                    <Badge
                                      className={`${gradeColorClass(result.grade)} border-0 font-bold`}
                                    >
                                      {result.grade}
                                    </Badge>
                                  ) : (
                                    <Badge
                                      className={`${gradeColorClass(ag)} border-0 font-bold opacity-40`}
                                    >
                                      {ag}
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`text-xs font-semibold ${
                                      (result?.remark ?? ar) === "Pass"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {result?.remark ?? ar}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  {result?.status && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs capitalize"
                                    >
                                      {result.status.replace(/_/g, " ")}
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Combination Courses Tab */}
        <TabsContent value="combination" className="mt-4 space-y-3">
          {comboSummary.map(({ combo, results }) => (
            <Card key={combo.id} data-ocid={`score_results.combo.${combo.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{combo.title}</p>
                    <p className="text-xs text-slate-500">
                      {combo.combinationCode} &bull; {results.length} records
                    </p>
                  </div>
                  <Badge
                    className={`${results.length > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"} border-0 text-xs`}
                  >
                    {results.length > 0 ? "Has Results" : "No Results"}
                  </Badge>
                </div>
                {results.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {[
                            "Matric",
                            "Name",
                            combo.componentA,
                            combo.componentB,
                            "Combined",
                            "Grade",
                            "Remarks",
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
                        {results.map((r) => {
                          const student = students.find(
                            (s) => s.matricNumber === r.studentMatric,
                          );
                          return (
                            <tr
                              key={r.id}
                              className="border-b last:border-0 hover:bg-slate-50"
                            >
                              <td className="px-3 py-2 font-mono text-xs text-blue-600">
                                {r.studentMatric}
                              </td>
                              <td className="px-3 py-2">
                                {student?.name ?? "–"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {r.scoreA}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {r.scoreB}
                              </td>
                              <td className="px-3 py-2 font-bold text-center">
                                {r.combinedTotal}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={`${gradeColorClass(r.grade)} border-0 font-bold`}
                                >
                                  {r.grade}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`text-xs font-semibold ${
                                    r.remark === "Pass"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {r.remark}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
