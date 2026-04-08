import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Info,
  Moon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

interface PartTimeStudiesProps {
  userEmail?: string;
  userName?: string;
}

const ptProgrammes = [
  {
    code: "PT-NCE",
    title: "NCE (Part-Time)",
    duration: "4 Years",
    sessions: "Evening & Weekend",
    fee: "₦95,000 / session",
    entry: "WAEC/NECO 5 Credits + JAMB",
    departments: [
      "Computer Science/Mathematics",
      "Biology/Chemistry",
      "Physics/Mathematics",
      "English/CRK",
      "Social Studies/Civic Ed",
    ],
    maxLoad: "16 credit units/semester",
    status: "Open",
  },
  {
    code: "PT-BSCED",
    title: "B.Sc (Ed) — Part-Time",
    duration: "5 Years",
    sessions: "Evening (Mon–Fri, 4–8pm) + Saturdays",
    fee: "₦110,000 / session",
    entry: "WAEC 5 Credits + JAMB + Post-UTME",
    departments: [
      "Computer Science",
      "Biology",
      "Chemistry",
      "Physics",
      "Mathematics",
      "Integrated Science",
      "Environmental Education",
    ],
    maxLoad: "18 credit units/semester",
    status: "Open",
  },
  {
    code: "PT-PGD",
    title: "PGD Education (Part-Time)",
    duration: "2 Years",
    sessions: "Weekend Only",
    fee: "₦140,000 / session",
    entry: "First Degree in relevant field",
    departments: [
      "Educational Management",
      "Curriculum Studies",
      "Measurement & Evaluation",
    ],
    maxLoad: "12 credit units/semester",
    status: "Open",
  },
];

const eveningTimetable = [
  { day: "Monday", time: "4:00pm – 7:00pm", courses: "Core courses (Group A)" },
  {
    day: "Tuesday",
    time: "4:00pm – 7:00pm",
    courses: "Core courses (Group B)",
  },
  {
    day: "Wednesday",
    time: "4:00pm – 7:00pm",
    courses: "Electives & Practicals",
  },
  { day: "Thursday", time: "4:00pm – 7:00pm", courses: "GST & EDU courses" },
  {
    day: "Friday",
    time: "4:00pm – 8:00pm",
    courses: "Extended session / Tutorials",
  },
  {
    day: "Saturday",
    time: "8:00am – 5:00pm",
    courses: "Practicals / Lab / Workshop",
  },
];

const faqs = [
  {
    q: "Can I switch from Part-Time to Full-Time?",
    a: "Yes, subject to available spaces. Speak to the Registry for a transfer form.",
  },
  {
    q: "Do Part-Time students get the same certificate?",
    a: "Yes. FUEK awards the same certificate regardless of study mode. Your transcript will not indicate part-time status.",
  },
  {
    q: "Is there a maximum age limit?",
    a: "No. FUEK Part-Time programmes are open to all eligible applicants regardless of age.",
  },
  {
    q: "What happens if I miss classes?",
    a: "You must maintain a minimum 75% attendance rate. Failure to do so may result in withdrawal from exams for the affected course(s).",
  },
  {
    q: "Can I do Teaching Practice while working full-time?",
    a: "Teaching Practice blocks (EDU 301 and EDU 401) require dedicated weeks. Most employers grant study leave. FUEK can provide a formal letter upon request.",
  },
];

const benefits = [
  {
    icon: <Briefcase size={22} />,
    title: "Study While Working",
    desc: "Evening and weekend classes let you keep your job while earning your qualification.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Full Accreditation",
    desc: "NUC/NCCE-accredited programmes — same value as full-time degrees.",
  },
  {
    icon: <Moon size={22} />,
    title: "Evening Classes",
    desc: "Lectures run 4pm–8pm weekdays so you can fulfil daytime obligations.",
  },
  {
    icon: <Clock size={22} />,
    title: "Flexible Credit Load",
    desc: "Carry fewer courses per semester to match your schedule and capacity.",
  },
  {
    icon: <Users size={22} />,
    title: "Peer Community",
    desc: "Connect with working professionals, civil servants, and teachers from across Niger State.",
  },
  {
    icon: <BookOpen size={22} />,
    title: "Same Curriculum",
    desc: "The full FUEK curriculum — all 9 departments, all course catalogs — available to part-time students.",
  },
];

