import { Calendar, CheckSquare, RefreshCw, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { type Submission, useCBT } from "../../contexts/CBTContext";

interface ResitRecord {
  studentId: string;
  studentName: string;
  firstScore: number;
  firstPct: number;
  firstGrade: string;
  resitScore?: number;
  resitPct?: number;
  resitGrade?: string;
  improvement?: number;
  gradeChange?: string;
  eligible: boolean;
}

interface ResitSchedule {
  examId: string;
  date: string;
  time: string;
  venue: string;
  duration: number;
}

function getGradeFromPct(pct: number): string {
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  if (pct >= 40) return "E";
  return "F";
}

function getGradeBadgeStyle(grade: string): string {
  const map: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-amber-100 text-amber-700",
    E: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  };
  return map[grade] ?? "bg-slate-100 text-slate-700";
}

// Seeded re-sit results for demo
const SEED_RESIT_RESULTS: Record<
  string,
  { studentId: string; score: number; totalMarks: number }[]
> = {
  exam001: [{ studentId: "CSC/2021/002", score: 22, totalMarks: 50 }],
};

export function CBTResitManager() {
  const { exams, submissions } = useCBT();
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id ?? "");
  const [eligibleMap, setEligibleMap] = useState<Record<string, boolean>>({});
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    venue: "",
    duration: 30,
  });
  const [schedules, setSchedules] = useState<ResitSchedule[]>([]);
  const [resitResults] = useState(SEED_RESIT_RESULTS);

  const exam = exams.find((e) => e.id === selectedExamId);
  const examSubs = submissions.filter((s) => s.examId === selectedExamId);

  const resitRecords = useMemo<ResitRecord[]>(() => {
    if (!exam) return [];
    const seedResits = resitResults[selectedExamId] ?? [];
    return examSubs.map((sub) => {
      const pct = Math.round((sub.score / sub.totalMarks) * 100);
      const firstGrade = getGradeFromPct(pct);
      const resitAttempt = seedResits.find(
        (r) => r.studentId === sub.studentId,
      );
      const resitPct = resitAttempt
        ? Math.round((resitAttempt.score / resitAttempt.totalMarks) * 100)
        : undefined;
      const resitGrade =
        resitPct !== undefined ? getGradeFromPct(resitPct) : undefined;
      const improvement = resitPct !== undefined ? resitPct - pct : undefined;
      const gradeChange =
        resitGrade && firstGrade !== resitGrade
          ? `${firstGrade}→${resitGrade}`
          : undefined;
      return {
        studentId: sub.studentId,
        studentName: sub.studentName,
        firstScore: sub.score,
        firstPct: pct,
        firstGrade,
        resitScore: resitAttempt?.score,
        resitPct,
        resitGrade,
        improvement,
        gradeChange,
        eligible: eligibleMap[sub.studentId] ?? pct < 40,
      };
    });
  }, [exam, examSubs, eligibleMap, resitResults, selectedExamId]);

  const failedStudents = resitRecords.filter((r) => r.firstPct < 40);
  const eligibleForResit = resitRecords.filter((r) => r.eligible);

  const summary = useMemo(() => {
    const withResit = resitRecords.filter((r) => r.resitPct !== undefined);
    if (withResit.length === 0) return null;
    const avgImprovement = Math.round(
      withResit.reduce((s, r) => s + (r.improvement ?? 0), 0) /
        withResit.length,
    );
    const passAfterResit = withResit.filter(
      (r) => (r.resitPct ?? 0) >= 40,
    ).length;
    return { total: withResit.length, avgImprovement, passAfterResit };
  }, [resitRecords]);

  const toggleEligible = (studentId: string) => {
    setEligibleMap((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const markAllEligible = () => {
    const updates: Record<string, boolean> = {};
    for (const r of failedStudents) {
      updates[r.studentId] = true;
    }
    setEligibleMap((prev) => ({ ...prev, ...updates }));
    toast.success(
      `${failedStudents.length} student${failedStudents.length !== 1 ? "s" : ""} marked as re-sit eligible.`,
    );
  };

  const saveSchedule = () => {
    if (!scheduleForm.date || !scheduleForm.venue) {
      toast.error("Please fill date and venue.");
      return;
    }
    const schedule: ResitSchedule = { examId: selectedExamId, ...scheduleForm };
    setSchedules((prev) => {
      const existing = prev.findIndex((s) => s.examId === selectedExamId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = schedule;
        return updated;
      }
      return [...prev, schedule];
    });
    setScheduleDialog(false);
    toast.success("Re-sit schedule saved.");
  };

  const currentSchedule = schedules.find((s) => s.examId === selectedExamId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Re-sit Manager</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage exam re-sits, eligibility, and improvement tracking
          </p>
        </div>
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger
            className="w-[260px]"
            data-ocid="cbt-resit.exam_select"
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
            data-ocid="cbt-resit.empty_state"
          >
            No exams available.
          </CardContent>
        </Card>
      )}

      {exam && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-slate-50 border-0">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-slate-400 uppercase">Total Sat</p>
                <p className="text-2xl font-bold text-slate-700 mt-0.5">
                  {examSubs.length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-0">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-red-400 uppercase">
                  Failed (&lt;40%)
                </p>
                <p className="text-2xl font-bold text-red-600 mt-0.5">
                  {failedStudents.length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-0">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-amber-500 uppercase">
                  Re-sit Eligible
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-0.5">
                  {eligibleForResit.length}
                </p>
              </CardContent>
            </Card>
            <Card
              className={`border-0 ${summary ? "bg-green-50" : "bg-slate-50"}`}
            >
              <CardContent className="p-4 text-center">
                <p
                  className={`text-xs uppercase ${summary ? "text-green-500" : "text-slate-400"}`}
                >
                  Pass After Re-sit
                </p>
                <p
                  className={`text-2xl font-bold mt-0.5 ${summary ? "text-green-600" : "text-slate-400"}`}
                >
                  {summary ? summary.passAfterResit : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Panel */}
          <Card
            className={currentSchedule ? "border-green-200 bg-green-50" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  Re-sit Schedule
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScheduleDialog(true)}
                  data-ocid="cbt-resit.schedule_button"
                >
                  {currentSchedule ? "Edit Schedule" : "Set Schedule"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentSchedule ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="font-semibold">{currentSchedule.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="font-semibold">{currentSchedule.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Venue</p>
                    <p className="font-semibold">{currentSchedule.venue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="font-semibold">
                      {currentSchedule.duration} mins
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No re-sit scheduled for this exam yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Failed Students Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw size={16} className="text-slate-400" />
                  Students Eligible for Re-sit
                </CardTitle>
                {failedStudents.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllEligible}
                    data-ocid="cbt-resit.bulk_eligible_button"
                  >
                    <CheckSquare size={14} className="mr-1" />
                    Mark All Failed as Eligible
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {[
                        "Student",
                        "ID",
                        "1st Score",
                        "1st Grade",
                        "Eligible",
                        "Re-sit Score",
                        "Re-sit Grade",
                        "Improvement",
                        "Grade Change",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resitRecords.map((rec, i) => (
                      <tr
                        key={rec.studentId}
                        className="border-b last:border-0 hover:bg-slate-50"
                        data-ocid={`cbt-resit.row.${i + 1}`}
                      >
                        <td className="px-4 py-3 font-medium">
                          {rec.studentName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600">
                          {rec.studentId}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {rec.firstScore}/
                          {examSubs[0]?.totalMarks ?? exam.totalMarks}
                          <span className="text-slate-400 text-xs ml-1">
                            ({rec.firstPct}%)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border-0 ${getGradeBadgeStyle(rec.firstGrade)}`}
                          >
                            {rec.firstGrade}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className={`w-9 h-5 rounded-full transition-colors ${rec.eligible ? "bg-green-500" : "bg-slate-200"}`}
                            onClick={() => toggleEligible(rec.studentId)}
                            title="Toggle eligibility"
                            data-ocid={`cbt-resit.toggle.${rec.studentId}`}
                          >
                            <span
                              className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${rec.eligible ? "translate-x-4" : "translate-x-0"}`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {rec.resitScore !== undefined ? (
                            <span className="font-semibold">
                              {rec.resitScore}/
                              {examSubs[0]?.totalMarks ?? exam.totalMarks}
                              <span className="text-slate-400 text-xs ml-1">
                                ({rec.resitPct}%)
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {rec.resitGrade ? (
                            <Badge
                              className={`border-0 ${getGradeBadgeStyle(rec.resitGrade)}`}
                            >
                              {rec.resitGrade}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {rec.improvement !== undefined ? (
                            <span
                              className={`font-semibold ${rec.improvement >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {rec.improvement >= 0 ? "+" : ""}
                              {rec.improvement}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {rec.gradeChange ? (
                            <Badge className="bg-purple-100 text-purple-700 border-0 font-mono">
                              {rec.gradeChange}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {resitRecords.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-slate-400"
                        >
                          No submissions for this exam.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Re-sit Summary */}
          {summary && (
            <Card className="bg-green-50 border-green-100">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  Re-sit Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-green-500 uppercase">
                      Students Took Re-sit
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {summary.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-500 uppercase">
                      Avg Improvement
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      +{summary.avgImprovement}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-500 uppercase">
                      Pass Rate After Re-sit
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {summary.total
                        ? Math.round(
                            (summary.passAfterResit / summary.total) * 100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent
          className="max-w-sm"
          data-ocid="cbt-resit.schedule_dialog"
        >
          <DialogHeader>
            <DialogTitle>Set Re-sit Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={scheduleForm.date}
                onChange={(e) =>
                  setScheduleForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                className="mt-1"
                value={scheduleForm.time}
                onChange={(e) =>
                  setScheduleForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                className="mt-1"
                placeholder="e.g. CBT Centre Hall B"
                value={scheduleForm.venue}
                onChange={(e) =>
                  setScheduleForm((f) => ({ ...f, venue: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                className="mt-1"
                value={scheduleForm.duration}
                onChange={(e) =>
                  setScheduleForm((f) => ({ ...f, duration: +e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveSchedule}
              data-ocid="cbt-resit.save_schedule_button"
            >
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
