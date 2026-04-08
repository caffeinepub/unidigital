import {
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Info,
  Printer,
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
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";

// ─── Types ──────────────────────────────────────────────────────────────────

const APPS_KEY = "unidigital_scholarships";
const SCHEMES_KEY = "unidigital_scholarship_schemes";

type ScholarshipStatus =
  | "applied"
  | "under_review"
  | "approved"
  | "disbursed"
  | "rejected";

interface ScholarshipScheme {
  id: string;
  name: string;
  description: string;
  minCGPA: number;
  levelFilter: string; // "all" | "100" | "200" | "300" | "400"
  departmentFilter: string; // "all" | department name
  incomeTestRequired: boolean;
  awardAmount: number;
  maxRecipients: number;
  session: string;
  active: boolean;
  createdAt: string;
}

interface Application {
  id: string;
  schemeId?: string;
  schemeName?: string;
  studentMatric: string;
  studentName: string;
  department: string;
  level: string;
  cgpa: number;
  scholarshipType: string;
  amount: number;
  purpose: string;
  supportingDocuments: string;
  incomeLetter?: string;
  recommendationLetter?: string;
  status: ScholarshipStatus;
  appliedAt: string;
  reviewedAt?: string;
  awardAmount?: number;
  reviewComment?: string;
  disbursedAt?: string;
  disbursementRef?: string;
  eligibilityOverride?: boolean;
  overrideReason?: string;
}

// ─── Seeds ──────────────────────────────────────────────────────────────────

const SEED_KEY = "unidigital_scholarships_seeded_v2";
const SCHEME_SEED_KEY = "unidigital_scholarship_schemes_seeded_v1";

function seedSchemes() {
  if (localStorage.getItem(SCHEME_SEED_KEY)) return;
  const schemes: ScholarshipScheme[] = [
    {
      id: "SCM-001",
      name: "Federal Government Merit Scholarship",
      description:
        "Academic excellence scholarship for top-performing students across all departments.",
      minCGPA: 3.5,
      levelFilter: "all",
      departmentFilter: "all",
      incomeTestRequired: false,
      awardAmount: 150000,
      maxRecipients: 10,
      session: "2024/2025",
      active: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: "SCM-002",
      name: "Institutional Bursary Award",
      description:
        "Need-based financial support for students from low-income households.",
      minCGPA: 2.5,
      levelFilter: "all",
      departmentFilter: "all",
      incomeTestRequired: true,
      awardAmount: 80000,
      maxRecipients: 20,
      session: "2024/2025",
      active: true,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: "SCM-003",
      name: "Computer Science Excellence Award",
      description: "Department-specific award for outstanding CSC students.",
      minCGPA: 3.8,
      levelFilter: "300",
      departmentFilter: "Computer Science",
      incomeTestRequired: false,
      awardAmount: 200000,
      maxRecipients: 3,
      session: "2024/2025",
      active: true,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];
  localStorage.setItem(SCHEMES_KEY, JSON.stringify(schemes));
  localStorage.setItem(SCHEME_SEED_KEY, "1");
}

function seedApplications() {
  if (localStorage.getItem(SEED_KEY)) return;
  const demo: Application[] = [
    {
      id: "SCH-DEMO-001",
      schemeId: "SCM-001",
      schemeName: "Federal Government Merit Scholarship",
      studentMatric: "FUEK/SCI/2025/CSC/002",
      studentName: "Fatima Al-Hassan",
      department: "Computer Science",
      level: "300",
      cgpa: 3.85,
      scholarshipType: "federal",
      amount: 150000,
      purpose: "To support final year research project and academic materials.",
      supportingDocuments: "Academic transcript, JAMB result",
      status: "under_review",
      appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "SCH-DEMO-002",
      schemeId: "SCM-002",
      schemeName: "Institutional Bursary Award",
      studentMatric: "FUEK/SCI/2025/PHY/003",
      studentName: "Emeka Okafor",
      department: "Physics",
      level: "200",
      cgpa: 3.62,
      scholarshipType: "institutional",
      amount: 80000,
      purpose:
        "Institutional academic excellence award for outstanding performance.",
      supportingDocuments:
        "Academic transcript, letter of recommendation from HOD",
      incomeLetter: "Income declaration from parent — FUEK/INC/2024/0023",
      status: "applied",
      appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "SCH-DEMO-003",
      schemeId: "SCM-003",
      schemeName: "Computer Science Excellence Award",
      studentMatric: "FUEK/SCI/2025/MAT/001",
      studentName: "Grace Adebayo",
      department: "Mathematics",
      level: "400",
      cgpa: 4.2,
      scholarshipType: "donor",
      amount: 200000,
      purpose: "Postgraduate preparation fund for final year student.",
      supportingDocuments:
        "Transcript, research proposal, supervisor endorsement",
      recommendationLetter:
        "Recommendation from Dr. Bello, Dept of Mathematics",
      status: "approved",
      appliedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      reviewedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      awardAmount: 180000,
      reviewComment:
        "Approved with 90% of requested amount based on committee assessment.",
    },
  ];
  const existing = (() => {
    try {
      return JSON.parse(localStorage.getItem(APPS_KEY) ?? "[]");
    } catch {
      return [];
    }
  })();
  if (existing.length === 0) {
    localStorage.setItem(APPS_KEY, JSON.stringify(demo));
  }
  localStorage.setItem(SEED_KEY, "1");
}

function getSchemes(): ScholarshipScheme[] {
  try {
    return JSON.parse(localStorage.getItem(SCHEMES_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveSchemes(s: ScholarshipScheme[]) {
  localStorage.setItem(SCHEMES_KEY, JSON.stringify(s));
}
function getApplications(): Application[] {
  try {
    return JSON.parse(localStorage.getItem(APPS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveApplications(apps: Application[]) {
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
}

const STATUS_CONFIG: Record<
  ScholarshipStatus,
  { label: string; color: string }
> = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  under_review: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-700",
  },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  disbursed: { label: "Disbursed", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Education",
  "Human Kinetics",
  "Health Education",
];

// ─── Eligibility check ───────────────────────────────────────────────────────

function checkEligibility(
  app: Application,
  scheme: ScholarshipScheme | undefined,
): { eligible: boolean; reasons: string[] } {
  if (!scheme) return { eligible: true, reasons: [] };
  const reasons: string[] = [];
  if (app.cgpa < scheme.minCGPA)
    reasons.push(`CGPA ${app.cgpa} < minimum ${scheme.minCGPA}`);
  if (scheme.levelFilter !== "all" && app.level !== scheme.levelFilter)
    reasons.push(
      `Level ${app.level} not eligible (scheme requires ${scheme.levelFilter})`,
    );
  if (
    scheme.departmentFilter !== "all" &&
    app.department !== scheme.departmentFilter
  )
    reasons.push(`Department "${app.department}" not eligible`);
  return { eligible: reasons.length === 0, reasons };
}

// ─── Component ──────────────────────────────────────────────────────────────

type ViewMode = "list" | "schemes" | "reports";

export function ScholarshipManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [schemes, setSchemes] = useState<ScholarshipScheme[]>([]);
  const [view, setView] = useState<ViewMode>("list");

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterScheme, setFilterScheme] = useState<string>("all");

  // Applications
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    id: string;
    action: "approve" | "reject" | "disburse";
  } | null>(null);
  const [awardAmount, setAwardAmount] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [disbursementRef, setDisbursementRef] = useState("");
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");

  // Scheme creation
  const [schemeDialog, setSchemeDialog] = useState(false);
  const [schemeForm, setSchemeForm] = useState<
    Omit<ScholarshipScheme, "id" | "createdAt">
  >({
    name: "",
    description: "",
    minCGPA: 2.5,
    levelFilter: "all",
    departmentFilter: "all",
    incomeTestRequired: false,
    awardAmount: 0,
    maxRecipients: 10,
    session: "2024/2025",
    active: true,
  });

  useEffect(() => {
    seedSchemes();
    seedApplications();
    setSchemes(getSchemes());
    setApplications(getApplications());
  }, []);

  // ─── Scheme actions ──────────────────────────────────────────────────────

  const saveScheme = () => {
    if (!schemeForm.name.trim() || schemeForm.awardAmount <= 0) {
      toast.error("Name and award amount are required.");
      return;
    }
    const newScheme: ScholarshipScheme = {
      ...schemeForm,
      id: `SCM-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...schemes, newScheme];
    saveSchemes(updated);
    setSchemes(updated);
    setSchemeDialog(false);
    toast.success("Scholarship scheme created.");
  };

  const toggleScheme = (id: string) => {
    const updated = schemes.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s,
    );
    saveSchemes(updated);
    setSchemes(updated);
  };

  // ─── Application actions ─────────────────────────────────────────────────

  const setUnderReview = (id: string) => {
    const updated = applications.map((a) =>
      a.id === id ? { ...a, status: "under_review" as ScholarshipStatus } : a,
    );
    saveApplications(updated);
    setApplications(updated);
    toast.success("Moved to Under Review.");
  };

  const applyAction = () => {
    if (!reviewForm) return;
    const { id, action } = reviewForm;
    if (action === "approve" && !awardAmount) {
      toast.error("Enter the award amount.");
      return;
    }
    if (action === "reject" && !reviewComment.trim()) {
      toast.error("Enter a rejection reason.");
      return;
    }
    if (action === "disburse" && !disbursementRef.trim()) {
      toast.error("Enter disbursement reference.");
      return;
    }

    const updated = applications.map((a) => {
      if (a.id !== id) return a;
      if (action === "approve")
        return {
          ...a,
          status: "approved" as ScholarshipStatus,
          reviewedAt: new Date().toISOString(),
          awardAmount: Number(awardAmount),
          reviewComment,
        };
      if (action === "reject")
        return {
          ...a,
          status: "rejected" as ScholarshipStatus,
          reviewedAt: new Date().toISOString(),
          reviewComment,
        };
      return {
        ...a,
        status: "disbursed" as ScholarshipStatus,
        disbursedAt: new Date().toISOString(),
        disbursementRef,
      };
    });
    saveApplications(updated);
    setApplications(updated);
    toast.success(
      {
        approve: "Scholarship approved.",
        reject: "Application rejected.",
        disburse: "Disbursement recorded.",
      }[action],
    );
    setReviewForm(null);
    setAwardAmount("");
    setReviewComment("");
    setDisbursementRef("");
  };

  const applyOverride = (id: string) => {
    if (!overrideReason.trim()) {
      toast.error("Provide a reason for override.");
      return;
    }
    const updated = applications.map((a) =>
      a.id === id ? { ...a, eligibilityOverride: true, overrideReason } : a,
    );
    saveApplications(updated);
    setApplications(updated);
    setOverrideId(null);
    setOverrideReason("");
    toast.success("Eligibility override applied.");
  };

  const printAwardLetter = (app: Application) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Award Letter</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
    h2{text-align:center;color:#1e3a5f}p{line-height:1.8}
    .footer{margin-top:60px;display:flex;justify-content:space-between}
    .sig{border-top:1px solid #000;width:200px;padding-top:6px;text-align:center;font-size:12px}
    </style></head><body>
    <h2>FEDERAL UNIVERSITY OF EDUCATION KONTAGORA</h2>
    <h3 style="text-align:center">SCHOLARSHIP AWARD LETTER</h3>
    <p>Date: ${new Date().toLocaleDateString()}</p>
    <p>Dear <strong>${app.studentName}</strong> (${app.studentMatric}),</p>
    <p>Following the review of your scholarship application, the Scholarship Committee has approved your application${app.schemeName ? ` under the <strong>${app.schemeName}</strong> scheme` : ""}.</p>
    <p><strong>Award Amount:</strong> ₦${(app.awardAmount ?? app.amount).toLocaleString()}</p>
    <p><strong>Department:</strong> ${app.department} &nbsp;&nbsp; <strong>Level:</strong> ${app.level}L &nbsp;&nbsp; <strong>CGPA:</strong> ${app.cgpa.toFixed(2)}</p>
    <p>This award is subject to continued satisfactory academic performance and compliance with university regulations.</p>
    <p>Congratulations on this achievement.</p>
    <div class="footer">
      <div class="sig">Registrar's Signature<br/>Date: ___________</div>
      <div class="sig">Student's Signature<br/>Date: ___________</div>
    </div>
    <p style="margin-top:30px;font-size:11px;text-align:center;color:#888">FUEK MIS | Printed: ${new Date().toLocaleDateString()}</p>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
    win.document.close();
  };

  // ─── Derived state ───────────────────────────────────────────────────────

  const filtered = applications.filter((a) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchScheme = filterScheme === "all" || a.schemeId === filterScheme;
    return matchStatus && matchScheme;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) =>
      ["applied", "under_review"].includes(a.status),
    ).length,
    approved: applications.filter((a) => a.status === "approved").length,
    disbursed: applications.filter((a) => a.status === "disbursed").length,
    totalAwarded: applications
      .filter(
        (a) => ["approved", "disbursed"].includes(a.status) && a.awardAmount,
      )
      .reduce((s, a) => s + (a.awardAmount ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Scholarship Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage scholarship schemes, review applications, and track
            disbursements
          </p>
        </div>
        <div className="flex gap-2">
          {(["list", "schemes", "reports"] as ViewMode[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? "default" : "outline"}
              onClick={() => setView(v)}
              data-ocid={`scholarship-admin.tab.${v}`}
            >
              {v === "list" ? (
                <>
                  <FileText size={14} className="mr-1.5" /> Applications
                </>
              ) : v === "schemes" ? (
                <>
                  <Award size={14} className="mr-1.5" /> Schemes
                </>
              ) : (
                <>
                  <DollarSign size={14} className="mr-1.5" /> Reports
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          {
            label: "Pending Review",
            value: stats.pending,
            color: "text-blue-700",
          },
          { label: "Approved", value: stats.approved, color: "text-green-700" },
          {
            label: "Disbursed",
            value: stats.disbursed,
            color: "text-emerald-700",
          },
          {
            label: "Total Awarded (₦)",
            value: `₦${stats.totalAwarded.toLocaleString()}`,
            color: "text-purple-700",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground font-medium">
                {s.label}
              </p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── APPLICATIONS LIST ─── */}
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                className="w-40"
                data-ocid="scholarship-admin.filter-status"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.keys(STATUS_CONFIG) as ScholarshipStatus[]).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Select value={filterScheme} onValueChange={setFilterScheme}>
              <SelectTrigger
                className="w-52"
                data-ocid="scholarship-admin.filter-scheme"
              >
                <SelectValue placeholder="All Schemes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schemes</SelectItem>
                {schemes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground self-center">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Award
                  size={40}
                  className="mx-auto text-muted-foreground/30 mb-3"
                />
                <p className="text-muted-foreground">
                  No scholarship applications found.
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status];
              const expanded = expandedId === app.id;
              const scheme = schemes.find((s) => s.id === app.schemeId);
              const { eligible, reasons: ineligReasons } = checkEligibility(
                app,
                scheme,
              );
              const isEligible = eligible || app.eligibilityOverride;

              return (
                <Card
                  key={app.id}
                  className="overflow-hidden"
                  data-ocid={`scholarship-admin.item.${app.id}`}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors text-left"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">
                          {app.studentName}
                        </span>
                        <span className="font-mono text-xs text-primary">
                          {app.studentMatric}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-sm text-muted-foreground">
                          {app.department}
                        </span>
                        {!isEligible && (
                          <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                            Ineligible
                          </Badge>
                        )}
                        {app.eligibilityOverride && (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                            Override Applied
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.schemeName ?? "No scheme"} · CGPA:{" "}
                        {app.cgpa.toFixed(2)} · Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-bold text-sm text-foreground">
                        ₦{app.amount.toLocaleString()}
                      </span>
                      {expanded ? (
                        <ChevronUp
                          size={16}
                          className="text-muted-foreground"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-muted-foreground"
                        />
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t bg-muted/10 px-5 py-4 space-y-4">
                      {/* Eligibility check result */}
                      {!isEligible && scheme && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                            <Info size={12} /> Eligibility Issues (scheme
                            requirements not met)
                          </p>
                          <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                            {ineligReasons.map((r) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                          {overrideId !== app.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 text-amber-600 border-amber-300 hover:bg-amber-50 text-xs"
                              onClick={() => setOverrideId(app.id)}
                            >
                              Admin Override
                            </Button>
                          ) : (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                placeholder="Reason for override..."
                                rows={2}
                                className="text-xs resize-none"
                                value={overrideReason}
                                onChange={(e) =>
                                  setOverrideReason(e.target.value)
                                }
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                                  onClick={() => applyOverride(app.id)}
                                >
                                  Apply Override
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => setOverrideId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-foreground">{app.purpose}</p>
                      {app.supportingDocuments && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Documents:</strong> {app.supportingDocuments}
                        </p>
                      )}
                      {app.incomeLetter && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Income Letter:</strong> {app.incomeLetter}
                        </p>
                      )}
                      {app.recommendationLetter && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Recommendation:</strong>{" "}
                          {app.recommendationLetter}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {app.status === "applied" && (
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => setUnderReview(app.id)}
                          >
                            <Clock size={14} className="mr-1.5" /> Mark Under
                            Review
                          </Button>
                        )}
                        {["applied", "under_review"].includes(app.status) &&
                          isEligible && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setReviewForm({
                                    id: app.id,
                                    action: "approve",
                                  });
                                  setAwardAmount(String(app.amount));
                                }}
                              >
                                <CheckCircle size={14} className="mr-1.5" />{" "}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  setReviewForm({
                                    id: app.id,
                                    action: "reject",
                                  })
                                }
                              >
                                <XCircle size={14} className="mr-1.5" /> Reject
                              </Button>
                            </>
                          )}
                        {app.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() =>
                                setReviewForm({
                                  id: app.id,
                                  action: "disburse",
                                })
                              }
                            >
                              <DollarSign size={14} className="mr-1.5" /> Record
                              Disbursement
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printAwardLetter(app)}
                            >
                              <Printer size={14} className="mr-1.5" /> Print
                              Award Letter
                            </Button>
                          </>
                        )}
                        {app.status === "disbursed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printAwardLetter(app)}
                          >
                            <Printer size={14} className="mr-1.5" /> Print Award
                            Letter
                          </Button>
                        )}
                      </div>

                      {/* Inline action forms */}
                      {reviewForm?.id === app.id &&
                        reviewForm.action === "approve" && (
                          <div className="bg-green-50 border border-green-200 rounded p-3 space-y-3">
                            <h4 className="text-sm font-semibold text-green-800">
                              Approve Scholarship
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">
                                  Award Amount (₦) *
                                </Label>
                                <Input
                                  type="number"
                                  className="mt-1 h-9 text-sm"
                                  value={awardAmount}
                                  onChange={(e) =>
                                    setAwardAmount(e.target.value)
                                  }
                                  data-ocid="scholarship-admin.award-amount"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Committee Comments
                                </Label>
                                <Input
                                  className="mt-1 h-9 text-sm"
                                  value={reviewComment}
                                  onChange={(e) =>
                                    setReviewComment(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={applyAction}
                                data-ocid="scholarship-admin.approve-confirm"
                              >
                                Confirm Approval
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewForm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                      {reviewForm?.id === app.id &&
                        reviewForm.action === "reject" && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
                            <h4 className="text-sm font-semibold text-red-700">
                              Reject Application
                            </h4>
                            <Textarea
                              rows={2}
                              className="text-sm resize-none"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Reason for rejection..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={applyAction}
                                data-ocid="scholarship-admin.reject-confirm"
                              >
                                Confirm Rejection
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewForm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                      {reviewForm?.id === app.id &&
                        reviewForm.action === "disburse" && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 space-y-2">
                            <h4 className="text-sm font-semibold text-emerald-800">
                              Record Disbursement
                            </h4>
                            <div>
                              <Label className="text-xs">
                                Disbursement Reference / Transaction ID *
                              </Label>
                              <Input
                                className="mt-1 text-sm"
                                value={disbursementRef}
                                onChange={(e) =>
                                  setDisbursementRef(e.target.value)
                                }
                                placeholder="e.g. PAY/2024/0088"
                                data-ocid="scholarship-admin.disburse-ref"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={applyAction}
                                data-ocid="scholarship-admin.disburse-confirm"
                              >
                                Confirm Disbursement
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewForm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                      {app.reviewComment && (
                        <p
                          className={`text-sm px-3 py-2 rounded ${app.status === "rejected" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                        >
                          <strong>Comment:</strong> {app.reviewComment}
                        </p>
                      )}
                      {app.awardAmount !== undefined && (
                        <p className="text-sm text-green-700 font-semibold">
                          Awarded Amount: ₦{app.awardAmount.toLocaleString()}
                          {app.disbursementRef && (
                            <span className="text-xs font-normal ml-2 text-muted-foreground">
                              Ref: {app.disbursementRef}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ─── SCHEMES ─── */}
      {view === "schemes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setSchemeDialog(true)}
              data-ocid="scholarship-admin.create-scheme"
            >
              <Award size={16} className="mr-2" /> Create Scheme
            </Button>
          </div>
          {schemes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Award
                  size={40}
                  className="mx-auto text-muted-foreground/30 mb-3"
                />
                <p className="text-muted-foreground">
                  No scholarship schemes yet. Create one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            schemes.map((s) => {
              const appCount = applications.filter(
                (a) => a.schemeId === s.id,
              ).length;
              return (
                <Card
                  key={s.id}
                  className={s.active ? "" : "opacity-60"}
                  data-ocid={`scholarship-admin.scheme.${s.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {s.name}
                          </h3>
                          <Badge
                            className={
                              s.active
                                ? "bg-green-100 text-green-700 border-0"
                                : "bg-muted text-muted-foreground border-0"
                            }
                          >
                            {s.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {s.description}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-xs text-muted-foreground">
                          <span>
                            <strong>Min CGPA:</strong> {s.minCGPA}
                          </span>
                          <span>
                            <strong>Level:</strong>{" "}
                            {s.levelFilter === "all"
                              ? "All"
                              : `${s.levelFilter}L`}
                          </span>
                          <span>
                            <strong>Dept:</strong>{" "}
                            {s.departmentFilter === "all"
                              ? "All"
                              : s.departmentFilter}
                          </span>
                          <span>
                            <strong>Amount:</strong> ₦
                            {s.awardAmount.toLocaleString()}
                          </span>
                          <span>
                            <strong>Max Recipients:</strong> {s.maxRecipients}
                          </span>
                          <span>
                            <strong>Session:</strong> {s.session}
                          </span>
                          <span>
                            <strong>Income Test:</strong>{" "}
                            {s.incomeTestRequired ? "Yes" : "No"}
                          </span>
                          <span>
                            <strong>Applications:</strong> {appCount}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className={
                          s.active
                            ? "text-muted-foreground"
                            : "text-green-600 border-green-300"
                        }
                        onClick={() => toggleScheme(s.id)}
                      >
                        {s.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ─── REPORTS ─── */}
      {view === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Scholarship Awards Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    {[
                      "Student",
                      "Matric No.",
                      "Dept",
                      "Scheme",
                      "CGPA",
                      "Requested",
                      "Awarded",
                      "Status",
                      "Date",
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
                  {applications.map((a) => {
                    const cfg = STATUS_CONFIG[a.status];
                    return (
                      <tr
                        key={a.id}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-medium">
                          {a.studentName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-primary">
                          {a.studentMatric}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {a.department}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {a.schemeName ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {a.cgpa.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-mono text-right">
                          ₦{a.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-right">
                          {a.awardAmount !== undefined
                            ? `₦${a.awardAmount.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(a.appliedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {applications.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        No scholarship applications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Scheme Dialog */}
      <Dialog open={schemeDialog} onOpenChange={setSchemeDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Scholarship Scheme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Scheme Name *</Label>
              <Input
                className="mt-1"
                value={schemeForm.name}
                onChange={(e) =>
                  setSchemeForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Federal Government Merit Scholarship"
                data-ocid="scholarship.scheme.name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={2}
                value={schemeForm.description}
                onChange={(e) =>
                  setSchemeForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Minimum CGPA</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="mt-1"
                  value={schemeForm.minCGPA}
                  onChange={(e) =>
                    setSchemeForm((f) => ({
                      ...f,
                      minCGPA: Number(e.target.value),
                    }))
                  }
                  data-ocid="scholarship.scheme.min-cgpa"
                />
              </div>
              <div>
                <Label>Award Amount (₦) *</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={schemeForm.awardAmount || ""}
                  onChange={(e) =>
                    setSchemeForm((f) => ({
                      ...f,
                      awardAmount: Number(e.target.value),
                    }))
                  }
                  data-ocid="scholarship.scheme.amount"
                />
              </div>
              <div>
                <Label>Level Filter</Label>
                <Select
                  value={schemeForm.levelFilter}
                  onValueChange={(v) =>
                    setSchemeForm((f) => ({ ...f, levelFilter: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {["100", "200", "300", "400"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}L
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department Filter</Label>
                <Select
                  value={schemeForm.departmentFilter}
                  onValueChange={(v) =>
                    setSchemeForm((f) => ({ ...f, departmentFilter: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Recipients</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={schemeForm.maxRecipients}
                  onChange={(e) =>
                    setSchemeForm((f) => ({
                      ...f,
                      maxRecipients: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Academic Session</Label>
                <Select
                  value={schemeForm.session}
                  onValueChange={(v) =>
                    setSchemeForm((f) => ({ ...f, session: v }))
                  }
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
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={schemeForm.incomeTestRequired}
                onCheckedChange={(v) =>
                  setSchemeForm((f) => ({ ...f, incomeTestRequired: v }))
                }
                data-ocid="scholarship.scheme.income-test"
              />
              <div>
                <Label className="cursor-pointer">Income Test Required</Label>
                <p className="text-xs text-muted-foreground">
                  Applicants must upload an income declaration letter
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchemeDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={saveScheme}
              data-ocid="scholarship.scheme.submit"
            >
              Create Scheme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
