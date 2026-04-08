import {
  AlertCircle,
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
  type FeeInvoice,
  type Payment,
  getLocalInvoices,
  getLocalPayments,
  getLocalStudents,
  saveLocalInvoices,
  saveLocalPayments,
} from "../../utils/sampleData";

// Simulate current logged-in student
const CURRENT_MATRIC = "CSC/2021/001";
const INSTITUTION_NAME = "Federal University of Education, Kontagora";
const INSTITUTION_ABBR = "FUEK";

function generateRef(): string {
  return `FUEK${Date.now().toString().slice(-8)}`;
}

export function FeePayment() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payDialog, setPayDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(
    null,
  );
  const [payAmount, setPayAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<FeeInvoice | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const students = getLocalStudents();
  const student = students.find((s) => s.matricNumber === CURRENT_MATRIC);

  useEffect(() => {
    setInvoices(
      getLocalInvoices().filter((i) => i.studentMatric === CURRENT_MATRIC),
    );
    setPayments(getLocalPayments());
  }, []);

  const myInvoices = invoices;
  const myPayments = payments.filter((p) =>
    myInvoices.some((i) => i.id === p.invoiceId),
  );

  const totalDue = myInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = myInvoices.reduce((s, i) => s + i.paid, 0);
  const totalBalance = totalDue - totalPaid;

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
    // Simulate Paystack gateway delay
    await new Promise((r) => setTimeout(r, 2000));

    const ref = generateRef();
    const newPayment: Payment = {
      id: `PAY${Date.now()}`,
      invoiceId: selectedInvoice.id,
      amountPaid: amount,
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: ref,
    };

    // Update invoice paid amount
    const allInvoices = getLocalInvoices();
    const updatedInvoices = allInvoices.map((i) =>
      i.id === selectedInvoice.id ? { ...i, paid: i.paid + amount } : i,
    );
    const allPayments = getLocalPayments();
    const updatedPayments = [...allPayments, newPayment];

    saveLocalInvoices(updatedInvoices);
    saveLocalPayments(updatedPayments);

    setInvoices(
      updatedInvoices.filter((i) => i.studentMatric === CURRENT_MATRIC),
    );
    setPayments(updatedPayments);
    setProcessing(false);
    setSuccessRef(ref);
    setReceiptInvoice({
      ...selectedInvoice,
      paid: selectedInvoice.paid + amount,
    });
    setReceiptPayment(newPayment);
  };

  const printReceipt = () => window.print();

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
            color: "text-blue-600",
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
            color: "text-red-600",
            icon: AlertCircle,
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

      {totalBalance > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          You have an outstanding balance of{" "}
          <strong>₦{totalBalance.toLocaleString()}</strong>. Please make payment
          to avoid academic restrictions.
        </div>
      )}

      {/* Invoices Table */}
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
              {myInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
              {myInvoices.map((inv) => {
                const balance = inv.amount - inv.paid;
                const status =
                  balance <= 0 ? "Paid" : inv.paid > 0 ? "Partial" : "Unpaid";
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
                      className={overdue ? "text-red-600 font-medium" : ""}
                    >
                      {inv.dueDate}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₦{inv.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      ₦{inv.paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      ₦{balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "Paid"
                            ? "default"
                            : status === "Partial"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {status}
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

      {/* Payment History */}
      {myPayments.length > 0 && (
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
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                          const inv = myInvoices.find(
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
      )}

      {/* Payment Dialog */}
      <Dialog
        open={payDialog}
        onOpenChange={(v) => {
          if (!processing) setPayDialog(v);
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
                  <span className="font-bold text-red-600">
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
            /* Receipt */
            <div className="space-y-3 print:text-black" id="receipt-content">
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
                  onClick={printReceipt}
                  data-ocid="fee_payment.print_receipt"
                >
                  <Receipt size={14} className="mr-2" /> Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
