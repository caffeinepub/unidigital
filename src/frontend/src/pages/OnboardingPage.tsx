import { Building2, Clock, Globe, Monitor } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { StudentProgrammeType } from "../utils/sampleData";

// localStorage key for student profile (matches existing usage across the app)
const STUDENT_PROFILE_KEY = "unidigital_student_profile";

interface OnboardingPageProps {
  onComplete: (profile: {
    name: string;
    email: string;
    role: string;
    studyMode?: StudentProgrammeType;
  }) => void;
}

const roles = [
  {
    key: "admin",
    label: "Administrator",
    desc: "Full system control & management",
  },
  { key: "lecturer", label: "Lecturer", desc: "Manage courses, results & CBT" },
  {
    key: "student",
    label: "Student",
    desc: "Access courses, results & payments",
  },
  {
    key: "bursary",
    label: "Bursary Officer",
    desc: "Handle fees & financial records",
  },
  { key: "hr", label: "HR Officer", desc: "Manage staff records & leave" },
  {
    key: "hod",
    label: "Head of Department",
    desc: "Approve results & manage dept",
  },
  {
    key: "alumni",
    label: "Alumni",
    desc: "Access alumni network, job board & events",
  },
  {
    key: "parent",
    label: "Parent / Guardian",
    desc: "Monitor your ward's academic progress",
  },
];

const programmeOptions: {
  key: StudentProgrammeType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
}[] = [
  {
    key: "full-time",
    label: "Full-Time Studies",
    desc: "Regular on-campus programme (4 years) — 15–24 credit units per semester",
    icon: <Monitor size={20} />,
    badge: "Default",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    key: "distance-learning",
    label: "Distance Learning",
    desc: "Flexible online/blended programme — credit rules: 10–15 units/semester",
    icon: <Globe size={20} />,
    badge: "Online/Blended",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
  {
    key: "part-time",
    label: "Part-Time Studies",
    desc: "Evening/weekend programme — credit rules: 12–16 units/semester",
    icon: <Clock size={20} />,
    badge: "Evening/Weekend",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

// Step type for the wizard
type Step = "profile" | "programme";

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState<Step>("profile");
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studyMode, setStudyMode] = useState<StudentProgrammeType>("full-time");

  const canProceedFromProfile = !!(name && email && selectedRole);

  const handleProfileNext = () => {
    if (!canProceedFromProfile) return;
    if (selectedRole === "student") {
      setStep("programme");
    } else {
      // Non-student roles skip programme selection
      onComplete({ name, email, role: selectedRole });
    }
  };

  const handleProgrammeSubmit = () => {
    // Persist studyMode in localStorage so the profile and registration flows can use it
    try {
      const existing = localStorage.getItem(STUDENT_PROFILE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        STUDENT_PROFILE_KEY,
        JSON.stringify({ ...parsed, studyMode }),
      );
    } catch (_) {
      // silently ignore storage errors
    }
    onComplete({ name, email, role: selectedRole, studyMode });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to UniDigital
          </h1>
          <p className="text-slate-300 mt-1 text-sm">
            {step === "profile"
              ? "Set up your profile to get started"
              : "Select your programme type"}
          </p>
        </div>

        {/* Step indicator (student role only — shown during programme step) */}
        {step === "programme" && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                ✓
              </span>
              <span className="text-xs text-slate-400">Profile</span>
            </div>
            <div className="w-8 h-px bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Programme
              </span>
            </div>
          </div>
        )}

        {/* ── Step 1: Profile ── */}
        {step === "profile" && (
          <Card className="bg-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Dr. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="onboarding.name"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="onboarding.email"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Select Your Role</Label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setSelectedRole(r.key)}
                      data-ocid={`onboarding.role.${r.key}`}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                        selectedRole === r.key
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-medium text-sm">{r.label}</span>
                      <span className="text-xs text-slate-500 block">
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!canProceedFromProfile}
                onClick={handleProfileNext}
                data-ocid="onboarding.next_button"
              >
                {selectedRole === "student"
                  ? "Next: Select Programme →"
                  : "Enter Portal"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Programme Type (student only) ── */}
        {step === "programme" && (
          <Card className="bg-white shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Select Your Programme</CardTitle>
                <button
                  type="button"
                  onClick={() => setStep("profile")}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  ← Back
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                This determines your credit load rules for course registration.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {programmeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStudyMode(opt.key)}
                    data-ocid={`onboarding.programme.${opt.key}`}
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all ${
                      studyMode === opt.key
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 ${studyMode === opt.key ? "text-blue-600" : "text-slate-500"}`}
                      >
                        {opt.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-800">
                            {opt.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt.badgeColor}`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
                          {opt.desc}
                        </span>
                      </div>
                      {studyMode === opt.key && (
                        <span className="text-blue-500 font-bold text-lg shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
                <p className="font-semibold mb-0.5">Credit Load Rules</p>
                {studyMode === "full-time" && (
                  <p>
                    Minimum 15–18 credits / Maximum 24 credits per semester
                    (varies by department)
                  </p>
                )}
                {studyMode === "distance-learning" && (
                  <p>Minimum 10 credits / Maximum 15 credits per semester</p>
                )}
                {studyMode === "part-time" && (
                  <p>Minimum 12 credits / Maximum 16 credits per semester</p>
                )}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleProgrammeSubmit}
                data-ocid="onboarding.enter_portal_button"
              >
                Enter Portal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
