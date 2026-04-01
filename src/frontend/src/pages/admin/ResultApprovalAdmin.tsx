import { CheckCircle, CheckSquare, Square, XCircle } from "lucide-react";
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
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { type ApprovalLog, getLocalCourses } from "../../utils/sampleData";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  hod_approved: "bg-cyan-100 text-cyan-700",
  faculty_approved: "bg-orange-100 text-orange-700",
  senate_approved: "bg-purple-100 text-purple-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const PIPELINE_STAGES = [
  { key: "submitted", label: "Submitted", color: "bg-blue-500" },
  { key: "hod_approved", label: "HOD Approved", color: "bg-cyan-500" },
  {
    key: "faculty_approved",
    label: "Faculty Approved",
    color: "bg-orange-500",
  },
  { key: "senate_approved", label: "Senate Approved", color: "bg-purple-500" },
  { key: "published", label: "Published", color: "bg-green-500" },
];

function groupByCourseSemester(
  results: {
    courseCode: string;
    semester: string;
    session: string;
    status: string;
  }[],
) {
  return Object.values(
    results.reduce<
      Record<
        string,
        {
          courseCode: string;
          semester: string;
          session: string;
          status: string;
          count: number;
        }
      >
    >((acc, r) => {
      const key = `${r.courseCode}__${r.semester}`;
      if (!acc[key]) acc[key] = { ...r, count: 0 };
      acc[key].count++;
      return acc;
    }, {}),
  );
}

