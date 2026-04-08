import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { downloadCSV, parseCSV } from "../../utils/csvUtils";
import {
  ALL_FUEK_COURSES,
  type FuekCourse,
  REGISTRATION_RULES,
  getCompulsoryCourses,
  getElectiveCourses,
  getTotalCreditUnits,
} from "../../utils/fuekCourseData";
import {
  getLocalRegistrations,
  getLocalStudents,
  saveLocalRegistrations,
} from "../../utils/sampleData";

const PROGRAMME_TYPES = [
  "NCE",
  "NUC",
  "OND",
  "HND",
  "PGD",
  "PGDE",
  "PhD",
  "MSc",
  "MPhil",
  "Certificate",
];

const LEVELS = [
  "100",
  "200",
  "300",
  "400",
  "NCE I",
  "NCE II",
  "NCE III",
  "ND I",
  "ND II",
  "HND I",
  "HND II",
];
const SEMESTERS = ["First", "Second"];

interface StudentRow {
  matric: string;
  name: string;
  programme: string;
  level: string;
  department: string;
  creditCount: number;
  selected: boolean;
}

interface AssignPreview {
  matric: string;
  name: string;
  courses: FuekCourse[];
  creditTotal: number;
  status: "ready" | "already_registered" | "no_courses";
}

interface BatchResult {
  batchId: string;
  studentsProcessed: number;
  coursesRegistered: number;
  errors: string[];
}

function levelNum(levelStr: string): number | string {
  const map: Record<string, number | string> = {
    "100": 100,
    "200": 200,
    "300": 300,
    "400": 400,
    "NCE I": 100,
    "NCE II": 200,
    "NCE III": 300,
    "ND I": 100,
    "ND II": 200,
    "HND I": 300,
    "HND II": 400,
    Batch: "Batch",
  };
  return map[levelStr] ?? 100;
}

function generateBatchId(): string {
  return `BCR-${Date.now()}`;
}

