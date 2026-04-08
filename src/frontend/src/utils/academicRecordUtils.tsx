import { getLocalResults } from "./sampleData";
import type { StudentRecord } from "./sampleData";

// ─────────────────────────────────────────────────────────────────────────────
// Course structure definitions
// ─────────────────────────────────────────────────────────────────────────────

export const GSE_COURSES = {
  level100: [
    { code: "111", title: "Communication Skills", credit: "1C" },
    { code: "112", title: "Use of English", credit: "1C" },
    { code: "113", title: "Logic & Critical Thinking", credit: "1C" },
    { code: "121", title: "Intro to Computing", credit: "2C" },
    { code: "122", title: "Nigerian Peoples & Culture", credit: "1C" },
    { code: "123", title: "Peace & Conflict Res", credit: "1C" },
    { code: "124", title: "Entrepreneurship", credit: "2C" },
  ],
  level200: [
    { code: "211", title: "Edu Psychology", credit: "1C" },
    { code: "212", title: "Sociology II", credit: "2C" },
    { code: "213", title: "Curriculum Dev", credit: "1C" },
    { code: "221", title: "Teaching Methods", credit: "2C" },
    { code: "222", title: "Research Methods", credit: "1C" },
    { code: "223", title: "Counseling", credit: "1C" },
    { code: "224", title: "Special Edu", credit: "1C" },
  ],
  level300: [
    { code: "321", title: "Advanced Teaching", credit: "1C" },
    { code: "322", title: "School Admin", credit: "1C" },
    { code: "323", title: "Seminar", credit: "1E" },
    { code: "324", title: "Research Project", credit: "1E" },
  ],
};

const EDU_COURSES = {
  level100: [
    {
      prefix: "EDU",
      code: "111",
      title: "Foundation of Education",
      credit: "1C",
    },
    { prefix: "EDU", code: "112", title: "Child Psychology", credit: "1C" },
    { prefix: "EDU", code: "113", title: "Teaching Practice 1", credit: "1C" },
    { prefix: "EDU", code: "121", title: "Curriculum Studies", credit: "1C" },
    { prefix: "EDU", code: "122", title: "Measurement & Eval", credit: "1C" },
    { prefix: "EDU", code: "123", title: "Educational Tech", credit: "1C" },
    { prefix: "EDU", code: "124", title: "Philosophy of Edu", credit: "2C" },
    { prefix: "EDU", code: "125", title: "Sociology of Edu", credit: "2C" },
  ],
  level200: [
    { prefix: "EDU", code: "211", title: "Edu Psychology", credit: "1C" },
    { prefix: "EDU", code: "212", title: "Sociology II", credit: "2C" },
    { prefix: "EDU", code: "213", title: "Curriculum Dev", credit: "1C" },
    { prefix: "EDU", code: "221", title: "Teaching Methods", credit: "2C" },
    { prefix: "EDU", code: "222", title: "Research Methods", credit: "1C" },
    { prefix: "EDU", code: "223", title: "Counseling", credit: "1C" },
    { prefix: "EDU", code: "224", title: "Special Edu", credit: "1C" },
    { prefix: "EDU", code: "225", title: "Edu Admin", credit: "2C" },
  ],
  level300: [
    { prefix: "EDU", code: "311", title: "Advanced Teaching", credit: "6C" },
    {
      prefix: "EDU",
      code: "321",
      title: "Teaching Practice III",
      credit: "1C",
    },
    { prefix: "EDU", code: "322", title: "Project Studies", credit: "1C" },
    { prefix: "EDU", code: "323", title: "Seminar", credit: "1C" },
    { prefix: "EDU", code: "324", title: "School Admin", credit: "1E" },
    { prefix: "EDU", code: "325", title: "Research Project", credit: "1E" },
  ],
};

const CSC_COURSES = {
  level100: [
    {
      prefix: "CSC",
      code: "111",
      title: "Intro to Computer Science",
      credit: "1C",
    },
    {
      prefix: "CSC",
      code: "112",
      title: "Programming Fundamentals",
      credit: "2C",
    },
    { prefix: "CSC", code: "121", title: "Discrete Mathematics", credit: "1C" },
    {
      prefix: "CSC",
      code: "122",
      title: "Computer Architecture",
      credit: "1C",
    },
  ],
  level200: [
    { prefix: "CSC", code: "211", title: "Data Structures", credit: "1C" },
    { prefix: "CSC", code: "212", title: "OOP", credit: "1C" },
    { prefix: "CSC", code: "221", title: "Database Systems", credit: "2C" },
    { prefix: "CSC", code: "222", title: "Algorithms", credit: "1C" },
  ],
  level300: [
    { prefix: "CSC", code: "311", title: "Software Engineering", credit: "2C" },
    { prefix: "CSC", code: "321", title: "Computer Networks", credit: "1C" },
    { prefix: "CSC", code: "322", title: "AI Intro", credit: "1C" },
    { prefix: "CSC", code: "323", title: "Capstone Project", credit: "1E" },
  ],
};

const MAT_COURSES = {
  level100: [
    { prefix: "MAT", code: "111", title: "Calculus I", credit: "2C" },
    { prefix: "MAT", code: "112", title: "Algebra", credit: "1C" },
    { prefix: "MAT", code: "121", title: "Statistics I", credit: "1C" },
  ],
  level200: [
    { prefix: "MAT", code: "211", title: "Calculus II", credit: "2C" },
    { prefix: "MAT", code: "212", title: "Linear Algebra", credit: "1C" },
  ],
  level300: [
    { prefix: "MAT", code: "311", title: "Real Analysis", credit: "2C" },
    { prefix: "MAT", code: "321", title: "Numerical Methods", credit: "1C" },
  ],
};

