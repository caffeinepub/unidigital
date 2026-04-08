import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Key,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { getLocalStudents } from "../../utils/sampleData";

interface VerificationCode {
  id: string;
  code: string;
  studentMatric: string;
  studentName: string;
  documentType:
    | "academic-record"
    | "transcript"
    | "promotion-results"
    | "result-slip";
  issuedBy: string;
  issuedAt: string;
  isRevoked: boolean;
  usageCount: number;
  lastUsed?: string;
}

interface VerificationAttempt {
  id: string;
  code: string;
  attemptedAt: string;
  result: "verified" | "not-found" | "revoked";
  ipHint: string;
}

const DOC_TYPE_LABELS: Record<VerificationCode["documentType"], string> = {
  "academic-record": "Academic Record",
  transcript: "Transcript",
  "promotion-results": "Promotion Results",
  "result-slip": "Result Slip",
};

function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = `FUEK-${new Date().getFullYear()}-`;
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function seedVerificationData(
  students: { matricNumber: string; name: string }[],
) {
  const existingCodes = localStorage.getItem("unidigital_verification_codes");
  if (existingCodes) return;

  const sampleStudents = students.slice(0, 6);
  const docTypes: VerificationCode["documentType"][] = [
    "academic-record",
    "transcript",
    "promotion-results",
    "result-slip",
    "academic-record",
    "transcript",
  ];

  const codes: VerificationCode[] = sampleStudents.map((s, i) => ({
    id: `vc-${Date.now()}-${i}`,
    code: generateVerificationCode(),
    studentMatric: s.matricNumber,
    studentName: s.name,
    documentType: docTypes[i],
    issuedBy: "Admin",
    issuedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    isRevoked: i === 5,
    usageCount: Math.floor(Math.random() * 5),
    lastUsed:
      i < 3 ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
  }));

  const attempts: VerificationAttempt[] = [
    {
      id: "va-1",
      code: codes[0].code,
      attemptedAt: new Date(Date.now() - 3600000).toISOString(),
      result: "verified",
      ipHint: "192.168.1.***",
    },
    {
      id: "va-2",
      code: "FUEK-2025-XXINVALID",
      attemptedAt: new Date(Date.now() - 7200000).toISOString(),
      result: "not-found",
      ipHint: "10.0.0.***",
    },
    {
      id: "va-3",
      code: codes[5].code,
      attemptedAt: new Date(Date.now() - 86400000).toISOString(),
      result: "revoked",
      ipHint: "172.16.0.***",
    },
    {
      id: "va-4",
      code: codes[1].code,
      attemptedAt: new Date(Date.now() - 172800000).toISOString(),
      result: "verified",
      ipHint: "192.168.2.***",
    },
  ];

  localStorage.setItem("unidigital_verification_codes", JSON.stringify(codes));
  localStorage.setItem(
    "unidigital_verification_attempts",
    JSON.stringify(attempts),
  );
}

