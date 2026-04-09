import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Receipt,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import type { DLStudent } from "./DLTypes";

interface DLOverviewProps {
  student: DLStudent;
  onNavigate: (tab: string) => void;
}

const stats = [
  { label: "Enrolled DL Students", value: "1,248", icon: <Users size={18} /> },
  { label: "Departments", value: "9", icon: <GraduationCap size={18} /> },
  { label: "Active Programmes", value: "5", icon: <BookOpen size={18} /> },
  { label: "Study Centres", value: "3", icon: <Globe size={18} /> },
];

const programmes = [
  { code: "DL-NCE", label: "NCE (Distance Learning)", duration: "3 Years" },
  {
    code: "DL-BSc(Ed)",
    label: "B.Sc (Ed) Distance Learning",
    duration: "4–5 Years",
  },
  { code: "DL-PGD", label: "Postgraduate Diploma (DL)", duration: "1 Year" },
  { code: "DL-PGDE", label: "PGDE (Distance Learning)", duration: "1 Year" },
  {
    code: "DL-CERT",
    label: "Professional Certificate (Online)",
    duration: "3–6 Months",
  },
];

const quickLinks = [
  {
    tab: "registration",
    label: "Register Courses",
    icon: <BookOpen size={16} />,
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    tab: "results",
    label: "View Results",
    icon: <ChevronRight size={16} />,
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    tab: "timetable",
    label: "Timetable",
    icon: <Calendar size={16} />,
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    tab: "materials",
    label: "Course Materials",
    icon: <Video size={16} />,
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    tab: "payments",
    label: "Fee Payment",
    icon: <Receipt size={16} />,
    color: "bg-red-50 border-red-200 text-red-700",
  },
  {
    tab: "notifications",
    label: "Announcements",
    icon: <Wifi size={16} />,
    color: "bg-teal-50 border-teal-200 text-teal-700",
  },
];

export function DLOverview({ student, onNavigate }: DLOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Student welcome */}
      <div className="bg-gradient-to-br from-[#003087] to-[#001a4d] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/40 text-xs font-semibold">
                DISTANCE LEARNING PROGRAMME
              </Badge>
            </div>
            <h2 className="text-xl font-bold mt-2">
              Welcome back, {student.name}
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              {student.department} &bull; {student.level} Level &bull;{" "}
              {student.programme}
            </p>
            <p className="text-blue-300 text-xs mt-0.5 font-mono">
              Matric: {student.matricNumber}
            </p>
          </div>
          <LayoutDashboard
            size={48}
            className="text-blue-300/50 hidden md:block shrink-0"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="text-primary shrink-0">{stat.icon}</div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide text-muted-foreground">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => onNavigate(link.tab)}
              type="button"
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all hover:shadow-sm text-left ${link.color}`}
              data-ocid={`dl.overview.quicklink.${link.tab}`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Programmes */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">
          Available DL Programmes — FUEK Distance Learning Centre
        </h3>
        <div className="space-y-2">
          {programmes.map((prog) => (
            <div
              key={prog.code}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <GraduationCap size={16} className="text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {prog.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {prog.code} &bull; {prog.duration}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                Active
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-[#003087]/5 border border-[#003087]/20 rounded-lg p-4 text-sm">
        <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <Globe size={14} className="text-primary" />
          Federal University of Education, Kontagora — Distance Learning Centre
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Courses are available asynchronously — access materials any time. Live
          sessions are held every Saturday 9am–5pm at study centres in
          Kontagora, Minna, and Abuja. End-of-semester examinations are held
          on-campus. For enquiries:{" "}
          <span className="font-mono text-primary">dl@fuek.edu.ng</span> · +234
          803 000 0001
        </p>
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("registration")}
            className="text-xs"
            data-ocid="dl.overview.register_cta"
          >
            Proceed to Course Registration →
          </Button>
        </div>
      </div>
    </div>
  );
}
