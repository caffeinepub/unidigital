import {
  AlertCircle,
  Award,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  type FeeInvoice,
  type Payment,
  getLocalInvoices,
  getLocalPayments,
  getLocalStudents,
  saveLocalInvoices,
  saveLocalPayments,
} from "../../utils/sampleData";

const CURRENT_MATRIC = "CSC/2021/001";
const INSTITUTION_NAME = "Federal University of Education, Kontagora";
const INSTITUTION_ABBR = "FUEK";

function generateRef(): string {
  return `FUEK${Date.now().toString().slice(-8)}`;
}

interface InstallmentEntry {
  month: number;
  amount: number;
  dueDate: string;
  status: "upcoming" | "paid" | "overdue";
}

interface InstallmentPlan {
  id: string;
  invoiceId: string;
  months: number;
  installments: InstallmentEntry[];
}

const LS_INST_KEY = "unidigital_student_installments";
function getInstallments(): InstallmentPlan[] {
  try {
    const d = localStorage.getItem(LS_INST_KEY);
    return d ? (JSON.parse(d) as InstallmentPlan[]) : [];
  } catch {
    return [];
  }
}

export function FeePayment() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(
    [],
  );
  const [payDialog, setPayDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(
    null,
  );
  const [payAmount, setPayAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<FeeInvoice | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [clearanceDialog, setClearanceDialog] = useState(false);

  const students = getLocalStudents();
  const student = students.find((s) => s.matricNumber === CURRENT_MATRIC);

  useEffect(() => {
    setInvoices(
      getLocalInvoices().filter((i) => i.studentMatric === CURRENT_MATRIC),
    );
    setPayments(getLocalPayments());
    setInstallmentPlans(
      getInstallments().filter((p) =>
        getLocalInvoices()
          .filter((i) => i.studentMatric === CURRENT_MATRIC)
          .some((i) => i.id === p.invoiceId),
      ),
    );
  }, []);

  const myPayments = payments.filter((p) =>
    invoices.some((i) => i.id === p.invoiceId),
  );

  const totalDue = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalBalance = totalDue - totalPaid;
  const allCleared = totalDue > 0 && totalBalance <= 0;

  const openPay = (inv: FeeInvoice) => {
    const balance = inv.amount - inv.paid;
    setSelectedInvoice(inv);
    setPayAmount(String(balance));
    setSuccessRef(null);
    setPayDialog(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice) return;
    const amount = Number(payAmount);
    if (Number.isNaN(amount) || amount <= 0) return;
    const maxPay = selectedInvoice.amount - selectedInvoice.paid;
    if (amount > maxPay) return;

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    const ref = generateRef();
    const newPayment: Payment = {
      id: `PAY${Date.now()}`,
      invoiceId: selectedInvoice.id,
      amountPaid: amount,
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: ref,
    };

    const allInvoices = getLocalInvoices();
    const updatedInvoices = allInvoices.map((i) =>
      i.id === selectedInvoice.id ? { ...i, paid: i.paid + amount } : i,
    );
    const allPayments = getLocalPayments();
    const updatedPayments = [...allPayments, newPayment];

    saveLocalInvoices(updatedInvoices);
    saveLocalPayments(updatedPayments);

    const myUpdated = updatedInvoices.filter(
      (i) => i.studentMatric === CURRENT_MATRIC,
    );
    setInvoices(myUpdated);
    setPayments(updatedPayments);
    setProcessing(false);
    setSuccessRef(ref);
    setReceiptInvoice({
      ...selectedInvoice,
      paid: selectedInvoice.paid + amount,
    });
    setReceiptPayment(newPayment);
  };

  const getInstallmentForInvoice = (invoiceId: string) =>
    installmentPlans.find((p) => p.invoiceId === invoiceId);

  const statusColor = (inv: FeeInvoice) => {
    const bal = inv.amount - inv.paid;
    if (bal <= 0) return "default";
    if (inv.paid > 0) return "secondary";
    return "destructive";
  };
  const statusLabel = (inv: FeeInvoice) => {
    const bal = inv.amount - inv.paid;
    if (bal <= 0) return "Paid";
    if (inv.paid > 0) return "Partial";
    return "Unpaid";
  };

  return (
    <div className="space-y-6" data-ocid="fee_payment.root">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fee Payment</h1>
        <p className="text-sm text-muted-foreground">
          {student
            ? `${student.name} — ${student.matricNumber} — ${student.department} (${student.level}L)`
            : CURRENT_MATRIC}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Fee",
            value: `₦${totalDue.toLocaleString()}`,
            color: "text-primary",
            icon: FileText,
          },
          {
            label: "Amount Paid",
            value: `₦${totalPaid.toLocaleString()}`,
            color: "text-green-600",
            icon: CheckCircle2,
          },
          {
            label: "Balance Due",
            value: `₦${totalBalance.toLocaleString()}`,
            color: allCleared ? "text-green-600" : "text-destructive",
            icon: allCleared ? CheckCircle2 : AlertCircle,
          },
        ].map((c) => (
          <Card key={c.label} data-ocid="fee_payment.summary_card">
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className={c.color} size={28} />
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-lg font-bold text-foreground">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clearance badge */}
      {allCleared && (
        <div
          className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200"
          data-ocid="fee_payment.clearance_banner"
        >
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <Award size={18} />
            All fees cleared — you are eligible for Fee Clearance Certificate.
          </div>
          <Button
            size="sm"
            onClick={() => setClearanceDialog(true)}
            data-ocid="fee_payment.clearance_button"
          >
            View Certificate
          </Button>
        </div>
      )}

      {!allCleared && totalBalance > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          Outstanding balance of{" "}
          <strong>₦{totalBalance.toLocaleString()}</strong>. Clear all fees to
          obtain a clearance certificate.
        </div>
      )}

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="installments">Installment Plans</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt size={16} /> Fee Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-ocid="fee_payment.invoices_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="fee_payment.invoices_empty"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                  {invoices.map((inv) => {
                    const balance = inv.amount - inv.paid;
                    const overdue =
                      new Date(inv.dueDate) < new Date() && balance > 0;
                    return (
                      <TableRow
                        key={inv.id}
                        data-ocid={`fee_payment.invoice.${inv.id}`}
                      >
                        <TableCell className="font-mono text-sm">
                          {inv.id}
                        </TableCell>
                        <TableCell>{inv.description}</TableCell>
                        <TableCell>{inv.session}</TableCell>
                        <TableCell
                          className={
                            overdue ? "text-destructive font-medium" : ""
                          }
                        >
                          {inv.dueDate}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₦{inv.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ₦{inv.paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          ₦{balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(inv)}>
                            {statusLabel(inv)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {balance > 0 ? (
                            <Button
                              size="sm"
                              onClick={() => openPay(inv)}
                              data-ocid={`fee_payment.pay_button.${inv.id}`}
                            >
                              <CreditCard size={14} className="mr-1" /> Pay
                            </Button>
                          ) : (
                            <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} /> Cleared
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Installment Plans Tab */}
        <TabsContent value="installments" className="mt-4">
          <div className="space-y-4">
            {invoices.map((inv) => {
              const plan = getInstallmentForInvoice(inv.id);
              if (!plan) {
                return (
                  <Card key={inv.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">
                        {inv.description} — {inv.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground py-2">
                      No installment plan set up for this invoice. Contact
                      Bursary to request an installment schedule.
                    </CardContent>
                  </Card>
                );
              }
              const paidCount = plan.installments.filter(
                (i) => i.status === "paid",
              ).length;
              return (
                <Card
                  key={inv.id}
                  data-ocid={`fee_payment.installment.${inv.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {inv.description} — Installment Plan
                      </CardTitle>
                      <Badge variant="secondary">
                        {paidCount}/{plan.installments.length} paid
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{
                          width: `${(paidCount / plan.installments.length) * 100}%`,
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {plan.installments.map((inst) => {
                        const colorMap = {
                          paid: "bg-green-100 text-green-700 border-green-200",
                          overdue:
                            "bg-destructive/10 text-destructive border-destructive/20",
                          upcoming: "bg-blue-50 text-blue-700 border-blue-200",
                        };
                        return (
                          <div
                            key={inst.month}
                            className={`flex flex-col items-center rounded-lg border px-3 py-2 text-xs ${colorMap[inst.status]}`}
                          >
                            <span className="font-bold">
                              Month {inst.month}
                            </span>
                            <span className="font-semibold">
                              ₦{inst.amount.toLocaleString()}
                            </span>
                            <span className="opacity-70">{inst.dueDate}</span>
                            <span className="capitalize font-semibold mt-1">
                              {inst.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {invoices.length === 0 && (
              <Card>
                <CardContent
                  className="py-10 text-center text-muted-foreground"
                  data-ocid="fee_payment.installments_empty"
                >
                  No invoices or installment plans found.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-ocid="fee_payment.history_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="fee_payment.history_empty"
                      >
                        No payments recorded.
                      </TableCell>
                    </TableRow>
                  )}
                  {myPayments.map((p) => (
                    <TableRow
                      key={p.id}
                      data-ocid={`fee_payment.history.${p.id}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {p.reference}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.invoiceId}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        ₦{p.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>{p.paymentDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const inv = invoices.find(
                              (i) => i.id === p.invoiceId,
                            );
                            if (inv) {
                              setReceiptInvoice(inv);
                              setReceiptPayment(p);
                              setSuccessRef(p.reference);
                              setPayDialog(true);
                            }
                          }}
                          data-ocid={`fee_payment.receipt_button.${p.id}`}
                        >
                          <Receipt size={12} className="mr-1" /> Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment / Receipt Dialog */}
      <Dialog
        open={payDialog}
        onOpenChange={(v) => {
          if (!processing) {
            setPayDialog(v);
            if (!v) setSuccessRef(null);
          }
        }}
      >
        <DialogContent className="max-w-md" data-ocid="fee_payment.dialog">
          <DialogHeader>
            <DialogTitle>
              {successRef ? "Payment Receipt" : "Make Payment"}
            </DialogTitle>
          </DialogHeader>

          {!successRef ? (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium">{selectedInvoice?.description}</p>
                <p className="text-muted-foreground">
                  Invoice: {selectedInvoice?.id}
                </p>
                <p className="text-muted-foreground">
                  Outstanding:{" "}
                  <span className="font-bold text-destructive">
                    ₦
                    {(
                      (selectedInvoice?.amount ?? 0) -
                      (selectedInvoice?.paid ?? 0)
                    ).toLocaleString()}
                  </span>
                </p>
              </div>
              <div>
                <Label>Amount to Pay (₦)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={1}
                  max={
                    (selectedInvoice?.amount ?? 0) -
                    (selectedInvoice?.paid ?? 0)
                  }
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  data-ocid="fee_payment.amount_input"
                />
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 rounded p-2">
                🔒 Secured by Paystack. Your payment details are encrypted and
                protected.
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPayDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processPayment}
                  disabled={processing}
                  data-ocid="fee_payment.submit_button"
                >
                  {processing ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} className="mr-2" /> Pay ₦
                      {Number(payAmount).toLocaleString()}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div
              className="space-y-3 print:text-foreground"
              id="receipt-content"
            >
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">
                  {INSTITUTION_NAME}
                </p>
                <p className="text-xs text-muted-foreground">
                  {INSTITUTION_ABBR} — Official Payment Receipt
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Receipt No", receiptPayment?.id ?? ""],
                  ["Reference", receiptPayment?.reference ?? ""],
                  ["Student", student?.name ?? CURRENT_MATRIC],
                  ["Matric No", CURRENT_MATRIC],
                  ["Department", student?.department ?? ""],
                  ["Level", `${student?.level ?? ""}L`],
                  ["Purpose", receiptInvoice?.description ?? ""],
                  ["Session", receiptInvoice?.session ?? ""],
                  [
                    "Amount Paid",
                    `₦${(receiptPayment?.amountPaid ?? 0).toLocaleString()}`,
                  ],
                  ["Date", receiptPayment?.paymentDate ?? ""],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                <CheckCircle2 size={16} /> Payment Successful
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPayDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => window.print()}
                  data-ocid="fee_payment.print_receipt"
                >
                  <Receipt size={14} className="mr-2" /> Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fee Clearance Certificate Dialog */}
      <Dialog open={clearanceDialog} onOpenChange={setClearanceDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="fee_payment.clearance_dialog"
        >
          <DialogHeader>
            <DialogTitle>Fee Clearance Certificate</DialogTitle>
          </DialogHeader>
          <div
            className="border rounded-lg p-6 space-y-4 text-sm"
            id="clearance-cert"
          >
            <div className="text-center border-b pb-4 space-y-1">
              <p className="font-bold text-base text-foreground uppercase">
                {INSTITUTION_NAME}
              </p>
              <p className="text-muted-foreground text-xs">
                Bursary &amp; Finance Division
              </p>
              <p className="font-semibold text-foreground uppercase tracking-wide mt-2">
                Fee Clearance Certificate
              </p>
            </div>
            <div className="space-y-2">
              <p>
                This is to certify that{" "}
                <strong>{student?.name ?? CURRENT_MATRIC}</strong>, with Matric
                Number <strong>{CURRENT_MATRIC}</strong>, Department of{" "}
                <strong>{student?.department}</strong>, {student?.level}L, has
                fully paid all outstanding school fees for the{" "}
                <strong>
                  {invoices[0]?.session ?? `${new Date().getFullYear()}/2025`}
                </strong>{" "}
                academic session.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Amount Paid</p>
                  <p className="font-bold text-foreground">
                    ₦{totalPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Clearance Date</p>
                  <p className="font-bold text-foreground">
                    {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued By</p>
                  <p className="font-bold text-foreground">Bursary Office</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate No</p>
                  <p className="font-mono text-foreground">
                    {`${INSTITUTION_ABBR}/FCC/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearanceDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              data-ocid="fee_payment.print_clearance"
            >
              <Receipt size={14} className="mr-2" /> Print Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
