import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, ListChecks, Printer } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface PassFailureListsProps {
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

function getLevelLabel(
  institutionType: InstitutionType,
  level: string,
): string {
  if (institutionType === "university") {
    const map: Record<string, string> = {
      "1": "100 Level",
      "2": "200 Level",
      "3": "300 Level",
      "4": "400 Level",
    };
    return map[level] ?? `${level}00 Level`;
  }
  if (institutionType === "polytechnic") {
    const map: Record<string, string> = {
      "1": "ND I",
      "2": "ND II",
      "3": "HND I",
      "4": "HND II",
    };
    return map[level] ?? `Level ${level}`;
  }
  // college_of_education default
  const map: Record<string, string> = {
    "1": "NCE I",
    "2": "NCE II",
    "3": "NCE III",
  };
  return map[level] ?? `NCE ${level}`;
}

function getTitleLine(
  institutionType: InstitutionType,
  level: string,
  semester: string,
): string {
  const lvl = getLevelLabel(institutionType, level);
  if (institutionType === "university") {
    return `${lvl} ${semester === "1" ? "FIRST" : "SECOND"} SEMESTER GRADUATING STUDENTS RESULT`;
  }
  if (institutionType === "polytechnic") {
    return `${lvl} FULL-TIME GRADUATING STUDENTS RESULT`;
  }
  return `${lvl} FULL-TIME GRADUATING STUDENTS RESULT`;
}

function gradeLabel(code: string): string {
  const map: Record<string, string> = {
    D: "DISTINCTION",
    C: "CREDIT",
    M: "MERIT",
    P: "PASS",
    F: "FAIL",
  };
  return map[code] ?? code;
}

function cgpaToGrade(cgpa: number): string {
  if (cgpa >= 4.5) return "DISTINCTION";
  if (cgpa >= 3.5) return "CREDIT";
  if (cgpa >= 2.4) return "MERIT";
  if (cgpa >= 1.0) return "PASS";
  return "FAIL";
}

// ── Sample data ──────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  {
    key: "bio-chem",
    label: "Biology / Chemistry",
    abbr: "BIO-CHE",
    school: "School of Sciences",
    subjects: ["BIO", "CHE"],
  },
  {
    key: "csc-mat",
    label: "Computer Science / Mathematics",
    abbr: "CSC-MAT",
    school: "School of Sciences",
    subjects: ["CSC", "MAT"],
  },
  {
    key: "eng-lit",
    label: "English / Literature",
    abbr: "ENG-LIT",
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
      outstanding: "EDU 222, EDU 224 / BIO 114",
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
      outstanding: "CHE 217, BIO 210 / EDU 321",
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
      outstanding:
        "EDU 222, EDU 224, EDU 321, EDU 323 / GSE 122 / BIO 114, BIO 211",
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
    {
      sn: 17,
      matric: "2022/SC/00596",
      name: "AHMED, Rukayya Danjuma",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "M",
      cgpa: 3.78,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 18,
      matric: "2022/SC/00597",
      name: "BABANGIDA, Josephine Eke",
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
      sn: 19,
      matric: "2022/SC/00598",
      name: "DAUDA, Samuel Okonkwo",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "P",
      sub2: "M",
      cgpa: 2.95,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 20,
      matric: "2022/SC/00599",
      name: "ENIOLA, Amara Obiora",
      edu: "C",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "C",
      cgpa: 4.45,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 21,
      matric: "2022/SC/00600",
      name: "FARIDA, Gana Aliyu",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "F",
      cgpa: 0.72,
      outstanding:
        "EDU 222, EDU 224, EDU 321, EDU 323, EDU 324 / GSE 122 / BIO 114, BIO 211, CHE 212",
      remark: "WITHDRAWN",
      gradYear: "—",
    },
    {
      sn: 22,
      matric: "2022/SC/00601",
      name: "GANA, Rebecca Audu",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.25,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 23,
      matric: "2022/SC/00602",
      name: "HASSAN, Funmilayo Ojo",
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
      sn: 24,
      matric: "2022/SC/00603",
      name: "IDRIS, Chioma Anagu",
      edu: "D",
      tp: "C",
      gse: "D",
      sub1: "D",
      sub2: "C",
      cgpa: 4.55,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 25,
      matric: "2022/SC/00604",
      name: "JIMOH, Patience Onuma",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "M",
      sub2: "P",
      cgpa: 2.15,
      outstanding: "BIO 317 / CHE 315",
      remark: "PROBATION",
      gradYear: "2026",
    },
  ],
  "csc-mat": [
    {
      sn: 1,
      matric: "2022/SC/00620",
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
      matric: "2022/SC/00621",
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
      matric: "2022/SC/00622",
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
      matric: "2022/SC/00623",
      name: "DANDA, Obiageli Eze",
      edu: "P",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "P",
      cgpa: 2.88,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 5,
      matric: "2022/SC/00624",
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
      matric: "2022/SC/00625",
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
      matric: "2022/SC/00626",
      name: "GARBA, Ruth Emeka",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "F",
      cgpa: 1.32,
      outstanding: "MAT 213, MAT 215 / CSC 214, CSC 216 / EDU 321",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 8,
      matric: "2022/SC/00627",
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
      matric: "2022/SC/00628",
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
      matric: "2022/SC/00629",
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
      matric: "2022/SC/00630",
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
      matric: "2022/SC/00631",
      name: "LAWAL, Patricia Ibe",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "P",
      cgpa: 1.95,
      outstanding: "MAT 215, MAT 321 / EDU 222, EDU 224",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 13,
      matric: "2022/SC/00632",
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
      matric: "2022/SC/00633",
      name: "NWANKWO, Kabiru Hassan",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "M",
      sub2: "C",
      cgpa: 3.6,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 15,
      matric: "2022/SC/00634",
      name: "OKONKWO, Aisha Umar",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "C",
      sub2: "M",
      cgpa: 3.45,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 16,
      matric: "2022/SC/00635",
      name: "PETER, Zainab Garba",
      edu: "D",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.85,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 17,
      matric: "2022/SC/00636",
      name: "RABIU, Chiamaka Obi",
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
      sn: 18,
      matric: "2022/SC/00637",
      name: "SULEIMAN, Adaora Ezeh",
      edu: "M",
      tp: "C",
      gse: "M",
      sub1: "M",
      sub2: "C",
      cgpa: 3.88,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 19,
      matric: "2022/SC/00638",
      name: "TUKUR, Ngozi Eze",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "F",
      sub2: "P",
      cgpa: 0.61,
      outstanding:
        "EDU 222, EDU 224, EDU 321, EDU 323, EDU 324 / GSE 122 / CSC 114, CSC 211, CSC 315 / MAT 212",
      remark: "WITHDRAWN",
      gradYear: "—",
    },
    {
      sn: 20,
      matric: "2022/SC/00639",
      name: "UCHE, Maryam Aliyu",
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
      sn: 21,
      matric: "2022/SC/00640",
      name: "VICTOR, Falmata Bukar",
      edu: "M",
      tp: "M",
      gse: "D",
      sub1: "D",
      sub2: "M",
      cgpa: 4.12,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 22,
      matric: "2022/SC/00641",
      name: "WAZIRI, Eunice Okeke",
      edu: "C",
      tp: "D",
      gse: "C",
      sub1: "C",
      sub2: "D",
      cgpa: 4.48,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 23,
      matric: "2022/SC/00642",
      name: "YAKUBU, Obioma Nweze",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "P",
      cgpa: 1.78,
      outstanding: "CSC 315 / EDU 323",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 24,
      matric: "2022/SC/00643",
      name: "ZAKARIYA, Adaeze Orji",
      edu: "D",
      tp: "D",
      gse: "D",
      sub1: "D",
      sub2: "D",
      cgpa: 4.92,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 25,
      matric: "2022/SC/00644",
      name: "AHMED, Blessing Okafor",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.05,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
  ],
  "eng-lit": [
    {
      sn: 1,
      matric: "2022/AS/00580",
      name: "ADAMU, Grace Nwankwo",
      edu: "C",
      tp: "D",
      gse: "D",
      sub1: "C",
      sub2: "D",
      cgpa: 4.6,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 2,
      matric: "2022/AS/00581",
      name: "BALA, Mary Chidera",
      edu: "M",
      tp: "M",
      gse: "C",
      sub1: "M",
      sub2: "C",
      cgpa: 3.72,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 3,
      matric: "2022/AS/00582",
      name: "CHIKE, Salamatu Dogo",
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
      sn: 4,
      matric: "2022/AS/00583",
      name: "DOGO, Obioma Eze",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "F",
      cgpa: 0.95,
      outstanding:
        "ENG 312, ENG 314, ENG 321 / LIT 311, LIT 313 / EDU 321, EDU 323",
      remark: "WITHDRAWN",
      gradYear: "—",
    },
    {
      sn: 5,
      matric: "2022/AS/00584",
      name: "EKWU, Aminu Shuaibu",
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
      sn: 6,
      matric: "2022/AS/00585",
      name: "FEMI, Zainab Haruna",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.32,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 7,
      matric: "2022/AS/00586",
      name: "GIDADO, Uchenna Eze",
      edu: "C",
      tp: "D",
      gse: "C",
      sub1: "D",
      sub2: "C",
      cgpa: 4.42,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 8,
      matric: "2022/AS/00587",
      name: "HARUNA, Kelechi Obi",
      edu: "P",
      tp: "P",
      gse: "M",
      sub1: "M",
      sub2: "P",
      cgpa: 2.65,
      outstanding: "ENG 315 / EDU 324",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 9,
      matric: "2022/AS/00588",
      name: "ISA, Adaora Nwosu",
      edu: "D",
      tp: "C",
      gse: "D",
      sub1: "D",
      sub2: "C",
      cgpa: 4.52,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 10,
      matric: "2022/AS/00589",
      name: "JAFARU, Nneka Chukwu",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.48,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 11,
      matric: "2022/AS/00590",
      name: "KABIRU, Ijeoma Okafor",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.18,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 12,
      matric: "2022/AS/00591",
      name: "LAWAL, Chiamaka Obi",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "P",
      sub2: "P",
      cgpa: 1.62,
      outstanding: "ENG 312, ENG 314 / EDU 222, EDU 321",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 13,
      matric: "2022/AS/00592",
      name: "MAIKUDI, Obiageli Nze",
      edu: "D",
      tp: "D",
      gse: "C",
      sub1: "D",
      sub2: "D",
      cgpa: 4.74,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 14,
      matric: "2022/AS/00593",
      name: "NASIRU, Patricia Ota",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "M",
      cgpa: 3.95,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 15,
      matric: "2022/AS/00594",
      name: "OBINNA, Hafsat Garba",
      edu: "M",
      tp: "C",
      gse: "M",
      sub1: "C",
      sub2: "M",
      cgpa: 3.65,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 16,
      matric: "2022/AS/00595",
      name: "PWAJOK, Amaka Ene",
      edu: "D",
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
      sn: 17,
      matric: "2022/AS/00596",
      name: "RABIU, Ngozi Odo",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "M",
      sub2: "C",
      cgpa: 3.82,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 18,
      matric: "2022/AS/00597",
      name: "SULE, Chidinma Orji",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.12,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 19,
      matric: "2022/AS/00598",
      name: "TANKO, Adaeze Mba",
      edu: "P",
      tp: "P",
      gse: "P",
      sub1: "F",
      sub2: "P",
      cgpa: 0.82,
      outstanding:
        "ENG 312, ENG 314, ENG 321, ENG 323 / LIT 311, LIT 313 / EDU 222, EDU 321, EDU 323",
      remark: "WITHDRAWN",
      gradYear: "—",
    },
    {
      sn: 20,
      matric: "2022/AS/00599",
      name: "UMAR, Roseline Nwachukwu",
      edu: "C",
      tp: "C",
      gse: "D",
      sub1: "D",
      sub2: "C",
      cgpa: 4.35,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 21,
      matric: "2022/AS/00600",
      name: "VICTOR, Amina Danjuma",
      edu: "M",
      tp: "D",
      gse: "C",
      sub1: "C",
      sub2: "D",
      cgpa: 4.4,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 22,
      matric: "2022/AS/00601",
      name: "WADA, Obioma Nwosu",
      edu: "C",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "C",
      cgpa: 4.02,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 23,
      matric: "2022/AS/00602",
      name: "XOLANI, Fatima Bukar",
      edu: "P",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "P",
      cgpa: 2.72,
      outstanding: "LIT 315 / EDU 323",
      remark: "PROBATION",
      gradYear: "2026",
    },
    {
      sn: 24,
      matric: "2022/AS/00603",
      name: "YEMI, Hannatu Musa",
      edu: "D",
      tp: "C",
      gse: "C",
      sub1: "C",
      sub2: "D",
      cgpa: 4.58,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
    {
      sn: 25,
      matric: "2022/AS/00604",
      name: "ZARA, Chioma Ugwu",
      edu: "M",
      tp: "M",
      gse: "M",
      sub1: "M",
      sub2: "M",
      cgpa: 3.18,
      outstanding: "",
      remark: "PROMOTED",
      gradYear: "2025",
    },
  ],
};

const SESSIONS = ["2024/2025", "2023/2024", "2022/2023"];
const LEVELS = [
  { value: "1", nce: "NCE I", uni: "100 Level", poly: "ND I" },
  { value: "2", nce: "NCE II", uni: "200 Level", poly: "ND II" },
  { value: "3", nce: "NCE III", uni: "300 Level", poly: "HND I" },
  { value: "4", nce: "NCE IV", uni: "400 Level", poly: "HND II" },
];

// ── Print CSS ─────────────────────────────────────────────────────────────────
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #pass-fail-print-area, #pass-fail-print-area * { visibility: visible !important; }
  #pass-fail-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .print-page-break { page-break-before: always; }
  .print-page-footer {
    position: running(footer);
    width: 100%;
    border-top: 1px solid #000;
    font-size: 9pt;
    font-family: serif;
    padding: 3px 8px;
    display: flex;
    justify-content: space-between;
  }
  @page {
    size: A4 landscape;
    margin: 1.5cm 1.5cm 2.5cm 1.5cm;
    @bottom-center {
      content: element(footer);
    }
  }
  table { border-collapse: collapse !important; width: 100% !important; }
  th, td { border: 1px solid #000 !important; padding: 3px 4px !important; font-size: 9pt !important; font-family: serif !important; }
  th { background: #f0f0f0 !important; font-weight: bold !important; }
  .doc-header { text-align: center; margin-bottom: 8px; font-family: serif; }
  .doc-header h1 { font-size: 14pt; font-weight: bold; margin: 0 0 2px 0; text-transform: uppercase; }
  .doc-header h2 { font-size: 11pt; font-weight: bold; margin: 0 0 2px 0; }
  .doc-header h3 { font-size: 10pt; font-weight: normal; margin: 0 0 2px 0; }
  .summary-section { margin-top: 16px; page-break-inside: avoid; }
  .sig-block { display: flex; justify-content: space-between; gap: 32px; margin-top: 12px; }
  .sig-line { border-bottom: 1px solid #000; min-width: 180px; margin-top: 4px; height: 18px; }
}
`;

const PAGE_ROWS = 20;

interface DocPageProps {
  institution: InstitutionProfile;
  acronym: string;
  session: string;
  level: string;
  dept: (typeof DEPARTMENTS)[0];
  rows: StudentRow[];
  listType: "PASS" | "FAILURE";
  pageNum: number;
  totalPages: number;
  printedAt: string;
  isLastPage: boolean;
  examOfficerName: string;
  examOfficerDate: string;
  deanName: string;
  deanDate: string;
  allRows: StudentRow[];
}

function DocPage({
  institution,
  acronym,
  session,
  level,
  dept,
  rows,
  listType,
  pageNum,
  totalPages,
  printedAt,
  isLastPage,
  examOfficerName,
  examOfficerDate,
  deanName,
  deanDate,
  allRows,
}: DocPageProps) {
  const titleLine = getTitleLine(institution.institutionType, level, "2");
  const _lvlLabel = getLevelLabel(institution.institutionType, level);

  const passCount = allRows.filter((r) => r.remark === "PROMOTED").length;
  const failCount = allRows.filter((r) => r.remark !== "PROMOTED").length;
  const total = allRows.length;
  const passPercent =
    total > 0 ? ((passCount / total) * 100).toFixed(1) : "0.0";
  const failPercent =
    total > 0 ? ((failCount / total) * 100).toFixed(1) : "0.0";

  const isPassList = listType === "PASS";
  const sub1Code = dept.subjects[0];
  const sub2Code = dept.subjects[1];

  return (
    <div className="mb-8 print-page-section">
      {/* Header */}
      <div className="doc-header text-center mb-3 print:mb-2">
        <h1 className="text-lg font-bold uppercase tracking-wide">
          {institution.name.toUpperCase()}
        </h1>
        <h2 className="text-base font-bold uppercase">{titleLine}</h2>
        <h3 className="text-sm font-semibold">{session} SESSION</h3>
        <h3 className="text-sm">{dept.school.toUpperCase()}</h3>
        <h3 className="text-sm">
          {dept.label.toUpperCase()} ({dept.abbr})
        </h3>
        <h2 className="text-base font-bold mt-1 underline">{listType} LIST</h2>
      </div>

      {/* Table */}
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "0.78rem",
        }}
        className="border border-black"
      >
        <thead>
          <tr style={{ backgroundColor: "#e8e8e8" }}>
            <th style={thStyle}>S/N</th>
            <th style={thStyle}>MATRIC NO</th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 160 }}>
              NAME
            </th>
            <th style={thStyle}>EDU</th>
            <th style={thStyle}>TP</th>
            <th style={thStyle}>GSE</th>
            <th style={thStyle}>{sub1Code}</th>
            <th style={thStyle}>{sub2Code}</th>
            <th style={thStyle}>GCGPA</th>
            <th style={{ ...thStyle, minWidth: 120 }}>CARRY OVERS</th>
            {isPassList ? (
              <th style={thStyle}>GRADUATION DATE</th>
            ) : (
              <th style={thStyle}>REMARK</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.matric}
              style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}
            >
              <td style={tdCenterStyle}>{row.sn}</td>
              <td style={tdCenterStyle}>{row.matric}</td>
              <td style={{ ...tdStyle, textAlign: "left" }}>{row.name}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.edu)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.tp)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.gse)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.sub1)}</td>
              <td style={tdCenterStyle}>{gradeLabel(row.sub2)}</td>
              <td style={tdCenterStyle}>
                {row.cgpa.toFixed(2)}
                <br />
                <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                  ({cgpaToGrade(row.cgpa)})
                </span>
              </td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "left",
                  fontSize: "0.7rem",
                  wordBreak: "break-word",
                }}
              >
                {row.outstanding || "—"}
              </td>
              {isPassList ? (
                <td style={tdCenterStyle}>{row.gradYear}</td>
              ) : (
                <td
                  style={{
                    ...tdCenterStyle,
                    fontWeight: 700,
                    color: row.remark === "WITHDRAWN" ? "#b91c1c" : "#b45309",
                  }}
                >
                  {row.remark}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary + signatures on last page */}
      {isLastPage && (
        <div className="summary-section mt-6 print:mt-4">
          {/* Grading keys */}
          <p style={{ fontSize: "0.75rem", marginBottom: 8 }}>
            <strong>GRADING KEYS:</strong> [4.5–5: DISTINCTION] [3.5–4.49:
            CREDIT] [2.4–3.49: MERIT] [1–2.39: PASS] [0–0.99: FAIL]
          </p>

          <div
            style={{
              display: "flex",
              gap: 32,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Summary table */}
            <table
              style={{
                borderCollapse: "collapse",
                fontSize: "0.78rem",
                minWidth: 320,
                flex: "0 0 auto",
              }}
            >
              <tbody>
                {[
                  ["Total number of students", total],
                  ["Number of students that passed", passCount],
                  ["Number of students that failed", failCount],
                  ["Percentage of students that passed", `${passPercent}%`],
                  ["Percentage of students that failed", `${failPercent}%`],
                ].map(([label, value]) => (
                  <tr key={String(label)}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 8px",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 8px",
                        textAlign: "center",
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature blocks */}
            <div
              style={{
                display: "flex",
                gap: 48,
                flex: 1,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 200 }}>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  School Exam Officer
                </p>
                <p style={{ fontSize: "0.75rem" }}>
                  Name: {examOfficerName || "____________________________"}
                </p>
                <div
                  className="sig-line"
                  style={{
                    borderBottom: "1px solid #000",
                    marginTop: 24,
                    marginBottom: 4,
                  }}
                />
                <p style={{ fontSize: "0.72rem" }}>
                  Signature &amp; Date: {examOfficerDate || "______________"}
                </p>
              </div>
              <div style={{ minWidth: 200 }}>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Dean of School/Faculty
                </p>
                <p style={{ fontSize: "0.75rem" }}>
                  Name: {deanName || "____________________________"}
                </p>
                <div
                  className="sig-line"
                  style={{
                    borderBottom: "1px solid #000",
                    marginTop: 24,
                    marginBottom: 4,
                  }}
                />
                <p style={{ fontSize: "0.72rem" }}>
                  Signature &amp; Date: {deanDate || "______________"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page footer */}
      <div
        className="print-page-footer"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          borderTop: "1px solid #000",
          marginTop: 12,
          paddingTop: 4,
          fontFamily: "serif",
        }}
      >
        <span>{acronym} MIS</span>
        <span>Printed on: {printedAt}</span>
        <span>
          Page {pageNum} of {totalPages}
        </span>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "4px 6px",
  textAlign: "center",
  fontWeight: 700,
  backgroundColor: "#e8e8e8",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "3px 5px",
  verticalAlign: "top",
};

const tdCenterStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: "center",
  whiteSpace: "pre-line",
};

// ── Main component ────────────────────────────────────────────────────────────

export function PassFailureLists({
  userRole: _userRole = "admin",
}: PassFailureListsProps) {
  const institution = useMemo(() => loadInstitutionProfile(), []);
  const acronym = useMemo(
    () => deriveAcronym(institution.name),
    [institution.name],
  );

  const [session, setSession] = useState(SESSIONS[0]);
  const [level, setLevel] = useState("3");
  const [deptKey, setDeptKey] = useState(DEPARTMENTS[0].key);
  const [printMode, setPrintMode] = useState<"none" | "pass" | "failure">(
    "none",
  );

  const [examOfficerName, setExamOfficerName] = useState("");
  const [examOfficerDate, setExamOfficerDate] = useState("");
  const [deanName, setDeanName] = useState("");
  const [deanDate, setDeanDate] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  const dept = DEPARTMENTS.find((d) => d.key === deptKey) ?? DEPARTMENTS[0];
  const allRows = SAMPLE_DATA[deptKey] ?? [];
  const passRows = allRows.filter((r) => r.remark === "PROMOTED");
  const failRows = allRows.filter((r) => r.remark !== "PROMOTED");

  const printedAt = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  function chunkRows(rows: StudentRow[]): StudentRow[][] {
    const chunks: StudentRow[][] = [];
    for (let i = 0; i < rows.length; i += PAGE_ROWS) {
      chunks.push(rows.slice(i, i + PAGE_ROWS));
    }
    if (chunks.length === 0) chunks.push([]);
    return chunks;
  }

  const passChunks = chunkRows(passRows);
  const failChunks = chunkRows(failRows);

  function handlePrint(type: "pass" | "failure") {
    setPrintMode(type);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode("none"), 500);
    }, 100);
  }

  const passCount = passRows.length;
  const failCount = failRows.length;
  const totalCount = allRows.length;

  const renderDocument = (listType: "PASS" | "FAILURE") => {
    const chunks = listType === "PASS" ? passChunks : failChunks;
    const rows = listType === "PASS" ? passRows : failRows;
    return chunks.map((chunk, i) => (
      <div key={`${listType}-page-${String(i + 1)}`}>
        {i > 0 && (
          <div className="print-page-break" style={{ breakBefore: "page" }} />
        )}
        <DocPage
          institution={institution}
          acronym={acronym}
          session={session}
          level={level}
          dept={dept}
          rows={chunk}
          listType={listType}
          pageNum={i + 1}
          totalPages={chunks.length}
          printedAt={printedAt}
          isLastPage={i === chunks.length - 1}
          examOfficerName={examOfficerName}
          examOfficerDate={examOfficerDate}
          deanName={deanName}
          deanDate={deanDate}
          allRows={rows}
        />
      </div>
    ));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Inject print styles */}
      <style>{PRINT_CSS}</style>

      {/* Screen UI */}
      <div className="no-print">
        <div className="flex items-center gap-3 mb-6">
          <ListChecks className="text-blue-700" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pass &amp; Failure Lists
            </h1>
            <p className="text-sm text-gray-500">
              Formal graduating students result lists — printable per department
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Filters &amp; Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-xs mb-1 block">Session</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger data-ocid="passlist.session.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger data-ocid="passlist.level.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {getLevelLabel(institution.institutionType, l.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">
                  Department / Subject Combination
                </Label>
                <Select value={deptKey} onValueChange={setDeptKey}>
                  <SelectTrigger data-ocid="passlist.dept.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label} ({d.abbr})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Signature fields */}
            <div className="border-t pt-4 mt-2">
              <p className="text-xs font-semibold text-gray-600 mb-3">
                Signature Information (appears on printed documents)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">
                    School Exam Officer Name
                  </Label>
                  <Input
                    data-ocid="passlist.examofficer.input"
                    value={examOfficerName}
                    onChange={(e) => setExamOfficerName(e.target.value)}
                    placeholder="e.g. Dr. A. Musa"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">
                    Exam Officer Date
                  </Label>
                  <Input
                    data-ocid="passlist.examofficerdate.input"
                    value={examOfficerDate}
                    onChange={(e) => setExamOfficerDate(e.target.value)}
                    placeholder="e.g. 01/04/2025"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">
                    Dean of School/Faculty Name
                  </Label>
                  <Input
                    data-ocid="passlist.dean.input"
                    value={deanName}
                    onChange={(e) => setDeanName(e.target.value)}
                    placeholder="e.g. Prof. B. Aliyu"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Dean Date</Label>
                  <Input
                    data-ocid="passlist.deandate.input"
                    value={deanDate}
                    onChange={(e) => setDeanDate(e.target.value)}
                    placeholder="e.g. 01/04/2025"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 text-sm font-medium">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-gray-800">{totalCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm font-medium">
            <FileCheck size={14} className="text-green-600" />
            <span className="text-green-700">Passed: {passCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-sm font-medium">
            <span className="text-red-600 font-bold text-xs">✗</span>
            <span className="text-red-700">Failed/Probation: {failCount}</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              data-ocid="passlist.print_pass.button"
              onClick={() => handlePrint("pass")}
              className="bg-green-700 hover:bg-green-800 text-white text-sm gap-2"
            >
              <Printer size={15} /> Print Pass List
            </Button>
            <Button
              data-ocid="passlist.print_failure.button"
              onClick={() => handlePrint("failure")}
              className="bg-red-700 hover:bg-red-800 text-white text-sm gap-2"
            >
              <Printer size={15} /> Print Failure List
            </Button>
          </div>
        </div>

        {/* Screen preview tabs */}
        <Tabs defaultValue="pass">
          <TabsList data-ocid="passlist.tab">
            <TabsTrigger value="pass" data-ocid="passlist.pass.tab">
              Pass List ({passCount})
            </TabsTrigger>
            <TabsTrigger value="failure" data-ocid="passlist.failure.tab">
              Failure List ({failCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pass">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <div className="p-4">{renderDocument("PASS")}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failure">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <div className="p-4">{renderDocument("FAILURE")}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print area — shown only when printing */}
      <div
        id="pass-fail-print-area"
        ref={printRef}
        style={{ display: printMode === "none" ? "none" : "block" }}
        className="print-only"
      >
        {printMode === "pass" && renderDocument("PASS")}
        {printMode === "failure" && renderDocument("FAILURE")}
      </div>
    </div>
  );
}
