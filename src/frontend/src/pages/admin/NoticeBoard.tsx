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
  X,
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

export interface NoticeboardAnnouncement {
  id: string;
  title: string;
  body: string;
  category: "academic" | "administrative" | "financial" | "urgent";
  target: "all" | "students" | "staff" | "department";
  department?: string;
  attachment?: string;
  expiryDate?: string;
  date: string;
  author: string;
  pinned: boolean;
  active: boolean;
  readBy: string[];
}

const STORAGE_KEY = "unidigital_noticeboard";
function loadNotices(): NoticeboardAnnouncement[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
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
      category: "academic",
      target: "students",
      date: "2025-01-10",
      author: "Academic Registrar",
      pinned: true,
      active: true,
      readBy: [],
    },
    {
      id: "NB002",
      title: "URGENT: Senate Meeting Scheduled for 20th January 2025",
      body: "All Senate members are to note that the first Senate Meeting of the 2024/2025 Academic Session is scheduled for Monday 20th January 2025 at 10:00am in the Senate Chamber. Full attendance is compulsory.",
      category: "urgent",
      target: "staff",
      date: "2025-01-08",
      author: "Vice Chancellor's Office",
      pinned: true,
      active: true,
      readBy: [],
    },
    {
      id: "NB003",
      title: "School Fee Payment Deadline — First Semester 2024/2025",
      body: "Students are reminded that the deadline for payment of school fees for the 2024/2025 First Semester is 31st January 2025. Students who fail to pay by this date will not be allowed to sit for examinations. All payments are to be made through the University portal.",
      category: "financial",
      target: "students",
      expiryDate: "2025-01-31",
      date: "2025-01-05",
      author: "Bursary Department",
      pinned: false,
      active: true,
      readBy: [],
    },
    {
      id: "NB004",
      title: "Staff Annual Appraisal Forms Now Available",
      body: "All academic and non-academic staff are to note that the Annual Performance Appraisal forms for 2024 are now available on the portal. Staff are to complete the self-assessment section and submit to their respective HODs by 28th February 2025.",
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
      body: "The First Semester 2024/2025 Examination Timetable has been released and is available on the student portal. Students are to check their individual schedules and report any clashes to their respective department examination officers within 48 hours of this notice.",
      category: "academic",
      target: "all",
      date: "2024-12-20",
      author: "Examination Division",
      pinned: false,
      active: true,
      readBy: [],
    },
  ];
  saveNotices(notices);
  return notices;
}

