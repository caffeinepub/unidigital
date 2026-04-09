import {
  CheckCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { type ClearanceStep, DEMO_CLEARANCE } from "./DLTypes";

function stepIcon(status: ClearanceStep["status"]) {
  if (status === "approved")
    return <CheckCircle size={16} className="text-green-600 shrink-0" />;
  if (status === "rejected")
    return <span className="text-red-600 text-base shrink-0">✗</span>;
  if (status === "na")
    return (
      <span className="text-muted-foreground text-xs font-bold shrink-0">
        N/A
      </span>
    );
  return (
    <div className="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-50 shrink-0" />
  );
}

function stepBadge(status: ClearanceStep["status"]) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
        Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-red-100 text-red-700 border-0 text-xs">
        Rejected
      </Badge>
    );
  if (status === "na")
    return (
      <Badge className="bg-muted text-muted-foreground border-0 text-xs">
        N/A
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
      Pending
    </Badge>
  );
}

interface TranscriptRequest {
  name: string;
  matric: string;
  destination: string;
  purpose: string;
  copies: number;
}

type TrackStatus = "submitted" | "processing" | "ready" | "collected" | null;

export function DLClearanceTranscript() {
  const [clearance] = useState<ClearanceStep[]>(DEMO_CLEARANCE);
  const [transcriptForm, setTranscriptForm] = useState<TranscriptRequest>({
    name: "Aisha Mohammed",
    matric: "FUEK/DL/2025/CSC/001",
    destination: "",
    purpose: "",
    copies: 1,
  });
  const [trackStatus, setTrackStatus] = useState<TrackStatus>(null);
  const [transcriptSubmitting, setTranscriptSubmitting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const allApproved = clearance.every(
    (s) => s.status === "approved" || s.status === "na",
  );
  const approvedCount = clearance.filter(
    (s) => s.status === "approved" || s.status === "na",
  ).length;

  const handleTranscriptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTranscriptSubmitting(true);
    setTimeout(() => {
      setTranscriptSubmitting(false);
      setTrackStatus("submitted");
    }, 1500);
  };

  const handlePrintClearance = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=700,height=600");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>DL Clearance Certificate</title>
      <style>body{font-family:'Times New Roman',serif;font-size:12pt;padding:20mm;}
        h1{text-align:center;font-size:14pt;text-transform:uppercase;}
        table{width:100%;border-collapse:collapse;margin:12px 0;}
        th,td{border:1px solid #000;padding:6px 8px;}th{background:#f0f0f0;}
        @media print{body{padding:12mm;}}
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const TRACK_STEPS: { key: TrackStatus; label: string }[] = [
    { key: "submitted", label: "Submitted" },
    { key: "processing", label: "Processing" },
    { key: "ready", label: "Ready" },
    { key: "collected", label: "Collected" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Clearance ── */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Clearance Status</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Distance Learning Programme — Multi-step departmental clearance
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-green-500 rounded-full transition-all"
              style={{ width: `${(approvedCount / clearance.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            {approvedCount}/{clearance.length} Steps
          </span>
        </div>

        <div className="space-y-3">
          {clearance.map((step) => (
            <Card
              key={step.id}
              className={`border ${step.status === "approved" ? "border-green-200 bg-green-50/30" : step.status === "na" ? "border-muted bg-muted/20" : "border-border"}`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  {stepIcon(step.status)}
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.approver}
                    </p>
                    {step.date && (
                      <p className="text-xs text-green-700 mt-0.5">
                        Approved:{" "}
                        {new Date(step.date).toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                {stepBadge(step.status)}
              </CardContent>
            </Card>
          ))}
        </div>

        {allApproved ? (
          <div ref={printRef} className="mt-4">
            <Card className="border-2 border-green-400 bg-green-50">
              <CardContent className="p-5 text-center">
                <CheckCircle2
                  size={36}
                  className="text-green-600 mx-auto mb-2"
                />
                <h3 className="font-bold text-green-800 text-base">
                  Full Clearance Granted
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You have been cleared by all required departments for the
                  2024/2025 academic session.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Federal University of Education, Kontagora — Distance Learning
                  Centre
                </p>
                <Button
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={handlePrintClearance}
                  data-ocid="dl.clearance.print"
                >
                  <Printer size={13} /> Print Clearance Certificate
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            Some clearance steps are still pending. You will be notified when
            each step is approved. Contact the relevant department if you
            believe there is an error.
          </div>
        )}
      </div>

      {/* ── Transcript Request ── */}
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Transcript Request
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Request an official academic transcript. Fee: ₦3,000 per copy (payable
          via Paystack).
        </p>

        {trackStatus ? (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <p className="font-semibold text-foreground">
                  Transcript request submitted!
                </p>
              </div>
              <div className="flex items-center gap-0">
                {TRACK_STEPS.map((step, idx) => {
                  const stepOrder = TRACK_STEPS.findIndex(
                    (s) => s.key === trackStatus,
                  );
                  const isActive = idx <= stepOrder;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div
                        className={`flex flex-col items-center ${idx > 0 ? "" : ""}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
                        >
                          {idx + 1}
                        </div>
                        <p
                          className={`text-[10px] mt-1 text-center w-16 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {idx < TRACK_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mb-4 ${idx < stepOrder ? "bg-primary" : "bg-border"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Processing time: 3–5 working days. You will be notified when
                your transcript is ready for collection or dispatch. For
                enquiries:{" "}
                <span className="font-mono text-primary">
                  registry@fuek.edu.ng
                </span>
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                Official Transcript Request Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleTranscriptSubmit}
                className="space-y-4 max-w-lg"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="tr-name" className="text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="tr-name"
                      value={transcriptForm.name}
                      onChange={(e) =>
                        setTranscriptForm((p) => ({
                          ...p,
                          name: e.target.value,
                        }))
                      }
                      className="mt-1"
                      data-ocid="dl.transcript.name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tr-matric" className="text-sm">
                      Matric Number
                    </Label>
                    <Input
                      id="tr-matric"
                      value={transcriptForm.matric}
                      readOnly
                      className="mt-1 bg-muted/40"
                      data-ocid="dl.transcript.matric"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tr-dest" className="text-sm">
                      Destination
                    </Label>
                    <Input
                      id="tr-dest"
                      placeholder="e.g. University of Lagos"
                      value={transcriptForm.destination}
                      onChange={(e) =>
                        setTranscriptForm((p) => ({
                          ...p,
                          destination: e.target.value,
                        }))
                      }
                      className="mt-1"
                      data-ocid="dl.transcript.destination"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tr-copies" className="text-sm">
                      Number of Copies
                    </Label>
                    <Input
                      id="tr-copies"
                      type="number"
                      min={1}
                      max={5}
                      value={transcriptForm.copies}
                      onChange={(e) =>
                        setTranscriptForm((p) => ({
                          ...p,
                          copies: Number(e.target.value),
                        }))
                      }
                      className="mt-1"
                      data-ocid="dl.transcript.copies"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tr-purpose" className="text-sm">
                    Purpose
                  </Label>
                  <Input
                    id="tr-purpose"
                    placeholder="e.g. Postgraduate admission, Employment"
                    value={transcriptForm.purpose}
                    onChange={(e) =>
                      setTranscriptForm((p) => ({
                        ...p,
                        purpose: e.target.value,
                      }))
                    }
                    className="mt-1"
                    data-ocid="dl.transcript.purpose"
                    required
                  />
                </div>
                <div className="bg-muted/30 border border-border rounded p-3 text-xs text-muted-foreground">
                  Fee:{" "}
                  <strong>
                    ₦3,000 × {transcriptForm.copies} = ₦
                    {(3000 * transcriptForm.copies).toLocaleString()}
                  </strong>{" "}
                  — Payable via Paystack after submission. Processing time: 3–5
                  working days.
                </div>
                <Button
                  type="submit"
                  disabled={transcriptSubmitting}
                  className="gap-1.5 w-full sm:w-auto"
                  data-ocid="dl.transcript.submit"
                >
                  {transcriptSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <FileText size={14} /> Submit Transcript Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
