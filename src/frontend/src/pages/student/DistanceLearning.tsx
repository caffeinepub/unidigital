import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Info,
  Laptop,
  MessageSquare,
  Phone,
  Users,
  Video,
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

interface DistanceLearningProps {
  userEmail?: string;
  userName?: string;
}

const programmes = [
  {
    code: "DL-NCE",
    title: "NCE (Distance Learning)",
    duration: "3 Years",
    mode: "Online + Weekend Classes",
    fee: "₦85,000 / session",
    entry: "WAEC/NECO 5 Credits",
    departments: [
      "English/CRK",
      "Mathematics/Physics",
      "Biology/Chemistry",
      "Social Studies",
    ],
    status: "Accepting Applications",
  },
  {
    code: "DL-PGD",
    title: "Postgraduate Diploma (Distance)",
    duration: "1 Year",
    mode: "Online + Monthly Residency",
    fee: "₦120,000 / session",
    entry: "First Degree",
    departments: [
      "Education Management",
      "Curriculum Studies",
      "Educational Technology",
    ],
    status: "Accepting Applications",
  },
  {
    code: "DL-PGDE",
    title: "PGDE (Distance Learning)",
    duration: "1 Year",
    mode: "Online + Bi-monthly Contact",
    fee: "₦130,000 / session",
    entry: "First Degree in relevant subject",
    departments: [
      "Science Education",
      "Mathematics Education",
      "English Education",
    ],
    status: "Accepting Applications",
  },
  {
    code: "DL-CERT",
    title: "Professional Certificate (Online)",
    duration: "3–6 Months",
    mode: "Fully Online",
    fee: "₦45,000 per certificate",
    entry: "NCE / First Degree",
    departments: [
      "Educational Technology",
      "Early Childhood Education",
      "Special Education",
    ],
    status: "Accepting Applications",
  },
];

const schedule = [
  { day: "Friday", time: "4:00pm – 8:00pm", type: "Live Virtual Lectures" },
  {
    day: "Saturday",
    time: "8:00am – 4:00pm",
    type: "Face-to-Face / Practical",
  },
  { day: "Sunday", time: "10:00am – 2:00pm", type: "Tutorials & Group Work" },
];

const features = [
  {
    icon: <Laptop size={24} />,
    title: "Online Learning Platform",
    desc: "Access course materials, recorded lectures, and assignments from anywhere via the UniDigital student portal.",
  },
  {
    icon: <Video size={24} />,
    title: "Live Virtual Classes",
    desc: "Participate in real-time lectures via video conferencing every Friday evening.",
  },
  {
    icon: <BookOpen size={24} />,
    title: "Digital Library Access",
    desc: "Full access to FUEK's e-library, digital textbooks, and academic journals.",
  },
  {
    icon: <Users size={24} />,
    title: "Academic Support",
    desc: "Dedicated academic advisors and peer tutoring groups for distance learners.",
  },
  {
    icon: <GraduationCap size={24} />,
    title: "Same Certificates",
    desc: "Graduates receive the same FUEK-issued certificates as on-campus students.",
  },
  {
    icon: <Globe size={24} />,
    title: "Study Anywhere",
    desc: "Designed for working professionals, teachers, and students in remote areas.",
  },
];

