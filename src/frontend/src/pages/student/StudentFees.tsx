import { DollarSign } from "lucide-react";
import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";

interface Invoice {
  id: string;
  studentMatric: string;
  session: string;
  amount: number;
  description: string;
  dueDate: string;
  paid: number;
  paidAt?: number;
}

interface Props {
  invoice: Invoice | null | undefined;
}

export function StudentFees({ invoice: initialInvoice }: Props) {
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(
    initialInvoice,
  );
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const balance = invoice ? invoice.amount - invoice.paid : 0;
  const isCleared = invoice ? invoice.paid >= invoice.amount : false;

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1500));
    if (invoice) {
      setInvoice({ ...invoice, paid: invoice.amount, paidAt: Date.now() });
    }
    setPaying(false);
    setPaid(true);
    setPayOpen(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Fee Status</h1>
      {!invoice ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            No fee invoice found.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Fee"
              value={`₦${invoice.amount.toLocaleString()}`}
              icon={<DollarSign size={22} />}
              color="blue"
            />
            <StatCard
              title="Amount Paid"
              value={`₦${invoice.paid.toLocaleString()}`}
              icon={<DollarSign size={22} />}
              color="green"
            />
            <StatCard
              title="Balance"
              value={`₦${balance.toLocaleString()}`}
              icon={<DollarSign size={22} />}
              color={isCleared ? "green" : "red"}
            />
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Invoice Details</CardTitle>
                {paid && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                    Payment Successful
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {["id", "session", "description", "dueDate"].map((k) => (
                <div
                  key={k}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm text-slate-500 capitalize">{k}</span>
                  <span className="text-sm font-medium">
                    {(invoice as unknown as Record<string, string | number>)[k]}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-slate-500">Status</span>
                <Badge
                  className={
                    isCleared
                      ? "bg-green-100 text-green-700 border-0"
                      : "bg-red-100 text-red-700 border-0"
                  }
                >
                  {isCleared ? "CLEARED" : "OUTSTANDING"}
                </Badge>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-500">Paid On</span>
                  <span className="text-sm font-medium">
                    {new Date(invoice.paidAt).toLocaleString()}
                  </span>
                </div>
              )}
              {!isCleared && (
                <div className="pt-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setPayOpen(true)}
                  >
                    Pay Now — ₦{balance.toLocaleString()}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog
        open={payOpen}
        onOpenChange={(o) => {
          if (!paying) setPayOpen(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay School Fees</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Amount to pay</p>
              <p className="text-2xl font-bold text-slate-800">
                ₦{balance.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {invoice?.session} — {invoice?.description}
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="card-number"
                className="text-sm font-medium text-slate-700"
              >
                Card Number (Demo)
              </label>
              <Input
                id="card-number"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
              <Input placeholder="MM/YY" maxLength={5} />
              <Input placeholder="CVV" maxLength={3} type="password" />
            </div>
            <p className="text-xs text-slate-400 text-center">
              Powered by Paystack (Demo Mode)
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPayOpen(false)}
                disabled={paying}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
