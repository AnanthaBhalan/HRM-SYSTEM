"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { AddEmployeeDialog } from "@/components/layout/add-employee-dialog";
import { getAdminEmployees, type EmployeeRow } from "@/lib/hrms-data";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);

  const load = async () => {
    const { data } = await getAdminEmployees();
    setEmployees(data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = employees.map((employee) => ({
    Name: employee.employee_code,
    Department: employee.department ?? "—",
    Role: employee.designation ?? "—",
    Status: employee.employment_status ?? "—",
  }));

  return (
    <AppShell role="admin_hr">
      <PageHeader
        title="Employees"
        description="Maintain employee records and team assignments."
        action={<AddEmployeeDialog onSuccess={load} />}
      />
      <DataTable title="Employee directory" columns={["Name", "Department", "Role", "Status"]} rows={rows} />
    </AppShell>
  );
}
