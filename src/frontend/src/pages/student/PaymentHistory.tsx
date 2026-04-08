import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef, useState } from "react";
import { getLocalInvoices } from "../../utils/sampleData";

function getMisName(): string {
  try {
    const s = JSON.parse(localStorage.getItem("institutionSettings") ?? "{}");
    const name: string = s.name ?? "UniDigital";
    return `${name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()} MIS`;
  } catch {
    return "FUEK MIS";
  }
}

function getInstitutionName(): string {
  try {
    const s = JSON.parse(localStorage.getItem("institutionSettings") ?? "{}");
    return s.name ?? "Federal University of Education Kontagora";
  } catch {
    return "Federal University of Education Kontagora";
  }
}

export function PaymentHistory({
  userName = "Alice Johnson",
  userMatric = "2020/1/01",
}: { userName?: string; userMatric?: string }) {
  const invoices = getLocalInvoices();
  const [printReceipt, setPrintReceipt] = useState<(typeof invoices)[0] | null>(
    null,
  );
  const printRef = useRef<HTMLDivElement>(null);

  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const outstanding = totalBilled - totalPaid;

  const getStatus = (inv: (typeof invoices)[0]) => {
    if (inv.paid >= inv.amount) return "Paid";
    if (inv.paid > 0) return "Partial";
    return "Unpaid";
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>Receipt</title><style>body{font-family:serif;padding:40px;max-width:600px;margin:auto}h1{font-size:1.4em}p{margin:4px 0}.footer{margin-top:40px;border-top:1px solid #ccc;padding-top:10px;font-size:.85em;color:#555}</style></head><body>${content.innerHTML}</body></html>`,
    );
    w.document.close();
    w.print();
  };

  const misName = getMisName();
  const institutionName = getInstitutionName();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment History</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your fee invoices and payment records
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Total Billed</p>
            <p className="text-2xl font-bold text-slate-800">
              ₦{totalBilled.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-600">
              ₦{outstanding.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p
              className="text-slate-400 text-sm text-center py-8"
              data-ocid="payment.empty_state"
            >
              No invoices found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv, idx) => {
                  const status = getStatus(inv);
                  return (
                    <TableRow
                      key={inv.id}
                      data-ocid={`payment.item.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {inv.id.toUpperCase()}
                      </TableCell>
                      <TableCell>{inv.description}</TableCell>
                      <TableCell>{inv.session}</TableCell>
                      <TableCell>₦{inv.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">
                        ₦{inv.paid.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-red-600">
                        ₦{(inv.amount - inv.paid).toLocaleString()}
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
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrintReceipt(inv)}
                          data-ocid={`payment.secondary_button.${idx + 1}`}
                        >
                          Print Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!printReceipt}
        onOpenChange={(o) => {
          if (!o) setPrintReceipt(null);
        }}
      >
        <DialogContent className="max-w-md" data-ocid="payment.dialog">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          <div ref={printRef} className="space-y-3">
            <div className="text-center border-b pb-3">
              <p className="font-bold text-lg">{institutionName}</p>
              <p className="text-sm text-slate-500">Official Fee Receipt</p>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Receipt No:</strong> REC-
                {printReceipt?.id.toUpperCase()}
              </p>
              <p>
                <strong>Student Name:</strong> {userName}
              </p>
              <p>
                <strong>Matric No:</strong> {userMatric}
              </p>
              <p>
                <strong>Description:</strong> {printReceipt?.description}
              </p>
              <p>
                <strong>Session:</strong> {printReceipt?.session}
              </p>
              <p>
                <strong>Amount Due:</strong> ₦
                {printReceipt?.amount.toLocaleString()}
              </p>
              <p>
                <strong>Amount Paid:</strong> ₦
                {printReceipt?.paid.toLocaleString()}
              </p>
              <p>
                <strong>Balance:</strong> ₦
                {(
                  (printReceipt?.amount ?? 0) - (printReceipt?.paid ?? 0)
                ).toLocaleString()}
              </p>
              <p>
                <strong>Date:</strong> {printReceipt?.dueDate}
              </p>
            </div>
            <div className="border-t pt-3 text-xs text-slate-400 text-center">
              {misName}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setPrintReceipt(null)}
              data-ocid="payment.cancel_button"
            >
              Close
            </Button>
            <Button onClick={handlePrint} data-ocid="payment.primary_button">
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
