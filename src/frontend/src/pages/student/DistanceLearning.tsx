import {
  Activity,
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { cn } from "../../lib/utils";
import { DLAcademicCalendar } from "./dl/DLAcademicCalendar";
import { DLAttendance } from "./dl/DLAttendance";
import { DLClearanceTranscript } from "./dl/DLClearanceTranscript";
import { DLCourseMaterials } from "./dl/DLCourseMaterials";
import { DLCourseRegistration } from "./dl/DLCourseRegistration";
import { DLFeePayment } from "./dl/DLFeePayment";
import { DLNotifications } from "./dl/DLNotifications";
import { DLOverview } from "./dl/DLOverview";
import { DLResults } from "./dl/DLResults";
import { DLTimetable } from "./dl/DLTimetable";
import { DEMO_ANNOUNCEMENTS, DEMO_STUDENT } from "./dl/DLTypes";

type DLTab =
  | "overview"
  | "registration"
  | "results"
  | "timetable"
  | "materials"
  | "payments"
  | "notifications"
  | "calendar"
  | "attendance"
  | "clearance";

interface DLNavItem {
  key: DLTab;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: DLNavItem[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  {
    key: "registration",
    label: "Course Registration",
    icon: <BookOpen size={16} />,
  },
  { key: "results", label: "My Results", icon: <GraduationCap size={16} /> },
  { key: "timetable", label: "Timetable", icon: <Calendar size={16} /> },
  { key: "materials", label: "Course Materials", icon: <Video size={16} /> },
  { key: "payments", label: "Fee Payment", icon: <CreditCard size={16} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { key: "calendar", label: "Academic Calendar", icon: <Calendar size={16} /> },
  { key: "attendance", label: "Attendance", icon: <Activity size={16} /> },
  {
    key: "clearance",
    label: "Clearance & Transcript",
    icon: <FileText size={16} />,
  },
];

interface DistanceLearningProps {
  userEmail?: string;
  userName?: string;
}

export function DistanceLearning({
  userEmail: _userEmail,
  userName: _userName,
}: DistanceLearningProps) {
  const [activeTab, setActiveTab] = useState<DLTab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const student = DEMO_STUDENT;
  const unreadCount = DEMO_ANNOUNCEMENTS.filter((a) => !a.read).length;

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as DLTab);
    setMobileNavOpen(false);
  };

  const activeItem = NAV_ITEMS.find((n) => n.key === activeTab);

  return (
    <div className="space-y-4">
      {/* Portal header banner */}
      <div className="bg-gradient-to-r from-[#003087] to-[#001a4d] rounded-xl px-5 py-4 text-white flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FFD700]/25 text-[#FFD700] border-[#FFD700]/50 text-xs font-bold tracking-wide">
              DISTANCE LEARNING PROGRAMME
            </Badge>
          </div>
          <h1 className="text-xl font-bold leading-tight">
            Distance Learning Portal
          </h1>
          <p className="text-blue-200 text-xs mt-0.5">
            Federal University of Education, Kontagora &bull;{" "}
            {student.department} &bull; {student.level} Level
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-blue-200 text-xs text-right">
          <div>
            <p className="font-semibold text-white">{student.name}</p>
            <p className="font-mono text-[10px]">{student.matricNumber}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* ── Sidebar nav (desktop) ── */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavigate(item.key)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                activeTab === item.key
                  ? "bg-[#003087] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              data-ocid={`dl.nav.${item.key}`}
            >
              <span className={activeTab === item.key ? "text-[#FFD700]" : ""}>
                {item.icon}
              </span>
              <span className="flex-1 min-w-0 truncate">{item.label}</span>
              {item.key === "notifications" && unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 h-4 shrink-0">
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </aside>

        {/* ── Mobile nav trigger ── */}
        <div className="md:hidden w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between mb-4"
            onClick={() => setMobileNavOpen((v) => !v)}
            data-ocid="dl.mobile_nav_toggle"
          >
            <span className="flex items-center gap-2">
              {activeItem?.icon}
              {activeItem?.label}
            </span>
            <span className="text-muted-foreground text-xs">▼</span>
          </Button>

          {mobileNavOpen && (
            <div className="absolute z-50 bg-card border border-border rounded-xl shadow-lg p-2 w-64">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  DL Portal Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full",
                    activeTab === item.key
                      ? "bg-[#003087] text-white"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.key === "notifications" && unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white border-0 text-[10px] px-1.5">
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <ScrollArea className="flex-1 min-w-0">
          <div className="pr-1">
            {activeTab === "overview" && (
              <DLOverview student={student} onNavigate={handleNavigate} />
            )}
            {activeTab === "registration" && <DLCourseRegistration />}
            {activeTab === "results" && <DLResults />}
            {activeTab === "timetable" && <DLTimetable />}
            {activeTab === "materials" && <DLCourseMaterials />}
            {activeTab === "payments" && <DLFeePayment />}
            {activeTab === "notifications" && <DLNotifications />}
            {activeTab === "calendar" && <DLAcademicCalendar />}
            {activeTab === "attendance" && <DLAttendance />}
            {activeTab === "clearance" && <DLClearanceTranscript />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
