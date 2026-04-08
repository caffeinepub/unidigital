import { BarChart3, Medal, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useCBT } from "../../contexts/CBTContext";

interface ScoreBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  grade: string;
}

const GRADE_BOUNDARIES = [
  { min: 0, max: 39, grade: "F", color: "bg-red-500" },
  { min: 40, max: 49, grade: "E", color: "bg-orange-400" },
  { min: 50, max: 59, grade: "D", color: "bg-amber-400" },
  { min: 60, max: 69, grade: "C", color: "bg-yellow-400" },
  { min: 70, max: 79, grade: "B", color: "bg-blue-400" },
  { min: 80, max: 100, grade: "A", color: "bg-green-500" },
];

function getGradeForScore(score: number, totalMarks: number): string {
  const pct = (score / totalMarks) * 100;
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  if (pct >= 40) return "E";
  return "F";
}

function getDifficultyTag(correctRate: number): {
  label: string;
  style: string;
} {
  if (correctRate >= 70)
    return { label: "Easy", style: "bg-green-100 text-green-700" };
  if (correctRate >= 40)
    return { label: "Medium", style: "bg-amber-100 text-amber-700" };
  return { label: "Hard", style: "bg-red-100 text-red-700" };
}

export function CBTAnalytics() {
  const { exams, submissions } = useCBT();
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id ?? "");

  const exam = exams.find((e) => e.id === selectedExamId);
  const examSubmissions = submissions.filter(
    (s) => s.examId === selectedExamId,
  );

  const analytics = useMemo(() => {
    if (!exam || examSubmissions.length === 0) return null;

    const scores = examSubmissions.map((s) => s.score);
    const percentages = scores.map((sc) =>
      Math.round((sc / exam.totalMarks) * 100),
    );

    const avg = Math.round(
      percentages.reduce((a, b) => a + b, 0) / percentages.length,
    );
    const sorted = [...percentages].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    const passRate = Math.round(
      (percentages.filter((p) => p >= 40).length / percentages.length) * 100,
    );

    const mean = avg;
    const variance =
      percentages.reduce((s, p) => s + (p - mean) ** 2, 0) / percentages.length;
    const stdDev = Math.round(Math.sqrt(variance));

    // Build buckets 0-9, 10-19, ... 90-100
    const buckets: ScoreBucket[] = Array.from({ length: 10 }, (_, i) => {
      const min = i * 10;
      const max = i === 9 ? 100 : i * 10 + 9;
      const count = percentages.filter((p) => p >= min && p <= max).length;
      const midScore = (min + max) / 2;
      const grade =
        midScore >= 80
          ? "A"
          : midScore >= 70
            ? "B"
            : midScore >= 60
              ? "C"
              : midScore >= 50
                ? "D"
                : midScore >= 40
                  ? "E"
                  : "F";
      return { label: `${min}–${max}`, min, max, count, grade };
    });

    const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);

    // Per-question difficulty
    const questionDifficulty = exam.questions.map((q) => {
      const correctCount = examSubmissions.filter(
        (s) => s.answers[q.id] === q.correct,
      ).length;
      const correctRate = examSubmissions.length
        ? Math.round((correctCount / examSubmissions.length) * 100)
        : 0;
      return {
        question: q,
        correctRate,
        difficulty: getDifficultyTag(correctRate),
      };
    });

    // Top 3
    const top3 = [...examSubmissions]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      avg,
      median,
      highest,
      lowest,
      passRate,
      stdDev,
      buckets,
      maxBucketCount,
      questionDifficulty,
      top3,
    };
  }, [exam, examSubmissions]);

  const gradeColor: Record<string, string> = {
    A: "bg-green-500",
    B: "bg-blue-400",
    C: "bg-yellow-400",
    D: "bg-amber-400",
    E: "bg-orange-400",
    F: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CBT Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Score distribution and question-level performance
          </p>
        </div>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger
            className="w-[260px]"
            data-ocid="cbt-analytics.exam_select"
          >
            <SelectValue placeholder="Select exam" />
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

      {!exam && (
        <Card>
          <CardContent
            className="py-12 text-center text-slate-400"
            data-ocid="cbt-analytics.empty_state"
          >
            No exams available. Create an exam to view analytics.
          </CardContent>
        </Card>
      )}

      {exam && examSubmissions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No submissions yet for <strong>{exam.title}</strong>.
          </CardContent>
        </Card>
      )}

      {exam && analytics && (
        <>
          {/* Stats Panel */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              {
                label: "Average",
                value: `${analytics.avg}%`,
                color: "text-blue-600",
              },
              {
                label: "Median",
                value: `${analytics.median}%`,
                color: "text-purple-600",
              },
              {
                label: "Std Dev",
                value: `±${analytics.stdDev}`,
                color: "text-slate-600",
              },
              {
                label: "Pass Rate",
                value: `${analytics.passRate}%`,
                color:
                  analytics.passRate >= 50 ? "text-green-600" : "text-red-600",
              },
              {
                label: "Highest",
                value: `${analytics.highest}%`,
                color: "text-green-600",
              },
              {
                label: "Lowest",
                value: `${analytics.lowest}%`,
                color: "text-red-600",
              },
            ].map(({ label, value, color }) => (
              <Card key={label} className="border-0 bg-slate-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Histogram */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 size={16} className="text-slate-400" />
                Score Distribution ({examSubmissions.length} submissions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40 mt-2">
                {analytics.buckets.map((bucket) => {
                  const heightPct =
                    analytics.maxBucketCount > 0
                      ? Math.round(
                          (bucket.count / analytics.maxBucketCount) * 100,
                        )
                      : 0;
                  const gb = GRADE_BOUNDARIES.find(
                    (g) => bucket.min >= g.min && bucket.min <= g.max,
                  );
                  return (
                    <div
                      key={bucket.label}
                      className="flex flex-col items-center gap-1 flex-1"
                      data-ocid={`cbt-analytics.bucket.${bucket.label}`}
                    >
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {bucket.count > 0 ? bucket.count : ""}
                      </span>
                      <div
                        className="w-full rounded-t flex flex-col justify-end"
                        style={{ height: "120px" }}
                      >
                        <div
                          className={`w-full rounded-t transition-all ${gb?.color ?? "bg-slate-300"}`}
                          style={{
                            height: `${Math.max(heightPct, bucket.count > 0 ? 8 : 2)}%`,
                          }}
                          title={`${bucket.label}%: ${bucket.count} students`}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap">
                        {bucket.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Grade boundary legend */}
              <div className="flex flex-wrap gap-2 mt-4 border-t pt-3">
                {GRADE_BOUNDARIES.map((g) => (
                  <div
                    key={g.grade}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span className={`w-3 h-3 rounded-sm ${g.color}`} />
                    <span className="text-slate-500">
                      {g.grade}: {g.min}–{g.max}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Per-Question Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp size={16} className="text-slate-400" />
                  Question Difficulty Index
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">
                        Q#
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">
                        Question
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500">
                        Correct %
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500">
                        Difficulty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.questionDifficulty.map((qd, i) => (
                      <tr
                        key={qd.question.id}
                        className="border-b last:border-0"
                        data-ocid={`cbt-analytics.question.${i + 1}`}
                      >
                        <td className="px-4 py-2.5 font-semibold text-slate-500">
                          {i + 1}
                        </td>
                        <td
                          className="px-4 py-2.5 text-xs text-slate-700 max-w-[160px] truncate"
                          title={qd.question.text}
                        >
                          {qd.question.text}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">
                          {qd.correctRate}%
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge
                            className={`border-0 text-xs ${qd.difficulty.style}`}
                          >
                            {qd.difficulty.label}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Medal size={16} className="text-amber-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.top3.map((sub, i) => {
                    const pct = Math.round((sub.score / sub.totalMarks) * 100);
                    const grade = getGradeForScore(sub.score, sub.totalMarks);
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={`${sub.studentId}-${i}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                        data-ocid={`cbt-analytics.top.${i + 1}`}
                      >
                        <span className="text-2xl">{medals[i]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {sub.studentName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {sub.studentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">
                            {sub.score}/{sub.totalMarks}
                          </p>
                          <p className="text-xs text-slate-500">{pct}%</p>
                          <Badge
                            className={`border-0 mt-0.5 text-xs ${gradeColor[grade]} text-white`}
                          >
                            {grade}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {analytics.top3.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-4">
                      No submissions yet.
                    </p>
                  )}
                </div>

                {/* Class comparison note */}
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700">
                    Class Summary
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {examSubmissions.length} student
                    {examSubmissions.length !== 1 ? "s" : ""} sat this exam.
                    Average score: <strong>{analytics.avg}%</strong>. Pass rate:{" "}
                    <strong>{analytics.passRate}%</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
