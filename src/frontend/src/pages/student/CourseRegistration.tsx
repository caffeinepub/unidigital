import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Info,
  Lock,
  RefreshCw,
  Users,
  X,
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
import { Progress } from "../../components/ui/progress";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  ALL_FUEK_COURSES,
  type FuekCourse,
  REGISTRATION_RULES,
  getBIOCourses,
  getCSCCourses,
  getCompulsoryCourses,
  getElectiveCourses,
  getGSTCourses,
  getTotalCreditUnits,
} from "../../utils/fuekCourseData";
import {
  type CourseRegistration as CourseRegistrationData,
  getLocalRegistrations,
  getLocalResults,
  getLocalStudents,
  isRegistrationOpen,
  saveLocalRegistrations,
} from "../../utils/sampleData";

// ── Extended Student Profile ─────────────────────────────────────────────────

interface ExtendedStudent {
  matricNumber: string;
  name: string;
  email: string;
  level: number;
  department: string;
  programmeType:
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

function getDemoStudent(): ExtendedStudent {
  return {
    matricNumber: "FUEK/SCI/2025/CSC/001",
    name: "Aisha Mohammed",
    email: "aisha@student.edu",
    level: 200,
    department: "Computer Science",
    programmeType: "NCE",
    entryMode: "UTME",
    completedCourses: [
      "GST 111",
      "GST 113",
      "EDU 101",
      "COS 101",
      "MTH 101",
      "MTH 103",
      "PHY 101",
      "PHY 107",
      "GST 112",
      "GST 114",
      "SED 102",
      "COS 102",
      "PHY 102",
      "PHY 108",
      "MTH 102",
      "MTH 104",
    ],
    semestersCompleted: 2,
  };
}

function resolveStudent(userEmail?: string): ExtendedStudent {
  const extended = getExtendedStudents();
  if (userEmail) {
    const match = extended.find((s) => s.email === userEmail);
    if (match) return match;
  }
  const basics = getLocalStudents();
  const basicMatch = basics.find((s) => s.email === userEmail) ?? basics[0];
  if (basicMatch) {
    const existing = extended.find(
      (s) => s.matricNumber === basicMatch.matricNumber,
    );
    if (existing) return existing;
  }
  return getDemoStudent();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENT_SEMESTER = "2024/2025 First";
const SEMESTER_LABEL = "First";

function creditColor(total: number): string {
  if (total < REGISTRATION_RULES.minCreditUnits) return "text-amber-600";
  if (total > REGISTRATION_RULES.maxCreditUnits) return "text-red-600";
  return "text-green-600";
}

function creditBg(total: number): string {
  if (total < REGISTRATION_RULES.minCreditUnits)
    return "bg-amber-50 border-amber-300";
  if (total > REGISTRATION_RULES.maxCreditUnits)
    return "bg-red-50 border-red-400";
  return "bg-green-50 border-green-300";
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  studentMatric?: string;
  userEmail?: string;
  mode?: "student" | "admin" | "hod";
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CourseRegistration({
  studentMatric,
  userEmail,
  mode = "student",
}: Props) {
  const settings = getInstitutionSettings();
  const regOpen =
    isRegistrationOpen() && settings.toggles.courseRegistrationOpen;

  const student = useMemo(() => resolveStudent(userEmail), [userEmail]);
  const matric = studentMatric ?? student.matricNumber;

  const [registrations, setRegistrations] = useState<CourseRegistrationData[]>(
    getLocalRegistrations(),
  );
  const [selectedElectives, setSelectedElectives] = useState<Set<string>>(
    new Set(),
  );
  const [showGraduation, setShowGraduation] = useState(false);
  const [bulkTab, setBulkTab] = useState<"register" | "bulk">("register");
  const [submitted, setSubmitted] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  // Results to determine passed courses
  const allResults = getLocalResults();
  const myResults = allResults.filter((r) => r.studentMatric === matric);

  const passedCodes = useMemo(() => {
    const s = new Set(student.completedCourses);
    for (const r of myResults) {
      if (r.grade !== "F") s.add(r.courseCode);
    }
    return s;
  }, [student.completedCourses, myResults]);

  // Current semester registrations
  const myRegs = registrations.filter(
    (r) => r.studentMatric === matric && r.semester === CURRENT_SEMESTER,
  );
  const myRegCodes = useMemo(
    () => new Set(myRegs.map((r) => r.courseCode)),
    [myRegs],
  );

  // Compulsory courses for this programme/level/semester
  // For BSc-Ed CSC and BIO departments, use the official FUEK course lists
  const compulsoryCourses = useMemo(() => {
    const dept = student.department;
    const lvl = student.level as number;
    const sem = SEMESTER_LABEL;
    if (dept === "Computer Science") {
      return getCSCCourses(lvl, sem).filter((c) => c.type === "compulsory");
    }
    if (dept === "Biology") {
      return getBIOCourses(lvl, sem).filter((c) => c.type === "compulsory");
    }
    return getCompulsoryCourses(student.programmeType, lvl, sem);
  }, [student.department, student.programmeType, student.level]);

  // Elective courses available
  const electiveCourses = useMemo(() => {
    const dept = student.department;
    const lvl = student.level as number;
    const sem = SEMESTER_LABEL;
    if (dept === "Computer Science") {
      return getCSCCourses(lvl, sem).filter((c) => c.type === "elective");
    }
    if (dept === "Biology") {
      return getBIOCourses(lvl, sem).filter((c) => c.type === "elective");
    }
    return getElectiveCourses(student.programmeType, lvl, sem);
  }, [student.department, student.programmeType, student.level]);

  // Carryover detection: courses previously registered (past semesters) but NOT passed
  const prevRegs = registrations.filter(
    (r) => r.studentMatric === matric && r.semester !== CURRENT_SEMESTER,
  );

  const carryCodes = useMemo(() => {
    const codes = new Set<string>();
    if (student.level < 200) return codes;
    for (const r of prevRegs) {
      if (!passedCodes.has(r.courseCode)) codes.add(r.courseCode);
    }
    return codes;
  }, [student.level, prevRegs, passedCodes]);

  const carryoverCourses = useMemo(
    () =>
      Array.from(carryCodes)
        .map((code) => ALL_FUEK_COURSES.find((c) => c.code === code))
        .filter((c): c is FuekCourse => !!c),
    [carryCodes],
  );

  // DE gate: missing 100L GST courses
  const requiredGSTCodes = useMemo(() => {
    if (student.entryMode !== "DE") return new Set<string>();
    const gstAt100 = getGSTCourses(100).filter(
      (c) => c.programmeType === student.programmeType,
    );
    const missing = new Set<string>();
    for (const c of gstAt100) {
      if (!passedCodes.has(c.code)) missing.add(c.code);
    }
    return missing;
  }, [student.entryMode, student.programmeType, passedCodes]);

  const missingGSTCourses = useMemo(
    () => ALL_FUEK_COURSES.filter((c) => requiredGSTCodes.has(c.code)),
    [requiredGSTCodes],
  );

  // Auto-selected locked course codes (compulsory + carryover)
  const autoSelectedCodes = useMemo(() => {
    const s = new Set(compulsoryCourses.map((c) => c.code));
    for (const c of carryoverCourses) s.add(c.code);
    return s;
  }, [compulsoryCourses, carryoverCourses]);

  // All selected courses for credit counting
  const allSelectedCourses = useMemo(() => {
    const codes = new Set([...autoSelectedCodes, ...selectedElectives]);
    return ALL_FUEK_COURSES.filter((c) => codes.has(c.code));
  }, [autoSelectedCodes, selectedElectives]);

  const totalCredits = getTotalCreditUnits(allSelectedCourses);

  // Submission validation
  const hasCarryoverBlocking = carryoverCourses.length > 0;
  const hasDEBlocking =
    student.entryMode === "DE" && missingGSTCourses.length > 0;
  const creditValid =
    totalCredits >= REGISTRATION_RULES.minCreditUnits &&
    totalCredits <= REGISTRATION_RULES.maxCreditUnits;
  const canSubmit =
    regOpen && creditValid && !hasCarryoverBlocking && !hasDEBlocking;

  // Graduation tracker data
  const creditsEarned = passedCodes.size * 3;
  const minRequired =
    student.entryMode === "UTME"
      ? REGISTRATION_RULES.utmeMinCredits
      : REGISTRATION_RULES.deMinCredits;
  const gradProgress = Math.min((creditsEarned / minRequired) * 100, 100);

  const compulsoriesAll = useMemo(() => {
    if (student.department === "Computer Science") {
      return getCSCCourses().filter((c) => c.type === "compulsory");
    }
    if (student.department === "Biology") {
      return getBIOCourses().filter((c) => c.type === "compulsory");
    }
    return ALL_FUEK_COURSES.filter(
      (c) =>
        c.programmeType === student.programmeType && c.type === "compulsory",
    );
  }, [student.department, student.programmeType]);

  const compulsoriesPassed = compulsoriesAll.filter((c) =>
    passedCodes.has(c.code),
  );

  // Toggle elective
  const toggleElective = (code: string, course: FuekCourse) => {
    if (!regOpen) return;
    const unmetPrereq = course.prerequisites.find((p) => !passedCodes.has(p));
    if (unmetPrereq && !selectedElectives.has(code)) {
      const prereqCourse = ALL_FUEK_COURSES.find((c) => c.code === unmetPrereq);
      alert(
        `You must first pass ${unmetPrereq}${prereqCourse ? `: ${prereqCourse.title}` : ""} before registering this course.`,
      );
      return;
    }
    setSelectedElectives((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Submit registration
  const handleSubmit = () => {
    if (!canSubmit) return;
    const newRegs: CourseRegistrationData[] = [];
    for (const course of allSelectedCourses) {
      if (!myRegCodes.has(course.code)) {
        newRegs.push({
          id: `REG-${Date.now()}-${course.code}`,
          studentMatric: matric,
          courseCode: course.code,
          semester: CURRENT_SEMESTER,
          registeredAt: new Date().toISOString().split("T")[0],
        });
      }
    }
    const updated = [...registrations, ...newRegs];
    setRegistrations(updated);
    saveLocalRegistrations(updated);
    setSubmitted(true);
  };

  // Drop a registered course (elective only)
  const drop = (code: string) => {
    if (!regOpen) return;
    if (autoSelectedCodes.has(code)) return;
    const updated = registrations.filter(
      (r) =>
        !(
          r.studentMatric === matric &&
          r.courseCode === code &&
          r.semester === CURRENT_SEMESTER
        ),
    );
    setRegistrations(updated);
    saveLocalRegistrations(updated);
    setSelectedElectives((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  };

  // AI bulk assignment simulation
  const handleAIAssign = () => {
    setAiProcessing(true);
    setTimeout(() => {
      const eligible = electiveCourses.filter((c) => {
        const unmet = c.prerequisites.find((p) => !passedCodes.has(p));
        return !unmet;
      });
      const needed =
        REGISTRATION_RULES.minCreditUnits -
        getTotalCreditUnits(compulsoryCourses);
      let added = 0;
      const next = new Set<string>();
      for (const c of eligible) {
        if (added + c.creditUnits <= needed + 6) {
          next.add(c.code);
          added += c.creditUnits;
        }
        if (added >= needed) break;
      }
      setSelectedElectives(next);
      setAiProcessing(false);
    }, 1500);
  };

  const isAdminMode = mode === "admin" || mode === "hod";

  // If admin view is in bulk tab, show bulk UI
  if (isAdminMode && bulkTab === "bulk") {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            Course Registration
          </h1>
        </div>
        <div className="flex gap-2 border-b border-border pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkTab("register")}
          >
            Student Registration
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setBulkTab("bulk")}
          >
            <Users size={14} className="mr-1.5" />
            Bulk Course Registration
          </Button>
        </div>
        <BulkCourseRegistration mode={mode as "admin" | "hod"} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Registration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {student.name} — {student.programmeType} Level {student.level} (
            {student.entryMode}) • {CURRENT_SEMESTER}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${creditBg(totalCredits)}`}
            data-ocid="registration.credit_counter"
          >
            <span className={creditColor(totalCredits)}>
              {totalCredits} / {REGISTRATION_RULES.maxCreditUnits} Credit Units
            </span>
          </div>
          <Badge
            className={
              regOpen
                ? "bg-green-100 text-green-700 border-0"
                : "bg-red-100 text-red-700 border-0"
            }
          >
            {regOpen ? "Registration Open" : "Registration Closed"}
          </Badge>
        </div>
      </div>

      {/* Admin tab selector */}
      {isAdminMode && (
        <div className="flex gap-2 border-b border-border pb-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => setBulkTab("register")}
          >
            Student Registration
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkTab("bulk")}
          >
            <Users size={14} className="mr-1.5" />
            Bulk Course Registration
          </Button>
        </div>
      )}

      {/* System closed banner */}
      {!regOpen && (
        <div
          className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-800"
          data-ocid="registration.info_banner"
        >
          <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-sm">
              Course Registration Currently Closed
            </p>
            <p className="text-sm mt-0.5">
              Course registration is currently closed by the administrator.
              Contact the Academic Office for assistance.
            </p>
          </div>
        </div>
      )}

      {/* Submitted success */}
      {submitted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-lg p-4 text-green-800">
          <CheckCircle size={18} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              Registration Submitted Successfully!
            </p>
            <p className="text-sm mt-0.5">
              {allSelectedCourses.length} courses ({totalCredits} credit units)
              registered for {CURRENT_SEMESTER}.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setSubmitted(false)}
          >
            View
          </Button>
        </div>
      )}

      {/* DE Gate: Missing GST */}
      {student.entryMode === "DE" && missingGSTCourses.length > 0 && (
        <div
          className="rounded-lg border-2 border-red-400 bg-red-50 p-4 space-y-3"
          data-ocid="registration.de_gate_banner"
        >
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertTriangle size={18} />
            DE students must register all 100-level GST courses first
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {missingGSTCourses.map((c) => (
              <div
                key={c.code}
                className="bg-card border border-red-200 rounded px-3 py-2 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-semibold text-red-700">
                    {c.code}
                  </span>
                  <p className="text-sm text-foreground">{c.title}</p>
                </div>
                <Badge className="bg-red-100 text-red-700 border-0 text-xs shrink-0 ml-2">
                  {c.creditUnits} units
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carryover Banner */}
      {carryoverCourses.length > 0 && (
        <div
          className="rounded-lg border-2 border-orange-400 bg-orange-50 p-4 space-y-3"
          data-ocid="registration.carryover_banner"
        >
          <div className="flex items-center gap-2 text-orange-700 font-semibold">
            <AlertCircle size={18} />
            You have {carryoverCourses.length} carryover course(s) that must be
            registered first
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {carryoverCourses.map((c) => (
              <div
                key={c.code}
                className="bg-card border border-orange-200 rounded px-3 py-2 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-semibold text-orange-700">
                    {c.code}
                  </span>
                  <p className="text-sm text-foreground">{c.title}</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-0 text-xs shrink-0 ml-2">
                  {c.creditUnits} units
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit unit validation warnings */}
      {totalCredits < REGISTRATION_RULES.minCreditUnits && totalCredits > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          You need at least {REGISTRATION_RULES.minCreditUnits} credit units to
          register. Currently: {totalCredits}.
        </div>
      )}
      {totalCredits > REGISTRATION_RULES.maxCreditUnits && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          Maximum is {REGISTRATION_RULES.maxCreditUnits} credit units — please
          deselect some electives. Currently: {totalCredits}.
        </div>
      )}

      {/* Carryover section */}
      {carryoverCourses.length > 0 && (
        <Card className="border-2 border-orange-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
              <Lock size={16} />
              CARRYOVER COURSES (Required — Auto-Selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid sm:grid-cols-2 gap-3"
              data-ocid="registration.carryover_list"
            >
              {carryoverCourses.map((course, i) => (
                <div
                  key={course.code}
                  className="border border-orange-200 bg-orange-50 rounded-lg p-3 flex items-start justify-between"
                  data-ocid={`registration.carryover_item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-orange-700">
                        {course.code}
                      </span>
                      <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                        Carryover
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.creditUnits} credit units
                    </p>
                  </div>
                  <Lock
                    size={14}
                    className="text-orange-500 mt-1 shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compulsory courses section */}
      {compulsoryCourses.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <Lock size={16} />
              COMPULSORY COURSES (Auto-Selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid sm:grid-cols-2 gap-3"
              data-ocid="registration.compulsory_list"
            >
              {compulsoryCourses.map((course, i) => (
                <div
                  key={course.code}
                  title="This course is compulsory for your programme"
                  className="border border-green-200 bg-green-50 rounded-lg p-3 flex items-start justify-between cursor-default"
                  data-ocid={`registration.compulsory_item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-green-700">
                        {course.code}
                      </span>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        Compulsory
                      </Badge>
                      {course.isGST && (
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                          GST
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.creditUnits} credit units • {course.department}
                    </p>
                  </div>
                  <Lock
                    size={14}
                    className="text-green-500 mt-1 shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elective courses section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              ELECTIVE COURSES (Select Your Choices)
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAIAssign}
              disabled={!regOpen || aiProcessing}
              data-ocid="registration.ai_assign_button"
            >
              {aiProcessing ? (
                <>
                  <RefreshCw size={13} className="mr-1.5 animate-spin" />
                  AI Assigning…
                </>
              ) : (
                <>
                  <RefreshCw size={13} className="mr-1.5" />
                  AI Auto-Select
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {electiveCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No elective courses available for your programme and level this
              semester.
            </p>
          ) : (
            <div
              className="grid sm:grid-cols-2 gap-3"
              data-ocid="registration.elective_list"
            >
              {electiveCourses.map((course, i) => {
                const unmetPrereq = course.prerequisites.find(
                  (p) => !passedCodes.has(p),
                );
                const prereqCourse = unmetPrereq
                  ? ALL_FUEK_COURSES.find((c) => c.code === unmetPrereq)
                  : null;
                const isSelected = selectedElectives.has(course.code);
                const isLocked = !!unmetPrereq;

                return (
                  <button
                    key={course.code}
                    type="button"
                    onClick={() =>
                      !isLocked && toggleElective(course.code, course)
                    }
                    disabled={isLocked}
                    aria-pressed={isSelected}
                    title={
                      isLocked
                        ? `Prerequisite required: ${unmetPrereq}${prereqCourse ? ` — ${prereqCourse.title}` : ""}`
                        : "Click to select/deselect"
                    }
                    className={`w-full text-left border rounded-lg p-3 transition-colors select-none ${
                      isLocked
                        ? "bg-muted/50 border-border opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "bg-primary/10 border-primary cursor-pointer"
                          : "bg-card border-border hover:border-primary/50 cursor-pointer"
                    }`}
                    data-ocid={`registration.elective_item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-muted-foreground">
                            {course.code}
                          </span>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <Lock size={11} /> Prereq: {unmetPrereq}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.creditUnits} credit units
                        </p>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        {isLocked ? (
                          <Lock size={15} className="text-muted-foreground" />
                        ) : isSelected ? (
                          <CheckCircle size={16} className="text-primary" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-border" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currently registered courses (this semester) */}
      {myRegs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              Registered Courses This Semester ({myRegs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2" data-ocid="registration.registered_list">
              {myRegs.map((reg, i) => {
                const course = ALL_FUEK_COURSES.find(
                  (c) => c.code === reg.courseCode,
                );
                const isCompulsory = autoSelectedCodes.has(reg.courseCode);
                return (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-3"
                    data-ocid={`registration.registered_item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {course?.title ?? reg.courseCode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reg.courseCode} • {course?.creditUnits ?? "?"} units •{" "}
                        {reg.semester}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isCompulsory ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          Compulsory
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                          Elective
                        </Badge>
                      )}
                      {regOpen && !isCompulsory && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Drop ${reg.courseCode}`}
                          className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                          onClick={() => drop(reg.courseCode)}
                          data-ocid={`registration.drop_button.${i + 1}`}
                        >
                          <X size={13} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graduation Status Panel */}
      <Card className="border border-border">
        <CardHeader
          className="pb-2 cursor-pointer"
          onClick={() => setShowGraduation(!showGraduation)}
        >
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap size={16} className="text-primary" />
              Graduation Status Tracker
            </span>
            {showGraduation ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </CardTitle>
        </CardHeader>
        {showGraduation && (
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Total Credits Earned
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {creditsEarned}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {minRequired}
                  </span>
                </p>
                <Progress value={gradProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {gradProgress.toFixed(0)}% toward graduation
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Compulsory Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {compulsoriesPassed.length}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {compulsoriesAll.length} passed
                  </span>
                </p>
                <p
                  className={`text-xs ${
                    compulsoriesPassed.length === compulsoriesAll.length
                      ? "text-green-600 font-medium"
                      : compulsoriesPassed.length >=
                          compulsoriesAll.length * 0.7
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {compulsoriesPassed.length === compulsoriesAll.length
                    ? "All compulsories passed ✓"
                    : `${compulsoriesAll.length - compulsoriesPassed.length} remaining`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Entry Mode</p>
                <p className="font-semibold text-foreground">
                  {student.entryMode}
                </p>
                <p className="text-xs text-muted-foreground">
                  Min.{" "}
                  {student.entryMode === "UTME"
                    ? REGISTRATION_RULES.utmeMinSemesters
                    : REGISTRATION_RULES.deMinSemesters}
                  –
                  {student.entryMode === "UTME"
                    ? REGISTRATION_RULES.utmeMaxSemesters
                    : REGISTRATION_RULES.deMaxSemesters}{" "}
                  semesters
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Semesters Completed
                </p>
                <p className="font-semibold text-foreground">
                  {student.semestersCompleted}
                </p>
                <p className="text-xs text-muted-foreground">
                  Est. remaining:{" "}
                  {Math.max(
                    0,
                    (student.entryMode === "UTME"
                      ? REGISTRATION_RULES.utmeMinSemesters
                      : REGISTRATION_RULES.deMinSemesters) -
                      student.semestersCompleted,
                  )}{" "}
                  semesters
                </p>
              </div>
            </div>

            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                gradProgress >= 80 &&
                compulsoriesPassed.length >= compulsoriesAll.length * 0.9
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : gradProgress >= 50
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {gradProgress >= 80 &&
              compulsoriesPassed.length >= compulsoriesAll.length * 0.9
                ? "✓ On track for graduation"
                : gradProgress >= 50
                  ? "⚠ Making progress — keep up the pace"
                  : "⚠ Needs attention — contact your academic advisor"}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Submit Button */}
      <div
        className="sticky bottom-4 pt-2"
        data-ocid="registration.submit_section"
      >
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 text-sm text-muted-foreground min-w-0">
            {!canSubmit && (
              <ul className="space-y-0.5">
                {!regOpen && (
                  <li className="text-amber-600">
                    • Registration is currently closed
                  </li>
                )}
                {hasCarryoverBlocking && (
                  <li className="text-orange-600">
                    • Register all carryover courses first
                  </li>
                )}
                {hasDEBlocking && (
                  <li className="text-red-600">
                    • DE students must complete 100L GST courses first
                  </li>
                )}
                {!creditValid &&
                  totalCredits < REGISTRATION_RULES.minCreditUnits && (
                    <li className="text-amber-600">
                      • Need at least {REGISTRATION_RULES.minCreditUnits} credit
                      units
                    </li>
                  )}
                {!creditValid &&
                  totalCredits > REGISTRATION_RULES.maxCreditUnits && (
                    <li className="text-red-600">
                      • Exceeds maximum {REGISTRATION_RULES.maxCreditUnits}{" "}
                      credit units
                    </li>
                  )}
              </ul>
            )}
            {canSubmit && (
              <p className="text-green-600 font-medium">
                ✓ Ready to submit — {allSelectedCourses.length} courses,{" "}
                {totalCredits} credit units
              </p>
            )}
          </div>
          <Button
            size="lg"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="shrink-0 min-w-[180px]"
            data-ocid="registration.submit_button"
          >
            <CheckCircle size={16} className="mr-2" />
            Submit Registration
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Registration (Admin/HOD) ─────────────────────────────────────────────

interface BulkRegistrationProps {
  mode: "admin" | "hod";
}

export function BulkCourseRegistration({ mode: _mode }: BulkRegistrationProps) {
  const [programme, setProgramme] = useState<string>("NCE");
  const [level, setLevel] = useState<number>(100);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const students = useMemo(() => getLocalStudents(), []);

  const handleAutoAssign = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  const programmeOptions = [
    "NCE",
    "NUC",
    "OND",
    "HND",
    "PGD",
    "PGDE",
    "PhD",
    "MSc",
    "MPhil",
    "Certificate",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label
            htmlFor="bulk-programme"
            className="text-xs text-muted-foreground block mb-1"
          >
            Programme
          </label>
          <select
            id="bulk-programme"
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="border border-input rounded px-2 py-1.5 text-sm bg-card"
          >
            {programmeOptions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="bulk-level"
            className="text-xs text-muted-foreground block mb-1"
          >
            Level
          </label>
          <select
            id="bulk-level"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="border border-input rounded px-2 py-1.5 text-sm bg-card"
          >
            {[100, 200, 300, 400].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleAutoAssign}
          disabled={processing}
          size="sm"
          data-ocid="bulk_registration.auto_assign_button"
        >
          {processing ? (
            <>
              <RefreshCw size={13} className="mr-1.5 animate-spin" />{" "}
              Processing…
            </>
          ) : (
            <>Auto-Assign Compulsory Courses</>
          )}
        </Button>
      </div>

      {done && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          Compulsory courses assigned to all {programme} Level {level} students
          successfully.
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Matric No.
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Name
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Department
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Level
              </th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 10).map((s, i) => (
              <tr
                key={s.matricNumber}
                className="border-b border-border last:border-0 hover:bg-muted/30"
                data-ocid={`bulk_registration.row.${i + 1}`}
              >
                <td className="px-3 py-2 font-mono text-xs">
                  {s.matricNumber}
                </td>
                <td className="px-3 py-2 font-medium">{s.name}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {s.department}
                </td>
                <td className="px-3 py-2">{s.level}L</td>
                <td className="px-3 py-2">
                  <Badge
                    className={
                      done
                        ? "bg-green-100 text-green-700 border-0 text-xs"
                        : "bg-muted text-muted-foreground border-0 text-xs"
                    }
                  >
                    {done ? "Assigned" : "Pending"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
