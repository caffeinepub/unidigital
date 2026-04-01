import { useState } from "react";
import {
  type ApprovalStage,
  type RequestType,
  type StaffRequest,
  useStaffRequests,
} from "../../contexts/StaffRequestContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const STAGES: ApprovalStage[] = ["hod", "dean", "dvc", "vc"];
const STAGE_LABELS: Record<ApprovalStage, string> = {
  hod: "HOD / Unit Head",
  dean: "Dean",
  dvc: "DVC / Registrar",
  vc: "Vice Chancellor",
};

function StatusBadge({ status }: { status: StaffRequest["status"] }) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>
    );
  if (status === "rejected")
    return <Badge className="bg-red-100 text-red-700 border-0">Rejected</Badge>;
  return (
    <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
  );
}

function ApprovalTimeline({ request }: { request: StaffRequest }) {
  return (
    <div className="space-y-3">
      {STAGES.map((stage, i) => {
        const record = request.stageHistory.find((r) => r.stage === stage);
        const isCurrent =
          request.status === "pending" && request.currentStage === stage;
        const _isPending = !record && !isCurrent;
        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  record?.decision === "approved"
                    ? "bg-green-100 text-green-700"
                    : record?.decision === "rejected"
                      ? "bg-red-100 text-red-700"
                      : isCurrent
                        ? "bg-blue-100 text-blue-700 animate-pulse"
                        : "bg-slate-100 text-slate-400"
                }`}
              >
                {record?.decision === "approved"
                  ? "✓"
                  : record?.decision === "rejected"
                    ? "✗"
                    : i + 1}
              </div>
              {i < STAGES.length - 1 && (
                <div className="w-0.5 h-5 bg-slate-200 my-1" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-medium">{STAGE_LABELS[stage]}</p>
              {record ? (
                <>
                  <p className="text-xs text-slate-500">
                    {record.decidedBy} &mdash;{" "}
                    {new Date(record.decidedAt).toLocaleDateString()}
                  </p>
                  {record.comment && (
                    <p className="text-xs text-slate-600 mt-0.5 italic">
                      &ldquo;{record.comment}&rdquo;
                    </p>
                  )}
                </>
              ) : isCurrent ? (
                <p className="text-xs text-blue-600">Awaiting decision</p>
              ) : (
                <p className="text-xs text-slate-400">Not yet reached</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  userName: string;
  userRole: string;
}

export function StaffRequests({ userName, userRole }: Props) {
  const { requests, submitRequest, processRequest } = useStaffRequests();
  const [tab, setTab] = useState<"mine" | "approvals">("mine");
  const [newOpen, setNewOpen] = useState(false);
  const [trackRequest, setTrackRequest] = useState<StaffRequest | null>(null);
  const [processOpen, setProcessOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processDecision, setProcessDecision] = useState<
    "approved" | "rejected"
  >("approved");
  const [processComment, setProcessComment] = useState("");
  const [form, setForm] = useState({
    requestType: "leave" as RequestType,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const myRequests = requests.filter((r) => r.submittedByName === userName);
  const pendingApprovals = requests.filter((r) => r.status === "pending");

  const handleSubmit = async () => {
    if (!form.description) return;
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 400));
    submitRequest({
      id: `req_${Date.now()}`,
      submittedByName: userName,
      submittedByRole: userRole,
      requestType: form.requestType,
      description: form.description,
      status: "pending",
      currentStage: "hod",
      stageHistory: [],
      createdAt: Date.now(),
    });
    setSubmitting(false);
    setNewOpen(false);
    setForm({ requestType: "leave", description: "" });
    setTab("mine");
  };

  const handleProcess = () => {
    if (!processingId) return;
    processRequest(processingId, processDecision, processComment, userName);
    setProcessOpen(false);
    setProcessingId(null);
    setProcessComment("");
  };

  const typeLabel: Record<RequestType, string> = {
    leave: "Leave",
    travel: "Travel",
    training: "Training",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Staff Requests</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setNewOpen(true)}
        >
          New Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {(["mine", "approvals"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "mine"
              ? `My Requests (${myRequests.length})`
              : `Pending Approvals (${pendingApprovals.length})`}
          </button>
        ))}
      </div>

      {tab === "mine" && (
        <div className="space-y-3">
          {myRequests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-slate-400">
                No requests submitted yet.
              </CardContent>
            </Card>
          )}
          {myRequests.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className="bg-slate-100 text-slate-700 border-0">
                        {typeLabel[r.requestType]}
                      </Badge>
                      <StatusBadge status={r.status} />
                      {r.status === "pending" && (
                        <span className="text-xs text-blue-600">
                          At: {STAGE_LABELS[r.currentStage]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">
                      {r.description.slice(0, 120)}
                      {r.description.length > 120 ? "..." : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTrackRequest(r)}
                  >
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "approvals" && (
        <div className="space-y-3">
          {pendingApprovals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-slate-400">
                No pending approvals.
              </CardContent>
            </Card>
          )}
          {pendingApprovals.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">
                        {r.submittedByName}
                      </p>
                      <Badge className="bg-slate-100 text-slate-700 border-0">
                        {typeLabel[r.requestType]}
                      </Badge>
                      <span className="text-xs text-blue-600">
                        Stage: {STAGE_LABELS[r.currentStage]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {r.description.slice(0, 100)}
                      {r.description.length > 100 ? "..." : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted: {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setProcessingId(r.id);
                        setProcessDecision("approved");
                        setProcessOpen(true);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setProcessingId(r.id);
                        setProcessDecision("rejected");
                        setProcessOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Track Dialog */}
      <Dialog
        open={!!trackRequest}
        onOpenChange={(o) => {
          if (!o) setTrackRequest(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Tracking</DialogTitle>
          </DialogHeader>
          {trackRequest && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-slate-100 text-slate-700 border-0">
                    {typeLabel[trackRequest.requestType]}
                  </Badge>
                  <StatusBadge status={trackRequest.status} />
                </div>
                <p className="text-sm text-slate-700">
                  {trackRequest.description}
                </p>
              </div>
              <ApprovalTimeline request={trackRequest} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processDecision === "approved" ? "Approve" : "Reject"} Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Comment (optional)</Label>
              <Textarea
                className="mt-1"
                value={processComment}
                onChange={(e) => setProcessComment(e.target.value)}
                rows={3}
                placeholder="Add a comment..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProcessOpen(false)}>
                Cancel
              </Button>
              <Button
                className={
                  processDecision === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
                onClick={handleProcess}
              >
                Confirm{" "}
                {processDecision === "approved" ? "Approval" : "Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Request Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Staff Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Request Type</Label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                value={form.requestType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    requestType: e.target.value as RequestType,
                  }))
                }
              >
                <option value="leave">Leave Request</option>
                <option value="travel">Travel Request</option>
                <option value="training">Training Request</option>
              </select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe your request in detail..."
              />
            </div>
            <div className="text-xs text-slate-500 bg-blue-50 rounded p-2">
              Your request will go through: HOD → Dean → DVC/Registrar → Vice
              Chancellor
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={!form.description || submitting}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
