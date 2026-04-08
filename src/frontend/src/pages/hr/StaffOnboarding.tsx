import {
  Award,
  CheckCircle,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Plus,
  Shield,
  UserCheck,
  Users,
  X,
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
import { Textarea } from "../../components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingRecord {
  id: string;
  staffId: string;
  staffName: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  dateCreated: string;
  // Documents submitted
  docs: {
    offerLetter: boolean;
    certificates: boolean;
    medicalReport: boolean;
    guarantorForm: boolean;
    birthCertificate: boolean;
    passport: boolean;
  };
  // Workflow stages
  hrVerified: boolean;
  hrVerifiedBy: string;
  hrVerifiedDate: string;
  accessGranted: boolean;
  accessGrantedDate: string;
  status:
    | "pending-docs"
    | "docs-submitted"
    | "hr-verification"
    | "access-granted"
    | "rejected";
  notes: string;
}

interface ProbationRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  designation: string;
  appointmentDate: string;
  confirmationDate: string;
  reviewDates: {
    date: string;
    score: number;
    notes: string;
    reviewedBy: string;
  }[];
  status: "active" | "extended" | "confirmed" | "terminated";
}

const LS_KEYS = {
  onboarding: "unidigital_hr_onboarding",
  probation: "unidigital_hr_probation",
};

const SEED_ONBOARDING: OnboardingRecord[] = [
  {
    id: "ONB001",
    staffId: "FUEK/STAFF/NEW/001",
    staffName: "Dr. Kemi Adeyemi",
    designation: "Lecturer I",
    department: "Chemistry",
    email: "k.adeyemi@fuek.edu.ng",
    phone: "08011112222",
    dateCreated: "2025-04-01",
    docs: {
      offerLetter: true,
      certificates: true,
      medicalReport: false,
      guarantorForm: true,
      birthCertificate: false,
      passport: true,
    },
    hrVerified: false,
    hrVerifiedBy: "",
    hrVerifiedDate: "",
    accessGranted: false,
    accessGrantedDate: "",
    status: "docs-submitted",
    notes: "Missing medical report and birth certificate.",
  },
  {
    id: "ONB002",
    staffId: "FUEK/STAFF/NEW/002",
    staffName: "Mr. Umar Aliyu",
    designation: "Administrative Officer",
    department: "Administration",
    email: "u.aliyu@fuek.edu.ng",
    phone: "07099887766",
    dateCreated: "2025-03-15",
    docs: {
      offerLetter: true,
      certificates: true,
      medicalReport: true,
      guarantorForm: true,
      birthCertificate: true,
      passport: true,
    },
    hrVerified: true,
    hrVerifiedBy: "HR Director",
    hrVerifiedDate: "2025-03-20",
    accessGranted: true,
    accessGrantedDate: "2025-03-21",
    status: "access-granted",
    notes: "All documents verified. Access granted.",
  },
];

const SEED_PROBATION: ProbationRecord[] = [
  {
    id: "PRB001",
    staffId: "FUEK/STAFF/003",
    staffName: "Mr. Bello Suleiman",
    department: "Physics",
    designation: "Assistant Lecturer",
    appointmentDate: "2022-07-01",
    confirmationDate: "2024-07-01",
    reviewDates: [
      {
        date: "2023-07-01",
        score: 72,
        notes: "Good performance. Needs improvement in research output.",
        reviewedBy: "HOD Physics",
      },
      {
        date: "2024-01-01",
        score: 78,
        notes: "Improved. Research publication submitted.",
        reviewedBy: "HOD Physics",
      },
    ],
    status: "active",
  },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

type Tab = "onboarding" | "probation";

export function StaffOnboarding() {
  const [tab, setTab] = useState<Tab>("onboarding");
  const [onboarding, setOnboarding] = useState<OnboardingRecord[]>([]);
  const [probation, setProbation] = useState<ProbationRecord[]>([]);

  useEffect(() => {
    const ob = load<OnboardingRecord[]>(LS_KEYS.onboarding, []);
    setOnboarding(ob.length ? ob : SEED_ONBOARDING);
    const pr = load<ProbationRecord[]>(LS_KEYS.probation, []);
    setProbation(pr.length ? pr : SEED_PROBATION);
  }, []);

  const persistOnboarding = (data: OnboardingRecord[]) => {
    setOnboarding(data);
    save(LS_KEYS.onboarding, data);
  };
  const persistProbation = (data: ProbationRecord[]) => {
    setProbation(data);
    save(LS_KEYS.probation, data);
  };

  const tabs = [
    {
      key: "onboarding" as Tab,
      label: "Staff Onboarding Workflow",
      icon: <UserCheck size={16} />,
    },
    {
      key: "probation" as Tab,
      label: "Probation Tracking",
      icon: <Shield size={16} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Staff Onboarding & Probation
        </h1>
        <p className="text-slate-500 text-sm">
          New staff document submission, HR verification, access management, and
          probation reviews
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/60"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "onboarding" && (
        <OnboardingTab records={onboarding} onChange={persistOnboarding} />
      )}
      {tab === "probation" && (
        <ProbationTab records={probation} onChange={persistProbation} />
      )}
    </div>
  );
}

