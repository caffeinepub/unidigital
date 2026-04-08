import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
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

export interface MeetingMinutes {
  id: string;
  meetingType:
    | "Senate"
    | "Academic Board"
    | "Council"
    | "Faculty Board"
    | "Management";
  date: string;
  venue: string;
  presidedBy: string;
  attendees: string[];
  agendaItems: AgendaItem[];
  minutesBody: string;
  resolutions: Resolution[];
  attachmentRef: string;
  status: "Draft" | "Published";
  createdAt: string;
  publishedAt?: string;
}

export interface AgendaItem {
  id: string;
  number: number;
  description: string;
}

export interface Resolution {
  id: string;
  resolutionId: string;
  text: string;
  responsibleOfficer: string;
  deadline: string;
}

const MEETING_TYPES: MeetingMinutes["meetingType"][] = [
  "Senate",
  "Academic Board",
  "Council",
  "Faculty Board",
  "Management",
];

const SEED_MINUTES: MeetingMinutes[] = [
  {
    id: "MTG-001",
    meetingType: "Senate",
    date: "2024-03-08",
    venue: "Senate Chamber, Administrative Block",
    presidedBy: "Prof. Aminu Kano (Vice Chancellor)",
    attendees: [
      "Prof. Aminu Kano",
      "Dr. Adebayo Ogundimu",
      "Prof. Yakubu Musa",
      "Dr. Chioma Nwachukwu",
      "Barrister Kunle Adesanya",
      "Mrs. Blessing Okeke",
      "Dr. Fatima Suleiman",
      "Mr. Emeka Onuoha",
    ],
    agendaItems: [
      {
        id: "AG-001",
        number: 1,
        description: "Confirmation of minutes of the 84th Senate Meeting",
      },
      {
        id: "AG-002",
        number: 2,
        description: "Vice Chancellor's Report on Academic Activities",
      },
      {
        id: "AG-003",
        number: 3,
        description:
          "Presentation of 2023/2024 First Semester Examination Results",
      },
      {
        id: "AG-004",
        number: 4,
        description:
          "Approval of New Curriculum for Computer Science Department",
      },
      {
        id: "AG-005",
        number: 5,
        description: "Any Other Business",
      },
    ],
    minutesBody: `The Vice Chancellor opened the meeting with a prayer and welcomed all senate members present.\n\n**1. Confirmation of Minutes**\nThe minutes of the 84th Senate Meeting held on 12th January 2024 were read and confirmed as a true record subject to the correction of the date on page 3 from "10th" to "12th".\n\n**2. Vice Chancellor's Report**\nThe Vice Chancellor reported on the successful commencement of the 2023/2024 First Semester examinations and commended all departments for their compliance with the academic calendar. He also reported on the approval of the institution's accreditation renewal by the NUC.\n\n**3. Presentation of Examination Results**\nThe Registrar presented a summary of the 2023/2024 First Semester results. The overall pass rate was reported at 78.4%. The Senate noted with concern the high failure rate in Mathematics and requested all affected departments to organize remedial programmes.\n\n**4. Curriculum Approval**\nThe new 4-year curriculum for Computer Science (B.Sc.) was presented by the Head of Department, Dr. Adebayo Ogundimu. After deliberation, the Senate approved the curriculum with minor amendments to the third-year elective courses.\n\n**5. Any Other Business**\nThe Dean of Student Affairs reported on ongoing disciplinary proceedings and requested Senate's guidance on rustication procedures.`,
    resolutions: [
      {
        id: "RES-001-01",
        resolutionId: "SEN/001/2024/01",
        text: "That the minutes of the 84th Senate Meeting be confirmed as a true record with the noted correction.",
        responsibleOfficer: "Registrar",
        deadline: "2024-03-22",
      },
      {
        id: "RES-001-02",
        resolutionId: "SEN/001/2024/02",
        text: "That departments with failure rates above 30% in any course should submit remedial programme proposals within four weeks.",
        responsibleOfficer: "Dean of Academic Affairs",
        deadline: "2024-04-05",
      },
      {
        id: "RES-001-03",
        resolutionId: "SEN/001/2024/03",
        text: "That the new B.Sc. Computer Science curriculum be approved for implementation commencing 2024/2025 academic session, subject to NUC notification.",
        responsibleOfficer: "Head, Computer Science Dept.",
        deadline: "2024-05-01",
      },
    ],
    attachmentRef: "Exam Results Summary Q1-2024.pdf",
    status: "Published",
    createdAt: "2024-03-08",
    publishedAt: "2024-03-10",
  },
  {
    id: "MTG-002",
    meetingType: "Management",
    date: "2024-02-14",
    venue: "Board Room, Administrative Block",
    presidedBy: "Prof. Aminu Kano (Vice Chancellor)",
    attendees: [
      "Prof. Aminu Kano",
      "Registrar Dr. Amaka Eze",
      "Bursar Mr. James Olatunji",
      "Director of Academic Planning",
      "Dean of Student Affairs",
    ],
    agendaItems: [
      {
        id: "AG-006",
        number: 1,
        description: "Review of Q1 2024 Financial Report",
      },
      {
        id: "AG-007",
        number: 2,
        description: "Staff welfare and outstanding salary issues",
      },
    ],
    minutesBody:
      "Management reviewed the Q1 financial report and noted outstanding salary matters. The Bursar was directed to submit a reconciliation report within two weeks. Staff welfare concerns were acknowledged and referred to the HR committee.",
    resolutions: [
      {
        id: "RES-002-01",
        resolutionId: "MGT/001/2024/01",
        text: "That the Bursar submits a comprehensive salary reconciliation report within two weeks.",
        responsibleOfficer: "Bursar",
        deadline: "2024-02-28",
      },
    ],
    attachmentRef: "Q1 Financial Summary 2024.xlsx",
    status: "Published",
    createdAt: "2024-02-14",
    publishedAt: "2024-02-16",
  },
  {
    id: "MTG-003",
    meetingType: "Academic Board",
    date: "2024-04-03",
    venue: "Conference Room 1, Faculty of Sciences",
    presidedBy: "Dean, Faculty of Sciences — Dr. Blessing Okeke",
    attendees: [
      "Dr. Blessing Okeke",
      "Dr. Adebayo Ogundimu",
      "Prof. Yakubu Musa",
      "Dr. Uche Okafor",
      "Mrs. Grace Onyeka",
    ],
    agendaItems: [
      {
        id: "AG-008",
        number: 1,
        description: "Second Semester Timetable Approval",
      },
      {
        id: "AG-009",
        number: 2,
        description:
          "Review of First Semester Supplementary Examination Conduct",
      },
    ],
    minutesBody:
      "The Academic Board reviewed and approved the Second Semester timetable. Concerns were raised about overlapping schedules for combined courses and resolved via an amended timetable. The supplementary exam conduct was commended as orderly with minimal infractions.",
    resolutions: [
      {
        id: "RES-003-01",
        resolutionId: "AB/001/2024/01",
        text: "That the Second Semester timetable be approved as amended and circulated to all departments.",
        responsibleOfficer: "Registry",
        deadline: "2024-04-10",
      },
    ],
    attachmentRef: "2nd Semester Timetable v2.pdf",
    status: "Draft",
    createdAt: "2024-04-03",
  },
];

