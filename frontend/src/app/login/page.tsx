"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, profile, user, loading: authLoading, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(profile?.role === "admin_hr" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [authLoading, profile?.role, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const ok = await signIn(email, password);
    if (!ok) {
      setError(authError ?? "Unable to sign in. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>HRMS Sign in</CardTitle>
          <p className="text-sm text-slate-500">Access your employee or admin workspace.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button className="w-full" disabled={loading || authLoading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            New here? <Link className="font-medium text-sky-600" href="/signup">Create account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
