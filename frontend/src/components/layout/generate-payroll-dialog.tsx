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
import { createPayrollRecord } from "@/lib/hrms-data";

export function GeneratePayrollDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    payPeriodStart: "",
    payPeriodEnd: "",
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: apiError } = await createPayrollRecord(form);

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
        <Button>Generate payroll</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate new payroll record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee ID</label>
            <Input
              value={form.employeeId}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  employeeId: e.target.value,
                }))
              }
              placeholder="Employee ID"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pay period start</label>
            <Input
              type="date"
              value={form.payPeriodStart}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  payPeriodStart: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pay period end</label>
            <Input
              type="date"
              value={form.payPeriodEnd}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  payPeriodEnd: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Basic salary</label>
            <Input
              type="number"
              value={form.basicSalary}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  basicSalary: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Allowances</label>
            <Input
              type="number"
              value={form.allowances}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  allowances: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deductions</label>
            <Input
              type="number"
              value={form.deductions}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  deductions: Number(e.target.value),
                }))
              }
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" disabled={submitting}>
            {submitting ? "Generating..." : "Generate record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
