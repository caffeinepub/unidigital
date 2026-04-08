import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import {
  ALL_FUEK_COURSES,
  REGISTRATION_RULES,
  getCoursesByProgramme,
} from "../../utils/fuekCourseData";
import { getLocalResults, getLocalStudents } from "../../utils/sampleData";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProgrammeType =
  | "NCE"
  | "NUC"
  | "OND"
  | "HND"
  | "PGD"
  | "PGDE"
  | "PhD"
  | "MSc"
  | "MPhil"
  | "Certificate";

interface ExtendedStudent {
  matricNumber: string;
  name: string;
  email: string;
  level: number;
  department: string;
  programmeType: ProgrammeType;
  entryMode: "UTME" | "DE";
  completedCourses: string[];
  semestersCompleted: number;
}

function getExtendedStudents(): ExtendedStudent[] {
  const stored = localStorage.getItem("uni_extended_students");
  if (stored) {
    try {
      return JSON.parse(stored) as ExtendedStudent[];
    } catch {
      /* ignore */
    }
  }
  return [];
}

const DEMO_STUDENTS: ExtendedStudent[] = [
  {
    matricNumber: "FUEK/SCI/2025/CSC/001",
    name: "Aisha Mohammed",
    email: "aisha@student.edu",
    level: 200,
    department: "Education & Computer Science",
    programmeType: "NCE",
    entryMode: "UTME",
    completedCourses: [
      "GST 111",
      "GST 121",
      "EDU 111",
      "CSC 111",
      "MAT 111",
      "PHY 111",
      "BIO 111",
      "CHE 111",
      "ENT 111",
      "GST 112",
      "GST 122",
      "EDU 112",
      "CSC 112",
      "MAT 112",
      "ENT 112",
      "EDU 211",
      "EDU 213",
      "CSC 211",
      "MAT 211",
    ],
    semestersCompleted: 3,
  },
  {
    matricNumber: "FUEK/SCI/2025/MAT/001",
    name: "Emeka Nwosu",
    email: "emeka@student.edu",
    level: 300,
    department: "Education & Mathematics",
    programmeType: "NUC",
    entryMode: "DE",
    completedCourses: [
      "GST 101",
      "GST 103",
      "MAT 101",
      "PHY 101",
      "BIO 101",
      "CHE 101",
      "EDU 101",
      "GST 102",
      "GST 104",
      "MAT 102",
      "PHY 102",
      "EDU 102",
      "ENT 101",
      "MAT 201",
      "MAT 202",
      "EDU 201",
      "EDU 202",
    ],
    semestersCompleted: 5,
  },
  {
    matricNumber: "FUEK/SCI/2025/PHY/001",
    name: "Fatima Bello",
    email: "fatima@student.edu",
    level: 100,
    department: "Education & Physics",
    programmeType: "NCE",
    entryMode: "UTME",
    completedCourses: [],
    semestersCompleted: 0,
  },
];

function getAllStudents(): ExtendedStudent[] {
  const extended = getExtendedStudents();
  const basics = getLocalStudents();
  const allMatrics = new Set(extended.map((s) => s.matricNumber));
  // Merge: use extended where available, supplement with basics
  const merged: ExtendedStudent[] = [...DEMO_STUDENTS];
  for (const e of extended) {
    if (!merged.find((m) => m.matricNumber === e.matricNumber)) merged.push(e);
  }
  for (const b of basics) {
    if (!allMatrics.has(b.matricNumber)) {
      merged.push({
        matricNumber: b.matricNumber,
        name: b.name,
        email: b.email,
        level: Number(b.level) || 100,
        department: b.department,
        programmeType: "NCE",
        entryMode: "UTME",
        completedCourses: [],
        semestersCompleted: 0,
      });
    }
  }
  return merged;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface SemesterRecord {
  label: string;
  courses: {
    code: string;
    title: string;
    creditUnits: number;
    grade: string;
    passed: boolean;
  }[];
  gpa: number;
  totalCredits: number;
}

function gradeToPoint(grade: string): number {
  const map: Record<string, number> = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0,
  };
  return map[grade] ?? 0;
}

