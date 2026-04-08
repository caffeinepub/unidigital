import {
  BarChart2,
  CheckCircle,
  DollarSign,
  FileText,
  MessageSquare,
  PlusCircle,
  Printer,
  RefreshCw,
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
import type { BudgetRequest } from "../hod/BudgetRequest";
import { categoryLabels } from "../hod/BudgetRequest";

const LS_KEY = "unidigital_budget_requests";
const PROC_KEY = "unidigital_procurement_requests";
const EXP_KEY = "unidigital_budget_expenditure";

interface Expenditure {
  id: string;
  budgetRequestId: string;
  lineItemId: string;
  lineItemLabel: string;
  description: string;
  actualAmount: number;
  recordedAt: string;
  recordedBy: string;
}

interface ProcurementItem {
  id: string;
  department: string;
  budgetRequestId: string;
  itemDescription: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  deliveryDate: string;
  status: "pending" | "approved" | "rejected" | "delivered";
  submittedAt: string;
  adminComment?: string;
}

function loadRequests(): BudgetRequest[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveRequests(data: BudgetRequest[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function loadProc(): ProcurementItem[] {
  try {
    return JSON.parse(localStorage.getItem(PROC_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveProc(data: ProcurementItem[]) {
  localStorage.setItem(PROC_KEY, JSON.stringify(data));
}
function loadExp(): Expenditure[] {
  try {
    return JSON.parse(localStorage.getItem(EXP_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveExp(data: Expenditure[]) {
  localStorage.setItem(EXP_KEY, JSON.stringify(data));
}

const statusConfig: Record<
  BudgetRequest["status"],
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  finance_approved: {
    label: "Finance Approved",
    color: "bg-cyan-100 text-cyan-700",
  },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-amber-100 text-amber-700",
  },
};

type AdminTab = "requests" | "expenditure" | "procurement" | "reports";

export function BudgetManagement() {
  const [activeTab, setActiveTab] = useState<AdminTab>("requests");
  const [requests, setRequests] = useState<BudgetRequest[]>(loadRequests);
  const [expenditures, setExpenditures] = useState<Expenditure[]>(loadExp);
  const [procItems, setProcItems] = useState<ProcurementItem[]>(loadProc);

  // Review dialog state
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<
    "approve" | "reject" | "finance_approve" | "revision" | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAmount, setReviewAmount] = useState("");

  // Expenditure dialog state
  const [expDialog, setExpDialog] = useState(false);
  const [expForm, setExpForm] = useState({
    budgetRequestId: "",
    lineItemId: "",
    description: "",
    actualAmount: "",
  });

  // Procurement review state
  const [procReviewId, setProcReviewId] = useState<string | null>(null);
  const [procAction, setProcAction] = useState<
    "approve" | "reject" | "delivered" | null
  >(null);
  const [procComment, setProcComment] = useState("");

  // Filters
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);
  useEffect(() => {
    saveExp(expenditures);
  }, [expenditures]);
  useEffect(() => {
    saveProc(procItems);
  }, [procItems]);

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "requests", label: "Budget Requests" },
    { key: "expenditure", label: "Expenditure Tracking" },
    { key: "procurement", label: "Procurement" },
    { key: "reports", label: "Reports" },
  ];

  const departments = [...new Set(requests.map((r) => r.department))];
  const filtered = requests.filter(
    (r) =>
      (deptFilter === "all" || r.department === deptFilter) &&
      (statusFilter === "all" || r.status === statusFilter),
  );

  const submitReview = () => {
    if (!reviewId || !reviewAction) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        if (reviewAction === "approve")
          return {
            ...r,
            status: "approved" as const,
            adminComment: reviewComment,
            approvedAmount: Number.parseFloat(reviewAmount) || r.totalEstimated,
          };
        if (reviewAction === "finance_approve")
          return {
            ...r,
            status: "finance_approved" as const,
            financeComment: reviewComment,
          };
        if (reviewAction === "revision")
          return {
            ...r,
            status: "revision_requested" as const,
            revisionNote: reviewComment,
          };
        return {
          ...r,
          status: "rejected" as const,
          adminComment: reviewComment,
        };
      }),
    );
    const msg = {
      approve: "Budget approved.",
      finance_approve: "Budget forwarded to Admin.",
      revision: "Revision requested.",
      reject: "Budget rejected.",
    }[reviewAction];
    toast.success(msg);
    setReviewId(null);
    setReviewAction(null);
    setReviewComment("");
    setReviewAmount("");
  };

  const submitExpenditure = () => {
    if (!expForm.budgetRequestId || !expForm.actualAmount) {
      toast.error("Fill in all required fields.");
      return;
    }
    const req = requests.find((r) => r.id === expForm.budgetRequestId);
    const lineItem = req?.items.find((i) => i.id === expForm.lineItemId);
    const exp: Expenditure = {
      id: `EXP-${Date.now()}`,
      budgetRequestId: expForm.budgetRequestId,
      lineItemId: expForm.lineItemId,
      lineItemLabel: lineItem
        ? `${categoryLabels[lineItem.category]} — ${lineItem.description}`
        : "General",
      description: expForm.description,
      actualAmount: Number.parseFloat(expForm.actualAmount),
      recordedAt: new Date().toISOString(),
      recordedBy: "Finance Officer",
    };
    const updated = [...expenditures, exp];
    setExpenditures(updated);
    const reqSpends: Record<string, number> = {};
    for (const e of updated) {
      reqSpends[e.budgetRequestId] =
        (reqSpends[e.budgetRequestId] ?? 0) + e.actualAmount;
    }
    setRequests((prev) =>
      prev.map((r) =>
        reqSpends[r.id] != null ? { ...r, actualSpend: reqSpends[r.id] } : r,
      ),
    );
    setExpDialog(false);
    setExpForm({
      budgetRequestId: "",
      lineItemId: "",
      description: "",
      actualAmount: "",
    });
    toast.success("Expenditure recorded.");
  };

  const submitProcReview = () => {
    if (!procReviewId || !procAction) return;
    setProcItems((prev) =>
      prev.map((p) =>
        p.id === procReviewId
          ? {
              ...p,
              status:
                procAction === "approve"
                  ? ("approved" as const)
                  : procAction === "reject"
                    ? ("rejected" as const)
                    : ("delivered" as const),
              adminComment: procComment,
            }
          : p,
      ),
    );
    toast.success(`Procurement ${procAction}d.`);
    setProcReviewId(null);
    setProcAction(null);
    setProcComment("");
  };

  const printReport = () => {
    const deptSums = departments.map((dept) => {
      const dReqs = requests.filter((r) => r.department === dept);
      const approved = dReqs
        .filter((r) => r.status === "approved")
        .reduce((s, r) => s + (r.approvedAmount ?? r.totalEstimated), 0);
      const spent = dReqs.reduce((s, r) => s + (r.actualSpend ?? 0), 0);
      const util = approved > 0 ? Math.round((spent / approved) * 100) : 0;
      const variance = approved - spent;
      const budgetStatus =
        util > 100 ? "Over Budget" : util > 90 ? "Near Limit" : "On Budget";
      return { dept, approved, spent, variance, util, budgetStatus };
    });

    const rows = deptSums
      .map(
        (d) => `<tr>
        <td>${d.dept}</td>
        <td style="text-align:right">₦${d.approved.toLocaleString()}</td>
        <td style="text-align:right">₦${d.spent.toLocaleString()}</td>
        <td style="text-align:right;color:${d.variance >= 0 ? "green" : "red"}">₦${d.variance.toLocaleString()}</td>
        <td style="text-align:right">${d.util}%</td>
        <td style="color:${d.budgetStatus === "Over Budget" ? "red" : d.budgetStatus === "Near Limit" ? "orange" : "green"}">${d.budgetStatus}</td>
      </tr>`,
      )
      .join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Budget Utilization Report</title>
    <style>
      body{font-family:Arial,sans-serif;padding:36px;max-width:900px;margin:auto;font-size:13px}
      h2,h3{text-align:center;margin:4px 0}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ccc;padding:7px 10px}
      th{background:#f0f4f8;font-weight:bold}
      tfoot td{font-weight:bold;background:#e8f0f8}
      .summary{display:flex;gap:30px;margin:16px 0;font-size:12px;justify-content:center}
      .summary-item{text-align:center;padding:10px 20px;border:1px solid #ddd;border-radius:6px}
      .footer{margin-top:40px;font-size:11px;text-align:center;color:#888}
    </style></head><body>
    <h2>FEDERAL UNIVERSITY OF EDUCATION KONTAGORA</h2>
    <h3>BUDGET UTILIZATION REPORT — ${new Date().getFullYear()}</h3>
    <div class="summary">
      <div class="summary-item"><div style="font-size:11px;color:#666">Total Requested</div><div style="font-weight:bold;color:#2563eb">₦${totalRequested.toLocaleString()}</div></div>
      <div class="summary-item"><div style="font-size:11px;color:#666">Total Approved</div><div style="font-weight:bold;color:#16a34a">₦${totalApproved.toLocaleString()}</div></div>
      <div class="summary-item"><div style="font-size:11px;color:#666">Total Spent</div><div style="font-weight:bold;color:#7c3aed">₦${totalSpent.toLocaleString()}</div></div>
      <div class="summary-item"><div style="font-size:11px;color:#666">Variance</div><div style="font-weight:bold;color:${variance >= 0 ? "#0891b2" : "#dc2626"}">₦${variance.toLocaleString()}</div></div>
    </div>
    <table>
      <thead><tr><th>Department</th><th>Approved (₦)</th><th>Spent (₦)</th><th>Variance (₦)</th><th>Utilization %</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">FUEK MIS — Printed: ${new Date().toLocaleDateString()} | Page 1 of 1</div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
    win.document.close();
  };

  const reviewedReq = reviewId ? requests.find((r) => r.id === reviewId) : null;
  const procReviewed = procReviewId
    ? procItems.find((p) => p.id === procReviewId)
    : null;

  const totalRequested = requests.reduce((s, r) => s + r.totalEstimated, 0);
  const totalApproved = requests
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + (r.approvedAmount ?? r.totalEstimated), 0);
  const totalSpent = requests.reduce((s, r) => s + (r.actualSpend ?? 0), 0);
  const variance = totalApproved - totalSpent;

  const deptSummary = departments.map((dept) => {
    const dReqs = requests.filter((r) => r.department === dept);
    const approved = dReqs
      .filter((r) => r.status === "approved")
      .reduce((s, r) => s + (r.approvedAmount ?? r.totalEstimated), 0);
    const spent = dReqs.reduce((s, r) => s + (r.actualSpend ?? 0), 0);
    return { dept, count: dReqs.length, approved, spent };
  });

  // Category breakdown across all approved requests
  const categoryBreakdown: Record<string, { approved: number; spent: number }> =
    {};
  for (const r of requests.filter((r) => r.status === "approved")) {
    for (const item of r.items) {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { approved: 0, spent: 0 };
      }
      categoryBreakdown[item.category].approved += item.estimatedCost;
    }
  }
  for (const e of expenditures) {
    const req = requests.find((r) => r.id === e.budgetRequestId);
    const lineItem = req?.items.find((i) => i.id === e.lineItemId);
    if (lineItem) {
      if (!categoryBreakdown[lineItem.category]) {
        categoryBreakdown[lineItem.category] = { approved: 0, spent: 0 };
      }
      categoryBreakdown[lineItem.category].spent += e.actualAmount;
    }
  }

  const selectedReqItems = expForm.budgetRequestId
    ? (requests.find((r) => r.id === expForm.budgetRequestId)?.items ?? [])
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Budget Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Review and manage department budget requests, expenditures, and
          procurement
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Requested (₦)",
            value: `₦${totalRequested.toLocaleString()}`,
            color: "bg-blue-50",
            icon: <FileText size={18} className="text-blue-600" />,
          },
          {
            label: "Total Approved (₦)",
            value: `₦${totalApproved.toLocaleString()}`,
            color: "bg-green-50",
            icon: <CheckCircle size={18} className="text-green-600" />,
          },
          {
            label: "Total Spent (₦)",
            value: `₦${totalSpent.toLocaleString()}`,
            color: "bg-purple-50",
            icon: <DollarSign size={18} className="text-purple-600" />,
          },
          {
            label: "Variance (₦)",
            value: `₦${variance.toLocaleString()}`,
            color: variance >= 0 ? "bg-cyan-50" : "bg-red-50",
            icon: (
              <BarChart2
                size={18}
                className={variance >= 0 ? "text-cyan-600" : "text-red-600"}
              />
            ),
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent
              className={`p-4 flex items-center gap-3 ${card.color} rounded-lg`}
            >
              <div className="p-2 bg-card rounded-lg shadow-sm">
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-1">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`budget.admin.tab.${t.key}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Budget Requests</CardTitle>
              <div className="flex gap-2">
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8 text-xs w-40">
                    <SelectValue placeholder="Filter by dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText size={36} className="mx-auto mb-2 opacity-40" />
                <p>No budget requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      {[
                        "ID",
                        "Department",
                        "Session",
                        "Items",
                        "Total (₦)",
                        "Approved (₦)",
                        "Spent (₦)",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const cfg = statusConfig[r.status];
                      const spent = r.actualSpend ?? 0;
                      const approved = r.approvedAmount ?? r.totalEstimated;
                      const overBudget =
                        r.status === "approved" && spent > approved;
                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-0 hover:bg-muted/20"
                          data-ocid={`budget.admin.row.${r.id}`}
                        >
                          <td className="px-3 py-2 text-xs font-mono text-primary">
                            {r.id}
                          </td>
                          <td className="px-3 py-2">{r.department}</td>
                          <td className="px-3 py-2">{r.session}</td>
                          <td className="px-3 py-2">{r.items.length}</td>
                          <td className="px-3 py-2">
                            ₦{r.totalEstimated.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-green-700">
                            {r.status === "approved"
                              ? `₦${approved.toLocaleString()}`
                              : "—"}
                          </td>
                          <td
                            className={`px-3 py-2 ${overBudget ? "text-red-600 font-semibold" : "text-purple-700"}`}
                          >
                            {spent > 0 ? `₦${spent.toLocaleString()}` : "—"}
                            {overBudget && (
                              <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">
                                Over!
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1 flex-wrap">
                              {r.status === "submitted" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-cyan-600 border-cyan-300 hover:bg-cyan-50 text-xs h-7"
                                    onClick={() => {
                                      setReviewId(r.id);
                                      setReviewAction("finance_approve");
                                    }}
                                  >
                                    Finance ✓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-amber-600 border-amber-300 hover:bg-amber-50 text-xs h-7"
                                    onClick={() => {
                                      setReviewId(r.id);
                                      setReviewAction("revision");
                                    }}
                                  >
                                    <RefreshCw size={11} className="mr-1" />{" "}
                                    Revise
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-7"
                                    onClick={() => {
                                      setReviewId(r.id);
                                      setReviewAction("reject");
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {r.status === "finance_approved" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                    onClick={() => {
                                      setReviewId(r.id);
                                      setReviewAction("approve");
                                      setReviewAmount(String(r.totalEstimated));
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-7"
                                    onClick={() => {
                                      setReviewId(r.id);
                                      setReviewAction("reject");
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
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
      )}

      {/* EXPENDITURE TAB */}
      {activeTab === "expenditure" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Expenditure Tracking</CardTitle>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setExpDialog(true)}
                data-ocid="budget.expenditure.new"
              >
                <PlusCircle size={14} className="mr-1" /> Record Expenditure
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expenditures.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No expenditures recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      {[
                        "ID",
                        "Budget Request",
                        "Line Item",
                        "Description",
                        "Amount (₦)",
                        "Recorded At",
                        "Recorded By",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenditures.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-3 py-2 text-xs font-mono text-primary">
                          {e.id}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono">
                          {e.budgetRequestId}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {e.lineItemLabel || "—"}
                        </td>
                        <td className="px-3 py-2">{e.description}</td>
                        <td className="px-3 py-2 font-medium text-purple-700">
                          ₦{e.actualAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {new Date(e.recordedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-xs">{e.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PROCUREMENT TAB */}
      {activeTab === "procurement" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procurement Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {procItems.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No procurement requests submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      {[
                        "ID",
                        "Dept",
                        "Item",
                        "Qty",
                        "Total (₦)",
                        "Supplier",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {procItems.map((p) => {
                      const colors: Record<string, string> = {
                        pending: "bg-yellow-100 text-yellow-700",
                        approved: "bg-green-100 text-green-700",
                        rejected: "bg-red-100 text-red-700",
                        delivered: "bg-purple-100 text-purple-700",
                      };
                      return (
                        <tr
                          key={p.id}
                          className="border-b last:border-0 hover:bg-muted/20"
                          data-ocid={`budget.procurement.row.${p.id}`}
                        >
                          <td className="px-3 py-2 text-xs font-mono text-primary">
                            {p.id}
                          </td>
                          <td className="px-3 py-2">{p.department}</td>
                          <td className="px-3 py-2">{p.itemDescription}</td>
                          <td className="px-3 py-2">{p.quantity}</td>
                          <td className="px-3 py-2 font-medium">
                            ₦{p.totalCost.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {p.supplier || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${colors[p.status]}`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {p.status === "pending" && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                  onClick={() => {
                                    setProcReviewId(p.id);
                                    setProcAction("approve");
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-7"
                                  onClick={() => {
                                    setProcReviewId(p.id);
                                    setProcAction("reject");
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {p.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600 border-purple-300 text-xs h-7"
                                onClick={() => {
                                  setProcReviewId(p.id);
                                  setProcAction("delivered");
                                }}
                              >
                                Mark Delivered
                              </Button>
                            )}
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
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Budget Utilization Report
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={printReport}
                  data-ocid="budget.reports.print"
                >
                  <Printer size={14} className="mr-1" /> Print PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-5">
                {[
                  {
                    label: "Total Requested",
                    value: `₦${totalRequested.toLocaleString()}`,
                    color: "text-blue-700",
                  },
                  {
                    label: "Total Approved",
                    value: `₦${totalApproved.toLocaleString()}`,
                    color: "text-green-700",
                  },
                  {
                    label: "Total Spent",
                    value: `₦${totalSpent.toLocaleString()}`,
                    color: "text-purple-700",
                  },
                  {
                    label: "Remaining Budget",
                    value: `₦${variance.toLocaleString()}`,
                    color: variance >= 0 ? "text-cyan-700" : "text-red-600",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="border rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {m.label}
                    </p>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Department Utilization Table */}
              <h3 className="text-sm font-semibold text-foreground mb-3">
                By Department
              </h3>
              <div className="overflow-x-auto mb-5">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      {[
                        "Department",
                        "Requests",
                        "Approved (₦)",
                        "Spent (₦)",
                        "Variance (₦)",
                        "Utilization %",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deptSummary.map((d) => {
                      const v = d.approved - d.spent;
                      const util =
                        d.approved > 0
                          ? Math.round((d.spent / d.approved) * 100)
                          : 0;
                      const budgetStatus =
                        util > 100
                          ? "Over Budget"
                          : util > 90
                            ? "Near Limit"
                            : "On Budget";
                      return (
                        <tr
                          key={d.dept}
                          className="border-b last:border-0 hover:bg-muted/20"
                        >
                          <td className="px-3 py-2 font-medium">{d.dept}</td>
                          <td className="px-3 py-2">{d.count}</td>
                          <td className="px-3 py-2 text-green-700">
                            ₦{d.approved.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-purple-700">
                            ₦{d.spent.toLocaleString()}
                          </td>
                          <td
                            className={`px-3 py-2 font-medium ${v >= 0 ? "text-cyan-700" : "text-red-600"}`}
                          >
                            ₦{v.toLocaleString()}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${util > 100 ? "bg-red-500" : util > 90 ? "bg-amber-500" : "bg-green-500"}`}
                                  style={{ width: `${Math.min(util, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">
                                {util}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                budgetStatus === "Over Budget"
                                  ? "bg-red-100 text-red-700"
                                  : budgetStatus === "Near Limit"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {budgetStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Category Breakdown */}
              {Object.keys(categoryBreakdown).length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    By Category (Approved Budgets)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 border-b">
                        <tr>
                          {[
                            "Category",
                            "Approved (₦)",
                            "Spent (₦)",
                            "Variance (₦)",
                            "Utilization %",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(categoryBreakdown).map(
                          ([cat, data]) => {
                            const v = data.approved - data.spent;
                            const util =
                              data.approved > 0
                                ? Math.round((data.spent / data.approved) * 100)
                                : 0;
                            return (
                              <tr
                                key={cat}
                                className="border-b last:border-0 hover:bg-muted/20"
                              >
                                <td className="px-3 py-2 font-medium">
                                  {categoryLabels[
                                    cat as keyof typeof categoryLabels
                                  ] ?? cat}
                                </td>
                                <td className="px-3 py-2 text-green-700">
                                  ₦{data.approved.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-purple-700">
                                  ₦{data.spent.toLocaleString()}
                                </td>
                                <td
                                  className={`px-3 py-2 font-medium ${v >= 0 ? "text-cyan-700" : "text-red-600"}`}
                                >
                                  ₦{v.toLocaleString()}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${util > 100 ? "bg-red-500" : util > 70 ? "bg-amber-500" : "bg-green-500"}`}
                                        style={{
                                          width: `${Math.min(util, 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium">
                                      {util}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewId} onOpenChange={(o) => !o && setReviewId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve"
                ? "Approve Budget Request"
                : reviewAction === "finance_approve"
                  ? "Finance Officer Approval"
                  : reviewAction === "revision"
                    ? "Request Revision"
                    : "Reject Budget Request"}
            </DialogTitle>
          </DialogHeader>
          {reviewedReq && (
            <div className="space-y-3">
              <div className="bg-muted/30 rounded p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Dept:</span>{" "}
                  {reviewedReq.department}
                </p>
                <p>
                  <span className="text-muted-foreground">Session:</span>{" "}
                  {reviewedReq.session}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Total Requested:
                  </span>{" "}
                  ₦{reviewedReq.totalEstimated.toLocaleString()}
                </p>
              </div>
              {reviewAction === "approve" && (
                <div>
                  <Label>Approved Amount (₦)</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={reviewAmount}
                    onChange={(e) => setReviewAmount(e.target.value)}
                    data-ocid="budget.admin.review.amount"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Adjust if approving less than requested. Leave as-is to
                    approve full amount.
                  </p>
                </div>
              )}
              <div>
                <Label>
                  {reviewAction === "reject"
                    ? "Reason for Rejection *"
                    : reviewAction === "revision"
                      ? "Revision Instructions *"
                      : "Comment (optional)"}
                </Label>
                <Textarea
                  className="mt-1"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    reviewAction === "reject"
                      ? "Explain reason for rejection..."
                      : reviewAction === "revision"
                        ? "Explain what changes are needed..."
                        : "Optional comment for HOD..."
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewId(null)}>
              Cancel
            </Button>
            <Button
              className={
                reviewAction === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : reviewAction === "revision"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-green-600 hover:bg-green-700"
              }
              onClick={submitReview}
              data-ocid="budget.admin.review.submit"
            >
              {reviewAction === "approve"
                ? "Approve"
                : reviewAction === "finance_approve"
                  ? "Forward to Admin"
                  : reviewAction === "revision"
                    ? "Request Revision"
                    : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expenditure Dialog */}
      <Dialog open={expDialog} onOpenChange={setExpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expenditure</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Budget Request</Label>
              <Select
                value={expForm.budgetRequestId}
                onValueChange={(v) =>
                  setExpForm((f) => ({
                    ...f,
                    budgetRequestId: v,
                    lineItemId: "",
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select request" />
                </SelectTrigger>
                <SelectContent>
                  {requests
                    .filter((r) => r.status === "approved")
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.id} — {r.department} ({r.session})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {selectedReqItems.length > 0 && (
              <div>
                <Label>Line Item (optional)</Label>
                <Select
                  value={expForm.lineItemId}
                  onValueChange={(v) =>
                    setExpForm((f) => ({ ...f, lineItemId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select line item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    {selectedReqItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {categoryLabels[item.category]} — {item.description} (₦
                        {item.estimatedCost.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Description</Label>
              <Input
                className="mt-1"
                value={expForm.description}
                onChange={(e) =>
                  setExpForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What was spent on?"
              />
            </div>
            <div>
              <Label>Actual Amount (₦)</Label>
              <Input
                type="number"
                className="mt-1"
                value={expForm.actualAmount}
                onChange={(e) =>
                  setExpForm((f) => ({ ...f, actualAmount: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={submitExpenditure}
              data-ocid="budget.expenditure.submit"
            >
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Procurement Review Dialog */}
      <Dialog
        open={!!procReviewId}
        onOpenChange={(o) => !o && setProcReviewId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {procAction === "approve"
                ? "Approve Procurement"
                : procAction === "reject"
                  ? "Reject Procurement"
                  : "Mark as Delivered"}
            </DialogTitle>
          </DialogHeader>
          {procReviewed && (
            <div className="space-y-3">
              <div className="bg-muted/30 rounded p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Item:</span>{" "}
                  {procReviewed.itemDescription}
                </p>
                <p>
                  <span className="text-muted-foreground">Total:</span> ₦
                  {procReviewed.totalCost.toLocaleString()}
                </p>
              </div>
              {procAction !== "delivered" && (
                <div>
                  <Label>Comment</Label>
                  <Textarea
                    className="mt-1"
                    value={procComment}
                    onChange={(e) => setProcComment(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcReviewId(null)}>
              Cancel
            </Button>
            <Button
              className={
                procAction === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={submitProcReview}
              data-ocid="budget.procurement.review.confirm"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
