import {
  Bed,
  ChevronDown,
  ChevronRight,
  Printer,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getLocalStudents } from "../../utils/sampleData";

interface BedOccupant {
  studentMatric: string;
  studentName: string;
}

interface RoomData {
  id: string;
  roomNumber: string;
  block: string;
  capacity: number;
  beds: (BedOccupant | null)[];
}

const BLOCKS = ["Block A", "Block B", "Block C"];
const ROOMS_PER_BLOCK = 10;
const BEDS_PER_ROOM = 4;

function buildInitialRooms(): RoomData[] {
  const stored = localStorage.getItem("unidigital_hostel_matrix");
  if (stored) return JSON.parse(stored);

  const rooms: RoomData[] = [];
  for (const block of BLOCKS) {
    const prefix = block.split(" ")[1];
    for (let i = 101; i <= 100 + ROOMS_PER_BLOCK; i++) {
      rooms.push({
        id: `${prefix}-${i}`,
        roomNumber: `${prefix}-${i}`,
        block,
        capacity: BEDS_PER_ROOM,
        beds: [null, null, null, null],
      });
    }
  }

  // Seed some occupied beds from hostel apps
  const hostelApps = JSON.parse(
    localStorage.getItem("unidigital_hostel_apps") || "[]",
  );
  for (const app of hostelApps) {
    if (app.status === "approved" && app.roomNumber) {
      const room = rooms.find((r) => r.roomNumber === app.roomNumber);
      if (room) {
        const emptyBed = room.beds.findIndex((b) => b === null);
        if (emptyBed !== -1) {
          room.beds[emptyBed] = {
            studentMatric: app.studentMatric,
            studentName: app.studentName,
          };
        }
      }
    }
  }
  localStorage.setItem("unidigital_hostel_matrix", JSON.stringify(rooms));
  return rooms;
}

function saveRooms(rooms: RoomData[]) {
  localStorage.setItem("unidigital_hostel_matrix", JSON.stringify(rooms));
}

