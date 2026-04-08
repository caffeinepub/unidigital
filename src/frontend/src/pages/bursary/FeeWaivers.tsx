import { Award, CheckCircle, PlusCircle, XCircle } from "lucide-react";
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
import { Textarea } from "../../components/ui/textarea";
import { getLocalInvoices, getLocalStudents } from "../../utils/sampleData";

interface FeeWaiver {
  id: string;
  studentMatric: string;
  studentName: string;
  invoiceId: string;
  invoiceAmount: number;
  waiverType: "full" | "partial";
  percentage: number;
  amountWaived: number;
  reason: string;
  academicYear: string;
  authority: string;
  status: "pending" | "approved" | "rejected";
}

const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

const SEED_WAIVERS: FeeWaiver[] = [
  {
    id: "WVR-001",
    studentMatric: "CSC/2021/001",
    studentName: "Amara Okonkwo",
    invoiceId: "INV-1",
    invoiceAmount: 150000,
    waiverType: "full",
    percentage: 100,
    amountWaived: 150000,
    reason: "Federal Government Scholarship Recipient",
    academicYear: "2023/2024",
    authority: "FGN Scholarship Board",
    status: "approved",
  },
  {
    id: "WVR-002",
    studentMatric: "MED/2021/003",
    studentName: "Fatima Bello",
    invoiceId: "INV-3",
    invoiceAmount: 200000,
    waiverType: "partial",
    percentage: 50,
    amountWaived: 100000,
    reason: "Niger Delta Development Commission Bursary",
    academicYear: "2023/2024",
    authority: "NDDC",
    status: "approved",
  },
  {
    id: "WVR-003",
    studentMatric: "LAW/2021/004",
    studentName: "Chukwudi Eze",
    invoiceId: "INV-4",
    invoiceAmount: 175000,
    waiverType: "partial",
    percentage: 30,
    amountWaived: 52500,
    reason: "State Government Merit Award",
    academicYear: "2023/2024",
    authority: "Kogi State Govt.",
    status: "pending",
  },
];