function getLocalMinutes(): MeetingMinutes[] {
  const raw = localStorage.getItem("unidigital_senate_minutes");
  if (!raw) {
    localStorage.setItem(
      "unidigital_senate_minutes",
      JSON.stringify(SEED_MINUTES),
    );
    return SEED_MINUTES;
  }
  return JSON.parse(raw);
}
function saveMinutes(data: MeetingMinutes[]) {
  localStorage.setItem("unidigital_senate_minutes", JSON.stringify(data));
}

const typeColors: Record<string, string> = {
  Senate: "bg-purple-100 text-purple-700",
  "Academic Board": "bg-blue-100 text-blue-700",
  Council: "bg-indigo-100 text-indigo-700",
  "Faculty Board": "bg-teal-100 text-teal-700",
  Management: "bg-amber-100 text-amber-700",
};

function blankMeeting(): MeetingMinutes {
  return {
    id: "",
    meetingType: "Senate",
    date: "",
    venue: "",
    presidedBy: "",
    attendees: [],
    agendaItems: [],
    minutesBody: "",
    resolutions: [],
    attachmentRef: "",
    status: "Draft",
    createdAt: "",
  };
}

export function SenateMeetingMinutes() {
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MeetingMinutes>(blankMeeting());
  const [newAttendee, setNewAttendee] = useState("");
  const [newAgenda, setNewAgenda] = useState("");
  const [newResolution, setNewResolution] = useState({
    resolutionId: "",
    text: "",
    responsibleOfficer: "",
    deadline: "",
  });

  useEffect(() => {
    setMinutes(getLocalMinutes());
  }, []);

  const institutionSettings = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("unidigital_institution_settings") || "{}",
      );
    } catch {
      return {};
    }
  })();
  const institutionName =
    institutionSettings.name || "Federal University of Education Kontagora";
  const misName =
    institutionSettings.misName ||
    `${institutionName
      .split(" ")
      .filter(
        (w: string) =>
          w.length > 2 && !["of", "and", "the"].includes(w.toLowerCase()),
      )
      .map((w: string) => w[0].toUpperCase())
      .join("")} MIS`;

  const filtered = minutes.filter((m) => {
    const matchSearch =
      m.presidedBy.toLowerCase().includes(search.toLowerCase()) ||
      m.meetingType.toLowerCase().includes(search.toLowerCase()) ||
      m.venue.toLowerCase().includes(search.toLowerCase()) ||
      m.minutesBody.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || m.meetingType === filterType;
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const openNew = () => {
    setEditId(null);
    setForm(blankMeeting());
    setNewAttendee("");
    setNewAgenda("");
    setNewResolution({
      resolutionId: "",
      text: "",
      responsibleOfficer: "",
      deadline: "",
    });
    setShowForm(true);
  };

  const openEdit = (m: MeetingMinutes) => {
    setEditId(m.id);
    setForm({
      ...m,
      attendees: [...m.attendees],
      agendaItems: [...m.agendaItems],
      resolutions: [...m.resolutions],
    });
    setShowForm(true);
  };

  const handleSave = (publish: boolean) => {
    const id = editId || `MTG-${String(minutes.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString().split("T")[0];
    const record: MeetingMinutes = {
      ...form,
      id,
      status: publish ? "Published" : "Draft",
      createdAt: editId
        ? minutes.find((m) => m.id === editId)?.createdAt || now
        : now,
      publishedAt: publish ? now : undefined,
    };
    const updated = editId
      ? minutes.map((m) => (m.id === editId ? record : m))
      : [...minutes, record];
    saveMinutes(updated);
    setMinutes(updated);
    setShowForm(false);
    setEditId(null);
  };

  const _handleDelete = (id: string) => {
    const updated = minutes.filter((m) => m.id !== id);
    saveMinutes(updated);
    setMinutes(updated);
  };

  const handlePrint = (m: MeetingMinutes) => {
    const printContent = `
      <html>
      <head>
        <title>${m.meetingType} Meeting Minutes — ${m.date}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; font-size: 12pt; color: #111; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
          .header h1 { font-size: 14pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; }
          .header h2 { font-size: 12pt; margin: 4px 0; }
          .header p { font-size: 11pt; color: #444; margin: 2px 0; }
          .section { margin-top: 20px; }
          .section-title { font-size: 12pt; font-weight: bold; border-bottom: 1px solid #999; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; }
          .attendee-list { columns: 2; gap: 16px; }
          .attendee { font-size: 11pt; margin-bottom: 2px; }
          .agenda-item { margin-bottom: 6px; }
          .agenda-num { font-weight: bold; }
          .minutes-body { white-space: pre-wrap; font-size: 11pt; line-height: 1.6; }
          .resolution { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
          .resolution-id { font-weight: bold; font-size: 10pt; color: #555; }
          .resolution-text { font-size: 11pt; margin: 4px 0; }
          .resolution-meta { font-size: 10pt; color: #555; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-block { text-align: center; min-width: 180px; }
          .signature-line { border-top: 1px solid #111; margin-top: 40px; }
          .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 9pt; color: #777; border-top: 1px solid #ccc; padding-top: 6px; }
          .page-break { page-break-before: always; }
          @media print { .footer { position: fixed; bottom: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${institutionName}</h1>
          <h2>${m.meetingType.toUpperCase()} MEETING MINUTES</h2>
          <p>Date: ${m.date} &nbsp;|&nbsp; Venue: ${m.venue}</p>
          <p>Presided by: ${m.presidedBy}</p>
        </div>

        <div class="section">
          <div class="section-title">Attendees (${m.attendees.length})</div>
          <div class="attendee-list">
            ${m.attendees.map((a, i) => `<div class="attendee">${i + 1}. ${a}</div>`).join("")}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Agenda Items</div>
          ${m.agendaItems.map((ag) => `<div class="agenda-item"><span class="agenda-num">${ag.number}.</span> ${ag.description}</div>`).join("")}
        </div>

        <div class="section">
          <div class="section-title">Minutes of the Meeting</div>
          <div class="minutes-body">${m.minutesBody}</div>
        </div>

        ${
          m.resolutions.length > 0
            ? `<div class="section">
          <div class="section-title">Resolutions (${m.resolutions.length})</div>
          ${m.resolutions
            .map(
              (r) => `
          <div class="resolution">
            <div class="resolution-id">${r.resolutionId}</div>
            <div class="resolution-text">${r.text}</div>
            <div class="resolution-meta">Responsible Officer: ${r.responsibleOfficer} &nbsp;|&nbsp; Deadline: ${r.deadline}</div>
          </div>`,
            )
            .join("")}
        </div>`
            : ""
        }

        ${m.attachmentRef ? `<div class="section"><div class="section-title">Attachment Reference</div><p>${m.attachmentRef}</p></div>` : ""}

        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Presiding Officer</p>
            <p>${m.presidedBy}</p>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Secretary / Registrar</p>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>

        <div class="footer">
          ${misName} &nbsp;|&nbsp; ${m.meetingType} Meeting — ${m.date} &nbsp;|&nbsp; Printed: ${new Date().toLocaleDateString("en-GB")}
        </div>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(printContent);
      w.document.close();
      w.focus();
      w.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Senate & Meeting Minutes
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Record, archive, and manage institutional meeting minutes
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={openNew}
          data-ocid="minutes.record-new.btn"
        >
          <Plus size={16} className="mr-2" />
          Record Minutes
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MEETING_TYPES.map((type) => {
          const count = minutes.filter((m) => m.meetingType === type).length;
          return (
            <Card
              key={type}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setFilterType(filterType === type ? "all" : type)}
            >
              <CardContent className="p-4">
                <p className="text-xl font-bold text-slate-800">{count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{type}</p>
                <span
                  className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[type]}`}
                >
                  {type}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className="pl-9"
                placeholder="Search by type, venue, presiding officer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="minutes.search.input"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger data-ocid="minutes.filter-type.select">
                <SelectValue placeholder="All meeting types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {MEETING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-ocid="minutes.filter-status.select">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Archive List */}
      <div className="space-y-3">
        {sortedFiltered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-400">
              No meeting minutes found
            </CardContent>
          </Card>
        )}
        {sortedFiltered.map((m) => (
          <Card
            key={m.id}
            className="hover:shadow-md transition-shadow"
            data-ocid={`minutes.card.${m.id}`}
          >
            <CardContent className="p-0">
              <button
                type="button"
                className="w-full text-left p-4 flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 flex-shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[m.meetingType]}`}
                      >
                        {m.meetingType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.status === "Published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">
                      {m.meetingType} Meeting — {m.date}
                    </p>
                    <p className="text-sm text-slate-500">
                      Presided by {m.presidedBy}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {m.attendees.length} attendees
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {m.resolutions.length}{" "}
                        resolutions
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {m.venue}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrint(m);
                    }}
                    data-ocid={`minutes.print.${m.id}`}
                  >
                    <Printer size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(m);
                    }}
                    data-ocid={`minutes.edit.${m.id}`}
                  >
                    Edit
                  </Button>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 ml-1"
                  >
                    {expandedId === m.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </button>

              {expandedId === m.id && (
                <div className="border-t px-4 pb-5 pt-4 space-y-5">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Agenda Items ({m.agendaItems.length})
                        </p>
                        <ol className="space-y-1">
                          {m.agendaItems.map((ag) => (
                            <li
                              key={ag.id}
                              className="text-sm text-slate-700 flex gap-2"
                            >
                              <span className="text-slate-400 font-medium min-w-[1.5rem]">
                                {ag.number}.
                              </span>
                              {ag.description}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Attendees ({m.attendees.length})
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {m.attendees.map((a) => (
                            <p key={a} className="text-xs text-slate-600">
                              • {a}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Key Resolutions ({m.resolutions.length})
                        </p>
                        <div className="space-y-2">
                          {m.resolutions.map((r) => (
                            <div
                              key={r.id}
                              className="bg-blue-50 border border-blue-100 rounded-lg p-3"
                            >
                              <p className="text-xs font-mono text-blue-500 mb-0.5">
                                {r.resolutionId}
                              </p>
                              <p className="text-sm text-slate-700">{r.text}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Officer: {r.responsibleOfficer} &bull; By:{" "}
                                {r.deadline}
                              </p>
                            </div>
                          ))}
                          {m.resolutions.length === 0 && (
                            <p className="text-sm text-slate-400 italic">
                              No resolutions recorded
                            </p>
                          )}
                        </div>
                      </div>

                      {m.minutesBody && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Minutes Summary
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-4 bg-slate-50 rounded-lg p-3">
                            {m.minutesBody.slice(0, 300)}
                            {m.minutesBody.length > 300 && "…"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {m.attachmentRef && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText size={12} /> Attachment: {m.attachmentRef}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} />
              {editId ? "Edit Meeting Minutes" : "Record Meeting Minutes"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Meeting Type</Label>
                <Select
                  value={form.meetingType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      meetingType: v as MeetingMinutes["meetingType"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meeting Date</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Venue</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Senate Chamber, Admin Block"
                  value={form.venue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, venue: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Presided By</Label>
                <Input
                  className="mt-1"
                  placeholder="Name and title of presiding officer"
                  value={form.presidedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, presidedBy: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <Label>Attendees</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add attendee name..."
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAttendee.trim()) {
                      setForm((f) => ({
                        ...f,
                        attendees: [...f.attendees, newAttendee.trim()],
                      }));
                      setNewAttendee("");
                    }
                  }}
                  data-ocid="minutes.attendee.input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newAttendee.trim()) {
                      setForm((f) => ({
                        ...f,
                        attendees: [...f.attendees, newAttendee.trim()],
                      }));
                      setNewAttendee("");
                    }
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.attendees.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-sm text-slate-700"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          attendees: f.attendees.filter((att) => att !== a),
                        }))
                      }
                    >
                      <X
                        size={12}
                        className="text-slate-400 hover:text-slate-700"
                      />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Agenda Items */}
            <div>
              <Label>Agenda Items</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add agenda item description..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  data-ocid="minutes.agenda.input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newAgenda.trim()) {
                      setForm((f) => ({
                        ...f,
                        agendaItems: [
                          ...f.agendaItems,
                          {
                            id: `AG-${Date.now()}`,
                            number: f.agendaItems.length + 1,
                            description: newAgenda.trim(),
                          },
                        ],
                      }));
                      setNewAgenda("");
                    }
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {form.agendaItems.map((ag, i) => (
                  <div
                    key={ag.id}
                    className="flex items-center gap-2 text-sm bg-slate-50 rounded px-3 py-1.5"
                  >
                    <span className="text-slate-400 font-medium w-5">
                      {ag.number}.
                    </span>
                    <span className="flex-1">{ag.description}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          agendaItems: f.agendaItems
                            .filter((_, j) => j !== i)
                            .map((a, idx) => ({ ...a, number: idx + 1 })),
                        }))
                      }
                    >
                      <X
                        size={13}
                        className="text-slate-400 hover:text-red-500"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes Body */}
            <div>
              <Label>Minutes Body</Label>
              <p className="text-xs text-slate-400 mb-1">
                Use clear paragraphs with headings for each agenda item
              </p>
              <Textarea
                className="mt-1 font-mono text-sm"
                rows={8}
                placeholder="Record the full minutes of the meeting here. Use headings for each agenda item..."
                value={form.minutesBody}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minutesBody: e.target.value }))
                }
                data-ocid="minutes.body.textarea"
              />
            </div>

            {/* Resolutions */}
            <div>
              <Label>Resolutions</Label>
              <div className="grid grid-cols-2 gap-3 mt-1 p-3 bg-slate-50 rounded-lg border">
                <Input
                  placeholder="Resolution ID (e.g. SEN/001/2024/01)"
                  value={newResolution.resolutionId}
                  onChange={(e) =>
                    setNewResolution((r) => ({
                      ...r,
                      resolutionId: e.target.value,
                    }))
                  }
                  data-ocid="minutes.resolution-id.input"
                />
                <Input
                  placeholder="Responsible Officer"
                  value={newResolution.responsibleOfficer}
                  onChange={(e) =>
                    setNewResolution((r) => ({
                      ...r,
                      responsibleOfficer: e.target.value,
                    }))
                  }
                />
                <Textarea
                  className="col-span-2"
                  rows={2}
                  placeholder="Resolution text..."
                  value={newResolution.text}
                  onChange={(e) =>
                    setNewResolution((r) => ({ ...r, text: e.target.value }))
                  }
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={newResolution.deadline}
                    onChange={(e) =>
                      setNewResolution((r) => ({
                        ...r,
                        deadline: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        newResolution.resolutionId.trim() &&
                        newResolution.text.trim()
                      ) {
                        setForm((f) => ({
                          ...f,
                          resolutions: [
                            ...f.resolutions,
                            {
                              id: `RES-${Date.now()}`,
                              ...newResolution,
                            },
                          ],
                        }));
                        setNewResolution({
                          resolutionId: "",
                          text: "",
                          responsibleOfficer: "",
                          deadline: "",
                        });
                      }
                    }}
                  >
                    <Plus size={16} /> Add
                  </Button>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {form.resolutions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-blue-500">
                        {r.resolutionId}
                      </p>
                      <p className="text-sm text-slate-700 mt-0.5">{r.text}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {r.responsibleOfficer} — by {r.deadline}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          resolutions: f.resolutions.filter(
                            (res) => res.id !== r.id,
                          ),
                        }))
                      }
                    >
                      <Trash2
                        size={14}
                        className="text-slate-400 hover:text-red-500"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachment */}
            <div>
              <Label>Attachment Reference</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Exam Results Summary Q1-2024.pdf"
                value={form.attachmentRef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, attachmentRef: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              data-ocid="minutes.save-draft.btn"
            >
              <Save size={14} className="mr-2" />
              Save as Draft
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleSave(true)}
              data-ocid="minutes.publish.btn"
            >
              Publish Minutes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
