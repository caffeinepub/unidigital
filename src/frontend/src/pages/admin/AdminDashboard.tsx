import {
  BookOpen,
  ChevronDown,
  FileText,
  GraduationCap,
  Pencil,
  PlusCircle,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GatedRoute } from "../../components/GatedRoute";
import { StatCard } from "../../components/StatCard";
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
import { Textarea } from "../../components/ui/textarea";
import { initJambStudents } from "../../utils/jambData";
import {
  type AdmissionApplication,
  type CourseRecord,
  type StaffRecord,
  type StudentRecord,
  getLocalAdmissions,
  getLocalCourses,
  getLocalMemos,
  getLocalStaff,
  getLocalStudents,
  saveLocalAdmissions,
  saveLocalCourses,
  saveLocalMemos,
  saveLocalStaff,
  saveLocalStudents,
} from "../../utils/sampleData";
import { AcademicCalendar } from "../shared/AcademicCalendar";
import { AnnouncementView } from "../shared/AnnouncementView";
import { CommunicationCenter } from "../shared/CommunicationCenter";
import { CourseCatalog } from "../shared/CourseCatalog";
import { PassFailureLists } from "../shared/PassFailureLists";
import { PromotionResults } from "../shared/PromotionResults";
import { StaffDirectory } from "../shared/StaffDirectory";
import { StudentProfilePortal } from "../shared/StudentProfilePortal";
import { StudentRecordsList } from "../shared/StudentRecordsList";
import { GraduationTracker } from "../student/GraduationTracker";
import { AIBulkUploadRegistration } from "./AIBulkUploadRegistration";
import { AIDashboard } from "./AIDashboard";
import { AISmartScanRegistration } from "./AISmartScanRegistration";
import { AcademicCalendarAdmin } from "./AcademicCalendarAdmin";
import { AcademicStatus } from "./AcademicStatus";
import { AdminBulkCourseRegistration } from "./AdminBulkCourseRegistration";
import { AdvancedAnalytics } from "./AdvancedAnalytics";
import { AlumniAdmin } from "./AlumniAdmin";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { AnalyticsV2 } from "./AnalyticsV2";
import { AnnouncementsAdmin } from "./AnnouncementsAdmin";
import { AppraisalAdmin } from "./AppraisalAdmin";
import { AttendanceAdmin } from "./AttendanceAdmin";
import { BudgetManagement } from "./BudgetManagement";
import { BulkRegistration } from "./BulkRegistration";
import { CBTAnalytics } from "./CBTAnalytics";
import { CBTResitManager } from "./CBTResitManager";
import { CertificateCourses } from "./CertificateCourses";
import { ClearanceLetter } from "./ClearanceLetter";
import { CombinationCourses } from "./CombinationCourses";
import { ComplaintsAdmin } from "./ComplaintsAdmin";
import { CourseManagement } from "./CourseManagement";
import { DataExportCenter } from "./DataExportCenter";
import { DataImport } from "./DataImport";
import { DefermentManagement } from "./DefermentManagement";
import { DepartmentAnalytics } from "./DepartmentAnalytics";
import { DistanceLearningAdmin } from "./DistanceLearningAdmin";
import { DocumentAdmin } from "./DocumentAdmin";
import { DocumentVerificationPortal } from "./DocumentVerificationPortal";
import { DocumentsScansAdmin } from "./DocumentsScansAdmin";
import { DonationsAdmin } from "./DonationsAdmin";
import { ExamScheduleAdmin } from "./ExamScheduleAdmin";
import { ExaminationManagement } from "./ExaminationManagement";
import { FacultyResults } from "./FacultyResults";
import { FeeManagement } from "./FeeManagement";
import { GradeConfig } from "./GradeConfig";
import { GraduationClearance } from "./GraduationClearance";
import { HostelAdmin } from "./HostelAdmin";
import { HostelAllocationMatrix } from "./HostelAllocationMatrix";
import { HostelRoomInventory } from "./HostelRoomInventory";
import { HostelTransferRequests } from "./HostelTransferRequests";
import { IDCardGenerator } from "./IDCardGenerator";
import { InstitutionSettings } from "./InstitutionSettings";
import { InternalMemoSystem } from "./InternalMemoSystem";
import { JAMBAdmissionPortal } from "./JAMBAdmissionPortal";
import { LibraryAdmin } from "./LibraryAdmin";
import { MalpracticeReports } from "./MalpracticeReports";
import { ManualRegistration } from "./ManualRegistration";
import { NoticeBoard } from "./NoticeBoard";
import { PartTimeStudiesAdmin } from "./PartTimeStudiesAdmin";
import { ProgressionAdmin } from "./ProgressionAdmin";
import { RegistrationAdmin } from "./RegistrationAdmin";
import { RegistrationDocumentArchive } from "./RegistrationDocumentArchive";
import { RegistrationManagementAdmin } from "./RegistrationManagementAdmin";
import { ResultApprovalAdmin } from "./ResultApprovalAdmin";
import { ResultPublication } from "./ResultPublication";
import { ResultSheetAdmin } from "./ResultSheetAdmin";
import { ResultVerificationAdmin } from "./ResultVerificationAdmin";
import { ScholarshipManagement } from "./ScholarshipManagement";
import { ScoreAuditLog } from "./ScoreAuditLog";
import { ScoreSheetResults } from "./ScoreSheetResults";
import { SenateMeetingMinutes } from "./SenateMeetingMinutes";
import { SenatePresentation } from "./SenatePresentation";
import { StaffManagement } from "./StaffManagement";
import { StudentDisciplinaryRecords } from "./StudentDisciplinaryRecords";
import { SystemAdmin } from "./SystemAdmin";
import { TimetableAdmin } from "./TimetableAdmin";
import { TimetableConflictManager } from "./TimetableConflictManager";
import { TranscriptAdmin } from "./TranscriptAdmin";
import { TransferManagement } from "./TransferManagement";

