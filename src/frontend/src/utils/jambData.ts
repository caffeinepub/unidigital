import type { StudentRecord } from "./sampleData";

export interface JambStudent {
  id: string;
  sn: number;
  matricNumber: string;
  jambRegNo: string;
  fullName: string;
  department: string;
  deptCode: string;
  faculty: string;
  state: string;
  lga: string;
  sex: string;
  status: string;
  session: string;
  level: string;
  institutionCategory: string;
  email: string;
}

export interface DepartmentInfo {
  code: string;
  name: string;
  fullName: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    code: "BIO",
    name: "Edu & Biology",
    fullName: "Education & Biology",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
  },
  {
    code: "CHE",
    name: "Edu & Chemistry",
    fullName: "Education & Chemistry",
    color: "sky",
    bgColor: "bg-sky-100",
    textColor: "text-sky-800",
  },
  {
    code: "MTH",
    name: "Edu & Mathematics",
    fullName: "Education & Mathematics",
    color: "violet",
    bgColor: "bg-violet-100",
    textColor: "text-violet-800",
  },
  {
    code: "PHY",
    name: "Edu & Physics",
    fullName: "Education & Physics",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
  },
  {
    code: "CSC",
    name: "Edu & Computer Sci",
    fullName: "Education & Computer Science",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  {
    code: "ENT",
    name: "Entrepreneurship",
    fullName: "Entrepreneurship",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
  },
  {
    code: "HED",
    name: "Health Education",
    fullName: "Health Education",
    color: "rose",
    bgColor: "bg-rose-100",
    textColor: "text-rose-800",
  },
  {
    code: "HKE",
    name: "Human Kinetics",
    fullName: "Human Kinetics & Sports",
    color: "teal",
    bgColor: "bg-teal-100",
    textColor: "text-teal-800",
  },
];

function makeEmail(fullName: string): string {
  const parts = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/);
  const first = parts[0] ?? "student";
  const last = parts[parts.length - 1] ?? "fuek";
  return `${first}.${last}2025@fuek.edu.ng`;
}

function genJamb(seed: number): string {
  const num = String(50000 + seed).padStart(5, "0");
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const l1 = letters[seed % letters.length];
  const l2 = letters[(seed * 7) % letters.length];
  return `2025${num}${l1}${l2}`;
}

function matric(deptCode: string, sn: number): string {
  return `FUEK/SCI/2025/${deptCode}/${String(sn).padStart(3, "0")}`;
}

type RawEntry4 = [string, string, string, string];
type RawEntry5 = [string, string, string, string, string];

