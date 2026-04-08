import { Award, BookOpen, PlusCircle, Users } from "lucide-react";
import { useState } from "react";
import { StatCard } from "../../components/StatCard";
import { LecturerAssignments } from "../../components/assignments/LecturerAssignments";
import { LecturerCBT } from "../../components/cbt/LecturerCBT";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
  getLocalCourses,
  getLocalMemos,
  getLocalResults,
  getLocalStudents,
  gradeFromScore,
} from "../../utils/sampleData";
import { AcademicCalendar } from "../shared/AcademicCalendar";
import { StaffDirectory } from "../shared/StaffDirectory";
import { StudentRecordsList } from "../shared/StudentRecordsList";
import { AppraisalSelf } from "./AppraisalSelf";
import { BiometricAttendance } from "./BiometricAttendance";
import { CAEntry } from "./CAEntry";
import { CombinedResults } from "./CombinedResults";
import { CourseMaterials } from "./CourseMaterials";
import { ExamScheduleLecturer } from "./ExamScheduleLecturer";
import { LecturerAttendance } from "./LecturerAttendance";
import { LecturerTimetable } from "./LecturerTimetable";
import { ResultApprovalLecturer } from "./ResultApprovalLecturer";
import { ResultEntry } from "./ResultEntry";
import { ScoreBulkUpload } from "./ScoreBulkUpload";
import { TrainingRegistration } from "./TrainingRegistration";

type Page =
  | "dashboard"
  | "courses"
  | "results"
  | "assignments"
  | "cbt"
  | "students"
  | "memos"
  | "timetable"
  | "attendance-mgmt"
  | "academic-calendar"
  | "exam-schedule-lecturer"
  | "ca-entry"
  | "result-entry"
  | "result-approval-lecturer"
  | "appraisal-self"
  | "combined-results"
  | "student-records"
  | "course-materials-lecturer"
  | "biometric-attendance"
  | "score-bulk-upload"
  | "training-registration"
  | "staff-directory";

interface Props {
  activePage: Page;
  staffId?: string;
}

