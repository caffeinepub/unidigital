import { ALL_FUEK_COURSES } from "./fuekCourseData";

export interface StudentRecord {
  matricNumber: string;
  name: string;
  email: string;
  level: string;
  department: string;
  subCombination?: string;
  institutionCategory?: "college_of_education" | "university" | "polytechnic";
}

export interface CourseRecord {
  code: string;
  title: string;
  creditUnits: number;
  department: string;
  semester: string;
  lecturerId: string;
  // Extended fields (optional, added with FUEK course integration)
  type?: "compulsory" | "elective";
  level?: number | string;
  prerequisites?: string[];
  isGST?: boolean;
  programmeType?: string;
  subjectArea?: string;
  isAvailable?: boolean;
  description?: string;
}

/**
 * LocalCourse — richer course format used in the course catalog,
 * course registration, and admin course management.
 */
export interface LocalCourse {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  type: "compulsory" | "elective";
  department: string;
  level: number | string;
  semester: string;
  prerequisites?: string[];
  isGST?: boolean;
  programmeType?: string;
  subjectArea?: string;
  isAvailable?: boolean;
  description?: string;
}

export interface StaffRecord {
  staffId: string;
  name: string;
  designation: string;
  email: string;
  department: string;
}

export interface Result {
  id: string;
  studentMatric: string;
  courseCode: string;
  semester: string;
  score: number;
  grade: string;
  gradePoint: number;
}

export interface FeeInvoice {
  id: string;
  studentMatric: string;
  session: string;
  amount: number;
  description: string;
  dueDate: string;
  paid: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  reference: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: "present" | "absent" | "late";
}

export interface AssignmentRecord {
  id: string;
  title: string;
  courseCode: string;
  type: "exam" | "assignment";
  dueDate: string;
  totalMarks: number;
  instructions: string;
  creatorId: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentMatric: string;
  submissionText: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
}

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  email: string;
  program: string;
  appliedAt: string;
  status: "pending" | "screening" | "admitted" | "rejected";
}

// === v4 types ===

export interface CourseRegistration {
  id: string;
  studentMatric: string;
  courseCode: string;
  semester: string;
  registeredAt: string;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseTitle: string;
  venue: string;
  lecturerId: string;
  lecturerName: string;
  semester: string;
}

export interface StudentAttendanceRecord {
  id: string;
  courseCode: string;
  date: string;
  studentMatric: string;
  status: "present" | "absent" | "late";
  markedByLecturerId: string;
}

export interface DocRequest {
  id: string;
  studentMatric: string;
  studentName: string;
  requestType: string;
  purpose: string;
  status: "pending" | "processing" | "ready" | "collected";
  submittedAt: string;
  note: string;
}

export interface HostelApplication {
  id: string;
  studentMatric: string;
  studentName: string;
  roomType: string;
  session: string;
  status: "pending" | "approved" | "rejected";
  roomNumber: string;
  block: string;
  appliedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copiesAvailable: number;
  totalCopies: number;
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  studentMatric: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string;
  status: "active" | "returned" | "overdue";
}

function getScore(score: number): { grade: string; gradePoint: number } {
  if (score >= 70) return { grade: "A", gradePoint: 5 };
  if (score >= 60) return { grade: "B", gradePoint: 4 };
  if (score >= 50) return { grade: "C", gradePoint: 3 };
  if (score >= 45) return { grade: "D", gradePoint: 2 };
  if (score >= 40) return { grade: "E", gradePoint: 1 };
  return { grade: "F", gradePoint: 0 };
}

export function initSampleData() {
  if (localStorage.getItem("unidigital_initialized")) {
    // init v4 data if not present
    initV4Data();
    initV5Data();
    initV6Data();
    initFuekCourses();
    return;
  }

  const students: StudentRecord[] = [
    {
      matricNumber: "CSC/2021/001",
      name: "Amara Okonkwo",
      email: "amara@student.edu",
      level: "300",
      department: "Computer Science",
    },
    {
      matricNumber: "ENG/2021/002",
      name: "Emeka Nwosu",
      email: "emeka@student.edu",
      level: "200",
      department: "Engineering",
    },
    {
      matricNumber: "MED/2021/003",
      name: "Fatima Bello",
      email: "fatima@student.edu",
      level: "400",
      department: "Medicine",
    },
    {
      matricNumber: "LAW/2021/004",
      name: "Chukwudi Eze",
      email: "chukwudi@student.edu",
      level: "200",
      department: "Law",
    },
    {
      matricNumber: "BUS/2021/005",
      name: "Ngozi Adeyemi",
      email: "ngozi@student.edu",
      level: "100",
      department: "Business Administration",
    },
    {
      matricNumber: "CSC/2021/006",
      name: "Taiwo Afolabi",
      email: "taiwo@student.edu",
      level: "300",
      department: "Computer Science",
    },
    {
      matricNumber: "ENG/2022/007",
      name: "Ifeanyi Obi",
      email: "ifeanyi@student.edu",
      level: "100",
      department: "Engineering",
    },
  ];

  const courses: CourseRecord[] = [
    {
      code: "CSC301",
      title: "Data Structures & Algorithms",
      creditUnits: 3,
      department: "Computer Science",
      semester: "2023/2024 First",
      lecturerId: "STF001",
    },
    {
      code: "CSC302",
      title: "Database Management Systems",
      creditUnits: 3,
      department: "Computer Science",
      semester: "2023/2024 First",
      lecturerId: "STF001",
    },
    {
      code: "ENG201",
      title: "Engineering Mathematics",
      creditUnits: 4,
      department: "Engineering",
      semester: "2023/2024 First",
      lecturerId: "STF002",
    },
    {
      code: "ENG202",
      title: "Mechanics of Materials",
      creditUnits: 3,
      department: "Engineering",
      semester: "2023/2024 First",
      lecturerId: "STF002",
    },
    {
      code: "MED401",
      title: "Clinical Pharmacology",
      creditUnits: 4,
      department: "Medicine",
      semester: "2023/2024 First",
      lecturerId: "STF003",
    },
    {
      code: "LAW201",
      title: "Constitutional Law",
      creditUnits: 3,
      department: "Law",
      semester: "2023/2024 First",
      lecturerId: "STF004",
    },
    {
      code: "BUS101",
      title: "Introduction to Business",
      creditUnits: 2,
      department: "Business Administration",
      semester: "2023/2024 First",
      lecturerId: "STF005",
    },
    {
      code: "GST101",
      title: "Communication Skills",
      creditUnits: 2,
      department: "General Studies",
      semester: "2023/2024 First",
      lecturerId: "STF001",
    },
  ];

  const staff: StaffRecord[] = [
    {
      staffId: "STF001",
      name: "Dr. Adebayo Ogundimu",
      designation: "lecturer",
      email: "adebayo@uni.edu",
      department: "Computer Science",
    },
    {
      staffId: "STF002",
      name: "Prof. Yakubu Musa",
      designation: "lecturer",
      email: "yakubu@uni.edu",
      department: "Engineering",
    },
    {
      staffId: "STF003",
      name: "Dr. Chioma Nwachukwu",
      designation: "lecturer",
      email: "chioma@uni.edu",
      department: "Medicine",
    },
    {
      staffId: "STF004",
      name: "Barrister Kunle Adesanya",
      designation: "lecturer",
      email: "kunle@uni.edu",
      department: "Law",
    },
    {
      staffId: "STF005",
      name: "Mrs. Blessing Okeke",
      designation: "lecturer",
      email: "blessing@uni.edu",
      department: "Business Administration",
    },
    {
      staffId: "STF006",
      name: "Mr. James Olatunji",
      designation: "hr",
      email: "james@uni.edu",
      department: "HR",
    },
    {
      staffId: "STF007",
      name: "Mrs. Grace Onyeka",
      designation: "bursary",
      email: "grace@uni.edu",
      department: "Bursary",
    },
  ];

  const results: Result[] = [
    ...["CSC/2021/001", "CSC/2021/006"].flatMap((m) =>
      ["CSC301", "CSC302", "GST101"].map((code) => {
        const score = 55 + Math.floor(Math.random() * 40);
        return {
          id: `${m}-${code}`,
          studentMatric: m,
          courseCode: code,
          semester: "2023/2024 First",
          score,
          ...getScore(score),
        };
      }),
    ),
    ...["ENG/2021/002", "ENG/2022/007"].flatMap((m) =>
      ["ENG201", "ENG202", "GST101"].map((code) => {
        const score = 50 + Math.floor(Math.random() * 45);
        return {
          id: `${m}-${code}`,
          studentMatric: m,
          courseCode: code,
          semester: "2023/2024 First",
          score,
          ...getScore(score),
        };
      }),
    ),
    ...["MED/2021/003"].flatMap((m) =>
      ["MED401", "GST101"].map((code) => {
        const score = 65 + Math.floor(Math.random() * 30);
        return {
          id: `${m}-${code}`,
          studentMatric: m,
          courseCode: code,
          semester: "2023/2024 First",
          score,
          ...getScore(score),
        };
      }),
    ),
  ];

  const invoices: FeeInvoice[] = students.map((s, i) => ({
    id: `INV-${i + 1}`,
    studentMatric: s.matricNumber,
    session: "2023/2024",
    amount: 150000 + (i % 3) * 25000,
    description: "Tuition & Development Levy",
    dueDate: "2024-01-31",
    paid: i % 2 === 0 ? 150000 + (i % 3) * 25000 : i % 3 === 1 ? 75000 : 0,
  }));

  const payments: Payment[] = invoices
    .filter((inv) => inv.paid > 0)
    .map((inv, i) => ({
      id: `PAY-${i + 1}`,
      invoiceId: inv.id,
      amountPaid: inv.paid,
      paymentDate: "2024-01-15",
      reference: `REF${100000 + i}`,
    }));

  const leaveRequests: LeaveRequest[] = [
    {
      id: "LV001",
      staffId: "STF001",
      staffName: "Dr. Adebayo Ogundimu",
      leaveType: "Annual",
      startDate: "2024-02-01",
      endDate: "2024-02-07",
      reason: "Family vacation",
      status: "approved",
    },
    {
      id: "LV002",
      staffId: "STF003",
      staffName: "Dr. Chioma Nwachukwu",
      leaveType: "Medical",
      startDate: "2024-01-20",
      endDate: "2024-01-25",
      reason: "Medical treatment",
      status: "pending",
    },
    {
      id: "LV003",
      staffId: "STF005",
      staffName: "Mrs. Blessing Okeke",
      leaveType: "Maternity",
      startDate: "2024-03-01",
      endDate: "2024-05-31",
      reason: "Maternity leave",
      status: "approved",
    },
  ];

  const assignments: AssignmentRecord[] = [
    {
      id: "ASGN001",
      title: "Algorithm Analysis Essay",
      courseCode: "CSC301",
      type: "assignment",
      dueDate: "2024-01-25",
      totalMarks: 20,
      instructions: "Write a 2000-word essay on Big-O notation.",
      creatorId: "STF001",
    },
    {
      id: "ASGN002",
      title: "First Semester Exam",
      courseCode: "CSC302",
      type: "exam",
      dueDate: "2024-02-10",
      totalMarks: 100,
      instructions: "Covers all topics from weeks 1-12.",
      creatorId: "STF001",
    },
    {
      id: "ASGN003",
      title: "Engineering Lab Report",
      courseCode: "ENG201",
      type: "assignment",
      dueDate: "2024-01-30",
      totalMarks: 30,
      instructions: "Submit lab report for experiment 3.",
      creatorId: "STF002",
    },
  ];

  const admissions: AdmissionApplication[] = [
    {
      id: "APP001",
      applicantName: "Tunde Williams",
      email: "tunde@gmail.com",
      program: "Computer Science",
      appliedAt: "2024-01-10",
      status: "screening",
    },
    {
      id: "APP002",
      applicantName: "Zainab Hassan",
      email: "zainab@gmail.com",
      program: "Medicine",
      appliedAt: "2024-01-12",
      status: "admitted",
    },
    {
      id: "APP003",
      applicantName: "David Osei",
      email: "david@gmail.com",
      program: "Engineering",
      appliedAt: "2024-01-15",
      status: "pending",
    },
    {
      id: "APP004",
      applicantName: "Aisha Abdullahi",
      email: "aisha@gmail.com",
      program: "Law",
      appliedAt: "2024-01-08",
      status: "rejected",
    },
    {
      id: "APP005",
      applicantName: "Chidi Okafor",
      email: "chidi@gmail.com",
      program: "Business Administration",
      appliedAt: "2024-01-18",
      status: "pending",
    },
  ];

  localStorage.setItem("unidigital_students", JSON.stringify(students));
  localStorage.setItem("unidigital_courses", JSON.stringify(courses));
  localStorage.setItem("unidigital_staff", JSON.stringify(staff));
  localStorage.setItem("unidigital_results", JSON.stringify(results));
  localStorage.setItem("unidigital_invoices", JSON.stringify(invoices));
  localStorage.setItem("unidigital_payments", JSON.stringify(payments));
  localStorage.setItem("unidigital_leaves", JSON.stringify(leaveRequests));
  localStorage.setItem("unidigital_assignments", JSON.stringify(assignments));
  localStorage.setItem("unidigital_admissions", JSON.stringify(admissions));
  localStorage.setItem("unidigital_initialized", "true");

  initV4Data();
  initV5Data();
  initV6Data();
  initFuekCourses();
}

