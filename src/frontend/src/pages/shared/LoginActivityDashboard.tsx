import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  Monitor,
  Shield,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  type SessionRecord,
  formatDuration,
  getLastLoginTime,
  getUserSessions,
} from "../../utils/sessionUtils";

export interface LoginActivityDashboardProps {
  userId: string;
  userName: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  student: "Student",
  lecturer: "Lecturer",
  hod: "Head of Department",
  hr: "HR Officer",
  bursary: "Bursary Officer",
  alumni: "Alumni",
  parent: "Parent/Guardian",
};

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800 leading-none">
            {value}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoginActivityDashboard({
  userId,
  userName,
  role,
}: LoginActivityDashboardProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [lastLogin, setLastLogin] = useState<string>("–");

  useEffect(() => {
    setSessions(getUserSessions(userId));
    setLastLogin(getLastLoginTime(userId));
  }, [userId]);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (s) => s.logoutTime !== null,
  ).length;
  const activeSessions = sessions.filter((s) => s.logoutTime === null).length;
  const suspiciousCount = sessions.filter((s) => s.suspicious).length;

  const avgDuration = useMemo(() => {
    const completed = sessions.filter((s) => s.duration !== null);
    if (completed.length === 0) return 0;
    return Math.round(
      completed.reduce((acc, s) => acc + (s.duration ?? 0), 0) /
        completed.length,
    );
  }, [sessions]);

  return (
    <div className="space-y-6" data-ocid="login-activity.root">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Activity size={22} />
          <h1 className="text-2xl font-bold">My Login Activity</h1>
        </div>
        <p className="text-blue-200 text-sm">
          {userName} &bull; {ROLE_LABELS[role] ?? role} &bull; Last login:{" "}
          <span className="font-semibold text-white">{lastLogin}</span>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<LogIn size={18} className="text-green-600" />}
          label="Total Logins"
          value={totalSessions}
          color="bg-green-50"
        />
        <SummaryCard
          icon={<CheckCircle size={18} className="text-blue-600" />}
          label="Completed Sessions"
          value={completedSessions}
          color="bg-blue-50"
        />
        <SummaryCard
          icon={<Clock size={18} className="text-amber-600" />}
          label="Avg. Duration"
          value={formatDuration(avgDuration)}
          color="bg-amber-50"
        />
        <SummaryCard
          icon={<Shield size={18} className="text-purple-600" />}
          label="Active Sessions"
          value={activeSessions}
          color="bg-purple-50"
        />
      </div>

      {/* Sessions table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity size={16} />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="login-activity.empty-state"
            >
              <Activity size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                No session history yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Your login sessions will appear here once you start using the
                portal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs uppercase font-semibold">
                      Session ID
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Login Time
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Logout Time
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Duration
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Device
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Browser
                    </TableHead>
                    <TableHead className="text-xs uppercase font-semibold">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow
                      key={s.sessionId}
                      className={s.suspicious ? "bg-red-50/50" : undefined}
                      data-ocid="login-activity.session-row"
                    >
                      <TableCell className="font-mono text-xs text-slate-500">
                        {s.sessionId.slice(0, 20)}…
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <LogIn
                            size={11}
                            className="text-green-500 flex-shrink-0"
                          />
                          {new Date(s.loginTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {s.logoutTime ? (
                          <div className="flex items-center gap-1.5">
                            <LogOut
                              size={11}
                              className="text-red-400 flex-shrink-0"
                            />
                            {new Date(s.logoutTime).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        ) : (
                          <span className="text-green-600 font-medium">
                            Current
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {formatDuration(s.duration)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          {s.deviceInfo.includes("Mobile") ? (
                            <Smartphone
                              size={12}
                              className="text-slate-400 flex-shrink-0"
                            />
                          ) : (
                            <Monitor
                              size={12}
                              className="text-slate-400 flex-shrink-0"
                            />
                          )}
                          {s.deviceInfo}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {s.browser}
                      </TableCell>
                      <TableCell>
                        {s.suspicious ? (
                          <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1 w-fit">
                            <AlertTriangle size={10} />
                            Suspicious
                          </Badge>
                        ) : s.logoutTime ? (
                          <Badge className="bg-slate-100 text-slate-600 text-xs">
                            Ended
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {suspiciousCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle
            size={18}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              Suspicious activity detected
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {suspiciousCount} session{suspiciousCount !== 1 ? "s" : ""} were
              flagged because multiple logins occurred within 5 minutes. If you
              don't recognise this, please contact your system administrator
              immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
