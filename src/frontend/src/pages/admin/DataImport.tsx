import { Download, Upload } from "lucide-react";
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
import { Textarea } from "../../components/ui/textarea";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import {
  type ExamResult,
  getLocalCourses,
  getLocalStudents,
  saveLocalStudents,
} from "../../utils/sampleData";
import type { StudentRecord } from "../../utils/sampleData";

function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export function DataImport() {
  const { examResults, setExamResults, gradeConfig } = useResultProcessing();
  const [studentCSV, setStudentCSV] = useState("");
  const [resultCSV, setResultCSV] = useState("");
  const [previewStudents, setPreviewStudents] = useState<StudentRecord[]>([]);
  const [previewResults, setPreviewResults] = useState<ExamResult[]>([]);
  const [exportSemester, setExportSemester] = useState("2023/2024 First");

  const previewStudentImport = () => {
    const rows = parseCSV(studentCSV);
    const parsed: StudentRecord[] = rows
      .map((r) => ({
        matricNumber: r.matric ?? r.matricNumber ?? "",
        name: r.name ?? "",
        email: r.email ?? "",
        level: r.level ?? "100",
        department: r.department ?? "",
      }))
      .filter((s) => s.matricNumber && s.name);
    setPreviewStudents(parsed);
    if (parsed.length === 0)
      toast.error(
        "No valid rows found. Check columns: matric, name, email, level, department",
      );
  };

  const importStudents = () => {
    const existing = getLocalStudents();
    const newOnes = previewStudents.filter(
      (p) => !existing.find((e) => e.matricNumber === p.matricNumber),
    );
    saveLocalStudents([...existing, ...newOnes]);
    toast.success(`${newOnes.length} student(s) imported`);
    setPreviewStudents([]);
    setStudentCSV("");
  };

  const previewResultImport = () => {
    const rows = parseCSV(resultCSV);
    const parsed: ExamResult[] = [];
    for (const r of rows) {
      const examScore = Number(r.exam_score ?? r.examScore ?? 0);
      if (!r.matric || !r.course_code) continue;
      const total = examScore; // no CA in import
      const entry =
        gradeConfig.find((c) => total >= c.minScore && total <= c.maxScore) ??
        gradeConfig[gradeConfig.length - 1];
      parsed.push({
        id: `IMPORT-${r.matric}-${r.course_code}-${Date.now()}`,
        courseCode: r.course_code,
        studentMatric: r.matric,
        examScore,
        totalScore: total,
        grade: entry.grade,
        point: entry.point,
        remark: entry.remark === "Pass" ? "Pass" : "Fail",
        semester: r.semester ?? "2023/2024 First",
        session: "2023/2024",
        status: "draft",
      });
    }
    setPreviewResults(parsed);
    if (parsed.length === 0)
      toast.error(
        "No valid rows. Expected columns: matric, course_code, exam_score",
      );
  };

  const importResults = () => {
    const merged = [
      ...examResults,
      ...previewResults.filter(
        (p) =>
          !examResults.find(
            (e) =>
              e.courseCode === p.courseCode &&
              e.studentMatric === p.studentMatric &&
              e.semester === p.semester,
          ),
      ),
    ];
    setExamResults(merged);
    toast.success(`${previewResults.length} result(s) imported`);
    setPreviewResults([]);
    setResultCSV("");
  };

  const exportResults = () => {
    const filtered = examResults.filter(
      (r) => r.semester === exportSemester && r.status === "published",
    );
    if (filtered.length === 0) {
      toast.error("No published results for this semester.");
      return;
    }
    const rows = [
      "Matric,CourseCode,ExamScore,TotalScore,Grade,Point,Semester",
    ];
    for (const r of filtered) {
      rows.push(
        `"${r.studentMatric}","${r.courseCode}",${r.examScore},${r.totalScore},${r.grade},${r.point},"${r.semester}"`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results_${exportSemester.replace(/ /g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Data Import / Export
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Import students/results from CSV, or export published results.
        </p>
      </div>

      <Tabs defaultValue="import-students">
        <TabsList>
          <TabsTrigger value="import-students" data-ocid="import.tab">
            Import Students
          </TabsTrigger>
          <TabsTrigger value="import-results" data-ocid="import.tab">
            Import Results
          </TabsTrigger>
          <TabsTrigger value="export" data-ocid="import.tab">
            Export Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import-students" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paste CSV Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">
                Expected columns:{" "}
                <code>matric, name, email, level, department</code>
              </p>
              <Textarea
                rows={6}
                placeholder="matric,name,email,level,department&#10;CSC/2024/001,John Doe,john@uni.edu,100,Computer Science"
                value={studentCSV}
                onChange={(e) => setStudentCSV(e.target.value)}
                data-ocid="import.textarea"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={previewStudentImport}
                  data-ocid="import.secondary_button"
                >
                  Preview
                </Button>
                {previewStudents.length > 0 && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={importStudents}
                    data-ocid="import.primary_button"
                  >
                    <Upload size={14} className="mr-1" /> Import{" "}
                    {previewStudents.length} Students
                  </Button>
                )}
              </div>
              {previewStudents.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Matric", "Name", "Email", "Level", "Dept"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-slate-500"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewStudents.slice(0, 10).map((s, i) => (
                        <tr
                          key={s.matricNumber}
                          className="border-b last:border-0"
                          data-ocid={`import.item.${i + 1}`}
                        >
                          <td className="px-3 py-2 font-mono text-xs text-blue-600">
                            {s.matricNumber}
                          </td>
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2 text-slate-500">
                            {s.email}
                          </td>
                          <td className="px-3 py-2">{s.level}</td>
                          <td className="px-3 py-2">{s.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-results" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paste CSV Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">
                Expected columns:{" "}
                <code>
                  matric, course_code, exam_score, semester (optional)
                </code>
              </p>
              <Textarea
                rows={6}
                placeholder="matric,course_code,exam_score,semester&#10;CSC/2021/001,CSC301,55,2023/2024 First"
                value={resultCSV}
                onChange={(e) => setResultCSV(e.target.value)}
                data-ocid="import.textarea"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={previewResultImport}
                  data-ocid="import.secondary_button"
                >
                  Preview
                </Button>
                {previewResults.length > 0 && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={importResults}
                    data-ocid="import.primary_button"
                  >
                    <Upload size={14} className="mr-1" /> Import{" "}
                    {previewResults.length} Results
                  </Button>
                )}
              </div>
              {previewResults.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {[
                          "Matric",
                          "Course",
                          "Score",
                          "Total",
                          "Grade",
                          "Semester",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-slate-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewResults.slice(0, 10).map((r, i) => (
                        <tr
                          key={r.id}
                          className="border-b last:border-0"
                          data-ocid={`import.result.item.${i + 1}`}
                        >
                          <td className="px-3 py-2 font-mono text-xs text-blue-600">
                            {r.studentMatric}
                          </td>
                          <td className="px-3 py-2">{r.courseCode}</td>
                          <td className="px-3 py-2">{r.examScore}</td>
                          <td className="px-3 py-2">{r.totalScore}</td>
                          <td className="px-3 py-2">
                            <Badge className="bg-slate-100 text-slate-700">
                              {r.grade}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-slate-500">
                            {r.semester}
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

        <TabsContent value="export" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Export Published Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label>Semester</Label>
                  <Select
                    value={exportSemester}
                    onValueChange={setExportSemester}
                  >
                    <SelectTrigger
                      className="mt-1 w-52"
                      data-ocid="import.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "2023/2024 First",
                        "2023/2024 Second",
                        "2022/2023 First",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={exportResults}
                  data-ocid="import.primary_button"
                >
                  <Download size={14} className="mr-1" /> Export CSV
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                {
                  examResults.filter(
                    (r) =>
                      r.semester === exportSemester && r.status === "published",
                  ).length
                }{" "}
                published results available for export.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