const bioRaw: RawEntry4[] = [
  ["Abdullah Mohammed", "Niger", "Wagama", "M"],
  ["Abubakar Hawa", "Kwara", "Edu", "F"],
  ["Abubakar Zainab", "Niger", "Kontagora", "F"],
  ["Aiyu Fatima Chindo", "Kebbi", "Gwandu", "F"],
  ["Cyril Prince", "Niger", "Wagama", "M"],
  ["Islaka Hadiza", "Kogi", "Dekina", "F"],
  ["Moshond Olowiyat Olamide", "Kwara", "Offa", "F"],
  ["Muhammad Abdullahi Shafiu", "Niger", "Wagama", "M"],
  ["Pius Joel Jagaba", "Kaduna", "Kagarko", "M"],
  ["Umar Suleiman", "Niger", "Kontagora", "M"],
  ["Abdulhamid Muhammad Ismail", "Niger", "Wagama", "M"],
  ["Abdulhamid Yusuf", "Niger", "Kontagora", "M"],
  ["Abdullahi Amina", "Niger", "Kontagora", "F"],
  ["Abdoussalam Hassana", "Plateau", "Langtang-North", "F"],
  ["Abeonego Comfort", "Niger", "Kontagora", "F"],
  ["Abubakar Idris", "Niger", "Wagama", "M"],
  ["Adamu Najaatu", "Kebbi", "Yauri", "F"],
  ["Adamu Tasiu Taesi", "Niger", "Bida", "M"],
  ["Ahmad Zakari", "Osun", "Ayedaade", "M"],
  ["Akinpelu Elizabeth", "Kwara", "Ifelodun", "F"],
  ["Aminu Munrat", "Niger", "Wagama", "F"],
  ["Andrawus Saminu", "Niger", "Mariga", "M"],
  ["Attahiru Saidu", "Oyo", "Ogbomosho South", "M"],
  ["Ayaniere Gabriel Oluwatimileyin", "Kwara", "Ifelodun", "M"],
  ["Azeez Fehyisayo Wasiat", "Kwara", "Ilorin-South", "F"],
  ["Chinonso Rejoice Chinonye", "Anambra", "Idemili-North", "F"],
  ["Edoziuno Glory Oluebubechukwu", "Anambra", "Anambra-East", "F"],
  ["Gado Jacintha Shekwoaga", "Kaduna", "Kagarko", "F"],
  ["Haruna Rosemary", "Benue", "Agatu", "F"],
  ["Hassan Amina Mohammed", "Niger", "Kontagora", "F"],
  ["Ibeazuma Oluebube Jennifer", "Anambra", "Ihiala", "F"],
  ["Ibrahim Khadija Imam", "Niger", "Kontagora", "F"],
  ["Isah Fatima", "Niger", "Kontagora", "F"],
  ["Ishaya Saphirat", "Niger", "Kontagora", "F"],
  ["James Joy", "Plateau", "Wase", "F"],
  ["Jibrin Hafsat", "Benue", "Vandeikya", "F"],
  ["Johnson Loveth", "Benue", "Obi", "F"],
  ["Joseph Gift", "Niger", "Rijau", "F"],
  ["Maiyaki Yohanna Habila", "Niger", "Kontagora", "M"],
  ["Mohammed Ameerah Sani", "Niger", "Kontagora", "F"],
  ["Mohammed Rahmatullahi", "Niger", "Kontagora", "F"],
  ["Muhammad Mustapha", "Niger", "Kontagora", "M"],
  ["Muhammed Mariyam", "Niger", "Magama", "F"],
  ["Musa Kefas Ayuba", "Oyo", "Ogbomosho North", "M"],
  ["Musa Shamsudeen", "Anambra", "Anambra-East", "M"],
  ["Ndife Onyeka John", "Anambra", "Awka-North", "M"],
  ["Nebechukwu Emmanuella Nmesoma", "Edo", "Etsako-Central", "F"],
  ["Odine Oshiomhole", "Ogun", "Remo-North", "M"],
  ["Odukoya Yetunde Dorcas", "Oyo", "Ogbomosho South", "F"],
  ["Ogunnira Deborah Temilade", "Kogi", "Yagba-West", "F"],
  ["Oluowa Rebecca Temidayo", "Oyo", "Ogbomosho South", "F"],
  ["Oyeleke Sunday Idowu", "Plateau", "Bassa", "M"],
  ["Philip Blessing", "Osun", "Atakumosa-East", "F"],
  ["Samuel Cynthia", "Niger", "Kontagora", "F"],
  ["Shuaibu Balkisu", "Niger", "Rijau", "F"],
  ["Sunday Regina", "Benue", "Ogbadibo", "F"],
  ["Ujah Lucy", "Niger", "Kontagora", "F"],
  ["Umar Usuman Danyaya", "Niger", "Mariga", "M"],
  ["Yahaya Issa Mohammed", "Niger", "Kontagora", "M"],
  ["Yahaya Shakira", "Niger", "Kontagora", "F"],
  ["Yohanna Joshua", "Niger", "Rijau", "M"],
  ["Yusuf Sadiya Haleema", "Niger", "Edu", "F"],
  ["Zubairu Fatima", "Kwara", "Edu", "F"],
];