function initV4Data() {
  if (!localStorage.getItem("unidigital_v4_initialized")) {
    const registrations: CourseRegistration[] = [
      {
        id: "REG001",
        studentMatric: "CSC/2021/001",
        courseCode: "CSC301",
        semester: "2023/2024 First",
        registeredAt: "2024-01-05",
      },
      {
        id: "REG002",
        studentMatric: "CSC/2021/001",
        courseCode: "CSC302",
        semester: "2023/2024 First",
        registeredAt: "2024-01-05",
      },
      {
        id: "REG003",
        studentMatric: "CSC/2021/001",
        courseCode: "GST101",
        semester: "2023/2024 First",
        registeredAt: "2024-01-05",
      },
      {
        id: "REG004",
        studentMatric: "CSC/2021/006",
        courseCode: "CSC301",
        semester: "2023/2024 First",
        registeredAt: "2024-01-06",
      },
      {
        id: "REG005",
        studentMatric: "CSC/2021/006",
        courseCode: "CSC302",
        semester: "2023/2024 First",
        registeredAt: "2024-01-06",
      },
      {
        id: "REG006",
        studentMatric: "CSC/2021/006",
        courseCode: "GST101",
        semester: "2023/2024 First",
        registeredAt: "2024-01-06",
      },
      {
        id: "REG007",
        studentMatric: "ENG/2021/002",
        courseCode: "ENG201",
        semester: "2023/2024 First",
        registeredAt: "2024-01-05",
      },
      {
        id: "REG008",
        studentMatric: "ENG/2021/002",
        courseCode: "ENG202",
        semester: "2023/2024 First",
        registeredAt: "2024-01-05",
      },
      {
        id: "REG009",
        studentMatric: "ENG/2021/002",
        courseCode: "GST101",
        semester: "2023/2024 First",
        registeredAt: "2024-01-05",
      },
    ];

    const timetable: TimetableSlot[] = [
      {
        id: "TT001",
        day: "Monday",
        startTime: "08:00",
        endTime: "10:00",
        courseCode: "CSC301",
        courseTitle: "Data Structures & Algorithms",
        venue: "LT-1",
        lecturerId: "STF001",
        lecturerName: "Dr. Adebayo Ogundimu",
        semester: "2023/2024 First",
      },
      {
        id: "TT002",
        day: "Wednesday",
        startTime: "10:00",
        endTime: "12:00",
        courseCode: "CSC302",
        courseTitle: "Database Management Systems",
        venue: "LT-2",
        lecturerId: "STF001",
        lecturerName: "Dr. Adebayo Ogundimu",
        semester: "2023/2024 First",
      },
      {
        id: "TT003",
        day: "Tuesday",
        startTime: "09:00",
        endTime: "11:00",
        courseCode: "ENG201",
        courseTitle: "Engineering Mathematics",
        venue: "ENG-A",
        lecturerId: "STF002",
        lecturerName: "Prof. Yakubu Musa",
        semester: "2023/2024 First",
      },
      {
        id: "TT004",
        day: "Thursday",
        startTime: "14:00",
        endTime: "16:00",
        courseCode: "ENG202",
        courseTitle: "Mechanics of Materials",
        venue: "ENG-B",
        lecturerId: "STF002",
        lecturerName: "Prof. Yakubu Musa",
        semester: "2023/2024 First",
      },
      {
        id: "TT005",
        day: "Friday",
        startTime: "08:00",
        endTime: "10:00",
        courseCode: "GST101",
        courseTitle: "Communication Skills",
        venue: "AUD-1",
        lecturerId: "STF001",
        lecturerName: "Dr. Adebayo Ogundimu",
        semester: "2023/2024 First",
      },
      {
        id: "TT006",
        day: "Monday",
        startTime: "13:00",
        endTime: "15:00",
        courseCode: "MED401",
        courseTitle: "Clinical Pharmacology",
        venue: "MED-LAB",
        lecturerId: "STF003",
        lecturerName: "Dr. Chioma Nwachukwu",
        semester: "2023/2024 First",
      },
      {
        id: "TT007",
        day: "Wednesday",
        startTime: "08:00",
        endTime: "10:00",
        courseCode: "LAW201",
        courseTitle: "Constitutional Law",
        venue: "LAW-1",
        lecturerId: "STF004",
        lecturerName: "Barrister Kunle Adesanya",
        semester: "2023/2024 First",
      },
    ];

    const attendance: StudentAttendanceRecord[] = [];
    const courses = ["CSC301", "CSC302", "ENG201"];
    const sessions = ["2024-01-08", "2024-01-15", "2024-01-22"];
    const studentsByCourse: Record<string, string[]> = {
      CSC301: ["CSC/2021/001", "CSC/2021/006"],
      CSC302: ["CSC/2021/001", "CSC/2021/006"],
      ENG201: ["ENG/2021/002"],
    };
    const statuses: ("present" | "absent" | "late")[] = [
      "present",
      "present",
      "absent",
    ];
    let attIdx = 1;
    for (const course of courses) {
      for (const date of sessions) {
        for (const matric of studentsByCourse[course] || []) {
          attendance.push({
            id: `ATT${String(attIdx).padStart(3, "0")}`,
            courseCode: course,
            date,
            studentMatric: matric,
            status: statuses[attIdx % 3],
            markedByLecturerId: "STF001",
          });
          attIdx++;
        }
      }
    }

    const docRequests: DocRequest[] = [
      {
        id: "DOC001",
        studentMatric: "CSC/2021/001",
        studentName: "Amara Okonkwo",
        requestType: "Official Transcript",
        purpose: "Graduate school application",
        status: "pending",
        submittedAt: "2024-01-20",
        note: "",
      },
      {
        id: "DOC002",
        studentMatric: "ENG/2021/002",
        studentName: "Emeka Nwosu",
        requestType: "Attestation Letter",
        purpose: "Internship application",
        status: "pending",
        submittedAt: "2024-01-22",
        note: "",
      },
      {
        id: "DOC003",
        studentMatric: "CSC/2021/006",
        studentName: "Taiwo Afolabi",
        requestType: "Certificate of Enrollment",
        purpose: "Bank account opening",
        status: "ready",
        submittedAt: "2024-01-10",
        note: "Document ready for collection at the registry.",
      },
    ];

    const hostelApps: HostelApplication[] = [
      {
        id: "HST001",
        studentMatric: "CSC/2021/001",
        studentName: "Amara Okonkwo",
        roomType: "Single",
        session: "2023/2024",
        status: "approved",
        roomNumber: "A-14",
        block: "Block A",
        appliedAt: "2024-01-03",
      },
      {
        id: "HST002",
        studentMatric: "ENG/2021/002",
        studentName: "Emeka Nwosu",
        roomType: "Double",
        session: "2023/2024",
        status: "pending",
        roomNumber: "",
        block: "",
        appliedAt: "2024-01-10",
      },
      {
        id: "HST003",
        studentMatric: "MED/2021/003",
        studentName: "Fatima Bello",
        roomType: "Suite",
        session: "2023/2024",
        status: "pending",
        roomNumber: "",
        block: "",
        appliedAt: "2024-01-12",
      },
    ];

    const books: Book[] = [
      {
        id: "BK001",
        title: "Introduction to Algorithms",
        author: "Cormen, Leiserson, Rivest",
        isbn: "978-0262033848",
        category: "Computer Science",
        copiesAvailable: 3,
        totalCopies: 5,
      },
      {
        id: "BK002",
        title: "Database System Concepts",
        author: "Silberschatz, Korth",
        isbn: "978-0073523323",
        category: "Computer Science",
        copiesAvailable: 2,
        totalCopies: 4,
      },
      {
        id: "BK003",
        title: "Engineering Mechanics",
        author: "R.C. Hibbeler",
        isbn: "978-0133915426",
        category: "Engineering",
        copiesAvailable: 4,
        totalCopies: 6,
      },
      {
        id: "BK004",
        title: "Calculus: Early Transcendentals",
        author: "James Stewart",
        isbn: "978-1285741550",
        category: "Mathematics",
        copiesAvailable: 5,
        totalCopies: 7,
      },
      {
        id: "BK005",
        title: "Clinical Pharmacology Made Easy",
        author: "Duncan Lush",
        isbn: "978-0702073939",
        category: "Medicine",
        copiesAvailable: 2,
        totalCopies: 3,
      },
      {
        id: "BK006",
        title: "Constitutional Law in Nigeria",
        author: "Nwabueze B.O.",
        isbn: "978-0719012532",
        category: "Law",
        copiesAvailable: 3,
        totalCopies: 4,
      },
      {
        id: "BK007",
        title: "Principles of Management",
        author: "Harold Koontz",
        isbn: "978-0071086011",
        category: "Business",
        copiesAvailable: 6,
        totalCopies: 8,
      },
      {
        id: "BK008",
        title: "Data Communications & Networking",
        author: "Behrouz Forouzan",
        isbn: "978-0073376226",
        category: "Computer Science",
        copiesAvailable: 1,
        totalCopies: 3,
      },
    ];

    const loans: BookLoan[] = [
      {
        id: "LOAN001",
        bookId: "BK001",
        bookTitle: "Introduction to Algorithms",
        studentMatric: "CSC/2021/001",
        borrowedAt: "2024-01-10",
        dueDate: "2024-01-24",
        returnedAt: "",
        status: "active",
      },
      {
        id: "LOAN002",
        bookId: "BK002",
        bookTitle: "Database System Concepts",
        studentMatric: "CSC/2021/001",
        borrowedAt: "2024-01-12",
        dueDate: "2024-01-26",
        returnedAt: "",
        status: "overdue",
      },
    ];

    localStorage.setItem(
      "unidigital_registrations",
      JSON.stringify(registrations),
    );
    localStorage.setItem("unidigital_registration_open", "true");
    localStorage.setItem("unidigital_timetable", JSON.stringify(timetable));
    localStorage.setItem(
      "unidigital_student_attendance",
      JSON.stringify(attendance),
    );
    localStorage.setItem(
      "unidigital_doc_requests",
      JSON.stringify(docRequests),
    );
    localStorage.setItem("unidigital_hostel_apps", JSON.stringify(hostelApps));
    localStorage.setItem("unidigital_books", JSON.stringify(books));
    localStorage.setItem("unidigital_loans", JSON.stringify(loans));
    localStorage.setItem("unidigital_v4_initialized", "true");
  }
}

