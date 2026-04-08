import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  AlertCircle,
  Archive,
  ChevronDown,
  ChevronUp,
  Download,
  PenLine,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

// ---- Types ----
export interface InternalMemo {
  id: string;
  title: string;
  body: string;
  attachmentUrl?: string;
  priority: "normal" | "high" | "urgent";
  recipientType: "all-staff" | "role" | "department" | "all-students" | "all";
  recipientRoles?: string[];
  recipientDepts?: string[];
  senderName: string;
  sentAt: string;
  readBy: { id: string; name: string; at: string }[];
  status: "sent" | "draft";
  totalRecipients: number;
}

function getLocalInternalMemos(): InternalMemo[] {
  return JSON.parse(localStorage.getItem("unidigital_internal_memos") || "[]");
}
function saveLocalInternalMemos(data: InternalMemo[]) {
  localStorage.setItem("unidigital_internal_memos", JSON.stringify(data));
}

const ROLES = ["Admin", "HOD", "Lecturer", "HR", "Bursary"];
const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Chemistry",
];

const PRIORITY_LABELS: Record<string, { label: string; cls: string }> = {
  normal: { label: "Normal", cls: "bg-slate-100 text-slate-600" },
  high: { label: "High", cls: "bg-amber-100 text-amber-700" },
  urgent: { label: "Urgent", cls: "bg-red-100 text-red-700" },
};

function recipientSummary(m: InternalMemo) {
  if (m.recipientType === "all") return "All Users";
  if (m.recipientType === "all-staff") return "All Staff";
  if (m.recipientType === "all-students") return "All Students";
  if (m.recipientType === "role")
    return `Roles: ${(m.recipientRoles || []).join(", ")}`;
  if (m.recipientType === "department")
    return `Depts: ${(m.recipientDepts || []).join(", ")}`;
  return "—";
}

function estimateRecipients(
  type: string,
  roles: string[],
  depts: string[],
): number {
  if (type === "all") return 120;
  if (type === "all-staff") return 45;
  if (type === "all-students") return 300;
  if (type === "role") return roles.length * 8;
  if (type === "department") return depts.length * 35;
  return 0;
}

// ---- Blank draft ----
function blankDraft(): Omit<InternalMemo, "id" | "sentAt" | "readBy"> {
  return {
    title: "",
    body: "",
    attachmentUrl: "",
    priority: "normal",
    recipientType: "all-staff",
    recipientRoles: [],
    recipientDepts: [],
    senderName: "Administrator",
    status: "draft",
    totalRecipients: 0,
  };
}