const cheRaw: RawEntry4[] = [
  ["Enoch Justin Bashneke", "Kaduna", "Zango-Kataf", "M"],
  ["Mohammed Haruna", "Niger", "Bida", "M"],
  ["Jibril Rodiat Omobolanle", "Imo", "Onuimo", "F"],
  ["John Precious Ogayi", "Edo", "Etsako-East", "F"],
  ["Okeke Patrick Ezechukwu", "Osun", "Atakumosa", "M"],
  ["Okolo Gloria Oshiokenoya", "Oyo", "Ogbomosho", "F"],
  ["Olowe Ayomide Morenikeji", "Kebbi", "Zuru", "F"],
  ["Raji Sikirat", "Oyo", "Ogbomosho", "F"],
  ["Sebastine Esther Accha", "Kebbi", "Edu", "F"],
  ["Shaaba Maryam", "Kwara", "Edu", "F"],
];

const mthRaw: RawEntry4[] = [
  ["Aoliang Yam", "Niger", "Kontagora", "M"],
  ["Jeremiah Nicodemus", "Niger", "Kontagora", "M"],
  ["Mohammed Hajera", "Niger", "Kontagora", "F"],
];

const phyRaw: RawEntry4[] = [
  ["Ahmed Ibrahim Sarkinbauchi", "Niger", "Kontagora", "M"],
  ["Ayodele Jude", "Edo", "Etsako-East", "M"],
  ["Salim Abdullahi", "Niger", "Rijau", "M"],
  ["Samaila Moses", "Edo", "Etsako-Central", "M"],
];

