import {
  Award,
  Briefcase,
  Camera,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  LogOut,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCamera } from "../../camera/useCamera";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffProfile {
  staffId: string;
  name: string;
  dob: string;
  gender: string;
  nationality: string;
  state: string;
  lga: string;
  address: string;
  phone: string;
  email: string;
  photoUrl?: string;
  qualifications: {
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }[];
  employmentHistory: {
    employer: string;
    role: string;
    startYear: string;
    endYear: string;
    remarks?: string;
  }[];
  designation: string;
  gradeLevel: string;
  department: string;
  faculty: string;
  dateOfAppointment: string;
  employmentType: "permanent" | "contract" | "visiting";
  salaryGrade: string;
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokAddress?: string;
  employmentStatus: "active" | "probation" | "retired" | "exited";
  probationEndDate?: string;
  probationReviewSchedule?: "quarterly" | "biannual";
  probationNotes?: string;
  probationConfirmDate?: string;
  confirmationLetterGenerated?: boolean;
  promotionHistory?: {
    date: string;
    fromPosition: string;
    toPosition: string;
    newSalaryGrade: string;
  }[];
  exitDate?: string;
  exitReason?: "retirement" | "resignation" | "termination";
  retirementDate?: string;
  exitInterviewDone?: boolean;
  gratuityAmount?: number;
  clearanceStatus?: "not-started" | "in-progress" | "cleared";
  exitChecklist?: {
    laptop: boolean;
    idCard: boolean;
    keys: boolean;
    dues: boolean;
  };
  performanceRating?: number;
  leaveBalance?: { annual: number; sick: number; maternity: number };
}

