import { Download, GitMerge, Save } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  getGradeFromScore,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { downloadCSV } from "../../utils/csvUtils";
import type { CombinedResult } from "../../utils/sampleData";
import {
  getLocalCombinedCourses,
  getLocalCombinedResults,
  getLocalStudents,
  saveLocalCombinedResults,
} from "../../utils/sampleData";

const SEMESTERS = [
  "2023/2024 First",
  "2023/2024 Second",
  "2022/2023 First",
  "2022/2023 Second",
];

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-200 text-red-700",
  F: "bg-red-100 text-red-800",
};

export function CombinedResults() {
  const combinations = getLocalCombinedCourses();
  const students = getLocalStudents();
  const { gradeConfig } = useResultProcessing();

  const [selectedCombo, setSelectedCombo] = useState("");
  const [semester, setSemester] = useState("2023/2024 First");
  // scoreA[matric] and scoreB[matric]
  const [scoreA, setScoreA] = useState<Record<string, string>>({});
  const [scoreB, setScoreB] = useState<Record<string, string>>({});

  const combo = combinations.find((c) => c.id === selectedCombo);

  const getTotal = (matric: string): number => {
    if (!combo) return 0;
    const a = Number.parseFloat(scoreA[matric] ?? "0") || 0;
    const b = Number.parseFloat(scoreB[matric] ?? "0") || 0;
    return Math.round((combo.weightA * a) / 100 + (combo.weightB * b) / 100);
  };

  const handleSubmit = () => {
    if (!combo) return;
    const existing = getLocalCombinedResults().filter(
      (r) =>
        !(
          r.combinationCode === combo.combinationCode && r.semester === semester
        ),
    );
    const newResults: CombinedResult[] = students.map((s) => {
      const a = Number.parseFloat(scoreA[s.matricNumber] ?? "0") || 0;
      const b = Number.parseFloat(scoreB[s.matricNumber] ?? "0") || 0;
      const total = getTotal(s.matricNumber);
      const gradeEntry = getGradeFromScore(total, gradeConfig);
      return {
        id: `CRES-${combo.combinationCode}-${s.matricNumber}-${semester.replace(/ /g, "_")}`,
        combinationCode: combo.combinationCode,
        studentMatric: s.matricNumber,
        scoreA: a,
        scoreB: b,
        combinedTotal: total,
        grade: gradeEntry.grade,
        point: gradeEntry.point,
        remark: gradeEntry.remark,
        semester,
        session: "2023/2024",
        status: "submitted",
      };
    });
    saveLocalCombinedResults([...existing, ...newResults]);
    toast.success(`Combined results saved for ${combo.title} – ${semester}`);
  };

  const handleDownload = () => {
    if (!combo) return;
    const headers = [
      "Matric Number",
      "Student Name",
      `Score A – ${combo.componentA} (/${100})`,
      `Score B – ${combo.componentB} (/${100})`,
      `Combined Total (Weight: ${combo.weightA}% + ${combo.weightB}%)`,
      "Grade",
      "Grade Points",
      "Remark",
    ];
    const rows = students.map((s) => {
      const a = scoreA[s.matricNumber] ?? "0";
      const b = scoreB[s.matricNumber] ?? "0";
      const total = getTotal(s.matricNumber);
      const gradeEntry = getGradeFromScore(total, gradeConfig);
      return [
        s.matricNumber,
        s.name,
        a,
        b,
        String(total),
        gradeEntry.grade,
        String(gradeEntry.point),
        gradeEntry.remark,
      ];
    });
    downloadCSV(
      `combined-result-${combo.combinationCode}-${semester.replace(/ /g, "-")}.csv`,
      [headers, ...rows],
    );
    toast.success("Combined result sheet downloaded.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Combined Results</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter and generate combined course results for NCE and dual-subject
          programmes.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <Label>Combination</Label>
          <Select value={selectedCombo} onValueChange={setSelectedCombo}>
            <SelectTrigger className="mt-1" data-ocid="combined.select">
              <SelectValue placeholder="Choose combination..." />
            </SelectTrigger>
            <SelectContent>
              {combinations.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.combinationCode} – {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-52">
          <Label>Semester</Label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {combo && (
          <>
            <Button
              variant="outline"
              onClick={handleDownload}
              data-ocid="combined.secondary_button"
            >
              <Download size={16} className="mr-2" /> Download Sheet
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              data-ocid="combined.submit_button"
            >
              <Save size={16} className="mr-2" /> Submit Results
            </Button>
          </>
        )}
      </div>

      {combinations.length === 0 ? (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="combined.empty_state"
          >
            <GitMerge size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No combinations defined.</p>
            <p className="text-sm mt-1">
              Ask the admin to define combination courses first.
            </p>
          </CardContent>
        </Card>
      ) : !combo ? (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="combined.empty_state"
          >
            Select a combination and semester to enter scores.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {combo.title} — Score Entry
              <span className="ml-2 text-xs font-normal text-slate-500">
                (Component A: {combo.componentA} × {combo.weightA}% | Component
                B: {combo.componentB} × {combo.weightB}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Matric</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Score A – {combo.componentA}</TableHead>
                    <TableHead>Score B – {combo.componentB}</TableHead>
                    <TableHead>Combined Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s, i) => {
                    const total = getTotal(s.matricNumber);
                    const gradeEntry = getGradeFromScore(total, gradeConfig);
                    return (
                      <TableRow
                        key={s.matricNumber}
                        className="hover:bg-slate-50"
                        data-ocid={`combined.item.${i + 1}`}
                      >
                        <TableCell className="font-mono text-blue-600 text-xs">
                          {s.matricNumber}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {s.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="w-20 h-8 text-sm"
                            value={scoreA[s.matricNumber] ?? ""}
                            onChange={(e) =>
                              setScoreA((prev) => ({
                                ...prev,
                                [s.matricNumber]: e.target.value,
                              }))
                            }
                            data-ocid="combined.input"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="w-20 h-8 text-sm"
                            value={scoreB[s.matricNumber] ?? ""}
                            onChange={(e) =>
                              setScoreB((prev) => ({
                                ...prev,
                                [s.matricNumber]: e.target.value,
                              }))
                            }
                            data-ocid="combined.input"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-sm">
                          {total}/100
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              gradeColors[gradeEntry.grade] ??
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {gradeEntry.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {gradeEntry.point}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium ${
                              gradeEntry.remark === "Pass"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {gradeEntry.remark}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