export function DistanceLearning({
  userEmail: _userEmail,
  userName,
}: DistanceLearningProps) {
  const [activeTab, setActiveTab] = useState("programmes");
  const [applied, setApplied] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={20} className="text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">
                Federal University of Education, Kontagora
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Distance Learning Centre
            </h1>
            <p className="text-blue-100 mt-1 max-w-xl">
              Quality education delivered to your doorstep. Earn your FUEK
              qualification through our flexible online and weekend programmes —
              without leaving your community.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-white/20 text-white border-0">
                Accredited by NUC
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                NCE Approved by NCCE
              </Badge>
              <Badge className="bg-green-400/30 text-green-100 border-0">
                Applications Open 2024/2025
              </Badge>
            </div>
          </div>
          <Laptop
            size={64}
            className="text-blue-300 hidden md:block shrink-0"
          />
        </div>
      </div>

      {/* Quick contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: <Phone size={16} />,
            label: "Enquiries",
            value: "+234 803 000 0001",
          },
          {
            icon: <MessageSquare size={16} />,
            label: "Email",
            value: "dl@fuek.edu.ng",
          },
          {
            icon: <Clock size={16} />,
            label: "Office Hours",
            value: "Mon–Fri, 8am–4pm",
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-primary">{item.icon}</span>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="apply">Apply Now</TabsTrigger>
        </TabsList>

        {/* Programmes Tab */}
        <TabsContent value="programmes" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {programmes.map((prog) => (
              <Card
                key={prog.code}
                className="hover:shadow-md transition-shadow"
                data-ocid={`dl.programme_card.${prog.code}`}
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[
                      ["Duration", prog.duration],
                      ["Mode", prog.mode],
                      ["Fee", prog.fee],
                      ["Entry", prog.entry],
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
                    data-ocid={`dl.apply_button.${prog.code}`}
                  >
                    Apply for {prog.code}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => (
              <Card
                key={feat.title}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 space-y-2">
                  <div className="text-primary">{feat.icon}</div>
                  <h3 className="font-semibold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Weekly Schedule — Distance Learning Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.map((s) => (
                  <div
                    key={s.day}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{s.day}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.type}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {s.time}
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
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  {
                    id: "n1",
                    note: "Students must attend at least 75% of all scheduled sessions (virtual and face-to-face).",
                  },
                  {
                    id: "n2",
                    note: "Teaching Practice and Laboratory sessions require physical presence at FUEK campus.",
                  },
                  {
                    id: "n3",
                    note: "Examination weeks require all distance students to sit for exams on-campus.",
                  },
                  {
                    id: "n4",
                    note: "Study centre locations are available in Kontagora, Minna, and Abuja.",
                  },
                  {
                    id: "n5",
                    note: "Technical support is available during all live sessions.",
                  },
                ].map(({ id, note }) => (
                  <li key={id} className="flex items-start gap-2">
                    <CheckCircle
                      size={14}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apply Tab */}
        <TabsContent value="apply" className="mt-4">
          {applied ? (
            <Card className="border-2 border-green-300">
              <CardContent className="p-8 text-center space-y-3">
                <CheckCircle size={48} className="text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-foreground">
                  Application Submitted!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your expression of interest for the Distance Learning
                  programme has been received. The admissions team will contact
                  you within 5 working days.
                </p>
                <p className="text-xs text-muted-foreground">
                  Reference: DL-{Date.now().toString().slice(-8)}
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
                  Expression of Interest — Distance Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-lg">
                  <div className="grid gap-3">
                    {[
                      {
                        id: "dl-name",
                        label: "Full Name",
                        type: "text",
                        placeholder: `${userName ?? "Your full name"}`,
                      },
                      {
                        id: "dl-email",
                        label: "Email Address",
                        type: "email",
                        placeholder: "your@email.com",
                      },
                      {
                        id: "dl-phone",
                        label: "Phone Number",
                        type: "tel",
                        placeholder: "+234 000 000 0000",
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
                          data-ocid={`dl.form.${field.id}`}
                        />
                      </div>
                    ))}
                    <div>
                      <label
                        htmlFor="dl-programme"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Programme of Interest
                      </label>
                      <select
                        id="dl-programme"
                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                        data-ocid="dl.form.dl-programme"
                      >
                        {programmes.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="dl-qualification"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Highest Qualification
                      </label>
                      <select
                        id="dl-qualification"
                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-card"
                        data-ocid="dl.form.dl-qualification"
                      >
                        {[
                          "WAEC/NECO",
                          "NCE",
                          "OND/HND",
                          "First Degree (B.Sc/B.Ed)",
                          "Postgraduate",
                        ].map((q) => (
                          <option key={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      Required Documents (submit after admission):
                    </p>
                    <ul className="space-y-0.5">
                      {[
                        "WAEC/NECO certificate (original + photocopy)",
                        "Birth certificate or age declaration",
                        "2 passport photographs",
                        "JAMB result (for NCE programmes)",
                        "Previous academic transcripts",
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
                    data-ocid="dl.submit_application_button"
                  >
                    <ExternalLink size={16} />
                    Submit Expression of Interest
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