export function AdminBulkCourseRegistration() {
  const [filterProg, setFilterProg] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterDept, setFilterDept] = useState<string>("");

  // Tab 1: Manual Batch
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [processing, setProcessing] = useState(false);

  // Tab 2: AI Assignment
  const [assignPreviews, setAssignPreviews] = useState<AssignPreview[]>([]);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<BatchResult | null>(null);

  // Tab 3: CSV Import
  const [csvRows, setCsvRows] = useState<
    Array<{
      matric: string;
      courseCode: string;
      semester: string;
      error?: string;
    }>
  >([]);
  const [csvResult, setCsvResult] = useState<BatchResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Departments derived from students
  const allStudents = getLocalStudents();
  const departments = [
    ...new Set(allStudents.map((s) => s.department).filter(Boolean)),
  ];

  // Filter students for the current filter criteria
  const filteredStudents = allStudents.filter((s) => {
    const pt = (s as { programmeType?: string }).programmeType ?? "";
    if (filterProg && !pt.includes(filterProg)) return false;
    if (filterLevel && s.level !== filterLevel) return false;
    if (filterDept && s.department !== filterDept) return false;
    return true;
  });

  const loadStudentRows = () => {
    const registrations = getLocalRegistrations();
    const rows: StudentRow[] = filteredStudents.map((s) => {
      const credits = registrations.filter(
        (r) => r.studentMatric === s.matricNumber,
      ).length;
      return {
        matric: s.matricNumber,
        name: s.name,
        programme: (s as { programmeType?: string }).programmeType ?? "NUC",
        level: s.level,
        department: s.department ?? "",
        creditCount: credits,
        selected: false,
      };
    });
    setStudentRows(rows);
    setPreviewOpen(false);
    setBatchResult(null);
  };

  const toggleStudent = (idx: number) =>
    setStudentRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)),
    );

  const toggleAll = () => {
    const anySelected = studentRows.some((r) => r.selected);
    setStudentRows((prev) =>
      prev.map((r) => ({ ...r, selected: !anySelected })),
    );
  };

  const selectedStudents = studentRows.filter((r) => r.selected);

  // Preview what will be registered
  const getPreviewForStudent = (
    row: StudentRow,
  ): { courses: FuekCourse[]; total: number } => {
    const lNum = levelNum(row.level);
    const compulsory = getCompulsoryCourses(
      row.programme,
      lNum,
      filterSemester || undefined,
    );
    const existing = getLocalRegistrations().filter(
      (r) => r.studentMatric === row.matric,
    );
    const existingCodes = new Set(existing.map((r) => r.courseCode));
    const toRegister = compulsory.filter((c) => !existingCodes.has(c.code));
    return { courses: toRegister, total: getTotalCreditUnits(toRegister) };
  };

  // Tab 1: Execute batch registration
  const handleBatchRegister = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    const registrations = getLocalRegistrations();
    const batchId = generateBatchId();
    let totalCourses = 0;
    const errors: string[] = [];

    for (const student of selectedStudents) {
      const { courses } = getPreviewForStudent(student);
      for (const c of courses) {
        registrations.push({
          id: `BCR-${student.matric}-${c.code}-${Date.now()}`,
          studentMatric: student.matric,
          courseCode: c.code,
          semester: filterSemester || c.semester,
          registeredAt: new Date().toISOString(),
        });
        totalCourses++;
      }
    }
    saveLocalRegistrations(registrations);
    setBatchResult({
      batchId,
      studentsProcessed: selectedStudents.length,
      coursesRegistered: totalCourses,
      errors,
    });
    setProcessing(false);
    setPreviewOpen(false);
    toast.success(
      `Batch registration complete: ${totalCourses} courses for ${selectedStudents.length} students`,
    );
  };

  // Tab 2: AI auto-assignment
  const runAIAssignment = async () => {
    setAiRunning(true);
    setAiProgress(0);
    setAiResult(null);
    setAssignPreviews([]);

    const selected = studentRows.filter((r) => r.selected);
    if (selected.length === 0) {
      toast.error("Select students first");
      setAiRunning(false);
      return;
    }

    const registrations = getLocalRegistrations();
    const previews: AssignPreview[] = [];

    for (let i = 0; i < selected.length; i++) {
      const s = selected[i];
      const lNum = levelNum(s.level);
      const compulsory = getCompulsoryCourses(
        s.programme,
        lNum,
        filterSemester || undefined,
      );
      const existing = new Set(
        registrations
          .filter((r) => r.studentMatric === s.matric)
          .map((r) => r.courseCode),
      );
      const toRegister = compulsory.filter((c) => !existing.has(c.code));

      // Add electives to reach min 15 CU if needed
      let total = getTotalCreditUnits(toRegister);
      const electives = getElectiveCourses(
        s.programme,
        lNum,
        filterSemester || undefined,
      );
      for (const e of electives) {
        if (total >= REGISTRATION_RULES.minCreditUnits) break;
        if (!existing.has(e.code)) {
          toRegister.push(e);
          total += e.creditUnits;
        }
      }

      previews.push({
        matric: s.matric,
        name: s.name,
        courses: toRegister,
        creditTotal: total,
        status: toRegister.length === 0 ? "already_registered" : "ready",
      });

      setAiProgress(Math.round(((i + 1) / selected.length) * 100));
      await new Promise((r) => setTimeout(r, 80));
    }

    setAssignPreviews(previews);
    setAiRunning(false);
  };

  const confirmAIAssignment = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    const registrations = getLocalRegistrations();
    const batchId = generateBatchId();
    let totalCourses = 0;

    for (const preview of assignPreviews) {
      if (preview.status !== "ready") continue;
      for (const c of preview.courses) {
        registrations.push({
          id: `AI-BCR-${preview.matric}-${c.code}-${Date.now()}`,
          studentMatric: preview.matric,
          courseCode: c.code,
          semester: filterSemester || c.semester,
          registeredAt: new Date().toISOString(),
        });
        totalCourses++;
      }
    }
    saveLocalRegistrations(registrations);
    const studentsAssigned = assignPreviews.filter(
      (p) => p.status === "ready",
    ).length;
    setAiResult({
      batchId,
      studentsProcessed: studentsAssigned,
      coursesRegistered: totalCourses,
      errors: [],
    });
    setProcessing(false);
    toast.success(
      `AI assignment complete: ${totalCourses} courses for ${studentsAssigned} students`,
    );
  };

  // Tab 3: CSV course import
  const downloadCsvTemplate = () => {
    downloadCSV("course_import_template.csv", [
      ["matric_number", "course_code", "semester"],
      ["CSC/2024/001", "CSC 101", "First"],
      ["CSC/2024/002", "MAT 111", "Second"],
    ]);
  };

  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        toast.error("CSV appears empty");
        return;
      }
      const headers = parsed[0].map((h) => h.toLowerCase().replace(/\s/g, "_"));
      const students = getLocalStudents();
      const existingMatrics = new Set(students.map((s) => s.matricNumber));
      const allCodes = new Set(ALL_FUEK_COURSES.map((c) => c.code));
      const existing = getLocalRegistrations();

      const rows = parsed.slice(1).map((vals) => {
        const row: Record<string, string> = {};
        for (const [i, h] of headers.entries()) row[h] = vals[i] ?? "";
        const matric = (row.matric_number || "").trim().toUpperCase();
        const code = (row.course_code || "").trim().toUpperCase();
        const semester = (row.semester || "First").trim();
        let error: string | undefined;
        if (!matric) error = "Missing matric";
        else if (!existingMatrics.has(matric))
          error = `Student ${matric} not found`;
        else if (!code) error = "Missing course code";
        else if (!allCodes.has(code)) error = `Course ${code} not in catalogue`;
        else if (
          existing.find(
            (r) => r.studentMatric === matric && r.courseCode === code,
          )
        )
          error = "Already registered";
        return { matric, courseCode: code, semester, error };
      });
      setCsvRows(rows);
      setCsvResult(null);
    };
    reader.readAsText(file);
  };

  const importCsvRows = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 300));
    const validRows = csvRows.filter((r) => !r.error);
    const registrations = getLocalRegistrations();
    const batchId = generateBatchId();

    for (const row of validRows) {
      registrations.push({
        id: `CSV-${row.matric}-${row.courseCode}-${Date.now()}`,
        studentMatric: row.matric,
        courseCode: row.courseCode,
        semester: row.semester,
        registeredAt: new Date().toISOString(),
      });
    }
    saveLocalRegistrations(registrations);
    const errCount = csvRows.filter((r) => !!r.error).length;
    setCsvResult({
      batchId,
      studentsProcessed: validRows.length,
      coursesRegistered: validRows.length,
      errors: [],
    });
    setProcessing(false);
    toast.success(
      `${validRows.length} course registrations imported, ${errCount} skipped`,
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bulk Course Registration
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Register courses for multiple students at once using manual batch, AI
          auto-assignment, or CSV import
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Programme Type</Label>
              <Select value={filterProg} onValueChange={setFilterProg}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="All programmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {PROGRAMME_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Level</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Semester</Label>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="Both" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Both</SelectItem>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Department</Label>
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="All depts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700"
            onClick={loadStudentRows}
            data-ocid="bulk_course.load_students"
          >
            🔍 Load Students ({filteredStudents.length} found)
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="manual">
        <TabsList
          className="grid grid-cols-3 w-full"
          data-ocid="bulk_course.tabs"
        >
          <TabsTrigger value="manual" data-ocid="bulk_course.tab_manual">
            📋 Manual Batch
          </TabsTrigger>
          <TabsTrigger value="ai" data-ocid="bulk_course.tab_ai">
            🤖 AI Auto-Assign
          </TabsTrigger>
          <TabsTrigger value="csv" data-ocid="bulk_course.tab_csv">
            📊 CSV Import
          </TabsTrigger>
        </TabsList>

        {/* ======== TAB 1: Manual Batch ======== */}
        <TabsContent value="manual" className="space-y-4 mt-4">
          {studentRows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">
                  Use the filters above and click "Load Students" to begin
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Students ({studentRows.length}) — {selectedStudents.length}{" "}
                    selected
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <Table data-ocid="bulk_course.manual_table">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              onCheckedChange={toggleAll}
                              data-ocid="bulk_course.select_all"
                            />
                          </TableHead>
                          <TableHead>Matric</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Programme</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Current Credits</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentRows.map((row, idx) => (
                          <TableRow
                            key={row.matric}
                            className={row.selected ? "bg-blue-50" : ""}
                            data-ocid={`bulk_course.row.${idx + 1}`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={row.selected}
                                onCheckedChange={() => toggleStudent(idx)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.matric}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.name}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                                {row.programme}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.level}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                                {row.creditCount} courses
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Preview section */}
              {selectedStudents.length > 0 && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewOpen((p) => !p)}
                    data-ocid="bulk_course.preview_toggle"
                  >
                    {previewOpen
                      ? "▲ Hide Preview"
                      : "▼ Preview What Will Be Registered"}
                  </Button>

                  {previewOpen && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Registration Preview ({selectedStudents.length}{" "}
                          students)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedStudents.map((s) => {
                          const { courses, total } = getPreviewForStudent(s);
                          return (
                            <div
                              key={s.matric}
                              className="border border-border rounded-lg p-3 bg-muted/30"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  {s.name}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {s.matric}
                                </span>
                                <Badge
                                  className={`text-xs border-0 ${courses.length > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                                >
                                  {courses.length > 0
                                    ? `${courses.length} courses / ${total} CU`
                                    : "Already registered"}
                                </Badge>
                              </div>
                              {courses.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {courses.map((c) => (
                                    <Badge
                                      key={c.id}
                                      className="bg-blue-50 text-blue-700 border-0 text-xs font-mono"
                                    >
                                      {c.code}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleBatchRegister}
                    disabled={processing}
                    data-ocid="bulk_course.register_button"
                  >
                    {processing
                      ? "Registering..."
                      : `✅ Register Compulsory Courses for ${selectedStudents.length} Student(s)`}
                  </Button>
                </div>
              )}

              {batchResult && (
                <div className="flex flex-wrap gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <Badge className="bg-green-100 text-green-700 border-0">
                    ✅ {batchResult.studentsProcessed} students processed
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    📚 {batchResult.coursesRegistered} courses registered
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-600 border-0 font-mono">
                    {batchResult.batchId}
                  </Badge>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ======== TAB 2: AI Auto-Assign ======== */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          {studentRows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">
                  Use the filters above and click "Load Students" first
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    AI Course Assignment — {studentRows.length} students loaded
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI will assign (a) all compulsory courses and (b)
                    recommended electives to reach minimum{" "}
                    {REGISTRATION_RULES.minCreditUnits} credit units
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-56 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox onCheckedChange={toggleAll} />
                          </TableHead>
                          <TableHead>Matric</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Programme</TableHead>
                          <TableHead>Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentRows.map((row, idx) => (
                          <TableRow
                            key={row.matric}
                            className={row.selected ? "bg-blue-50" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={row.selected}
                                onCheckedChange={() => toggleStudent(idx)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.matric}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.name}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                                {row.programme}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.level}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={runAIAssignment}
                disabled={aiRunning || selectedStudents.length === 0}
                data-ocid="bulk_course.ai_assign_button"
              >
                🤖 AI Auto-Assign for {selectedStudents.length} Selected
                Student(s)
              </Button>

              {aiRunning && (
                <div className="space-y-2">
                  <p className="text-sm text-blue-700 font-medium">
                    AI analyzing student profiles...
                  </p>
                  <Progress value={aiProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {aiProgress}% complete
                  </p>
                </div>
              )}

              {assignPreviews.length > 0 && !aiRunning && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        AI Assignment Preview ({assignPreviews.length} students)
                      </CardTitle>
                      <div className="flex gap-3 mt-1">
                        <Badge className="bg-green-100 text-green-700 border-0">
                          {
                            assignPreviews.filter((p) => p.status === "ready")
                              .length
                          }{" "}
                          to assign
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 border-0">
                          {
                            assignPreviews.filter(
                              (p) => p.status === "already_registered",
                            ).length
                          }{" "}
                          already registered
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <Table data-ocid="bulk_course.ai_preview_table">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Courses to Register</TableHead>
                              <TableHead>Credit Total</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assignPreviews.map((p) => (
                              <TableRow key={p.matric}>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {p.name}
                                    </p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                      {p.matric}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {p.courses.slice(0, 5).map((c) => (
                                      <Badge
                                        key={c.id}
                                        className="bg-blue-50 text-blue-700 border-0 text-xs font-mono"
                                      >
                                        {c.code}
                                      </Badge>
                                    ))}
                                    {p.courses.length > 5 && (
                                      <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">
                                        +{p.courses.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`border-0 text-xs ${p.creditTotal >= REGISTRATION_RULES.minCreditUnits ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                                  >
                                    {p.creditTotal} CU
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {p.status === "ready" ? (
                                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                      Ready
                                    </Badge>
                                  ) : p.status === "already_registered" ? (
                                    <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">
                                      Already registered
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                      No courses found
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {!aiResult && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={confirmAIAssignment}
                      disabled={processing}
                      data-ocid="bulk_course.ai_confirm_button"
                    >
                      {processing
                        ? "Processing..."
                        : `✅ Confirm AI Assignment for ${assignPreviews.filter((p) => p.status === "ready").length} Students`}
                    </Button>
                  )}

                  {aiResult && (
                    <div className="flex flex-wrap gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <Badge className="bg-green-100 text-green-700 border-0">
                        ✅ {aiResult.studentsProcessed} students processed
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        📚 {aiResult.coursesRegistered} courses registered
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-600 border-0 font-mono">
                        {aiResult.batchId}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </TabsContent>

        {/* ======== TAB 3: CSV Import ======== */}
        <TabsContent value="csv" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                1. Download CSV Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={downloadCsvTemplate}
                data-ocid="bulk_course.csv_template_button"
              >
                📥 Download Course Import Template
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Columns: matric_number, course_code, semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                2. Upload Completed CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-400 transition-colors"
                onClick={() => fileRef.current?.click()}
                data-ocid="bulk_course.csv_dropzone"
              >
                <div className="text-3xl mb-2">📊</div>
                <p className="font-medium text-foreground">
                  Click to upload CSV
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Validates: student exists, course in catalogue, no duplicate
                </p>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCsvFile(f);
                }}
              />
            </CardContent>
          </Card>

          {csvRows.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    3. Review Import ({csvRows.length} rows)
                  </CardTitle>
                  <div className="flex gap-3 mt-1">
                    <Badge className="bg-green-100 text-green-700 border-0">
                      {csvRows.filter((r) => !r.error).length} valid
                    </Badge>
                    <Badge className="bg-red-100 text-red-700 border-0">
                      {csvRows.filter((r) => !!r.error).length} errors
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <Table data-ocid="bulk_course.csv_table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Matric</TableHead>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvRows.map((row, idx) => (
                          <TableRow
                            key={`${row.matric}-${idx}`}
                            className={row.error ? "bg-red-50" : "bg-green-50"}
                          >
                            <TableCell className="font-mono text-xs">
                              {row.matric || "—"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.courseCode || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.semester || "—"}
                            </TableCell>
                            <TableCell>
                              {row.error ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {row.error}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                  Valid
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {!csvResult && (
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={importCsvRows}
                  disabled={
                    processing || csvRows.filter((r) => !r.error).length === 0
                  }
                  data-ocid="bulk_course.csv_import_button"
                >
                  {processing
                    ? "Importing..."
                    : `Import ${csvRows.filter((r) => !r.error).length} Valid Rows`}
                </Button>
              )}

              {csvResult && (
                <div className="flex flex-wrap gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <Badge className="bg-green-100 text-green-700 border-0">
                    ✅ {csvResult.coursesRegistered} course registrations
                    imported
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 border-0">
                    ❌ {csvRows.filter((r) => !!r.error).length} errors skipped
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-600 border-0 font-mono">
                    {csvResult.batchId}
                  </Badge>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Info footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold">Credit Unit Rules</p>
              <p className="text-xs mt-0.5">
                Min: {REGISTRATION_RULES.minCreditUnits} CU / Max:{" "}
                {REGISTRATION_RULES.maxCreditUnits} CU per semester
              </p>
            </div>
            <div>
              <p className="font-semibold">Graduation Requirements</p>
              <p className="text-xs mt-0.5">
                UTME: {REGISTRATION_RULES.utmeMinCredits} CU | DE:{" "}
                {REGISTRATION_RULES.deMinCredits} CU
              </p>
            </div>
            <div>
              <p className="font-semibold">Semester Limits</p>
              <p className="text-xs mt-0.5">
                UTME: {REGISTRATION_RULES.utmeMinSemesters}–
                {REGISTRATION_RULES.utmeMaxSemesters} sem | DE:{" "}
                {REGISTRATION_RULES.deMinSemesters}–
                {REGISTRATION_RULES.deMaxSemesters} sem
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
