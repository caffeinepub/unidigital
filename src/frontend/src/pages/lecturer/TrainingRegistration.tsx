import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Program {
  id: string;
  title: string;
  date: string;
  venue: string;
  maxParticipants: number;
  available: number;
}

const programs: Program[] = [
  {
    id: "tp1",
    title: "Academic Writing & Research Methods",
    date: "2024-11-15",
    venue: "Conference Room A",
    maxParticipants: 30,
    available: 28,
  },
  {
    id: "tp2",
    title: "Digital Pedagogy & e-Learning",
    date: "2024-12-05",
    venue: "ICT Lab 1",
    maxParticipants: 20,
    available: 19,
  },
  {
    id: "tp3",
    title: "Leadership & Management Skills",
    date: "2025-01-20",
    venue: "Main Hall",
    maxParticipants: 50,
    available: 50,
  },
];

export function TrainingRegistration() {
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const [completed, _setCompleted] = useState<Set<string>>(new Set(["tp1"]));

  const toggle = (id: string) => {
    setRegistered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Training & Development
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Register for available training programs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {programs.map((prog, idx) => {
          const isReg = registered.has(prog.id);
          const isDone = completed.has(prog.id);
          return (
            <Card key={prog.id} data-ocid={`training.item.${idx + 1}`}>
              <CardHeader>
                <CardTitle className="text-base">{prog.title}</CardTitle>
                <Badge
                  variant={isDone ? "default" : isReg ? "secondary" : "outline"}
                >
                  {isDone ? "Completed" : isReg ? "Registered" : "Open"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-500">📅 {prog.date}</p>
                <p className="text-sm text-slate-500">📍 {prog.venue}</p>
                <p className="text-sm">
                  Slots: {prog.available} / {prog.maxParticipants}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {!isDone && (
                    <Button
                      size="sm"
                      variant={isReg ? "destructive" : "default"}
                      onClick={() => toggle(prog.id)}
                      data-ocid={`training.toggle.${idx + 1}`}
                    >
                      {isReg ? "Unregister" : "Register"}
                    </Button>
                  )}
                  {isDone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert("Certificate download coming soon!")}
                      data-ocid={`training.cert_button.${idx + 1}`}
                    >
                      Download Certificate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
