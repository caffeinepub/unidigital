import { Award, BarChart3, TrendingUp, Users } from "lucide-react";
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

export function AnalyticsV2() {
  const { examResults, computeStudentCGPA } = useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );

  const published = examResults.filter((r) => r.status === "published");
  const passRate = published.length
    ? Math.round(
        (published.filter((r) => r.grade !== "F").length / published.length) *
          100,
      )
    : 0;

  const studentCGPAs = students.map((s) => ({
    ...s,
    cgpa: computeStudentCGPA(s.matricNumber, creditMap),
  }));
  const withResults = studentCGPAs.filter((s) => s.cgpa > 0);
  const avgCGPA = withResults.length
    ? Math.round(
        (withResults.reduce((a, b) => a + b.cgpa, 0) / withResults.length) *
          100,
      ) / 100
    : 0;
  const firstClassCount = withResults.filter((s) => s.cgpa >= 4.5).length;

  // GPA distribution buckets
  const buckets = [
    { label: "5.0 (A)", min: 4.5, max: 5.0, color: "bg-green-500" },
    { label: "3.5–4.5", min: 3.5, max: 4.49, color: "bg-blue-500" },
    { label: "2.5–3.5", min: 2.5, max: 3.49, color: "bg-amber-500" },
    { label: "1.5–2.5", min: 1.5, max: 2.49, color: "bg-orange-500" },
    { label: "< 1.5", min: 0, max: 1.49, color: "bg-red-500" },
  ];

  // Course failure rates
  const courseStats = courses
    .map((c) => {
      const courseResults = published.filter((r) => r.courseCode === c.code);
      const total = courseResults.length;
      const failed = courseResults.filter((r) => r.grade === "F").length;
      const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;
      return { code: c.code, title: c.title, total, failed, failRate };
    })
    .filter((c) => c.total > 0);

  // Department performance
  const deptStats = [...new Set(students.map((s) => s.department))].map(
    (dept) => {
      const deptStudents = studentCGPAs.filter(
        (s) => s.department === dept && s.cgpa > 0,
      );
      const avg = deptStudents.length
        ? Math.round(
            (deptStudents.reduce((a, b) => a + b.cgpa, 0) /
              deptStudents.length) *
              100,
          ) / 100
        : 0;
      return { dept, count: deptStudents.length, avg };
    },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Analytics & Reports
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Comprehensive academic performance analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Published Results",
            value: published.length,
            icon: <Award size={20} />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Average CGPA",
            value: avgCGPA.toFixed(2),
            icon: <TrendingUp size={20} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Pass Rate",
            value: `${passRate}%`,
            icon: <BarChart3 size={20} />,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "First Class",
            value: firstClassCount,
            icon: <Users size={20} />,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GPA Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">GPA Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {buckets.map((b) => {
              const count = withResults.filter(
                (s) => s.cgpa >= b.min && s.cgpa <= b.max,
              ).length;
              const pct =
                withResults.length > 0
                  ? Math.round((count / withResults.length) * 100)
                  : 0;
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{b.label}</span>
                    <span className="font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {withResults.length === 0 && (
              <p className="text-slate-400 text-sm">
                No published results yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Departmental Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Departmental Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deptStats.map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 truncate">{d.dept}</span>
                  <span className="font-semibold">
                    Avg CGPA: {d.avg.toFixed(2)}
                  </span>
                </div>
                <Progress value={(d.avg / 5) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Students by CGPA</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                {["Rank", "Name", "Matric", "Dept", "CGPA", "Class"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {studentCGPAs
                .filter((s) => s.cgpa > 0)
                .sort((a, b) => b.cgpa - a.cgpa)
                .slice(0, 10)
                .map((s, i) => (
                  <tr
                    key={s.matricNumber}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`analytics.item.${i + 1}`}
                  >
                    <td className="px-4 py-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-2 text-xs font-mono text-blue-600">
                      {s.matricNumber}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-500">
                      {s.department}
                    </td>
                    <td className="px-4 py-2 text-sm font-bold">
                      {s.cgpa.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge className="bg-blue-50 text-blue-700 text-xs">
                        {classifyDegree(s.cgpa)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              {studentCGPAs.filter((s) => s.cgpa > 0).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-400"
                    data-ocid="analytics.empty_state"
                  >
                    No results published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Course Failure Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Failure Rates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {courseStats.length === 0 && (
            <p className="p-6 text-center text-slate-400">
              No published results yet.
            </p>
          )}
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                {["Course", "Title", "Students", "Failed", "Fail Rate"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {courseStats.map((c, i) => (
                <tr
                  key={c.code}
                  className={`border-b last:border-0 ${c.failRate > 30 ? "bg-red-50" : ""}`}
                  data-ocid={`analytics.course.item.${i + 1}`}
                >
                  <td className="px-4 py-2 text-sm font-mono font-semibold">
                    {c.code}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {c.title}
                  </td>
                  <td className="px-4 py-2 text-sm">{c.total}</td>
                  <td className="px-4 py-2 text-sm">{c.failed}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`font-bold text-sm ${c.failRate > 30 ? "text-red-600" : "text-slate-700"}`}
                    >
                      {c.failRate}%
                    </span>
                    {c.failRate > 30 && (
                      <span className="ml-2 text-xs text-red-500">High</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
