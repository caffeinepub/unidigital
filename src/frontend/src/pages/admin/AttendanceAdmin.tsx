import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  getLocalCourses,
  getLocalRegistrations,
  getLocalStudentAttendance,
  getLocalStudents,
} from "../../utils/sampleData";

export function AttendanceAdmin() {
  const [attendance] = useState(getLocalStudentAttendance());
  const [students] = useState(getLocalStudents());
  const [courses] = useState(getLocalCourses());
  const [registrations] = useState(getLocalRegistrations());

  // Per student per course summary
  const summaries: {
    matric: string;
    name: string;
    course: string;
    courseTitle: string;
    total: number;
    present: number;
    pct: number;
  }[] = [];

  for (const reg of registrations) {
    const records = attendance.filter(
      (a) =>
        a.studentMatric === reg.studentMatric &&
        a.courseCode === reg.courseCode,
    );
    const total = records.length;
    const present = records.filter((a) => a.status !== "absent").length;
    const pct = total === 0 ? 0 : Math.round((present / total) * 100);
    const student = students.find((s) => s.matricNumber === reg.studentMatric);
    const course = courses.find((c) => c.code === reg.courseCode);
    summaries.push({
      matric: reg.studentMatric,
      name: student?.name ?? reg.studentMatric,
      course: reg.courseCode,
      courseTitle: course?.title ?? reg.courseCode,
      total,
      present,
      pct,
    });
  }

  const flagged = summaries.filter((s) => s.total > 0 && s.pct < 75);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Attendance Reports</h1>

      {flagged.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-700">
              ⚠️ Students Below 75% Attendance ({flagged.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flagged.map((s, i) => (
                    <TableRow
                      key={`${s.matric}-${s.course}`}
                      data-ocid={`attendance.row.${i + 1}`}
                    >
                      <TableCell>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.matric}</p>
                      </TableCell>
                      <TableCell className="text-sm">{s.courseTitle}</TableCell>
                      <TableCell className="text-sm">
                        {s.present}/{s.total}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700 border-0">
                          {s.pct}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="attendance.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-400 py-8"
                      data-ocid="attendance.empty_state"
                    >
                      No attendance data.
                    </TableCell>
                  </TableRow>
                ) : (
                  summaries.map((s, i) => (
                    <TableRow
                      key={`${s.matric}-${s.course}-${i}`}
                      data-ocid={`attendance.item.${i + 1}`}
                    >
                      <TableCell>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.matric}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{s.courseTitle}</p>
                        <p className="text-xs text-slate-500">{s.course}</p>
                      </TableCell>
                      <TableCell className="text-sm">{s.total}</TableCell>
                      <TableCell className="text-sm">{s.present}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.pct} className="h-2 w-16" />
                          <Badge
                            className={`border-0 text-xs ${
                              s.pct >= 75
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {s.pct}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
