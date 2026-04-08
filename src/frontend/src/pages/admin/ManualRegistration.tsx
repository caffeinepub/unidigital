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
import { useState } from "react";
import { toast } from "sonner";
import { DocumentScanner } from "../../components/DocumentScanner";
import { getCompulsoryCourses } from "../../utils/fuekCourseData";
import {
  DEPARTMENTS,
  INSTITUTION_CATEGORIES,
  LEVELS,
  addRegistrationAuditLog,
  generateRegistrationId,
  isMatricDuplicate,
  normalizeMatric,
  normalizeName,
  upsertExtendedStudent,
  validateEmail,
} from "../../utils/registrationUtils";
import {
  getLocalRegistrations,
  getLocalStudents,
  saveLocalRegistrations,
  saveLocalStudents,
} from "../../utils/sampleData";

type Step = 1 | 2 | 3 | 4;

const PROGRAMME_TYPES = [
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
] as const;
type ProgrammeType = (typeof PROGRAMME_TYPES)[number];

const ENTRY_MODES = ["UTME", "DE"] as const;

const SUBJECT_COMBINATIONS = [
  "CSC/MAT",
  "PHY/CSC",
  "BIO/CSC",
  "PHY/CHE",
  "EDU/CSC",
  "EDU/MAT",
  "EDU/BIO",
  "EDU/PHY",
  "BIO/CHE",
  "MAT/PHY",
  "HKE/BIO",
  "HED/BIO",
];

const POSTGRAD_TYPES: ProgrammeType[] = ["PGD", "PGDE", "PhD", "MSc", "MPhil"];

function levelToNumber(level: string): number | string {
  if (level === "NCE I" || level === "100") return 100;
  if (level === "NCE II" || level === "200") return 200;
  if (level === "NCE III" || level === "300") return 300;
  if (level === "400") return 400;
  if (level === "ND I") return 100;
  if (level === "ND II") return 200;
  if (level === "HND I") return 300;
  if (level === "HND II") return 400;
  if (["PGD", "PGDE"].includes(level)) return 700;
  if (["MSc", "MPhil"].includes(level)) return 800;
  if (level === "PhD") return 1000;
  return "Batch";
}

