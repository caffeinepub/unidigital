import { Bell, Check, CheckCheck } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { DEMO_ANNOUNCEMENTS, type DLAnnouncement } from "./DLTypes";

export function DLNotifications() {
  const [announcements, setAnnouncements] =
    useState<DLAnnouncement[]>(DEMO_ANNOUNCEMENTS);

  const unread = announcements.filter((a) => !a.read).length;

  const markRead = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  };

  const markAllRead = () => {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const priorityStyles: Record<DLAnnouncement["priority"], string> = {
    urgent: "border-red-300 bg-red-50/60",
    normal: "border-border bg-card",
    info: "border-blue-200 bg-blue-50/40",
  };

  const priorityBadge: Record<DLAnnouncement["priority"], ReactElement> = {
    urgent: (
      <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">
        URGENT
      </Badge>
    ),
    normal: (
      <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">
        Notice
      </Badge>
    ),
    info: (
      <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">
        Info
      </Badge>
    ),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Announcements &amp; Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Distance Learning Centre — FUEK
            </p>
          </div>
          {unread > 0 && (
            <Badge className="bg-red-500 text-white border-0 font-bold">
              {unread} Unread
            </Badge>
          )}
        </div>
        {unread > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            className="gap-1.5 text-xs"
            data-ocid="dl.notifications.mark_all_read"
          >
            <CheckCheck size={13} /> Mark All Read
          </Button>
        )}
      </div>

      {announcements.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Bell size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No announcements yet</p>
            <p className="text-sm">
              Check back later for updates from the DL Coordinator.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.map((ann) => (
          <Card
            key={ann.id}
            className={`border transition-all ${priorityStyles[ann.priority]} ${!ann.read ? "shadow-sm" : "opacity-75"}`}
            data-ocid={`dl.notification.${ann.id}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {!ann.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {ann.title}
                  </CardTitle>
                  {priorityBadge[ann.priority]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(ann.date).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {!ann.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs h-6 px-2"
                      onClick={() => markRead(ann.id)}
                      data-ocid={`dl.notification.read.${ann.id}`}
                    >
                      <Check size={11} /> Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ann.body}
              </p>
              <p className="text-xs font-semibold text-muted-foreground/60 mt-2">
                From: Distance Learning Coordinator, FUEK
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
