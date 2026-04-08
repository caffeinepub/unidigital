import {
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  Printer,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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

const STORAGE_KEY = "unidigital_scholarships";

type ScholarshipType = "federal" | "state" | "institutional" | "donor";
type ScholarshipStatus =
  | "applied"
  | "under_review"
  | "approved"
  | "disbursed"
  | "rejected";

interface ScholarshipApplication {
  id: string;
  studentMatric: string;
  studentName: string;
  department: string;
  level: string;
  cgpa: number;
  scholarshipType: ScholarshipType;
  amount: number;
  purpose: string;
  supportingDocuments: string;
  status: ScholarshipStatus;
  appliedAt: string;
  reviewedAt?: string;
  awardAmount?: number;
  reviewComment?: string;
  disbursedAt?: string;
  disbursementRef?: string;
}

const TYPE_LABELS: Record<ScholarshipType, string> = {
  federal: "Federal Government",
  state: "State Government",
  institutional: "Institutional Award",
  donor: "Donor / Endowment Fund",
};

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

// Seed some demo applications
const SEED_KEY = "unidigital_scholarships_seeded_v1";
function seedScholarships() {
  if (localStorage.getItem(SEED_KEY)) return;
  const demo: ScholarshipApplication[] = [
    {
      id: "SCH-DEMO-001",
      studentMatric: "FUEK/SCI/2025/CSC/002",
      studentName: "Fatima Al-Hassan",
      department: "Computer Science",
      level: "300",
      cgpa: 3.85,
      scholarshipType: "federal",
      amount: 150000,
      purpose:
        "To support final year research project and academic materials for the 2024/2025 academic year.",
      supportingDocuments:
        "Academic transcript, JAMB result, parent income certificate",
      status: "under_review",
      appliedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "SCH-DEMO-002",
      studentMatric: "FUEK/SCI/2025/PHY/003",
      studentName: "Emeka Okafor",
      department: "Physics",
      level: "200",
      cgpa: 3.62,
      scholarshipType: "institutional",
      amount: 80000,
      purpose:
        "Institutional academic excellence award for outstanding performance in first year.",
      supportingDocuments:
        "Academic transcript, letter of recommendation from HOD",
      status: "applied",
      appliedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "SCH-DEMO-003",
      studentMatric: "FUEK/SCI/2025/MAT/001",
      studentName: "Grace Adebayo",
      department: "Mathematics",
      level: "400",
      cgpa: 4.2,
      scholarshipType: "donor",
      amount: 200000,
      purpose:
        "Postgraduate preparation fund for final year Mathematics student pursuing research.",
      supportingDocuments:
        "Transcript, research proposal, supervisor endorsement",
      status: "approved",
      appliedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      reviewedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      awardAmount: 180000,
      reviewComment:
        "Approved with 90% of requested amount based on committee assessment.",
    },
  ];
  const existing = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  })();
  if (existing.length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  }
  localStorage.setItem(SEED_KEY, "1");
}

