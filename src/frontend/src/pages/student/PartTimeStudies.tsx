import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  Lock,
  Moon,
  Printer,
  RefreshCw,
  Send,
  Star,
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import { Separator } from "../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  ALL_FUEK_COURSES,
  type FuekCourse,
  getCoursesByDepartment,
  getTotalCreditUnits,
} from "../../utils/fuekCourseData";
import {
  getLocalRegistrations,
  getLocalResults,
  saveLocalRegistrations,
} from "../../utils/sampleData";

// ── PT Credit Rules ───────────────────────────────────────────────────────────

const PT_MIN_CREDITS = 12;
const PT_MAX_CREDITS = 16;
const CURRENT_SEMESTER = "2024/2025 First";
const SEMESTER_LABEL = "First";
const ACADEMIC_SESSION = "2024/2025";

const DEPT_MIN_CREDITS: Record<string, number> = {
  "Human Kinetics": 18,
  "Health & Human Kinetics": 18,
  "Health Education": 18,
  Chemistry: 18,
};

function getDeptMin(dept: string): number {
  return DEPT_MIN_CREDITS[dept] ?? 15;
}

function getPTMin(dept: string): number {
  return Math.max(PT_MIN_CREDITS, getDeptMin(dept));
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

// ── PT Demo Student ───────────────────────────────────────────────────────────

interface PTStudent {
  matricNumber: string;
  name: string;
  department: string;
  level: number;
  entryMode: "UTME" | "DE";
  email: string;
  programmeType: string;
  completedCourses: string[];
  semestersCompleted: number;
}

function getPTDemoStudent(): PTStudent {
  return {
    matricNumber: "FUEK/PT/2024/CSC/001",
    name: "Ibrahim Danladi",
    department: "Computer Science",
    level: 200,
    entryMode: "UTME",
    email: "ibrahim.pt@student.edu",
    programmeType: "PT-B.Sc(Ed)",
    completedCourses: [
      "GST 111",
      "GST 113",
      "EDU 101",
      "COS 101",
      "MTH 101",
      "PHY 101",
      "GST 112",
      "GST 114",
      "SED 102",
      "COS 102",
      "PHY 102",
    ],
    semestersCompleted: 2,
  };
}

// ── Course Loader ─────────────────────────────────────────────────────────────

function loadPTCourses(
  dept: string,
  level: number,
  semester: string,
): { compulsory: FuekCourse[]; elective: FuekCourse[] } {
  type BscEdDept =
    | "Computer Science"
    | "Biology"
    | "Chemistry"
    | "Integrated Science"
    | "Mathematics"
    | "Education & Mathematics"
    | "Environmental Education";

  const bscDepts: string[] = [
    "Computer Science",
    "Biology",
    "Chemistry",
    "Integrated Science",
    "Mathematics",
    "Education & Mathematics",
    "Environmental Education",
  ];

  let all: FuekCourse[] = [];
  if (bscDepts.includes(dept)) {
    all = getCoursesByDepartment(dept as BscEdDept, level, semester);
  } else {
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

// ── Credit Color Helpers ──────────────────────────────────────────────────────

function creditBg(total: number, min: number): string {
  if (total < min) return "bg-amber-50 border-amber-300";
  if (total > PT_MAX_CREDITS) return "bg-red-50 border-red-400";
  return "bg-green-50 border-green-300";
}
function creditColor(total: number, min: number): string {
  if (total < min) return "text-amber-600";
  if (total > PT_MAX_CREDITS) return "text-red-600";
  return "text-green-600";
}

// ── PT Registration Confirmation Modal ───────────────────────────────────────

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  student: PTStudent;
  courses: FuekCourse[];
  totalCredits: number;
  registeredAt: string;
  carryoverCodes: Set<string>;
  compulsoryCodes: Set<string>;
}

function PTRegistrationConfirmModal({
  open,
  onClose,
  student,
  courses,
  totalCredits,
  registeredAt,
  carryoverCodes,
  compulsoryCodes,
}: ConfirmProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=820,height=650");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>PT Course Registration — ${student.matricNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; padding: 18mm; }
          .header { text-align: center; border-bottom: 2px solid #1B4332; padding-bottom: 10px; margin-bottom: 12px; }
          .pt-badge { display: inline-block; background: #1B4332; color: #FFD700; padding: 4px 14px; border-radius: 4px; font-size: 10pt; font-weight: bold; margin-top: 6px; letter-spacing: 1px; }
          h1 { font-size: 14pt; text-transform: uppercase; font-weight: bold; margin-top: 4px; }
          h2 { font-size: 11pt; font-weight: normal; color: #444; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin: 14px 0; font-size: 11pt; }
          .info-row { display: flex; gap: 6px; }
          .lbl { font-weight: bold; min-width: 130px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11pt; }
          th { border: 1px solid #1B4332; padding: 6px; background: #e8f5e9; text-align: left; font-weight: bold; }
          td { border: 1px solid #aaa; padding: 5px 6px; }
          .total-row td { font-weight: bold; background: #f0f0f0; }
          .footer-note { margin-top: 10px; font-size: 10pt; border: 1px solid #1B4332; padding: 8px; background: #f9f9f9; }
          .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px; margin-top: 36px; }
          .sig-block { border-top: 1px solid #000; padding-top: 4px; font-size: 10pt; text-align: center; }
          @media print { body { padding: 14mm; } }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const getType = (code: string) => {
    if (carryoverCodes.has(code)) return "Carryover";
    if (compulsoryCodes.has(code)) return "Compulsory";
    return "Elective";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>PT Registration Confirmation</span>
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
          <div className="text-center border-b-2 border-border pb-4">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
              Federal Republic of Nigeria
            </p>
            <h1 className="text-lg font-bold text-foreground mt-1">
              Federal University of Education, Kontagora
            </h1>
            <p className="text-sm font-semibold" style={{ color: "#1B4332" }}>
              Faculty of Science Education (FUEK)
            </p>
            <div
              className="mt-2 inline-block px-4 py-1 rounded text-xs font-bold tracking-widest"
              style={{ background: "#1B4332", color: "#FFD700" }}
            >
              PART-TIME STUDIES PROGRAMME
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Course Registration Form — {ACADEMIC_SESSION} Academic Session
            </p>
            <div className="mt-2 inline-block bg-green-50 border border-green-200 rounded px-3 py-1">
              <p className="text-xs font-semibold text-green-700">
                ✓ APPROVED — Subject to Verification by Academic Office
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ["Full Name", student.name],
              ["Matric Number", student.matricNumber],
              ["Department", student.department],
              ["Programme", "Part-Time B.Sc (Ed)"],
              ["Level", `${student.level} Level`],
              ["Entry Mode", student.entryMode],
              ["Semester", SEMESTER_LABEL],
              ["Academic Session", ACADEMIC_SESSION],
              [
                "Credit Load Range",
                `${PT_MIN_CREDITS}C – ${PT_MAX_CREDITS}C (Part-Time)`,
              ],
              [
                "Registration Date",
                new Date(registeredAt).toLocaleDateString("en-NG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="font-semibold text-muted-foreground min-w-[130px]">
                  {label}:
                </span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  {[
                    "S/N",
                    "Course Code",
                    "Course Title",
                    "Credits",
                    "Type",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => {
                  const t = getType(c.code);
                  return (
                    <tr
                      key={c.code}
                      className="border-b border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                        {c.code}
                      </td>
                      <td className="px-3 py-2">{c.title}</td>
                      <td className="px-3 py-2 text-center font-semibold">
                        {c.creditUnits}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${t === "Carryover" ? "bg-orange-100 text-orange-700" : t === "Compulsory" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {t}
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

          <div className="bg-muted/30 border border-border rounded p-3 text-xs text-muted-foreground space-y-1">
            <p>
              This registration form is issued by the Academic Registry, Federal
              University of Education, Kontagora (FUEK) — Part-Time Studies
              Programme.
            </p>
            <p>
              Credit load for Part-Time students: Min {PT_MIN_CREDITS}C — Max{" "}
              {PT_MAX_CREDITS}C per semester.
            </p>
            <p className="font-semibold text-foreground">
              UniDigital MIS — FUEK | Printed:{" "}
              {new Date().toLocaleString("en-NG")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8">
            {["Student Signature", "PT Coordinator / HOD", "Registrar"].map(
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

// ── Section: Course Registration ──────────────────────────────────────────────

function PTCourseRegistration({ student }: { student: PTStudent }) {
  const ptMin = getPTMin(student.department);
  const [selectedElectives, setSelectedElectives] = useState<Set<string>>(
    new Set(),
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [registeredAt, setRegisteredAt] = useState("");
  const [registrations, setRegistrations] = useState(getLocalRegistrations());
  const [aiProcessing, setAiProcessing] = useState(false);

  const allResults = getLocalResults();
  const myResults = allResults.filter(
    (r) => r.studentMatric === student.matricNumber,
  );
  const passedCodes = useMemo(() => {
    const s = new Set(student.completedCourses);
    for (const r of myResults) {
      if (r.grade !== "F") s.add(r.courseCode);
    }
    return s;
  }, [student.completedCourses, myResults]);

  const myRegs = registrations.filter(
    (r) =>
      r.studentMatric === student.matricNumber &&
      r.semester === CURRENT_SEMESTER,
  );
  const myRegCodes = useMemo(
    () => new Set(myRegs.map((r) => r.courseCode)),
    [myRegs],
  );

  const { compulsory: compulsoryCourses, elective: electiveCourses } = useMemo(
    () => loadPTCourses(student.department, student.level, SEMESTER_LABEL),
    [student.department, student.level],
  );

  const prevRegs = registrations.filter(
    (r) =>
      r.studentMatric === student.matricNumber &&
      r.semester !== CURRENT_SEMESTER,
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

  const autoSelectedCodes = useMemo(() => {
    const s = new Set(compulsoryCourses.map((c) => c.code));
    for (const c of carryoverCourses) s.add(c.code);
    return s;
  }, [compulsoryCourses, carryoverCourses]);

  const allSelectedCourses = useMemo(() => {
    const codes = new Set([...autoSelectedCodes, ...selectedElectives]);
    return ALL_FUEK_COURSES.filter((c) => codes.has(c.code));
  }, [autoSelectedCodes, selectedElectives]);

  const totalCredits = getTotalCreditUnits(allSelectedCourses);

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
  const creditValid = totalCredits >= ptMin && totalCredits <= PT_MAX_CREDITS;
  const canSubmit = creditValid && eedElectiveValid;

  const toggleElective = (code: string, course: FuekCourse) => {
    const unmetPrereq = course.prerequisites.find((p) => !passedCodes.has(p));
    if (unmetPrereq && !selectedElectives.has(code)) {
      alert(
        `You must first pass ${unmetPrereq} before registering this course.`,
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

  const handleSubmit = () => {
    if (!canSubmit) return;
    const newRegs = allSelectedCourses
      .filter((c) => !myRegCodes.has(c.code))
      .map((c) => ({
        id: `PT-REG-${Date.now()}-${c.code}`,
        studentMatric: student.matricNumber,
        courseCode: c.code,
        semester: CURRENT_SEMESTER,
        registeredAt: new Date().toISOString().split("T")[0],
      }));
    const updated = [...registrations, ...newRegs];
    setRegistrations(updated);
    saveLocalRegistrations(updated);
    setRegisteredAt(new Date().toISOString());
    setShowConfirm(true);
  };

  const handleAIAssign = () => {
    setAiProcessing(true);
    setTimeout(() => {
      const eligible = electiveCourses.filter(
        (c) => !c.prerequisites.find((p) => !passedCodes.has(p)),
      );
      const compTotal =
        getTotalCreditUnits(compulsoryCourses) +
        getTotalCreditUnits(carryoverCourses);
      const needed = ptMin - compTotal;
      let added = 0;
      const next = new Set<string>();
      for (const c of eligible) {
        if (
          added + c.creditUnits <= needed + 4 &&
          getTotalCreditUnits([
            ...allSelectedCourses.filter((s) => !next.has(s.code)),
            ...eligible.filter((e) => next.has(e.code)),
            c,
          ]) <= PT_MAX_CREDITS
        ) {
          next.add(c.code);
          added += c.creditUnits;
        }
        if (added >= needed) break;
      }
      if (eedRule) {
        let cnt = 0;
        for (const code of eedRule.electiveCodes) {
          if (next.has(code)) cnt++;
        }
        if (cnt < eedRule.minElectives) {
          for (const code of eedRule.electiveCodes) {
            if (!next.has(code)) {
              next.add(code);
              cnt++;
              if (cnt >= eedRule.minElectives) break;
            }
          }
        }
      }
      setSelectedElectives(next);
      setAiProcessing(false);
    }, 1500);
  };

  const compulsoryCreditTotal = getTotalCreditUnits(compulsoryCourses);
  const carryoverCreditTotal = getTotalCreditUnits(carryoverCourses);
  const electiveCreditTotal = getTotalCreditUnits(
    electiveCourses.filter((c) => selectedElectives.has(c.code)),
  );

  return (
    <div className="space-y-5">
      {/* Credit Counter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Course Registration
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {student.name} — {student.department} · Level {student.level} ·{" "}
            {CURRENT_SEMESTER}
            <span
              className="ml-2 px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "#1B4332", color: "#FFD700" }}
            >
              PART-TIME
            </span>
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${creditBg(totalCredits, ptMin)}`}
          data-ocid="pt.credit_counter"
        >
          <span
            className={`text-xl font-extrabold ${creditColor(totalCredits, ptMin)}`}
          >
            {totalCredits}
          </span>
          <span className="text-muted-foreground text-xs">
            / {PT_MAX_CREDITS} max credits
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            Credit Load Progress
          </span>
          <span className="text-muted-foreground">
            Range: {ptMin}C – {PT_MAX_CREDITS}C (Part-Time)
          </span>
        </div>
        <Progress
          value={Math.min((totalCredits / PT_MAX_CREDITS) * 100, 100)}
          className="h-3"
        />
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <p className="font-bold text-orange-700">{carryoverCreditTotal}C</p>
            <p className="text-muted-foreground">Carryover</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="font-bold text-green-700">{compulsoryCreditTotal}C</p>
            <p className="text-muted-foreground">Compulsory</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="font-bold text-blue-700">{electiveCreditTotal}C</p>
            <p className="text-muted-foreground">Electives</p>
          </div>
        </div>
        {!creditValid && (
          <div className="flex items-start gap-2 text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded p-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {totalCredits < ptMin
              ? `Add more courses — you need at least ${ptMin} credits (you have ${totalCredits}).`
              : `Too many credits — maximum is ${PT_MAX_CREDITS}C for Part-Time students. Deselect some electives.`}
          </div>
        )}
        {eedRule && !eedElectiveValid && (
          <div className="flex items-start gap-2 text-red-700 text-xs bg-red-50 border border-red-200 rounded p-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {eedRule.message}
          </div>
        )}
      </div>

      {/* Carryover Courses */}
      {carryoverCourses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock size={14} className="text-orange-500" />
              Carryover Courses — Auto-Selected & Locked ({carryoverCreditTotal}
              C)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {carryoverCourses.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-orange-50 border border-orange-200"
                >
                  <div className="flex items-center gap-2">
                    <Lock size={12} className="text-orange-400 shrink-0" />
                    <span className="font-mono text-xs font-semibold text-orange-700">
                      {c.code}
                    </span>
                    <span className="text-sm text-foreground">{c.title}</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-0 shrink-0">
                    {c.creditUnits}C · Carryover
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compulsory Courses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock size={14} className="text-green-600" />
            Core / Compulsory Courses — Auto-Selected & Locked (
            {compulsoryCreditTotal}C)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compulsoryCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No compulsory courses found for this level/semester.
            </p>
          ) : (
            <div className="space-y-1.5">
              {compulsoryCourses.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-green-50 border border-green-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={13}
                      className="text-green-500 shrink-0"
                    />
                    <span className="font-mono text-xs font-semibold text-green-700">
                      {c.code}
                    </span>
                    <span className="text-sm text-foreground">{c.title}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0 shrink-0">
                    {c.creditUnits}C
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Elective Courses */}
      {electiveCourses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen size={14} className="text-blue-600" />
                Elective / Cognate Courses — Select to Add
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={handleAIAssign}
                disabled={aiProcessing}
                data-ocid="pt.ai_assign_button"
              >
                {aiProcessing ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Star size={12} />
                )}
                AI Auto-Select
              </Button>
            </div>
            {eedRule && (
              <p className="text-xs text-amber-700 mt-1">{eedRule.message}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {electiveCourses.map((c) => {
                const selected = selectedElectives.has(c.code);
                const unmet = c.prerequisites.find((p) => !passedCodes.has(p));
                return (
                  <button
                    type="button"
                    key={c.code}
                    className={`w-full flex items-center justify-between gap-3 p-2 rounded-lg border transition-colors text-left ${selected ? "bg-blue-50 border-blue-300" : unmet ? "bg-muted/30 border-border opacity-60 cursor-not-allowed" : "bg-card border-border hover:bg-muted/30 cursor-pointer"}`}
                    onClick={() => !unmet && toggleElective(c.code, c)}
                    disabled={!!unmet && !selected}
                    data-ocid={`pt.elective.${c.code}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selected ? "bg-blue-500 border-blue-500" : "border-border"}`}
                      >
                        {selected && (
                          <CheckCircle2 size={10} className="text-white" />
                        )}
                      </div>
                      <span className="font-mono text-xs font-semibold text-blue-700">
                        {c.code}
                      </span>
                      <span className="text-sm text-foreground">{c.title}</span>
                      {unmet && (
                        <span className="text-xs text-muted-foreground">
                          — requires {unmet}
                        </span>
                      )}
                    </div>
                    <Badge
                      className={`shrink-0 border-0 ${selected ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}
                    >
                      {c.creditUnits}C
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            Total: {totalCredits} Credit Units
          </p>
          <p className="text-muted-foreground text-xs">
            {allSelectedCourses.length} courses selected · Limit: {ptMin}–
            {PT_MAX_CREDITS}C (Part-Time)
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gap-2"
          style={canSubmit ? { background: "#1B4332", color: "#FFD700" } : {}}
          data-ocid="pt.submit_registration_button"
        >
          <CheckCircle size={16} />
          Submit PT Registration
        </Button>
      </div>

      <PTRegistrationConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
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

// ── Section: Results ──────────────────────────────────────────────────────────

const sampleResults = [
  {
    semester: "2023/2024 First",
    code: "GST 111",
    title: "Communication in English",
    ca: 32,
    exam: 55,
    total: 87,
    grade: "A",
    status: "Passed",
  },
  {
    semester: "2023/2024 First",
    code: "COS 101",
    title: "Introduction to Computer Science",
    ca: 28,
    exam: 50,
    total: 78,
    grade: "B",
    status: "Passed",
  },
  {
    semester: "2023/2024 First",
    code: "MTH 101",
    title: "General Mathematics I",
    ca: 25,
    exam: 44,
    total: 69,
    grade: "C",
    status: "Passed",
  },
  {
    semester: "2023/2024 First",
    code: "PHY 101",
    title: "General Physics I",
    ca: 30,
    exam: 48,
    total: 78,
    grade: "B",
    status: "Passed",
  },
  {
    semester: "2023/2024 Second",
    code: "GST 112",
    title: "Nigerian Peoples and Culture",
    ca: 33,
    exam: 52,
    total: 85,
    grade: "A",
    status: "Passed",
  },
  {
    semester: "2023/2024 Second",
    code: "COS 102",
    title: "Problem Solving",
    ca: 27,
    exam: 43,
    total: 70,
    grade: "C",
    status: "Passed",
  },
  {
    semester: "2023/2024 Second",
    code: "PHY 102",
    title: "General Physics II",
    ca: 18,
    exam: 32,
    total: 50,
    grade: "E",
    status: "Failed",
  },
];

const gradeColor: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-100 text-red-700",
  F: "bg-red-200 text-red-800",
};

function PTResults() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=820,height=650");
    if (!win) return;
    win.document.write(
      `<!DOCTYPE html><html><head><title>PT Result Slip</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;padding:18mm}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #000;padding:6px}th{background:#e8f5e9;font-weight:bold}.header{text-align:center;border-bottom:2px solid #1B4332;padding-bottom:8px;margin-bottom:12px}</style></head><body>${content.innerHTML}</body></html>`,
    );
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const semesters = [...new Set(sampleResults.map((r) => r.semester))];
  const gpaMap: Record<string, string> = {
    "2023/2024 First": "3.47",
    "2023/2024 Second": "2.91",
  };

  return (
    <div className="space-y-5" ref={printRef}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            My Academic Results
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">
              Ibrahim Danladi · FUEK/PT/2024/CSC/001
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "#1B4332", color: "#FFD700" }}
            >
              PART-TIME
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="gap-1.5"
          data-ocid="pt.results_print_button"
        >
          <Printer size={14} />
          Download Result Slip
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CGPA", value: "3.21", color: "text-green-600" },
          { label: "Semesters", value: "2", color: "text-blue-600" },
          { label: "Credits Earned", value: "24", color: "text-primary" },
          {
            label: "Academic Status",
            value: "Active",
            color: "text-green-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-3 text-center"
          >
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
        <Clock size={13} />
        <span>
          Graduation timeline: 5 years (Part-Time programme). You are currently
          in Year 1.
        </span>
      </div>

      {semesters.map((sem) => {
        const rows = sampleResults.filter((r) => r.semester === sem);
        const gpa = gpaMap[sem] ?? "N/A";
        return (
          <Card key={sem}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm">
                  {sem} — Part-Time Semester
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-0">
                  GPA: {gpa}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      {[
                        "Course Code",
                        "Course Title",
                        "CA (40)",
                        "Exam (60)",
                        "Total",
                        "Grade",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.code}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                          {r.code}
                        </td>
                        <td className="px-3 py-2">{r.title}</td>
                        <td className="px-3 py-2 text-center">{r.ca}</td>
                        <td className="px-3 py-2 text-center">{r.exam}</td>
                        <td className="px-3 py-2 text-center font-semibold">
                          {r.total}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${gradeColor[r.grade] ?? ""}`}
                          >
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-xs ${r.status === "Passed" ? "text-green-600" : "text-red-600"}`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Section: Timetable ────────────────────────────────────────────────────────

const ptTimetable = [
  {
    day: "Monday",
    time: "5:00pm – 9:00pm",
    courses: [
      "COS 201 — Computer Programming I",
      "MTH 201 — Mathematical Methods I",
    ],
    room: "Hall A",
  },
  {
    day: "Tuesday",
    time: "5:00pm – 9:00pm",
    courses: [
      "EDU 201 — Curriculum & Teaching Methods",
      "ENT 211 — Entrepreneurship",
    ],
    room: "Block C",
  },
  {
    day: "Wednesday",
    time: "5:00pm – 9:00pm",
    courses: ["EDU 203 — Educational Technology & AI"],
    room: "Lab 2",
  },
  {
    day: "Thursday",
    time: "5:00pm – 9:00pm",
    courses: [
      "GST 212 — Philosophy, Logic & Existence",
      "SED 203 — Mathematics Subject Method",
    ],
    room: "Hall B",
  },
  {
    day: "Friday",
    time: "5:00pm – 9:00pm",
    courses: ["COS 202 — Computer Programming II"],
    room: "Lab 1",
  },
  {
    day: "Saturday",
    time: "8:00am – 6:00pm",
    courses: [
      "Practicals / Lab Sessions",
      "Tutorial & Assignment Review",
      "Seminar / Entrepreneurship Workshop",
    ],
    room: "Multi-Purpose Hall",
  },
];

const dayBg: Record<string, string> = {
  Monday: "bg-blue-50 border-blue-200",
  Tuesday: "bg-purple-50 border-purple-200",
  Wednesday: "bg-teal-50 border-teal-200",
  Thursday: "bg-amber-50 border-amber-200",
  Friday: "bg-rose-50 border-rose-200",
  Saturday: "bg-emerald-50 border-emerald-200",
};

function PTTimetable() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=820,height=650");
    if (!win) return;
    win.document.write(
      `<!DOCTYPE html><html><head><title>PT Timetable</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;padding:18mm}.day-row{margin-bottom:10px;padding:8px;border:1px solid #ccc;border-radius:4px}.header{text-align:center;margin-bottom:16px;border-bottom:2px solid #1B4332;padding-bottom:8px}</style></head><body>${content.innerHTML}</body></html>`,
    );
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <div className="space-y-4" ref={printRef}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Part-Time Timetable
          </h2>
          <p className="text-sm text-muted-foreground">
            2024/2025 First Semester — Evening &amp; Weekend Sessions
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="gap-1.5"
          data-ocid="pt.timetable_print_button"
        >
          <Printer size={14} />
          Print Timetable
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800">
        <Moon size={13} />
        <span>
          All Part-Time classes are held on evenings (Mon–Fri, 5pm–9pm) and
          Saturdays (8am–6pm).
        </span>
      </div>

      <div className="space-y-3">
        {ptTimetable.map((row) => (
          <div
            key={row.day}
            className={`rounded-xl border p-4 ${dayBg[row.day] ?? "bg-muted/30 border-border"}`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Moon size={14} className="text-primary" />
                  <span className="font-bold text-foreground">{row.day}</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">
                    {row.time}
                  </Badge>
                  {row.day === "Saturday" && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                      Full Day
                    </Badge>
                  )}
                </div>
                <div className="space-y-0.5">
                  {row.courses.map((c) => (
                    <p key={c} className="text-sm text-foreground pl-5">
                      • {c}
                    </p>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p className="font-semibold">Venue</p>
                <p>{row.room}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section: Course Materials ─────────────────────────────────────────────────

const ptMaterials = [
  {
    code: "COS 201",
    title: "Computer Programming I",
    notes: true,
    past: true,
    assignment: "Pending",
  },
  {
    code: "MTH 201",
    title: "Mathematical Methods I",
    notes: true,
    past: false,
    assignment: "Submitted",
  },
  {
    code: "EDU 201",
    title: "Curriculum & Teaching Methods",
    notes: true,
    past: true,
    assignment: "Not Due",
  },
  {
    code: "ENT 211",
    title: "Entrepreneurship and Innovation",
    notes: false,
    past: true,
    assignment: "Pending",
  },
  {
    code: "EDU 203",
    title: "Educational Technology & AI",
    notes: true,
    past: false,
    assignment: "Not Due",
  },
];

function PTCourseMaterials() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Part-Time Learning Resources
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          2024/2025 First Semester — Lecture Notes, Assignments &amp; Past
          Questions
        </p>
      </div>
      <div className="space-y-3">
        {ptMaterials.map((m) => (
          <Card key={m.code}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {m.code}
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {m.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      disabled={!m.notes}
                      data-ocid={`pt.material.notes.${m.code}`}
                    >
                      <Download size={12} />
                      {m.notes ? "Lecture Notes" : "Notes Unavailable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      disabled={!m.past}
                      data-ocid={`pt.material.past.${m.code}`}
                    >
                      <FileText size={12} />
                      {m.past ? "Past Questions" : "Not Available"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      data-ocid={`pt.material.upload.${m.code}`}
                    >
                      <Send size={12} />
                      Upload Assignment
                    </Button>
                  </div>
                </div>
                <Badge
                  className={`shrink-0 border-0 ${m.assignment === "Submitted" ? "bg-green-100 text-green-700" : m.assignment === "Pending" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}
                >
                  Assignment: {m.assignment}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Section: Fee Payment ──────────────────────────────────────────────────────

const ptFees = [
  {
    id: "f1",
    label: "Tuition Fee (PT Programme)",
    amount: 110000,
    due: "Before registration",
    status: "outstanding" as const,
  },
  {
    id: "f2",
    label: "Part-Time Programme Levy",
    amount: 15000,
    due: "With tuition",
    status: "outstanding" as const,
  },
  {
    id: "f3",
    label: "Examination Fee",
    amount: 8500,
    due: "Before exams",
    status: "outstanding" as const,
  },
];

const ptPayHistory = [
  {
    date: "2024-10-01",
    desc: "Acceptance Fee (PT)",
    amount: 25000,
    ref: "FUEK24PT001",
    status: "Paid",
  },
  {
    date: "2024-10-15",
    desc: "1st Semester Tuition — 1st Instalment",
    amount: 65000,
    ref: "FUEK24PT002",
    status: "Paid",
  },
];

function PTFeePayment() {
  const [processing, setProcessing] = useState<string | null>(null);
  const [paid, setPaid] = useState<Set<string>>(new Set());

  const handlePay = (id: string, label: string) => {
    setProcessing(id);
    setTimeout(() => {
      alert(
        `Payment of ₦${ptFees.find((f) => f.id === id)?.amount.toLocaleString()} for "${label}" processed via Paystack.\n\nTransaction Reference: FUEK${Date.now().toString().slice(-8)}`,
      );
      setPaid((prev) => new Set([...prev, id]));
      setProcessing(null);
    }, 2000);
  };

  const outstanding = ptFees.filter((f) => !paid.has(f.id));
  const total = outstanding.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Fee Payment</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Part-Time Studies Programme — 2024/2025 Session
        </p>
      </div>

      {total > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                Outstanding Balance
              </p>
              <p className="text-xs text-amber-700">
                {outstanding.length} item(s) due
              </p>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700">
            ₦{total.toLocaleString()}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {ptFees.map((fee) => {
          const isPaid = paid.has(fee.id);
          return (
            <Card key={fee.id} className={isPaid ? "border-green-200" : ""}>
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">{fee.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {fee.due}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${isPaid ? "text-green-600" : "text-primary"}`}
                  >
                    ₦{fee.amount.toLocaleString()}
                  </span>
                  {isPaid ? (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      Paid
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      style={{ background: "#1B4332", color: "#FFD700" }}
                      disabled={processing === fee.id}
                      onClick={() => handlePay(fee.id, fee.label)}
                      data-ocid={`pt.pay_button.${fee.id}`}
                    >
                      {processing === fee.id ? (
                        <RefreshCw size={13} className="animate-spin mr-1.5" />
                      ) : (
                        <CreditCard size={13} className="mr-1.5" />
                      )}
                      Pay via Paystack
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText size={15} />
          Payment History
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["Date", "Description", "Amount", "Reference", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ptPayHistory.map((p) => (
                <tr
                  key={p.ref}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-3 py-2 text-xs">{p.date}</td>
                  <td className="px-3 py-2">{p.desc}</td>
                  <td className="px-3 py-2 font-semibold">
                    ₦{p.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {p.ref}
                  </td>
                  <td className="px-3 py-2">
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Section: Notifications ────────────────────────────────────────────────────

interface PTNotice {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  priority: "high" | "normal";
}

const initialNotices: PTNotice[] = [
  {
    id: "n1",
    title: "Exam Timetable Released",
    body: "The examination timetable for 2024/2025 First Semester has been published. Evening exams run 5:00pm–8:00pm. Check the timetable board or portal.",
    date: "2025-03-28",
    read: false,
    priority: "high",
  },
  {
    id: "n2",
    title: "Class Schedule Updated — Wednesday",
    body: "Wednesday EDU 203 class has been moved to Block C Room 12 due to renovation in Lab 2. Please take note.",
    date: "2025-03-25",
    read: false,
    priority: "normal",
  },
  {
    id: "n3",
    title: "Fee Payment Reminder",
    body: "Outstanding Part-Time programme fees must be paid before the end of Week 10. Contact the Bursary for an instalment plan if needed.",
    date: "2025-03-20",
    read: true,
    priority: "high",
  },
  {
    id: "n4",
    title: "Teaching Practice Briefing",
    body: "All 300L PT students are invited to the Teaching Practice briefing on Saturday 12 April, 9:00am–12:00pm, Conference Room.",
    date: "2025-03-15",
    read: true,
    priority: "normal",
  },
];

function PTNotifications() {
  const [notices, setNotices] = useState<PTNotice[]>(initialNotices);
  const unread = notices.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const markAllRead = () =>
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">
            Announcements &amp; Notifications
          </h2>
          {unread > 0 && (
            <Badge className="bg-red-500 text-white border-0">{unread}</Badge>
          )}
        </div>
        {unread > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            data-ocid="pt.notifications_mark_all"
          >
            <CheckCircle2 size={13} className="mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {notices.map((n) => (
          <Card
            key={n.id}
            className={`cursor-pointer transition-colors ${!n.read ? "border-primary/40 bg-primary/5" : ""}`}
            onClick={() => markRead(n.id)}
            data-ocid={`pt.notice.${n.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`font-semibold text-sm text-foreground ${!n.read ? "font-bold" : ""}`}
                      >
                        {n.title}
                      </p>
                      {n.priority === "high" && (
                        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                          Important
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {n.date}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Section: Academic Calendar ────────────────────────────────────────────────

const ptCalendar = [
  {
    phase: "Pre-Semester",
    event: "Course Registration Opens",
    dates: "Sep 1–14, 2024",
    status: "done",
  },
  {
    phase: "Pre-Semester",
    event: "Fee Payment Deadline (1st Instalment)",
    dates: "Sep 15, 2024",
    status: "done",
  },
  {
    phase: "Teaching",
    event: "Semester Teaching Begins (Evening)",
    dates: "Sep 16, 2024",
    status: "done",
  },
  {
    phase: "Teaching",
    event: "Mid-Semester Test / CA (Week 7)",
    dates: "Nov 4–8, 2024",
    status: "done",
  },
  {
    phase: "Teaching",
    event: "Fee Deadline (2nd Instalment)",
    dates: "Nov 15, 2024",
    status: "current",
  },
  {
    phase: "Teaching",
    event: "Semester Teaching Ends",
    dates: "Dec 20, 2024",
    status: "upcoming",
  },
  {
    phase: "Exams",
    event: "Revision / Reading Week",
    dates: "Jan 6–10, 2025",
    status: "upcoming",
  },
  {
    phase: "Exams",
    event: "Part-Time Examinations (Evening — 5pm–8pm)",
    dates: "Jan 13–31, 2025",
    status: "upcoming",
  },
  {
    phase: "Post-Exam",
    event: "Results Published",
    dates: "Feb 28, 2025",
    status: "upcoming",
  },
  {
    phase: "Post-Exam",
    event: "2nd Semester Registration Opens",
    dates: "Mar 10, 2025",
    status: "upcoming",
  },
];

const phaseColor: Record<string, string> = {
  "Pre-Semester": "bg-blue-100 text-blue-700",
  Teaching: "bg-green-100 text-green-700",
  Exams: "bg-amber-100 text-amber-700",
  "Post-Exam": "bg-purple-100 text-purple-700",
};

function PTAcademicCalendar() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Part-Time Academic Calendar
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          2024/2025 First Semester — Extended teaching periods for Part-Time
          students
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800 flex items-center gap-2">
        <Calendar size={13} />
        <span>
          Evening sessions: Mon–Fri 5pm–9pm · Saturday sessions: 8am–6pm
        </span>
      </div>
      <div className="space-y-2">
        {ptCalendar.map((item) => (
          <div
            key={item.event}
            className={`flex items-center gap-3 p-3 rounded-xl border ${item.status === "current" ? "border-primary/60 bg-primary/5" : item.status === "done" ? "border-border bg-muted/30" : "border-border bg-card"}`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === "done" ? "bg-green-500" : item.status === "current" ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className={`text-sm font-medium text-foreground ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.event}
                </p>
                <Badge
                  className={`${phaseColor[item.phase] ?? ""} border-0 text-xs`}
                >
                  {item.phase}
                </Badge>
                {item.status === "current" && (
                  <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {item.dates}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section: Attendance ───────────────────────────────────────────────────────

const ptAttendance = [
  {
    code: "COS 201",
    title: "Computer Programming I",
    total: 12,
    attended: 11,
    type: "Evening",
  },
  {
    code: "MTH 201",
    title: "Mathematical Methods I",
    total: 12,
    attended: 10,
    type: "Evening",
  },
  {
    code: "EDU 201",
    title: "Curriculum & Teaching Methods",
    total: 10,
    attended: 9,
    type: "Evening",
  },
  {
    code: "ENT 211",
    title: "Entrepreneurship and Innovation",
    total: 8,
    attended: 6,
    type: "Saturday",
  },
  {
    code: "EDU 203",
    title: "Educational Technology & AI",
    total: 10,
    attended: 10,
    type: "Evening",
  },
];

function PTAttendance() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Part-Time Attendance Record
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Evening Sessions (Mon–Fri) and Saturday Sessions
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
        <AlertCircle size={13} />
        <span>
          Minimum 75% attendance is required. Failure risks exam barring for the
          affected course(s).
        </span>
      </div>
      <div className="space-y-3">
        {ptAttendance.map((a) => {
          const pct = Math.round((a.attended / a.total) * 100);
          const ok = pct >= 75;
          return (
            <Card key={a.code}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {a.code}
                      </span>
                      <span className="font-semibold text-sm text-foreground">
                        {a.title}
                      </span>
                      <Badge
                        className={`border-0 text-xs ${a.type === "Evening" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {a.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-extrabold ${ok ? "text-green-600" : "text-red-600"}`}
                    >
                      {pct}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.attended}/{a.total} sessions
                    </p>
                  </div>
                </div>
                <Progress value={pct} className="h-2" />
                {!ok && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={11} />
                    Below 75% threshold — risk of exam barring
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Section: Transcript Request ───────────────────────────────────────────────

type TxStatus =
  | "not_submitted"
  | "submitted"
  | "processing"
  | "ready"
  | "collected";

const TX_STEPS: { key: TxStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "processing", label: "Processing" },
  { key: "ready", label: "Ready" },
  { key: "collected", label: "Collected" },
];

function PTTranscriptRequest({ userName }: { userName: string }) {
  const [status, setStatus] = useState<TxStatus>("not_submitted");
  const [form, setForm] = useState({
    destination: "",
    purpose: "further_study",
    copies: "1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setRef(`TX-PT-${Date.now().toString().slice(-8)}`);
      setStatus("submitted");
      setSubmitting(false);
    }, 1500);
  };

  const stepIdx = TX_STEPS.findIndex((s) => s.key === status);
  const feePerCopy = 3000;
  const copies = Math.max(1, Number.parseInt(form.copies, 10) || 1);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Transcript Request
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Part-Time Studies Programme — Fee: ₦{feePerCopy.toLocaleString()} per
          copy
        </p>
      </div>

      {status !== "not_submitted" && (
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="font-semibold text-foreground">
                Request Reference:{" "}
                <span className="font-mono text-primary">{ref}</span>
              </p>
              <Badge className="bg-primary/10 text-primary border-0">
                Part-Time Programme
              </Badge>
            </div>
            <div className="flex items-center gap-0">
              {TX_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= stepIdx ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"}`}
                    >
                      {i < stepIdx ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <p className="text-xs mt-1 text-center text-muted-foreground">
                      {step.label}
                    </p>
                  </div>
                  {i < TX_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-4 ${i < stepIdx ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            {status === "submitted" && (
              <div className="mt-4 flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => setStatus("processing")}
                  data-ocid="pt.tx_advance_processing"
                >
                  Advance to Processing (Demo)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus("ready")}
                  data-ocid="pt.tx_advance_ready"
                >
                  Mark Ready (Demo)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {status === "not_submitted" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={15} />
              Transcript Request Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="pt-tx-name">Full Name</Label>
                <Input
                  id="pt-tx-name"
                  defaultValue={userName}
                  readOnly
                  className="mt-1 bg-muted/30"
                />
              </div>
              <div>
                <Label htmlFor="pt-tx-dest">
                  Destination Institution / Employer
                </Label>
                <Input
                  id="pt-tx-dest"
                  placeholder="e.g., University of Lagos, SUBEB Niger State"
                  value={form.destination}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, destination: e.target.value }))
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pt-tx-purpose">Purpose</Label>
                <select
                  id="pt-tx-purpose"
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, purpose: e.target.value }))
                  }
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-card mt-1"
                  data-ocid="pt.tx_purpose_select"
                >
                  <option value="further_study">Further Studies</option>
                  <option value="employment">Employment</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="personal">Personal Records</option>
                </select>
              </div>
              <div>
                <Label htmlFor="pt-tx-copies">
                  Number of Copies (₦{feePerCopy.toLocaleString()} each)
                </Label>
                <Input
                  id="pt-tx-copies"
                  type="number"
                  min={1}
                  max={5}
                  value={form.copies}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, copies: e.target.value }))
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total fee: ₦{(copies * feePerCopy).toLocaleString()}
                </p>
              </div>
              <Button
                type="submit"
                disabled={submitting || !form.destination}
                className="w-full gap-2"
                data-ocid="pt.tx_submit_button"
              >
                {submitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Submit Transcript Request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Section: Clearance ────────────────────────────────────────────────────────

interface ClearanceStep {
  id: string;
  label: string;
  approver: string;
  status: "approved" | "pending" | "not_started";
  date?: string;
}

const initialClearance: ClearanceStep[] = [
  {
    id: "bursary",
    label: "Bursary Clearance",
    approver: "Bursary Department",
    status: "approved",
    date: "2025-01-15",
  },
  {
    id: "library",
    label: "Library Clearance",
    approver: "Library — Mr. A. Bello",
    status: "approved",
    date: "2025-01-16",
  },
  {
    id: "hostel",
    label: "Hostel Clearance",
    approver: "Student Affairs — Mrs. F. Usman",
    status: "pending",
  },
  {
    id: "faculty",
    label: "Faculty Clearance",
    approver: "Dean — Faculty of Science Education",
    status: "not_started",
  },
  {
    id: "pt_coord",
    label: "Part-Time Coordinator Clearance",
    approver: "PT Coordinator — Dr. Y. Aliyu",
    status: "not_started",
  },
];

function PTClearance({ userName }: { userName: string }) {
  const [steps, setSteps] = useState<ClearanceStep[]>(initialClearance);
  const allApproved = steps.every((s) => s.status === "approved");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!allApproved || !printRef.current) return;
    const win = window.open("", "_blank", "width=820,height=600");
    if (!win) return;
    win.document.write(
      `<!DOCTYPE html><html><head><title>PT Clearance Certificate</title><style>body{font-family:'Times New Roman',serif;font-size:13pt;padding:20mm}.header{text-align:center;border-bottom:2px solid #1B4332;padding-bottom:10px;margin-bottom:14px}h1{font-size:16pt;font-weight:bold}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #000;padding:8px}th{background:#e8f5e9}.seal{text-align:center;margin-top:30px;font-size:11pt;color:#555}</style></head><body>${printRef.current.innerHTML}</body></html>`,
    );
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  // Demo: simulate approving next pending step
  const approveNext = () => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.status !== "approved");
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        status: "approved",
        date: new Date().toISOString().split("T")[0],
      };
      if (idx + 1 < next.length && next[idx + 1].status === "not_started") {
        next[idx + 1] = { ...next[idx + 1], status: "pending" };
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Clearance Status
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Part-Time Studies Programme — Multi-step clearance for
            graduation/completion
          </p>
        </div>
        {allApproved && (
          <Button
            onClick={handlePrint}
            className="gap-2"
            style={{ background: "#1B4332", color: "#FFD700" }}
            data-ocid="pt.clearance_print_button"
          >
            <Printer size={14} />
            Print Clearance Certificate
          </Button>
        )}
      </div>

      {!allApproved && (
        <Button
          size="sm"
          variant="outline"
          onClick={approveNext}
          className="text-xs"
          data-ocid="pt.clearance_demo_advance"
        >
          <ChevronRight size={13} className="mr-1" />
          Advance clearance step (Demo)
        </Button>
      )}

      <div ref={printRef} className="space-y-3">
        {allApproved && (
          <div className="text-center border-b-2 border-border pb-4 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Federal University of Education, Kontagora
            </p>
            <h1 className="text-lg font-bold mt-1">CLEARANCE CERTIFICATE</h1>
            <div
              className="mt-2 inline-block px-4 py-1 rounded text-xs font-bold"
              style={{ background: "#1B4332", color: "#FFD700" }}
            >
              PART-TIME STUDIES PROGRAMME
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is to certify that <strong>{userName}</strong> has
              satisfactorily completed all clearance requirements for the
              2024/2025 academic session.
            </p>
          </div>
        )}

        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${step.status === "approved" ? "bg-green-50 border-green-200" : step.status === "pending" ? "bg-amber-50 border-amber-300" : "bg-muted/30 border-border"}`}
            data-ocid={`pt.clearance.${step.id}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.status === "approved" ? "bg-green-500" : step.status === "pending" ? "bg-amber-500" : "bg-muted-foreground/20"}`}
              >
                {step.status === "approved" ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : step.status === "pending" ? (
                  <Clock size={16} className="text-white" />
                ) : (
                  <ClipboardList size={16} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.approver}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                className={`border-0 ${step.status === "approved" ? "bg-green-100 text-green-700" : step.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}
              >
                {step.status === "approved"
                  ? "Approved"
                  : step.status === "pending"
                    ? "Pending"
                    : "Not Started"}
              </Badge>
              {step.date && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────

function PTOverview({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const stats = [
    {
      label: "Enrolled Students",
      value: "1,240",
      icon: <Users size={18} />,
      color: "text-blue-600",
    },
    {
      label: "Departments",
      value: "9",
      icon: <BookOpen size={18} />,
      color: "text-green-600",
    },
    {
      label: "Programme Duration",
      value: "5 Years",
      icon: <GraduationCap size={18} />,
      color: "text-primary",
    },
    {
      label: "Session",
      value: "2024/2025",
      icon: <Calendar size={18} />,
      color: "text-amber-600",
    },
  ];

  const quickLinks = [
    {
      label: "Register Courses",
      tab: "registration",
      icon: <ClipboardList size={16} />,
      color: "from-green-700 to-green-900",
    },
    {
      label: "View Results",
      tab: "results",
      icon: <Star size={16} />,
      color: "from-blue-600 to-blue-800",
    },
    {
      label: "Timetable",
      tab: "timetable",
      icon: <Calendar size={16} />,
      color: "from-amber-600 to-amber-800",
    },
    {
      label: "Course Materials",
      tab: "materials",
      icon: <BookOpen size={16} />,
      color: "from-purple-600 to-purple-800",
    },
    {
      label: "Fee Payment",
      tab: "fees",
      icon: <CreditCard size={16} />,
      color: "from-rose-600 to-rose-800",
    },
    {
      label: "Attendance",
      tab: "attendance",
      icon: <CheckCircle2 size={16} />,
      color: "from-teal-600 to-teal-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #1B4332 0%, #2d6a4f 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon size={16} className="text-yellow-300" />
              <span className="text-yellow-200 text-sm font-medium">
                Federal University of Education, Kontagora
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Part-Time Studies Portal
            </h1>
            <p className="text-green-100 mt-1 max-w-xl text-sm">
              Advance your education without pausing your career. Evening
              (5pm–9pm, Mon–Fri) and Saturday (8am–6pm) classes designed for
              working professionals.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge
                className="border-0 text-xs font-bold px-3 py-1"
                style={{ background: "#FFD700", color: "#1B4332" }}
              >
                PART-TIME STUDIES
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                NUC Approved
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                B.Sc (Ed) Programme
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                2024/2025 Session
              </Badge>
            </div>
          </div>
          <GraduationCap
            size={64}
            className="text-green-300 hidden md:block shrink-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`flex justify-center mb-2 ${s.color}`}>
                {s.icon}
              </div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3 text-sm">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map((q) => (
            <button
              type="button"
              key={q.tab}
              onClick={() => setActiveTab(q.tab)}
              className={`bg-gradient-to-br ${q.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity cursor-pointer`}
              data-ocid={`pt.quicklink.${q.tab}`}
            >
              <div className="mb-2 opacity-90">{q.icon}</div>
              <p className="text-sm font-semibold">{q.label}</p>
              <ChevronRight size={14} className="mt-1 opacity-70" />
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-500" />
            Part-Time Programme Regulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              `Credit load: Min ${PT_MIN_CREDITS}C – Max ${PT_MAX_CREDITS}C per semester for Part-Time students.`,
              "Carryover courses are auto-selected and must be registered before current semester courses.",
              "Minimum 75% attendance is mandatory for all evening and Saturday sessions.",
              "Teaching Practice (EDU 301 & EDU 401) requires full dedicated weeks — obtain study leave from employer.",
              "Graduation timeline: 5 years for B.Sc (Ed) Part-Time. Minimum 120 credit units required.",
              "Final examinations are held alongside full-time students — evening slot: 5:00pm–8:00pm.",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <CheckCircle
                  size={13}
                  className="text-green-500 mt-0.5 shrink-0"
                />
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface PartTimeStudiesProps {
  userEmail?: string;
  userName?: string;
}

const PT_TABS = [
  { value: "overview", label: "Overview" },
  { value: "registration", label: "Courses" },
  { value: "results", label: "Results" },
  { value: "timetable", label: "Timetable" },
  { value: "materials", label: "Materials" },
  { value: "fees", label: "Fees" },
  { value: "notifications", label: "Notices" },
  { value: "calendar", label: "Calendar" },
  { value: "attendance", label: "Attendance" },
  { value: "transcript", label: "Transcript" },
  { value: "clearance", label: "Clearance" },
] as const;

export function PartTimeStudies({
  userEmail: _userEmail,
  userName,
}: PartTimeStudiesProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const student = getPTDemoStudent();
  const resolvedName = userName ?? student.name;

  return (
    <div className="space-y-5">
      {/* Portal Header */}
      <div className="flex items-center gap-3 pb-1 border-b border-border">
        <div
          className="w-2 h-8 rounded-full shrink-0"
          style={{ background: "#1B4332" }}
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">
              Part-Time Studies
            </h1>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold tracking-wide"
              style={{ background: "#1B4332", color: "#FFD700" }}
            >
              PT PORTAL
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Federal University of Education, Kontagora — Evening &amp; Weekend
            Programme
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="flex w-max min-w-full gap-0.5 p-1">
            {PT_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs px-3 shrink-0"
                data-ocid={`pt.tab.${tab.value}`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <PTOverview setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="registration" className="mt-4">
          <PTCourseRegistration student={student} />
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <PTResults />
        </TabsContent>

        <TabsContent value="timetable" className="mt-4">
          <PTTimetable />
        </TabsContent>

        <TabsContent value="materials" className="mt-4">
          <PTCourseMaterials />
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <PTFeePayment />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <PTNotifications />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <PTAcademicCalendar />
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <PTAttendance />
        </TabsContent>

        <TabsContent value="transcript" className="mt-4">
          <PTTranscriptRequest userName={resolvedName} />
        </TabsContent>

        <TabsContent value="clearance" className="mt-4">
          <PTClearance userName={resolvedName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