export function getLocalStudents(): StudentRecord[] {
  return JSON.parse(localStorage.getItem("unidigital_students") || "[]");
}
export function saveLocalStudents(data: StudentRecord[]) {
  localStorage.setItem("unidigital_students", JSON.stringify(data));
}
export function getLocalCourses(): CourseRecord[] {
  return JSON.parse(localStorage.getItem("unidigital_courses") || "[]");
}
export function saveLocalCourses(data: CourseRecord[]) {
  localStorage.setItem("unidigital_courses", JSON.stringify(data));
}
export function getLocalStaff(): StaffRecord[] {
  return JSON.parse(localStorage.getItem("unidigital_staff") || "[]");
}
export function saveLocalStaff(data: StaffRecord[]) {
  localStorage.setItem("unidigital_staff", JSON.stringify(data));
}
export function getLocalResults(): Result[] {
  return JSON.parse(localStorage.getItem("unidigital_results") || "[]");
}
export function saveLocalResults(data: Result[]) {
  localStorage.setItem("unidigital_results", JSON.stringify(data));
}
export function getLocalInvoices(): FeeInvoice[] {
  return JSON.parse(localStorage.getItem("unidigital_invoices") || "[]");
}
export function saveLocalInvoices(data: FeeInvoice[]) {
  localStorage.setItem("unidigital_invoices", JSON.stringify(data));
}
export function getLocalPayments(): Payment[] {
  return JSON.parse(localStorage.getItem("unidigital_payments") || "[]");
}
export function saveLocalPayments(data: Payment[]) {
  localStorage.setItem("unidigital_payments", JSON.stringify(data));
}
export function getLocalLeaves(): LeaveRequest[] {
  return JSON.parse(localStorage.getItem("unidigital_leaves") || "[]");
}
export function saveLocalLeaves(data: LeaveRequest[]) {
  localStorage.setItem("unidigital_leaves", JSON.stringify(data));
}
export function getLocalAssignments(): AssignmentRecord[] {
  return JSON.parse(localStorage.getItem("unidigital_assignments") || "[]");
}
export function saveLocalAssignments(data: AssignmentRecord[]) {
  localStorage.setItem("unidigital_assignments", JSON.stringify(data));
}
export function getLocalAdmissions(): AdmissionApplication[] {
  return JSON.parse(localStorage.getItem("unidigital_admissions") || "[]");
}
export function saveLocalAdmissions(data: AdmissionApplication[]) {
  localStorage.setItem("unidigital_admissions", JSON.stringify(data));
}
export function getLocalMemos() {
  return JSON.parse(localStorage.getItem("unidigital_memos") || "[]");
}
export function saveLocalMemos(data: unknown[]) {
  localStorage.setItem("unidigital_memos", JSON.stringify(data));
}

// v4 helpers
export function getLocalRegistrations(): CourseRegistration[] {
  return JSON.parse(localStorage.getItem("unidigital_registrations") || "[]");
}
export function saveLocalRegistrations(data: CourseRegistration[]) {
  localStorage.setItem("unidigital_registrations", JSON.stringify(data));
}
export function isRegistrationOpen(): boolean {
  return localStorage.getItem("unidigital_registration_open") === "true";
}
export function setRegistrationOpen(open: boolean) {
  localStorage.setItem("unidigital_registration_open", String(open));
}
export function getLocalTimetable(): TimetableSlot[] {
  return JSON.parse(localStorage.getItem("unidigital_timetable") || "[]");
}
export function saveLocalTimetable(data: TimetableSlot[]) {
  localStorage.setItem("unidigital_timetable", JSON.stringify(data));
}
export function getLocalStudentAttendance(): StudentAttendanceRecord[] {
  return JSON.parse(
    localStorage.getItem("unidigital_student_attendance") || "[]",
  );
}
export function saveLocalStudentAttendance(data: StudentAttendanceRecord[]) {
  localStorage.setItem("unidigital_student_attendance", JSON.stringify(data));
}
export function getLocalDocRequests(): DocRequest[] {
  return JSON.parse(localStorage.getItem("unidigital_doc_requests") || "[]");
}
export function saveLocalDocRequests(data: DocRequest[]) {
  localStorage.setItem("unidigital_doc_requests", JSON.stringify(data));
}
export function getLocalHostelApps(): HostelApplication[] {
  return JSON.parse(localStorage.getItem("unidigital_hostel_apps") || "[]");
}
export function saveLocalHostelApps(data: HostelApplication[]) {
  localStorage.setItem("unidigital_hostel_apps", JSON.stringify(data));
}
export function getLocalBooks(): Book[] {
  return JSON.parse(localStorage.getItem("unidigital_books") || "[]");
}
export function saveLocalBooks(data: Book[]) {
  localStorage.setItem("unidigital_books", JSON.stringify(data));
}
export function getLocalLoans(): BookLoan[] {
  return JSON.parse(localStorage.getItem("unidigital_loans") || "[]");
}
export function saveLocalLoans(data: BookLoan[]) {
  localStorage.setItem("unidigital_loans", JSON.stringify(data));
}

export function computeGPA(
  results: Result[],
  creditMap: Record<string, number>,
): number {
  let totalPoints = 0;
  let totalUnits = 0;
  for (const r of results) {
    const units = creditMap[r.courseCode] || 3;
    totalPoints += r.gradePoint * units;
    totalUnits += units;
  }
  return totalUnits === 0
    ? 0
    : Math.round((totalPoints / totalUnits) * 100) / 100;
}

export function gradeFromScore(score: number): {
  grade: string;
  gradePoint: number;
} {
  if (score >= 70) return { grade: "A", gradePoint: 5 };
  if (score >= 60) return { grade: "B", gradePoint: 4 };
  if (score >= 50) return { grade: "C", gradePoint: 3 };
  if (score >= 45) return { grade: "D", gradePoint: 2 };
  if (score >= 40) return { grade: "E", gradePoint: 1 };
  return { grade: "F", gradePoint: 0 };
}

// === v5 types ===

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type:
    | "Holiday"
    | "Exam"
    | "Lecture"
    | "Deadline"
    | "Semester"
    | "Registration"
    | "Event";
  description?: string;
  session?: string;
  published?: boolean;
}

export interface ExamEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  time: string;
  venue: string;
  invigilator: string;
  department: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: "all" | "students" | "staff";
  date: string;
  author: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  year: number;
  gross: number;
  deductions: number;
  net: number;
}

// v5 helpers
export function getLocalCalendarEvents(): AcademicCalendarEvent[] {
  return JSON.parse(localStorage.getItem("unidigital_calendar_events") || "[]");
}
export function saveLocalCalendarEvents(data: AcademicCalendarEvent[]) {
  localStorage.setItem("unidigital_calendar_events", JSON.stringify(data));
}
export function getLocalExamEntries(): ExamEntry[] {
  return JSON.parse(localStorage.getItem("unidigital_exam_entries") || "[]");
}
export function saveLocalExamEntries(data: ExamEntry[]) {
  localStorage.setItem("unidigital_exam_entries", JSON.stringify(data));
}
export function getLocalAnnouncements(): Announcement[] {
  return JSON.parse(localStorage.getItem("unidigital_announcements") || "[]");
}
export function saveLocalAnnouncements(data: Announcement[]) {
  localStorage.setItem("unidigital_announcements", JSON.stringify(data));
}
export function getLocalPayroll(): PayrollRecord[] {
  return JSON.parse(localStorage.getItem("unidigital_payroll") || "[]");
}
export function saveLocalPayroll(data: PayrollRecord[]) {
  localStorage.setItem("unidigital_payroll", JSON.stringify(data));
}

