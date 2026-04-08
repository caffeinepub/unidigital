import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, TrendingUp, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RequestStatus = "Submitted" | "HOD Approved" | "HR Approved" | "Rejected";

interface TrainingRequest {
  id: string;
  trainingName: string;
  trainingType: string;
  organizingBody: string;
  location: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  justification: string;
  expectedOutcomes: string;
  status: RequestStatus;
  hodComment?: string;
  hrComment?: string;
  submittedAt: string;
  staffName?: string;
  staffDept?: string;
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  Submitted: "bg-blue-100 text-blue-700",
  "HOD Approved": "bg-cyan-100 text-cyan-700",
  "HR Approved": "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

function loadRequests(): TrainingRequest[] {
  const raw = localStorage.getItem("unidigital_training_requests");
  const base: TrainingRequest[] = raw ? JSON.parse(raw) : [];
  // Enrich with staff names for HOD view
  const withStaff: TrainingRequest[] = base.map((r, i) => ({
    ...r,
    staffName:
      r.staffName ??
      ["Dr. Adebayo Ogundimu", "Mrs. Blessing Okeke", "Prof. Yakubu Musa"][
        i % 3
      ],
    staffDept: r.staffDept ?? "Computer Science",
  }));
  return withStaff;
}

function saveRequests(data: TrainingRequest[]) {
  // Strip internal HOD-view fields before saving
  localStorage.setItem("unidigital_training_requests", JSON.stringify(data));
}

const DEPT_BUDGET = 500000; // Annual training budget

export function TrainingApprovalHOD() {
  const [requests, setRequests] = useState<TrainingRequest[]>(loadRequests);
  const [actionTarget, setActionTarget] = useState<{
    req: TrainingRequest;
    type: "approve" | "reject";
  } | null>(null);
  const [comment, setComment] = useState("");
  const [viewItem, setViewItem] = useState<TrainingRequest | null>(null);

  const pending = requests.filter((r) => r.status === "Submitted");
  const approvedSpend = requests
    .filter((r) => r.status === "HOD Approved" || r.status === "HR Approved")
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  const handleAction = () => {
    if (!actionTarget) return;
    const { req, type } = actionTarget;
    const updated = requests.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status:
              type === "approve"
                ? ("HOD Approved" as const)
                : ("Rejected" as const),
            hodComment: comment || undefined,
          }
        : r,
    );
    saveRequests(updated);
    setRequests(updated);
    setActionTarget(null);
    setComment("");
    toast.success(
      type === "approve"
        ? "Request approved and forwarded to HR."
        : "Request rejected.",
    );
  };

  const budgetPct = Math.min(
    100,
    Math.round((approvedSpend / DEPT_BUDGET) * 100),
  );

  return (
    <div className="space-y-6" data-ocid="hod-training.root">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle className="text-cyan-600" size={22} />
          Training Approval — HOD
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Review and approve staff training requests from your department
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">
                Pending Review
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {pending.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-cyan-200 bg-cyan-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <CheckCircle className="text-cyan-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-cyan-700 font-medium uppercase tracking-wide">
                HOD Approved
              </p>
              <p className="text-2xl font-bold text-cyan-800">
                {
                  requests.filter(
                    (r) =>
                      r.status === "HOD Approved" || r.status === "HR Approved",
                  ).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-slate-500" size={16} />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Dept Training Budget
              </p>
            </div>
            <p className="text-sm font-bold text-slate-800">
              ₦{approvedSpend.toLocaleString()} / ₦
              {DEPT_BUDGET.toLocaleString()}
            </p>
            <div className="mt-2 h-2 bg-slate-100 rounded-full">
              <div
                className={`h-2 rounded-full ${budgetPct >= 80 ? "bg-red-500" : "bg-cyan-500"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {budgetPct}% of annual budget used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Staff Training Requests — Department
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <p
              className="text-center text-slate-400 py-10"
              data-ocid="hod-training.empty_state"
            >
              No training requests from your department.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Training</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Cost (₦)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r, idx) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`hod-training.row.${idx + 1}`}
                    >
                      <TableCell className="text-sm font-medium">
                        {r.staffName ?? "Staff Member"}
                      </TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate">
                        {r.trainingName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {r.trainingType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {r.startDate} → {r.endDate}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {r.estimatedCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_COLORS[r.status]}`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setViewItem(r)}
                            data-ocid={`hod-training.view_button.${idx + 1}`}
                          >
                            View
                          </Button>
                          {r.status === "Submitted" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setActionTarget({ req: r, type: "approve" });
                                  setComment("");
                                }}
                                data-ocid={`hod-training.approve_button.${idx + 1}`}
                              >
                                <CheckCircle size={12} className="mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setActionTarget({ req: r, type: "reject" });
                                  setComment("");
                                }}
                                data-ocid={`hod-training.reject_button.${idx + 1}`}
                              >
                                <XCircle size={12} className="mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve / Reject Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={(o) => {
          if (!o) setActionTarget(null);
        }}
      >
        <DialogContent data-ocid="hod-training.action_dialog">
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.type === "approve"
                ? "Approve Training Request"
                : "Reject Training Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Training:{" "}
              <span className="font-semibold">
                {actionTarget?.req.trainingName}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              Staff: {actionTarget?.req.staffName ?? "Staff Member"} | Cost: ₦
              {actionTarget?.req.estimatedCost.toLocaleString()}
            </p>
            <div>
              <Label>
                {actionTarget?.type === "approve"
                  ? "Comment (optional)"
                  : "Reason for Rejection"}
              </Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionTarget?.type === "approve"
                    ? "Add a comment for HR…"
                    : "State the reason for rejection…"
                }
                data-ocid="hod-training.comment_textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionTarget(null)}
              data-ocid="hod-training.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className={
                actionTarget?.type === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              data-ocid="hod-training.confirm_button"
            >
              {actionTarget?.type === "approve"
                ? "Approve & Forward to HR"
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewItem}
        onOpenChange={(o) => {
          if (!o) setViewItem(null);
        }}
      >
        <DialogContent
          className="max-w-xl max-h-[85vh] overflow-y-auto"
          data-ocid="hod-training.view_dialog"
        >
          <DialogHeader>
            <DialogTitle>{viewItem?.trainingName}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{viewItem.trainingType}</Badge>
                <Badge className={STATUS_COLORS[viewItem.status]}>
                  {viewItem.status}
                </Badge>
              </div>
              {[
                ["Staff", viewItem.staffName ?? "Staff Member"],
                ["Organizing Body", viewItem.organizingBody],
                ["Location", viewItem.location],
                ["Dates", `${viewItem.startDate} → ${viewItem.endDate}`],
                ["Est. Cost", `₦${viewItem.estimatedCost.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-400 min-w-[130px] shrink-0">
                    {k}:
                  </span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div>
                <p className="text-slate-500 font-medium mb-1">
                  Justification:
                </p>
                <p className="text-xs bg-slate-50 p-2 rounded text-slate-700">
                  {viewItem.justification}
                </p>
              </div>
              {viewItem.expectedOutcomes && (
                <div>
                  <p className="text-slate-500 font-medium mb-1">
                    Expected Outcomes:
                  </p>
                  <p className="text-xs bg-slate-50 p-2 rounded text-slate-700">
                    {viewItem.expectedOutcomes}
                  </p>
                </div>
              )}
              {viewItem.hodComment && (
                <div className="border-l-4 border-cyan-400 pl-3 bg-cyan-50 py-2 rounded-r text-xs">
                  <p className="font-semibold text-cyan-700">HOD Comment</p>
                  <p className="text-slate-700 mt-0.5">{viewItem.hodComment}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setViewItem(null)}
              data-ocid="hod-training.view_close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
