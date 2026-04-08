import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  GitMerge,
  Printer,
  Upload,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
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
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import { downloadCSV } from "../../utils/csvUtils";
import {
  type CombinedCourse,
  type CombinedResult,
  getLocalCombinedCourses,
  getLocalCombinedResults,
  getLocalStudents,
  saveLocalCombinedResults,
} from "../../utils/sampleData";
import {
  type ScoreSheetStudent,
  computeGrade,
  gradeColorClass,
  printScoreSheet,
} from "../../utils/scoreSheetUtils";

const SEMESTERS = [
  "2023/2024 First",
  "2023/2024 Second",
  "2022/2023 First",
  "2022/2023 Second",
  "2024/2025 First",
  "2024/2025 Second",
];

interface ParsedComboRow {
  matric: string;
  name: string;
  scoreA: string;
  scoreB: string;
  errors: string[];
}

export function CombinationScoreSheet() {
  const combinations = getLocalCombinedCourses();
  const students = getLocalStudents();
  const settings = getInstitutionSettings();
  const [semester, setSemester] = useState("2023/2024 First");
  const [expandedCombo, setExpandedCombo] = useState<string | null>(null);
  const [uploadCombo, setUploadCombo] = useState<string | null>(null);
  const [parseRows, setParseRows] = useState<ParsedComboRow[]>([]);
  const [viewResultsCombo, setViewResultsCombo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const instName =
    settings.profile.name || "Federal University of Education Kontagora";

  // Students eligible for a combination (have both component courses in their subCombination)
  const getEligibleStudents = (combo: CombinedCourse) => {
    return students.filter((s) => {
      if (!s.subCombination) return false;
      const parts = s.subCombination.split("/").map((p) => p.trim());
      const cA = combo.componentA.replace("NCE-", "").replace(/\d+$/, "");
      const cB = combo.componentB.replace("NCE-", "").replace(/\d+$/, "");
      return parts.some((p) => p.startsWith(cA) || p.startsWith(cB));
    });
  };

  const getComboResults = (comboCode: string): CombinedResult[] => {
    return getLocalCombinedResults().filter(
      (r) => r.combinationCode === comboCode && r.semester === semester,
    );
  };

  // Download student list for a combination
  const handleDownloadList = (combo: CombinedCourse) => {
    const eligible = getEligibleStudents(combo);
    const rows = [
      [instName],
      [
        `Combination: ${combo.title} (${combo.combinationCode})`,
        `Semester: ${semester}`,
      ],
      [],
      ["S/N", "Student Name", "Matric Number", "Sub-Combination", "Level"],
      ...eligible.map((s, i) => [
        String(i + 1),
        s.name,
        s.matricNumber,
        s.subCombination ?? "",
        s.level,
      ]),
    ];
    downloadCSV(
      `combination-students-${combo.combinationCode}-${semester.replace(/ /g, "-")}.csv`,
      rows,
    );
    toast.success(
      `${eligible.length} students listed for ${combo.combinationCode}`,
    );
  };

  // Download score sheet for a combination
  const handleDownloadScoreSheet = (combo: CombinedCourse) => {
    const eligible = getEligibleStudents(combo);
    const header = [
      [instName],
      ["Faculty of Education"],
      [`Course Combination: ${combo.title}`, `Code: ${combo.combinationCode}`],
      [`Semester: ${semester}`, `Session: ${semester.split(" ")[0]}`],
      [],
      [
        "S/N",
        "Student Name",
        "Matric Number",
        `${combo.componentA} Score`,
        `${combo.componentB} Score`,
        "Combined Total",
        "Grade",
        "Remarks",
      ],
    ];
    const dataRows = eligible.map((s, i) => [
      String(i + 1),
      s.name,
      s.matricNumber,
      "",
      "",
      "",
      "",
      "",
    ]);
    downloadCSV(
      `combo-score-sheet-${combo.combinationCode}-${semester.replace(/ /g, "-")}.csv`,
      [...header, ...dataRows],
    );
    toast.success(`Score sheet downloaded for ${combo.combinationCode}`);
  };

  // Download ALL combination score sheets
  const handleDownloadAll = () => {
    if (combinations.length === 0) {
      toast.error("No combination courses configured");
      return;
    }
    const allRows: string[][] = [];
    for (const combo of combinations) {
      const eligible = getEligibleStudents(combo);
      allRows.push(
        [instName],
        [`Combination: ${combo.title} (${combo.combinationCode})`],
        [`Semester: ${semester}`],
        [],
        [
          "S/N",
          "Student Name",
          "Matric Number",
          `${combo.componentA} Score`,
          `${combo.componentB} Score`,
          "Combined Total",
          "Grade",
          "Remarks",
        ],
        ...eligible.map((s, i) => [
          String(i + 1),
          s.name,
          s.matricNumber,
          "",
          "",
          "",
          "",
          "",
        ]),
        [],
        ["---"],
        [],
      );
    }
    downloadCSV(
      `all-combination-score-sheets-${semester.replace(/ /g, "-")}.csv`,
      allRows,
    );
    toast.success(
      `All ${combinations.length} combination score sheets downloaded`,
    );
  };

  // Print a combination score sheet
  const handlePrint = (combo: CombinedCourse) => {
    const eligible = getEligibleStudents(combo);
    const results = getComboResults(combo.combinationCode);
    const rows: ScoreSheetStudent[] = eligible.map((s, i) => {
      const result = results.find((r) => r.studentMatric === s.matricNumber);
      const { grade, remarks } = result
        ? { grade: result.grade, remarks: result.remark }
        : computeGrade(0);
      return {
        sn: i + 1,
        name: s.name,
        matricNumber: s.matricNumber,
        ca: result ? result.scoreA : "–",
        exam: result ? result.scoreB : "–",
        total: result ? result.combinedTotal : "–",
        grade,
        remarks,
      };
    });
    printScoreSheet(
      {
        faculty: "Faculty of Education",
        department: "Science & Technology Education",
        courseTitle: combo.title,
        courseCode: combo.combinationCode,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
      },
      rows,
    );
  };

  // Parse uploaded combo CSV
  const parseComboCSV = (
    text: string,
    combo: CombinedCourse,
  ): ParsedComboRow[] => {
    const lines = text.trim().split("\n");
    const knownMatrics = new Set(students.map((s) => s.matricNumber));
    const headerIdx = lines.findIndex((l) =>
      l.toLowerCase().includes("matric"),
    );
    const dataLines =
      headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines.slice(1);
    const result: ParsedComboRow[] = [];
    for (const line of dataLines) {
      if (!line.trim() || line.startsWith("---")) break;
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 5) continue;
      const matric = cols[2] ?? "";
      const scoreAStr = cols[3] ?? "";
      const scoreBStr = cols[4] ?? "";
      const errors: string[] = [];
      if (!matric) errors.push("Missing Matric");
      else if (!knownMatrics.has(matric)) errors.push(`Unknown: ${matric}`);
      const a = Number(scoreAStr);
      const b = Number(scoreBStr);
      if (scoreAStr && (Number.isNaN(a) || a < 0 || a > 100))
        errors.push(`${combo.componentA} score invalid`);
      if (scoreBStr && (Number.isNaN(b) || b < 0 || b > 100))
        errors.push(`${combo.componentB} score invalid`);
      result.push({
        matric,
        name: cols[1] ?? "",
        scoreA: scoreAStr,
        scoreB: scoreBStr,
        errors,
      });
    }
    return result;
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    combo: CombinedCourse,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setParseRows(parseComboCSV(text, combo));
      setUploadCombo(combo.combinationCode);
    };
    reader.readAsText(file);
  };

  const handleImportCombo = (combo: CombinedCourse) => {
    const valid = parseRows.filter((r) => r.errors.length === 0);
    if (valid.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    const existing = getLocalCombinedResults().filter(
      (r) =>
        !(
          r.combinationCode === combo.combinationCode &&
          r.semester === semester &&
          valid.some((v) => v.matric === r.studentMatric)
        ),
    );
    const newResults: CombinedResult[] = valid.map((row) => {
      const a = Number(row.scoreA) || 0;
      const b = Number(row.scoreB) || 0;
      const wA = combo.weightA / 100;
      const wB = combo.weightB / 100;
      const combined = Math.round(a * wA + b * wB);
      const { grade, remarks } = computeGrade(combined);
      return {
        id: `CR-${combo.combinationCode}-${row.matric}-${Date.now()}`,
        combinationCode: combo.combinationCode,
        studentMatric: row.matric,
        scoreA: a,
        scoreB: b,
        combinedTotal: combined,
        grade,
        point:
          grade === "A"
            ? 5
            : grade === "B"
              ? 4
              : grade === "C"
                ? 3
                : grade === "D"
                  ? 2
                  : grade === "E"
                    ? 1
                    : 0,
        remark: remarks,
        semester,
        session: semester.split(" ")[0] ?? "2023/2024",
        status: "submitted",
      };
    });
    saveLocalCombinedResults([...existing, ...newResults]);
    setParseRows([]);
    setUploadCombo(null);
    toast.success(
      `${newResults.length} combination results imported for ${combo.combinationCode}`,
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Combination Score Sheets
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage score sheets for combination courses (e.g., CSC+MAT, PHY+CSC,
          BIO+CSC)
        </p>
      </div>

      {/* Semester + Bulk download */}
      <div className="flex flex-wrap items-end gap-3">
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
        <Button
          onClick={handleDownloadAll}
          variant="outline"
          data-ocid="combination_ss.download_all_button"
        >
          <Download size={15} className="mr-1.5" /> Download All Combination
          Sheets
        </Button>
      </div>

      {combinations.length === 0 && (
        <Card>
          <CardContent
            className="p-12 text-center text-slate-400"
            data-ocid="combination_ss.empty_state"
          >
            <GitMerge size={40} className="mx-auto mb-3 text-slate-300" />
            <p>
              No combination courses configured. Go to Admin → Combination
              Courses to set them up.
            </p>
          </CardContent>
        </Card>
      )}

      {combinations.map((combo) => {
        const eligible = getEligibleStudents(combo);
        const results = getComboResults(combo.combinationCode);
        const isExpanded = expandedCombo === combo.combinationCode;
        const isUploading = uploadCombo === combo.combinationCode;
        const isViewingResults = viewResultsCombo === combo.combinationCode;

        return (
          <Card key={combo.id} data-ocid={`combination_ss.item.${combo.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <GitMerge size={18} className="text-blue-500" />
                  <div>
                    <p className="font-semibold text-sm">{combo.title}</p>
                    <p className="text-xs text-slate-500">
                      Code: {combo.combinationCode} &bull; {combo.componentA} +{" "}
                      {combo.componentB} &bull; Weight: {combo.weightA}/
                      {combo.weightB} &bull;{" "}
                      <span className="text-blue-600 font-medium">
                        {eligible.length} eligible students
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadList(combo)}
                    data-ocid="combination_ss.download_list_button"
                  >
                    <FileSpreadsheet size={13} className="mr-1" /> Student List
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadScoreSheet(combo)}
                    data-ocid="combination_ss.download_sheet_button"
                  >
                    <Download size={13} className="mr-1" /> Score Sheet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(combo)}
                    data-ocid="combination_ss.print_button"
                  >
                    <Printer size={13} className="mr-1" /> Print
                  </Button>
                  <label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.xlsx"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, combo)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-ocid="combination_ss.upload_button"
                    >
                      <span className="cursor-pointer">
                        <Upload size={13} className="mr-1" /> Upload Scores
                      </span>
                    </Button>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setViewResultsCombo(
                        isViewingResults ? null : combo.combinationCode,
                      )
                    }
                    data-ocid="combination_ss.view_results_button"
                  >
                    {isViewingResults ? (
                      <ChevronDown size={13} className="mr-1" />
                    ) : (
                      <ChevronRight size={13} className="mr-1" />
                    )}{" "}
                    Results{" "}
                    {results.length > 0 && (
                      <Badge className="ml-1 text-[10px]">
                        {results.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedCombo(
                        isExpanded ? null : combo.combinationCode,
                      )
                    }
                    data-ocid="combination_ss.expand_button"
                  >
                    {isExpanded ? (
                      <ChevronDown size={13} />
                    ) : (
                      <ChevronRight size={13} />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Eligible students list */}
            {isExpanded && (
              <CardContent className="pt-0">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Eligible Students ({eligible.length})
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {[
                          "S/N",
                          "Name",
                          "Matric",
                          "Sub-Combination",
                          "Level",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {eligible.map((s, i) => (
                        <tr
                          key={s.matricNumber}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 font-medium">{s.name}</td>
                          <td className="px-3 py-2 font-mono text-blue-600 text-xs">
                            {s.matricNumber}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {s.subCombination}
                          </td>
                          <td className="px-3 py-2">{s.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}

            {/* Upload preview */}
            {isUploading && parseRows.length > 0 && (
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-600">
                    Upload Preview — {parseRows.length} row(s)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleImportCombo(combo)}
                      className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                    >
                      Import{" "}
                      {parseRows.filter((r) => r.errors.length === 0).length}{" "}
                      Valid
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setParseRows([]);
                        setUploadCombo(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        {[
                          "Name",
                          "Matric",
                          combo.componentA,
                          combo.componentB,
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-slate-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parseRows.map((r, idx) => (
                        <tr
                          key={`${r.matric}-${idx}`}
                          className={
                            r.errors.length > 0 ? "bg-red-50" : "bg-green-50/40"
                          }
                        >
                          <td className="px-3 py-2">{r.name}</td>
                          <td className="px-3 py-2 font-mono text-xs text-blue-600">
                            {r.matric}
                          </td>
                          <td className="px-3 py-2 text-center">{r.scoreA}</td>
                          <td className="px-3 py-2 text-center">{r.scoreB}</td>
                          <td className="px-3 py-2">
                            {r.errors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <XCircle
                                  size={13}
                                  className="text-red-500 flex-shrink-0"
                                />
                                <span className="text-xs text-red-600">
                                  {r.errors.join("; ")}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CheckCircle
                                  size={13}
                                  className="text-green-500"
                                />
                                <span className="text-xs text-green-600">
                                  Valid
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}

            {/* Results view */}
            {isViewingResults && (
              <CardContent className="pt-0">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Results — {results.length} record(s)
                </p>
                {results.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    No results uploaded yet for this semester.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {[
                            "Matric",
                            "Name",
                            combo.componentA,
                            combo.componentB,
                            "Combined",
                            "Grade",
                            "Remarks",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r) => {
                          const student = students.find(
                            (s) => s.matricNumber === r.studentMatric,
                          );
                          return (
                            <tr
                              key={r.id}
                              className="border-b last:border-0 hover:bg-slate-50"
                            >
                              <td className="px-3 py-2 font-mono text-xs text-blue-600">
                                {r.studentMatric}
                              </td>
                              <td className="px-3 py-2">
                                {student?.name ?? "–"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {r.scoreA}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {r.scoreB}
                              </td>
                              <td className="px-3 py-2 text-center font-bold">
                                {r.combinedTotal}
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  className={`${gradeColorClass(r.grade)} border-0 font-bold`}
                                >
                                  {r.grade}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`text-xs font-semibold ${
                                    r.remark === "Pass"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {r.remark}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {r.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
