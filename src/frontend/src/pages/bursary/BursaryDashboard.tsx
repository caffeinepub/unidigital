import {
  AlertCircle,
  DollarSign,
  FileStack,
  Mail,
  PlusCircle,
  Printer,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "../../components/StatCard";
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
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type FeeInvoice,
  type Payment,
  getLocalInvoices,
  getLocalPayments,
  getLocalStudents,
  saveLocalInvoices,
  saveLocalPayments,
} from "../../utils/sampleData";
import { StudentRecordsList } from "../shared/StudentRecordsList";
import { BursaryReconciliation } from "./BursaryReconciliation";
import { DebtAgingReport } from "./DebtAgingReport";
import { FeeWaivers } from "./FeeWaivers";
import { InstallmentPlans } from "./InstallmentPlans";
import { PaymentReceipts } from "./PaymentReceipts";

type Page =
  | "dashboard"
  | "invoices"
  | "payments"
  | "students"
  | "reports"
  | "receipts"
  | "reconciliation"
  | "student-records"
  | "debt-aging"
  | "installment-plans"
  | "fee-waivers"
  | "bursary-reconciliation";
interface Props {
  activePage: Page;
}

export function BursaryDashboard({ activePage }: Props) {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState(getLocalStudents());

  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<
    Omit<FeeInvoice, "id" | "paid">
  >({
    studentMatric: "",
    session: "2023/2024",
    amount: 150000,
    description: "Tuition & Levies",
    dueDate: "",
  });

  // Bulk invoice generation
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    session: "2024/2025",
    semester: "First",
    description: "Tuition & Levies",
    amount: 150000,
    dueDate: "",
    target: "all" as "all" | "department" | "level",
    department: "",
    level: "",
  });

  const [payDialog, setPayDialog] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<{
    studentName: string;
    matric: string;
    amount: number;
    paid: number;
    dueDate: string;
  } | null>(null);
  const [payForm, setPayForm] = useState({
    invoiceId: "",
    amountPaid: 0,
    paymentDate: "",
    reference: "",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: activePage is intentional refresh trigger
  useEffect(() => {
    setInvoices(getLocalInvoices());
    setPayments(getLocalPayments());
    setStudents(getLocalStudents());
  }, [activePage]);

  const departments = [...new Set(students.map((s) => s.department))].sort();
  const levels = ["100", "200", "300", "400", "500"];

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = totalInvoiced - totalPaid;

  const saveInvoice = () => {
    const inv: FeeInvoice = {
      id: `INV-${Date.now()}`,
      ...invoiceForm,
      paid: 0,
    };
    const updated = [...invoices, inv];
    saveLocalInvoices(updated);
    setInvoices(updated);
    setInvoiceDialog(false);
  };

  // Compute eligible students for bulk invoice
  const getBulkEligibleStudents = () => {
    let targets = students;
    if (bulkForm.target === "department" && bulkForm.department) {
      targets = students.filter((s) => s.department === bulkForm.department);
    } else if (bulkForm.target === "level" && bulkForm.level) {
      targets = students.filter((s) => s.level === bulkForm.level);
    }
    const existingMatrics = new Set(
      invoices
        .filter((i) => i.session === bulkForm.session)
        .map((i) => i.studentMatric),
    );
    return targets.filter((s) => !existingMatrics.has(s.matricNumber));
  };

  const generateBulkInvoices = () => {
    const eligible = getBulkEligibleStudents();
    if (eligible.length === 0) {
      toast.info(
        "No eligible students found — all already have invoices for this session.",
      );
      return;
    }
    const newInvoices: FeeInvoice[] = eligible.map((s) => ({
      id: `INV-BULK-${Date.now()}-${s.matricNumber}`,
      studentMatric: s.matricNumber,
      session: bulkForm.session,
      amount: bulkForm.amount,
      description: `${bulkForm.description} — ${bulkForm.semester} Semester`,
      dueDate: bulkForm.dueDate,
      paid: 0,
    }));
    const updated = [...invoices, ...newInvoices];
    saveLocalInvoices(updated);
    setInvoices(updated);
    setBulkDialog(false);
    toast.success(`${newInvoices.length} invoices generated successfully.`);
  };

  const savePayment = () => {
    const pay: Payment = { id: `PAY-${Date.now()}`, ...payForm };
    const updatedPay = [...payments, pay];
    const updatedInv = invoices.map((i) =>
      i.id === payForm.invoiceId
        ? { ...i, paid: i.paid + payForm.amountPaid }
        : i,
    );
    saveLocalPayments(updatedPay);
    saveLocalInvoices(updatedInv);
    setPayments(updatedPay);
    setInvoices(updatedInv);
    setPayDialog(false);
  };

  const statusBadge = (inv: FeeInvoice) => {
    if (inv.paid >= inv.amount)
      return (
        <Badge className="bg-green-100 text-green-700 border-0">Cleared</Badge>
      );
    if (inv.paid > 0)
      return (
        <Badge className="bg-amber-100 text-amber-700 border-0">
          Part-Paid
        </Badge>
      );
    return <Badge className="bg-red-100 text-red-700 border-0">Unpaid</Badge>;
  };

  const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

  if (activePage === "dashboard")
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Bursary Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Financial management &amp; fee records
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Invoiced"
            value={formatNaira(totalInvoiced)}
            icon={<DollarSign size={22} />}
            color="blue"
          />
          <StatCard
            title="Total Paid"
            value={formatNaira(totalPaid)}
            icon={<TrendingUp size={22} />}
            color="green"
          />
          <StatCard
            title="Outstanding"
            value={formatNaira(outstanding)}
            icon={<AlertCircle size={22} />}
            color="red"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Payment Summary by Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.slice(0, 6).map((inv) => {
                const stu = students.find(
                  (s) => s.matricNumber === inv.studentMatric,
                );
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {stu?.name || inv.studentMatric}
                      </p>
                      <p className="text-xs text-slate-500">
                        {inv.studentMatric}
                      </p>
                    </div>
                    <div className="text-right">
                      {statusBadge(inv)}
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatNaira(inv.paid)} / {formatNaira(inv.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{p.reference}</p>
                    <p className="text-xs text-slate-500">{p.paymentDate}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {formatNaira(p.amountPaid)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );

  if (activePage === "invoices")
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-slate-800">Fee Invoices</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkDialog(true)}
              data-ocid="invoices.secondary_button"
            >
              <FileStack size={16} className="mr-2" /> Bulk Generate Invoices
            </Button>
            <Button
              onClick={() => setInvoiceDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-ocid="invoices.primary_button"
            >
              <PlusCircle size={16} className="mr-2" /> Create Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Invoice ID",
                      "Student",
                      "Session",
                      "Amount",
                      "Paid",
                      "Balance",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => {
                    const stu = students.find(
                      (s) => s.matricNumber === inv.studentMatric,
                    );
                    return (
                      <tr
                        key={inv.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                        data-ocid={`invoices.item.${i + 1}`}
                      >
                        <td className="px-4 py-3 text-xs font-mono text-blue-600">
                          {inv.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{stu?.name}</p>
                          <p className="text-xs text-slate-500">
                            {inv.studentMatric}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm">{inv.session}</td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {formatNaira(inv.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600">
                          {formatNaira(inv.paid)}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          {formatNaira(inv.amount - inv.paid)}
                        </td>
                        <td className="px-4 py-3">{statusBadge(inv)}</td>
                      </tr>
                    );
                  })}
                  {invoices.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-slate-400"
                        data-ocid="invoices.empty_state"
                      >
                        No invoices yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Invoice Dialog */}
        <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
          <DialogContent data-ocid="invoices.dialog">
            <DialogHeader>
              <DialogTitle>Create Fee Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Student</Label>
                <Select
                  value={invoiceForm.studentMatric}
                  onValueChange={(v) =>
                    setInvoiceForm((f) => ({ ...f, studentMatric: v }))
                  }
                >
                  <SelectTrigger className="mt-1" data-ocid="invoices.select">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Session</Label>
                  <Input
                    className="mt-1"
                    value={invoiceForm.session}
                    onChange={(e) =>
                      setInvoiceForm((f) => ({ ...f, session: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Amount (₦)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) =>
                      setInvoiceForm((f) => ({ ...f, amount: +e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  className="mt-1"
                  value={invoiceForm.description}
                  onChange={(e) =>
                    setInvoiceForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) =>
                    setInvoiceForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInvoiceDialog(false)}
                data-ocid="invoices.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={saveInvoice}
                data-ocid="invoices.submit_button"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Invoice Dialog */}
        <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
          <DialogContent className="max-w-lg" data-ocid="invoices.dialog">
            <DialogHeader>
              <DialogTitle>Bulk Generate Fee Invoices</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Session</Label>
                  <Input
                    className="mt-1"
                    value={bulkForm.session}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, session: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Semester</Label>
                  <Select
                    value={bulkForm.semester}
                    onValueChange={(v) =>
                      setBulkForm((f) => ({ ...f, semester: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First">First Semester</SelectItem>
                      <SelectItem value="Second">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Fee Description</Label>
                <Input
                  className="mt-1"
                  value={bulkForm.description}
                  onChange={(e) =>
                    setBulkForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount per Student (₦)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    value={bulkForm.amount}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, amount: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={bulkForm.dueDate}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Target</Label>
                <RadioGroup
                  value={bulkForm.target}
                  onValueChange={(v) =>
                    setBulkForm((f) => ({
                      ...f,
                      target: v as typeof bulkForm.target,
                    }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="bulk-target-all" />
                    <Label htmlFor="bulk-target-all">All Students</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="department" id="bulk-target-dept" />
                    <Label htmlFor="bulk-target-dept">By Department</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="level" id="bulk-target-level" />
                    <Label htmlFor="bulk-target-level">By Level</Label>
                  </div>
                </RadioGroup>
              </div>

              {bulkForm.target === "department" && (
                <div>
                  <Label>Department</Label>
                  <Select
                    value={bulkForm.department}
                    onValueChange={(v) =>
                      setBulkForm((f) => ({ ...f, department: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {bulkForm.target === "level" && (
                <div>
                  <Label>Level</Label>
                  <Select
                    value={bulkForm.level}
                    onValueChange={(v) =>
                      setBulkForm((f) => ({ ...f, level: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l} Level
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Preview count */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-sm font-semibold text-blue-700">
                  Preview: {getBulkEligibleStudents().length} invoice
                  {getBulkEligibleStudents().length !== 1 ? "s" : ""} will be
                  generated
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Skipping students who already have an invoice for session{" "}
                  {bulkForm.session}.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkDialog(false)}
                data-ocid="invoices.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={generateBulkInvoices}
                disabled={getBulkEligibleStudents().length === 0}
                data-ocid="invoices.confirm_button"
              >
                Generate {getBulkEligibleStudents().length} Invoice
                {getBulkEligibleStudents().length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "payments")
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <Button
            onClick={() => setPayDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-ocid="payments.primary_button"
          >
            <PlusCircle size={16} className="mr-2" /> Record Payment
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {["Payment ID", "Invoice", "Amount", "Date", "Reference"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                    data-ocid={`payments.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-blue-600">
                      {p.id}
                    </td>
                    <td className="px-4 py-3 text-sm">{p.invoiceId}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatNaira(p.amountPaid)}
                    </td>
                    <td className="px-4 py-3 text-sm">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {p.reference}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400"
                      data-ocid="payments.empty_state"
                    >
                      No payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog open={payDialog} onOpenChange={setPayDialog}>
          <DialogContent data-ocid="payments.dialog">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Invoice</Label>
                <Select
                  value={payForm.invoiceId}
                  onValueChange={(v) =>
                    setPayForm((f) => ({ ...f, invoiceId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.id} — {formatNaira(i.amount - i.paid)} outstanding
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount Paid (₦)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    value={payForm.amountPaid}
                    onChange={(e) =>
                      setPayForm((f) => ({ ...f, amountPaid: +e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={payForm.paymentDate}
                    onChange={(e) =>
                      setPayForm((f) => ({ ...f, paymentDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Reference</Label>
                <Input
                  className="mt-1"
                  value={payForm.reference}
                  onChange={(e) =>
                    setPayForm((f) => ({ ...f, reference: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPayDialog(false)}
                data-ocid="payments.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={savePayment}
                data-ocid="payments.submit_button"
              >
                Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );

  if (activePage === "students")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {["Matric", "Name", "Dept", "Invoice", "Paid", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const inv = invoices.find(
                    (i) => i.studentMatric === s.matricNumber,
                  );
                  return (
                    <tr
                      key={s.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {s.matricNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm">{s.department}</td>
                      <td className="px-4 py-3 text-sm">
                        {inv ? formatNaira(inv.amount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {inv ? formatNaira(inv.paid) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {inv ? (
                          statusBadge(inv)
                        ) : (
                          <Badge variant="outline">No Invoice</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "reports")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Financial Reports</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Total Invoiced"
            value={formatNaira(totalInvoiced)}
            icon={<DollarSign size={22} />}
            color="blue"
          />
          <StatCard
            title="Total Collected"
            value={formatNaira(totalPaid)}
            icon={<TrendingUp size={22} />}
            color="green"
          />
          <StatCard
            title="Outstanding"
            value={formatNaira(outstanding)}
            icon={<AlertCircle size={22} />}
            color="red"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>Collected: {formatNaira(totalPaid)}</span>
              <span className="font-bold">
                {totalInvoiced
                  ? Math.round((totalPaid / totalInvoiced) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-500 rounded-full"
                style={{
                  width: `${totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Breakdown by Student</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.map((inv) => {
              const stu = students.find(
                (s) => s.matricNumber === inv.studentMatric,
              );
              const pct = Math.round((inv.paid / inv.amount) * 100);
              return (
                <div key={inv.id} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stu?.name || inv.studentMatric}</span>
                    <span>
                      {formatNaira(inv.paid)} / {formatNaira(inv.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "reconciliation") {
    const outstandingList = students
      .map((s) => {
        const inv = invoices.find((i) => i.studentMatric === s.matricNumber);
        if (!inv) return null;
        const balance = inv.amount - inv.paid;
        if (balance <= 0) return null;
        const isOverdue = !!(inv.dueDate && new Date(inv.dueDate) < new Date());
        return { student: s, inv, balance, isOverdue };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.balance ?? 0) - (a?.balance ?? 0)) as {
      student: (typeof students)[0];
      inv: FeeInvoice;
      balance: number;
      isOverdue: boolean;
    }[];

    const collectionRate = totalInvoiced
      ? Math.round((totalPaid / totalInvoiced) * 100)
      : 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Fee Reconciliation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track outstanding payments, overdue accounts, and collection
            performance.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            title="Total Students"
            value={String(students.length)}
            icon={<TrendingUp size={22} />}
            color="blue"
          />
          <StatCard
            title="Total Invoiced"
            value={formatNaira(totalInvoiced)}
            icon={<DollarSign size={22} />}
            color="purple"
          />
          <StatCard
            title="Total Collected"
            value={formatNaira(totalPaid)}
            icon={<TrendingUp size={22} />}
            color="green"
          />
          <StatCard
            title="Outstanding"
            value={formatNaira(totalInvoiced - totalPaid)}
            icon={<AlertCircle size={22} />}
            color="red"
          />
          <StatCard
            title="Collection Rate"
            value={`${collectionRate}%`}
            icon={<TrendingUp size={22} />}
            color="amber"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reconciliation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">
                Collected: {formatNaira(totalPaid)}
              </span>
              <span className="font-bold text-slate-800">
                {collectionRate}% collection rate
              </span>
            </div>
            <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-5 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${collectionRate}%` }}
              >
                {collectionRate >= 10 && (
                  <span className="text-white text-xs font-bold">
                    {collectionRate}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>₦0</span>
              <span>Outstanding: {formatNaira(totalInvoiced - totalPaid)}</span>
              <span>{formatNaira(totalInvoiced)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Outstanding Accounts ({outstandingList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {outstandingList.length === 0 && (
              <p
                className="px-4 py-8 text-center text-slate-400 text-sm"
                data-ocid="reconciliation.empty_state"
              >
                All accounts are cleared.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Student",
                      "Matric",
                      "Invoiced",
                      "Paid",
                      "Balance",
                      "Due Date",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outstandingList.map((item, i) => (
                    <tr
                      key={item.student.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50"
                      data-ocid={`reconciliation.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.student.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                        {item.student.matricNumber}
                      </td>
                      <td className="px-4 py-3">
                        {formatNaira(item.inv.amount)}
                      </td>
                      <td className="px-4 py-3 text-green-600">
                        {formatNaira(item.inv.paid)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-red-600">
                        {formatNaira(item.balance)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.inv.dueDate || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {item.isOverdue ? (
                          <Badge className="bg-red-100 text-red-700 border-0">
                            Overdue
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-0">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReminderTarget({
                              studentName: item.student.name,
                              matric: item.student.matricNumber,
                              amount: item.balance,
                              paid: item.inv.paid,
                              dueDate: item.inv.dueDate || "N/A",
                            });
                            setReminderDialog(true);
                          }}
                          data-ocid="reconciliation.open_modal_button"
                        >
                          <Mail size={14} className="mr-1" /> Reminder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
          <DialogContent
            className="max-w-2xl"
            data-ocid="reconciliation.dialog"
          >
            <DialogHeader>
              <DialogTitle>Fee Reminder Letter</DialogTitle>
            </DialogHeader>
            <div className="border rounded-lg p-6 bg-white text-sm space-y-4 print:border-0">
              <div className="text-center border-b pb-4">
                <h2 className="font-bold text-lg text-slate-800 uppercase">
                  Federal University of Technology
                </h2>
                <p className="text-slate-500 text-xs">
                  Bursary &amp; Finance Division
                </p>
                <p className="font-semibold text-slate-700 mt-2 uppercase tracking-wide">
                  Fee Reminder Notice
                </p>
              </div>
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date().toLocaleDateString("en-GB")}
                </p>
                <p>
                  <span className="font-semibold">Student:</span>{" "}
                  {reminderTarget?.studentName}
                </p>
                <p>
                  <span className="font-semibold">Matric Number:</span>{" "}
                  {reminderTarget?.matric}
                </p>
              </div>
              <p>Dear {reminderTarget?.studentName},</p>
              <p className="text-slate-700 leading-relaxed">
                This is a formal reminder that your school fee account has an
                outstanding balance of{" "}
                <strong>{formatNaira(reminderTarget?.amount ?? 0)}</strong>,
                which was due on <strong>{reminderTarget?.dueDate}</strong>.
                Failure to settle this balance may result in restriction of
                access to academic resources, examination halls, and result
                processing.
              </p>
              <p className="text-slate-700">
                Please proceed to the Bursary Department or make payment online
                via the student portal at your earliest convenience. If you
                believe this notice is in error, kindly contact the Bursary
                Office immediately.
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold">Bursary Officer</p>
                <p className="text-slate-500 text-xs">
                  Federal University of Technology
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReminderDialog(false)}
                data-ocid="reconciliation.cancel_button"
              >
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                data-ocid="reconciliation.primary_button"
              >
                <Printer size={14} className="mr-2" /> Print Letter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (activePage === "receipts") return <PaymentReceipts />;
  if (activePage === "student-records")
    return <StudentRecordsList userRole="bursary" />;
  if (activePage === "debt-aging") return <DebtAgingReport />;
  if (activePage === "installment-plans") return <InstallmentPlans />;
  if (activePage === "fee-waivers") return <FeeWaivers />;
  if (activePage === "bursary-reconciliation") return <BursaryReconciliation />;

  return null;
}
