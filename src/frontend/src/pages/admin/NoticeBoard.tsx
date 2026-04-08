import {
  AlertTriangle,
  Archive,
  Bell,
  Calendar,
  CheckCircle,
  Eye,
  Filter,
  Megaphone,
  Pencil,
  Pin,
  PlusCircle,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
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
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoticeUrgency = "normal" | "important" | "urgent";

export interface NoticeboardAnnouncement {
  id: string;
  title: string;
  body: string;
  urgency: NoticeUrgency;
  category: "academic" | "administrative" | "financial" | "urgent";
  target: "all" | "students" | "staff" | "department";
  department?: string;
  attachment?: string;
  expiryDate?: string;
  date: string;
  author: string;
  pinned: boolean;
  active: boolean;
  readBy: string[]; // user IDs who have acknowledged
  recalled?: boolean;
}

const STORAGE_KEY = "unidigital_noticeboard";
const CURRENT_USER = "admin_user"; // Simulated current user

function loadNotices(): NoticeboardAnnouncement[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveNotices(notices: NoticeboardAnnouncement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}

function seedNotices(): NoticeboardAnnouncement[] {
  const seeded = loadNotices();
  if (seeded.length > 0) return seeded;
  const notices: NoticeboardAnnouncement[] = [
    {
      id: "NB001",
      title: "Commencement of 2024/2025 First Semester Registration",
      body: "All students are hereby informed that course registration for the 2024/2025 First Semester commences on Monday 15th January 2025. Students are to log in to the portal and complete registration within the stipulated period. Late registration attracts a penalty fee.",
      urgency: "important",
      category: "academic",
      target: "students",
      date: "2025-01-10",
      author: "Academic Registrar",
      pinned: true,
      active: true,
      readBy: ["student_001", "student_002", "student_003"],
    },
    {
      id: "NB002",
      title: "URGENT: Senate Meeting Scheduled for 20th January 2025",
      body: "All Senate members are to note that the first Senate Meeting of the 2024/2025 Academic Session is scheduled for Monday 20th January 2025 at 10:00am in the Senate Chamber. Full attendance is compulsory.",
      urgency: "urgent",
      category: "urgent",
      target: "staff",
      date: "2025-01-08",
      author: "Vice Chancellor's Office",
      pinned: true,
      active: true,
      readBy: ["staff_001", "staff_002"],
    },
    {
      id: "NB003",
      title: "School Fee Payment Deadline — First Semester 2024/2025",
      body: "Students are reminded that the deadline for payment of school fees for the 2024/2025 First Semester is 31st January 2025. Students who fail to pay by this date will not be allowed to sit for examinations.",
      urgency: "important",
      category: "financial",
      target: "students",
      expiryDate: "2025-01-31",
      date: "2025-01-05",
      author: "Bursary Department",
      pinned: false,
      active: true,
      readBy: ["student_001"],
    },
    {
      id: "NB004",
      title: "Staff Annual Appraisal Forms Now Available",
      body: "All academic and non-academic staff are to note that the Annual Performance Appraisal forms for 2024 are now available on the portal. Staff are to complete the self-assessment section and submit to their respective HODs by 28th February 2025.",
      urgency: "normal",
      category: "administrative",
      target: "staff",
      date: "2025-01-03",
      author: "Human Resources Department",
      pinned: false,
      active: true,
      readBy: [],
    },
    {
      id: "NB005",
      title: "First Semester Examinations Timetable Released",
      body: "The First Semester 2024/2025 Examination Timetable has been released and is available on the student portal. Students are to check their individual schedules and report any clashes to their respective department examination officers within 48 hours.",
      urgency: "normal",
      category: "academic",
      target: "all",
      date: "2024-12-20",
      author: "Examination Division",
      pinned: false,
      active: true,
      readBy: ["student_001", "student_002"],
    },
  ];
  saveNotices(notices);
  return notices;
}

// ─── Urgency Config ───────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<
  NoticeUrgency,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    badgeColor: string;
    sort: number;
  }
> = {
  urgent: {
    label: "Urgent",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    badgeColor: "bg-red-100 text-red-700",
    sort: 0,
  },
  important: {
    label: "Important",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-300",
    badgeColor: "bg-orange-100 text-orange-700",
    sort: 1,
  },
  normal: {
    label: "Normal",
    color: "text-foreground",
    bg: "bg-card",
    border: "border-border",
    badgeColor: "bg-muted text-muted-foreground",
    sort: 2,
  },
};

const CATEGORIES: {
  value: NoticeboardAnnouncement["category"];
  label: string;
  color: string;
}[] = [
  { value: "academic", label: "Academic", color: "bg-blue-100 text-blue-700" },
  {
    value: "administrative",
    label: "Administrative",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "financial",
    label: "Financial",
    color: "bg-green-100 text-green-700",
  },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

const TARGETS: { value: NoticeboardAnnouncement["target"]; label: string }[] = [
  { value: "all", label: "All (Everyone)" },
  { value: "students", label: "Students Only" },
  { value: "staff", label: "Staff Only" },
  { value: "department", label: "Specific Department" },
];

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Education",
  "Human Kinetics",
  "Health Education",
];

// Total simulated users per target
const TOTAL_USERS: Record<NoticeboardAnnouncement["target"], number> = {
  all: 250,
  students: 198,
  staff: 52,
  department: 30,
};

const emptyForm = {
  title: "",
  body: "",
  urgency: "normal" as NoticeUrgency,
  category: "academic" as NoticeboardAnnouncement["category"],
  target: "all" as NoticeboardAnnouncement["target"],
  department: "",
  attachment: "",
  expiryDate: "",
  pinned: false,
};

// ─── Detail Dialog ─────────────────────────────────────────────────────────

function AckDetail({
  notice,
  onAcknowledge,
}: { notice: NoticeboardAnnouncement; onAcknowledge: (id: string) => void }) {
  const urgCfg = URGENCY_CONFIG[notice.urgency];
  const cat = CATEGORIES.find((c) => c.value === notice.category);
  const totalExpected = TOTAL_USERS[notice.target];
  const ackPct =
    totalExpected > 0
      ? Math.round((notice.readBy.length / totalExpected) * 100)
      : 0;
  const isAcked = notice.readBy.includes(CURRENT_USER);

  // Simulated acknowledger names
  const simNames = [
    "Dr. Aminu Ibrahim",
    "Prof. Grace Adeyemi",
    "Engr. Bashir Musa",
    "Mrs. Chidinma Okonkwo",
    "Mr. Emmanuel Tarkaa",
    "Dr. Fatima Sule",
    "Prof. John Okafor",
    "Mrs. Ngozi Chukwu",
  ];

  return (
    <DialogContent
      className="max-w-xl max-h-[80vh] overflow-y-auto"
      data-ocid="noticeboard.detail_dialog"
    >
      <DialogHeader>
        <div className="flex items-start gap-3 pr-6">
          {notice.pinned && (
            <Pin size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
          )}
          <DialogTitle className="leading-snug">{notice.title}</DialogTitle>
        </div>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${urgCfg.badgeColor} border-0 text-xs`}>
            {urgCfg.label}
          </Badge>
          {cat && (
            <Badge className={`${cat.color} border-0 text-xs`}>
              {cat.label}
            </Badge>
          )}
          <Badge className="bg-muted text-muted-foreground border-0 text-xs">
            {notice.target === "department"
              ? `Dept: ${notice.department}`
              : TARGETS.find((t) => t.value === notice.target)?.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          By {notice.author} • {notice.date}
          {notice.expiryDate && ` • Expires: ${notice.expiryDate}`}
        </p>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {notice.body}
        </p>
        {notice.attachment && (
          <div className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2 text-sm text-foreground">
            <Archive size={14} /> Attachment: {notice.attachment}
          </div>
        )}

        {/* Acknowledgment Stats */}
        <div className={`rounded-lg p-4 border ${urgCfg.border} ${urgCfg.bg}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600" />
              Acknowledgment Status
            </p>
            <span
              className={`text-sm font-bold ${ackPct >= 80 ? "text-green-600" : ackPct >= 50 ? "text-amber-600" : "text-red-600"}`}
            >
              {ackPct}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${ackPct >= 80 ? "bg-green-500" : ackPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(ackPct, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {notice.readBy.length} of ~{totalExpected} expected recipients
            acknowledged
          </p>
          {notice.readBy.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-foreground mb-1">
                Recent acknowledgments:
              </p>
              <div className="flex flex-wrap gap-1">
                {simNames
                  .slice(0, Math.min(notice.readBy.length, 6))
                  .map((name) => (
                    <span
                      key={name}
                      className="text-xs bg-card border rounded-full px-2 py-0.5 text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                {notice.readBy.length > 6 && (
                  <span className="text-xs bg-card border rounded-full px-2 py-0.5 text-muted-foreground">
                    +{notice.readBy.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {!isAcked && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => onAcknowledge(notice.id)}
            data-ocid="noticeboard.acknowledge_button"
          >
            <CheckCircle size={14} className="mr-2" /> Acknowledge this Notice
          </Button>
        )}
        {isAcked && (
          <p className="text-center text-sm text-green-600 font-medium flex items-center justify-center gap-2">
            <CheckCircle size={14} /> You have acknowledged this notice
          </p>
        )}
      </div>
    </DialogContent>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoticeBoard() {
  const [notices, setNotices] = useState<NoticeboardAnnouncement[]>([]);
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterTarget, setFilterTarget] = useState("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editNotice, setEditNotice] = useState<NoticeboardAnnouncement | null>(
    null,
  );
  const [detailNotice, setDetailNotice] =
    useState<NoticeboardAnnouncement | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [tab, setTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    setNotices(seedNotices());
  }, []);

  // ─── Filtering + Sorting ──────────────────────────────────────────────────

  const filtered = notices.filter((n) => {
    if (n.recalled) return false;
    if (tab === "active" && !n.active) return false;
    if (tab === "archived" && n.active) return false;
    if (filterUrgency !== "all" && n.urgency !== filterUrgency) return false;
    if (filterTarget !== "all" && n.target !== filterTarget) return false;
    if (
      search &&
      !n.title.toLowerCase().includes(search.toLowerCase()) &&
      !n.body.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // Sort: pinned first, then by urgency (urgent > important > normal), then by date desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const urgDiff =
      URGENCY_CONFIG[a.urgency].sort - URGENCY_CONFIG[b.urgency].sort;
    if (urgDiff !== 0) return urgDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditNotice(null);
    setForm({ ...emptyForm });
    setDialog(true);
  };

  const openEdit = (notice: NoticeboardAnnouncement) => {
    setEditNotice(notice);
    setForm({
      title: notice.title,
      body: notice.body,
      urgency: notice.urgency,
      category: notice.category,
      target: notice.target,
      department: notice.department ?? "",
      attachment: notice.attachment ?? "",
      expiryDate: notice.expiryDate ?? "",
      pinned: notice.pinned,
    });
    setDialog(true);
  };

  const save = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    let updated: NoticeboardAnnouncement[];
    if (editNotice) {
      updated = notices.map((n) =>
        n.id === editNotice.id
          ? {
              ...n,
              title: form.title,
              body: form.body,
              urgency: form.urgency,
              category: form.category,
              target: form.target,
              department: form.department || undefined,
              attachment: form.attachment || undefined,
              expiryDate: form.expiryDate || undefined,
              pinned: form.pinned,
            }
          : n,
      );
      toast.success("Notice updated.");
    } else {
      const newNotice: NoticeboardAnnouncement = {
        id: `NB${Date.now()}`,
        title: form.title,
        body: form.body,
        urgency: form.urgency,
        category: form.category,
        target: form.target,
        department: form.department || undefined,
        attachment: form.attachment || undefined,
        expiryDate: form.expiryDate || undefined,
        date: new Date().toISOString().split("T")[0],
        author: "Administrator",
        pinned: form.pinned,
        active: true,
        readBy: [],
      };
      updated = [newNotice, ...notices];
      toast.success(
        `Notice published${form.urgency === "urgent" ? " (URGENT)" : ""}.`,
      );
    }
    saveNotices(updated);
    setNotices(updated);
    setDialog(false);
    setForm({ ...emptyForm });
    setEditNotice(null);
  };

  const deleteNotice = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    saveNotices(updated);
    setNotices(updated);
    toast.success("Notice deleted.");
  };

  const toggleActive = (notice: NoticeboardAnnouncement) => {
    const updated = notices.map((n) =>
      n.id === notice.id ? { ...n, active: !n.active } : n,
    );
    saveNotices(updated);
    setNotices(updated);
    toast.success(notice.active ? "Notice archived." : "Notice reactivated.");
  };

  const togglePin = (notice: NoticeboardAnnouncement) => {
    const updated = notices.map((n) =>
      n.id === notice.id ? { ...n, pinned: !n.pinned } : n,
    );
    saveNotices(updated);
    setNotices(updated);
    toast.success(notice.pinned ? "Notice unpinned." : "Notice pinned to top.");
  };

  const recallNotice = (id: string) => {
    const updated = notices.map((n) =>
      n.id === id ? { ...n, recalled: true, active: false } : n,
    );
    saveNotices(updated);
    setNotices(updated);
    toast.success("Notice recalled and retracted.");
  };

  const acknowledgeNotice = (id: string) => {
    const updated = notices.map((n) =>
      n.id === id && !n.readBy.includes(CURRENT_USER)
        ? { ...n, readBy: [...n.readBy, CURRENT_USER] }
        : n,
    );
    saveNotices(updated);
    setNotices(updated);
    // Update detailNotice if viewing
    if (detailNotice?.id === id) {
      const refreshed = updated.find((n) => n.id === id);
      if (refreshed) setDetailNotice(refreshed);
    }
    toast.success("Notice acknowledged.");
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const activeNotices = notices.filter((n) => n.active && !n.recalled);
  const activeCount = activeNotices.length;
  const urgentCount = activeNotices.filter(
    (n) => n.urgency === "urgent",
  ).length;
  const pinnedCount = activeNotices.filter((n) => n.pinned).length;
  const totalAcks = notices.reduce((s, n) => s + n.readBy.length, 0);

  const getCategoryConfig = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat) ?? {
      label: cat,
      color: "bg-muted text-muted-foreground",
    };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notice Board</h1>
          <p className="text-muted-foreground text-sm">
            Manage and publish announcements to all roles
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="bg-primary hover:bg-primary/90"
          data-ocid="noticeboard.primary_button"
        >
          <PlusCircle size={16} className="mr-2" /> New Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Megaphone size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">Active Notices</p>
              <p className="text-2xl font-bold text-blue-800">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500" />
            <div>
              <p className="text-xs text-red-600">Urgent</p>
              <p className="text-2xl font-bold text-red-800">{urgentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4 flex items-center gap-3">
            <Pin size={20} className="text-yellow-600" />
            <div>
              <p className="text-xs text-yellow-600">Pinned</p>
              <p className="text-2xl font-bold text-yellow-800">
                {pinnedCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-green-600">Total Acknowledgments</p>
              <p className="text-2xl font-bold text-green-800">{totalAcks}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Filters */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <TabsList>
            <TabsTrigger value="active" data-ocid="noticeboard.tab_active">
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="archived" data-ocid="noticeboard.tab_archived">
              Archived ({notices.filter((n) => !n.active || n.recalled).length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-2.5 text-muted-foreground"
              />
              <Input
                className="pl-8 h-9 w-52 text-sm"
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="noticeboard.search_input"
              />
            </div>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger
                className="h-9 w-36 text-sm"
                data-ocid="noticeboard.filter_urgency"
              >
                <AlertTriangle
                  size={13}
                  className="mr-1 text-muted-foreground"
                />
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                {(
                  Object.entries(URGENCY_CONFIG) as [
                    NoticeUrgency,
                    (typeof URGENCY_CONFIG)[NoticeUrgency],
                  ][]
                ).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTarget} onValueChange={setFilterTarget}>
              <SelectTrigger
                className="h-9 w-36 text-sm"
                data-ocid="noticeboard.filter_target"
              >
                <Users size={13} className="mr-1 text-muted-foreground" />
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                {TARGETS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="active" className="mt-4">
          <NoticeList
            notices={sorted}
            onEdit={openEdit}
            onDelete={deleteNotice}
            onToggleActive={toggleActive}
            onTogglePin={togglePin}
            onView={(n) => setDetailNotice(n)}
            onRecall={recallNotice}
            getCategoryConfig={getCategoryConfig}
          />
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          <NoticeList
            notices={sorted}
            onEdit={openEdit}
            onDelete={deleteNotice}
            onToggleActive={toggleActive}
            onTogglePin={togglePin}
            onView={(n) => setDetailNotice(n)}
            onRecall={recallNotice}
            getCategoryConfig={getCategoryConfig}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-ocid="noticeboard.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editNotice ? "Edit Notice" : "New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pr-1">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Notice title"
                data-ocid="noticeboard.input_title"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Urgency</Label>
                <Select
                  value={form.urgency}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, urgency: v as NoticeUrgency }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="noticeboard.select_urgency"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      category: v as NoticeboardAnnouncement["category"],
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="noticeboard.select_category"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select
                  value={form.target}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      target: v as NoticeboardAnnouncement["target"],
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="noticeboard.select_target"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGETS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.target === "department" && (
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, department: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Body *</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={5}
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                placeholder="Full notice content..."
                data-ocid="noticeboard.textarea_body"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiryDate: e.target.value }))
                  }
                  data-ocid="noticeboard.input_expiry"
                />
              </div>
              <div>
                <Label>Attachment (description)</Label>
                <Input
                  className="mt-1"
                  value={form.attachment}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, attachment: e.target.value }))
                  }
                  placeholder="e.g. Timetable PDF"
                  data-ocid="noticeboard.input_attachment"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.pinned}
                onCheckedChange={(v) => setForm((f) => ({ ...f, pinned: v }))}
                data-ocid="noticeboard.toggle_pin"
              />
              <Label className="cursor-pointer">
                Pin to top of notice board
              </Label>
            </div>

            {form.urgency === "urgent" && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={13} />
                This notice will be marked URGENT and highlighted in red for all
                recipients.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="noticeboard.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              onClick={save}
              data-ocid="noticeboard.submit_button"
            >
              {editNotice ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog
        open={!!detailNotice}
        onOpenChange={(open) => !open && setDetailNotice(null)}
      >
        {detailNotice && (
          <AckDetail notice={detailNotice} onAcknowledge={acknowledgeNotice} />
        )}
      </Dialog>
    </div>
  );
}

// ─── Notice List subcomponent ─────────────────────────────────────────────────

interface NoticeListProps {
  notices: NoticeboardAnnouncement[];
  onEdit: (n: NoticeboardAnnouncement) => void;
  onDelete: (id: string) => void;
  onToggleActive: (n: NoticeboardAnnouncement) => void;
  onTogglePin: (n: NoticeboardAnnouncement) => void;
  onView: (n: NoticeboardAnnouncement) => void;
  onRecall: (id: string) => void;
  getCategoryConfig: (cat: string) => { label: string; color: string };
}

function NoticeList({
  notices,
  onEdit,
  onDelete,
  onToggleActive,
  onTogglePin,
  onView,
  onRecall,
  getCategoryConfig,
}: NoticeListProps) {
  if (notices.length === 0) {
    return (
      <Card data-ocid="noticeboard.empty_state">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          No notices found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-ocid="noticeboard.list">
      {notices.map((notice, idx) => {
        const urgCfg = URGENCY_CONFIG[notice.urgency];
        const cat = getCategoryConfig(notice.category);
        const totalExpected = TOTAL_USERS[notice.target];
        const ackPct =
          totalExpected > 0
            ? Math.round((notice.readBy.length / totalExpected) * 100)
            : 0;

        return (
          <Card
            key={notice.id}
            data-ocid={`noticeboard.item.${idx + 1}`}
            className={`transition-all border ${urgCfg.border} ${urgCfg.bg} ${notice.active === false ? "opacity-60" : ""}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    {notice.pinned && (
                      <Pin
                        size={14}
                        className="text-yellow-500 mt-0.5 flex-shrink-0"
                      />
                    )}
                    {notice.urgency === "urgent" && (
                      <AlertTriangle
                        size={14}
                        className="text-red-500 mt-0.5 flex-shrink-0"
                      />
                    )}
                    {notice.urgency === "important" && (
                      <AlertTriangle
                        size={14}
                        className="text-orange-500 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <h3
                      className={`font-semibold leading-snug ${urgCfg.color}`}
                    >
                      {notice.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`${urgCfg.badgeColor} border-0 text-xs`}>
                      {urgCfg.label}
                    </Badge>
                    <Badge className={`${cat.color} border-0 text-xs`}>
                      {cat.label}
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                      {notice.target === "department"
                        ? `Dept: ${notice.department}`
                        : notice.target}
                    </Badge>
                    {notice.expiryDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={11} /> Expires {notice.expiryDate}
                      </span>
                    )}
                    {!notice.active && (
                      <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    By {notice.author} • {notice.date}
                  </p>
                  <p className="text-sm text-foreground mt-2 line-clamp-2">
                    {notice.body}
                  </p>

                  {/* Acknowledgment mini-bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 max-w-[120px] bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${ackPct >= 80 ? "bg-green-500" : ackPct >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${Math.min(ackPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {notice.readBy.length} acknowledged ({ackPct}%)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={notice.pinned ? "Unpin" : "Pin to top"}
                      onClick={() => onTogglePin(notice)}
                      className={`p-1.5 rounded hover:bg-muted/50 transition-colors ${notice.pinned ? "text-yellow-500" : "text-muted-foreground/40 hover:text-yellow-400"}`}
                      data-ocid={`noticeboard.pin.${idx + 1}`}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      type="button"
                      title="View details"
                      onClick={() => onView(notice)}
                      className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                      data-ocid={`noticeboard.view.${idx + 1}`}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => onEdit(notice)}
                      className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      data-ocid={`noticeboard.edit.${idx + 1}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(notice.id)}
                      className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-destructive transition-colors"
                      data-ocid={`noticeboard.delete.${idx + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleActive(notice)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        notice.active
                          ? "text-muted-foreground border-border hover:bg-muted"
                          : "text-green-600 border-green-200 hover:bg-green-50"
                      }`}
                      data-ocid={`noticeboard.toggle_active.${idx + 1}`}
                    >
                      {notice.active ? "Archive" : "Restore"}
                    </button>
                    {notice.active && (
                      <button
                        type="button"
                        title="Recall (retract) notice"
                        onClick={() => onRecall(notice.id)}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        data-ocid={`noticeboard.recall.${idx + 1}`}
                      >
                        <XCircle size={12} className="inline mr-0.5" /> Recall
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
