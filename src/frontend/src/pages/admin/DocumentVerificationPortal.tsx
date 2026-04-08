import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  CheckCircle,
  Clock,
  FileCheck,
  Filter,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface DocVerificationRecord {
  id: string;
  date: string;
  studentName: string;
  matric: string;
  department: string;
  docType: "admission" | "transcript" | "clearance" | "results" | "certificate";
  fileName: string;
  status: "Pending" | "Verified" | "Rejected";
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  docId: string;
  studentName: string;
  action: "Verified" | "Rejected";
  by: string;
  reason?: string;
}

const REJECTION_PRESETS = [
  "Signature illegible",
  "Missing official seal",
  "Document expired",
  "Unclear scan quality",
];

const DOC_TYPE_LABELS: Record<string, string> = {
  admission: "Admission Letter",
  transcript: "Transcript",
  clearance: "Clearance",
  results: "Exam Results",
  certificate: "Certificate",
};

function seedDocuments(): DocVerificationRecord[] {
  const key = "unidigital_doc_verifications";
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  const docs: DocVerificationRecord[] = [
    {
      id: "DV001",
      date: "2024-01-15",
      studentName: "Amara Okonkwo",
      matric: "CSC/2021/001",
      department: "Computer Science",
      docType: "admission",
      fileName: "admission_amara.pdf",
      status: "Pending",
    },
    {
      id: "DV002",
      date: "2024-01-16",
      studentName: "Emeka Nwosu",
      matric: "ENG/2021/002",
      department: "Engineering",
      docType: "transcript",
      fileName: "transcript_emeka.pdf",
      status: "Verified",
      verifiedBy: "Admin Officer",
      verifiedDate: "2024-01-17",
    },
    {
      id: "DV003",
      date: "2024-01-17",
      studentName: "Fatima Bello",
      matric: "MED/2021/003",
      department: "Medicine",
      docType: "clearance",
      fileName: "clearance_fatima.pdf",
      status: "Rejected",
      verifiedBy: "Registry Officer",
      verifiedDate: "2024-01-18",
      rejectionReason: "Document expired",
    },
    {
      id: "DV004",
      date: "2024-01-18",
      studentName: "Chukwudi Eze",
      matric: "LAW/2021/004",
      department: "Law",
      docType: "results",
      fileName: "results_chukwudi.pdf",
      status: "Pending",
    },
    {
      id: "DV005",
      date: "2024-01-19",
      studentName: "Ngozi Adeyemi",
      matric: "BUS/2021/005",
      department: "Business Administration",
      docType: "certificate",
      fileName: "cert_ngozi.pdf",
      status: "Pending",
    },
    {
      id: "DV006",
      date: "2024-01-20",
      studentName: "Taiwo Afolabi",
      matric: "CSC/2021/006",
      department: "Computer Science",
      docType: "transcript",
      fileName: "transcript_taiwo.pdf",
      status: "Verified",
      verifiedBy: "Admin Officer",
      verifiedDate: "2024-01-20",
    },
    {
      id: "DV007",
      date: "2024-01-21",
      studentName: "Ifeanyi Obi",
      matric: "ENG/2022/007",
      department: "Engineering",
      docType: "admission",
      fileName: "admission_ifeanyi.pdf",
      status: "Pending",
    },
    {
      id: "DV008",
      date: "2024-01-22",
      studentName: "Adaugo Nweke",
      matric: "NCE/CSC/2023/001",
      department: "Computer Science",
      docType: "clearance",
      fileName: "clearance_adaugo.pdf",
      status: "Pending",
    },
  ];
  localStorage.setItem(key, JSON.stringify(docs));
  return docs;
}

function seedAudit(): AuditEntry[] {
  const key = "unidigital_doc_audit";
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  const audit: AuditEntry[] = [
    {
      id: "AU001",
      timestamp: "2024-01-17T10:23:00Z",
      docId: "DV002",
      studentName: "Emeka Nwosu",
      action: "Verified",
      by: "Admin Officer",
    },
    {
      id: "AU002",
      timestamp: "2024-01-18T14:45:00Z",
      docId: "DV003",
      studentName: "Fatima Bello",
      action: "Rejected",
      by: "Registry Officer",
      reason: "Document expired",
    },
    {
      id: "AU003",
      timestamp: "2024-01-20T09:10:00Z",
      docId: "DV006",
      studentName: "Taiwo Afolabi",
      action: "Verified",
      by: "Admin Officer",
    },
  ];
  localStorage.setItem(key, JSON.stringify(audit));
  return audit;
}

