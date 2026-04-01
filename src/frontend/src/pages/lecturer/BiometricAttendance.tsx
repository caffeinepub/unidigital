import {
  AlertTriangle,
  CheckCircle,
  Fingerprint,
  UserCheck,
  XCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAttendance(data: AttendanceRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function BiometricAttendance() {
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>(getAttendance);
  const [scanning, setScanning] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const getTodayRecord = (matric: string): AttendanceRecord | undefined =>
    records.find(
      (r) =>
        r.studentMatric === matric &&
        r.courseCode === selectedCourse &&
        r.date === today,
    );

  const markAttendance = (
    matric: string,
    status: "present" | "absent" | "late",
  ) => {
    setScanning(matric);
    setTimeout(() => {
      const existing = records.filter(
        (r) =>
          !(
            r.studentMatric === matric &&
            r.courseCode === selectedCourse &&
            r.date === today
          ),
      );
      const newRecord: AttendanceRecord = {
        studentMatric: matric,
        courseCode: selectedCourse,
        date: today,
        status,
        timestamp: new Date().toLocaleTimeString(),
      };
      const updated = [...existing, newRecord];
      setRecords(updated);
      saveAttendance(updated);
      setScanning(null);
      toast.success(
        `${students.find((s) => s.matricNumber === matric)?.name}: ${status}`,
      );
    }, 600);
  };

  const getAttendanceRate = (matric: string) => {
    const studentRecords = records.filter(
      (r) => r.studentMatric === matric && r.courseCode === selectedCourse,
    );
    if (studentRecords.length === 0) return null;
    const present = studentRecords.filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    return Math.round((present / studentRecords.length) * 100);
  };

  const courseStudents = selectedCourse
    ? students.filter(
        (s) =>
          s.department ===
          courses.find((c) => c.code === selectedCourse)?.department,
      )
    : [];

  const todayPresent = courseStudents.filter(
    (s) => getTodayRecord(s.matricNumber)?.status === "present",
  ).length;
  const todayAbsent = courseStudents.filter(
    (s) => getTodayRecord(s.matricNumber)?.status === "absent",
  ).length;
  const todayLate = courseStudents.filter(
    (s) => getTodayRecord(s.matricNumber)?.status === "late",
  ).length;
  const notMarked = courseStudents.filter(
    (s) => !getTodayRecord(s.matricNumber),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Biometric Attendance
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Simulated biometric check-in. Mark student attendance by course and
          session.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-72">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger data-ocid="bio.select">
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
        {selectedCourse && (
          <Badge className="bg-slate-100 text-slate-700">Today: {today}</Badge>
        )}
      </div>

      {selectedCourse && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-600">
                  {todayPresent}
                </p>
                <p className="text-xs text-slate-500">Present</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-red-600">{todayAbsent}</p>
                <p className="text-xs text-slate-500">Absent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{todayLate}</p>
                <p className="text-xs text-slate-500">Late</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-slate-500">{notMarked}</p>
                <p className="text-xs text-slate-500">Unmarked</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Fingerprint size={18} className="text-blue-500" />
                Student Attendance Register – {selectedCourse}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Matric",
                        "Name",
                        "Today's Status",
                        "Time",
                        "Overall Rate",
                        "Action",
                      ].map((h) => (
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
                    {courseStudents.map((s, i) => {
                      const record = getTodayRecord(s.matricNumber);
                      const rate = getAttendanceRate(s.matricNumber);
                      const isScanning = scanning === s.matricNumber;
                      return (
                        <tr
                          key={s.matricNumber}
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`bio.item.${i + 1}`}
                        >
                          <td className="px-4 py-3 text-xs font-mono text-blue-600">
                            {s.matricNumber}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {s.name}
                          </td>
                          <td className="px-4 py-3">
                            {record ? (
                              <Badge
                                className={
                                  record.status === "present"
                                    ? "bg-green-100 text-green-700"
                                    : record.status === "late"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                                }
                              >
                                {record.status === "present" && (
                                  <CheckCircle size={11} className="mr-1" />
                                )}
                                {record.status === "absent" && (
                                  <XCircle size={11} className="mr-1" />
                                )}
                                {record.status === "late" && (
                                  <AlertTriangle size={11} className="mr-1" />
                                )}
                                {record.status}
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-500">
                                Unmarked
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {record?.timestamp ?? "–"}
                          </td>
                          <td className="px-4 py-3">
                            {rate !== null ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${rate >= 75 ? "bg-green-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-medium ${rate >= 75 ? "text-green-600" : rate >= 50 ? "text-amber-600" : "text-red-600"}`}
                                >
                                  {rate}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No history
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isScanning ? (
                              <div className="flex items-center gap-1 text-blue-600 text-xs">
                                <Fingerprint
                                  size={14}
                                  className="animate-pulse"
                                />{" "}
                                Scanning...
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() =>
                                    markAttendance(s.matricNumber, "present")
                                  }
                                  data-ocid={`bio.primary_button.${i + 1}`}
                                >
                                  <UserCheck size={12} className="mr-1" />{" "}
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-amber-300 text-amber-600"
                                  onClick={() =>
                                    markAttendance(s.matricNumber, "late")
                                  }
                                  data-ocid={`bio.secondary_button.${i + 1}`}
                                >
                                  Late
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-300 text-red-600"
                                  onClick={() =>
                                    markAttendance(s.matricNumber, "absent")
                                  }
                                  data-ocid={`bio.delete_button.${i + 1}`}
                                >
                                  Absent
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="bio.empty_state"
          >
            <Fingerprint size={40} className="mx-auto mb-3 opacity-30" />
            Select a course to begin taking attendance.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
