import { Award, BookOpen } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

interface Props {
  userEmail: string;
}

const gradeColor: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-200 text-red-700",
  F: "bg-red-100 text-red-800",
};

export function CourseHistory({ userEmail }: Props) {
  const { examResults } = useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();

  const student = students.find((s) => s.email === userEmail) ?? students[0];
  const matric = student?.matricNumber ?? "";

  const myResults = examResults
    .filter((r) => r.studentMatric === matric && r.status === "published")
    .sort((a, b) => a.semester.localeCompare(b.semester));

  // Group by semester
  const bySemester: Record<string, typeof myResults> = {};
  for (const r of myResults) {
    bySemester[r.semester] = bySemester[r.semester] ?? [];
    bySemester[r.semester].push(r);
  }

  const totalCredits = myResults.reduce((sum, r) => {
    const c = courses.find((c) => c.code === r.courseCode);
    return r.grade !== "F" ? sum + (c?.creditUnits ?? 3) : sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Course History</h1>
        <p className="text-slate-500 text-sm mt-1">
          All registered courses and grades across every semester.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {myResults.length}
            </p>
            <p className="text-sm text-slate-500">Courses Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalCredits}</p>
            <p className="text-sm text-slate-500">Credits Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {Object.keys(bySemester).length}
            </p>
            <p className="text-sm text-slate-500">Semesters</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(bySemester).length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="history.empty_state"
          >
            No published results found. Results will appear here once published
            by your institution.
          </CardContent>
        </Card>
      )}

      {Object.entries(bySemester).map(([semester, results], si) => {
        const semCredits = results.reduce((sum, r) => {
          const c = courses.find((c) => c.code === r.courseCode);
          return r.grade !== "F" ? sum + (c?.creditUnits ?? 3) : sum;
        }, 0);
        const semGradePoints = results.reduce((sum, r) => {
          const c = courses.find((c) => c.code === r.courseCode);
          return sum + r.point * (c?.creditUnits ?? 3);
        }, 0);
        const semGPA =
          semCredits > 0
            ? (
                semGradePoints /
                results.reduce(
                  (s, r) =>
                    s +
                    (courses.find((c) => c.code === r.courseCode)
                      ?.creditUnits ?? 3),
                  0,
                )
              ).toFixed(2)
            : "0.00";

        return (
          <Card key={semester} data-ocid={`history.item.${si + 1}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-500" />
                  {semester}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {results.length} courses &bull; {semCredits} credits
                  </span>
                  <Badge className="bg-blue-100 text-blue-700">
                    <Award size={12} className="mr-1" /> GPA: {semGPA}
                  </Badge>
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
                        "Title",
                        "Credit Units",
                        "Score",
                        "Grade",
                        "Remark",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, ri) => {
                      const course = courses.find(
                        (c) => c.code === r.courseCode,
                      );
                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`history.row.${ri + 1}`}
                        >
                          <td className="px-4 py-2 text-xs font-mono text-blue-600">
                            {r.courseCode}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {course?.title ?? r.courseCode}
                          </td>
                          <td className="px-4 py-2 text-sm text-center">
                            {course?.creditUnits ?? 3}
                          </td>
                          <td className="px-4 py-2 text-sm font-bold">
                            {r.totalScore}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              className={
                                gradeColor[r.grade] ??
                                "bg-slate-100 text-slate-600"
                              }
                            >
                              {r.grade}
                            </Badge>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs font-medium ${r.remark === "Pass" ? "text-green-600" : "text-red-600"}`}
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
