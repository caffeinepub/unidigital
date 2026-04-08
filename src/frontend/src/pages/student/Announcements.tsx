import { useActor } from "@caffeineai/core-infrastructure";
import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createActor } from "../../backend";
import { Card, CardContent } from "../../components/ui/card";
import {
  type Announcement,
  getLocalAnnouncements,
} from "../../utils/sampleData";

const targetColors: Record<string, string> = {
  all: "bg-blue-100 text-blue-700",
  students: "bg-green-100 text-green-700",
  staff: "bg-purple-100 text-purple-700",
};

export function Announcements() {
  const { actor } = useActor(createActor);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!actor) {
      const all = getLocalAnnouncements();
      setAnnouncements(
        all.filter((a) => a.target === "all" || a.target === "students"),
      );
      return;
    }
    setLoading(true);
    (actor as any)
      .listActiveAnnouncements()
      .then((backendAnns) => {
        if (backendAnns.length > 0) {
          const mapped: Announcement[] = backendAnns
            .filter(
              (ba) =>
                ba.targetRoles.includes("all") ||
                ba.targetRoles.includes("students"),
            )
            .map((ba) => ({
              id: ba.id,
              title: ba.title,
              body: ba.body,
              target: ba.targetRoles.includes("students")
                ? "students"
                : ("all" as Announcement["target"]),
              date: new Date(Number(ba.createdAt)).toISOString().split("T")[0],
              author: ba.createdBy,
            }));
          setAnnouncements(mapped);
        } else {
          const all = getLocalAnnouncements();
          setAnnouncements(
            all.filter((a) => a.target === "all" || a.target === "students"),
          );
        }
      })
      .catch(() => {
        const all = getLocalAnnouncements();
        setAnnouncements(
          all.filter((a) => a.target === "all" || a.target === "students"),
        );
      })
      .finally(() => setLoading(false));
  }, [actor]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
        <p className="text-slate-500 text-sm">
          {announcements.length} announcements
        </p>
      </div>

      {loading && (
        <div
          className="flex items-center justify-center py-8"
          data-ocid="announcements.loading_state"
        >
          <Loader2 size={20} className="animate-spin text-blue-500 mr-2" />
          <span className="text-slate-500">Loading announcements...</span>
        </div>
      )}

      <div className="space-y-3" data-ocid="announcements.list">
        {!loading && announcements.length === 0 && (
          <Card data-ocid="announcements.empty_state">
            <CardContent className="p-8 text-center text-slate-400">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              No announcements at this time.
            </CardContent>
          </Card>
        )}
        {announcements.map((a, idx) => (
          <Card key={a.id} data-ocid={`announcements.item.${idx + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-800">{a.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    targetColors[a.target] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {a.target}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                By {a.author} &bull; {a.date}
              </p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {a.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
