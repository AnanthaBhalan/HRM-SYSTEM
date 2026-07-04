"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UserRound, Clock3, CalendarDays, Wallet, Users, BadgeCheck, ShieldCheck, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const employeeItems = [
  { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/profile", label: "Profile", icon: UserRound },
  { href: "/employee/attendance", label: "Attendance", icon: Clock3 },
  { href: "/employee/leave", label: "Leave", icon: CalendarDays },
  { href: "/employee/payroll", label: "Payroll", icon: Wallet },
];

const adminItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: Clock3 },
  { href: "/admin/leave-approvals", label: "Leave Approvals", icon: BadgeCheck },
  { href: "/admin/payroll", label: "Payroll", icon: Wallet },
];

export function AppShell({ children, role = "employee" }: { children: React.ReactNode; role?: "employee" | "admin_hr" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const items = role === "admin_hr" ? adminItems : employeeItems;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role === "admin_hr" && profile?.role !== "admin_hr") {
      router.replace("/employee/dashboard");
      return;
    }

    if (role === "employee" && profile?.role === "admin_hr") {
      router.replace("/admin/dashboard");
    }
  }, [loading, profile?.role, role, router, user]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">HRMS</p>
              <p className="text-xs text-slate-500">Internal operations</p>
            </div>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Role: {role === "admin_hr" ? "HR Admin" : "Employee"}</p>
            <p className="mt-1 text-xs">Secure access to staff operations.</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <div className="flex h-full flex-col p-5">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">HRMS</p>
                          <p className="text-xs text-slate-500">Internal operations</p>
                        </div>
                      </div>
                      <nav className="space-y-1">
                        {items.map((item) => {
                          const Icon = item.icon;
                          const active = pathname.startsWith(item.href);
                          return (
                            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", active ? "bg-sky-50 text-sky-700" : "text-slate-600")}> 
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-sm text-slate-500">Human Resources Management</p>
                  <h1 className="text-xl font-semibold">{role === "admin_hr" ? "Admin Center" : "Employee Hub"}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-1">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-rose-600"
                      onSelect={(event) => {
                        event.preventDefault();
                        void signOut();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
