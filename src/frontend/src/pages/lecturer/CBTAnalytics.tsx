import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { type Exam, type Submission, useCBT } from "../../contexts/CBTContext";

const diffColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

function getBellCurveData(submissions: Submission[], totalMarks: number) {
  const buckets: Record<string, number> = {
    "0–20%": 0,
    "21–40%": 0,
    "41–50%": 0,
    "51–60%": 0,
    "61–70%": 0,
    "71–80%": 0,
    "81–90%": 0,
    "91–100%": 0,
  };
  for (const s of submissions) {
    const pct = (s.score / totalMarks) * 100;
    if (pct <= 20) buckets["0–20%"]++;
    else if (pct <= 40) buckets["21–40%"]++;
    else if (pct <= 50) buckets["41–50%"]++;
    else if (pct <= 60) buckets["51–60%"]++;
    else if (pct <= 70) buckets["61–70%"]++;
    else if (pct <= 80) buckets["71–80%"]++;
    else if (pct <= 90) buckets["81–90%"]++;
    else buckets["91–100%"]++;
  }
  return buckets;
}

function getItemAnalysis(exam: Exam, submissions: Submission[]) {
  return exam.questions.map((q) => {
    const total = submissions.length;
    const correct = submissions.filter(
      (s) => s.answers[q.id] === q.correct,
    ).length;
    const facilityIndex = total > 0 ? correct / total : 0;
    // Discrimination: top 27% vs bottom 27%
    const sorted = [...submissions].sort((a, b) => b.score - a.score);
    const cutoff = Math.ceil(total * 0.27);
    const top = sorted.slice(0, cutoff);
    const bottom = sorted.slice(-cutoff);
    const topCorrect = top.filter((s) => s.answers[q.id] === q.correct).length;
    const bottomCorrect = bottom.filter(
      (s) => s.answers[q.id] === q.correct,
    ).length;
    const discriminationIndex =
      cutoff > 0 ? (topCorrect - bottomCorrect) / cutoff : 0;
    return {
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      topic: q.topic,
      facilityIndex: Math.round(facilityIndex * 100),
      discriminationIndex: Math.round(discriminationIndex * 100) / 100,
      correct,
      total,
    };
  });
}

interface ResitCandidate {
  studentId: string;
  studentName: string;
  firstScore: number;
  totalMarks: number;
  firstPct: number;
  resitScore: number | null;
  resitPct: number | null;
  improved: boolean;
  attempts: number;
}

function getResitCandidates(
  exam: Exam,
  submissions: Submission[],
): ResitCandidate[] {
  const examSubs = submissions.filter((s) => s.examId === exam.id);
  const studentMap = new Map<string, Submission[]>();
  for (const s of examSubs) {
    const existing = studentMap.get(s.studentId) ?? [];
    studentMap.set(s.studentId, [...existing, s]);
  }
  const candidates: ResitCandidate[] = [];
  studentMap.forEach((subs, studentId) => {
    const sorted = [...subs].sort((a, b) => a.attempt - b.attempt);
    const first = sorted[0];
    const resit = sorted.find((s) => s.attempt > 1) ?? null;
    const firstPct = Math.round((first.score / first.totalMarks) * 100);
    const failed = firstPct < exam.passThreshold;
    if (failed || resit) {
      candidates.push({
        studentId,
        studentName: first.studentName,
        firstScore: first.score,
        totalMarks: first.totalMarks,
        firstPct,
        resitScore: resit?.score ?? null,
        resitPct: resit
          ? Math.round((resit.score / resit.totalMarks) * 100)
          : null,
        improved: resit ? resit.score > first.score : false,
        attempts: sorted.length,
      });
    }
  });
  return candidates;
}