type Page =
  | "dashboard"
  | "students"
  | "courses"
  | "staff"
  | "admissions"
  | "memos"
  | "reports"
  | "registration-admin"
  | "timetable-admin"
  | "attendance-admin"
  | "documents-admin"
  | "hostel-admin"
  | "library-admin"
  | "academic-calendar"
  | "exam-schedule-admin"
  | "announcements-admin"
  | "grade-config"
  | "result-approval-admin"
  | "result-publication"
  | "academic-status"
  | "graduation-clearance"
  | "graduation-tracker"
  | "analytics-v2"
  | "data-import"
  | "ai-dashboard"
  | "progression-admin"
  | "appraisal-admin"
  | "alumni-admin"
  | "documents-scans-admin"
  | "combination-courses"
  | "score-audit-log"
  | "score-sheet-results"
  | "result-sheet-admin"
  | "transcript-management"
  | "dept-analytics"
  | "faculty-results"
  | "senate-presentation"
  | "student-records"
  | "settings"
  | "promotion-results"
  | "pass-fail-lists"
  | "analytics-dashboard"
  | "hostel-room-inventory"
  | "donations-admin"
  | "complaints-admin"
  | "clearance-letter"
  | "staff-directory"
  | "document-verification"
  | "disciplinary-records"
  | "senate-minutes"
  | "internal-memos"
  | "data-export"
  | "hostel-allocation"
  | "hostel-transfers"
  | "timetable-conflicts"
  | "cbt-analytics"
  | "cbt-resit"
  | "registration-management"
  | "manual-registration"
  | "bulk-registration"
  | "ai-scan-registration"
  | "ai-bulk-registration"
  | "bulk-course-registration"
  | "registration-doc-archive"
  | "jamb-portal"
  | "fee-management"
  | "academic-calendar-admin"
  | "course-management"
  | "examination-management"
  | "staff-management"
  | "budget-management"
  | "scholarship-management"
  | "notice-board"
  | "transfer-management"
  | "deferment-management"
  | "result-verification"
  | "advanced-analytics"
  | "system-admin"
  | "course-catalog"
  | "announcement-view"
  | "communication-center-admin"
  | "certificate-courses"
  | "malpractice-reports"
  | "id-cards"
  | "student-profiles"
  | "distance-learning-admin"
  | "part-time-studies-admin";

