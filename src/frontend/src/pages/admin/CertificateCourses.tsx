import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Download,
  GraduationCap,
  Plus,
  Printer,
  Users,
  XCircle,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

interface CertStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  qualification: string;
  programme: string;
  department: string;
  batch: "1st" | "2nd" | "3rd";
  year: number;
  status: "pending" | "admitted" | "rejected";
  admissionId: string;
  ca: number;
  exam: number;
  attendance: number;
  feeCleared: boolean;
  certificateIssued: boolean;
}

interface Programme {
  id: string;
  department: string;
  title: string;
  duration: string;
  courses: string[];
}

const DEPT_CODE: Record<string, string> = {
  "Computer Science": "CSC",
  "Business Administration": "BUS",
  Mathematics: "MAT",
  Physics: "PHY",
  Chemistry: "CHE",
  Biology: "BIO",
  "Health Education": "HED",
  "Human Kinetics": "HKN",
  Entrepreneurship: "ENT",
  Education: "EDU",
};

const PROGRAMMES: Programme[] = [
  {
    id: "p1",
    department: "Computer Science",
    title: "Certificate in Computer Science (3 months)",
    duration: "3 months",
    courses: [
      "Introduction to Computing",
      "MS Office Suite",
      "Internet & Email",
      "Basic Programming",
    ],
  },
  {
    id: "p2",
    department: "Business Administration",
    title: "Certificate in Business Management (3 months)",
    duration: "3 months",
    courses: [
      "Business Principles",
      "Accounting Basics",
      "Marketing Essentials",
      "Entrepreneurship",
    ],
  },
  {
    id: "p3",
    department: "Health Education",
    title: "Certificate in Health & Safety (3 months)",
    duration: "3 months",
    courses: [
      "First Aid",
      "Community Health",
      "Health Records",
      "Nutrition Basics",
    ],
  },
  {
    id: "p4",
    department: "Entrepreneurship",
    title: "Certificate in Entrepreneurship (3 months)",
    duration: "3 months",
    courses: [
      "Business Planning",
      "Market Research",
      "Financial Management",
      "Digital Marketing",
    ],
  },
  {
    id: "p5",
    department: "Education",
    title: "Certificate in Primary Education (3 months)",
    duration: "3 months",
    courses: [
      "Child Development",
      "Teaching Methods",
      "Classroom Management",
      "Assessment Techniques",
    ],
  },
];

const BATCHES = [
  { key: "1st" as const, label: "1st Batch", period: "January – March" },
  { key: "2nd" as const, label: "2nd Batch", period: "May – July" },
  { key: "3rd" as const, label: "3rd Batch", period: "September – November" },
];

const STORAGE_KEY = "unidigital_cert_students";

function loadStudents(): CertStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  // Seed some sample data
  return [
    {
      id: "cs1",
      name: "Aminu Yusuf",
      phone: "08012345678",
      email: "aminu@example.com",
      qualification: "WAEC",
      programme: "Certificate in Computer Science (3 months)",
      department: "Computer Science",
      batch: "1st",
      year: 2025,
      status: "admitted",
      admissionId: "CERT-CSC-2025-1ST-001",
      ca: 36,
      exam: 54,
      attendance: 88,
      feeCleared: true,
      certificateIssued: false,
    },
    {
      id: "cs2",
      name: "Blessing Okonkwo",
      phone: "08098765432",
      email: "blessing@example.com",
      qualification: "NECO",
      programme: "Certificate in Computer Science (3 months)",
      department: "Computer Science",
      batch: "1st",
      year: 2025,
      status: "admitted",
      admissionId: "CERT-CSC-2025-1ST-002",
      ca: 30,
      exam: 42,
      attendance: 72,
      feeCleared: false,
      certificateIssued: false,
    },
    {
      id: "cs3",
      name: "Fatima Abdullahi",
      phone: "07034567890",
      email: "fatima@example.com",
      qualification: "WAEC",
      programme: "Certificate in Business Management (3 months)",
      department: "Business Administration",
      batch: "2nd",
      year: 2025,
      status: "admitted",
      admissionId: "CERT-BUS-2025-2ND-001",
      ca: 38,
      exam: 56,
      attendance: 94,
      feeCleared: true,
      certificateIssued: true,
    },
  ];
}

