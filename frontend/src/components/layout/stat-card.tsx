import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{hint}</p>
          </div>
          <div className="rounded-lg bg-sky-50 p-2 text-sky-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
