import { CheckCircle, PlusCircle, XCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { getLocalInvoices, getLocalStudents } from "../../utils/sampleData";

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
    notes: "Approved by HOD bursary. Payment must be completed before exams.",
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
    months: 6,
    installments: Array.from({ length: 6 }, (_, i) => ({
      month: i + 1,
      amount: Math.ceil(200000 / 6),
      status: "upcoming" as const,
      dueDate: `2024-0${i + 2}-01`,
    })),
    status: "pending",
    notes: "",
    createdAt: "2024-01-25",
  },
];

function getInstallmentStatusStyle(status: InstallmentEntry["status"]) {
  if (status === "paid") return "bg-green-100 text-green-700";
  if (status === "overdue") return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
}

function getPlanStatusBadge(status: InstallmentPlan["status"]) {
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

export function InstallmentPlans() {
  const students = getLocalStudents();
  const invoices = getLocalInvoices();

  const [plans, setPlans] = useState<InstallmentPlan[]>(SEED_PLANS);
  const [createDialog, setCreateDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<InstallmentPlan | null>(
    null,
  );
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Installment Plans
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage student fee payment schedules
          </p>
        </div>
        <Button
          onClick={() => setCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="installment.create_button"
        >
          <PlusCircle size={16} className="mr-2" /> Create Plan
        </Button>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} data-ocid={`installment.plan.${plan.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">
                    {plan.studentName}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {plan.studentMatric} · Invoice: {plan.invoiceId} ·{" "}
                    {formatNaira(plan.invoiceAmount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 italic">
                    "{plan.reason}"
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPlanStatusBadge(plan.status)}
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
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {plan.installments.map((inst) => (
                  <div
                    key={`${plan.id}-m${inst.month}`}
                    className={`flex flex-col items-center rounded-lg border px-3 py-2 text-xs ${getInstallmentStatusStyle(inst.status)}`}
                  >
                    <span className="font-bold">Month {inst.month}</span>
                    <span className="font-semibold mt-0.5">
                      {formatNaira(inst.amount)}
                    </span>
                    <span className="opacity-70 mt-0.5">{inst.dueDate}</span>
                    <Badge
                      className="mt-1 text-[10px] border-0 capitalize px-1 py-0"
                      style={{ background: "transparent", fontWeight: 600 }}
                    >
                      {inst.status}
                    </Badge>
                    {plan.status === "approved" && inst.status !== "paid" && (
                      <button
                        type="button"
                        className="mt-1 text-[10px] underline text-blue-600"
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
                <p className="text-xs text-slate-500 mt-3 italic border-t pt-2">
                  Note: {plan.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && (
          <Card>
            <CardContent
              className="py-10 text-center text-slate-400"
              data-ocid="installment.empty_state"
            >
              No installment plans found.
            </CardContent>
          </Card>
        )}
      </div>

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
                  {[3, 4, 5, 6].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} months
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={createPlan}
            >
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
    </div>
  );
}
