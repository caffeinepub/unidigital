import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Printer,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  type ExamResult,
  addScoreAuditLog,
  getLocalCAScores,
  getLocalCourses,
  getLocalExamResults,
  getLocalStudents,
  gradeFromScore,
  saveLocalExamResults,
} from "../../utils/sampleData";
import {
  type ScoreSheetStudent,
  computeGrade,
  downloadBlankTemplate,
  downloadFilledScoreSheet,
  gradeColorClass,
  printScoreSheet,
} from "../../utils/scoreSheetUtils";
import { useFileUpload } from "../../utils/useFileUpload";

interface ParsedRow {
  sn: string;
  name: string;
  matric: string;
  ca: string;
  exam: string;
  total: string;
  grade: string;
  remarks: string;
  errors: string[];
}

const SEMESTERS = [
  "2023/2024 First",
  "2023/2024 Second",
  "2022/2023 First",
  "2022/2023 Second",
  "2024/2025 First",
  "2024/2025 Second",
];

export function ScoreBulkUpload() {
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState("2023/2024 First");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [imported, setImported] = useState<{
    success: number;
    errors: number;
  } | null>(null);
  const [showSig, setShowSig] = useState(false);
  const [lecturerName, setLecturerName] = useState("");
  const [hodName, setHodName] = useState("");
  const [deanName, setDeanName] = useState("");
  const [moderatorName, setModeratorName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { identity } = useInternetIdentity();
  const { uploadFile } = useFileUpload();

  const course = courses.find((c) => c.code === selectedCourse);
  const sigBlock = { lecturerName, hodName, deanName, moderatorName };

  const handleDownloadTemplate = () => {
    if (!selectedCourse || !course) {
      toast.error("Select a course first");
      return;
    }
    downloadBlankTemplate(
      {
        faculty: "Faculty of Education",
        department: course.department,
        courseTitle: course.title,
        courseCode: course.code,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      students.map((s) => ({ name: s.name, matricNumber: s.matricNumber })),
      sigBlock,
    );
    addScoreAuditLog({
      id: `AUDIT-${Date.now()}`,
      action: "download_template",
      courseCode: selectedCourse,
      semester,
      performedBy: identity?.getPrincipal().toString() ?? "Lecturer",
      recordCount: students.length,
      timestamp: new Date().toISOString(),
    });
    toast.success(`Template downloaded for ${students.length} students.`);
  };

  const handleDownloadFilled = () => {
    if (!selectedCourse || !course) {
      toast.error("Select a course first");
      return;
    }
    const examResults = getLocalExamResults();
    const caScores = getLocalCAScores();
    const rows: ScoreSheetStudent[] = students.map((s, i) => {
      const result = examResults.find(
        (r) =>
          r.courseCode === selectedCourse &&
          r.studentMatric === s.matricNumber &&
          r.semester === semester,
      );
      const caEntry = caScores.find(
        (c) =>
          c.courseCode === selectedCourse && c.studentMatric === s.matricNumber,
      );
      const ca = caEntry?.totalCA ?? 0;
      const exam = result?.examScore ?? 0;
      const total = ca + exam;
      const { grade, remarks } = computeGrade(total);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca,
        exam,
        total,
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
      sigBlock,
    );
    toast.success("Filled score sheet downloaded.");
  };

  const handlePrint = () => {
    if (!selectedCourse || !course) {
      toast.error("Select a course first");
      return;
    }
    const examResults = getLocalExamResults();
    const caScores = getLocalCAScores();
    const rows: ScoreSheetStudent[] = students.map((s, i) => {
      const result = examResults.find(
        (r) =>
          r.courseCode === selectedCourse &&
          r.studentMatric === s.matricNumber &&
          r.semester === semester,
      );
      const caEntry = caScores.find(
        (c) =>
          c.courseCode === selectedCourse && c.studentMatric === s.matricNumber,
      );
      const ca = caEntry?.totalCA ?? 0;
      const exam = result?.examScore ?? 0;
      const total = ca + exam;
      const { grade, remarks } = computeGrade(total);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca: result ? ca : "–",
        exam: result ? exam : "–",
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
      sigBlock,
    );
  };

  const parseUploadedCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split("\n");
    const knownMatrics = new Set(students.map((s) => s.matricNumber));
    const result: ParsedRow[] = [];
    const headerIdx = lines.findIndex(
      (l) =>
        l.toLowerCase().includes("s/n") || l.toLowerCase().includes("matric"),
    );
    const dataLines =
      headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines.slice(1);

    for (const line of dataLines) {
      if (
        !line.trim() ||
        line.startsWith("---") ||
        line.toLowerCase().includes("signature")
      )
        break;
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 5) continue;
      const sn = cols[0] ?? "";
      const name = cols[1] ?? "";
      const matric = cols[2] ?? "";
      const caStr = cols[3] ?? "";
      const examStr = cols[4] ?? "";

      const errors: string[] = [];
      if (!matric) errors.push("Missing Matric Number");
      else if (!knownMatrics.has(matric))
        errors.push(`Unknown matric: ${matric}`);

      const ca = Number(caStr);
      const exam = Number(examStr);
      if (caStr && (Number.isNaN(ca) || ca < 0 || ca > 40))
        errors.push(`CA ${caStr} exceeds max 40`);
      if (examStr && (Number.isNaN(exam) || exam < 0 || exam > 60))
        errors.push(`Exam ${examStr} exceeds max 60`);

      const validCA = !Number.isNaN(ca) && ca >= 0 && ca <= 40 ? ca : 0;
      const validExam =
        !Number.isNaN(exam) && exam >= 0 && exam <= 60 ? exam : 0;
      const total = validCA + validExam;
      const { grade, remarks } = computeGrade(total);

      result.push({
        sn,
        name,
        matric,
        ca: caStr,
        exam: examStr,
        total: errors.length === 0 ? String(total) : "",
        grade: errors.length === 0 ? grade : "",
        remarks: errors.length === 0 ? remarks : "",
        errors,
      });
    }
    return result;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseUploadedCSV(text));
      setImported(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedCourse) {
      toast.error("Select a course before importing");
      return;
    }
    const valid = rows.filter((r) => r.errors.length === 0);
    const invalid = rows.filter((r) => r.errors.length > 0);
    const existing = getLocalExamResults();
    const newResults: ExamResult[] = valid.map((r) => {
      const ca = Number(r.ca) || 0;
      const exam = Number(r.exam) || 0;
      const total = ca + exam;
      const { grade, remarks } = computeGrade(total);
      const gInfo = gradeFromScore(total);
      return {
        id: `BULK-${selectedCourse}-${r.matric}-${Date.now()}`,
        courseCode: selectedCourse,
        studentMatric: r.matric,
        examScore: exam,
        totalScore: total,
        grade,
        point: gInfo.gradePoint,
        remark: remarks,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
        status: "submitted" as const,
        submittedAt: new Date().toISOString(),
      };
    });

    const updated = [
      ...existing.filter(
        (e) =>
          !(
            e.courseCode === selectedCourse &&
            e.semester === semester &&
            valid.some((v) => v.matric === e.studentMatric)
          ),
      ),
      ...newResults,
    ];
    saveLocalExamResults(updated);

    if (fileRef.current?.files?.[0]) {
      try {
        await uploadFile(fileRef.current.files[0]);
      } catch {
        // ignore upload failure silently
      }
    }

    addScoreAuditLog({
      id: `AUDIT-${Date.now()}`,
      action: "upload_scores",
      courseCode: selectedCourse,
      semester,
      performedBy: identity?.getPrincipal().toString() ?? "Lecturer",
      recordCount: valid.length,
      timestamp: new Date().toISOString(),
    });

    setImported({ success: valid.length, errors: invalid.length });
    setRows([]);
    toast.success(
      `${valid.length} score(s) imported. ${invalid.length} row(s) skipped.`,
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Score Sheet Upload
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Download the score sheet template, fill it offline, then upload for
          bulk import.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Step 1 — Select Course & Download Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-72">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="mt-1" data-ocid="score_upload.select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setShowSig((v) => !v)}
          >
            {showSig ? "▲ Hide" : "▼ Edit"} signature fields for download/print
          </button>
          {showSig && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  [lecturerName, setLecturerName, "Lecturer In Charge"],
                  [hodName, setHodName, "HOD Name"],
                  [deanName, setDeanName, "Dean Name"],
                  [moderatorName, setModeratorName, "Moderator Name"],
                ] as [string, (v: string) => void, string][]
              ).map(([val, setter, lbl]) => (
                <div key={lbl}>
                  <Label className="text-xs">{lbl}</Label>
                  <Input
                    className="mt-1 h-8 text-xs"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={lbl}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={!selectedCourse}
              data-ocid="score_upload.download_template_button"
            >
              <Download size={15} className="mr-1.5" /> Blank Template
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadFilled}
              disabled={!selectedCourse}
              data-ocid="score_upload.download_filled_button"
            >
              <FileSpreadsheet size={15} className="mr-1.5" /> Filled Score
              Sheet
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!selectedCourse}
              data-ocid="score_upload.print_button"
            >
              <Printer size={15} className="mr-1.5" /> Print Score Sheet
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Step 2 — Upload Completed Score Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Upload CSV Score Sheet</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFile}
                className="hidden"
                data-ocid="score_upload.dropzone"
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                data-ocid="score_upload.upload_button"
              >
                <Upload size={15} className="mr-1.5" /> Choose File
              </Button>
              <span className="text-xs text-slate-400">
                CSV or Excel files accepted
              </span>
            </div>
          </div>

          {rows.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">
                  Validation Preview — {rows.length} row(s)
                </h3>
                <Badge
                  variant={
                    rows.some((r) => r.errors.length > 0)
                      ? "destructive"
                      : "default"
                  }
                >
                  {rows.filter((r) => r.errors.length === 0).length} valid /{" "}
                  {rows.filter((r) => r.errors.length > 0).length} errors
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>S/N</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Matric</TableHead>
                      <TableHead>CA</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow
                        key={`${row.matric}-${idx}`}
                        className={
                          row.errors.length > 0 ? "bg-red-50" : "bg-green-50/40"
                        }
                        data-ocid={`score_upload.item.${idx + 1}`}
                      >
                        <TableCell className="text-xs">{row.sn}</TableCell>
                        <TableCell className="text-sm">{row.name}</TableCell>
                        <TableCell className="font-mono text-xs text-blue-600">
                          {row.matric}
                        </TableCell>
                        <TableCell className="text-center">{row.ca}</TableCell>
                        <TableCell className="text-center">
                          {row.exam}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {row.total}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.grade && (
                            <Badge
                              className={`${gradeColorClass(row.grade)} border-0 font-bold text-xs`}
                            >
                              {row.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span
                            className={
                              row.remarks === "Pass"
                                ? "text-green-700 font-semibold"
                                : row.remarks === "Fail"
                                  ? "text-red-700 font-semibold"
                                  : ""
                            }
                          >
                            {row.remarks}
                          </span>
                        </TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <XCircle
                                size={14}
                                className="text-red-500 flex-shrink-0"
                              />
                              <span className="text-xs text-red-600">
                                {row.errors.join("; ")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CheckCircle
                                size={14}
                                className="text-green-500"
                              />
                              <span className="text-xs text-green-600">
                                Valid
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {rows.some((r) => r.errors.length > 0) && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle
                    size={15}
                    className="text-amber-600 flex-shrink-0"
                  />
                  <p className="text-xs text-amber-700">
                    Invalid rows will be skipped. Only valid rows will be
                    imported.
                  </p>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={
                  !selectedCourse ||
                  rows.filter((r) => r.errors.length === 0).length === 0
                }
                className="bg-blue-600 hover:bg-blue-700"
                data-ocid="score_upload.primary_button"
              >
                Import {rows.filter((r) => r.errors.length === 0).length} Valid
                Row(s)
              </Button>
            </>
          )}

          {imported && (
            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
              data-ocid="score_upload.success_state"
            >
              <CheckCircle size={18} className="text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {imported.success} score(s) imported successfully.
                </p>
                {imported.errors > 0 && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    {imported.errors} row(s) were skipped due to errors.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
