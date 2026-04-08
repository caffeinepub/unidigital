import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckSquare,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  Home,
  Library,
  Receipt,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getLocalCourses,
  getLocalHostelApps,
  getLocalPayments,
  getLocalResults,
  getLocalStaff,
  getLocalStudentAttendance,
  getLocalStudents,
} from "../../utils/sampleData";

// ---- Dataset definitions ----
interface Dataset {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  columns: string[];
  rowFn: (filters: Filters) => Row[];
}

interface Row {
  [key: string]: string | number;
}

interface Filters {
  dateFrom: string;
  dateTo: string;
  department: string;
  level: string;
  status: string;
}

interface ExportLog {
  id: string;
  dataset: string;
  format: string;
  filters: string;
  timestamp: string;
  fileSize: string;
  rawData: Row[];
  columns: string[];
}

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB");
}

function buildStudentRows(filters: Filters): Row[] {
  let rows = getLocalStudents().map((s) => ({
    "Matric No.": s.matricNumber,
    Name: s.name,
    Department: s.department,
    Level: s.level,
    Email: s.email,
  }));
  if (filters.department)
    rows = rows.filter((r) => r.Department === filters.department);
  if (filters.level)
    rows = rows.filter((r) => String(r.Level) === filters.level);
  return rows;
}

function buildStaffRows(filters: Filters): Row[] {
  let rows = getLocalStaff().map((s) => ({
    "Staff ID": s.staffId,
    Name: s.name,
    Designation: s.designation,
    Department: s.department,
    Email: s.email,
  }));
  if (filters.department)
    rows = rows.filter((r) => r.Department === filters.department);
  return rows;
}

function buildCourseRows(filters: Filters): Row[] {
  let rows = getLocalCourses().map((c) => ({
    Code: c.code,
    Title: c.title,
    "Credit Units": c.creditUnits,
    Department: c.department,
    Semester: c.semester,
  }));
  if (filters.department)
    rows = rows.filter((r) => r.Department === filters.department);
  return rows;
}

function buildResultRows(filters: Filters): Row[] {
  let rows = getLocalResults().map((r) => ({
    "Student Matric": r.studentMatric,
    "Course Code": r.courseCode,
    Semester: r.semester,
    Score: r.score,
    Grade: r.grade,
    "Grade Point": r.gradePoint,
  }));
  if (filters.status) {
    if (filters.status === "pass") rows = rows.filter((r) => r.Score >= 40);
    if (filters.status === "fail") rows = rows.filter((r) => r.Score < 40);
  }
  return rows;
}

function buildPaymentRows(_filters: Filters): Row[] {
  const rows = getLocalPayments().map((p) => ({
    "Payment ID": p.id,
    "Invoice ID": p.invoiceId,
    "Amount Paid (₦)": p.amountPaid,
    Date: fmtDate(p.paymentDate),
    Reference: p.reference,
  }));
  return rows;
}

function buildAttendanceRows(filters: Filters): Row[] {
  let rows = getLocalStudentAttendance().map((a) => ({
    "Record ID": a.id,
    "Course Code": a.courseCode,
    Date: fmtDate(a.date),
    "Student Matric": a.studentMatric,
    Status: a.status,
  }));
  if (filters.status) rows = rows.filter((r) => r.Status === filters.status);
  return rows;
}

function buildHostelRows(_filters: Filters): Row[] {
  return getLocalHostelApps().map((h) => ({
    "Student Matric": h.studentMatric,
    Name: h.studentName,
    "Room Type": h.roomType,
    "Room No.": h.roomNumber,
    Block: h.block,
    Session: h.session,
    Status: h.status,
  }));
}

function buildSimpleRows(label: string, count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    ID: `${label.slice(0, 3).toUpperCase()}${String(i + 1).padStart(3, "0")}`,
    Description: `${label} Record ${i + 1}`,
    Date: fmtDate(new Date(Date.now() - i * 7 * 86400000).toISOString()),
    Status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Active" : "Closed",
    Department: [
      "Computer Science",
      "Engineering",
      "Medicine",
      "Law",
      "Business Administration",
    ][i % 5],
  }));
}

const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
];

