import {
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
  Database,
  DollarSign,
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
  Megaphone,
  Menu,
  MessageSquare,
  Receipt,
  RefreshCw,
  ScanLine,
  ScrollText,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNotifications } from "../contexts/NotificationsContext";
import { cn } from "../lib/utils";
import { OfflineBanner } from "./OfflineBanner";
import { Avatar, AvatarFallback } from "./ui/avatar";
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
    { label: "Settings", icon: <Settings size={18} />, key: "settings" },
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
  ],
};

// Unused icon suppressor
void Bot;

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

  const {
    notifications: allNotifications,
    markRead,
    markAllRead,
  } = useNotifications();

  const navItems = navByRole[role] ?? navByRole.admin;
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
        {navItems.map((item) => (
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
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {activePage === item.key && (
              <ChevronRight size={14} className="ml-auto" />
            )}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
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
            <p className="text-xs text-slate-400">{roleBadge[role] ?? role}</p>
          </div>
        </div>
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
