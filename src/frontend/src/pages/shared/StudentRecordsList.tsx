import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Eye, EyeOff, FileSpreadsheet, Printer, Search } from "lucide-react";
import { useState } from "react";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  InlineRecord,
  printStudentRecord,
} from "../../utils/academicRecordUtils";
import { getLocalStudents } from "../../utils/sampleData";

interface StudentRecordsListProps {
  filterDepartment?: string;
  filterStudentMatics?: string[];
  userRole: string;
}

export function StudentRecordsList({
  filterDepartment,
  filterStudentMatics,
  userRole,
}: StudentRecordsListProps) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState(filterDepartment ?? "all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [expandedMatric, setExpandedMatric] = useState<string | null>(null);

  const settings = getInstitutionSettings();
  const institutionType = settings.profile.institutionType;
  const allStudents = getLocalStudents();

  let students = allStudents;
  if (filterStudentMatics) {
    students = students.filter((s) =>
      filterStudentMatics.includes(s.matricNumber),
    );
  }

  const departments = Array.from(
    new Set(students.map((s) => s.department)),
  ).sort();

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || s.department === deptFilter;
    const matchLevel = levelFilter === "all" || s.level === levelFilter;
    return matchSearch && matchDept && matchLevel;
  });

  const roleLabel: Record<string, string> = {
    admin: "Administrator View",
    hod: "HOD View",
    lecturer: "Lecturer View",
    bursary: "Bursary View",
    hr: "HR View",
  };

  return (
    <div className="space-y-6" data-ocid="student-records.page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="text-blue-600" size={24} />
            Student Academic Records
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {roleLabel[userRole] ?? "Staff View"} · {filtered.length} student
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs text-blue-600 border-blue-200 bg-blue-50"
        >
          GSE Academic Record Format
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                data-ocid="student-records.search_input"
                placeholder="Search by name or matric number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger
                className="w-52"
                data-ocid="student-records.select"
              >
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger
                className="w-36"
                data-ocid="student-records.select"
              >
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="100">100 Level</SelectItem>
                <SelectItem value="200">200 Level</SelectItem>
                <SelectItem value="300">300 Level</SelectItem>
                <SelectItem value="400">400 Level</SelectItem>
                <SelectItem value="500">500 Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400"
              data-ocid="student-records.empty_state"
            >
              <FileSpreadsheet size={40} className="mx-auto mb-2 opacity-30" />
              <p>No students found</p>
            </div>
          ) : (
            <div data-ocid="student-records.table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((student, idx) => (
                    <>
                      <TableRow
                        key={student.matricNumber}
                        data-ocid={`student-records.item.${idx + 1}`}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {student.matricNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {student.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                            {student.level}L
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-ocid={`student-records.edit_button.${idx + 1}`}
                              onClick={() =>
                                setExpandedMatric(
                                  expandedMatric === student.matricNumber
                                    ? null
                                    : student.matricNumber,
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {expandedMatric === student.matricNumber ? (
                                <>
                                  <EyeOff size={14} className="mr-1" />
                                  Hide Record
                                </>
                              ) : (
                                <>
                                  <Eye size={14} className="mr-1" />
                                  View Record
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              data-ocid={`student-records.primary_button.${idx + 1}`}
                              onClick={() => printStudentRecord(student)}
                              className="border-slate-300 hover:bg-slate-50"
                            >
                              <Printer size={14} className="mr-1" /> Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedMatric === student.matricNumber && (
                        <TableRow key={`${student.matricNumber}-record`}>
                          <TableCell colSpan={5} className="p-0 bg-slate-50">
                            <div className="p-4">
                              <InlineRecord
                                matricNumber={student.matricNumber}
                                studentName={student.name}
                                department={student.department}
                                institutionType={
                                  student.institutionCategory ?? institutionType
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
