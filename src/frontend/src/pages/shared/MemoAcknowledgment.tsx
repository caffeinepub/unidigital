import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BellRing, CheckCircle2, FileText, Search } from "lucide-react";
import { useEffect, useState } from "react";

// ---- Types (shared with InternalMemoSystem) ----
interface InternalMemo {
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

const ROLE_MAP: Record<string, string[]> = {
  hod: ["HOD"],
  lecturer: ["Lecturer"],
  hr: ["HR"],
  bursary: ["Bursary"],
  admin: ["Admin"],
};

const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  normal: {
    label: "Normal",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  high: { label: "High", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  urgent: { label: "Urgent", cls: "bg-red-100 text-red-700 border-red-200" },
};

interface Props {
  userRole: string;
  /** Simulated user ID for read-tracking */
  userId?: string;
  userName?: string;
}

export function MemoAcknowledgment({
  userRole,
  userId = "USER_SIM",
  userName = "Staff Member",
}: Props) {
  const [memos, setMemos] = useState<InternalMemo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"my-role" | "all">("my-role");

  const myRoleTags = ROLE_MAP[userRole] ?? [];

  useEffect(() => {
    setMemos(getLocalInternalMemos());
  }, []);

  const isForMe = (m: InternalMemo) => {
    if (m.status !== "sent") return false;
    if (m.recipientType === "all") return true;
    if (m.recipientType === "all-staff") return true;
    if (
      m.recipientType === "role" &&
      (m.recipientRoles ?? []).some((r) => myRoleTags.includes(r))
    )
      return true;
    return false;
  };

  const isForAll = (m: InternalMemo) =>
    m.status === "sent" && m.recipientType === "all";

  const allMemos = memos
    .filter((m) => (tab === "my-role" ? isForMe(m) : isForAll(m)))
    .filter((m) =>
      search
        ? m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.body.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  const unreadCount = memos
    .filter(isForMe)
    .filter((m) => !m.readBy.some((r) => r.id === userId)).length;

  const markRead = (memoId: string) => {
    const all = getLocalInternalMemos();
    const updated = all.map((m) => {
      if (m.id !== memoId) return m;
      if (m.readBy.some((r) => r.id === userId)) return m;
      return {
        ...m,
        readBy: [
          ...m.readBy,
          { id: userId, name: userName, at: new Date().toISOString() },
        ],
      };
    });
    saveLocalInternalMemos(updated);
    setMemos(updated);
  };

  const selected = memos.find((m) => m.id === selectedId) ?? null;
  const isRead = selected
    ? selected.readBy.some((r) => r.id === userId)
    : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Memo Inbox
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">
            Internal memos and circulars addressed to you
          </p>
        </div>
        <BellRing size={22} className="text-slate-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(
          [
            { key: "my-role", label: "Sent to My Role" },
            { key: "all", label: "Sent to All Users" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setSelectedId(null);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* Left list */}
        <div className="md:col-span-2 space-y-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="pl-9 text-sm"
              placeholder="Search memos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {allMemos.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No memos found.</p>
            </div>
          )}

          <div className="space-y-2">
            {allMemos.map((m) => {
              const read = m.readBy.some((r) => r.id === userId);
              const pri = PRIORITY_BADGE[m.priority];
              return (
                <button
                  key={m.id}
                  type="button"
                  data-ocid={`memo-row-${m.id}`}
                  onClick={() => {
                    setSelectedId(m.id);
                    markRead(m.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedId === m.id
                      ? "border-blue-500 bg-blue-50"
                      : read
                        ? "border-slate-200 bg-white"
                        : "border-l-4 border-l-blue-500 border-slate-200 bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm leading-snug ${
                        read
                          ? "text-slate-600 font-normal"
                          : "text-slate-900 font-semibold"
                      }`}
                    >
                      {m.title}
                    </p>
                    {!read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-medium ${pri.cls}`}
                    >
                      {pri.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {m.sentAt
                        ? new Date(m.sentAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                    <span className="text-xs text-slate-400">
                      From: {m.senderName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right reading pane */}
        <div className="md:col-span-3">
          {!selected && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select a memo to read</p>
            </div>
          )}
          {selected && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-snug">
                    {selected.title}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      PRIORITY_BADGE[selected.priority].cls
                    }`}
                  >
                    {PRIORITY_BADGE[selected.priority].label}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span>From: {selected.senderName}</span>
                  <span>
                    {selected.sentAt
                      ? new Date(selected.sentAt).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                  {selected.body}
                </div>
                {selected.attachmentUrl && (
                  <a
                    href={selected.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 underline"
                  >
                    📎 View Attached Document
                  </a>
                )}
                {isRead ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Acknowledged – marked as read
                  </div>
                ) : (
                  <Button
                    data-ocid="memo-mark-read-btn"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => markRead(selected.id)}
                  >
                    <CheckCircle2 size={15} className="mr-1.5" />
                    Mark as Read / Acknowledge
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
