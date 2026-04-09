import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Info,
  Lock,
  Printer,
  RefreshCw,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Progress } from "../../../components/ui/progress";
import type { FuekCourse } from "../../../utils/fuekCourseData";
import { getCoursesByDepartment } from "../../../utils/fuekCourseData";
import { getLocalResults } from "../../../utils/sampleData";
import {
  ACADEMIC_SESSION,
  CURRENT_SEMESTER,
  DEMO_STUDENT,
  type DLStudent,
  DL_CREDIT_MAX,
  DL_CREDIT_MIN,
} from "./DLTypes";

const EED_ELECTIVE_CODES_400S1 = ["EED 401", "EED 403", "EED 411"];
const EED_ELECTIVE_CODES_400S2 = [
  "EED 404",
  "EED 410",
  "EED 412",
  "EED 414",
  "EED 416",
  "EED 418",
];

function getEEDMin(level: number, sem: string) {
  if (level === 400 && sem === "First")
    return { min: 1, codes: EED_ELECTIVE_CODES_400S1 };
  if (level === 400 && sem === "Second")
    return { min: 2, codes: EED_ELECTIVE_CODES_400S2 };
  return null;
}

function resolveCarryovers(student: DLStudent): string[] {
  const results = getLocalResults().filter(
    (r) => r.studentMatric === student.matricNumber,
  );
  const failed = results
    .filter((r) => r.grade === "F")
    .map((r) => r.courseCode);
  return failed;
}

function creditColor(total: number): string {
  if (total < DL_CREDIT_MIN) return "text-amber-600";
  if (total > DL_CREDIT_MAX) return "text-red-600";
  return "text-green-600";
}

function creditBg(total: number): string {
  if (total < DL_CREDIT_MIN) return "bg-amber-50 border-amber-300";
  if (total > DL_CREDIT_MAX) return "bg-red-50 border-red-400";
  return "bg-green-50 border-green-300";
}

// ── Print modal ────────────────────────────────────────────────────────────────
interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  student: DLStudent;
  courses: FuekCourse[];
  totalCredits: number;
  registeredAt: string;
  carryoverCodes: Set<string>;
  compulsoryCodes: Set<string>;
}

