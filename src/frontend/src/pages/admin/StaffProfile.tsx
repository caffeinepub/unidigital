import {
  ArrowLeft,
  Award,
  Briefcase,
  Edit,
  GraduationCap,
  Phone,
  Printer,
  User,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import type { StaffProfile } from "./StaffManagement";

interface Props {
  profile: StaffProfile;
  onBack: () => void;
  onEdit: () => void;
}

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  probation: "bg-amber-100 text-amber-700",
  retired: "bg-slate-100 text-slate-600",
  exited: "bg-red-100 text-red-700",
};

export function StaffProfileView({ profile, onBack, onEdit }: Props) {
  const printProfile = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const quals = profile.qualifications
      .map(
        (q) =>
          `<tr><td>${q.degree}</td><td>${q.institution}</td><td>${q.year}</td></tr>`,
      )
      .join("");
    const empHistory = profile.employmentHistory
      .map(
        (e) =>
          `<tr><td>${e.employer}</td><td>${e.role}</td><td>${e.startYear}</td><td>${e.endYear}</td></tr>`,
      )
      .join("");
    win.document.write(`
      <html><head><style>
        body{font-family:Arial,sans-serif;padding:30px;font-size:12px;color:#1e293b}
        h1{font-size:18px;color:#1e3a5f;text-align:center;margin-bottom:2px}
        h2{font-size:13px;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:4px;margin-top:18px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left}
        th{background:#f1f5f9;font-weight:bold}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .field{margin:4px 0}
        .label{font-weight:bold;color:#475569}
      </style></head><body>
      <h1>STAFF ACADEMIC/EMPLOYMENT RECORD</h1>
      <p style="text-align:center;color:#475569;font-size:11px">Federal University of Education, Kontagora (FUEK) — MIS</p>
      <h2>Personal Information</h2>
      <div class="grid2">
        <div class="field"><span class="label">Name:</span> ${profile.name}</div>
        <div class="field"><span class="label">Staff ID:</span> ${profile.staffId}</div>
        <div class="field"><span class="label">Date of Birth:</span> ${profile.dob}</div>
        <div class="field"><span class="label">Gender:</span> ${profile.gender}</div>
        <div class="field"><span class="label">Nationality:</span> ${profile.nationality}</div>
        <div class="field"><span class="label">State of Origin:</span> ${profile.state}</div>
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
        <div class="field"><span class="label">Date of Appointment:</span> ${profile.dateOfAppointment}</div>
        <div class="field"><span class="label">Salary Grade:</span> ${profile.salaryGrade}</div>
        <div class="field"><span class="label">Status:</span> ${profile.employmentStatus.toUpperCase()}</div>
      </div>
      ${quals ? `<h2>Academic Qualifications</h2><table><thead><tr><th>Qualification</th><th>Institution</th><th>Year</th></tr></thead><tbody>${quals}</tbody></table>` : ""}
      ${empHistory ? `<h2>Employment History</h2><table><thead><tr><th>Employer</th><th>Role</th><th>From</th><th>To</th></tr></thead><tbody>${empHistory}</tbody></table>` : ""}
      <h2>Next of Kin</h2>
      <div class="grid2">
        <div class="field"><span class="label">Name:</span> ${profile.nokName}</div>
        <div class="field"><span class="label">Relationship:</span> ${profile.nokRelationship}</div>
        <div class="field"><span class="label">Phone:</span> ${profile.nokPhone}</div>
      </div>
      <p style="text-align:right;font-size:10px;margin-top:30px;color:#94a3b8">Printed: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; FUEK MIS</p>
      </body></html>
    `);
    win.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Staff List
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printProfile}>
            <Printer size={14} className="mr-1" /> Print Record
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onEdit}
          >
            <Edit size={14} className="mr-1" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile header card */}
      <Card className="border-t-4 border-blue-600">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 flex-shrink-0">
              <User size={36} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {profile.name}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {profile.designation} · {profile.department}
                  </p>
                  <p className="text-slate-400 text-xs font-mono mt-0.5">
                    {profile.staffId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[profile.employmentStatus]}`}
                >
                  {profile.employmentStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone size={13} /> {profile.phone}
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
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={15} /> Personal Information
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
                <span className="text-slate-500 w-36 flex-shrink-0">
                  {label}:
                </span>
                <span className="text-slate-800 font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Current Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase size={15} /> Current Employment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Designation", profile.designation],
              ["Grade Level", profile.gradeLevel],
              ["Department", profile.department],
              ["Faculty", profile.faculty],
              ["Date of Appointment", profile.dateOfAppointment],
              ["Salary Grade", profile.salaryGrade],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-slate-500 w-36 flex-shrink-0">
                  {label}:
                </span>
                <span className="text-slate-800 font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap size={15} /> Academic Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.qualifications.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No qualifications recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.qualifications.map((q) => (
                  <div
                    key={`${q.degree}-${q.year}`}
                    className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg"
                  >
                    <Award
                      size={14}
                      className="text-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {q.degree}
                      </p>
                      <p className="text-xs text-slate-500">
                        {q.institution} · {q.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase size={15} /> Previous Employment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.employmentHistory.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No previous employment recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.employmentHistory.map((e) => (
                  <div
                    key={`${e.employer}-${e.startYear}`}
                    className="p-2 bg-slate-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {e.role}
                    </p>
                    <p className="text-xs text-slate-500">
                      {e.employer} · {e.startYear}–{e.endYear}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next of Kin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users size={15} /> Next of Kin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-slate-500">Name: </span>
              <span className="font-medium">{profile.nokName}</span>
            </div>
            <div>
              <span className="text-slate-500">Relationship: </span>
              <span className="font-medium">{profile.nokRelationship}</span>
            </div>
            <div>
              <span className="text-slate-500">Phone: </span>
              <span className="font-medium">{profile.nokPhone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Probation notes if applicable */}
      {profile.employmentStatus === "probation" && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="text-sm text-amber-700">
              Probation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="text-slate-500">Expected Confirmation: </span>
              <span className="font-medium">
                {profile.probationConfirmDate ?? "Not set"}
              </span>
            </p>
            {profile.probationNotes && (
              <p>
                <span className="text-slate-500">Notes: </span>
                <span>{profile.probationNotes}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
