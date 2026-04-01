import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";

interface PromotionResultsProps {
  userRole?: "hod" | "admin";
}

type InstitutionType =
  | "college_of_education"
  | "university"
  | "polytechnic"
  | string;

interface InstitutionProfile {
  name: string;
  institutionType: InstitutionType;
  city?: string;
  schoolOfSciences?: string;
}

function loadInstitutionProfile(): InstitutionProfile {
  try {
    const raw = localStorage.getItem("unidigital_institution_settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      const p = parsed?.profile ?? parsed;
      if (p?.name) return p as InstitutionProfile;
    }
  } catch {}
  return {
    name: "Federal College of Education Kontagora",
    institutionType: "college_of_education",
    city: "Kontagora",
  };
}

function deriveAcronym(name: string): string {
  const skip = new Set(["of", "and", "the", "for", "in", "at", "to"]);
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0 && !skip.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ── Sample data ──────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  {
    key: "bio-chem",
    label: "Biology / Chemistry",
    school: "School of Sciences",
    subjects: ["BIO", "CHE"],
  },
  {
    key: "csc-mat",
    label: "Computer Science / Mathematics",
    school: "School of Sciences",
    subjects: ["CSC", "MAT"],
  },
  {
    key: "eng-lit",
    label: "English / Literature",
    school: "School of Arts & Social Sciences",
    subjects: ["ENG", "LIT"],
  },
];

type StudentRow = {
  sn: number;
  matric: string;
  name: string;
  edu: string;
  tp: string;
  gse: string;
  sub1: string;
  sub2: string;
  cgpa: number;
  outstanding: string;
  remark: "PROMOTED" | "PROBATION" | "WITHDRAWN";
  gradYear: string;
};

