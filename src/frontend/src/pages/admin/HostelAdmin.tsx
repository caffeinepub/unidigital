import { Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { useActor } from "../../hooks/useActor";
import {
  type HostelApplication,
  getLocalHostelApps,
  saveLocalHostelApps,
} from "../../utils/sampleData";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-blue-100 text-blue-700",
};

export function HostelAdmin() {
  const { actor } = useActor();
  const [apps, setApps] = useState<HostelApplication[]>(getLocalHostelApps());
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<HostelApplication | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [block, setBlock] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [decision, setDecision] = useState<
    "approved" | "rejected" | "waitlisted"
  >("approved");
  const [processing, setProcessing] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    (actor as any)
      .listAllHostelApplications()
      .then((backendApps) => {
        if (backendApps.length > 0) {
          const mapped: HostelApplication[] = backendApps.map((ba) => ({
            id: ba.id,
            studentMatric: ba.studentMatric,
            studentName: ba.studentName,
            roomType: ba.roomType,
            session: ba.session,
            status: (ba.status as HostelApplication["status"]) ?? "pending",
            roomNumber: ba.assignedRoom || "",
            block: ba.preferredBlock || "",
            appliedAt: new Date(Number(ba.applicationDate))
              .toISOString()
              .split("T")[0],
          }));
          setApps(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  const openDialog = (app: HostelApplication) => {
    setSelected(app);
    setRoomNumber(app.roomNumber);
    setBlock(app.block);
    setAdminComment("");
    setDecision(
      app.status === "rejected"
        ? "rejected"
        : (app.status as string) === "waitlisted"
          ? "waitlisted"
          : "approved",
    );
  };

  const save = async () => {
    if (!selected) return;
    setProcessing(true);
    const assignedRoom =
      decision === "approved" ? `${roomNumber}, ${block}`.trim() : "";
    const processedAt = BigInt(Date.now());

    // Update local state
    const updated = apps.map((a) =>
      a.id === selected.id
        ? {
            ...a,
            status: decision as HostelApplication["status"],
            roomNumber: decision === "approved" ? roomNumber : "",
            block: decision === "approved" ? block : "",
          }
        : a,
    );
    setApps(updated);
    saveLocalHostelApps(updated);

    // Try backend
    if (actor) {
      try {
        await (actor as any).processHostelApplication(
          selected.id,
          decision,
          assignedRoom,
          adminComment,
          processedAt,
        );
        toast.success("Application processed successfully");
      } catch (err) {
        console.warn("Backend process hostel failed:", err);
        toast.success("Application updated (demo mode)");
      }
    } else {
      toast.success("Application updated (demo mode)");
    }
    setProcessing(false);
    setSelected(null);
  };

  const filteredApps =
    statusFilter === "all"
      ? apps
      : apps.filter((a) => a.status === statusFilter);

  const summary = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Hostel Management</h1>

      <div className="grid grid-cols-4 gap-3">
        {Object.entries(summary).map(([k, v]) => (
          <Card key={k}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-xs text-slate-500 capitalize mt-1">{k}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div
          className="flex items-center justify-center py-6"
          data-ocid="hostel.loading_state"
        >
          <Loader2 size={20} className="animate-spin text-blue-500 mr-2" />
          <span className="text-slate-500">Loading applications...</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm">Filter by status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44" data-ocid="hostel.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="hostel.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-400 py-8"
                      data-ocid="hostel.empty_state"
                    >
                      No applications.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((app, i) => (
                    <TableRow key={app.id} data-ocid={`hostel.row.${i + 1}`}>
                      <TableCell>
                        <p className="text-sm font-medium">{app.studentName}</p>
                        <p className="text-xs text-slate-500">
                          {app.studentMatric}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{app.roomType}</TableCell>
                      <TableCell className="text-sm">{app.session}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {app.appliedAt}
                      </TableCell>
                      <TableCell className="text-sm">
                        {app.roomNumber
                          ? `${app.roomNumber}, ${app.block}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 ${
                            statusColors[app.status] ?? statusColors.pending
                          }`}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(app.status === "pending" ||
                          (app.status as string) === "waitlisted") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(app)}
                            data-ocid={`hostel.edit_button.${i + 1}`}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent data-ocid="hostel.dialog">
          <DialogHeader>
            <DialogTitle>Review Hostel Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <p className="text-sm">
                <strong>Student:</strong> {selected?.studentName} (
                {selected?.studentMatric})
              </p>
              <p className="text-sm">
                <strong>Room Type:</strong> {selected?.roomType}
              </p>
              <p className="text-sm">
                <strong>Session:</strong> {selected?.session}
              </p>
            </div>
            <div>
              <Label>Decision</Label>
              <Select
                value={decision}
                onValueChange={(v) =>
                  setDecision(v as "approved" | "rejected" | "waitlisted")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="waitlisted">Waitlist</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {decision === "approved" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Room Number</Label>
                  <Input
                    className="mt-1"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. A-14"
                    data-ocid="hostel.input"
                  />
                </div>
                <div>
                  <Label>Block</Label>
                  <Input
                    className="mt-1"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Block A"
                  />
                </div>
              </div>
            )}
            <div>
              <Label>Admin Comment (optional)</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelected(null)}
              data-ocid="hostel.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              disabled={processing}
              data-ocid="hostel.confirm_button"
            >
              {processing ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Decision"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
