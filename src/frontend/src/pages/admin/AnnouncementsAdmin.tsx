import { Loader2, Megaphone, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
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
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { useActor } from "../../hooks/useActor";
import {
  type Announcement,
  getLocalAnnouncements,
  saveLocalAnnouncements,
} from "../../utils/sampleData";

const targetColors: Record<string, string> = {
  all: "bg-blue-100 text-blue-700",
  students: "bg-green-100 text-green-700",
  staff: "bg-purple-100 text-purple-700",
};

type LocalAnnouncement = Announcement & { isActive?: boolean };

export function AnnouncementsAdmin() {
  const { actor } = useActor();
  const [announcements, setAnnouncements] = useState<LocalAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editAnn, setEditAnn] = useState<LocalAnnouncement | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    target: "all" as Announcement["target"],
  });

  // Load from backend first, fallback to local
  useEffect(() => {
    if (!actor) {
      setAnnouncements(getLocalAnnouncements());
      return;
    }
    setLoading(true);
    (actor as any)
      .listAllAnnouncements()
      .then((backendAnns) => {
        if (backendAnns.length > 0) {
          const mapped: LocalAnnouncement[] = backendAnns.map((ba) => ({
            id: ba.id,
            title: ba.title,
            body: ba.body,
            target: ba.targetRoles.includes("students")
              ? "students"
              : ba.targetRoles.includes("staff")
                ? "staff"
                : ("all" as Announcement["target"]),
            date: new Date(Number(ba.createdAt)).toISOString().split("T")[0],
            author: ba.createdBy,
            isActive: ba.isActive,
          }));
          setAnnouncements(mapped);
        } else {
          setAnnouncements(getLocalAnnouncements());
        }
      })
      .catch(() => {
        setAnnouncements(getLocalAnnouncements());
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const openCreate = () => {
    setEditAnn(null);
    setForm({ title: "", body: "", target: "all" });
    setDialog(true);
  };

  const openEdit = (ann: LocalAnnouncement) => {
    setEditAnn(ann);
    setForm({ title: ann.title, body: ann.body, target: ann.target });
    setDialog(true);
  };

  const save = async () => {
    const now = BigInt(Date.now());
    const oneYear = BigInt(365 * 24 * 60 * 60 * 1000);
    try {
      if (actor) {
        if (editAnn) {
          await (actor as any).updateAnnouncement(editAnn.id, {
            id: editAnn.id,
            title: form.title,
            body: form.body,
            targetRoles:
              form.target === "all"
                ? ["all"]
                : form.target === "students"
                  ? ["students"]
                  : ["staff"],
            priority: "normal",
            createdBy: "Administrator",
            createdAt: now,
            expiresAt: now + oneYear,
            isActive: true,
          });
          const updatedList = announcements.map((a) =>
            a.id === editAnn.id
              ? {
                  ...a,
                  title: form.title,
                  body: form.body,
                  target: form.target,
                }
              : a,
          );
          setAnnouncements(updatedList);
          saveLocalAnnouncements(updatedList);
        } else {
          const id = await (actor as any).createAnnouncement({
            id: `ANN${Date.now()}`,
            title: form.title,
            body: form.body,
            targetRoles:
              form.target === "all"
                ? ["all"]
                : form.target === "students"
                  ? ["students"]
                  : ["staff"],
            priority: "normal",
            createdBy: "Administrator",
            createdAt: now,
            expiresAt: now + oneYear,
            isActive: true,
          });
          const entry: LocalAnnouncement = {
            id,
            title: form.title,
            body: form.body,
            target: form.target,
            date: new Date().toISOString().split("T")[0],
            author: "Administrator",
            isActive: true,
          };
          const updated = [entry, ...announcements];
          setAnnouncements(updated);
          saveLocalAnnouncements(updated);
        }
      } else {
        // Fallback to local
        if (editAnn) {
          const updatedList = announcements.map((a) =>
            a.id === editAnn.id
              ? {
                  ...a,
                  title: form.title,
                  body: form.body,
                  target: form.target,
                }
              : a,
          );
          setAnnouncements(updatedList);
          saveLocalAnnouncements(updatedList);
        } else {
          const entry: LocalAnnouncement = {
            id: `ANN${Date.now()}`,
            title: form.title,
            body: form.body,
            target: form.target,
            date: new Date().toISOString().split("T")[0],
            author: "Administrator",
            isActive: true,
          };
          const updated = [entry, ...announcements];
          setAnnouncements(updated);
          saveLocalAnnouncements(updated);
        }
      }
      toast.success(
        editAnn ? "Announcement updated" : "Announcement published",
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to save announcement");
    }
    setDialog(false);
    setForm({ title: "", body: "", target: "all" });
    setEditAnn(null);
  };

  const del = async (id: string) => {
    try {
      if (actor) {
        await (actor as any).deleteAnnouncement(id);
      }
    } catch (err) {
      console.warn("Backend delete failed:", err);
    }
    const updated = announcements.filter((a) => a.id !== id);
    saveLocalAnnouncements(updated);
    setAnnouncements(updated);
    toast.success("Announcement removed");
  };

  const toggleActive = async (ann: LocalAnnouncement) => {
    const newActive = !ann.isActive;
    const updated = announcements.map((a) =>
      a.id === ann.id ? { ...a, isActive: newActive } : a,
    );
    setAnnouncements(updated);
    saveLocalAnnouncements(updated);
    if (actor) {
      try {
        const now = BigInt(Date.now());
        const oneYear = BigInt(365 * 24 * 60 * 60 * 1000);
        await (actor as any).updateAnnouncement(ann.id, {
          id: ann.id,
          title: ann.title,
          body: ann.body,
          targetRoles:
            ann.target === "all"
              ? ["all"]
              : ann.target === "students"
                ? ["students"]
                : ["staff"],
          priority: "normal",
          createdBy: ann.author,
          createdAt: now,
          expiresAt: now + oneYear,
          isActive: newActive,
        });
      } catch (err) {
        console.warn("Backend toggle failed:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-slate-500 text-sm">
            {announcements.length} published announcements
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700"
          data-ocid="announcements-admin.primary_button"
        >
          <PlusCircle size={16} className="mr-2" /> New Announcement
        </Button>
      </div>

      {loading && (
        <div
          className="flex items-center justify-center py-8"
          data-ocid="announcements-admin.loading_state"
        >
          <Loader2 size={20} className="animate-spin text-blue-500 mr-2" />
          <span className="text-slate-500">Loading announcements...</span>
        </div>
      )}

      <div className="space-y-3" data-ocid="announcements-admin.list">
        {!loading && announcements.length === 0 && (
          <Card data-ocid="announcements-admin.empty_state">
            <CardContent className="p-8 text-center text-slate-400">
              <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
              No announcements yet.
            </CardContent>
          </Card>
        )}
        {announcements.map((a, idx) => (
          <Card
            key={a.id}
            data-ocid={`announcements-admin.item.${idx + 1}`}
            className={a.isActive === false ? "opacity-60" : ""}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">{a.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        targetColors[a.target] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.target}
                    </span>
                    {a.isActive === false && (
                      <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    By {a.author} &bull; {a.date}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {a.body}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch
                    checked={a.isActive !== false}
                    onCheckedChange={() => toggleActive(a)}
                    data-ocid={`announcements-admin.toggle.${idx + 1}`}
                    title={a.isActive !== false ? "Deactivate" : "Activate"}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(a)}
                    data-ocid={`announcements-admin.edit_button.${idx + 1}`}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => del(a.id)}
                    data-ocid={`announcements-admin.delete_button.${idx + 1}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="announcements-admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editAnn ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="announcements-admin.input"
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Select
                value={form.target}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    target: v as Announcement["target"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                className="mt-1"
                rows={5}
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                data-ocid="announcements-admin.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="announcements-admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="announcements-admin.submit_button"
            >
              {editAnn ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