const cscRaw: RawEntry4[] = [
  ["Abubakar Abdulmutaib", "Niger", "Kontagora", "M"],
  ["Bello Aminu Muhammad", "Niger", "Washim", "M"],
  ["Hassan Nafisa", "Niger", "Doko-Mada", "F"],
  ["Hassan Suleiman", "Kebbi", "Patigi", "M"],
  ["Nuhu Umar Faruq", "Niger", "Kontagora", "M"],
  ["Shehu Ismail", "Niger", "Kontagora", "M"],
  ["Yakubu Hudu", "Oyo", "Ogbomosho-North", "M"],
  ["Zara Catherine", "Oyo", "Plateau", "F"],
  ["Abdulazez Abdulsamu", "Kwara", "Irepodun", "M"],
  ["Abdulaganiyun Abbass Yakubu", "Kwara", "Kontagora", "M"],
  ["Abubakar Farida", "Niger", "Kontagora", "F"],
  ["Abdulkareem Awwa", "Niger", "Kontagora", "F"],
  ["Abdullahi Haara Bohari", "Niger", "Kontagora", "F"],
  ["Abdullahi Muhammad Aneche", "Kwara", "Asa", "M"],
  ["Abulah Rofat Ayomide", "Oyo", "Ogbomosho South", "F"],
  ["Abdurasheed Shukurat", "Niger", "Ilorin-East", "F"],
  ["Abubakar Abuaheed Ladan", "Niger", "Kontagora", "M"],
  ["Abubakar Sherif", "Niger", "Magama", "M"],
  ["Abubakar Ibrahim", "Niger", "Kontagora", "M"],
  ["Abubakar Junaidu", "Niger", "Kontagora", "M"],
  ["Abubakar-Siddiku Maryam", "Oyo", "Ogbomosho-South", "F"],
  ["Adeleke John Adeolu", "Oyo", "Ilorin-East", "M"],
  ["Ahmed Sareed", "Niger", "Kontagora", "M"],
  ["Akanbi Adewale Williams", "Oyo", "Nassarawa-Tobi", "M"],
  ["Aiyu Usman", "Niger", "Shiroro", "M"],
  ["Bako Bulus", "Niger", "Rijau", "M"],
  ["Bala Abdulhameed Kuta", "Kebbi", "Argungu", "M"],
  ["Bello Ibrahim Gambo", "Niger", "Magama", "M"],
  ["Bello Nasir", "Kaduna", "Zana", "M"],
  ["Dauda Silas", "Kogi", "Adavi", "M"],
  ["Egpuchunan Blessing Ngozi", "Anambra", "Idemili-North", "F"],
  ["Gazali Abdulwaris", "Niger", "Kontagora", "M"],
  ["Gbeji Lawrence Moses", "Niger", "Kontagora", "M"],
  ["Godabe Hassan Uba", "Niger", "Kontagora", "M"],
  ["Hamisu Abdullahi Agodema", "Niger", "Kontagora", "M"],
  ["Haruna Ibrahim", "Niger", "Kontagora", "M"],
  ["Hassan Abbass Diko", "Kaduna", "Zira", "M"],
  ["Hessa Destiny", "Niger", "Zira", "F"],
  ["Ibrahim John", "Kebbi", "Zira", "M"],
  ["Ibrahim Joshua", "Niger", "Zira", "M"],
  ["Ibrahim Maryam Araca", "Niger", "Kontagora", "F"],
  ["Ibrahim Rukana", "Niger", "Kontagora", "F"],
  ["Ibrahim Rufaina", "Niger", "Kontagora", "F"],
  ["San Hansa Patchko", "Niger", "Wushishi", "M"],
  ["San Hassan Patchko", "Niger", "Kontagora", "M"],
  ["San Hassan", "Benue", "Ohimini", "M"],
  ["Sanu Hamau", "Benue", "Zaha", "M"],
  ["Sanu Usman", "Kaduna", "Dan-Musa", "M"],
  ["Issa Hajar", "Niger", "Kontagora", "F"],
  ["Inob Shangai Erraque", "Oyo", "Saki-West", "M"],
  ["Jane Adoure", "Niger", "Bida", "F"],
  ["Lawe Farar", "Niger", "Kontagora", "M"],
  ["Mahud Abdurruzaing", "Niger", "Magama", "M"],
  ["Minah Bla Gazara", "Niger", "Kontagora", "M"],
  ["Moses Nnenious Lakara", "Niger", "Magama", "M"],
  ["Musas Abduah Spave", "Niger", "Magama", "M"],
  ["Muhammad Alaman Auwa", "Niger", "Kontagora", "M"],
  ["Muhammad Mujab Jipan", "Niger", "Kontagora", "M"],
  ["Muhammad Anarad Tian", "Niger", "Lau", "M"],
  ["Muhammad Junaido", "Niger", "Kontagora", "M"],
  ["Peter Ahmada Bakout", "Niger", "Kontagora", "M"],
  ["Samaita Blessing Odo", "Niger", "Kontagora", "F"],
  ["Nuhu Anas", "Niger", "Kontagora", "M"],
  ["Nurudeen Abdulatteef", "Osun", "Ede-North", "M"],
  ["Olanrewaju Oyeniyi Samson", "Ogun", "Abeokuta-North", "M"],
  ["Osoko Boluwatife Emmanuel", "Ondo", "Vandeikya", "M"],
  ["Piia Joshua Tersoo", "Benue", "Chanaan", "M"],
  ["Rufai Kamal", "Niger", "Kontagora", "M"],
  ["Saadu Aliyu Yusuf", "Oyo", "Ogbomosho South", "M"],
  ["Sabitu Salim", "Niger", "Kontagora", "M"],
  ["Sadiq Fatima Inyass", "Niger", "Kontagora", "F"],
  ["Sale Abdullahi", "Niger", "Kontagora", "M"],
  ["Salihu Rukayyat", "Katsina", "Dan-Musa", "F"],
  ["Simon Judith Ochanya", "Benue", "Ohimini", "F"],
  ["Suleman Hamza", "Anambra", "Orumba-North", "M"],
  ["Tijjani Isah Idris", "Zamfara", "Gumi", "M"],
  ["Udumachukwu Chinedu Caleb", "Niger", "Kontagora", "M"],
  ["Umar Ibrahim", "Niger", "Kontagora", "M"],
  ["Umar Uzairu Faruk", "Kogi", "Dekina", "M"],
  ["Usman Saidu", "Niger", "Kontagora", "M"],
  ["Usman Shedrack Itaha", "Niger", "Borgu", "M"],
  ["Yakubu Michael", "Niger", "Lavun", "M"],
  ["Yakubu Tanimu", "Plateau", "Jos-East", "M"],
  ["Visa Zenas Solomon", "Niger", "Adavi", "M"],
  ["Yohanna Hosea Azi", "Kaduna", "Zana", "M"],
  ["Yusuf Abdulsalam", "Niger", "Yamaltu-Deba", "M"],
  ["Yusuf Muhammad Hadi", "Gombe", "Yamaltu", "M"],
  ["Yusuf Munnirah", "Niger", "Kontagora", "F"],
  ["Zakariyya Abdulsalam Yahuza", "Niger", "Kontagora", "M"],
  ["Wisa Sadu A", "Niger", "Kontagora", "M"],
  ["Wisa Ayu", "Niger", "Kontagora", "M"],
  ["Wisa Bami", "Niger", "Kontagora", "M"],
  ["Wisa Sadio A", "Niger", "Kontagora", "M"],
  ["Wisa Suleiman Sarro", "Niger", "Kontagora", "M"],
];

