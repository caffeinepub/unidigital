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
const SCHEMES_KEY = "unidigital_scholarship_schemes";

export type ScholarshipType =
  | "federal"
  | "state"
  | "institutional"
  | "donor"
  | "merit";

export interface ScholarshipApplication {
  id: string;
  schemeId?: string;
  schemeName?: string;
  studentMatric: string;
  studentName: string;
  department: string;
  level: string;
  cgpa: number;
  type: ScholarshipType;
  amount: number;
  purpose: string;
  supportingDocuments: string;
  incomeLetter?: string;
  recommendationLetter?: string;
  session: string;
  submittedAt: string;
  status: "applied" | "under_review" | "approved" | "disbursed" | "rejected";
  reviewComment?: string;
  approvedAmount?: number;
  disbursedAt?: string;
}

interface ScholarshipScheme {
  id: string;
  name: string;
  description: string;
  minCGPA: number;
  levelFilter: string;
  departmentFilter: string;
  incomeTestRequired: boolean;
  awardAmount: number;
  maxRecipients: number;
  session: string;
  active: boolean;
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
function loadSchemes(): ScholarshipScheme[] {
  try {
    return JSON.parse(localStorage.getItem(SCHEMES_KEY) ?? "[]");
  } catch {
    return [];
  }
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
  const [schemes, setSchemes] = useState<ScholarshipScheme[]>([]);
  const [dialog, setDialog] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const [form, setForm] = useState({
    type: "institutional" as ScholarshipType,
    amount: "",
    purpose: "",
    supportingDocuments: "",
    incomeLetter: "",
    recommendationLetter: "",
    session: "2024/2025",
  });

  useEffect(() => {
    setSchemes(loadSchemes().filter((s) => s.active));
  }, []);

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);

