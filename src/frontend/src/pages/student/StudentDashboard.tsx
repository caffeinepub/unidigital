import { Award, Bell, BookOpen, DollarSign, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { GatedRoute } from "../../components/GatedRoute";
import { StatCard } from "../../components/StatCard";
import { ExamTaking } from "../../components/cbt/ExamTaking";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { type Exam, useCBT } from "../../contexts/CBTContext";
import {
  computeGPA,
  getLocalCourses,
  getLocalInvoices,
  getLocalMemos,
  getLocalResults,
  getLocalStudents,
} from "../../utils/sampleData";
import { AcademicCalendar } from "../shared/AcademicCalendar";
import { AnnouncementView } from "../shared/AnnouncementView";
import { CommunicationCenter } from "../shared/CommunicationCenter";
import { CourseCatalog } from "../shared/CourseCatalog";
import { AcademicProgression } from "./AcademicProgression";
import { AcademicStatusStudent } from "./AcademicStatusStudent";
import { AcademicTranscript } from "./AcademicTranscript";
import { Announcements } from "./Announcements";
import { ClearanceLetterStudent } from "./ClearanceLetterStudent";
import { CourseHistory } from "./CourseHistory";
import { StudentCourseMaterials } from "./CourseMaterials";
import { CourseRegistration } from "./CourseRegistration";
import { Deferment } from "./Deferment";
import { DepartmentTransfer } from "./DepartmentTransfer";
import { DisciplinaryRecordStudent } from "./DisciplinaryRecordStudent";
import { DocumentRequests } from "./DocumentRequests";
import { ExamSchedule } from "./ExamSchedule";
import { FeeClearance } from "./FeeClearance";
import { FeePayment } from "./FeePayment";
import { GPASummary } from "./GPASummary";
import { GraduationStatus } from "./GraduationStatus";
import { GraduationTracker } from "./GraduationTracker";
import { HostelApplication } from "./HostelApplication";
import { MyCertificates } from "./MyCertificates";
import { PaymentHistory } from "./PaymentHistory";
import { ResultSlip } from "./ResultSlip";
import { ScholarshipApplication } from "./ScholarshipApplication";
import { StudentAcademicRecord } from "./StudentAcademicRecord";
import { StudentAssignments } from "./StudentAssignments";
import { StudentAttendance } from "./StudentAttendance";
import { StudentComplaints } from "./StudentComplaints";
import { StudentFees } from "./StudentFees";
import { StudentLibrary } from "./StudentLibrary";
import { StudentRegistrationStatus } from "./StudentRegistrationStatus";
import { StudentTimetable } from "./StudentTimetable";
import { TranscriptRequest } from "./TranscriptRequest";

type Page =
  | "dashboard"
  | "courses"
  | "results"
  | "fees"
  | "assignments"
  | "exams"
  | "notices"
  | "profile"
  | "registration"
  | "timetable"
  | "attendance"
  | "documents"
  | "hostel"
  | "library"
  | "academic-calendar"
  | "exam-schedule"
  | "announcements"
  | "result-slip"
  | "gpa-summary"
  | "academic-status-student"
  | "graduation-status"
  | "progression"
  | "academic-transcript"
  | "academic-record"
  | "course-materials"
  | "course-history"
  | "payment-history"
  | "complaints"
  | "clearance-letter-student"
  | "disciplinary-record"
  | "reg-status"
  | "fee-payment"
  | "fee-clearance"
  | "transcript-request"
  | "scholarship-application"
  | "department-transfer"
  | "deferment"
  | "course-catalog"
  | "announcements-view"
  | "communication-center"
  | "my-certificates"
  | "graduation-tracker";

interface StudentDashboardProps {
  activePage: Page;
  userEmail: string;
  userName: string;
}

const gradeColor: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-100 text-red-700",
  F: "bg-red-200 text-red-800",
};