const SAMPLE_DATA: Record<string, StudentRow[]> = {
  "bio-chem": [
    {
      sn: 1,
      matric: "2022/SC/00580",
      name: "ADEBAYO, Musa Ibrahim",
      edu: "C",
      tp: "C",
      gse: "D",
      sub1: "C",
      sub2: "M",
      cgpa: 4.26,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 2,
      matric: "2022/SC/00581",
      name: "ABUBAKAR, Hauwa Usman",
      edu: "D",
      tp: "C",
      gse: "C",
      sub1: "D",
      sub2: "D",
      cgpa: 4.72,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 3,
      matric: "2022/SC/00582",
      name: "ALIYU, Fatima Garba",
      edu: "M",
      tp: "M",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 3.85,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 4,
      matric: "2022/SC/00583",
      name: "BELLO, Emmanuel Chukwu",
      edu: "P",
      tp: "P",
      gse: "M",
      sub1: "M",
      sub2: "P",
      cgpa: 2.41,
      outstanding: "OC-1: BIO 214",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 5,
      matric: "2022/SC/00584",
      name: "DANLADI, Rashida Ahmed",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.1,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 6,
      matric: "2022/SC/00585",
      name: "IBRAHIM, Nkechi Grace",
      edu: "M",
      tp: "C",
      gse: "M",
      sub1: "D",
      sub2: "C",
      cgpa: 4.5,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 7,
      matric: "2022/SC/00586",
      name: "JIBRIL, Yusuf Sadiq",
      edu: "P",
      tp: "M",
      gse: "P",
      sub1: "P",
      sub2: "P",
      cgpa: 1.87,
      outstanding: "OC-1: CHE 217, BIO 210",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 8,
      matric: "2022/SC/00587",
      name: "LAWAL, Amina Tunde",
      edu: "C",
      tp: "D",
      gse: "C",
      sub1: "C",
      sub2: "D",
      cgpa: 4.65,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 9,
      matric: "2022/SC/00588",
      name: "MOHAMMED, Chidinma Obi",
      edu: "D",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.86,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 10,
      matric: "2022/SC/00589",
      name: "NAKANDE, Sule Bello",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.1,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 11,
      matric: "2022/SC/00590",
      name: "OGUNDIPE, Blessing Olu",
      edu: "P",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "M",
      cgpa: 3.55,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 12,
      matric: "2022/SC/00591",
      name: "SANI, Hadiza Musa",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.05,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 13,
      matric: "2022/SC/00592",
      name: "TANKO, Peter Nwachukwu",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "F",
      sub2: "P",
      cgpa: 0.87,
      outstanding: "OC-1: CHE 217, OC-2: BIO 215",
      remark: "WITHDRAWN",
      gradYear: "—",
    },
    {
      sn: 14,
      matric: "2022/SC/00593",
      name: "USMAN, Rejoice Emeka",
      edu: "M",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.8,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 15,
      matric: "2022/SC/00594",
      name: "YAKUBU, Alice Ngozi",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.2,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 16,
      matric: "2022/SC/00595",
      name: "ZUBAIR, Stella Kalu",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.4,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
  ],
  "csc-mat": [
    {
      sn: 1,
      matric: "2022/SC/00600",
      name: "ABUBAKAR, Tijani Musa",
      edu: "D",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.9,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 2,
      matric: "2022/SC/00601",
      name: "BELLO, Ngozi Faith",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.15,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 3,
      matric: "2022/SC/00602",
      name: "CHUKWU, Ahmed Suleiman",
      edu: "M",
      tp: "M",
      gse: "C",
      sub1: "D",
      sub2: "M",
      cgpa: 3.75,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 4,
      matric: "2022/SC/00603",
      name: "DANDA, Obiageli Eze",
      edu: "P",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "P",
      cgpa: 2.88,
      outstanding: "OC-1: CSC 212",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 5,
      matric: "2022/SC/00604",
      name: "EZIKE, Aminu Lawal",
      edu: "C",
      tp: "D",
      gse: "D",
      sub1: "C",
      sub2: "D",
      cgpa: 4.55,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 6,
      matric: "2022/SC/00605",
      name: "FARUK, Chisom Okafor",
      edu: "M",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 3.95,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 7,
      matric: "2022/SC/00606",
      name: "GARBA, Ruth Emeka",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "F",
      cgpa: 1.32,
      outstanding: "OC-1: MAT 213, OC-2: CSC 214",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 8,
      matric: "2022/SC/00607",
      name: "HASSAN, Ifeoma Joy",
      edu: "D",
      tp: "C",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.7,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 9,
      matric: "2022/SC/00608",
      name: "IBRAHIM, Chinyere Udo",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.08,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 10,
      matric: "2022/SC/00609",
      name: "JAMES, Sadiya Bello",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.2,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 11,
      matric: "2022/SC/00610",
      name: "KALU, Mustapha Dogo",
      edu: "C",
      tp: "D",
      gse: "C",
      sub1: "C",
      sub2: "D",
      cgpa: 4.38,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 12,
      matric: "2022/SC/00611",
      name: "LAWAL, Patricia Ibe",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "P",
      cgpa: 1.95,
      outstanding: "OC-1: MAT 215",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 13,
      matric: "2022/SC/00612",
      name: "MUSA, Adaeze Onuoha",
      edu: "D",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "C",
      cgpa: 4.78,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 14,
      matric: "2022/SC/00613",
      name: "NWOSU, Bashir Aliyu",
      edu: "M",
      tp: "C",
      gse: "C",
      sub1: "M",
      sub2: "C",
      cgpa: 3.62,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 15,
      matric: "2022/SC/00614",
      name: "OKON, Salihu Tanko",
      edu: "C",
      tp: "M",
      gse: "M",
      sub1: "C",
      sub2: "M",
      cgpa: 3.48,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
  ],
  "eng-lit": [
    {
      sn: 1,
      matric: "2022/AL/00700",
      name: "ADESOLA, Khadijat Bello",
      edu: "D",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.88,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 2,
      matric: "2022/AL/00701",
      name: "BALA, Chinwe Obi",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.1,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 3,
      matric: "2022/AL/00702",
      name: "CHIDI, Maryam Yusuf",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.3,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 4,
      matric: "2022/AL/00703",
      name: "DIKE, Usman Garba",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "P",
      cgpa: 1.72,
      outstanding: "OC-1: LIT 211",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 5,
      matric: "2022/AL/00704",
      name: "EZE, Halima Sani",
      edu: "C",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "C",
      cgpa: 4.55,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 6,
      matric: "2022/AL/00705",
      name: "GAYA, Blessing Nze",
      edu: "M",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "M",
      cgpa: 3.88,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 7,
      matric: "2022/AL/00706",
      name: "HASSAN, Ngozi Igwe",
      edu: "D",
      tp: "D",
      gse: "C",
      sub1: "D",
      sub2: "D",
      cgpa: 4.62,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 8,
      matric: "2022/AL/00707",
      name: "ILIYA, Chidi Okonkwo",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.0,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 9,
      matric: "2022/AL/00708",
      name: "JAMES, Fatima Sule",
      edu: "P",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "P",
      cgpa: 2.65,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 10,
      matric: "2022/AL/00709",
      name: "KANU, Aisha Mohammed",
      edu: "F",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "F",
      cgpa: 0.92,
      outstanding: "OC-1: ENG 212, OC-2: LIT 213",
      remark: "WITHDRAWN",
      gradYear: "—",
    },
  ],
};

const GRADE_THRESHOLDS: Record<string, Record<string, string>> = {
  DISTINCTION: {
    EDU: "4.50–5.00",
    TP: "4.50–5.00",
    GSE: "4.50–5.00",
    sub1: "4.50–5.00",
    sub2: "4.50–5.00",
  },
  CREDIT: {
    EDU: "3.50–4.49",
    TP: "3.50–4.49",
    GSE: "3.50–4.49",
    sub1: "3.50–4.49",
    sub2: "3.50–4.49",
  },
  MERIT: {
    EDU: "2.40–3.49",
    TP: "2.40–3.49",
    GSE: "2.40–3.49",
    sub1: "2.40–3.49",
    sub2: "2.40–3.49",
  },
  PASS: {
    EDU: "1.00–2.39",
    TP: "1.00–2.39",
    GSE: "1.00–2.39",
    sub1: "1.00–2.39",
    sub2: "1.00–2.39",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildTitle(
  institutionType: InstitutionType,
  level: string,
  semester: string,
): string {
  if (institutionType === "university") {
    const sem = semester === "1" ? "FIRST" : "SECOND";
    const lvlMap: Record<string, string> = {
      "1": "100",
      "2": "200",
      "3": "300",
      "4": "400",
    };
    return `CUMULATIVE EXAMINATION RESULTS – ${lvlMap[level] ?? "100"} LEVEL ${sem} SEMESTER`;
  }
  if (institutionType === "polytechnic") {
    const lvlMap: Record<string, string> = {
      "1": "ND I",
      "2": "ND II",
      "3": "HND I",
      "4": "HND II",
    };
    return `CUMULATIVE EXAMINATION RESULTS – ${lvlMap[level] ?? "ND I"} FULL-TIME`;
  }
  // college_of_education (default)
  const lvlMap: Record<string, string> = {
    "1": "NCE I",
    "2": "NCE II",
    "3": "NCE III",
  };
  const nce = lvlMap[level] ?? "NCE II";
  return `CUMULATIVE EXAMINATION RESULTS II – ${nce} FULL-TIME`;
}

function buildLevelOptions(institutionType: InstitutionType) {
  if (institutionType === "university") {
    return [
      { value: "1", label: "100 Level" },
      { value: "2", label: "200 Level" },
      { value: "3", label: "300 Level" },
      { value: "4", label: "400 Level" },
    ];
  }
  if (institutionType === "polytechnic") {
    return [
      { value: "1", label: "ND I" },
      { value: "2", label: "ND II" },
      { value: "3", label: "HND I" },
      { value: "4", label: "HND II" },
    ];
  }
  return [
    { value: "1", label: "NCE I" },
    { value: "2", label: "NCE II" },
    { value: "3", label: "NCE III" },
  ];
}

const REMARK_COLOR: Record<string, string> = {
  PROMOTED: "text-green-700 font-semibold",
  PROBATION: "text-amber-700 font-semibold",
  WITHDRAWN: "text-red-700 font-semibold",
};

const GRADE_COLOR: Record<string, string> = {
  D: "text-blue-700 font-bold",
  C: "text-emerald-700 font-semibold",
  M: "text-amber-700 font-semibold",
  P: "text-slate-700",
  F: "text-red-700 font-bold",
};

// ── Component ────────────────────────────────────────────────────────────────

export function PromotionResults({
  userRole = "admin",
}: PromotionResultsProps) {
  const institution = useMemo(() => loadInstitutionProfile(), []);
  const acronym = useMemo(
    () => deriveAcronym(institution.name),
    [institution.name],
  );

  const [session, setSession] = useState("2023/2024");
  const [level, setLevel] = useState("2");
  const [semester, setSemester] = useState("1");
  const [deptKey, setDeptKey] = useState("bio-chem");

  const dept = DEPARTMENTS.find((d) => d.key === deptKey) ?? DEPARTMENTS[0];
  const students = SAMPLE_DATA[deptKey] ?? [];
  const levelOptions = buildLevelOptions(institution.institutionType);
  const title = buildTitle(institution.institutionType, level, semester);
  const institutionUpper = institution.name.toUpperCase();
  const schoolUpper = dept.school.toUpperCase();
  const programmeUpper = dept.label.toUpperCase();
  const sessionUpper = `${session} ACADEMIC SESSION`;
  const nowStr = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sub1Code = dept.subjects[0];
  const sub2Code = dept.subjects[1];

  return (
    <div className="space-y-4" data-ocid="promotion-results.page">
      {/* Screen controls — hidden on print */}
      <div className="no-print">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Promotion Results
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {userRole === "hod" ? "HOD View" : "Administrator View"} ·
              Official cumulative examination results sheet
            </p>
          </div>
          <Button
            data-ocid="promotion-results.primary_button"
            onClick={() => window.print()}
            className="bg-blue-700 hover:bg-blue-800 text-white gap-2"
          >
            <Printer size={16} /> Print / Download
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">
                  Session
                </span>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger
                    className="w-36"
                    data-ocid="promotion-results.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2021/2022">2021/2022</SelectItem>
                    <SelectItem value="2022/2023">2022/2023</SelectItem>
                    <SelectItem value="2023/2024">2023/2024</SelectItem>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">
                  Level / Year
                </span>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger
                    className="w-36"
                    data-ocid="promotion-results.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">
                  Semester
                </span>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger
                    className="w-36"
                    data-ocid="promotion-results.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Semester</SelectItem>
                    <SelectItem value="2">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">
                  Programme / Department
                </span>
                <Select value={deptKey} onValueChange={setDeptKey}>
                  <SelectTrigger
                    className="w-64"
                    data-ocid="promotion-results.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Printable document ── */}
      <div className="promotion-results-doc bg-white border border-slate-300 rounded-md p-6 shadow-sm">
        {/* Letterhead */}
        <div className="text-center mb-4 space-y-0.5">
          <p className="text-[13px] font-extrabold uppercase tracking-wide">
            {institutionUpper}
          </p>
          <p className="text-[12px] font-bold uppercase tracking-wide">
            {schoolUpper}
          </p>
          <p className="text-[12px] font-semibold uppercase">
            {programmeUpper}
          </p>
          <p className="text-[11px] font-semibold uppercase">{sessionUpper}</p>
          <p className="text-[11px] font-bold uppercase mt-1 border-t border-b border-slate-400 py-1 px-3 inline-block">
            {title}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] font-mono">
            <thead>
              {/* Column headers */}
              <tr className="bg-slate-100">
                <th className="results-th w-8 text-center">S/NO</th>
                <th className="results-th w-28">MATRIC NO</th>
                <th className="results-th w-44">STUDENT NAMES</th>
                <th className="results-th w-12 text-center">EDU</th>
                <th className="results-th w-12 text-center">TP</th>
                <th className="results-th w-12 text-center">GSE</th>
                <th className="results-th w-14 text-center">{sub1Code}</th>
                <th className="results-th w-14 text-center">{sub2Code}</th>
                <th className="results-th w-14 text-center">CGPA</th>
                <th className="results-th w-40">OUTSTANDING COURSES</th>
                <th className="results-th w-24 text-center">REMARK</th>
                <th className="results-th w-20 text-center">GRAD. YEAR</th>
              </tr>
              {/* Grade reference rows */}
              {Object.entries(GRADE_THRESHOLDS).map(([grade, vals]) => (
                <tr key={grade} className="bg-slate-50">
                  <td
                    colSpan={3}
                    className="results-td text-right font-semibold pr-2 text-[10px] italic"
                  >
                    {grade}:
                  </td>
                  <td className="results-td text-center text-[10px]">
                    {vals.EDU}
                  </td>
                  <td className="results-td text-center text-[10px]">
                    {vals.TP}
                  </td>
                  <td className="results-td text-center text-[10px]">
                    {vals.GSE}
                  </td>
                  <td className="results-td text-center text-[10px]">
                    {vals.sub1}
                  </td>
                  <td className="results-td text-center text-[10px]">
                    {vals.sub2}
                  </td>
                  <td colSpan={4} className="results-td" />
                </tr>
              ))}
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr
                  key={s.matric}
                  data-ocid={`promotion-results.item.${idx + 1}`}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <td className="results-td text-center">{s.sn}</td>
                  <td className="results-td text-[10px]">{s.matric}</td>
                  <td className="results-td font-sans">{s.name}</td>
                  <td
                    className={`results-td text-center ${GRADE_COLOR[s.edu] ?? ""}`}
                  >
                    {s.edu}
                  </td>
                  <td
                    className={`results-td text-center ${GRADE_COLOR[s.tp] ?? ""}`}
                  >
                    {s.tp}
                  </td>
                  <td
                    className={`results-td text-center ${GRADE_COLOR[s.gse] ?? ""}`}
                  >
                    {s.gse}
                  </td>
                  <td
                    className={`results-td text-center ${GRADE_COLOR[s.sub1] ?? ""}`}
                  >
                    {s.sub1}
                  </td>
                  <td
                    className={`results-td text-center ${GRADE_COLOR[s.sub2] ?? ""}`}
                  >
                    {s.sub2}
                  </td>
                  <td className="results-td text-center font-semibold">
                    {s.cgpa.toFixed(2)}
                  </td>
                  <td className="results-td text-[10px] text-slate-600">
                    {s.outstanding || "—"}
                  </td>
                  <td
                    className={`results-td text-center text-[10px] ${REMARK_COLOR[s.remark] ?? ""}`}
                  >
                    {s.remark}
                  </td>
                  <td className="results-td text-center">{s.gradYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 space-y-1 text-[10px] border-t border-slate-300 pt-2">
          <p className="font-semibold">
            GRADING KEYS: [4.5 – 5: DISTINCTION] &nbsp;[3.5 – 4.49: CREDIT]
            &nbsp;[2.4 – 3.49: MERIT] &nbsp;[1 – 2.39: PASS] &nbsp;[0 – 0.99:
            FAIL]
          </p>
          <p className="text-slate-600">Source: MIS Unit, {institution.name}</p>
          <p className="font-bold text-slate-700">{acronym} MIS</p>
          <p className="text-slate-500">Date Printed: {nowStr}</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        .results-th {
          border: 1px solid #94a3b8;
          padding: 4px 5px;
          font-size: 10px;
          font-weight: 700;
          text-align: left;
          white-space: nowrap;
        }
        .results-td {
          border: 1px solid #cbd5e1;
          padding: 3px 5px;
          vertical-align: middle;
          white-space: nowrap;
        }
        @media print {
          .no-print { display: none !important; }
          header, nav, aside, .sidebar, [data-role="sidebar"], [data-role="topbar"] {
            display: none !important;
          }
          body { background: white !important; }
          .promotion-results-doc {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .results-th, .results-td {
            font-size: 9px !important;
            padding: 2px 3px !important;
          }
          @page {
            size: A3 landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