function initV5Data() {
  if (!localStorage.getItem("unidigital_v5_initialized")) {
    const calendarEvents: AcademicCalendarEvent[] = [
      {
        id: "CAL001",
        title: "First Semester Begins",
        date: "2024-01-15",
        type: "Semester",
        description:
          "Commencement of 2023/2024 First Semester academic activities.",
      },
      {
        id: "CAL002",
        title: "Mid-Semester Break",
        date: "2024-02-19",
        endDate: "2024-02-23",
        type: "Holiday",
        description: "University-wide mid-semester break.",
      },
      {
        id: "CAL003",
        title: "First Semester Examinations",
        date: "2024-03-11",
        endDate: "2024-03-22",
        type: "Exam",
        description: "End-of-semester examinations for all departments.",
      },
      {
        id: "CAL004",
        title: "Project Submission Deadline",
        date: "2024-03-01",
        type: "Deadline",
        description:
          "Final year project submission deadline for all graduating students.",
      },
      {
        id: "CAL005",
        title: "Foundation Day Holiday",
        date: "2024-04-08",
        type: "Holiday",
        description: "University Foundation Day — no academic activities.",
      },
      {
        id: "CAL006",
        title: "Second Semester Begins",
        date: "2024-04-22",
        type: "Semester",
        description: "Commencement of 2023/2024 Second Semester.",
      },
    ];

    const examEntries: ExamEntry[] = [
      {
        id: "EX001",
        courseCode: "CSC301",
        courseTitle: "Data Structures & Algorithms",
        date: "2024-03-11",
        time: "09:00",
        venue: "CBT Centre Hall A",
        invigilator: "Dr. Amaka Eze",
        department: "Computer Science",
      },
      {
        id: "EX002",
        courseCode: "CSC303",
        courseTitle: "Computer Architecture",
        date: "2024-03-12",
        time: "11:00",
        venue: "Exam Hall 2",
        invigilator: "Prof. Bello Umar",
        department: "Computer Science",
      },
      {
        id: "EX003",
        courseCode: "ENG201",
        courseTitle: "Engineering Mathematics II",
        date: "2024-03-13",
        time: "09:00",
        venue: "Main Auditorium",
        invigilator: "Dr. Chukwu Ifeoma",
        department: "Engineering",
      },
      {
        id: "EX004",
        courseCode: "MTH201",
        courseTitle: "Mathematical Methods",
        date: "2024-03-14",
        time: "14:00",
        venue: "Exam Hall 1",
        invigilator: "Dr. Amaka Eze",
        department: "Computer Science",
      },
      {
        id: "EX005",
        courseCode: "PHY202",
        courseTitle: "Modern Physics",
        date: "2024-03-15",
        time: "09:00",
        venue: "Science Block Hall",
        invigilator: "Prof. Suleiman Bako",
        department: "Computer Science",
      },
    ];

    const announcements: Announcement[] = [
      {
        id: "ANN001",
        title: "End-of-Semester Clearance Portal Open",
        body: "All students are required to complete end-of-semester clearance on the portal before sitting for examinations. Ensure your fees are fully paid and library books returned.",
        target: "students",
        date: "2024-03-01",
        author: "Registry",
      },
      {
        id: "ANN002",
        title: "Senate Meeting Notice",
        body: "The 85th Senate Meeting will hold on Friday 8th March 2024 at 10:00 AM in the Senate Chamber. All senate members are expected to attend.",
        target: "staff",
        date: "2024-03-04",
        author: "Vice Chancellor's Office",
      },
      {
        id: "ANN003",
        title: "University Convocation Ceremony",
        body: "The 2024 Convocation Ceremony is scheduled for Saturday 20th April 2024. Graduating students should complete their clearance and collect their gowns from the registry.",
        target: "all",
        date: "2024-03-10",
        author: "Registrar",
      },
      {
        id: "ANN004",
        title: "Library Extended Hours During Exams",
        body: "The university library will operate extended hours (7 AM – 10 PM) during the examination period from 11th to 22nd March 2024.",
        target: "all",
        date: "2024-03-09",
        author: "Library Services",
      },
    ];

    const payroll: PayrollRecord[] = [
      {
        id: "PAY001",
        staffId: "STAFF001",
        staffName: "Dr. Amaka Eze",
        month: "February",
        year: 2024,
        gross: 450000,
        deductions: 67500,
        net: 382500,
      },
      {
        id: "PAY002",
        staffId: "STAFF002",
        staffName: "Prof. Bello Umar",
        month: "February",
        year: 2024,
        gross: 620000,
        deductions: 93000,
        net: 527000,
      },
      {
        id: "PAY003",
        staffId: "STAFF003",
        staffName: "Dr. Chukwu Ifeoma",
        month: "February",
        year: 2024,
        gross: 480000,
        deductions: 72000,
        net: 408000,
      },
      {
        id: "PAY004",
        staffId: "STAFF004",
        staffName: "Mr. Emeka Adaora",
        month: "February",
        year: 2024,
        gross: 310000,
        deductions: 46500,
        net: 263500,
      },
      {
        id: "PAY005",
        staffId: "STAFF001",
        staffName: "Dr. Amaka Eze",
        month: "January",
        year: 2024,
        gross: 450000,
        deductions: 67500,
        net: 382500,
      },
    ];

    localStorage.setItem(
      "unidigital_calendar_events",
      JSON.stringify(calendarEvents),
    );
    localStorage.setItem(
      "unidigital_exam_entries",
      JSON.stringify(examEntries),
    );
    localStorage.setItem(
      "unidigital_announcements",
      JSON.stringify(announcements),
    );
    localStorage.setItem("unidigital_payroll", JSON.stringify(payroll));
    localStorage.setItem("unidigital_v5_initialized", "true");
  }
}

// ========================
// v6: Result Processing
// ========================

export interface CAScore {
  id: string;
  courseCode: string;
  studentMatric: string;
  assignmentScore: number;
  quizScore: number;
  testScore: number;
  totalCA: number;
}

export interface ExamResult {
  id: string;
  courseCode: string;
  studentMatric: string;
  examScore: number;
  totalScore: number;
  grade: string;
  point: number;
  remark: string;
  semester: string;
  session: string;
  status:
    | "draft"
    | "submitted"
    | "hod_approved"
    | "faculty_approved"
    | "senate_approved"
    | "published"
    | "rejected";
  submittedAt?: string;
  publishedAt?: string;
}

export interface ApprovalLog {
  id: string;
  courseCode: string;
  action: string;
  by: string;
  role: string;
  timestamp: string;
  reason?: string;
  semester: string;
}

export interface AcademicStatusRecord {
  studentMatric: string;
  status:
    | "active"
    | "probation"
    | "suspended"
    | "withdrawn"
    | "deferred"
    | "reinstated";
  reason: string;
  date: string;
}

export interface ClearanceRecord {
  studentMatric: string;
  library: boolean;
  department: boolean;
  bursary: boolean;
  completedAt?: string;
}

export interface GradeConfigEntry {
  minScore: number;
  maxScore: number;
  grade: string;
  point: number;
  remark: string;
}

export const DEFAULT_GRADE_CONFIG: GradeConfigEntry[] = [
  { minScore: 70, maxScore: 100, grade: "A", point: 5, remark: "Pass" },
  { minScore: 60, maxScore: 69, grade: "B", point: 4, remark: "Pass" },
  { minScore: 50, maxScore: 59, grade: "C", point: 3, remark: "Pass" },
  { minScore: 45, maxScore: 49, grade: "D", point: 2, remark: "Pass" },
  { minScore: 40, maxScore: 44, grade: "E", point: 1, remark: "Pass" },
  { minScore: 0, maxScore: 39, grade: "F", point: 0, remark: "Fail" },
];

// v6 helpers
export function getLocalGradeConfig(): GradeConfigEntry[] {
  const raw = localStorage.getItem("unidigital_grade_config");
  return raw ? JSON.parse(raw) : DEFAULT_GRADE_CONFIG;
}
export function saveLocalGradeConfig(data: GradeConfigEntry[]) {
  localStorage.setItem("unidigital_grade_config", JSON.stringify(data));
}
export function getLocalCAScores(): CAScore[] {
  return JSON.parse(localStorage.getItem("unidigital_ca_scores") || "[]");
}
export function saveLocalCAScores(data: CAScore[]) {
  localStorage.setItem("unidigital_ca_scores", JSON.stringify(data));
}
export function getLocalExamResults(): ExamResult[] {
  return JSON.parse(localStorage.getItem("unidigital_exam_results") || "[]");
}
export function saveLocalExamResults(data: ExamResult[]) {
  localStorage.setItem("unidigital_exam_results", JSON.stringify(data));
}
export function getLocalApprovalLogs(): ApprovalLog[] {
  return JSON.parse(localStorage.getItem("unidigital_approval_logs") || "[]");
}
export function saveLocalApprovalLogs(data: ApprovalLog[]) {
  localStorage.setItem("unidigital_approval_logs", JSON.stringify(data));
}
export function getLocalAcademicStatuses(): AcademicStatusRecord[] {
  return JSON.parse(
    localStorage.getItem("unidigital_academic_statuses") || "[]",
  );
}
export function saveLocalAcademicStatuses(data: AcademicStatusRecord[]) {
  localStorage.setItem("unidigital_academic_statuses", JSON.stringify(data));
}
export function getLocalClearanceRecords(): ClearanceRecord[] {
  return JSON.parse(
    localStorage.getItem("unidigital_clearance_records") || "[]",
  );
}
export function saveLocalClearanceRecords(data: ClearanceRecord[]) {
  localStorage.setItem("unidigital_clearance_records", JSON.stringify(data));
}

