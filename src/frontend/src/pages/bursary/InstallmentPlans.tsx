import { Award, CheckCircle, PlusCircle, Receipt, XCircle } from "lucide-react";
import { useState } from "react";
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
import { Progress } from "../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { getLocalInvoices, getLocalStudents } from "../../utils/sampleData";

const INSTITUTION_NAME = "Federal University of Education, Kontagora";
const INSTITUTION_ABBR = "FUEK";

interface InstallmentEntry {
  month: number;
  amount: number;
  status: "upcoming" | "paid" | "overdue";
  dueDate: string;
}

interface InstallmentPlan {
  id: string;
  studentMatric: string;
  studentName: string;
  invoiceId: string;
  invoiceAmount: number;
  reason: string;
  months: number;
  installments: InstallmentEntry[];
  status: "pending" | "approved" | "rejected";
  notes: string;
  createdAt: string;
}

const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

const SEED_PLANS: InstallmentPlan[] = [
  {
    id: "PLAN-001",
    studentMatric: "CSC/2021/001",
    studentName: "Amara Okonkwo",
    invoiceId: "INV-1",
    invoiceAmount: 150000,
    reason: "Financial hardship due to family circumstances",
    months: 3,
    installments: [
      { month: 1, amount: 50000, status: "paid", dueDate: "2024-02-01" },
      { month: 2, amount: 50000, status: "paid", dueDate: "2024-03-01" },
      { month: 3, amount: 50000, status: "upcoming", dueDate: "2024-04-01" },
    ],
    status: "approved",
    notes: "Approved by HOD Bursary. Payment must be completed before exams.",
    createdAt: "2024-01-20",
  },
  {
    id: "PLAN-002",
    studentMatric: "ENG/2021/002",
    studentName: "Emeka Nwosu",
    invoiceId: "INV-2",
    invoiceAmount: 175000,
    reason: "Awaiting JAMB scholarship disbursement",
    months: 4,
    installments: [
      { month: 1, amount: 43750, status: "overdue", dueDate: "2024-01-15" },
      { month: 2, amount: 43750, status: "overdue", dueDate: "2024-02-15" },
      { month: 3, amount: 43750, status: "upcoming", dueDate: "2024-03-15" },
      { month: 4, amount: 43750, status: "upcoming", dueDate: "2024-04-15" },
    ],
    status: "approved",
    notes: "",
    createdAt: "2024-01-10",
  },
  {
    id: "PLAN-003",
    studentMatric: "MED/2021/003",
    studentName: "Fatima Bello",
    invoiceId: "INV-3",
    invoiceAmount: 200000,
    reason: "Medical emergency in family",
    months: 4,
    installments: Array.from({ length: 4 }, (_, i) => ({
      month: i + 1,
      amount: 50000,
      status: "upcoming" as const,
      dueDate: `2024-0${i + 2}-01`,
    })),
    status: "pending",
    notes: "",
    createdAt: "2024-01-25",
  },
];

function statusStyle(s: InstallmentEntry["status"]) {
  if (s === "paid") return "bg-green-100 text-green-700 border-green-200";
  if (s === "overdue")
    return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function planBadge(status: InstallmentPlan["status"]) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-destructive/10 text-destructive border-0">
        Rejected
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
  );
}

