import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { downloadCSV } from "../../utils/csvUtils";
import {
  type ExtendedStudentRecord,
  type RegistrationAuditLog,
  addRegistrationAuditLog,
  getExtendedStudents,
  getRegistrationAuditLog,
  saveExtendedStudents,
} from "../../utils/registrationUtils";
import { getLocalStudents, saveLocalStudents } from "../../utils/sampleData";

const SOURCE_LABELS: Record<string, string> = {
  ai_scan: "AI Scan",
  bulk_csv: "Bulk CSV",
  ai_bulk_upload: "AI Bulk Upload",
  manual: "Manual",
};
const SOURCE_COLORS: Record<string, string> = {
  ai_scan: "bg-purple-100 text-purple-700",
  bulk_csv: "bg-blue-100 text-blue-700",
  ai_bulk_upload: "bg-indigo-100 text-indigo-700",
  manual: "bg-green-100 text-green-700",
};
const STATUS_COLORS: Record<string, string> = {
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

type RegTab =
  | "all"
  | "manual"
  | "bulk_csv"
  | "ai_scan"
  | "ai_bulk_upload"
  | "audit";

export function RegistrationManagementAdmin() {
  const [activeTab, setActiveTab] = useState<RegTab>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [auditLog, setAuditLog] = useState<RegistrationAuditLog[]>(
    getRegistrationAuditLog(),
  );

  // Merge base students + extended students
  const buildRegistrations = (): ExtendedStudentRecord[] => {
    const base = getLocalStudents();
    const extended = getExtendedStudents();
    const extMap = new Map(extended.map((e) => [e.matricNumber, e]));

    return base.map((s) => ({
      ...s,
      ...(extMap.get(s.matricNumber) || {}),
      registrationSource: extMap.get(s.matricNumber)?.registrationSource,
      registrationStatus:
        extMap.get(s.matricNumber)?.registrationStatus || "pending_approval",
      registrationId:
        extMap.get(s.matricNumber)?.registrationId ||
        `LEGACY-${s.matricNumber}`,
    }));
  };

  const [registrations, setRegistrations] = useState<ExtendedStudentRecord[]>(
    buildRegistrations(),
  );

  const refresh = () => {
    setRegistrations(buildRegistrations());
    setAuditLog(getRegistrationAuditLog());
  };

  const filtered = registrations.filter((r) => {
    if (
      activeTab !== "all" &&
      activeTab !== "audit" &&
      r.registrationSource !== activeTab
    )
      return false;
    if (statusFilter !== "all" && r.registrationStatus !== statusFilter)
      return false;
    if (
      search &&
      !r.name.toLowerCase().includes(search.toLowerCase()) &&
      !r.matricNumber.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleApprove = (student: ExtendedStudentRecord) => {
    // Update base students status
    const students = getLocalStudents();
    const updated = students.map((s) =>
      s.matricNumber === student.matricNumber ? { ...s } : s,
    );
    saveLocalStudents(updated);

    // Update extended
    const extended = getExtendedStudents();
    const updatedExt = extended.map((s) =>
      s.matricNumber === student.matricNumber
        ? {
            ...s,
            registrationStatus: "approved" as const,
            approvedAt: new Date().toISOString(),
            approvedBy: "Admin",
          }
        : s,
    );
    saveExtendedStudents(updatedExt);

    addRegistrationAuditLog({
      id: `AUDIT-${Date.now()}`,
      registrationId: student.registrationId || "",
      studentMatric: student.matricNumber,
      action: "approved",
      performedBy: "Admin",
      timestamp: new Date().toISOString(),
      previousStatus: student.registrationStatus,
      newStatus: "approved",
    });

    toast.success(`${student.name} approved!`);
    refresh();
  };

  const handleReject = () => {
    if (!rejectDialog) return;
    const student = registrations.find((r) => r.matricNumber === rejectDialog);
    if (!student) return;

    const extended = getExtendedStudents();
    const updatedExt = extended.map((s) =>
      s.matricNumber === rejectDialog
        ? {
            ...s,
            registrationStatus: "rejected" as const,
            rejectionReason: rejectReason,
          }
        : s,
    );
    saveExtendedStudents(updatedExt);

    addRegistrationAuditLog({
      id: `AUDIT-${Date.now()}`,
      registrationId: student.registrationId || "",
      studentMatric: rejectDialog,
      action: "rejected",
      performedBy: "Admin",
      timestamp: new Date().toISOString(),
      previousStatus: student.registrationStatus,
      newStatus: "rejected",
      reason: rejectReason,
    });

    toast.error("Registration rejected");
    setRejectDialog(null);
    setRejectReason("");
    refresh();
  };

  const handleApproveAll = () => {
    const pending = filtered.filter(
      (r) => r.registrationStatus === "pending_approval",
    );
    for (const s of pending) handleApprove(s);
    toast.success(`${pending.length} registrations approved`);
  };

  const handleExport = () => {
    downloadCSV("registrations_export.csv", [
      [
        "Reg ID",
        "Matric",
        "Name",
        "Email",
        "Dept",
        "Level",
        "Source",
        "Status",
        "Registered At",
      ],
      ...filtered.map((r) => [
        r.registrationId || "",
        r.matricNumber,
        r.name,
        r.email,
        r.department,
        r.level,
        r.registrationSource || "legacy",
        r.registrationStatus || "unknown",
        r.registeredAt || "",
      ]),
    ]);
  };

  const kpis = {
    total: registrations.length,
    pending: registrations.filter(
      (r) =>
        !r.registrationStatus || r.registrationStatus === "pending_approval",
    ).length,
    approved: registrations.filter((r) => r.registrationStatus === "approved")
      .length,
    rejected: registrations.filter((r) => r.registrationStatus === "rejected")
      .length,
  };

  const tabCounts: Record<RegTab, number> = {
    all: registrations.length,
    manual: registrations.filter((r) => r.registrationSource === "manual")
      .length,
    bulk_csv: registrations.filter((r) => r.registrationSource === "bulk_csv")
      .length,
    ai_scan: registrations.filter((r) => r.registrationSource === "ai_scan")
      .length,
    ai_bulk_upload: registrations.filter(
      (r) => r.registrationSource === "ai_bulk_upload",
    ).length,
    audit: auditLog.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Registration Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Approve, reject, and manage all student registrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            data-ocid="reg_mgmt.export_button"
          >
            📥 Export
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleApproveAll}
            data-ocid="reg_mgmt.approve_all"
          >
            ✅ Approve All Pending
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total", kpis.total, "text-blue-600"],
          ["Pending", kpis.pending, "text-amber-600"],
          ["Approved", kpis.approved, "text-green-600"],
          ["Rejected", kpis.rejected, "text-red-600"],
        ].map(([label, val, color]) => (
          <Card key={label as string}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Method breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["manual", "bulk_csv", "ai_scan", "ai_bulk_upload"] as const).map(
          (src) => (
            <div
              key={src}
              className={`rounded-lg p-3 ${SOURCE_COLORS[src]} border border-current/10 text-center`}
            >
              <p className="text-lg font-bold">{tabCounts[src]}</p>
              <p className="text-xs mt-0.5">{SOURCE_LABELS[src]}</p>
            </div>
          ),
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RegTab)}>
        <TabsList className="flex-wrap h-auto gap-1" data-ocid="reg_mgmt.tabs">
          {(
            [
              "all",
              "manual",
              "bulk_csv",
              "ai_scan",
              "ai_bulk_upload",
              "audit",
            ] as const
          ).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-xs capitalize"
              data-ocid={`reg_mgmt.tab.${tab}`}
            >
              {tab === "audit" ? "Audit Log" : SOURCE_LABELS[tab] || "All"}
              <Badge className="ml-1.5 bg-white/50 text-current border-0 text-xs">
                {tabCounts[tab]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Filters bar */}
        {activeTab !== "audit" && (
          <div className="flex gap-3 mt-4 flex-wrap">
            <Input
              placeholder="Search name or matric..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-64"
              data-ocid="reg_mgmt.search"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Registrations tab content */}
        {(
          ["all", "manual", "bulk_csv", "ai_scan", "ai_bulk_upload"] as const
        ).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {filtered.length} registrations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-12 text-slate-400"
                    data-ocid="reg_mgmt.empty_state"
                  >
                    <p className="text-3xl mb-2">📋</p>
                    <p>No registrations found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table data-ocid="reg_mgmt.table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reg ID</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Dept / Level</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((reg) => (
                          <TableRow
                            key={reg.matricNumber}
                            data-ocid={`reg_mgmt.row.${reg.matricNumber}`}
                          >
                            <TableCell className="font-mono text-xs text-blue-600">
                              {reg.registrationId || "—"}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-sm">{reg.name}</p>
                              <p className="text-xs text-slate-400 font-mono">
                                {reg.matricNumber}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{reg.department}</p>
                              <p className="text-xs text-slate-400">
                                Level {reg.level}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`border-0 text-xs ${SOURCE_COLORS[reg.registrationSource || ""] || "bg-slate-100 text-slate-600"}`}
                              >
                                {SOURCE_LABELS[reg.registrationSource || ""] ||
                                  "Legacy"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`border-0 text-xs ${STATUS_COLORS[reg.registrationStatus || ""] || "bg-slate-100 text-slate-600"}`}
                              >
                                {reg.registrationStatus?.replace(/_/g, " ") ||
                                  "unknown"}
                              </Badge>
                              {reg.rejectionReason && (
                                <p className="text-xs text-red-500 mt-0.5 truncate max-w-24">
                                  {reg.rejectionReason}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-slate-400">
                              {reg.registeredAt
                                ? new Date(
                                    reg.registeredAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {reg.registrationStatus !== "approved" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                    onClick={() => handleApprove(reg)}
                                    data-ocid={`reg_mgmt.approve.${reg.matricNumber}`}
                                  >
                                    ✓
                                  </Button>
                                )}
                                {reg.registrationStatus !== "rejected" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs h-7"
                                    onClick={() =>
                                      setRejectDialog(reg.matricNumber)
                                    }
                                    data-ocid={`reg_mgmt.reject.${reg.matricNumber}`}
                                  >
                                    ✕
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Audit tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Audit Log ({auditLog.length} events)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {auditLog.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No audit events yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="reg_mgmt.audit_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Student Matric</TableHead>
                        <TableHead>Reg ID</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Status Change</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLog.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 text-xs ${log.action === "approved" ? "bg-green-100 text-green-700" : log.action === "rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.studentMatric}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-blue-600">
                            {log.registrationId}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.performedBy}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {log.previousStatus && `${log.previousStatus} → `}
                            {log.newStatus}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {log.reason || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog
        open={!!rejectDialog}
        onOpenChange={(o) => !o && setRejectDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Please provide a reason for rejection:
            </p>
            <Label>Reason</Label>
            <Textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documents, duplicate record..."
              data-ocid="reg_mgmt.reject_reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              data-ocid="reg_mgmt.confirm_reject"
            >
              Reject Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
