import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Complaint {
  id: string;
  category: string;
  urgency: string;
  subject: string;
  description: string;
  date: string;
  status: "Open" | "In Review" | "Resolved";
  response?: string;
}

export function StudentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("studentComplaints") ?? "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({
    category: "",
    urgency: "Medium",
    subject: "",
    description: "",
  });

  const save = (updated: Complaint[]) => {
    setComplaints(updated);
    localStorage.setItem("studentComplaints", JSON.stringify(updated));
  };

  const handleSubmit = () => {
    if (!form.category || !form.subject || !form.description) return;
    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      ...form,
      date: new Date().toISOString().split("T")[0],
      status: "Open",
    };
    save([newComplaint, ...complaints]);
    setForm({ category: "", urgency: "Medium", subject: "", description: "" });
  };

  const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
    Open: "destructive",
    "In Review": "secondary",
    Resolved: "default",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Complaints & Feedback
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Submit and track your complaints
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit New Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger data-ocid="complaints.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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
            </div>
            <div>
              <Label>Urgency</Label>
              <Select
                value={form.urgency}
                onValueChange={(v) => setForm((p) => ({ ...p, urgency: v }))}
              >
                <SelectTrigger data-ocid="complaints.urgency.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High"].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
              placeholder="Brief subject line"
              data-ocid="complaints.input"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe your complaint in detail"
              data-ocid="complaints.textarea"
            />
          </div>
          <Button onClick={handleSubmit} data-ocid="complaints.submit_button">
            Submit Complaint
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Complaints ({complaints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <p
              className="text-slate-400 text-sm text-center py-6"
              data-ocid="complaints.empty_state"
            >
              No complaints submitted.
            </p>
          ) : (
            <div className="space-y-3">
              {complaints.map((c, idx) => (
                <div
                  key={c.id}
                  className="border rounded-lg p-4"
                  data-ocid={`complaints.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{c.subject}</p>
                      <p className="text-xs text-slate-400">
                        {c.category} · {c.urgency} urgency · {c.date}
                      </p>
                    </div>
                    <Badge variant={statusColor[c.status] ?? "secondary"}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{c.description}</p>
                  {c.response && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs font-semibold text-blue-700">
                        Admin Response:
                      </p>
                      <p className="text-sm text-blue-800 mt-1">{c.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
