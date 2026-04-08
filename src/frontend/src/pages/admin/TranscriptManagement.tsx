import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MapPin,
  Package,
  Printer,
  Search,
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
import { AcademicTranscript } from "../student/AcademicTranscript";

const LS_KEY = "unidigital_transcript_requests";

type RequestStatus =
  | "pending_payment"
  | "pending_registrar"
  | "processing"
  | "dispatched"
  | "delivered";
type DeliveryMethod = "electronic" | "physical";
type DestinationType = "university" | "employer" | "personal" | "embassy";
type Urgency = "normal" | "express";

interface TranscriptRequestRecord {
  id: string;
  matric: string;
  destinationType: DestinationType;
  delivery: DeliveryMethod;
  recipient: string;
  copies: number;
  urgency: Urgency;
  status: RequestStatus;
  submittedAt: string;
  notes?: string;
  fee: number;
  paymentRef?: string;
  paidAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  trackingNumber?: string;
}

const DESTINATION_LABELS: Record<DestinationType, string> = {
  university: "University / Postgraduate",
  employer: "Employer / Job Application",
  personal: "Personal Use",
  embassy: "Embassy / Visa",
};

const STATUS_META: Record<
  RequestStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
    next: RequestStatus | null;
  }
> = {
  pending_payment: {
    label: "Pending Payment",
    color: "bg-amber-100 text-amber-800",
    icon: <Clock size={12} />,
    next: "pending_registrar",
  },
  pending_registrar: {
    label: "Pending Registrar",
    color: "bg-blue-100 text-blue-800",
    icon: <Package size={12} />,
    next: "processing",
  },
  processing: {
    label: "Processing",
    color: "bg-indigo-100 text-indigo-800",
    icon: <FileText size={12} />,
    next: "dispatched",
  },
  dispatched: {
    label: "Dispatched",
    color: "bg-purple-100 text-purple-800",
    icon: <Truck size={12} />,
    next: "delivered",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle size={12} />,
    next: null,
  },
};

const NEXT_LABEL: Record<RequestStatus, string> = {
  pending_payment: "Mark Paid",
  pending_registrar: "Start Processing",
  processing: "Mark Dispatched",
  dispatched: "Confirm Delivery",
  delivered: "",
};