const PHY_COURSES = {
  level100: [
    { prefix: "PHY", code: "111", title: "Mechanics", credit: "2C" },
    { prefix: "PHY", code: "112", title: "Optics", credit: "1C" },
  ],
  level200: [
    { prefix: "PHY", code: "211", title: "Electromagnetism", credit: "2C" },
    { prefix: "PHY", code: "212", title: "Thermodynamics", credit: "1C" },
  ],
  level300: [
    { prefix: "PHY", code: "311", title: "Modern Physics", credit: "6C" },
    { prefix: "PHY", code: "321", title: "Quantum Mechanics", credit: "1C" },
  ],
};

const CHE_COURSES = {
  level100: [
    { prefix: "CHE", code: "111", title: "General Chemistry", credit: "2C" },
    { prefix: "CHE", code: "112", title: "Organic Chemistry", credit: "1C" },
  ],
  level200: [
    { prefix: "CHE", code: "211", title: "Physical Chemistry", credit: "2C" },
    { prefix: "CHE", code: "212", title: "Analytical Chemistry", credit: "1C" },
  ],
  level300: [
    { prefix: "CHE", code: "311", title: "Industrial Chemistry", credit: "6C" },
    { prefix: "CHE", code: "321", title: "Biochemistry", credit: "1C" },
  ],
};

// B.Sc (Ed) Chemistry — FUEK official course structure (100–400 Level)
const CHM_COURSES = {
  level100: [
    {
      prefix: "GST",
      code: "111",
      title: "Communication in English",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "113",
      title: "Use of Library and Study Skills",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "101",
      title: "Introduction to Teaching and Foundations of Education",
      credit: "2C",
    },
    { prefix: "BIO", code: "101", title: "General Biology I", credit: "2C" },
    {
      prefix: "BIO",
      code: "107",
      title: "General Biology Practical I",
      credit: "1C",
    },
    { prefix: "CHM", code: "101", title: "General Chemistry I", credit: "2C" },
    {
      prefix: "CHM",
      code: "107",
      title: "General Chemistry Practical I",
      credit: "1C",
    },
    {
      prefix: "MTH",
      code: "101",
      title: "General Mathematics I",
      credit: "2C",
    },
    {
      prefix: "COS",
      code: "101",
      title: "Introduction to Computer Science",
      credit: "3C",
    },
    { prefix: "PHY", code: "101", title: "General Physics I", credit: "2C" },
    {
      prefix: "PHY",
      code: "107",
      title: "General Physics Practical I",
      credit: "1C",
    },
    {
      prefix: "GST",
      code: "112",
      title: "Nigerian Peoples and Culture",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "114",
      title: "Communication in Either Arabic or French",
      credit: "1C",
    },
    {
      prefix: "BIO",
      code: "108",
      title: "General Biology Practical II",
      credit: "1C",
    },
    { prefix: "BIO", code: "102", title: "General Biology II", credit: "2C" },
    { prefix: "PHY", code: "102", title: "General Physics II", credit: "2C" },
    { prefix: "CHM", code: "102", title: "General Chemistry II", credit: "2C" },
    {
      prefix: "CHM",
      code: "108",
      title: "General Chemistry Practical II",
      credit: "1C",
    },
    {
      prefix: "SED",
      code: "102",
      title: "Foundations of Science",
      credit: "2C",
    },
    {
      prefix: "MTH",
      code: "102",
      title: "General Mathematics II",
      credit: "2C",
    },
    { prefix: "COS", code: "102", title: "Problem Solving", credit: "3C" },
  ],
  level200: [
    {
      prefix: "ENT",
      code: "211",
      title: "Entrepreneurship and Innovation",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "201",
      title: "Curriculum, Curriculum Delivery and Teaching Methods",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "203",
      title: "Educational Technology and Artificial Intelligence",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "207",
      title: "General Chemistry Practical III",
      credit: "1C",
    },
    { prefix: "CHM", code: "211", title: "Organic Chemistry I", credit: "2C" },
    {
      prefix: "CHM",
      code: "213",
      title: "Analytical Chemistry I",
      credit: "2C",
    },
    { prefix: "PHY", code: "205", title: "Thermal Physics", credit: "2C" },
    { prefix: "BIO", code: "201", title: "Genetics I", credit: "2C" },
    {
      prefix: "COS",
      code: "201",
      title: "Computer Programming I",
      credit: "3C",
    },
    {
      prefix: "GST",
      code: "212",
      title: "Philosophy Logic and Human Existence",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "202",
      title: "Micro Teaching Theory and Practice",
      credit: "2C",
    },
    {
      prefix: "STA",
      code: "202",
      title: "Statistics for Physical Sciences and Engineering",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "208",
      title: "General Chemistry Practical IV",
      credit: "1C",
    },
    { prefix: "CHM", code: "210", title: "Physical Chemistry I", credit: "2C" },
    {
      prefix: "CHM",
      code: "212",
      title: "Inorganic Chemistry I",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "214",
      title: "Structure and Bonding",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "202",
      title: "Introduction to Chemistry Method",
      credit: "2C",
    },
    { prefix: "BIO", code: "206", title: "Hydrobiology", credit: "2C" },
    {
      prefix: "COS",
      code: "202",
      title: "Computer Programming II",
      credit: "3C",
    },
  ],
  level300: [
    { prefix: "EDU", code: "301", title: "Teaching Practice I", credit: "3C" },
    {
      prefix: "EDU",
      code: "303",
      title: "Educational Administration and Planning",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "301",
      title: "Physical Chemistry II",
      credit: "2C",
    },
    { prefix: "CHM", code: "303", title: "Organic Chemistry II", credit: "2C" },
    { prefix: "CHM", code: "305", title: "Petroleum Chemistry", credit: "2C" },
    {
      prefix: "CHM",
      code: "319",
      title: "Environmental Chemistry",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "399",
      title: "Industrial Attachment II (12 Weeks)",
      credit: "3C",
    },
    {
      prefix: "SED",
      code: "301",
      title: "Research Methodology and Data Analysis",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "303",
      title: "Entrepreneurship in Chemistry Education",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "312",
      title: "Peace and Conflict Resolution",
      credit: "2C",
    },
    { prefix: "ENT", code: "312", title: "Venture Creation", credit: "2C" },
    {
      prefix: "EDU",
      code: "302",
      title: "Educational Measurements Tests Research Methods and Statistics",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "302",
      title: "Inorganic Chemistry II",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "304",
      title: "Atomic and Molecular Structure and Symmetry",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "312",
      title: "Analytical Atomic Spectroscopy",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "314",
      title: "Entrepreneurship Skill in Chemistry",
      credit: "2C",
    },
    { prefix: "CHM", code: "316", title: "Applied Spectroscopy", credit: "2C" },
    { prefix: "SED", code: "302", title: "Chemistry Methods II", credit: "2C" },
  ],
  level400: [
    { prefix: "EDU", code: "401", title: "Teaching Practice II", credit: "3C" },
    {
      prefix: "CHM",
      code: "409",
      title: "Chemistry Practical V",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "423",
      title: "Organometallic Chemistry",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "425",
      title: "Advanced Organic Reaction Mechanism",
      credit: "3C",
    },
    { prefix: "CHM", code: "427", title: "Polymer Chemistry II", credit: "2C" },
    {
      prefix: "CHM",
      code: "429",
      title: "Chemistry of Industrial Raw Material",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "401",
      title: "Seminar in Chemistry and Chemistry Education",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "403",
      title: "Primary and Integrated Science Programme",
      credit: "2C",
    },
    { prefix: "EDU", code: "400", title: "Project", credit: "3C" },
    {
      prefix: "EDU",
      code: "402",
      title: "Guidance and Counseling",
      credit: "2C",
    },
    { prefix: "CHM", code: "406", title: "Reaction Kinetics", credit: "2C" },
    {
      prefix: "CHM",
      code: "410",
      title: "Analytical Chemistry II",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "422",
      title: "Inorganic Reaction Mechanism",
      credit: "3C",
    },
    {
      prefix: "CHM",
      code: "424",
      title: "Co-ordination Chemistry",
      credit: "2C",
    },
    {
      prefix: "CHM",
      code: "426",
      title: "Natural Product Chemistry",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "402",
      title: "Organization and Management of Chemistry Laboratory",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "404",
      title: "Science Technology and Society",
      credit: "2C",
    },
  ],
};

