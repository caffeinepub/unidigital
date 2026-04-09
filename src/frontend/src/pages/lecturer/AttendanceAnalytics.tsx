import {
  AlertTriangle,
  BarChart3,
  Bell,
  Download,
  Fingerprint,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
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
import { Progress } from "../../components/ui/progress";
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
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

interface AttendanceRecord {
  studentMatric: string;
  courseCode: string;
  date: string;
  status: "present" | "absent" | "late";
  timestamp: string;
}

const LS_KEY = "unidigital_biometric_attendance";

function getAttendance(): AttendanceRecord[] {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function generateSeedAttendance(
  courses: { code: string }[],
  students: { matricNumber: string; department: string }[],
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates = [
    "2024-03-01",
    "2024-03-04",
    "2024-03-06",
    "2024-03-08",
    "2024-03-11",
    "2024-03-13",
    "2024-03-15",
    "2024-03-18",
    "2024-03-20",
    "2024-03-22",
  ];
  for (const c of courses) {
    const deptStudents = students.filter(
      (s) => s.department === "Computer Science",
    );
    for (const s of deptStudents) {
      for (const date of dates) {
        const r = Math.random();
        records.push({
          studentMatric: s.matricNumber,
          courseCode: c.code,
          date,
          status: r > 0.8 ? "absent" : r > 0.7 ? "late" : "present",
          timestamp: "09:00",
        });
      }
    }
  }
  return records;
}

export function AttendanceAnalytics() {
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code ?? "");
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const stored = getAttendance();
    return stored.length > 0
      ? stored
      : generateSeedAttendance(courses, students);
  });
  const [alertSent, setAlertSent] = useState<Set<string>>(new Set());

  const courseRecords = records.filter((r) => r.courseCode === selectedCourse);
  const courseStudents = students.filter(
    (s) =>
      s.department ===
      (courses.find((c) => c.code === selectedCourse)?.department ?? ""),
  );

  // Per-student summary
  const studentSummary = courseStudents.map((s) => {
    const sr = courseRecords.filter((r) => r.studentMatric === s.matricNumber);
    const total = sr.length;
    const present = sr.filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    const absent = sr.filter((r) => r.status === "absent").length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { ...s, total, present, absent, pct, atRisk: pct < 75 && total > 0 };
  });

  const absenteesToday = studentSummary.filter((s) => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = courseRecords.find(
      (r) => r.studentMatric === s.matricNumber && r.date === today,
    );
    return todayRecord?.status === "absent";
  });

  const allDates = Array.from(new Set(courseRecords.map((r) => r.date))).sort();

  // Daily attendance rate trend
  const dailyTrend = allDates.map((date) => {
    const dayRecords = courseRecords.filter((r) => r.date === date);
    const presentCount = dayRecords.filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    const pct =
      dayRecords.length > 0
        ? Math.round((presentCount / dayRecords.length) * 100)
        : 0;
    return { date, pct, presentCount, total: dayRecords.length };
  });

  const avgRate =
    dailyTrend.length > 0
      ? Math.round(
          dailyTrend.reduce((s, d) => s + d.pct, 0) / dailyTrend.length,
        )
      : 0;

  const sendAbsenteeAlert = (matric: string, name: string) => {
    setAlertSent((prev) => new Set(prev).add(matric));
    toast.success(`Absence alert sent to ${name}`);
  };

  const handleBulkCSVImport = () => {
    const mockImport: AttendanceRecord[] = courseStudents
      .slice(0, 3)
      .map((s) => ({
        studentMatric: s.matricNumber,
        courseCode: selectedCourse,
        date: new Date().toISOString().split("T")[0],
        status: "present",
        timestamp: "09:00",
      }));
    const updated = [...records, ...mockImport];
    setRecords(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    toast.success("Attendance imported from CSV (3 records added)");
  };

  const exportReport = () => {
    const lines = ["Student Matric,Name,Present,Absent,Rate%"];
    for (const s of studentSummary) {
      lines.push(
        `${s.matricNumber},${s.name},${s.present},${s.absent},${s.pct}%`,
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${selectedCourse}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance report exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Attendance Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Full attendance analytics, absentee alerts, and bulk import.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkCSVImport}
            data-ocid="attendance_analytics.import_button"
          >
            <Upload size={14} className="mr-1" /> Import CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportReport}
            data-ocid="attendance_analytics.export_button"
          >
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-72">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger data-ocid="attendance_analytics.select">
              <SelectValue placeholder="Select course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} – {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{avgRate}%</p>
                <p className="text-xs text-muted-foreground">
                  Avg. Attendance Rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-red-500">
                  {studentSummary.filter((s) => s.atRisk).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  At-Risk Students
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {allDates.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {courseStudents.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Enrolled Students
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="report">
            <TabsList className="mb-4">
              <TabsTrigger value="report" data-ocid="attendance_analytics.tab">
                <Users size={14} className="mr-1" /> Per-Student Report
              </TabsTrigger>
              <TabsTrigger value="trend" data-ocid="attendance_analytics.tab">
                <BarChart3 size={14} className="mr-1" /> Trend / Patterns
              </TabsTrigger>
              <TabsTrigger value="alerts" data-ocid="attendance_analytics.tab">
                <Bell size={14} className="mr-1" /> Absentee Alerts
              </TabsTrigger>
            </TabsList>

            {/* Per-Student Report */}
            <TabsContent value="report">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                      <thead className="bg-muted border-b">
                        <tr>
                          {[
                            "Matric",
                            "Name",
                            "Sessions",
                            "Present",
                            "Absent",
                            "Rate",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studentSummary.map((s, i) => (
                          <tr
                            key={s.matricNumber}
                            className="border-b last:border-0 hover:bg-muted/40"
                            data-ocid={`attendance_analytics.row.${i + 1}`}
                          >
                            <td className="px-4 py-3 text-xs font-mono text-primary">
                              {s.matricNumber}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {s.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {s.total}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">
                              {s.present}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-red-500 font-medium">
                              {s.absent}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${s.pct >= 75 ? "bg-green-500" : s.pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{ width: `${s.pct}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-medium ${s.pct >= 75 ? "text-green-600" : s.pct >= 60 ? "text-amber-600" : "text-red-600"}`}
                                >
                                  {s.pct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {s.atRisk ? (
                                <Badge className="bg-red-100 text-red-700 border-0 text-xs flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> At Risk
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                  Good
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trend */}
            <TabsContent value="trend" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 size={15} /> Attendance Rate Over Time —{" "}
                    {selectedCourse}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dailyTrend.length === 0 ? (
                    <p
                      className="text-muted-foreground text-sm text-center py-6"
                      data-ocid="attendance_analytics.empty_state"
                    >
                      No data available for this course.
                    </p>
                  ) : (
                    dailyTrend.map((d) => (
                      <div key={d.date} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                          {d.date}
                        </span>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${d.pct >= 75 ? "bg-green-500" : d.pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium w-10 text-right flex-shrink-0 ${d.pct >= 75 ? "text-green-600" : d.pct >= 60 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {d.pct}%
                        </span>
                        {d.pct < 75 ? (
                          <TrendingDown
                            size={14}
                            className="text-red-500 flex-shrink-0"
                          />
                        ) : (
                          <TrendingUp
                            size={14}
                            className="text-green-500 flex-shrink-0"
                          />
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Highest Attendance Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyTrend
                      .sort((a, b) => b.pct - a.pct)
                      .slice(0, 3)
                      .map((d) => (
                        <div
                          key={d.date}
                          className="flex justify-between text-sm py-1 border-b last:border-0"
                        >
                          <span className="text-muted-foreground">
                            {d.date}
                          </span>
                          <span className="text-green-600 font-semibold">
                            {d.pct}%
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Lowest Attendance Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyTrend
                      .sort((a, b) => a.pct - b.pct)
                      .slice(0, 3)
                      .map((d) => (
                        <div
                          key={d.date}
                          className="flex justify-between text-sm py-1 border-b last:border-0"
                        >
                          <span className="text-muted-foreground">
                            {d.date}
                          </span>
                          <span className="text-red-600 font-semibold">
                            {d.pct}%
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Absentee Alerts */}
            <TabsContent value="alerts" className="space-y-3">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 flex-shrink-0"
                />
                <p className="text-sm text-amber-800">
                  {studentSummary.filter((s) => s.atRisk).length} student(s) are
                  below the 75% attendance threshold. Send alerts to notify
                  them.
                </p>
              </div>

              {studentSummary
                .filter((s) => s.atRisk)
                .map((s, i) => (
                  <Card
                    key={s.matricNumber}
                    className="border-red-200"
                    data-ocid={`attendance_analytics.alert.${i + 1}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.matricNumber}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-red-600 font-medium">
                            {s.pct}% attendance
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {s.absent} absences of {s.total} sessions
                          </span>
                        </div>
                      </div>
                      {alertSent.has(s.matricNumber) ? (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          ✓ Alert Sent
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-700"
                          onClick={() =>
                            sendAbsenteeAlert(s.matricNumber, s.name)
                          }
                          data-ocid={`attendance_analytics.alert_button.${i + 1}`}
                        >
                          <Bell size={13} className="mr-1" /> Send Alert
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

              {studentSummary.filter((s) => s.atRisk).length === 0 && (
                <Card>
                  <CardContent
                    className="p-8 text-center text-muted-foreground"
                    data-ocid="attendance_analytics.empty_state"
                  >
                    <Fingerprint
                      size={32}
                      className="mx-auto mb-2 opacity-30"
                    />
                    All students are above the 75% threshold. No alerts needed.
                  </CardContent>
                </Card>
              )}

              {/* Today's absentees */}
              {absenteesToday.length > 0 && (
                <Card className="border-red-100">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                      <AlertTriangle size={14} /> Today's Absentees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {absenteesToday.map((s, i) => (
                      <div
                        key={s.matricNumber}
                        className="flex items-center justify-between text-sm"
                        data-ocid={`attendance_analytics.absent.${i + 1}`}
                      >
                        <span>
                          {s.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({s.matricNumber})
                          </span>
                        </span>
                        {alertSent.has(s.matricNumber) ? (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            Alert Sent
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs text-amber-600"
                            onClick={() =>
                              sendAbsenteeAlert(s.matricNumber, s.name)
                            }
                          >
                            <Bell size={11} className="mr-0.5" /> Alert
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-12 text-center text-muted-foreground"
            data-ocid="attendance_analytics.empty_state"
          >
            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
            Select a course to view attendance analytics.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
