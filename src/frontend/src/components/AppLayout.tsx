import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Database,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  FlaskConical,
  GitMerge,
  Globe,
  GraduationCap,
  HeartHandshake,
  Home,
  LayoutDashboard,
  Library,
  ListChecks,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Moon,
  NotebookText,
  PlayCircle,
  Receipt,
  RefreshCw,
  ScanLine,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ModuleDisabledScreen } from "../components/ModuleDisabledScreen";
import { useModuleGating } from "../contexts/ModuleGatingContext";
import { useNotifications } from "../contexts/NotificationsContext";
import { cn } from "../lib/utils";
import { getPhoto } from "../utils/auditUtils";
import { getLocalStaff, getLocalStudents } from "../utils/sampleData";
import { OfflineBanner } from "./OfflineBanner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet, SheetContent } from "./ui/sheet";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  key: string;
}

const navByRole: Record<string, NavItem[]> = {
  admin: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "Students", icon: <GraduationCap size={18} />, key: "students" },
    { label: "Courses", icon: <BookOpen size={18} />, key: "courses" },
    { label: "Staff", icon: <Users size={18} />, key: "staff" },
    { label: "Admissions", icon: <UserCheck size={18} />, key: "admissions" },
    { label: "Memos", icon: <FileText size={18} />, key: "memos" },
    { label: "Reports", icon: <ClipboardList size={18} />, key: "reports" },
    {
      label: "Registrations",
      icon: <ClipboardCheck size={18} />,
      key: "registration-admin",
    },
    {
      label: "Timetable",
      icon: <Calendar size={18} />,
      key: "timetable-admin",
    },
    {
      label: "Attendance Reports",
      icon: <UserCheck size={18} />,
      key: "attendance-admin",
    },
    {
      label: "Document Requests",
      icon: <FileText size={18} />,
      key: "documents-admin",
    },
    { label: "Hostel", icon: <Home size={18} />, key: "hostel-admin" },
    { label: "Library", icon: <Library size={18} />, key: "library-admin" },
    {
      label: "Academic Calendar",
      icon: <CalendarDays size={18} />,
      key: "academic-calendar",
    },
    {
      label: "Exam Schedule",
      icon: <ClipboardCheck size={18} />,
      key: "exam-schedule-admin",
    },
    {
      label: "Announcements",
      icon: <Megaphone size={18} />,
      key: "announcements-admin",
    },
    {
      label: "Grade Config",
      icon: <Settings size={18} />,
      key: "grade-config",
    },
    {
      label: "Result Approval",
      icon: <ClipboardCheck size={18} />,
      key: "result-approval-admin",
    },
    {
      label: "Result Publication",
      icon: <Globe size={18} />,
      key: "result-publication",
    },
    {
      label: "Academic Status",
      icon: <TrendingUp size={18} />,
      key: "academic-status",
    },
    {
      label: "Graduation & Clearance",
      icon: <GraduationCap size={18} />,
      key: "graduation-clearance",
    },
    {
      label: "Analytics V2",
      icon: <BarChart3 size={18} />,
      key: "analytics-v2",
    },
    {
      label: "Data Import/Export",
      icon: <Database size={18} />,
      key: "data-import",
    },
    {
      label: "AI & Analytics",
      icon: <Sparkles size={18} />,
      key: "ai-dashboard",
    },
    {
      label: "Progression",
      icon: <TrendingUp size={18} />,
      key: "progression-admin",
    },
    { label: "Appraisals", icon: <Star size={18} />, key: "appraisal-admin" },
    {
      label: "Alumni Mgmt",
      icon: <GraduationCap size={18} />,
      key: "alumni-admin",
    },
    {
      label: "Documents & Scans",
      icon: <ScanLine size={18} />,
      key: "documents-scans-admin",
    },
    {
      label: "Combination Courses",
      icon: <GitMerge size={18} />,
      key: "combination-courses",
    },
    {
      label: "Score Audit Log",
      icon: <ScrollText size={18} />,
      key: "score-audit-log",
    },
    {
      label: "Score Sheet Results",
      icon: <FileSpreadsheet size={18} />,
      key: "score-sheet-results",
    },
    {
      label: "Result Sheet",
      icon: <FileSpreadsheet size={18} />,
      key: "result-sheet-admin",
    },
    {
      label: "Faculty Results",
      icon: <Building2 size={18} />,
      key: "faculty-results",
    },
    {
      label: "Senate Presentation",
      icon: <ScrollText size={18} />,
      key: "senate-presentation",
    },
    {
      label: "Promotion Results",
      icon: <Award size={18} />,
      key: "promotion-results",
    },
    {
      label: "Pass/Fail Lists",
      icon: <ListChecks size={18} />,
      key: "pass-fail-lists",
    },
    {
      label: "Student Records",
      icon: <FileSpreadsheet size={18} />,
      key: "student-records",
    },
    {
      label: "Transcripts",
      icon: <FileText size={18} />,
      key: "transcript-management",
    },
    {
      label: "Dept. Analytics",
      icon: <BarChart3 size={18} />,
      key: "dept-analytics",
    },
    {
      label: "Analytics Dashboard",
      icon: <BarChart3 size={18} />,
      key: "analytics-dashboard",
    },
    {
      label: "Hostel Allocation",
      icon: <Home size={18} />,
      key: "hostel-allocation",
    },
    {
      label: "Hostel Transfers",
      icon: <RefreshCw size={18} />,
      key: "hostel-transfers",
    },
    {
      label: "Timetable Conflicts",
      icon: <Calendar size={18} />,
      key: "timetable-conflicts",
    },
    {
      label: "CBT Analytics",
      icon: <BarChart3 size={18} />,
      key: "cbt-analytics",
    },
    {
      label: "CBT Re-sits",
      icon: <ClipboardCheck size={18} />,
      key: "cbt-resit",
    },
    { label: "Settings", icon: <Settings size={18} />, key: "settings" },
    {
      label: "Disciplinary Records",
      icon: <Shield size={18} />,
      key: "disciplinary-records",
    },
    {
      label: "Meeting Minutes",
      icon: <NotebookText size={18} />,
      key: "senate-minutes",
    },
    {
      label: "Internal Memos",
      icon: <Mail size={18} />,
      key: "internal-memos",
    },
    {
      label: "Data Export",
      icon: <Download size={18} />,
      key: "data-export",
    },
    {
      label: "Reg. Management",
      icon: <ClipboardCheck size={18} />,
      key: "registration-management",
    },
    {
      label: "Manual Registration",
      icon: <Users size={18} />,
      key: "manual-registration",
    },
    {
      label: "Bulk Registration",
      icon: <FileSpreadsheet size={18} />,
      key: "bulk-registration",
    },
    {
      label: "AI Scan Registration",
      icon: <ScanLine size={18} />,
      key: "ai-scan-registration",
    },
    {
      label: "AI Bulk Upload",
      icon: <Sparkles size={18} />,
      key: "ai-bulk-registration",
    },
    {
      label: "Bulk Course Reg.",
      icon: <Database size={18} />,
      key: "bulk-course-registration",
    },
    {
      label: "Reg. Doc Archive",
      icon: <Database size={18} />,
      key: "registration-doc-archive",
    },
    {
      label: "JAMB Portal",
      icon: <GraduationCap size={18} />,
      key: "jamb-portal",
    },
    {
      label: "Fee Management",
      icon: <DollarSign size={18} />,
      key: "fee-management",
    },
    {
      label: "ID Cards",
      icon: <CreditCard size={18} />,
      key: "id-cards",
    },
    {
      label: "Course Management",
      icon: <BookOpen size={18} />,
      key: "course-management",
    },
    {
      label: "Exam Management",
      icon: <ClipboardCheck size={18} />,
      key: "examination-management",
    },
    {
      label: "Malpractice Reports",
      icon: <Shield size={18} />,
      key: "malpractice-reports",
    },
    {
      label: "Staff Management",
      icon: <Users size={18} />,
      key: "staff-management",
    },
    {
      label: "Budget Management",
      icon: <Wallet size={18} />,
      key: "budget-management",
    },
    {
      label: "Scholarships",
      icon: <Award size={18} />,
      key: "scholarship-management",
    },
    {
      label: "Notice Board",
      icon: <Bell size={18} />,
      key: "notice-board",
    },
    {
      label: "Transfer Requests",
      icon: <RefreshCw size={18} />,
      key: "transfer-management",
    },
    {
      label: "Deferment Cases",
      icon: <Calendar size={18} />,
      key: "deferment-management",
    },
    {
      label: "Result Verification",
      icon: <ClipboardCheck size={18} />,
      key: "result-verification",
    },
    {
      label: "Advanced Analytics",
      icon: <BarChart3 size={18} />,
      key: "advanced-analytics",
    },
    {
      label: "System Admin",
      icon: <Settings size={18} />,
      key: "system-admin",
    },
    {
      label: "Course Catalog",
      icon: <BookMarked size={18} />,
      key: "course-catalog",
    },
    {
      label: "Communication",
      icon: <MessageSquare size={18} />,
      key: "communication-center-admin",
    },
    {
      label: "Certificate Courses",
      icon: <Award size={18} />,
      key: "certificate-courses",
    },
    {
      label: "Login Audit Log",
      icon: <Shield size={18} />,
      key: "login-audit-log",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
    {
      label: "Student Profiles",
      icon: <Users size={18} />,
      key: "student-profiles",
    },
    {
      label: "Distance Learning",
      icon: <Globe size={18} />,
      key: "distance-learning-admin",
    },
    {
      label: "Part-Time Studies",
      icon: <Moon size={18} />,
      key: "part-time-studies-admin",
    },
    {
      label: "Staff Welfare",
      icon: <HeartHandshake size={18} />,
      key: "staff-welfare",
    },
    {
      label: "Full Analytics",
      icon: <Briefcase size={18} />,
      key: "full-analytics",
    },
  ],
  student: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "My Courses", icon: <BookOpen size={18} />, key: "courses" },
    { label: "Results", icon: <Award size={18} />, key: "results" },
    { label: "Fees", icon: <DollarSign size={18} />, key: "fees" },
    {
      label: "Assignments",
      icon: <ClipboardList size={18} />,
      key: "assignments",
    },
    { label: "CBT Exams", icon: <ClipboardCheck size={18} />, key: "exams" },
    { label: "Notices", icon: <Bell size={18} />, key: "notices" },
    {
      label: "Registration",
      icon: <ClipboardCheck size={18} />,
      key: "registration",
    },
    { label: "Timetable", icon: <Calendar size={18} />, key: "timetable" },
    {
      label: "My Attendance",
      icon: <UserCheck size={18} />,
      key: "attendance",
    },
    { label: "Documents", icon: <FileText size={18} />, key: "documents" },
    { label: "Hostel", icon: <Home size={18} />, key: "hostel" },
    { label: "Library", icon: <Library size={18} />, key: "library" },
    { label: "Profile", icon: <Settings size={18} />, key: "profile" },
    {
      label: "Academic Calendar",
      icon: <CalendarDays size={18} />,
      key: "academic-calendar",
    },
    {
      label: "Exam Schedule",
      icon: <ClipboardCheck size={18} />,
      key: "exam-schedule",
    },
    {
      label: "Announcements",
      icon: <Megaphone size={18} />,
      key: "announcements",
    },
    {
      label: "Result Slip",
      icon: <FileSpreadsheet size={18} />,
      key: "result-slip",
    },
    {
      label: "GPA Summary",
      icon: <TrendingUp size={18} />,
      key: "gpa-summary",
    },
    {
      label: "Academic Status",
      icon: <Award size={18} />,
      key: "academic-status-student",
    },
    {
      label: "Graduation Status",
      icon: <GraduationCap size={18} />,
      key: "graduation-status",
    },
    {
      label: "Course Materials",
      icon: <BookOpen size={18} />,
      key: "course-materials",
    },
    {
      label: "Course History",
      icon: <ScrollText size={18} />,
      key: "course-history",
    },
    {
      label: "Payment History",
      icon: <DollarSign size={18} />,
      key: "payment-history",
    },
    {
      label: "Progression",
      icon: <TrendingUp size={18} />,
      key: "progression",
    },
    {
      label: "Academic Transcript",
      icon: <FileText size={18} />,
      key: "academic-transcript",
    },
    {
      label: "Academic Record",
      icon: <FileSpreadsheet size={18} />,
      key: "academic-record",
    },
    {
      label: "Disciplinary Record",
      icon: <Shield size={18} />,
      key: "disciplinary-record",
    },
    {
      label: "Registration Status",
      icon: <ClipboardCheck size={18} />,
      key: "reg-status",
    },
    {
      label: "Pay Fees",
      icon: <DollarSign size={18} />,
      key: "fee-payment",
    },
    {
      label: "Fee Clearance",
      icon: <ClipboardCheck size={18} />,
      key: "fee-clearance",
    },
    {
      label: "Request Transcript",
      icon: <FileText size={18} />,
      key: "transcript-request",
    },
    {
      label: "Apply for Scholarship",
      icon: <Award size={18} />,
      key: "scholarship-application",
    },
    {
      label: "Department Transfer",
      icon: <RefreshCw size={18} />,
      key: "department-transfer",
    },
    {
      label: "Deferment",
      icon: <Calendar size={18} />,
      key: "deferment",
    },
    {
      label: "Course Catalog",
      icon: <BookMarked size={18} />,
      key: "course-catalog",
    },
    {
      label: "Announcements",
      icon: <Megaphone size={18} />,
      key: "announcements-view",
    },
    {
      label: "Messages",
      icon: <MessageSquare size={18} />,
      key: "communication-center",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
    {
      label: "My Certificates",
      icon: <Award size={18} />,
      key: "my-certificates",
    },
    {
      label: "Distance Learning",
      icon: <Globe size={18} />,
      key: "distance-learning",
    },
    {
      label: "Part-Time Studies",
      icon: <Moon size={18} />,
      key: "part-time-studies",
    },
    {
      label: "E-Learning",
      icon: <PlayCircle size={18} />,
      key: "elearning",
    },
    {
      label: "My Profile",
      icon: <UserCheck size={18} />,
      key: "student-profile",
    },
  ],
  lecturer: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "My Courses", icon: <BookOpen size={18} />, key: "courses" },
    { label: "Results", icon: <Award size={18} />, key: "results" },
    {
      label: "Assignments",
      icon: <ClipboardList size={18} />,
      key: "assignments",
    },
    { label: "CBT Exams", icon: <ClipboardCheck size={18} />, key: "cbt" },
    { label: "Students", icon: <Users size={18} />, key: "students" },
    { label: "Memos", icon: <FileText size={18} />, key: "memos" },
    { label: "Timetable", icon: <Calendar size={18} />, key: "timetable" },
    {
      label: "Attendance",
      icon: <UserCheck size={18} />,
      key: "attendance-mgmt",
    },
    {
      label: "Academic Calendar",
      icon: <CalendarDays size={18} />,
      key: "academic-calendar",
    },
    {
      label: "Exam Schedule",
      icon: <ClipboardCheck size={18} />,
      key: "exam-schedule-lecturer",
    },
    { label: "CA Entry", icon: <FlaskConical size={18} />, key: "ca-entry" },
    { label: "Result Entry", icon: <Award size={18} />, key: "result-entry" },
    {
      label: "Result Status",
      icon: <ClipboardList size={18} />,
      key: "result-approval-lecturer",
    },
    { label: "My Appraisal", icon: <Star size={18} />, key: "appraisal-self" },
    {
      label: "Combined Results",
      icon: <GitMerge size={18} />,
      key: "combined-results",
    },
    {
      label: "Student Records",
      icon: <FileSpreadsheet size={18} />,
      key: "student-records",
    },
    {
      label: "Course Materials",
      icon: <BookOpen size={18} />,
      key: "course-materials-lecturer",
    },
    {
      label: "Biometric Attendance",
      icon: <Fingerprint size={18} />,
      key: "biometric-attendance",
    },
    {
      label: "Score Bulk Upload",
      icon: <Database size={18} />,
      key: "score-bulk-upload",
    },
    {
      label: "Combination Sheets",
      icon: <GitMerge size={18} />,
      key: "combination-score-sheet",
    },
    {
      label: "Handwriting Scanner",
      icon: <ScanLine size={18} />,
      key: "handwriting-scanner",
    },
    {
      label: "Training Application",
      icon: <BookMarked size={18} />,
      key: "training-application",
    },
    {
      label: "Staff Directory",
      icon: <Users size={18} />,
      key: "staff-directory",
    },
    {
      label: "Course Catalog",
      icon: <BookMarked size={18} />,
      key: "course-catalog",
    },
    {
      label: "Announcements",
      icon: <Megaphone size={18} />,
      key: "announcement-view",
    },
    {
      label: "Messages",
      icon: <MessageSquare size={18} />,
      key: "communication-center",
    },
    {
      label: "Certificate Courses",
      icon: <Award size={18} />,
      key: "certificate-courses",
    },
    {
      label: "E-Learning",
      icon: <PlayCircle size={18} />,
      key: "elearning-lecturer",
    },
    {
      label: "Attendance Analytics",
      icon: <BarChart3 size={18} />,
      key: "attendance-analytics",
    },
    {
      label: "CBT Analytics",
      icon: <TrendingUp size={18} />,
      key: "cbt-analytics-lecturer",
    },
    {
      label: "My Profile",
      icon: <UserCheck size={18} />,
      key: "staff-profile",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
  ],
  bursary: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "Invoices", icon: <FileText size={18} />, key: "invoices" },
    { label: "Payments", icon: <DollarSign size={18} />, key: "payments" },
    { label: "Students", icon: <GraduationCap size={18} />, key: "students" },
    { label: "Reports", icon: <ClipboardList size={18} />, key: "reports" },
    { label: "Receipts", icon: <Receipt size={18} />, key: "receipts" },
    {
      label: "Reconciliation",
      icon: <RefreshCw size={18} />,
      key: "reconciliation",
    },
    {
      label: "Student Records",
      icon: <FileSpreadsheet size={18} />,
      key: "student-records",
    },
    {
      label: "Debt Aging",
      icon: <AlertTriangle size={18} />,
      key: "debt-aging",
    },
    {
      label: "Installment Plans",
      icon: <CalendarDays size={18} />,
      key: "installment-plans",
    },
    {
      label: "Fee Waivers",
      icon: <HeartHandshake size={18} />,
      key: "fee-waivers",
    },
    {
      label: "Reconciliation (Adv)",
      icon: <TrendingUp size={18} />,
      key: "bursary-reconciliation",
    },
    {
      label: "Fee Structure",
      icon: <FileText size={18} />,
      key: "fee-structure",
    },
    {
      label: "Messages",
      icon: <MessageSquare size={18} />,
      key: "communication-center",
    },
    {
      label: "My Profile",
      icon: <UserCheck size={18} />,
      key: "staff-profile",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
  ],
  hr: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "Staff", icon: <Users size={18} />, key: "staff" },
    { label: "Leave Requests", icon: <Calendar size={18} />, key: "leaves" },
    { label: "Attendance", icon: <UserCheck size={18} />, key: "attendance" },
    { label: "Staff Requests", icon: <FileText size={18} />, key: "requests" },
    { label: "Reports", icon: <Briefcase size={18} />, key: "reports" },
    { label: "Payroll", icon: <Wallet size={18} />, key: "payroll" },
    { label: "Appraisals", icon: <Star size={18} />, key: "appraisals" },
    {
      label: "Student Records",
      icon: <FileSpreadsheet size={18} />,
      key: "student-records",
    },
    {
      label: "Staff Training",
      icon: <BookOpen size={18} />,
      key: "staff-training",
    },
    {
      label: "Training Approvals",
      icon: <ClipboardCheck size={18} />,
      key: "training-approval-hr",
    },
    {
      label: "Staff Directory",
      icon: <Users size={18} />,
      key: "staff-directory",
    },
    {
      label: "Memos",
      icon: <Mail size={18} />,
      key: "memos",
    },
    {
      label: "Staff Onboarding",
      icon: <UserCheck size={18} />,
      key: "staff-onboarding",
    },
    {
      label: "Staff Welfare",
      icon: <HeartHandshake size={18} />,
      key: "staff-welfare",
    },
    {
      label: "Messages",
      icon: <MessageSquare size={18} />,
      key: "communication-center",
    },
    {
      label: "My Profile",
      icon: <UserCheck size={18} />,
      key: "staff-profile",
    },
    {
      label: "Student Profiles",
      icon: <GraduationCap size={18} />,
      key: "student-profiles",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
  ],
  hod: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    {
      label: "Result Approval",
      icon: <ClipboardCheck size={18} />,
      key: "result-approval-hod",
    },
    {
      label: "Dept Students",
      icon: <GraduationCap size={18} />,
      key: "hod-students",
    },
    {
      label: "Academic Calendar",
      icon: <CalendarDays size={18} />,
      key: "academic-calendar",
    },
    {
      label: "Dept. Analytics",
      icon: <BarChart3 size={18} />,
      key: "dept-analytics",
    },
    {
      label: "Dept Results",
      icon: <FileSpreadsheet size={18} />,
      key: "dept-results",
    },
    {
      label: "Promotion Results",
      icon: <Award size={18} />,
      key: "promotion-results",
    },
    {
      label: "Pass/Fail Lists",
      icon: <ListChecks size={18} />,
      key: "pass-fail-lists",
    },
    {
      label: "Result Review",
      icon: <ClipboardCheck size={18} />,
      key: "result-entry-review",
    },
    {
      label: "Score Sheet Results",
      icon: <FileSpreadsheet size={18} />,
      key: "score-sheet-results",
    },
    {
      label: "Appraisal Review",
      icon: <Star size={18} />,
      key: "appraisal-review",
    },
    { label: "Settings", icon: <Settings size={18} />, key: "hod-settings" },
    {
      label: "Student Records",
      icon: <FileSpreadsheet size={18} />,
      key: "student-records",
    },
    {
      label: "Training Approvals",
      icon: <ClipboardCheck size={18} />,
      key: "training-approval-hod",
    },
    {
      label: "Staff Directory",
      icon: <Users size={18} />,
      key: "staff-directory",
    },
    {
      label: "Disciplinary Records",
      icon: <Shield size={18} />,
      key: "disciplinary-records",
    },
    {
      label: "Memos",
      icon: <Mail size={18} />,
      key: "memos",
    },
    {
      label: "Budget Request",
      icon: <Wallet size={18} />,
      key: "budget-request",
    },
    {
      label: "Curriculum Management",
      icon: <BookMarked size={18} />,
      key: "curriculum-management",
    },
    {
      label: "Course Catalog",
      icon: <BookMarked size={18} />,
      key: "course-catalog",
    },
    {
      label: "Messages",
      icon: <MessageSquare size={18} />,
      key: "communication-center",
    },
    {
      label: "Announcements",
      icon: <Megaphone size={18} />,
      key: "announcement-view",
    },
    {
      label: "My Profile",
      icon: <UserCheck size={18} />,
      key: "staff-profile",
    },
    {
      label: "Student Profiles",
      icon: <GraduationCap size={18} />,
      key: "student-profiles",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
  ],
  alumni: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "Directory", icon: <Users size={18} />, key: "directory" },
    { label: "Job Board", icon: <Briefcase size={18} />, key: "jobs" },
    { label: "Events", icon: <Calendar size={18} />, key: "events" },
    { label: "My Profile", icon: <Settings size={18} />, key: "profile" },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
  ],
  parent: [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      key: "dashboard",
    },
    { label: "My Ward", icon: <GraduationCap size={18} />, key: "ward" },
    { label: "Link Ward", icon: <UserCheck size={18} />, key: "link-ward" },
    {
      label: "Announcements",
      icon: <Megaphone size={18} />,
      key: "announcements",
    },
    {
      label: "Login Activity",
      icon: <Activity size={18} />,
      key: "login-activity",
    },
  ],
};

