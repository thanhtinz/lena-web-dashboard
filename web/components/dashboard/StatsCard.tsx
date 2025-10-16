import { ReactNode } from "react";

export default function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{title}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      {trend && (
        <div className="text-xs text-muted-foreground">{trend}</div>
      )}
    </div>
  );
}
