import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
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
import type {
  TransferRequest,
  TransferStatus,
} from "../student/DepartmentTransfer";

const STORAGE_KEY = "unidigital_transfer_requests";

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

const STATUS_CONFIG: Record<TransferStatus, { label: string; color: string }> =
  {
    pending: {
      label: "Pending",
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
    source_hod_review: {
      label: "Source HOD Review",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    dest_hod_review: {
      label: "Dest HOD Review",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    registrar_review: {
      label: "Registrar Review",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    approved: {
      label: "Approved",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-700 border-red-200",
    },
  };

const NEXT_STAGE: Partial<Record<TransferStatus, TransferStatus>> = {
  source_hod_review: "dest_hod_review",
  dest_hod_review: "registrar_review",
  registrar_review: "approved",
};

const STAGE_LABEL: Record<string, string> = {
  source_hod_review: "Source HOD",
  dest_hod_review: "Destination HOD",
  registrar_review: "Registrar/Admin",
};

export function TransferManagement() {
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [selected, setSelected] = useState<TransferRequest | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setRequests(getTransferRequests());
  }, []);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentMatric.toLowerCase().includes(search.toLowerCase()) ||
      r.currentDepartment.toLowerCase().includes(search.toLowerCase()) ||
      r.targetDepartment.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleAction(
    request: TransferRequest,
    action: "approve" | "reject",
  ) {
    setProcessing(true);
    const all = getTransferRequests();
    const idx = all.findIndex((r) => r.id === request.id);
    if (idx === -1) {
      setProcessing(false);
      return;
    }

    const reviewer = STAGE_LABEL[request.status] || "Admin";
    const newTimeline = [
      ...request.timeline,
      {
        stage: STAGE_LABEL[request.status] || "Review",
        action,
        reviewer,
        comment:
          comment ||
          (action === "approve"
            ? "Approved and forwarded to next stage."
            : "Request rejected."),
        timestamp: new Date().toISOString(),
      },
    ];

    let newStatus: TransferStatus;
    if (action === "reject") {
      newStatus = "rejected";
    } else {
      newStatus = NEXT_STAGE[request.status] ?? "approved";
    }

    all[idx] = { ...all[idx], status: newStatus, timeline: newTimeline };

    // If finally approved, update student's department
    if (newStatus === "approved") {
      try {
        const students = JSON.parse(
          localStorage.getItem("unidigital_students") || "[]",
        );
        const sIdx = students.findIndex(
          (s: { matricNumber: string }) =>
            s.matricNumber === request.studentMatric,
        );
        if (sIdx !== -1) {
          students[sIdx].department = request.targetDepartment;
          localStorage.setItem("unidigital_students", JSON.stringify(students));
        }
      } catch {
        /* silent */
      }
    }

    saveTransferRequests(all);
    setRequests(all);
    setSelected(all[idx]);
    setComment("");
    setProcessing(false);
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) =>
        r.status === "source_hod_review" ||
        r.status === "dest_hod_review" ||
        r.status === "registrar_review",
    ).length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (selected) {
    const cfg = STATUS_CONFIG[selected.status];
    const canAct =
      selected.status !== "approved" &&
      selected.status !== "rejected" &&
      selected.status !== "pending";
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(null);
              setComment("");
              setRequests(getTransferRequests());
            }}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Transfer Request: {selected.id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selected.studentName} — {selected.studentMatric}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">
                  {selected.currentDepartment} → {selected.targetDepartment}
                </p>
                <p className="text-xs text-muted-foreground">
                  Session: {selected.session} | Submitted:{" "}
                  {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={`${cfg.color} border`}>{cfg.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">
                Reason for Transfer
              </span>
              <p className="p-2 bg-muted rounded">{selected.reason}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">
                Application Letter Summary
              </span>
              <p className="p-2 bg-muted rounded">
                {selected.applicationLetter}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">
                HOD Recommendation Summary
              </span>
              <p className="p-2 bg-muted rounded">
                {selected.hodRecommendation}
              </p>
            </div>
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
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">
                Review Action — {STAGE_LABEL[selected.status]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Review Comment</Label>
                <Textarea
                  rows={3}
                  placeholder="Add your review comment or reason for decision..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAction(selected, "approve")}
                  disabled={processing}
                  data-ocid="transfer-approve-btn"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {selected.status === "registrar_review"
                    ? "Final Approve & Update Record"
                    : "Approve & Forward"}
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleAction(selected, "reject")}
                  disabled={processing}
                  data-ocid="transfer-reject-btn"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>
              {selected.status === "registrar_review" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Final approval will
                  automatically update the student's department record.
                </p>
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
            Transfer Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and process department transfer requests
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRequests(getTransferRequests())}
          data-ocid="transfer-refresh-btn"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Requests",
            value: stats.total,
            color: "text-foreground",
          },
          {
            label: "Awaiting Review",
            value: stats.pending,
            color: "text-blue-600",
          },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600" },
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
            data-ocid="transfer-search"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
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

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <ArrowRight className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">
              No transfer requests found
            </h3>
            <p className="text-muted-foreground text-sm">
              No requests match your current filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const canAct =
              req.status !== "approved" &&
              req.status !== "rejected" &&
              req.status !== "pending";
            return (
              <Card
                key={req.id}
                className="hover:shadow-md transition-shadow"
                data-ocid={`transfer-mgmt-row-${req.id}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${canAct ? "bg-blue-100" : req.status === "approved" ? "bg-green-100" : "bg-muted"}`}
                    >
                      <ArrowRight
                        className={`w-4 h-4 ${canAct ? "text-blue-600" : req.status === "approved" ? "text-green-600" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {req.studentName}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({req.studentMatric})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.currentDepartment} → {req.targetDepartment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Session: {req.session} |{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${cfg.color} border`}>{cfg.label}</Badge>
                    <Button
                      size="sm"
                      variant={canAct ? "default" : "outline"}
                      onClick={() => setSelected(req)}
                    >
                      {canAct ? "Review" : "View"}
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
