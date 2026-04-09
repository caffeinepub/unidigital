import { ArrowLeft, ShieldX } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

interface UnauthorizedPageProps {
  role?: string;
  onBack?: () => void;
}

const roleBadgeColor: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700",
  student: "bg-emerald-100 text-emerald-700",
  lecturer: "bg-purple-100 text-purple-700",
  hod: "bg-amber-100 text-amber-700",
  bursary: "bg-rose-100 text-rose-700",
  hr: "bg-cyan-100 text-cyan-700",
  alumni: "bg-indigo-100 text-indigo-700",
  parent: "bg-teal-100 text-teal-700",
};

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  student: "Student",
  lecturer: "Lecturer",
  hod: "Head of Department",
  bursary: "Bursary Officer",
  hr: "HR Officer",
  alumni: "Alumni",
  parent: "Parent / Guardian",
};

export function UnauthorizedPage({ role, onBack }: UnauthorizedPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="p-10 space-y-5">
          {/* Icon */}
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldX size={32} className="text-destructive" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You do not have permission to view this page. Contact your
              administrator if you believe this is an error.
            </p>
          </div>

          {/* Current role badge */}
          {role && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Your role:</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadgeColor[role] ?? "bg-muted text-muted-foreground"}`}
              >
                {roleLabel[role] ?? role}
              </span>
            </div>
          )}

          {/* Error code hint */}
          <Badge variant="outline" className="text-muted-foreground text-xs">
            Error 403 — Forbidden
          </Badge>

          {/* Back button */}
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={onBack ?? (() => window.history.back())}
            data-ocid="unauthorized.back-btn"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