function getStatusBadge(status: FeeWaiver["status"]) {
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

export function FeeWaivers() {
  const students = getLocalStudents();
  const invoices = getLocalInvoices();

  const [waivers, setWaivers] = useState<FeeWaiver[]>(SEED_WAIVERS);
  const [createDialog, setCreateDialog] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<FeeWaiver | null>(null);

  const [form, setForm] = useState({
    studentMatric: "",
    invoiceId: "",
    waiverType: "partial" as "full" | "partial",
    percentage: 50,
    reason: "",
    academicYear: "2023/2024",
    authority: "",
  });

  const studentInvoices = invoices.filter(
    (inv) => form.studentMatric && inv.studentMatric === form.studentMatric,
  );

  const summary = useMemo(() => {
    const approved = waivers.filter((w) => w.status === "approved");
    return {
      totalStudents: new Set(approved.map((w) => w.studentMatric)).size,
      totalWaived: approved.reduce((s, w) => s + w.amountWaived, 0),
    };
  }, [waivers]);

  const createWaiver = () => {
    if (!form.studentMatric || !form.invoiceId || !form.authority) {
      toast.error("Please fill all required fields.");
      return;
    }
    const inv = invoices.find((i) => i.id === form.invoiceId);
    const student = students.find((s) => s.matricNumber === form.studentMatric);
    if (!inv || !student) return;
    const pct = form.waiverType === "full" ? 100 : form.percentage;
    const amountWaived = Math.round((inv.amount * pct) / 100);
    const waiver: FeeWaiver = {
      id: `WVR-${Date.now()}`,
      studentMatric: form.studentMatric,
      studentName: student.name,
      invoiceId: form.invoiceId,
      invoiceAmount: inv.amount,
      waiverType: form.waiverType,
      percentage: pct,
      amountWaived,
      reason: form.reason,
      academicYear: form.academicYear,
      authority: form.authority,
      status: "pending",
    };
    setWaivers((prev) => [waiver, ...prev]);
    setCreateDialog(false);
    toast.success("Waiver created and pending approval.");
    setForm({
      studentMatric: "",
      invoiceId: "",
      waiverType: "partial",
      percentage: 50,
      reason: "",
      academicYear: "2023/2024",
      authority: "",
    });
  };

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    setWaivers((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    toast.success(`Waiver ${status}.`);
    setReviewTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Fee Waivers & Scholarships
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage fee waiver requests
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setCreateDialog(true)}
          data-ocid="fee-waivers.create_button"
        >
          <PlusCircle size={16} className="mr-2" /> Create Waiver
        </Button>
      </div>

      {/* Utilization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="text-blue-600" size={22} />
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Students with Waivers
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-0.5">
                  {summary.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="text-green-600" size={22} />
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Total Waived (This Session)
                </p>
                <p className="text-2xl font-bold text-green-700 mt-0.5">
                  {formatNaira(summary.totalWaived)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="text-amber-600" size={22} />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-0.5">
                  {waivers.filter((w) => w.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            All Waivers ({waivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Student",
                    "Matric",
                    "Invoice",
                    "Type",
                    "% Waived",
                    "Amount Waived",
                    "Authority",
                    "Acad. Year",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waivers.map((w, i) => (
                  <tr
                    key={w.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`fee-waivers.row.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-medium">{w.studentName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {w.studentMatric}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {w.invoiceId}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          w.waiverType === "full"
                            ? "bg-purple-100 text-purple-700 border-0"
                            : "bg-blue-100 text-blue-700 border-0"
                        }
                      >
                        {w.waiverType === "full" ? "Full" : "Partial"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {w.percentage}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      {formatNaira(w.amountWaived)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{w.authority}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {w.academicYear}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(w.status)}</td>
                    <td className="px-4 py-3">
                      {w.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewTarget(w)}
                          data-ocid={`fee-waivers.review.${w.id}`}
                        >
                          Review
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {waivers.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-400"
                      data-ocid="fee-waivers.empty_state"
                    >
                      No waivers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Waiver Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent
          className="max-w-md"
          data-ocid="fee-waivers.create_dialog"
        >
          <DialogHeader>
            <DialogTitle>Create Fee Waiver</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Student</Label>
              <Select
                value={form.studentMatric}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, studentMatric: v, invoiceId: "" }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.matricNumber} value={s.matricNumber}>
                      {s.name} ({s.matricNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.studentMatric && (
              <div>
                <Label>Link to Invoice</Label>
                <Select
                  value={form.invoiceId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, invoiceId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.id} — {formatNaira(inv.amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Waiver Type</Label>
                <Select
                  value={form.waiverType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      waiverType: v as "full" | "partial",
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full (100%)</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.waiverType === "partial" && (
                <div>
                  <Label>Percentage (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    className="mt-1"
                    value={form.percentage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, percentage: +e.target.value }))
                    }
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Academic Year</Label>
                <Input
                  className="mt-1"
                  value={form.academicYear}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, academicYear: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Scholarship / Authority</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. FGN Scholarship"
                  value={form.authority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, authority: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={createWaiver}
              data-ocid="fee-waivers.submit_button"
            >
              Create Waiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={() => setReviewTarget(null)}>
        <DialogContent data-ocid="fee-waivers.review_dialog">
          <DialogHeader>
            <DialogTitle>Review Waiver Request</DialogTitle>
          </DialogHeader>
          {reviewTarget && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Student:</span>{" "}
                {reviewTarget.studentName} ({reviewTarget.studentMatric})
              </p>
              <p>
                <span className="font-semibold">Invoice:</span>{" "}
                {reviewTarget.invoiceId} —{" "}
                {formatNaira(reviewTarget.invoiceAmount)}
              </p>
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {reviewTarget.waiverType === "full"
                  ? "Full Waiver"
                  : `Partial — ${reviewTarget.percentage}%`}
              </p>
              <p>
                <span className="font-semibold">Amount Waived:</span>{" "}
                {formatNaira(reviewTarget.amountWaived)}
              </p>
              <p>
                <span className="font-semibold">Authority:</span>{" "}
                {reviewTarget.authority}
              </p>
              <p>
                <span className="font-semibold">Reason:</span>{" "}
                {reviewTarget.reason}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                reviewTarget && updateStatus(reviewTarget.id, "rejected")
              }
            >
              <XCircle size={14} className="mr-1" /> Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() =>
                reviewTarget && updateStatus(reviewTarget.id, "approved")
              }
            >
              <CheckCircle size={14} className="mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