export function ResultVerificationAdmin() {
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [attempts, setAttempts] = useState<VerificationAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<"registry" | "attempts">(
    "registry",
  );
  const [search, setSearch] = useState("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<VerificationCode | null>(
    null,
  );
  const [genStudentMatric, setGenStudentMatric] = useState("");
  const [genDocType, setGenDocType] =
    useState<VerificationCode["documentType"]>("academic-record");
  const students = getLocalStudents();

  useEffect(() => {
    const allStudents = getLocalStudents();
    seedVerificationData(allStudents);
    loadData();
  }, []);

  function loadData() {
    const c = localStorage.getItem("unidigital_verification_codes");
    const a = localStorage.getItem("unidigital_verification_attempts");
    if (c) setCodes(JSON.parse(c));
    if (a) setAttempts(JSON.parse(a));
  }

  function saveCodes(updated: VerificationCode[]) {
    setCodes(updated);
    localStorage.setItem(
      "unidigital_verification_codes",
      JSON.stringify(updated),
    );
  }

  function handleGenerateCode() {
    const student = students.find((s) => s.matricNumber === genStudentMatric);
    if (!student) return;
    const newCode: VerificationCode = {
      id: `vc-${Date.now()}`,
      code: generateVerificationCode(),
      studentMatric: student.matricNumber,
      studentName: student.name,
      documentType: genDocType,
      issuedBy: "Admin",
      issuedAt: new Date().toISOString(),
      isRevoked: false,
      usageCount: 0,
    };
    saveCodes([...codes, newCode]);
    setShowGenerateDialog(false);
    setGenStudentMatric("");
    setGenDocType("academic-record");
  }

  function handleRevoke(id: string) {
    saveCodes(codes.map((c) => (c.id === id ? { ...c, isRevoked: true } : c)));
  }

  function handleDelete(id: string) {
    saveCodes(codes.filter((c) => c.id !== id));
  }

  const filteredCodes = codes.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentMatric.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredAttempts = attempts.filter((a) =>
    a.code.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCodes = codes.length;
  const activeCodes = codes.filter((c) => !c.isRevoked).length;
  const revokedCodes = codes.filter((c) => c.isRevoked).length;
  const totalAttempts = attempts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Result Verification Admin
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage verification codes, registry, and attempt logs for official
            result documents.
          </p>
        </div>
        <Button
          onClick={() => setShowGenerateDialog(true)}
          data-ocid="btn-generate-code"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Codes",
            value: totalCodes,
            color: "text-primary",
            icon: Key,
          },
          {
            label: "Active",
            value: activeCodes,
            color: "text-green-600",
            icon: CheckCircle2,
          },
          {
            label: "Revoked",
            value: revokedCodes,
            color: "text-destructive",
            icon: XCircle,
          },
          {
            label: "Verification Attempts",
            value: totalAttempts,
            color: "text-amber-600",
            icon: ClipboardList,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("registry")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "registry"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="tab-registry"
        >
          <Key className="w-4 h-4 inline mr-1" />
          Verification Registry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("attempts")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "attempts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="tab-attempts"
        >
          <ClipboardList className="w-4 h-4 inline mr-1" />
          Attempt Logs
          {attempts.length > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">
              {attempts.length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search codes, students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="search-verification"
        />
      </div>

      {/* Registry Tab */}
      {activeTab === "registry" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Issued Verification Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Code
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Document
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Issued
                    </th>
                    <th className="text-right p-3 font-medium text-muted-foreground">
                      Uses
                    </th>
                    <th className="text-center p-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right p-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center p-8 text-muted-foreground"
                      >
                        No verification codes found.
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((vc) => (
                      <tr
                        key={vc.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                        data-ocid={`row-vc-${vc.id}`}
                      >
                        <td className="p-3 font-mono font-medium text-primary">
                          {vc.code}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-foreground">
                            {vc.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vc.studentMatric}
                          </p>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {DOC_TYPE_LABELS[vc.documentType]}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(vc.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {vc.usageCount}
                        </td>
                        <td className="p-3 text-center">
                          {vc.isRevoked ? (
                            <Badge variant="destructive" className="text-xs">
                              Revoked
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCode(vc);
                                setShowDetailDialog(true);
                              }}
                              data-ocid={`btn-view-vc-${vc.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!vc.isRevoked && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevoke(vc.id)}
                                className="text-amber-600 hover:text-amber-700"
                                data-ocid={`btn-revoke-vc-${vc.id}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(vc.id)}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`btn-delete-vc-${vc.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attempts Tab */}
      {activeTab === "attempts" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Verification Attempt Log
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadData}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Code Attempted
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      IP (masked)
                    </th>
                    <th className="text-center p-3 font-medium text-muted-foreground">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center p-8 text-muted-foreground"
                      >
                        No verification attempts logged.
                      </td>
                    </tr>
                  ) : (
                    filteredAttempts.map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-border hover:bg-muted/20 transition-colors"
                        data-ocid={`row-attempt-${a.id}`}
                      >
                        <td className="p-3 font-mono text-primary">{a.code}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(a.attemptedAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {a.ipHint}
                        </td>
                        <td className="p-3 text-center">
                          {a.result === "verified" && (
                            <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {a.result === "not-found" && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Not Found
                            </Badge>
                          )}
                          {a.result === "revoked" && (
                            <Badge variant="secondary" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Revoked
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Code Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Generate Verification Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Student</Label>
              <Select
                value={genStudentMatric}
                onValueChange={setGenStudentMatric}
              >
                <SelectTrigger data-ocid="select-student-for-code">
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.matricNumber} value={s.matricNumber}>
                      {s.name} — {s.matricNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document Type</Label>
              <Select
                value={genDocType}
                onValueChange={(v) =>
                  setGenDocType(v as VerificationCode["documentType"])
                }
              >
                <SelectTrigger data-ocid="select-doc-type-for-code">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/40 rounded-md p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Preview format:
              </p>
              <code className="font-mono text-primary">
                FUEK-{new Date().getFullYear()}-XXXXXXXX
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!genStudentMatric}
              onClick={handleGenerateCode}
              data-ocid="btn-confirm-generate-code"
            >
              <Key className="w-4 h-4 mr-2" />
              Generate & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Verification Code Details
            </DialogTitle>
          </DialogHeader>
          {selectedCode && (
            <div className="space-y-3 py-2 text-sm">
              <div className="bg-muted/40 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Verification Code
                </p>
                <p className="font-mono font-bold text-primary text-lg">
                  {selectedCode.code}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Student Name", value: selectedCode.studentName },
                  { label: "Matric Number", value: selectedCode.studentMatric },
                  {
                    label: "Document Type",
                    value: DOC_TYPE_LABELS[selectedCode.documentType],
                  },
                  { label: "Issued By", value: selectedCode.issuedBy },
                  {
                    label: "Issued At",
                    value: new Date(selectedCode.issuedAt).toLocaleString(),
                  },
                  {
                    label: "Usage Count",
                    value: String(selectedCode.usageCount),
                  },
                  {
                    label: "Last Used",
                    value: selectedCode.lastUsed
                      ? new Date(selectedCode.lastUsed).toLocaleString()
                      : "Never",
                  },
                  {
                    label: "Status",
                    value: selectedCode.isRevoked ? "Revoked" : "Active",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/20 rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Public Verification URL
                </p>
                <code className="text-xs text-primary break-all">
                  {window.location.origin}/?verify={selectedCode.code}
                </code>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Close
            </Button>
            {selectedCode && !selectedCode.isRevoked && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  handleRevoke(selectedCode.id);
                  setShowDetailDialog(false);
                }}
                data-ocid="btn-revoke-from-detail"
              >
                Revoke Code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
