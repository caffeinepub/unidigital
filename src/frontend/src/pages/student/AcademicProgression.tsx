import {
  Award,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

interface Props {
  userEmail?: string;
}

type StageStatus = "completed" | "in_progress" | "pending";

interface Stage {
  id: number;
  title: string;
  date: string;
  description: string;
  status: StageStatus;
  gpa?: number;
  icon: React.ReactNode;
}

const stages: Stage[] = [
  {
    id: 1,
    title: "Application Submitted",
    date: "March 2021",
    description:
      "Online application submitted with O-Level results, birth certificate, and personal statement.",
    status: "completed",
    icon: <BookOpen size={20} />,
  },
  {
    id: 2,
    title: "Admission Granted",
    date: "June 2021",
    description:
      "Offered admission into B.Sc Computer Science. Acceptance fee paid and offer letter issued.",
    status: "completed",
    icon: <Star size={20} />,
  },
  {
    id: 3,
    title: "Matriculation",
    date: "October 2021",
    description:
      "Officially matriculated as CSC/2021/042. Assigned to 100 Level, Department of Computer Science.",
    status: "completed",
    icon: <Users size={20} />,
  },
  {
    id: 4,
    title: "Year 1 Completed",
    date: "July 2022",
    description:
      "Completed first year with 42 credit units. Passed all core courses including MTH101, CSC111, PHY101.",
    status: "completed",
    gpa: 4.1,
    icon: <Award size={20} />,
  },
  {
    id: 5,
    title: "Year 2 Completed",
    date: "July 2023",
    description:
      "Completed second year. Excelled in Data Structures & Algorithms. Dean's List recognition.",
    status: "completed",
    gpa: 4.4,
    icon: <Award size={20} />,
  },
  {
    id: 6,
    title: "Year 3 — In Progress",
    date: "2023 – Present",
    description:
      "Currently enrolled in 300 Level. Registered for 8 courses this semester. Project work commenced.",
    status: "in_progress",
    gpa: 3.8,
    icon: <Clock size={20} />,
  },
  {
    id: 7,
    title: "Year 4 — Upcoming",
    date: "Expected 2025",
    description:
      "Final year project, industrial training assessment, and capstone presentations pending.",
    status: "pending",
    icon: <Circle size={20} />,
  },
  {
    id: 8,
    title: "Graduation",
    date: "Expected Nov 2025",
    description:
      "Convocation ceremony, degree certificate, and official transcript issuance.",
    status: "pending",
    icon: <GraduationCap size={20} />,
  },
];

const statusConfig: Record<
  StageStatus,
  { label: string; bg: string; text: string; circle: string }
> = {
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    circle: "bg-green-500",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
    circle: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    bg: "bg-slate-100",
    text: "text-slate-500",
    circle: "bg-slate-300",
  },
};

export function AcademicProgression({ userEmail: _userEmail }: Props) {
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progressPct = Math.round((completedCount / stages.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Academic Progression
        </h1>
        <p className="text-slate-500 text-sm">
          Your journey from application to graduation
        </p>
      </div>

      {/* Summary card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              ["Current Year", "Year 3 of 4"],
              ["CGPA", "3.80"],
              ["Credits Earned", "120 / 160"],
              ["Status", "Active"],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-blue-200 text-xs mt-0.5">{k}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-blue-100">Overall Progress</span>
              <span className="font-semibold">{progressPct}%</span>
            </div>
            <div className="h-2 bg-blue-900/50 rounded-full">
              <div
                className="h-2 bg-white rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vertical timeline */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200" />

        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const cfg = statusConfig[stage.status];
            return (
              <div
                key={stage.id}
                className="relative flex gap-4"
                data-ocid={`progression.item.${idx + 1}`}
              >
                {/* Circle indicator */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stage.status === "completed"
                      ? "bg-green-500 text-white"
                      : stage.status === "in_progress"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {stage.status === "completed" ? (
                    <CheckCircle size={20} />
                  ) : (
                    stage.icon
                  )}
                </div>

                {/* Content */}
                <Card
                  className={`flex-1 ${
                    stage.status === "in_progress"
                      ? "border-blue-300 shadow-md"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {stage.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {stage.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {stage.gpa !== undefined && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            GPA {stage.gpa.toFixed(1)}
                          </span>
                        )}
                        <Badge
                          className={`${cfg.bg} ${cfg.text} border-0 text-xs`}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {stage.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* GPA trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GPA Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stages
              .filter((s) => s.gpa !== undefined)
              .map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">
                      {s.title
                        .replace(" Completed", "")
                        .replace(" — In Progress", "")}
                    </span>
                    <span className="font-semibold text-blue-600">
                      {s.gpa!.toFixed(1)}
                    </span>
                  </div>
                  <Progress value={(s.gpa! / 5) * 100} className="h-2" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
