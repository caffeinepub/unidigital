import { Award, TrendingUp } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

interface Props {
  userEmail: string;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-200 text-red-700",
  F: "bg-red-100 text-red-800",
};

export function GPASummary({ userEmail }: Props) {
  const { examResults, computeStudentCGPA, getCarryovers } =
    useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const student = students.find((s) => s.email === userEmail) ?? students[0];
  const matric = student?.matricNumber ?? "";
  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );

  const myResults = examResults.filter(
    (r) => r.studentMatric === matric && r.status === "published",
  );
  const carryovers = getCarryovers(matric);
  const cgpa = computeStudentCGPA(matric, creditMap);
  const degreeClass = cgpa > 0 ? classifyDegree(cgpa) : "N/A";

  // Group by semester
  const semesters = [...new Set(myResults.map((r) => r.semester))];
  const semesterBreakdown = semesters.map((sem) => {
    const semResults = myResults.filter((r) => r.semester === sem);
    const credits = semResults.reduce(
      (s, r) => s + (creditMap[r.courseCode] ?? 3),
      0,
    );
    const points = semResults.reduce(
      (s, r) => s + r.point * (creditMap[r.courseCode] ?? 3),
      0,
    );
    const gpa = credits > 0 ? Math.round((points / credits) * 100) / 100 : 0;
    return { sem, count: semResults.length, credits, gpa };
  });

  const degreeClassColor =
    cgpa >= 4.5
      ? "bg-green-100 text-green-700"
      : cgpa >= 3.5
        ? "bg-blue-100 text-blue-700"
        : cgpa >= 2.5
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          GPA / CGPA Summary
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your academic performance overview.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Current CGPA", value: cgpa.toFixed(2), sub: "/5.00" },
          { label: "Class of Degree", value: degreeClass, badge: true },
          {
            label: "Published Results",
            value: myResults.length,
            sub: " courses",
          },
          { label: "Carryovers", value: carryovers.length, sub: " course(s)" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              {s.badge ? (
                <Badge className={`mt-1 ${degreeClassColor}`}>{s.value}</Badge>
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {s.value}
                  <span className="text-sm text-slate-400">{s.sub}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CGPA Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CGPA Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cumulative CGPA</span>
            <span className="font-bold">{cgpa.toFixed(2)} / 5.00</span>
          </div>
          <Progress value={(cgpa / 5) * 100} className="h-3" />
          <p className="text-xs text-slate-400">
            Based on {myResults.length} published results across{" "}
            {semesters.length} semester(s)
          </p>
        </CardContent>
      </Card>

      {/* Semester breakdown */}
      {semesterBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Semester Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {["Semester", "Courses", "Credits Earned", "GPA"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semesterBreakdown.map((s, i) => (
                  <tr
                    key={s.sem}
                    className="border-b last:border-0"
                    data-ocid={`gpa.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-sm">{s.sem}</td>
                    <td className="px-4 py-3 text-sm">{s.count}</td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {s.credits}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold text-sm ${s.gpa >= 3.5 ? "text-green-600" : s.gpa >= 2.5 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {s.gpa.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Carryovers */}
      {carryovers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">
              Carryover Courses ({carryovers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-red-50 border-b">
                <tr>
                  {["Course Code", "Semester", "Total Score", "Grade"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-red-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {carryovers.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0"
                    data-ocid={`gpa.carryover.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-red-600">
                      {r.courseCode}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.semester}</td>
                    <td className="px-4 py-3 text-sm">{r.totalScore}/100</td>
                    <td className="px-4 py-3">
                      <Badge className={gradeColors[r.grade] ?? ""}>
                        {r.grade}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {myResults.length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="gpa.empty_state"
          >
            No published results yet. Results will appear here once published by
            the admin.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
