import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { getLocalStudents } from "../../utils/sampleData";

interface Room {
  id: string;
  block: string;
  roomNo: string;
  type: "Single" | "Double" | "4-Person";
  totalBeds: number;
  occupied: number;
}

interface Allocation {
  id: string;
  studentName: string;
  matric: string;
  roomId: string;
  block: string;
  dateAllocated: string;
}

interface TransferRequest {
  id: string;
  studentName: string;
  matric: string;
  currentRoom: string;
  requestedBlock: string;
  reason: string;
  status: "pending" | "approved" | "denied";
}

const feeSchedule = [
  { block: "Block A", fee: 80000, type: "Single" },
  { block: "Block B", fee: 60000, type: "Double" },
  { block: "Block C", fee: 45000, type: "4-Person" },
];

const initialRooms: Room[] = [
  {
    id: "r1",
    block: "Block A",
    roomNo: "A101",
    type: "Single",
    totalBeds: 1,
    occupied: 1,
  },
  {
    id: "r2",
    block: "Block A",
    roomNo: "A102",
    type: "Single",
    totalBeds: 1,
    occupied: 0,
  },
  {
    id: "r3",
    block: "Block A",
    roomNo: "A103",
    type: "Double",
    totalBeds: 2,
    occupied: 1,
  },
  {
    id: "r4",
    block: "Block A",
    roomNo: "A104",
    type: "Double",
    totalBeds: 2,
    occupied: 2,
  },
  {
    id: "r5",
    block: "Block B",
    roomNo: "B201",
    type: "Double",
    totalBeds: 2,
    occupied: 1,
  },
  {
    id: "r6",
    block: "Block B",
    roomNo: "B202",
    type: "Double",
    totalBeds: 2,
    occupied: 0,
  },
  {
    id: "r7",
    block: "Block B",
    roomNo: "B203",
    type: "4-Person",
    totalBeds: 4,
    occupied: 3,
  },
  {
    id: "r8",
    block: "Block B",
    roomNo: "B204",
    type: "4-Person",
    totalBeds: 4,
    occupied: 4,
  },
  {
    id: "r9",
    block: "Block C",
    roomNo: "C301",
    type: "4-Person",
    totalBeds: 4,
    occupied: 2,
  },
  {
    id: "r10",
    block: "Block C",
    roomNo: "C302",
    type: "4-Person",
    totalBeds: 4,
    occupied: 1,
  },
  {
    id: "r11",
    block: "Block C",
    roomNo: "C303",
    type: "4-Person",
    totalBeds: 4,
    occupied: 4,
  },
  {
    id: "r12",
    block: "Block C",
    roomNo: "C304",
    type: "4-Person",
    totalBeds: 4,
    occupied: 3,
  },
];

const students = getLocalStudents();

const initialAllocations: Allocation[] = students.slice(0, 8).map((s, i) => ({
  id: `a${i + 1}`,
  studentName: s.name,
  matric: s.matricNumber,
  roomId: initialRooms[i].id,
  block: initialRooms[i].block,
  dateAllocated: `2024-09-${String(i + 1).padStart(2, "0")}`,
}));

const initialTransfers: TransferRequest[] = [
  {
    id: "t1",
    studentName: students[0]?.name ?? "Student 1",
    matric: students[0]?.matricNumber ?? "M001",
    currentRoom: "A101",
    requestedBlock: "Block B",
    reason: "Closer to faculty",
    status: "pending",
  },
  {
    id: "t2",
    studentName: students[1]?.name ?? "Student 2",
    matric: students[1]?.matricNumber ?? "M002",
    currentRoom: "B201",
    requestedBlock: "Block C",
    reason: "Financial constraints",
    status: "pending",
  },
  {
    id: "t3",
    studentName: students[2]?.name ?? "Student 3",
    matric: students[2]?.matricNumber ?? "M003",
    currentRoom: "C301",
    requestedBlock: "Block A",
    reason: "Medical proximity",
    status: "approved",
  },
  {
    id: "t4",
    studentName: students[3]?.name ?? "Student 4",
    matric: students[3]?.matricNumber ?? "M004",
    currentRoom: "B203",
    requestedBlock: "Block A",
    reason: "Friend accommodation",
    status: "denied",
  },
];

