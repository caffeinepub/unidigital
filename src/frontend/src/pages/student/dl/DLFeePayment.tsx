import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Printer,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { DEMO_PAYMENTS, type DLPayment } from "./DLTypes";

const FEE_BREAKDOWN = [
  {
    label: "Tuition Fee — 2024/2025 2nd Instalment",
    amount: 40000,
    status: "outstanding",
  },
  { label: "Study Materials Fee", amount: 8000, status: "overdue" },
];

function statusBadge(status: DLPayment["status"]) {
  if (status === "paid")
    return (
      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
        Paid
      </Badge>
    );
  if (status === "overdue")
    return (
      <Badge className="bg-red-100 text-red-700 border-0 text-xs">
        Overdue
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
      Pending
    </Badge>
  );
}

export function DLFeePayment() {
  const [paying, setPaying] = useState(false);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  const outstanding = FEE_BREAKDOWN.filter((f) => !paidIds.has(f.label));
  const totalOwed = outstanding.reduce((s, f) => s + f.amount, 0);
  const allClear = outstanding.length === 0;

  const handlePay = () => {
    setPaying(true);
    // Simulated Paystack
    setTimeout(() => {
      setPaidIds(new Set(FEE_BREAKDOWN.map((f) => f.label)));
      setPaying(false);
    }, 2200);
  };

  const handlePrintReceipt = (p: DLPayment) => {
    const win = window.open("", "_blank", "width=620,height=500");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>DL Payment Receipt</title>
      <style>body{font-family:'Times New Roman',serif;font-size:12pt;padding:20mm;color:#000;}
        h1{text-align:center;font-size:14pt;text-transform:uppercase;}
        .row{display:flex;justify-content:space-between;margin:6px 0;border-bottom:1px dashed #ccc;padding-bottom:4px;}
        .label{font-weight:bold;} @media print{body{padding:12mm;}}
      </style></head><body>
      <h1>Federal University of Education, Kontagora</h1>
      <p style="text-align:center;font-size:11pt;">Distance Learning Centre — Payment Receipt</p>
      <div class="row"><span class="label">Ref:</span><span>${p.ref}</span></div>
      <div class="row"><span class="label">Date:</span><span>${p.date}</span></div>
      <div class="row"><span class="label">Description:</span><span>${p.description}</span></div>
      <div class="row"><span class="label">Amount Paid:</span><span>₦${p.amount.toLocaleString()}</span></div>
      <div class="row"><span class="label">Status:</span><span>PAID</span></div>
      <p style="margin-top:20px;font-size:10pt;">UniDigital DL-MIS — FUEK | Printed: ${new Date().toLocaleString("en-NG")}</p>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Fee Payment — Distance Learning
        </h2>
        <p className="text-sm text-muted-foreground">
          2024/2025 Academic Session &bull; Federal University of Education,
          Kontagora
        </p>
      </div>

      {/* Outstanding balance */}
      {!allClear ? (
        <Card className="border-2 border-amber-300 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
              <AlertCircle size={15} className="text-amber-600" />
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstanding.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between p-2 rounded border border-amber-200 bg-white/70"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {f.label}
                  </p>
                  <Badge
                    className={
                      f.status === "overdue"
                        ? "bg-red-100 text-red-700 border-0 text-xs mt-1"
                        : "bg-amber-100 text-amber-700 border-0 text-xs mt-1"
                    }
                  >
                    {f.status === "overdue" ? "OVERDUE" : "OUTSTANDING"}
                  </Badge>
                </div>
                <span className="font-bold text-foreground text-base">
                  ₦{f.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Owed:</span>
              <span className="text-xl font-bold text-red-600">
                ₦{totalOwed.toLocaleString()}
              </span>
            </div>
            <Button
              className="w-full gap-2"
              disabled={paying}
              onClick={handlePay}
              data-ocid="dl.fees.pay_button"
            >
              {paying ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Processing
                  Paystack Payment…
                </>
              ) : (
                <>
                  <CreditCard size={15} /> Pay ₦{totalOwed.toLocaleString()} via
                  Paystack
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Paystack. You will be redirected to the
              payment gateway.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-300 bg-green-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">
                All fees cleared for this session
              </p>
              <p className="text-xs text-green-700">
                Your account is up to date. No outstanding balance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee structure */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Distance Learning Fee Structure — 2024/2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              {
                label: "Tuition Fee — 1st Instalment",
                amount: "₦65,000",
                due: "Before registration",
                note: "Per session",
              },
              {
                label: "DL Technology Fee",
                amount: "₦12,000",
                due: "With 1st instalment",
                note: "Per session",
              },
              {
                label: "Tuition Fee — 2nd Instalment",
                amount: "₦40,000",
                due: "By Week 8",
                note: "Per session",
              },
              {
                label: "Study Materials Fee",
                amount: "₦8,000",
                due: "By Week 4",
                note: "Per session",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
              >
                <div>
                  <p className="font-medium text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {f.due} · {f.note}
                  </p>
                </div>
                <span className="font-bold text-primary">{f.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt size={15} className="text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_PAYMENTS.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.date}
                    </TableCell>
                    <TableCell className="text-sm">{p.description}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₦{p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
                      {p.status === "paid" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs"
                          onClick={() => handlePrintReceipt(p)}
                          data-ocid={`dl.fees.receipt.${p.id}`}
                        >
                          <Printer size={12} /> Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
