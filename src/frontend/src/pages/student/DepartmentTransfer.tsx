import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "../../components/ui/textarea";
import { getLocalStudents } from "../../utils/sampleData";

const STORAGE_KEY = "unidigital_transfer_requests";

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Education & Biology",
  "Education & Chemistry",
  "Education & Mathematics",
  "Education & Physics",
  "Education & Computer Science",
  "Entrepreneurship",
  "Health Education",
  "Human Kinetics",
  "English",
  "History",
  "Geography",
];

const ACADEMIC_SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];

export type TransferStatus =
  | "pending"
  | "source_hod_review"
  | "dest_hod_review"
  | "registrar_review"
  | "approved"
  | "rejected";

export interface TransferRequest {
  id: string;
  studentMatric: string;
  studentName: string;
  studentEmail: string;
  currentDepartment: string;
  targetDepartment: string;
  reason: string;
  applicationLetter: string;
  hodRecommendation: string;
  session: string;
  status: TransferStatus;
  createdAt: string;
  timeline: {
    stage: string;
    action: string;
    reviewer: string;
    comment: string;
    timestamp: string;
  }[];
}

function getTransferRequests(): TransferRequest[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTransferRequests(requests: TransferRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending Submission",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  source_hod_review: {
    label: "Source HOD Review",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock className="w-3 h-3" />,
  },
  dest_hod_review: {
    label: "Destination HOD Review",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <Clock className="w-3 h-3" />,
  },
  registrar_review: {
    label: "Registrar Review",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: <Clock className="w-3 h-3" />,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const WORKFLOW_STAGES = [
  { key: "pending", label: "Application Submitted" },
  { key: "source_hod_review", label: "Source HOD Review" },
  { key: "dest_hod_review", label: "Destination HOD Review" },
  { key: "registrar_review", label: "Registrar Review" },
  { key: "approved", label: "Final Decision" },
];

const stageOrder: TransferStatus[] = [
  "pending",
  "source_hod_review",
  "dest_hod_review",
  "registrar_review",
  "approved",
];

interface DepartmentTransferProps {
  userEmail?: string;
  userName?: string;
}

export function DepartmentTransfer({
  userEmail = "",
  userName = "",
}: DepartmentTransferProps) {
  const [view, setView] = useState<"list" | "new">("list");
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<TransferRequest | null>(null);
  const [form, setForm] = useState({
    targetDepartment: "",
    reason: "",
    applicationLetter: "",
    hodRecommendation: "",
    session: "2024/2025",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const students = getLocalStudents();
  const student = students.find((s) => s.email === userEmail) || students[0];

  useEffect(() => {
    const all = getTransferRequests();
    const mine = all.filter((r) => r.studentMatric === student?.matricNumber);
    setRequests(mine);
  }, [student?.matricNumber]);

  function handleSubmit() {
    if (!form.targetDepartment) {
      setError("Please select a target department.");
      return;
    }
    if (!form.reason.trim()) {
      setError("Please provide a reason for transfer.");
      return;
    }
    if (!form.applicationLetter.trim()) {
      setError("Please provide an application letter description.");
      return;
    }
    if (!form.hodRecommendation.trim()) {
      setError("Please describe the HOD recommendation letter.");
      return;
    }
    if (form.targetDepartment === student?.department) {
      setError("Target department cannot be the same as current department.");
      return;
    }

    setSaving(true);
    const newRequest: TransferRequest = {
      id: `TR-${Date.now()}`,
      studentMatric: student?.matricNumber || "",
      studentName: student?.name || userName,
      studentEmail: student?.email || userEmail,
      currentDepartment: student?.department || "",
      targetDepartment: form.targetDepartment,
      reason: form.reason,
      applicationLetter: form.applicationLetter,
      hodRecommendation: form.hodRecommendation,
      session: form.session,
      status: "source_hod_review",
      createdAt: new Date().toISOString(),
      timeline: [
        {
          stage: "Application Submitted",
          action: "submitted",
          reviewer: student?.name || userName,
          comment: "Transfer application submitted by student.",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const all = getTransferRequests();
    all.push(newRequest);
    saveTransferRequests(all);
    setRequests(all.filter((r) => r.studentMatric === student?.matricNumber));
    setView("list");
    setForm({
      targetDepartment: "",
      reason: "",
      applicationLetter: "",
      hodRecommendation: "",
      session: "2024/2025",
    });
    setError("");
    setSaving(false);
  }

  if (selectedRequest) {
    const cfg = STATUS_CONFIG[selectedRequest.status];
    const currentIdx = stageOrder.indexOf(
      selectedRequest.status === "rejected"
        ? "approved"
        : selectedRequest.status,
    );
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedRequest(null)}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Transfer Request Details
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedRequest.id}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <Card className={`border ${cfg.color}`}>
          <CardContent className="p-4 flex items-center gap-3">
            {cfg.icon}
            <div>
              <p className="font-semibold text-sm">Status: {cfg.label}</p>
              <p className="text-xs text-muted-foreground">
                {selectedRequest.currentDepartment} →{" "}
                {selectedRequest.targetDepartment} | Session:{" "}
                {selectedRequest.session}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 flex-wrap">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentIdx;
                const isCurrent =
                  stage.key === selectedRequest.status ||
                  (selectedRequest.status === "rejected" && idx === currentIdx);
                const isRejected =
                  selectedRequest.status === "rejected" && isCurrent;
                return (
                  <div key={stage.key} className="flex items-center gap-1">
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                        isRejected
                          ? "bg-red-100 text-red-700 border-red-200"
                          : isCompleted
                            ? "bg-green-100 text-green-700 border-green-200"
                            : isCurrent
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {isRejected ? (
                        <XCircle className="w-3 h-3" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {stage.label}
                    </div>
                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">From Department:</span>
                <p className="font-medium">
                  {selectedRequest.currentDepartment}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">To Department:</span>
                <p className="font-medium">
                  {selectedRequest.targetDepartment}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Academic Session:</span>
                <p className="font-medium">{selectedRequest.session}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium">
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">
                Reason for Transfer:
              </span>
              <p className="mt-1 p-2 bg-muted rounded text-foreground">
                {selectedRequest.reason}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedRequest.timeline.map((entry, idx) => (
                <div key={entry.timestamp} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                      {idx + 1}
                    </div>
                    {idx < selectedRequest.timeline.length - 1 && (
                      <div className="w-0.5 h-6 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-3 min-w-0">
                    <p className="font-medium text-sm">{entry.stage}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.reviewer} —{" "}
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.comment && (
                      <p className="text-xs mt-1 p-2 bg-muted rounded">
                        {entry.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "new") {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setView("list");
              setError("");
            }}
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            Apply for Department Transfer
          </h1>
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Important Information</p>
              <p>
                Transfer applications require approval from your current HOD,
                destination HOD, and Registrar. Ensure you have a genuine reason
                and all supporting documentation ready.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Current Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{student?.name || userName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Matric Number:</span>
              <p className="font-medium">{student?.matricNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Current Department:</span>
              <p className="font-medium">{student?.department}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Level:</span>
              <p className="font-medium">{student?.level}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Transfer Application Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Target Department *</Label>
                <Select
                  value={form.targetDepartment}
                  onValueChange={(v) =>
                    setForm({ ...form, targetDepartment: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((d) => d !== student?.department).map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Academic Session *</Label>
                <Select
                  value={form.session}
                  onValueChange={(v) => setForm({ ...form, session: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_SESSIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason for Transfer *</Label>
              <Textarea
                rows={3}
                placeholder="Explain why you want to transfer to the target department..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Application Letter (Description) *</Label>
              <Textarea
                rows={4}
                placeholder="Describe your application letter content / key points covered..."
                value={form.applicationLetter}
                onChange={(e) =>
                  setForm({ ...form, applicationLetter: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Summarise the content of your formal application letter to the
                Registrar.
              </p>
            </div>
            <div className="space-y-1">
              <Label>HOD Recommendation Letter (Description) *</Label>
              <Textarea
                rows={3}
                placeholder="Describe the HOD recommendation letter from your current department..."
                value={form.hodRecommendation}
                onChange={(e) =>
                  setForm({ ...form, hodRecommendation: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Provide a summary of the recommendation from your current HOD.
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={saving}
              data-ocid="transfer-submit-btn"
            >
              {saving ? "Submitting..." : "Submit Transfer Application"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Department Transfer
          </h1>
          <p className="text-sm text-muted-foreground">
            Apply for inter-department transfer and track your application
            status
          </p>
        </div>
        {requests.filter(
          (r) => r.status !== "approved" && r.status !== "rejected",
        ).length === 0 && (
          <Button onClick={() => setView("new")} data-ocid="new-transfer-btn">
            <FileText className="w-4 h-4 mr-2" /> Apply for Transfer
          </Button>
        )}
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg text-foreground">
              No Transfer Applications
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              You have not submitted any department transfer application yet.
            </p>
            <Button
              onClick={() => setView("new")}
              data-ocid="empty-new-transfer-btn"
            >
              Apply for Transfer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            return (
              <Card
                key={req.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(req)}
                data-ocid={`transfer-row-${req.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {req.currentDepartment} → {req.targetDepartment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.id} | Session: {req.session}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted:{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      className={`${cfg.color} border flex items-center gap-1`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
