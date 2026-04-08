import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  PauseCircle,
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

const STORAGE_KEY = "unidigital_deferments";

export type DefermentReason =
  | "medical"
  | "financial"
  | "personal"
  | "family_emergency";
export type DefermentDuration =
  | "1_semester"
  | "1_academic_year"
  | "2_academic_years";
export type DefermentStatus =
  | "pending"
  | "hod_review"
  | "admin_review"
  | "active"
  | "rejected"
  | "reinstated"
  | "reinstatement_pending";

export interface DefermentRecord {
  id: string;
  studentMatric: string;
  studentName: string;
  studentEmail: string;
  department: string;
  reason: DefermentReason;
  reasonDetail: string;
  duration: DefermentDuration;
  supportingDocument: string;
  status: DefermentStatus;
  createdAt: string;
  resumeDate?: string;
  actualResumeDate?: string;
  hodComment?: string;
  adminComment?: string;
  timeline: {
    stage: string;
    action: string;
    reviewer: string;
    comment: string;
    timestamp: string;
  }[];
  reinstatementRequestedAt?: string;
  reinstatementNote?: string;
}

function getDeferments(): DefermentRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDeferments(records: DefermentRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

const REASON_LABELS: Record<DefermentReason, string> = {
  medical: "Medical Condition",
  financial: "Financial Difficulty",
  personal: "Personal Reasons",
  family_emergency: "Family Emergency",
};

const DURATION_LABELS: Record<DefermentDuration, string> = {
  "1_semester": "1 Semester",
  "1_academic_year": "1 Academic Year",
  "2_academic_years": "2 Academic Years",
};

const STATUS_CONFIG: Record<
  DefermentStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  hod_review: {
    label: "HOD Review",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock className="w-3 h-3" />,
  },
  admin_review: {
    label: "Admin Review",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: <Clock className="w-3 h-3" />,
  },
  active: {
    label: "Deferment Active",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <PauseCircle className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
  reinstated: {
    label: "Reinstated",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  reinstatement_pending: {
    label: "Reinstatement Pending",
    color: "bg-teal-100 text-teal-700 border-teal-200",
    icon: <Clock className="w-3 h-3" />,
  },
};

function getDaysRemaining(resumeDate?: string): string {
  if (!resumeDate) return "—";
  const diff = new Date(resumeDate).getTime() - Date.now();
  if (diff <= 0) return "Overdue";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days > 365) return `${Math.floor(days / 365)} year(s) remaining`;
  return `${days} day(s) remaining`;
}

interface DefermentProps {
  userEmail?: string;
  userName?: string;
}

export function Deferment({ userEmail = "", userName = "" }: DefermentProps) {
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [deferments, setDeferments] = useState<DefermentRecord[]>([]);
  const [selected, setSelected] = useState<DefermentRecord | null>(null);
  const [form, setForm] = useState<{
    reason: DefermentReason | "";
    reasonDetail: string;
    duration: DefermentDuration | "";
    supportingDocument: string;
  }>({ reason: "", reasonDetail: "", duration: "", supportingDocument: "" });
  const [reinstatementNote, setReinstatementNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const students = getLocalStudents();
  const student = students.find((s) => s.email === userEmail) || students[0];

  function load() {
    const all = getDeferments();
    setDeferments(all.filter((d) => d.studentMatric === student?.matricNumber));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: student.matricNumber is stable
  useEffect(() => {
    load();
  }, [student?.matricNumber]);

  function handleSubmit() {
    if (!form.reason) {
      setError("Please select a reason for deferment.");
      return;
    }
    if (!form.reasonDetail.trim()) {
      setError("Please provide details for your reason.");
      return;
    }
    if (!form.duration) {
      setError("Please select a deferment duration.");
      return;
    }
    if (!form.supportingDocument.trim()) {
      setError("Please describe your supporting document.");
      return;
    }

    setSaving(true);
    const newRecord: DefermentRecord = {
      id: `DEF-${Date.now()}`,
      studentMatric: student?.matricNumber || "",
      studentName: student?.name || userName,
      studentEmail: student?.email || userEmail,
      department: student?.department || "",
      reason: form.reason as DefermentReason,
      reasonDetail: form.reasonDetail,
      duration: form.duration as DefermentDuration,
      supportingDocument: form.supportingDocument,
      status: "hod_review",
      createdAt: new Date().toISOString(),
      timeline: [
        {
          stage: "Application Submitted",
          action: "submitted",
          reviewer: student?.name || userName,
          comment: "Deferment application submitted by student.",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const all = getDeferments();
    all.push(newRecord);
    saveDeferments(all);
    load();
    setView("list");
    setForm({
      reason: "",
      reasonDetail: "",
      duration: "",
      supportingDocument: "",
    });
    setError("");
    setSaving(false);
  }

  function handleReinstatement(def: DefermentRecord) {
    if (!reinstatementNote.trim()) {
      setError("Please provide a note for your reinstatement request.");
      return;
    }
    const all = getDeferments();
    const idx = all.findIndex((d) => d.id === def.id);
    if (idx === -1) return;
    all[idx] = {
      ...all[idx],
      status: "reinstatement_pending",
      reinstatementRequestedAt: new Date().toISOString(),
      reinstatementNote,
      timeline: [
        ...all[idx].timeline,
        {
          stage: "Reinstatement Requested",
          action: "reinstatement_request",
          reviewer: student?.name || userName,
          comment: reinstatementNote,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    saveDeferments(all);
    load();
    setSelected(all[idx]);
    setReinstatementNote("");
    setError("");
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
            Apply for Deferment / Leave of Absence
          </h1>
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Before You Apply</p>
              <p>
                Deferment pauses your academic registration. No fees will be
                generated during this period. You must apply for reinstatement
                to resume studies. Approval requires HOD recommendation and
                Admin confirmation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Information</CardTitle>
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
              <span className="text-muted-foreground">Department:</span>
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
            <CardTitle className="text-base">Deferment Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Reason for Deferment *</Label>
                <Select
                  value={form.reason}
                  onValueChange={(v) =>
                    setForm({ ...form, reason: v as DefermentReason })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REASON_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Requested Duration *</Label>
                <Select
                  value={form.duration}
                  onValueChange={(v) =>
                    setForm({ ...form, duration: v as DefermentDuration })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DURATION_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Detailed Explanation *</Label>
              <Textarea
                rows={4}
                placeholder="Explain your circumstances in detail and why you need this deferment..."
                value={form.reasonDetail}
                onChange={(e) =>
                  setForm({ ...form, reasonDetail: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Supporting Document Description *</Label>
              <Textarea
                rows={3}
                placeholder="Describe the supporting document you are attaching (e.g. Medical certificate from Federal Medical Centre, dated 01/03/2025, signed by Dr. Abubakar)..."
                value={form.supportingDocument}
                onChange={(e) =>
                  setForm({ ...form, supportingDocument: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Describe the physical or digital document you will present.
                Medical cases require a valid medical certificate.
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
              data-ocid="deferment-submit-btn"
            >
              {saving ? "Submitting..." : "Submit Deferment Application"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "detail" && selected) {
    const cfg = STATUS_CONFIG[selected.status];
    const isActive = selected.status === "active";
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setView("list");
              setSelected(null);
              setError("");
            }}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Deferment Details
            </h1>
            <p className="text-sm text-muted-foreground">{selected.id}</p>
          </div>
        </div>

        <Card className={`border ${cfg.color}`}>
          <CardContent className="p-4 flex items-center gap-3">
            {cfg.icon}
            <div>
              <p className="font-semibold text-sm">Status: {cfg.label}</p>
              <p className="text-xs">
                {REASON_LABELS[selected.reason]} —{" "}
                {DURATION_LABELS[selected.duration]}
              </p>
            </div>
          </CardContent>
        </Card>

        {isActive && selected.resumeDate && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-orange-600" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold">Deferment Active</p>
                <p>
                  Resume Date:{" "}
                  <strong>
                    {new Date(selected.resumeDate).toLocaleDateString()}
                  </strong>{" "}
                  ({getDaysRemaining(selected.resumeDate)})
                </p>
                <p className="text-xs mt-1">
                  Your registration is paused. No fees are being generated
                  during this period.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Reason:</span>
                <p className="font-medium">{REASON_LABELS[selected.reason]}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-medium">
                  {DURATION_LABELS[selected.duration]}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Applied:</span>
                <p className="font-medium">
                  {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              {selected.resumeDate && (
                <div>
                  <span className="text-muted-foreground">Resume Date:</span>
                  <p className="font-medium">
                    {new Date(selected.resumeDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Explanation:</span>
              <p className="mt-1 p-2 bg-muted rounded">
                {selected.reasonDetail}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                Supporting Document:
              </span>
              <p className="mt-1 p-2 bg-muted rounded">
                {selected.supportingDocument}
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
              {selected.timeline.map((entry, idx) => (
                <div key={`${entry.timestamp}-${idx}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                      {idx + 1}
                    </div>
                    {idx < selected.timeline.length - 1 && (
                      <div className="w-0.5 h-6 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
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

        {/* Reinstatement Request */}
        {isActive && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Reinstatement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If you are ready to resume your studies, submit a reinstatement
                request. Admin will review and reactivate your registration.
              </p>
              <Textarea
                rows={3}
                placeholder="Explain why you are ready to resume (e.g. medical clearance obtained, financial situation resolved)..."
                value={reinstatementNote}
                onChange={(e) => setReinstatementNote(e.target.value)}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                onClick={() => handleReinstatement(selected)}
                data-ocid="reinstatement-request-btn"
              >
                Request Reinstatement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Deferment & Leave of Absence
          </h1>
          <p className="text-sm text-muted-foreground">
            Apply for academic deferment and track your application status
          </p>
        </div>
        {deferments.filter(
          (d) => d.status !== "rejected" && d.status !== "reinstated",
        ).length === 0 && (
          <Button onClick={() => setView("new")} data-ocid="new-deferment-btn">
            <PauseCircle className="w-4 h-4 mr-2" /> Apply for Deferment
          </Button>
        )}
      </div>

      {deferments.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <PauseCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg text-foreground">
              No Deferment Applications
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              You have not applied for academic deferment.
            </p>
            <Button
              onClick={() => setView("new")}
              data-ocid="empty-deferment-btn"
            >
              Apply for Deferment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deferments.map((def) => {
            const cfg = STATUS_CONFIG[def.status];
            return (
              <Card
                key={def.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelected(def);
                  setView("detail");
                }}
                data-ocid={`deferment-row-${def.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <PauseCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {REASON_LABELS[def.reason]} —{" "}
                        {DURATION_LABELS[def.duration]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {def.id} | {def.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied: {new Date(def.createdAt).toLocaleDateString()}
                        {def.resumeDate
                          ? ` | Resume: ${new Date(def.resumeDate).toLocaleDateString()}`
                          : ""}
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
                      <FileText className="w-3 h-3 mr-1" />
                      View
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