// ─── Category config ──────────────────────────────────────────────────────────

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

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyForm = {
  title: "",
  body: "",
  category: "academic" as NoticeboardAnnouncement["category"],
  target: "all" as NoticeboardAnnouncement["target"],
  department: "",
  attachment: "",
  expiryDate: "",
  pinned: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function NoticeBoard() {
  const [notices, setNotices] = useState<NoticeboardAnnouncement[]>([]);
  const [filterCategory, setFilterCategory] = useState("all");
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

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filtered = notices.filter((n) => {
    const isActive = n.active !== false;
    if (tab === "active" && !isActive) return false;
    if (tab === "archived" && isActive) return false;
    if (filterCategory !== "all" && n.category !== filterCategory) return false;
    if (filterTarget !== "all" && n.target !== filterTarget) return false;
    if (
      search &&
      !n.title.toLowerCase().includes(search.toLowerCase()) &&
      !n.body.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // pinned first
  const sorted = [
    ...filtered.filter((n) => n.pinned),
    ...filtered.filter((n) => !n.pinned),
  ];

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
      toast.error("Title and body are required");
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
              category: form.category,
              target: form.target,
              department: form.department || undefined,
              attachment: form.attachment || undefined,
              expiryDate: form.expiryDate || undefined,
              pinned: form.pinned,
            }
          : n,
      );
      toast.success("Notice updated");
    } else {
      const newNotice: NoticeboardAnnouncement = {
        id: `NB${Date.now()}`,
        title: form.title,
        body: form.body,
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
      toast.success("Notice published");
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
    toast.success("Notice deleted");
  };

  const toggleActive = (notice: NoticeboardAnnouncement) => {
    const updated = notices.map((n) =>
      n.id === notice.id ? { ...n, active: !n.active } : n,
    );
    saveNotices(updated);
    setNotices(updated);
    toast.success(notice.active ? "Notice archived" : "Notice reactivated");
  };

  const togglePin = (notice: NoticeboardAnnouncement) => {
    const updated = notices.map((n) =>
      n.id === notice.id ? { ...n, pinned: !n.pinned } : n,
    );
    saveNotices(updated);
    setNotices(updated);
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const activeCount = notices.filter((n) => n.active).length;
  const urgentCount = notices.filter(
    (n) => n.category === "urgent" && n.active,
  ).length;
  const pinnedCount = notices.filter((n) => n.pinned && n.active).length;
  const totalAcks = notices.reduce((s, n) => s + n.readBy.length, 0);

  const getCategoryConfig = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat) ?? {
      label: cat,
      color: "bg-slate-100 text-slate-600",
    };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notice Board</h1>
          <p className="text-slate-500 text-sm">
            Manage and publish announcements to all roles
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700"
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
              Archived ({notices.length - activeCount})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-2.5 text-slate-400"
              />
              <Input
                className="pl-8 h-9 w-52 text-sm"
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="noticeboard.search_input"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger
                className="h-9 w-36 text-sm"
                data-ocid="noticeboard.filter_category"
              >
                <Filter size={13} className="mr-1" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTarget} onValueChange={setFilterTarget}>
              <SelectTrigger
                className="h-9 w-36 text-sm"
                data-ocid="noticeboard.filter_target"
              >
                <Users size={13} className="mr-1" />
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
            onView={setDetailNotice}
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
            onView={setDetailNotice}
            getCategoryConfig={getCategoryConfig}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg" data-ocid="noticeboard.dialog">
          <DialogHeader>
            <DialogTitle>
              {editNotice ? "Edit Notice" : "New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
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
            <div className="grid grid-cols-2 gap-3">
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
                className="mt-1"
                rows={6}
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
                <Label>Attachment (optional description)</Label>
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
              className="bg-blue-600 hover:bg-blue-700"
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
          <DialogContent
            className="max-w-lg"
            data-ocid="noticeboard.detail_dialog"
          >
            <DialogHeader>
              <div className="flex items-start gap-3 pr-6">
                {detailNotice.pinned && (
                  <Pin
                    size={16}
                    className="text-yellow-500 mt-1 flex-shrink-0"
                  />
                )}
                <DialogTitle className="leading-snug">
                  {detailNotice.title}
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`${getCategoryConfig(detailNotice.category).color} border-0 text-xs`}
                >
                  {getCategoryConfig(detailNotice.category).label}
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                  {detailNotice.target === "department"
                    ? `Dept: ${detailNotice.department}`
                    : TARGETS.find((t) => t.value === detailNotice.target)
                        ?.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                By {detailNotice.author} &bull; {detailNotice.date}
                {detailNotice.expiryDate &&
                  ` &bull; Expires: ${detailNotice.expiryDate}`}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {detailNotice.body}
              </p>
              {detailNotice.attachment && (
                <div className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2 text-sm text-slate-600">
                  <Archive size={14} /> Attachment: {detailNotice.attachment}
                </div>
              )}
              <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-600 flex items-center gap-2">
                <Eye size={13} />
                {detailNotice.readBy.length} acknowledgment
                {detailNotice.readBy.length !== 1 ? "s" : ""} recorded
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ─── Notice List subcomponent ────────────────────────────────────────────────

interface NoticeListProps {
  notices: NoticeboardAnnouncement[];
  onEdit: (n: NoticeboardAnnouncement) => void;
  onDelete: (id: string) => void;
  onToggleActive: (n: NoticeboardAnnouncement) => void;
  onTogglePin: (n: NoticeboardAnnouncement) => void;
  onView: (n: NoticeboardAnnouncement) => void;
  getCategoryConfig: (cat: string) => { label: string; color: string };
}

function NoticeList({
  notices,
  onEdit,
  onDelete,
  onToggleActive,
  onTogglePin,
  onView,
  getCategoryConfig,
}: NoticeListProps) {
  if (notices.length === 0) {
    return (
      <Card data-ocid="noticeboard.empty_state">
        <CardContent className="p-8 text-center text-slate-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          No notices found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-ocid="noticeboard.list">
      {notices.map((notice, idx) => {
        const cat = getCategoryConfig(notice.category);
        const isUrgent = notice.category === "urgent";
        return (
          <Card
            key={notice.id}
            data-ocid={`noticeboard.item.${idx + 1}`}
            className={`transition-all ${isUrgent ? "border-red-300 bg-red-50/30" : ""} ${notice.active === false ? "opacity-60" : ""}`}
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
                    {isUrgent && (
                      <AlertTriangle
                        size={14}
                        className="text-red-500 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <h3 className="font-semibold text-slate-800 leading-snug">
                      {notice.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`${cat.color} border-0 text-xs`}>
                      {cat.label}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                      {notice.target === "department"
                        ? `Dept: ${notice.department}`
                        : notice.target}
                    </Badge>
                    {notice.expiryDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> Expires {notice.expiryDate}
                      </span>
                    )}
                    {!notice.active && (
                      <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    By {notice.author} &bull; {notice.date}
                    {notice.readBy.length > 0 && (
                      <span className="ml-2 text-green-600">
                        &bull; {notice.readBy.length} read
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {notice.body}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={notice.pinned ? "Unpin" : "Pin to top"}
                      onClick={() => onTogglePin(notice)}
                      className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${notice.pinned ? "text-yellow-500" : "text-slate-300 hover:text-yellow-400"}`}
                      data-ocid={`noticeboard.pin.${idx + 1}`}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      type="button"
                      title="View details"
                      onClick={() => onView(notice)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                      data-ocid={`noticeboard.view.${idx + 1}`}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => onEdit(notice)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      data-ocid={`noticeboard.edit.${idx + 1}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(notice.id)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                      data-ocid={`noticeboard.delete.${idx + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleActive(notice)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      notice.active
                        ? "text-slate-500 border-slate-200 hover:bg-slate-50"
                        : "text-green-600 border-green-200 hover:bg-green-50"
                    }`}
                    data-ocid={`noticeboard.toggle_active.${idx + 1}`}
                  >
                    {notice.active ? "Archive" : "Restore"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