interface AdminDashboardProps {
  activePage: Page;
}

function blankStudent(): StudentRecord {
  return {
    matricNumber: "",
    name: "",
    email: "",
    level: "100",
    department: "",
  };
}
function blankCourse(): CourseRecord {
  return {
    code: "",
    title: "",
    creditUnits: 3,
    department: "",
    semester: "2023/2024 First",
    lecturerId: "",
  };
}
function blankStaff(): StaffRecord {
  return {
    staffId: "",
    name: "",
    designation: "lecturer",
    email: "",
    department: "",
  };
}

export function AdminDashboard({ activePage }: AdminDashboardProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [memos, setMemos] = useState<
    {
      id: string;
      title: string;
      body: string;
      senderName: string;
      targetAudience: string;
      createdAt: string;
    }[]
  >([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);

  const [studentDialog, setStudentDialog] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentRecord | null>(null);
  const [studentForm, setStudentForm] = useState<StudentRecord>(blankStudent());

  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseRecord | null>(null);
  const [courseForm, setCourseForm] = useState<CourseRecord>(blankCourse());

  const [staffDialog, setStaffDialog] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffRecord | null>(null);
  const [staffForm, setStaffForm] = useState<StaffRecord>(blankStaff());

  const [memoDialog, setMemoDialog] = useState(false);
  const [memoForm, setMemoForm] = useState({
    title: "",
    body: "",
    targetAudience: "all",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: activePage is intentional refresh trigger
  useEffect(() => {
    initJambStudents();
    setStudents(getLocalStudents());
    setCourses(getLocalCourses());
    setStaff(getLocalStaff());
    setMemos(getLocalMemos());
    setAdmissions(getLocalAdmissions());
  }, [activePage]);

  // Students CRUD
  const openAddStudent = () => {
    setEditStudent(null);
    setStudentForm(blankStudent());
    setStudentDialog(true);
  };
  const openEditStudent = (s: StudentRecord) => {
    setEditStudent(s);
    setStudentForm({ ...s });
    setStudentDialog(true);
  };
  const saveStudent = () => {
    let updated: StudentRecord[];
    if (editStudent) {
      updated = students.map((s) =>
        s.matricNumber === editStudent.matricNumber ? studentForm : s,
      );
    } else {
      updated = [...students, studentForm];
    }
    saveLocalStudents(updated);
    setStudents(updated);
    setStudentDialog(false);
  };
  const deleteStudent = (matric: string) => {
    const updated = students.filter((s) => s.matricNumber !== matric);
    saveLocalStudents(updated);
    setStudents(updated);
  };

  // Courses CRUD
  const openAddCourse = () => {
    setEditCourse(null);
    setCourseForm(blankCourse());
    setCourseDialog(true);
  };
  const openEditCourse = (c: CourseRecord) => {
    setEditCourse(c);
    setCourseForm({ ...c });
    setCourseDialog(true);
  };
  const saveCourse = () => {
    let updated: CourseRecord[];
    if (editCourse) {
      updated = courses.map((c) =>
        c.code === editCourse.code ? courseForm : c,
      );
    } else {
      updated = [...courses, courseForm];
    }
    saveLocalCourses(updated);
    setCourses(updated);
    setCourseDialog(false);
  };
  const deleteCourse = (code: string) => {
    const updated = courses.filter((c) => c.code !== code);
    saveLocalCourses(updated);
    setCourses(updated);
  };

  // Staff CRUD
  const openAddStaff = () => {
    setEditStaff(null);
    setStaffForm(blankStaff());
    setStaffDialog(true);
  };
  const openEditStaff = (s: StaffRecord) => {
    setEditStaff(s);
    setStaffForm({ ...s });
    setStaffDialog(true);
  };
  const saveStaffRecord = () => {
    let updated: StaffRecord[];
    if (editStaff) {
      updated = staff.map((s) =>
        s.staffId === editStaff.staffId ? staffForm : s,
      );
    } else {
      updated = [...staff, staffForm];
    }
    saveLocalStaff(updated);
    setStaff(updated);
    setStaffDialog(false);
  };
  const deleteStaff = (id: string) => {
    const updated = staff.filter((s) => s.staffId !== id);
    saveLocalStaff(updated);
    setStaff(updated);
  };

  // Memos
  const saveMemo = () => {
    const newMemo = {
      id: `M${Date.now()}`,
      ...memoForm,
      senderName: "Administrator",
      createdAt: new Date().toISOString(),
    };
    const updated = [newMemo, ...memos];
    saveLocalMemos(updated);
    setMemos(updated);
    setMemoDialog(false);
    setMemoForm({ title: "", body: "", targetAudience: "all" });
  };

  // Admissions
  const updateAdmissionStatus = (
    id: string,
    status: AdmissionApplication["status"],
  ) => {
    const updated = admissions.map((a) => (a.id === id ? { ...a, status } : a));
    saveLocalAdmissions(updated);
    setAdmissions(updated);
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    screening: "bg-blue-100 text-blue-700",
    admitted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (activePage === "dashboard")
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Overview of all university operations
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Students"
            value={students.length}
            icon={<GraduationCap size={22} />}
            color="blue"
          />
          <StatCard
            title="Total Staff"
            value={staff.length}
            icon={<Users size={22} />}
            color="green"
          />
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon={<BookOpen size={22} />}
            color="purple"
          />
          <StatCard
            title="Memos Issued"
            value={memos.length}
            icon={<FileText size={22} />}
            color="amber"
          />
          <StatCard
            title="DL Students"
            value={24}
            icon={<UserCheck size={22} />}
            color="blue"
          />
          <StatCard
            title="PT Students"
            value={18}
            icon={<Users size={22} />}
            color="green"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.slice(0, 5).map((s) => (
                  <div
                    key={s.matricNumber}
                    className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.matricNumber} &bull; {s.department}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {s.level}L
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              {[...new Set(students.map((s) => s.department))].map((dept) => (
                <div
                  key={dept}
                  className="flex justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm">{dept}</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {students.filter((s) => s.department === dept).length}{" "}
                    students
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );

  if (activePage === "students")
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Students</h1>
            <p className="text-slate-500 text-sm">
              {students.length} enrolled students
            </p>
          </div>
          <Button
            onClick={openAddStudent}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> Add Student
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Matric No.",
                      "Name",
                      "Department",
                      "Level",
                      "Email",
                      "Actions",
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
                  {students.map((s) => (
                    <tr
                      key={s.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
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
                      <td className="px-4 py-3">
                        <Badge variant="outline">{s.level}L</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.email}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditStudent(s)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteStudent(s.matricNumber)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={studentDialog} onOpenChange={setStudentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editStudent ? "Edit Student" : "Add New Student"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Matric Number</Label>
                <Input
                  className="mt-1"
                  value={studentForm.matricNumber}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      matricNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  className="mt-1"
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Level</Label>
                <Select
                  value={studentForm.level}
                  onValueChange={(v) =>
                    setStudentForm((f) => ({ ...f, level: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["100", "200", "300", "400", "500"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}L
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Department</Label>
                <Input
                  className="mt-1"
                  value={studentForm.department}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      department: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStudentDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveStudent}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "courses")
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
            <p className="text-slate-500 text-sm">
              {courses.length} registered courses
            </p>
          </div>
          <Button
            onClick={openAddCourse}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> Add Course
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Code",
                      "Title",
                      "Dept",
                      "Credits",
                      "Semester",
                      "Lecturer ID",
                      "Actions",
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
                  {courses.map((c) => (
                    <tr
                      key={c.code}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-600">
                        {c.code}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {c.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {c.department}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {c.creditUnits}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {c.semester}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {c.lecturerId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditCourse(c)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => deleteCourse(c.code)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editCourse ? "Edit Course" : "Add New Course"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Course Code</Label>
                <Input
                  className="mt-1"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Credit Units</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={courseForm.creditUnits}
                  onChange={(e) =>
                    setCourseForm((f) => ({
                      ...f,
                      creditUnits: +e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Course Title</Label>
                <Input
                  className="mt-1"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  className="mt-1"
                  value={courseForm.department}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, department: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Lecturer ID</Label>
                <Input
                  className="mt-1"
                  value={courseForm.lecturerId}
                  onChange={(e) =>
                    setCourseForm((f) => ({ ...f, lecturerId: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Semester</Label>
                <Select
                  value={courseForm.semester}
                  onValueChange={(v) =>
                    setCourseForm((f) => ({ ...f, semester: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023/2024 First">
                      2023/2024 First
                    </SelectItem>
                    <SelectItem value="2023/2024 Second">
                      2023/2024 Second
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCourseDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveCourse}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "staff")
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Staff</h1>
            <p className="text-slate-500 text-sm">
              {staff.length} staff members
            </p>
          </div>
          <Button
            onClick={openAddStaff}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> Add Staff
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Staff ID",
                      "Name",
                      "Designation",
                      "Department",
                      "Email",
                      "Actions",
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
                  {staff.map((s) => (
                    <tr
                      key={s.staffId}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {s.staffId}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="capitalize text-xs">
                          {s.designation}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.email}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditStaff(s)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => deleteStaff(s.staffId)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={staffDialog} onOpenChange={setStaffDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editStaff ? "Edit Staff" : "Add New Staff"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staff ID</Label>
                <Input
                  className="mt-1"
                  value={staffForm.staffId}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, staffId: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  className="mt-1"
                  value={staffForm.name}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={staffForm.email}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Designation</Label>
                <Select
                  value={staffForm.designation}
                  onValueChange={(v) =>
                    setStaffForm((f) => ({ ...f, designation: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["lecturer", "admin", "hr", "bursary", "support"].map(
                      (d) => (
                        <SelectItem key={d} value={d} className="capitalize">
                          {d}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Department</Label>
                <Input
                  className="mt-1"
                  value={staffForm.department}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, department: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStaffDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveStaffRecord}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "admissions")
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admissions</h1>
          <p className="text-slate-500 text-sm">
            {admissions.length} applications
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "ID",
                      "Applicant",
                      "Program",
                      "Email",
                      "Applied",
                      "Status",
                      "Actions",
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
                  {admissions.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">
                        {a.id}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {a.applicantName}
                      </td>
                      <td className="px-4 py-3 text-sm">{a.program}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {a.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {a.appliedAt}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={a.status}
                          onValueChange={(v) =>
                            updateAdmissionStatus(
                              a.id,
                              v as AdmissionApplication["status"],
                            )
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "pending",
                              "screening",
                              "admitted",
                              "rejected",
                            ].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

  if (activePage === "memos")
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Memos & Circulars
            </h1>
            <p className="text-slate-500 text-sm">
              {memos.length} issued memos
            </p>
          </div>
          <Button
            onClick={() => setMemoDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle size={16} className="mr-2" /> Compose Memo
          </Button>
        </div>
        <div className="space-y-3">
          {memos.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-slate-400">
                No memos yet. Compose your first memo.
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
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {m.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        From: {m.senderName} &bull; To:{" "}
                        <span className="capitalize">{m.targetAudience}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {m.body}
                  </p>
                </CardContent>
              </Card>
            ),
          )}
        </div>
        <Dialog open={memoDialog} onOpenChange={setMemoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compose Memo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  className="mt-1"
                  value={memoForm.title}
                  onChange={(e) =>
                    setMemoForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={memoForm.targetAudience}
                  onValueChange={(v) =>
                    setMemoForm((f) => ({ ...f, targetAudience: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["all", "students", "staff", "lecturers"].map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  className="mt-1"
                  rows={5}
                  value={memoForm.body}
                  onChange={(e) =>
                    setMemoForm((f) => ({ ...f, body: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMemoDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveMemo}
              >
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "reports")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Reports & Analytics
        </h1>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Enrollment by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              {[...new Set(students.map((s) => s.department))].map((dept) => {
                const count = students.filter(
                  (s) => s.department === dept,
                ).length;
                const pct = Math.round((count / students.length) * 100);
                return (
                  <div key={dept} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 truncate">{dept}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff by Designation</CardTitle>
            </CardHeader>
            <CardContent>
              {[...new Set(staff.map((s) => s.designation))].map((des) => (
                <div
                  key={des}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm capitalize">{des}</span>
                  <span className="text-sm font-semibold">
                    {staff.filter((s) => s.designation === des).length}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Total Students", students.length],
                ["Total Staff", staff.length],
                ["Total Courses", courses.length],
                ["Total Memos", memos.length],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-bold">{val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );

  if (activePage === "registration-admin") return <RegistrationAdmin />;
  if (activePage === "timetable-admin") return <TimetableAdmin />;
  if (activePage === "attendance-admin") return <AttendanceAdmin />;
  if (activePage === "documents-admin") return <DocumentAdmin />;
  if (activePage === "hostel-admin")
    return (
      <GatedRoute pageKey="hostel-admin">
        <HostelAdmin />
      </GatedRoute>
    );
  if (activePage === "library-admin")
    return (
      <GatedRoute pageKey="library-admin">
        <LibraryAdmin />
      </GatedRoute>
    );
  if (activePage === "academic-calendar") return <AcademicCalendar isAdmin />;
  if (activePage === "exam-schedule-admin") return <ExamScheduleAdmin />;
  if (activePage === "announcements-admin") return <AnnouncementsAdmin />;
  if (activePage === "grade-config") return <GradeConfig />;
  if (activePage === "result-approval-admin") return <ResultApprovalAdmin />;
  if (activePage === "result-publication") return <ResultPublication />;
  if (activePage === "academic-status") return <AcademicStatus />;
  if (activePage === "graduation-clearance") return <GraduationClearance />;
  if (activePage === "graduation-tracker")
    return <GraduationTracker userRole="admin" />;
  if (activePage === "analytics-v2") return <AnalyticsV2 />;
  if (activePage === "data-import") return <DataImport />;
  if (activePage === "ai-dashboard") return <AIDashboard />;
  if (activePage === "progression-admin") return <ProgressionAdmin />;
  if (activePage === "appraisal-admin") return <AppraisalAdmin />;
  if (activePage === "alumni-admin") return <AlumniAdmin />;
  if (activePage === "documents-scans-admin") return <DocumentsScansAdmin />;
  if (activePage === "combination-courses") return <CombinationCourses />;
  if (activePage === "score-audit-log") return <ScoreAuditLog />;
  if (activePage === "score-sheet-results") return <ScoreSheetResults />;
  if (activePage === "result-sheet-admin") return <ResultSheetAdmin />;
  if (activePage === "transcript-management") return <TranscriptAdmin />;
  if (activePage === "dept-analytics") return <DepartmentAnalytics />;
  if (activePage === "faculty-results") return <FacultyResults />;
  if (activePage === "senate-presentation") return <SenatePresentation />;
  if (activePage === "student-records")
    return <StudentRecordsList userRole="admin" />;
  if (activePage === "promotion-results")
    return <PromotionResults userRole="admin" />;
  if (activePage === "pass-fail-lists")
    return <PassFailureLists userRole="admin" />;
  if (activePage === "analytics-dashboard") return <AnalyticsDashboard />;
  if (activePage === "hostel-room-inventory") return <HostelRoomInventory />;
  if (activePage === "donations-admin") return <DonationsAdmin />;
  if (activePage === "complaints-admin") return <ComplaintsAdmin />;
  if (activePage === "clearance-letter") return <ClearanceLetter />;
  if (activePage === "staff-directory") return <StaffDirectory isAdmin />;
  if (activePage === "settings") return <InstitutionSettings />;
  if (activePage === "document-verification")
    return <DocumentVerificationPortal />;
  if (activePage === "disciplinary-records")
    return <StudentDisciplinaryRecords userRole="admin" />;
  if (activePage === "senate-minutes") return <SenateMeetingMinutes />;
  if (activePage === "internal-memos") return <InternalMemoSystem />;
  if (activePage === "data-export") return <DataExportCenter />;
  if (activePage === "hostel-allocation") return <HostelAllocationMatrix />;
  if (activePage === "hostel-transfers") return <HostelTransferRequests />;
  if (activePage === "timetable-conflicts") return <TimetableConflictManager />;
  if (activePage === "cbt-analytics")
    return (
      <GatedRoute pageKey="cbt-analytics">
        <CBTAnalytics />
      </GatedRoute>
    );
  if (activePage === "cbt-resit")
    return (
      <GatedRoute pageKey="cbt-resit">
        <CBTResitManager />
      </GatedRoute>
    );
  if (activePage === "registration-management")
    return <RegistrationManagementAdmin />;
  if (activePage === "manual-registration") return <ManualRegistration />;
  if (activePage === "bulk-registration") return <BulkRegistration />;
  if (activePage === "ai-scan-registration") return <AISmartScanRegistration />;
  if (activePage === "ai-bulk-registration")
    return <AIBulkUploadRegistration />;
  if (activePage === "bulk-course-registration")
    return <AdminBulkCourseRegistration />;
  if (activePage === "registration-doc-archive")
    return <RegistrationDocumentArchive />;
  if (activePage === "jamb-portal") return <JAMBAdmissionPortal />;
  if (activePage === "student-profiles")
    return <StudentProfilePortal userRole="admin" />;
  // New v22 modules
  if (activePage === "fee-management") return <FeeManagement />;
  if (activePage === "id-cards") return <IDCardGenerator />;
  if (activePage === "academic-calendar-admin")
    return <AcademicCalendarAdmin />;
  if (activePage === "course-management") return <CourseManagement />;
  if (activePage === "examination-management") return <ExaminationManagement />;
  if (activePage === "staff-management") return <StaffManagement />;
  if (activePage === "malpractice-reports") return <MalpracticeReports />;
  if (activePage === "budget-management") return <BudgetManagement />;
  if (activePage === "scholarship-management") return <ScholarshipManagement />;
  if (activePage === "notice-board") return <NoticeBoard />;
  if (activePage === "transfer-management") return <TransferManagement />;
  if (activePage === "deferment-management") return <DefermentManagement />;
  if (activePage === "result-verification") return <ResultVerificationAdmin />;
  if (activePage === "advanced-analytics") return <AdvancedAnalytics />;
  if (activePage === "system-admin") return <SystemAdmin />;
  if (activePage === "course-catalog") return <CourseCatalog />;
  if (activePage === "announcement-view") return <AnnouncementView />;
  if (activePage === "communication-center-admin")
    return <CommunicationCenter />;
  if (activePage === "certificate-courses")
    return (
      <GatedRoute pageKey="certificate-courses">
        <CertificateCourses />
      </GatedRoute>
    );
  if (activePage === "distance-learning-admin")
    return <DistanceLearningAdmin />;
  if (activePage === "part-time-studies-admin") return <PartTimeStudiesAdmin />;
  return null;
}
