import {
  BookOpen,
  Building2,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">UniDigital</h1>
          <p className="text-slate-300 mt-2">
            Fully Paperless University Management System
          </p>
        </div>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: <GraduationCap size={20} />, label: "Students" },
                { icon: <Users size={20} />, label: "Lecturers" },
                { icon: <BookOpen size={20} />, label: "Courses" },
                { icon: <Shield size={20} />, label: "Secure" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-slate-200 text-sm"
                >
                  <span className="text-blue-400">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
            <Button
              onClick={onLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-semibold"
              size="lg"
            >
              Sign In with Internet Identity
            </Button>
            <p className="text-center text-slate-400 text-xs mt-4">
              Secure, decentralized authentication on the Internet Computer
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-6">
          Academic Year 2023/2024 &bull; All rights reserved
        </p>
      </div>
    </div>
  );
}
