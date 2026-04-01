import { Award, BookOpen, TrendingUp, Users } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

export function DepartmentAnalytics() {
  const { examResults } = useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();

  // Build credit map
  const creditMap: Record<string, number> = {};
  for (const c of courses) {
    creditMap[c.code] = c.creditUnits;
  }

  // Published results only
  const published = examResults.filter((r) => r.status === "published");

  // Overall stats
  const totalStudents = students.length;
  const totalResults = published.length;
  const passed = published.filter((r) => r.grade !== "F").length;
  const passRate =
    totalResults === 0 ? 0 : Math.round((passed / totalResults) * 100);
  const avgScore =
    totalResults === 0
      ? 0
      : Math.round(
          published.reduce((s, r) => s + r.totalScore, 0) / totalResults,
        );

  // Per-course breakdown
  const courseMap: Record<
    string,
    {
      code: string;
      title: string;
      enrolled: number;
      passed: number;
      totalScore: number;
    }
  > = {};
  for (const r of published) {
    if (!courseMap[r.courseCode]) {
      const course = courses.find((c) => c.code === r.courseCode);
      courseMap[r.courseCode] = {
        code: r.courseCode,
        title: course?.title ?? "",
        enrolled: 0,
        passed: 0,
        totalScore: 0,
      };
    }
    courseMap[r.courseCode].enrolled++;
    courseMap[r.courseCode].totalScore += r.totalScore;
    if (r.grade !== "F") courseMap[r.courseCode].passed++;
  }
  const courseBreakdown = Object.values(courseMap);

  // Compute per-student CGPA
  const studentCGPAAccum: Record<string, { points: number; units: number }> =
    {};
  for (const r of published) {
    const units = creditMap[r.courseCode] ?? 3;
    if (!studentCGPAAccum[r.studentMatric])
      studentCGPAAccum[r.studentMatric] = { points: 0, units: 0 };
    studentCGPAAccum[r.studentMatric].points += r.point * units;
    studentCGPAAccum[r.studentMatric].units += units;
  }
  const studentCGPAList = Object.entries(studentCGPAAccum).map(
    ([matric, data]) => ({
      matric,
      cgpa:
        data.units === 0
          ? 0
          : Math.round((data.points / data.units) * 100) / 100,
    }),
  );

  // GPA distribution
  const gpaDistribution = [
    {
      label: "First Class (≥4.5)",
      count: studentCGPAList.filter((s) => s.cgpa >= 4.5).length,
      color: "bg-blue-500",
    },
    {
      label: "2nd Class Upper (3.5–4.49)",
      count: studentCGPAList.filter((s) => s.cgpa >= 3.5 && s.cgpa < 4.5)
        .length,
      color: "bg-green-500",
    },
    {
      label: "2nd Class Lower (2.5–3.49)",
      count: studentCGPAList.filter((s) => s.cgpa >= 2.5 && s.cgpa < 3.5)
        .length,
      color: "bg-amber-500",
    },
    {
      label: "Third Class (1.5–2.49)",
      count: studentCGPAList.filter((s) => s.cgpa >= 1.5 && s.cgpa < 2.5)
        .length,
      color: "bg-orange-500",
    },
    {
      label: "Pass (1.0–1.49)",
      count: studentCGPAList.filter((s) => s.cgpa >= 1.0 && s.cgpa < 1.5)
        .length,
      color: "bg-purple-500",
    },
    {
      label: "Fail (<1.0)",
      count: studentCGPAList.filter((s) => s.cgpa > 0 && s.cgpa < 1.0).length,
      color: "bg-red-500",
    },
  ];
  const totalWithCGPA = studentCGPAList.length;

  // Top 5 performers
  const top5 = [...studentCGPAList]
    .sort((a, b) => b.cgpa - a.cgpa)
    .slice(0, 5)
    .map((s) => {
      const stu = students.find((st) => st.matricNumber === s.matric);
      return { ...s, name: stu?.name ?? s.matric, dept: stu?.department ?? "" };
    });

  // Carryover students
  const carryoverStudents = students.filter((student) => {
    const fails = published.filter(
      (r) => r.studentMatric === student.matricNumber && r.grade === "F",
    );
    return fails.length > 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Department Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Academic performance overview across all courses and students.
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={String(totalStudents)}
          icon={<Users size={22} />}
          color="blue"
        />
        <StatCard
          title="Total Results"
          value={String(totalResults)}
          icon={<BookOpen size={22} />}
          color="purple"
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={<TrendingUp size={22} />}
          color="green"
        />
        <StatCard
          title="Average Score"
          value={String(avgScore)}
          icon={<Award size={22} />}
          color="amber"
        />
      </div>

      {/* Per-Course Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Course Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {courseBreakdown.length === 0 && (
            <p
              className="px-4 py-8 text-center text-slate-400 text-sm"
              data-ocid="analytics.course.empty_state"
            >
              No published results yet.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Course Code",
                    "Title",
                    "Enrolled",
                    "Passed",
                    "Failed",
                    "Pass Rate %",
                    "Avg Score",
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
                {courseBreakdown.map((c, i) => {
                  const failed = c.enrolled - c.passed;
                  const rate =
                    c.enrolled === 0
                      ? 0
                      : Math.round((c.passed / c.enrolled) * 100);
                  const avg =
                    c.enrolled === 0
                      ? 0
                      : Math.round(c.totalScore / c.enrolled);
                  return (
                    <tr
                      key={c.code}
                      className="border-b last:border-0 hover:bg-slate-50"
                      data-ocid={`analytics.course.item.${i + 1}`}
                    >
                      <td className="px-4 py-2 font-mono text-blue-600">
                        {c.code}
                      </td>
                      <td className="px-4 py-2">{c.title}</td>
                      <td className="px-4 py-2 text-center">{c.enrolled}</td>
                      <td className="px-4 py-2 text-center text-green-600">
                        {c.passed}
                      </td>
                      <td className="px-4 py-2 text-center text-red-600">
                        {failed}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={
                            rate >= 70
                              ? "text-green-600 font-semibold"
                              : rate >= 50
                                ? "text-amber-600 font-semibold"
                                : "text-red-600 font-semibold"
                          }
                        >
                          {rate}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">{avg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GPA Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">GPA Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gpaDistribution.map((g) => {
              const pct =
                totalWithCGPA === 0
                  ? 0
                  : Math.round((g.count / totalWithCGPA) * 100);
              return (
                <div key={g.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{g.label}</span>
                    <span className="font-semibold text-slate-600">
                      {g.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${g.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totalWithCGPA === 0 && (
              <p className="text-slate-400 text-sm text-center py-2">
                No data yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {top5.length === 0 && (
              <p
                className="text-slate-400 text-sm text-center py-8 px-4"
                data-ocid="analytics.top.empty_state"
              >
                No published results yet.
              </p>
            )}
            {top5.map((s, i) => (
              <div
                key={s.matric}
                className="flex items-center justify-between px-4 py-3 border-b last:border-0"
                data-ocid={`analytics.top.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.matric} &bull; {s.dept}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-blue-700">
                    {s.cgpa.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {classifyDegree(s.cgpa)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Carryover Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Carryover Students ({carryoverStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {carryoverStudents.length === 0 && (
            <p
              className="px-4 py-8 text-center text-slate-400 text-sm"
              data-ocid="analytics.carryover.empty_state"
            >
              No students with carryovers.
            </p>
          )}
          <div className="divide-y">
            {carryoverStudents.map((s, i) => {
              const fails = published.filter(
                (r) => r.studentMatric === s.matricNumber && r.grade === "F",
              );
              return (
                <div
                  key={s.matricNumber}
                  className="flex items-center justify-between px-4 py-3"
                  data-ocid={`analytics.carryover.item.${i + 1}`}
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.matricNumber} &bull; {s.department}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-0">
                    {fails.length} carryover(s)
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
