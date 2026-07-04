"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { createEmployee } from "@/lib/hrms-data";

export function AddEmployeeDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: apiError } = await createEmployee(form);

    if (apiError) {
      setError(apiError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add employee</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <Input
              value={form.fullName}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  fullName: e.target.value,
                }))
              }
              placeholder="Jordan Lee"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((current) => ({ ...current, email: e.target.value }))
              }
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              value={form.password}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  password: e.target.value,
                }))
              }
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
