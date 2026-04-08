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
  Printer,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { getInstitutionSettings } from "../../hooks/useInstitutionSettings";
import {
  ALL_FUEK_COURSES,
  type FuekCourse,
  REGISTRATION_RULES,
  getBIOCourses,
  getCHMCourses,
  getCSCCourses,
  getCoursesByDepartment,
  getEEDCourses,
  getEISCourses,
  getGSTCourses,
  getMTHCourses,
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

// ── Dept min credit rules ────────────────────────────────────────────────────

const DEPT_MIN_CREDITS: Record<string, number> = {
  "Human Kinetics": 18,
  "Health & Human Kinetics": 18,
  "Health Education": 18,
  Chemistry: 18,
};

function getDeptMin(department: string): number {
  return DEPT_MIN_CREDITS[department] ?? REGISTRATION_RULES.minCreditUnits;
}

// ── EED elective rules ────────────────────────────────────────────────────────

interface EEDElectiveRule {
  minElectives: number;
  electiveCodes: string[];
  message: string;
}

function getEEDElectiveRule(
  level: number,
  semester: string,
): EEDElectiveRule | null {
  if (level === 400 && semester === "First") {
    return {
      minElectives: 1,
      electiveCodes: ["EED 401", "EED 403", "EED 411"],
      message:
        "400L Semester 1: You must select at least 1 elective course (EED 401, EED 403, or EED 411).",
    };
  }
  if (level === 400 && semester === "Second") {
    return {
      minElectives: 2,
      electiveCodes: [
        "EED 404",
        "EED 410",
        "EED 412",
        "EED 414",
        "EED 416",
        "EED 418",
      ],
      message:
        "400L Semester 2: You must select at least 2 elective courses from the EED 400L electives.",
    };
  }
  return null;
}

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

// ── Dept course loader ────────────────────────────────────────────────────────

type BscEdDept =
  | "Computer Science"
  | "Biology"
  | "Chemistry"
  | "Integrated Science"
  | "Mathematics"
  | "Education & Mathematics"
  | "Environmental Education";

const BSC_ED_DEPTS: string[] = [
  "Computer Science",
  "Biology",
  "Chemistry",
  "Integrated Science",
  "Mathematics",
  "Education & Mathematics",
  "Environmental Education",
];

function loadDeptCourses(
  dept: string,
  level: number,
  semester: string,
): { compulsory: FuekCourse[]; elective: FuekCourse[] } {
  let all: FuekCourse[] = [];

  if (BSC_ED_DEPTS.includes(dept)) {
    all = getCoursesByDepartment(dept as BscEdDept, level, semester);
  } else if (dept === "Human Kinetics" || dept === "Health & Human Kinetics") {
    // Use NUC courses as proxy for HKE — filter by HKE dept references
    const hkeCourses = ALL_FUEK_COURSES.filter(
      (c) =>
        (c.department === "Human Kinetics Education" ||
          c.subjectArea === "Human Kinetics") &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both"),
    );
    // Also add shared GST + EDU courses for this level
    const gst = ALL_FUEK_COURSES.filter(
      (c) =>
        (c.isGST || c.department === "Education") &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both") &&
        (c.programmeType === "NUC" || c.programmeType === "NCE"),
    ).slice(0, 4);
    all = [...gst, ...hkeCourses];
  } else if (dept === "Health Education") {
    const eheCourses = ALL_FUEK_COURSES.filter(
      (c) =>
        (c.department === "Health Education" ||
          c.subjectArea === "Health Education") &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both"),
    );
    const gst = ALL_FUEK_COURSES.filter(
      (c) =>
        (c.isGST || c.department === "Education") &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both") &&
        (c.programmeType === "NUC" || c.programmeType === "NCE"),
    ).slice(0, 4);
    all = [...gst, ...eheCourses];
  } else if (dept === "Physics") {
    const phyCourses = ALL_FUEK_COURSES.filter(
      (c) =>
        (c.department === "Education & Physics" ||
          c.subjectArea === "Physics") &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both"),
    );
    const gst = ALL_FUEK_COURSES.filter(
      (c) =>
        c.isGST &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both") &&
        c.programmeType === "NUC",
    ).slice(0, 3);
    all = [...gst, ...phyCourses];
  } else {
    // Generic fallback: use NUC programme type
    all = ALL_FUEK_COURSES.filter(
      (c) =>
        c.programmeType === "NUC" &&
        c.level === level &&
        (c.semester === semester || c.semester === "Both"),
    );
  }

  return {
    compulsory: all.filter((c) => c.type === "compulsory"),
    elective: all.filter((c) => c.type === "elective"),
  };
}

// ── Credit color helpers ─────────────────────────────────────────────────────

function creditColor(total: number, min: number): string {
  if (total < min) return "text-amber-600";
  if (total > REGISTRATION_RULES.maxCreditUnits) return "text-red-600";
  return "text-green-600";
}

function creditBg(total: number, min: number): string {
  if (total < min) return "bg-amber-50 border-amber-300";
  if (total > REGISTRATION_RULES.maxCreditUnits)
    return "bg-red-50 border-red-400";
  return "bg-green-50 border-green-300";
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENT_SEMESTER = "2024/2025 First";
const SEMESTER_LABEL = "First";
const ACADEMIC_SESSION = "2024/2025";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  studentMatric?: string;
  userEmail?: string;
  mode?: "student" | "admin" | "hod";
}

// ── Registration Confirmation Modal ──────────────────────────────────────────

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  student: ExtendedStudent;
  courses: FuekCourse[];
  totalCredits: number;
  registeredAt: string;
  carryoverCodes: Set<string>;
  compulsoryCodes: Set<string>;
}

