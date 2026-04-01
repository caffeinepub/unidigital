import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";

interface AppraisalEntry {
  id: string;
  period: string;
  kpis: string;
  achievements: string;
  assessment: string;
  targets: string;
  submittedAt: string;
  status: string;
}

const prevAppraisals: AppraisalEntry[] = [
  {
    id: "SA001",
    period: "2024 Annual",
    kpis: "Course delivery, research papers, student pass rate",
    achievements:
      "Published 2 journal papers; 92% student pass rate; Developed new CSC305 curriculum.",
    assessment:
      "I have consistently met my targets in teaching and research. The new curriculum for CSC305 was well-received.",
    targets:
      "Publish 3 papers next year; Introduce AI module to undergraduate curriculum.",
    submittedAt: "2025-01-15",
    status: "finalized",
  },
  {
    id: "SA002",
    period: "2024 Mid-Year",
    kpis: "Attendance, course delivery, student feedback",
    achievements: "Zero absenteeism; Received 4.6/5 student feedback rating.",
    assessment:
      "On track with all KPIs. Student engagement has been high this semester.",
    targets: "Improve tutorial sessions; Mentor 2 final year project students.",
    submittedAt: "2024-07-10",
    status: "reviewed",
  },
];

export function AppraisalSelf() {
  const [form, setForm] = useState({
    period: "",
    kpis: "",
    achievements: "",
    assessment: "",
    targets: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<typeof form | null>(null);

  const handleSubmit = () => {
    if (!form.period || !form.assessment) return;
    setSubmittedData(form);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmittedData(null);
    setForm({
      period: "",
      kpis: "",
      achievements: "",
      assessment: "",
      targets: "",
    });
  };

  const statusStyle: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-700",
    reviewed: "bg-blue-100 text-blue-700",
    finalized: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Self-Appraisal</h1>
        <p className="text-slate-500 text-sm">
          Submit your periodic self-appraisal report
        </p>
      </div>

      {/* Form or success state */}
      {!submitted ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              New Appraisal Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Appraisal Period</Label>
              <Select
                value={form.period}
                onValueChange={(v) => setForm((f) => ({ ...f, period: v }))}
              >
                <SelectTrigger className="mt-1" data-ocid="appraisal.select">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025 Annual">2025 Annual</SelectItem>
                  <SelectItem value="2025 Mid-Year">2025 Mid-Year</SelectItem>
                  <SelectItem value="2026 Annual">2026 Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Key Performance Indicators (KPIs)</Label>
              <Textarea
                className="mt-1"
                rows={3}
                placeholder="List your main KPIs for this period (e.g. course delivery, research output, student pass rate)"
                value={form.kpis}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kpis: e.target.value }))
                }
                data-ocid="appraisal.textarea"
              />
            </div>

            <div>
              <Label>Key Achievements</Label>
              <Textarea
                className="mt-1"
                rows={3}
                placeholder="Describe specific achievements, publications, initiatives, or milestones this period"
                value={form.achievements}
                onChange={(e) =>
                  setForm((f) => ({ ...f, achievements: e.target.value }))
                }
                data-ocid="appraisal.textarea"
              />
            </div>

            <div>
              <Label>Self-Assessment</Label>
              <Textarea
                className="mt-1"
                rows={4}
                placeholder="Provide an honest assessment of your performance against your goals"
                value={form.assessment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assessment: e.target.value }))
                }
                data-ocid="appraisal.textarea"
              />
            </div>

            <div>
              <Label>Targets for Next Period</Label>
              <Textarea
                className="mt-1"
                rows={3}
                placeholder="What are your goals and targets for the upcoming appraisal period?"
                value={form.targets}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targets: e.target.value }))
                }
                data-ocid="appraisal.textarea"
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!form.period || !form.assessment}
              onClick={handleSubmit}
              data-ocid="appraisal.submit_button"
            >
              Submit Appraisal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200" data-ocid="appraisal.success_state">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-500" size={28} />
              <div>
                <h3 className="font-semibold text-slate-800">
                  Appraisal Submitted Successfully
                </h3>
                <p className="text-sm text-slate-500">
                  Your self-appraisal for{" "}
                  <strong>{submittedData?.period}</strong> has been submitted to
                  HR.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Period:</span>{" "}
                <span className="font-medium">{submittedData?.period}</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs ml-1">
                  Submitted
                </Badge>
              </div>
              <div>
                <span className="text-slate-500">Self-Assessment:</span>
                <p className="mt-1 text-slate-700">
                  {submittedData?.assessment}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleReset}
              data-ocid="appraisal.secondary_button"
            >
              Submit Another Appraisal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous appraisals */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">
          Previous Submissions
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table data-ocid="appraisal.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>KPIs</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prevAppraisals.map((a, i) => (
                  <TableRow key={a.id} data-ocid={`appraisal.item.${i + 1}`}>
                    <TableCell className="font-medium">{a.period}</TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-xs truncate">
                      {a.kpis}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {a.submittedAt}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusStyle[a.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {a.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
