import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, PlusCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TrainingType =
  | "Conference"
  | "Workshop"
  | "Course"
  | "Seminar"
  | "Study Tour";

type RequestStatus = "Submitted" | "HOD Approved" | "HR Approved" | "Rejected";

interface TrainingRequest {
  id: string;
  trainingName: string;
  trainingType: TrainingType;
  organizingBody: string;
  location: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  justification: string;
  expectedOutcomes: string;
  status: RequestStatus;
  hodComment?: string;
  hrComment?: string;
  submittedAt: string;
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  Submitted: "bg-blue-100 text-blue-700",
  "HOD Approved": "bg-cyan-100 text-cyan-700",
  "HR Approved": "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

function getRequests(): TrainingRequest[] {
  const raw = localStorage.getItem("unidigital_training_requests");
  if (raw) return JSON.parse(raw);
  const seed: TrainingRequest[] = [
    {
      id: "TR001",
      trainingName: "Advanced Research Methodologies",
      trainingType: "Workshop",
      organizingBody: "National Universities Commission",
      location: "Abuja, Nigeria",
      startDate: "2024-03-10",
      endDate: "2024-03-14",
      estimatedCost: 85000,
      justification:
        "This workshop will enhance research skills and improve quality of student supervision.",
      expectedOutcomes:
        "Enhanced research supervision capability, updated knowledge of research methods.",
      status: "HOD Approved",
      hodComment: "Approved — relevant to departmental research agenda.",
      submittedAt: "2024-02-15T09:00:00Z",
    },
    {
      id: "TR002",
      trainingName: "International Conference on Computer Science Education",
      trainingType: "Conference",
      organizingBody: "IEEE Education Society",
      location: "Cape Town, South Africa",
      startDate: "2024-05-22",
      endDate: "2024-05-26",
      estimatedCost: 320000,
      justification:
        "Attending this conference will expose the department to global CS education trends.",
      expectedOutcomes:
        "Publication opportunity, networking with international faculty, curriculum insights.",
      status: "Submitted",
      submittedAt: "2024-04-01T10:30:00Z",
    },
  ];
  localStorage.setItem("unidigital_training_requests", JSON.stringify(seed));
  return seed;
}

function saveRequests(data: TrainingRequest[]) {
  localStorage.setItem("unidigital_training_requests", JSON.stringify(data));
}

const blank = (): Omit<TrainingRequest, "id" | "status" | "submittedAt"> => ({
  trainingName: "",
  trainingType: "Workshop",
  organizingBody: "",
  location: "",
  startDate: "",
  endDate: "",
  estimatedCost: 0,
  justification: "",
  expectedOutcomes: "",
});

export function TrainingApplicationForm() {
  const [requests, setRequests] = useState<TrainingRequest[]>(getRequests);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank());
  const [viewItem, setViewItem] = useState<TrainingRequest | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (
      !form.trainingName ||
      !form.organizingBody ||
      !form.startDate ||
      !form.endDate
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    const newReq: TrainingRequest = {
      id: `TR${Date.now()}`,
      ...form,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
    };
    const updated = [newReq, ...requests];
    saveRequests(updated);
    setRequests(updated);
    setForm(blank());
    setOpen(false);
    toast.success("Training application submitted successfully.");
  };