function saveDocuments(docs: DocVerificationRecord[]) {
  localStorage.setItem("unidigital_doc_verifications", JSON.stringify(docs));
}
function saveAudit(audit: AuditEntry[]) {
  localStorage.setItem("unidigital_doc_audit", JSON.stringify(audit));
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Verified")
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle size={11} className="mr-1" /> Verified
      </Badge>
    );
  if (status === "Rejected")
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle size={11} className="mr-1" /> Rejected
      </Badge>
    );
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
      <Clock size={11} className="mr-1" /> Pending
    </Badge>
  );
}

export function DocumentVerificationPortal() {
  const [docs, setDocs] = useState<DocVerificationRecord[]>(seedDocuments);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] =
    useState<DocVerificationRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const thisWeekStart = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  const pendingCount = docs.filter((d) => d.status === "Pending").length;
  const verifiedToday = docs.filter(
    (d) => d.status === "Verified" && d.verifiedDate === today,
  ).length;
  const rejectedThisWeek = audit.filter(
    (a) => a.action === "Rejected" && a.timestamp.slice(0, 10) >= thisWeekStart,
  ).length;

  const departments = [...new Set(docs.map((d) => d.department))];

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const q = search.toLowerCase();
      if (
        q &&
        !d.studentName.toLowerCase().includes(q) &&
        !d.matric.toLowerCase().includes(q) &&
        !d.fileName.toLowerCase().includes(q)
      )
        return false;
      if (filterType !== "all" && d.docType !== filterType) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (filterDept !== "all" && d.department !== filterDept) return false;
      if (filterDateFrom && d.date < filterDateFrom) return false;
      if (filterDateTo && d.date > filterDateTo) return false;
      return true;
    });
  }, [
    docs,
    search,
    filterType,
    filterStatus,
    filterDept,
    filterDateFrom,
    filterDateTo,
  ]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    const pendingIds = filtered
      .filter((d) => d.status === "Pending")
      .map((d) => d.id);
    if (pendingIds.every((id) => selected.has(id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of pendingIds) next.delete(id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of pendingIds) next.add(id);
        return next;
      });
    }
  };

  const verifyDoc = (id: string) => {
    const now = new Date().toISOString();
    const updated = docs.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "Verified" as const,
            verifiedBy: "Admin Officer",
            verifiedDate: today,
          }
        : d,
    );
    const doc = docs.find((d) => d.id === id);
    const newAudit: AuditEntry = {
      id: `AU${Date.now()}`,
      timestamp: now,
      docId: id,
      studentName: doc?.studentName ?? "",
      action: "Verified",
      by: "Admin Officer",
    };
    const updatedAudit = [newAudit, ...audit];
    saveDocuments(updated);
    saveAudit(updatedAudit);
    setDocs(updated);
    setAudit(updatedAudit);
  };

  const verifySelected = () => {
    const now = new Date().toISOString();
    const ids = Array.from(selected).filter(
      (id) => docs.find((d) => d.id === id)?.status === "Pending",
    );
    const updated = docs.map((d) =>
      ids.includes(d.id)
        ? {
            ...d,
            status: "Verified" as const,
            verifiedBy: "Admin Officer",
            verifiedDate: today,
          }
        : d,
    );
    const newEntries: AuditEntry[] = ids.map((id) => ({
      id: `AU${Date.now()}-${id}`,
      timestamp: now,
      docId: id,
      studentName: docs.find((d) => d.id === id)?.studentName ?? "",
      action: "Verified" as const,
      by: "Admin Officer",
    }));
    const updatedAudit = [...newEntries, ...audit];
    saveDocuments(updated);
    saveAudit(updatedAudit);
    setDocs(updated);
    setAudit(updatedAudit);
    setSelected(new Set());
  };

  const openReject = (doc: DocVerificationRecord) => {
    setRejectTarget(doc);
    setRejectReason("");
    setCustomReason("");
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const reason = rejectReason === "custom" ? customReason : rejectReason;
    if (!reason) return;
    const now = new Date().toISOString();
    const updated = docs.map((d) =>
      d.id === rejectTarget.id
        ? {
            ...d,
            status: "Rejected" as const,
            verifiedBy: "Admin Officer",
            verifiedDate: today,
            rejectionReason: reason,
          }
        : d,
    );
    const newAudit: AuditEntry = {
      id: `AU${Date.now()}`,
      timestamp: now,
      docId: rejectTarget.id,
      studentName: rejectTarget.studentName,
      action: "Rejected",
      by: "Admin Officer",
      reason,
    };
    const updatedAudit = [newAudit, ...audit];
    saveDocuments(updated);
    saveAudit(updatedAudit);
    setDocs(updated);
    setAudit(updatedAudit);
    setRejectTarget(null);
  };

  const pendingSelected = filtered.filter(
    (d) => d.status === "Pending" && selected.has(d.id),
  ).length;

  return (
    <div className="space-y-6" data-ocid="doc-verify.root">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="text-blue-600" size={24} />
            Document Verification Portal
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Review, verify or reject submitted student documents
          </p>
        </div>
        {pendingSelected > 0 && (
          <Button
            onClick={verifySelected}
            className="bg-green-600 hover:bg-green-700"
            data-ocid="doc-verify.batch_verify_button"
          >
            <CheckCircle size={15} className="mr-1.5" />
            Verify Selected ({pendingSelected})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-yellow-700 font-medium uppercase tracking-wide">
                Total Pending
              </p>
              <p className="text-2xl font-bold text-yellow-800">
                {pendingCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium uppercase tracking-wide">
                Verified Today
              </p>
              <p className="text-2xl font-bold text-green-800">
                {verifiedToday}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <ShieldAlert className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-red-700 font-medium uppercase tracking-wide">
                Rejected This Week
              </p>
              <p className="text-2xl font-bold text-red-800">
                {rejectedThisWeek}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 mt-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-background min-w-[200px]">
                  <Search size={14} className="text-slate-400" />
                  <input
                    className="outline-none text-sm bg-transparent w-full"
                    placeholder="Search name, matric, file…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-ocid="doc-verify.search_input"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger
                    className="w-40"
                    data-ocid="doc-verify.type_filter"
                  >
                    <Filter size={13} className="mr-1" />
                    <SelectValue placeholder="Doc Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger
                    className="w-36"
                    data-ocid="doc-verify.status_filter"
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger
                    className="w-44"
                    data-ocid="doc-verify.dept_filter"
                  >
                    <SelectValue placeholder="Department" />
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
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    data-ocid="doc-verify.date_from_input"
                  />
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    className="h-8 w-36 text-xs"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    data-ocid="doc-verify.date_to_input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            filtered
                              .filter((d) => d.status === "Pending")
                              .every((d) => selected.has(d.id)) &&
                            filtered.some((d) => d.status === "Pending")
                          }
                          onCheckedChange={toggleAll}
                          data-ocid="doc-verify.select_all_checkbox"
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Matric</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Verified Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center text-slate-400 py-10"
                          data-ocid="doc-verify.empty_state"
                        >
                          No documents match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {filtered.map((doc, idx) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-slate-50"
                        data-ocid={`doc-verify.row.${idx + 1}`}
                      >
                        <TableCell>
                          {doc.status === "Pending" && (
                            <Checkbox
                              checked={selected.has(doc.id)}
                              onCheckedChange={() => toggleSelect(doc.id)}
                              data-ocid={`doc-verify.row_checkbox.${idx + 1}`}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {doc.date}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {doc.studentName}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-slate-600">
                          {doc.matric}
                        </TableCell>
                        <TableCell className="text-sm">
                          {DOC_TYPE_LABELS[doc.docType]}
                        </TableCell>
                        <TableCell className="text-sm text-blue-600 underline cursor-pointer">
                          {doc.fileName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {doc.verifiedBy ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {doc.verifiedDate ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.status === "Pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-7 text-xs px-3"
                                onClick={() => verifyDoc(doc.id)}
                                data-ocid={`doc-verify.verify_button.${idx + 1}`}
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs px-3"
                                onClick={() => openReject(doc)}
                                data-ocid={`doc-verify.reject_button.${idx + 1}`}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {doc.status === "Rejected" && (
                            <span className="text-xs text-red-500 italic">
                              {doc.rejectionReason}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Verification Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Document ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Reason (if rejected)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-slate-400 py-10"
                        >
                          No audit entries yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {audit.map((a, idx) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`doc-verify.audit.row.${idx + 1}`}
                      >
                        <TableCell className="text-xs text-slate-400">
                          {new Date(a.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {a.studentName}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-slate-500">
                          {a.docId}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={a.action} />
                        </TableCell>
                        <TableCell className="text-sm">{a.by}</TableCell>
                        <TableCell className="text-sm text-red-500 italic">
                          {a.reason ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) setRejectTarget(null);
        }}
      >
        <DialogContent data-ocid="doc-verify.reject_dialog">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Document:{" "}
              <span className="font-medium">{rejectTarget?.fileName}</span> —{" "}
              {rejectTarget?.studentName}
            </p>
            <div>
              <Label>Rejection Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="doc-verify.reject_reason_select"
                >
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_PRESETS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom reason…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rejectReason === "custom" && (
              <div>
                <Label>Enter custom reason</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe the rejection reason…"
                  data-ocid="doc-verify.reject_custom_textarea"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              data-ocid="doc-verify.reject_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                !rejectReason ||
                (rejectReason === "custom" && !customReason.trim())
              }
              onClick={confirmReject}
              data-ocid="doc-verify.reject_confirm_button"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
