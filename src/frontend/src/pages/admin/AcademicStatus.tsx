import { AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import {
  type AcademicStatusRecord,
  getLocalCourses,
  getLocalStudents,
} from "../../utils/sampleData";

const STATUS_OPTIONS = [
  "active",
  "probation",
  "suspended",
  "withdrawn",
  "deferred",
  "reinstated",
] as const;
type StatusType = (typeof STATUS_OPTIONS)[number];

const statusColors: Record<StatusType, string> = {
  active: "bg-green-100 text-green-700",
  probation: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-600",
  deferred: "bg-blue-100 text-blue-700",
  reinstated: "bg-teal-100 text-teal-700",
};

export function AcademicStatus() {
  const { academicStatuses, setAcademicStatuses, computeStudentCGPA } =
    useResultProcessing();
  const students = getLocalStudents();
  const courses = getLocalCourses();
  const creditMap = Object.fromEntries(
    courses.map((c) => [c.code, c.creditUnits]),
  );

  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const getStatus = (matric: string): AcademicStatusRecord =>
    academicStatuses.find((s) => s.studentMatric === matric) ?? {
      studentMatric: matric,
      status: "active",
      reason: "",
      date: new Date().toISOString().slice(0, 10),
    };

  const updateStatus = (matric: string, status: StatusType, reason: string) => {
    const existing = academicStatuses.find((s) => s.studentMatric === matric);
    const updated: AcademicStatusRecord = {
      studentMatric: matric,
      status,
      reason,
      date: new Date().toISOString().slice(0, 10),
    };
    if (existing) {
      setAcademicStatuses(
        academicStatuses.map((s) => (s.studentMatric === matric ? updated : s)),
      );
    } else {
      setAcademicStatuses([...academicStatuses, updated]);
    }
    toast.success(`Status updated for ${matric}`);
  };

  const filtered = students.filter((s) => {
    const rec = getStatus(s.matricNumber);
    const matchStatus = filterStatus === "all" || rec.status === filterStatus;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const exportList = () => {
    const rows = ["Matric,Name,Department,CGPA,Status,Reason"];
    for (const s of students) {
      const rec = getStatus(s.matricNumber);
      const cgpa = computeStudentCGPA(s.matricNumber, creditMap);
      rows.push(
        `"${s.matricNumber}","${s.name}","${s.department}",${cgpa},"${rec.status}","${rec.reason}"`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "academic_status.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Academic Status Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and manage student academic standing.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportList}
          data-ocid="status.secondary_button"
        >
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or matric..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="status.search_input"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44" data-ocid="status.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Matric",
                    "Name",
                    "Department",
                    "CGPA",
                    "Class",
                    "Status",
                    "Reason",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-400"
                      data-ocid="status.empty_state"
                    >
                      No students match filters.
                    </td>
                  </tr>
                )}
                {filtered.map((s, i) => {
                  const rec = getStatus(s.matricNumber);
                  const cgpa = computeStudentCGPA(s.matricNumber, creditMap);
                  const isProbation = cgpa > 0 && cgpa < 1.0;
                  return (
                    <tr
                      key={s.matricNumber}
                      className="border-b last:border-0 hover:bg-slate-50"
                      data-ocid={`status.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">
                        {s.matricNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {s.department}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">
                            {cgpa.toFixed(2)}
                          </span>
                          {isProbation && (
                            <AlertTriangle
                              size={12}
                              className="text-amber-500"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {cgpa > 0 ? classifyDegree(cgpa) : "–"}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={rec.status}
                          onValueChange={(v) =>
                            updateStatus(
                              s.matricNumber,
                              v as StatusType,
                              rec.reason,
                            )
                          }
                        >
                          <SelectTrigger
                            className="h-8 w-32 text-xs"
                            data-ocid="status.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="capitalize text-xs"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          className="h-8 text-xs w-36"
                          defaultValue={rec.reason}
                          onBlur={(e) =>
                            updateStatus(
                              s.matricNumber,
                              rec.status as StatusType,
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            statusColors[rec.status as StatusType] ??
                            "bg-slate-100 text-slate-600"
                          }
                        >
                          {rec.status}
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
    </div>
  );
}