export function ResultApprovalAdmin() {
  const { examResults, setExamResults, approvalLogs, setApprovalLogs } =
    useResultProcessing();
  const courses = getLocalCourses();

  // Bulk selection state per tab
  const [facultySelected, setFacultySelected] = useState<Set<string>>(
    new Set(),
  );
  const [senateSelected, setSenateSelected] = useState<Set<string>>(new Set());

  // Unified reject dialog (handles single & bulk)
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectTargets, setRejectTargets] = useState<
    { courseCode: string; semester: string; fromStatus: string }[]
  >([]);
  const [rejectReason, setRejectReason] = useState("");

  const facultyPending = examResults.filter((r) => r.status === "hod_approved");
  const senatePending = examResults.filter(
    (r) => r.status === "faculty_approved",
  );

  // Stage counts for pipeline
  const stageCounts = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: examResults.filter((r) => r.status === s.key).length,
  }));

  const approveGroup = (
    courseCode: string,
    semester: string,
    fromStatus: string,
    toStatus: string,
    role: string,
  ) => {
    const updated = examResults.map((r) =>
      r.courseCode === courseCode &&
      r.semester === semester &&
      r.status === fromStatus
        ? { ...r, status: toStatus as typeof r.status }
        : r,
    );
    setExamResults(updated);
    const log: ApprovalLog = {
      id: `LOG-${Date.now()}`,
      courseCode,
      action: "approved",
      by: `${role} (Admin)`,
      role,
      timestamp: new Date().toISOString(),
      semester,
    };
    setApprovalLogs([...approvalLogs, log]);
    toast.success(`${courseCode} approved – ${toStatus.replace(/_/g, " ")}`);
  };

  const approveAll = (
    keys: Set<string>,
    fromStatus: string,
    toStatus: string,
    role: string,
    clearFn: (s: Set<string>) => void,
  ) => {
    let updated = [...examResults];
    const newLogs: ApprovalLog[] = [];
    for (const key of keys) {
      const [courseCode, semester] = key.split("__");
      updated = updated.map((r) =>
        r.courseCode === courseCode &&
        r.semester === semester &&
        r.status === fromStatus
          ? { ...r, status: toStatus as typeof r.status }
          : r,
      );
      newLogs.push({
        id: `LOG-${Date.now()}-${courseCode}`,
        courseCode,
        action: "approved",
        by: `${role} (Admin)`,
        role,
        timestamp: new Date().toISOString(),
        semester,
      });
    }
    setExamResults(updated);
    setApprovalLogs([...approvalLogs, ...newLogs]);
    toast.success(`${keys.size} group(s) approved`);
    clearFn(new Set());
  };

  const openReject = (
    courseCode: string,
    semester: string,
    fromStatus: string,
  ) => {
    setRejectTargets([{ courseCode, semester, fromStatus }]);
    setRejectReason("");
    setRejectDialog(true);
  };

  const openBulkReject = (
    keys: Set<string>,
    fromStatus: string,
    clearFn: (s: Set<string>) => void,
  ) => {
    const targets = Array.from(keys).map((key) => {
      const [courseCode, semester] = key.split("__");
      return { courseCode, semester, fromStatus };
    });
    setRejectTargets(targets);
    setRejectReason("");
    setRejectDialog(true);
    clearFn(new Set());
  };

  const confirmReject = () => {
    if (rejectTargets.length === 0 || !rejectReason.trim()) return;
    const updated = examResults.map((r) => {
      const match = rejectTargets.find(
        (t) =>
          t.courseCode === r.courseCode &&
          t.semester === r.semester &&
          r.status === t.fromStatus,
      );
      return match ? { ...r, status: "rejected" as const } : r;
    });
    setExamResults(updated);
    const logs: ApprovalLog[] = rejectTargets.map((t) => ({
      id: `LOG-${Date.now()}-${t.courseCode}`,
      courseCode: t.courseCode,
      action: "rejected",
      by: "Admin",
      role: t.fromStatus === "hod_approved" ? "Faculty" : "Senate",
      timestamp: new Date().toISOString(),
      reason: rejectReason,
      semester: t.semester,
    }));
    setApprovalLogs([...approvalLogs, ...logs]);
    for (const t of rejectTargets) {
      toast.error(`${t.courseCode} rejected`);
    }
    setRejectDialog(false);
  };

  function ApprovalTable({
    groups,
    fromStatus,
    toStatus,
    approverRole,
    selectedKeys,
    setSelectedKeys,
  }: {
    groups: ReturnType<typeof groupByCourseSemester>;
    fromStatus: string;
    toStatus: string;
    approverRole: string;
    selectedKeys: Set<string>;
    setSelectedKeys: (s: Set<string>) => void;
  }) {
    const allKeys = groups.map((g) => `${g.courseCode}__${g.semester}`);
    const allSelected =
      groups.length > 0 && selectedKeys.size === groups.length;
    const someSelected = selectedKeys.size > 0;

    const toggleKey = (key: string) => {
      const next = new Set(selectedKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectedKeys(next);
    };

    const toggleAll = () => {
      if (allSelected) {
        setSelectedKeys(new Set());
      } else {
        setSelectedKeys(new Set(allKeys));
      }
    };

    return (
      <>
        {/* Bulk Actions Bar */}
        {someSelected && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              {selectedKeys.size} selected
            </span>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() =>
                approveAll(
                  selectedKeys,
                  fromStatus,
                  toStatus,
                  approverRole,
                  setSelectedKeys,
                )
              }
              data-ocid="admin.approval.confirm_button"
            >
              <CheckCircle size={14} className="mr-1" /> Approve Selected (
              {selectedKeys.size})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300"
              onClick={() =>
                openBulkReject(selectedKeys, fromStatus, setSelectedKeys)
              }
              data-ocid="admin.approval.delete_button"
            >
              <XCircle size={14} className="mr-1" /> Reject Selected (
              {selectedKeys.size})
            </Button>
            <button
              type="button"
              className="text-xs text-slate-500 hover:underline ml-auto"
              onClick={() => setSelectedKeys(new Set())}
            >
              Clear selection
            </button>
          </div>
        )}

        {groups.length === 0 && (
          <Card>
            <CardContent
              className="p-10 text-center text-slate-400"
              data-ocid={`${approverRole.toLowerCase()}.empty_state`}
            >
              No results pending this stage.
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {groups.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 border-b">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                data-ocid="admin.approval.checkbox"
              />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Select All ({groups.length})
              </span>
              {allSelected ? (
                <CheckSquare size={14} className="text-blue-500" />
              ) : (
                <Square size={14} className="text-slate-300" />
              )}
            </div>
          )}
          {groups.map((g, i) => {
            const key = `${g.courseCode}__${g.semester}`;
            const isSelected = selectedKeys.has(key);
            const course = courses.find((c) => c.code === g.courseCode);
            return (
              <Card
                key={key}
                className={isSelected ? "border-blue-400 bg-blue-50/30" : ""}
                data-ocid={`admin.approval.item.${i + 1}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleKey(key)}
                    data-ocid="admin.approval.checkbox"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {g.courseCode} – {course?.title ?? ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      {g.semester} &bull; {g.count} student(s)
                    </p>
                    <Badge className={statusColors[g.status] ?? ""}>
                      {g.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        approveGroup(
                          g.courseCode,
                          g.semester,
                          fromStatus,
                          toStatus,
                          approverRole,
                        )
                      }
                      data-ocid="admin.approval.confirm_button"
                    >
                      <CheckCircle size={14} className="mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300"
                      onClick={() =>
                        openReject(g.courseCode, g.semester, fromStatus)
                      }
                      data-ocid="admin.approval.delete_button"
                    >
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Result Approval</h1>
        <p className="text-slate-500 text-sm mt-1">
          Faculty Dean and Senate level result approvals with pipeline tracking.
        </p>
      </div>

      {/* Pipeline Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-slate-600">
            Approval Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto">
            {stageCounts.map((stage, i) => (
              <div key={stage.key} className="flex items-center flex-shrink-0">
                <div className="text-center min-w-[90px]">
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white text-xs font-bold mb-1 ${
                      stage.count > 0 ? stage.color : "bg-slate-300"
                    }`}
                  >
                    {stage.count}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-tight">
                    {stage.label}
                  </p>
                </div>
                {i < stageCounts.length - 1 && (
                  <div className="w-8 h-px bg-slate-300 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faculty">
        <TabsList>
          <TabsTrigger value="faculty" data-ocid="approval.tab">
            Faculty Dean Approval (
            {groupByCourseSemester(facultyPending).length})
          </TabsTrigger>
          <TabsTrigger value="senate" data-ocid="approval.tab">
            Senate Approval ({groupByCourseSemester(senatePending).length})
          </TabsTrigger>
          <TabsTrigger value="audit" data-ocid="approval.tab">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="mt-4 space-y-3">
          <ApprovalTable
            groups={groupByCourseSemester(facultyPending)}
            fromStatus="hod_approved"
            toStatus="faculty_approved"
            approverRole="Faculty"
            selectedKeys={facultySelected}
            setSelectedKeys={setFacultySelected}
          />
        </TabsContent>

        <TabsContent value="senate" className="mt-4 space-y-3">
          <ApprovalTable
            groups={groupByCourseSemester(senatePending)}
            fromStatus="faculty_approved"
            toStatus="senate_approved"
            approverRole="Senate"
            selectedKeys={senateSelected}
            setSelectedKeys={setSenateSelected}
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Full Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {["Time", "Course", "Action", "By", "Role", "Reason"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {approvalLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          No audit logs yet.
                        </td>
                      </tr>
                    )}
                    {approvalLogs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b last:border-0"
                        data-ocid="audit.item.row"
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
                        <td className="px-4 py-2 text-sm">{l.role}</td>
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
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent data-ocid="admin.approval.dialog">
          <DialogHeader>
            <DialogTitle>
              Reject Result(s) –{" "}
              {rejectTargets.length === 1
                ? rejectTargets[0].courseCode
                : `${rejectTargets.length} courses`}
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label>Reason for rejection</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Provide a reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              data-ocid="admin.approval.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(false)}
              data-ocid="admin.approval.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmReject}
              disabled={!rejectReason.trim()}
              data-ocid="admin.approval.confirm_button"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
