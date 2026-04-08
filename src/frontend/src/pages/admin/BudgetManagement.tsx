import {
  BarChart2,
  CheckCircle,
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
import type { BudgetRequest } from "../hod/BudgetRequest";

const LS_KEY = "unidigital_budget_requests";
const PROC_KEY = "unidigital_procurement_requests";
const EXP_KEY = "unidigital_budget_expenditure";

interface Expenditure {
  id: string;
  budgetRequestId: string;
  lineItemId: string;
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
};

type AdminTab = "requests" | "expenditure" | "procurement" | "reports";

export function BudgetManagement() {
  const [activeTab, setActiveTab] = useState<AdminTab>("requests");
  const [requests, setRequests] = useState<BudgetRequest[]>(loadRequests);
  const [expenditures, setExpenditures] = useState<Expenditure[]>(loadExp);
  const [procItems, setProcItems] = useState<ProcurementItem[]>(loadProc);

  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<
    "approve" | "reject" | "finance_approve" | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAmount, setReviewAmount] = useState("");

  const [expDialog, setExpDialog] = useState(false);
  const [expForm, setExpForm] = useState({
    budgetRequestId: "",
    lineItemId: "",
    description: "",
    actualAmount: "",
  });

  const [procReviewId, setProcReviewId] = useState<string | null>(null);
  const [procAction, setProcAction] = useState<
    "approve" | "reject" | "delivered" | null
  >(null);
  const [procComment, setProcComment] = useState("");

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
            status: "approved",
            adminComment: reviewComment,
            approvedAmount: Number.parseFloat(reviewAmount) || r.totalEstimated,
          };
        if (reviewAction === "finance_approve")
          return {
            ...r,
            status: "finance_approved",
            financeComment: reviewComment,
          };
        return { ...r, status: "rejected", adminComment: reviewComment };
      }),
    );
    toast.success(
      reviewAction === "approve"
        ? "Budget approved."
        : reviewAction === "finance_approve"
          ? "Budget forwarded to Admin."
          : "Budget rejected.",
    );
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
    const exp: Expenditure = {
      id: `EXP-${Date.now()}`,
      budgetRequestId: expForm.budgetRequestId,
      lineItemId: expForm.lineItemId,
      description: expForm.description,
      actualAmount: Number.parseFloat(expForm.actualAmount),
      recordedAt: new Date().toISOString(),
      recordedBy: "Admin",
    };
    const updated = [...expenditures, exp];
    setExpenditures(updated);
    // Update actual spend on the budget request
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
    toast.success(`Procurement request ${procAction}.`);
    setProcReviewId(null);
    setProcAction(null);
    setProcComment("");
  };

  const reviewedReq = reviewId ? requests.find((r) => r.id === reviewId) : null;
  const procReviewed = procReviewId
    ? procItems.find((p) => p.id === procReviewId)
    : null;

  // Report metrics
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Budget Management</h1>
        <p className="text-slate-500 text-sm">
          Review and manage department budget requests, expenditures, and
          procurement
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Requested (₦)",
            value: totalRequested.toLocaleString(),
            color: "bg-blue-50",
            icon: <FileText size={18} className="text-blue-600" />,
          },
          {
            label: "Total Approved (₦)",
            value: totalApproved.toLocaleString(),
            color: "bg-green-50",
            icon: <CheckCircle size={18} className="text-green-600" />,
          },
          {
            label: "Total Spent (₦)",
            value: totalSpent.toLocaleString(),
            color: "bg-purple-50",
            icon: <DollarSign size={18} className="text-purple-600" />,
          },
          {
            label: "Variance (₦)",
            value: variance.toLocaleString(),
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
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-xl font-bold text-slate-800">{card.value}</p>
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
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            data-ocid={`budget.admin.tab.${t.key}`}
          >
            {t.label}
          </button>
        ))}
      </div>

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
                  <SelectTrigger className="h-8 text-xs w-36">
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
              <div className="text-center py-12 text-slate-400">
                <FileText size={36} className="mx-auto mb-2 opacity-40" />
                <p>No budget requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
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
                          className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
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
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`budget.admin.row.${r.id}`}
                        >
                          <td className="px-3 py-2 text-xs font-mono text-blue-600">
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
                            <div className="flex gap-1">
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

      {activeTab === "expenditure" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Expenditure Tracking</CardTitle>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setExpDialog(true)}
                data-ocid="budget.expenditure.new"
              >
                <PlusCircle size={14} className="mr-1" /> Record Expenditure
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expenditures.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No expenditures recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "ID",
                        "Budget Request",
                        "Description",
                        "Amount (₦)",
                        "Recorded At",
                        "Recorded By",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
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
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-xs font-mono text-blue-600">
                          {e.id}
                        </td>
                        <td className="px-3 py-2 text-xs font-mono">
                          {e.budgetRequestId}
                        </td>
                        <td className="px-3 py-2">{e.description}</td>
                        <td className="px-3 py-2 font-medium text-purple-700">
                          ₦{e.actualAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
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

      {activeTab === "procurement" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procurement Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {procItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No procurement requests submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
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
                          className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
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
                          className="border-b last:border-0 hover:bg-slate-50"
                          data-ocid={`budget.procurement.row.${p.id}`}
                        >
                          <td className="px-3 py-2 text-xs font-mono text-blue-600">
                            {p.id}
                          </td>
                          <td className="px-3 py-2">{p.department}</td>
                          <td className="px-3 py-2">{p.itemDescription}</td>
                          <td className="px-3 py-2">{p.quantity}</td>
                          <td className="px-3 py-2 font-medium">
                            ₦{p.totalCost.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-500">
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

      {activeTab === "reports" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Institution Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
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
                    <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
              {/* Department Comparison */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Department",
                        "Requests",
                        "Approved (₦)",
                        "Spent (₦)",
                        "Variance (₦)",
                        "Utilization %",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
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
                      return (
                        <tr
                          key={d.dept}
                          className="border-b last:border-0 hover:bg-slate-50"
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
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${util > 90 ? "bg-red-500" : util > 70 ? "bg-amber-500" : "bg-green-500"}`}
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
                    })}
                  </tbody>
                </table>
              </div>
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
                  : "Reject Budget Request"}
            </DialogTitle>
          </DialogHeader>
          {reviewedReq && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded p-3 text-sm">
                <p>
                  <span className="text-slate-500">Dept:</span>{" "}
                  {reviewedReq.department}
                </p>
                <p>
                  <span className="text-slate-500">Session:</span>{" "}
                  {reviewedReq.session}
                </p>
                <p>
                  <span className="text-slate-500">Total Requested:</span> ₦
                  {reviewedReq.totalEstimated.toLocaleString()}
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
                  />
                </div>
              )}
              <div>
                <Label>
                  {reviewAction === "reject"
                    ? "Reason for Rejection"
                    : "Comment (optional)"}
                </Label>
                <Textarea
                  className="mt-1"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    reviewAction === "reject"
                      ? "Explain why..."
                      : "Optional comment..."
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
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={submitReview}
              data-ocid="budget.admin.review.submit"
            >
              Confirm
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
                  setExpForm((f) => ({ ...f, budgetRequestId: v }))
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
              className="bg-blue-600 hover:bg-blue-700"
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
              <div className="bg-slate-50 rounded p-3 text-sm space-y-1">
                <p>
                  <span className="text-slate-500">Item:</span>{" "}
                  {procReviewed.itemDescription}
                </p>
                <p>
                  <span className="text-slate-500">Total:</span> ₦
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
