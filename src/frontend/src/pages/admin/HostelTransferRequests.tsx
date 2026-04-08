import {
  ArrowRightLeft,
  CheckCircle,
  Clock,
  History,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";

export interface TransferRequest {
  id: string;
  studentName: string;
  studentMatric: string;
  currentRoom: string;
  requestedBlock: string;
  reason: string;
  urgency: "low" | "medium" | "high";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  resolvedAt?: string;
}

function buildInitialRequests(): TransferRequest[] {
  const stored = localStorage.getItem("unidigital_transfer_requests");
  if (stored) return JSON.parse(stored);

  const seed: TransferRequest[] = [
    {
      id: "TR001",
      studentName: "Amara Okonkwo",
      studentMatric: "CSC/2021/001",
      currentRoom: "A-101",
      requestedBlock: "Block B",
      reason:
        "Need to be closer to the library for final year project research.",
      urgency: "medium",
      submittedAt: "2024-02-10",
      status: "pending",
    },
    {
      id: "TR002",
      studentName: "Emeka Nwosu",
      studentMatric: "ENG/2021/002",
      currentRoom: "B-105",
      requestedBlock: "Block A",
      reason:
        "Medical condition requires ground-floor accommodation (doctor's note attached).",
      urgency: "high",
      submittedAt: "2024-02-12",
      status: "pending",
    },
    {
      id: "TR003",
      studentName: "Fatima Bello",
      studentMatric: "MED/2021/003",
      currentRoom: "C-103",
      requestedBlock: "Block B",
      reason: "Current roommates causing disturbance during study hours.",
      urgency: "low",
      submittedAt: "2024-01-28",
      status: "approved",
      adminNote: "Transfer approved. New room assigned in Block B.",
      resolvedAt: "2024-02-01",
    },
    {
      id: "TR004",
      studentName: "Chukwudi Eze",
      studentMatric: "LAW/2021/004",
      currentRoom: "A-108",
      requestedBlock: "Block C",
      reason: "Prefer quieter environment in Block C for law studies.",
      urgency: "low",
      submittedAt: "2024-02-05",
      status: "rejected",
      adminNote:
        "No available space in Block C for the current semester. Reapply next semester.",
      resolvedAt: "2024-02-08",
    },
  ];
  localStorage.setItem("unidigital_transfer_requests", JSON.stringify(seed));
  return seed;
}

function saveRequests(data: TransferRequest[]) {
  localStorage.setItem("unidigital_transfer_requests", JSON.stringify(data));
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    class: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    class: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    class: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

const URGENCY_CONFIG = {
  low: { label: "Low", class: "bg-blue-100 text-blue-700" },
  medium: { label: "Medium", class: "bg-amber-100 text-amber-700" },
  high: { label: "High", class: "bg-red-100 text-red-700" },
};

export function HostelTransferRequests() {
  const [requests, setRequests] =
    useState<TransferRequest[]>(buildInitialRequests);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "pending" | "approved" | "rejected"
  >("All");
  const [showHistory, setShowHistory] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<TransferRequest | null>(
    null,
  );
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [adminNote, setAdminNote] = useState("");

  const filtered = useMemo(() => {
    const base = showHistory
      ? requests.filter((r) => r.status !== "pending")
      : requests;
    return statusFilter === "All"
      ? base
      : base.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter, showHistory]);

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const openReview = (req: TransferRequest) => {
    setReviewRequest(req);
    setDecision("approved");
    setAdminNote("");
  };

  const handleResolve = () => {
    if (!reviewRequest) return;
    const updated = requests.map((r) =>
      r.id === reviewRequest.id
        ? {
            ...r,
            status: decision,
            adminNote,
            resolvedAt: new Date().toISOString().split("T")[0],
          }
        : r,
    );
    setRequests(updated);
    saveRequests(updated);
    toast.success(
      `Transfer request ${decision === "approved" ? "approved" : "rejected"}`,
    );
    setReviewRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft size={22} className="text-primary" />
            Hostel Transfer Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage student room transfer applications
          </p>
        </div>
        <Button
          variant={showHistory ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowHistory(!showHistory);
            setStatusFilter("All");
          }}
          data-ocid="hostel-transfer.toggle_history"
        >
          <History size={14} className="mr-2" />
          {showHistory ? "Show Active" : "View Transfer History"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(["pending", "approved", "rejected"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <Card key={s}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon
                  size={20}
                  className={`${s === "pending" ? "text-amber-500" : s === "approved" ? "text-green-600" : "text-red-500"}`}
                />
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {counts[s]}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {s}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-sm">Filter:</Label>
        {(["All", "pending", "approved", "rejected"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            data-ocid={`hostel-transfer.filter.${s}`}
          >
            {s === "All" ? "All" : STATUS_CONFIG[s].label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {showHistory ? "Transfer History" : "Active Requests"} (
            {filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="hostel-transfer.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Current Room</TableHead>
                  <TableHead>Requested Block</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {!showHistory && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-10"
                      data-ocid="hostel-transfer.empty_state"
                    >
                      No transfer requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((req, i) => {
                    const sCfg = STATUS_CONFIG[req.status];
                    const uCfg = URGENCY_CONFIG[req.urgency];
                    return (
                      <TableRow
                        key={req.id}
                        data-ocid={`hostel-transfer.row.${i + 1}`}
                      >
                        <TableCell>
                          <p className="text-sm font-medium">
                            {req.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {req.studentMatric}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {req.currentRoom}
                        </TableCell>
                        <TableCell className="text-sm">
                          {req.requestedBlock}
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${uCfg.class}`}>
                            {uCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.submittedAt}
                        </TableCell>
                        <TableCell>
                          <Badge className={`border-0 text-xs ${sCfg.class}`}>
                            {sCfg.label}
                          </Badge>
                        </TableCell>
                        {!showHistory && (
                          <TableCell>
                            {req.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReview(req)}
                                data-ocid={`hostel-transfer.review_button.${i + 1}`}
                              >
                                Review
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* History note */}
      {showHistory && (
        <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
          Showing all resolved transfer requests. Approved transfers have been
          applied to the allocation matrix automatically.
        </div>
      )}

      {/* Review Dialog */}
      <Dialog
        open={!!reviewRequest}
        onOpenChange={(o) => !o && setReviewRequest(null)}
      >
        <DialogContent data-ocid="hostel-transfer.review_dialog">
          <DialogHeader>
            <DialogTitle>Review Transfer Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">
                  {reviewRequest?.studentName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matric</span>
                <span className="font-mono text-xs">
                  {reviewRequest?.studentMatric}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Room</span>
                <span className="font-medium">
                  {reviewRequest?.currentRoom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested Block</span>
                <span className="font-medium">
                  {reviewRequest?.requestedBlock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Urgency</span>
                <Badge
                  className={`border-0 text-xs ${URGENCY_CONFIG[reviewRequest?.urgency ?? "low"].class}`}
                >
                  {reviewRequest?.urgency}
                </Badge>
              </div>
              <div className="pt-1 border-t border-border">
                <p className="text-muted-foreground mb-1">Reason:</p>
                <p className="text-foreground">{reviewRequest?.reason}</p>
              </div>
            </div>

            <div>
              <Label>Decision</Label>
              <Select
                value={decision}
                onValueChange={(v) => setDecision(v as "approved" | "rejected")}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="hostel-transfer.decision_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve Transfer</SelectItem>
                  <SelectItem value="rejected">Reject Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Admin Note (optional)</Label>
              <Textarea
                className="mt-1"
                rows={2}
                placeholder="Reason for approval or rejection..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                data-ocid="hostel-transfer.admin_note_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewRequest(null)}
              data-ocid="hostel-transfer.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className={
                decision === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              onClick={handleResolve}
              data-ocid="hostel-transfer.confirm_button"
            >
              {decision === "approved" ? "Approve" : "Reject"} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
