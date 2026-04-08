import {
  Archive,
  Clock,
  Edit3,
  Inbox,
  MessageSquare,
  Plus,
  Reply,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "../../components/ui/textarea";

interface Message {
  id: string;
  threadId: string;
  from: string;
  fromRole: string;
  to: string;
  toRole: string;
  subject: string;
  body: string;
  sentAt: string;
  readAt?: string;
  isArchived: boolean;
  isDraft: boolean;
  parentId?: string;
  isBroadcast: boolean;
}

type Folder = "inbox" | "sent" | "drafts" | "archived";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  lecturer: "Lecturer",
  student: "Student",
  hod: "HOD",
  hr: "HR Officer",
  bursary: "Bursary Officer",
  alumni: "Alumni",
};

const SAMPLE_USERS: { name: string; role: string }[] = [
  { name: "Prof. Abubakar Musa", role: "admin" },
  { name: "Dr. Adaeze Okafor", role: "lecturer" },
  { name: "Mr. Emmanuel Bello", role: "hod" },
  { name: "Mrs. Fatima Yusuf", role: "hr" },
  { name: "Mr. Chukwudi Nwosu", role: "bursary" },
  { name: "Alice Johnson", role: "student" },
  { name: "Emeka Eze", role: "student" },
  { name: "Fatima Hassan", role: "student" },
];

function seedMessages() {
  const existing = localStorage.getItem("unidigital_messages");
  if (existing) return;

  const now = Date.now();
  const messages: Message[] = [
    {
      id: "msg-1",
      threadId: "thread-1",
      from: "Prof. Abubakar Musa",
      fromRole: "admin",
      to: "All Lecturers",
      toRole: "lecturer",
      subject: "Result Submission Deadline — 2024/2025 First Semester",
      body: "Dear Lecturers,\n\nPlease be informed that the deadline for submitting CA and Exam scores for the 2024/2025 First Semester is Friday, 28th February 2025.\n\nAll scores must be entered into the system before midnight on that date. Late submissions will not be accepted without written approval from your HOD.\n\nRegards,\nAcademic Affairs Office",
      sentAt: new Date(now - 3 * 86400000).toISOString(),
      readAt: new Date(now - 2 * 86400000).toISOString(),
      isArchived: false,
      isDraft: false,
      isBroadcast: true,
    },
    {
      id: "msg-2",
      threadId: "thread-1",
      from: "Dr. Adaeze Okafor",
      fromRole: "lecturer",
      to: "Prof. Abubakar Musa",
      toRole: "admin",
      subject: "Re: Result Submission Deadline — 2024/2025 First Semester",
      body: "Thank you for the reminder. I have already submitted all scores for my courses. Please confirm receipt.\n\nBest,\nDr. Adaeze Okafor",
      sentAt: new Date(now - 2 * 86400000).toISOString(),
      isArchived: false,
      isDraft: false,
      parentId: "msg-1",
      isBroadcast: false,
    },
    {
      id: "msg-3",
      threadId: "thread-2",
      from: "Mrs. Fatima Yusuf",
      fromRole: "hr",
      to: "Prof. Abubakar Musa",
      toRole: "admin",
      subject: "Approval Required: Leave Application — Dr. Chukwuma",
      body: "Dear Admin,\n\nDr. James Chukwuma from the Physics department has applied for annual leave from 3rd March to 14th March 2025. Please review and approve in the HR module.\n\nThank you.\nFatima Yusuf\nHR Office",
      sentAt: new Date(now - 1 * 86400000).toISOString(),
      isArchived: false,
      isDraft: false,
      isBroadcast: false,
    },
    {
      id: "msg-4",
      threadId: "thread-3",
      from: "Alice Johnson",
      fromRole: "student",
      to: "Dr. Adaeze Okafor",
      toRole: "lecturer",
      subject: "Course Material Request — CSC 301",
      body: "Dear Dr. Okafor,\n\nI am unable to access the lecture notes for CSC 301 (Data Structures) on the portal. Could you please re-upload or share them with the class?\n\nThank you,\nAlice Johnson\nFUEK/SCI/2025/CSC/001",
      sentAt: new Date(now - 6 * 3600000).toISOString(),
      isArchived: false,
      isDraft: false,
      isBroadcast: false,
    },
    {
      id: "msg-5",
      threadId: "thread-4",
      from: "Mr. Emmanuel Bello",
      fromRole: "hod",
      to: "All Students",
      toRole: "student",
      subject: "Departmental Seminar — Compulsory Attendance",
      body: "Dear Students,\n\nThis is to inform all 300-level students that the departmental seminar scheduled for Thursday, 20th February 2025 at 10:00 AM in the Main Hall is COMPULSORY. Attendance will be taken.\n\nBring your ID cards.\n\nHOD, Computer Science",
      sentAt: new Date(now - 12 * 3600000).toISOString(),
      isArchived: false,
      isDraft: false,
      isBroadcast: true,
    },
    {
      id: "msg-6",
      threadId: "thread-5",
      from: "Prof. Abubakar Musa",
      fromRole: "admin",
      to: "Mr. Chukwudi Nwosu",
      toRole: "bursary",
      subject: "Fee Waiver Review",
      body: "Please review the attached list of students who have applied for fee waivers this semester and provide a recommendation before the Board meeting on Friday.",
      sentAt: new Date(now - 4 * 86400000).toISOString(),
      isArchived: true,
      isDraft: false,
      isBroadcast: false,
    },
  ];

  localStorage.setItem("unidigital_messages", JSON.stringify(messages));
}

