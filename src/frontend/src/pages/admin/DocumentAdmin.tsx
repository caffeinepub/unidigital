import { useState } from "react";
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
import {
  type DocRequest,
  getLocalDocRequests,
  saveLocalDocRequests,
} from "../../utils/sampleData";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  collected: "bg-slate-100 text-slate-600",
};

export function DocumentAdmin() {
  const [requests, setRequests] = useState<DocRequest[]>(getLocalDocRequests());
  const [selected, setSelected] = useState<DocRequest | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  const openDialog = (req: DocRequest) => {
    setSelected(req);
    setNewStatus(req.status);
    setNote(req.note);
  };

  const save = () => {
    if (!selected) return;
    const updated = requests.map((r) =>
      r.id === selected.id
        ? { ...r, status: newStatus as DocRequest["status"], note }
        : r,
    );
    setRequests(updated);
    saveLocalDocRequests(updated);
    setSelected(null);
  };

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    processing: requests.filter((r) => r.status === "processing").length,
    ready: requests.filter((r) => r.status === "ready").length,
    collected: requests.filter((r) => r.status === "collected").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Document Requests</h1>

      <div className="grid grid-cols-4 gap-3">
        {(["pending", "processing", "ready", "collected"] as const).map((s) => (
          <Card key={s}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{counts[s]}</p>
              <p className="text-xs text-slate-500 capitalize mt-1">{s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="documents.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-400 py-8"
                      data-ocid="documents.empty_state"
                    >
                      No requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req, i) => (
                    <TableRow key={req.id} data-ocid={`documents.row.${i + 1}`}>
                      <TableCell>
                        <p className="text-sm font-medium">{req.studentName}</p>
                        <p className="text-xs text-slate-500">
                          {req.studentMatric}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.requestType}
                      </TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">
                        {req.purpose}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {req.submittedAt}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 ${statusColors[req.status]}`}
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(req)}
                          data-ocid={`documents.edit_button.${i + 1}`}
                        >
                          Update
                        </Button>
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
        <DialogContent data-ocid="documents.dialog">
          <DialogHeader>
            <DialogTitle>Update Request — {selected?.requestType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">
                <strong>Student:</strong> {selected?.studentName} (
                {selected?.studentMatric})
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <strong>Purpose:</strong> {selected?.purpose}
              </p>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-ocid="documents.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["pending", "processing", "ready", "collected"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Admin Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for the student..."
                rows={2}
                data-ocid="documents.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelected(null)}
              data-ocid="documents.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="documents.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
