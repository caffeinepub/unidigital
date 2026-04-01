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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Printer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  classifyDegree,
  useResultProcessing,
} from "../../contexts/ResultProcessingContext";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  InlineRecord,
  printStudentRecord,
} from "../../utils/academicRecordUtils";
import { downloadCSV } from "../../utils/csvUtils";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

const FACULTIES: Record<string, string[]> = {
  "Faculty of Sciences": [
    "Computer",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Science",
  ],
  "Faculty of Engineering": [
    "Engineering",
    "Electrical",
    "Mechanical",
    "Civil",
    "Chemical",
  ],
  "Faculty of Arts": [
    "English",
    "History",
    "Philosophy",
    "Arts",
    "Literature",
    "Linguistics",
  ],
  "Faculty of Education": ["Education", "NCE", "Pedagogy", "Teaching"],
  "Faculty of Social Sciences": [
    "Economics",
    "Sociology",
    "Political",
    "Law",
    "Social",
    "Psychology",
  ],
};

function getDeptFaculty(dept: string): string {
  for (const [faculty, keywords] of Object.entries(FACULTIES)) {
    if (keywords.some((kw) => dept.toLowerCase().includes(kw.toLowerCase())))
      return faculty;
  }
  return "Faculty of Sciences";
}

export function FacultyResults() {
  const { examResults, computeStudentCGPA } = useResultProcessing();
  const allStudents = getLocalStudents();
  const allCourses = getLocalCourses();

  const [selectedFaculty, setSelectedFaculty] = useState("Faculty of Sciences");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSession, setSelectedSession] = useState("all");
  const [examOfficerName, setExamOfficerName] = useState("");
  const [certDate, setCertDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [certified, setCertified] = useState(false);

  // Per-department expanded state (for student records sub-section)
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const settings = getInstitutionSettings();
  const institutionType = settings.profile.institutionType;
  const [expandedRecordMatric, setExpandedRecordMatric] = useState<
    string | null
  >(null);
  const [deptRecordSearch, setDeptRecordSearch] = useState("");

  const semesters = useMemo(
    () => [...new Set(examResults.map((r) => r.semester).filter(Boolean))],
    [examResults],
  );
  const sessions = useMemo(
    () => [...new Set(examResults.map((r) => r.session).filter(Boolean))],
    [examResults],
  );

  const creditMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of allCourses) map[c.code] = c.creditUnits;
    return map;
  }, [allCourses]);

  const facultyDepts = useMemo(() => {
    const depts = [
      ...new Set(allStudents.map((s) => s.department).filter(Boolean)),
    ];
    return depts.filter((d) => getDeptFaculty(d) === selectedFaculty);
  }, [allStudents, selectedFaculty]);

  const filteredResults = useMemo(
    () =>
      examResults.filter(
        (r) =>
          (selectedSemester === "all" || r.semester === selectedSemester) &&
          (selectedSession === "all" || r.session === selectedSession),
      ),
    [examResults, selectedSemester, selectedSession],
  );

  const deptStats = useMemo(() => {
    const targetDepts = facultyDepts.length
      ? facultyDepts
      : ["Computer Science"];
    return targetDepts.map((dept) => {
      const students = allStudents.filter((s) => s.department === dept);
      const courses = allCourses.filter((c) => c.department === dept);
      const stuMatrics = students.map((s) => s.matricNumber);
      const deptResults = filteredResults.filter((r) =>
        stuMatrics.includes(r.studentMatric),
      );
      const gpas = students.map((s) =>
        computeStudentCGPA(s.matricNumber, creditMap),
      );
      const avgGpa = gpas.length
        ? gpas.reduce((a, b) => a + b, 0) / gpas.length
        : 0;
      const passCount = deptResults.filter((r) => r.totalScore >= 40).length;
      const passRate = deptResults.length
        ? Math.round((passCount / deptResults.length) * 100)
        : 0;
      const firstClass = gpas.filter((g) => g >= 4.5).length;
      const secondUpper = gpas.filter((g) => g >= 3.5 && g < 4.5).length;
      const secondLower = gpas.filter((g) => g >= 2.5 && g < 3.5).length;
      return {
        dept,
        studentCount: students.length,
        courseCount: courses.length,
        avgGpa,
        passRate,
        firstClass,
        secondUpper,
        secondLower,
        students,
      };
    });
  }, [
    facultyDepts,
    allStudents,
    allCourses,
    filteredResults,
    computeStudentCGPA,
    creditMap,
  ]);

  const aggregateStats = useMemo(() => {
    const allFacultyStudents = allStudents.filter(
      (s) => getDeptFaculty(s.department) === selectedFaculty,
    );
    const matricSet = new Set(allFacultyStudents.map((s) => s.matricNumber));
    const facResults = filteredResults.filter((r) =>
      matricSet.has(r.studentMatric),
    );
    const total = allFacultyStudents.length;
    const passCount = facResults.filter((r) => r.totalScore >= 40).length;
    const passRate = facResults.length
      ? Math.round((passCount / facResults.length) * 100)
      : 0;
    const gpas = allFacultyStudents.map((s) =>
      computeStudentCGPA(s.matricNumber, creditMap),
    );
    const firstClass = gpas.filter((g) => g >= 4.5).length;
    const withCarryovers = allFacultyStudents.filter((s) => {
      const sRes = filteredResults.filter(
        (r) => r.studentMatric === s.matricNumber,
      );
      return sRes.some((r) => r.totalScore < 40);
    }).length;
    return { total, passRate, firstClass, withCarryovers };
  }, [
    allStudents,
    selectedFaculty,
    filteredResults,
    computeStudentCGPA,
    creditMap,
  ]);

  function handleCertify() {
    if (!examOfficerName.trim()) {
      toast.error("Please enter Exam Officer name.");
      return;
    }
    setCertified(true);
    toast.success(`Faculty results certified by ${examOfficerName}.`);
  }

  function handleDownloadCSV() {
    const rows: string[][] = [
      [
        "Department",
        "Students",
        "Courses",
        "Avg GPA",
        "Pass Rate",
        "First Class",
        "2nd Upper",
        "2nd Lower",
      ],
      ...deptStats.map((d) => [
        d.dept,
        String(d.studentCount),
        String(d.courseCount),
        d.avgGpa.toFixed(2),
        `${d.passRate}%`,
        String(d.firstClass),
        String(d.secondUpper),
        String(d.secondLower),
      ]),
    ];
    downloadCSV(
      `faculty-results-${selectedFaculty.replace(/ /g, "-")}.csv`,
      rows,
    );
  }

  function handleToggleDept(dept: string) {
    if (expandedDept === dept) {
      setExpandedDept(null);
      setExpandedRecordMatric(null);
      setDeptRecordSearch("");
    } else {
      setExpandedDept(dept);
      setExpandedRecordMatric(null);
      setDeptRecordSearch("");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-slate-800 to-indigo-900 p-6 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={28} />
            <div>
              <h1 className="text-2xl font-bold">{selectedFaculty}</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                Faculty Result Collation — Exam Officer View
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={handleDownloadCSV}
            data-ocid="faculty-results.secondary_button"
          >
            <Download size={14} className="mr-1" /> Download CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Faculty
              </span>
              <Select
                value={selectedFaculty}
                onValueChange={(v) => {
                  setSelectedFaculty(v);
                  setCertified(false);
                  setExpandedDept(null);
                }}
              >
                <SelectTrigger
                  className="w-60"
                  data-ocid="faculty-results.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(FACULTIES).map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Semester
              </span>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Session
              </span>
              <Select
                value={selectedSession}
                onValueChange={setSelectedSession}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Students Examined",
            value: aggregateStats.total,
            color: "text-blue-600",
          },
          {
            label: "Overall Pass Rate",
            value: `${aggregateStats.passRate}%`,
            color:
              aggregateStats.passRate >= 60 ? "text-green-600" : "text-red-600",
          },
          {
            label: "First Class Count",
            value: aggregateStats.firstClass,
            color: "text-purple-600",
          },
          {
            label: "Students with Carryovers",
            value: aggregateStats.withCarryovers,
            color: "text-orange-600",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Summary Table with expandable student records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Summary</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {deptStats.length === 0 ? (
            <p
              className="text-muted-foreground text-sm py-4 text-center"
              data-ocid="faculty-results.empty_state"
            >
              No departments found for this faculty.
            </p>
          ) : (
            <Table data-ocid="faculty-results.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Department</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Avg GPA</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>1st Class</TableHead>
                  <TableHead>2:1</TableHead>
                  <TableHead>2:2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptStats.map((d, idx) => (
                  <>
                    <TableRow
                      key={d.dept}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      data-ocid={`faculty-results.item.${idx + 1}`}
                      onClick={() => handleToggleDept(d.dept)}
                    >
                      <TableCell className="w-8">
                        {expandedDept === d.dept ? (
                          <ChevronDown
                            size={15}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <ChevronRight
                            size={15}
                            className="text-muted-foreground"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{d.dept}</TableCell>
                      <TableCell>{d.studentCount}</TableCell>
                      <TableCell>{d.courseCount}</TableCell>
                      <TableCell>{d.avgGpa.toFixed(2)}</TableCell>
                      <TableCell
                        className={`font-semibold ${
                          d.passRate >= 60
                            ? "text-green-600"
                            : d.passRate >= 40
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {d.passRate}%
                      </TableCell>
                      <TableCell>{d.firstClass}</TableCell>
                      <TableCell>{d.secondUpper}</TableCell>
                      <TableCell>{d.secondLower}</TableCell>
                    </TableRow>

                    {/* Expanded student records sub-section */}
                    {expandedDept === d.dept && (
                      <TableRow key={`${d.dept}-expand`}>
                        <TableCell colSpan={9} className="p-0 bg-slate-50">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm text-slate-700">
                                Student Academic Records — {d.dept}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {d.students.length} students
                              </Badge>
                            </div>

                            {/* Search within dept */}
                            <Input
                              placeholder="Search student by name or matric…"
                              value={deptRecordSearch}
                              onChange={(e) => {
                                setDeptRecordSearch(e.target.value);
                                setExpandedRecordMatric(null);
                              }}
                              className="max-w-sm"
                              data-ocid="faculty-results.search_input"
                            />

                            {/* Students compact list */}
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Matric No</TableHead>
                                  <TableHead>GPA</TableHead>
                                  <TableHead className="text-right">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {d.students
                                  .filter((s) => {
                                    const q = deptRecordSearch.toLowerCase();
                                    return (
                                      s.name.toLowerCase().includes(q) ||
                                      s.matricNumber.toLowerCase().includes(q)
                                    );
                                  })
                                  .map((student, sIdx) => {
                                    const gpa = computeStudentCGPA(
                                      student.matricNumber,
                                      creditMap,
                                    );
                                    return (
                                      <>
                                        <TableRow
                                          key={student.matricNumber}
                                          data-ocid={`faculty-results.row.${sIdx + 1}`}
                                          className="hover:bg-white"
                                        >
                                          <TableCell className="font-medium">
                                            {student.name}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs text-slate-600">
                                            {student.matricNumber}
                                          </TableCell>
                                          <TableCell>
                                            <span className="font-semibold">
                                              {gpa.toFixed(2)}
                                            </span>
                                            <span className="ml-1 text-xs text-muted-foreground">
                                              ({classifyDegree(gpa)})
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                data-ocid={`faculty-results.edit_button.${sIdx + 1}`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedRecordMatric(
                                                    expandedRecordMatric ===
                                                      student.matricNumber
                                                      ? null
                                                      : student.matricNumber,
                                                  );
                                                }}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                              >
                                                {expandedRecordMatric ===
                                                student.matricNumber ? (
                                                  <>
                                                    <EyeOff
                                                      size={13}
                                                      className="mr-1"
                                                    />
                                                    Hide
                                                  </>
                                                ) : (
                                                  <>
                                                    <Eye
                                                      size={13}
                                                      className="mr-1"
                                                    />
                                                    View Record
                                                  </>
                                                )}
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                data-ocid={`faculty-results.primary_button.${sIdx + 1}`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  printStudentRecord(student);
                                                }}
                                                className="border-slate-300 hover:bg-white"
                                              >
                                                <Printer
                                                  size={13}
                                                  className="mr-1"
                                                />{" "}
                                                Print
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                        {expandedRecordMatric ===
                                          student.matricNumber && (
                                          <TableRow
                                            key={`${student.matricNumber}-rec`}
                                          >
                                            <TableCell
                                              colSpan={4}
                                              className="p-0 bg-white"
                                            >
                                              <div className="p-4">
                                                <InlineRecord
                                                  matricNumber={
                                                    student.matricNumber
                                                  }
                                                  studentName={student.name}
                                                  department={
                                                    student.department
                                                  }
                                                  institutionType={
                                                    student.institutionCategory ??
                                                    institutionType
                                                  }
                                                />
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </>
                                    );
                                  })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Exam Officer Certification */}
      <Card className={certified ? "border-green-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle
              size={16}
              className={certified ? "text-green-500" : "text-muted-foreground"}
            />
            Exam Officer Certification
            {certified && (
              <Badge className="bg-green-100 text-green-700 ml-2">
                Certified
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="exam-officer-name">Exam Officer Name</Label>
              <Input
                id="exam-officer-name"
                placeholder="Full name"
                value={examOfficerName}
                onChange={(e) => setExamOfficerName(e.target.value)}
                disabled={certified}
                data-ocid="faculty-results.input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cert-date">Date</Label>
              <Input
                id="cert-date"
                type="date"
                value={certDate}
                onChange={(e) => setCertDate(e.target.value)}
                disabled={certified}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-3">
              <Label htmlFor="cert-remarks">Remarks</Label>
              <Textarea
                id="cert-remarks"
                placeholder="Enter certification remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={certified}
                rows={3}
                data-ocid="faculty-results.textarea"
              />
            </div>
          </div>
          {!certified && (
            <Button
              className="mt-4 bg-indigo-700 hover:bg-indigo-800"
              onClick={handleCertify}
              data-ocid="faculty-results.submit_button"
            >
              <CheckCircle size={14} className="mr-1" /> Certify Faculty Results
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
