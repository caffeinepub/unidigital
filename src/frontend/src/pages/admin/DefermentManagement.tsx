import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  PauseCircle,
  RefreshCw,
  Search,
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
import type { DefermentRecord, DefermentStatus } from "../student/Deferment";

const STORAGE_KEY = "unidigital_deferments";

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

const REASON_LABELS: Record<string, string> = {
  medical: "Medical Condition",
  financial: "Financial Difficulty",
  personal: "Personal Reasons",
  family_emergency: "Family Emergency",
};

const DURATION_LABELS: Record<string, string> = {
  "1_semester": "1 Semester",
  "1_academic_year": "1 Academic Year",
  "2_academic_years": "2 Academic Years",
};

const DURATION_MONTHS: Record<string, number> = {
  "1_semester": 6,
  "1_academic_year": 12,
  "2_academic_years": 24,
};

const STATUS_CONFIG: Record<DefermentStatus, { label: string; color: string }> =
  {
    pending: {
      label: "Pending",
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
    hod_review: {
      label: "HOD Review",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    admin_review: {
      label: "Admin Review",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    active: {
      label: "Active Deferment",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    reinstated: {
      label: "Reinstated",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    reinstatement_pending: {
      label: "Reinstatement Pending",
      color: "bg-teal-100 text-teal-700 border-teal-200",
    },
  };

export function DefermentManagement() {
  const [deferments, setDeferments] = useState<DefermentRecord[]>([]);
  const [selected, setSelected] = useState<DefermentRecord | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [comment, setComment] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDeferments(getDeferments());
  }, []);

  const filtered = deferments.filter((d) => {
    const matchSearch =
      d.studentName.toLowerCase().includes(search.toLowerCase()) ||
      d.studentMatric.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: deferments.length,
    awaitingReview: deferments.filter(
      (d) => d.status === "hod_review" || d.status === "admin_review",
    ).length,
    active: deferments.filter((d) => d.status === "active").length,
    reinstatementPending: deferments.filter(
      (d) => d.status === "reinstatement_pending",
    ).length,
  };

  function computeResumeDate(duration: string): string {
    const months = DURATION_MONTHS[duration] ?? 6;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  }

  function handleAction(
    record: DefermentRecord,
    action: "approve" | "reject" | "reinstate",
  ) {
    if (
      action === "approve" &&
      record.status === "admin_review" &&
      !resumeDate
    ) {
      setError("Please set a resume date before confirming the deferment.");
      return;
    }

    setProcessing(true);
    const all = getDeferments();
    const idx = all.findIndex((d) => d.id === record.id);
    if (idx === -1) {
      setProcessing(false);
      return;
    }

    let newStatus: DefermentStatus;
    let stageLabel: string;
    let reviewer: string;

    if (action === "reject") {
      newStatus = "rejected";
      stageLabel =
        record.status === "hod_review" ? "HOD Review" : "Admin Review";
      reviewer = record.status === "hod_review" ? "HOD" : "Registrar/Admin";
    } else if (action === "reinstate") {
      newStatus = "reinstated";
      stageLabel = "Reinstatement Approved";
      reviewer = "Registrar/Admin";
    } else {
      // approve
      if (record.status === "hod_review") {
        newStatus = "admin_review";
        stageLabel = "HOD Recommendation";
        reviewer = "HOD";
      } else {
        newStatus = "active";
        stageLabel = "Deferment Confirmed";
        reviewer = "Registrar/Admin";
      }
    }

    const effectiveResumeDate =
      action === "approve" && record.status === "admin_review"
        ? resumeDate || computeResumeDate(record.duration)
        : record.resumeDate;

    all[idx] = {
      ...all[idx],
      status: newStatus,
      resumeDate: effectiveResumeDate,
      timeline: [
        ...all[idx].timeline,
        {
          stage: stageLabel,
          action,
          reviewer,
          comment:
            comment ||
            (action === "approve"
              ? "Approved."
              : action === "reinstate"
                ? "Reinstatement approved. Registration reactivated."
                : "Rejected."),
          timestamp: new Date().toISOString(),
        },
      ],
    };

    saveDeferments(all);
    setDeferments(all);
    setSelected(all[idx]);
    setComment("");
    setResumeDate("");
    setError("");
    setProcessing(false);
  }

  if (selected) {
    const cfg = STATUS_CONFIG[selected.status];
    const isHodReview = selected.status === "hod_review";
    const isAdminReview = selected.status === "admin_review";
    const isReinstatementPending = selected.status === "reinstatement_pending";
    const canAct = isHodReview || isAdminReview || isReinstatementPending;

    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(null);
              setComment("");
              setResumeDate("");
              setError("");
              setDeferments(getDeferments());
            }}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Deferment: {selected.id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selected.studentName} — {selected.studentMatric}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PauseCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold">
                  {REASON_LABELS[selected.reason] || selected.reason} —{" "}
                  {DURATION_LABELS[selected.duration] || selected.duration}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.department} | Submitted:{" "}
                  {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={`${cfg.color} border`}>{cfg.label}</Badge>
          </CardContent>
        </Card>

        {selected.status === "active" && selected.resumeDate && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 flex items-center gap-3 text-orange-800 text-sm">
              <CalendarDays className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold">Deferment Currently Active</p>
                <p>
                  Resume Date:{" "}
                  <strong>
                    {new Date(selected.resumeDate).toLocaleDateString()}
                  </strong>
                </p>
                <p className="text-xs">
                  Registration paused. No fees generated during this period.
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
                <p className="font-medium">
                  {REASON_LABELS[selected.reason] || selected.reason}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Duration Requested:
                </span>
                <p className="font-medium">
                  {DURATION_LABELS[selected.duration] || selected.duration}
                </p>
              </div>
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
            {selected.reinstatementNote && (
              <div>
                <span className="text-muted-foreground">
                  Reinstatement Note:
                </span>
                <p className="mt-1 p-2 bg-teal-50 rounded border border-teal-200">
                  {selected.reinstatementNote}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selected.timeline.map((entry, idx) => (
                <div key={`${entry.timestamp}-${idx}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${entry.action === "reject" ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"}`}
                    >
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

        {/* Action Panel */}
        {canAct && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isHodReview
                  ? "HOD Review Action"
                  : isAdminReview
                    ? "Admin / Registrar Action"
                    : "Reinstatement Review"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAdminReview && !isReinstatementPending && (
                <div className="space-y-1">
                  <Label>Set Resume Date *</Label>
                  <Input
                    type="date"
                    value={resumeDate}
                    onChange={(e) => setResumeDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The date the student's registration will be reactivated.
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <Label>Review Comment</Label>
                <Textarea
                  rows={3}
                  placeholder="Add your review comment or reason for decision..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {isReinstatementPending ? (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(selected, "reinstate")}
                    disabled={processing}
                    data-ocid="reinstate-approve-btn"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    Reinstatement
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleAction(selected, "reject")}
                    disabled={processing}
                    data-ocid="reinstate-reject-btn"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(selected, "approve")}
                    disabled={processing}
                    data-ocid="deferment-approve-btn"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isHodReview
                      ? "Recommend & Forward to Admin"
                      : "Confirm Deferment"}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleAction(selected, "reject")}
                    disabled={processing}
                    data-ocid="deferment-reject-btn"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Deferment Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Review deferment applications and manage reinstatements
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeferments(getDeferments())}
          data-ocid="deferment-refresh-btn"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Cases",
            value: stats.total,
            color: "text-foreground",
          },
          {
            label: "Awaiting Review",
            value: stats.awaitingReview,
            color: "text-blue-600",
          },
          {
            label: "Active Deferments",
            value: stats.active,
            color: "text-orange-600",
          },
          {
            label: "Reinstatement Pending",
            value: stats.reinstatementPending,
            color: "text-teal-600",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, matric, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="deferment-search"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <PauseCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No deferment cases found</h3>
            <p className="text-muted-foreground text-sm">
              No applications match your current filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((def) => {
            const cfg = STATUS_CONFIG[def.status];
            const needsAttention =
              def.status === "hod_review" ||
              def.status === "admin_review" ||
              def.status === "reinstatement_pending";
            return (
              <Card
                key={def.id}
                className="hover:shadow-md transition-shadow"
                data-ocid={`deferment-mgmt-row-${def.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${needsAttention ? "bg-blue-100" : def.status === "active" ? "bg-orange-100" : "bg-muted"}`}
                    >
                      {needsAttention ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : def.status === "active" ? (
                        <PauseCircle className="w-4 h-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {def.studentName}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({def.studentMatric})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {REASON_LABELS[def.reason] || def.reason} —{" "}
                        {DURATION_LABELS[def.duration] || def.duration}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {def.department} | Applied:{" "}
                        {new Date(def.createdAt).toLocaleDateString()}
                        {def.resumeDate
                          ? ` | Resume: ${new Date(def.resumeDate).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${cfg.color} border`}>{cfg.label}</Badge>
                    <Button
                      size="sm"
                      variant={needsAttention ? "default" : "outline"}
                      onClick={() => setSelected(def)}
                    >
                      {needsAttention ? "Review" : "View"}
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
