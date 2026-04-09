// Shared types and constants for the Distance Learning portal

export const DL_CREDIT_MIN = 10;
export const DL_CREDIT_MAX = 15;
export const ACADEMIC_SESSION = "2024/2025";
export const CURRENT_SEMESTER = "First";
export const DL_DEMO_MATRIC = "FUEK/DL/2025/CSC/001";

export interface DLStudent {
  matricNumber: string;
  name: string;
  email: string;
  department: string;
  level: number;
  programme: string;
  entryMode: "UTME" | "DE";
  completedCourses: string[];
  semestersCompleted: number;
}

export interface DLPayment {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  ref: string;
}

export interface DLAnnouncement {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  priority: "info" | "urgent" | "normal";
}

export interface DLCourseAccess {
  courseCode: string;
  courseTitle: string;
  lastAccessed: string;
  hoursOnline: number;
  status: "adequate" | "at-risk" | "insufficient";
}

export interface ClearanceStep {
  id: string;
  label: string;
  status: "pending" | "approved" | "rejected" | "na";
  approver: string;
  date?: string;
}

export const DEMO_STUDENT: DLStudent = {
  matricNumber: DL_DEMO_MATRIC,
  name: "Aisha Mohammed",
  email: "aisha.dl@student.fuek.edu.ng",
  department: "Computer Science",
  level: 200,
  programme: "DL-B.Sc(Ed)",
  entryMode: "UTME",
  completedCourses: [
    "GST 111",
    "GST 113",
    "EDU 101",
    "COS 101",
    "MTH 101",
    "PHY 101",
    "GST 112",
    "GST 114",
    "COS 102",
    "PHY 102",
  ],
  semestersCompleted: 2,
};

export const DEMO_PAYMENTS: DLPayment[] = [
  {
    id: "p1",
    date: "2024-09-10",
    description: "2024/2025 Session Fee — 1st Instalment",
    amount: 65000,
    status: "paid",
    ref: "FUEK90001234",
  },
  {
    id: "p2",
    date: "2024-11-05",
    description: "DL Technology Fee",
    amount: 12000,
    status: "paid",
    ref: "FUEK90005678",
  },
  {
    id: "p3",
    date: "2025-02-01",
    description: "2024/2025 Session Fee — 2nd Instalment",
    amount: 40000,
    status: "pending",
    ref: "",
  },
  {
    id: "p4",
    date: "2025-03-15",
    description: "Study Materials Fee",
    amount: 8000,
    status: "overdue",
    ref: "",
  },
];

export const DEMO_ANNOUNCEMENTS: DLAnnouncement[] = [
  {
    id: "a1",
    title: "Orientation Materials Uploaded",
    body: "All Distance Learning students are encouraged to download and review the 2024/2025 orientation pack available in Course Materials. The pack includes the academic calendar, DL regulations, and contact directory.",
    date: "2024-09-02",
    read: false,
    priority: "info",
  },
  {
    id: "a2",
    title: "First Semester Timetable Released",
    body: "The 2024/2025 First Semester timetable for all DL programmes has been released. Live Saturday sessions commence 21 September 2024. Please check the Timetable section of your portal.",
    date: "2024-09-14",
    read: false,
    priority: "normal",
  },
  {
    id: "a3",
    title: "Fee Payment Deadline — 2nd Instalment",
    body: "The deadline for 2nd instalment fee payment is 28 February 2025. Students who fail to pay by this date will be barred from end-of-semester examinations. Please proceed to Fee Payment.",
    date: "2025-01-20",
    read: false,
    priority: "urgent",
  },
  {
    id: "a4",
    title: "DL Coordinator Change",
    body: "Dr. Fatima Adamu has been appointed as the new Distance Learning Coordinator with effect from 1st February 2025. All enquiries should be directed to dl@fuek.edu.ng.",
    date: "2025-01-30",
    read: true,
    priority: "info",
  },
  {
    id: "a5",
    title: "Examination Date Notice",
    body: "End-of-semester examinations for Distance Learning students will hold from 5th May 2025 to 19th May 2025 at the FUEK Main Campus, Kontagora. Travel arrangements are the student's responsibility.",
    date: "2025-03-01",
    read: false,
    priority: "urgent",
  },
];

export const DEMO_COURSE_ACCESS: DLCourseAccess[] = [
  {
    courseCode: "ENT 211",
    courseTitle: "Entrepreneurship and Innovation",
    lastAccessed: "2025-04-05",
    hoursOnline: 12,
    status: "adequate",
  },
  {
    courseCode: "EDU 201",
    courseTitle: "Curriculum & Teaching Methods",
    lastAccessed: "2025-04-06",
    hoursOnline: 10,
    status: "adequate",
  },
  {
    courseCode: "EDU 203",
    courseTitle: "Educational Technology & AI",
    lastAccessed: "2025-03-28",
    hoursOnline: 6,
    status: "at-risk",
  },
  {
    courseCode: "COS 201",
    courseTitle: "Computer Programming I",
    lastAccessed: "2025-04-07",
    hoursOnline: 15,
    status: "adequate",
  },
  {
    courseCode: "MTH 201",
    courseTitle: "Mathematical Methods I",
    lastAccessed: "2025-03-10",
    hoursOnline: 3,
    status: "insufficient",
  },
  {
    courseCode: "SED 203",
    courseTitle: "Mathematics Subject Method",
    lastAccessed: "2025-04-01",
    hoursOnline: 8,
    status: "adequate",
  },
];

export const DEMO_CLEARANCE: ClearanceStep[] = [
  {
    id: "bursary",
    label: "Bursary Clearance",
    status: "approved",
    approver: "Alhaji Umar Suleiman (Bursary Dept)",
    date: "2025-03-10",
  },
  {
    id: "library",
    label: "Library Clearance",
    status: "pending",
    approver: "Miss Grace Okafor (University Library)",
    date: undefined,
  },
  {
    id: "hostel",
    label: "Hostel Clearance",
    status: "na",
    approver: "N/A — Distance Learning students are off-campus",
    date: undefined,
  },
  {
    id: "faculty",
    label: "Faculty Clearance",
    status: "pending",
    approver: "Dean, Faculty of Science Education",
    date: undefined,
  },
  {
    id: "dl-coord",
    label: "DL Coordinator Clearance",
    status: "pending",
    approver: "Dr. Fatima Adamu (DL Centre)",
    date: undefined,
  },
];

export const ACADEMIC_CALENDAR_EVENTS = [
  {
    date: "2024-09-02",
    event: "Study materials released on portal",
    type: "dl",
  },
  { date: "2024-09-16", event: "Course registration opens", type: "academic" },
  {
    date: "2024-09-21",
    event: "First live Saturday session (Kontagora Study Centre)",
    type: "dl",
  },
  { date: "2024-09-30", event: "Course registration closes", type: "academic" },
  { date: "2024-10-05", event: "Teaching weeks commence", type: "academic" },
  {
    date: "2024-11-02",
    event: "Mid-semester assessment (online quiz)",
    type: "dl",
  },
  { date: "2024-12-14", event: "Teaching weeks end", type: "academic" },
  { date: "2025-01-06", event: "Revision week begins", type: "academic" },
  { date: "2025-01-13", event: "Examination period opens", type: "academic" },
  { date: "2025-01-27", event: "Examinations end", type: "academic" },
  { date: "2025-02-14", event: "Results released (portal)", type: "dl" },
  {
    date: "2025-02-28",
    event: "2nd semester registration opens",
    type: "academic",
  },
];
