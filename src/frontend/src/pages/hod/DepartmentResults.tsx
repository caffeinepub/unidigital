import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Printer,
  Search,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  InlineRecord,
  printStudentRecord,
} from "../../utils/academicRecordUtils";
import { downloadCSV } from "../../utils/csvUtils";
import {
  getLocalCAScores,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";

export function DepartmentResults() {
  const { examResults, computeStudentCGPA } = useResultProcessing();
  const settings = getInstitutionSettings();
  const institutionType = settings.profile.institutionType;
  const allStudents = getLocalStudents();
  const allCourses = getLocalCourses();

  // Determine departments from students
  const departments = useMemo(() => {
    const depts = [
      ...new Set(allStudents.map((s) => s.department).filter(Boolean)),
    ];
    return depts.length ? depts : ["Computer Science"];
  }, [allStudents]);

  const [selectedDept, setSelectedDept] = useState(
    departments[0] ?? "Computer Science",
  );

  // Filter semesters/sessions from examResults
  const semesters = useMemo(
    () => [...new Set(examResults.map((r) => r.semester).filter(Boolean))],
    [examResults],
  );
  const sessions = useMemo(
    () => [...new Set(examResults.map((r) => r.session).filter(Boolean))],
    [examResults],
  );

  const [selectedSemester, setSelectedSemester] = useState(
    semesters[0] ?? "First",
  );
  const [selectedSession, setSelectedSession] = useState(
    sessions[0] ?? "2023/2024",
  );

  // Students in selected department
  const deptStudents = useMemo(
    () => allStudents.filter((s) => s.department === selectedDept),
    [allStudents, selectedDept],
  );

  // Courses in selected department
  const deptCourses = useMemo(
    () => allCourses.filter((c) => c.department === selectedDept),
    [allCourses, selectedDept],
  );

  // Filtered results for semester/session
  const filteredResults = useMemo(
    () =>
      examResults.filter(
        (r) =>
          (selectedSemester === "all" || r.semester === selectedSemester) &&
          (selectedSession === "all" || r.session === selectedSession),
      ),
    [examResults, selectedSemester, selectedSession],
  );

  // Credit map
  const creditMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allCourses) map[c.code] = c.creditUnits;
    return map;
  }, [allCourses]);

  // Course performance stats
  const courseStats = useMemo(() => {
    return deptCourses.map((course) => {
      const results = filteredResults.filter(
        (r) => r.courseCode === course.code,
      );
      const enrolled = results.length;
      const scores = results.map((r) => r.totalScore);
      const avg = enrolled
        ? Math.round(scores.reduce((a, b) => a + b, 0) / enrolled)
        : 0;
      const highest = enrolled ? Math.max(...scores) : 0;
      const lowest = enrolled ? Math.min(...scores) : 0;
      const passCount = results.filter((r) => r.totalScore >= 40).length;
      const failCount = enrolled - passCount;
      const passRate = enrolled ? Math.round((passCount / enrolled) * 100) : 0;
      return {
        course,
        enrolled,
        avg,
        highest,
        lowest,
        passCount,
        failCount,
        passRate,
      };
    });
  }, [deptCourses, filteredResults]);

  // Student results with GPA
  const studentRows = useMemo(() => {
    return deptStudents.map((student) => {
      const stuResults = filteredResults.filter(
        (r) => r.studentMatric === student.matricNumber,
      );
      const gpa = computeStudentCGPA(student.matricNumber, creditMap);
      const carryovers = stuResults.filter((r) => r.totalScore < 40).length;
      return { student, results: stuResults, gpa, carryovers };
    });
  }, [deptStudents, filteredResults, computeStudentCGPA, creditMap]);

  // GPA distribution
  const gpaDistribution = useMemo(() => {
    const bins = [
      { label: "First Class", min: 4.5, color: "#16a34a" },
      { label: "2nd Upper", min: 3.5, color: "#2563eb" },
      { label: "2nd Lower", min: 2.5, color: "#7c3aed" },
      { label: "Third", min: 1.5, color: "#d97706" },
      { label: "Pass", min: 1.0, color: "#ea580c" },
      { label: "Fail", min: 0, color: "#dc2626" },
    ];
    const counts = bins.map((bin, i) => {
      const max = bins[i - 1]?.min ?? 5.1;
      const count = studentRows.filter(
        (r) => r.gpa >= bin.min && r.gpa < max,
      ).length;
      return { ...bin, count };
    });
    const total = studentRows.length || 1;
    return counts.map((b) => ({
      ...b,
      pct: Math.round((b.count / total) * 100),
    }));
  }, [studentRows]);

  // Academic Records section state
  const [recordSearch, setRecordSearch] = useState("");
  const [expandedRecordMatric, setExpandedRecordMatric] = useState<
    string | null
  >(null);

  const filteredDeptStudents = useMemo(() => {
    const q = recordSearch.toLowerCase();
    return deptStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.matricNumber.toLowerCase().includes(q),
    );
  }, [deptStudents, recordSearch]);

  function handleDownloadCSV() {
    const rows: string[][] = [
      [
        "Matric",
        "Name",
        "Level",
        "Department",
        "GPA",
        "Carryovers",
        "Class of Degree",
      ],
      ...studentRows.map((r) => [
        r.student.matricNumber,
        r.student.name,
        r.student.level,
        r.student.department,
        r.gpa.toFixed(2),
        String(r.carryovers),
        classifyDegree(r.gpa),
      ]),
    ];
    downloadCSV(
      `dept-results-${selectedDept.replace(/ /g, "-")}-${selectedSession}.csv`,
      rows,
    );
  }

  function handleForward() {
    toast.success("Department results forwarded to Faculty Exam Officer.");
  }

  const passRateColor = (rate: number) =>
    rate >= 60
      ? "text-green-600 font-semibold"
      : rate >= 40
        ? "text-amber-600 font-semibold"
        : "text-red-600 font-semibold";

  return (
    <div className="space-y-6 p-4 md:p-6 print:p-2">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-800 to-blue-900 p-6 text-white print:bg-slate-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Department of {selectedDept} — Result Collation Sheet
            </h1>
            <p className="mt-1 text-blue-200 text-sm">
              Session: {selectedSession} | Semester: {selectedSemester}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => window.print()}
              data-ocid="dept-results.primary_button"
            >
              <Printer size={14} className="mr-1" /> Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={handleDownloadCSV}
              data-ocid="dept-results.secondary_button"
            >
              <Download size={14} className="mr-1" /> Download CSV
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleForward}
              data-ocid="dept-results.submit_button"
            >
              <Send size={14} className="mr-1" /> Forward to Faculty
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Department
              </span>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-52" data-ocid="dept-results.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Semester
              </span>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-40">
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
              <span className="text-xs font-medium text-muted-foreground">
                Session
              </span>
              <Select
                value={selectedSession}
                onValueChange={setSelectedSession}
              >
                <SelectTrigger className="w-40">
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
        </CardContent>
      </Card>

      {/* GPA Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet size={16} /> GPA Distribution — {selectedDept}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gpaDistribution.map((bin) => (
              <div key={bin.label} className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-right">
                  {bin.label}
                </span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div
                    style={{ width: `${bin.pct}%`, backgroundColor: bin.color }}
                    className="h-full rounded transition-all duration-500"
                  />
                </div>
                <span className="w-20 text-xs text-muted-foreground">
                  {bin.count} students ({bin.pct}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Course Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {courseStats.length === 0 ? (
            <p
              className="text-muted-foreground text-sm py-4 text-center"
              data-ocid="dept-results.empty_state"
            >
              No course data for selected filters.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Units</th>
                  <th className="py-2 pr-4">Enrolled</th>
                  <th className="py-2 pr-4">Avg</th>
                  <th className="py-2 pr-4">High</th>
                  <th className="py-2 pr-4">Low</th>
                  <th className="py-2 pr-4">Pass</th>
                  <th className="py-2 pr-4">Fail</th>
                  <th className="py-2">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map(
                  ({
                    course,
                    enrolled,
                    avg,
                    highest,
                    lowest,
                    passCount,
                    failCount,
                    passRate,
                  }) => (
                    <tr
                      key={course.code}
                      className="border-b hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-2 pr-4 font-mono text-xs">
                        {course.code}
                      </td>
                      <td className="py-2 pr-4">{course.title}</td>
                      <td className="py-2 pr-4">{course.creditUnits}</td>
                      <td className="py-2 pr-4">{enrolled}</td>
                      <td className="py-2 pr-4">{avg}</td>
                      <td className="py-2 pr-4">{highest}</td>
                      <td className="py-2 pr-4">{lowest}</td>
                      <td className="py-2 pr-4">{passCount}</td>
                      <td className="py-2 pr-4">{failCount}</td>
                      <td className={`py-2 ${passRateColor(passRate)}`}>
                        {passRate}%
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Student Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Results</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {studentRows.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No students in this department.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Matric</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Level</th>
                  <th className="py-2 pr-4">Courses Sat</th>
                  <th className="py-2 pr-4">GPA</th>
                  <th className="py-2 pr-4">Carryovers</th>
                  <th className="py-2">Class</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map(
                  ({ student, results, gpa, carryovers }, idx) => (
                    <tr
                      key={student.matricNumber}
                      className="border-b hover:bg-muted/40 transition-colors"
                      data-ocid={`dept-results.item.${idx + 1}`}
                    >
                      <td className="py-2 pr-4 font-mono text-xs">
                        {student.matricNumber}
                      </td>
                      <td className="py-2 pr-4 font-medium">{student.name}</td>
                      <td className="py-2 pr-4">{student.level}</td>
                      <td className="py-2 pr-4">{results.length}</td>
                      <td className="py-2 pr-4 font-semibold">
                        {gpa.toFixed(2)}
                      </td>
                      <td className="py-2 pr-4">
                        {carryovers > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {carryovers}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            None
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 text-xs">{classifyDegree(gpa)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Student Academic Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet size={16} className="text-blue-600" />
            Student Academic Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search by name or matric number…"
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
              className="pl-9"
              data-ocid="dept-results.search_input"
            />
          </div>
          {filteredDeptStudents.length === 0 ? (
            <p
              className="text-center text-muted-foreground text-sm py-6"
              data-ocid="dept-results.empty_state"
            >
              No students found.
            </p>
          ) : (
            <Table data-ocid="dept-results.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Matric No</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeptStudents.map((student, idx) => (
                  <>
                    <TableRow
                      key={student.matricNumber}
                      data-ocid={`dept-results.row.${idx + 1}`}
                      className="hover:bg-slate-50"
                    >
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {student.matricNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                          {student.level}L
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            data-ocid={`dept-results.edit_button.${idx + 1}`}
                            onClick={() =>
                              setExpandedRecordMatric(
                                expandedRecordMatric === student.matricNumber
                                  ? null
                                  : student.matricNumber,
                              )
                            }
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {expandedRecordMatric === student.matricNumber ? (
                              <>
                                <EyeOff size={14} className="mr-1" />
                                Hide Record
                              </>
                            ) : (
                              <>
                                <Eye size={14} className="mr-1" />
                                View Record
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            data-ocid={`dept-results.primary_button.${idx + 1}`}
                            onClick={() => printStudentRecord(student)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Printer size={14} className="mr-1" /> Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRecordMatric === student.matricNumber && (
                      <TableRow key={`${student.matricNumber}-rec`}>
                        <TableCell colSpan={4} className="p-0 bg-slate-50">
                          <div className="p-4">
                            <InlineRecord
                              matricNumber={student.matricNumber}
                              studentName={student.name}
                              department={student.department}
                              institutionType={
                                student.institutionCategory ?? institutionType
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