export function CommunicationCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [folder, setFolder] = useState<Folder>("inbox");
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [_expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set(),
  );

  // Compose form state
  const [compTo, setCompTo] = useState("");
  const [compToRole, setCompToRole] = useState("");
  const [compSubject, setCompSubject] = useState("");
  const [compBody, setCompBody] = useState("");
  const [compIsBroadcast, setCompIsBroadcast] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  // Current user (simulated as admin)
  const currentUser = "Prof. Abubakar Musa";
  const currentRole = "admin";

  useEffect(() => {
    seedMessages();
    loadMessages();
  }, []);

  function loadMessages() {
    const raw = localStorage.getItem("unidigital_messages");
    if (raw) setMessages(JSON.parse(raw));
  }

  function saveMessages(updated: Message[]) {
    setMessages(updated);
    localStorage.setItem("unidigital_messages", JSON.stringify(updated));
  }

  function getThreadMessages(threadId: string) {
    return messages
      .filter((m) => m.threadId === threadId)
      .sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      );
  }

  const inboxMessages = messages.filter(
    (m) =>
      !m.isDraft &&
      !m.isArchived &&
      (m.to === currentUser || m.toRole === currentRole || m.isBroadcast) &&
      m.from !== currentUser,
  );

  const sentMessages = messages.filter(
    (m) => !m.isDraft && m.from === currentUser,
  );

  const draftMessages = messages.filter(
    (m) => m.isDraft && m.from === currentUser,
  );
  const archivedMessages = messages.filter((m) => m.isArchived);

  const unreadCount = inboxMessages.filter((m) => !m.readAt).length;

  function getFolderMessages(): Message[] {
    const base =
      folder === "inbox"
        ? inboxMessages
        : folder === "sent"
          ? sentMessages
          : folder === "drafts"
            ? draftMessages
            : archivedMessages;

    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q),
    );
  }

  function markRead(msg: Message) {
    if (msg.readAt) return;
    const updated = messages.map((m) =>
      m.id === msg.id ? { ...m, readAt: new Date().toISOString() } : m,
    );
    saveMessages(updated);
  }

  function handleSelectMsg(msg: Message) {
    setSelectedMsg(msg);
    markRead(msg);
  }

  function handleArchive(id: string) {
    const updated = messages.map((m) =>
      m.id === id ? { ...m, isArchived: true } : m,
    );
    saveMessages(updated);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  }

  function handleDelete(id: string) {
    const updated = messages.filter((m) => m.id !== id);
    saveMessages(updated);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  }

  function handleSend(asDraft = false) {
    const toLabel = compIsBroadcast
      ? `All ${ROLE_LABELS[compToRole] || compToRole}s`
      : compTo;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      threadId: `thread-${Date.now()}`,
      from: currentUser,
      fromRole: currentRole,
      to: toLabel,
      toRole: compToRole,
      subject: compSubject || "(No Subject)",
      body: compBody,
      sentAt: new Date().toISOString(),
      isArchived: false,
      isDraft: asDraft,
      isBroadcast: compIsBroadcast,
    };
    saveMessages([...messages, newMsg]);
    setShowCompose(false);
    setCompTo("");
    setCompToRole("");
    setCompSubject("");
    setCompBody("");
    setCompIsBroadcast(false);
  }

  function handleReply() {
    if (!selectedMsg || !replyBody.trim()) return;
    const reply: Message = {
      id: `msg-${Date.now()}`,
      threadId: selectedMsg.threadId,
      from: currentUser,
      fromRole: currentRole,
      to: selectedMsg.from,
      toRole: selectedMsg.fromRole,
      subject: `Re: ${selectedMsg.subject}`,
      body: replyBody,
      sentAt: new Date().toISOString(),
      isArchived: false,
      isDraft: false,
      parentId: selectedMsg.id,
      isBroadcast: false,
    };
    saveMessages([...messages, reply]);
    setShowReply(false);
    setReplyBody("");
  }

  function _toggleThread(threadId: string) {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  }

  const folderMessages = getFolderMessages();
  // Deduplicate by threadId — show only the latest message per thread in the list
  const seenThreads = new Set<string>();
  const threadedMessages = folderMessages.filter((m) => {
    if (seenThreads.has(m.threadId)) return false;
    seenThreads.add(m.threadId);
    return true;
  });

  const FOLDERS: {
    key: Folder;
    label: string;
    icon: typeof Inbox;
    count?: number;
  }[] = [
    { key: "inbox", label: "Inbox", icon: Inbox, count: unreadCount },
    { key: "sent", label: "Sent", icon: Send },
    {
      key: "drafts",
      label: "Drafts",
      icon: Edit3,
      count: draftMessages.length,
    },
    { key: "archived", label: "Archived", icon: Archive },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Communication Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Internal messaging for all university roles.
          </p>
        </div>
        <Button
          onClick={() => setShowCompose(true)}
          data-ocid="btn-compose-message"
        >
          <Plus className="w-4 h-4 mr-2" />
          Compose
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4" style={{ minHeight: "600px" }}>
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full">
            <CardContent className="p-2 space-y-1">
              {FOLDERS.map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFolder(key);
                    setSelectedMsg(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    folder === key
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                  data-ocid={`folder-${key}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  {count !== undefined && count > 0 && (
                    <Badge
                      variant={folder === key ? "secondary" : "default"}
                      className="text-xs h-5 min-w-[20px] justify-center"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              ))}

              <div className="border-t border-border mt-2 pt-2">
                <p className="text-xs text-muted-foreground px-3 py-1 font-medium">
                  Broadcast
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCompIsBroadcast(true);
                    setShowCompose(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted text-foreground transition-colors"
                  data-ocid="btn-broadcast-message"
                >
                  <Users className="w-4 h-4" />
                  Broadcast to Role
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message List + Detail */}
        <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="search-messages"
            />
          </div>

          {/* Message List */}
          {!selectedMsg && (
            <Card>
              <CardContent className="p-0">
                {threadedMessages.length === 0 ? (
                  <div className="text-center p-12 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No messages in {folder}</p>
                    {folder === "inbox" && (
                      <p className="text-sm mt-1">
                        Your inbox is empty. Compose a new message to get
                        started.
                      </p>
                    )}
                  </div>
                ) : (
                  threadedMessages.map((msg) => {
                    const threadMsgs = getThreadMessages(msg.threadId);
                    const hasThread = threadMsgs.length > 1;
                    const isUnread = !msg.readAt && msg.from !== currentUser;

                    return (
                      <div
                        key={msg.threadId}
                        className="border-b border-border last:border-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectMsg(msg)}
                          className={`w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors ${
                            isUnread ? "bg-primary/5" : ""
                          }`}
                          data-ocid={`msg-row-${msg.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                                {msg.from.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground"} truncate`}
                                  >
                                    {folder === "sent"
                                      ? `To: ${msg.to}`
                                      : msg.from}
                                  </p>
                                  {msg.isBroadcast && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs flex-shrink-0"
                                    >
                                      <Users className="w-2.5 h-2.5 mr-1" />
                                      Broadcast
                                    </Badge>
                                  )}
                                  {isUnread && (
                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p
                                  className={`text-sm truncate ${isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                                >
                                  {msg.subject}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {msg.body.slice(0, 80)}...
                                </p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-xs text-muted-foreground">
                                {new Date(msg.sentAt).toLocaleDateString()}
                              </p>
                              {hasThread && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {threadMsgs.length} messages
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}

          {/* Message Detail */}
          {selectedMsg && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base leading-tight">
                      {selectedMsg.subject}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Thread: {getThreadMessages(selectedMsg.threadId).length}{" "}
                      message(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReply(true)}
                      data-ocid="btn-reply"
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(selectedMsg.id)}
                      data-ocid="btn-archive"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="text-destructive"
                      data-ocid="btn-delete-msg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMsg(null)}
                      data-ocid="btn-close-msg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {getThreadMessages(selectedMsg.threadId).map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border border-border p-4 ${
                      msg.from === currentUser
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">
                          {msg.from.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {msg.from}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ROLE_LABELS[msg.fromRole] || msg.fromRole} →{" "}
                            {msg.to}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.sentAt).toLocaleString()}
                        </p>
                        {msg.readAt && (
                          <p className="text-green-600 text-xs mt-0.5">
                            Read {new Date(msg.readAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {msg.body}
                    </p>
                  </div>
                ))}

                {/* Reply inline */}
                {showReply && (
                  <div className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Reply to {selectedMsg.from}
                    </p>
                    <Textarea
                      placeholder="Type your reply..."
                      rows={4}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      data-ocid="textarea-reply"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowReply(false);
                          setReplyBody("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleReply}
                        disabled={!replyBody.trim()}
                        data-ocid="btn-send-reply"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              {compIsBroadcast ? "Broadcast Message" : "Compose Message"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="broadcast-toggle"
                checked={compIsBroadcast}
                onChange={(e) => setCompIsBroadcast(e.target.checked)}
                className="rounded"
                data-ocid="toggle-broadcast"
              />
              <Label htmlFor="broadcast-toggle" className="cursor-pointer">
                Broadcast to all users of a role
              </Label>
            </div>

            {compIsBroadcast ? (
              <div>
                <Label>Broadcast to Role</Label>
                <Select value={compToRole} onValueChange={setCompToRole}>
                  <SelectTrigger data-ocid="select-broadcast-role">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}s (All)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>To</Label>
                <Select
                  value={compTo}
                  onValueChange={(v) => {
                    const user = SAMPLE_USERS.find((u) => u.name === v);
                    setCompTo(v);
                    setCompToRole(user?.role ?? "");
                  }}
                >
                  <SelectTrigger data-ocid="select-message-recipient">
                    <SelectValue placeholder="Select recipient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_USERS.filter((u) => u.name !== currentUser).map(
                      (u) => (
                        <SelectItem key={u.name} value={u.name}>
                          {u.name} — {ROLE_LABELS[u.role]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Message subject..."
                value={compSubject}
                onChange={(e) => setCompSubject(e.target.value)}
                data-ocid="input-message-subject"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Write your message here..."
                rows={6}
                value={compBody}
                onChange={(e) => setCompBody(e.target.value)}
                data-ocid="textarea-message-body"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCompose(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSend(true)}
              disabled={!compBody.trim()}
              data-ocid="btn-save-draft"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSend(false)}
              disabled={(!compTo && !compToRole) || !compBody.trim()}
              data-ocid="btn-send-message"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