function DLPrintModal({
  open,
  onClose,
  student,
  courses,
  totalCredits,
  registeredAt,
  carryoverCodes,
  compulsoryCodes,
}: PrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>DL Course Registration — ${student.matricNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; padding: 20mm; }
        h1 { text-align: center; font-size: 14pt; text-transform: uppercase; font-weight: bold; }
        h2 { text-align: center; font-size: 12pt; font-weight: normal; margin-top: 4px; }
        .dl-badge { border: 2px solid #003087; color: #003087; padding: 4px 12px; font-weight: bold; font-size: 11pt; display: inline-block; margin: 8px auto; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin: 16px 0; }
        .info-row { display: flex; gap: 6px; font-size: 11pt; }
        .info-label { font-weight: bold; min-width: 140px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11pt; }
        th { border: 1px solid #000; padding: 6px; background: #f0f0f0; text-align: left; font-weight: bold; }
        td { border: 1px solid #000; padding: 5px 6px; }
        .total-row td { font-weight: bold; background: #f8f8f8; }
        .footer-note { margin-top: 12px; font-size: 10pt; border: 1px solid #000; padding: 8px; }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-top: 40px; }
        .sig-block { border-top: 1px solid #000; padding-top: 4px; font-size: 10pt; text-align: center; }
        @media print { body { padding: 15mm; } }
      </style></head><body>${content.innerHTML}</body></html>`);
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
            <span>DL Registration Confirmation</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer size={14} /> Print Form
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
            <p className="text-sm font-semibold text-primary">
              Distance Learning Centre
            </p>
            <div className="mt-2 inline-block border-2 border-primary rounded px-3 py-1">
              <p className="text-xs font-bold text-primary">
                DISTANCE LEARNING PROGRAMME
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Course Registration Form — {ACADEMIC_SESSION} Academic Session
            </p>
            <div className="mt-2 inline-block bg-green-50 border border-green-200 rounded px-3 py-1">
              <p className="text-xs font-semibold text-green-700">
                ✓ REGISTERED — Subject to Verification by DL Academic Office
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ["Full Name", student.name],
              ["Matric Number", student.matricNumber],
              ["Department", student.department],
              ["Programme", student.programme],
              ["Level", `${student.level} Level`],
              ["Study Mode", "Distance Learning"],
              ["Semester", CURRENT_SEMESTER],
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
                "Credit Total",
                `${totalCredits} Credit Units (Min: ${DL_CREDIT_MIN}, Max: ${DL_CREDIT_MAX})`,
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
                {courses.map((course, idx) => {
                  const type = getType(course.code);
                  return (
                    <tr
                      key={course.code}
                      className="border-b border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 text-xs text-muted-foreground">
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
                    Total Credit Units:
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
              This registration form is issued by the Distance Learning Centre,
              Federal University of Education, Kontagora (FUEK).
            </p>
            <p className="font-semibold text-foreground">
              UniDigital DL-MIS — FUEK | Printed:{" "}
              {new Date().toLocaleString("en-NG")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8">
            {[
              "Student Signature",
              "DL Coordinator / Adviser",
              "DL Registrar",
            ].map((sig) => (
              <div
                key={sig}
                className="border-t border-border pt-2 text-center text-xs text-muted-foreground"
              >
                {sig}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            <X size={14} className="mr-1.5" />
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Printer size={14} />
            Print Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main DL Registration ─────────────────────────────────────────────────────

export function DLCourseRegistration() {
  const student = DEMO_STUDENT;
  const [selectedElectives, setSelectedElectives] = useState<Set<string>>(
    new Set(),
  );
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [registeredAt, setRegisteredAt] = useState("");

  const carryoverCodes = useMemo(
    () => new Set(resolveCarryovers(student)),
    [student],
  );

  // Load courses for dept/level/semester
  const allCourses = useMemo(
    () =>
      getCoursesByDepartment(
        student.department as Parameters<typeof getCoursesByDepartment>[0],
        student.level,
        CURRENT_SEMESTER,
      ),
    [student],
  );

  const compulsory = useMemo(
    () => allCourses.filter((c) => c.type === "compulsory"),
    [allCourses],
  );
  const electives = useMemo(
    () => allCourses.filter((c) => c.type === "elective"),
    [allCourses],
  );

  // Carryover course objects (from all FUEK courses, not just current semester)
  const carryoverCourseObjects: FuekCourse[] = useMemo(() => {
    return [...carryoverCodes].map((code) => {
      const found = allCourses.find((c) => c.code === code);
      if (found) return found;
      return {
        id: code,
        code,
        title: `Carryover: ${code}`,
        creditUnits: 2,
        type: "compulsory" as const,
        level: student.level as FuekCourse["level"],
        semester: CURRENT_SEMESTER,
        department: student.department,
        programmeType: "NUC" as const,
        prerequisites: [],
        isGST: false,
        isCarryoverEligible: true,
        subjectArea: student.department,
      };
    });
  }, [carryoverCodes, allCourses, student]);

  const compulsoryCodes = useMemo(
    () => new Set(compulsory.map((c) => c.code)),
    [compulsory],
  );

  const selectedElectiveObjects = useMemo(
    () => electives.filter((c) => selectedElectives.has(c.code)),
    [electives, selectedElectives],
  );

  const allRegisteredCourses = useMemo(() => {
    const seen = new Set<string>();
    const result: FuekCourse[] = [];
    for (const c of [
      ...carryoverCourseObjects,
      ...compulsory,
      ...selectedElectiveObjects,
    ]) {
      if (!seen.has(c.code)) {
        seen.add(c.code);
        result.push(c);
      }
    }
    return result;
  }, [carryoverCourseObjects, compulsory, selectedElectiveObjects]);

  const totalCredits = useMemo(
    () => allRegisteredCourses.reduce((s, c) => s + c.creditUnits, 0),
    [allRegisteredCourses],
  );

  const eedRule = getEEDMin(student.level, CURRENT_SEMESTER);
  const eedElectiveCount = eedRule
    ? selectedElectiveObjects.filter((c) => eedRule.codes.includes(c.code))
        .length
    : 0;
  const eedValid = eedRule ? eedElectiveCount >= eedRule.min : true;

  const inRange =
    totalCredits >= DL_CREDIT_MIN && totalCredits <= DL_CREDIT_MAX;
  const canSubmit = inRange && eedValid && !submitted;

  const toggleElective = (code: string) => {
    setSelectedElectives((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        const testTotal =
          totalCredits +
          (electives.find((c) => c.code === code)?.creditUnits ?? 2);
        if (testTotal <= DL_CREDIT_MAX) next.add(code);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const ts = new Date().toISOString();
    setRegisteredAt(ts);
    setSubmitted(true);
    setShowModal(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedElectives(new Set());
  };

  const pct = Math.min(100, Math.round((totalCredits / DL_CREDIT_MAX) * 100));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            DL Course Registration
          </h2>
          <p className="text-sm text-muted-foreground">
            {ACADEMIC_SESSION} — {CURRENT_SEMESTER} Semester &bull; Credit
            range: {DL_CREDIT_MIN}–{DL_CREDIT_MAX}C
          </p>
        </div>
        <Badge className="bg-[#003087]/10 text-[#003087] border-[#003087]/30 font-semibold">
          Distance Learning Programme
        </Badge>
      </div>

      {/* Credit counter */}
      <Card className={`border-2 ${creditBg(totalCredits)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              Credit Units Registered
            </span>
            <span className={`text-2xl font-bold ${creditColor(totalCredits)}`}>
              {totalCredits} / {DL_CREDIT_MAX}C
            </span>
          </div>
          <Progress value={pct} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            Minimum: <strong>{DL_CREDIT_MIN}C</strong> &bull; Maximum:{" "}
            <strong>{DL_CREDIT_MAX}C</strong>
            {!inRange && (
              <span className="ml-2 text-amber-600 font-medium">
                {totalCredits < DL_CREDIT_MIN
                  ? `Add ${DL_CREDIT_MIN - totalCredits} more credit(s)`
                  : `Remove ${totalCredits - DL_CREDIT_MAX} credit(s)`}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* EED warning */}
      {eedRule && !eedValid && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{`400L ${CURRENT_SEMESTER} Semester: Select at least ${eedRule.min} EED elective(s).`}</span>
        </div>
      )}

      {/* Carryover courses */}
      {carryoverCourseObjects.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle size={15} className="text-orange-600" />
              Carryover Courses — Auto-selected &amp; Locked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {carryoverCourseObjects.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between p-2 rounded border border-orange-200 bg-white/70"
              >
                <div className="flex items-center gap-2">
                  <Lock size={13} className="text-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {c.code}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                    {c.creditUnits}C
                  </Badge>
                  <Badge className="bg-orange-200 text-orange-800 border-0 text-xs">
                    Carryover
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compulsory courses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock size={15} className="text-green-600" />
            Core Courses — Auto-selected &amp; Locked ({compulsory.length}{" "}
            courses)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {compulsory.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No core courses found for this semester.
            </p>
          )}
          {compulsory.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between p-2 rounded border border-green-200 bg-green-50/50"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {c.code}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                {c.creditUnits}C
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Elective courses */}
      {electives.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-primary" />
              Elective Courses — Select to reach minimum
              {eedRule && (
                <span className="text-xs text-amber-600 font-normal">
                  (Must select ≥{eedRule.min} EED elective)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {electives.map((c) => {
              const checked = selectedElectives.has(c.code);
              const wouldExceed =
                !checked && totalCredits + c.creditUnits > DL_CREDIT_MAX;
              return (
                <button
                  key={c.code}
                  type="button"
                  disabled={wouldExceed || submitted}
                  onClick={() => toggleElective(c.code)}
                  className={`w-full flex items-center justify-between p-2 rounded border text-left transition-all ${
                    checked
                      ? "border-primary bg-primary/5"
                      : wouldExceed
                        ? "border-border bg-muted/20 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  data-ocid={`dl.reg.elective.${c.code.replace(/\s/g, "_")}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-primary border-primary" : "border-input"}`}
                    >
                      {checked && (
                        <CheckCircle
                          size={11}
                          className="text-primary-foreground"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {c.code}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.title}</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                    {c.creditUnits}C
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 bg-muted/30 border border-border rounded-lg p-3 text-xs text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Distance Learning students may register a minimum of{" "}
          <strong>{DL_CREDIT_MIN}C</strong> and a maximum of{" "}
          <strong>{DL_CREDIT_MAX}C</strong> per semester. Carryover courses are
          mandatory and already counted in your total.
        </span>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted-foreground">
          {allRegisteredCourses.length} course(s) &bull; {totalCredits} credit
          unit(s)
        </div>
        <div className="flex gap-2">
          {submitted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RefreshCw size={14} /> Reset
            </Button>
          )}
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="gap-1.5"
            data-ocid="dl.reg.submit_button"
          >
            <CheckCircle size={15} />
            {submitted ? "Registered ✓" : "Submit DL Registration"}
          </Button>
        </div>
      </div>

      <DLPrintModal
        open={showModal}
        onClose={() => setShowModal(false)}
        student={student}
        courses={allRegisteredCourses}
        totalCredits={totalCredits}
        registeredAt={registeredAt}
        carryoverCodes={carryoverCodes}
        compulsoryCodes={compulsoryCodes}
      />
    </div>
  );
}
