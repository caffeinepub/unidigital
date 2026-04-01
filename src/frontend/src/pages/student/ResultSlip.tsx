import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
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

interface Props {
  userEmail: string;
  userName: string;
}

const gradeColor: Record<string, string> = {
  A: "text-green-600 font-bold",
  B: "text-blue-600 font-bold",
  C: "text-amber-600 font-bold",
  D: "text-orange-600 font-bold",
  E: "text-red-500 font-bold",
  F: "text-red-700 font-bold",
};

const degreeClassColor: Record<string, string> = {
  "First Class": "text-green-700 bg-green-50 border-green-200",
  "Second Class Upper": "text-blue-700 bg-blue-50 border-blue-200",
  "Second Class Lower": "text-amber-700 bg-amber-50 border-amber-200",
  "Third Class": "text-orange-700 bg-orange-50 border-orange-200",
  Pass: "text-slate-700 bg-slate-50 border-slate-200",
  Fail: "text-red-700 bg-red-50 border-red-200",
};

export function ResultSlip({ userEmail, userName }: Props) {
  const [student, setStudent] = useState<
    ReturnType<typeof getLocalStudents>[0] | null
  >(null);
  const [courses, setCourses] = useState(getLocalCourses());
  const [semester, setSemester] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { examResults, gradeConfig, computeStudentCGPA } =
    useResultProcessing();

  const caScores = getLocalCAScores();

  useEffect(() => {
    const students = getLocalStudents();
    const found = students.find((s) => s.email === userEmail) || students[0];
    setStudent(found);
    setCourses(getLocalCourses());
  }, [userEmail]);

  const myResults = student
    ? examResults.filter((r) => r.studentMatric === student.matricNumber)
    : [];

  const semesters = [...new Set(myResults.map((r) => r.semester))];
  const activeSemester = semester || semesters[0] || "";

  const semResults = activeSemester
    ? myResults.filter((r) => r.semester === activeSemester)
    : myResults.filter((r) => r.semester === semesters[0]);

  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );

  // GPA
  const published = semResults.filter((r) => r.status === "published");
  let semPoints = 0;
  let semUnits = 0;
  for (const r of published) {
    const units = creditMap[r.courseCode] ?? 3;
    const entry = gradeConfig.find(
      (c) => r.totalScore >= c.minScore && r.totalScore <= c.maxScore,
    );
    semPoints += (entry?.point ?? 0) * units;
    semUnits += units;
  }
  const gpa =
    semUnits === 0 ? 0 : Math.round((semPoints / semUnits) * 100) / 100;
  const cgpa = student
    ? computeStudentCGPA(student.matricNumber, creditMap)
    : 0;
  const classOfDegree = classifyDegree(cgpa);

  const carryovers = semResults.filter((r) => r.grade === "F");

  const handlePrint = () => window.print();

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
          c.courseCode === r.courseCode &&
          c.studentMatric === student.matricNumber,
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
      ["Semester GPA", gpa.toFixed(2), "", "", "", "", "", "", ""],
      ["Cumulative GPA", cgpa.toFixed(2), "", "", "", "", "", "", ""],
      ["Class of Degree", classOfDegree, "", "", "", "", "", "", ""],
    ];
    downloadCSV(
      `result-slip-${student.matricNumber}-${activeSemester.replace(/ /g, "-")}.csv`,
      [headers, ...rows, ...summary],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Result Slip</h1>
          <p className="text-slate-500 text-sm">
            View, print, or download your semester results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadCSV}
            data-ocid="result-slip.secondary_button"
          >
            <Download size={16} className="mr-2" /> Download CSV
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700"
            data-ocid="result-slip.primary_button"
          >
            <Printer size={16} className="mr-2" /> Print Result
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={activeSemester} onValueChange={(v) => setSemester(v)}>
          <SelectTrigger className="w-56" data-ocid="result-slip.select">
            <SelectValue placeholder="Select semester" />
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

      {/* Printable area */}
      <div ref={printRef} className="print:block">
        <Card data-ocid="result-slip.card">
          <CardHeader className="border-b">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FileSpreadsheet size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">
                  Federal University of Technology
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Official Result Slip — Semester Result Statement
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-8 text-sm text-left max-w-sm mx-auto">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold">
                  {student?.name ?? userName}
                </span>
                <span className="text-slate-500">Matric No.:</span>
                <span className="font-semibold font-mono">
                  {student?.matricNumber ?? "—"}
                </span>
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold">
                  {student?.department ?? "—"}
                </span>
                <span className="text-slate-500">Semester:</span>
                <span className="font-semibold">{activeSemester}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Course Code",
                      "Course Title",
                      "Units",
                      "CA (/30)",
                      "Exam (/70)",
                      "Total (/100)",
                      "Grade",
                      "Grade Pts",
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
                    const course = courses.find((c) => c.code === r.courseCode);
                    const units = course?.creditUnits ?? 3;
                    const ca = caScores.find(
                      (c) =>
                        c.courseCode === r.courseCode &&
                        c.studentMatric === student?.matricNumber,
                    );
                    return (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                        data-ocid={`result-slip.item.${idx + 1}`}
                      >
                        <td className="px-4 py-3 text-sm font-mono text-blue-600">
                          {r.courseCode}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {course?.title ?? r.courseCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {units}
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
                          {r.point.toFixed(1)}
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
                        data-ocid="result-slip.empty_state"
                      >
                        No results for this semester.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {semResults.length > 0 && (
              <div className="px-6 py-5 border-t bg-slate-50 space-y-4">
                {/* GPA row */}
                <div className="flex flex-wrap gap-8 justify-end">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Semester GPA
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {gpa.toFixed(2)}
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
                    <Badge
                      className={`mt-1 text-sm font-bold border ${
                        degreeClassColor[classOfDegree] ??
                        "text-slate-700 bg-slate-50 border-slate-200"
                      }`}
                    >
                      {classOfDegree}
                    </Badge>
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
      </div>
    </div>
  );
}
