import {
  AlertTriangle,
  Archive,
  Bell,
  Calendar,
  CheckCircle,
  Eye,
  Filter,
  Megaphone,
  Pin,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { NoticeboardAnnouncement } from "./../../pages/admin/NoticeBoard";

// ─── LocalStorage helpers (mirrors NoticeBoard.tsx) ───────────────────────────

const STORAGE_KEY = "unidigital_noticeboard";
const ACK_STORAGE_KEY = "unidigital_noticeboard_acks";

function loadAllNotices(): NoticeboardAnnouncement[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveAllNotices(notices: NoticeboardAnnouncement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}

// Track which notices the current viewer has acknowledged
function getAcknowledged(viewerId: string): string[] {
  const all: Record<string, string[]> = JSON.parse(
    localStorage.getItem(ACK_STORAGE_KEY) || "{}",
  );
  return all[viewerId] ?? [];
}

function saveAcknowledged(viewerId: string, noticeIds: string[]) {
  const all: Record<string, string[]> = JSON.parse(
    localStorage.getItem(ACK_STORAGE_KEY) || "{}",
  );
  all[viewerId] = noticeIds;
  localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(all));
}

// ─── Types ─────────────────────────────────────────────────────────────────

type ViewerRole =
  | "student"
  | "staff"
  | "admin"
  | "hod"
  | "lecturer"
  | "bursary"
  | "hr"
  | "alumni"
  | "parent";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; border: string }
> = {
  academic: {
    label: "Academic",
    color: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
  },
  administrative: {
    label: "Administrative",
    color: "bg-purple-100 text-purple-700",
    border: "border-purple-200",
  },
  financial: {
    label: "Financial",
    color: "bg-green-100 text-green-700",
    border: "border-green-200",
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-700",
    border: "border-red-300",
  },
};

function getCatConfig(cat: string) {
  return (
    CATEGORY_CONFIG[cat] ?? {
      label: cat,
      color: "bg-slate-100 text-slate-600",
      border: "border-slate-200",
    }
  );
}

