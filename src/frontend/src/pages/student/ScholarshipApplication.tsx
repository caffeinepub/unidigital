import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const LS_KEY = "unidigital_scholarships";

export type ScholarshipType =
  | "federal"
  | "state"
  | "institutional"
  | "donor"
  | "merit";

export interface ScholarshipApplication {
  id: string;
  studentMatric: string;
  studentName: string;
  department: string;
  level: string;
  cgpa: number;
  type: ScholarshipType;
  amount: number;
  purpose: string;
  supportingDocuments: string;
  session: string;
  submittedAt: string;
  status: "applied" | "under_review" | "approved" | "disbursed" | "rejected";
  reviewComment?: string;
  approvedAmount?: number;
  disbursedAt?: string;
  awardLetterGenerated?: boolean;
}

function loadApps(): ScholarshipApplication[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveApps(data: ScholarshipApplication[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

const typeLabels: Record<ScholarshipType, string> = {
  federal: "Federal Government Scholarship",
  state: "State Government Bursary",
  institutional: "Institutional Award",
  donor: "Donor / Private Scholarship",
  merit: "Merit Award",
};

const statusConfig: Record<
  ScholarshipApplication["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  applied: {
    label: "Applied",
    color: "bg-blue-100 text-blue-700",
    icon: <FileText size={14} />,
  },
  under_review: {
    label: "Under Review",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={14} />,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  disbursed: {
    label: "Disbursed",
    color: "bg-purple-100 text-purple-700",
    icon: <DollarSign size={14} />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
  },
};

const CGPA_THRESHOLD = 3.0;

// Mock student profile
const MY_PROFILE = {
  matric: "FUEK/SCI/2025/CSC/001",
  name: "Alice Johnson",
  department: "Computer Science",
  level: "300",
  cgpa: 3.75,
  hasActiveDisciplinaryCase: false,
  isCurrentlyRegistered: true,
};

export function ScholarshipApplication() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>(
    () => loadApps().filter((a) => a.studentMatric === MY_PROFILE.matric),
  );
  const [dialog, setDialog] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "institutional" as ScholarshipType,
    amount: "",
    purpose: "",
    supportingDocuments: "",
    session: "2024/2025",
  });

  const allApps = loadApps();

  // Eligibility check
  const eligible =
    MY_PROFILE.cgpa >= CGPA_THRESHOLD &&
    !MY_PROFILE.hasActiveDisciplinaryCase &&
    MY_PROFILE.isCurrentlyRegistered;

  const ineligibilityReasons: string[] = [];
  if (MY_PROFILE.cgpa < CGPA_THRESHOLD)
    ineligibilityReasons.push(
      `CGPA ${MY_PROFILE.cgpa} is below minimum threshold of ${CGPA_THRESHOLD}`,
    );
  if (MY_PROFILE.hasActiveDisciplinaryCase)
    ineligibilityReasons.push("Active disciplinary case on record");
  if (!MY_PROFILE.isCurrentlyRegistered)
    ineligibilityReasons.push("Not currently registered for this session");

  const submitApp = () => {
    if (!form.purpose.trim() || !form.amount) {
      toast.error("Fill in all required fields.");
      return;
    }
    const hasExistingPending = applications.some(
      (a) =>
        a.type === form.type &&
        a.session === form.session &&
        (a.status === "applied" || a.status === "under_review"),
    );
    if (hasExistingPending) {
      toast.error(
        "You already have a pending application for this scholarship type and session.",
      );
      return;
    }

    const app: ScholarshipApplication = {
      id: `SCH-${Date.now()}`,
      studentMatric: MY_PROFILE.matric,
      studentName: MY_PROFILE.name,
      department: MY_PROFILE.department,
      level: MY_PROFILE.level,
      cgpa: MY_PROFILE.cgpa,
      type: form.type,
      amount: Number.parseFloat(form.amount),
      purpose: form.purpose,
      supportingDocuments: form.supportingDocuments,
      session: form.session,
      submittedAt: new Date().toISOString(),
      status: "applied",
    };

    const updated = [...allApps, app];
    saveApps(updated);
    setApplications((prev) => [...prev, app]);
    setDialog(false);
    setForm({
      type: "institutional",
      amount: "",
      purpose: "",
      supportingDocuments: "",
      session: "2024/2025",
    });
    toast.success("Scholarship application submitted successfully.");
  };

  const viewed = viewId ? applications.find((a) => a.id === viewId) : null;

  const printAwardLetter = (app: ScholarshipApplication) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Scholarship Award Letter</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 700px; margin: auto; }
        h1 { text-align: center; font-size: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .field { margin: 8px 0; }
        .label { font-weight: bold; }
        .signature { margin-top: 60px; display: flex; justify-content: space-between; }
        @media print { button { display: none; } }
      </style></head><body>
      <div class="header">
        <h1>FEDERAL UNIVERSITY OF EDUCATION KONTAGORA</h1>
        <p>SCHOLARSHIP AWARD LETTER</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <p>Dear <strong>${app.studentName}</strong>,</p>
      <p>We are pleased to inform you that you have been awarded the <strong>${typeLabels[app.type]}</strong> for the <strong>${app.session}</strong> academic session.</p>
      <div class="field"><span class="label">Matric Number:</span> ${app.studentMatric}</div>
      <div class="field"><span class="label">Department:</span> ${app.department}</div>
      <div class="field"><span class="label">Level:</span> ${app.level}L</div>
      <div class="field"><span class="label">CGPA:</span> ${app.cgpa}</div>
      <div class="field"><span class="label">Award Amount:</span> ₦${(app.approvedAmount ?? app.amount).toLocaleString()}</div>
      <div class="field"><span class="label">Purpose:</span> ${app.purpose}</div>
      ${app.disbursedAt ? `<div class="field"><span class="label">Disbursed On:</span> ${new Date(app.disbursedAt).toLocaleDateString()}</div>` : ""}
      <p>Congratulations on this achievement. Please visit the Bursary Office for further disbursement procedures.</p>
      <div class="signature">
        <div><p>________________________</p><p>Scholarship Committee</p></div>
        <div><p>________________________</p><p>Registrar</p></div>
      </div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Scholarship Applications
          </h1>
          <p className="text-slate-500 text-sm">
            Apply for scholarships and track your application status
          </p>
        </div>
        {eligible && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setDialog(true)}
            data-ocid="scholarship.apply.btn"
          >
            <PlusCircle size={16} className="mr-2" /> Apply for Scholarship
          </Button>
        )}
      </div>

      {/* Student Profile */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {MY_PROFILE.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {MY_PROFILE.name}
                </p>
                <p className="text-xs text-slate-500">
                  {MY_PROFILE.matric} • {MY_PROFILE.department} •{" "}
                  {MY_PROFILE.level}L
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-slate-500">CGPA</p>
                <p
                  className={`font-bold text-lg ${MY_PROFILE.cgpa >= CGPA_THRESHOLD ? "text-green-600" : "text-red-600"}`}
                >
                  {MY_PROFILE.cgpa}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Eligibility</p>
                {eligible ? (
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle size={14} /> Eligible
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold flex items-center gap-1">
                    <XCircle size={14} /> Not Eligible
                  </span>
                )}
              </div>
            </div>
          </div>
          {!eligible && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                <AlertCircle size={13} /> Eligibility Issues
              </p>
              <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                {ineligibilityReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award size={16} /> My Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Award size={36} className="mx-auto mb-2 opacity-40" />
              <p>No scholarship applications yet.</p>
              {eligible && (
                <p className="text-xs mt-1">
                  Click "Apply for Scholarship" to get started.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "ID",
                      "Type",
                      "Session",
                      "Amount (₦)",
                      "Status",
                      "Submitted",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const cfg = statusConfig[app.status];
                    return (
                      <tr
                        key={app.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                        data-ocid={`scholarship.row.${app.id}`}
                      >
                        <td className="px-4 py-3 text-xs font-mono text-blue-600">
                          {app.id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {typeLabels[app.type]}
                        </td>
                        <td className="px-4 py-3">{app.session}</td>
                        <td className="px-4 py-3 font-medium">
                          ₦{app.amount.toLocaleString()}
                          {app.approvedAmount != null &&
                            app.approvedAmount !== app.amount && (
                              <span className="ml-1 text-green-600 text-xs">
                                (Award: ₦{app.approvedAmount.toLocaleString()})
                              </span>
                            )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${cfg.color}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewId(app.id)}
                            >
                              View
                            </Button>
                            {(app.status === "approved" ||
                              app.status === "disbursed") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-300"
                                onClick={() => printAwardLetter(app)}
                                data-ocid={`scholarship.print.${app.id}`}
                              >
                                Award Letter
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for Scholarship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Scholarship Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, type: v as ScholarshipType }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Academic Session</Label>
                <Select
                  value={form.session}
                  onValueChange={(v) => setForm((f) => ({ ...f, session: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["2023/2024", "2024/2025", "2025/2026"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Requested Amount (₦)</Label>
              <Input
                type="number"
                className="mt-1"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <Label>Purpose / Statement</Label>
              <Textarea
                className="mt-1"
                value={form.purpose}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purpose: e.target.value }))
                }
                placeholder="Explain the purpose of this scholarship application and how it will benefit your academics..."
                rows={3}
              />
            </div>
            <div>
              <Label>Supporting Documents (describe)</Label>
              <Textarea
                className="mt-1"
                value={form.supportingDocuments}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    supportingDocuments: e.target.value,
                  }))
                }
                placeholder="e.g. Academic transcript, letter of recommendation, statement of need..."
                rows={2}
              />
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
              <p className="font-semibold mb-1">Eligibility confirmed:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  CGPA: {MY_PROFILE.cgpa} ≥ {CGPA_THRESHOLD} ✓
                </li>
                <li>No active disciplinary case ✓</li>
                <li>Currently registered ✓</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={submitApp}
              data-ocid="scholarship.apply.submit"
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Detail — {viewed?.id}</DialogTitle>
          </DialogHeader>
          {viewed && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Type", value: typeLabels[viewed.type] },
                  { label: "Session", value: viewed.session },
                  {
                    label: "Requested Amount",
                    value: `₦${viewed.amount.toLocaleString()}`,
                  },
                  {
                    label: "Award Amount",
                    value: viewed.approvedAmount
                      ? `₦${viewed.approvedAmount.toLocaleString()}`
                      : "—",
                  },
                  {
                    label: "Submitted",
                    value: new Date(viewed.submittedAt).toLocaleDateString(),
                  },
                  {
                    label: "Disbursed",
                    value: viewed.disbursedAt
                      ? new Date(viewed.disbursedAt).toLocaleDateString()
                      : "—",
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-500">{f.label}</p>
                    <p className="font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${statusConfig[viewed.status].color}`}
                >
                  {statusConfig[viewed.status].icon}
                  {statusConfig[viewed.status].label}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Purpose</p>
                <p className="text-slate-700">{viewed.purpose}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Supporting Documents
                </p>
                <p className="text-slate-700">
                  {viewed.supportingDocuments || "—"}
                </p>
              </div>
              {viewed.reviewComment && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    Reviewer Comment
                  </p>
                  <p className="text-amber-800 text-xs">
                    {viewed.reviewComment}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {viewed &&
              (viewed.status === "approved" ||
                viewed.status === "disbursed") && (
                <Button
                  variant="outline"
                  className="text-green-600 border-green-300"
                  onClick={() => {
                    printAwardLetter(viewed);
                    setViewId(null);
                  }}
                >
                  Print Award Letter
                </Button>
              )}
            <Button variant="outline" onClick={() => setViewId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