const entRaw: RawEntry4[] = [
  ["Abuolam Usman", "Nasarawa", "Kontagora", "M"],
  ["Hassein Ayman Bozeze", "Niger", "Kontagora", "M"],
  ["Bassey Ajinai Bozeze", "Kogi", "Kontagora", "M"],
  ["Demi Usen Uresaw", "Niger", "Kontagora", "M"],
  ["Ibrahim Hawi", "Niger", "Kontagora", "M"],
  ["Israel Hassan", "Niger", "Kontagora", "M"],
  ["Hamid Naseer Mohammed", "Niger", "Kontagora", "M"],
  ["Kibate Victor Buste", "Niger", "Kontagora", "M"],
  ["Peter Ahmaza Bakout", "Niger", "Kontagora", "M"],
  ["Samaita Blessing Odo", "Niger", "Kontagora", "F"],
];

const hedRaw: RawEntry5[] = [
  ["Abubakar Hamza", "Kwara", "Edu", "M", "202550089596EF"],
  ["Ahmad Aisha", "Niger", "Kontagora", "F", "202551714215CA"],
  ["Barnabas Beauty", "Plateau", "Bokkos", "F", "202550844701BA"],
  ["Ibrahim Badiatu", "Kebbi", "Ngaski", "F", "202550511349JA"],
  ["Ibrahim Haruna Kuchi", "Niger", "Lapai", "M", "202550470028HA"],
  ["Mulero Elizabeth Inioluwa", "Ogun", "Egbado-North", "F", "202551526954AF"],
  ["Nuhu Margret", "Kaduna", "Kagarko", "F", "202550501704FF"],
  ["Surajo Abdurrahman", "Niger", "Kontagora", "M", "202551519380GF"],
  ["Umar Fatima Maaji", "Kogi", "Kogi", "F", "202550067125BF"],
  ["Umar Habiba Ibrahim", "Niger", "Kontagora", "F", "202550259466JA"],
];

const hkeRaw: RawEntry5[] = [
  ["Adamu Aliyu", "Niger", "Magama", "M", "20255016706OSEF"],
  ["Maduekor Chidera Jessica", "Enugu", "Oji-River", "F", "202550043805FA"],
  ["Oyekola Oyewale", "Oyo", "Irepo", "M", "2025512958805JA"],
  ["Shehu Ismail", "Niger", "Magama", "M", "202551295880SJA"],
];

function buildDeptStudents(deptCode: string, raw: RawEntry4[]): JambStudent[] {
  const dept = DEPARTMENTS.find((d) => d.code === deptCode);
  if (!dept) return [];
  return raw.map(([fullName, state, lga, sex], idx) => {
    const sn = idx + 1;
    return {
      id: `jamb-${deptCode.toLowerCase()}-${String(sn).padStart(3, "0")}`,
      sn,
      matricNumber: matric(deptCode, sn),
      jambRegNo: genJamb(deptCode.charCodeAt(0) * 100 + sn),
      fullName,
      department: dept.fullName,
      deptCode,
      faculty: "Faculty of Science Education",
      state,
      lga,
      sex,
      status: "Admitted",
      session: "2025/2026",
      level: "NCE I",
      institutionCategory: "college_of_education",
      email: makeEmail(fullName),
    };
  });
}