function gradeFromTotalV6(score: number): {
  grade: string;
  point: number;
  remark: string;
} {
  if (score >= 70) return { grade: "A", point: 5, remark: "Pass" };
  if (score >= 60) return { grade: "B", point: 4, remark: "Pass" };
  if (score >= 50) return { grade: "C", point: 3, remark: "Pass" };
  if (score >= 45) return { grade: "D", point: 2, remark: "Pass" };
  if (score >= 40) return { grade: "E", point: 1, remark: "Pass" };
  return { grade: "F", point: 0, remark: "Fail" };
}

function makeExamResult(
  id: string,
  courseCode: string,
  studentMatric: string,
  caTotal: number,
  examScore: number,
  semester: string,
  session: string,
  status: ExamResult["status"],
  submittedAt?: string,
  publishedAt?: string,
): ExamResult {
  const total = caTotal + examScore;
  const g = gradeFromTotalV6(total);
  return {
    id,
    courseCode,
    studentMatric,
    examScore,
    totalScore: total,
    grade: g.grade,
    point: g.point,
    remark: g.remark,
    semester,
    session,
    status,
    submittedAt,
    publishedAt,
  };
}

function initV6Data() {
  if (localStorage.getItem("unidigital_v6_initialized")) return;

  // Seed grade config
  if (!localStorage.getItem("unidigital_grade_config")) {
    localStorage.setItem(
      "unidigital_grade_config",
      JSON.stringify(DEFAULT_GRADE_CONFIG),
    );
  }

  const sem = "2023/2024 First";
  const sess = "2023/2024";

  // CA Scores — students: CSC/2021/001 (Amara), ENG/2021/002 (Emeka), MED/2021/003 (Fatima)
  const caScores: CAScore[] = [
    // Amara — CSC301: high CA
    {
      id: "CA-CSC301-CSC/2021/001",
      courseCode: "CSC301",
      studentMatric: "CSC/2021/001",
      assignmentScore: 9,
      quizScore: 9,
      testScore: 9,
      totalCA: 27,
    },
    // Amara — CSC302
    {
      id: "CA-CSC302-CSC/2021/001",
      courseCode: "CSC302",
      studentMatric: "CSC/2021/001",
      assignmentScore: 8,
      quizScore: 8,
      testScore: 8,
      totalCA: 24,
    },
    // Emeka — ENG201
    {
      id: "CA-ENG201-ENG/2021/002",
      courseCode: "ENG201",
      studentMatric: "ENG/2021/002",
      assignmentScore: 7,
      quizScore: 7,
      testScore: 7,
      totalCA: 21,
    },
    // Emeka — ENG202
    {
      id: "CA-ENG202-ENG/2021/002",
      courseCode: "ENG202",
      studentMatric: "ENG/2021/002",
      assignmentScore: 7,
      quizScore: 6,
      testScore: 7,
      totalCA: 20,
    },
    // Fatima — MED401: low CA
    {
      id: "CA-MED401-MED/2021/003",
      courseCode: "MED401",
      studentMatric: "MED/2021/003",
      assignmentScore: 3,
      quizScore: 3,
      testScore: 3,
      totalCA: 9,
    },
    // Taiwo — CSC301
    {
      id: "CA-CSC301-CSC/2021/006",
      courseCode: "CSC301",
      studentMatric: "CSC/2021/006",
      assignmentScore: 6,
      quizScore: 6,
      testScore: 7,
      totalCA: 19,
    },
  ];

  // Exam Results with various states
  const examResults: ExamResult[] = [
    // Amara CSC301: published, A — contributes to high CGPA ~4.2
    makeExamResult(
      "ER-CSC301-001",
      "CSC301",
      "CSC/2021/001",
      27,
      52,
      sem,
      sess,
      "published",
      "2024-01-10T08:00:00Z",
      "2024-02-01T09:00:00Z",
    ),
    // Amara CSC302: published, B
    makeExamResult(
      "ER-CSC302-001",
      "CSC302",
      "CSC/2021/001",
      24,
      40,
      sem,
      sess,
      "published",
      "2024-01-10T08:00:00Z",
      "2024-02-01T09:00:00Z",
    ),
    // Amara GST101: senate_approved
    makeExamResult(
      "ER-GST101-001",
      "GST101",
      "CSC/2021/001",
      25,
      48,
      sem,
      sess,
      "senate_approved",
      "2024-01-12T08:00:00Z",
    ),

    // Emeka ENG201: hod_approved
    makeExamResult(
      "ER-ENG201-002",
      "ENG201",
      "ENG/2021/002",
      21,
      46,
      sem,
      sess,
      "hod_approved",
      "2024-01-11T08:00:00Z",
    ),
    // Emeka ENG202: submitted
    makeExamResult(
      "ER-ENG202-002",
      "ENG202",
      "ENG/2021/002",
      20,
      40,
      sem,
      sess,
      "submitted",
      "2024-01-13T08:00:00Z",
    ),

    // Fatima MED401: published, F → probation warning (low total)
    makeExamResult(
      "ER-MED401-003",
      "MED401",
      "MED/2021/003",
      9,
      18,
      sem,
      sess,
      "published",
      "2024-01-10T08:00:00Z",
      "2024-02-01T09:00:00Z",
    ),
    // Fatima GST101: rejected
    makeExamResult(
      "ER-GST101-003",
      "GST101",
      "MED/2021/003",
      10,
      15,
      sem,
      sess,
      "rejected",
      "2024-01-14T08:00:00Z",
    ),

    // Taiwo CSC301: draft
    makeExamResult(
      "ER-CSC301-006",
      "CSC301",
      "CSC/2021/006",
      19,
      42,
      sem,
      sess,
      "draft",
    ),
  ];

  // Approval logs
  const approvalLogs: ApprovalLog[] = [
    {
      id: "LOG001",
      courseCode: "CSC301",
      action: "approved",
      by: "Prof. A. Okafor",
      role: "HOD",
      timestamp: "2024-01-15T10:00:00Z",
      semester: sem,
    },
    {
      id: "LOG002",
      courseCode: "CSC301",
      action: "approved",
      by: "Dean Faculty of Science",
      role: "Faculty",
      timestamp: "2024-01-18T11:00:00Z",
      semester: sem,
    },
    {
      id: "LOG003",
      courseCode: "CSC301",
      action: "approved",
      by: "Senate Board",
      role: "Senate",
      timestamp: "2024-01-22T09:00:00Z",
      semester: sem,
    },
    {
      id: "LOG004",
      courseCode: "GST101",
      action: "rejected",
      by: "HOD Registry",
      role: "HOD",
      reason: "Missing scores for 3 students",
      timestamp: "2024-01-16T09:00:00Z",
      semester: sem,
    },
  ];

  // Academic statuses — Fatima on probation
  const academicStatuses: AcademicStatusRecord[] = [
    {
      studentMatric: "MED/2021/003",
      status: "probation",
      reason: "CGPA below minimum threshold (0.27)",
      date: "2024-02-05",
    },
  ];

  localStorage.setItem("unidigital_ca_scores", JSON.stringify(caScores));
  localStorage.setItem("unidigital_exam_results", JSON.stringify(examResults));
  localStorage.setItem(
    "unidigital_approval_logs",
    JSON.stringify(approvalLogs),
  );
  localStorage.setItem(
    "unidigital_academic_statuses",
    JSON.stringify(academicStatuses),
  );
  localStorage.setItem("unidigital_clearance_records", JSON.stringify([]));
  localStorage.setItem("unidigital_v6_initialized", "true");
}

export function initV6() {
  initV6Data();
}

// ========================
// v9: Score Audit, Combined Courses/Results
// ========================

export interface ScoreAuditLog {
  id: string;
  action: "download_template" | "upload_scores";
  courseCode: string;
  semester: string;
  performedBy: string;
  recordCount: number;
  timestamp: string;
}

export interface CombinedCourse {
  id: string;
  combinationCode: string;
  title: string;
  componentA: string;
  componentB: string;
  programme: string;
  level: string;
  weightA: number;
  weightB: number;
}

export interface CombinedResult {
  id: string;
  combinationCode: string;
  studentMatric: string;
  scoreA: number;
  scoreB: number;
  combinedTotal: number;
  grade: string;
  point: number;
  remark: string;
  semester: string;
  session: string;
  status: "draft" | "submitted" | "published";
}

export function getLocalScoreAuditLogs(): ScoreAuditLog[] {
  return JSON.parse(localStorage.getItem("unidigital_score_audit") || "[]");
}
export function saveLocalScoreAuditLogs(data: ScoreAuditLog[]) {
  localStorage.setItem("unidigital_score_audit", JSON.stringify(data));
}
export function addScoreAuditLog(entry: ScoreAuditLog) {
  const logs = getLocalScoreAuditLogs();
  saveLocalScoreAuditLogs([entry, ...logs]);
}

export function getLocalCombinedCourses(): CombinedCourse[] {
  return JSON.parse(
    localStorage.getItem("unidigital_combined_courses") || "[]",
  );
}
export function saveLocalCombinedCourses(data: CombinedCourse[]) {
  localStorage.setItem("unidigital_combined_courses", JSON.stringify(data));
}

export function getLocalCombinedResults(): CombinedResult[] {
  return JSON.parse(
    localStorage.getItem("unidigital_combined_results") || "[]",
  );
}
export function saveLocalCombinedResults(data: CombinedResult[]) {
  localStorage.setItem("unidigital_combined_results", JSON.stringify(data));
}

