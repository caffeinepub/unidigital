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
import { useState } from "react";

interface Complaint {
  id: string;
  student: string;
  category: string;
  urgency: string;
  subject: string;
  description: string;
  date: string;
  status: "Open" | "In Review" | "Resolved";
  response?: string;
}

const seedComplaints: Complaint[] = [
  {
    id: "c1",
    student: "Alice Johnson",
    category: "Academic",
    urgency: "High",
    subject: "Grade discrepancy in MTH101",
    description:
      "My CA score of 38 was recorded as 28. I have the original script.",
    date: "2024-10-01",
    status: "Open",
  },
  {
    id: "c2",
    student: "Emeka Okafor",
    category: "Facility",
    urgency: "Medium",
    subject: "Broken projector in Lecture Hall 2",
    description: "The projector has been broken for 3 weeks.",
    date: "2024-10-05",
    status: "In Review",
    response: "Maintenance team has been notified.",
  },
  {
    id: "c3",
    student: "Fatima Bello",
    category: "IT Support",
    urgency: "Low",
    subject: "Portal login issue",
    description: "Cannot access the student portal after password reset.",
    date: "2024-10-10",
    status: "Resolved",
    response: "Account has been reset. Please try again.",
  },
];

const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
  Open: "destructive",
  "In Review": "secondary",
  Resolved: "default",
};

export function ComplaintsAdmin() {
  const [complaints, setComplaints] = useState<Complaint[]>(seedComplaints);
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState<Complaint["status"]>("Open");

  const filtered = complaints.filter((c) => {
    if (filterCat && c.category !== filterCat) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    if (
      search &&
      !c.subject.toLowerCase().includes(search.toLowerCase()) &&
      !c.student.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleOpen = (c: Complaint) => {
    setSelected(c);
    setResponse(c.response ?? "");
    setNewStatus(c.status);
  };

  const handleSave = () => {
    if (!selected) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, response, status: newStatus } : c,
      ),
    );
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Complaints Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and respond to student complaints
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Input
              placeholder="Search by student or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48"
              data-ocid="complaints.search_input"
            />
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-40" data-ocid="complaints.cat.select">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {[
                  "Academic",
                  "Facility",
                  "Staff Conduct",
                  "IT Support",
                  "Other",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                className="w-36"
                data-ocid="complaints.status.select"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {["Open", "In Review", "Resolved"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table data-ocid="complaints.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, idx) => (
                <TableRow key={c.id} data-ocid={`complaints.item.${idx + 1}`}>
                  <TableCell>{c.student}</TableCell>
                  <TableCell>{c.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.urgency === "High" ? "destructive" : "secondary"
                      }
                    >
                      {c.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {c.subject}
                  </TableCell>
                  <TableCell>{c.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor[c.status] ?? "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpen(c)}
                      data-ocid={`complaints.edit_button.${idx + 1}`}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg" data-ocid="complaints.dialog">
          <DialogHeader>
            <DialogTitle>Complaint Detail</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Student:</strong> {selected?.student}
            </p>
            <p>
              <strong>Category:</strong> {selected?.category} ·{" "}
              <strong>Urgency:</strong> {selected?.urgency}
            </p>
            <p>
              <strong>Subject:</strong> {selected?.subject}
            </p>
            <p>
              <strong>Description:</strong>
            </p>
            <p className="bg-slate-50 rounded p-2 text-slate-600">
              {selected?.description}
            </p>
            <div>
              <label
                htmlFor="complaint-response"
                className="font-semibold block mb-1"
              >
                Response
              </label>
              <Textarea
                id="complaint-response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                data-ocid="complaints.textarea"
              />
            </div>
            <div>
              <label
                htmlFor="complaint-status"
                className="font-semibold block mb-1"
              >
                Update Status
              </label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as Complaint["status"])}
              >
                <SelectTrigger data-ocid="complaints.status_update.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Open", "In Review", "Resolved"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelected(null)}
              data-ocid="complaints.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="complaints.save_button">
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
