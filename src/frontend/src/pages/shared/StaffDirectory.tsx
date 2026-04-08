import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface StaffMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  qualification: string;
  email: string;
  dateJoined: string;
}

const seedStaff: StaffMember[] = [
  {
    id: "s1",
    name: "Prof. Abubakar Sadiq",
    department: "Computer Science",
    designation: "Professor",
    qualification: "PhD Computer Science",
    email: "a.sadiq@fuek.edu.ng",
    dateJoined: "2005-09-01",
  },
  {
    id: "s2",
    name: "Dr. Ngozi Okonkwo",
    department: "Mathematics",
    designation: "Senior Lecturer",
    qualification: "PhD Mathematics",
    email: "n.okonkwo@fuek.edu.ng",
    dateJoined: "2010-01-15",
  },
  {
    id: "s3",
    name: "Mrs. Halima Usman",
    department: "English",
    designation: "Lecturer I",
    qualification: "M.A. English Literature",
    email: "h.usman@fuek.edu.ng",
    dateJoined: "2014-03-10",
  },
  {
    id: "s4",
    name: "Mr. Emmanuel Obi",
    department: "Physics",
    designation: "Lecturer II",
    qualification: "M.Sc. Physics",
    email: "e.obi@fuek.edu.ng",
    dateJoined: "2016-07-20",
  },
  {
    id: "s5",
    name: "Dr. Fatima Garba",
    department: "Chemistry",
    designation: "Senior Lecturer",
    qualification: "PhD Chemistry",
    email: "f.garba@fuek.edu.ng",
    dateJoined: "2012-09-01",
  },
  {
    id: "s6",
    name: "Prof. Chukwuemeka Eze",
    department: "Biology",
    designation: "Professor",
    qualification: "PhD Molecular Biology",
    email: "c.eze@fuek.edu.ng",
    dateJoined: "2003-09-01",
  },
  {
    id: "s7",
    name: "Mr. Yusuf Musa",
    department: "Economics",
    designation: "Assistant Lecturer",
    qualification: "M.Sc. Economics",
    email: "y.musa@fuek.edu.ng",
    dateJoined: "2019-01-08",
  },
  {
    id: "s8",
    name: "Mrs. Blessing Ade",
    department: "Education",
    designation: "Lecturer I",
    qualification: "M.Ed. Curriculum Studies",
    email: "b.ade@fuek.edu.ng",
    dateJoined: "2015-04-01",
  },
  {
    id: "s9",
    name: "Dr. Umar Danjuma",
    department: "History",
    designation: "Senior Lecturer",
    qualification: "PhD African History",
    email: "u.danjuma@fuek.edu.ng",
    dateJoined: "2011-09-01",
  },
  {
    id: "s10",
    name: "Miss. Adaeze Nwosu",
    department: "Computer Science",
    designation: "Assistant Lecturer",
    qualification: "M.Sc. Information Technology",
    email: "a.nwosu@fuek.edu.ng",
    dateJoined: "2021-01-15",
  },
];

export function StaffDirectory({ isAdmin = false }: { isAdmin?: boolean }) {
  const [staff, setStaff] = useState<StaffMember[]>(seedStaff);
  const [search, setSearch] = useState("");
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.designation.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (s: StaffMember) => {
    setEditStaff(s);
    setEditForm({ ...s });
  };

  const handleSave = () => {
    if (!editStaff) return;
    setStaff((prev) =>
      prev.map((s) => (s.id === editStaff.id ? { ...s, ...editForm } : s)),
    );
    setEditStaff(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Directory</h1>
        <p className="text-slate-500 text-sm mt-1">
          Searchable directory of all academic and administrative staff
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({filtered.length})</CardTitle>
          <Input
            placeholder="Search by name, department, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 max-w-sm"
            data-ocid="staff_dir.search_input"
          />
        </CardHeader>
        <CardContent>
          <Table data-ocid="staff_dir.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date Joined</TableHead>
                {isAdmin && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, idx) => (
                <TableRow key={s.id} data-ocid={`staff_dir.item.${idx + 1}`}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>{s.designation}</TableCell>
                  <TableCell className="text-sm">{s.qualification}</TableCell>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell>{s.dateJoined}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(s)}
                        data-ocid={`staff_dir.edit_button.${idx + 1}`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isAdmin && (
        <Dialog
          open={!!editStaff}
          onOpenChange={(o) => {
            if (!o) setEditStaff(null);
          }}
        >
          <DialogContent data-ocid="staff_dir.dialog">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {(
                [
                  "name",
                  "department",
                  "designation",
                  "qualification",
                  "email",
                ] as const
              ).map((field) => (
                <div key={field}>
                  <Label className="capitalize">{field}</Label>
                  <Input
                    value={(editForm[field] as string) ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                    data-ocid={`staff_dir.${field}.input`}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditStaff(null)}
                data-ocid="staff_dir.cancel_button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-ocid="staff_dir.save_button">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