// ─── Onboarding Tab ───────────────────────────────────────────────────────────

const DOC_LABELS: Record<keyof OnboardingRecord["docs"], string> = {
  offerLetter: "Offer Letter",
  certificates: "Academic Certificates",
  medicalReport: "Medical Report",
  guarantorForm: "Guarantor Form",
  birthCertificate: "Birth Certificate",
  passport: "Passport Photograph",
};

function OnboardingTab({
  records,
  onChange,
}: { records: OnboardingRecord[]; onChange: (r: OnboardingRecord[]) => void }) {
  const [dialog, setDialog] = useState(false);
  const [viewing, setViewing] = useState<OnboardingRecord | null>(null);
  const [form, setForm] = useState<Partial<OnboardingRecord>>({});
  const [editing, setEditing] = useState<OnboardingRecord | null>(null);

  const statusConfig: Record<
    OnboardingRecord["status"],
    { label: string; color: string }
  > = {
    "pending-docs": {
      label: "Pending Documents",
      color: "bg-amber-100 text-amber-700",
    },
    "docs-submitted": {
      label: "Docs Submitted",
      color: "bg-blue-100 text-blue-700",
    },
    "hr-verification": {
      label: "HR Verification",
      color: "bg-purple-100 text-purple-700",
    },
    "access-granted": {
      label: "Access Granted",
      color: "bg-green-100 text-green-700",
    },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      docs: {
        offerLetter: false,
        certificates: false,
        medicalReport: false,
        guarantorForm: false,
        birthCertificate: false,
        passport: false,
      },
      status: "pending-docs",
    });
    setDialog(true);
  };

  const saveRecord = () => {
    const entry = form as OnboardingRecord;
    if (!entry.id) {
      entry.id = `ONB${Date.now()}`;
      entry.dateCreated = new Date().toISOString().split("T")[0];
    }
    const updated = editing
      ? records.map((r) => (r.id === editing.id ? entry : r))
      : [...records, entry];
    onChange(updated);
    setDialog(false);
    setEditing(null);
    setForm({});
  };

  const toggleDoc = (id: string, doc: keyof OnboardingRecord["docs"]) => {
    onChange(
      records.map((r) =>
        r.id === id ? { ...r, docs: { ...r.docs, [doc]: !r.docs[doc] } } : r,
      ),
    );
  };

  const hrVerify = (id: string) => {
    onChange(
      records.map((r) =>
        r.id === id
          ? {
              ...r,
              hrVerified: true,
              hrVerifiedBy: "HR Officer",
              hrVerifiedDate: new Date().toISOString().split("T")[0],
              status: "hr-verification" as const,
            }
          : r,
      ),
    );
  };

  const grantAccess = (id: string) => {
    onChange(
      records.map((r) =>
        r.id === id
          ? {
              ...r,
              accessGranted: true,
              accessGrantedDate: new Date().toISOString().split("T")[0],
              status: "access-granted" as const,
            }
          : r,
      ),
    );
  };

  const rejectRecord = (id: string) => {
    onChange(
      records.map((r) =>
        r.id === id ? { ...r, status: "rejected" as const } : r,
      ),
    );
  };

  const docsComplete = (docs: OnboardingRecord["docs"]) =>
    Object.values(docs).every(Boolean);
  const docsCount = (docs: OnboardingRecord["docs"]) =>
    Object.values(docs).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            "pending-docs",
            "docs-submitted",
            "hr-verification",
            "access-granted",
          ] as OnboardingRecord["status"][]
        ).map((s) => (
          <Card key={s}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-slate-800">
                {records.filter((r) => r.status === s).length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {statusConfig[s].label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {records.length} onboarding records
        </p>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={openAdd}
        >
          <Plus size={14} className="mr-1" /> New Onboarding
        </Button>
      </div>

      {records.map((r) => (
        <Card
          key={r.id}
          className={`border-l-4 ${r.status === "access-granted" ? "border-green-400" : r.status === "rejected" ? "border-red-400" : r.status === "hr-verification" ? "border-purple-400" : "border-amber-400"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">
                    {r.staffName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[r.status].color}`}
                  >
                    {statusConfig[r.status].label}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {r.staffId} · {r.designation} · {r.department}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {r.email} · {r.phone} · Created: {r.dateCreated}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewing(r)}
                >
                  <Eye size={13} className="mr-1" /> Details
                </Button>
                {!r.hrVerified && docsComplete(r.docs) && (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => hrVerify(r.id)}
                  >
                    <CheckCircle size={13} className="mr-1" /> HR Verify
                  </Button>
                )}
                {r.hrVerified && !r.accessGranted && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => grantAccess(r.id)}
                  >
                    <Shield size={13} className="mr-1" /> Grant Access
                  </Button>
                )}
                {r.status !== "rejected" && r.status !== "access-granted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-200"
                    onClick={() => rejectRecord(r.id)}
                  >
                    <XCircle size={13} className="mr-1" /> Reject
                  </Button>
                )}
              </div>
            </div>

            {/* Documents checklist */}
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Documents: {docsCount(r.docs)}/6 submitted
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(r.docs) as (keyof OnboardingRecord["docs"])[]
                ).map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => toggleDoc(r.id, doc)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${r.docs[doc] ? "bg-green-50 border-green-300 text-green-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                  >
                    {r.docs[doc] ? (
                      <CheckCircle size={11} />
                    ) : (
                      <Clock size={11} />
                    )}{" "}
                    {DOC_LABELS[doc]}
                  </button>
                ))}
              </div>
            </div>

            {r.notes && (
              <p className="text-xs text-slate-500 mt-2 italic">{r.notes}</p>
            )}

            {/* Progress workflow */}
            <div className="mt-3 flex items-center gap-1 text-xs">
              {[
                "New Staff",
                "Docs Submitted",
                "HR Verified",
                "Access Granted",
              ].map((step, i) => {
                const done =
                  i === 0 ||
                  (i === 1 && r.status !== "pending-docs") ||
                  (i === 2 && r.hrVerified) ||
                  (i === 3 && r.accessGranted);
                return (
                  <span key={step} className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}
                    >
                      {step}
                    </span>
                    {i < 3 && (
                      <ChevronRight size={12} className="text-slate-300" />
                    )}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Staff Onboarding</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Staff ID</Label>
              <Input
                className="mt-1"
                value={form.staffId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, staffId: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                className="mt-1"
                value={form.staffName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, staffName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                className="mt-1"
                value={form.designation ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, designation: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                className="mt-1"
                value={form.department ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1"
                value={form.email ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1"
                value={form.phone ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveRecord}
            >
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboarding Details — {viewing?.staffName}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Staff ID", viewing.staffId],
                  ["Designation", viewing.designation],
                  ["Department", viewing.department],
                  ["Email", viewing.email],
                  ["Phone", viewing.phone],
                  ["Created", viewing.dateCreated],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-xs text-slate-400 uppercase">{l}</p>
                    <p className="font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase mb-2">
                  Documents
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {(
                    Object.keys(
                      viewing.docs,
                    ) as (keyof OnboardingRecord["docs"])[]
                  ).map((doc) => (
                    <div
                      key={doc}
                      className={`flex items-center gap-1.5 text-xs ${viewing.docs[doc] ? "text-green-600" : "text-red-500"}`}
                    >
                      {viewing.docs[doc] ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}{" "}
                      {DOC_LABELS[doc]}
                    </div>
                  ))}
                </div>
              </div>
              {viewing.hrVerified && (
                <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  ✓ HR Verified by {viewing.hrVerifiedBy} on{" "}
                  {viewing.hrVerifiedDate}
                </p>
              )}
              {viewing.accessGranted && (
                <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                  ✓ System Access Granted on {viewing.accessGrantedDate}
                </p>
              )}
              {viewing.notes && (
                <p className="text-xs text-slate-500 italic">{viewing.notes}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Probation Tab ────────────────────────────────────────────────────────────

function ProbationTab({
  records,
  onChange,
}: { records: ProbationRecord[]; onChange: (r: ProbationRecord[]) => void }) {
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProbationRecord | null>(
    null,
  );
  const [reviewForm, setReviewForm] = useState({
    date: "",
    score: 0,
    notes: "",
    reviewedBy: "",
  });
  const [addDialog, setAddDialog] = useState(false);
  const [newForm, setNewForm] = useState<Partial<ProbationRecord>>({});

  const statusColor: Record<ProbationRecord["status"], string> = {
    active: "bg-amber-100 text-amber-700",
    extended: "bg-orange-100 text-orange-700",
    confirmed: "bg-green-100 text-green-700",
    terminated: "bg-red-100 text-red-700",
  };

  const addReview = () => {
    if (!selectedRecord) return;
    const updated: ProbationRecord = {
      ...selectedRecord,
      reviewDates: [...selectedRecord.reviewDates, { ...reviewForm }],
    };
    onChange(records.map((r) => (r.id === selectedRecord.id ? updated : r)));
    setReviewDialog(false);
    setReviewForm({ date: "", score: 0, notes: "", reviewedBy: "" });
  };

  const updateStatus = (id: string, status: ProbationRecord["status"]) => {
    onChange(records.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const saveNew = () => {
    const entry: ProbationRecord = {
      id: `PRB${Date.now()}`,
      staffId: newForm.staffId ?? "",
      staffName: newForm.staffName ?? "",
      department: newForm.department ?? "",
      designation: newForm.designation ?? "",
      appointmentDate: newForm.appointmentDate ?? "",
      confirmationDate: newForm.confirmationDate ?? "",
      reviewDates: [],
      status: "active",
    };
    onChange([...records, entry]);
    setAddDialog(false);
    setNewForm({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {records.length} staff on probation
        </p>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setAddDialog(true)}
        >
          <Plus size={14} className="mr-1" /> Add Probation Record
        </Button>
      </div>

      {records.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            No probation records. All staff confirmed.
          </CardContent>
        </Card>
      )}

      {records.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">
                    {r.staffName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {r.staffId} · {r.designation} · {r.department}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Appointed: {r.appointmentDate} · Expected Confirmation:{" "}
                  <span className="font-medium text-amber-700">
                    {r.confirmationDate}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedRecord(r);
                    setReviewForm({
                      date: new Date().toISOString().split("T")[0],
                      score: 0,
                      notes: "",
                      reviewedBy: "",
                    });
                    setReviewDialog(true);
                  }}
                >
                  <FileText size={13} className="mr-1" /> Add Review
                </Button>
                {r.status === "active" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(r.id, "confirmed")}
                    >
                      <Award size={13} className="mr-1" /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-500"
                      onClick={() => updateStatus(r.id, "extended")}
                    >
                      Extend
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Review history */}
            {r.reviewDates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Review History
                </p>
                <div className="space-y-2">
                  {r.reviewDates.map((rev) => (
                    <div
                      key={`${rev.date}-${rev.reviewedBy}`}
                      className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rev.score >= 70 ? "bg-green-100 text-green-700" : rev.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                      >
                        {rev.score}%
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {rev.date} — Reviewed by {rev.reviewedBy}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {rev.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Probation Review — {selectedRecord?.staffName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Review Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={reviewForm.date}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Score (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1"
                  value={reviewForm.score}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, score: +e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Reviewed By</Label>
              <Input
                className="mt-1"
                value={reviewForm.reviewedBy}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, reviewedBy: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Performance Notes</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={reviewForm.notes}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={addReview}
            >
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Probation Record Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Probation Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Staff ID</Label>
              <Input
                className="mt-1"
                value={newForm.staffId ?? ""}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, staffId: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Staff Name</Label>
              <Input
                className="mt-1"
                value={newForm.staffName ?? ""}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, staffName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                className="mt-1"
                value={newForm.designation ?? ""}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, designation: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                className="mt-1"
                value={newForm.department ?? ""}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Appointment Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={newForm.appointmentDate ?? ""}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, appointmentDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Expected Confirmation</Label>
              <Input
                type="date"
                className="mt-1"
                value={newForm.confirmationDate ?? ""}
                onChange={(e) =>
                  setNewForm((f) => ({
                    ...f,
                    confirmationDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveNew}>
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
