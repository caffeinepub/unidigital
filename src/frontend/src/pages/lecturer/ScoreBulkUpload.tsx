import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef, useState } from "react";
import { getLocalCourses } from "../../utils/sampleData";

interface ParsedRow {
  MatricNumber: string;
  StudentName: string;
  CA: string;
  Exam: string;
  errors: string[];
}

const courses = getLocalCourses();

export function ScoreBulkUpload() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [imported, setImported] = useState<{
    success: number;
    errors: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv =
      "MatricNumber,StudentName,CA,Exam\n2020/1/01,Alice Johnson,35,55\n2020/1/02,Bob Emeka,28,48";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `score_template_${selectedCourse || "course"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = vals[i] ?? "";
      });
      const errors: string[] = [];
      if (!row.MatricNumber) errors.push("Missing MatricNumber");
      if (!row.StudentName) errors.push("Missing StudentName");
      const ca = Number(row.CA);
      const exam = Number(row.Exam);
      if (Number.isNaN(ca) || ca < 0 || ca > 40) errors.push("CA must be 0-40");
      if (Number.isNaN(exam) || exam < 0 || exam > 60)
        errors.push("Exam must be 0-60");
      return {
        MatricNumber: row.MatricNumber ?? "",
        StudentName: row.StudentName ?? "",
        CA: row.CA ?? "",
        Exam: row.Exam ?? "",
        errors,
      };
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
      setImported(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    const invalid = rows.filter((r) => r.errors.length > 0);
    const existing = JSON.parse(localStorage.getItem("caScores") ?? "[]");
    const newScores = valid.map((r) => ({
      courseCode: selectedCourse,
      matricNumber: r.MatricNumber,
      ca: Number(r.CA),
      exam: Number(r.Exam),
    }));
    localStorage.setItem(
      "caScores",
      JSON.stringify([...existing, ...newScores]),
    );
    setImported({ success: valid.length, errors: invalid.length });
    setRows([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Score Bulk Upload</h1>
        <p className="text-slate-500 text-sm mt-1">
          Download a CSV template, fill scores, and upload for bulk import
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Select Course & Download Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger data-ocid="score_upload.select">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={!selectedCourse}
            data-ocid="score_upload.upload_button"
          >
            📥 Download Template CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Upload Filled CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Upload CSV File</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="block mt-1"
              data-ocid="score_upload.dropzone"
            />
          </div>

          {rows.length > 0 && (
            <>
              <h3 className="font-semibold text-sm">
                Preview ({rows.length} rows)
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matric</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow
                      key={`${row.MatricNumber}-${row.CA}-${row.Exam}`}
                      className={row.errors.length > 0 ? "bg-red-50" : ""}
                      data-ocid={`score_upload.item.${idx + 1}`}
                    >
                      <TableCell>{row.MatricNumber}</TableCell>
                      <TableCell>{row.StudentName}</TableCell>
                      <TableCell>{row.CA}</TableCell>
                      <TableCell>{row.Exam}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <Badge variant="destructive">
                            {row.errors.join("; ")}
                          </Badge>
                        ) : (
                          <Badge variant="default">Valid</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                onClick={handleImport}
                disabled={!selectedCourse}
                data-ocid="score_upload.primary_button"
              >
                Import Valid Rows
              </Button>
            </>
          )}

          {imported && (
            <div className="flex gap-3" data-ocid="score_upload.success_state">
              <Badge variant="default">{imported.success} rows imported</Badge>
              {imported.errors > 0 && (
                <Badge variant="destructive">
                  {imported.errors} rows skipped (errors)
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
