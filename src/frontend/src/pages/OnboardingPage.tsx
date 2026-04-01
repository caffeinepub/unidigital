import { Building2 } from "lucide-react";
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

interface OnboardingPageProps {
  onComplete: (profile: { name: string; email: string; role: string }) => void;
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
];

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !selectedRole) return;
    onComplete({ name, email, role: selectedRole });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to UniDigital
          </h1>
          <p className="text-slate-300 mt-1 text-sm">
            Set up your profile to get started
          </p>
        </div>

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
              disabled={!name || !email || !selectedRole}
              onClick={handleSubmit}
            >
              Enter Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
