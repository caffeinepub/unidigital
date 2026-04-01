import {
  Briefcase,
  Building2,
  Calendar,
  Globe,
  GraduationCap,
  MapPin,
  Save,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { StatCard } from "../../components/StatCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export type AlumniPage =
  | "dashboard"
  | "directory"
  | "jobs"
  | "events"
  | "profile";

interface Props {
  activePage: AlumniPage;
}

const alumniData = [
  {
    id: "A001",
    name: "Adaobi Okafor",
    dept: "Computer Science",
    year: 2021,
    employer: "Google",
    title: "Software Engineer",
    location: "Lagos",
    linkedin: "",
  },
  {
    id: "A002",
    name: "Chukwuemeka Eze",
    dept: "Engineering",
    year: 2020,
    employer: "Shell Nigeria",
    title: "Petroleum Engineer",
    location: "Port Harcourt",
    linkedin: "",
  },
  {
    id: "A003",
    name: "Fatima Al-Hassan",
    dept: "Medicine",
    year: 2019,
    employer: "Lagos Teaching Hospital",
    title: "Resident Doctor",
    location: "Lagos",
    linkedin: "",
  },
  {
    id: "A004",
    name: "Segun Adeyemi",
    dept: "Law",
    year: 2018,
    employer: "Templars Law Firm",
    title: "Associate Counsel",
    location: "Abuja",
    linkedin: "",
  },
  {
    id: "A005",
    name: "Ngozi Nwachukwu",
    dept: "Business Admin",
    year: 2021,
    employer: "UBA Nigeria",
    title: "Branch Manager",
    location: "Enugu",
    linkedin: "",
  },
  {
    id: "A006",
    name: "Babatunde Olatunji",
    dept: "Computer Science",
    year: 2020,
    employer: "Microsoft",
    title: "Cloud Architect",
    location: "Lagos",
    linkedin: "",
  },
  {
    id: "A007",
    name: "Amina Suleiman",
    dept: "Education",
    year: 2017,
    employer: "Federal Government College",
    title: "Senior Lecturer",
    location: "Kaduna",
    linkedin: "",
  },
  {
    id: "A008",
    name: "Emeka Okonkwo",
    dept: "Engineering",
    year: 2019,
    employer: "Dangote Group",
    title: "Project Engineer",
    location: "Lagos",
    linkedin: "",
  },
  {
    id: "A009",
    name: "Kemi Adeleke",
    dept: "Computer Science",
    year: 2022,
    employer: "Flutterwave",
    title: "Full-Stack Developer",
    location: "Lagos",
    linkedin: "",
  },
  {
    id: "A010",
    name: "Uche Nwosu",
    dept: "Medicine",
    year: 2018,
    employer: "WHO Nigeria",
    title: "Public Health Specialist",
    location: "Abuja",
    linkedin: "",
  },
];

const jobsData = [
  {
    id: "J001",
    title: "Frontend Developer",
    company: "Paystack",
    location: "Lagos",
    type: "Full-time",
    postedBy: "Babatunde Olatunji",
    date: "2026-03-15",
  },
  {
    id: "J002",
    title: "Software Engineer II",
    company: "Google Nigeria",
    location: "Lagos",
    type: "Full-time",
    postedBy: "Adaobi Okafor",
    date: "2026-03-10",
  },
  {
    id: "J003",
    title: "Data Analyst",
    company: "Access Bank",
    location: "Abuja",
    type: "Full-time",
    postedBy: "Ngozi Nwachukwu",
    date: "2026-03-08",
  },
  {
    id: "J004",
    title: "Legal Intern",
    company: "Templars Law Firm",
    location: "Abuja",
    type: "Internship",
    postedBy: "Segun Adeyemi",
    date: "2026-03-05",
  },
  {
    id: "J005",
    title: "DevOps Engineer",
    company: "Microsoft",
    location: "Remote",
    type: "Full-time",
    postedBy: "Babatunde Olatunji",
    date: "2026-02-28",
  },
  {
    id: "J006",
    title: "Product Manager",
    company: "Interswitch",
    location: "Lagos",
    type: "Full-time",
    postedBy: "Kemi Adeleke",
    date: "2026-02-25",
  },
];

const eventsData = [
  {
    id: "E001",
    name: "Annual Alumni Gala 2026",
    date: "2026-05-15",
    venue: "Transcorp Hilton, Abuja",
    desc: "Our flagship annual gala bringing together graduates from all batches. Networking, awards, and entertainment.",
  },
  {
    id: "E002",
    name: "Tech Alumni Meetup — Lagos Chapter",
    date: "2026-04-10",
    venue: "CcHub, Yaba, Lagos",
    desc: "A focused networking event for alumni in the technology sector. Talks by senior engineers, startup pitches, and mentoring sessions.",
  },
  {
    id: "E003",
    name: "Alumni Career Day",
    date: "2026-06-20",
    venue: "University Main Auditorium",
    desc: "Alumni return to campus to mentor current students, conduct mock interviews, and share career insights.",
  },
];

export function AlumniDashboard({ activePage }: Props) {
  const [search, setSearch] = useState("");
  const [profileForm, setProfileForm] = useState({
    employer: "Google",
    title: "Software Engineer",
    location: "Lagos",
    linkedin: "https://linkedin.com/in/adaobi-okafor",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const filtered = alumniData.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.dept.toLowerCase().includes(search.toLowerCase()) ||
      a.employer.toLowerCase().includes(search.toLowerCase()),
  );

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  if (activePage === "dashboard")
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-slate-700 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, Adaobi!</h1>
              <p className="text-blue-200 mt-1">
                Class of 2021 · Computer Science · Google
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold">
              AO
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Class Year"
            value="2021"
            icon={<GraduationCap size={22} />}
            color="blue"
          />
          <StatCard
            title="Department"
            value="Comp Sci"
            icon={<Building2 size={22} />}
            color="green"
          />
          <StatCard
            title="Network Size"
            value={alumniData.length}
            icon={<Users size={22} />}
            color="purple"
          />
          <StatCard
            title="Job Board"
            value={jobsData.length}
            icon={<Briefcase size={22} />}
            color="amber"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Full Name", "Adaobi Okafor"],
                ["Graduation Year", "2021"],
                ["Department", "Computer Science"],
                ["Current Employer", profileForm.employer],
                ["Job Title", profileForm.title],
                ["Location", profileForm.location],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-medium">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsData.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 py-2 border-b last:border-0"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-slate-500">
                      {e.date} · {e.venue}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Latest Job Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {jobsData.slice(0, 4).map((j) => (
                <div
                  key={j.id}
                  className="p-3 border border-slate-200 rounded-lg"
                >
                  <p className="text-sm font-semibold">{j.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {j.company} · {j.location}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                      {j.type}
                    </Badge>
                    <span className="text-xs text-slate-400">{j.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "directory")
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Alumni Directory
            </h1>
            <p className="text-slate-500 text-sm">
              {alumniData.length} registered alumni
            </p>
          </div>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            className="pl-9"
            placeholder="Search by name, department, or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="directory.search_input"
          />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table data-ocid="directory.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a, i) => (
                  <TableRow key={a.id} data-ocid={`directory.item.${i + 1}`}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-slate-500">{a.dept}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Class of {a.year}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {a.employer}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-slate-500 text-sm">
                        <MapPin size={12} />
                        {a.location}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-400"
                      data-ocid="directory.empty_state"
                    >
                      No alumni match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );

  if (activePage === "jobs")
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Job Board</h1>
          <p className="text-slate-500 text-sm">
            Opportunities shared by alumni
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {jobsData.map((j, i) => (
            <Card key={j.id} data-ocid={`jobs.item.${i + 1}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-800">{j.title}</h3>
                  <Badge
                    className={`text-xs border-0 ${
                      j.type === "Full-time"
                        ? "bg-green-100 text-green-700"
                        : j.type === "Internship"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {j.type}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Building2 size={14} />
                    {j.company}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {j.location}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users size={14} />
                    Posted by {j.postedBy}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">{j.date}</span>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

  if (activePage === "events")
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alumni Events</h1>
          <p className="text-slate-500 text-sm">
            Upcoming events and gatherings
          </p>
        </div>
        <div className="space-y-4">
          {eventsData.map((e, i) => (
            <Card key={e.id} data-ocid={`events.item.${i + 1}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 text-lg">
                        {e.name}
                      </h3>
                      <Badge className="bg-green-100 text-green-700 border-0 flex-shrink-0">
                        Upcoming
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {e.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {e.venue}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      {e.desc}
                    </p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                      >
                        Register Interest
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

  if (activePage === "profile")
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        {profileSaved && (
          <div
            className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700"
            data-ocid="profile.success_state"
          >
            ✓ Profile updated successfully!
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Full Name", "Adaobi Okafor"],
                ["Matric Number", "CSC/2017/001"],
                ["Department", "Computer Science"],
                ["Graduation Year", "2021"],
                ["Degree", "B.Sc Computer Science (Second Class Upper)"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-medium">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Employer</Label>
                <Input
                  className="mt-1"
                  value={profileForm.employer}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, employer: e.target.value }))
                  }
                  data-ocid="profile.input"
                />
              </div>
              <div>
                <Label>Job Title</Label>
                <Input
                  className="mt-1"
                  value={profileForm.title}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, title: e.target.value }))
                  }
                  data-ocid="profile.input"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  className="mt-1"
                  value={profileForm.location}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, location: e.target.value }))
                  }
                  data-ocid="profile.input"
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  className="mt-1"
                  placeholder="https://linkedin.com/in/..."
                  value={profileForm.linkedin}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, linkedin: e.target.value }))
                  }
                  data-ocid="profile.input"
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleProfileSave}
                data-ocid="profile.save_button"
              >
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alumni Network Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                ["Total Alumni", alumniData.length.toString()],
                ["Companies Represented", "28"],
                ["Countries", "6"],
                ["Open Job Listings", jobsData.length.toString()],
              ].map(([k, v]) => (
                <div key={k} className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{v}</p>
                  <p className="text-xs text-slate-500 mt-1">{k}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

  return null;
}
