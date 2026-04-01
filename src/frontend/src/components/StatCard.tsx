import { cn } from "../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  sub?: string;
}

const colorMap = {
  blue: "border-blue-500 bg-blue-50 text-blue-600",
  green: "border-green-500 bg-green-50 text-green-600",
  amber: "border-amber-500 bg-amber-50 text-amber-600",
  red: "border-red-500 bg-red-50 text-red-600",
  purple: "border-purple-500 bg-purple-50 text-purple-600",
};

export function StatCard({
  title,
  value,
  icon,
  color = "blue",
  sub,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-5 border border-slate-200 border-l-4 flex items-center gap-4",
        `border-l-${color}-500`,
      )}
      style={{
        borderLeftColor:
          color === "blue"
            ? "#3b82f6"
            : color === "green"
              ? "#22c55e"
              : color === "amber"
                ? "#f59e0b"
                : color === "red"
                  ? "#ef4444"
                  : "#a855f7",
      }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          colorMap[color],
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{title}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