const DATASETS: Dataset[] = [
  {
    key: "students",
    label: "Students",
    icon: <Users size={16} />,
    color: "text-blue-600",
    columns: ["Matric No.", "Name", "Department", "Level", "Email"],
    rowFn: buildStudentRows,
  },
  {
    key: "staff",
    label: "Staff",
    icon: <UserCheck size={16} />,
    color: "text-green-600",
    columns: ["Staff ID", "Name", "Designation", "Department", "Email"],
    rowFn: buildStaffRows,
  },
  {
    key: "courses",
    label: "Courses",
    icon: <BookOpen size={16} />,
    color: "text-purple-600",
    columns: ["Code", "Title", "Credit Units", "Department", "Semester"],
    rowFn: buildCourseRows,
  },
  {
    key: "results",
    label: "Results",
    icon: <FileText size={16} />,
    color: "text-indigo-600",
    columns: [
      "Student Matric",
      "Course Code",
      "Semester",
      "Score",
      "Grade",
      "Grade Point",
    ],
    rowFn: buildResultRows,
  },
  {
    key: "payments",
    label: "Payments",
    icon: <CreditCard size={16} />,
    color: "text-emerald-600",
    columns: [
      "Payment ID",
      "Invoice ID",
      "Amount Paid (₦)",
      "Date",
      "Reference",
    ],
    rowFn: buildPaymentRows,
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: <Receipt size={16} />,
    color: "text-amber-600",
    columns: ["ID", "Description", "Date", "Status", "Department"],
    rowFn: () => buildSimpleRows("Invoice", 12),
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: <CheckSquare size={16} />,
    color: "text-teal-600",
    columns: ["Record ID", "Course Code", "Date", "Student Matric", "Status"],
    rowFn: buildAttendanceRows,
  },
  {
    key: "registrations",
    label: "Course Registrations",
    icon: <ClipboardList size={16} />,
    color: "text-cyan-600",
    columns: ["ID", "Description", "Date", "Status", "Department"],
    rowFn: () => buildSimpleRows("Registration", 18),
  },
  {
    key: "hostel",
    label: "Hostel Allocations",
    icon: <Home size={16} />,
    color: "text-rose-600",
    columns: [
      "Student Matric",
      "Name",
      "Room Type",
      "Room No.",
      "Block",
      "Session",
      "Status",
    ],
    rowFn: buildHostelRows,
  },
  {
    key: "disciplinary",
    label: "Disciplinary Records",
    icon: <AlertTriangle size={16} />,
    color: "text-red-600",
    columns: ["ID", "Description", "Date", "Status", "Department"],
    rowFn: () => buildSimpleRows("Disciplinary", 7),
  },
  {
    key: "training",
    label: "Training Records",
    icon: <Award size={16} />,
    color: "text-orange-600",
    columns: ["ID", "Description", "Date", "Status", "Department"],
    rowFn: () => buildSimpleRows("Training", 10),
  },
  {
    key: "library",
    label: "Library Records",
    icon: <Library size={16} />,
    color: "text-slate-600",
    columns: ["ID", "Description", "Date", "Status", "Department"],
    rowFn: () => buildSimpleRows("Library", 15),
  },
];

