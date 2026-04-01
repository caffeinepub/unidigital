import { CheckCircle, CloudOff, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  type StudentAttendanceRecord,
  getLocalCourses,
  getLocalRegistrations,
  getLocalStudentAttendance,
  getLocalStudents,
  saveLocalStudentAttendance,
} from "../../utils/sampleData";

const OFFLINE_QUEUE_KEY = "offlineAttendanceQueue";

function getOfflineQueue(): {
  courseCode: string;
  date: string;
  marks: Record<string, string>;
  lecturerId: string;
}[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(
  queue: {
    courseCode: string;
    date: string;
    marks: Record<string, string>;
    lecturerId: string;
  }[],
) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

interface Props {
  lecturerId: string;
}

export function LecturerAttendance({ lecturerId }: Props) {
  const [courses] = useState(
    getLocalCourses().filter((c) => c.lecturerId === lecturerId),
  );
  const [students] = useState(getLocalStudents());
  const [attendance, setAttendance] = useState<StudentAttendanceRecord[]>(
    getLocalStudentAttendance(),
  );
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [marks, setMarks] = useState<
    Record<string, "present" | "absent" | "late">
  >({});
  const [offlineQueue, setOfflineQueue] = useState(getOfflineQueue);
  const [offlineSaved, setOfflineSaved] = useState(false);

  const registrations = getLocalRegistrations();

  const enrolledMatrics = selectedCourse
    ? registrations
        .filter((r) => r.courseCode === selectedCourse)
        .map((r) => r.studentMatric)
    : [];

  const enrolledStudents = students.filter((s) =>
    enrolledMatrics.includes(s.matricNumber),
  );

  const alreadyMarked = selectedCourse
    ? attendance.filter(
        (a) => a.courseCode === selectedCourse && a.date === date,
      )
    : [];

  const sessionExists = alreadyMarked.length > 0;

  const initMarks = () => {
    const m: Record<string, "present" | "absent" | "late"> = {};
    for (const s of enrolledStudents) {
      const existing = alreadyMarked.find(
        (a) => a.studentMatric === s.matricNumber,
      );
      m[s.matricNumber] = existing?.status ?? "present";
    }
    setMarks(m);
  };

  const handleCourseChange = (code: string) => {
    setSelectedCourse(code);
    setMarks({});
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    setMarks({});
  };

  const submit = () => {
    // Remove existing records for this course+date, then add new
    const filtered = attendance.filter(
      (a) => !(a.courseCode === selectedCourse && a.date === date),
    );
    const newRecords: StudentAttendanceRecord[] = enrolledStudents.map((s) => ({
      id: `ATT-${Date.now()}-${s.matricNumber}`,
      courseCode: selectedCourse,
      date,
      studentMatric: s.matricNumber,
      status: marks[s.matricNumber] ?? "present",
      markedByLecturerId: lecturerId,
    }));
    const updated = [...filtered, ...newRecords];
    setAttendance(updated);
    saveLocalStudentAttendance(updated);
    setMarks({});
  };

  const markOffline = () => {
    if (Object.keys(marks).length === 0 || !selectedCourse) return;
    const queue = getOfflineQueue();
    const entry = {
      courseCode: selectedCourse,
      date,
      marks: { ...marks },
      lecturerId,
    };
    // Replace any existing entry for same course+date
    const filtered = queue.filter(
      (q) => !(q.courseCode === selectedCourse && q.date === date),
    );
    const updated = [...filtered, entry];
    saveOfflineQueue(updated);
    setOfflineQueue(updated);
    setOfflineSaved(true);
    setTimeout(() => setOfflineSaved(false), 2500);
  };

  // History: sessions for selected course
  const courseAttendance = selectedCourse
    ? attendance.filter((a) => a.courseCode === selectedCourse)
    : [];
  const sessions = [...new Set(courseAttendance.map((a) => a.date))]
    .sort()
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Attendance Management
        </h1>
        {offlineQueue.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <CloudOff size={15} className="text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">
              {offlineQueue.length} queued offline
            </span>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Course</Label>
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger data-ocid="attendance.select">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            data-ocid="attendance.input"
          />
        </div>
      </div>

      {selectedCourse && (
        <Tabs defaultValue="mark">
          <TabsList>
            <TabsTrigger value="mark" data-ocid="attendance.tab">
              Mark Attendance
            </TabsTrigger>
            <TabsTrigger value="history" data-ocid="attendance.tab">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mark" className="mt-4">
            {enrolledStudents.length === 0 ? (
              <Card>
                <CardContent
                  className="p-8 text-center text-slate-400"
                  data-ocid="attendance.empty_state"
                >
                  No students enrolled in this course.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Students — {selectedCourse} ({date})
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={initMarks}
                      data-ocid="attendance.secondary_button"
                    >
                      Load / Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={markOffline}
                      disabled={Object.keys(marks).length === 0}
                      data-ocid="attendance.secondary_button"
                    >
                      <CloudOff size={13} className="mr-1" /> Mark Offline
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={submit}
                      disabled={Object.keys(marks).length === 0}
                      data-ocid="attendance.submit_button"
                    >
                      Save Attendance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {offlineSaved && (
                    <div
                      className="px-4 py-2 bg-amber-50 border-b border-amber-100"
                      data-ocid="attendance.success_state"
                    >
                      <p className="text-xs text-amber-700">
                        ✓ Saved to offline queue. Will sync when reconnected.
                      </p>
                    </div>
                  )}
                  <Table data-ocid="attendance.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Matric</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledStudents.map((s, i) => (
                        <TableRow
                          key={s.matricNumber}
                          data-ocid={`attendance.row.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {s.matricNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {(["present", "absent", "late"] as const).map(
                                (status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() =>
                                      setMarks((m) => ({
                                        ...m,
                                        [s.matricNumber]: status,
                                      }))
                                    }
                                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                                      marks[s.matricNumber] === status
                                        ? status === "present"
                                          ? "bg-green-600 text-white border-green-600"
                                          : status === "absent"
                                            ? "bg-red-600 text-white border-red-600"
                                            : "bg-amber-500 text-white border-amber-500"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ),
                              )}
                              {marks[s.matricNumber] === undefined && (
                                <span className="text-xs text-slate-400">
                                  not set
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {sessionExists && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                      <p className="text-xs text-amber-700">
                        ⚠ Attendance already marked for this date. Saving will
                        overwrite existing records.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-400">
                  No attendance sessions recorded yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((sessionDate, si) => {
                  const recs = courseAttendance.filter(
                    (a) => a.date === sessionDate,
                  );
                  const present = recs.filter(
                    (a) => a.status !== "absent",
                  ).length;
                  return (
                    <Card key={sessionDate}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-semibold">
                            {sessionDate}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={12} /> {present} present
                            </span>
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle size={12} /> {recs.length - present}{" "}
                              absent
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {recs.map((rec) => {
                            const student = students.find(
                              (s) => s.matricNumber === rec.studentMatric,
                            );
                            return (
                              <Badge
                                key={rec.id}
                                className={`border-0 text-xs ${
                                  rec.status === "present"
                                    ? "bg-green-100 text-green-700"
                                    : rec.status === "late"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                                data-ocid={`attendance.item.${si + 1}`}
                              >
                                {student?.name ?? rec.studentMatric} —{" "}
                                {rec.status}
                              </Badge>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!selectedCourse && (
        <Card>
          <CardContent
            className="p-8 text-center text-slate-400"
            data-ocid="attendance.empty_state"
          >
            Select a course above to mark or view attendance.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