export function HostelRoomInventory() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [allocations, setAllocations] =
    useState<Allocation[]>(initialAllocations);
  const [transfers, setTransfers] =
    useState<TransferRequest[]>(initialTransfers);
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    block: "Block A",
    roomNo: "",
    type: "Single" as Room["type"],
  });
  const [allocateMatric, setAllocateMatric] = useState("");
  const [allocateRoomId, setAllocateRoomId] = useState("");

  const handleAddRoom = () => {
    if (!newRoom.roomNo) return;
    const beds =
      newRoom.type === "Single" ? 1 : newRoom.type === "Double" ? 2 : 4;
    setRooms((prev) => [
      ...prev,
      { id: `r${Date.now()}`, ...newRoom, totalBeds: beds, occupied: 0 },
    ]);
    setAddRoomOpen(false);
    setNewRoom({ block: "Block A", roomNo: "", type: "Single" });
  };

  const handleAllocate = () => {
    const student = students.find((s) => s.matricNumber === allocateMatric);
    const room = rooms.find((r) => r.id === allocateRoomId);
    if (!student || !room) return;
    setAllocations((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        studentName: student.name,
        matric: student.matricNumber,
        roomId: room.id,
        block: room.block,
        dateAllocated: new Date().toISOString().split("T")[0],
      },
    ]);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id ? { ...r, occupied: r.occupied + 1 } : r,
      ),
    );
    setAllocateOpen(false);
  };

  const handleTransferStatus = (id: string, status: "approved" | "denied") => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hostel Room Inventory
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage rooms, allocations, transfers, and fees
        </p>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory" data-ocid="hostel.inventory.tab">
            Room Inventory
          </TabsTrigger>
          <TabsTrigger value="allocations" data-ocid="hostel.allocations.tab">
            Bed Allocations
          </TabsTrigger>
          <TabsTrigger value="transfers" data-ocid="hostel.transfers.tab">
            Transfer Requests
          </TabsTrigger>
          <TabsTrigger value="fees" data-ocid="hostel.fees.tab">
            Hostel Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Room Inventory</CardTitle>
              <Button
                size="sm"
                onClick={() => setAddRoomOpen(true)}
                data-ocid="hostel.open_modal_button"
              >
                + Add Room
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead>Room No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Beds</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room, idx) => (
                    <TableRow
                      key={room.id}
                      data-ocid={`hostel.room.item.${idx + 1}`}
                    >
                      <TableCell>{room.block}</TableCell>
                      <TableCell className="font-mono">{room.roomNo}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{room.totalBeds}</TableCell>
                      <TableCell>{room.occupied}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {room.totalBeds - room.occupied}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            room.occupied >= room.totalBeds
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {room.occupied >= room.totalBeds
                            ? "Full"
                            : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setRooms((p) => p.filter((r) => r.id !== room.id))
                          }
                          data-ocid={`hostel.delete_button.${idx + 1}`}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bed Allocations</CardTitle>
              <Button
                size="sm"
                onClick={() => setAllocateOpen(true)}
                data-ocid="hostel.allocate.open_modal_button"
              >
                Allocate Room
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Date Allocated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((a, idx) => (
                    <TableRow
                      key={a.id}
                      data-ocid={`hostel.allocation.item.${idx + 1}`}
                    >
                      <TableCell>{a.studentName}</TableCell>
                      <TableCell className="font-mono">{a.matric}</TableCell>
                      <TableCell>
                        {rooms.find((r) => r.id === a.roomId)?.roomNo ?? "—"}
                      </TableCell>
                      <TableCell>{a.block}</TableCell>
                      <TableCell>{a.dateAllocated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric</TableHead>
                    <TableHead>Current Room</TableHead>
                    <TableHead>Requested Block</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t, idx) => (
                    <TableRow
                      key={t.id}
                      data-ocid={`hostel.transfer.item.${idx + 1}`}
                    >
                      <TableCell>{t.studentName}</TableCell>
                      <TableCell className="font-mono">{t.matric}</TableCell>
                      <TableCell>{t.currentRoom}</TableCell>
                      <TableCell>{t.requestedBlock}</TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {t.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            t.status === "approved"
                              ? "default"
                              : t.status === "denied"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        {t.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleTransferStatus(t.id, "approved")
                              }
                              data-ocid={`hostel.confirm_button.${idx + 1}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleTransferStatus(t.id, "denied")
                              }
                              data-ocid={`hostel.delete_button.${idx + 1}`}
                            >
                              Deny
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {feeSchedule.map((f) => (
              <Card key={f.block}>
                <CardContent className="pt-4">
                  <p className="font-semibold text-slate-700">{f.block}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    ₦{f.fee.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">{f.type} room / year</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((a, idx) => {
                    const feeEntry = feeSchedule.find(
                      (f) => f.block === a.block,
                    );
                    const paid = idx % 3 !== 0;
                    return (
                      <TableRow
                        key={a.id}
                        data-ocid={`hostel.fee.item.${idx + 1}`}
                      >
                        <TableCell>{a.studentName}</TableCell>
                        <TableCell className="font-mono">{a.matric}</TableCell>
                        <TableCell>{a.block}</TableCell>
                        <TableCell>
                          ₦{(feeEntry?.fee ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={paid ? "default" : "destructive"}>
                            {paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
        <DialogContent data-ocid="hostel.dialog">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Block</Label>
              <Select
                value={newRoom.block}
                onValueChange={(v) => setNewRoom((p) => ({ ...p, block: v }))}
              >
                <SelectTrigger data-ocid="hostel.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Block A">Block A</SelectItem>
                  <SelectItem value="Block B">Block B</SelectItem>
                  <SelectItem value="Block C">Block C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                value={newRoom.roomNo}
                onChange={(e) =>
                  setNewRoom((p) => ({ ...p, roomNo: e.target.value }))
                }
                placeholder="e.g. A105"
                data-ocid="hostel.input"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newRoom.type}
                onValueChange={(v) =>
                  setNewRoom((p) => ({ ...p, type: v as Room["type"] }))
                }
              >
                <SelectTrigger data-ocid="hostel.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="4-Person">4-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddRoomOpen(false)}
              data-ocid="hostel.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleAddRoom} data-ocid="hostel.confirm_button">
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent data-ocid="hostel.allocate.dialog">
          <DialogHeader>
            <DialogTitle>Allocate Room to Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Student Matric</Label>
              <Select value={allocateMatric} onValueChange={setAllocateMatric}>
                <SelectTrigger data-ocid="hostel.student.select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.matricNumber} value={s.matricNumber}>
                      {s.name} ({s.matricNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room</Label>
              <Select value={allocateRoomId} onValueChange={setAllocateRoomId}>
                <SelectTrigger data-ocid="hostel.room.select">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter((r) => r.occupied < r.totalBeds)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.roomNo} — {r.block} ({r.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAllocateOpen(false)}
              data-ocid="hostel.allocate.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAllocate}
              data-ocid="hostel.allocate.confirm_button"
            >
              Allocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