export function StudentDashboard({
  activePage,
  userEmail,
  userName,
}: StudentDashboardProps) {
  const [student, setStudent] = useState<
    ReturnType<typeof getLocalStudents>[0] | null
  >(null);
  const [courses, setCourses] = useState(getLocalCourses());
  const [results, setResults] = useState(getLocalResults());
  const [invoices, setInvoices] = useState(getLocalInvoices());
  const [memos, setMemos] = useState(getLocalMemos());
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  const { exams, submissions } = useCBT();

  // biome-ignore lint/correctness/useExhaustiveDependencies: activePage is intentional refresh trigger
  useEffect(() => {
    const students = getLocalStudents();
    const found = students.find((s) => s.email === userEmail) || students[0];
    setStudent(found);
    setCourses(getLocalCourses());
    setResults(getLocalResults());
    setInvoices(getLocalInvoices());
    setMemos(getLocalMemos());
    setActiveExam(null);
  }, [activePage, userEmail]);

  const myResults = student
    ? results.filter((r) => r.studentMatric === student.matricNumber)
    : [];
  const myCourses = student
    ? courses.filter((c) => c.department === student.department)
    : [];
  const myInvoice = student
    ? invoices.find((i) => i.studentMatric === student.matricNumber)
    : null;
  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );
  const gpa = computeGPA(myResults, creditMap);

  const activeExams = exams.filter((e) => e.status === "active");
  const mySubmissions = submissions.filter(
    (s) => s.studentId === (student?.matricNumber ?? ""),
  );

  const studentId = student?.matricNumber ?? "STUDENT001";
  const studentName = student?.name ?? userName;

  if (activePage === "dashboard")
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">
            Welcome back, {student?.name || userName}!
          </h1>
          <p className="text-blue-100 mt-1">
            {student?.department} &bull; {student?.level}00 Level &bull;{" "}
            {student?.matricNumber}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered Courses"
            value={myCourses.length}
            icon={<BookOpen size={22} />}
            color="blue"
          />
          <StatCard
            title="Semester GPA"
            value={gpa.toFixed(2)}
            icon={<Award size={22} />}
            color="green"
          />
          <StatCard
            title="Fee Status"
            value={
              myInvoice
                ? myInvoice.paid >= myInvoice.amount
                  ? "Cleared"
                  : "Owing"
                : "No Invoice"
            }
            icon={<DollarSign size={22} />}
            color={
              myInvoice && myInvoice.paid >= myInvoice.amount ? "green" : "red"
            }
          />
          <StatCard
            title="Active Exams"
            value={activeExams.length}
            icon={<Bell size={22} />}
            color="amber"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {myCourses.slice(0, 4).map((c) => (
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
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              {myResults.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{r.courseCode}</p>
                    <p className="text-xs text-slate-500">{r.semester}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.score}%</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${gradeColor[r.grade]}`}
                    >
                      {r.grade}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{c.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {c.code} &bull; {c.department}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{c.semester}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    {c.creditUnits} units
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Lecturer ID: {c.lecturerId}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

  if (activePage === "results")
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">
            Academic Results
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-blue-500">Current GPA</p>
            <p className="text-2xl font-bold text-blue-600">{gpa.toFixed(2)}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Course",
                      "Course Code",
                      "Score",
                      "Grade",
                      "Grade Points",
                      "Semester",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myResults.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm">
                        {courses.find((c) => c.code === r.courseCode)?.title ||
                          r.courseCode}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {r.courseCode}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {r.score}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${gradeColor[r.grade]}`}
                        >
                          {r.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {r.gradePoint}.0
                      </td>
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
      </div>
    );

  if (activePage === "fees") return <StudentFees invoice={myInvoice} />;

  if (activePage === "assignments")
    return (
      <StudentAssignments
        studentMatric={studentId}
        studentName={studentName}
        courseCodes={myCourses.map((c) => c.code)}
      />
    );

  if (activePage === "exams") {
    if (activeExam) {
      return (
        <ExamTaking
          exam={activeExam}
          studentId={studentId}
          studentName={studentName}
          onExit={() => setActiveExam(null)}
        />
      );
    }
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">CBT Exams</h1>

        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Available Exams
          </h2>
          {activeExams.length === 0 ? (
            <Card>
              <CardContent
                className="p-8 text-center text-slate-400"
                data-ocid="exams.empty_state"
              >
                No active exams at this time.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {activeExams.map((exam, i) => (
                <Card key={exam.id} data-ocid={`exams.item.${i + 1}`}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {exam.courseCode}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        Active
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 mb-4">
                      <span>⏱ {exam.duration} minutes</span>
                      <span>📝 {exam.questions.length} questions</span>
                      <span>🎯 {exam.totalMarks} marks</span>
                    </div>
                    {mySubmissions.some((s) => s.examId === exam.id) ? (
                      <div className="text-sm text-green-700 font-medium bg-green-50 rounded px-3 py-2">
                        ✓ Submitted — Score:{" "}
                        {mySubmissions.find((s) => s.examId === exam.id)?.score}{" "}
                        / {exam.totalMarks}
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setActiveExam(exam)}
                        data-ocid={`exams.primary_button.${i + 1}`}
                      >
                        Start Exam
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            My Scores
          </h2>
          {mySubmissions.length === 0 ? (
            <Card>
              <CardContent
                className="p-6 text-center text-slate-400"
                data-ocid="exams.empty_state"
              >
                No exam submissions yet.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {["Exam", "Score", "Percentage", "Date"].map((h) => (
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
                      {mySubmissions.map((s, i) => {
                        const exam = exams.find((e) => e.id === s.examId);
                        const pct = Math.round((s.score / s.totalMarks) * 100);
                        return (
                          <tr
                            key={`${s.examId}-${i}`}
                            className="border-b last:border-0"
                            data-ocid={`exams.item.${i + 1}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium">
                              {exam?.title ?? s.examId}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {s.score} / {s.totalMarks}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${pct >= 70 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                              >
                                {pct}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              {s.submittedAt.toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (activePage === "notices")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Notices & Memos</h1>
        {memos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-slate-400">
              No notices at this time.
            </CardContent>
          </Card>
        )}
        {memos.map(
          (m: {
            id: string;
            title: string;
            body: string;
            senderName: string;
            targetAudience: string;
            createdAt: string;
          }) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-800">{m.title}</h3>
                  <span className="text-xs text-slate-400">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  From: {m.senderName}
                </p>
                <p className="text-sm text-slate-600 mt-3">{m.body}</p>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    );

  if (activePage === "profile")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <Card className="max-w-lg">
          <CardContent className="p-6 space-y-3">
            {student &&
              Object.entries(student).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm text-slate-500 capitalize">
                    {k.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-sm font-medium">{v}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "registration")
    return (
      <GatedRoute pageKey="registration">
        <CourseRegistration studentMatric={studentId} userEmail={userEmail} />
      </GatedRoute>
    );

  if (activePage === "timetable")
    return <StudentTimetable studentMatric={studentId} />;

  if (activePage === "attendance")
    return <StudentAttendance studentMatric={studentId} />;

  if (activePage === "documents")
    return (
      <DocumentRequests studentMatric={studentId} studentName={studentName} />
    );

  if (activePage === "hostel")
    return (
      <GatedRoute pageKey="hostel">
        <HostelApplication
          studentMatric={studentId}
          studentName={studentName}
        />
      </GatedRoute>
    );

  if (activePage === "library")
    return (
      <GatedRoute pageKey="library">
        <StudentLibrary studentMatric={studentId} />
      </GatedRoute>
    );
  if (activePage === "academic-calendar")
    return <AcademicCalendar isAdmin={false} />;
  if (activePage === "exam-schedule")
    return <ExamSchedule userEmail={userEmail} />;
  if (activePage === "announcements") return <Announcements />;
  if (activePage === "result-slip")
    return (
      <GatedRoute pageKey="result-slip">
        <ResultSlip userEmail={userEmail} userName={userName} />
      </GatedRoute>
    );
  if (activePage === "gpa-summary") return <GPASummary userEmail={userEmail} />;
  if (activePage === "academic-status-student")
    return <AcademicStatusStudent userEmail={userEmail} />;
  if (activePage === "graduation-status")
    return <GraduationStatus userEmail={userEmail} />;
  if (activePage === "progression")
    return <AcademicProgression userEmail={userEmail} />;
  if (activePage === "academic-transcript")
    return <AcademicTranscript userEmail={userEmail} userName={userName} />;
  if (activePage === "academic-record")
    return <StudentAcademicRecord userEmail={userEmail} userName={userName} />;
  if (activePage === "course-materials")
    return <StudentCourseMaterials userEmail={userEmail} />;
  if (activePage === "course-history")
    return <CourseHistory userEmail={userEmail} />;
  if (activePage === "payment-history")
    return <PaymentHistory userName={userName} />;
  if (activePage === "complaints") return <StudentComplaints />;
  if (activePage === "clearance-letter-student")
    return <ClearanceLetterStudent studentName={userName} />;
  if (activePage === "disciplinary-record")
    return <DisciplinaryRecordStudent userEmail={userEmail} />;
  if (activePage === "reg-status")
    return <StudentRegistrationStatus studentMatric={studentId} />;
  // New v22 modules
  if (activePage === "fee-payment") return <FeePayment />;
  if (activePage === "fee-clearance") return <FeeClearance />;
  if (activePage === "transcript-request")
    return <TranscriptRequest userEmail={userEmail} userName={userName} />;
  if (activePage === "scholarship-application")
    return <ScholarshipApplication />;
  if (activePage === "department-transfer")
    return <DepartmentTransfer userEmail={userEmail} userName={userName} />;
  if (activePage === "deferment")
    return <Deferment userEmail={userEmail} userName={userName} />;
  if (activePage === "course-catalog") return <CourseCatalog />;
  if (activePage === "announcements-view")
    return <AnnouncementView role={"student" as never} />;
  if (activePage === "communication-center") return <CommunicationCenter />;
  if (activePage === "graduation-tracker")
    return <GraduationTracker userEmail={userEmail} userRole="student" />;
  if (activePage === "my-certificates")
    return (
      <GatedRoute pageKey="my-certificates">
        <MyCertificates userName={userName} userEmail={userEmail} />
      </GatedRoute>
    );
  return null;
}
