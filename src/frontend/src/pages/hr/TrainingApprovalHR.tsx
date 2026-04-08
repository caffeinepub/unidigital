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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  CheckCircle,
  DollarSign,
  PieChart,
  Upload,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type RequestStatus =
  | "Submitted"
  | "HOD Approved"
  | "HR Approved"
  | "Rejected"
  | "Completed";

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
  fundingSource?: string;
  poNumber?: string;
  certificateUploaded?: boolean;
  submittedAt: string;
  staffName?: string;
  staffDept?: string;
  gradeLevel?: string;
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  Submitted: "bg-blue-100 text-blue-700",
  "HOD Approved": "bg-cyan-100 text-cyan-700",
  "HR Approved": "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-purple-100 text-purple-700",
};

const FUNDING_SOURCES = [
  "Training & Development Fund",
  "Tetfund Grant",
  "NUC Allocation",
  "Departmental Budget",
  "External Grant",
];

function loadRequests(): TrainingRequest[] {
  const raw = localStorage.getItem("unidigital_training_requests");
  const base: TrainingRequest[] = raw ? JSON.parse(raw) : [];
  return base.map((r, i) => ({
    ...r,
    staffName:
      r.staffName ??
      ["Dr. Adebayo Ogundimu", "Mrs. Blessing Okeke", "Prof. Yakubu Musa"][
        i % 3
      ],
    staffDept: r.staffDept ?? "Computer Science",
    gradeLevel: r.gradeLevel ?? `GL ${8 + (i % 7)}`,
  }));
}

function saveRequests(data: TrainingRequest[]) {
  localStorage.setItem("unidigital_training_requests", JSON.stringify(data));
}

const TOTAL_BUDGET = 2000000;

