import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Gavel,
  MessageSquare,
  PlusCircle,
  Search,
  Shield,
  X,
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
import { Textarea } from "../../components/ui/textarea";
import { getLocalStudents } from "../../utils/sampleData";

export interface DisciplinaryCase {
  id: string;
  studentMatric: string;
  studentName: string;
  offenseType: string;
  offenseDate: string;
  narrative: string;
  evidenceRef: string;
  severity: "Minor" | "Major" | "Serious";
  status:
    | "Reported"
    | "Under Investigation"
    | "Hearing Scheduled"
    | "Resolved"
    | "Appealed"
    | "Closed";
  sanctions: Sanction[];
  appeals: Appeal[];
  createdAt: string;
}

export interface Sanction {
  id: string;
  type:
    | "Warning"
    | "Probation"
    | "Suspension"
    | "Rustication"
    | "Expulsion"
    | "Fine"
    | "Community Service";
  duration?: string;
  fineAmount?: number;
  issuedAt: string;
}

export interface Appeal {
  id: string;
  reason: string;
  statement: string;
  submittedAt: string;
  outcome: "Pending" | "Upheld" | "Dismissed";
}

const OFFENSE_TYPES = [
  "Academic Misconduct",
  "Examination Malpractice",
  "Conduct Violation",
  "Property Damage",
  "Harassment",
  "Other",
];

const STATUSES: DisciplinaryCase["status"][] = [
  "Reported",
  "Under Investigation",
  "Hearing Scheduled",
  "Resolved",
  "Appealed",
  "Closed",
];

const SANCTION_TYPES: Sanction["type"][] = [
  "Warning",
  "Probation",
  "Suspension",
  "Rustication",
  "Expulsion",
  "Fine",
  "Community Service",
];

const SEED_CASES: DisciplinaryCase[] = [
  {
    id: "DISC-001",
    studentMatric: "CSC/2021/001",
    studentName: "Amara Okonkwo",
    offenseType: "Academic Misconduct",
    offenseDate: "2024-01-18",
    narrative:
      "Student was found submitting an assignment with significant portions copied verbatim from an online source without proper citation. The submission matched over 70% of a published article.",
    evidenceRef: "Turnitin Report #TR-2024-118",
    severity: "Major",
    status: "Resolved",
    sanctions: [
      {
        id: "S-001",
        type: "Warning",
        issuedAt: "2024-01-25",
      },
      {
        id: "S-002",
        type: "Probation",
        duration: "One semester",
        issuedAt: "2024-01-25",
      },
    ],
    appeals: [],
    createdAt: "2024-01-19",
  },
  {
    id: "DISC-002",
    studentMatric: "ENG/2021/002",
    studentName: "Emeka Nwosu",
    offenseType: "Examination Malpractice",
    offenseDate: "2024-03-12",
    narrative:
      "Student was caught with unauthorized notes concealed in their calculator case during the Engineering Mathematics II examination. The student was removed from the examination hall.",
    evidenceRef: "Invigilator Report #INV-2024-312, Item Ref: CALC-NOTES",
    severity: "Serious",
    status: "Hearing Scheduled",
    sanctions: [],
    appeals: [],
    createdAt: "2024-03-12",
  },
  {
    id: "DISC-003",
    studentMatric: "MED/2021/003",
    studentName: "Fatima Bello",
    offenseType: "Conduct Violation",
    offenseDate: "2023-11-05",
    narrative:
      "Student engaged in a heated verbal altercation with a lecturer during a lecture session, disrupting the class and refusing to comply with the lecturer's request to leave.",
    evidenceRef: "Witness Statement WS-2023-105",
    severity: "Minor",
    status: "Closed",
    sanctions: [
      {
        id: "S-003",
        type: "Warning",
        issuedAt: "2023-11-10",
      },
    ],
    appeals: [
      {
        id: "APP-001",
        reason: "Context misrepresented",
        statement:
          "The altercation was provoked by discriminatory remarks. I was acting in self-defense of my dignity.",
        submittedAt: "2023-11-15",
        outcome: "Dismissed",
      },
    ],
    createdAt: "2023-11-06",
  },
];

function getLocalCases(): DisciplinaryCase[] {
  const raw = localStorage.getItem("unidigital_disciplinary_cases");
  if (!raw) {
    localStorage.setItem(
      "unidigital_disciplinary_cases",
      JSON.stringify(SEED_CASES),
    );
    return SEED_CASES;
  }
  return JSON.parse(raw);
}
function saveCases(data: DisciplinaryCase[]) {
  localStorage.setItem("unidigital_disciplinary_cases", JSON.stringify(data));
}