export function PartTimeStudies({
  userEmail: _userEmail,
  userName,
}: PartTimeStudiesProps) {
  const [activeTab, setActiveTab] = useState("programmes");
  const [applied, setApplied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-700 to-teal-900 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon size={18} className="text-emerald-200" />
              <span className="text-emerald-200 text-sm font-medium">
                Federal University of Education, Kontagora
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Part-Time Studies
            </h1>
            <p className="text-emerald-100 mt-1 max-w-xl">
              Advance your education without pausing your career. FUEK's
              Part-Time programmes offer evening and weekend classes so that
              working adults, civil servants, and teachers can earn a full FUEK
              qualification at their own pace.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-white/20 text-white border-0">
                NUC Approved
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                Evening Classes
              </Badge>
              <Badge className="bg-emerald-400/30 text-emerald-100 border-0">
                Applications Open 2024/2025
              </Badge>
            </div>
          </div>
          <Moon
            size={64}
            className="text-emerald-300 hidden md:block shrink-0"
          />
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold">Part-Time Registration Notice</p>
          <p className="mt-0.5">
            Part-time students follow the same course registration process as
            full-time students — using the Course Registration portal — but your
            maximum credit load per semester is lower. Your HOD/Adviser will
            confirm your maximum allowed load at registration time.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="schedule">Timetable</TabsTrigger>
          <TabsTrigger value="apply">Apply</TabsTrigger>
        </TabsList>

        {/* Programmes */}
        <TabsContent value="programmes" className="space-y-4 mt-4">
          {ptProgrammes.map((prog) => (
            <Card
              key={prog.code}
              className="hover:shadow-md transition-shadow"
              data-ocid={`pt.programme_card.${prog.code}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base">{prog.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {prog.code}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    {prog.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {[
                    ["Duration", prog.duration],
                    ["Sessions", prog.sessions],
                    ["Fee", prog.fee],
                    ["Entry", prog.entry],
                    ["Max Credit Load", prog.maxLoad],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Available Departments:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.departments.map((dept) => (
                      <Badge
                        key={dept}
                        className="bg-primary/10 text-primary border-0 text-xs"
                      >
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => setActiveTab("apply")}
                  data-ocid={`pt.apply_button.${prog.code}`}
                >
                  Apply for {prog.code}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Benefits */}
        <TabsContent value="benefits" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b) => (
              <Card key={b.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-2">
                  <div className="text-primary">{b.icon}</div>
                  <h3 className="font-semibold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
              <Info size={16} className="text-primary" /> Frequently Asked
              Questions
            </h3>
            {faqs.map((faq, idx) => (
              <Card
                key={faq.q}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                data-ocid={`pt.faq.${idx + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm text-foreground">
                      {faq.q}
                    </p>
                    <span className="text-primary text-lg font-bold shrink-0">
                      {openFaq === idx ? "−" : "+"}
                    </span>
                  </div>
                  {openFaq === idx && (
                    <p className="text-sm text-muted-foreground mt-2 border-t border-border pt-2">
                      {faq.a}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Part-Time Weekly Class Timetable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eveningTimetable.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border flex-wrap"
                  >
                    <div className="flex items-center gap-3">
                      <Moon size={14} className="text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {row.day}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.courses}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {row.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info size={16} className="text-primary" />
                Part-Time Regulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  {
                    id: "r1",
                    text: "Minimum credit load is 12 units per semester for part-time students.",
                  },
                  {
                    id: "r2",
                    text: "Maximum credit load varies by programme (see above). Your adviser confirms your limit.",
                  },
                  {
                    id: "r3",
                    text: "Carryover courses count toward your credit load and must be registered first.",
                  },
                  {
                    id: "r4",
                    text: "75% attendance is mandatory. Missing classes risks exam barring.",
                  },
                  {
                    id: "r5",
                    text: "Teaching Practice and practical sessions require full-day physical attendance.",
                  },
                  {
                    id: "r6",
                    text: "Final examinations are the same as full-time students — no special arrangements.",
                  },
                ].map(({ id, text }) => (
                  <li key={id} className="flex items-start gap-2">
                    <CheckCircle
                      size={14}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    {text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard size={16} className="text-primary" />
                Fee Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  {
                    id: "f1",
                    label: "Acceptance Fee",
                    amount: "₦25,000",
                    due: "On admission",
                    status: "Once only",
                  },
                  {
                    id: "f2",
                    label: "Session Fee (1st Instalment)",
                    amount: "₦60,000",
                    due: "Before registration",
                    status: "Per session",
                  },
                  {
                    id: "f3",
                    label: "Session Fee (2nd Instalment)",
                    amount: "₦35,000–50,000",
                    due: "By Week 8",
                    status: "Per session",
                  },
                  {
                    id: "f4",
                    label: "Lab/Practical Fees",
                    amount: "₦5,000–₦15,000",
                    due: "Before practicals",
                    status: "Dept. dependent",
                  },
                ].map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div>
                      <p className="font-medium text-foreground">{fee.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {fee.due} · {fee.status}
                      </p>
                    </div>
                    <span className="font-bold text-primary">{fee.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apply */}
        <TabsContent value="apply" className="mt-4">
          {applied ? (
            <Card className="border-2 border-green-300">
              <CardContent className="p-8 text-center space-y-3">
                <CheckCircle size={48} className="text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-foreground">
                  Application Submitted!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your Part-Time Studies application has been received. Our
                  admissions team will review your details and respond within 3
                  working days.
                </p>
                <p className="text-xs text-muted-foreground">
                  Reference: PT-{Date.now().toString().slice(-8)}
                </p>
                <Button variant="outline" onClick={() => setApplied(false)}>
                  Submit Another Application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Part-Time Studies — Application Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-lg">
                  <div className="grid gap-3">
                    {[
                      {
                        id: "pt-name",
                        label: "Full Name",
                        type: "text",
                        placeholder: userName ?? "Your full name",
                      },
                      {
                        id: "pt-email",
                        label: "Email Address",
                        type: "email",
                        placeholder: "your@email.com",
                      },
                      {
                        id: "pt-phone",
                        label: "Phone Number",
                        type: "tel",
                        placeholder: "+234 000 000 0000",
                      },
                      {
                        id: "pt-employer",
                        label: "Current Employer (if any)",
                        type: "text",
                        placeholder: "School / Ministry / Company name",
                      },
                    ].map((field) => (
                      <div key={field.id}>
                        <label
                          htmlFor={field.id}
                          className="block text-sm font-medium text-foreground mb-1"
                        >
                          {field.label}
                        </label>
                        <input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                          data-ocid={`pt.form.${field.id}`}
                        />
                      </div>
                    ))}
                    <div>
                      <label
                        htmlFor="pt-programme"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Programme of Interest
                      </label>
                      <select
                        id="pt-programme"
                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-card"
                        data-ocid="pt.form.pt-programme"
                      >
                        {ptProgrammes.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="pt-reason"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Why are you applying for Part-Time?
                      </label>
                      <textarea
                        id="pt-reason"
                        rows={3}
                        placeholder="e.g., I am a serving teacher seeking to upgrade my qualification while maintaining my posting..."
                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        data-ocid="pt.form.pt-reason"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      Checklist (bring to Registry):
                    </p>
                    <ul className="space-y-0.5">
                      {[
                        "WAEC/NECO result slip (original)",
                        "JAMB result printout",
                        "Birth certificate / age declaration",
                        "2 recent passport photographs",
                        "Letter of employment (if applicable)",
                        "Study leave approval letter (if applicable)",
                      ].map((doc) => (
                        <li key={doc} className="flex items-center gap-1.5">
                          <CheckCircle size={11} className="text-green-500" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={() => setApplied(true)}
                    data-ocid="pt.submit_application_button"
                  >
                    <FileText size={16} />
                    Submit Part-Time Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
