"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { getMyDashboardData, type PayrollRow } from "@/lib/hrms-data";

export default function EmployeePayrollPage() {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const result = await getMyDashboardData(user.id);
      setPayroll(result.payroll);
      setLoading(false);
    };
    void load();
  }, [user?.id]);

  const rows = payroll.map((item) => ({
    Period: `${item.pay_period_start} - ${item.pay_period_end}`,
    "Net pay": `₹${item.net_salary.toLocaleString("en-IN")}`,
    Status: "Issued",
    Notes: item.generated_by ? "Generated" : "Pending",
  }));

  return (
    <AppShell role="employee">
      <PageHeader title="Payroll" description="View payslips and salary history." />
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable title="Payroll history" columns={["Period", "Net pay", "Status", "Notes"]} rows={rows} />
      )}
    </AppShell>
  );
}
