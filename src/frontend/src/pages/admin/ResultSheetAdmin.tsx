import { Download, Printer, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
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
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { downloadCSV } from "../../utils/csvUtils";
import {
  getLocalCAScores,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";

const gradeColor: Record<string, string> = {
  A: "text-green-600 font-bold",
  B: "text-blue-600 font-bold",
  C: "text-amber-600 font-bold",
  D: "text-orange-600 font-bold",
  E: "text-red-500 font-bold",
  F: "text-red-700 font-bold",
};

export function ResultSheetAdmin() {
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const caScores = getLocalCAScores();
  const { examResults, gradeConfig, computeStudentCGPA } =
    useResultProcessing();

  const [search, setSearch] = useState("");
  const [selectedMatric, setSelectedMatric] = useState("");
  const [semester, setSemester] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const student = students.find((s) => s.matricNumber === selectedMatric);

  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );

  const allStudentResults = examResults.filter(
    (r) => r.studentMatric === selectedMatric,
  );

  const semesters = [...new Set(allStudentResults.map((r) => r.semester))];
  const activeSemester = semester || semesters[0] || "";

  const semResults = activeSemester
    ? allStudentResults.filter((r) => r.semester === activeSemester)
    : allStudentResults;

  const cgpa = computeStudentCGPA(selectedMatric, creditMap);
  const classOfDegree = classifyDegree(cgpa);
  const carryovers = semResults.filter((r) => r.grade === "F");

  // Semester GPA
  const semPublished = semResults.filter((r) => r.status === "published");
  let semGPANum = 0;
  let semUnits = 0;
  for (const r of semPublished) {
    const units = creditMap[r.courseCode] ?? 3;
    const entry = gradeConfig.find(
      (c) => r.totalScore >= c.minScore && r.totalScore <= c.maxScore,
    );
    semGPANum += (entry?.point ?? 0) * units;
    semUnits += units;
  }
  const semesterGPA =
    semUnits === 0 ? 0 : Math.round((semGPANum / semUnits) * 100) / 100;

  const handleDownloadCSV = () => {
    if (!student) return;
    const headers = [
      "Course Code",
      "Course Title",
      "Credit Units",
      "CA (/30)",
      "Exam (/70)",
      "Total (/100)",
      "Grade",
      "Grade Points",
      "Remark",
    ];
    const rows = semResults.map((r) => {
      const course = courses.find((c) => c.code === r.courseCode);
      const ca = caScores.find(
        (c) =>
          c.courseCode === r.courseCode && c.studentMatric === selectedMatric,
      );
      return [
        r.courseCode,
        course?.title ?? r.courseCode,
        String(course?.creditUnits ?? 3),
        String(ca?.totalCA ?? "–"),
        String(r.examScore),
        String(r.totalScore),
        r.grade,
        String(r.point),
        r.remark,
      ];
    });
    const summary = [
      ["", "", "", "", "", "", "", "", ""],
      [
        "Semester GPA",
        String(semesterGPA.toFixed(2)),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      ["Cumulative GPA", String(cgpa.toFixed(2)), "", "", "", "", "", "", ""],
      ["Class of Degree", classOfDegree, "", "", "", "", "", "", ""],
    ];
    downloadCSV(
      `result-sheet-${student.matricNumber}-${activeSemester.replace(/ /g, "-")}.csv`,
      [headers, ...rows, ...summary],
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Result Sheet Generator
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate and download full result sheets for any student.
        </p>
      </div>

      {/* Student search */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <Label>Search Student</Label>
          <div className="relative mt-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="pl-8"
              placeholder="Name or matric number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="result-sheet.search_input"
            />
          </div>
        </div>
        <div className="w-72">
          <Label>Select Student</Label>
          <Select
            value={selectedMatric}
            onValueChange={(v) => {
              setSelectedMatric(v);
              setSemester("");
            }}
          >
            <SelectTrigger className="mt-1" data-ocid="result-sheet.select">
              <SelectValue placeholder="Choose student..." />
            </SelectTrigger>
            <SelectContent>
              {filtered.map((s) => (
                <SelectItem key={s.matricNumber} value={s.matricNumber}>
                  {s.matricNumber} – {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedMatric && (
          <div className="w-52">
            <Label>Semester</Label>
            <Select value={activeSemester} onValueChange={setSemester}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All semesters" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {!student ? (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="result-sheet.empty_state"
          >
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No student selected.</p>
            <p className="text-sm mt-1">
              Search and select a student to view their result sheet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              data-ocid="result-sheet.secondary_button"
            >
              <Printer size={16} className="mr-2" /> Print
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleDownloadCSV}
              data-ocid="result-sheet.primary_button"
            >
              <Download size={16} className="mr-2" /> Download CSV
            </Button>
          </div>

          {/* Result sheet */}
          <Card data-ocid="result-sheet.card">
            <CardHeader className="border-b bg-gradient-to-r from-slate-800 to-blue-900 text-white rounded-t-lg">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-blue-200 mb-1">
                  Generated by Registry / Admin Office
                </p>
                <h2 className="text-xl font-bold">
                  Federal University of Technology
                </h2>
                <p className="text-sm text-blue-100">
                  Official Result Sheet — Academic Record
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-8 text-sm text-left max-w-sm mx-auto">
                  <span className="text-blue-200">Student Name:</span>
                  <span className="font-semibold">{student.name}</span>
                  <span className="text-blue-200">Matric No.:</span>
                  <span className="font-mono font-semibold">
                    {student.matricNumber}
                  </span>
                  <span className="text-blue-200">Department:</span>
                  <span className="font-semibold">{student.department}</span>
                  <span className="text-blue-200">Level:</span>
                  <span className="font-semibold">{student.level}L</span>
                  <span className="text-blue-200">Semester:</span>
                  <span className="font-semibold">
                    {activeSemester || "All"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Course Code",
                        "Course Title",
                        "Units",
                        "CA (/30)",
                        "Exam (/70)",
                        "Total",
                        "Grade",
                        "GP",
                        "Remark",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {semResults.map((r, idx) => {
                      const course = courses.find(
                        (c) => c.code === r.courseCode,
                      );
                      const ca = caScores.find(
                        (c) =>
                          c.courseCode === r.courseCode &&
                          c.studentMatric === selectedMatric,
                      );
                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`result-sheet.item.${idx + 1}`}
                        >
                          <td className="px-4 py-3 text-sm font-mono text-blue-600">
                            {r.courseCode}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {course?.title ?? r.courseCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {course?.creditUnits ?? 3}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-slate-600">
                            {ca?.totalCA ?? "–"}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {r.examScore}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-bold">
                            {r.totalScore}
                          </td>
                          <td
                            className={`px-4 py-3 text-sm text-center ${
                              gradeColor[r.grade] ?? ""
                            }`}
                          >
                            {r.grade}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            {r.point}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium ${
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
                    {semResults.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center text-slate-400"
                          data-ocid="result-sheet.empty_state"
                        >
                          No results found for this student and semester.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {semResults.length > 0 && (
                <div className="px-6 py-5 border-t bg-slate-50 space-y-4">
                  {/* GPA summary */}
                  <div className="flex flex-wrap gap-8">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Semester GPA
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {semesterGPA.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Cumulative GPA
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {cgpa.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Class of Degree
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {classOfDegree}
                      </p>
                    </div>
                  </div>

                  {/* Carryovers */}
                  {carryovers.length > 0 && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <p className="text-sm font-semibold text-red-700 mb-2">
                        Carryover Courses ({carryovers.length})
                      </p>
                      <ul className="space-y-1">
                        {carryovers.map((r) => {
                          const course = courses.find(
                            (c) => c.code === r.courseCode,
                          );
                          return (
                            <li key={r.id} className="text-sm text-red-600">
                              • {r.courseCode} – {course?.title ?? r.courseCode}{" "}
                              (Score: {r.totalScore})
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