export function CBTAnalytics() {
  const { exams, submissions, setStatus, updatePassThreshold } = useCBT();
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id ?? "");
  const [newThreshold, setNewThreshold] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const exam = exams.find((e) => e.id === selectedExamId);
  const examSubs = submissions.filter(
    (s) => s.examId === selectedExamId && s.attempt === 1,
  );
  const allExamSubs = submissions.filter((s) => s.examId === selectedExamId);

  if (!exam)
    return (
      <Card>
        <CardContent
          className="p-12 text-center text-muted-foreground"
          data-ocid="cbt_analytics.empty_state"
        >
          Select an exam to view analytics.
        </CardContent>
      </Card>
    );

  const avgScore =
    examSubs.length > 0
      ? Math.round(
          examSubs.reduce((s, sub) => s + sub.score, 0) / examSubs.length,
        )
      : 0;
  const avgPct =
    exam.totalMarks > 0 ? Math.round((avgScore / exam.totalMarks) * 100) : 0;
  const passCount = examSubs.filter(
    (s) => Math.round((s.score / s.totalMarks) * 100) >= exam.passThreshold,
  ).length;
  const passRate =
    examSubs.length > 0 ? Math.round((passCount / examSubs.length) * 100) : 0;
  const highScore =
    examSubs.length > 0 ? Math.max(...examSubs.map((s) => s.score)) : 0;
  const lowScore =
    examSubs.length > 0 ? Math.min(...examSubs.map((s) => s.score)) : 0;

  const bellCurve = getBellCurveData(examSubs, exam.totalMarks);
  const maxBucket = Math.max(...Object.values(bellCurve), 1);
  const itemAnalysis = getItemAnalysis(exam, examSubs);
  const resitCandidates = getResitCandidates(exam, allExamSubs);

  const handleThresholdUpdate = () => {
    const t = Number(newThreshold);
    if (Number.isNaN(t) || t < 0 || t > 100) {
      toast.error("Threshold must be 0–100");
      return;
    }
    updatePassThreshold(exam.id, t);
    setNewThreshold("");
    toast.success(`Pass threshold updated to ${t}%`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            CBT Analytics & Re-sit Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bell-curve analytics, question item analysis, and re-sit management.
          </p>
        </div>
        <div className="w-72">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger data-ocid="cbt_analytics.select">
              <SelectValue placeholder="Select exam..." />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.title} ({e.courseCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">{examSubs.length}</p>
            <p className="text-xs text-muted-foreground">Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p
              className={`text-xl font-bold ${passRate >= 60 ? "text-green-600" : "text-red-500"}`}
            >
              {passRate}%
            </p>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{avgPct}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-green-600">
                {highScore}
              </span>
              <span className="text-xs text-muted-foreground">—</span>
              <span className="text-sm font-bold text-red-500">{lowScore}</span>
            </div>
            <p className="text-xs text-muted-foreground">High — Low</p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Config */}
      <Card className="border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Settings size={16} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                Pass Threshold:{" "}
                <span className="text-primary">{exam.passThreshold}%</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Students scoring below this threshold are eligible for re-sit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="h-8 w-20 text-sm"
                type="number"
                placeholder={String(exam.passThreshold)}
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                data-ocid="cbt_analytics.threshold_input"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleThresholdUpdate}
                data-ocid="cbt_analytics.update_threshold_button"
              >
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bellcurve">
        <TabsList className="mb-4">
          <TabsTrigger value="bellcurve" data-ocid="cbt_analytics.tab">
            <BarChart3 size={14} className="mr-1" /> Bell Curve
          </TabsTrigger>
          <TabsTrigger value="items" data-ocid="cbt_analytics.tab">
            <BookOpen size={14} className="mr-1" /> Item Analysis
          </TabsTrigger>
          <TabsTrigger value="resit" data-ocid="cbt_analytics.tab">
            <RefreshCw size={14} className="mr-1" /> Re-sit Management
          </TabsTrigger>
          <TabsTrigger value="scores" data-ocid="cbt_analytics.tab">
            <Users size={14} className="mr-1" /> Score Distribution
          </TabsTrigger>
        </TabsList>

        {/* Bell Curve */}
        <TabsContent value="bellcurve" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 size={15} /> Score Distribution — Bell Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(bellCurve).map(([range, count]) => {
                  const pct =
                    maxBucket > 0 ? Math.round((count / maxBucket) * 100) : 0;
                  const isPassZone =
                    Number.parseInt(range) > exam.passThreshold;
                  return (
                    <div key={range} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">
                        {range}
                      </span>
                      <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${isPassZone ? "bg-green-500" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8 text-right flex-shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-400 inline-block" />{" "}
                  Below pass threshold
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500 inline-block" />{" "}
                  Passing range
                </span>
              </div>
              <div className="mt-4 p-3 bg-muted rounded text-xs space-y-1">
                <p className="font-semibold text-foreground">
                  Bell-Curve Statistics
                </p>
                <p>
                  Mean: {avgScore}/{exam.totalMarks} ({avgPct}%)
                </p>
                <p>Pass threshold: {exam.passThreshold}%</p>
                <p>
                  Students below threshold:{" "}
                  {
                    examSubs.filter(
                      (s) =>
                        Math.round((s.score / s.totalMarks) * 100) <
                        exam.passThreshold,
                    ).length
                  }{" "}
                  of {examSubs.length}
                </p>
                <p>
                  Percentile at pass mark: {passRate}th percentile of cohort
                  passes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Item Analysis */}
        <TabsContent value="items" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Facility Index: proportion of students answering correctly.
            Discrimination Index: ability to distinguish high/low performers.
          </p>
          {itemAnalysis.map((item, i) => (
            <Card key={item.id} data-ocid={`cbt_analytics.item.${i + 1}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.id.toUpperCase()}
                      </span>
                      <Badge
                        className={`border-0 text-xs ${diffColor[item.difficulty]}`}
                      >
                        {item.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.topic}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-left hover:text-primary transition-colors"
                      onClick={() =>
                        setExpandedQuestion(
                          expandedQuestion === item.id ? null : item.id,
                        )
                      }
                    >
                      {item.text}
                      {expandedQuestion === item.id ? (
                        <ChevronUp size={13} className="inline ml-1" />
                      ) : (
                        <ChevronDown size={13} className="inline ml-1" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-4 flex-shrink-0 text-center text-xs">
                    <div>
                      <p
                        className={`text-base font-bold ${item.facilityIndex >= 70 ? "text-green-600" : item.facilityIndex >= 40 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {item.facilityIndex}%
                      </p>
                      <p className="text-muted-foreground">Facility</p>
                    </div>
                    <div>
                      <p
                        className={`text-base font-bold ${item.discriminationIndex >= 0.3 ? "text-green-600" : item.discriminationIndex >= 0.1 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {item.discriminationIndex.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">Discrimination</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">
                        {item.correct}/{item.total}
                      </p>
                      <p className="text-muted-foreground">Correct</p>
                    </div>
                  </div>
                </div>
                {expandedQuestion === item.id && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted-foreground">
                    <p>
                      Facility Index {item.facilityIndex}% —{" "}
                      {item.facilityIndex < 30
                        ? "⚠ Very hard — consider reviewing question clarity"
                        : item.facilityIndex > 85
                          ? "⚠ Very easy — may need replacement"
                          : "✓ Good difficulty level"}
                    </p>
                    <p>
                      Discrimination Index {item.discriminationIndex.toFixed(2)}{" "}
                      —{" "}
                      {item.discriminationIndex < 0.1
                        ? "⚠ Poor discrimination — question may need revision"
                        : item.discriminationIndex >= 0.3
                          ? "✓ Good discrimination"
                          : "ℹ Acceptable discrimination"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Re-sit Management */}
        <TabsContent value="resit" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              {resitCandidates.filter((c) => c.resitScore === null).length}{" "}
              student(s) eligible for re-sit •{" "}
              {resitCandidates.filter((c) => c.resitScore !== null).length} have
              completed re-sit
            </p>
            {exam.status === "closed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatus(exam.id, "active");
                  toast.success("Exam reopened for re-sits");
                }}
                data-ocid="cbt_analytics.reopen_button"
              >
                <RefreshCw size={13} className="mr-1" /> Reopen for Re-sit
              </Button>
            )}
          </div>

          {resitCandidates.length === 0 ? (
            <Card>
              <CardContent
                className="p-8 text-center text-muted-foreground"
                data-ocid="cbt_analytics.empty_state"
              >
                No re-sit candidates for this exam.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-muted border-b">
                      <tr>
                        {[
                          "Student",
                          "Matric",
                          "1st Score",
                          "1st %",
                          "Re-sit Score",
                          "Re-sit %",
                          "Improvement",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resitCandidates.map((c, i) => (
                        <tr
                          key={c.studentId}
                          className="border-b last:border-0 hover:bg-muted/40"
                          data-ocid={`cbt_analytics.resit_row.${i + 1}`}
                        >
                          <td className="px-3 py-3 text-sm font-medium">
                            {c.studentName}
                          </td>
                          <td className="px-3 py-3 text-xs font-mono text-primary">
                            {c.studentId}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            {c.firstScore}/{c.totalMarks}
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              className={`border-0 text-xs ${c.firstPct >= exam.passThreshold ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {c.firstPct}%
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-sm">
                            {c.resitScore !== null ? (
                              `${c.resitScore}/${c.totalMarks}`
                            ) : (
                              <span className="text-muted-foreground">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {c.resitPct !== null ? (
                              <Badge
                                className={`border-0 text-xs ${c.resitPct >= exam.passThreshold ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                              >
                                {c.resitPct}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {c.resitPct !== null ? (
                              <span
                                className={`text-xs font-medium flex items-center gap-1 ${c.improved ? "text-green-600" : "text-red-500"}`}
                              >
                                {c.improved ? <TrendingUp size={12} /> : null}
                                {c.resitPct - c.firstPct > 0
                                  ? `+${c.resitPct - c.firstPct}%`
                                  : `${c.resitPct - c.firstPct}%`}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {c.resitScore === null ? (
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                Eligible
                              </Badge>
                            ) : c.resitPct !== null &&
                              c.resitPct >= exam.passThreshold ? (
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                ✓ Passed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                Still Failing
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Re-sit trend */}
          {resitCandidates.filter((c) => c.resitScore !== null).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp size={15} /> Re-sit Improvement Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted rounded p-3">
                    <p className="text-xl font-bold text-green-600">
                      {resitCandidates.filter((c) => c.improved).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Improved</p>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <p className="text-xl font-bold text-primary">
                      {
                        resitCandidates.filter(
                          (c) =>
                            c.resitPct !== null &&
                            c.resitPct >= exam.passThreshold,
                        ).length
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Passed on Re-sit
                    </p>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <p className="text-xl font-bold text-red-500">
                      {
                        resitCandidates.filter(
                          (c) =>
                            c.resitPct !== null &&
                            c.resitPct < exam.passThreshold,
                        ).length
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Still Failing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Score Distribution Table */}
        <TabsContent value="scores">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-muted border-b">
                    <tr>
                      {[
                        "Student",
                        "Matric",
                        "Score",
                        "Percentage",
                        "Attempt",
                        "Percentile",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...examSubs]
                      .sort((a, b) => b.score - a.score)
                      .map((s, i) => {
                        const pct = Math.round((s.score / s.totalMarks) * 100);
                        const percentile = Math.round(
                          ((examSubs.length - i) / examSubs.length) * 100,
                        );
                        const passed = pct >= exam.passThreshold;
                        return (
                          <tr
                            key={`${s.studentId}-${i}`}
                            className="border-b last:border-0 hover:bg-muted/40"
                            data-ocid={`cbt_analytics.score_row.${i + 1}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium">
                              {s.studentName}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-primary">
                              {s.studentId}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {s.score}/{s.totalMarks}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={`border-0 text-xs ${pct >= 70 ? "bg-green-100 text-green-700" : pct >= exam.passThreshold ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                              >
                                {pct}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              Attempt {s.attempt}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {percentile}th
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={`border-0 text-xs ${passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                              >
                                {passed ? "Pass" : "Fail"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
