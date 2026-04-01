import {
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle,
  Globe,
  Lock,
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
  Upload,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

interface InstitutionProfile {
  name: string;
  motto: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  yearFounded: string;
  accreditationNumber: string;
  institutionType: string;
  logoUrl: string;
}

interface InstitutionStatus {
  confirmed: boolean;
  activationDate: string;
  confirmationNotes: string;
  status: "active" | "inactive" | "pending";
}

interface AcademicConfig {
  currentSession: string;
  currentSemester: string;
  semesterStart: string;
  semesterEnd: string;
  resultDeadline: string;
}

interface SystemToggles {
  courseRegistrationOpen: boolean;
  resultEntryEnabled: boolean;
  resultPublicationEnabled: boolean;
  hostelApplicationsOpen: boolean;
  libraryAccessEnabled: boolean;
  cbtExamsEnabled: boolean;
  studentPortalActive: boolean;
  staffPortalActive: boolean;
}

interface SecurityConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  require2FA: boolean;
  auditRetentionDays: number;
}

const STORAGE_KEY = "unidigital_institution_settings";

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function saveSettings(data: object) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function InstitutionSettings() {
  const saved = loadSettings();

  const [profile, setProfile] = useState<InstitutionProfile>(
    saved?.profile ?? {
      name: "Federal University of Technology",
      motto: "Knowledge for Service",
      address: "1 University Road",
      city: "Minna",
      state: "Niger State",
      phone: "+234 806 000 0000",
      email: "info@futech.edu.ng",
      website: "https://www.futech.edu.ng",
      yearFounded: "1983",
      accreditationNumber: "NUC/ACC/2023/001",
      institutionType: "university",
      logoUrl: "",
    },
  );

  const [institutionStatus, setInstitutionStatus] = useState<InstitutionStatus>(
    saved?.institutionStatus ?? {
      confirmed: false,
      activationDate: "",
      confirmationNotes: "",
      status: "pending",
    },
  );

  const [academicConfig, setAcademicConfig] = useState<AcademicConfig>(
    saved?.academicConfig ?? {
      currentSession: "2024/2025",
      currentSemester: "first",
      semesterStart: "2025-01-15",
      semesterEnd: "2025-05-30",
      resultDeadline: "2025-06-15",
    },
  );

  const [toggles, setToggles] = useState<SystemToggles>(
    saved?.toggles ?? {
      courseRegistrationOpen: true,
      resultEntryEnabled: true,
      resultPublicationEnabled: false,
      hostelApplicationsOpen: true,
      libraryAccessEnabled: true,
      cbtExamsEnabled: true,
      studentPortalActive: true,
      staffPortalActive: true,
    },
  );

  const [security, setSecurity] = useState<SecurityConfig>(
    saved?.security ?? {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      require2FA: false,
      auditRetentionDays: 90,
    },
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    saveSettings({
      profile,
      institutionStatus,
      academicConfig,
      toggles,
      security,
    });
  }, [profile, institutionStatus, academicConfig, toggles, security]);

  function handleSaveProfile() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Institution profile saved successfully.");
    }, 600);
  }

  function handleConfirmInstitution() {
    const now = new Date().toISOString().slice(0, 10);
    setInstitutionStatus((prev) => ({
      ...prev,
      confirmed: true,
      status: "active",
      activationDate: prev.activationDate || now,
    }));
    toast.success("Institution confirmed and activated.");
  }

  function handleDeactivate() {
    setInstitutionStatus((prev) => ({
      ...prev,
      confirmed: false,
      status: "inactive",
    }));
    toast.info("Institution deactivated.");
  }

  function handleSaveAcademic() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Academic configuration saved.");
    }, 500);
  }

  function handleSaveSecurity() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Security settings saved.");
    }, 500);
  }

  const statusBadge = {
    active: (
      <Badge className="bg-green-100 text-green-700">
        <CheckCircle size={12} className="mr-1" />
        Active & Confirmed
      </Badge>
    ),
    inactive: (
      <Badge className="bg-red-100 text-red-700">
        <XCircle size={12} className="mr-1" />
        Inactive
      </Badge>
    ),
    pending: (
      <Badge className="bg-yellow-100 text-yellow-700">
        Pending Confirmation
      </Badge>
    ),
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Institution Settings
          </h1>
          <p className="text-sm text-gray-500">
            Configure institution profile, system behaviour, and access controls
          </p>
        </div>
        <div className="ml-auto">{statusBadge[institutionStatus.status]}</div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="profile">
            <Building2 size={14} className="mr-1" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="confirmation">
            <BadgeCheck size={14} className="mr-1" />
            Confirmation
          </TabsTrigger>
          <TabsTrigger value="academic">
            <Calendar size={14} className="mr-1" />
            Academic Config
          </TabsTrigger>
          <TabsTrigger value="toggles">
            <ToggleRight size={14} className="mr-1" />
            System Toggles
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield size={14} className="mr-1" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={18} />
                Institution Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <Label>Institution Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="e.g. Federal University of Technology"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Motto</Label>
                  <Input
                    value={profile.motto}
                    onChange={(e) =>
                      setProfile({ ...profile, motto: e.target.value })
                    }
                    placeholder="e.g. Knowledge for Service"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Institution Type</Label>
                  <Select
                    value={profile.institutionType}
                    onValueChange={(v) =>
                      setProfile({ ...profile, institutionType: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="polytechnic">Polytechnic</SelectItem>
                      <SelectItem value="college_of_education">
                        College of Education
                      </SelectItem>
                      <SelectItem value="secondary_school">
                        Secondary School
                      </SelectItem>
                      <SelectItem value="monotechnic">Monotechnic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Year Founded</Label>
                  <Input
                    value={profile.yearFounded}
                    onChange={(e) =>
                      setProfile({ ...profile, yearFounded: e.target.value })
                    }
                    placeholder="e.g. 1983"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1">
                  <Label>City</Label>
                  <Input
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>State</Label>
                  <Input
                    value={profile.state}
                    onChange={(e) =>
                      setProfile({ ...profile, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Website</Label>
                  <Input
                    value={profile.website}
                    onChange={(e) =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Accreditation Number</Label>
                  <Input
                    value={profile.accreditationNumber}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        accreditationNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Upload size={14} className="mr-1" />
                  Upload Logo
                </Button>
                <span className="text-xs text-gray-400">
                  PNG or JPG, max 2MB. Logo displayed on transcripts and
                  certificates.
                </span>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIRMATION TAB */}
        <TabsContent value="confirmation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck size={18} />
                Institution Confirmation & Activation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Current Status</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {institutionStatus.confirmed
                      ? `Institution confirmed and active since ${institutionStatus.activationDate || "today"}.`
                      : "Institution has not been confirmed yet. Confirm to enable all portal features for staff and students."}
                  </p>
                </div>
                {statusBadge[institutionStatus.status]}
              </div>

              {institutionStatus.confirmed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Activation Date</Label>
                    <Input
                      value={institutionStatus.activationDate}
                      onChange={(e) =>
                        setInstitutionStatus({
                          ...institutionStatus,
                          activationDate: e.target.value,
                        })
                      }
                      type="date"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label>Confirmation Notes</Label>
                <Textarea
                  rows={3}
                  value={institutionStatus.confirmationNotes}
                  onChange={(e) =>
                    setInstitutionStatus({
                      ...institutionStatus,
                      confirmationNotes: e.target.value,
                    })
                  }
                  placeholder="Optional notes about this confirmation (e.g. NUC inspection completed, accreditation renewed)"
                />
              </div>

              <div className="flex gap-3">
                {!institutionStatus.confirmed ? (
                  <Button
                    onClick={handleConfirmInstitution}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Confirm & Activate Institution
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleDeactivate}>
                    <XCircle size={16} className="mr-2" />
                    Deactivate Institution
                  </Button>
                )}
              </div>

              <div className="mt-4 p-4 rounded-lg border border-blue-100 bg-blue-50">
                <p className="text-sm font-medium text-blue-800">
                  What institution confirmation enables:
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Student and staff portal access unlocked</li>
                  <li>
                    Course registration, result entry, and fee payment modules
                    active
                  </li>
                  <li>
                    Transcripts and certificates display the confirmed
                    institution name and accreditation number
                  </li>
                  <li>Graduation and clearance workflows enabled</li>
                  <li>
                    System visible on the UniDigital institution directory
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACADEMIC CONFIG TAB */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={18} />
                Academic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Current Academic Session</Label>
                  <Input
                    value={academicConfig.currentSession}
                    onChange={(e) =>
                      setAcademicConfig({
                        ...academicConfig,
                        currentSession: e.target.value,
                      })
                    }
                    placeholder="e.g. 2024/2025"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Current Semester</Label>
                  <Select
                    value={academicConfig.currentSemester}
                    onValueChange={(v) =>
                      setAcademicConfig({
                        ...academicConfig,
                        currentSemester: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Semester</SelectItem>
                      <SelectItem value="second">Second Semester</SelectItem>
                      <SelectItem value="third">
                        Third Semester (NCE/Polytechnic)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Semester Start Date</Label>
                  <Input
                    type="date"
                    value={academicConfig.semesterStart}
                    onChange={(e) =>
                      setAcademicConfig({
                        ...academicConfig,
                        semesterStart: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Semester End Date</Label>
                  <Input
                    type="date"
                    value={academicConfig.semesterEnd}
                    onChange={(e) =>
                      setAcademicConfig({
                        ...academicConfig,
                        semesterEnd: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Result Entry Deadline</Label>
                  <Input
                    type="date"
                    value={academicConfig.resultDeadline}
                    onChange={(e) =>
                      setAcademicConfig({
                        ...academicConfig,
                        resultDeadline: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-400">
                    Lecturers cannot submit new results after this date without
                    admin override.
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveAcademic} disabled={saving}>
                {saving ? "Saving..." : "Save Academic Configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM TOGGLES TAB */}
        <TabsContent value="toggles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft size={18} />
                System Toggles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: "courseRegistrationOpen",
                      label: "Course Registration",
                      desc: "Allow students to register for courses this semester",
                    },
                    {
                      key: "resultEntryEnabled",
                      label: "Result Entry",
                      desc: "Allow lecturers to enter and submit CA/exam scores",
                    },
                    {
                      key: "resultPublicationEnabled",
                      label: "Result Publication",
                      desc: "Students can view published results on the portal",
                    },
                    {
                      key: "hostelApplicationsOpen",
                      label: "Hostel Applications",
                      desc: "Students can apply for on-campus accommodation",
                    },
                    {
                      key: "libraryAccessEnabled",
                      label: "Library Access",
                      desc: "Library module is active for borrowing and returns",
                    },
                    {
                      key: "cbtExamsEnabled",
                      label: "CBT Exams",
                      desc: "Computer-based test module is active and accessible",
                    },
                    {
                      key: "studentPortalActive",
                      label: "Student Portal",
                      desc: "Entire student-facing portal is accessible",
                    },
                    {
                      key: "staffPortalActive",
                      label: "Staff Portal",
                      desc: "Lecturer and HOD portals are accessible",
                    },
                  ] as {
                    key: keyof SystemToggles;
                    label: string;
                    desc: string;
                  }[]
                ).map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {label}
                      </p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${toggles[key] ? "text-green-600" : "text-red-500"}`}
                      >
                        {toggles[key] ? "ON" : "OFF"}
                      </span>
                      <Switch
                        checked={toggles[key]}
                        onCheckedChange={(checked) => {
                          setToggles({ ...toggles, [key]: checked });
                          toast.success(
                            `${label} ${checked ? "enabled" : "disabled"}.`,
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={18} />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={480}
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-gray-400">
                    Users are logged out after this period of inactivity.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={security.maxLoginAttempts}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        maxLoginAttempts: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-gray-400">
                    Account is locked after this many failed login attempts.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Audit Log Retention (days)</Label>
                  <Input
                    type="number"
                    min={30}
                    max={3650}
                    value={security.auditRetentionDays}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        auditRetentionDays: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Two-Factor Authentication (2FA)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Switch
                      checked={security.require2FA}
                      onCheckedChange={(checked) =>
                        setSecurity({ ...security, require2FA: checked })
                      }
                    />
                    <span
                      className={`text-sm font-medium ${security.require2FA ? "text-green-600" : "text-gray-500"}`}
                    >
                      {security.require2FA
                        ? "Required for all users"
                        : "Optional"}
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveSecurity} disabled={saving}>
                {saving ? "Saving..." : "Save Security Settings"}
              </Button>

              <div className="mt-4 p-4 rounded-lg border border-amber-100 bg-amber-50">
                <div className="flex items-start gap-2">
                  <Shield
                    size={16}
                    className="text-amber-600 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Security Recommendation
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Enable 2FA and set session timeout to 30 minutes or less
                      for university deployments handling sensitive student
                      data.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
