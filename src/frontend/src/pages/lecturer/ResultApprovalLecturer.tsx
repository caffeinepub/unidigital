import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useResultProcessing } from "../../contexts/ResultProcessingContext";
import { getLocalCourses } from "../../utils/sampleData";

const STATUSES = [
  "submitted",
  "hod_approved",
  "faculty_approved",
  "senate_approved",
  "published",
  "rejected",
] as const;
type Status = (typeof STATUSES)[number];

const statusColors: Record<Status, string> = {
  submitted: "bg-blue-100 text-blue-700",
  hod_approved: "bg-cyan-100 text-cyan-700",
  faculty_approved: "bg-orange-100 text-orange-700",
  senate_approved: "bg-purple-100 text-purple-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabels: Record<Status, string> = {
  submitted: "Submitted",
  hod_approved: "HOD Approved",
  faculty_approved: "Faculty Approved",
  senate_approved: "Senate Approved",
  published: "Published",
  rejected: "Rejected",
};

const PIPELINE: { key: string; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "hod_approved", label: "HOD" },
  { key: "faculty_approved", label: "Faculty" },
  { key: "senate_approved", label: "Senate" },
  { key: "published", label: "Published" },
];

function pipelineStep(status: string) {
  const steps = PIPELINE.map((p) => p.key);
  return steps.indexOf(status);
}

export function ResultApprovalLecturer() {
  const { examResults, approvalLogs } = useResultProcessing();
  const courses = getLocalCourses();

  // Group by course+semester
  const groups = examResults
    .filter((r) => r.status !== "draft")
    .reduce<
      Record<
        string,
        {
          courseCode: string;
          semester: string;
          session: string;
          status: string;
          submittedAt?: string;
          rejectionReason?: string;
        }
      >
    >((acc, r) => {
      const key = `${r.courseCode}__${r.semester}`;
      if (!acc[key]) {
        acc[key] = {
          courseCode: r.courseCode,
          semester: r.semester,
          session: r.session,
          status: r.status,
          submittedAt: r.submittedAt,
        };
      }
      return acc;
    }, {});

  const groupList = Object.values(groups);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Result Approval Status
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track where each submitted result set stands in the approval pipeline.
        </p>
      </div>

      {groupList.length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="approval.empty_state"
          >
            No results submitted yet. Submit results from the Result Entry page.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {groupList.map((g, i) => {
          const course = courses.find((c) => c.code === g.courseCode);
          const step = pipelineStep(g.status);
          const isRejected = g.status === "rejected";
          const logs = approvalLogs.filter(
            (l) => l.courseCode === g.courseCode && l.semester === g.semester,
          );

          return (
            <Card
              key={`${g.courseCode}-${g.semester}`}
              data-ocid={`approval.item.${i + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {g.courseCode} – {course?.title ?? "Unknown Course"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {g.semester} &bull; {g.session}
                    </p>
                    {g.submittedAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Submitted:{" "}
                        {new Date(g.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      (statusColors as Record<string, string>)[g.status] ??
                      "bg-slate-100 text-slate-700"
                    }
                  >
                    {(statusLabels as Record<string, string>)[g.status] ??
                      g.status}
                  </Badge>
                </div>

                {/* Pipeline */}
                {!isRejected && (
                  <div className="mt-4 flex items-center gap-1 overflow-x-auto">
                    {PIPELINE.map((p, pi) => {
                      const done = step >= pi;
                      return (
                        <div
                          key={p.key}
                          className="flex items-center gap-1 flex-shrink-0"
                        >
                          <div
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                              done
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {done ? (
                              <CheckCircle size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {p.label}
                          </div>
                          {pi < PIPELINE.length - 1 && (
                            <div
                              className={`w-6 h-0.5 ${step > pi ? "bg-green-400" : "bg-slate-200"}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isRejected && (
                  <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <XCircle size={14} className="text-red-500" />
                    <p className="text-sm text-red-700">
                      Rejected:{" "}
                      {logs.find((l) => l.action === "rejected")?.reason ??
                        "No reason provided"}
                    </p>
                  </div>
                )}

                {logs.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">
                      Approval History
                    </p>
                    <div className="space-y-1">
                      {logs.map((l) => (
                        <div
                          key={l.timestamp + l.action}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="text-slate-400">
                            {new Date(l.timestamp).toLocaleString()}
                          </span>
                          <span className="font-medium capitalize">
                            {l.action}
                          </span>
                          <span className="text-slate-500">
                            by {l.by} ({l.role})
                          </span>
                          {l.reason && (
                            <span className="text-red-500">– {l.reason}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
