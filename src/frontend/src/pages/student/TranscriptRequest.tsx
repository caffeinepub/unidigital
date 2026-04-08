import {
  CheckCircle,
  Clock,
  Download,
  FileText,
  Package,
  Send,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { getLocalStudents } from "../../utils/sampleData";

interface TranscriptRequestRecord {
  id: string;
  matric: string;
  purpose: "further_studies" | "employment" | "personal";
  delivery: "electronic" | "physical";
  recipient: string;
  copies: number;
  urgency: "normal" | "express";
  status: "pending" | "processing" | "ready" | "dispatched";
  submittedAt: string;
  notes?: string;
  fee: number;
  paymentRef?: string;
  paidAt?: string;
}

const LS_KEY = "unidigital_transcript_requests";

function loadRequests(): TranscriptRequestRecord[] {
  return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
}
function saveRequests(data: TranscriptRequestRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

const STATUS_CONFIG: Record<
  TranscriptRequestRecord["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800",
    icon: <Clock size={12} />,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
    icon: <Package size={12} />,
  },
  ready: {
    label: "Ready",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle size={12} />,
  },
  dispatched: {
    label: "Dispatched",
    color: "bg-purple-100 text-purple-800",
    icon: <Truck size={12} />,
  },
};

const PURPOSE_LABELS: Record<TranscriptRequestRecord["purpose"], string> = {
  further_studies: "Further Studies / Postgraduate",
  employment: "Employment / Job Application",
  personal: "Personal Use",
};

interface Props {
  userEmail?: string;
  userName?: string;
}

export function TranscriptRequest({ userEmail = "", userName = "" }: Props) {
  const students = getLocalStudents();
  const student =
    students.find((s) => s.email === userEmail) ||
    students.find((s) => s.name === userName) ||
    students[0];

  const [requests, setRequests] =
    useState<TranscriptRequestRecord[]>(loadRequests);
  const [view, setView] = useState<"list" | "form" | "payment">("list");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const [form, setForm] = useState({
    purpose: "further_studies" as TranscriptRequestRecord["purpose"],
    delivery: "electronic" as TranscriptRequestRecord["delivery"],
    recipient: "",
    copies: 1,
    urgency: "normal" as TranscriptRequestRecord["urgency"],
  });

  const [pendingRequest, setPendingRequest] =
    useState<TranscriptRequestRecord | null>(null);

  const fee = form.urgency === "express" ? 5000 : 2500;
  const myRequests = requests.filter((r) => r.matric === student?.matricNumber);

  function handleSubmitForm() {
    if (!student) return;
    const req: TranscriptRequestRecord = {
      id: `TR-${Date.now()}`,
      matric: student.matricNumber,
      purpose: form.purpose,
      delivery: form.delivery,
      recipient: form.recipient,
      copies: form.copies,
      urgency: form.urgency,
      status: "pending",
      submittedAt: new Date().toISOString(),
      fee,
    };
    setPendingRequest(req);
    setView("payment");
  }

  async function handlePay() {
    if (!pendingRequest) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1800));
    const paid: TranscriptRequestRecord = {
      ...pendingRequest,
      paymentRef: `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      paidAt: new Date().toISOString(),
    };
    const updated = [...requests, paid];
    saveRequests(updated);
    setRequests(updated);
    setPaying(false);
    setPaySuccess(true);
  }

  function handleDone() {
    setPendingRequest(null);
    setPaySuccess(false);
    setCardNumber("");
    setForm({
      purpose: "further_studies",
      delivery: "electronic",
      recipient: "",
      copies: 1,
      urgency: "normal",
    });
    setView("list");
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No student record found.
      </div>
    );
  }

  // ─── Payment view ───────────────────────────────────────────────
  if (view === "payment" && pendingRequest) {
    if (paySuccess) {
      return (
        <div className="max-w-lg mx-auto mt-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Payment Successful!
          </h2>
          <p className="text-muted-foreground text-sm">
            Your transcript request has been submitted. Reference:{" "}
            <span className="font-mono font-semibold">
              {pendingRequest.paymentRef}
            </span>
          </p>
          <Button onClick={handleDone} data-ocid="transcript-req.done_button">
            View My Requests
          </Button>
        </div>
      );
    }
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("form")}
            data-ocid="transcript-req.back_button"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            Pay Transcript Fee
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose</span>
              <span>{PURPOSE_LABELS[pendingRequest.purpose]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="capitalize">{pendingRequest.delivery}</span>
            </div>
            {pendingRequest.recipient && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient</span>
                <span className="text-right max-w-[60%] truncate">
                  {pendingRequest.recipient}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Copies</span>
              <span>{pendingRequest.copies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Urgency</span>
              <span className="capitalize">{pendingRequest.urgency}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-green-700">
                ₦{pendingRequest.fee.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Simulated Paystack Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Card Number</Label>
              <Input
                placeholder="4084 0840 8408 4081"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                data-ocid="transcript-req.card_input"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use any test card number — this is a demo payment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expiry</Label>
                <Input placeholder="12/28" />
              </div>
              <div>
                <Label>CVV</Label>
                <Input placeholder="123" maxLength={3} />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handlePay}
              disabled={paying}
              data-ocid="transcript-req.pay_button"
            >
              {paying
                ? "Processing..."
                : `Pay ₦${pendingRequest.fee.toLocaleString()}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Request form ────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("list")}
            data-ocid="transcript-req.back_button"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            New Transcript Request
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">{student.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Matric: </span>
              <span className="font-mono font-medium">
                {student.matricNumber}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Department: </span>
              {student.department}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Purpose of Transcript</Label>
              <select
                className="w-full mt-1.5 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.purpose}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purpose: e.target
                      .value as TranscriptRequestRecord["purpose"],
                  })
                }
                data-ocid="transcript-req.purpose_select"
              >
                <option value="further_studies">
                  Further Studies / Postgraduate
                </option>
                <option value="employment">Employment / Job Application</option>
                <option value="personal">Personal Use</option>
              </select>
            </div>

            <div>
              <Label>Delivery Method</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {(["electronic", "physical"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, delivery: d })}
                    className={`border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      form.delivery === d
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-muted/40"
                    }`}
                    data-ocid={`transcript-req.delivery_${d}`}
                  >
                    {d === "electronic"
                      ? "📧 Electronic (Email)"
                      : "📮 Physical (Post)"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>
                Recipient Institution / Organisation{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. University of Lagos, Postgraduate School"
                value={form.recipient}
                onChange={(e) =>
                  setForm({ ...form, recipient: e.target.value })
                }
                data-ocid="transcript-req.recipient_input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number of Copies</Label>
                <Input
                  type="number"
                  className="mt-1.5"
                  min={1}
                  max={10}
                  value={form.copies}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      copies: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  data-ocid="transcript-req.copies_input"
                />
              </div>
              <div>
                <Label>Processing Type</Label>
                <select
                  className="w-full mt-1.5 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.urgency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      urgency: e.target
                        .value as TranscriptRequestRecord["urgency"],
                    })
                  }
                  data-ocid="transcript-req.urgency_select"
                >
                  <option value="normal">
                    Normal — ₦2,500 (3–5 working days)
                  </option>
                  <option value="express">Express — ₦5,000 (24 hours)</option>
                </select>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Fee</span>
                <span className="text-lg font-bold text-green-700">
                  ₦{fee.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {form.urgency === "express"
                  ? "Express processing — ready within 24 hours."
                  : "Standard processing — ready in 3–5 working days."}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmitForm}
              disabled={!student}
              data-ocid="transcript-req.proceed_button"
            >
              Proceed to Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── List / status tracking view ────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Transcript Request
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Request an official academic transcript or track your existing
            requests.
          </p>
        </div>
        <Button
          onClick={() => setView("form")}
          data-ocid="transcript-req.new_request_button"
        >
          <FileText size={16} className="mr-2" /> New Request
        </Button>
      </div>

      {/* Student card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{student.name}</p>
              <p className="text-sm text-muted-foreground">
                {student.matricNumber} &bull; {student.department} &bull; Level{" "}
                {student.level}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            My Requests ({myRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myRequests.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="transcript-req.empty_state"
            >
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No transcript requests yet.</p>
              <p className="text-sm mt-1">
                Click "New Request" to submit your first transcript request.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {[...myRequests].reverse().map((req, i) => {
                const cfg = STATUS_CONFIG[req.status];
                return (
                  <div
                    key={req.id}
                    className="px-4 py-4 flex items-start justify-between gap-3"
                    data-ocid={`transcript-req.item.${i + 1}`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">
                          {PURPOSE_LABELS[req.purpose]}
                        </span>
                        <Badge
                          className={`${cfg.color} border-0 flex items-center gap-1 text-xs`}
                        >
                          {cfg.icon} {cfg.label}
                        </Badge>
                        <Badge
                          className={`border-0 text-xs ${req.urgency === "express" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}
                        >
                          {req.urgency === "express" ? "Express" : "Normal"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ref:{" "}
                        <span className="font-mono">
                          {req.paymentRef || req.id}
                        </span>{" "}
                        &bull; Submitted{" "}
                        {new Date(req.submittedAt).toLocaleDateString("en-NG")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Delivery:{" "}
                        <span className="capitalize">{req.delivery}</span>{" "}
                        &bull; {req.copies}{" "}
                        {req.copies === 1 ? "copy" : "copies"} &bull; ₦
                        {req.fee.toLocaleString()} paid
                      </p>
                      {req.recipient && (
                        <p className="text-xs text-muted-foreground truncate">
                          To: {req.recipient}
                        </p>
                      )}
                      {req.notes && (
                        <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          Note: {req.notes}
                        </p>
                      )}
                    </div>
                    {req.status === "ready" &&
                      req.delivery === "electronic" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => window.print()}
                          data-ocid="transcript-req.download_button"
                        >
                          <Download size={14} className="mr-1" /> Download
                        </Button>
                      )}
                    {req.status === "dispatched" && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 shrink-0">
                        <Send size={12} className="mr-1" /> Sent
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee guide */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Transcript Fee Schedule
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-card border rounded-lg px-4 py-3">
              <p className="font-medium text-foreground">Normal Processing</p>
              <p className="text-2xl font-bold text-primary mt-1">₦2,500</p>
              <p className="text-xs text-muted-foreground mt-1">
                3–5 working days
              </p>
            </div>
            <div className="bg-card border rounded-lg px-4 py-3">
              <p className="font-medium text-foreground">Express Processing</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">₦5,000</p>
              <p className="text-xs text-muted-foreground mt-1">
                Within 24 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