function RegistrationConfirmationModal({
  open,
  onClose,
  student,
  courses,
  totalCredits,
  registeredAt,
  carryoverCodes,
  compulsoryCodes,
}: ConfirmationModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Course Registration Form — ${student.matricNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; padding: 20mm; }
          h1 { text-align: center; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
          h2 { text-align: center; font-size: 12pt; font-weight: normal; margin-top: 4px; }
          .subtitle { text-align: center; font-size: 11pt; margin-top: 2px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin: 16px 0; }
          .info-row { display: flex; gap: 6px; font-size: 11pt; }
          .info-label { font-weight: bold; min-width: 130px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11pt; }
          th { border: 1px solid #000; padding: 6px; background: #f0f0f0; text-align: left; font-weight: bold; }
          td { border: 1px solid #000; padding: 5px 6px; }
          .total-row td { font-weight: bold; background: #f8f8f8; }
          .footer-note { margin-top: 12px; font-size: 10pt; border: 1px solid #000; padding: 8px; }
          .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-top: 40px; }
          .sig-block { border-top: 1px solid #000; padding-top: 4px; font-size: 10pt; text-align: center; }
          @media print { body { padding: 15mm; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const getCourseType = (code: string): string => {
    if (carryoverCodes.has(code)) return "Carryover";
    if (compulsoryCodes.has(code)) return "Compulsory";
    return "Elective";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Registration Confirmation</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer size={14} />
              Print Form
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          {/* Institution Header */}
          <div className="text-center border-b-2 border-border pb-4">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
              Federal Republic of Nigeria
            </p>
            <h1 className="text-lg font-bold text-foreground mt-1">
              Federal University of Education, Kontagora
            </h1>
            <p className="text-sm font-semibold text-primary">
              Faculty of Science Education (FUEK)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Course Registration Form — {ACADEMIC_SESSION} Academic Session
            </p>
            <div className="mt-2 inline-block bg-green-50 border border-green-200 rounded px-3 py-1">
              <p className="text-xs font-semibold text-green-700">
                ✓ APPROVED — Subject to Verification by Academic Office
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ["Full Name", student.name],
              ["Matric Number", student.matricNumber],
              ["Department", student.department],
              ["Programme", student.programmeType],
              ["Level", `${student.level} Level`],
              ["Entry Mode", student.entryMode],
              ["Semester", SEMESTER_LABEL],
              ["Academic Session", ACADEMIC_SESSION],
              [
                "Registration Date",
                new Date(registeredAt).toLocaleDateString("en-NG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }),
              ],
              [
                "Registration Time",
                new Date(registeredAt).toLocaleTimeString("en-NG"),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="font-semibold text-muted-foreground min-w-[120px]">
                  {label}:
                </span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {/* Course Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                    S/N
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                    Course Code
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                    Course Title
                  </th>
                  <th className="text-center px-3 py-2 font-semibold text-muted-foreground">
                    Credit Units
                  </th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, idx) => {
                  const type = getCourseType(course.code);
                  return (
                    <tr
                      key={course.code}
                      className="border-b border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                        {course.code}
                      </td>
                      <td className="px-3 py-2">{course.title}</td>
                      <td className="px-3 py-2 text-center font-semibold">
                        {course.creditUnits}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            type === "Carryover"
                              ? "bg-orange-100 text-orange-700"
                              : type === "Compulsory"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/40 font-bold border-t-2 border-border">
                  <td colSpan={3} className="px-3 py-2 text-right">
                    Total Credit Units Registered:
                  </td>
                  <td className="px-3 py-2 text-center text-primary text-base">
                    {totalCredits}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="bg-muted/30 border border-border rounded p-3 text-xs text-muted-foreground space-y-1">
            <p>
              This registration form is issued by the Academic Registry, Federal
              University of Education, Kontagora (FUEK).
            </p>
            <p>
              Students are advised to keep a copy for their records. This form
              is valid for the {ACADEMIC_SESSION} academic session only.
            </p>
            <p className="font-semibold text-foreground">
              UniDigital MIS — FUEK | Printed:{" "}
              {new Date().toLocaleString("en-NG")}
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-8">
            {["Student Signature", "HOD / Academic Adviser", "Registrar"].map(
              (sig) => (
                <div
                  key={sig}
                  className="border-t border-border pt-2 text-center text-xs text-muted-foreground"
                >
                  {sig}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            <X size={14} className="mr-1.5" />
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Printer size={14} />
            Print Registration Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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

  const deptMin = getDeptMin(student.department);

  const [registrations, setRegistrations] = useState<CourseRegistrationData[]>(
    getLocalRegistrations(),
  );
  const [selectedElectives, setSelectedElectives] = useState<Set<string>>(
    new Set(),
  );
  const [showGraduation, setShowGraduation] = useState(false);
  const [bulkTab, setBulkTab] = useState<"register" | "bulk">("register");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registeredAt, setRegisteredAt] = useState<string>("");
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

  // Load courses using unified getCoursesByDepartment or fallback
  const { compulsory: compulsoryCourses, elective: electiveCourses } = useMemo(
    () => loadDeptCourses(student.department, student.level, SEMESTER_LABEL),
    [student.department, student.level],
  );

  // Carryover detection: previous semester registrations that were NOT passed
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

  // EED elective rule
  const eedRule = useMemo(() => {
    if (student.department !== "Environmental Education") return null;
    return getEEDElectiveRule(student.level, SEMESTER_LABEL);
  }, [student.department, student.level]);

  const eedElectivesSelected = useMemo(() => {
    if (!eedRule) return 0;
    return eedRule.electiveCodes.filter((code) => selectedElectives.has(code))
      .length;
  }, [eedRule, selectedElectives]);

  const eedElectiveValid = eedRule
    ? eedElectivesSelected >= eedRule.minElectives
    : true;

  // Submission validation
  const hasDEBlocking =
    student.entryMode === "DE" && missingGSTCourses.length > 0;
  const creditValid =
    totalCredits >= deptMin &&
    totalCredits <= REGISTRATION_RULES.maxCreditUnits;
  const canSubmit =
    regOpen && creditValid && !hasDEBlocking && eedElectiveValid;

  // Graduation tracker
  const creditsEarned = passedCodes.size * 3;
  const minRequired =
    student.entryMode === "UTME"
      ? REGISTRATION_RULES.utmeMinCredits
      : REGISTRATION_RULES.deMinCredits;
  const gradProgress = Math.min((creditsEarned / minRequired) * 100, 100);

  const compulsoriesAll = useMemo(() => {
    const dept = student.department;
    if (BSC_ED_DEPTS.includes(dept)) {
      return ALL_FUEK_COURSES.filter((c) => {
        const deptCourses = loadDeptCourses(
          dept,
          c.level as number,
          c.semester === "Both" ? "First" : c.semester,
        );
        return (
          deptCourses.compulsory.some((dc) => dc.code === c.code) &&
          c.type === "compulsory"
        );
      });
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
    setRegisteredAt(new Date().toISOString());
    setShowConfirmModal(true);
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

  // AI bulk elective auto-select
  const handleAIAssign = () => {
    setAiProcessing(true);
    setTimeout(() => {
      const eligible = electiveCourses.filter((c) => {
        const unmet = c.prerequisites.find((p) => !passedCodes.has(p));
        return !unmet;
      });
      const compulsoryTotal =
        getTotalCreditUnits(compulsoryCourses) +
        getTotalCreditUnits(carryoverCourses);
      const needed = deptMin - compulsoryTotal;
      let added = 0;
      const next = new Set<string>();
      for (const c of eligible) {
        if (added + c.creditUnits <= needed + 6) {
          next.add(c.code);
          added += c.creditUnits;
        }
        if (added >= needed) break;
      }
      // Ensure EED elective minimums
      if (eedRule) {
        let eedCount = 0;
        for (const code of eedRule.electiveCodes) {
          if (next.has(code)) eedCount++;
        }
        if (eedCount < eedRule.minElectives) {
          for (const code of eedRule.electiveCodes) {
            if (!next.has(code)) {
              next.add(code);
              eedCount++;
              if (eedCount >= eedRule.minElectives) break;
            }
          }
        }
      }
      setSelectedElectives(next);
      setAiProcessing(false);
    }, 1500);
  };

  const isAdminMode = mode === "admin" || mode === "hod";

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

  const compulsoryCreditTotal = getTotalCreditUnits(compulsoryCourses);
  const carryoverCreditTotal = getTotalCreditUnits(carryoverCourses);

  return (
    <div className="space-y-5">
      {/* Header row with credit counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Registration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {student.name} — {student.department} · Level {student.level} (
            {student.entryMode}) · {CURRENT_SEMESTER}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${creditBg(totalCredits, deptMin)}`}
            data-ocid="registration.credit_counter"
          >
            <span className={creditColor(totalCredits, deptMin)}>
              {totalCredits} Credit Units
            </span>
            <span className="text-muted-foreground font-normal text-xs">
              Min {deptMin} – Max {REGISTRATION_RULES.maxCreditUnits}
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
              Course registration is closed by the administrator. Contact the
              Academic Office for assistance.
            </p>
          </div>
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
                  {c.creditUnits}C
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EED Elective Rule Info */}
      {eedRule && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-300 rounded-lg p-4 text-blue-800">
          <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold text-sm">
              Environmental Education — Elective Requirement
            </p>
            <p className="text-sm mt-0.5">{eedRule.message}</p>
            <p className="text-sm mt-1">
              Eligible elective codes:{" "}
              <span className="font-mono font-semibold">
                {eedRule.electiveCodes.join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Credit Summary Card */}
      <Card className={`border-2 ${creditBg(totalCredits, deptMin)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Credit Unit Summary
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {totalCredits}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Selected
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-orange-600">
                    {carryoverCreditTotal}
                  </p>
                  <p className="text-xs text-muted-foreground">Carryover</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">
                    {compulsoryCreditTotal}
                  </p>
                  <p className="text-xs text-muted-foreground">Compulsory</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-600">
                    {totalCredits -
                      compulsoryCreditTotal -
                      carryoverCreditTotal}
                  </p>
                  <p className="text-xs text-muted-foreground">Electives</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${creditColor(totalCredits, deptMin)}`}
              >
                {totalCredits < deptMin
                  ? `${deptMin - totalCredits} more units needed`
                  : totalCredits > REGISTRATION_RULES.maxCreditUnits
                    ? `${totalCredits - REGISTRATION_RULES.maxCreditUnits} units over max`
                    : "✓ Credits in valid range"}
              </p>
              <p className="text-xs text-muted-foreground">
                Allowed: {deptMin}–{REGISTRATION_RULES.maxCreditUnits} units
                {student.department !== "Computer Science" &&
                  deptMin === 18 &&
                  " (dept. min 18C)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: Carryover Courses */}
      {carryoverCourses.length > 0 && (
        <Card className="border-2 border-orange-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
              <Lock size={16} />
              CARRYOVER COURSES — Auto-Selected &amp; Locked (
              {carryoverCourses.length} courses, {carryoverCreditTotal} units)
            </CardTitle>
            <p className="text-xs text-orange-600 mt-1">
              These courses were not passed in previous semesters and must be
              registered. They cannot be removed.
            </p>
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
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      aria-label={`Carryover: ${course.code}`}
                      className="mt-1 h-4 w-4 accent-orange-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-orange-700">
                          {course.code}
                        </span>
                        <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                          Carryover
                        </Badge>
                        <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                          {course.creditUnits}C
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                        {course.title}
                      </p>
                    </div>
                  </div>
                  <Lock
                    size={14}
                    className="text-orange-400 mt-1 shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: Compulsory Courses */}
      {compulsoryCourses.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <Lock size={16} />
              COMPULSORY COURSES — Auto-Selected &amp; Locked (
              {compulsoryCourses.length} courses, {compulsoryCreditTotal} units)
            </CardTitle>
            <p className="text-xs text-green-600 mt-1">
              All core courses for{" "}
              <strong>
                {student.department} {student.level}L {SEMESTER_LABEL} Semester
              </strong>{" "}
              are pre-selected. These cannot be removed.
            </p>
          </CardHeader>
          <CardContent>
            <div
              className="grid sm:grid-cols-2 gap-3"
              data-ocid="registration.compulsory_list"
            >
              {compulsoryCourses.map((course, i) => (
                <div
                  key={course.code}
                  className="border border-green-200 bg-green-50 rounded-lg p-3 flex items-start justify-between cursor-default"
                  data-ocid={`registration.compulsory_item.${i + 1}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      aria-label={`Compulsory: ${course.code}`}
                      className="mt-1 h-4 w-4 accent-green-600 shrink-0"
                    />
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
                        <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                          {course.creditUnits}C
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                        {course.title}
                      </p>
                      {course.department && (
                        <p className="text-xs text-muted-foreground">
                          {course.department}
                        </p>
                      )}
                    </div>
                  </div>
                  <Lock
                    size={14}
                    className="text-green-400 mt-1 shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3: Elective / Cognate Courses */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                ELECTIVE COURSES — Select to Reach Minimum Credits
              </CardTitle>
              {electiveCourses.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  You need at least{" "}
                  <strong>
                    {Math.max(
                      0,
                      deptMin -
                        getTotalCreditUnits(compulsoryCourses) -
                        carryoverCreditTotal,
                    )}{" "}
                    more credit units
                  </strong>{" "}
                  from electives.
                  {eedRule && (
                    <span className="text-amber-600 ml-1">
                      EED: Must select at least {eedRule.minElectives}{" "}
                      elective(s) from the specified codes.
                    </span>
                  )}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAIAssign}
              disabled={
                !regOpen || aiProcessing || electiveCourses.length === 0
              }
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
              No elective courses available for {student.department}{" "}
              {student.level}L {SEMESTER_LABEL} Semester.
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
                const isEEDRequired = eedRule?.electiveCodes.includes(
                  course.code,
                );

                return (
                  <button
                    key={course.code}
                    type="button"
                    onClick={() =>
                      !isLocked && toggleElective(course.code, course)
                    }
                    disabled={isLocked || !regOpen}
                    aria-pressed={isSelected}
                    title={
                      isLocked
                        ? `Prerequisite required: ${unmetPrereq}${prereqCourse ? ` — ${prereqCourse.title}` : ""}`
                        : isSelected
                          ? "Click to deselect"
                          : "Click to select"
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
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        disabled={isLocked || !regOpen}
                        className="mt-1 h-4 w-4 shrink-0"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-muted-foreground">
                            {course.code}
                          </span>
                          {isEEDRequired && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                              Required EED
                            </Badge>
                          )}
                          <Badge
                            className={`border-0 text-xs ${
                              course.type === "elective"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {course.type === "elective"
                              ? "Elective"
                              : "Cognate"}
                          </Badge>
                          <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                            {course.creditUnits}C
                          </Badge>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <Lock size={11} /> Prereq: {unmetPrereq}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                          {course.title}
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

      {/* Currently registered courses this semester */}
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
                const isAuto = autoSelectedCodes.has(reg.courseCode);
                const isCarry = carryCodes.has(reg.courseCode);
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
                        {reg.courseCode} · {course?.creditUnits ?? "?"} units ·{" "}
                        {reg.semester}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isCarry ? (
                        <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                          Carryover
                        </Badge>
                      ) : isAuto ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          Compulsory
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                          Elective
                        </Badge>
                      )}
                      {regOpen && !isAuto && (
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
                <p className="text-xs text-muted-foreground">Credits Earned</p>
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
                  Min{" "}
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

      {/* Submit Section */}
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
                {hasDEBlocking && (
                  <li className="text-red-600">
                    • DE students must complete 100L GST courses first
                  </li>
                )}
                {totalCredits < deptMin && (
                  <li className="text-amber-600">
                    • Need at least {deptMin} credit units (have {totalCredits})
                    {deptMin === 18 &&
                      ` — ${student.department} requires 18C min`}
                  </li>
                )}
                {totalCredits > REGISTRATION_RULES.maxCreditUnits && (
                  <li className="text-red-600">
                    • Exceeds maximum {REGISTRATION_RULES.maxCreditUnits} credit
                    units (have {totalCredits})
                  </li>
                )}
                {!eedElectiveValid && eedRule && (
                  <li className="text-amber-600">
                    • EED requirement: Select at least {eedRule.minElectives}{" "}
                    elective(s) from {eedRule.electiveCodes.join(", ")}
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
            className="shrink-0 min-w-[200px]"
            data-ocid="registration.submit_button"
          >
            <CheckCircle size={16} className="mr-2" />
            Submit Registration
          </Button>
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      <RegistrationConfirmationModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        student={student}
        courses={allSelectedCourses}
        totalCredits={totalCredits}
        registeredAt={registeredAt}
        carryoverCodes={carryCodes}
        compulsoryCodes={new Set(compulsoryCourses.map((c) => c.code))}
      />
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
