import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Save,
  Shield,
  User,
  UserCog,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../../backend";
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
  hasLocalPassword,
  passwordStrength,
  saveLocalPassword,
  verifyLocalPassword,
} from "../../utils/authUtils";

interface UserProfileSettingsProps {
  currentName: string;
  currentEmail: string;
  currentRole: string;
  onProfileUpdated?: (profile: {
    name: string;
    email: string;
    role: string;
  }) => void;
}

const ROLES = [
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

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What is your oldest sibling's middle name?",
  "What street did you grow up on?",
];

const SETTINGS_KEY = "unidigital_profile_settings";

interface StoredSettings {
  photo?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  phone?: string;
  hasCompletedSetup?: boolean;
}

function loadSettings(): StoredSettings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSettings(data: StoredSettings): void {
  try {
    const existing = loadSettings();
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...existing, ...data }),
    );
  } catch (_) {
    // ignore
  }
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  "data-ocid": ocid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
        data-ocid={ocid}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        data-ocid={`${ocid}-eye`}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

type Tab = "profile" | "security" | "password";

export function UserProfileSettings({
  currentName,
  currentEmail,
  currentRole,
  onProfileUpdated,
}: UserProfileSettingsProps) {
  const { actor } = useActor(createActor);
  const storedSettings = loadSettings();

  const [tab, setTab] = useState<Tab>("profile");

  // Profile fields
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [phone, setPhone] = useState(storedSettings.phone ?? "");
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [photo, setPhoto] = useState<string>(storedSettings.photo ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Security fields
  const [securityQuestion, setSecurityQuestion] = useState(
    storedSettings.securityQuestion ?? "",
  );
  const [securityAnswer, setSecurityAnswer] = useState(
    storedSettings.securityAnswer ?? "",
  );
  const [secSaved, setSecSaved] = useState(false);

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  // Sync props on external changes
  useEffect(() => {
    setName(currentName);
    setEmail(currentEmail);
    setSelectedRole(currentRole);
  }, [currentName, currentEmail, currentRole]);

  const hasChanges =
    name.trim() !== currentName ||
    email.trim() !== currentEmail ||
    selectedRole !== currentRole ||
    phone !== (storedSettings.phone ?? "");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhoto(result);
      saveSettings({ photo: result });
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (actor) {
        await (
          actor as unknown as {
            saveCallerUserProfile: (p: {
              name: string;
              email: string;
              role: string;
            }) => Promise<void>;
          }
        ).saveCallerUserProfile({
          name: name.trim(),
          email: email.trim(),
          role: selectedRole,
        });
      }
      saveSettings({ phone: phone.trim(), hasCompletedSetup: true });
      onProfileUpdated?.({
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (e) {
      setError("Failed to save profile. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function handleSecuritySave() {
    if (!securityQuestion || !securityAnswer.trim()) return;
    saveSettings({
      securityQuestion,
      securityAnswer: securityAnswer.trim(),
      hasCompletedSetup: true,
    });
    setSecSaved(true);
    setTimeout(() => setSecSaved(false), 3500);
  }

  function handlePasswordChange() {
    setPwError("");
    const hasPw = hasLocalPassword();
    if (hasPw && !currentPw) {
      setPwError("Enter your current password/PIN to verify.");
      return;
    }
    if (hasPw && !verifyLocalPassword(currentPw)) {
      setPwError("Current password is incorrect. Please try again.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    saveLocalPassword(newPw);
    setPwSaved(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setPwSaved(false), 3500);
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={14} /> },
    { key: "security", label: "Security", icon: <Shield size={14} /> },
    { key: "password", label: "Password / PIN", icon: <KeyRound size={14} /> },
  ];

  const initials = (name || currentName).charAt(0).toUpperCase();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-6 h-6 text-primary" />
          My Profile & Login Details
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your profile, security settings, and credentials
        </p>
      </div>

      {/* Avatar + current profile summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload profile photo"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
              data-ocid="profile.photo-upload-btn"
            >
              <Camera size={12} className="text-muted-foreground" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              data-ocid="profile.photo-file-input"
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {name || currentName}
            </p>
            <p className="text-sm text-muted-foreground">
              {email || currentEmail}
            </p>
            <p className="text-xs text-primary font-medium capitalize mt-0.5">
              {selectedRole || currentRole}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tab nav */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            data-ocid={`profile.tab.${t.key}`}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Profile ── */}
      {tab === "profile" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="profile-name">Full Name *</Label>
                  <Input
                    id="profile-name"
                    placeholder="e.g. Dr. John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                    data-ocid="profile-name-input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-email">Email Address *</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSaved(false);
                    }}
                    data-ocid="profile-email-input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-phone">Phone Number</Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setSaved(false);
                    }}
                    data-ocid="profile-phone-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                System Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Your role determines which modules and dashboards you can
                access.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.key);
                      setSaved(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      selectedRole === r.key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                    data-ocid={`role-select-${r.key}`}
                  >
                    <span className="font-medium text-sm text-foreground">
                      {r.label}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Profile updated successfully! Your changes are saved.
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1 sm:flex-none sm:w-auto"
              data-ocid="save-profile-btn"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
            {!hasChanges && (
              <p className="text-sm text-muted-foreground self-center">
                No changes to save
              </p>
            )}
          </div>
        </>
      )}

      {/* ── Tab: Security ── */}
      {tab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a security question and answer. This is used to verify your
              identity if you ever need account recovery.
            </p>
            <div className="space-y-1">
              <Label htmlFor="sec-question">Security Question</Label>
              <select
                id="sec-question"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="security-question-select"
              >
                <option value="">— Select a question —</option>
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sec-answer">Your Answer</Label>
              <PasswordInput
                id="sec-answer"
                value={securityAnswer}
                onChange={setSecurityAnswer}
                placeholder="Enter your answer (hidden for security)"
                data-ocid="security-answer-input"
              />
            </div>

            {secSaved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Security question saved successfully.
              </div>
            )}

            <Button
              onClick={handleSecuritySave}
              disabled={!securityQuestion || !securityAnswer.trim()}
              data-ocid="save-security-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Security Question
            </Button>

            <Card className="bg-muted/40 border-dashed mt-4">
              <CardContent className="p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Important</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Your answer is stored locally and never sent to any server.
                  </li>
                  <li>Choose an answer you will always remember.</li>
                  <li>
                    Internet Identity handles your primary authentication — this
                    is a secondary recovery hint only.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Password / PIN ── */}
      {tab === "password" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              {hasLocalPassword()
                ? "Change Password / PIN"
                : "Set Password / PIN"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasLocalPassword() && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  No portal password set yet. Create one below — this acts as
                  your secondary credential and is required to use Forgot
                  Password recovery.
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Set or update your portal access password. This is a local access
              credential and does not replace your Internet Identity
              authentication.
            </p>
            {hasLocalPassword() && (
              <div className="space-y-1">
                <Label htmlFor="current-pw">Current Password / PIN</Label>
                <PasswordInput
                  id="current-pw"
                  value={currentPw}
                  onChange={setCurrentPw}
                  placeholder="Enter current password"
                  data-ocid="current-password-input"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="new-pw">New Password</Label>
              <PasswordInput
                id="new-pw"
                value={newPw}
                onChange={setNewPw}
                placeholder="At least 6 characters"
                data-ocid="new-password-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <PasswordInput
                id="confirm-pw"
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="Re-enter new password"
                data-ocid="confirm-password-input"
              />
            </div>

            {/* Strength indicator */}
            {newPw && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Password strength
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => {
                    const strength = passwordStrength(newPw);
                    return (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= strength
                            ? strength <= 1
                              ? "bg-destructive"
                              : strength === 2
                                ? "bg-amber-500"
                                : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {pwError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {pwError}
              </div>
            )}
            {pwSaved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Password updated successfully!
              </div>
            )}

            <Button
              onClick={handlePasswordChange}
              disabled={
                hasLocalPassword()
                  ? !currentPw || !newPw || !confirmPw
                  : !newPw || !confirmPw
              }
              data-ocid="save-password-btn"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {hasLocalPassword() ? "Update Password" : "Set Password"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
