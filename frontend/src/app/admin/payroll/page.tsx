"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Button } from "@/components/ui/button";
import { GeneratePayrollDialog } from "@/components/layout/generate-payroll-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminPayroll, type PayrollRow } from "@/lib/hrms-data";

export default function AdminPayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAdminPayroll();
      setPayroll(data ?? []);
    } catch (err) {
      setError("Failed to load payroll data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = payroll.map((item) => ({
    Employee: item.profiles?.full_name ?? item.employee_id,
    Period: `${item.pay_period_start} - ${item.pay_period_end}`,
    "Net pay": `₹${item.net_salary.toLocaleString("en-IN")}`,
    Action: <Button size="sm">View</Button>,
  }));

  return (
    <AppShell role="admin_hr">
      <PageHeader
        title="Payroll"
        description="Process payroll and review compensation entries."
        action={<GeneratePayrollDialog onSuccess={load} />}
      />
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable title="Payroll batches" columns={["Employee", "Period", "Net pay", "Action"]} rows={rows} />
      )}
    </AppShell>
  );
}