// ---- Seed demo memos if empty ----
function seedDemoMemos() {
  const existing = getLocalInternalMemos();
  if (existing.length > 0) return;
  const demos: InternalMemo[] = [
    {
      id: "M001",
      title: "2024/2025 Second Semester Examination Timetable Released",
      body: "Dear Staff and Students, the timetable for the 2024/2025 Second Semester examinations has been released. Please review carefully and prepare accordingly. Any clashes should be reported to the Exam Office within 48 hours.",
      priority: "high",
      recipientType: "all",
      senderName: "Administrator",
      sentAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      readBy: [
        {
          id: "STF001",
          name: "Dr. Adamu",
          at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "STF002",
          name: "Prof. Bello",
          at: new Date(Date.now() - 80000000).toISOString(),
        },
      ],
      status: "sent",
      totalRecipients: 120,
    },
    {
      id: "M002",
      title: "Staff Meeting – Academic Planning for Next Session",
      body: "All academic staff are required to attend the academic planning meeting scheduled for Friday, 12th April 2025 at 10:00 AM in the Senate Chamber. Attendance is compulsory.",
      priority: "urgent",
      recipientType: "all-staff",
      senderName: "Administrator",
      sentAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      readBy: [
        {
          id: "STF001",
          name: "Dr. Adamu",
          at: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
      ],
      status: "sent",
      totalRecipients: 45,
    },
    {
      id: "M003",
      title: "Draft: IT Infrastructure Upgrade Notice",
      body: "The ICT unit will be carrying out a scheduled upgrade of the university network infrastructure on Saturday. Expect brief service interruptions.",
      priority: "normal",
      recipientType: "all-staff",
      senderName: "Administrator",
      sentAt: "",
      readBy: [],
      status: "draft",
      totalRecipients: 0,
    },
  ];
  saveLocalInternalMemos(demos);
}

// ---- Main Component ----
export function InternalMemoSystem() {
  const [memos, setMemos] = useState<InternalMemo[]>([]);
  const [tab, setTab] = useState<"compose" | "archive">("compose");
  const [form, setForm] = useState(blankDraft());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editDraftId, setEditDraftId] = useState<string | null>(null);

  useEffect(() => {
    seedDemoMemos();
    setMemos(getLocalInternalMemos());
  }, []);

  const toggleRole = (role: string) => {
    const cur = form.recipientRoles ?? [];
    setForm((f) => ({
      ...f,
      recipientRoles: cur.includes(role)
        ? cur.filter((r) => r !== role)
        : [...cur, role],
    }));
  };
  const toggleDept = (dept: string) => {
    const cur = form.recipientDepts ?? [];
    setForm((f) => ({
      ...f,
      recipientDepts: cur.includes(dept)
        ? cur.filter((d) => d !== dept)
        : [...cur, dept],
    }));
  };

  const handleSend = (asDraft = false) => {
    if (!form.title.trim() || !form.body.trim()) return;
    const total = estimateRecipients(
      form.recipientType,
      form.recipientRoles ?? [],
      form.recipientDepts ?? [],
    );
    const memo: InternalMemo = {
      ...form,
      id: editDraftId ?? `M${Date.now()}`,
      sentAt: asDraft ? "" : new Date().toISOString(),
      readBy: [],
      status: asDraft ? "draft" : "sent",
      totalRecipients: asDraft ? 0 : total,
    };
    const existing = getLocalInternalMemos();
    const updated = editDraftId
      ? existing.map((m) => (m.id === editDraftId ? memo : m))
      : [memo, ...existing];
    saveLocalInternalMemos(updated);
    setMemos(updated);
    setForm(blankDraft());
    setEditDraftId(null);
    if (!asDraft) setTab("archive");
  };

  const loadDraft = (m: InternalMemo) => {
    setForm({
      title: m.title,
      body: m.body,
      attachmentUrl: m.attachmentUrl ?? "",
      priority: m.priority,
      recipientType: m.recipientType,
      recipientRoles: m.recipientRoles ?? [],
      recipientDepts: m.recipientDepts ?? [],
      senderName: m.senderName,
      status: "draft",
      totalRecipients: 0,
    });
    setEditDraftId(m.id);
    setTab("compose");
  };

  const exportNonReaders = (m: InternalMemo) => {
    const readIds = m.readBy.map((r) => r.id);
    // simulate non-readers list
    const nonReaders = [
      "STF003 – Musa Usman",
      "STF004 – Ngozi Eze",
      "STF005 – Aliyu Ibrahim",
    ].filter((_, i) => !readIds.includes(`STF00${i + 3}`));
    const csv = `Name/ID,Status\n${nonReaders.map((n) => `${n},Not Read`).join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `non-readers-${m.id}.csv`;
    a.click();
  };

  const filteredMemos = memos
    .filter((m) => m.status === "sent")
    .filter((m) => {
      if (
        search &&
        !m.title.toLowerCase().includes(search.toLowerCase()) &&
        !m.body.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterPriority !== "all" && m.priority !== filterPriority)
        return false;
      if (filterType !== "all" && m.recipientType !== filterType) return false;
      if (dateFrom && m.sentAt < dateFrom) return false;
      if (dateTo && m.sentAt > `${dateTo}T23:59`) return false;
      return true;
    });

  const drafts = memos.filter((m) => m.status === "draft");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Internal Memo System
          </h1>
          <p className="text-slate-500 text-sm">
            Compose and manage institutional memos &amp; circulars
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "compose" ? "default" : "outline"}
            className={tab === "compose" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTab("compose")}
          >
            <PenLine size={15} className="mr-1.5" /> Compose
          </Button>
          <Button
            variant={tab === "archive" ? "default" : "outline"}
            className={tab === "archive" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTab("archive")}
          >
            <Archive size={15} className="mr-1.5" /> Archive
            {filteredMemos.length > 0 && (
              <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-xs">
                {filteredMemos.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* COMPOSE TAB */}
      {tab === "compose" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editDraftId ? "Edit Draft" : "New Memo / Circular"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title *</Label>
                    <Input
                      className="mt-1"
                      placeholder="Memo title or subject..."
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          priority: v as InternalMemo["priority"],
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recipient Type</Label>
                    <Select
                      value={form.recipientType}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          recipientType: v as InternalMemo["recipientType"],
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="all-staff">All Staff</SelectItem>
                        <SelectItem value="all-students">
                          All Students
                        </SelectItem>
                        <SelectItem value="role">Specific Role(s)</SelectItem>
                        <SelectItem value="department">
                          Specific Department(s)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditional recipient selectors */}
                {form.recipientType === "role" && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Select Roles
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((r) => (
                        <label
                          key={r}
                          htmlFor={`role-${r}`}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <Checkbox
                            id={`role-${r}`}
                            checked={(form.recipientRoles ?? []).includes(r)}
                            onCheckedChange={() => toggleRole(r)}
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {form.recipientType === "department" && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Select Departments
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEPARTMENTS.map((d) => (
                        <label
                          key={d}
                          htmlFor={`dept-${d}`}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <Checkbox
                            id={`dept-${d}`}
                            checked={(form.recipientDepts ?? []).includes(d)}
                            onCheckedChange={() => toggleDept(d)}
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Message Body *</Label>
                  <Textarea
                    className="mt-1 min-h-[160px]"
                    placeholder="Type your memo content here..."
                    value={form.body}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, body: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>Attachment URL (optional)</Label>
                  <Input
                    className="mt-1"
                    placeholder="https://..."
                    value={form.attachmentUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, attachmentUrl: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleSend(false)}
                    disabled={!form.title.trim() || !form.body.trim()}
                  >
                    <Send size={15} className="mr-1.5" /> Send Memo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSend(true)}
                    disabled={!form.title.trim()}
                  >
                    Save as Draft
                  </Button>
                  {editDraftId && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setForm(blankDraft());
                        setEditDraftId(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drafts panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Drafts ({drafts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {drafts.length === 0 && (
                  <p className="text-sm text-slate-400">No drafts saved.</p>
                )}
                {drafts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="w-full text-left p-3 rounded-lg border border-dashed border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => loadDraft(d)}
                  >
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {d.title || "(Untitled)"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {d.body || "No content"}
                    </p>
                    <span className="text-xs text-blue-500 mt-1 inline-block">
                      Click to edit
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ARCHIVE TAB */}
      {tab === "archive" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="md:col-span-2 relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    className="pl-9"
                    placeholder="Search memos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="all-staff">All Staff</SelectItem>
                    <SelectItem value="all-students">All Students</SelectItem>
                    <SelectItem value="role">By Role</SelectItem>
                    <SelectItem value="department">By Department</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredMemos.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center text-slate-400">
                <Archive size={36} className="mx-auto mb-3 opacity-30" />
                <p>No memos found matching your filters.</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {filteredMemos.map((m) => {
              const isExpanded = expandedId === m.id;
              const pri = PRIORITY_LABELS[m.priority];
              return (
                <Card
                  key={m.id}
                  className="border-l-4"
                  style={{
                    borderLeftColor:
                      m.priority === "urgent"
                        ? "#ef4444"
                        : m.priority === "high"
                          ? "#f59e0b"
                          : "#94a3b8",
                  }}
                >
                  <CardContent className="p-5">
                    <button
                      type="button"
                      className="flex items-start justify-between w-full cursor-pointer text-left"
                      onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-800">
                            {m.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri.cls}`}
                          >
                            {pri.label}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                          <span>
                            <Users size={11} className="inline mr-1" />
                            {recipientSummary(m)}
                          </span>
                          <span>
                            {new Date(m.sentAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="font-medium text-blue-600">
                            {m.readBy.length}/{m.totalRecipients} read
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp
                          size={16}
                          className="text-slate-400 flex-shrink-0"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-slate-400 flex-shrink-0"
                        />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 border-t pt-4">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {m.body}
                        </p>
                        {m.attachmentUrl && (
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 underline"
                          >
                            📎 View Attachment
                          </a>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Readers */}
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2">
                              ✅ Read By ({m.readBy.length})
                            </p>
                            {m.readBy.length === 0 ? (
                              <p className="text-xs text-slate-400">
                                No acknowledgements yet.
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {m.readBy.map((r) => (
                                  <div
                                    key={r.id}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-slate-700">
                                      {r.name}
                                    </span>
                                    <span className="text-slate-400">
                                      {new Date(r.at).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Non-readers */}
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2">
                              ⏳ Not Yet Read (
                              {m.totalRecipients - m.readBy.length})
                            </p>
                            <p className="text-xs text-slate-400 mb-2">
                              Export the list to follow up with non-readers.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => exportNonReaders(m)}
                            >
                              <Download size={12} className="mr-1" />
                              Export Non-Readers List
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