function initV9Data() {
  if (localStorage.getItem("unidigital_v9_initialized")) return;

  const existingStudents: StudentRecord[] = JSON.parse(
    localStorage.getItem("unidigital_students") || "[]",
  );
  const nceStudents: StudentRecord[] = [
    {
      matricNumber: "NCE/CSC/2023/001",
      name: "Adaugo Nweke",
      email: "adaugo@nce.edu",
      level: "200",
      department: "Computer Science",
    },
    {
      matricNumber: "NCE/CSC/2023/002",
      name: "Usman Garba",
      email: "usman@nce.edu",
      level: "200",
      department: "Computer Science",
    },
    {
      matricNumber: "NCE/CSC/2023/003",
      name: "Blessing Okafor",
      email: "blessing.o@nce.edu",
      level: "200",
      department: "Computer Science",
    },
  ];
  const updatedStudents = [
    ...existingStudents,
    ...nceStudents.filter(
      (ns) => !existingStudents.some((s) => s.matricNumber === ns.matricNumber),
    ),
  ];
  localStorage.setItem("unidigital_students", JSON.stringify(updatedStudents));

  const existingCourses: CourseRecord[] = JSON.parse(
    localStorage.getItem("unidigital_courses") || "[]",
  );
  const nceCourses: CourseRecord[] = [
    {
      code: "NCE-CSC301",
      title: "Computer Science Theory",
      creditUnits: 3,
      department: "Computer Science",
      semester: "2023/2024 First",
      lecturerId: "STF001",
    },
    {
      code: "NCE-PHY201",
      title: "Physics for Education",
      creditUnits: 3,
      department: "Computer Science",
      semester: "2023/2024 First",
      lecturerId: "STF002",
    },
    {
      code: "NCE-MAT201",
      title: "Mathematics for Education",
      creditUnits: 3,
      department: "Computer Science",
      semester: "2023/2024 First",
      lecturerId: "STF002",
    },
    {
      code: "NCE-EDU101",
      title: "Education Foundations",
      creditUnits: 2,
      department: "Computer Science",
      semester: "2023/2024 First",
      lecturerId: "STF001",
    },
  ];
  const updatedCourses = [
    ...existingCourses,
    ...nceCourses.filter(
      (nc) => !existingCourses.some((c) => c.code === nc.code),
    ),
  ];
  localStorage.setItem("unidigital_courses", JSON.stringify(updatedCourses));

  const combinedCourses: CombinedCourse[] = [
    {
      id: "COMB-001",
      combinationCode: "NCE-CSC+PHY",
      title: "Computer Science + Physics",
      componentA: "NCE-CSC301",
      componentB: "NCE-PHY201",
      programme: "NCE",
      level: "200",
      weightA: 50,
      weightB: 50,
    },
    {
      id: "COMB-002",
      combinationCode: "NCE-CSC+MAT",
      title: "Computer Science + Mathematics",
      componentA: "NCE-CSC301",
      componentB: "NCE-MAT201",
      programme: "NCE",
      level: "200",
      weightA: 50,
      weightB: 50,
    },
    {
      id: "COMB-003",
      combinationCode: "NCE-BIO+CSC",
      title: "Biology + Computer Science",
      componentA: "NCE-BIO201",
      componentB: "NCE-CSC201",
      programme: "NCE",
      level: "2",
      weightA: 50,
      weightB: 50,
    },
  ];
  saveLocalCombinedCourses(combinedCourses);

  localStorage.setItem("unidigital_v9_initialized", "1");
}

export function initV9() {
  initV9Data();
}

// ========================
// Handwriting Score Sheet Scanner types
// ========================
export interface HandwrittenScoreEntry {
  id: string;
  courseCode: string;
  studentMatric: string;
  studentName: string;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remarks: string;
  confidence: number; // AI extraction confidence 0-100
  scanStatus: "pending" | "extracted" | "verified" | "error";
  rawImageBlobId?: string;
  extractedAt?: string;
}

export function getLocalHandwrittenEntries(): HandwrittenScoreEntry[] {
  return JSON.parse(
    localStorage.getItem("unidigital_handwritten_entries") || "[]",
  );
}
export function saveLocalHandwrittenEntries(data: HandwrittenScoreEntry[]) {
  localStorage.setItem("unidigital_handwritten_entries", JSON.stringify(data));
}

// ========================
// v19: Multi-institution student records with real data
// ========================

function scoreToGradeInfo(score: number): {
  grade: string;
  gradePoint: number;
} {
  if (score >= 70) return { grade: "A", gradePoint: 5 };
  if (score >= 60) return { grade: "B", gradePoint: 4 };
  if (score >= 50) return { grade: "C", gradePoint: 3 };
  if (score >= 45) return { grade: "D", gradePoint: 2 };
  if (score >= 40) return { grade: "E", gradePoint: 1 };
  return { grade: "F", gradePoint: 0 };
}

function makeResult(
  id: string,
  studentMatric: string,
  courseCode: string,
  semester: string,
  score: number,
): Result {
  const { grade, gradePoint } = scoreToGradeInfo(score);
  return { id, studentMatric, courseCode, semester, score, grade, gradePoint };
}

