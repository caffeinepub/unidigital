import { Printer, Receipt } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  type FeeInvoice,
  type Payment,
  getLocalInvoices,
  getLocalPayments,
  getLocalStudents,
} from "../../utils/sampleData";

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

interface ReceiptData {
  payment: Payment;
  invoice: FeeInvoice;
  studentName: string;
  matric: string;
}

export function PaymentReceipts() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState(getLocalStudents());
  const [selected, setSelected] = useState<ReceiptData | null>(null);

  useEffect(() => {
    setPayments(getLocalPayments());
    setInvoices(getLocalInvoices());
    setStudents(getLocalStudents());
  }, []);

  const paidPayments = payments;

  const openReceipt = (payment: Payment) => {
    const invoice = invoices.find((i) => i.id === payment.invoiceId);
    if (!invoice) return;
    const student = students.find(
      (s) => s.matricNumber === invoice.studentMatric,
    );
    setSelected({
      payment,
      invoice,
      studentName: student?.name ?? "Unknown Student",
      matric: invoice.studentMatric,
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment Receipts</h1>
        <p className="text-slate-500 text-sm">
          {paidPayments.length} payment records
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Reference",
                    "Student",
                    "Description",
                    "Amount",
                    "Date",
                    "Receipt",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paidPayments.map((p, idx) => {
                  const inv = invoices.find((i) => i.id === p.invoiceId);
                  const student = inv
                    ? students.find((s) => s.matricNumber === inv.studentMatric)
                    : null;
                  return (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                      data-ocid={`receipts.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {p.reference}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">
                          {student?.name ?? inv?.studentMatric ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {inv?.studentMatric ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {inv?.description ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        {formatNaira(p.amountPaid)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {p.paymentDate}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReceipt(p)}
                          data-ocid={`receipts.primary_button.${idx + 1}`}
                        >
                          <Receipt size={14} className="mr-1" /> Print
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {paidPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-400"
                      data-ocid="receipts.empty_state"
                    >
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md" data-ocid="receipts.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt size={18} /> Official Payment Receipt
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2 text-sm print:border-black">
                <div className="text-center mb-3">
                  <p className="font-bold text-lg">
                    Federal University of Technology
                  </p>
                  <p className="text-slate-500 text-xs">
                    Bursary Department — Fee Payment Receipt
                  </p>
                </div>
                {[
                  ["Student Name", selected.studentName],
                  ["Matric Number", selected.matric],
                  ["Description", selected.invoice.description],
                  ["Session", selected.invoice.session],
                  ["Amount Paid", formatNaira(selected.payment.amountPaid)],
                  ["Payment Date", selected.payment.paymentDate],
                  ["Reference", selected.payment.reference],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-dashed pb-1.5 last:border-0"
                  >
                    <span className="text-slate-500">{label}:</span>
                    <span className="font-semibold text-right">{val}</span>
                  </div>
                ))}
                <div className="mt-3 pt-2 text-center text-xs text-slate-400">
                  This receipt was generated by UniDigital portal.
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handlePrint}
                data-ocid="receipts.primary_button"
              >
                <Printer size={16} className="mr-2" /> Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
