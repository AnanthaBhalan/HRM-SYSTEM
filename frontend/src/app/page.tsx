import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">HRMS</p>
              <p className="text-sm text-slate-500">Minimal corporate operations dashboard</p>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">A clean frontend foundation for your HR platform.</h1>
          <p className="mt-3 text-slate-600">
            Built with Next.js, Tailwind, shadcn-style components, and a role-aware shell for employee and admin flows.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants({ variant: "default" })}>Go to login</Link>
            <Link href="/employee/dashboard" className={buttonVariants({ variant: "outline" })}>Preview employee flow</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