  const durationDays = (s: string, e: string) => {
    if (!s || !e) return "—";
    const diff =
      (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? `${diff + 1} days` : "—";
  };

  return (
    <div className="space-y-6" data-ocid="training-app.root">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={22} />
            Training Applications
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Submit and track your staff training & development requests
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          data-ocid="training-app.new_button"
        >
          <PlusCircle size={15} className="mr-1.5" />
          New Application
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            "Submitted",
            "HOD Approved",
            "HR Approved",
            "Rejected",
          ] as RequestStatus[]
        ).map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          return (
            <Card key={s} className="text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-slate-800">{count}</p>
                <Badge className={`mt-1 text-xs ${STATUS_COLORS[s]}`}>
                  {s}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Requests table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Training Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <p
              className="text-center text-slate-400 py-10"
              data-ocid="training-app.empty_state"
            >
              No training requests yet. Click "New Application" to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Training Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Cost (₦)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r, idx) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`training-app.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">
                        {r.trainingName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {r.trainingType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {r.startDate} → {r.endDate}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {durationDays(r.startDate, r.endDate)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {r.estimatedCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_COLORS[r.status]}`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setViewItem(r)}
                          data-ocid={`training-app.view_button.${idx + 1}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Application Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="training-app.dialog"
        >
          <DialogHeader>
            <DialogTitle>New Training Application</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>
                Training Name <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-1"
                value={form.trainingName}
                onChange={(e) => set("trainingName", e.target.value)}
                placeholder="e.g. Advanced Research Methods Workshop"
                data-ocid="training-app.name_input"
              />
            </div>
            <div>
              <Label>
                Training Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.trainingType}
                onValueChange={(v) => set("trainingType", v as TrainingType)}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="training-app.type_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Conference",
                      "Workshop",
                      "Course",
                      "Seminar",
                      "Study Tour",
                    ] as TrainingType[]
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Organizing Body <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-1"
                value={form.organizingBody}
                onChange={(e) => set("organizingBody", e.target.value)}
                placeholder="e.g. National Universities Commission"
                data-ocid="training-app.body_input"
              />
            </div>
            <div>
              <Label>
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-1"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="City, Country"
                data-ocid="training-app.location_input"
              />
            </div>
            <div>
              <Label>Estimated Cost (₦)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={form.estimatedCost || ""}
                onChange={(e) => set("estimatedCost", Number(e.target.value))}
                data-ocid="training-app.cost_input"
              />
            </div>
            <div>
              <Label>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-1"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                data-ocid="training-app.start_date_input"
              />
            </div>
            <div>
              <Label>
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-1"
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                data-ocid="training-app.end_date_input"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>
                Justification <span className="text-red-500">*</span>
              </Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={form.justification}
                onChange={(e) => set("justification", e.target.value)}
                placeholder="Why is this training relevant to your role and the department?"
                data-ocid="training-app.justification_textarea"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Expected Outcomes</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.expectedOutcomes}
                onChange={(e) => set("expectedOutcomes", e.target.value)}
                placeholder="What skills or knowledge will be gained?"
                data-ocid="training-app.outcomes_textarea"
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="training-app.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={submit} data-ocid="training-app.submit_button">
              <Send size={14} className="mr-1.5" />
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewItem}
        onOpenChange={(o) => {
          if (!o) setViewItem(null);
        }}
      >
        <DialogContent
          className="max-w-xl max-h-[85vh] overflow-y-auto"
          data-ocid="training-app.view_dialog"
        >
          <DialogHeader>
            <DialogTitle>{viewItem?.trainingName}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{viewItem.trainingType}</Badge>
                <Badge className={STATUS_COLORS[viewItem.status]}>
                  {viewItem.status}
                </Badge>
              </div>
              {[
                ["Organizing Body", viewItem.organizingBody],
                ["Location", viewItem.location],
                [
                  "Dates",
                  `${viewItem.startDate} → ${viewItem.endDate} (${durationDays(viewItem.startDate, viewItem.endDate)})`,
                ],
                [
                  "Estimated Cost",
                  `₦${viewItem.estimatedCost.toLocaleString()}`,
                ],
                ["Submitted", new Date(viewItem.submittedAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 min-w-[130px] shrink-0">
                    {k}:
                  </span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div>
                <p className="text-slate-500 font-medium mb-1">
                  Justification:
                </p>
                <p className="text-slate-700 bg-slate-50 rounded p-2 text-xs">
                  {viewItem.justification}
                </p>
              </div>
              {viewItem.expectedOutcomes && (
                <div>
                  <p className="text-slate-500 font-medium mb-1">
                    Expected Outcomes:
                  </p>
                  <p className="text-slate-700 bg-slate-50 rounded p-2 text-xs">
                    {viewItem.expectedOutcomes}
                  </p>
                </div>
              )}
              {viewItem.hodComment && (
                <div className="border-l-4 border-cyan-400 pl-3 bg-cyan-50 py-2 rounded-r">
                  <p className="text-xs font-semibold text-cyan-700">
                    HOD Comment
                  </p>
                  <p className="text-slate-700 text-xs mt-0.5">
                    {viewItem.hodComment}
                  </p>
                </div>
              )}
              {viewItem.hrComment && (
                <div className="border-l-4 border-green-400 pl-3 bg-green-50 py-2 rounded-r">
                  <p className="text-xs font-semibold text-green-700">
                    HR Comment
                  </p>
                  <p className="text-slate-700 text-xs mt-0.5">
                    {viewItem.hrComment}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setViewItem(null)}
              data-ocid="training-app.view_close_button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
