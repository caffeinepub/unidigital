import { Download, Printer } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { classifyDegree } from "../../contexts/ResultProcessingContext";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
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

function getAcademicStatus(cgpa: number): string {
  if (cgpa >= 1.5) return "Good Standing";
  if (cgpa >= 1.0) return "Probation";
  return "Dismissed";
}

export function AcademicTranscript({ userEmail, userName }: Props) {
  const { examResults } = useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const caScores = getLocalCAScores();

  // Find student
  const student =
    students.find((s) => s.email === userEmail) ||
    students.find((s) => s.name === userName) ||
    students[0];

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400">
        No student record found.
      </div>
    );
  }

  // Build credit map
  const creditMap: Record<string, number> = {};
  for (const c of courses) {
    creditMap[c.code] = c.creditUnits;
  }

  // Build CA score map for this student
  const caMap: Record<string, number> = {};
  for (const ca of caScores) {
    if (ca.studentMatric === student.matricNumber) {
      caMap[ca.courseCode] = ca.totalCA;
    }
  }

  // Get published results for this student
  const published = examResults.filter(
    (r) => r.studentMatric === student.matricNumber && r.status === "published",
  );

  // Group by semester
  const semesterMap: Record<string, typeof published> = {};
  for (const r of published) {
    if (!semesterMap[r.semester]) semesterMap[r.semester] = [];
    semesterMap[r.semester].push(r);
  }
  const sortedSemesters = Object.keys(semesterMap).sort();

  // Compute per-semester and cumulative GPA
  let cumulativePoints = 0;
  let cumulativeUnits = 0;

  const semesterStats = sortedSemesters.map((sem) => {
    const results = semesterMap[sem];
    let semPoints = 0;
    let semUnits = 0;
    for (const r of results) {
      const units = creditMap[r.courseCode] ?? 3;
      semPoints += r.point * units;
      semUnits += units;
    }
    const semGPA =
      semUnits === 0 ? 0 : Math.round((semPoints / semUnits) * 100) / 100;
    cumulativePoints += semPoints;
    cumulativeUnits += semUnits;
    const cumCGPA =
      cumulativeUnits === 0
        ? 0
        : Math.round((cumulativePoints / cumulativeUnits) * 100) / 100;
    return {
      semester: sem,
      courseCount: results.length,
      creditUnits: semUnits,
      semGPA,
      cumCGPA,
    };
  });

  const overallCGPA =
    cumulativeUnits === 0
      ? 0
      : Math.round((cumulativePoints / cumulativeUnits) * 100) / 100;
  const totalCreditUnits = cumulativeUnits;

  const handleDownloadCSV = () => {
    const rows: string[][] = [
      ["OFFICIAL ACADEMIC TRANSCRIPT"],
      [`Student: ${student.name}`, `Matric: ${student.matricNumber}`],
      [`Department: ${student.department}`],
      [],
      [
        "Semester",
        "Course Code",
        "Course Title",
        "Credit Units",
        "CA Score",
        "Exam Score",
        "Total",
        "Grade",
        "Grade Points",
        "Remark",
      ],
    ];
    for (const sem of sortedSemesters) {
      for (const r of semesterMap[sem]) {
        const course = courses.find((c) => c.code === r.courseCode);
        const units = creditMap[r.courseCode] ?? 3;
        const caScore = caMap[r.courseCode] ?? r.totalScore - r.examScore;
        rows.push([
          sem,
          r.courseCode,
          course?.title ?? "",
          String(units),
          String(caScore),
          String(r.examScore),
          String(r.totalScore),
          r.grade,
          String(r.point),
          r.remark,
        ]);
      }
    }
    rows.push([]);
    rows.push([
      `Overall CGPA: ${overallCGPA.toFixed(2)}`,
      `Class: ${classifyDegree(overallCGPA)}`,
      `Total Credit Units: ${totalCreditUnits}`,
    ]);
    downloadCSV(`transcript-${student.matricNumber}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button
          variant="outline"
          onClick={() => window.print()}
          data-ocid="transcript.print_button"
        >
          <Printer size={16} className="mr-2" /> Print
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadCSV}
          data-ocid="transcript.download_button"
        >
          <Download size={16} className="mr-2" /> Download CSV
        </Button>
      </div>

      {/* Transcript Document */}
      <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto shadow-sm print:shadow-none print:border-0">
        {/* University Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">
            Federal University of Technology
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            PMB 1001, University City &bull; www.fut.edu.ng
          </p>
          <div className="mt-4 inline-block">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-1">
              Official Academic Transcript
            </h2>
          </div>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm border rounded p-4 bg-slate-50">
          <div className="space-y-1.5">
            <div>
              <span className="font-semibold text-slate-700">Name: </span>
              <span>{student.name}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">
                Matric Number:{" "}
              </span>
              <span className="font-mono">{student.matricNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Department: </span>
              <span>{student.department}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div>
              <span className="font-semibold text-slate-700">Programme: </span>
              <span>B.Tech / B.Sc</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Level: </span>
              <span>{student.level}L</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">
                Date Issued:{" "}
              </span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* CGPA Progression Table */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
            CGPA Progression Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {[
                    "Semester",
                    "Courses",
                    "Credit Units",
                    "Semester GPA",
                    "Cumulative CGPA",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold text-slate-600 border text-xs uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semesterStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-slate-400 text-sm"
                    >
                      No published results yet.
                    </td>
                  </tr>
                )}
                {semesterStats.map((s) => (
                  <tr key={s.semester} className="hover:bg-slate-50">
                    <td className="px-3 py-2 border text-sm">{s.semester}</td>
                    <td className="px-3 py-2 border text-center">
                      {s.courseCount}
                    </td>
                    <td className="px-3 py-2 border text-center">
                      {s.creditUnits}
                    </td>
                    <td className="px-3 py-2 border text-center font-medium">
                      {s.semGPA.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border text-center font-bold text-blue-700">
                      {s.cumCGPA.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Course Listing */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">
            Complete Academic Record
          </h3>
          {sortedSemesters.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-6 border rounded">
              No published results found.
            </p>
          )}
          {sortedSemesters.map((sem) => (
            <div key={sem} className="mb-5">
              <div className="bg-slate-800 text-white px-4 py-2 font-semibold text-sm">
                {sem}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Course Code",
                        "Title",
                        "Units",
                        "CA",
                        "Exam",
                        "Total",
                        "Grade",
                        "Points",
                        "Remark",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-2 text-left font-semibold text-slate-600 border"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {semesterMap[sem].map((r) => {
                      const course = courses.find(
                        (c) => c.code === r.courseCode,
                      );
                      const units = creditMap[r.courseCode] ?? 3;
                      const caScore =
                        caMap[r.courseCode] ?? r.totalScore - r.examScore;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-2 py-2 border font-mono text-blue-700">
                            {r.courseCode}
                          </td>
                          <td className="px-2 py-2 border">
                            {course?.title ?? ""}
                          </td>
                          <td className="px-2 py-2 border text-center">
                            {units}
                          </td>
                          <td className="px-2 py-2 border text-center">
                            {caScore}
                          </td>
                          <td className="px-2 py-2 border text-center">
                            {r.examScore}
                          </td>
                          <td className="px-2 py-2 border text-center font-semibold">
                            {r.totalScore}
                          </td>
                          <td className="px-2 py-2 border text-center font-bold">
                            <span
                              className={
                                r.grade === "F"
                                  ? "text-red-600"
                                  : "text-green-700"
                              }
                            >
                              {r.grade}
                            </span>
                          </td>
                          <td className="px-2 py-2 border text-center">
                            {r.point}
                          </td>
                          <td className="px-2 py-2 border">
                            <span
                              className={
                                r.grade === "F"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
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
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="border-2 rounded-lg p-5 bg-blue-50 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Overall CGPA
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {overallCGPA.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Class of Degree
              </p>
              <p className="text-lg font-bold text-slate-800">
                {classifyDegree(overallCGPA)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Total Credit Units
              </p>
              <p className="text-3xl font-bold text-slate-700">
                {totalCreditUnits}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Badge
              className={
                getAcademicStatus(overallCGPA) === "Good Standing"
                  ? "bg-green-100 text-green-700 border-0"
                  : getAcademicStatus(overallCGPA) === "Probation"
                    ? "bg-amber-100 text-amber-700 border-0"
                    : "bg-red-100 text-red-700 border-0"
              }
            >
              Academic Status: {getAcademicStatus(overallCGPA)}
            </Badge>
          </div>
        </div>

        {/* Signature Block */}
        <div className="grid grid-cols-3 gap-8 mt-8 text-sm">
          <div>
            <div className="border-b-2 border-slate-400 mb-2 h-10" />
            <p className="font-semibold text-slate-700">Registrar</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Signature &amp; Date
            </p>
          </div>
          <div>
            <div className="border-b-2 border-slate-400 mb-2 h-10" />
            <p className="font-semibold text-slate-700">Date</p>
            <p className="text-xs text-slate-400 mt-0.5">DD/MM/YYYY</p>
          </div>
          <div>
            <div className="border-2 border-dashed border-slate-400 h-20 rounded flex items-center justify-center">
              <span className="text-slate-400 text-xs font-medium">
                Official Seal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