function loadRequests(): TranscriptRequestRecord[] {
  return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
}
function saveRequests(data: TranscriptRequestRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function seedDemoRequests(students: ReturnType<typeof getLocalStudents>) {
  const existing = loadRequests();
  if (existing.length > 0) return;
  const demo: TranscriptRequestRecord[] = students.slice(0, 5).map((s, i) => ({
    id: `TR-DEMO-${i + 1}`,
    matric: s.matricNumber,
    destinationType: (
      [
        "university",
        "employer",
        "personal",
        "embassy",
        "university",
      ] as DestinationType[]
    )[i],
    delivery: i % 2 === 0 ? "electronic" : "physical",
    recipient:
      i === 0
        ? "University of Lagos Postgraduate School"
        : i === 1
          ? "Dangote Group HR"
          : "",
    copies: i === 2 ? 2 : 1,
    urgency: i === 1 ? "express" : "normal",
    status: (
      [
        "pending_registrar",
        "processing",
        "dispatched",
        "delivered",
        "pending_payment",
      ] as RequestStatus[]
    )[i],
    submittedAt: new Date(Date.now() - (5 - i) * 86400000).toISOString(),
    fee: i === 1 ? 5000 : 2500,
    paymentRef:
      i < 4
        ? `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        : undefined,
    paidAt:
      i < 4
        ? new Date(Date.now() - (5 - i) * 86400000 + 3600000).toISOString()
        : undefined,
    trackingNumber: i === 2 ? "NIPOST-2025-00421" : undefined,
  }));
  saveRequests(demo);
}

export function TranscriptManagement() {
  const students = getLocalStudents();
  seedDemoRequests(students);

  const [requests, setRequests] =
    useState<TranscriptRequestRecord[]>(loadRequests);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewTranscript, setViewTranscript] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [trackingInput, setTrackingInput] = useState("");

  const update = (updated: TranscriptRequestRecord[]) => {
    saveRequests(updated);
    setRequests(updated);
  };

  const advanceStatus = (id: string, tracking?: string) => {
    update(
      requests.map((r) => {
        if (r.id !== id) return r;
        const next = STATUS_META[r.status].next;
        if (!next) return r;
        return {
          ...r,
          status: next,
          updatedAt: new Date().toISOString(),
          updatedBy: "Registrar",
          ...(tracking ? { trackingNumber: tracking } : {}),
        };
      }),
    );
    setSelectedId(null);
    setTrackingInput("");
  };

  const saveNote = (id: string) => {
    update(requests.map((r) => (r.id === id ? { ...r, notes: noteText } : r)));
    setSelectedId(null);
    setNoteText("");
  };

  const filtered = requests.filter((r) => {
    const stu = students.find((s) => s.matricNumber === r.matric);
    const matchSearch =
      !search.trim() ||
      r.matric.toLowerCase().includes(search.toLowerCase()) ||
      stu?.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.paymentRef ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts: Record<RequestStatus | "all", number> = {
    all: requests.length,
    pending_payment: requests.filter((r) => r.status === "pending_payment")
      .length,
    pending_registrar: requests.filter((r) => r.status === "pending_registrar")
      .length,
    processing: requests.filter((r) => r.status === "processing").length,
    dispatched: requests.filter((r) => r.status === "dispatched").length,
    delivered: requests.filter((r) => r.status === "delivered").length,
  };

  const transcriptStudent = viewTranscript
    ? students.find((s) => s.matricNumber === viewTranscript)
    : null;

  if (transcriptStudent) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewTranscript(null)}
            data-ocid="transcript-mgmt.back_button"
          >
            ← Back to Queue
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Official Transcript — {transcriptStudent.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {transcriptStudent.matricNumber} &bull;{" "}
              {transcriptStudent.department}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => window.print()}
            data-ocid="transcript-mgmt.print_button"
          >
            <Printer size={14} className="mr-1" /> Print Transcript
          </Button>
        </div>
        <AcademicTranscript
          userEmail={transcriptStudent.email}
          userName={transcriptStudent.name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Transcript Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Process student transcript requests, update status, add tracking
            numbers, and print official transcripts.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(
          [
            "pending_payment",
            "pending_registrar",
            "processing",
            "dispatched",
            "delivered",
          ] as const
        ).map((s) => {
          const cfg = STATUS_META[s];
          return (
            <Card
              key={s}
              className="bg-card cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            >
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xl font-bold text-foreground">{counts[s]}</p>
                <Badge
                  className={`${cfg.color} border-0 mt-1 text-xs flex items-center gap-1 justify-center w-fit mx-auto`}
                >
                  {cfg.icon} {cfg.label}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            "all",
            "pending_payment",
            "pending_registrar",
            "processing",
            "dispatched",
            "delivered",
          ] as const
        ).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            data-ocid={`transcript-mgmt.filter.${s}`}
          >
            {s === "all" ? "All" : STATUS_META[s].label}{" "}
            <span className="ml-1 opacity-70">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-9"
          placeholder="Search by name, matric, or payment ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="transcript-mgmt.search_input"
        />
      </div>

      {/* Queue table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Request Queue ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="py-12 text-center text-muted-foreground"
              data-ocid="transcript-mgmt.empty_state"
            >
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {[
                      "Student",
                      "Destination",
                      "Delivery",
                      "Urgency",
                      "Fee",
                      "Status",
                      "Submitted",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 font-medium text-muted-foreground ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filtered]
                    .sort(
                      (a, b) =>
                        new Date(b.submittedAt).getTime() -
                        new Date(a.submittedAt).getTime(),
                    )
                    .flatMap((req, i) => {
                      const stu = students.find(
                        (s) => s.matricNumber === req.matric,
                      );
                      const cfg = STATUS_META[req.status];
                      const isExpanded = selectedId === req.id;
                      const rows = [
                        <tr
                          key={req.id}
                          className={`border-b hover:bg-muted/20 transition-colors ${isExpanded ? "bg-blue-50/30" : ""}`}
                          data-ocid={`transcript-mgmt.row.${i + 1}`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">
                              {stu?.name ?? req.matric}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {req.matric}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {DESTINATION_LABELS[req.destinationType]}
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground text-xs">
                            {req.delivery}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={`border-0 text-xs ${req.urgency === "express" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}
                            >
                              {req.urgency}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-green-700">
                            ₦{req.fee.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={`${cfg.color} border-0 flex items-center gap-1 w-fit text-xs`}
                            >
                              {cfg.icon} {cfg.label}
                            </Badge>
                            {req.trackingNumber && (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <MapPin size={10} /> {req.trackingNumber}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(req.submittedAt).toLocaleDateString(
                              "en-NG",
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end flex-wrap">
                              {cfg.next && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (
                                      req.status === "processing" &&
                                      req.delivery === "physical"
                                    ) {
                                      setSelectedId(isExpanded ? null : req.id);
                                      setNoteText(req.notes ?? "");
                                      setTrackingInput(
                                        req.trackingNumber ?? "",
                                      );
                                    } else {
                                      advanceStatus(req.id);
                                    }
                                  }}
                                  data-ocid={`transcript-mgmt.advance.${i + 1}`}
                                >
                                  {NEXT_LABEL[req.status]}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedId(isExpanded ? null : req.id);
                                  setNoteText(req.notes ?? "");
                                  setTrackingInput(req.trackingNumber ?? "");
                                }}
                                data-ocid={`transcript-mgmt.note.${i + 1}`}
                              >
                                Note
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewTranscript(req.matric)}
                                data-ocid={`transcript-mgmt.view.${i + 1}`}
                              >
                                <Eye size={14} className="mr-1" /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setViewTranscript(req.matric);
                                  setTimeout(() => window.print(), 300);
                                }}
                                data-ocid={`transcript-mgmt.print.${i + 1}`}
                              >
                                <Printer size={14} className="mr-1" /> Print
                              </Button>
                            </div>
                          </td>
                        </tr>,
                      ];
                      if (isExpanded) {
                        rows.push(
                          <tr
                            key={`${req.id}-expanded`}
                            className="bg-blue-50/20"
                          >
                            <td colSpan={8} className="px-4 pb-3 pt-2">
                              <div className="max-w-xl space-y-3">
                                {req.delivery === "physical" && (
                                  <div>
                                    <Label className="text-xs font-medium">
                                      Tracking Number
                                    </Label>
                                    <div className="flex gap-2 mt-1">
                                      <Input
                                        value={trackingInput}
                                        onChange={(e) =>
                                          setTrackingInput(e.target.value)
                                        }
                                        placeholder="e.g. NIPOST-2025-00421"
                                        className="text-sm h-8"
                                        data-ocid={`transcript-mgmt.tracking_input.${i + 1}`}
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          update(
                                            requests.map((r) =>
                                              r.id === req.id
                                                ? {
                                                    ...r,
                                                    trackingNumber:
                                                      trackingInput,
                                                  }
                                                : r,
                                            ),
                                          );
                                          setSelectedId(null);
                                        }}
                                        data-ocid={`transcript-mgmt.save_tracking.${i + 1}`}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <Label className="text-xs font-medium">
                                    Admin Note / Instructions
                                  </Label>
                                  <Textarea
                                    rows={2}
                                    value={noteText}
                                    onChange={(e) =>
                                      setNoteText(e.target.value)
                                    }
                                    placeholder="Add a note visible to the student..."
                                    className="text-sm mt-1"
                                    data-ocid={`transcript-mgmt.note_textarea.${i + 1}`}
                                  />
                                  <div className="flex gap-2 mt-1.5">
                                    <Button
                                      size="sm"
                                      onClick={() => saveNote(req.id)}
                                      data-ocid={`transcript-mgmt.save_note.${i + 1}`}
                                    >
                                      Save Note
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedId(null);
                                        setNoteText("");
                                        setTrackingInput("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                                {req.recipient && (
                                  <p className="text-xs text-muted-foreground">
                                    <Send size={11} className="inline mr-1" />
                                    Recipient: {req.recipient}
                                  </p>
                                )}
                                {req.paymentRef && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    Payment ref: {req.paymentRef}
                                  </p>
                                )}
                                {req.status === "processing" &&
                                  req.delivery === "physical" && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        advanceStatus(req.id, trackingInput)
                                      }
                                      disabled={!trackingInput.trim()}
                                      data-ocid={`transcript-mgmt.dispatch.${i + 1}`}
                                    >
                                      <Truck size={13} className="mr-1" /> Mark
                                      Dispatched with Tracking
                                    </Button>
                                  )}
                              </div>
                            </td>
                          </tr>,
                        );
                      }
                      return rows;
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow guide */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Processing Workflow
          </h3>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            {(
              [
                "pending_payment",
                "pending_registrar",
                "processing",
                "dispatched",
                "delivered",
              ] as const
            ).map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  {STATUS_META[s].icon} {STATUS_META[s].label}
                </span>
                {i < arr.length - 1 && <span>→</span>}
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Advance each request through the pipeline. Add tracking numbers for
            physical deliveries before marking dispatched. Print the official
            transcript to verify content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