function getApplications(): ScholarshipApplication[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveApplications(apps: ScholarshipApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

type ViewMode = "list" | "reports";

export function ScholarshipManagement() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>(
    [],
  );
  const [view, setView] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    id: string;
    action: "approve" | "reject" | "disburse";
  } | null>(null);
  const [awardAmount, setAwardAmount] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [disbursementRef, setDisbursementRef] = useState("");

  useEffect(() => {
    seedScholarships();
    setApplications(getApplications());
  }, []);

  const applyAction = () => {
    if (!reviewForm) return;
    const { id, action } = reviewForm;

    if (action === "approve" && !awardAmount) {
      toast.error("Enter the award amount.");
      return;
    }
    if (action === "reject" && !reviewComment.trim()) {
      toast.error("Enter a reason for rejection.");
      return;
    }
    if (action === "disburse" && !disbursementRef.trim()) {
      toast.error("Enter the disbursement reference.");
      return;
    }

    const updated = applications.map((a) => {
      if (a.id !== id) return a;
      if (action === "approve") {
        return {
          ...a,
          status: "approved" as ScholarshipStatus,
          reviewedAt: new Date().toISOString(),
          awardAmount: Number(awardAmount),
          reviewComment,
        };
      }
      if (action === "reject") {
        return {
          ...a,
          status: "rejected" as ScholarshipStatus,
          reviewedAt: new Date().toISOString(),
          reviewComment,
        };
      }
      if (action === "disburse") {
        return {
          ...a,
          status: "disbursed" as ScholarshipStatus,
          disbursedAt: new Date().toISOString(),
          disbursementRef,
        };
      }
      return a;
    });
    saveApplications(updated);
    setApplications(updated);
    const msgs = {
      approve: "Scholarship approved.",
      reject: "Application rejected.",
      disburse: "Disbursement recorded.",
    };
    toast.success(msgs[action]);
    setReviewForm(null);
    setAwardAmount("");
    setReviewComment("");
    setDisbursementRef("");
  };

  const setUnderReview = (id: string) => {
    const updated = applications.map((a) =>
      a.id === id ? { ...a, status: "under_review" as ScholarshipStatus } : a,
    );
    saveApplications(updated);
    setApplications(updated);
    toast.success("Application moved to Under Review.");
  };

  const filtered = applications.filter((a) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchType = filterType === "all" || a.scholarshipType === filterType;
    return matchStatus && matchType;
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

  const printAwardLetter = (app: ScholarshipApplication) => {
    const content = `
      <!DOCTYPE html><html><head><title>Award Letter</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}
      h2{text-align:center;color:#1e3a5f}p{line-height:1.8}
      .footer{margin-top:60px;display:flex;justify-content:space-between}
      .sig{border-top:1px solid #000;width:200px;padding-top:6px;text-align:center;font-size:12px}
      </style></head><body>
      <h2>FEDERAL UNIVERSITY OF EDUCATION KONTAGORA</h2>
      <h3 style="text-align:center">SCHOLARSHIP AWARD LETTER</h3>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <p>Dear <strong>${app.studentName}</strong> (${app.studentMatric}),</p>
      <p>We are pleased to inform you that following the review of your scholarship application, the Scholarship Committee has approved your application under the <strong>${TYPE_LABELS[app.scholarshipType]}</strong> scheme.</p>
      <p><strong>Award Amount:</strong> ₦${(app.awardAmount ?? app.amount).toLocaleString()}</p>
      <p><strong>Department:</strong> ${app.department} | <strong>Level:</strong> ${app.level}L | <strong>CGPA:</strong> ${app.cgpa.toFixed(2)}</p>
      <p>This award is subject to continued satisfactory academic performance and compliance with university regulations.</p>
      <p>Congratulations on this achievement.</p>
      <div class="footer">
        <div class="sig">Registrar's Signature<br/>Date: ___________</div>
        <div class="sig">Student's Signature<br/>Date: ___________</div>
      </div>
      <p style="margin-top:30px;font-size:11px;text-align:center;color:#888">FUEK MIS | Printed: ${new Date().toLocaleDateString()}</p>
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(content);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Scholarship Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Review applications, approve awards, and track disbursements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            data-ocid="scholarship-admin.list-tab"
          >
            <FileText size={14} className="mr-1.5" /> Applications
          </Button>
          <Button
            size="sm"
            variant={view === "reports" ? "default" : "outline"}
            onClick={() => setView("reports")}
            data-ocid="scholarship-admin.reports-tab"
          >
            <Award size={14} className="mr-1.5" /> Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: "Total Applications",
            value: stats.total,
            color: "text-slate-700",
          },
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
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* APPLICATIONS LIST */}
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                className="w-40"
                data-ocid="scholarship-admin.filter-status"
              >
                <SelectValue />
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger
                className="w-44"
                data-ocid="scholarship-admin.filter-type"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(Object.keys(TYPE_LABELS) as ScholarshipType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500 self-center">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Award size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">
                  No scholarship applications found.
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status];
              const expanded = expandedId === app.id;
              return (
                <Card
                  key={app.id}
                  className="overflow-hidden"
                  data-ocid={`scholarship-admin.item.${app.id}`}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors text-left"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-800">
                          {app.studentName}
                        </span>
                        <span className="font-mono text-xs text-blue-600">
                          {app.studentMatric}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-sm text-slate-500">
                          {app.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {TYPE_LABELS[app.scholarshipType]} · CGPA:{" "}
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
                      <span className="font-bold text-sm text-slate-800">
                        ₦{app.amount.toLocaleString()}
                      </span>
                      {expanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t bg-slate-50 px-5 py-4 space-y-4">
                      <p className="text-sm text-slate-700">{app.purpose}</p>
                      {app.supportingDocuments && (
                        <p className="text-xs text-slate-500">
                          <strong>Documents:</strong> {app.supportingDocuments}
                        </p>
                      )}

                      {/* Action Buttons */}
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
                        {["applied", "under_review"].includes(app.status) && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                setReviewForm({
                                  id: app.id,
                                  action: "approve",
                                });
                                setExpandedId(app.id);
                              }}
                            >
                              <CheckCircle size={14} className="mr-1.5" />{" "}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setReviewForm({ id: app.id, action: "reject" });
                                setExpandedId(app.id);
                              }}
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
                              onClick={() => {
                                setReviewForm({
                                  id: app.id,
                                  action: "disburse",
                                });
                                setExpandedId(app.id);
                              }}
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

                      {/* Inline Action Forms */}
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

      {/* REPORTS VIEW */}
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
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Student",
                      "Matric No.",
                      "Dept",
                      "Type",
                      "CGPA",
                      "Requested",
                      "Awarded",
                      "Status",
                      "Date",
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
                  {applications.map((a) => {
                    const cfg = STATUS_CONFIG[a.status];
                    return (
                      <tr
                        key={a.id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {a.studentName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600">
                          {a.studentMatric}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {a.department}
                        </td>
                        <td className="px-4 py-3">
                          {TYPE_LABELS[a.scholarshipType]}
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
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(a.appliedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {applications.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-slate-400"
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
    </div>
  );
}