  // Auto-fill amount from scheme
  const handleSchemeChange = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    const scheme = schemes.find((s) => s.id === schemeId);
    if (scheme) {
      setForm((f) => ({
        ...f,
        amount: String(scheme.awardAmount),
        session: scheme.session,
      }));
    }
  };

  // Eligibility check
  const ineligibilityReasons: string[] = [];
  if (MY_PROFILE.cgpa < (selectedScheme?.minCGPA ?? 0)) {
    ineligibilityReasons.push(
      `CGPA ${MY_PROFILE.cgpa} below minimum ${selectedScheme?.minCGPA}`,
    );
  }
  if (
    selectedScheme?.levelFilter !== "all" &&
    MY_PROFILE.level !== selectedScheme?.levelFilter
  ) {
    ineligibilityReasons.push(`Level ${MY_PROFILE.level} not eligible`);
  }
  if (
    selectedScheme?.departmentFilter !== "all" &&
    MY_PROFILE.department !== selectedScheme?.departmentFilter
  ) {
    ineligibilityReasons.push(
      `Department "${MY_PROFILE.department}" not eligible for this scheme`,
    );
  }
  if (MY_PROFILE.hasActiveDisciplinaryCase)
    ineligibilityReasons.push("Active disciplinary case on record");
  if (!MY_PROFILE.isCurrentlyRegistered)
    ineligibilityReasons.push("Not currently registered for this session");

  const baseEligible =
    !MY_PROFILE.hasActiveDisciplinaryCase && MY_PROFILE.isCurrentlyRegistered;
  const schemeEligible = selectedScheme
    ? ineligibilityReasons.length === 0
    : baseEligible;
  const incomeTestRequired = selectedScheme?.incomeTestRequired ?? false;

  const submitApp = () => {
    if (!form.purpose.trim() || !form.amount) {
      toast.error("Fill in all required fields.");
      return;
    }
    if (incomeTestRequired && !form.incomeLetter.trim()) {
      toast.error(
        "This scheme requires an income letter. Please provide the document reference.",
      );
      return;
    }

    const hasExistingPending = applications.some(
      (a) =>
        a.session === form.session &&
        (selectedSchemeId
          ? a.schemeId === selectedSchemeId
          : a.type === form.type) &&
        (a.status === "applied" || a.status === "under_review"),
    );
    if (hasExistingPending) {
      toast.error(
        "You already have a pending application for this scheme and session.",
      );
      return;
    }

    const app: ScholarshipApplication = {
      id: `SCH-${Date.now()}`,
      schemeId: selectedSchemeId || undefined,
      schemeName: selectedScheme?.name,
      studentMatric: MY_PROFILE.matric,
      studentName: MY_PROFILE.name,
      department: MY_PROFILE.department,
      level: MY_PROFILE.level,
      cgpa: MY_PROFILE.cgpa,
      type: form.type,
      amount: Number.parseFloat(form.amount),
      purpose: form.purpose,
      supportingDocuments: form.supportingDocuments,
      incomeLetter: form.incomeLetter || undefined,
      recommendationLetter: form.recommendationLetter || undefined,
      session: form.session,
      submittedAt: new Date().toISOString(),
      status: "applied",
    };

    const allApps = loadApps();
    const updated = [...allApps, app];
    saveApps(updated);
    setApplications((prev) => [...prev, app]);
    setDialog(false);
    setForm({
      type: "institutional",
      amount: "",
      purpose: "",
      supportingDocuments: "",
      incomeLetter: "",
      recommendationLetter: "",
      session: "2024/2025",
    });
    setSelectedSchemeId("");
    toast.success("Scholarship application submitted successfully.");
  };

  const viewed = viewId ? applications.find((a) => a.id === viewId) : null;

  const printAwardLetter = (app: ScholarshipApplication) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Scholarship Award Letter</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
    h1{text-align:center;font-size:20px}.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:10px}
    .field{margin:8px 0}.label{font-weight:bold}
    .signature{margin-top:60px;display:flex;justify-content:space-between}
    @media print{button{display:none}}</style></head><body>
    <div class="header">
      <h1>FEDERAL UNIVERSITY OF EDUCATION KONTAGORA</h1>
      <p>SCHOLARSHIP AWARD LETTER</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
    <p>Dear <strong>${app.studentName}</strong>,</p>
    <p>You have been awarded the <strong>${app.schemeName ?? typeLabels[app.type]}</strong> for the <strong>${app.session}</strong> academic session.</p>
    <div class="field"><span class="label">Matric Number:</span> ${app.studentMatric}</div>
    <div class="field"><span class="label">Department:</span> ${app.department}</div>
    <div class="field"><span class="label">Level:</span> ${app.level}L</div>
    <div class="field"><span class="label">CGPA:</span> ${app.cgpa}</div>
    <div class="field"><span class="label">Award Amount:</span> ₦${(app.approvedAmount ?? app.amount).toLocaleString()}</div>
    ${app.disbursedAt ? `<div class="field"><span class="label">Disbursed:</span> ${new Date(app.disbursedAt).toLocaleDateString()}</div>` : ""}
    <p>Congratulations. Please visit the Bursary Office for further procedures.</p>
    <div class="signature">
      <div><p>________________________</p><p>Scholarship Committee</p></div>
      <div><p>________________________</p><p>Registrar</p></div>
    </div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Scholarship Applications
          </h1>
          <p className="text-muted-foreground text-sm">
            Apply for scholarships and track your application status
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setDialog(true)}
          data-ocid="scholarship.apply.btn"
        >
          <PlusCircle size={16} className="mr-2" /> Apply for Scholarship
        </Button>
      </div>

      {/* Student Profile */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {MY_PROFILE.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {MY_PROFILE.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {MY_PROFILE.matric} • {MY_PROFILE.department} •{" "}
                  {MY_PROFILE.level}L
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">CGPA</p>
                <p className="font-bold text-lg text-green-600">
                  {MY_PROFILE.cgpa}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle size={14} /> Active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Schemes */}
      {schemes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award size={16} /> Available Scholarship Schemes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {schemes.map((s) => {
                const meetsMinCGPA = MY_PROFILE.cgpa >= s.minCGPA;
                const meetsLevel =
                  s.levelFilter === "all" || MY_PROFILE.level === s.levelFilter;
                const meetsDept =
                  s.departmentFilter === "all" ||
                  MY_PROFILE.department === s.departmentFilter;
                const eligible = meetsMinCGPA && meetsLevel && meetsDept;
                return (
                  <div
                    key={s.id}
                    className={`border rounded-lg p-3 ${eligible ? "border-green-200 bg-green-50/30" : "border-border bg-muted/20 opacity-70"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground leading-tight">
                        {s.name}
                      </h4>
                      {eligible ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs shrink-0">
                          Eligible
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-0 text-xs shrink-0">
                          Ineligible
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.description}
                    </p>
                    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      <p>
                        Min CGPA: <strong>{s.minCGPA}</strong> · Award:{" "}
                        <strong>₦{s.awardAmount.toLocaleString()}</strong>
                      </p>
                      <p>
                        Level:{" "}
                        <strong>
                          {s.levelFilter === "all"
                            ? "All"
                            : `${s.levelFilter}L`}
                        </strong>{" "}
                        · Dept:{" "}
                        <strong>
                          {s.departmentFilter === "all"
                            ? "All"
                            : s.departmentFilter}
                        </strong>
                      </p>
                      {s.incomeTestRequired && (
                        <p className="text-amber-600 font-medium">
                          ⚠ Income letter required
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award size={16} /> My Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award size={36} className="mx-auto mb-2 opacity-40" />
              <p>No scholarship applications yet.</p>
              <p className="text-xs mt-1">
                Click "Apply for Scholarship" to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    {[
                      "ID",
                      "Scheme",
                      "Session",
                      "Amount (₦)",
                      "Status",
                      "Submitted",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
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
                        className="border-b last:border-0 hover:bg-muted/20"
                        data-ocid={`scholarship.row.${app.id}`}
                      >
                        <td className="px-4 py-3 text-xs font-mono text-primary">
                          {app.id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {app.schemeName ?? typeLabels[app.type]}
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
                        <td className="px-4 py-3 text-xs text-muted-foreground">
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Scholarship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Select Scheme */}
            <div>
              <Label>Select Scholarship Scheme</Label>
              <Select
                value={selectedSchemeId}
                onValueChange={handleSchemeChange}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="scholarship.apply.scheme"
                >
                  <SelectValue placeholder="Choose a scholarship scheme..." />
                </SelectTrigger>
                <SelectContent>
                  {schemes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — ₦{s.awardAmount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Eligibility alert */}
            {selectedScheme && ineligibilityReasons.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                  <AlertCircle size={13} /> You may not meet eligibility
                  requirements
                </p>
                <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                  {ineligibilityReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedScheme && schemeEligible && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
                <p className="font-semibold mb-1">
                  Eligibility confirmed for this scheme ✓
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>
                    CGPA: {MY_PROFILE.cgpa} ≥ {selectedScheme.minCGPA} ✓
                  </li>
                  <li>Level: {MY_PROFILE.level} ✓</li>
                  <li>Department: {MY_PROFILE.department} ✓</li>
                </ul>
              </div>
            )}

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
                data-ocid="scholarship.apply.amount"
              />
            </div>
            <div>
              <Label>Purpose / Statement *</Label>
              <Textarea
                className="mt-1 resize-none"
                value={form.purpose}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purpose: e.target.value }))
                }
                placeholder="Explain how this scholarship will benefit your academics..."
                rows={3}
                data-ocid="scholarship.apply.purpose"
              />
            </div>
            <div>
              <Label>Supporting Documents (describe or list) *</Label>
              <Textarea
                className="mt-1 resize-none"
                value={form.supportingDocuments}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    supportingDocuments: e.target.value,
                  }))
                }
                placeholder="e.g. Academic transcript, letter of recommendation..."
                rows={2}
              />
            </div>
            {incomeTestRequired && (
              <div>
                <Label className="flex items-center gap-1">
                  Income Letter Reference
                  <span className="text-red-500 text-xs ml-1">
                    * Required for this scheme
                  </span>
                </Label>
                <Input
                  className="mt-1"
                  value={form.incomeLetter}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, incomeLetter: e.target.value }))
                  }
                  placeholder="e.g. Income declaration reference / document ID"
                  data-ocid="scholarship.apply.income-letter"
                />
              </div>
            )}
            <div>
              <Label>Recommendation Letter Reference (optional)</Label>
              <Input
                className="mt-1"
                value={form.recommendationLetter}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    recommendationLetter: e.target.value,
                  }))
                }
                placeholder="e.g. Letter from HOD / Supervisor reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
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
                  {
                    label: "Scheme",
                    value: viewed.schemeName ?? typeLabels[viewed.type],
                  },
                  { label: "Session", value: viewed.session },
                  {
                    label: "Requested",
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
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${statusConfig[viewed.status].color}`}
                >
                  {statusConfig[viewed.status].icon}
                  {statusConfig[viewed.status].label}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                <p className="text-foreground">{viewed.purpose}</p>
              </div>
              {viewed.supportingDocuments && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Supporting Documents
                  </p>
                  <p className="text-foreground">
                    {viewed.supportingDocuments}
                  </p>
                </div>
              )}
              {viewed.incomeLetter && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Income Letter
                  </p>
                  <p className="text-foreground">{viewed.incomeLetter}</p>
                </div>
              )}
              {viewed.reviewComment && (
                <div
                  className={`px-3 py-2 rounded border ${viewed.status === "rejected" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                >
                  <p
                    className={`text-xs font-semibold mb-1 ${viewed.status === "rejected" ? "text-red-700" : "text-green-700"}`}
                  >
                    Reviewer Comment
                  </p>
                  <p
                    className={`text-xs ${viewed.status === "rejected" ? "text-red-800" : "text-green-800"}`}
                  >
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
