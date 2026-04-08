import {
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  PlusCircle,
  Printer,
  RefreshCw,
  Trash2,
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

const LS_KEY = "unidigital_budget_requests";

export type BudgetItemCategory =
  | "personnel"
  | "overhead"
  | "equipment"
  | "travel"
  | "research"
  | "others";

export interface BudgetLineItem {
  id: string;
  category: BudgetItemCategory;
  description: string;
  estimatedCost: number;
  justification: string;
}

export interface BudgetRequest {
  id: string;
  department: string;
  session: string;
  submittedBy: string;
  submittedAt: string;
  items: BudgetLineItem[];
  totalEstimated: number;
  status:
    | "draft"
    | "submitted"
    | "finance_approved"
    | "approved"
    | "rejected"
    | "revision_requested";
  financeComment?: string;
  adminComment?: string;
  approvedAmount?: number;
  actualSpend?: number;
  revisionNote?: string;
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

export const categoryLabels: Record<BudgetItemCategory, string> = {
  personnel: "Personnel & Salaries",
  overhead: "Overhead & Running Costs",
  equipment: "Equipment & Machinery",
  travel: "Travel & Conferences",
  research: "Research & Development",
  others: "Others",
};

const statusConfig: Record<
  BudgetRequest["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700",
    icon: <FileText size={12} />,
  },
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-700",
    icon: <Clock size={12} />,
  },
  finance_approved: {
    label: "Finance Approved",
    color: "bg-cyan-100 text-cyan-700",
    icon: <CheckCircle size={12} />,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={12} />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={12} />,
  },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-amber-100 text-amber-700",
    icon: <RefreshCw size={12} />,
  },
};

function blankItem(): BudgetLineItem {
  return {
    id: `ITEM-${Date.now()}-${Math.random()}`,
    category: "overhead",
    description: "",
    estimatedCost: 0,
    justification: "",
  };
}

