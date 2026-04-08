import {
  AlertTriangle,
  FileText,
  Gavel,
  MessageSquare,
  Send,
  Shield,
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
import { Textarea } from "../../components/ui/textarea";
import { getLocalStudents } from "../../utils/sampleData";
import type {
  Appeal,
  DisciplinaryCase,
} from "../admin/StudentDisciplinaryRecords";

interface Props {
  userEmail: string;
}

const statusColor: Record<string, string> = {
  Reported: "bg-slate-100 text-slate-600",
  "Under Investigation": "bg-blue-100 text-blue-700",
  "Hearing Scheduled": "bg-purple-100 text-purple-700",
  Resolved: "bg-green-100 text-green-700",
  Appealed: "bg-amber-100 text-amber-700",
  Closed: "bg-slate-200 text-slate-500",
};

const severityColor: Record<string, string> = {
  Minor: "bg-amber-100 text-amber-700",
  Major: "bg-orange-100 text-orange-700",
  Serious: "bg-red-100 text-red-700",
};

const outcomeColor: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Upheld: "bg-green-100 text-green-700",
  Dismissed: "bg-red-100 text-red-700",
};

function getLocalCases(): DisciplinaryCase[] {
  return JSON.parse(
    localStorage.getItem("unidigital_disciplinary_cases") || "[]",
  );
}
function saveCases(data: DisciplinaryCase[]) {
  localStorage.setItem("unidigital_disciplinary_cases", JSON.stringify(data));
}

export function DisciplinaryRecordStudent({ userEmail }: Props) {
  const [cases, setCases] = useState<DisciplinaryCase[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAppeal, setShowAppeal] = useState<string | null>(null);
  const [appealForm, setAppealForm] = useState({ reason: "", statement: "" });
  const [myMatric, setMyMatric] = useState("");

  useEffect(() => {
    const students = getLocalStudents();
    const me = students.find((s) => s.email === userEmail) || students[0];
    if (me) {
      setMyMatric(me.matricNumber);
      const allCases = getLocalCases();
      setCases(allCases.filter((c) => c.studentMatric === me.matricNumber));
    }
  }, [userEmail]);

  const canAppeal = (c: DisciplinaryCase) =>
    ["Resolved", "Hearing Scheduled"].includes(c.status) &&
    !c.appeals.some((a) => a.outcome === "Pending");

  const handleSubmitAppeal = (caseId: string) => {
    if (!appealForm.reason.trim() || !appealForm.statement.trim()) return;

    const appeal: Appeal = {
      id: `APP-${Date.now()}`,
      reason: appealForm.reason,
      statement: appealForm.statement,
      submittedAt: new Date().toISOString().split("T")[0],
      outcome: "Pending",
    };

    const allCases = getLocalCases();
    const updated = allCases.map((c) =>
      c.id === caseId
        ? { ...c, status: "Appealed" as const, appeals: [...c.appeals, appeal] }
        : c,
    );
    saveCases(updated);
    setCases(updated.filter((c) => c.studentMatric === myMatric));
    setShowAppeal(null);
    setAppealForm({ reason: "", statement: "" });
  };

  if (cases.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            My Disciplinary Record
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View any disciplinary cases filed against you
          </p>
        </div>
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <Shield size={28} className="text-green-500" />
            </div>
            <h3 className="font-semibold text-slate-700 text-lg">
              Clean Record
            </h3>
            <p className="text-slate-400 text-sm max-w-xs">
              You have no disciplinary cases on record. Keep maintaining good
              academic conduct.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Disciplinary Record
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {cases.length} case{cases.length !== 1 ? "s" : ""} on your record
        </p>
      </div>

      <div className="space-y-4">
        {cases.map((c) => (
          <Card
            key={c.id}
            className="border-l-4"
            style={{
              borderLeftColor:
                c.severity === "Serious"
                  ? "#ef4444"
                  : c.severity === "Major"
                    ? "#f97316"
                    : "#f59e0b",
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-blue-600 font-medium">
                      {c.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColor[c.severity]}`}
                    >
                      {c.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <CardTitle className="text-base">{c.offenseType}</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Date of Offense: {c.offenseDate} &bull; Filed: {c.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canAppeal(c) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-600 border-amber-300"
                      onClick={() => {
                        setAppealForm({ reason: "", statement: "" });
                        setShowAppeal(c.id);
                      }}
                      data-ocid={`disciplinary.submit-appeal.${c.id}`}
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Submit Appeal
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExpandedId(expandedId === c.id ? null : c.id)
                    }
                  >
                    {expandedId === c.id ? "Less" : "More"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedId === c.id && (
              <CardContent className="pt-0 space-y-5">
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Incident Description
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">
                    {c.narrative}
                  </p>
                  {c.evidenceRef && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <FileText size={12} /> Evidence: {c.evidenceRef}
                    </p>
                  )}
                </div>

                {c.sanctions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Sanctions Issued
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {c.sanctions.map((s) => (
                        <div
                          key={s.id}
                          className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3"
                        >
                          <Gavel
                            size={16}
                            className="text-red-400 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-red-800">
                              {s.type}
                            </p>
                            {s.duration && (
                              <p className="text-xs text-red-600">
                                Duration: {s.duration}
                              </p>
                            )}
                            {s.fineAmount && (
                              <p className="text-xs text-red-600">
                                Fine: ₦{s.fineAmount.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs text-red-400 mt-0.5">
                              Issued: {s.issuedAt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {c.appeals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Appeals Submitted
                    </p>
                    <div className="space-y-2">
                      {c.appeals.map((a) => (
                        <div
                          key={a.id}
                          className="bg-white border rounded-lg p-3"
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
                          <p className="text-xs text-slate-500">
                            {a.statement}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Submitted: {a.submittedAt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Appeal Dialog */}
      <Dialog open={!!showAppeal} onOpenChange={() => setShowAppeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-600" />
              Submit Appeal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Appeal</Label>
              <Input
                className="mt-1"
                placeholder="Briefly state your grounds for appeal"
                value={appealForm.reason}
                onChange={(e) =>
                  setAppealForm((f) => ({ ...f, reason: e.target.value }))
                }
                data-ocid="disciplinary.appeal-reason.input"
              />
            </div>
            <div>
              <Label>Supporting Statement</Label>
              <Textarea
                className="mt-1"
                rows={5}
                placeholder="Provide a detailed explanation of why you believe the case outcome should be reviewed..."
                value={appealForm.statement}
                onChange={(e) =>
                  setAppealForm((f) => ({ ...f, statement: e.target.value }))
                }
                data-ocid="disciplinary.appeal-statement.textarea"
              />
            </div>
            <p className="text-xs text-slate-400">
              Your appeal will be reviewed by the Disciplinary Committee. You
              will be notified of the outcome.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAppeal(null)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => showAppeal && handleSubmitAppeal(showAppeal)}
              data-ocid="disciplinary.confirm-appeal.btn"
            >
              <Send size={14} className="mr-2" />
              Submit Appeal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