export function TrainingApprovalHR() {
  const [requests, setRequests] = useState<TrainingRequest[]>(loadRequests);
  const [actionTarget, setActionTarget] = useState<{
    req: TrainingRequest;
    type: "approve" | "reject";
  } | null>(null);
  const [comment, setComment] = useState("");
  const [fundingSource, setFundingSource] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [certTarget, setCertTarget] = useState<TrainingRequest | null>(null);
  const [viewItem, setViewItem] = useState<TrainingRequest | null>(null);

  const hodApproved = requests.filter((r) => r.status === "HOD Approved");
  const hrApproved = requests.filter(
    (r) => r.status === "HR Approved" || r.status === "Completed",
  );
  const rejected = requests.filter((r) => r.status === "Rejected");
  const totalSpend = hrApproved.reduce((s, r) => s + r.estimatedCost, 0);
  const budgetPct = Math.min(
    100,
    Math.round((totalSpend / TOTAL_BUDGET) * 100),
  );

  const byDept = useMemo(() => {
    const map: Record<
      string,
      { approved: number; rejected: number; spend: number }
    > = {};
    for (const r of requests) {
      const d = r.staffDept ?? "Unknown";
      if (!map[d]) map[d] = { approved: 0, rejected: 0, spend: 0 };
      if (r.status === "HR Approved" || r.status === "Completed") {
        map[d].approved++;
        map[d].spend += r.estimatedCost;
      } else if (r.status === "Rejected") {
        map[d].rejected++;
      }
    }
    return map;
  }, [requests]);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of hrApproved) {
      map[r.trainingType] = (map[r.trainingType] ?? 0) + 1;
    }
    return map;
  }, [hrApproved]);

  const totalApproved = hrApproved.length;
  const typeMax = Math.max(...Object.values(byType), 1);

  const handleAction = () => {
    if (!actionTarget) return;
    const { req, type } = actionTarget;
    const updated = requests.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status:
              type === "approve"
                ? ("HR Approved" as const)
                : ("Rejected" as const),
            hrComment: comment || undefined,
            fundingSource:
              type === "approve" ? fundingSource || undefined : undefined,
            poNumber: type === "approve" ? poNumber || undefined : undefined,
          }
        : r,
    );
    saveRequests(updated);
    setRequests(updated);
    setActionTarget(null);
    setComment("");
    setFundingSource("");
    setPoNumber("");
    toast.success(
      type === "approve" ? "Training request approved." : "Request rejected.",
    );
  };

  const markCompleted = (id: string) => {
    const updated = requests.map((r) =>
      r.id === id
        ? { ...r, status: "Completed" as const, certificateUploaded: true }
        : r,
    );
    saveRequests(updated);
    setRequests(updated);
    setCertTarget(null);
    toast.success("Training marked as completed with certificate uploaded.");
  };

  return (
    <div className="space-y-6" data-ocid="hr-training.root">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="text-blue-600" size={22} />
          Training Approval — HR
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Final approval for HOD-approved training requests and training
          analytics
        </p>
      </div>

      {/* Budget tracker */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="text-blue-500" size={18} />
              <span className="font-semibold text-slate-700 text-sm">
                Annual Training Budget
              </span>
            </div>
            <span className="text-sm font-bold text-slate-800">
              ₦{totalSpend.toLocaleString()} / ₦{TOTAL_BUDGET.toLocaleString()}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full">
            <div
              className={`h-3 rounded-full transition-all ${budgetPct >= 80 ? "bg-red-500" : budgetPct >= 60 ? "bg-amber-500" : "bg-blue-500"}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{budgetPct}% utilized</span>
            <span>
              ₦{(TOTAL_BUDGET - totalSpend).toLocaleString()} remaining
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">
            Approval Queue ({hodApproved.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({hrApproved.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Queue */}
        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                HOD-Approved Requests Awaiting HR Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {hodApproved.length === 0 ? (
                <p
                  className="text-center text-slate-400 py-10"
                  data-ocid="hr-training.empty_state"
                >
                  No requests pending HR review.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Staff</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Training</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead className="text-right">Cost (₦)</TableHead>
                        <TableHead>HOD Comment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hodApproved.map((r, idx) => (
                        <TableRow
                          key={r.id}
                          data-ocid={`hr-training.queue.row.${idx + 1}`}
                        >
                          <TableCell className="text-sm font-medium">
                            {r.staffName ?? "Staff"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {r.gradeLevel ?? "GL 8"}
                          </TableCell>
                          <TableCell className="text-sm max-w-[160px] truncate">
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
                          <TableCell className="text-xs text-slate-500 max-w-[140px] truncate italic">
                            {r.hodComment ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => setViewItem(r)}
                                data-ocid={`hr-training.view_button.${idx + 1}`}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setActionTarget({ req: r, type: "approve" });
                                  setComment("");
                                  setFundingSource("");
                                  setPoNumber("");
                                }}
                                data-ocid={`hr-training.approve_button.${idx + 1}`}
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
                                data-ocid={`hr-training.reject_button.${idx + 1}`}
                              >
                                <XCircle size={12} className="mr-1" />
                                Reject
                              </Button>
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
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Approved & Completed Training
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {hrApproved.length === 0 ? (
                <p className="text-center text-slate-400 py-10">
                  No approved training requests yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Staff</TableHead>
                        <TableHead>Training</TableHead>
                        <TableHead>Funding Source</TableHead>
                        <TableHead>PO No.</TableHead>
                        <TableHead className="text-right">Cost (₦)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hrApproved.map((r, idx) => (
                        <TableRow
                          key={r.id}
                          data-ocid={`hr-training.approved.row.${idx + 1}`}
                        >
                          <TableCell className="text-sm font-medium">
                            {r.staffName ?? "Staff"}
                          </TableCell>
                          <TableCell className="text-sm max-w-[160px] truncate">
                            {r.trainingName}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {r.fundingSource ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-slate-500">
                            {r.poNumber ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm font-mono">
                            {r.estimatedCost.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${STATUS_COLORS[r.status as RequestStatus]}`}
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {r.certificateUploaded ? (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                <Award size={10} className="mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-xs">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {r.status === "HR Approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => setCertTarget(r)}
                                data-ocid={`hr-training.cert_button.${idx + 1}`}
                              >
                                <Upload size={11} className="mr-1" />
                                Upload Cert
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-700">
                  {totalApproved}
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium uppercase tracking-wide">
                  Total Approved
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-700">
                  {rejected.length}
                </p>
                <p className="text-xs text-red-600 mt-1 font-medium uppercase tracking-wide">
                  Total Rejected
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">
                  {hodApproved.length}
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium uppercase tracking-wide">
                  Pending HR Action
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart size={16} className="text-slate-400" />
                  Training by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(byDept).length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">
                    No data yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byDept).map(([dept, d]) => (
                      <div key={dept}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 truncate">
                            {dept}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {d.approved} approved · ₦{d.spend.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-1 h-2">
                          <div
                            className="h-2 bg-green-400 rounded-l"
                            style={{
                              width: `${(d.approved / Math.max(totalApproved, 1)) * 100}%`,
                            }}
                          />
                          <div
                            className="h-2 bg-red-300 rounded-r"
                            style={{
                              width: `${(d.rejected / Math.max(totalApproved + rejected.length, 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Training Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Popular Training Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(byType).length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">
                    No approved training yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byType)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">{type}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full">
                            <div
                              className="h-2 bg-blue-400 rounded-full"
                              style={{
                                width: `${(count / typeMax) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve / Reject Dialog */}
      <Dialog
        open={!!actionTarget}
        onOpenChange={(o) => {
          if (!o) setActionTarget(null);
        }}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="hr-training.action_dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.type === "approve"
                ? "Approve Training Request"
                : "Reject Training Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">
                {actionTarget?.req.trainingName}
              </span>{" "}
              — {actionTarget?.req.staffName}
            </p>
            <p className="text-xs text-slate-500">
              Cost: ₦{actionTarget?.req.estimatedCost.toLocaleString()} | Budget
              remaining: ₦{(TOTAL_BUDGET - totalSpend).toLocaleString()}
            </p>
            {actionTarget?.type === "approve" && (
              <>
                <div>
                  <Label>Funding Source</Label>
                  <Select
                    value={fundingSource}
                    onValueChange={setFundingSource}
                  >
                    <SelectTrigger
                      className="mt-1"
                      data-ocid="hr-training.funding_select"
                    >
                      <SelectValue placeholder="Select funding source…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_SOURCES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Purchase Order (PO) Number</Label>
                  <Input
                    className="mt-1"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-2024-0078"
                    data-ocid="hr-training.po_input"
                  />
                </div>
              </>
            )}
            <div>
              <Label>
                {actionTarget?.type === "approve"
                  ? "HR Comment (optional)"
                  : "Reason for Rejection"}
              </Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionTarget?.type === "approve"
                    ? "Approval notes…"
                    : "State reason for rejection…"
                }
                data-ocid="hr-training.comment_textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionTarget(null)}
              data-ocid="hr-training.cancel_button"
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
              data-ocid="hr-training.confirm_button"
            >
              {actionTarget?.type === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Upload Dialog */}
      <Dialog
        open={!!certTarget}
        onOpenChange={(o) => {
          if (!o) setCertTarget(null);
        }}
      >
        <DialogContent data-ocid="hr-training.cert_dialog">
          <DialogHeader>
            <DialogTitle>Upload Completion Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Staff:{" "}
              <span className="font-medium">{certTarget?.staffName}</span>
            </p>
            <p className="text-sm text-slate-600">
              Training:{" "}
              <span className="font-medium">{certTarget?.trainingName}</span>
            </p>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <Upload className="mx-auto text-slate-300 mb-2" size={28} />
              <p className="text-sm text-slate-500">
                Drag & drop certificate PDF or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG accepted
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                data-ocid="hr-training.cert_browse_button"
              >
                Browse Files
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCertTarget(null)}
              data-ocid="hr-training.cert_cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => certTarget && markCompleted(certTarget.id)}
              data-ocid="hr-training.cert_confirm_button"
            >
              <CheckCircle size={14} className="mr-1.5" />
              Mark as Completed
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
          data-ocid="hr-training.view_dialog"
        >
          <DialogHeader>
            <DialogTitle>{viewItem?.trainingName}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{viewItem.trainingType}</Badge>
                <Badge
                  className={
                    STATUS_COLORS[viewItem.status as RequestStatus] ??
                    "bg-slate-100 text-slate-700"
                  }
                >
                  {viewItem.status}
                </Badge>
              </div>
              {[
                ["Staff", viewItem.staffName ?? "—"],
                ["Grade Level", viewItem.gradeLevel ?? "—"],
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
              data-ocid="hr-training.view_close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
