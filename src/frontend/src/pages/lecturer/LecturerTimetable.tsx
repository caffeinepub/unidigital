import { Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { getLocalTimetable } from "../../utils/sampleData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SEMESTER = "2023/2024 First";

const dayColors: Record<string, string> = {
  Monday: "bg-blue-100 text-blue-700",
  Tuesday: "bg-purple-100 text-purple-700",
  Wednesday: "bg-green-100 text-green-700",
  Thursday: "bg-amber-100 text-amber-700",
  Friday: "bg-rose-100 text-rose-700",
};

interface Props {
  lecturerId: string;
}

export function LecturerTimetable({ lecturerId }: Props) {
  const [timetable] = useState(getLocalTimetable());

  const mySlots = timetable.filter(
    (s) => s.lecturerId === lecturerId && s.semester === SEMESTER,
  );

  const slotsByDay: Record<string, typeof mySlots> = {};
  for (const day of DAYS) {
    slotsByDay[day] = mySlots
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">My Timetable</h1>
        <Badge className="bg-blue-100 text-blue-700 border-0">{SEMESTER}</Badge>
      </div>

      {mySlots.length === 0 && (
        <Card>
          <CardContent
            className="p-8 text-center text-slate-400"
            data-ocid="timetable.empty_state"
          >
            No timetable slots assigned to you yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {DAYS.map((day) => (
          <Card key={day}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slotsByDay[day].length === 0 ? (
                <p className="text-xs text-slate-400">No classes</p>
              ) : (
                <div className="space-y-2">
                  {slotsByDay[day].map((slot, i) => (
                    <div
                      key={slot.id}
                      className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex items-start justify-between"
                      data-ocid={`timetable.item.${i + 1}`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-slate-800">
                          {slot.courseTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {slot.courseCode}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {slot.startTime} –{" "}
                            {slot.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {slot.venue}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={`${dayColors[day]} border-0 text-xs flex-shrink-0`}
                      >
                        {day}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