export function InstallmentPlans() {
  const students = getLocalStudents();
  const invoices = getLocalInvoices();

  const [plans, setPlans] = useState<InstallmentPlan[]>(SEED_PLANS);
  const [createDialog, setCreateDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<InstallmentPlan | null>(
    null,
  );
  const [clearanceDialog, setClearanceDialog] =
    useState<InstallmentPlan | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const [form, setForm] = useState({
    studentMatric: "",
    invoiceId: "",
    months: 3,
    reason: "",
  });

  const studentInvoices = invoices.filter(
    (inv) =>
      form.studentMatric &&
      inv.studentMatric === form.studentMatric &&
      inv.amount > inv.paid,
  );

  const createPlan = () => {
    if (!form.studentMatric || !form.invoiceId) {
      toast.error("Please select a student and invoice.");
      return;
    }
    const inv = invoices.find((i) => i.id === form.invoiceId);
    const student = students.find((s) => s.matricNumber === form.studentMatric);
    if (!inv || !student) return;
    const balance = inv.amount - inv.paid;
    const perMonth = Math.ceil(balance / form.months);
    const today = new Date();
    const plan: InstallmentPlan = {
      id: `PLAN-${Date.now()}`,
      studentMatric: form.studentMatric,
      studentName: student.name,
      invoiceId: form.invoiceId,
      invoiceAmount: inv.amount,
      reason: form.reason,
      months: form.months,
      installments: Array.from({ length: form.months }, (_, i) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() + i + 1);
        return {
          month: i + 1,
          amount: perMonth,
          status: "upcoming" as const,
          dueDate: d.toISOString().split("T")[0],
        };
      }),
      status: "pending",
      notes: "",
      createdAt: today.toISOString().split("T")[0],
    };
    setPlans((prev) => [plan, ...prev]);
    setCreateDialog(false);
    setForm({ studentMatric: "", invoiceId: "", months: 3, reason: "" });
    toast.success("Installment plan created and pending approval.");
  };

  const updateStatus = (planId: string, status: "approved" | "rejected") => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, status, notes: reviewNotes } : p,
      ),
    );
    toast.success(`Plan ${status}.`);
    setReviewDialog(null);
    setReviewNotes("");
  };

  const markInstallmentPaid = (planId: string, monthIdx: number) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              installments: p.installments.map((inst, i) =>
                i === monthIdx ? { ...inst, status: "paid" } : inst,
              ),
            }
          : p,
      ),
    );
    toast.success("Installment marked as paid.");
  };

  const isPlanFullyPaid = (plan: InstallmentPlan) =>
    plan.installments.every((i) => i.status === "paid");

  // Summary stats
  const totalActive = plans.filter((p) => p.status === "approved").length;
  const totalPending = plans.filter((p) => p.status === "pending").length;
  const totalAmount = plans.reduce((s, p) => s + p.invoiceAmount, 0);
  const collected = plans.reduce(
    (s, p) =>
      s +
      p.installments
        .filter((i) => i.status === "paid")
        .reduce((a, i) => a + i.amount, 0),
    0,
  );

  return (
    <div className="space-y-6" data-ocid="installment.root">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Installment Plans
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage student fee payment schedules and clearance
          </p>
        </div>
        <Button
          onClick={() => setCreateDialog(true)}
          data-ocid="installment.create_button"
        >
          <PlusCircle size={16} className="mr-2" /> Create Plan
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Plans",
            value: totalActive,
            color: "text-green-600",
          },
          {
            label: "Pending Review",
            value: totalPending,
            color: "text-amber-600",
          },
          {
            label: "Total Installment Amount",
            value: formatNaira(totalAmount),
            color: "text-primary",
          },
          {
            label: "Amount Collected",
            value: formatNaira(collected),
            color: "text-green-600",
          },
        ].map((kpi) => (
          <Card key={kpi.label} data-ocid="installment.kpi_card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const paidCount = plan.installments.filter(
            (i) => i.status === "paid",
          ).length;
          const overdueCount = plan.installments.filter(
            (i) => i.status === "overdue",
          ).length;
          const fullyPaid = isPlanFullyPaid(plan);
          return (
            <Card key={plan.id} data-ocid={`installment.plan.${plan.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">
                      {plan.studentName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.studentMatric} · Invoice:{" "}
                      <span className="font-mono">{plan.invoiceId}</span> ·{" "}
                      {formatNaira(plan.invoiceAmount)}
                    </p>
                    {plan.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">
                        "{plan.reason}"
                      </p>
                    )}
                    {overdueCount > 0 && (
                      <p className="text-xs text-destructive font-medium mt-1">
                        ⚠ {overdueCount} installment
                        {overdueCount > 1 ? "s" : ""} overdue
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {planBadge(plan.status)}
                    {fullyPaid && plan.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setClearanceDialog(plan)}
                        data-ocid={`installment.clearance_button.${plan.id}`}
                      >
                        <Award size={13} className="mr-1" /> Clearance
                      </Button>
                    )}
                    {plan.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReviewDialog(plan);
                          setReviewNotes("");
                        }}
                        data-ocid={`installment.review_button.${plan.id}`}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
                {plan.status === "approved" && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>
                        {paidCount}/{plan.installments.length} installments paid
                      </span>
                    </div>
                    <Progress
                      value={(paidCount / plan.installments.length) * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {plan.installments.map((inst) => (
                    <div
                      key={`${plan.id}-m${inst.month}`}
                      className={`flex flex-col items-center rounded-lg border px-3 py-2 text-xs ${statusStyle(inst.status)}`}
                    >
                      <span className="font-bold">Month {inst.month}</span>
                      <span className="font-semibold mt-0.5">
                        {formatNaira(inst.amount)}
                      </span>
                      <span className="opacity-70 mt-0.5">{inst.dueDate}</span>
                      <span className="capitalize font-semibold mt-1">
                        {inst.status}
                      </span>
                      {plan.status === "approved" && inst.status !== "paid" && (
                        <button
                          type="button"
                          className="mt-1 text-[10px] underline text-primary"
                          onClick={() =>
                            markInstallmentPaid(plan.id, inst.month - 1)
                          }
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {plan.notes && (
                  <p className="text-xs text-muted-foreground mt-3 italic border-t pt-2">
                    Note: {plan.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {plans.length === 0 && (
          <Card>
            <CardContent
              className="py-10 text-center text-muted-foreground"
              data-ocid="installment.empty_state"
            >
              No installment plans found.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Table */}
      {plans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Plans Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table data-ocid="installment.summary_table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const collectedAmt = plan.installments
                    .filter((i) => i.status === "paid")
                    .reduce((s, i) => s + i.amount, 0);
                  return (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        {plan.studentName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {plan.invoiceId}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNaira(plan.invoiceAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {formatNaira(collectedAmt)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {formatNaira(plan.invoiceAmount - collectedAmt)}
                      </TableCell>
                      <TableCell>{planBadge(plan.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-md" data-ocid="installment.dialog">
          <DialogHeader>
            <DialogTitle>Create Installment Plan</DialogTitle>
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
                <Label>Invoice</Label>
                <Select
                  value={form.invoiceId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, invoiceId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select outstanding invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.id} — {formatNaira(inv.amount - inv.paid)}{" "}
                        outstanding
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Payment Duration (months)</Label>
              <Select
                value={String(form.months)}
                onValueChange={(v) => setForm((f) => ({ ...f, months: +v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.invoiceId && form.months > 0 && (
              <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                Monthly payment:{" "}
                <strong>
                  {formatNaira(
                    Math.ceil(
                      ((invoices.find((i) => i.id === form.invoiceId)?.amount ??
                        0) -
                        (invoices.find((i) => i.id === form.invoiceId)?.paid ??
                          0)) /
                        form.months,
                    ),
                  )}
                </strong>
              </div>
            )}
            <div>
              <Label>Reason for Installment</Label>
              <Textarea
                className="mt-1"
                rows={3}
                placeholder="State reason for requesting installment payment..."
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
            <Button onClick={createPlan} data-ocid="installment.confirm_create">
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent data-ocid="installment.review_dialog">
          <DialogHeader>
            <DialogTitle>Review Installment Plan</DialogTitle>
          </DialogHeader>
          {reviewDialog && (
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-semibold">Student:</span>{" "}
                {reviewDialog.studentName}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Invoice:</span>{" "}
                {reviewDialog.invoiceId} —{" "}
                {formatNaira(reviewDialog.invoiceAmount)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Reason:</span>{" "}
                {reviewDialog.reason}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Schedule:</span>{" "}
                {reviewDialog.months} months @{" "}
                {formatNaira(
                  Math.ceil(reviewDialog.invoiceAmount / reviewDialog.months),
                )}
                /month
              </p>
              <div>
                <Label>Notes / Decision Reason</Label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                reviewDialog && updateStatus(reviewDialog.id, "rejected")
              }
              data-ocid="installment.reject_button"
            >
              <XCircle size={14} className="mr-1" /> Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() =>
                reviewDialog && updateStatus(reviewDialog.id, "approved")
              }
              data-ocid="installment.approve_button"
            >
              <CheckCircle size={14} className="mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clearance Certificate Dialog */}
      <Dialog
        open={!!clearanceDialog}
        onOpenChange={() => setClearanceDialog(null)}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="installment.clearance_dialog"
        >
          <DialogHeader>
            <DialogTitle>Fee Clearance Certificate</DialogTitle>
          </DialogHeader>
          {clearanceDialog && (
            <div
              className="border rounded-lg p-6 space-y-4 text-sm"
              id="inst-clearance-cert"
            >
              <div className="text-center border-b pb-4 space-y-1">
                <p className="font-bold text-base text-foreground uppercase">
                  {INSTITUTION_NAME}
                </p>
                <p className="text-muted-foreground text-xs">
                  Bursary &amp; Finance Division
                </p>
                <p className="font-semibold text-foreground uppercase tracking-wide mt-2">
                  Installment Fee Clearance Certificate
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  This is to certify that{" "}
                  <strong>{clearanceDialog.studentName}</strong>, Matric No.{" "}
                  <strong>{clearanceDialog.studentMatric}</strong>, has
                  completed all installment payments for Invoice{" "}
                  <strong>{clearanceDialog.invoiceId}</strong>, totaling{" "}
                  <strong>{formatNaira(clearanceDialog.invoiceAmount)}</strong>.
                </p>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Plan ID</p>
                    <p className="font-mono font-bold">{clearanceDialog.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clearance Date</p>
                    <p className="font-bold">
                      {new Date().toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Installments Paid</p>
                    <p className="font-bold text-green-600">
                      {clearanceDialog.months}/{clearanceDialog.months}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-bold">
                      {formatNaira(clearanceDialog.invoiceAmount)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">
                    Bursar's Signature
                  </p>
                  <div className="border-b border-foreground w-32 mt-4" />
                  <p className="text-muted-foreground mt-1">
                    Date: _______________
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {INSTITUTION_ABBR} MIS
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Printed: {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearanceDialog(null)}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              data-ocid="installment.print_clearance"
            >
              <Receipt size={14} className="mr-2" /> Print Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
