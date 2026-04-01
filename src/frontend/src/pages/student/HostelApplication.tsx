import { Home, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useActor } from "../../hooks/useActor";
import {
  type HostelApplication as LocalHostelApp,
  getLocalHostelApps,
  saveLocalHostelApps,
} from "../../utils/sampleData";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-blue-100 text-blue-700",
};

interface Props {
  studentMatric: string;
  studentName: string;
  department?: string;
  level?: string;
}

export function HostelApplication({
  studentMatric,
  studentName,
  department = "Computer Science",
  level = "300",
}: Props) {
  const { actor } = useActor();
  const [apps, setApps] = useState<LocalHostelApp[]>(getLocalHostelApps());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    roomType: "",
    session: "2023/2024",
    preferredBlock: "",
    specialNeeds: "",
  });

  // Load from backend on mount
  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    (actor as any)
      .listHostelApplicationsByStudent(studentMatric)
      .then((backendApps) => {
        if (backendApps.length > 0) {
          const mapped: LocalHostelApp[] = backendApps.map((ba) => ({
            id: ba.id,
            studentMatric: ba.studentMatric,
            studentName: ba.studentName,
            roomType: ba.roomType,
            session: ba.session,
            status: ba.status as LocalHostelApp["status"],
            roomNumber: ba.assignedRoom || "",
            block: ba.preferredBlock || "",
            appliedAt: new Date(Number(ba.applicationDate))
              .toISOString()
              .split("T")[0],
          }));
          setApps((prev) => {
            const withoutMine = prev.filter(
              (a) => a.studentMatric !== studentMatric,
            );
            return [...withoutMine, ...mapped];
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, studentMatric]);

  const myApp = apps.find((a) => a.studentMatric === studentMatric);

  const apply = async () => {
    if (!form.roomType) return;
    setSubmitting(true);
    const newApp: LocalHostelApp = {
      id: `HST-${Date.now()}`,
      studentMatric,
      studentName,
      roomType: form.roomType,
      session: form.session,
      status: "pending",
      roomNumber: "",
      block: form.preferredBlock,
      appliedAt: new Date().toISOString().split("T")[0],
    };

    // Try backend
    if (actor) {
      try {
        const id = await (actor as any).applyForHostel({
          id: newApp.id,
          studentMatric,
          studentName,
          department,
          level,
          roomType: form.roomType,
          preferredBlock: form.preferredBlock,
          specialNeeds: form.specialNeeds,
          applicationDate: BigInt(Date.now()),
          status: "pending",
          assignedRoom: "",
          adminComment: "",
          processedAt: BigInt(0),
          session: form.session,
        });
        newApp.id = id;
        toast.success("Application submitted successfully");
      } catch (err) {
        console.warn("Backend hostel apply failed:", err);
        toast.success("Application submitted (demo mode)");
      }
    } else {
      toast.success("Application submitted (demo mode)");
    }

    const updated = [...apps, newApp];
    setApps(updated);
    saveLocalHostelApps(updated);
    setSubmitting(false);
    setShowDialog(false);
    setForm({
      roomType: "",
      session: "2023/2024",
      preferredBlock: "",
      specialNeeds: "",
    });
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="hostel.loading_state"
      >
        <Loader2 size={24} className="animate-spin text-blue-500 mr-2" />
        <span className="text-slate-500">Loading application status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Hostel & Accommodation
        </h1>
        {!myApp && (
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowDialog(true)}
            data-ocid="hostel.open_modal_button"
          >
            <Home size={16} className="mr-2" /> Apply for Hostel
          </Button>
        )}
      </div>

      {!myApp ? (
        <Card>
          <CardContent
            className="p-8 text-center"
            data-ocid="hostel.empty_state"
          >
            <Home size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">
              You have not applied for hostel accommodation.
            </p>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowDialog(true)}
              data-ocid="hostel.primary_button"
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card data-ocid="hostel.card">
          <CardHeader>
            <CardTitle className="text-base">Your Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <Badge
                className={`border-0 ${
                  statusColors[myApp.status] ?? statusColors.pending
                }`}
              >
                {myApp.status.charAt(0).toUpperCase() + myApp.status.slice(1)}
              </Badge>
            </div>
            {(
              [
                ["Room Type", myApp.roomType],
                ["Session", myApp.session],
                ["Applied On", myApp.appliedAt],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-1 border-b last:border-0"
              >
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
            {myApp.status === "approved" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  🏠 Room Allocated
                </p>
                <p className="text-sm text-green-700">
                  Room <strong>{myApp.roomNumber || "TBA"}</strong>,{" "}
                  {myApp.block || "Block TBA"}
                </p>
              </div>
            )}
            {myApp.status === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                <p className="text-sm text-red-700">
                  Your application was not successful. Contact the accommodation
                  office for more information.
                </p>
              </div>
            )}
            {(myApp.status as string) === "waitlisted" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <p className="text-sm text-blue-700">
                  You are on the waitlist. A room will be assigned as soon as
                  one becomes available.
                </p>
              </div>
            )}
            {myApp.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
                <p className="text-sm text-amber-700">
                  Your application is under review. You will be notified once a
                  room is assigned.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-ocid="hostel.dialog">
          <DialogHeader>
            <DialogTitle>Apply for Hostel Accommodation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Room Type</Label>
              <Select
                value={form.roomType}
                onValueChange={(v) => setForm((f) => ({ ...f, roomType: v }))}
              >
                <SelectTrigger data-ocid="hostel.select">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {["Single", "Double", "Suite"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Session</Label>
              <Select
                value={form.session}
                onValueChange={(v) => setForm((f) => ({ ...f, session: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["2023/2024", "2024/2025"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preferred Block (optional)</Label>
              <Input
                placeholder="e.g. Block A"
                value={form.preferredBlock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferredBlock: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Special Needs / Notes (optional)</Label>
              <Textarea
                placeholder="Any special requirements..."
                value={form.specialNeeds}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialNeeds: e.target.value }))
                }
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="hostel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={apply}
              disabled={!form.roomType || submitting}
              data-ocid="hostel.submit_button"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