// Determine if a notice is relevant to this viewer role
function isRelevant(
  notice: NoticeboardAnnouncement,
  role: ViewerRole,
): boolean {
  if (notice.target === "all") return true;
  if (notice.target === "students" && ["student"].includes(role)) return true;
  if (
    notice.target === "staff" &&
    ["staff", "admin", "hod", "lecturer", "bursary", "hr"].includes(role)
  )
    return true;
  return false;
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface AnnouncementViewProps {
  role?: ViewerRole;
  viewerId?: string;
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

export function AnnouncementView({
  role = "student",
  viewerId = "viewer_default",
  compact = false,
}: AnnouncementViewProps) {
  const [notices, setNotices] = useState<NoticeboardAnnouncement[]>([]);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const all = loadAllNotices();
    setNotices(all);
    setAcknowledged(getAcknowledged(viewerId));
  }, [viewerId]);

  // Filter notices relevant to this role, active only
  const relevant = notices.filter(
    (n) => n.active !== false && isRelevant(n, role),
  );

  const filtered = relevant.filter((n) => {
    if (filterCategory !== "all" && n.category !== filterCategory) return false;
    if (
      search &&
      !n.title.toLowerCase().includes(search.toLowerCase()) &&
      !n.body.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // Pinned first, then by date
  const sorted = [
    ...filtered.filter((n) => n.pinned),
    ...filtered.filter((n) => !n.pinned),
  ];

  const handleAcknowledge = (noticeId: string) => {
    if (acknowledged.includes(noticeId)) return;
    const updated = [...acknowledged, noticeId];
    setAcknowledged(updated);
    saveAcknowledged(viewerId, updated);

    // Also record in the notice's readBy list for Admin tracking
    const allNotices = loadAllNotices();
    const updatedNotices = allNotices.map((n) =>
      n.id === noticeId && !n.readBy.includes(viewerId)
        ? { ...n, readBy: [...n.readBy, viewerId] }
        : n,
    );
    saveAllNotices(updatedNotices);
    setNotices(updatedNotices);
    toast.success("Notice acknowledged");
  };

  const unreadCount = sorted.filter((n) => !acknowledged.includes(n.id)).length;

  if (compact) {
    return (
      <div className="space-y-2" data-ocid="announcement-view.compact_list">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Bell size={16} className="text-blue-500" />
            Announcements
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">No announcements.</p>
        ) : (
          sorted.slice(0, 3).map((notice) => {
            const cat = getCatConfig(notice.category);
            const isRead = acknowledged.includes(notice.id);
            return (
              <div
                key={notice.id}
                className={`rounded-lg border p-3 transition-colors ${
                  notice.category === "urgent"
                    ? "border-red-200 bg-red-50"
                    : "bg-white border-slate-100"
                } ${isRead ? "opacity-70" : ""}`}
                data-ocid={`announcement-view.compact.${notice.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      {notice.pinned && (
                        <Pin size={11} className="text-yellow-500" />
                      )}
                      {notice.category === "urgent" && (
                        <AlertTriangle size={11} className="text-red-500" />
                      )}
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {notice.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {notice.date}
                    </p>
                  </div>
                  <Badge
                    className={`${cat.color} border-0 text-xs flex-shrink-0`}
                  >
                    {cat.label}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone size={22} className="text-blue-500" />
            Announcements
          </h1>
          <p className="text-slate-500 text-sm">
            {relevant.length} notice{relevant.length !== 1 ? "s" : ""} relevant
            to you
            {unreadCount > 0 && (
              <span className="ml-2 font-medium text-red-500">
                &bull; {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-2.5 top-2.5 text-slate-400"
          />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="announcement-view.search_input"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger
            className="h-9 w-40 text-sm"
            data-ocid="announcement-view.filter_category"
          >
            <Filter size={13} className="mr-1" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
              <SelectItem key={val} value={val}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Urgent Banner */}
      {sorted.some(
        (n) => n.category === "urgent" && !acknowledged.includes(n.id),
      ) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            You have unacknowledged urgent notices. Please review and
            acknowledge them.
          </p>
        </div>
      )}

      {/* Notice list */}
      {sorted.length === 0 ? (
        <Card data-ocid="announcement-view.empty_state">
          <CardContent className="p-10 text-center text-slate-400">
            <Bell size={44} className="mx-auto mb-3 opacity-25" />
            <p className="font-medium">No announcements at this time</p>
            <p className="text-sm mt-1">
              Check back later for updates from administration.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" data-ocid="announcement-view.list">
          {sorted.map((notice, idx) => {
            const cat = getCatConfig(notice.category);
            const isRead = acknowledged.includes(notice.id);
            const isExpanded = expanded === notice.id;
            const isUrgent = notice.category === "urgent";

            return (
              <Card
                key={notice.id}
                data-ocid={`announcement-view.item.${idx + 1}`}
                className={`transition-all ${
                  isUrgent && !isRead
                    ? "border-red-300 shadow-sm"
                    : "border-slate-200"
                } ${isRead ? "opacity-80" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Left accent for urgent */}
                    {isUrgent && (
                      <div className="w-1 flex-shrink-0 self-stretch bg-red-400 rounded-full" />
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-start gap-2">
                        {notice.pinned && (
                          <Pin
                            size={13}
                            className="text-yellow-500 mt-0.5 flex-shrink-0"
                          />
                        )}
                        {isUrgent && (
                          <AlertTriangle
                            size={13}
                            className="text-red-500 mt-0.5 flex-shrink-0"
                          />
                        )}
                        <button
                          type="button"
                          className="text-left font-semibold text-slate-800 hover:text-blue-700 transition-colors leading-snug"
                          onClick={() =>
                            setExpanded(isExpanded ? null : notice.id)
                          }
                          data-ocid={`announcement-view.toggle.${idx + 1}`}
                        >
                          {notice.title}
                        </button>
                        {isRead && (
                          <CheckCircle
                            size={14}
                            className="text-green-500 mt-0.5 flex-shrink-0"
                          />
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge className={`${cat.color} border-0 text-xs`}>
                          {cat.label}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          By {notice.author} &bull; {notice.date}
                        </span>
                        {notice.expiryDate && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            Expires {notice.expiryDate}
                          </span>
                        )}
                      </div>

                      {/* Body - always show 2 lines, expand on click */}
                      <p
                        className={`text-sm text-slate-600 mt-2 leading-relaxed ${
                          isExpanded ? "whitespace-pre-line" : "line-clamp-2"
                        }`}
                      >
                        {notice.body}
                      </p>

                      {/* Expanded details */}
                      {isExpanded && notice.attachment && (
                        <div className="flex items-center gap-2 mt-3 bg-slate-50 rounded px-3 py-2 text-sm text-slate-600">
                          <Archive size={14} />
                          Attachment: {notice.attachment}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={() =>
                            setExpanded(isExpanded ? null : notice.id)
                          }
                        >
                          <Eye size={12} />
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                        {!isRead && (
                          <>
                            <span className="text-slate-300 text-xs">|</span>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              className="h-6 text-xs px-2 border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => handleAcknowledge(notice.id)}
                              data-ocid={`announcement-view.acknowledge.${idx + 1}`}
                            >
                              <CheckCircle size={11} className="mr-1" />
                              Mark as Read
                            </Button>
                          </>
                        )}
                        {isRead && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle size={11} />
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      {sorted.length > 0 && (
        <div className="text-center text-xs text-slate-400 pt-2">
          Showing {sorted.length} of {relevant.length} announcements &bull;{" "}
          {
            acknowledged.filter((id) => relevant.some((n) => n.id === id))
              .length
          }{" "}
          acknowledged
        </div>
      )}
    </div>
  );
}
