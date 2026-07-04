"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { GeneratePayrollDialog } from "@/components/layout/generate-payroll-dialog";
import { getAdminPayroll, type PayrollRow } from "@/lib/hrms-data";

export default function AdminPayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);

  const load = async () => {
    const { data } = await getAdminPayroll();
    setPayroll(data ?? []);
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
      <DataTable title="Payroll batches" columns={["Employee", "Period", "Net pay", "Action"]} rows={rows} />
    </AppShell>
  );
}
