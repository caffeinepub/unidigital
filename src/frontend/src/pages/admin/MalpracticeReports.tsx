import {
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Filter,
  Search,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface MalpracticeReport {
  id: string;
  examId: string;
  examDate: string;
  courseCode: string;
  reportedBy: string;
  studentMatric: string;
  studentName: string;
  offenseType: string;
  description: string;
  evidence: string;
  recommendedAction: string;
  status: "pending" | "under-investigation" | "resolved" | "dismissed";
  createdAt: string;
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

const LS_KEY = "unidigital_malpractice_reports";

function load(): MalpracticeReport[] {
  try {
    const r = localStorage.getItem(LS_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}
function save(data: MalpracticeReport[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MalpracticeReports() {
  const [reports, setReports] = useState<MalpracticeReport[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<MalpracticeReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolveStatus, setResolveStatus] =
    useState<MalpracticeReport["status"]>("resolved");

  useEffect(() => {
    const data = load();
    // Add seed data if empty
    if (data.length === 0) {
      const seeds: MalpracticeReport[] = [
        {
          id: "MP001",
          examId: "EX001",
          examDate: "2025-06-10",
          courseCode: "CSC301",
          reportedBy: "Dr. Ahmed Musa",
          studentMatric: "FUEK/SCI/2025/CSC/003",
          studentName: "Ibrahim Yusuf",
          offenseType: "Use of mobile phone",
          description:
            "Student was caught using a mobile phone hidden under the desk to take photos of the examination paper.",
          evidence:
            "Phone was seized with photos of exam paper found in gallery.",
          recommendedAction:
            "Cancel exam result and refer to disciplinary committee.",
          status: "pending",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "MP002",
          examId: "EX002",
          examDate: "2025-06-11",
          courseCode: "MAT201",
          reportedBy: "Mrs. Grace Okoye",
          studentMatric: "FUEK/SCI/2025/MAT/007",
          studentName: "Amina Bello",
          offenseType: "Copying from neighbour",
          description:
            "Student was observed repeatedly looking at the answer sheet of the student seated to her left.",
          evidence:
            "Both answer sheets show identical working for questions 3, 4, and 5.",
          recommendedAction: "Void the affected questions for both students.",
          status: "under-investigation",
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          adminNotes:
            "Disciplinary committee notified. Hearing scheduled for next week.",
        },
        {
          id: "MP003",
          examId: "EX003",
          examDate: "2025-06-12",
          courseCode: "PHY101",
          reportedBy: "Mr. Bello Suleiman",
          studentMatric: "FUEK/SCI/2025/PHY/012",
          studentName: "Chukwuemeka Nwosu",
          offenseType: "Smuggling of materials",
          description:
            "Student found with printed notes concealed inside a calculator case.",
          evidence:
            "Notes found and confiscated. Topics matched exam questions precisely.",
          recommendedAction: "Cancel exam, refer for disciplinary action.",
          status: "resolved",
          createdAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          adminNotes:
            "Exam result cancelled. Student placed on academic probation for one semester.",
          resolvedBy: "Academic Registrar",
          resolvedAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ];
      setReports(seeds);
      save(seeds);
    } else {
      setReports(data);
    }
  }, []);

  const persist = (updated: MalpracticeReport[]) => {
    setReports(updated);
    save(updated);
  };

  const updateReport = (id: string, updates: Partial<MalpracticeReport>) => {
    persist(reports.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (viewing?.id === id)
      setViewing((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleResolve = (r: MalpracticeReport) => {
    const updates: Partial<MalpracticeReport> = {
      status: resolveStatus,
      adminNotes,
      resolvedBy: "Admin",
      resolvedAt: new Date().toISOString(),
    };
    updateReport(r.id, updates);
    setViewing(null);
  };

  const filtered = reports
    .filter((r) => {
      const ms =
        !search ||
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.studentMatric.toLowerCase().includes(search.toLowerCase()) ||
        r.courseCode.toLowerCase().includes(search.toLowerCase());
      return ms && (statusFilter === "all" || r.status === statusFilter);
    })
    .sort((a, b) => {
      const order = {
        pending: 0,
        "under-investigation": 1,
        resolved: 2,
        dismissed: 3,
      };
      return (
        order[a.status] - order[b.status] ||
        b.createdAt.localeCompare(a.createdAt)
      );
    });

  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    investigating: reports.filter((r) => r.status === "under-investigation")
      .length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    "under-investigation": "bg-blue-100 text-blue-700 border-blue-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
    dismissed: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const borderColor: Record<string, string> = {
    pending: "border-l-amber-400",
    "under-investigation": "border-l-blue-400",
    resolved: "border-l-green-400",
    dismissed: "border-l-slate-300",
  };
  const offenseIcon: Record<string, string> = {
    "Use of mobile phone": "📱",
    "Copying from neighbour": "👀",
    "Smuggling of materials": "📋",
    Impersonation: "🎭",
    "Possession of unauthorized material": "📄",
    Disturbance: "📢",
    "Verbal abuse of invigilator": "🗣️",
    Other: "⚠️",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Malpractice Reports
        </h1>
        <p className="text-muted-foreground text-sm">
          Review, investigate, and resolve examination malpractice cases
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Reports",
            value: counts.total,
            color: "text-foreground",
            bg: "bg-card",
          },
          {
            label: "Pending Review",
            value: counts.pending,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Under Investigation",
            value: counts.investigating,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Resolved",
            value: counts.resolved,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((stat) => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-2.5 top-2.5 text-muted-foreground"
          />
          <Input
            className="pl-8 h-9"
            placeholder="Search by student, matric, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9">
            <Filter size={13} className="mr-1" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under-investigation">
              Under Investigation
            </SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {reports.length} reports
        </p>
      </div>

      {/* Report List */}
      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield
              size={40}
              className="mx-auto mb-3 text-muted-foreground/40"
            />
            <p className="font-medium text-foreground">
              No malpractice reports
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Reports are filed by invigilators via Examination Management
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className={`border-l-4 ${borderColor[r.status]}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">
                      {offenseIcon[r.offenseType] ?? "⚠️"}
                    </span>
                    <p className="font-semibold text-foreground">
                      {r.studentName}
                    </p>
                    <span className="font-mono text-xs text-muted-foreground">
                      ({r.studentMatric})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-0.5 rounded font-medium">
                      {r.courseCode}
                    </span>
                    <span>Exam: {r.examDate}</span>
                    <span>Reported by: {r.reportedBy}</span>
                    <span>
                      Filed: {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    {r.offenseType}
                  </p>
                  <p className="text-sm text-foreground mt-1 line-clamp-2">
                    {r.description}
                  </p>
                  {r.adminNotes && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <FileText size={11} /> {r.adminNotes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[r.status]}`}
                  >
                    {r.status.replace(/-/g, " ")}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewing(r);
                        setAdminNotes(r.adminNotes ?? "");
                        setResolveStatus("resolved");
                      }}
                    >
                      <Eye size={13} className="mr-1" /> Review
                    </Button>
                    {r.status === "pending" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          updateReport(r.id, { status: "under-investigation" })
                        }
                      >
                        Investigate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Malpractice Review — Admin Panel
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Student
                  </p>
                  <p className="font-semibold">{viewing.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Matric No.
                  </p>
                  <p className="font-mono text-xs">{viewing.studentMatric}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Course
                  </p>
                  <p>{viewing.courseCode}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Exam Date
                  </p>
                  <p>{viewing.examDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase">
                    Offense
                  </p>
                  <p className="text-red-600 font-medium">
                    {viewing.offenseType}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Description of Incident
                </p>
                <p className="text-sm text-foreground bg-muted/30 rounded p-2">
                  {viewing.description}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Evidence
                </p>
                <p className="text-sm text-foreground bg-muted/30 rounded p-2">
                  {viewing.evidence || "No evidence noted"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Invigilator's Recommended Action
                </p>
                <p className="text-sm text-foreground">
                  {viewing.recommendedAction || "—"}
                </p>
              </div>
              <hr className="border-border" />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Admin Resolution
                </p>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Update Status
                  </Label>
                  <Select
                    value={resolveStatus}
                    onValueChange={(v) =>
                      setResolveStatus(v as MalpracticeReport["status"])
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-investigation">
                        Under Investigation
                      </SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Admin Notes / Resolution Details
                  </Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter resolution details, sanctions imposed, committee recommendations..."
                  />
                </div>
                {viewing.resolvedBy && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle size={12} /> Resolved by {viewing.resolvedBy}{" "}
                    on{" "}
                    {viewing.resolvedAt
                      ? new Date(viewing.resolvedAt).toLocaleDateString()
                      : "—"}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleResolve(viewing)}
              >
                Save Resolution
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