// B.Sc (Ed) Integrated Science — FUEK official course structure (100–400 Level)
const EIS_COURSES = {
  level100: [
    {
      prefix: "GST",
      code: "111",
      title: "Communication in English",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "101",
      title: "Introduction to Teaching and Foundations of Education",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "113",
      title: "Use of Library and Study Skills",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "101",
      title: "Introduction to Science and Integrated Science Education",
      credit: "2C",
    },
    { prefix: "BIO", code: "101", title: "General Biology I", credit: "2C" },
    {
      prefix: "BIO",
      code: "107",
      title: "General Biology Practical I",
      credit: "1C",
    },
    {
      prefix: "CSC",
      code: "101",
      title: "Introduction to Computer Science",
      credit: "3C",
    },
    {
      prefix: "CHM",
      code: "101",
      title: "General Chemistry I (Inorganic)",
      credit: "2C",
    },
    {
      prefix: "MTH",
      code: "101",
      title: "General Mathematics I",
      credit: "2C",
    },
    { prefix: "PHY", code: "101", title: "General Mechanics I", credit: "2C" },
    {
      prefix: "PHY",
      code: "103",
      title: "General Physics III (Behaviour of Matter)",
      credit: "2C",
    },
    {
      prefix: "GEY",
      code: "101",
      title: "Introduction to Geology I",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "112",
      title: "Nigerian Peoples and Culture",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "114",
      title: "Communication in Arabic or French",
      credit: "1C",
    },
    { prefix: "BIO", code: "102", title: "General Biology II", credit: "2C" },
    {
      prefix: "BIO",
      code: "108",
      title: "General Biology Practical II",
      credit: "1C",
    },
    {
      prefix: "CHM",
      code: "102",
      title: "General Chemistry II (Organic Chemistry)",
      credit: "2C",
    },
    {
      prefix: "PHY",
      code: "102",
      title: "General Physics II (Electricity and Magnetism)",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "102",
      title: "Integrated Science Practical I",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "104",
      title: "Matter (Metals and Non-Metals)",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "102",
      title: "Foundation of Science",
      credit: "2C",
    },
  ],
  level200: [
    {
      prefix: "ENT",
      code: "211",
      title: "Entrepreneurship and Innovation",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "201",
      title: "Curriculum, Curriculum Delivery and General Teaching Methods",
      credit: "2C",
    },
    {
      prefix: "EDU",
      code: "203",
      title: "Educational Technology and Artificial Intelligence",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "235",
      title: "Special Methods in Teaching Integrated Science I",
      credit: "2C",
    },
    { prefix: "BIO", code: "201", title: "Genetics I", credit: "2C" },
    { prefix: "BIO", code: "203", title: "General Physiology", credit: "2C" },
    {
      prefix: "CHM",
      code: "213",
      title: "Analytical Chemistry I",
      credit: "2C",
    },
    { prefix: "BCH", code: "201", title: "General Biochemistry", credit: "2C" },
    { prefix: "MCB", code: "221", title: "General Microbiology", credit: "2C" },
    { prefix: "EIS", code: "205", title: "Origin of Life", credit: "2C" },
    {
      prefix: "EDU",
      code: "202",
      title: "Micro Teaching Theory and Practice",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "212",
      title: "Philosophy Logic and Human Existence",
      credit: "2C",
    },
    { prefix: "BIO", code: "202", title: "Introductory Ecology", credit: "2C" },
    {
      prefix: "BIO",
      code: "204",
      title: "Biological Techniques",
      credit: "2C",
    },
    { prefix: "BIO", code: "206", title: "Hydrobiology", credit: "2C" },
    {
      prefix: "EIS",
      code: "202",
      title: "Man and the Environment",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "204",
      title: "Study Skills and Communication in Science",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "208",
      title: "Integrated Science Practical II",
      credit: "2C",
    },
  ],
  level300: [
    { prefix: "EDU", code: "301", title: "Teaching Practice I", credit: "3C" },
    {
      prefix: "EDU",
      code: "303",
      title: "Educational Administration and Planning",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "335",
      title: "Special Methods in Teaching Integrated Science II",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "311",
      title: "Entrepreneurship in Integrated Science",
      credit: "2C",
    },
    { prefix: "BIO", code: "301", title: "Genetics II", credit: "2C" },
    {
      prefix: "BIO",
      code: "303",
      title: "Biogeography and Soil Biology",
      credit: "2C",
    },
    {
      prefix: "ICH",
      code: "317",
      title: "Industrial Raw Materials Resource Inventory",
      credit: "1C",
    },
    {
      prefix: "CHM",
      code: "319",
      title: "Environmental Chemistry",
      credit: "2C",
    },
    { prefix: "EIS", code: "303", title: "Carbon Compounds", credit: "2C" },
    {
      prefix: "SED",
      code: "305",
      title: "Computer Application in Science Education",
      credit: "2C",
    },
    {
      prefix: "SED",
      code: "301",
      title: "Research Methods and Data Analysis",
      credit: "2C",
    },
    {
      prefix: "GST",
      code: "312",
      title: "Peace and Conflict Resolution",
      credit: "2C",
    },
    { prefix: "ENT", code: "312", title: "Venture Creation", credit: "2C" },
    {
      prefix: "EDU",
      code: "302",
      title: "Educational Measurements Tests Research Methods and Statistics",
      credit: "3C",
    },
    {
      prefix: "BIO",
      code: "302",
      title: "Population Biology and Evolution",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "302",
      title: "Fields and Mechanical Waves",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "304",
      title: "Electrochemical Science",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "306",
      title: "Integrated Science Laboratory Organization and Management",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "308",
      title: "Integrated Science Practical III",
      credit: "2C",
    },
  ],
  level400: [
    { prefix: "EDU", code: "401", title: "Teaching Practice II", credit: "3C" },
    {
      prefix: "EIS",
      code: "401",
      title: "Teaching for Basic Science Core-Curriculum",
      credit: "3C",
    },
    {
      prefix: "EIS",
      code: "411",
      title: "Science in Everyday Life",
      credit: "3C",
    },
    {
      prefix: "EIS",
      code: "413",
      title: "Nature and Continuity in Life",
      credit: "3C",
    },
    {
      prefix: "SED",
      code: "401",
      title: "Seminar in Science and Science Education",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "415",
      title: "Waves Technology and Health",
      credit: "2C",
    },
    { prefix: "EDU", code: "400", title: "Project", credit: "3C" },
    {
      prefix: "EDU",
      code: "402",
      title: "Guidance and Counselling",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "402",
      title: "Integrated Science Programmes",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "404",
      title: "Geoscience and Lunar Exploration",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "406",
      title: "Environmental Science",
      credit: "2C",
    },
    {
      prefix: "EIS",
      code: "412",
      title: "Science Society and Technology",
      credit: "3C",
    },
    {
      prefix: "EIS",
      code: "414",
      title: "Integrated Science Workshop",
      credit: "2C",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Level label helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getInstitutionLevelLabel(
  institutionType: string,
  levelIndex: number,
): string {
  if (
    institutionType === "college_of_education" ||
    institutionType === "College of Education"
  ) {
    return (
      ["NCE I", "NCE II", "NCE III"][levelIndex] ?? `NCE ${levelIndex + 1}`
    );
  }
  if (institutionType === "polytechnic" || institutionType === "Polytechnic") {
    return (
      ["ND I", "ND II", "HND I", "HND II"][levelIndex] ??
      `Level ${levelIndex + 1}`
    );
  }
  // university (default)
  return (
    [
      "Year 1 (100 Level)",
      "Year 2 (200 Level)",
      "Year 3 (300 Level)",
      "Year 4 (400 Level)",
    ][levelIndex] ?? `Year ${levelIndex + 1}`
  );
}

export function getLevelSummaryLabel(
  institutionType: string,
  levelIndex: number,
): string {
  if (
    institutionType === "college_of_education" ||
    institutionType === "College of Education"
  ) {
    return (
      ["NCE I", "NCE II", "NCE III"][levelIndex] ?? `NCE ${levelIndex + 1}`
    );
  }
  if (institutionType === "polytechnic" || institutionType === "Polytechnic") {
    return (
      ["ND I", "ND II", "HND I", "HND II"][levelIndex] ??
      `Level ${levelIndex + 1}`
    );
  }
  return (
    ["Year 1 Summary", "Year 2 Summary", "Year 3 Summary", "Year 4 Summary"][
      levelIndex
    ] ?? `Year ${levelIndex + 1} Summary`
  );
}

export function getLevelColumnHeader(
  institutionType: string,
  levelIndex: number,
): string {
  if (
    institutionType === "college_of_education" ||
    institutionType === "College of Education"
  ) {
    const levels = ["100 LEVEL", "200 LEVEL", "300 LEVEL"];
    return levels[levelIndex] ?? `LEVEL ${levelIndex + 1}`;
  }
  if (institutionType === "polytechnic" || institutionType === "Polytechnic") {
    return (
      ["ND I", "ND II", "HND I", "HND II"][levelIndex] ??
      `Level ${levelIndex + 1}`
    );
  }
  return (
    ["100 LEVEL", "200 LEVEL", "300 LEVEL", "400 LEVEL"][levelIndex] ??
    `LEVEL ${levelIndex + 1}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Build course list for a student based on institution type and combination
// ─────────────────────────────────────────────────────────────────────────────

type CourseEntry = {
  prefix: string;
  code: string;
  credit: string;
  title?: string;
};

function levelKey(
  levelIndex: number,
): "level100" | "level200" | "level300" | "level400" {
  if (levelIndex === 0) return "level100";
  if (levelIndex === 1) return "level200";
  if (levelIndex === 2) return "level300";
  return "level400";
}

export function getCoursesForLevel(
  institutionType: string,
  department: string,
  levelIndex: number,
  subCombination?: string,
): CourseEntry[] {
  if (
    institutionType === "college_of_education" ||
    institutionType === "College of Education"
  ) {
    const courses: CourseEntry[] = [];
    const lk3: "level100" | "level200" | "level300" =
      levelIndex === 0
        ? "level100"
        : levelIndex === 1
          ? "level200"
          : "level300";
    // Always include EDU courses
    const eduLevel = EDU_COURSES[lk3] ?? [];
    for (const c of eduLevel) {
      courses.push({
        prefix: c.prefix,
        code: c.code,
        credit: c.credit,
        title: c.title,
      });
    }
    // GSE courses at 100 level only
    if (levelIndex === 0) {
      for (const c of GSE_COURSES.level100) {
        courses.push({
          prefix: "GSE",
          code: c.code,
          credit: c.credit,
          title: (c as { title?: string }).title,
        });
      }
    }
    // Subject combination
    if (subCombination) {
      const parts = subCombination.split("/");
      for (const part of parts) {
        const subj = part.trim().toUpperCase();
        const lk3: "level100" | "level200" | "level300" =
          levelIndex === 0
            ? "level100"
            : levelIndex === 1
              ? "level200"
              : "level300";
        const map: Record<
          string,
          Record<
            "level100" | "level200" | "level300",
            { prefix: string; code: string; credit: string; title: string }[]
          >
        > = {
          CSC: CSC_COURSES,
          MAT: MAT_COURSES,
          PHY: PHY_COURSES,
          CHE: CHE_COURSES,
        };
        const subCourses = map[subj]?.[lk3] ?? [];
        for (const c of subCourses) {
          courses.push({
            prefix: c.prefix,
            code: c.code,
            credit: c.credit,
            title: c.title,
          });
        }
      }
    }
    return courses;
  }

  if (institutionType === "polytechnic" || institutionType === "Polytechnic") {
    // Generic poly courses keyed by department prefix
    const deptMap: Record<string, string> = {
      "Computer Science": "COM",
      "Business Administration": "BUS",
      "Electrical/Electronics": "EEC",
      "Mechanical Engineering": "MEC",
      Accountancy: "ACC",
    };
    const prefix =
      deptMap[department] ?? department.substring(0, 3).toUpperCase();
    const levelCodes =
      levelIndex === 0
        ? ["101", "102", "103"]
        : levelIndex === 1
          ? ["201", "202", "203", "204"]
          : levelIndex === 2
            ? ["301", "302", "303"]
            : ["401", "402", "499"];
    return levelCodes.map((c) => ({ prefix, code: c, credit: "3C" }));
  }

  // University – generic course codes, with FUEK BSc-Ed department overrides
  if (department === "Chemistry") {
    const lk4 = levelKey(levelIndex);
    const courses = CHM_COURSES[lk4] ?? CHM_COURSES.level100;
    return courses.map((c) => ({
      prefix: c.prefix,
      code: c.code,
      credit: c.credit,
      title: c.title,
    }));
  }
  if (department === "Integrated Science") {
    const lk4 = levelKey(levelIndex);
    const courses = EIS_COURSES[lk4] ?? EIS_COURSES.level100;
    return courses.map((c) => ({
      prefix: c.prefix,
      code: c.code,
      credit: c.credit,
      title: c.title,
    }));
  }
  const deptMap: Record<string, string> = {
    "Computer Science": "CSC",
    Engineering: "ENG",
    Medicine: "MED",
    Law: "LAW",
  };
  const prefix =
    deptMap[department] ?? department.substring(0, 3).toUpperCase();
  const levelBase = (levelIndex + 1) * 100;
  return ["01", "02", "03", "04", "99"].map((_s, idx) => ({
    prefix,
    code: `${levelBase + idx + 1}`,
    credit: idx === 4 ? "6C" : "3C",
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade helpers
// ─────────────────────────────────────────────────────────────────────────────

export function gradeToGP(grade: string): number {
  const map: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  return map[grade] ?? 0;
}

export function cgpaToClass(cgpa: number): string {
  if (cgpa >= 4.5) return "Distinction";
  if (cgpa >= 3.5) return "Credit";
  if (cgpa >= 2.5) return "Merit";
  if (cgpa >= 1.5) return "Pass";
  return "Fail";
}

export function cgpaToRemark(cgpa: number): string {
  return cgpa >= 2.0 ? "Proceed" : "Withdraw";
}

// ─────────────────────────────────────────────────────────────────────────────
// Build record data
// ─────────────────────────────────────────────────────────────────────────────

export interface LevelStats {
  label: string;
  levelCode: string;
  prefix: string;
  rows: {
    code: string;
    credit: string;
    score: number | null;
    grade: string;
    gp: number;
    gpa: number | null;
  }[];
  tco: number;
  tcp: number;
  tgp: number;
  gpa: number;
}

export interface SummaryStats {
  tco: number;
  tcp: number;
  tgp: number;
  cgpa: number;
  grade: string;
  remark: string;
}

export interface RecordData {
  levels: LevelStats[];
  summaries: SummaryStats[];
  finalCgpa: number;
  classOfDegree: string;
  institutionType: string;
}

export function buildRecordData(
  student: StudentRecord,
  institutionTypeOverride?: string,
): RecordData {
  const institutionType =
    institutionTypeOverride ?? student.institutionCategory ?? "university";
  const results = getLocalResults();
  const myResults = results.filter(
    (r) => r.studentMatric === student.matricNumber,
  );

  const resultMap: Record<
    string,
    { score: number; grade: string; gp: number }
  > = {};
  for (const r of myResults) {
    const gp = r.gradePoint ?? gradeToGP(r.grade);
    resultMap[r.courseCode] = { score: r.score, grade: r.grade, gp };
  }

  const creditValue = (c: string) =>
    Number.parseInt(c.replace(/[^0-9]/g, "")) || 1;

  // Determine how many levels to show
  let numLevels = 3;
  if (institutionType === "university") numLevels = 4;
  else if (
    institutionType === "polytechnic" ||
    institutionType === "Polytechnic"
  )
    numLevels = 4;

  const levels: LevelStats[] = [];
  for (let i = 0; i < numLevels; i++) {
    const courseDefs = getCoursesForLevel(
      institutionType,
      student.department,
      i,
      student.subCombination,
    );
    let tco = 0;
    let tcp = 0;
    let tgp = 0;
    const rows: LevelStats["rows"] = [];
    for (const c of courseDefs) {
      const fullCode = `${c.prefix}${c.code}`;
      const cv = creditValue(c.credit);
      const res = resultMap[fullCode] ?? null;
      tco += cv;
      if (res && res.grade !== "F" && res.grade !== "") tcp += cv;
      if (res) tgp += res.gp * cv;
      rows.push({
        code: c.code,
        credit: c.credit,
        score: res?.score ?? null,
        grade: res?.grade ?? "",
        gp: res?.gp ?? 0,
        gpa: null,
      });
    }
    const gpa = tco > 0 ? Number.parseFloat((tgp / tco).toFixed(2)) : 0;
    if (rows.length > 0) rows[rows.length - 1].gpa = gpa;
    const prefix =
      courseDefs[0]?.prefix ??
      (institutionType === "college_of_education" ||
      institutionType === "College of Education"
        ? "EDU"
        : "CSC");
    const levelCodes = ["100", "200", "300", "400"];
    levels.push({
      label: getLevelColumnHeader(institutionType, i),
      levelCode: levelCodes[i] ?? String((i + 1) * 100),
      prefix,
      rows,
      tco,
      tcp,
      tgp,
      gpa,
    });
  }

  // Summaries: cumulative up to each level
  const summaries: SummaryStats[] = levels.map((_, i) => {
    const slice = levels.slice(0, i + 1);
    const totalTCO = slice.reduce((a, s) => a + s.tco, 0);
    const totalTCP = slice.reduce((a, s) => a + s.tcp, 0);
    const totalTGP = slice.reduce((a, s) => a + s.gpa * s.tco, 0);
    const cgpa =
      totalTCO > 0 ? Number.parseFloat((totalTGP / totalTCO).toFixed(2)) : 0;
    return {
      tco: totalTCO,
      tcp: totalTCP,
      tgp: Number.parseFloat(totalTGP.toFixed(2)),
      cgpa,
      grade: cgpaToClass(cgpa),
      remark: cgpaToRemark(cgpa),
    };
  });

  const finalCgpa = summaries[summaries.length - 1]?.cgpa ?? 0;
  return {
    levels,
    summaries,
    finalCgpa,
    classOfDegree: cgpaToClass(finalCgpa),
    institutionType,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Print function
// ─────────────────────────────────────────────────────────────────────────────

export function printStudentRecord(
  student: StudentRecord,
  institutionName?: string,
  institutionTypeOverride?: string,
) {
  const data = buildRecordData(student, institutionTypeOverride);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const instName = institutionName ?? "Federal College of Education, Kontagora";
  const instType = data.institutionType;

  const isCoE =
    instType === "college_of_education" || instType === "College of Education";
  const isPoly = instType === "polytechnic" || instType === "Polytechnic";

  const schoolLabel = isCoE
    ? `School of ${student.department}`
    : isPoly
      ? `Department of ${student.department}`
      : `Faculty / Department of ${student.department}`;

  const maxRows = Math.max(...data.levels.map((l) => l.rows.length), 1);

  const makeHeaderCells = () =>
    data.levels
      .map(
        (l) =>
          `<th colspan="6" style="border:1px solid #000;text-align:center;font-weight:bold">${l.label}</th>`,
      )
      .join("");

  const makeSubHeaderCells = () =>
    data.levels
      .map(() =>
        ["COURSES", "CREDIT", "SCORE", "GRADE", "GP", "GPA"]
          .map(
            (h) =>
              `<th style="border:1px solid #000;padding:2px 4px">${h}</th>`,
          )
          .join(""),
      )
      .join("");

  const makePrefixRow = () =>
    data.levels
      .map(
        (l) =>
          `<td style="border:1px solid #000;font-weight:bold;padding:2px 4px">${l.prefix}</td>${[
            0, 1, 2, 3, 4,
          ]
            .map(() => `<td style="border:1px solid #000"></td>`)
            .join("")}`,
      )
      .join("");

  const makeDataRows = () =>
    Array.from({ length: maxRows })
      .map(
        (_, rowIdx) =>
          `<tr>${data.levels
            .map((l) => {
              const r = l.rows[rowIdx];
              return [
                r ? r.code : "",
                r ? r.credit : "",
                r && r.score !== null ? String(r.score) : "",
                r ? r.grade : "",
                r?.grade ? String(r.gp) : "",
                r && r.gpa !== null ? String(r.gpa) : "",
              ]
                .map(
                  (v) =>
                    `<td style="border:1px solid #000;padding:2px 4px;text-align:center">${v}</td>`,
                )
                .join("");
            })
            .join("")}</tr>`,
      )
      .join("");

  const makeTotalRow = () =>
    `<tr>${data.levels
      .map(
        (l) =>
          `<td colspan="2" style="border:1px solid #000;font-weight:600;text-align:center;padding:2px">${l.tco}</td>${[
            0, 1, 2, 3,
          ]
            .map(() => `<td style="border:1px solid #000"></td>`)
            .join("")}`,
      )
      .join("")}</tr>`;

  const ncePanel = (label: string, d: SummaryStats) =>
    `<div style="flex:1"><b><u>${label}</u></b><table style="width:100%;margin-top:4px"><tbody>
      <tr><td style="font-weight:600;width:60px">TCO =</td><td style="border-bottom:1px solid #000">${d.tco}</td></tr>
      <tr><td style="font-weight:600">TCP =</td><td style="border-bottom:1px solid #000">${d.tcp}</td></tr>
      <tr><td style="font-weight:600">TGP =</td><td style="border-bottom:1px solid #000">${d.tgp}</td></tr>
      <tr><td style="font-weight:600">CGPA =</td><td style="border-bottom:1px solid #000">${d.cgpa}</td></tr>
      <tr><td style="font-weight:600">GRADE =</td><td style="border-bottom:1px solid #000">${d.grade}</td></tr>
      <tr><td style="font-weight:600">REMARK =</td><td style="border-bottom:1px solid #000">${d.remark}</td></tr>
    </tbody></table></div>`;

  const panelsHtml = data.levels
    .map((_l, i) =>
      ncePanel(getLevelSummaryLabel(instType, i), data.summaries[i]),
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>Academic Record - ${student.name}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Times New Roman',serif}body{padding:20px;font-size:11px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:2px 4px;font-size:10px;text-align:center}.nce-panels{display:flex;gap:20px;margin-top:16px;font-size:11px}@media print{body{padding:10mm}}</style>
  </head><body>
    <div style="text-align:center;margin-bottom:12px">
      <p style="font-weight:bold;text-transform:uppercase;font-size:13px">${instName}</p>
      <p style="text-transform:uppercase;font-size:10px">${schoolLabel}</p>
      <p style="font-weight:bold;font-size:13px;text-decoration:underline">Student Academic Record</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:11px">
      <div><span style="font-weight:600">NAME: </span><span style="border-bottom:1px solid #000;display:inline-block;min-width:120px">${student.name}</span></div>
      ${student.subCombination ? `<div><span style="font-weight:600">SUB. COMB.: </span><span style="border-bottom:1px solid #000;display:inline-block;min-width:80px">${student.subCombination}</span></div>` : `<div><span style="font-weight:600">DEPARTMENT: </span><span style="border-bottom:1px solid #000;display:inline-block;min-width:100px">${student.department}</span></div>`}
      <div style="margin-top:4px"><span style="font-weight:600">MATRIC NO: </span><span style="border-bottom:1px solid #000;display:inline-block;min-width:120px">${student.matricNumber}</span></div>
    </div>
    <table>
      <thead>
        <tr>${makeHeaderCells()}</tr>
        <tr>${makeSubHeaderCells()}</tr>
        <tr>${makePrefixRow()}</tr>
      </thead>
      <tbody>${makeDataRows()}${makeTotalRow()}</tbody>
    </table>
    <div class="nce-panels">${panelsHtml}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:40px;font-size:11px;border-top:1px solid #ccc;padding-top:12px">
      <div><span style="font-weight:600">Computed By: </span><span style="border-bottom:1px solid #000;display:inline-block;width:120px"></span></div>
      <div><span style="font-weight:600">Signature: </span><span style="border-bottom:1px solid #000;display:inline-block;width:100px"></span></div>
      <div><span style="font-weight:600">Date: </span><span style="border-bottom:1px solid #000;display:inline-block;width:80px">${today}</span></div>
    </div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// InlineRecord component
// ─────────────────────────────────────────────────────────────────────────────

export function InlineRecord({
  matricNumber,
  studentName,
  department,
  institutionType: instTypeProp,
}: {
  matricNumber: string;
  studentName: string;
  department: string;
  institutionType?: string;
}) {
  // Find student from local storage to get full data
  const allStudents = JSON.parse(
    localStorage.getItem("unidigital_students") || "[]",
  ) as StudentRecord[];
  const student =
    allStudents.find((s) => s.matricNumber === matricNumber) ??
    ({
      matricNumber,
      name: studentName,
      email: "",
      level: "300",
      department,
      institutionCategory: instTypeProp as StudentRecord["institutionCategory"],
    } as StudentRecord);

  const data = buildRecordData(student, instTypeProp);
  const instType = data.institutionType;
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const maxRows = Math.max(...data.levels.map((l) => l.rows.length), 1);

  const isCoE =
    instType === "college_of_education" || instType === "College of Education";

  return (
    <div className="bg-white border border-slate-300 rounded-lg p-6 max-w-6xl mx-auto mt-4">
      {/* Header */}
      <div className="text-center mb-4 space-y-0.5">
        <p className="font-bold text-sm uppercase tracking-wide">
          Student Academic Record
        </p>
        <p className="text-xs text-slate-600">{department}</p>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-x-6 mb-3 text-xs">
        <div className="flex gap-2">
          <span className="font-semibold uppercase">Name:</span>
          <span className="border-b border-slate-400 flex-1 min-w-0">
            {studentName}
          </span>
        </div>
        {isCoE && student.subCombination ? (
          <div className="flex gap-2">
            <span className="font-semibold uppercase">Sub. Comb.:</span>
            <span className="border-b border-slate-400 flex-1 min-w-0">
              {student.subCombination}
            </span>
          </div>
        ) : (
          <div className="flex gap-2">
            <span className="font-semibold uppercase">Department:</span>
            <span className="border-b border-slate-400 flex-1 min-w-0">
              {department}
            </span>
          </div>
        )}
        <div className="flex gap-2 mt-1">
          <span className="font-semibold uppercase">Matric No:</span>
          <span className="border-b border-slate-400 flex-1 min-w-0">
            {matricNumber}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-[9px]"
          style={{ minWidth: 800 }}
        >
          <thead>
            <tr>
              {data.levels.map((l) => (
                <th
                  key={l.label}
                  colSpan={6}
                  className="border border-slate-700 text-center py-1 font-bold"
                >
                  {l.label}
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50">
              {data.levels.flatMap((l) =>
                ["COURSES", "CREDIT", "SCORE", "GRADE", "GP", "GPA"].map(
                  (h) => (
                    <th
                      key={`${l.label}-${h}`}
                      className="border border-slate-700 px-1 py-0.5 text-center font-semibold"
                    >
                      {h}
                    </th>
                  ),
                ),
              )}
            </tr>
            <tr>
              {data.levels.map((l) => (
                <>
                  <td
                    key={`${l.label}-prefix`}
                    className="border border-slate-700 px-1 py-0.5 font-bold text-center"
                  >
                    {l.prefix}
                  </td>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <td
                      key={`${l.label}-e${k}`}
                      className="border border-slate-700"
                    />
                  ))}
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_u, rowIdx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: row index is stable
              <tr key={rowIdx}>
                {data.levels.flatMap((l) => {
                  const r = l.rows[rowIdx];
                  return [
                    <td
                      key={`${l.label}-${rowIdx}-code`}
                      className="border border-slate-700 px-1 py-0.5 text-center"
                    >
                      {r ? r.code : ""}
                    </td>,
                    <td
                      key={`${l.label}-${rowIdx}-cred`}
                      className="border border-slate-700 px-1 text-center"
                    >
                      {r ? r.credit : ""}
                    </td>,
                    <td
                      key={`${l.label}-${rowIdx}-score`}
                      className="border border-slate-700 px-1 text-center"
                    >
                      {r && r.score !== null ? r.score : ""}
                    </td>,
                    <td
                      key={`${l.label}-${rowIdx}-grade`}
                      className="border border-slate-700 px-1 text-center"
                    >
                      {r ? r.grade : ""}
                    </td>,
                    <td
                      key={`${l.label}-${rowIdx}-gp`}
                      className="border border-slate-700 px-1 text-center"
                    >
                      {r?.grade ? r.gp : ""}
                    </td>,
                    <td
                      key={`${l.label}-${rowIdx}-gpa`}
                      className="border border-slate-700 px-1 text-center"
                    >
                      {r && r.gpa !== null ? r.gpa : ""}
                    </td>,
                  ];
                })}
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              {data.levels.flatMap((l) => [
                <td
                  key={`${l.label}-tco`}
                  colSpan={2}
                  className="border border-slate-700 px-1 py-1 text-center"
                >
                  {l.tco}
                </td>,
                <td
                  key={`${l.label}-tc1`}
                  className="border border-slate-700 px-1"
                />,
                <td
                  key={`${l.label}-tc2`}
                  className="border border-slate-700 px-1"
                />,
                <td
                  key={`${l.label}-tc3`}
                  className="border border-slate-700 px-1"
                />,
                <td
                  key={`${l.label}-tc4`}
                  className="border border-slate-700 px-1"
                />,
              ])}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Panels */}
      <div
        className="grid gap-4 mt-4 text-xs"
        style={{ gridTemplateColumns: `repeat(${data.levels.length}, 1fr)` }}
      >
        {data.levels.map((l, i) => {
          const summary = data.summaries[i];
          const panelLabel = getLevelSummaryLabel(instType, i);
          return (
            <div key={l.label}>
              <p className="font-bold underline text-sm mb-1">{panelLabel}</p>
              <table className="w-full border-collapse">
                <tbody>
                  {(
                    ["TCO", "TCP", "TGP", "CGPA", "GRADE", "REMARK"] as const
                  ).map((k) => (
                    <tr key={k}>
                      <td className="py-0.5 pr-1 font-semibold w-16">{k} =</td>
                      <td className="py-0.5 border-b border-slate-400">
                        {String(summary[k.toLowerCase() as keyof SummaryStats])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-xs border-t border-slate-300 pt-3">
        <div>
          <span className="font-semibold uppercase">Computed By: </span>
          <span className="border-b border-slate-400 inline-block w-32" />
        </div>
        <div>
          <span className="font-semibold uppercase">Signature: </span>
          <span className="border-b border-slate-400 inline-block w-28" />
        </div>
        <div>
          <span className="font-semibold uppercase">Date: </span>
          <span className="border-b border-slate-400 inline-block w-24">
            {today}
          </span>
        </div>
      </div>
    </div>
  );
}