export function LecturerDashboard({ activePage }: Props) {
  const [courses, _setCourses] = useState(getLocalCourses());
  const [students, _setStudents] = useState(getLocalStudents());
  const [results, _setResults] = useState(getLocalResults());
  const [memos, _setMemos] = useState(getLocalMemos());

  const myCourses = courses;
  const myCourseCodes = courses.map((c) => c.code);

  const [resultDialog, setResultDialog] = useState(false);
  const [resultForm, setResultForm] = useState({
    studentMatric: "",
    courseCode: "",
    score: 0,
    semester: "2023/2024 First",
  });

  // Keep gradeFromScore import used
  const _gradeFromScore = gradeFromScore;

  if (activePage === "cbt") return <LecturerCBT courseCodes={myCourseCodes} />;

  if (activePage === "dashboard")
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Lecturer Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your courses and student records
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="My Courses"
            value={myCourses.length}
            icon={<BookOpen size={22} />}
            color="blue"
          />
          <StatCard
            title="Total Students"
            value={students.length}
            icon={<Users size={22} />}
            color="green"
          />
          <StatCard
            title="Results Entered"
            value={
              results.filter((r) =>
                myCourses.some((c) => c.code === r.courseCode),
              ).length
            }
            icon={<Award size={22} />}
            color="purple"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {myCourses.map((c) => (
              <div
                key={c.code}
                className="flex justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-slate-500">
                    {c.code} &bull; {c.creditUnits} units
                  </p>
                </div>
                <Badge variant="outline">{c.department}</Badge>
              </div>
            ))}
            {myCourses.length === 0 && (
              <p className="text-sm text-slate-400">No courses assigned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "courses")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
        <div className="grid md:grid-cols-2 gap-3">
          {myCourses.map((c) => (
            <Card key={c.code}>
              <CardContent className="p-4">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-slate-500">
                  {c.code} &bull; {c.department} &bull; {c.creditUnits} units
                </p>
                <p className="text-xs text-slate-400 mt-1">{c.semester}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

  if (activePage === "results")
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Results Entry</h1>
          <Button
            onClick={() => setResultDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-ocid="results.open_modal_button"
          >
            <PlusCircle size={16} className="mr-2" /> Enter Result
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Student Matric",
                      "Course",
                      "Score",
                      "Grade",
                      "GP",
                      "Semester",
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
                  {results
                    .filter((r) =>
                      myCourses.some((c) => c.code === r.courseCode),
                    )
                    .map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm font-mono">
                          {r.studentMatric}
                        </td>
                        <td className="px-4 py-3 text-sm">{r.courseCode}</td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {r.score}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${{ A: "bg-green-100 text-green-700", B: "bg-blue-100 text-blue-700", C: "bg-amber-100 text-amber-700", D: "bg-orange-100 text-orange-700", E: "bg-red-100 text-red-700", F: "bg-red-200 text-red-800" }[r.grade]}`}
                          >
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{r.gradePoint}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {r.semester}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={resultDialog} onOpenChange={setResultDialog}>
          <DialogContent data-ocid="results.dialog">
            <DialogHeader>
              <DialogTitle>Enter Student Result</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Student Matric Number</Label>
                <Select
                  value={resultForm.studentMatric}
                  onValueChange={(v) =>
                    setResultForm((f) => ({ ...f, studentMatric: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.matricNumber} value={s.matricNumber}>
                        {s.name} ({s.matricNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Course</Label>
                <Select
                  value={resultForm.courseCode}
                  onValueChange={(v) =>
                    setResultForm((f) => ({ ...f, courseCode: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {myCourses.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Score (0-100)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={0}
                  max={100}
                  value={resultForm.score}
                  onChange={(e) =>
                    setResultForm((f) => ({ ...f, score: +e.target.value }))
                  }
                  data-ocid="results.input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setResultDialog(false)}
                data-ocid="results.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                data-ocid="results.submit_button"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "assignments")
    return (
      <LecturerAssignments
        lecturerId="STAFF001"
        courseCodes={myCourses.map((c) => c.code)}
      />
    );

  if (activePage === "students") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {["Matric", "Name", "Dept", "Level", "Email"].map((h) => (
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
                  {students.map((s) => (
                    <tr
                      key={s.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {s.matricNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.department}
                      </td>
                      <td className="px-4 py-3 text-sm">{s.level}L</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activePage === "memos") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Memos</h1>
        {memos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-slate-400">
              No memos.
            </CardContent>
          </Card>
        )}
        {memos.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-5">
              <div className="flex justify-between">
                <h3 className="font-semibold">{m.title}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">{m.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activePage === "timetable")
    return <LecturerTimetable lecturerId="STF001" />;
  if (activePage === "attendance-mgmt")
    return <LecturerAttendance lecturerId="STF001" />;
  if (activePage === "academic-calendar")
    return <AcademicCalendar isAdmin={false} />;
  if (activePage === "exam-schedule-lecturer") return <ExamScheduleLecturer />;
  if (activePage === "ca-entry") return <CAEntry />;
  if (activePage === "result-entry") return <ResultEntry />;
  if (activePage === "result-approval-lecturer")
    return <ResultApprovalLecturer />;
  if (activePage === "appraisal-self") return <AppraisalSelf />;
  if (activePage === "combined-results") return <CombinedResults />;
  if (activePage === "student-records")
    return <StudentRecordsList userRole="lecturer" />;
  if (activePage === "course-materials-lecturer") return <CourseMaterials />;
  if (activePage === "biometric-attendance") return <BiometricAttendance />;
  if (activePage === "score-bulk-upload") return <ScoreBulkUpload />;
  if (activePage === "training-registration") return <TrainingRegistration />;
  if (activePage === "staff-directory") return <StaffDirectory />;

  return null;
}
