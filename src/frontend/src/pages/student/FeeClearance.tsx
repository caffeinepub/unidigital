import {
  Award,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  XCircle,
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
  getLocalInvoices,
  getLocalPayments,
  getLocalStudents,
} from "../../utils/sampleData";

// Simulate logged-in student
const CURRENT_MATRIC = "CSC/2021/001";
const INSTITUTION_NAME = "Federal University of Education, Kontagora";
const INSTITUTION_ABBR = "FUEK";

interface InstallmentItem {
  id: string;
  invoiceId: string;
  description: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
}

// Derive installment plan from invoices
function buildInstallmentPlan(
  invoices: ReturnType<typeof getLocalInvoices>,
  payments: ReturnType<typeof getLocalPayments>,
  matric: string,
): InstallmentItem[] {
  const myInvoices = invoices.filter((i) => i.studentMatric === matric);
  return myInvoices.flatMap((inv) => {
    const installments = 2;
    const chunk = Math.round(inv.amount / installments);
    return Array.from({ length: installments }, (_, n) => {
      const isFirst = n === 0;
      const installmentAmount = isFirst ? chunk : inv.amount - chunk;
      const paid = isFirst ? inv.paid >= chunk : inv.paid >= inv.amount;
      const myPayments = payments.filter((p) => p.invoiceId === inv.id);
      const paidDate = paid ? myPayments[0]?.paymentDate : undefined;
      return {
        id: `${inv.id}-INST-${n + 1}`,
        invoiceId: inv.id,
        description: `${inv.description} — Installment ${n + 1}/${installments}`,
        amount: installmentAmount,
        dueDate: n === 0 ? inv.dueDate : "2024-03-31",
        paid,
        paidDate,
      } satisfies InstallmentItem;
    });
  });
}