function initV19Data() {
  if (localStorage.getItem("unidigital_v19_initialized")) return;

  // ---- NEW STUDENTS ----
  const newStudents: StudentRecord[] = [
    // College of Education students
    {
      matricNumber: "FCE/EDU/2021/001",
      name: "Abubakar Ibrahim Aliyu",
      email: "abubakar@student.edu",
      level: "300",
      department: "Education",
      subCombination: "CSC/MAT",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/EDU/2021/002",
      name: "Halima Usman Bello",
      email: "halima@student.edu",
      level: "300",
      department: "Education",
      subCombination: "PHY/CHE",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/EDU/2021/003",
      name: "Musa Abdullahi Kolo",
      email: "musa@student.edu",
      level: "200",
      department: "Education",
      subCombination: "CSC/PHY",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/EDU/2021/004",
      name: "Fatimah Sule Ibrahim",
      email: "fatimah@student.edu",
      level: "200",
      department: "Education",
      subCombination: "MAT/CHE",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/EDU/2021/005",
      name: "Yusuf Mohammed Tanko",
      email: "yusuf@student.edu",
      level: "100",
      department: "Education",
      subCombination: "GSE/EDU",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/GSE/2021/006",
      name: "Blessing Okafor Chukwu",
      email: "blessing@student.edu",
      level: "300",
      department: "General Studies",
      subCombination: "ENG/LIT",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/GSE/2021/007",
      name: "Emmanuel Adamu Garba",
      email: "emmanuel@student.edu",
      level: "200",
      department: "General Studies",
      subCombination: "ENG/SST",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/TP/2021/008",
      name: "Ngozi Obinna Nwosu",
      email: "ngozi.tp@student.edu",
      level: "300",
      department: "Technical & Professional",
      institutionCategory: "college_of_education",
    },
    {
      matricNumber: "FCE/TP/2021/009",
      name: "Chidinma Eze Okeke",
      email: "chidinma@student.edu",
      level: "200",
      department: "Technical & Professional",
      institutionCategory: "college_of_education",
    },
    // University students
    {
      matricNumber: "UNIV/CSC/2021/010",
      name: "Adewale Ogundimu Seun",
      email: "adewale@student.edu",
      level: "400",
      department: "Computer Science",
      institutionCategory: "university",
    },
    {
      matricNumber: "UNIV/CSC/2021/011",
      name: "Chiamaka Nwosu Ada",
      email: "chiamaka@student.edu",
      level: "300",
      department: "Computer Science",
      institutionCategory: "university",
    },
    {
      matricNumber: "UNIV/ENG/2021/012",
      name: "Emeka Obiechina Chuka",
      email: "emeka.u@student.edu",
      level: "200",
      department: "Engineering",
      institutionCategory: "university",
    },
    {
      matricNumber: "UNIV/MED/2021/013",
      name: "Amaka Nwachukwu Chidi",
      email: "amaka@student.edu",
      level: "400",
      department: "Medicine",
      institutionCategory: "university",
    },
    {
      matricNumber: "UNIV/LAW/2021/014",
      name: "Taiwo Adeleke Rotimi",
      email: "taiwo@student.edu",
      level: "300",
      department: "Law",
      institutionCategory: "university",
    },
    // Polytechnic students
    {
      matricNumber: "POLY/CSC/2021/015",
      name: "Abdulrahman Lawal Sani",
      email: "abdulrahman@student.edu",
      level: "ND2",
      department: "Computer Science",
      institutionCategory: "polytechnic",
    },
    {
      matricNumber: "POLY/BUS/2021/016",
      name: "Grace Uchenna Nkem",
      email: "grace@student.edu",
      level: "HND1",
      department: "Business Administration",
      institutionCategory: "polytechnic",
    },
    {
      matricNumber: "POLY/EEC/2021/017",
      name: "Aisha Balarabe Kudi",
      email: "aisha@student.edu",
      level: "ND1",
      department: "Electrical/Electronics",
      institutionCategory: "polytechnic",
    },
    {
      matricNumber: "POLY/MEC/2021/018",
      name: "Sunday Adesanya Gbenga",
      email: "sunday@student.edu",
      level: "HND2",
      department: "Mechanical Engineering",
      institutionCategory: "polytechnic",
    },
    {
      matricNumber: "POLY/ACC/2021/019",
      name: "Zainab Abdullahi Fatima",
      email: "zainab@student.edu",
      level: "ND2",
      department: "Accountancy",
      institutionCategory: "polytechnic",
    },
  ];

  // Merge new students into existing
  const existing = JSON.parse(
    localStorage.getItem("unidigital_students") || "[]",
  ) as StudentRecord[];
  const existingMatrics = new Set(
    existing.map((s: StudentRecord) => s.matricNumber),
  );
  const merged = [
    ...existing,
    ...newStudents.filter((s) => !existingMatrics.has(s.matricNumber)),
  ];
  localStorage.setItem("unidigital_students", JSON.stringify(merged));

  // ---- NEW RESULTS ----
  const newResults: Result[] = [];
  let rIdx = 5000;
  const rid = () => `RV19_${rIdx++}`;

  // ---- CoE EDU CSC/MAT student: FCE/EDU/2021/001 (Abubakar) - Level 300, has 100,200,300 data ----
  const abubakarMatric = "FCE/EDU/2021/001";
  const abubakarResults: [string, string, number][] = [
    // NCE I (100 Level) - EDU courses
    ["EDU111", "2021/2022 First", 72],
    ["EDU112", "2021/2022 First", 65],
    ["EDU113", "2021/2022 First", 58],
    ["EDU121", "2021/2022 Second", 70],
    ["EDU122", "2021/2022 Second", 63],
    ["EDU123", "2021/2022 Second", 55],
    ["EDU124", "2021/2022 Second", 68],
    ["EDU125", "2021/2022 Second", 60],
    // NCE I - GSE courses
    ["GSE111", "2021/2022 First", 74],
    ["GSE112", "2021/2022 First", 68],
    ["GSE113", "2021/2022 First", 52],
    ["GSE121", "2021/2022 Second", 71],
    ["GSE122", "2021/2022 Second", 66],
    ["GSE123", "2021/2022 Second", 59],
    // NCE I - Subject courses (CSC)
    ["CSC111", "2021/2022 First", 75],
    ["CSC112", "2021/2022 First", 69],
    ["CSC121", "2021/2022 Second", 64],
    ["CSC122", "2021/2022 Second", 57],
    ["MAT111", "2021/2022 First", 73],
    ["MAT112", "2021/2022 First", 61],
    // NCE II (200 Level)
    ["EDU211", "2022/2023 First", 76],
    ["EDU212", "2022/2023 First", 69],
    ["EDU213", "2022/2023 First", 62],
    ["EDU221", "2022/2023 Second", 71],
    ["EDU222", "2022/2023 Second", 65],
    ["EDU223", "2022/2023 Second", 58],
    ["CSC211", "2022/2023 First", 78],
    ["CSC212", "2022/2023 First", 72],
    ["CSC221", "2022/2023 Second", 67],
    ["MAT211", "2022/2023 First", 80],
    ["MAT212", "2022/2023 First", 74],
    // NCE III (300 Level)
    ["EDU311", "2023/2024 First", 82],
    ["EDU321", "2023/2024 Second", 77],
    ["EDU322", "2023/2024 Second", 73],
    ["CSC311", "2023/2024 First", 85],
    ["CSC321", "2023/2024 Second", 79],
    ["CSC322", "2023/2024 Second", 71],
  ];
  for (const [code, sem, score] of abubakarResults) {
    newResults.push(makeResult(rid(), abubakarMatric, code, sem, score));
  }

  // ---- CoE EDU PHY/CHE student: FCE/EDU/2021/002 (Halima) - Level 300 ----
  const halimaMatric = "FCE/EDU/2021/002";
  const halimaResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 68],
    ["EDU112", "2021/2022 First", 74],
    ["EDU113", "2021/2022 First", 62],
    ["EDU121", "2021/2022 Second", 77],
    ["EDU122", "2021/2022 Second", 70],
    ["EDU123", "2021/2022 Second", 65],
    ["GSE111", "2021/2022 First", 72],
    ["GSE112", "2021/2022 First", 66],
    ["GSE121", "2021/2022 Second", 69],
    ["PHY111", "2021/2022 First", 71],
    ["PHY112", "2021/2022 First", 65],
    ["CHE111", "2021/2022 First", 74],
    ["CHE112", "2021/2022 First", 68],
    ["EDU211", "2022/2023 First", 79],
    ["EDU212", "2022/2023 First", 72],
    ["EDU221", "2022/2023 Second", 75],
    ["PHY211", "2022/2023 First", 73],
    ["CHE211", "2022/2023 First", 77],
    ["EDU311", "2023/2024 First", 83],
    ["EDU321", "2023/2024 Second", 80],
    ["EDU322", "2023/2024 Second", 76],
    ["PHY311", "2023/2024 First", 78],
    ["CHE311", "2023/2024 First", 81],
  ];
  for (const [code, sem, score] of halimaResults) {
    newResults.push(makeResult(rid(), halimaMatric, code, sem, score));
  }

  // ---- CoE EDU CSC/PHY student: FCE/EDU/2021/003 (Musa) - Level 200 ----
  const musaMatric = "FCE/EDU/2021/003";
  const musaResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 64],
    ["EDU112", "2021/2022 First", 58],
    ["EDU121", "2021/2022 Second", 66],
    ["EDU122", "2021/2022 Second", 60],
    ["GSE111", "2021/2022 First", 67],
    ["GSE112", "2021/2022 First", 61],
    ["CSC111", "2021/2022 First", 70],
    ["CSC112", "2021/2022 First", 65],
    ["PHY111", "2021/2022 First", 62],
    ["EDU211", "2022/2023 First", 69],
    ["EDU212", "2022/2023 First", 63],
    ["EDU221", "2022/2023 Second", 72],
    ["CSC211", "2022/2023 First", 74],
    ["PHY211", "2022/2023 First", 68],
  ];
  for (const [code, sem, score] of musaResults) {
    newResults.push(makeResult(rid(), musaMatric, code, sem, score));
  }

  // ---- CoE EDU MAT/CHE: FCE/EDU/2021/004 (Fatimah) - Level 200 ----
  const fatimahMatric = "FCE/EDU/2021/004";
  const fatimahResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 77],
    ["EDU112", "2021/2022 First", 71],
    ["EDU121", "2021/2022 Second", 80],
    ["GSE111", "2021/2022 First", 75],
    ["GSE121", "2021/2022 Second", 78],
    ["MAT111", "2021/2022 First", 82],
    ["MAT112", "2021/2022 First", 76],
    ["CHE111", "2021/2022 First", 79],
    ["CHE112", "2021/2022 First", 73],
    ["EDU211", "2022/2023 First", 84],
    ["EDU221", "2022/2023 Second", 80],
    ["MAT211", "2022/2023 First", 86],
    ["CHE211", "2022/2023 First", 83],
  ];
  for (const [code, sem, score] of fatimahResults) {
    newResults.push(makeResult(rid(), fatimahMatric, code, sem, score));
  }

  // ---- CoE EDU Level 100: FCE/EDU/2021/005 (Yusuf) ----
  const yusufMatric = "FCE/EDU/2021/005";
  const yusufResults: [string, string, number][] = [
    ["EDU111", "2023/2024 First", 55],
    ["EDU112", "2023/2024 First", 48],
    ["EDU113", "2023/2024 First", 51],
    ["EDU121", "2023/2024 Second", 60],
    ["EDU122", "2023/2024 Second", 53],
    ["EDU123", "2023/2024 Second", 47],
    ["GSE111", "2023/2024 First", 62],
    ["GSE112", "2023/2024 First", 56],
    ["GSE121", "2023/2024 Second", 58],
    ["GSE122", "2023/2024 Second", 50],
  ];
  for (const [code, sem, score] of yusufResults) {
    newResults.push(makeResult(rid(), yusufMatric, code, sem, score));
  }

  // ---- CoE GSE ENG/LIT: FCE/GSE/2021/006 (Blessing) - Level 300 ----
  const blessingMatric = "FCE/GSE/2021/006";
  const blessingResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 70],
    ["EDU112", "2021/2022 First", 67],
    ["EDU121", "2021/2022 Second", 73],
    ["GSE111", "2021/2022 First", 76],
    ["GSE112", "2021/2022 First", 72],
    ["GSE113", "2021/2022 First", 65],
    ["GSE121", "2021/2022 Second", 79],
    ["GSE122", "2021/2022 Second", 74],
    ["EDU211", "2022/2023 First", 75],
    ["EDU221", "2022/2023 Second", 78],
    ["GSE211", "2022/2023 First", 80],
    ["EDU311", "2023/2024 First", 84],
    ["EDU321", "2023/2024 Second", 81],
    ["GSE321", "2023/2024 Second", 77],
  ];
  for (const [code, sem, score] of blessingResults) {
    newResults.push(makeResult(rid(), blessingMatric, code, sem, score));
  }

  // ---- CoE GSE: FCE/GSE/2021/007 (Emmanuel) - Level 200 ----
  const emmanuelMatric = "FCE/GSE/2021/007";
  const emmanuelResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 63],
    ["EDU121", "2021/2022 Second", 68],
    ["GSE111", "2021/2022 First", 71],
    ["GSE112", "2021/2022 First", 65],
    ["GSE121", "2021/2022 Second", 70],
    ["GSE122", "2021/2022 Second", 62],
    ["EDU211", "2022/2023 First", 72],
    ["EDU221", "2022/2023 Second", 75],
    ["GSE211", "2022/2023 First", 77],
  ];
  for (const [code, sem, score] of emmanuelResults) {
    newResults.push(makeResult(rid(), emmanuelMatric, code, sem, score));
  }

  // ---- CoE TP: FCE/TP/2021/008 (Ngozi) - Level 300 ----
  const ngoziTpMatric = "FCE/TP/2021/008";
  const ngoziTpResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 66],
    ["EDU121", "2021/2022 Second", 71],
    ["GSE111", "2021/2022 First", 68],
    ["TP111", "2021/2022 First", 73],
    ["TP112", "2021/2022 First", 69],
    ["TP121", "2021/2022 Second", 75],
    ["EDU211", "2022/2023 First", 74],
    ["EDU221", "2022/2023 Second", 78],
    ["TP211", "2022/2023 First", 80],
    ["EDU311", "2023/2024 First", 82],
    ["TP311", "2023/2024 First", 85],
    ["TP321", "2023/2024 Second", 79],
  ];
  for (const [code, sem, score] of ngoziTpResults) {
    newResults.push(makeResult(rid(), ngoziTpMatric, code, sem, score));
  }

  // ---- CoE TP: FCE/TP/2021/009 (Chidinma) - Level 200 ----
  const chidinmaMatric = "FCE/TP/2021/009";
  const chidinmaResults: [string, string, number][] = [
    ["EDU111", "2021/2022 First", 60],
    ["EDU121", "2021/2022 Second", 65],
    ["GSE111", "2021/2022 First", 63],
    ["TP111", "2021/2022 First", 67],
    ["TP121", "2021/2022 Second", 70],
    ["EDU211", "2022/2023 First", 68],
    ["TP211", "2022/2023 First", 72],
  ];
  for (const [code, sem, score] of chidinmaResults) {
    newResults.push(makeResult(rid(), chidinmaMatric, code, sem, score));
  }

  // ---- University CSC Level 400: UNIV/CSC/2021/010 (Adewale) ----
  const adewaleMatric = "UNIV/CSC/2021/010";
  const adewaleResults: [string, string, number][] = [
    ["CSC101", "2021/2022 First", 78],
    ["CSC102", "2021/2022 First", 72],
    ["MTH101", "2021/2022 First", 75],
    ["CSC103", "2021/2022 Second", 80],
    ["MTH102", "2021/2022 Second", 69],
    ["CSC201", "2022/2023 First", 82],
    ["CSC202", "2022/2023 First", 77],
    ["CSC203", "2022/2023 Second", 74],
    ["CSC204", "2022/2023 Second", 71],
    ["MTH201", "2022/2023 First", 76],
    ["CSC301", "2023/2024 First", 85],
    ["CSC302", "2023/2024 First", 80],
    ["CSC303", "2023/2024 Second", 78],
    ["CSC304", "2023/2024 Second", 73],
    ["MTH301", "2023/2024 First", 81],
    ["CSC401", "2024/2025 First", 88],
    ["CSC402", "2024/2025 First", 83],
    ["CSC403", "2024/2025 Second", 79],
    ["CSC404", "2024/2025 Second", 76],
    ["CSC499", "2024/2025 Second", 90],
  ];
  for (const [code, sem, score] of adewaleResults) {
    newResults.push(makeResult(rid(), adewaleMatric, code, sem, score));
  }

  // ---- University CSC Level 300: UNIV/CSC/2021/011 (Chiamaka) ----
  const chiamakaMatric = "UNIV/CSC/2021/011";
  const chiamakaResults: [string, string, number][] = [
    ["CSC101", "2021/2022 First", 72],
    ["CSC102", "2021/2022 First", 68],
    ["MTH101", "2021/2022 First", 70],
    ["CSC103", "2021/2022 Second", 75],
    ["MTH102", "2021/2022 Second", 64],
    ["CSC201", "2022/2023 First", 76],
    ["CSC202", "2022/2023 First", 71],
    ["CSC203", "2022/2023 Second", 69],
    ["MTH201", "2022/2023 First", 73],
    ["CSC301", "2023/2024 First", 80],
    ["CSC302", "2023/2024 First", 75],
    ["CSC303", "2023/2024 Second", 72],
  ];
  for (const [code, sem, score] of chiamakaResults) {
    newResults.push(makeResult(rid(), chiamakaMatric, code, sem, score));
  }

  // ---- University ENG Level 200: UNIV/ENG/2021/012 (Emeka) ----
  const emekaUMatric = "UNIV/ENG/2021/012";
  const emekaUResults: [string, string, number][] = [
    ["ENG101", "2021/2022 First", 65],
    ["ENG102", "2021/2022 First", 60],
    ["MTH101", "2021/2022 First", 68],
    ["ENG103", "2021/2022 Second", 62],
    ["PHY101", "2021/2022 First", 66],
    ["ENG201", "2022/2023 First", 70],
    ["ENG202", "2022/2023 First", 67],
    ["ENG203", "2022/2023 Second", 63],
    ["MTH201", "2022/2023 First", 71],
  ];
  for (const [code, sem, score] of emekaUResults) {
    newResults.push(makeResult(rid(), emekaUMatric, code, sem, score));
  }

  // ---- University MED Level 400: UNIV/MED/2021/013 (Amaka) ----
  const amakaMatric = "UNIV/MED/2021/013";
  const amakaResults: [string, string, number][] = [
    ["MED101", "2021/2022 First", 82],
    ["MED102", "2021/2022 First", 78],
    ["BCH101", "2021/2022 First", 80],
    ["ANA101", "2021/2022 Second", 76],
    ["PHY101", "2021/2022 First", 74],
    ["MED201", "2022/2023 First", 85],
    ["MED202", "2022/2023 First", 83],
    ["ANA201", "2022/2023 Second", 81],
    ["MED301", "2023/2024 First", 88],
    ["MED302", "2023/2024 First", 84],
    ["PAT301", "2023/2024 Second", 80],
    ["MED401", "2024/2025 First", 90],
    ["MED402", "2024/2025 First", 87],
    ["MED499", "2024/2025 Second", 92],
  ];
  for (const [code, sem, score] of amakaResults) {
    newResults.push(makeResult(rid(), amakaMatric, code, sem, score));
  }

  // ---- University LAW Level 300: UNIV/LAW/2021/014 (Taiwo) ----
  const taiwoMatric = "UNIV/LAW/2021/014";
  const taiwoResults: [string, string, number][] = [
    ["LAW101", "2021/2022 First", 70],
    ["LAW102", "2021/2022 First", 65],
    ["GST101", "2021/2022 First", 68],
    ["LAW103", "2021/2022 Second", 72],
    ["GST102", "2021/2022 Second", 66],
    ["LAW201", "2022/2023 First", 74],
    ["LAW202", "2022/2023 First", 70],
    ["LAW203", "2022/2023 Second", 68],
    ["LAW301", "2023/2024 First", 77],
    ["LAW302", "2023/2024 First", 73],
    ["LAW303", "2023/2024 Second", 71],
  ];
  for (const [code, sem, score] of taiwoResults) {
    newResults.push(makeResult(rid(), taiwoMatric, code, sem, score));
  }

  // ---- Polytechnic CSC ND2: POLY/CSC/2021/015 (Abdulrahman) ----
  const abdulMatric = "POLY/CSC/2021/015";
  const abdulResults: [string, string, number][] = [
    ["COM101", "2021/2022 First", 68],
    ["MTH101", "2021/2022 First", 64],
    ["ENG101", "2021/2022 First", 66],
    ["COM102", "2021/2022 Second", 72],
    ["COM103", "2021/2022 Second", 69],
    ["COM201", "2022/2023 First", 75],
    ["COM202", "2022/2023 First", 71],
    ["MTH201", "2022/2023 First", 73],
    ["COM203", "2022/2023 Second", 78],
    ["COM204", "2022/2023 Second", 74],
  ];
  for (const [code, sem, score] of abdulResults) {
    newResults.push(makeResult(rid(), abdulMatric, code, sem, score));
  }

  // ---- Polytechnic BUS HND1: POLY/BUS/2021/016 (Grace) ----
  const graceMatric = "POLY/BUS/2021/016";
  const graceResults: [string, string, number][] = [
    ["BUS101", "2021/2022 First", 70],
    ["ACC101", "2021/2022 First", 75],
    ["ECO101", "2021/2022 First", 68],
    ["BUS102", "2021/2022 Second", 72],
    ["ACC102", "2021/2022 Second", 77],
    ["BUS201", "2022/2023 First", 74],
    ["MGT201", "2022/2023 First", 80],
    ["ACC201", "2022/2023 Second", 82],
    ["BUS301", "2023/2024 First", 83],
    ["MGT301", "2023/2024 First", 85],
  ];
  for (const [code, sem, score] of graceResults) {
    newResults.push(makeResult(rid(), graceMatric, code, sem, score));
  }

  // ---- Polytechnic EEC ND1: POLY/EEC/2021/017 (Aisha) ----
  const aishaMatric = "POLY/EEC/2021/017";
  const aishaResults: [string, string, number][] = [
    ["EEC101", "2023/2024 First", 60],
    ["MTH101", "2023/2024 First", 55],
    ["PHY101", "2023/2024 First", 58],
    ["EEC102", "2023/2024 Second", 63],
    ["EEC103", "2023/2024 Second", 57],
    ["ENG101", "2023/2024 First", 62],
  ];
  for (const [code, sem, score] of aishaResults) {
    newResults.push(makeResult(rid(), aishaMatric, code, sem, score));
  }

  // ---- Polytechnic MEC HND2: POLY/MEC/2021/018 (Sunday) ----
  const sundayMatric = "POLY/MEC/2021/018";
  const sundayResults: [string, string, number][] = [
    ["MEC101", "2021/2022 First", 65],
    ["MTH101", "2021/2022 First", 62],
    ["PHY101", "2021/2022 First", 68],
    ["MEC102", "2021/2022 Second", 70],
    ["MEC103", "2021/2022 Second", 66],
    ["MEC201", "2022/2023 First", 72],
    ["MEC202", "2022/2023 First", 69],
    ["MEC203", "2022/2023 Second", 75],
    ["MEC301", "2023/2024 First", 78],
    ["MEC302", "2023/2024 First", 74],
    ["MEC303", "2023/2024 Second", 80],
    ["MEC401", "2024/2025 First", 82],
    ["MEC402", "2024/2025 First", 79],
    ["MEC499", "2024/2025 Second", 85],
  ];
  for (const [code, sem, score] of sundayResults) {
    newResults.push(makeResult(rid(), sundayMatric, code, sem, score));
  }

  // ---- Polytechnic ACC ND2: POLY/ACC/2021/019 (Zainab) ----
  const zainabMatric = "POLY/ACC/2021/019";
  const zainabResults: [string, string, number][] = [
    ["ACC101", "2021/2022 First", 74],
    ["BUS101", "2021/2022 First", 70],
    ["ECO101", "2021/2022 First", 66],
    ["ACC102", "2021/2022 Second", 78],
    ["ACC103", "2021/2022 Second", 72],
    ["MTH101", "2021/2022 First", 68],
    ["ACC201", "2022/2023 First", 80],
    ["ACC202", "2022/2023 First", 77],
    ["BUS201", "2022/2023 First", 75],
    ["ACC203", "2022/2023 Second", 83],
    ["ECO201", "2022/2023 Second", 71],
  ];
  for (const [code, sem, score] of zainabResults) {
    newResults.push(makeResult(rid(), zainabMatric, code, sem, score));
  }

  // Merge results
  const existingResults = JSON.parse(
    localStorage.getItem("unidigital_results") || "[]",
  ) as Result[];
  const mergedResults = [...existingResults, ...newResults];
  localStorage.setItem("unidigital_results", JSON.stringify(mergedResults));

  localStorage.setItem("unidigital_v19_initialized", "true");
}