// Unused icon suppressor
void Bot;
void BookMarked;
void MessageSquare;
void Sparkles;
void Globe;
void FlaskConical;

function formatRelativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const typeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

interface AppLayoutProps {
  role: string;
  userName: string;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({
  role,
  userName,
  activePage,
  onNavigate,
  onLogout,
  children,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarPhoto, setSidebarPhoto] = useState<string | null>(null);

  const { isModuleEnabled } = useModuleGating();
  const isAdmin = role === "admin";

  const {
    notifications: allNotifications,
    markRead,
    markAllRead,
  } = useNotifications();

  // Load the profile photo for the current user's sidebar avatar
  useEffect(() => {
    let photoId: string | null = null;
    if (role === "admin") {
      photoId = "admin_photo";
    } else if (role === "student") {
      const students = getLocalStudents();
      const matched =
        students.find((s) => s.name.toLowerCase() === userName.toLowerCase()) ??
        students.find((s) =>
          s.email
            ?.toLowerCase()
            .includes(userName.split(" ")[0]?.toLowerCase() ?? ""),
        );
      if (matched) photoId = matched.matricNumber;
    } else {
      // lecturer, hod, hr, bursary — find staff by name
      const staff = getLocalStaff();
      const matched = staff.find(
        (s) => s.name.toLowerCase() === userName.toLowerCase(),
      );
      if (matched) photoId = matched.staffId;
    }
    setSidebarPhoto(photoId ? getPhoto(photoId) : null);
  }, [role, userName]);

  const rawNavItems = navByRole[role] ?? navByRole.admin;

  // For non-admin users, filter out disabled module nav items
  // For admin users, show all items but add a "Disabled" badge
  const navItems = isAdmin
    ? rawNavItems
    : rawNavItems.filter((item) => isModuleEnabled(item.key));
  const notifications = allNotifications.filter(
    (n) => n.role === role || n.role === "all",
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleBadge: Record<string, string> = {
    admin: "Administrator",
    student: "Student",
    lecturer: "Lecturer",
    bursary: "Bursary Officer",
    hr: "HR Officer",
    hod: "Head of Department",
    alumni: "Alumni",
    parent: "Parent / Guardian",
  };

  const SidebarContent = (
    <aside className="flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">UniDigital</p>
          <p className="text-slate-400 text-xs mt-0.5">University Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const disabled = isAdmin && !isModuleEnabled(item.key);
          return (
            <button
              key={item.key}
              type="button"
              data-ocid={`nav.${item.key}.link`}
              onClick={() => {
                onNavigate(item.key);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px]",
                activePage === item.key
                  ? "bg-blue-600 text-white"
                  : disabled
                    ? "text-slate-500 hover:bg-slate-800 hover:text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {disabled && (
                <span className="ml-auto text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                  OFF
                </span>
              )}
              {!disabled && activePage === item.key && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <button
          type="button"
          onClick={() => {
            onNavigate("my-profile");
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 mb-3 w-full text-left rounded-lg hover:bg-slate-800 px-1 py-1 transition-colors"
          aria-label="Edit my profile"
          data-ocid="nav.my-profile.link"
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            {sidebarPhoto && (
              <AvatarImage
                src={sidebarPhoto}
                alt={userName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-slate-400">
              {roleBadge[role] ?? role} · Edit Profile
            </p>
          </div>
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 min-h-[44px]"
          onClick={onLogout}
          data-ocid="nav.logout.button"
        >
          <LogOut size={14} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">{SidebarContent}</div>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          {SidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Offline banner */}
        <OfflineBanner />

        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            data-ocid="nav.toggle"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:block" />

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <span className="text-sm text-slate-500 hidden lg:block">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>

            {/* Notification bell */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Notifications"
                  data-ocid="nav.bell.button"
                >
                  <Bell size={20} className="text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0"
                data-ocid="nav.popover"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => markAllRead(role)}
                        data-ocid="nav.secondary_button"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600"
                      onClick={() => setNotifOpen(false)}
                      data-ocid="nav.close_button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <ScrollArea className="max-h-80">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No notifications.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className={cn(
                          "w-full text-left px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-slate-50 transition-colors",
                          !n.read && "bg-blue-50/50",
                        )}
                        onClick={() => markRead(n.id)}
                        data-ocid="nav.row"
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div
                            className={cn(
                              !n.read ? "" : "pl-4",
                              "flex-1 min-w-0",
                            )}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                                  typeColors[n.type] ?? typeColors.info,
                                )}
                              >
                                {n.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800 leading-snug">
                              {n.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatRelativeTime(n.timestamp)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </ScrollArea>
                {unreadCount === 0 && notifications.length > 0 && (
                  <p className="text-xs text-slate-400 text-center py-3 border-t">
                    All caught up!
                  </p>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {!isAdmin && !isModuleEnabled(activePage) ? (
            <ModuleDisabledScreen
              moduleName={activePage}
              onBack={() => window.history.back()}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