const severityColor: Record<string, string> = {
  Minor: "bg-amber-100 text-amber-700 border-amber-200",
  Major: "bg-orange-100 text-orange-700 border-orange-200",
  Serious: "bg-red-100 text-red-700 border-red-200",
};

const statusColor: Record<string, string> = {
  Reported: "bg-slate-100 text-slate-600",
  "Under Investigation": "bg-blue-100 text-blue-700",
  "Hearing Scheduled": "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
  Appealed: "bg-amber-100 text-amber-700",
  Closed: "bg-slate-200 text-slate-500",
};

const outcomeColor: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Upheld: "bg-green-100 text-green-700",
  Dismissed: "bg-red-100 text-red-700",
};

interface Props {
  userRole?: "admin" | "hod";
}

export function StudentDisciplinaryRecords({ userRole = "admin" }: Props) {
  const [cases, setCases] = useState<DisciplinaryCase[]>([]);
  const [search, setSearch] = useState("");
  const [filterOffense, setFilterOffense] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewCase, setShowNewCase] = useState(false);
  const [showSanction, setShowSanction] = useState<string | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState<string | null>(null);

  const students = getLocalStudents();

  const [form, setForm] = useState({
    studentSearch: "",
    selectedMatric: "",
    selectedName: "",
    offenseType: "",
    offenseDate: "",
    narrative: "",
    evidenceRef: "",
    severity: "Minor" as DisciplinaryCase["severity"],
  });

  const [sanctionForm, setSanctionForm] = useState({
    type: "Warning" as Sanction["type"],
    duration: "",
    fineAmount: "",
  });

  const [newStatus, setNewStatus] = useState<DisciplinaryCase["status"]>(
    "Under Investigation",
  );

  useEffect(() => {
    setCases(getLocalCases());
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(form.studentSearch.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(form.studentSearch.toLowerCase()),
  );

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.studentMatric.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchOffense =
      filterOffense === "all" || c.offenseType === filterOffense;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchOffense && matchStatus;
  });

  const activeCases = cases.filter(
    (c) => !["Resolved", "Closed"].includes(c.status),
  ).length;
  const resolvedThisSemester = cases.filter(
    (c) =>
      c.status === "Resolved" &&
      c.createdAt >= "2024-01-01" &&
      c.createdAt <= "2024-06-30",
  ).length;
  const appealsPending = cases.reduce(
    (acc, c) => acc + c.appeals.filter((a) => a.outcome === "Pending").length,
    0,
  );

  const handleCreateCase = () => {
    if (
      !form.selectedMatric ||
      !form.offenseType ||
      !form.offenseDate ||
      !form.narrative
    )
      return;
    const newCase: DisciplinaryCase = {
      id: `DISC-${String(cases.length + 1).padStart(3, "0")}`,
      studentMatric: form.selectedMatric,
      studentName: form.selectedName,
      offenseType: form.offenseType,
      offenseDate: form.offenseDate,
      narrative: form.narrative,
      evidenceRef: form.evidenceRef,
      severity: form.severity,
      status: "Reported",
      sanctions: [],
      appeals: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [...cases, newCase];
    saveCases(updated);
    setCases(updated);
    setShowNewCase(false);
    setForm({
      studentSearch: "",
      selectedMatric: "",
      selectedName: "",
      offenseType: "",
      offenseDate: "",
      narrative: "",
      evidenceRef: "",
      severity: "Minor",
    });
  };

  const handleAddSanction = (caseId: string) => {
    const sanction: Sanction = {
      id: `S-${Date.now()}`,
      type: sanctionForm.type,
      duration: sanctionForm.duration || undefined,
      fineAmount: sanctionForm.fineAmount
        ? Number(sanctionForm.fineAmount)
        : undefined,
      issuedAt: new Date().toISOString().split("T")[0],
    };
    const updated = cases.map((c) =>
      c.id === caseId ? { ...c, sanctions: [...c.sanctions, sanction] } : c,
    );
    saveCases(updated);
    setCases(updated);
    setShowSanction(null);
    setSanctionForm({ type: "Warning", duration: "", fineAmount: "" });
  };

  const handleUpdateStatus = (caseId: string) => {
    const updated = cases.map((c) =>
      c.id === caseId ? { ...c, status: newStatus } : c,
    );
    saveCases(updated);
    setCases(updated);
    setShowStatusUpdate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Student Disciplinary Records
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage disciplinary cases, sanctions, and appeals
          </p>
        </div>
        {userRole === "admin" && (
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setShowNewCase(true)}
            data-ocid="disciplinary.new-case.btn"
          >
            <PlusCircle size={16} className="mr-2" />
            New Case
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Active Cases",
            value: activeCases,
            icon: <AlertTriangle size={20} />,
            color: "text-red-600 bg-red-50",
          },
          {
            label: "Resolved This Semester",
            value: resolvedThisSemester,
            icon: <Shield size={20} />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Appeals Pending",
            value: appealsPending,
            icon: <MessageSquare size={20} />,
            color: "text-amber-600 bg-amber-50",
          },
        ].map(({ label, value, icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className="pl-9"
                placeholder="Search by student, matric, case ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="disciplinary.search.input"
              />
            </div>
            <Select value={filterOffense} onValueChange={setFilterOffense}>
              <SelectTrigger data-ocid="disciplinary.filter-offense.select">
                <SelectValue placeholder="Filter by offense" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offense Types</SelectItem>
                {OFFENSE_TYPES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-ocid="disciplinary.filter-status.select">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Case ID",
                    "Student",
                    "Offense Type",
                    "Date",
                    "Severity",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-slate-400"
                    >
                      No cases found
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <>
                    <tr
                      key={c.id}
                      className="border-b hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === c.id ? null : c.id)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          setExpandedId(expandedId === c.id ? null : c.id);
                      }}
                      data-ocid={`disciplinary.case-row.${c.id}`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-blue-600 font-medium">
                        {c.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{c.studentName}</p>
                        <p className="text-xs text-slate-400">
                          {c.studentMatric}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">{c.offenseType}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {c.offenseDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityColor[c.severity]}`}
                        >
                          {c.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status]}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === c.id ? null : c.id);
                          }}
                        >
                          {expandedId === c.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr key={`${c.id}-expanded`} className="bg-slate-50">
                        <td colSpan={7} className="px-4 py-5">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Narrative & Evidence */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                  Offense Narrative
                                </p>
                                <p className="text-sm text-slate-700 bg-white rounded-lg border p-3 leading-relaxed">
                                  {c.narrative}
                                </p>
                              </div>
                              {c.evidenceRef && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Evidence Reference
                                  </p>
                                  <p className="text-sm text-blue-600 flex items-center gap-2">
                                    <FileText size={14} /> {c.evidenceRef}
                                  </p>
                                </div>
                              )}

                              {/* Status Update */}
                              {userRole === "admin" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNewStatus(c.status);
                                      setShowStatusUpdate(c.id);
                                    }}
                                    data-ocid={`disciplinary.update-status.${c.id}`}
                                  >
                                    Update Status
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSanctionForm({
                                        type: "Warning",
                                        duration: "",
                                        fineAmount: "",
                                      });
                                      setShowSanction(c.id);
                                    }}
                                    data-ocid={`disciplinary.add-sanction.${c.id}`}
                                  >
                                    <Gavel size={14} className="mr-1" />
                                    Add Sanction
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Sanctions & Appeals */}
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Sanctions Applied ({c.sanctions.length})
                                </p>
                                {c.sanctions.length === 0 ? (
                                  <p className="text-sm text-slate-400 italic">
                                    No sanctions issued yet
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {c.sanctions.map((s) => (
                                      <div
                                        key={s.id}
                                        className="bg-white rounded-lg border p-3 flex justify-between items-start"
                                      >
                                        <div>
                                          <p className="text-sm font-semibold text-slate-800">
                                            {s.type}
                                          </p>
                                          {s.duration && (
                                            <p className="text-xs text-slate-500">
                                              Duration: {s.duration}
                                            </p>
                                          )}
                                          {s.fineAmount && (
                                            <p className="text-xs text-slate-500">
                                              Fine: ₦
                                              {s.fineAmount.toLocaleString()}
                                            </p>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                          {s.issuedAt}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Appeal Log ({c.appeals.length})
                                </p>
                                {c.appeals.length === 0 ? (
                                  <p className="text-sm text-slate-400 italic">
                                    No appeals submitted
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {c.appeals.map((a) => (
                                      <div
                                        key={a.id}
                                        className="bg-white rounded-lg border p-3"
                                      >
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="text-sm font-medium text-slate-700">
                                            {a.reason}
                                          </p>
                                          <span
                                            className={`px-2 py-0.5 rounded text-xs font-medium ${outcomeColor[a.outcome]}`}
                                          >
                                            {a.outcome}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                          {a.statement}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                          Submitted: {a.submittedAt}
                                        </p>
                                        {userRole === "admin" &&
                                          a.outcome === "Pending" && (
                                            <div className="flex gap-2 mt-2">
                                              <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const updated = cases.map(
                                                    (cc) =>
                                                      cc.id === c.id
                                                        ? {
                                                            ...cc,
                                                            appeals:
                                                              cc.appeals.map(
                                                                (ap) =>
                                                                  ap.id === a.id
                                                                    ? {
                                                                        ...ap,
                                                                        outcome:
                                                                          "Upheld" as const,
                                                                      }
                                                                    : ap,
                                                              ),
                                                          }
                                                        : cc,
                                                  );
                                                  saveCases(updated);
                                                  setCases(updated);
                                                }}
                                              >
                                                Uphold
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-200 text-xs h-7"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  const updated = cases.map(
                                                    (cc) =>
                                                      cc.id === c.id
                                                        ? {
                                                            ...cc,
                                                            appeals:
                                                              cc.appeals.map(
                                                                (ap) =>
                                                                  ap.id === a.id
                                                                    ? {
                                                                        ...ap,
                                                                        outcome:
                                                                          "Dismissed" as const,
                                                                      }
                                                                    : ap,
                                                              ),
                                                          }
                                                        : cc,
                                                  );
                                                  saveCases(updated);
                                                  setCases(updated);
                                                }}
                                              >
                                                Dismiss
                                              </Button>
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Case Dialog */}
      <Dialog open={showNewCase} onOpenChange={setShowNewCase}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              Record New Disciplinary Case
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Student (Name or Matric Number)</Label>
              <Input
                className="mt-1"
                placeholder="Type to search..."
                value={form.studentSearch}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentSearch: e.target.value }))
                }
                data-ocid="disciplinary.student-search.input"
              />
              {form.studentSearch && !form.selectedMatric && (
                <div className="border rounded-lg mt-1 max-h-36 overflow-y-auto bg-white shadow-sm">
                  {filteredStudents.slice(0, 8).map((s) => (
                    <button
                      key={s.matricNumber}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          selectedMatric: s.matricNumber,
                          selectedName: s.name,
                          studentSearch: `${s.name} (${s.matricNumber})`,
                        }))
                      }
                    >
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-slate-400">{s.matricNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Offense Type</Label>
                <Select
                  value={form.offenseType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, offenseType: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select offense type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFENSE_TYPES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Offense Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.offenseDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, offenseDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    severity: v as DisciplinaryCase["severity"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Minor", "Major", "Serious"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Detailed Narrative</Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="Describe the incident in detail..."
                value={form.narrative}
                onChange={(e) =>
                  setForm((f) => ({ ...f, narrative: e.target.value }))
                }
                data-ocid="disciplinary.narrative.textarea"
              />
            </div>

            <div>
              <Label>
                Evidence Reference (link, file name, or report number)
              </Label>
              <Input
                className="mt-1"
                placeholder="e.g. Turnitin Report #TR-2024-001"
                value={form.evidenceRef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, evidenceRef: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowNewCase(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateCase}
              data-ocid="disciplinary.submit-case.btn"
            >
              Record Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sanction Dialog */}
      <Dialog open={!!showSanction} onOpenChange={() => setShowSanction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel size={18} className="text-slate-700" />
              Issue Sanction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sanction Type</Label>
              <Select
                value={sanctionForm.type}
                onValueChange={(v) =>
                  setSanctionForm((f) => ({
                    ...f,
                    type: v as Sanction["type"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SANCTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {["Suspension", "Probation", "Community Service"].includes(
              sanctionForm.type,
            ) && (
              <div>
                <Label>Duration</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. 2 weeks, 1 semester"
                  value={sanctionForm.duration}
                  onChange={(e) =>
                    setSanctionForm((f) => ({ ...f, duration: e.target.value }))
                  }
                />
              </div>
            )}
            {sanctionForm.type === "Fine" && (
              <div>
                <Label>Fine Amount (₦)</Label>
                <Input
                  className="mt-1"
                  type="number"
                  placeholder="e.g. 50000"
                  value={sanctionForm.fineAmount}
                  onChange={(e) =>
                    setSanctionForm((f) => ({
                      ...f,
                      fineAmount: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSanction(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => showSanction && handleAddSanction(showSanction)}
            >
              Issue Sanction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={!!showStatusUpdate}
        onOpenChange={() => setShowStatusUpdate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Case Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) =>
                  setNewStatus(v as DisciplinaryCase["status"])
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowStatusUpdate(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                showStatusUpdate && handleUpdateStatus(showStatusUpdate)
              }
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
