import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500">
          <Inbox className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}