export function BudgetRequest() {
  const [requests, setRequests] = useState<BudgetRequest[]>(loadRequests);
  const [dialog, setDialog] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [session, setSession] = useState("2024/2025");
  const [items, setItems] = useState<BudgetLineItem[]>([blankItem()]);

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  const myDept = "Computer Science";
  const myRequests = requests.filter((r) => r.department === myDept);

  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (
    id: string,
    field: keyof BudgetLineItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  const openNew = () => {
    setEditingId(null);
    setItems([blankItem()]);
    setSession("2024/2025");
    setDialog(true);
  };

  const openRevise = (req: BudgetRequest) => {
    setEditingId(req.id);
    setItems(req.items.map((i) => ({ ...i })));
    setSession(req.session);
    setDialog(true);
  };

  const submitRequest = () => {
    const validItems = items.filter(
      (i) => i.description.trim() && i.estimatedCost > 0,
    );
    if (!validItems.length) {
      toast.error(
        "Add at least one budget line item with description and cost.",
      );
      return;
    }
    const total = validItems.reduce((s, i) => s + i.estimatedCost, 0);

    if (editingId) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                items: validItems,
                totalEstimated: total,
                session,
                status: "submitted",
                revisionNote: undefined,
                submittedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      toast.success("Revised budget request re-submitted.");
    } else {
      const req: BudgetRequest = {
        id: `BUD-${Date.now()}`,
        department: myDept,
        session,
        submittedBy: "HOD (Acting)",
        submittedAt: new Date().toISOString(),
        items: validItems,
        totalEstimated: total,
        status: "submitted",
      };
      setRequests((prev) => [...prev, req]);
      toast.success("Budget request submitted successfully.");
    }
    setItems([blankItem()]);
    setDialog(false);
    setEditingId(null);
  };

  const printBudget = (r: BudgetRequest) => {
    const byCategory: Record<string, number> = {};
    for (const item of r.items) {
      byCategory[item.category] =
        (byCategory[item.category] ?? 0) + item.estimatedCost;
    }
    const rows = r.items
      .map(
        (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${categoryLabels[item.category]}</td>
        <td>${item.description}</td>
        <td style="text-align:right">₦${item.estimatedCost.toLocaleString()}</td>
        <td>${item.justification}</td>
      </tr>`,
      )
      .join("");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Budget Request — ${r.id}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:36px;max-width:800px;margin:auto;font-size:13px}
      h2,h3{text-align:center;margin:4px 0}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      th{background:#f0f4f8;font-weight:bold}
      tfoot td{font-weight:bold;background:#f0f4f8}
      .meta{display:flex;gap:30px;margin:12px 0;font-size:12px}
      .meta span{color:#555}
      .footer{margin-top:40px;font-size:11px;text-align:center;color:#888}
    </style></head><body>
    <h2>FEDERAL UNIVERSITY OF EDUCATION KONTAGORA</h2>
    <h3>DEPARTMENTAL BUDGET REQUEST</h3>
    <div class="meta">
      <div><span>Department:</span> <strong>${r.department}</strong></div>
      <div><span>Session:</span> <strong>${r.session}</strong></div>
      <div><span>Request ID:</span> <strong>${r.id}</strong></div>
      <div><span>Submitted:</span> <strong>${new Date(r.submittedAt).toLocaleDateString()}</strong></div>
      <div><span>Status:</span> <strong>${statusConfig[r.status].label}</strong></div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Category</th><th>Description</th><th>Estimated (₦)</th><th>Justification</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3">TOTAL ESTIMATED</td><td style="text-align:right">₦${r.totalEstimated.toLocaleString()}</td><td></td></tr>
      ${r.approvedAmount != null ? `<tr><td colspan="3">APPROVED AMOUNT</td><td style="text-align:right;color:green">₦${r.approvedAmount.toLocaleString()}</td><td></td></tr>` : ""}
      </tfoot>
    </table>
    ${r.adminComment ? `<p style="margin-top:12px"><strong>Admin Comment:</strong> ${r.adminComment}</p>` : ""}
    <div class="footer">FUEK MIS — Printed: ${new Date().toLocaleDateString()} | Page 1 of 1</div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
    win.document.close();
  };

  const viewed = viewId ? requests.find((r) => r.id === viewId) : null;
  const totalApproved = myRequests
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + (r.approvedAmount ?? r.totalEstimated), 0);
  const totalSpent = myRequests.reduce((s, r) => s + (r.actualSpend ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Budget Requests
          </h1>
          <p className="text-muted-foreground text-sm">
            {myDept} — Annual Department Budget Planning
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={openNew}
          data-ocid="budget.request.new"
        >
          <PlusCircle size={16} className="mr-2" /> New Budget Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Requests",
            value: myRequests.length,
            icon: <FileText size={20} className="text-blue-600" />,
            bg: "bg-blue-50",
          },
          {
            label: "Total Approved (₦)",
            value: `₦${totalApproved.toLocaleString()}`,
            icon: <CheckCircle size={20} className="text-green-600" />,
            bg: "bg-green-50",
          },
          {
            label: "Total Spent (₦)",
            value: `₦${totalSpent.toLocaleString()}`,
            icon: <DollarSign size={20} className="text-purple-600" />,
            bg: "bg-purple-50",
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 ${card.bg} rounded-lg`}>{card.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Budget Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText size={36} className="mx-auto mb-2 opacity-40" />
              <p>No budget requests yet. Submit your first request.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    {[
                      "Request ID",
                      "Session",
                      "Items",
                      "Total (₦)",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((r) => {
                    const cfg = statusConfig[r.status];
                    return (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-muted/20"
                        data-ocid={`budget.request.row.${r.id}`}
                      >
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">
                          {r.id}
                        </td>
                        <td className="px-4 py-3 text-sm">{r.session}</td>
                        <td className="px-4 py-3 text-sm">{r.items.length}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ₦{r.totalEstimated.toLocaleString()}
                          {r.approvedAmount != null &&
                            r.approvedAmount !== r.totalEstimated && (
                              <span className="ml-1 text-green-600 text-xs">
                                (Approved: ₦{r.approvedAmount.toLocaleString()})
                              </span>
                            )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium w-fit ${cfg.color}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewId(r.id)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => printBudget(r)}
                              className="text-muted-foreground"
                            >
                              <Printer size={12} />
                            </Button>
                            {r.status === "revision_requested" && (
                              <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                                onClick={() => openRevise(r)}
                                data-ocid={`budget.request.revise.${r.id}`}
                              >
                                <RefreshCw size={12} className="mr-1" /> Revise
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

      {/* New / Edit Request Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Revise Budget Request" : "New Budget Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Input className="mt-1" value={myDept} disabled />
              </div>
              <div>
                <Label>Academic Session</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["2024/2025", "2025/2026", "2026/2027"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Budget Line Items
                </p>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <PlusCircle size={14} className="mr-1" /> Add Item
                </Button>
              </div>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="border rounded-md p-3 space-y-2 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Item {idx + 1}
                    </p>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive/80"
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={item.category}
                        onValueChange={(v) =>
                          updateItem(item.id, "category", v)
                        }
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Brief description"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Requested Amount (₦)</Label>
                      <Input
                        type="number"
                        className="mt-1 h-8 text-xs"
                        value={item.estimatedCost || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "estimatedCost",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Justification</Label>
                    <Textarea
                      className="mt-1 text-xs min-h-[50px] resize-none"
                      value={item.justification}
                      onChange={(e) =>
                        updateItem(item.id, "justification", e.target.value)
                      }
                      placeholder="Why is this item needed?"
                    />
                  </div>
                </div>
              ))}
              <div className="text-right text-sm font-semibold text-foreground">
                Total Estimated:{" "}
                <span className="text-primary">
                  ₦
                  {items
                    .reduce((s, i) => s + (i.estimatedCost || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={submitRequest}
              data-ocid="budget.request.submit"
            >
              {editingId ? "Re-Submit Revision" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!viewId} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Budget Request — {viewed?.id}</DialogTitle>
          </DialogHeader>
          {viewed && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Department", value: viewed.department },
                  { label: "Session", value: viewed.session },
                  {
                    label: "Submitted",
                    value: new Date(viewed.submittedAt).toLocaleDateString(),
                  },
                  {
                    label: "Status",
                    value: (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[viewed.status].color}`}
                      >
                        {statusConfig[viewed.status].label}
                      </span>
                    ),
                  },
                ].map((f) => (
                  <div key={f.label.toString()}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-medium">{f.value}</p>
                  </div>
                ))}
              </div>

              {viewed.revisionNote && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                    <MessageSquare size={12} /> Revision Required
                  </p>
                  <p className="text-amber-800 text-xs">
                    {viewed.revisionNote}
                  </p>
                </div>
              )}
              {viewed.adminComment && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Admin Comment
                  </p>
                  <p className="text-blue-800 text-xs">{viewed.adminComment}</p>
                </div>
              )}

              <table className="w-full text-xs border rounded overflow-hidden">
                <thead className="bg-muted/30">
                  <tr>
                    {[
                      "Category",
                      "Description",
                      "Requested (₦)",
                      "Justification",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewed.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">
                        {categoryLabels[item.category]}
                      </td>
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 font-mono">
                        ₦{item.estimatedCost.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {item.justification}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/20 font-semibold">
                    <td colSpan={2} className="px-3 py-2 text-right">
                      Total
                    </td>
                    <td className="px-3 py-2 text-primary">
                      ₦{viewed.totalEstimated.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>

              {viewed.approvedAmount != null && (
                <div className="flex gap-4 bg-green-50 border border-green-200 rounded p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Approved Amount
                    </p>
                    <p className="font-semibold text-green-700">
                      ₦{viewed.approvedAmount.toLocaleString()}
                    </p>
                  </div>
                  {viewed.actualSpend != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Actual Spent
                      </p>
                      <p className="font-semibold text-purple-700">
                        ₦{viewed.actualSpend.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {viewed && (
              <Button variant="outline" onClick={() => printBudget(viewed)}>
                <Printer size={14} className="mr-1" /> Print
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Procurement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={16} />
            Procurement Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProcurementSection department={myDept} budgetRequests={myRequests} />
        </CardContent>
      </Card>
    </div>
  );
}

const PROC_KEY = "unidigital_procurement_requests";

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

function ProcurementSection({
  department,
  budgetRequests,
}: {
  department: string;
  budgetRequests: BudgetRequest[];
}) {
  const [items, setItems] = useState<ProcurementItem[]>(() =>
    loadProc().filter((p) => p.department === department),
  );
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({
    budgetRequestId: "",
    itemDescription: "",
    quantity: 1,
    unitCost: 0,
    supplier: "",
    deliveryDate: "",
  });

  const approvedBudgets = budgetRequests.filter(
    (r) => r.status === "approved" || r.status === "finance_approved",
  );

  const submit = () => {
    if (!form.itemDescription || !form.budgetRequestId) {
      toast.error("Fill in all required fields.");
      return;
    }
    const item: ProcurementItem = {
      id: `PROC-${Date.now()}`,
      department,
      budgetRequestId: form.budgetRequestId,
      itemDescription: form.itemDescription,
      quantity: form.quantity,
      unitCost: form.unitCost,
      totalCost: form.quantity * form.unitCost,
      supplier: form.supplier,
      deliveryDate: form.deliveryDate,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    const all = loadProc();
    all.push(item);
    saveProc(all);
    setItems((prev) => [...prev, item]);
    setDialog(false);
    setForm({
      budgetRequestId: "",
      itemDescription: "",
      quantity: 1,
      unitCost: 0,
      supplier: "",
      deliveryDate: "",
    });
    toast.success("Procurement request submitted.");
  };

  const procStatusColors: Record<ProcurementItem["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    delivered: "bg-purple-100 text-purple-700",
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialog(true)}
          disabled={approvedBudgets.length === 0}
          data-ocid="procurement.request.new"
        >
          <PlusCircle size={14} className="mr-1" /> Raise Procurement Request
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-6">
          No procurement requests yet.
          {approvedBudgets.length === 0 && (
            <span className="block text-xs mt-1 text-muted-foreground">
              Requires an approved budget request first.
            </span>
          )}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b">
            <tr>
              {[
                "ID",
                "Description",
                "Qty",
                "Unit Cost",
                "Total",
                "Status",
                "Delivery",
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
            {items.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-3 py-2 text-xs font-mono text-primary">
                  {p.id}
                </td>
                <td className="px-3 py-2">{p.itemDescription}</td>
                <td className="px-3 py-2">{p.quantity}</td>
                <td className="px-3 py-2">₦{p.unitCost.toLocaleString()}</td>
                <td className="px-3 py-2 font-medium">
                  ₦{p.totalCost.toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${procStatusColors[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {p.deliveryDate || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Procurement Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Linked Budget Request</Label>
              <Select
                value={form.budgetRequestId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, budgetRequestId: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select budget request" />
                </SelectTrigger>
                <SelectContent>
                  {approvedBudgets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.id} — {b.session} (₦{b.totalEstimated.toLocaleString()}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Item Description</Label>
              <Input
                className="mt-1"
                value={form.itemDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, itemDescription: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      quantity: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Unit Cost (₦)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.unitCost || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unitCost: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Supplier</Label>
              <Input
                className="mt-1"
                value={form.supplier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supplier: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Expected Delivery Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.deliveryDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryDate: e.target.value }))
                }
              />
            </div>
            <p className="text-sm font-medium text-foreground">
              Total Cost:{" "}
              <span className="text-primary">
                ₦{(form.quantity * form.unitCost).toLocaleString()}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={submit}
              data-ocid="procurement.request.submit"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