interface PersonalInfo {
  matricNumber: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

interface AcademicInfo {
  department: string;
  level: string;
  subCombination: string;
  institutionCategory: string;
  programmeType: ProgrammeType;
  entryMode: string;
}

const defaultPersonal: PersonalInfo = {
  matricNumber: "",
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
};

const defaultAcademic: AcademicInfo = {
  department: "",
  level: "100",
  subCombination: "",
  institutionCategory: "university",
  programmeType: "NUC",
  entryMode: "UTME",
};

function autoRegisterCourses(
  matricNumber: string,
  programmeType: string,
  level: string,
) {
  const numericLevel = levelToNumber(level);
  const compulsory = getCompulsoryCourses(programmeType, numericLevel);
  if (compulsory.length === 0) return 0;

  const existing = getLocalRegistrations();
  let added = 0;
  for (const c of compulsory) {
    const alreadyExists = existing.some(
      (r) => r.studentMatric === matricNumber && r.courseCode === c.code,
    );
    if (!alreadyExists) {
      existing.push({
        id: `REG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentMatric: matricNumber,
        courseCode: c.code,
        semester: c.semester === "Both" ? "First" : c.semester,
        registeredAt: new Date().toISOString(),
      });
      added++;
    }
  }
  saveLocalRegistrations(existing);
  return added;
}

export function ManualRegistration() {
  const [step, setStep] = useState<Step>(1);
  const [personal, setPersonal] = useState<PersonalInfo>(defaultPersonal);
  const [academic, setAcademic] = useState<AcademicInfo>(defaultAcademic);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [regId, setRegId] = useState<string>("");
  const [coursesRegistered, setCoursesRegistered] = useState(0);

  const existingMatrics = getLocalStudents().map((s) => s.matricNumber);

  const previewCourses = getCompulsoryCourses(
    academic.programmeType,
    levelToNumber(academic.level),
  );

  const showEntryMode =
    academic.programmeType === "NCE" || academic.programmeType === "NUC";
  const showSubjectCombination =
    academic.programmeType === "NCE" ||
    academic.institutionCategory === "college_of_education";
  const showSubjectComboSelect = showSubjectCombination;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!personal.matricNumber.trim()) e.matricNumber = "Required";
    else if (isMatricDuplicate(personal.matricNumber, existingMatrics))
      e.matricNumber = "Matric number already exists";
    if (!personal.name.trim()) e.name = "Required";
    if (!personal.email.trim()) e.email = "Required";
    else if (!validateEmail(personal.email)) e.email = "Invalid email format";
    if (!personal.phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!academic.department) e.department = "Required";
    if (!academic.level) e.level = "Required";
    if (!academic.programmeType) e.programmeType = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep((s) => (s + 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const id = generateRegistrationId();
    const normalizedMatric = normalizeMatric(personal.matricNumber);
    const normalizedName = normalizeName(personal.name);

    const student = {
      matricNumber: normalizedMatric,
      name: normalizedName,
      email: personal.email.toLowerCase().trim(),
      level: academic.level,
      department: academic.department,
      subCombination: academic.subCombination || undefined,
      institutionCategory: academic.institutionCategory as
        | "university"
        | "college_of_education"
        | "polytechnic",
      programmeType: academic.programmeType,
      entryMode: academic.entryMode,
      registrationSource: "manual" as const,
      registrationStatus: "pending_approval" as const,
      registrationId: id,
      phone: personal.phone,
      dateOfBirth: personal.dateOfBirth,
      address: personal.address,
      photoUrl,
      registeredAt: new Date().toISOString(),
    };

    const students = getLocalStudents();
    if (!students.find((s) => s.matricNumber === normalizedMatric)) {
      students.push(student);
      saveLocalStudents(students);
    }
    upsertExtendedStudent(student);
    addRegistrationAuditLog({
      id: `AUDIT-${Date.now()}`,
      registrationId: id,
      studentMatric: normalizedMatric,
      action: "created",
      performedBy: "Admin",
      timestamp: new Date().toISOString(),
      newStatus: "pending_approval",
    });

    const registered = autoRegisterCourses(
      normalizedMatric,
      academic.programmeType,
      academic.level,
    );
    setCoursesRegistered(registered);
    setRegId(id);
    setSubmitting(false);
    toast.success(
      `Registration ${id} submitted — ${registered} courses auto-registered!`,
    );
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setPersonal(defaultPersonal);
    setAcademic(defaultAcademic);
    setPhotoUrl("");
    setErrors({});
    setRegId("");
    setCoursesRegistered(0);
  };

  const stepLabels = [
    "Personal Info",
    "Academic Info",
    "Photo",
    "Review & Submit",
  ];

  if (step === 4 && regId) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="text-center py-10 bg-green-50 border border-green-200 rounded-xl">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-800">
            Registration Submitted!
          </h2>
          <p className="text-green-700 mt-2">
            Registration ID:{" "}
            <span className="font-mono font-bold">{regId}</span>
          </p>
          <p className="text-sm text-green-600 mt-1">
            Status: Pending Admin/HOD Approval
          </p>
          {coursesRegistered > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <span className="text-blue-700 text-sm font-medium">
                📚 {coursesRegistered} compulsory courses auto-registered for{" "}
                {academic.programmeType} programme
              </span>
            </div>
          )}
          <div>
            <Button
              className="mt-6 bg-blue-600 hover:bg-blue-700"
              onClick={handleReset}
              data-ocid="manual_reg.new_button"
            >
              Register Another Student
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manual Registration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Register a new student using the multi-step form
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDone ? "bg-green-500 text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {isDone ? "✓" : n}
              </div>
              <span
                className={`text-xs hidden sm:block ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${isDone ? "bg-green-400" : "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>
                  Matric Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. CSC/2024/001"
                  value={personal.matricNumber}
                  onChange={(e) =>
                    setPersonal((p) => ({ ...p, matricNumber: e.target.value }))
                  }
                  data-ocid="manual_reg.matric_input"
                />
                {errors.matricNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.matricNumber}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. John Doe"
                  value={personal.name}
                  onChange={(e) =>
                    setPersonal((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="manual_reg.name_input"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="mt-1"
                  type="email"
                  placeholder="student@edu.ng"
                  value={personal.email}
                  onChange={(e) =>
                    setPersonal((p) => ({ ...p, email: e.target.value }))
                  }
                  data-ocid="manual_reg.email_input"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label>
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="mt-1"
                  placeholder="080XXXXXXXX"
                  value={personal.phone}
                  onChange={(e) =>
                    setPersonal((p) => ({ ...p, phone: e.target.value }))
                  }
                  data-ocid="manual_reg.phone_input"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={personal.dateOfBirth}
                  onChange={(e) =>
                    setPersonal((p) => ({ ...p, dateOfBirth: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  className="mt-1"
                  placeholder="Residential address"
                  value={personal.address}
                  onChange={(e) =>
                    setPersonal((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Academic Info */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Programme Type */}
              <div>
                <Label>
                  Programme Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={academic.programmeType}
                  onValueChange={(v) =>
                    setAcademic((a) => ({
                      ...a,
                      programmeType: v as ProgrammeType,
                      entryMode: POSTGRAD_TYPES.includes(v as ProgrammeType)
                        ? "Direct"
                        : a.entryMode,
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="manual_reg.programme_select"
                  >
                    <SelectValue placeholder="Select programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMME_TYPES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programmeType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.programmeType}
                  </p>
                )}
              </div>

              {/* Entry Mode */}
              {showEntryMode && (
                <div>
                  <Label>Entry Mode</Label>
                  <Select
                    value={academic.entryMode}
                    onValueChange={(v) =>
                      setAcademic((a) => ({ ...a, entryMode: v }))
                    }
                  >
                    <SelectTrigger
                      className="mt-1"
                      data-ocid="manual_reg.entry_mode_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTRY_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Department */}
              <div>
                <Label>
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={academic.department}
                  onValueChange={(v) =>
                    setAcademic((a) => ({ ...a, department: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="manual_reg.dept_select"
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Level */}
              <div>
                <Label>
                  Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={academic.level}
                  onValueChange={(v) =>
                    setAcademic((a) => ({ ...a, level: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="manual_reg.level_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Institution Category */}
              <div>
                <Label>Institution Category</Label>
                <Select
                  value={academic.institutionCategory}
                  onValueChange={(v) =>
                    setAcademic((a) => ({ ...a, institutionCategory: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Combination */}
              {showSubjectComboSelect && (
                <div>
                  <Label>Subject Combination (NCE/CoE)</Label>
                  <Select
                    value={academic.subCombination}
                    onValueChange={(v) =>
                      setAcademic((a) => ({ ...a, subCombination: v }))
                    }
                  >
                    <SelectTrigger
                      className="mt-1"
                      data-ocid="manual_reg.subcomb_select"
                    >
                      <SelectValue placeholder="Select combination" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_COMBINATIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Compulsory courses preview */}
            {previewCourses.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs font-semibold text-blue-800 mb-2">
                  📚 Courses that will be auto-registered (
                  {previewCourses.length} compulsory):
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {previewCourses.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-xs">
                      <Badge className="bg-blue-100 text-blue-700 border-0 font-mono">
                        {c.code}
                      </Badge>
                      <span className="text-blue-700">{c.title}</span>
                      <span className="text-blue-400 ml-auto">
                        {c.creditUnits} CU
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-500 mt-2">
                  Total: {previewCourses.reduce((s, c) => s + c.creditUnits, 0)}{" "}
                  credit units
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Photo */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Student Photo (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photoUrl ? (
              <div className="text-center space-y-3">
                <img
                  src={photoUrl}
                  alt="Student"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200"
                />
                <Badge className="bg-green-100 text-green-700 border-0">
                  Photo captured
                </Badge>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScannerOpen(true)}
                    data-ocid="manual_reg.retake_button"
                  >
                    Retake Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">
                  Capture or upload student passport photo
                </p>
                <Button
                  onClick={() => setScannerOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                  data-ocid="manual_reg.scan_button"
                >
                  📷 Open Camera / Upload
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && !regId && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Matric Number", personal.matricNumber],
                ["Full Name", normalizeName(personal.name)],
                ["Email", personal.email],
                ["Phone", personal.phone],
                ["Date of Birth", personal.dateOfBirth || "—"],
                ["Address", personal.address || "—"],
                ["Programme Type", academic.programmeType],
                ["Entry Mode", academic.entryMode],
                ["Department", academic.department],
                ["Level", academic.level],
                [
                  "Institution Category",
                  INSTITUTION_CATEGORIES.find(
                    (c) => c.value === academic.institutionCategory,
                  )?.label || "",
                ],
                ["Subject Combination", academic.subCombination || "—"],
              ].map(([label, val]) => (
                <div key={label} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium text-foreground mt-0.5 truncate">
                    {val}
                  </p>
                </div>
              ))}
            </div>
            {photoUrl && (
              <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                <img
                  src={photoUrl}
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm text-green-700">Photo attached</span>
              </div>
            )}
            {previewCourses.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  📚 {previewCourses.length} compulsory courses will be
                  auto-registered on submit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {!(step === 4 && regId) && (
        <div className="flex justify-between pt-2">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as Step)}
              data-ocid="manual_reg.back_button"
            >
              ← Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleNext}
              data-ocid="manual_reg.next_button"
            >
              Next →
            </Button>
          ) : step === 3 ? (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setStep(4)}
              data-ocid="manual_reg.review_button"
            >
              Review →
            </Button>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={submitting}
              data-ocid="manual_reg.submit_button"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </Button>
          )}
        </div>
      )}

      <DocumentScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={(_file, url) => {
          setPhotoUrl(url);
          setScannerOpen(false);
        }}
        title="Capture Student Photo"
        acceptedTypes="image/*"
      />
    </div>
  );
}
