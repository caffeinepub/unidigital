import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

interface AppraisalEntry {
  id: string;
  staffName: string;
  staffId: string;
  department: string;
  role: string;
  selfScore: number;
  hodScore: number | null;
  comments: string;
  hodRemarks: string;
  status: "pending" | "reviewed";
  period: string;
}

const SEED: AppraisalEntry[] = [
  {
    id: "AP001",
    staffName: "Dr. Aminu Bello",
    staffId: "STAFF001",
    department: "Computer Science",
    role: "Lecturer",
    selfScore: 80,
    hodScore: null,
    comments: "I delivered all my courses and supervised 3 projects.",
    hodRemarks: "",
    status: "pending",
    period: "2023/2024",
  },
  {
    id: "AP002",
    staffName: "Dr. Ngozi Okafor",
    staffId: "STAFF002",
    department: "Computer Science",
    role: "Senior Lecturer",
    selfScore: 88,
    hodScore: null,
    comments: "Published 2 papers and taught 4 courses.",
    hodRemarks: "",
    status: "pending",
    period: "2023/2024",
  },
  {
    id: "AP003",
    staffName: "Mr. Kola Adeyemi",
    staffId: "STAFF003",
    department: "Mathematics",
    role: "Assistant Lecturer",
    selfScore: 72,
    hodScore: 75,
    comments: "Completed all assigned tasks.",
    hodRemarks: "Good performance, needs improvement in research.",
    status: "reviewed",
    period: "2023/2024",
  },
];

const LS_KEY = "unidigital_appraisals_hod";

function getAppraisals(): AppraisalEntry[] {
  try {
    const stored = localStorage.getItem(LS_KEY);
    return stored ? JSON.parse(stored) : SEED;
  } catch {
    return SEED;
  }
}

function saveAppraisals(data: AppraisalEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function AppraisalReview() {
  const [entries, setEntries] = useState<AppraisalEntry[]>(getAppraisals);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const submitReview = (id: string) => {
    const score = Number(scores[id]);
    if (!score || score < 0 || score > 100) {
      toast.error("Enter a valid score between 0 and 100");
      return;
    }
    const updated = entries.map((e) =>
      e.id === id
        ? {
            ...e,
            hodScore: score,
            hodRemarks: remarks[id] ?? "",
            status: "reviewed" as const,
          }
        : e,
    );
    setEntries(updated);
    saveAppraisals(updated);
    toast.success("Appraisal review submitted");
  };

  const pending = entries.filter((e) => e.status === "pending");
  const reviewed = entries.filter((e) => e.status === "reviewed");

  const scoreLabel = (score: number) => {
    if (score >= 90)
      return { label: "Outstanding", cls: "bg-green-100 text-green-700" };
    if (score >= 75)
      return { label: "Excellent", cls: "bg-blue-100 text-blue-700" };
    if (score >= 60)
      return { label: "Good", cls: "bg-amber-100 text-amber-700" };
    if (score >= 50)
      return { label: "Satisfactory", cls: "bg-orange-100 text-orange-700" };
    return { label: "Needs Improvement", cls: "bg-red-100 text-red-700" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Appraisal Review</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and score staff appraisal submissions for your department.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {pending.length}
            </p>
            <p className="text-sm text-slate-500">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {reviewed.length}
            </p>
            <p className="text-sm text-slate-500">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
            <p className="text-sm text-slate-500">Total Submissions</p>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Pending Reviews
          </h2>
          <div className="space-y-4">
            {pending.map((e, i) => (
              <Card key={e.id} data-ocid={`appraisal.item.${i + 1}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{e.staffName}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {e.staffId} &bull; {e.role} &bull; {e.department} &bull;{" "}
                        {e.period}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-slate-50 rounded p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Staff Self-Assessment
                    </p>
                    <p className="text-sm text-slate-700">{e.comments}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star size={14} className="text-amber-500" />
                      <span className="text-sm font-bold">
                        {e.selfScore}/100 (self)
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">HOD Score (0–100)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="mt-1 h-8"
                        value={scores[e.id] ?? ""}
                        onChange={(ev) =>
                          setScores((p) => ({ ...p, [e.id]: ev.target.value }))
                        }
                        data-ocid="appraisal.input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">HOD Remarks</Label>
                      <Textarea
                        className="mt-1 h-8 text-xs"
                        value={remarks[e.id] ?? ""}
                        onChange={(ev) =>
                          setRemarks((p) => ({ ...p, [e.id]: ev.target.value }))
                        }
                        data-ocid="appraisal.textarea"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => submitReview(e.id)}
                    data-ocid={`appraisal.submit_button.${i + 1}`}
                  >
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Reviewed
          </h2>
          <div className="space-y-3">
            {reviewed.map((e, i) => {
              const sl = scoreLabel(e.hodScore ?? 0);
              return (
                <Card key={e.id} data-ocid={`appraisal.row.${i + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{e.staffName}</p>
                        <p className="text-xs text-slate-500">
                          {e.role} &bull; Self: {e.selfScore} &bull; HOD:{" "}
                          {e.hodScore}
                        </p>
                      </div>
                      <Badge className={sl.cls}>{sl.label}</Badge>
                    </div>
                    {e.hodRemarks && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 rounded p-2">
                        {e.hodRemarks}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