// ---- CSV helpers ----
function rowsToCsv(columns: string[], rows: Row[]): string {
  const header = columns.join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const v = String(r[c] ?? "");
          return v.includes(",") ? `"${v}"` : v;
        })
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function fileSizeLabel(rows: Row[], cols: string[]) {
  const csv = rowsToCsv(cols, rows);
  const bytes = new TextEncoder().encode(csv).length;
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ---- Component ----
export function DataExportCenter() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "",
    dateTo: "",
    department: "",
    level: "",
    status: "",
  });
  const [exportLog, setExportLog] = useState<ExportLog[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("unidigital_export_log");
    if (saved) setExportLog(JSON.parse(saved));
  }, []);

  const saveLog = (log: ExportLog[]) => {
    localStorage.setItem(
      "unidigital_export_log",
      JSON.stringify(log.slice(0, 10)),
    );
    setExportLog(log.slice(0, 10));
  };

  const dataset = DATASETS.find((d) => d.key === selectedKey) ?? null;
  const previewRows = dataset ? dataset.rowFn(filters).slice(0, 10) : [];
  const allRows = dataset ? dataset.rowFn(filters) : [];

  const filterSummary = () => {
    const parts: string[] = [];
    if (filters.dateFrom) parts.push(`From: ${filters.dateFrom}`);
    if (filters.dateTo) parts.push(`To: ${filters.dateTo}`);
    if (filters.department) parts.push(`Dept: ${filters.department}`);
    if (filters.level) parts.push(`Level: ${filters.level}`);
    if (filters.status) parts.push(`Status: ${filters.status}`);
    return parts.length > 0 ? parts.join("; ") : "No filters";
  };

  const addLog = (format: string, rows: Row[], cols: string[]) => {
    const entry: ExportLog = {
      id: `EXP${Date.now()}`,
      dataset: dataset?.label ?? "",
      format,
      filters: filterSummary(),
      timestamp: new Date().toISOString(),
      fileSize: fileSizeLabel(rows, cols),
      rawData: rows,
      columns: cols,
    };
    saveLog([entry, ...exportLog]);
  };

  const handleExportCsv = (extension = ".csv") => {
    if (!dataset) return;
    const csv = rowsToCsv(dataset.columns, allRows);
    downloadBlob(csv, `${dataset.key}-export${extension}`, "text/csv");
    addLog(
      extension === ".xlsx" ? "Excel (CSV)" : "CSV",
      allRows,
      dataset.columns,
    );
  };

  const handleExportPdf = () => {
    if (!dataset) return;
    addLog("PDF", allRows, dataset.columns);
    window.print();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Data Export Center
        </h1>
        <p className="text-slate-500 text-sm">
          Export university data in multiple formats for audit and reporting
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Left: Dataset selector */}
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Datasets</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-0.5">
              {DATASETS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  data-ocid={`export-dataset-${d.key}`}
                  onClick={() => setSelectedKey(d.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    selectedKey === d.key
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={d.color}>{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Filters + preview + export */}
        <div className="md:col-span-3 space-y-4">
          {!dataset && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Download size={48} className="mb-4 opacity-20" />
              <p>Select a dataset from the left to begin</p>
            </div>
          )}

          {dataset && (
            <>
              {/* Filters */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Filters – {dataset.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Date From</Label>
                      <Input
                        type="date"
                        className="mt-1 text-sm"
                        value={filters.dateFrom}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            dateFrom: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Date To</Label>
                      <Input
                        type="date"
                        className="mt-1 text-sm"
                        value={filters.dateTo}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, dateTo: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Department</Label>
                      <Select
                        value={filters.department}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            department: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1 text-sm">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Level</Label>
                      <Select
                        value={filters.level}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            level: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1 text-sm">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {["100", "200", "300", "400"].map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}L
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(v) =>
                          setFilters((f) => ({
                            ...f,
                            status: v === "all" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1 text-sm">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {[
                            "active",
                            "pending",
                            "pass",
                            "fail",
                            "present",
                            "absent",
                          ].map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          setFilters({
                            dateFrom: "",
                            dateTo: "",
                            department: "",
                            level: "",
                            status: "",
                          })
                        }
                      >
                        <RefreshCw size={13} className="mr-1.5" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export buttons */}
              <Card>
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate-500 font-medium">
                    Export Format:
                  </span>
                  <Button
                    data-ocid="export-btn-excel"
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    onClick={() => handleExportCsv(".xlsx")}
                  >
                    <Download size={14} className="mr-1.5" />
                    Excel (.xlsx)
                  </Button>
                  <Button
                    data-ocid="export-btn-csv"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCsv(".csv")}
                  >
                    <Download size={14} className="mr-1.5" />
                    CSV
                  </Button>
                  <Button
                    data-ocid="export-btn-pdf"
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                    onClick={handleExportPdf}
                  >
                    <Download size={14} className="mr-1.5" />
                    PDF (Print)
                  </Button>
                  <span className="text-xs text-slate-400 ml-auto">
                    {allRows.length} records • ~
                    {fileSizeLabel(allRows, dataset.columns)}
                  </span>
                </CardContent>
              </Card>

              {/* Preview table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Preview – First {previewRows.length} of {allRows.length}{" "}
                    records
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {dataset.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.length === 0 && (
                          <tr>
                            <td
                              colSpan={dataset.columns.length}
                              className="px-4 py-8 text-center text-slate-400"
                            >
                              No records match the current filters.
                            </td>
                          </tr>
                        )}
                        {previewRows.map((row, i) => (
                          <tr
                            key={`preview-row-${i}-${String(row[dataset.columns[0]] ?? i)}`}
                            className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                          >
                            {dataset.columns.map((col) => (
                              <td
                                key={col}
                                className="px-4 py-2.5 text-slate-700 whitespace-nowrap"
                              >
                                {String(row[col] ?? "—")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Export History Log */}
      {exportLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Export History (Last 10)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {[
                      "Dataset",
                      "Format",
                      "Filters Applied",
                      "Timestamp",
                      "Size",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exportLog.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        {log.dataset}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={
                            log.format.includes("Excel")
                              ? "text-green-600 border-green-200"
                              : log.format === "PDF"
                                ? "text-red-600 border-red-200"
                                : "text-slate-600"
                          }
                        >
                          {log.format}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 max-w-[180px] truncate">
                        {log.filters}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        {log.fileSize}
                      </td>
                      <td className="px-4 py-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            const csv = rowsToCsv(log.columns, log.rawData);
                            downloadBlob(
                              csv,
                              `${log.dataset.toLowerCase()}-reexport.csv`,
                              "text/csv",
                            );
                          }}
                        >
                          <Download size={12} className="mr-1" />
                          Download Again
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