function buildDeptStudents5(deptCode: string, raw: RawEntry5[]): JambStudent[] {
  const dept = DEPARTMENTS.find((d) => d.code === deptCode);
  if (!dept) return [];
  return raw.map(([fullName, state, lga, sex, jambRegNo], idx) => {
    const sn = idx + 1;
    return {
      id: `jamb-${deptCode.toLowerCase()}-${String(sn).padStart(3, "0")}`,
      sn,
      matricNumber: matric(deptCode, sn),
      jambRegNo,
      fullName,
      department: dept.fullName,
      deptCode,
      faculty: "Faculty of Science Education",
      state,
      lga,
      sex,
      status: "Admitted",
      session: "2025/2026",
      level: "NCE I",
      institutionCategory: "college_of_education",
      email: makeEmail(fullName),
    };
  });
}

const BIO_STUDENTS = buildDeptStudents("BIO", bioRaw);
const CHE_STUDENTS = buildDeptStudents("CHE", cheRaw);
const MTH_STUDENTS = buildDeptStudents("MTH", mthRaw);
const PHY_STUDENTS = buildDeptStudents("PHY", phyRaw);
const CSC_STUDENTS = buildDeptStudents("CSC", cscRaw);
const ENT_STUDENTS = buildDeptStudents("ENT", entRaw);
const HED_STUDENTS = buildDeptStudents5("HED", hedRaw);
const HKE_STUDENTS = buildDeptStudents5("HKE", hkeRaw);

const ALL_JAMB_STUDENTS: JambStudent[] = [
  ...BIO_STUDENTS,
  ...CHE_STUDENTS,
  ...MTH_STUDENTS,
  ...PHY_STUDENTS,
  ...CSC_STUDENTS,
  ...ENT_STUDENTS,
  ...HED_STUDENTS,
  ...HKE_STUDENTS,
];

export function getDeptStudents(deptCode: string): JambStudent[] {
  return ALL_JAMB_STUDENTS.filter((s) => s.deptCode === deptCode);
}

export function getAllJambStudents(): JambStudent[] {
  return ALL_JAMB_STUDENTS;
}

export function getJambStats(): {
  total: number;
  perDept: Record<string, number>;
} {
  const perDept: Record<string, number> = {};
  for (const d of DEPARTMENTS) {
    perDept[d.code] = getDeptStudents(d.code).length;
  }
  return { total: ALL_JAMB_STUDENTS.length, perDept };
}

export function initJambStudents(): void {
  const JAMB_KEY = "unidigital_jamb_initialized_2025";
  if (localStorage.getItem(JAMB_KEY)) return;

  const existingRaw = localStorage.getItem("unidigital_students");
  const existing: StudentRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
  const existingMatrics = new Set(existing.map((s) => s.matricNumber));

  const newStudents: StudentRecord[] = ALL_JAMB_STUDENTS.filter(
    (js) => !existingMatrics.has(js.matricNumber),
  ).map((js) => ({
    matricNumber: js.matricNumber,
    name: js.fullName,
    email: js.email,
    level: "100",
    department: js.department,
    subCombination: js.deptCode,
    institutionCategory: "college_of_education" as const,
  }));

  const combined = [...existing, ...newStudents];
  localStorage.setItem("unidigital_students", JSON.stringify(combined));

  const extRaw = localStorage.getItem("unidigital_extended_students");
  const extended: Record<string, unknown>[] = extRaw ? JSON.parse(extRaw) : [];
  const extMatrics = new Set(
    extended.map((s) => (s as { matricNumber: string }).matricNumber),
  );

  const newExtended = ALL_JAMB_STUDENTS.filter(
    (js) => !extMatrics.has(js.matricNumber),
  ).map((js) => ({
    matricNumber: js.matricNumber,
    name: js.fullName,
    email: js.email,
    level: "100",
    department: js.department,
    subCombination: js.deptCode,
    institutionCategory: "college_of_education",
    jambRegNo: js.jambRegNo,
    state: js.state,
    lga: js.lga,
    sex: js.sex,
    session: js.session,
    faculty: js.faculty,
    status: js.status,
    deptCode: js.deptCode,
  }));

  localStorage.setItem(
    "unidigital_extended_students",
    JSON.stringify([...extended, ...newExtended]),
  );

  localStorage.setItem(JAMB_KEY, "1");
}
