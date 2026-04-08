import {
  ArrowRightLeft,
  CheckCircle,
  Clock,
  PlusCircle,
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
import { Input } from "../../components/ui/input";
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
import type { TransferRequest } from "../admin/HostelTransferRequests";

const STUDENT_MATRIC = "CSC/2021/001";
const STUDENT_NAME = "Amara Okonkwo";
const BLOCKS = ["Block A", "Block B", "Block C"];

function getStudentCurrentRoom(): string {
  const matrix = JSON.parse(
    localStorage.getItem("unidigital_hostel_matrix") || "[]",
  );
  for (const room of matrix) {
    if (
      room.beds?.some(
        (b: { studentMatric?: string } | null) =>
          b?.studentMatric === STUDENT_MATRIC,
      )
    ) {
      return room.roomNumber as string;
    }
  }
  // Fallback to hostel apps
  const apps = JSON.parse(
    localStorage.getItem("unidigital_hostel_apps") || "[]",
  );
  const app = apps.find(
    (a: { studentMatric: string; status: string; roomNumber: string }) =>
      a.studentMatric === STUDENT_MATRIC && a.status === "approved",
  );
  return app?.roomNumber || "A-101";
}

function getMyRequests(): TransferRequest[] {
  const all: TransferRequest[] = JSON.parse(
    localStorage.getItem("unidigital_transfer_requests") || "[]",
  );
  return all.filter((r) => r.studentMatric === STUDENT_MATRIC);
}

function saveNewRequest(req: TransferRequest) {
  const all: TransferRequest[] = JSON.parse(
    localStorage.getItem("unidigital_transfer_requests") || "[]",
  );
  all.unshift(req);
  localStorage.setItem("unidigital_transfer_requests", JSON.stringify(all));
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
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

export function HostelTransferForm() {
  const currentRoom = useMemo(() => getStudentCurrentRoom(), []);
  const [myRequests, setMyRequests] =
    useState<TransferRequest[]>(getMyRequests);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    requestedBlock: "",
    reason: "",
    urgency: "medium" as "low" | "medium" | "high",
  });
  const [submitting, setSubmitting] = useState(false);

  const hasPending = myRequests.some((r) => r.status === "pending");

  const handleSubmit = () => {
    if (!form.requestedBlock || !form.reason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const newReq: TransferRequest = {
      id: `TR-${Date.now()}`,
      studentName: STUDENT_NAME,
      studentMatric: STUDENT_MATRIC,
      currentRoom,
      requestedBlock: form.requestedBlock,
      reason: form.reason.trim(),
      urgency: form.urgency,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    saveNewRequest(newReq);
    setMyRequests((prev) => [newReq, ...prev]);
    setForm({ requestedBlock: "", reason: "", urgency: "medium" });
    setSubmitting(false);
    setDialogOpen(false);
    toast.success("Transfer request submitted successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft size={22} className="text-primary" />
            Room Transfer Request
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit a request to transfer to a different block or room
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={hasPending}
          className="bg-primary hover:bg-primary/90"
          data-ocid="hostel-transfer-form.open_dialog_button"
        >
          <PlusCircle size={14} className="mr-2" />
          New Transfer Request
        </Button>
      </div>

      {hasPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-700">
          <Clock size={14} />
          You have a pending transfer request. Wait for Admin review before
          submitting another.
        </div>
      )}

      {/* Current Room Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <ArrowRightLeft size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Room</p>
            <p className="text-xl font-bold text-foreground">{currentRoom}</p>
            <p className="text-xs text-muted-foreground">{STUDENT_NAME}</p>
          </div>
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            My Transfer Requests ({myRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="hostel-transfer-form.table">
            <TableHeader>
              <TableRow>
                <TableHead>Requested Block</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="hostel-transfer-form.empty_state"
                  >
                    No transfer requests yet. Click "New Transfer Request" to
                    begin.
                  </TableCell>
                </TableRow>
              ) : (
                myRequests.map((req, i) => {
                  const sCfg = STATUS_CONFIG[req.status];
                  const uCfg = URGENCY_CONFIG[req.urgency];
                  const Icon = sCfg.icon;
                  return (
                    <TableRow
                      key={req.id}
                      data-ocid={`hostel-transfer-form.row.${i + 1}`}
                    >
                      <TableCell>
                        <p className="text-sm font-medium">
                          {req.requestedBlock}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {req.reason}
                        </p>
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
                        <div className="flex items-center gap-1">
                          <Icon
                            size={13}
                            className={
                              req.status === "pending"
                                ? "text-amber-500"
                                : req.status === "approved"
                                  ? "text-green-600"
                                  : "text-red-500"
                            }
                          />
                          <Badge className={`border-0 text-xs ${sCfg.class}`}>
                            {sCfg.label}
                          </Badge>
                        </div>
                        {req.resolvedAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {req.resolvedAt}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-48">
                        {req.adminNote || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => !o && setDialogOpen(false)}
      >
        <DialogContent data-ocid="hostel-transfer-form.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft size={18} />
              New Room Transfer Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Current Room: </span>
              <span className="font-semibold">{currentRoom}</span>
            </div>

            <div>
              <Label>
                Preferred Block <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.requestedBlock}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, requestedBlock: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="hostel-transfer-form.block_select"
                >
                  <SelectValue placeholder="Select preferred block" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Urgency Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.urgency}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    urgency: v as "low" | "medium" | "high",
                  }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="hostel-transfer-form.urgency_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — No immediate need</SelectItem>
                  <SelectItem value="medium">Medium — Prefer soon</SelectItem>
                  <SelectItem value="high">
                    High — Urgent (medical/safety)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Reason for Transfer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="Explain why you need a room transfer. Provide as much detail as possible..."
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                data-ocid="hostel-transfer-form.reason_textarea"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.reason.length}/500 characters
              </p>
            </div>

            <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded-lg p-3">
              <strong>Note:</strong> Transfer requests are reviewed by the
              Hostel Administrator. You will be notified of the decision in your
              requests list. Approved transfers will be applied to the next
              available space.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="hostel-transfer-form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting || !form.requestedBlock || !form.reason.trim()
              }
              className="bg-primary hover:bg-primary/90"
              data-ocid="hostel-transfer-form.submit_button"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Note */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Input
              type="hidden"
              value=""
              className="hidden"
              readOnly
              aria-hidden
            />
            <div>
              <p className="font-medium text-foreground mb-1">
                Transfer Policy
              </p>
              <ul className="space-y-1 text-xs list-disc pl-4">
                <li>Only one pending transfer request is allowed at a time.</li>
                <li>
                  Transfers are subject to availability and administrator
                  approval.
                </li>
                <li>High urgency requests (medical/safety) are prioritized.</li>
                <li>Processing time is typically 3–5 working days.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
