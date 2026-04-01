import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const alumniRecords = [
  {
    matric: "CSC/2017/001",
    name: "Adaobi Okafor",
    dept: "Computer Science",
    year: 2021,
    employer: "Google",
    location: "Lagos",
  },
  {
    matric: "ENG/2016/018",
    name: "Chukwuemeka Eze",
    dept: "Engineering",
    year: 2020,
    employer: "Shell Nigeria",
    location: "Port Harcourt",
  },
  {
    matric: "MED/2015/007",
    name: "Fatima Al-Hassan",
    dept: "Medicine",
    year: 2019,
    employer: "Lagos Teaching Hospital",
    location: "Lagos",
  },
  {
    matric: "LAW/2014/031",
    name: "Segun Adeyemi",
    dept: "Law",
    year: 2018,
    employer: "Templars Law Firm",
    location: "Abuja",
  },
  {
    matric: "BUS/2017/055",
    name: "Ngozi Nwachukwu",
    dept: "Business Admin",
    year: 2021,
    employer: "UBA Nigeria",
    location: "Enugu",
  },
  {
    matric: "CSC/2016/019",
    name: "Babatunde Olatunji",
    dept: "Computer Science",
    year: 2020,
    employer: "Microsoft",
    location: "Lagos",
  },
  {
    matric: "EDU/2013/028",
    name: "Amina Suleiman",
    dept: "Education",
    year: 2017,
    employer: "Federal Government College",
    location: "Kaduna",
  },
  {
    matric: "ENG/2015/044",
    name: "Emeka Okonkwo",
    dept: "Engineering",
    year: 2019,
    employer: "Dangote Group",
    location: "Lagos",
  },
  {
    matric: "CSC/2018/039",
    name: "Kemi Adeleke",
    dept: "Computer Science",
    year: 2022,
    employer: "Flutterwave",
    location: "Lagos",
  },
  {
    matric: "MED/2014/012",
    name: "Uche Nwosu",
    dept: "Medicine",
    year: 2018,
    employer: "WHO Nigeria",
    location: "Abuja",
  },
  {
    matric: "LAW/2016/022",
    name: "Chisom Obiora",
    dept: "Law",
    year: 2020,
    employer: "Olaniwun Ajayi LP",
    location: "Lagos",
  },
  {
    matric: "BUS/2015/037",
    name: "Yemi Obaseki",
    dept: "Business Admin",
    year: 2019,
    employer: "GTBank",
    location: "Lagos",
  },
];

const allDepts = [...new Set(alumniRecords.map((a) => a.dept))];
const allYears = [...new Set(alumniRecords.map((a) => a.year))].sort(
  (a, b) => b - a,
);

export function AlumniAdmin() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const filtered = alumniRecords.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.employer.toLowerCase().includes(search.toLowerCase()) ||
      a.matric.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || a.dept === deptFilter;
    const matchYear = yearFilter === "all" || a.year === +yearFilter;
    return matchSearch && matchDept && matchYear;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Alumni Management</h1>
        <p className="text-slate-500 text-sm">
          {alumniRecords.length} registered alumni
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            className="pl-9"
            placeholder="Search by name, matric, or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="alumni.search_input"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48" data-ocid="alumni.select">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {allDepts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-36" data-ocid="alumni.select">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {allYears.map((y) => (
              <SelectItem key={y} value={String(y)}>
                Class of {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-ocid="alumni.table">
            <TableHeader>
              <TableRow>
                <TableHead>Matric No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Grad Year</TableHead>
                <TableHead>Employer</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a, i) => (
                <TableRow key={a.matric} data-ocid={`alumni.item.${i + 1}`}>
                  <TableCell className="font-mono text-xs text-blue-600">
                    {a.matric}
                  </TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-slate-500">{a.dept}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Class of {a.year}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{a.employer}</TableCell>
                  <TableCell className="text-slate-500">{a.location}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-400"
                    data-ocid="alumni.empty_state"
                  >
                    No alumni match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