export interface AuditEntry {
  id: string;
  entityType: "staff";
  entityId: string;
  entityName: string;
  action: "add" | "edit" | "delete";
  user: string;
  timestamp: string;
  details: {
    before?: StaffProfile | null;
    after?: StaffProfile | null;
    changedFields?: string[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = "unidigital_staff_profiles";
const PHOTOS_KEY = "unidigital_id_photos";
const AUDIT_KEY = "unidigital_profile_audit_log";

const DEPT_LIST = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Education",
  "English",
  "History",
  "Administration",
  "Bursary",
  "Library",
  "Health Services",
];

const SEED_PROFILES: StaffProfile[] = [
  {
    staffId: "FUEK/STAFF/001",
    name: "Dr. Ahmed Musa",
    dob: "1975-04-12",
    gender: "Male",
    nationality: "Nigerian",
    state: "Niger",
    lga: "Kontagora",
    address: "No. 4 University Road, Kontagora",
    phone: "08012345678",
    email: "a.musa@fuek.edu.ng",
    qualifications: [
      {
        degree: "B.Sc Computer Science",
        institution: "ABU Zaria",
        year: "1998",
        grade: "Second Class Upper",
      },
      {
        degree: "M.Sc Computer Science",
        institution: "University of Lagos",
        year: "2002",
        grade: "Distinction",
      },
      {
        degree: "Ph.D Computer Science",
        institution: "University of Ibadan",
        year: "2010",
        grade: "Pass",
      },
    ],
    employmentHistory: [
      {
        employer: "Kogi State University",
        role: "Lecturer II",
        startYear: "2003",
        endYear: "2010",
        remarks: "Good performance",
      },
    ],
    designation: "Senior Lecturer",
    gradeLevel: "CONUASS 5",
    department: "Computer Science",
    faculty: "Science",
    dateOfAppointment: "2010-09-01",
    employmentType: "permanent",
    salaryGrade: "GL 13",
    nokName: "Fatima Musa",
    nokRelationship: "Spouse",
    nokPhone: "08098765432",
    nokAddress: "No. 4 University Road, Kontagora",
    employmentStatus: "active",
    promotionHistory: [
      {
        date: "2015-09-01",
        fromPosition: "Lecturer I",
        toPosition: "Senior Lecturer",
        newSalaryGrade: "GL 13",
      },
    ],
    performanceRating: 85,
    leaveBalance: { annual: 15, sick: 10, maternity: 0 },
  },
  {
    staffId: "FUEK/STAFF/002",
    name: "Mrs. Grace Okoye",
    dob: "1982-07-20",
    gender: "Female",
    nationality: "Nigerian",
    state: "Anambra",
    lga: "Awka",
    address: "Block C, Staff Quarters, FUEK",
    phone: "07034567890",
    email: "g.okoye@fuek.edu.ng",
    qualifications: [
      {
        degree: "B.Ed Mathematics",
        institution: "UNIJOS",
        year: "2004",
        grade: "Second Class Upper",
      },
      {
        degree: "M.Ed Mathematics Education",
        institution: "FUEK",
        year: "2012",
        grade: "Distinction",
      },
    ],
    employmentHistory: [],
    designation: "Lecturer II",
    gradeLevel: "CONUASS 3",
    department: "Mathematics",
    faculty: "Science",
    dateOfAppointment: "2013-01-15",
    employmentType: "permanent",
    salaryGrade: "GL 10",
    nokName: "Emeka Okoye",
    nokRelationship: "Spouse",
    nokPhone: "08056781234",
    employmentStatus: "active",
    performanceRating: 78,
    leaveBalance: { annual: 20, sick: 10, maternity: 90 },
  },
  {
    staffId: "FUEK/STAFF/003",
    name: "Mr. Bello Suleiman",
    dob: "1990-03-05",
    gender: "Male",
    nationality: "Nigerian",
    state: "Kebbi",
    lga: "Birnin Kebbi",
    address: "No. 12 Staff Road, Kontagora",
    phone: "08123456789",
    email: "b.suleiman@fuek.edu.ng",
    qualifications: [
      {
        degree: "B.Sc Physics",
        institution: "UDUS",
        year: "2013",
        grade: "Second Class Lower",
      },
    ],
    employmentHistory: [],
    designation: "Assistant Lecturer",
    gradeLevel: "CONUASS 2",
    department: "Physics",
    faculty: "Science",
    dateOfAppointment: "2022-07-01",
    employmentType: "contract",
    salaryGrade: "GL 8",
    nokName: "Aisha Suleiman",
    nokRelationship: "Sibling",
    nokPhone: "08076543210",
    employmentStatus: "probation",
    probationEndDate: "2024-07-01",
    probationReviewSchedule: "biannual",
    probationNotes: "Performing satisfactorily. On track for confirmation.",
    performanceRating: 72,
    leaveBalance: { annual: 10, sick: 5, maternity: 0 },
  },
  {
    staffId: "FUEK/STAFF/004",
    name: "Prof. Ngozi Adeyemi",
    dob: "1968-11-22",
    gender: "Female",
    nationality: "Nigerian",
    state: "Oyo",
    lga: "Ibadan North",
    address: "No. 7 Professors' Quarters, FUEK",
    phone: "08099887766",
    email: "n.adeyemi@fuek.edu.ng",
    qualifications: [
      {
        degree: "B.Ed Biology",
        institution: "University of Ibadan",
        year: "1990",
        grade: "Second Class Upper",
      },
      {
        degree: "M.Ed Biology Education",
        institution: "University of Ibadan",
        year: "1994",
        grade: "Distinction",
      },
      {
        degree: "Ph.D Biology Education",
        institution: "University of Lagos",
        year: "2000",
        grade: "Pass",
      },
    ],
    employmentHistory: [],
    designation: "Professor",
    gradeLevel: "CONUASS 7",
    department: "Biology",
    faculty: "Science",
    dateOfAppointment: "2005-01-01",
    employmentType: "permanent",
    salaryGrade: "GL 15",
    nokName: "Tunde Adeyemi",
    nokRelationship: "Spouse",
    nokPhone: "08077665544",
    employmentStatus: "active",
    retirementDate: "2028-11-22",
    promotionHistory: [
      {
        date: "2010-01-01",
        fromPosition: "Associate Professor",
        toPosition: "Professor",
        newSalaryGrade: "GL 15",
      },
    ],
    performanceRating: 92,
    leaveBalance: { annual: 25, sick: 10, maternity: 0 },
  },
];

// ─── Utilities ─────────────────────────────────────────────────────────────────

function loadProfiles(): StaffProfile[] {
  try {
    const r = localStorage.getItem(LS_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}

function saveProfiles(data: StaffProfile[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function loadPhotos(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PHOTOS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function savePhoto(id: string, base64: string) {
  const photos = loadPhotos();
  photos[id] = base64;
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

export function loadAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function appendAuditEntry(entry: AuditEntry) {
  const log = loadAuditLog();
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...log]));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getChangedFields(before: StaffProfile, after: StaffProfile): string[] {
  const keys = Object.keys(after) as (keyof StaffProfile)[];
  return keys.filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  );
}

// ─── Photo Capture Panel ───────────────────────────────────────────────────────

function PhotoPanel({
  staffId,
  currentPhoto,
  onSave,
}: {
  staffId: string;
  currentPhoto?: string;
  onSave: (base64: string) => void;
}) {
  const camera = useCamera({ facingMode: "user", quality: 0.8 });
  const [captured, setCaptured] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "webcam" | "captured">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCapture = async () => {
    const file = await camera.capturePhoto();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setCaptured(b64);
      setMode("captured");
    };
    reader.readAsDataURL(file);
    camera.stopCamera();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setCaptured(b64);
      setMode("captured");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!captured) return;
    savePhoto(staffId, captured);
    onSave(captured);
    setMode("idle");
    setCaptured(null);
  };

  const handleRetake = () => {
    setCaptured(null);
    setMode("idle");
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Profile Photo
      </Label>

      {/* Current / captured preview */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
          {(captured ?? currentPhoto) ? (
            <img
              src={captured ?? currentPhoto}
              alt="Staff"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={28} className="text-muted-foreground" />
          )}
        </div>
        {mode === "idle" && (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMode("webcam");
                camera.startCamera();
              }}
            >
              <Camera size={13} className="mr-1" /> Use Webcam
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={13} className="mr-1" /> Upload Photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        )}
        {mode === "captured" && (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSave}
            >
              Save Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetake}
            >
              <RefreshCw size={13} className="mr-1" /> Retake
            </Button>
          </div>
        )}
      </div>

      {/* Live webcam view */}
      {mode === "webcam" && (
        <div className="space-y-2">
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ maxWidth: 280 }}
          >
            {camera.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs">
                Starting camera…
              </div>
            )}
            {camera.error && (
              <div className="p-4 text-red-400 text-xs text-center">
                {camera.error.message}
              </div>
            )}
            <video
              ref={camera.videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={camera.canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCapture}
              disabled={!camera.isActive}
            >
              <Camera size={13} className="mr-1" /> Capture
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                camera.stopCamera();
                setMode("idle");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Staff Avatar ──────────────────────────────────────────────────────────────

function StaffAvatar({
  staffId,
  name,
  size = 40,
}: { staffId: string; name: string; size?: number }) {
  const photos = loadPhotos();
  const photo = photos[staffId];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const color = colors[staffId.charCodeAt(staffId.length - 1) % colors.length];

  if (photo) {
    return (
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

// ─── Audit Trail Panel ─────────────────────────────────────────────────────────

function AuditTrailPanel({ staffId }: { staffId: string }) {
  const entries = loadAuditLog()
    .filter((e) => e.entityId === staffId)
    .slice(0, 10);

  if (!entries.length) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No audit history for this staff member.
      </p>
    );
  }

  const actionColor: Record<string, string> = {
    add: "bg-green-100 text-green-700",
    edit: "bg-blue-100 text-blue-700",
    delete: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <div
          key={e.id}
          className="flex items-start gap-3 text-xs p-2 rounded-lg bg-muted/40 border border-border"
        >
          <Clock
            size={12}
            className="mt-0.5 text-muted-foreground flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${actionColor[e.action]}`}
              >
                {e.action}
              </span>
              <span className="text-muted-foreground">by {e.user}</span>
              <span className="text-muted-foreground">
                {new Date(e.timestamp).toLocaleString()}
              </span>
            </div>
            {e.details.changedFields?.length ? (
              <p className="mt-1 text-muted-foreground">
                Fields: {e.details.changedFields.join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Staff Profile Full View ───────────────────────────────────────────────────

function StaffProfileDetail({
  profile,
  onBack,
  onEdit,
  onUpdate,
}: {
  profile: StaffProfile;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (p: StaffProfile) => void;
}) {
  const [photoKey, setPhotoKey] = useState(0);
  const photos = loadPhotos();
  const photo = photos[profile.staffId];

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-300",
    probation: "bg-amber-100 text-amber-700 border-amber-300",
    retired: "bg-muted text-muted-foreground border-border",
    exited: "bg-red-100 text-red-700 border-red-300",
  };

  const printProfile = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const quals = profile.qualifications
      .map(
        (q) =>
          `<tr><td>${q.degree}</td><td>${q.institution}</td><td>${q.year}</td><td>${q.grade ?? "—"}</td></tr>`,
      )
      .join("");
    const empHist = profile.employmentHistory
      .map(
        (e) =>
          `<tr><td>${e.employer}</td><td>${e.role}</td><td>${e.startYear}</td><td>${e.endYear}</td><td>${e.remarks ?? ""}</td></tr>`,
      )
      .join("");
    const promoHist = (profile.promotionHistory ?? [])
      .map(
        (ph) =>
          `<tr><td>${ph.date}</td><td>${ph.fromPosition}</td><td>${ph.toPosition}</td><td>${ph.newSalaryGrade}</td></tr>`,
      )
      .join("");

    win.document.write(`<html><head><style>
      body{font-family:Arial,sans-serif;padding:30px;font-size:12px;color:#1e293b}
      h1{font-size:18px;color:#1e3a5f;text-align:center}
      h2{font-size:13px;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:4px;margin-top:18px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left}
      th{background:#f1f5f9;font-weight:bold}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .field{margin:4px 0}.label{font-weight:bold;color:#475569}
      @media print{@page{size:A4;margin:20mm}}
    </style></head><body>
    <h1>STAFF ACADEMIC/EMPLOYMENT RECORD</h1>
    <p style="text-align:center;color:#475569;font-size:11px;margin:0">Federal University of Education, Kontagora (FUEK) — MIS</p>
    <h2>Personal Information</h2>
    <div class="grid2">
      <div class="field"><span class="label">Name:</span> ${profile.name}</div>
      <div class="field"><span class="label">Staff ID:</span> ${profile.staffId}</div>
      <div class="field"><span class="label">Date of Birth:</span> ${profile.dob}</div>
      <div class="field"><span class="label">Gender:</span> ${profile.gender}</div>
      <div class="field"><span class="label">Nationality:</span> ${profile.nationality}</div>
      <div class="field"><span class="label">State:</span> ${profile.state}</div>
      <div class="field"><span class="label">LGA:</span> ${profile.lga}</div>
      <div class="field"><span class="label">Phone:</span> ${profile.phone}</div>
      <div class="field"><span class="label">Email:</span> ${profile.email}</div>
      <div class="field"><span class="label">Address:</span> ${profile.address}</div>
    </div>
    <h2>Current Employment</h2>
    <div class="grid2">
      <div class="field"><span class="label">Designation:</span> ${profile.designation}</div>
      <div class="field"><span class="label">Grade Level:</span> ${profile.gradeLevel}</div>
      <div class="field"><span class="label">Department:</span> ${profile.department}</div>
      <div class="field"><span class="label">Faculty:</span> ${profile.faculty}</div>
      <div class="field"><span class="label">Appointment Date:</span> ${profile.dateOfAppointment}</div>
      <div class="field"><span class="label">Employment Type:</span> ${profile.employmentType}</div>
      <div class="field"><span class="label">Salary Grade:</span> ${profile.salaryGrade}</div>
      <div class="field"><span class="label">Status:</span> ${profile.employmentStatus.toUpperCase()}</div>
    </div>
    ${quals ? `<h2>Academic Qualifications</h2><table><thead><tr><th>Qualification</th><th>Institution</th><th>Year</th><th>Grade</th></tr></thead><tbody>${quals}</tbody></table>` : ""}
    ${empHist ? `<h2>Employment History</h2><table><thead><tr><th>Employer</th><th>Role</th><th>From</th><th>To</th><th>Remarks</th></tr></thead><tbody>${empHist}</tbody></table>` : ""}
    ${promoHist ? `<h2>Promotion History</h2><table><thead><tr><th>Date</th><th>From</th><th>To</th><th>New Salary Grade</th></tr></thead><tbody>${promoHist}</tbody></table>` : ""}
    <h2>Next of Kin</h2>
    <div class="grid2">
      <div class="field"><span class="label">Name:</span> ${profile.nokName}</div>
      <div class="field"><span class="label">Relationship:</span> ${profile.nokRelationship}</div>
      <div class="field"><span class="label">Phone:</span> ${profile.nokPhone}</div>
      <div class="field"><span class="label">Address:</span> ${profile.nokAddress ?? "—"}</div>
    </div>
    <p style="text-align:right;font-size:10px;margin-top:30px;color:#94a3b8">Printed: ${new Date().toLocaleString()} &nbsp;|&nbsp; FUEK MIS &nbsp;|&nbsp; Page 1</p>
    </body></html>`);
    win.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          data-ocid="profile-back-btn"
        >
          <ChevronRight size={14} className="rotate-180 mr-1" /> Back to
          Directory
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={printProfile}
          data-ocid="profile-print-btn"
        >
          <Printer size={14} className="mr-1" /> Print Record
        </Button>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onEdit}
          data-ocid="profile-edit-btn"
        >
          <Edit size={14} className="mr-1" /> Edit Profile
        </Button>
      </div>

      {/* Hero card */}
      <Card className="border-t-4 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-background shadow-md">
                {photo ? (
                  <img
                    key={photoKey}
                    src={photo}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <User size={44} className="text-primary" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {profile.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {profile.designation} · {profile.department}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {profile.staffId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${statusColor[profile.employmentStatus]}`}
                >
                  {profile.employmentStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone size={13} />
                  {profile.phone}
                </span>
                <span>{profile.email}</span>
                <span>Grade: {profile.gradeLevel}</span>
                <span>Salary: {profile.salaryGrade}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={14} /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Date of Birth", profile.dob],
              ["Gender", profile.gender],
              ["Nationality", profile.nationality],
              ["State of Origin", profile.state],
              ["LGA", profile.lga],
              ["Address", profile.address],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-muted-foreground w-36 flex-shrink-0">
                  {label}:
                </span>
                <span className="font-medium text-foreground break-words">
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase size={14} /> Current Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Designation", profile.designation],
              ["Grade Level", profile.gradeLevel],
              ["Department", profile.department],
              ["Faculty", profile.faculty],
              ["Date of Appointment", profile.dateOfAppointment],
              ["Employment Type", profile.employmentType],
              ["Salary Grade", profile.salaryGrade],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-muted-foreground w-36 flex-shrink-0">
                  {label}:
                </span>
                <span className="font-medium text-foreground capitalize">
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap size={14} /> Academic Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.qualifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No qualifications recorded.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                        Qualification
                      </th>
                      <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                        Institution
                      </th>
                      <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                        Year
                      </th>
                      <th className="text-left py-1 font-semibold text-muted-foreground">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.qualifications.map((q) => (
                      <tr
                        key={`${q.degree}-${q.year}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-1.5 pr-2 font-medium">{q.degree}</td>
                        <td className="py-1.5 pr-2 text-muted-foreground">
                          {q.institution}
                        </td>
                        <td className="py-1.5 pr-2">{q.year}</td>
                        <td className="py-1.5">{q.grade ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={14} /> Employment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.employmentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No prior employment recorded.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                        Employer
                      </th>
                      <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-1 pr-2 font-semibold text-muted-foreground">
                        Period
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.employmentHistory.map((h) => (
                      <tr
                        key={`${h.employer}-${h.startYear}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-1.5 pr-2 font-medium">
                          {h.employer}
                        </td>
                        <td className="py-1.5 pr-2 text-muted-foreground">
                          {h.role}
                        </td>
                        <td className="py-1.5">
                          {h.startYear}–{h.endYear}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NOK */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={14} /> Next of Kin Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ["Name", profile.nokName],
              ["Relationship", profile.nokRelationship],
              ["Phone", profile.nokPhone],
              ["Address", profile.nokAddress ?? "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Promotion History */}
      {(profile.promotionHistory?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp size={14} /> Promotion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    {[
                      "Date",
                      "From Position",
                      "To Position",
                      "New Salary Grade",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-1 pr-3 font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.promotionHistory?.map((ph) => (
                    <tr
                      key={`${ph.date}-${ph.toPosition}`}
                      className="border-b last:border-0"
                    >
                      <td className="py-1.5 pr-3">{ph.date}</td>
                      <td className="py-1.5 pr-3 text-muted-foreground">
                        {ph.fromPosition}
                      </td>
                      <td className="py-1.5 pr-3 font-medium text-green-600">
                        {ph.toPosition}
                      </td>
                      <td className="py-1.5">{ph.newSalaryGrade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave & Performance */}
      <div className="grid sm:grid-cols-2 gap-4">
        {profile.leaveBalance && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wide">
                Leave Balance
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Annual",
                    value: profile.leaveBalance.annual,
                    max: 30,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Sick",
                    value: profile.leaveBalance.sick,
                    max: 30,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Maternity",
                    value: profile.leaveBalance.maternity,
                    max: 90,
                    color: "bg-pink-500",
                  },
                ].map((lb) => (
                  <div key={lb.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span>{lb.label}</span>
                      <span className="font-medium">{lb.value} days</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className={`h-full rounded-full ${lb.color}`}
                        style={{
                          width: `${Math.min((lb.value / lb.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {profile.performanceRating !== undefined && (
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Performance Rating
              </p>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${profile.performanceRating >= 80 ? "border-green-400 text-green-600" : profile.performanceRating >= 60 ? "border-amber-400 text-amber-600" : "border-red-400 text-red-600"}`}
              >
                {profile.performanceRating}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {profile.performanceRating >= 80
                  ? "Excellent"
                  : profile.performanceRating >= 60
                    ? "Satisfactory"
                    : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Photo Management */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera size={14} /> Photo Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoPanel
            staffId={profile.staffId}
            currentPhoto={photo}
            onSave={() => {
              setPhotoKey((k) => k + 1);
              onUpdate(profile);
            }}
          />
        </CardContent>
      </Card>

      {/* Probation info */}
      {profile.employmentStatus === "probation" && (
        <Card className="border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700">
              Probation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">End Date: </span>
              <span className="font-medium">
                {profile.probationEndDate ?? "Not set"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Review Schedule: </span>
              <span className="capitalize font-medium">
                {profile.probationReviewSchedule ?? "—"}
              </span>
            </p>
            {profile.probationNotes && (
              <p>
                <span className="text-muted-foreground">Notes: </span>
                {profile.probationNotes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={14} /> Audit Trail (Last 10 Changes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrailPanel staffId={profile.staffId} />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab =
  | "directory"
  | "onboarding"
  | "probation"
  | "promotions"
  | "retirement";
type SortKey =
  | "name-asc"
  | "name-desc"
  | "appointment-new"
  | "appointment-old"
  | "grade";

export function StaffManagement() {
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [tab, setTab] = useState<Tab>("directory");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");
  const [viewing, setViewing] = useState<StaffProfile | null>(null);
  const [editing, setEditing] = useState<StaffProfile | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<StaffProfile | null>(null);
  const [form, setForm] = useState<Partial<StaffProfile>>({});
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const data = loadProfiles();
    setProfiles(data.length ? data : SEED_PROFILES);
  }, []);

  const persist = (updated: StaffProfile[]) => {
    setProfiles(updated);
    saveProfiles(updated);
  };

  // Derived filter options from real data
  const uniqueFaculties = [
    ...new Set(profiles.map((p) => p.faculty).filter(Boolean)),
  ];
  const uniqueGrades = [
    ...new Set(profiles.map((p) => p.gradeLevel).filter(Boolean)),
  ].sort();

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("all");
    setStatusFilter("all");
    setGenderFilter("all");
    setFacultyFilter("all");
    setGradeFilter("all");
    setSortKey("name-asc");
  };

  const hasFilters =
    search ||
    deptFilter !== "all" ||
    statusFilter !== "all" ||
    genderFilter !== "all" ||
    facultyFilter !== "all" ||
    gradeFilter !== "all";

  const filtered = profiles
    .filter((p) => {
      const ms =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.staffId.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search);
      return (
        ms &&
        (deptFilter === "all" || p.department === deptFilter) &&
        (statusFilter === "all" || p.employmentStatus === statusFilter) &&
        (genderFilter === "all" || p.gender === genderFilter) &&
        (facultyFilter === "all" || p.faculty === facultyFilter) &&
        (gradeFilter === "all" || p.gradeLevel === gradeFilter)
      );
    })
    .sort((a, b) => {
      switch (sortKey) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "appointment-new":
          return b.dateOfAppointment.localeCompare(a.dateOfAppointment);
        case "appointment-old":
          return a.dateOfAppointment.localeCompare(b.dateOfAppointment);
        case "grade":
          return a.gradeLevel.localeCompare(b.gradeLevel);
        default:
          return 0;
      }
    });

  const openEdit = (p: StaffProfile) => {
    setEditing(p);
    setForm({ ...p });
    setAddDialog(true);
  };

  const saveForm = () => {
    const entry = { ...form } as StaffProfile;
    if (!entry.staffId) entry.staffId = `FUEK/STAFF/${Date.now()}`;
    if (!entry.qualifications) entry.qualifications = [];
    if (!entry.employmentHistory) entry.employmentHistory = [];
    if (!entry.promotionHistory) entry.promotionHistory = [];
    if (!entry.exitChecklist)
      entry.exitChecklist = {
        laptop: false,
        idCard: false,
        keys: false,
        dues: false,
      };

    if (editing) {
      const old = profiles.find((p) => p.staffId === editing.staffId);
      if (old) {
        appendAuditEntry({
          id: genId(),
          entityType: "staff",
          entityId: entry.staffId,
          entityName: entry.name,
          action: "edit",
          user: "Admin",
          timestamp: new Date().toISOString(),
          details: {
            before: old,
            after: entry,
            changedFields: getChangedFields(old, entry),
          },
        });
      }
      persist(profiles.map((p) => (p.staffId === editing.staffId ? entry : p)));
    } else {
      appendAuditEntry({
        id: genId(),
        entityType: "staff",
        entityId: entry.staffId,
        entityName: entry.name,
        action: "add",
        user: "Admin",
        timestamp: new Date().toISOString(),
        details: { after: entry },
      });
      persist([...profiles, entry]);
    }

    setAddDialog(false);
    setEditing(null);
    setForm({});
  };

  const confirmDelete = (p: StaffProfile) => {
    appendAuditEntry({
      id: genId(),
      entityType: "staff",
      entityId: p.staffId,
      entityName: p.name,
      action: "delete",
      user: "Admin",
      timestamp: new Date().toISOString(),
      details: { before: p, after: null },
    });
    persist(profiles.filter((x) => x.staffId !== p.staffId));
    setDeleteDialog(null);
  };

  const exportCSV = () => {
    const headers =
      "Staff ID,Name,Designation,Department,Grade Level,Status,Employment Type,Appointment Date,Email,Phone";
    const rows = filtered
      .map(
        (p) =>
          `"${p.staffId}","${p.name}","${p.designation}","${p.department}","${p.gradeLevel}","${p.employmentStatus}","${p.employmentType ?? ""}","${p.dateOfAppointment}","${p.email}","${p.phone}"`,
      )
      .join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "staff-directory.csv";
    a.click();
  };

  const printDirectory = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = filtered
      .map(
        (p) =>
          `<tr><td>${p.staffId}</td><td>${p.name}</td><td>${p.designation}</td><td>${p.department}</td><td>${p.gradeLevel}</td><td>${p.employmentStatus}</td><td>${p.dateOfAppointment}</td></tr>`,
      )
      .join("");
    win.document.write(
      `<html><head><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#1e3a5f;color:white}h2{color:#1e3a5f}</style></head><body><h2>Staff Directory — FUEK</h2><p>Printed: ${new Date().toLocaleString()} | Total: ${filtered.length} staff</p><table><thead><tr><th>Staff ID</th><th>Name</th><th>Designation</th><th>Department</th><th>Grade</th><th>Status</th><th>Appointment Date</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
    );
    win.print();
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    probation: "bg-amber-100 text-amber-700",
    retired: "bg-muted text-muted-foreground",
    exited: "bg-red-100 text-red-700",
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "directory", label: "Staff Directory", icon: <Users size={16} /> },
    { key: "onboarding", label: "Onboarding", icon: <User size={16} /> },
    { key: "probation", label: "Probation", icon: <Shield size={16} /> },
    { key: "promotions", label: "Promotions", icon: <TrendingUp size={16} /> },
    { key: "retirement", label: "Retirement/Exit", icon: <LogOut size={16} /> },
  ];

  if (viewing)
    return (
      <StaffProfileDetail
        profile={viewing}
        onBack={() => setViewing(null)}
        onEdit={() => {
          openEdit(viewing);
          setViewing(null);
        }}
        onUpdate={(p) => {
          persist(profiles.map((x) => (x.staffId === p.staffId ? p : x)));
          forceUpdate((n) => n + 1);
        }}
      />
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground text-sm">
          Comprehensive staff records, onboarding, probation & exit management
        </p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/60"}`}
          >
            {t.icon} {t.label}
            {t.key === "probation" &&
              profiles.filter((p) => p.employmentStatus === "probation")
                .length > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {
                    profiles.filter((p) => p.employmentStatus === "probation")
                      .length
                  }
                </span>
              )}
          </button>
        ))}
      </div>

      {tab === "directory" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Staff",
                value: profiles.length,
                color: "text-primary",
              },
              {
                label: "Active",
                value: profiles.filter((p) => p.employmentStatus === "active")
                  .length,
                color: "text-green-600",
              },
              {
                label: "On Probation",
                value: profiles.filter(
                  (p) => p.employmentStatus === "probation",
                ).length,
                color: "text-amber-600",
              },
              {
                label: "Retired/Exited",
                value: profiles.filter((p) =>
                  ["retired", "exited"].includes(p.employmentStatus),
                ).length,
                color: "text-muted-foreground",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-muted-foreground"
                />
                <Input
                  className="pl-8 w-56 h-9"
                  placeholder="Name, ID, email, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-ocid="staff-search"
                />
              </div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPT_LIST.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {["active", "probation", "retired", "exited"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="All Faculties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {uniqueFaculties.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 text-muted-foreground"
                >
                  <X size={13} className="mr-1" /> Clear Filters
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter size={12} /> Sort:
              </div>
              <Select
                value={sortKey}
                onValueChange={(v) => setSortKey(v as SortKey)}
              >
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A–Z</SelectItem>
                  <SelectItem value="name-desc">Name Z–A</SelectItem>
                  <SelectItem value="appointment-new">
                    Appointment (Newest)
                  </SelectItem>
                  <SelectItem value="appointment-old">
                    Appointment (Oldest)
                  </SelectItem>
                  <SelectItem value="grade">Grade Level</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {filtered.length} staff found
              </span>
              <div className="flex gap-2 ml-2">
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download size={13} className="mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={printDirectory}>
                  <Printer size={13} className="mr-1" /> Print
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      qualifications: [],
                      employmentHistory: [],
                      promotionHistory: [],
                      employmentStatus: "active",
                      employmentType: "permanent",
                      exitChecklist: {
                        laptop: false,
                        idCard: false,
                        keys: false,
                        dues: false,
                      },
                      leaveBalance: { annual: 20, sick: 10, maternity: 0 },
                    });
                    setAddDialog(true);
                  }}
                  data-ocid="add-staff-btn"
                >
                  <Plus size={13} className="mr-1" /> Add Staff
                </Button>
              </div>
            </div>
          </div>

          {/* Staff Grid (desktop) + Table (mobile) */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p>No staff match your filters</p>
              </div>
            )}
            {filtered.map((p) => (
              <Card
                key={p.staffId}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                data-ocid={`staff-card-${p.staffId}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <StaffAvatar staffId={p.staffId} name={p.name} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.designation}
                      </p>
                      <span
                        className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium capitalize ${statusColor[p.employmentStatus]}`}
                      >
                        {p.employmentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p className="truncate">
                      <span className="font-medium">{p.department}</span> ·{" "}
                      {p.faculty}
                    </p>
                    <p className="font-mono text-primary">{p.staffId}</p>
                    <p>
                      {p.gradeLevel} ·{" "}
                      <span className="capitalize">{p.employmentType}</span>
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => setViewing(p)}
                      data-ocid={`view-${p.staffId}`}
                    >
                      <Eye size={11} className="mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => openEdit(p)}
                      data-ocid={`edit-${p.staffId}`}
                    >
                      <Edit size={11} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteDialog(p)}
                      data-ocid={`delete-${p.staffId}`}
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile table */}
          <Card className="sm:hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 border-b">
                  <tr>
                    {["Staff", "Dept", "Grade", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
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
                        colSpan={5}
                        className="px-3 py-8 text-center text-muted-foreground"
                      >
                        No staff match your filters
                      </td>
                    </tr>
                  )}
                  {filtered.map((p) => (
                    <tr
                      key={p.staffId}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StaffAvatar
                            staffId={p.staffId}
                            name={p.name}
                            size={28}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {p.designation}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {p.department}
                      </td>
                      <td className="px-3 py-2 text-xs">{p.gradeLevel}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs capitalize ${statusColor[p.employmentStatus]}`}
                        >
                          {p.employmentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewing(p)}
                          >
                            <Eye size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(p)}
                          >
                            <Edit size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteDialog(p)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "onboarding" && (
        <OnboardingTab
          profiles={profiles}
          onAdd={(p) => {
            appendAuditEntry({
              id: genId(),
              entityType: "staff",
              entityId: p.staffId,
              entityName: p.name,
              action: "add",
              user: "Admin",
              timestamp: new Date().toISOString(),
              details: { after: p },
            });
            persist([...profiles, p]);
          }}
        />
      )}

      {tab === "probation" && (
        <ProbationTab
          profiles={profiles.filter((p) => p.employmentStatus === "probation")}
          onUpdate={(p) =>
            persist(profiles.map((x) => (x.staffId === p.staffId ? p : x)))
          }
          onConfirm={(id) =>
            persist(
              profiles.map((p) =>
                p.staffId === id
                  ? {
                      ...p,
                      employmentStatus: "active",
                      confirmationLetterGenerated: true,
                    }
                  : p,
              ),
            )
          }
        />
      )}

      {tab === "promotions" && (
        <PromotionTab
          profiles={profiles}
          onUpdate={(p) =>
            persist(profiles.map((x) => (x.staffId === p.staffId ? p : x)))
          }
        />
      )}

      {tab === "retirement" && (
        <RetirementTab
          profiles={profiles}
          onUpdate={(p) =>
            persist(profiles.map((x) => (x.staffId === p.staffId ? p : x)))
          }
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Staff Profile" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>
          <StaffForm form={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={saveForm}
              data-ocid="save-staff-btn"
            >
              Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Staff Record</DialogTitle>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">
              Are you sure you want to permanently delete the staff record for:
            </p>
            <div className="bg-muted/40 rounded-lg p-3 space-y-1">
              <p className="font-semibold">{deleteDialog?.name}</p>
              <p className="text-xs text-muted-foreground">
                {deleteDialog?.staffId} · {deleteDialog?.designation}
              </p>
            </div>
            <p className="text-destructive text-xs">
              This action will be logged in the audit trail and cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && confirmDelete(deleteDialog)}
              data-ocid="confirm-delete-btn"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Staff Form ───────────────────────────────────────────────────────────────

function StaffForm({
  form,
  onChange,
}: {
  form: Partial<StaffProfile>;
  onChange: (f: Partial<StaffProfile>) => void;
}) {
  const set = (field: keyof StaffProfile, value: unknown) =>
    onChange({ ...form, [field]: value });

  return (
    <div className="space-y-5">
      <Section title="Personal Information">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Staff ID">
            <Input
              value={form.staffId ?? ""}
              onChange={(e) => set("staffId", e.target.value)}
              placeholder="Auto-generated if blank"
            />
          </Field>
          <Field label="Full Name">
            <Input
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Date of Birth">
            <Input
              type="date"
              value={form.dob ?? ""}
              onChange={(e) => set("dob", e.target.value)}
            />
          </Field>
          <Field label="Gender">
            <Select
              value={form.gender ?? ""}
              onValueChange={(v) => set("gender", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nationality">
            <Input
              value={form.nationality ?? ""}
              onChange={(e) => set("nationality", e.target.value)}
            />
          </Field>
          <Field label="State of Origin">
            <Input
              value={form.state ?? ""}
              onChange={(e) => set("state", e.target.value)}
            />
          </Field>
          <Field label="LGA">
            <Input
              value={form.lga ?? ""}
              onChange={(e) => set("lga", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email" className="col-span-2">
            <Input
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Address" className="col-span-2">
            <Textarea
              rows={2}
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Employment Information">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Designation">
            <Input
              value={form.designation ?? ""}
              onChange={(e) => set("designation", e.target.value)}
            />
          </Field>
          <Field label="Grade Level">
            <Input
              value={form.gradeLevel ?? ""}
              onChange={(e) => set("gradeLevel", e.target.value)}
              placeholder="e.g. CONUASS 5"
            />
          </Field>
          <Field label="Department">
            <Select
              value={form.department ?? ""}
              onValueChange={(v) => set("department", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dept" />
              </SelectTrigger>
              <SelectContent>
                {DEPT_LIST.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Faculty">
            <Input
              value={form.faculty ?? ""}
              onChange={(e) => set("faculty", e.target.value)}
            />
          </Field>
          <Field label="Date of Appointment">
            <Input
              type="date"
              value={form.dateOfAppointment ?? ""}
              onChange={(e) => set("dateOfAppointment", e.target.value)}
            />
          </Field>
          <Field label="Employment Type">
            <Select
              value={form.employmentType ?? "permanent"}
              onValueChange={(v) => set("employmentType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="visiting">Visiting</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Salary Grade">
            <Input
              value={form.salaryGrade ?? ""}
              onChange={(e) => set("salaryGrade", e.target.value)}
              placeholder="e.g. GL 13"
            />
          </Field>
          <Field label="Employment Status">
            <Select
              value={form.employmentStatus ?? "active"}
              onValueChange={(v) => set("employmentStatus", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="exited">Exited</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {form.employmentStatus === "probation" && (
            <>
              <Field label="Probation End Date">
                <Input
                  type="date"
                  value={form.probationEndDate ?? ""}
                  onChange={(e) => set("probationEndDate", e.target.value)}
                />
              </Field>
              <Field label="Review Schedule">
                <Select
                  value={form.probationReviewSchedule ?? "biannual"}
                  onValueChange={(v) => set("probationReviewSchedule", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="biannual">Biannual</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}
        </div>
      </Section>

      <Section title="Next of Kin">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <Input
              value={form.nokName ?? ""}
              onChange={(e) => set("nokName", e.target.value)}
            />
          </Field>
          <Field label="Relationship">
            <Input
              value={form.nokRelationship ?? ""}
              onChange={(e) => set("nokRelationship", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.nokPhone ?? ""}
              onChange={(e) => set("nokPhone", e.target.value)}
            />
          </Field>
          <Field label="Address">
            <Input
              value={form.nokAddress ?? ""}
              onChange={(e) => set("nokAddress", e.target.value)}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 border-b border-border pb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ─── Onboarding Tab ───────────────────────────────────────────────────────────

function OnboardingTab({
  profiles,
  onAdd,
}: { profiles: StaffProfile[]; onAdd: (p: StaffProfile) => void }) {
  const [form, setForm] = useState<Partial<StaffProfile>>({
    qualifications: [],
    employmentHistory: [],
    promotionHistory: [],
    employmentStatus: "probation",
    employmentType: "permanent",
    exitChecklist: { laptop: false, idCard: false, keys: false, dues: false },
    leaveBalance: { annual: 20, sick: 10, maternity: 0 },
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry = { ...form } as StaffProfile;
    if (!entry.staffId) entry.staffId = `FUEK/STAFF/${Date.now()}`;
    onAdd(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm({
      qualifications: [],
      employmentHistory: [],
      promotionHistory: [],
      employmentStatus: "probation",
      employmentType: "permanent",
      exitChecklist: { laptop: false, idCard: false, keys: false, dues: false },
      leaveBalance: { annual: 20, sick: 10, maternity: 0 },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            New Staff Onboarding
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete all sections to register a new staff member
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Award size={16} /> Staff onboarded successfully!
          </div>
        )}
      </div>
      <Card>
        <CardContent className="p-5">
          <StaffForm form={form} onChange={setForm} />
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setForm({
              qualifications: [],
              employmentHistory: [],
              promotionHistory: [],
              employmentStatus: "probation",
              employmentType: "permanent",
            })
          }
        >
          Clear Form
        </Button>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSave}
        >
          <Plus size={14} className="mr-1" /> Register Staff
        </Button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Recently Added (
          {
            profiles.filter(
              (p) =>
                p.dateOfAppointment >=
                new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
            ).length
          }
          )
        </h3>
        <div className="grid md:grid-cols-2 gap-2">
          {profiles
            .filter((p) => p.employmentStatus === "probation")
            .slice(0, 4)
            .map((p) => (
              <Card key={p.staffId}>
                <CardContent className="p-3 flex items-center gap-3">
                  <StaffAvatar staffId={p.staffId} name={p.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.designation} · {p.department}
                    </p>
                    <p className="text-xs text-amber-600">
                      On Probation · ends {p.probationEndDate ?? "TBD"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Probation Tab ────────────────────────────────────────────────────────────

function ProbationTab({
  profiles,
  onUpdate,
  onConfirm,
}: {
  profiles: StaffProfile[];
  onUpdate: (p: StaffProfile) => void;
  onConfirm: (id: string) => void;
}) {
  const [confirmDialog, setConfirmDialog] = useState<StaffProfile | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Probation Tracking
        </h2>
        <p className="text-sm text-muted-foreground">
          {profiles.length} staff currently on probation
        </p>
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Shield size={32} className="mx-auto mb-2 opacity-30" />
            <p>No staff currently on probation</p>
          </CardContent>
        </Card>
      )}

      {profiles.map((p) => {
        const daysLeft = p.probationEndDate
          ? Math.ceil(
              (new Date(p.probationEndDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : null;
        return (
          <Card key={p.staffId} className="border-l-4 border-l-amber-400">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-start gap-3">
                  <StaffAvatar staffId={p.staffId} name={p.name} size={40} />
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.staffId} · {p.designation} · {p.department}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm">
                        End:{" "}
                        <span className="font-medium text-amber-700">
                          {p.probationEndDate ?? "Not set"}
                        </span>
                      </span>
                      {daysLeft !== null && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysLeft < 30 ? "bg-red-100 text-red-700" : daysLeft < 90 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                        >
                          {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const extDate = p.probationEndDate
                        ? new Date(
                            new Date(p.probationEndDate).getTime() +
                              90 * 24 * 60 * 60 * 1000,
                          )
                            .toISOString()
                            .split("T")[0]
                        : "";
                      onUpdate({
                        ...p,
                        probationEndDate: extDate,
                        probationNotes: `${p.probationNotes ?? ""}\n[${new Date().toLocaleDateString()}] Probation extended.`,
                      });
                    }}
                  >
                    Extend
                  </Button>
                  <Button
                    size="sm"
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() =>
                      onUpdate({
                        ...p,
                        employmentStatus: "exited",
                        exitReason: "termination",
                        exitDate: new Date().toISOString().split("T")[0],
                      })
                    }
                  >
                    Terminate
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setConfirmDialog(p)}
                  >
                    <Award size={13} className="mr-1" /> Confirm
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  HOD Performance Notes
                </Label>
                <Textarea
                  className="mt-1 text-sm"
                  rows={2}
                  defaultValue={p.probationNotes ?? ""}
                  placeholder="Add review notes…"
                  onBlur={(e) =>
                    onUpdate({ ...p, probationNotes: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog
        open={!!confirmDialog}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm Appointment — {confirmDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This will confirm the appointment and generate a confirmation
              letter.
            </p>
            <div className="bg-muted/40 rounded-lg p-3 space-y-1">
              <p>
                <span className="font-medium">Name:</span> {confirmDialog?.name}
              </p>
              <p>
                <span className="font-medium">Staff ID:</span>{" "}
                {confirmDialog?.staffId}
              </p>
              <p>
                <span className="font-medium">Designation:</span>{" "}
                {confirmDialog?.designation}
              </p>
              <p>
                <span className="font-medium">Department:</span>{" "}
                {confirmDialog?.department}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (confirmDialog) {
                  onConfirm(confirmDialog.staffId);
                  setConfirmDialog(null);
                }
              }}
            >
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Promotions Tab ───────────────────────────────────────────────────────────

function PromotionTab({
  profiles,
  onUpdate,
}: { profiles: StaffProfile[]; onUpdate: (p: StaffProfile) => void }) {
  const [dialog, setDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [promoForm, setPromoForm] = useState({
    date: "",
    fromPosition: "",
    toPosition: "",
    newSalaryGrade: "",
  });

  const openPromotion = (p: StaffProfile) => {
    setSelectedStaff(p);
    setPromoForm({
      date: new Date().toISOString().split("T")[0],
      fromPosition: p.designation,
      toPosition: "",
      newSalaryGrade: "",
    });
    setDialog(true);
  };

  const savePromotion = () => {
    if (!selectedStaff) return;
    const updated: StaffProfile = {
      ...selectedStaff,
      designation: promoForm.toPosition || selectedStaff.designation,
      salaryGrade: promoForm.newSalaryGrade || selectedStaff.salaryGrade,
      promotionHistory: [
        ...(selectedStaff.promotionHistory ?? []),
        { ...promoForm },
      ],
    };
    onUpdate(updated);
    setDialog(false);
  };

  const activeProfiles = profiles.filter(
    (p) => p.employmentStatus === "active",
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Promotion Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Record and track staff promotion history
        </p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 border-b">
              <tr>
                {[
                  "Staff Name",
                  "Current Position",
                  "Dept",
                  "Grade",
                  "Promotions",
                  "Last Promotion",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeProfiles.map((p) => {
                const lastPromo = p.promotionHistory?.at(-1);
                return (
                  <tr
                    key={p.staffId}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <StaffAvatar
                          staffId={p.staffId}
                          name={p.name}
                          size={28}
                        />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.designation}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {p.department}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {p.salaryGrade}
                    </td>
                    <td className="px-3 py-2">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {p.promotionHistory?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {lastPromo
                        ? `${lastPromo.date} (${lastPromo.toPosition})`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPromotion(p)}
                      >
                        <TrendingUp size={13} className="mr-1" /> Promote
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Recent Promotions
        </h3>
        <div className="space-y-2">
          {profiles
            .flatMap((p) =>
              (p.promotionHistory ?? []).map((ph) => ({
                ...ph,
                staffName: p.name,
                staffId: p.staffId,
                dept: p.department,
              })),
            )
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 6)
            .map((item, idx) => (
              <div
                key={`${item.staffId}-${idx}`}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg text-sm"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <TrendingUp size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {item.staffName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.fromPosition} →{" "}
                    <span className="text-green-600 font-medium">
                      {item.toPosition}
                    </span>{" "}
                    · {item.newSalaryGrade}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.date}
                </span>
              </div>
            ))}
          {profiles.every((p) => !p.promotionHistory?.length) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No promotion records yet
            </p>
          )}
        </div>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Promotion — {selectedStaff?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Promotion Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={promoForm.date}
                onChange={(e) =>
                  setPromoForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>From Position</Label>
              <Input
                className="mt-1"
                value={promoForm.fromPosition}
                onChange={(e) =>
                  setPromoForm((f) => ({ ...f, fromPosition: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>To Position (New Title)</Label>
              <Input
                className="mt-1"
                value={promoForm.toPosition}
                onChange={(e) =>
                  setPromoForm((f) => ({ ...f, toPosition: e.target.value }))
                }
                placeholder="e.g. Senior Lecturer"
              />
            </div>
            <div>
              <Label>New Salary Grade</Label>
              <Input
                className="mt-1"
                value={promoForm.newSalaryGrade}
                onChange={(e) =>
                  setPromoForm((f) => ({
                    ...f,
                    newSalaryGrade: e.target.value,
                  }))
                }
                placeholder="e.g. GL 13"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={savePromotion}
            >
              Save Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Retirement Tab ───────────────────────────────────────────────────────────

function RetirementTab({
  profiles,
  onUpdate,
}: { profiles: StaffProfile[]; onUpdate: (p: StaffProfile) => void }) {
  const [dialog, setDialog] = useState(false);
  const [selected, setSelected] = useState<StaffProfile | null>(null);
  const [form, setForm] = useState<Partial<StaffProfile>>({});

  const open = (p: StaffProfile) => {
    setSelected(p);
    setForm({ ...p });
    setDialog(true);
  };
  const saveRetirement = () => {
    if (!selected) return;
    onUpdate({ ...selected, ...form } as StaffProfile);
    setDialog(false);
  };

  const nearing = profiles.filter(
    (p) => p.employmentStatus === "active" && p.retirementDate,
  );
  const retired = profiles.filter((p) => p.employmentStatus === "retired");
  const exited = profiles.filter((p) => p.employmentStatus === "exited");

  const checklist = form.exitChecklist ?? {
    laptop: false,
    idCard: false,
    keys: false,
    dues: false,
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-3">
        {[
          {
            label: "Nearing Retirement",
            value: nearing.length,
            color: "text-amber-600",
          },
          {
            label: "Retired",
            value: retired.length,
            color: "text-muted-foreground",
          },
          { label: "Exited", value: exited.length, color: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">
          All Staff — Retirement & Exit Management
        </h3>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b">
                <tr>
                  {[
                    "Staff Name",
                    "Dept",
                    "Appointment",
                    "Retirement Date",
                    "Exit Reason",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr
                    key={p.staffId}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {p.department}
                    </td>
                    <td className="px-3 py-2 text-xs">{p.dateOfAppointment}</td>
                    <td className="px-3 py-2 text-xs">
                      {p.retirementDate ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs capitalize text-muted-foreground">
                      {p.exitReason ?? "—"}
                    </td>
                    <td className="px-3 py-2 capitalize text-xs">
                      {p.employmentStatus}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => open(p)}
                      >
                        <Edit size={13} className="mr-1" /> Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Retirement / Exit — {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Employment Status</Label>
                <Select
                  value={form.employmentStatus ?? "active"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      employmentStatus: v as StaffProfile["employmentStatus"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exit Reason</Label>
                <Select
                  value={form.exitReason ?? ""}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      exitReason: v as StaffProfile["exitReason"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="resignation">Resignation</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Retirement / Exit Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.exitDate ?? form.retirementDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      exitDate: e.target.value,
                      retirementDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Gratuity Amount (₦)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.gratuityAmount ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, gratuityAmount: +e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Clearance Status</Label>
              <Select
                value={form.clearanceStatus ?? "not-started"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    clearanceStatus: v as StaffProfile["clearanceStatus"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Exit Checklist</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "laptop", label: "Return Laptop" },
                  { key: "idCard", label: "Return ID Card" },
                  { key: "keys", label: "Return Keys/Access Cards" },
                  { key: "dues", label: "Clear All Dues" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key as keyof typeof checklist]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          exitChecklist: {
                            ...checklist,
                            [item.key]: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 accent-blue-600"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.exitInterviewDone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    exitInterviewDone: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-blue-600"
              />
              Exit Interview Completed
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={saveRetirement}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
