import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Save,
  User,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  {
    key: "lecturer",
    label: "Lecturer",
    desc: "Manage courses, results & CBT",
  },
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

export function UserProfileSettings({
  currentName,
  currentEmail,
  currentRole,
  onProfileUpdated,
}: UserProfileSettingsProps) {
  const { actor } = useActor(createActor);

  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Sync props on external changes
  useEffect(() => {
    setName(currentName);
    setEmail(currentEmail);
    setSelectedRole(currentRole);
  }, [currentName, currentEmail, currentRole]);

  const hasChanges =
    name.trim() !== currentName ||
    email.trim() !== currentEmail ||
    selectedRole !== currentRole;

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
      onProfileUpdated?.({
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to save profile. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-6 h-6 text-primary" />
          My Profile & Login Details
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your display name, email address, and system role
        </p>
      </div>

      {/* Current profile summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
            {(name || currentName).charAt(0).toUpperCase()}
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

      {/* Profile edit form */}
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
            Your role determines which modules and dashboards you can access.
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

      {/* Error / success feedback */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
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
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Info note */}
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Important Notes</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Changes to your role take effect on the{" "}
              <strong>next page navigation</strong>.
            </li>
            <li>
              Your identity is authenticated via Internet Identity — only
              profile details are editable here.
            </li>
            <li>
              To fully log out and re-authenticate, use the{" "}
              <strong>Logout</strong> button in the top navigation bar.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