function saveStudents(data: CertStudent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTotal(s: CertStudent) {
  return s.ca + s.exam;
}
function getCertClass(total: number): string {
  if (total >= 75) return "Distinction";
  if (total >= 60) return "Credit";
  if (total >= 50) return "Pass";
  return "Fail";
}
function getCertClassColor(cls: string) {
  if (cls === "Distinction") return "bg-yellow-100 text-yellow-800";
  if (cls === "Credit") return "bg-blue-100 text-blue-700";
  if (cls === "Pass") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-700";
}
function isEligible(s: CertStudent) {
  return getTotal(s) >= 50 && s.feeCleared && s.attendance >= 75;
}

function generateAdmissionId(
  dept: string,
  year: number,
  batch: string,
  seq: number,
): string {
  const code = DEPT_CODE[dept] ?? dept.slice(0, 3).toUpperCase();
  const batchCode = batch === "1st" ? "1ST" : batch === "2nd" ? "2ND" : "3RD";
  return `CERT-${code}-${year}-${batchCode}-${String(seq).padStart(3, "0")}`;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  admitted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function CertificateCourses() {
  const [students, setStudents] = useState<CertStudent[]>(loadStudents);
  const [selectedBatch, setSelectedBatch] = useState<"1st" | "2nd" | "3rd">(
    "1st",
  );
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [showAdmit, setShowAdmit] = useState(false);
  const [showResults, setShowResults] = useState<CertStudent | null>(null);
  const [showCert, setShowCert] = useState<CertStudent | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    qualification: "WAEC",
    department: "Computer Science",
    batch: "1st" as "1st" | "2nd" | "3rd",
    year: 2025,
  });
  const [resultsEdit, setResultsEdit] = useState({
    ca: 0,
    exam: 0,
    attendance: 0,
    feeCleared: false,
  });

  const persist = (updated: CertStudent[]) => {
    setStudents(updated);
    saveStudents(updated);
  };

  function admitStudent() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const prog = PROGRAMMES.find((p) => p.department === form.department);
    if (!prog) {
      toast.error("No programme found for this department");
      return;
    }
    const existingInBatch = students.filter(
      (s) =>
        s.department === form.department &&
        s.batch === form.batch &&
        s.year === form.year,
    ).length;
    const seq = existingInBatch + 1;
    const newStudent: CertStudent = {
      id: `cert-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      qualification: form.qualification,
      programme: prog.title,
      department: form.department,
      batch: form.batch,
      year: form.year,
      status: "admitted",
      admissionId: generateAdmissionId(
        form.department,
        form.year,
        form.batch,
        seq,
      ),
      ca: 0,
      exam: 0,
      attendance: 0,
      feeCleared: false,
      certificateIssued: false,
    };
    persist([...students, newStudent]);
    setShowAdmit(false);
    setForm({
      name: "",
      phone: "",
      email: "",
      qualification: "WAEC",
      department: "Computer Science",
      batch: "1st",
      year: 2025,
    });
    toast.success(`${newStudent.name} admitted — ${newStudent.admissionId}`);
  }

  function saveResults() {
    if (!showResults) return;
    const updated = students.map((s) =>
      s.id === showResults.id
        ? {
            ...s,
            ca: resultsEdit.ca,
            exam: resultsEdit.exam,
            attendance: resultsEdit.attendance,
            feeCleared: resultsEdit.feeCleared,
          }
        : s,
    );
    persist(updated);
    setShowResults(null);
    toast.success("Results saved successfully.");
  }

  function issueCertificate(s: CertStudent) {
    if (!isEligible(s)) {
      toast.error("Student does not meet graduation requirements.");
      return;
    }
    const updated = students.map((st) =>
      st.id === s.id ? { ...st, certificateIssued: true } : st,
    );
    persist(updated);
    setShowCert({ ...s, certificateIssued: true });
    toast.success(`Certificate issued for ${s.name}`);
  }

  function changeStatus(id: string, status: CertStudent["status"]) {
    persist(students.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  const depts = [...new Set(PROGRAMMES.map((p) => p.department))];
  const filtered = students.filter((s) => {
    const batchMatch = s.batch === selectedBatch;
    const deptMatch = selectedDept === "all" || s.department === selectedDept;
    const yearMatch = s.year === selectedYear;
    return batchMatch && deptMatch && yearMatch;
  });

  const admitted = filtered.filter((s) => s.status === "admitted");
  const eligible = admitted.filter(isEligible);
  const issued = admitted.filter((s) => s.certificateIssued);

  function printCertificate(s: CertStudent) {
    const instRaw = localStorage.getItem("unidigital_institution_settings");
    let instName = "Federal University of Technology";
    let instMotto = "Knowledge for Service";
    try {
      const parsed = JSON.parse(instRaw ?? "{}");
      instName = parsed?.profile?.name ?? instName;
      instMotto = parsed?.profile?.motto ?? instMotto;
    } catch {
      /**/
    }
    const total = getTotal(s);
    const cls = getCertClass(total);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Certificate</title>
      <style>
        body{font-family:Georgia,serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f0e8;}
        .cert{width:700px;border:8px double #8B6914;padding:48px 56px;text-align:center;background:#fffdf5;box-shadow:0 4px 32px rgba(0,0,0,.15);}
        .cert h1{font-size:28px;margin:0 0 4px;color:#1a1a1a;letter-spacing:1px;}
        .cert .motto{font-style:italic;color:#666;font-size:14px;margin-bottom:20px;}
        .cert .presents{font-size:15px;color:#555;margin-bottom:10px;}
        .cert .recipient{font-size:32px;font-weight:bold;color:#8B6914;border-bottom:2px solid #8B6914;display:inline-block;padding:0 32px 4px;margin-bottom:16px;}
        .cert .body-text{font-size:14px;color:#444;line-height:1.8;margin-bottom:8px;}
        .cert .programme{font-size:18px;font-weight:bold;color:#1a1a1a;margin:8px 0;}
        .cert .class{font-size:15px;color:#7c4f00;font-weight:bold;margin-bottom:20px;}
        .cert .sigs{display:flex;justify-content:space-between;margin-top:36px;}
        .cert .sig{text-align:center;width:40%;}
        .cert .sig-line{border-top:1px solid #333;margin-bottom:4px;}
        .cert .sig-label{font-size:12px;color:#555;}
        .cert .footer{margin-top:24px;font-size:11px;color:#888;}
        .cert .qr-placeholder{width:60px;height:60px;border:2px solid #ccc;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa;}
        @media print{body{background:white;}*{-webkit-print-color-adjust:exact;}}
      </style></head>
      <body>
        <div class="cert">
          <h1>${instName.toUpperCase()}</h1>
          <p class="motto">${instMotto}</p>
          <p class="presents">This is to certify that</p>
          <div class="recipient">${s.name}</div>
          <p class="body-text">having successfully completed the requirements for the</p>
          <p class="programme">${s.programme}</p>
          <p class="body-text">Admission ID: <strong>${s.admissionId}</strong> &nbsp;&bull;&nbsp; Year: ${s.year} &nbsp;&bull;&nbsp; Batch: ${s.batch}</p>
          <p class="class">Class of Award: ${cls} (${total}/100)</p>
          <div class="qr-placeholder">QR Code</div>
          <div class="sigs">
            <div class="sig"><div class="sig-line"></div><div class="sig-label">Registrar</div></div>
            <div class="sig"><div class="sig-line"></div><div class="sig-label">Vice-Chancellor / Director</div></div>
          </div>
          <p class="footer">Issued: ${new Date().toLocaleDateString("en-GB")} &nbsp;&bull;&nbsp; Verify at portal.${instName.toLowerCase().replace(/\s+/g, "")}.edu.ng</p>
        </div>
        <script>window.onload=()=>{window.print();}<\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award size={28} className="text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Certificate Courses
            </h1>
            <p className="text-sm text-slate-500">
              Manage short-term certificate programmes (3 batches/year)
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAdmit(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          data-ocid="cert.admit.button"
        >
          <Plus size={16} className="mr-2" />
          Admit Student
        </Button>
      </div>

      {/* Programmes overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROGRAMMES.map((prog) => (
          <Card key={prog.id} className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen size={14} className="text-blue-600" />
                {prog.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-2">
                {prog.department} &bull; {prog.duration}
              </p>
              <div className="flex flex-wrap gap-1">
                {prog.courses.map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="text-[10px] px-1 py-0"
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Batch Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <Label className="text-sm">Year:</Label>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-slate-500" />
              <Label className="text-sm">Department:</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-48 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {depts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={selectedBatch}
            onValueChange={(v) => setSelectedBatch(v as "1st" | "2nd" | "3rd")}
          >
            <TabsList className="mb-4">
              {BATCHES.map((b) => (
                <TabsTrigger
                  key={b.key}
                  value={b.key}
                  data-ocid={`cert.batch.${b.key}`}
                >
                  {b.label}
                  <span className="ml-1 text-xs text-slate-500">
                    ({b.period})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {BATCHES.map((b) => (
              <TabsContent key={b.key} value={b.key}>
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      label: "Total Admitted",
                      value: admitted.length,
                      color: "text-blue-600",
                    },
                    {
                      label: "Eligible for Cert.",
                      value: eligible.length,
                      color: "text-green-600",
                    },
                    {
                      label: "Certificates Issued",
                      value: issued.length,
                      color: "text-yellow-600",
                    },
                    {
                      label: "Pending",
                      value: filtered.filter((s) => s.status === "pending")
                        .length,
                      color: "text-amber-600",
                    },
                  ].map((item) => (
                    <Card key={item.label} className="p-3 text-center">
                      <p className={`text-2xl font-bold ${item.color}`}>
                        {item.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.label}
                      </p>
                    </Card>
                  ))}
                </div>

                {/* Students table */}
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-10 text-slate-400"
                    data-ocid="cert.empty.state"
                  >
                    <GraduationCap
                      size={32}
                      className="mx-auto mb-2 opacity-40"
                    />
                    <p className="text-sm">No students found for this batch.</p>
                    <p className="text-xs mt-1">
                      Use "Admit Student" to enroll a new student.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admission ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>CA</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((s) => {
                          const total = getTotal(s);
                          const cls = getCertClass(total);
                          const elig = isEligible(s);
                          return (
                            <TableRow key={s.id} data-ocid="cert.student.row">
                              <TableCell className="font-mono text-xs">
                                {s.admissionId}
                              </TableCell>
                              <TableCell className="font-medium">
                                {s.name}
                              </TableCell>
                              <TableCell className="text-xs">
                                {s.department}
                              </TableCell>
                              <TableCell>{s.ca}/40</TableCell>
                              <TableCell>{s.exam}/60</TableCell>
                              <TableCell className="font-bold">
                                {total}
                              </TableCell>
                              <TableCell>
                                {total > 0 && (
                                  <Badge
                                    className={`text-[10px] ${getCertClassColor(cls)}`}
                                  >
                                    {cls}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={
                                    s.attendance >= 75
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }
                                >
                                  {s.attendance}%
                                </span>
                              </TableCell>
                              <TableCell>
                                {s.feeCleared ? (
                                  <CheckCircle
                                    size={14}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <XCircle size={14} className="text-red-400" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-[10px] ${statusColors[s.status]}`}
                                >
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2"
                                    onClick={() => {
                                      setShowResults(s);
                                      setResultsEdit({
                                        ca: s.ca,
                                        exam: s.exam,
                                        attendance: s.attendance,
                                        feeCleared: s.feeCleared,
                                      });
                                    }}
                                    data-ocid="cert.results.button"
                                  >
                                    Scores
                                  </Button>
                                  {s.status === "pending" && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() =>
                                        changeStatus(s.id, "admitted")
                                      }
                                    >
                                      Admit
                                    </Button>
                                  )}
                                  {elig && !s.certificateIssued && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs px-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                                      onClick={() => issueCertificate(s)}
                                      data-ocid="cert.issue.button"
                                    >
                                      Issue Cert.
                                    </Button>
                                  )}
                                  {s.certificateIssued && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs px-2"
                                      onClick={() => {
                                        setShowCert(s);
                                      }}
                                      data-ocid="cert.view.button"
                                    >
                                      <Printer size={11} className="mr-1" />
                                      Print
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Admit Dialog */}
      <Dialog open={showAdmit} onOpenChange={setShowAdmit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Admit Certificate Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Student full name"
                  data-ocid="cert.form.name"
                />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08012345678"
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@email.com"
                />
              </div>
              <div className="space-y-1">
                <Label>Qualification</Label>
                <Select
                  value={form.qualification}
                  onValueChange={(v) => setForm({ ...form, qualification: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["WAEC", "NECO", "OND", "HND", "B.Sc", "Other"].map(
                      (q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {depts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Batch</Label>
                <Select
                  value={form.batch}
                  onValueChange={(v) =>
                    setForm({ ...form, batch: v as "1st" | "2nd" | "3rd" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCHES.map((b) => (
                      <SelectItem key={b.key} value={b.key}>
                        {b.label} ({b.period})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Year</Label>
                <Select
                  value={String(form.year)}
                  onValueChange={(v) => setForm({ ...form, year: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmit(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={admitStudent}
              data-ocid="cert.admit.submit"
            >
              Admit Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results entry dialog */}
      <Dialog open={!!showResults} onOpenChange={() => setShowResults(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Scores — {showResults?.name}</DialogTitle>
          </DialogHeader>
          {showResults && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">{showResults.programme}</p>
              <div className="space-y-1">
                <Label>CA Score (max 40)</Label>
                <Input
                  type="number"
                  min={0}
                  max={40}
                  value={resultsEdit.ca}
                  onChange={(e) =>
                    setResultsEdit({
                      ...resultsEdit,
                      ca: Math.min(40, Number(e.target.value)),
                    })
                  }
                  data-ocid="cert.ca.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Exam Score (max 60)</Label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={resultsEdit.exam}
                  onChange={(e) =>
                    setResultsEdit({
                      ...resultsEdit,
                      exam: Math.min(60, Number(e.target.value)),
                    })
                  }
                  data-ocid="cert.exam.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Attendance (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={resultsEdit.attendance}
                  onChange={(e) =>
                    setResultsEdit({
                      ...resultsEdit,
                      attendance: Math.min(100, Number(e.target.value)),
                    })
                  }
                  data-ocid="cert.attendance.input"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fee-cleared"
                  checked={resultsEdit.feeCleared}
                  onChange={(e) =>
                    setResultsEdit({
                      ...resultsEdit,
                      feeCleared: e.target.checked,
                    })
                  }
                  data-ocid="cert.fee.checkbox"
                />
                <Label htmlFor="fee-cleared">Fee Cleared</Label>
              </div>
              <div className="bg-slate-50 rounded p-2 text-sm">
                <span className="font-semibold">
                  Total: {resultsEdit.ca + resultsEdit.exam}/100
                </span>
                {" — "}
                <span
                  className={`font-semibold ${getCertClassColor(getCertClass(resultsEdit.ca + resultsEdit.exam)).split(" ")[1]}`}
                >
                  {getCertClass(resultsEdit.ca + resultsEdit.exam)}
                </span>
                <span className="ml-2 text-xs text-slate-500">
                  {isEligible({ ...showResults, ...resultsEdit })
                    ? "✅ Eligible for Certificate"
                    : "❌ Not eligible"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResults(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={saveResults}
              data-ocid="cert.results.save"
            >
              Save Scores
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate preview dialog */}
      <Dialog open={!!showCert} onOpenChange={() => setShowCert(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {showCert &&
            (() => {
              const total = getTotal(showCert);
              const cls = getCertClass(total);
              return (
                <div className="border-4 border-double border-yellow-600 p-6 text-center rounded bg-amber-50">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-widest mb-1">
                    Certificate of Achievement
                  </p>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">
                    This is to certify that
                  </h2>
                  <p className="text-2xl font-bold text-yellow-700 border-b-2 border-yellow-600 inline-block px-4 pb-1 mb-3">
                    {showCert.name}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">
                    has successfully completed
                  </p>
                  <p className="text-base font-bold text-slate-800 mb-1">
                    {showCert.programme}
                  </p>
                  <p className="text-sm text-slate-500 mb-2">
                    ID: {showCert.admissionId} &bull; Batch: {showCert.batch}{" "}
                    {showCert.year}
                  </p>
                  <Badge className={`mb-3 ${getCertClassColor(cls)}`}>
                    Class of Award: {cls} ({total}/100)
                  </Badge>
                  <p className="text-xs text-slate-400 mt-2">
                    Issued: {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              );
            })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCert(null)}>
              Close
            </Button>
            {showCert && (
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => printCertificate(showCert)}
                data-ocid="cert.print.button"
              >
                <Printer size={14} className="mr-2" />
                Print Certificate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
