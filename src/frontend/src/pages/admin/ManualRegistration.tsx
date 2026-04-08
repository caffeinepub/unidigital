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
import { getLocalStudents, saveLocalStudents } from "../../utils/sampleData";

type Step = 1 | 2 | 3 | 4;

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
};

export function ManualRegistration() {
  const [step, setStep] = useState<Step>(1);
  const [personal, setPersonal] = useState<PersonalInfo>(defaultPersonal);
  const [academic, setAcademic] = useState<AcademicInfo>(defaultAcademic);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [regId, setRegId] = useState<string>("");

  const existingMatrics = getLocalStudents().map((s) => s.matricNumber);

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
      registrationSource: "manual" as const,
      registrationStatus: "pending_approval" as const,
      registrationId: id,
      phone: personal.phone,
      dateOfBirth: personal.dateOfBirth,
      address: personal.address,
      photoUrl,
      registeredAt: new Date().toISOString(),
    };

    // Save to both stores
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

    setRegId(id);
    setSubmitting(false);
    toast.success(`Registration ${id} submitted successfully!`);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setPersonal(defaultPersonal);
    setAcademic(defaultAcademic);
    setPhotoUrl("");
    setErrors({});
    setRegId("");
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
          <Button
            className="mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={handleReset}
            data-ocid="manual_reg.new_button"
          >
            Register Another Student
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Manual Registration
        </h1>
        <p className="text-slate-500 text-sm mt-1">
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
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDone ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                {isDone ? "✓" : n}
              </div>
              <span
                className={`text-xs hidden sm:block ${isActive ? "text-blue-700 font-semibold" : "text-slate-400"}`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${isDone ? "bg-green-400" : "bg-slate-200"}`}
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
              <div>
                <Label>Subject Combination (CoE)</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. CSC/MAT"
                  value={academic.subCombination}
                  onChange={(e) =>
                    setAcademic((a) => ({
                      ...a,
                      subCombination: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
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
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500 mb-4">
                  Capture or upload student passport photo
                </p>
                <Button
                  onClick={() => setScannerOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
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
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">{label}</p>
                  <p className="font-medium text-slate-800 mt-0.5 truncate">
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleNext}
              data-ocid="manual_reg.next_button"
            >
              Next →
            </Button>
          ) : step === 3 ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
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
