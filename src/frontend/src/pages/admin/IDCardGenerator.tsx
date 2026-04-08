import {
  Camera,
  CreditCard,
  Download,
  Printer,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { getLocalStaff, getLocalStudents } from "../../utils/sampleData";

const INSTITUTION = "Federal University of Education, Kontagora";
const INSTITUTION_SHORT = "FUEK";
const EXPIRY_YEAR = new Date().getFullYear() + 2;

interface CardProfile {
  id: string;
  name: string;
  department: string;
  role: "student" | "staff";
  idNumber: string;
  photo?: string;
}

const LS_PHOTOS_KEY = "unidigital_id_photos";
function getPhotos(): Record<string, string> {
  try {
    const d = localStorage.getItem(LS_PHOTOS_KEY);
    return d ? (JSON.parse(d) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
function savePhotos(p: Record<string, string>) {
  localStorage.setItem(LS_PHOTOS_KEY, JSON.stringify(p));
}

function QRCode({ value, size = 56 }: { value: string; size?: number }) {
  const cells = 9;
  const cell = Math.floor(size / cells);
  const hash = Array.from(value).reduce((h, c) => h * 31 + c.charCodeAt(0), 0);
  const grid = Array.from({ length: cells * cells }, (_, i) => {
    const row = Math.floor(i / cells);
    const col = i % cells;
    const inFinder =
      (row < 3 && col < 3) ||
      (row < 3 && col > cells - 4) ||
      (row > cells - 4 && col < 3);
    if (inFinder) return true;
    return ((hash >> (i % 31)) & 1) === 1;
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cells}, ${cell}px)`,
        gap: 0,
        width: size,
        height: size,
      }}
    >
      {grid.map((filled, cellIdx) => (
        <div
          key={`q-${cellIdx}-${filled ? 1 : 0}`}
          style={{
            width: cell,
            height: cell,
            backgroundColor: filled ? "#000" : "#fff",
          }}
        />
      ))}
    </div>
  );
}

function IDCard({
  profile,
  photo,
}: {
  profile: CardProfile;
  photo?: string;
}) {
  const isStudent = profile.role === "student";
  const bgGradient = isStudent
    ? "linear-gradient(135deg, #1a3a6b 0%, #0f2447 100%)"
    : "linear-gradient(135deg, #1a5c3a 0%, #0d3c25 100%)";

  return (
    <div
      className="id-card-print"
      style={{
        width: "85.6mm",
        minWidth: "85.6mm",
        maxWidth: "85.6mm",
        height: "53.98mm",
        minHeight: "53.98mm",
        maxHeight: "53.98mm",
        background: bgGradient,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header strip */}
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#FFD700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: "bold",
            color: "#1a3a6b",
            flexShrink: 0,
          }}
        >
          {INSTITUTION_SHORT[0]}
        </div>
        <div>
          <div style={{ fontSize: 6, fontWeight: "bold", letterSpacing: 0.3 }}>
            {INSTITUTION}
          </div>
          <div style={{ fontSize: 5, opacity: 0.8 }}>
            {isStudent ? "STUDENT IDENTITY CARD" : "STAFF IDENTITY CARD"}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, padding: "6px 8px", gap: 8 }}>
        {/* Photo */}
        <div
          style={{
            width: 38,
            height: 42,
            borderRadius: 4,
            border: "2px solid rgba(255,255,255,0.4)",
            overflow: "hidden",
            flexShrink: 0,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt="Card holder"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 8, opacity: 0.5, textAlign: "center" }}>
              PHOTO
            </div>
          )}
        </div>

        {/* Info */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <div style={{ fontSize: 8, fontWeight: "bold", lineHeight: 1.2 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 6.5, opacity: 0.85 }}>
            {profile.department}
          </div>
          <div
            style={{
              fontSize: 7,
              fontWeight: "bold",
              color: "#FFD700",
              marginTop: 2,
            }}
          >
            {profile.idNumber}
          </div>
          <div
            style={{
              fontSize: 6,
              opacity: 0.7,
              marginTop: "auto",
            }}
          >
            Expires: {EXPIRY_YEAR}
          </div>
        </div>

        {/* QR */}
        <div
          style={{
            background: "#fff",
            padding: 2,
            borderRadius: 2,
            alignSelf: "center",
          }}
        >
          <QRCode value={profile.idNumber} size={40} />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          padding: "2px 8px",
          fontSize: 5.5,
          display: "flex",
          justifyContent: "space-between",
          opacity: 0.8,
        }}
      >
        <span>If found, return to {INSTITUTION_SHORT} Security Office</span>
        <span>{INSTITUTION_SHORT} MIS</span>
      </div>
    </div>
  );
}

function PhotoCapture({
  currentPhoto,
  onCapture,
}: {
  currentPhoto?: string;
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch {
      toast.error("Camera access denied or unavailable.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) {
        t.stop();
      }
    }
    setStreaming(false);
  }, []);

  const capturePhoto = () => {
    let c = 3;
    setCountdown(c);
    const interval = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c === 0) {
        clearInterval(interval);
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.7);
            onCapture(dataUrl);
            stopCamera();
          }
        }
      }
    }, 1000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="space-y-3">
      {streaming ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Webcam preview for photo capture"
            className="w-full rounded-lg border border-border"
            style={{ maxHeight: 220 }}
          />
          <canvas ref={canvasRef} className="hidden" />
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
              <span className="text-6xl font-bold text-white">{countdown}</span>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Button
              onClick={capturePhoto}
              className="flex-1"
              disabled={countdown > 0}
            >
              <Camera size={16} className="mr-2" /> Take Photo
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="preview"
              className="w-24 h-28 object-cover rounded border"
            />
          ) : (
            <div className="w-24 h-28 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
              No Photo
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={startCamera}>
              <Camera size={14} className="mr-1" /> Webcam
            </Button>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button size="sm" variant="outline" asChild>
                <span>
                  <Upload size={14} className="mr-1" /> Upload
                </span>
              </Button>
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function IDCardGenerator() {
  const students = getLocalStudents();
  const staff = getLocalStaff();

  const [photos, setPhotos] = useState<Record<string, string>>(getPhotos);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "staff">(
    "all",
  );
  const [deptFilter, setDeptFilter] = useState("all");
  const [photoDialog, setPhotoDialog] = useState<CardProfile | null>(null);
  const [tempPhoto, setTempPhoto] = useState<string | undefined>();
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set());

  const allProfiles: CardProfile[] = [
    ...students.map((s) => ({
      id: s.matricNumber,
      name: s.name,
      department: s.department,
      role: "student" as const,
      idNumber: s.matricNumber,
    })),
    ...staff.map((s) => ({
      id: s.staffId,
      name: s.name,
      department: s.department,
      role: "staff" as const,
      idNumber: s.staffId,
    })),
  ];

  const departments = [
    "all",
    ...Array.from(new Set(allProfiles.map((p) => p.department))).sort(),
  ];

  const filtered = allProfiles.filter((p) => {
    const matchRole = roleFilter === "all" || p.role === roleFilter;
    const matchDept = deptFilter === "all" || p.department === deptFilter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.idNumber.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchDept && matchSearch;
  });

  const openPhotoDialog = (profile: CardProfile) => {
    setPhotoDialog(profile);
    setTempPhoto(photos[profile.id]);
  };

  const savePhoto = () => {
    if (!photoDialog) return;
    const updated = { ...photos, [photoDialog.id]: tempPhoto ?? "" };
    setPhotos(updated);
    savePhotos(updated);
    setPhotoDialog(null);
    toast.success("Photo saved.");
  };

  const toggleBatch = (id: string) => {
    setBatchSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setBatchSelected(new Set(filtered.map((p) => p.id)));
  };
  const clearAll = () => setBatchSelected(new Set());

  const printBatch = () => {
    window.print();
  };

  const printSingle = (profile: CardProfile) => {
    setBatchSelected(new Set([profile.id]));
    setTimeout(() => window.print(), 100);
  };

  const batchProfiles = allProfiles.filter((p) => batchSelected.has(p.id));

  return (
    <div className="space-y-6" data-ocid="id_card.root">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #id-card-print-area, #id-card-print-area * { visibility: visible !important; }
          #id-card-print-area {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; flex-wrap: wrap; gap: 8mm;
            padding: 10mm; background: white;
          }
          .id-card-print { page-break-inside: avoid; }
        }
      `}</style>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard size={22} /> ID Card Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate printable CR80 ID cards for staff and students
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={selectAll}
            data-ocid="id_card.select_all"
          >
            <Users size={14} className="mr-1" /> Select All ({filtered.length})
          </Button>
          {batchSelected.size > 0 && (
            <Button onClick={printBatch} data-ocid="id_card.print_batch">
              <Printer size={14} className="mr-2" /> Print {batchSelected.size}{" "}
              Card{batchSelected.size !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Card List</TabsTrigger>
          <TabsTrigger value="preview">
            Batch Preview ({batchSelected.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="pl-8"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-ocid="id_card.search_input"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="id_card.role_filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger
                    className="w-48"
                    data-ocid="id_card.dept_filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === "all" ? "All Departments" : d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {batchSelected.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    data-ocid="id_card.clear_selection"
                  >
                    <X size={14} className="mr-1" /> Clear Selection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((profile) => (
              <Card
                key={profile.id}
                className={`cursor-pointer transition-all ${batchSelected.has(profile.id) ? "ring-2 ring-primary" : ""}`}
                data-ocid={`id_card.profile.${profile.id}`}
                onClick={() => toggleBatch(profile.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail Card */}
                    <div
                      style={{
                        transform: "scale(0.55)",
                        transformOrigin: "top left",
                        width: 47,
                        height: 30,
                        flexShrink: 0,
                      }}
                    >
                      <IDCard profile={profile} photo={photos[profile.id]} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-medium text-sm text-foreground truncate">
                        {profile.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.department}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {profile.idNumber}
                      </p>
                      <Badge
                        variant={
                          profile.role === "student" ? "default" : "secondary"
                        }
                        className="text-[10px] mt-1"
                      >
                        {profile.role}
                      </Badge>
                    </div>
                    <div
                      className="flex flex-col gap-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPhotoDialog(profile)}
                        data-ocid={`id_card.photo_button.${profile.id}`}
                      >
                        <Camera size={12} className="mr-1" />
                        {photos[profile.id] ? "Change" : "Photo"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printSingle(profile)}
                        data-ocid={`id_card.print_single.${profile.id}`}
                      >
                        <Printer size={12} className="mr-1" /> Print
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div
                className="col-span-full text-center py-12 text-muted-foreground"
                data-ocid="id_card.empty_state"
              >
                No results found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {batchProfiles.length === 0 ? (
            <Card>
              <CardContent
                className="py-12 text-center text-muted-foreground"
                data-ocid="id_card.batch_empty"
              >
                No cards selected. Go to Card List and select users to preview.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {batchProfiles.length} card
                  {batchProfiles.length !== 1 ? "s" : ""} selected for printing
                </p>
                <Button onClick={printBatch} data-ocid="id_card.print_all">
                  <Printer size={14} className="mr-2" /> Print All
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
                {batchProfiles.map((profile) => (
                  <IDCard
                    key={profile.id}
                    profile={profile}
                    photo={photos[profile.id]}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Hidden print area */}
      <div id="id-card-print-area" className="hidden print:flex">
        {batchProfiles.map((profile) => (
          <IDCard
            key={profile.id}
            profile={profile}
            photo={photos[profile.id]}
          />
        ))}
      </div>

      {/* Photo Dialog */}
      <Dialog
        open={!!photoDialog}
        onOpenChange={(open) => {
          if (!open) setPhotoDialog(null);
        }}
      >
        <DialogContent className="max-w-md" data-ocid="id_card.photo_dialog">
          <DialogHeader>
            <DialogTitle>Update Photo — {photoDialog?.name}</DialogTitle>
          </DialogHeader>
          <PhotoCapture currentPhoto={tempPhoto} onCapture={setTempPhoto} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialog(null)}>
              Cancel
            </Button>
            <Button onClick={savePhoto} data-ocid="id_card.save_photo">
              <Download size={14} className="mr-2" /> Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
