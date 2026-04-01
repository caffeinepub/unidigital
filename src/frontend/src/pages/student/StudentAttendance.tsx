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
  getLocalCourses,
  getLocalRegistrations,
  getLocalStudentAttendance,
} from "../../utils/sampleData";

const SEMESTER = "2023/2024 First";

interface Props {
  studentMatric: string;
}

export function StudentAttendance({ studentMatric }: Props) {
  const [attendance] = useState(getLocalStudentAttendance());
  const [courses] = useState(getLocalCourses());
  const registrations = getLocalRegistrations().filter(
    (r) => r.studentMatric === studentMatric && r.semester === SEMESTER,
  );
  const myCourseCodes = registrations.map((r) => r.courseCode);

  const myAttendance = attendance.filter(
    (a) => a.studentMatric === studentMatric,
  );

  const summary = myCourseCodes.map((code) => {
    const records = myAttendance.filter((a) => a.courseCode === code);
    const total = records.length;
    const present = records.filter(
      (a) => a.status === "present" || a.status === "late",
    ).length;
    const absent = records.filter((a) => a.status === "absent").length;
    const pct = total === 0 ? 0 : Math.round((present / total) * 100);
    const course = courses.find((c) => c.code === code);
    return {
      code,
      title: course?.title ?? code,
      total,
      present,
      absent,
      pct,
      records,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>

      {summary.length === 0 ? (
        <Card>
          <CardContent
            className="p-8 text-center text-slate-400"
            data-ocid="attendance.empty_state"
          >
            No attendance records found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {summary.map((s, i) => (
            <Card key={s.code} data-ocid={`attendance.item.${i + 1}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  {s.title}
                </CardTitle>
                <p className="text-xs text-slate-500">{s.code}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Attendance Rate
                  </span>
                  <Badge
                    className={`border-0 ${
                      s.pct >= 75
                        ? "bg-green-100 text-green-700"
                        : s.pct >= 60
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.pct}%
                  </Badge>
                </div>
                <Progress value={s.pct} className="h-2" />
                {s.pct < 75 && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠ Below 75% threshold — at risk
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-lg font-bold text-slate-700">
                      {s.total}
                    </p>
                    <p className="text-xs text-slate-500">Sessions</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-lg font-bold text-green-700">
                      {s.present}
                    </p>
                    <p className="text-xs text-green-600">Present</p>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-lg font-bold text-red-700">{s.absent}</p>
                    <p className="text-xs text-red-600">Absent</p>
                  </div>
                </div>
                {s.records.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-slate-600 mb-1">
                      Session Breakdown
                    </p>
                    <div className="space-y-1">
                      {s.records.map((r) => (
                        <div
                          key={r.id}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-slate-500">{r.date}</span>
                          <Badge
                            className={`text-xs border-0 ${
                              r.status === "present"
                                ? "bg-green-100 text-green-700"
                                : r.status === "late"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
