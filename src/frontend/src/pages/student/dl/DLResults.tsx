import { Download, Printer, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface ResultEntry {
  semester: string;
  courseCode: string;
  courseTitle: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  status: "Pass" | "Fail";
}

const DEMO_RESULTS: ResultEntry[] = [
  {
    semester: "2023/2024 First",
    courseCode: "GST 111",
    courseTitle: "Communication in English",
    ca: 35,
    exam: 52,
    total: 62,
    grade: "C",
    status: "Pass",
  },
  {
    semester: "2023/2024 First",
    courseCode: "EDU 101",
    courseTitle: "Introduction to Teaching",
    ca: 38,
    exam: 55,
    total: 70,
    grade: "B",
    status: "Pass",
  },
  {
    semester: "2023/2024 First",
    courseCode: "COS 101",
    courseTitle: "Introduction to Computer Science",
    ca: 40,
    exam: 58,
    total: 75,
    grade: "A",
    status: "Pass",
  },
  {
    semester: "2023/2024 First",
    courseCode: "MTH 101",
    courseTitle: "Elementary Mathematics I",
    ca: 30,
    exam: 38,
    total: 50,
    grade: "C",
    status: "Pass",
  },
  {
    semester: "2023/2024 First",
    courseCode: "PHY 101",
    courseTitle: "General Physics I",
    ca: 28,
    exam: 34,
    total: 44,
    grade: "D",
    status: "Pass",
  },
  {
    semester: "2023/2024 Second",
    courseCode: "GST 112",
    courseTitle: "Nigerian Peoples and Culture",
    ca: 36,
    exam: 50,
    total: 65,
    grade: "C",
    status: "Pass",
  },
  {
    semester: "2023/2024 Second",
    courseCode: "COS 102",
    courseTitle: "Problem Solving",
    ca: 38,
    exam: 54,
    total: 72,
    grade: "B",
    status: "Pass",
  },
  {
    semester: "2023/2024 Second",
    courseCode: "PHY 102",
    courseTitle: "General Physics II",
    ca: 25,
    exam: 28,
    total: 38,
    grade: "F",
    status: "Fail",
  },
  {
    semester: "2023/2024 Second",
    courseCode: "MTH 102",
    courseTitle: "Elementary Mathematics II",
    ca: 32,
    exam: 48,
    total: 62,
    grade: "C",
    status: "Pass",
  },
  {
    semester: "2023/2024 Second",
    courseCode: "SED 101",
    courseTitle: "Science and Mathematics Education",
    ca: 39,
    exam: 55,
    total: 73,
    grade: "B",
    status: "Pass",
  },
];

const gradePoints: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};
const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-100 text-red-600",
  F: "bg-red-200 text-red-800",
};

function computeGPA(rows: ResultEntry[]): number {
  if (rows.length === 0) return 0;
  const totalWeighted = rows.reduce(
    (sum, r) => sum + (gradePoints[r.grade] ?? 0) * 3,
    0,
  );
  const totalUnits = rows.length * 3;
  return totalUnits > 0 ? totalWeighted / totalUnits : 0;
}

export function DLResults() {
  const printRef = useRef<HTMLDivElement>(null);
  const semesters = [...new Set(DEMO_RESULTS.map((r) => r.semester))];

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=820,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>DL Result Slip</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; padding: 20mm; color: #000; }
        h1 { text-align: center; font-size: 14pt; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #000; padding: 5px 7px; }
        th { background: #f0f0f0; font-weight: bold; }
        @media print { body { padding: 12mm; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const allGPA = computeGPA(DEMO_RESULTS);
  const passCount = DEMO_RESULTS.filter((r) => r.status === "Pass").length;
  const failCount = DEMO_RESULTS.filter((r) => r.status === "Fail").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">My Results</h2>
          <p className="text-sm text-muted-foreground">
            Distance Learning Programme — FUEK
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="gap-1.5"
          data-ocid="dl.results.print"
        >
          <Printer size={14} /> Print Result Slip
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CGPA", value: allGPA.toFixed(2), color: "text-primary" },
          {
            label: "Courses Taken",
            value: String(DEMO_RESULTS.length),
            color: "text-foreground",
          },
          {
            label: "Passed",
            value: String(passCount),
            color: "text-green-600",
          },
          { label: "Failed", value: String(failCount), color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Academic status */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
        <TrendingUp size={16} className="text-green-600" />
        <span className="text-sm font-semibold text-green-800">
          Academic Status: Active &nbsp;&bull;&nbsp;
        </span>
        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
          CGPA {allGPA.toFixed(2)} — Good Standing
        </Badge>
        <Badge className="bg-[#003087]/10 text-[#003087] border-0 text-xs ml-auto">
          Distance Learning
        </Badge>
      </div>

      {/* Results by semester */}
      <div ref={printRef} className="space-y-4">
        <div className="text-center border-b pb-2 hidden print:block">
          <h1 className="text-lg font-bold">
            Federal University of Education, Kontagora
          </h1>
          <p className="text-sm">
            Distance Learning Centre — Student Academic Record
          </p>
        </div>
        {semesters.map((sem) => {
          const rows = DEMO_RESULTS.filter((r) => r.semester === sem);
          const semGPA = computeGPA(rows);
          return (
            <Card key={sem}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm">{sem}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Semester GPA:
                    </span>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {semGPA.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead className="text-center">CA (40)</TableHead>
                        <TableHead className="text-center">Exam (60)</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.courseCode}>
                          <TableCell className="font-mono font-semibold text-primary text-xs">
                            {r.courseCode}
                          </TableCell>
                          <TableCell className="text-sm">
                            {r.courseTitle}
                          </TableCell>
                          <TableCell className="text-center">{r.ca}</TableCell>
                          <TableCell className="text-center">
                            {r.exam}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {r.total}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${gradeColors[r.grade] ?? ""}`}
                            >
                              {r.grade}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                r.status === "Pass"
                                  ? "bg-green-100 text-green-700 border-0 text-xs"
                                  : "bg-red-100 text-red-700 border-0 text-xs"
                              }
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          data-ocid="dl.results.download"
        >
          <Download size={14} /> Download Result Slip (PDF)
        </Button>
      </div>
    </div>
  );
}
