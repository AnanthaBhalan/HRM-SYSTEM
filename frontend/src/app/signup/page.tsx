"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, loading, authError, user, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(profile?.role === "admin_hr" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [loading, profile?.role, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const ok = await signUp(email, password, fullName);
    if (!ok) {
      setError(authError ?? "We could not create your account right now.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Create account</CardTitle>
          <p className="text-sm text-slate-500">Set up access for your organization.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jordan Lee" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button className="w-full" disabled={submitting || loading}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already registered? <Link className="font-medium text-sky-600" href="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
