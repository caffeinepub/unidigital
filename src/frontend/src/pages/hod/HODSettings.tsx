import { Building2, Settings, Users } from "lucide-react";
import { useState } from "react";
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
import { Separator } from "../../components/ui/separator";

const PROGRAMMES = [
  {
    name: "B.Sc. Computer Science",
    duration: "4 years",
    level: "Undergraduate",
  },
  {
    name: "B.Sc. Information Technology",
    duration: "4 years",
    level: "Undergraduate",
  },
  {
    name: "M.Sc. Computer Science",
    duration: "2 years",
    level: "Postgraduate",
  },
  { name: "NCE Computer Science", duration: "3 years", level: "NCE" },
];

const HOD_SETTINGS_KEY = "unidigital_hod_settings";

function loadHODSettings() {
  const raw = localStorage.getItem(HOD_SETTINGS_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function HODSettings() {
  const saved = loadHODSettings();
  const [dept, setDept] = useState(
    saved?.dept ?? {
      name: "Department of Computer Science",
      code: "CSC",
      headName: "Dr. A. O. Ibrahim",
      phone: "+234 803 000 0001",
      email: "csc@futech.edu.ng",
      resultDeadlineOverride: "",
    },
  );
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    localStorage.setItem(HOD_SETTINGS_KEY, JSON.stringify({ dept }));
    setTimeout(() => {
      setSaving(false);
      toast.success("Department settings saved.");
    }, 500);
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Settings size={22} className="text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Settings
          </h1>
          <p className="text-sm text-gray-500">
            Configure your department profile and academic overrides
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={18} />
            Department Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <Label>Department Name</Label>
              <Input
                value={dept.name}
                onChange={(e) => setDept({ ...dept, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Department Code</Label>
              <Input
                value={dept.code}
                onChange={(e) => setDept({ ...dept, code: e.target.value })}
                placeholder="e.g. CSC"
              />
            </div>
            <div className="space-y-1">
              <Label>Head of Department</Label>
              <Input
                value={dept.headName}
                onChange={(e) => setDept({ ...dept, headName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={dept.phone}
                onChange={(e) => setDept({ ...dept, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={dept.email}
                onChange={(e) => setDept({ ...dept, email: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Result Entry Deadline Override</Label>
              <Input
                type="date"
                value={dept.resultDeadlineOverride}
                onChange={(e) =>
                  setDept({ ...dept, resultDeadlineOverride: e.target.value })
                }
              />
              <p className="text-xs text-gray-400">
                Leave blank to use the institution-wide deadline. Set a date to
                override for this department only.
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Department Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            Programmes Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Programmes are managed by the Admin. Contact the registrar to add or
            remove programmes.
          </p>
          <div className="space-y-2">
            {PROGRAMMES.map((prog) => (
              <div
                key={prog.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
              >
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {prog.name}
                  </p>
                  <p className="text-xs text-gray-500">{prog.duration}</p>
                </div>
                <Badge variant="outline">{prog.level}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
