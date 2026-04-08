import {
  CheckCircle,
  ClipboardList,
  LayoutDashboard,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import {
  type ApprovalLog,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";
import { CertificateCourses } from "../admin/CertificateCourses";
import { ComplaintsAdmin } from "../admin/ComplaintsAdmin";
import { DepartmentAnalytics } from "../admin/DepartmentAnalytics";
import { StudentDisciplinaryRecords } from "../admin/StudentDisciplinaryRecords";
import { AcademicCalendar } from "../shared/AcademicCalendar";
import { AnnouncementView } from "../shared/AnnouncementView";
import { CommunicationCenter } from "../shared/CommunicationCenter";
import { CourseCatalog } from "../shared/CourseCatalog";
import { MemoAcknowledgment } from "../shared/MemoAcknowledgment";
import { PassFailureLists } from "../shared/PassFailureLists";
import { PromotionResults } from "../shared/PromotionResults";
import { StaffDirectory } from "../shared/StaffDirectory";
import { StudentRecordsList } from "../shared/StudentRecordsList";
import { AppraisalReview } from "./AppraisalReview";
import { BudgetRequest } from "./BudgetRequest";
import { CurriculumManagement } from "./CurriculumManagement";
import { DepartmentResults } from "./DepartmentResults";
import { HODSettings } from "./HODSettings";
import { ResultEntryReview } from "./ResultEntryReview";
import { TrainingApprovalHOD } from "./TrainingApprovalHOD";

type Page =
  | "dashboard"
  | "result-approval-hod"
  | "hod-students"
  | "academic-calendar"
  | "dept-analytics"
  | "dept-results"
  | "hod-settings"
  | "student-records"
  | "promotion-results"
  | "pass-fail-lists"
  | "result-entry-review"
  | "appraisal-review"
  | "complaints-hod"
  | "staff-directory"
  | "training-approval-hod"
  | "disciplinary-records"
  | "memos"
  | "budget-request"
  | "course-catalog"
  | "communication-center"
  | "announcement-view"
  | "curriculum-management"
  | "certificate-courses";
interface Props {
  activePage: Page;
}

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  hod_approved: "bg-cyan-100 text-cyan-700",
  faculty_approved: "bg-orange-100 text-orange-700",
  senate_approved: "bg-purple-100 text-purple-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function HODDashboard({ activePage }: Props) {
  const { examResults, setExamResults, approvalLogs, setApprovalLogs } =
    useResultProcessing();
  const courses = getLocalCourses();
  const students = getLocalStudents();

  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{
    courseCode: string;
    semester: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = examResults.filter((r) => r.status === "submitted");
  const published = examResults.filter((r) => r.status === "published");

  const pendingGroups = pending.reduce<
    Record<
      string,
      { courseCode: string; semester: string; session: string; count: number }
    >
  >((acc, r) => {
    const key = `${r.courseCode}__${r.semester}`;
    if (!acc[key])
      acc[key] = {
        courseCode: r.courseCode,
        semester: r.semester,
        session: r.session,
        count: 0,
      };
    acc[key].count++;
    return acc;
  }, {});

  const approve = (courseCode: string, semester: string) => {
    const updated = examResults.map((r) =>
      r.courseCode === courseCode &&
      r.semester === semester &&
      r.status === "submitted"
        ? { ...r, status: "hod_approved" as const }
        : r,
    );
    setExamResults(updated);
    const log: ApprovalLog = {
      id: `LOG-${Date.now()}`,
      courseCode,
      action: "approved",
      by: "HOD (Acting)",
      role: "HOD",
      timestamp: new Date().toISOString(),
      semester,
    };
    setApprovalLogs([...approvalLogs, log]);
    toast.success(`${courseCode} results approved by HOD`);
  };

  const reject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    const updated = examResults.map((r) =>
      r.courseCode === rejectTarget.courseCode &&
      r.semester === rejectTarget.semester &&
      r.status === "submitted"
        ? { ...r, status: "rejected" as const }
        : r,
    );
    setExamResults(updated);
    const log: ApprovalLog = {
      id: `LOG-${Date.now()}`,
      courseCode: rejectTarget.courseCode,
      action: "rejected",
      by: "HOD (Acting)",
      role: "HOD",
      timestamp: new Date().toISOString(),
      reason: rejectReason,
      semester: rejectTarget.semester,
    };
    setApprovalLogs([...approvalLogs, log]);
    toast.error(`${rejectTarget.courseCode} results rejected`);
    setRejectDialog(false);
    setRejectReason("");
  };

  if (activePage === "academic-calendar")
    return <AcademicCalendar isAdmin={false} />;

  if (activePage === "dept-analytics") return <DepartmentAnalytics />;
  if (activePage === "dept-results") return <DepartmentResults />;
  if (activePage === "promotion-results")
    return <PromotionResults userRole="hod" />;
  if (activePage === "pass-fail-lists")
    return <PassFailureLists userRole="hod" />;
  if (activePage === "hod-settings") return <HODSettings />;
  if (activePage === "student-records")
    return (
      <StudentRecordsList userRole="hod" filterDepartment="Computer Science" />
    );

  if (activePage === "result-entry-review") return <ResultEntryReview />;
  if (activePage === "appraisal-review") return <AppraisalReview />;
  if (activePage === "complaints-hod") return <ComplaintsAdmin />;
  if (activePage === "staff-directory") return <StaffDirectory />;
  if (activePage === "training-approval-hod") return <TrainingApprovalHOD />;
  if (activePage === "disciplinary-records")
    return <StudentDisciplinaryRecords userRole="hod" />;
  if (activePage === "memos") return <MemoAcknowledgment userRole="hod" />;
  if (activePage === "budget-request") return <BudgetRequest />;
  if (activePage === "curriculum-management") return <CurriculumManagement />;
  if (activePage === "course-catalog") return <CourseCatalog />;
  if (activePage === "communication-center") return <CommunicationCenter />;
  if (activePage === "announcement-view")
    return <AnnouncementView role={"lecturer" as never} />;
  if (activePage === "certificate-courses")
    return (
      <GatedRoute pageKey="certificate-courses">
        <CertificateCourses />
      </GatedRoute>
    );

  if (activePage === "hod-students")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Department Students
        </h1>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {["Matric", "Name", "Dept", "Level"].map((h) => (
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
                  {students.map((s, i) => (
                    <tr
                      key={s.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50"
                      data-ocid={`hod.students.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">
                        {s.matricNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.department}
                      </td>
                      <td className="px-4 py-3 text-sm">{s.level}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "result-approval-hod")
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">
          HOD Result Approval
        </h1>
        {Object.values(pendingGroups).length === 0 && (
          <Card>
            <CardContent
              className="p-12 text-center text-slate-400"
              data-ocid="hod.approval.empty_state"
            >
              No results pending HOD approval.
            </CardContent>
          </Card>
        )}
        <div className="space-y-4">
          {Object.values(pendingGroups).map((g, i) => {
            const course = courses.find((c) => c.code === g.courseCode);
            return (
              <Card
                key={`${g.courseCode}-${g.semester}`}
                data-ocid={`hod.approval.item.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {g.courseCode} – {course?.title ?? ""}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {g.semester} &bull; {g.count} student(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approve(g.courseCode, g.semester)}
                        data-ocid="hod.approval.confirm_button"
                      >
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setRejectTarget(g);
                          setRejectDialog(true);
                        }}
                        data-ocid="hod.approval.delete_button"
                      >
                        <XCircle size={14} className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Audit log */}
        {approvalLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {["Time", "Course", "Action", "By", "Reason"].map((h) => (
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
                    {approvalLogs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b last:border-0"
                        data-ocid="hod.audit.item.row"
                      >
                        <td className="px-4 py-2 text-xs text-slate-400">
                          {new Date(l.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-mono">
                          {l.courseCode}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            className={
                              l.action === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {l.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-sm">{l.by}</td>
                        <td className="px-4 py-2 text-sm text-red-600">
                          {l.reason ?? "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent data-ocid="hod.approval.dialog">
            <DialogHeader>
              <DialogTitle>Reject Results</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Reason for rejection</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                data-ocid="hod.approval.textarea"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialog(false)}
                data-ocid="hod.approval.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={reject}
                data-ocid="hod.approval.confirm_button"
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  // Dashboard
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">HOD Dashboard</h1>
        <p className="text-cyan-100 mt-1">
          Head of Department – Result Approval Portal
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Approvals"
          value={Object.keys(pendingGroups).length}
          icon={<ClipboardList size={22} />}
          color="amber"
        />
        <StatCard
          title="Dept Students"
          value={students.length}
          icon={<Users size={22} />}
          color="blue"
        />
        <StatCard
          title="Published Results"
          value={published.length}
          icon={<LayoutDashboard size={22} />}
          color="green"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {examResults.length === 0 && (
            <p className="text-slate-400 text-sm">No results in system yet.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              examResults.reduce<Record<string, number>>((acc, r) => {
                acc[r.status] = (acc[r.status] ?? 0) + 1;
                return acc;
              }, {}),
            ).map(([status, count]) => (
              <Badge
                key={status}
                className={
                  statusColors[status] ?? "bg-slate-100 text-slate-700"
                }
              >
                {status.replace(/_/g, " ")}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