export function HostelAllocationMatrix() {
  const [rooms, setRooms] = useState<RoomData[]>(buildInitialRooms);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [blockFilter, setBlockFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignDialog, setAssignDialog] = useState<{
    roomId: string;
    bedIndex: number;
  } | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const allStudents = getLocalStudents();

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const blockMatch = blockFilter === "All" || r.block === blockFilter;
      const searchMatch =
        !searchTerm ||
        r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.beds.some(
          (b) =>
            b?.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b?.studentMatric.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return blockMatch && searchMatch;
    });
  }, [rooms, blockFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalBeds = rooms.length * BEDS_PER_ROOM;
    const occupiedBeds = rooms.reduce(
      (sum, r) => sum + r.beds.filter((b) => b !== null).length,
      0,
    );
    return { totalBeds, occupiedBeds, vacantBeds: totalBeds - occupiedBeds };
  }, [rooms]);

  const occupancyPct = Math.round((stats.occupiedBeds / stats.totalBeds) * 100);

  const handleAssign = (roomId: string, bedIndex: number) => {
    setAssignDialog({ roomId, bedIndex });
    setStudentSearch("");
  };

  const handleRemove = (roomId: string, bedIndex: number) => {
    const updated = rooms.map((r) => {
      if (r.id !== roomId) return r;
      const beds = [...r.beds];
      beds[bedIndex] = null;
      return { ...r, beds };
    });
    setRooms(updated);
    saveRooms(updated);
    toast.success("Occupant removed");
  };

  const confirmAssign = (student: { matricNumber: string; name: string }) => {
    if (!assignDialog) return;
    const { roomId, bedIndex } = assignDialog;
    // Check student not already assigned
    const alreadyAssigned = rooms.some((r) =>
      r.beds.some((b) => b?.studentMatric === student.matricNumber),
    );
    if (alreadyAssigned) {
      toast.error("This student is already assigned to a bed");
      return;
    }
    const updated = rooms.map((r) => {
      if (r.id !== roomId) return r;
      const beds = [...r.beds];
      beds[bedIndex] = {
        studentMatric: student.matricNumber,
        studentName: student.name,
      };
      return { ...r, beds };
    });
    setRooms(updated);
    saveRooms(updated);
    setAssignDialog(null);
    toast.success(`${student.name} assigned to bed ${bedIndex + 1}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const searchedStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const roomsByBlock = (block: string) =>
    filteredRooms.filter((r) => r.block === block);

  const bedStatusClass = (bed: BedOccupant | null) => {
    if (bed) return "bg-green-100 text-green-800 border border-green-300";
    return "bg-muted text-muted-foreground border border-border";
  };

  return (
    <div className="space-y-6 print:p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bed size={22} className="text-primary" />
            Hostel Allocation Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Room and bed-space management across all blocks
          </p>
        </div>
        <Button
          variant="outline"
          className="print:hidden"
          onClick={handlePrint}
          data-ocid="hostel-matrix.print_button"
        >
          <Printer size={14} className="mr-2" />
          Print / Export
        </Button>
      </div>

      {/* Utilization Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalBeds}
                </p>
                <p className="text-xs text-muted-foreground">Total Beds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.occupiedBeds}
                </p>
                <p className="text-xs text-muted-foreground">Occupied</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {stats.vacantBeds}
                </p>
                <p className="text-xs text-muted-foreground">Vacant</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {occupancyPct}% Occupied
              </p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              Occupied
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-muted border border-border inline-block" />
              Vacant
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-8"
            placeholder="Search room or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-ocid="hostel-matrix.search_input"
          />
        </div>
        <div className="flex gap-2">
          {["All", ...BLOCKS].map((b) => (
            <Button
              key={b}
              size="sm"
              variant={blockFilter === b ? "default" : "outline"}
              onClick={() => setBlockFilter(b)}
              data-ocid={`hostel-matrix.block_filter.${b.replace(" ", "-")}`}
            >
              {b}
            </Button>
          ))}
        </div>
      </div>

      {/* Room Table by Block */}
      {(blockFilter === "All" ? BLOCKS : [blockFilter]).map((block) => {
        const blockRooms = roomsByBlock(block);
        if (blockRooms.length === 0) return null;
        const blockOccupied = blockRooms.reduce(
          (s, r) => s + r.beds.filter((b) => b !== null).length,
          0,
        );
        const blockTotal = blockRooms.length * BEDS_PER_ROOM;

        return (
          <Card key={block}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>
                  {block}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({blockRooms.length} rooms)
                  </span>
                </span>
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  {blockOccupied}/{blockTotal} beds occupied
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                data-ocid={`hostel-matrix.table.${block.replace(" ", "-")}`}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Room</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="text-center">Occupied</TableHead>
                    <TableHead className="text-center">Vacant</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockRooms.map((room) => {
                    const occupied = room.beds.filter((b) => b !== null).length;
                    const vacant = room.capacity - occupied;
                    const isExpanded = expandedRows.has(room.id);

                    return (
                      <>
                        <TableRow
                          key={room.id}
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => toggleRow(room.id)}
                          data-ocid={`hostel-matrix.row.${room.id}`}
                        >
                          <TableCell className="w-8">
                            {isExpanded ? (
                              <ChevronDown
                                size={14}
                                className="text-muted-foreground"
                              />
                            ) : (
                              <ChevronRight
                                size={14}
                                className="text-muted-foreground"
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {room.roomNumber}
                          </TableCell>
                          <TableCell className="text-sm">
                            {room.block}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {room.capacity}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {occupied}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-amber-600 font-semibold text-sm">
                              {vacant}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 text-xs ${
                                occupied === 0
                                  ? "bg-muted text-muted-foreground"
                                  : occupied === room.capacity
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {occupied === 0
                                ? "Vacant"
                                : occupied === room.capacity
                                  ? "Full"
                                  : "Partial"}
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`${room.id}-expand`}>
                            <TableCell colSpan={7} className="bg-muted/20 p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {room.beds.map((bed, bedIdx) => (
                                  <div
                                    key={`bed-${room.id}-${bedIdx}`}
                                    className={`rounded-lg p-3 text-xs ${bedStatusClass(bed)}`}
                                    data-ocid={`hostel-matrix.bed.${room.id}.${bedIdx + 1}`}
                                  >
                                    <p className="font-semibold mb-1">
                                      Bed {bedIdx + 1}
                                    </p>
                                    {bed ? (
                                      <>
                                        <p className="font-medium truncate">
                                          {bed.studentName}
                                        </p>
                                        <p className="text-green-700 truncate">
                                          {bed.studentMatric}
                                        </p>
                                        <button
                                          type="button"
                                          className="mt-2 text-red-600 hover:text-red-800 flex items-center gap-1 print:hidden"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(room.id, bedIdx);
                                          }}
                                          data-ocid={`hostel-matrix.remove_bed.${room.id}.${bedIdx + 1}`}
                                        >
                                          <X size={10} /> Remove
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-muted-foreground">
                                          Vacant
                                        </p>
                                        <button
                                          type="button"
                                          className="mt-2 text-primary hover:text-primary/80 flex items-center gap-1 print:hidden"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAssign(room.id, bedIdx);
                                          }}
                                          data-ocid={`hostel-matrix.assign_bed.${room.id}.${bedIdx + 1}`}
                                        >
                                          <UserPlus size={10} /> Assign
                                        </button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* Assign Student Dialog */}
      <Dialog
        open={!!assignDialog}
        onOpenChange={(o) => !o && setAssignDialog(null)}
      >
        <DialogContent data-ocid="hostel-matrix.assign_dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={18} />
              Assign Student to Bed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {assignDialog && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                Room:{" "}
                <strong>
                  {rooms.find((r) => r.id === assignDialog.roomId)?.roomNumber}
                </strong>{" "}
                — Bed <strong>{assignDialog.bedIndex + 1}</strong>
              </p>
            )}
            <div>
              <Label>Search Student</Label>
              <div className="relative mt-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  className="pl-8"
                  placeholder="Name or matric number..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  autoFocus
                  data-ocid="hostel-matrix.student_search_input"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {searchedStudents.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No students found
                </p>
              ) : (
                searchedStudents.map((s) => {
                  const alreadyAssigned = rooms.some((r) =>
                    r.beds.some((b) => b?.studentMatric === s.matricNumber),
                  );
                  return (
                    <button
                      type="button"
                      key={s.matricNumber}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        alreadyAssigned ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() =>
                        !alreadyAssigned &&
                        confirmAssign({
                          matricNumber: s.matricNumber,
                          name: s.name,
                        })
                      }
                      disabled={alreadyAssigned}
                      data-ocid={`hostel-matrix.student_option.${s.matricNumber}`}
                    >
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {s.matricNumber} · {s.department}
                        </p>
                      </div>
                      {alreadyAssigned && (
                        <Badge className="bg-muted text-muted-foreground border-0 text-xs">
                          Assigned
                        </Badge>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog(null)}
              data-ocid="hostel-matrix.cancel_assign_button"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