export function FeeClearance() {
  const [invoices, setInvoices] = useState(getLocalInvoices());
  const [payments, setPayments] = useState(getLocalPayments());
  const students = getLocalStudents();

  useEffect(() => {
    setInvoices(getLocalInvoices());
    setPayments(getLocalPayments());
  }, []);

  const student = students.find((s) => s.matricNumber === CURRENT_MATRIC);
  const myInvoices = invoices.filter((i) => i.studentMatric === CURRENT_MATRIC);
  const totalDue = myInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = myInvoices.reduce((s, i) => s + i.paid, 0);
  const balance = totalDue - totalPaid;
  const isCleared = balance <= 0;

  const installmentPlan = buildInstallmentPlan(
    invoices,
    payments,
    CURRENT_MATRIC,
  );
  const today = new Date().toISOString().slice(0, 10);
  const dateGenerated = today;

  const printCertificate = () => window.print();

  return (
    <div className="space-y-6" data-ocid="fee_clearance.root">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fee Clearance</h1>
        <p className="text-sm text-muted-foreground">
          {student ? `${student.name} — ${CURRENT_MATRIC}` : CURRENT_MATRIC}
        </p>
      </div>

      {/* Clearance Status Banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${isCleared ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}
      >
        {isCleared ? <ShieldCheck size={24} /> : <XCircle size={24} />}
        <div>
          <p className="font-bold text-base">
            {isCleared ? "FEE CLEARANCE GRANTED" : "FEE CLEARANCE PENDING"}
          </p>
          <p className="text-sm">
            {isCleared
              ? `All fees for session ${myInvoices[0]?.session ?? "2023/2024"} have been fully paid. You are cleared for academic activities.`
              : `Outstanding balance: ₦${balance.toLocaleString()}. Please clear all outstanding fees to obtain your clearance certificate.`}
          </p>
        </div>
        {isCleared && (
          <Button
            className="ml-auto"
            onClick={printCertificate}
            data-ocid="fee_clearance.print_button"
          >
            <Printer size={14} className="mr-2" /> Print Certificate
          </Button>
        )}
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Fees",
            value: `₦${totalDue.toLocaleString()}`,
            color: "text-blue-600",
          },
          {
            label: "Amount Paid",
            value: `₦${totalPaid.toLocaleString()}`,
            color: "text-green-600",
          },
          {
            label: "Outstanding",
            value: `₦${balance.toLocaleString()}`,
            color: balance > 0 ? "text-red-600" : "text-green-600",
          },
        ].map((c) => (
          <Card key={c.label} data-ocid="fee_clearance.summary_card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clearance Certificate (printable) */}
      {isCleared && (
        <Card
          className="border-2 border-green-500"
          data-ocid="fee_clearance.certificate"
          id="clearance-certificate"
        >
          <CardContent className="p-8">
            <div className="text-center space-y-1 mb-6">
              <Award size={40} className="mx-auto text-green-600" />
              <h2 className="text-2xl font-bold text-foreground">
                {INSTITUTION_NAME}
              </h2>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                Fee Clearance Certificate
              </p>
            </div>
            <Separator className="mb-6" />
            <p className="text-center text-foreground leading-relaxed mb-6">
              This is to certify that{" "}
              <strong>{student?.name ?? CURRENT_MATRIC}</strong>, with
              Matriculation Number <strong>{CURRENT_MATRIC}</strong>, of the
              Department of <strong>{student?.department}</strong>, Level{" "}
              <strong>{student?.level}L</strong>, has fully paid all prescribed
              fees for the academic session{" "}
              <strong>{myInvoices[0]?.session ?? "2023/2024"}</strong> and is
              hereby granted full academic clearance.
            </p>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                {[
                  ["Total Fees Paid", `₦${totalPaid.toLocaleString()}`],
                  ["Session", myInvoices[0]?.session ?? "2023/2024"],
                  ["Date Generated", dateGenerated],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="flex justify-between border-b border-border pb-1"
                  >
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-semibold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  [
                    "Certificate No",
                    `${INSTITUTION_ABBR}/CLR/${Date.now().toString().slice(-6)}`,
                  ],
                  ["Status", "CLEARED"],
                  ["Validity", "One Academic Session"],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="flex justify-between border-b border-border pb-1"
                  >
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-semibold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="text-center">
                <div className="border-b border-foreground w-48 mx-auto mb-1 mt-8" />
                <p className="font-semibold text-foreground">Bursary Officer</p>
                <p className="text-muted-foreground">
                  {INSTITUTION_ABBR} Bursary Department
                </p>
              </div>
              <div className="text-center">
                <div className="border-b border-foreground w-48 mx-auto mb-1 mt-8" />
                <p className="font-semibold text-foreground">Registrar</p>
                <p className="text-muted-foreground">{INSTITUTION_NAME}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {INSTITUTION_ABBR} MIS &mdash; Printed: {dateGenerated} &mdash;
                Page 1 of 1
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invoice Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-ocid="fee_clearance.invoices_table">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Session</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-6"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
              {myInvoices.map((inv) => {
                const bal = inv.amount - inv.paid;
                const status =
                  bal <= 0 ? "Cleared" : inv.paid > 0 ? "Partial" : "Unpaid";
                return (
                  <TableRow
                    key={inv.id}
                    data-ocid={`fee_clearance.invoice.${inv.id}`}
                  >
                    <TableCell className="font-mono text-sm">
                      {inv.id}
                    </TableCell>
                    <TableCell>{inv.description}</TableCell>
                    <TableCell>{inv.session}</TableCell>
                    <TableCell className="text-right font-mono">
                      ₦{inv.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      ₦{inv.paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      ₦{bal.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "Cleared"
                            ? "default"
                            : status === "Partial"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {status === "Cleared" ? (
                          <>
                            <CheckCircle2 size={10} className="mr-1" />
                            {status}
                          </>
                        ) : (
                          status
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Installment Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Installment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data-ocid="fee_clearance.installments_table">
            <TableHeader>
              <TableRow>
                <TableHead>Plan Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installmentPlan.map((item) => (
                <TableRow
                  key={item.id}
                  data-ocid={`fee_clearance.installment.${item.id}`}
                >
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell
                    className={
                      new Date(item.dueDate) < new Date() && !item.paid
                        ? "text-red-600 font-medium"
                        : ""
                    }
                  >
                    {item.dueDate}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ₦{item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {item.paid ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle2 size={12} /> Paid{" "}
                        {item.paidDate ? `(${item.paidDate})` : ""}
                      </span>
                    ) : (
                      <Badge variant="destructive">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!isCleared && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={printCertificate}
            disabled
            data-ocid="fee_clearance.disabled_print"
          >
            <Download size={14} className="mr-2" /> Certificate (Available After
            Full Payment)
          </Button>
        </div>
      )}
    </div>
  );
}