export function initV19() {
  initV19Data();
}

// ========================
// FUEK Course Catalog — full programme dataset
// ========================

export function getLocalCatalogCourses(): LocalCourse[] {
  return JSON.parse(localStorage.getItem("unidigital_catalog_courses") || "[]");
}

export function saveLocalCatalogCourses(data: LocalCourse[]) {
  localStorage.setItem("unidigital_catalog_courses", JSON.stringify(data));
}

/**
 * Seeds the full FUEK course catalog into localStorage if fewer than 50
 * entries exist. This ensures course registration and catalog pages always
 * have real course data available.
 */
export function initFuekCourses() {
  const existing = getLocalCatalogCourses();
  if (existing.length >= 50) return;

  const mapped: LocalCourse[] = ALL_FUEK_COURSES.map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    creditUnits: c.creditUnits,
    type: c.type,
    department: c.department,
    level: c.level,
    semester: c.semester,
    prerequisites: c.prerequisites,
    isGST: c.isGST,
    programmeType: c.programmeType,
    subjectArea: c.subjectArea,
    isAvailable: true,
    description: `${c.programmeType} ${String(c.level) === "Batch" ? "Certificate Batch" : `Level ${String(c.level)}`} — ${c.type === "compulsory" ? "Compulsory" : "Elective"} (${c.creditUnits} units)`,
  }));

  saveLocalCatalogCourses(mapped);
}