function computeStudentGraduation(student: ExtendedStudent) {
  const allResults = getLocalResults().filter(
    (r) => r.studentMatric === student.matricNumber,
  );

  const passedSet = new Set(student.completedCourses);
  for (const r of allResults) {
    if (r.grade !== "F") passedSet.add(r.courseCode);
  }

  const minRequired =
    student.entryMode === "UTME"
      ? REGISTRATION_RULES.utmeMinCredits
      : REGISTRATION_RULES.deMinCredits;

  // Credit units from passed courses
  const passedCourseDetails = ALL_FUEK_COURSES.filter((c) =>
    passedSet.has(c.code),
  );
  const creditsEarned = passedCourseDetails.reduce(
    (sum, c) => sum + c.creditUnits,
    0,
  );
  const gradProgress = Math.min((creditsEarned / minRequired) * 100, 100);

  // Compulsory courses for this programme
  const compulsoriesAll = ALL_FUEK_COURSES.filter(
    (c) => c.programmeType === student.programmeType && c.type === "compulsory",
  );
  const compulsoriesPassed = compulsoriesAll.filter((c) =>
    passedSet.has(c.code),
  );
  const compulsoryRemaining = compulsoriesAll.filter(
    (c) => !passedSet.has(c.code),
  );

  // Semester breakdown
  const semesterMap = new Map<string, SemesterRecord>();
  for (const r of allResults) {
    if (!semesterMap.has(r.semester)) {
      semesterMap.set(r.semester, {
        label: r.semester,
        courses: [],
        gpa: 0,
        totalCredits: 0,
      });
    }
    const fuekCourse = ALL_FUEK_COURSES.find((c) => c.code === r.courseCode);
    const rec = semesterMap.get(r.semester);
    if (rec) {
      rec.courses.push({
        code: r.courseCode,
        title: fuekCourse?.title ?? r.courseCode,
        creditUnits: fuekCourse?.creditUnits ?? 3,
        grade: r.grade,
        passed: r.grade !== "F",
      });
    }
  }
  // Compute GPA per semester
  for (const [, rec] of semesterMap) {
    let totalPoints = 0;
    let totalUnits = 0;
    for (const c of rec.courses) {
      totalPoints += gradeToPoint(c.grade) * c.creditUnits;
      totalUnits += c.creditUnits;
      rec.totalCredits += c.creditUnits;
    }
    rec.gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
  }

  const semesters = Array.from(semesterMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  // CGPA
  let totalQP = 0;
  let totalCU = 0;
  for (const r of allResults) {
    const fu = ALL_FUEK_COURSES.find((c) => c.code === r.courseCode);
    const cu = fu?.creditUnits ?? 3;
    totalQP += gradeToPoint(r.grade) * cu;
    totalCU += cu;
  }
  const cgpa = totalCU > 0 ? totalQP / totalCU : 0;

  // Projected graduation date
  const semRemaining = Math.max(
    0,
    (student.entryMode === "UTME"
      ? REGISTRATION_RULES.utmeMinSemesters
      : REGISTRATION_RULES.deMinSemesters) - student.semestersCompleted,
  );
  const now = new Date();
  const projectedYear = now.getFullYear() + Math.ceil(semRemaining / 2);

  const onTrack =
    gradProgress >= 60 &&
    compulsoriesPassed.length >= compulsoriesAll.length * 0.5;

  return {
    passedSet,
    creditsEarned,
    minRequired,
    gradProgress,
    compulsoriesAll,
    compulsoriesPassed,
    compulsoryRemaining,
    semesters,
    cgpa,
    semRemaining,
    projectedYear,
    onTrack,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  userEmail?: string;
  userRole?: "student" | "admin" | "hod" | "lecturer" | "hr" | "bursary";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GraduationTracker({ userEmail, userRole = "student" }: Props) {
  const allStudents = useMemo(() => getAllStudents(), []);
  const [search, setSearch] = useState("");
  const [selectedMatric, setSelectedMatric] = useState<string | null>(null);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  // For student role, auto-select their own record
  const isStudentView = userRole === "student";

  const studentsList = useMemo(() => {
    if (isStudentView && userEmail) {
      const own = allStudents.find((s) => s.email === userEmail);
      return own ? [own] : allStudents.slice(0, 1);
    }
    const q = search.toLowerCase();
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.matricNumber.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q),
    );
  }, [allStudents, isStudentView, userEmail, search]);

  const viewStudent = useMemo(() => {
    if (isStudentView) return studentsList[0] ?? null;
    if (selectedMatric)
      return allStudents.find((s) => s.matricNumber === selectedMatric) ?? null;
    return null;
  }, [isStudentView, studentsList, selectedMatric, allStudents]);

  const data = useMemo(
    () => (viewStudent ? computeStudentGraduation(viewStudent) : null),
    [viewStudent],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap size={24} className="text-primary" />
            Graduation Eligibility Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full academic progress and graduation readiness assessment
          </p>
        </div>
      </div>

      {/* Search (admin/hod only) */}
      {!isStudentView && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search student name, matric, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="graduation.search_input"
            />
          </div>
          {selectedMatric && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedMatric(null)}
            >
              <XCircle size={14} className="mr-1.5" /> Clear
            </Button>
          )}
        </div>
      )}

      <div
        className={
          viewStudent
            ? "grid lg:grid-cols-3 gap-5"
            : "grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        }
      >
        {/* Student list (admin/hod) */}
        {!isStudentView &&
          !viewStudent &&
          studentsList.slice(0, 30).map((s) => {
            const d = computeStudentGraduation(s);
            return (
              <button
                key={s.matricNumber}
                type="button"
                onClick={() => setSelectedMatric(s.matricNumber)}
                className="text-left bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                data-ocid={`graduation.student_card.${s.matricNumber}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {s.matricNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.department}
                    </p>
                  </div>
                  <Badge
                    className={
                      d.onTrack
                        ? "bg-green-100 text-green-700 border-0 text-xs shrink-0"
                        : "bg-amber-100 text-amber-700 border-0 text-xs shrink-0"
                    }
                  >
                    {d.onTrack ? "On Track" : "At Risk"}
                  </Badge>
                </div>
                <Progress value={d.gradProgress} className="h-1.5 mb-1" />
                <p className="text-xs text-muted-foreground">
                  {d.creditsEarned} / {d.minRequired} credits • CGPA:{" "}
                  {d.cgpa.toFixed(2)}
                </p>
              </button>
            );
          })}

        {/* Detail view */}
        {viewStudent && data && (
          <>
            {/* Left column: summary + compulsory status */}
            <div className="lg:col-span-1 space-y-4">
              {/* Back button for admin */}
              {!isStudentView && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedMatric(null)}
                  className="w-full"
                >
                  ← Back to student list
                </Button>
              )}

              {/* Student card */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="font-bold text-lg text-foreground">
                      {viewStudent.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {viewStudent.matricNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {viewStudent.department}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">
                      {viewStudent.programmeType}
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                      Level {viewStudent.level}
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                      {viewStudent.entryMode}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Progress summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Graduation Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Credit Units Earned</span>
                      <span className="font-semibold text-foreground">
                        {data.creditsEarned} / {data.minRequired}
                      </span>
                    </div>
                    <Progress value={data.gradProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.gradProgress.toFixed(0)}% complete
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xl font-bold text-foreground">
                        {data.cgpa.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">CGPA</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xl font-bold text-foreground">
                        {viewStudent.semestersCompleted}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Semesters Done
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xl font-bold text-foreground">
                        {data.compulsoriesPassed.length}/
                        {data.compulsoriesAll.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Compulsory Passed
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xl font-bold text-foreground">
                        {data.projectedYear}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Projected Grad
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    className={`rounded-lg p-2.5 text-sm text-center font-medium ${
                      data.onTrack
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : data.gradProgress >= 40
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {data.onTrack
                      ? "✓ On track for graduation"
                      : data.gradProgress >= 40
                        ? "⚠ Making progress"
                        : "⚠ Needs academic attention"}
                  </div>
                </CardContent>
              </Card>

              {/* Remaining compulsory courses */}
              {data.compulsoryRemaining.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-amber-700">
                      <AlertCircle size={14} />
                      Outstanding Compulsory Courses (
                      {data.compulsoryRemaining.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 max-h-64 overflow-y-auto">
                    {data.compulsoryRemaining.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between text-xs bg-amber-50 border border-amber-100 rounded px-2 py-1.5"
                      >
                        <span className="font-mono font-semibold text-amber-700 mr-2">
                          {c.code}
                        </span>
                        <span className="text-foreground flex-1 min-w-0 truncate">
                          {c.title}
                        </span>
                        <span className="text-muted-foreground ml-2 shrink-0">
                          {c.creditUnits}u
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: semester breakdown + compulsory table */}
            <div className="lg:col-span-2 space-y-4">
              {/* Semester by semester breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    Academic Record by Semester
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.semesters.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No semester results found for this student yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.semesters.map((sem) => (
                        <div
                          key={sem.label}
                          className="border border-border rounded-lg overflow-hidden"
                        >
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                            onClick={() =>
                              setExpandedSemester(
                                expandedSemester === sem.label
                                  ? null
                                  : sem.label,
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm text-foreground">
                                {sem.label}
                              </span>
                              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                GPA: {sem.gpa.toFixed(2)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{sem.courses.length} courses</span>
                              <span>{sem.totalCredits} units</span>
                              {expandedSemester === sem.label ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </div>
                          </button>
                          {expandedSemester === sem.label && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-border bg-muted/20">
                                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                                      Course Code
                                    </th>
                                    <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                                      Title
                                    </th>
                                    <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                                      Units
                                    </th>
                                    <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                                      Grade
                                    </th>
                                    <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sem.courses.map((c) => (
                                    <tr
                                      key={c.code}
                                      className="border-b border-border last:border-0 hover:bg-muted/20"
                                    >
                                      <td className="px-3 py-2 font-mono font-semibold text-muted-foreground">
                                        {c.code}
                                      </td>
                                      <td className="px-3 py-2 text-foreground">
                                        {c.title}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {c.creditUnits}
                                      </td>
                                      <td className="px-3 py-2 text-center font-bold">
                                        <span
                                          className={
                                            c.grade === "A"
                                              ? "text-green-600"
                                              : c.grade === "B"
                                                ? "text-blue-600"
                                                : c.grade === "C"
                                                  ? "text-amber-600"
                                                  : c.grade === "F"
                                                    ? "text-red-600"
                                                    : "text-foreground"
                                          }
                                        >
                                          {c.grade}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {c.passed ? (
                                          <CheckCircle
                                            size={13}
                                            className="text-green-600 mx-auto"
                                          />
                                        ) : (
                                          <XCircle
                                            size={13}
                                            className="text-red-500 mx-auto"
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All compulsory courses status table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    All Compulsory Courses Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                            Code
                          </th>
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                            Title
                          </th>
                          <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                            Level
                          </th>
                          <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                            Sem
                          </th>
                          <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                            Units
                          </th>
                          <th className="text-center px-3 py-2 text-muted-foreground font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCoursesByProgramme(
                          viewStudent.programmeType,
                          viewStudent.level,
                        )
                          .filter((c) => c.type === "compulsory")
                          .map((c) => {
                            const passed = data.passedSet.has(c.code);
                            return (
                              <tr
                                key={c.code}
                                className="border-b border-border last:border-0 hover:bg-muted/20"
                              >
                                <td className="px-3 py-2 font-mono font-semibold text-muted-foreground">
                                  {c.code}
                                </td>
                                <td className="px-3 py-2 text-foreground">
                                  {c.title}
                                </td>
                                <td className="px-3 py-2 text-center text-muted-foreground">
                                  {c.level}
                                </td>
                                <td className="px-3 py-2 text-center text-muted-foreground">
                                  {c.semester.charAt(0)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {c.creditUnits}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {passed ? (
                                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                      Passed
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                      Pending
                                    </Badge>
                                  )}
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
          </>
        )}

        {/* Empty state for admin with no student selected */}
        {!isStudentView && !viewStudent && studentsList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <GraduationCap size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No students found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
