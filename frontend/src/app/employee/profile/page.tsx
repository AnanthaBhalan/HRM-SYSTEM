"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { getMyDashboardData, updateMyProfile, uploadProfilePicture } from "@/lib/hrms-data";

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [form, setForm] = useState({ phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const result = await getMyDashboardData(user.id);
      setProfile(result.profile);
      setEmployee(result.employee);
      setForm({ phone: result.profile?.phone ?? "", address: result.profile?.address ?? "" });
    };
    void load();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);
    const { error } = await updateMyProfile(user.id, { phone: form.phone, address: form.address });
    setSaving(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully.");
    }
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    setMessage(null);
    const { error, publicUrl } = await uploadProfilePicture(user.id, file);
    setUploading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile picture updated successfully.");
      setProfile((prev: any) => ({ ...prev, profile_picture_url: publicUrl }));
    }
  };

  return (
    <AppShell role="employee">
      <PageHeader title="Profile" description="Keep your personal and work details current." action={<Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>} />
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Profile picture</label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile?.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    {profile?.full_name?.[0] || "U"}
                  </div>
                )}
              </Avatar>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="image/*" onChange={handlePictureUpload} disabled={uploading} className="max-w-xs" />
                {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <Input value={profile?.full_name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={profile?.email ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Department</label>
            <Input value={employee?.department ?? ""} readOnly />
          </div>
          {message ? <p className="text-sm text-slate-600 md:col-span-2">{message}</p> : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
