"use client";

import { useState, useTransition } from "react";
import {
  updateProfileAction,
  updatePasswordAction,
  updateSchoolProfileAction,
  createAcademicYearAction,
  updateAcademicYearAction,
  deleteAcademicYearAction,
  updateMemberRoleAction,
  updateMemberStatusAction
} from "@/app/(app)/settings/actions";
import { Badge } from "@/components/ui/badge";
import { formatMonth } from "@/lib/services/payroll";

interface Props {
  user: any;
  profile: any;
  schoolSettings: any;
  academicYears: any[];
  members: any[];
}

export function SettingsTabs({ user, profile, schoolSettings, academicYears, members }: Props) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAdmin = user.role === "administrator";

  // Tab 1 Form State (Profile)
  const [profileForm, setProfileForm] = useState({
    fullName: profile.fullName || "",
    avatarUrl: profile.avatarUrl || "",
    phone: profile.phone || "",
    bio: profile.bio || "",
    department: profile.department || "",
    jobTitle: profile.jobTitle || "",
    address: profile.address || "",
    emergencyContactName: profile.emergencyContactName || "",
    emergencyContactPhone: profile.emergencyContactPhone || ""
  });

  // Tab 2 Form State (Password)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Tab 3 Form State (Notifications)
  const [notifications, setNotifications] = useState({
    emailAnnouncements: true,
    emailPayroll: true
  });

  // Tab 4 Form State (School Profile)
  const [schoolProfile, setSchoolProfile] = useState({
    name: schoolSettings.school?.name || "",
    timezone: schoolSettings.school?.timezone || "Asia/Karachi",
    currency: schoolSettings.settings?.currency || "PKR",
    feeGraceDays: schoolSettings.settings?.feeGraceDays || "5"
  });

  // Tab 5 Form State (Academic Years)
  const [newYear, setNewYear] = useState({
    name: "",
    starts_on: "",
    ends_on: "",
    is_active: false
  });

  // Tab 6 Form State (Theme Settings)
  const [theme, setTheme] = useState(schoolSettings.settings?.theme || "light");

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfileAction(profileForm);
      if (res.error) setMessage({ type: "error", text: res.error });
      else setMessage({ type: "success", text: "Profile updated successfully!" });
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    startTransition(async () => {
      const res = await updatePasswordAction(password);
      if (res.error) setMessage({ type: "error", text: res.error });
      else {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPassword("");
        setConfirmPassword("");
      }
    });
  }

  function handleSchoolSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateSchoolProfileAction(schoolProfile.name, schoolProfile.timezone, {
        currency: schoolProfile.currency,
        feeGraceDays: schoolProfile.feeGraceDays,
        theme
      });
      if (res.error) setMessage({ type: "error", text: res.error });
      else setMessage({ type: "success", text: "School profile updated successfully!" });
    });
  }

  function handleCreateYear(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!newYear.name || !newYear.starts_on || !newYear.ends_on) {
      setMessage({ type: "error", text: "Please fill all academic year fields." });
      return;
    }
    startTransition(async () => {
      const res = await createAcademicYearAction(newYear);
      if (res.error) setMessage({ type: "error", text: res.error });
      else {
        setMessage({ type: "success", text: "Academic Year created successfully!" });
        setNewYear({ name: "", starts_on: "", ends_on: "", is_active: false });
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  }

  function handleDeleteYear(id: string) {
    if (!confirm("Are you sure you want to delete this academic year?")) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteAcademicYearAction(id);
      if (res.error) setMessage({ type: "error", text: res.error });
      else {
        setMessage({ type: "success", text: "Academic Year deleted!" });
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  }

  function handleRoleChange(memberId: string, role: string) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateMemberRoleAction(memberId, role);
      if (res.error) setMessage({ type: "error", text: res.error });
      else setMessage({ type: "success", text: "Role updated successfully!" });
    });
  }

  function handleStatusChange(memberId: string, status: string) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateMemberStatusAction(memberId, status);
      if (res.error) setMessage({ type: "error", text: res.error });
      else setMessage({ type: "success", text: "Status updated successfully!" });
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      {/* Navigation tabs */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => { setActiveTab("profile"); setMessage(null); }}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
        >
          Profile & Account
        </button>
        <button
          onClick={() => { setActiveTab("password"); setMessage(null); }}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "password" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
        >
          Password Settings
        </button>
        <button
          onClick={() => { setActiveTab("notifications"); setMessage(null); }}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "notifications" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
        >
          Notifications
        </button>

        {isAdmin && (
          <>
            <div className="h-px bg-outline/40 my-2" />
            <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Admin Only</span>
            <button
              onClick={() => { setActiveTab("school"); setMessage(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "school" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
            >
              School Profile
            </button>
            <button
              onClick={() => { setActiveTab("academics"); setMessage(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "academics" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
            >
              Academic Sessions
            </button>
            <button
              onClick={() => { setActiveTab("theme"); setMessage(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "theme" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
            >
              Theme Settings
            </button>
            <button
              onClick={() => { setActiveTab("roles"); setMessage(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "roles" ? "bg-primary text-white" : "hover:bg-surface-low text-muted"}`}
            >
              Role Management
            </button>
          </>
        )}
      </div>

      {/* Forms Area */}
      <div className="bg-white rounded-xl shadow-soft ring-1 ring-outline/25 p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${message.type === "success" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
            {message.text}
          </div>
        )}

        {/* Tab 1: Profile & Account */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">Profile & Account</h3>
            <p className="text-sm text-muted">Update your public profile fields, contact info, and emergency details.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Full Name</label>
                <input
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Avatar URL</label>
                <input
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Phone Number</label>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Bio / Profile Description</label>
                <input
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Department</label>
                <input
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Job Title</label>
                <input
                  value={profileForm.jobTitle}
                  onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="h-px bg-outline/40 my-4" />
            <h4 className="font-semibold text-ink text-sm">Pakistan Localization & Emergency Details</h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Home Address</label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Emergency Contact Person</label>
                <input
                  value={profileForm.emergencyContactName}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                  placeholder="e.g. Spouse, Parent Name"
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Emergency Contact Number</label>
                <input
                  value={profileForm.emergencyContactPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        )}

        {/* Tab 2: Password Settings */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <h3 className="font-display text-xl font-bold text-ink">Change Password</h3>
            <p className="text-sm text-muted">Ensure your account uses a secure, long password.</p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
            >
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {/* Tab 3: Notification Preferences */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">Notification Preferences</h3>
            <p className="text-sm text-muted">Toggle your notification methods below.</p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailAnnouncements}
                  onChange={(e) => setNotifications({ ...notifications, emailAnnouncements: e.target.checked })}
                  className="rounded border-outline/60 text-primary focus:ring-primary/30 h-4 w-4"
                />
                <span className="text-sm text-ink font-semibold">Email notifications for new announcements</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailPayroll}
                  onChange={(e) => setNotifications({ ...notifications, emailPayroll: e.target.checked })}
                  className="rounded border-outline/60 text-primary focus:ring-primary/30 h-4 w-4"
                />
                <span className="text-sm text-ink font-semibold">Email notifications when payroll is generated</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: "success", text: "Preferences saved successfully!" })}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
            >
              Save Preferences
            </button>
          </div>
        )}

        {/* Tab 4: School Profile */}
        {activeTab === "school" && (
          <form onSubmit={handleSchoolSubmit} className="space-y-4 max-w-lg">
            <h3 className="font-display text-xl font-bold text-ink">School Profile Settings</h3>
            <p className="text-sm text-muted">Change settings isolated by school ID.</p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">School Name</label>
              <input
                value={schoolProfile.name}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Timezone</label>
              <select
                value={schoolProfile.timezone}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, timezone: e.target.value })}
                className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Asia/Karachi">Asia/Karachi (Pakistan Standard Time)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Currency Code</label>
              <input
                value={schoolProfile.currency}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, currency: e.target.value })}
                className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Fee Grace Days (numeric)</label>
              <input
                type="number"
                value={schoolProfile.feeGraceDays}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, feeGraceDays: e.target.value })}
                className="w-full rounded-lg border border-outline/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save School Profile"}
            </button>
          </form>
        )}

        {/* Tab 5: Academic Sessions */}
        {activeTab === "academics" && (
          <div className="space-y-6">
            <h3 className="font-display text-xl font-bold text-ink">Academic Sessions</h3>
            <p className="text-sm text-muted">Create and manage academic sessions. Marking a session active disables all other sessions.</p>

            <form onSubmit={handleCreateYear} className="space-y-4 border border-outline/40 rounded-xl p-4 bg-surface-low/50">
              <h4 className="font-bold text-sm text-ink">Add New Session</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Session Name</label>
                  <input
                    placeholder="e.g. 2026-2027"
                    value={newYear.name}
                    onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                    className="w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Starts On</label>
                  <input
                    type="date"
                    value={newYear.starts_on}
                    onChange={(e) => setNewYear({ ...newYear, starts_on: e.target.value })}
                    className="w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Ends On</label>
                  <input
                    type="date"
                    value={newYear.ends_on}
                    onChange={(e) => setNewYear({ ...newYear, ends_on: e.target.value })}
                    className="w-full rounded-lg border border-outline/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newYear.is_active}
                  onChange={(e) => setNewYear({ ...newYear, is_active: e.target.checked })}
                  className="rounded border-outline/60 text-primary h-4 w-4"
                />
                <span className="text-sm font-semibold text-ink">Set as active academic session</span>
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
              >
                {isPending ? "Creating..." : "Create Session"}
              </button>
            </form>

            <div className="overflow-x-auto border border-outline/40 rounded-xl">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Session Name</th>
                    <th className="px-4 py-3">Starts</th>
                    <th className="px-4 py-3">Ends</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {academicYears.map((year) => (
                    <tr key={year.id} className="border-t border-outline/60 hover:bg-surface-low/50">
                      <td className="px-4 py-4 font-semibold text-ink">{year.name}</td>
                      <td className="px-4 py-4 text-muted">{year.starts_on}</td>
                      <td className="px-4 py-4 text-muted">{year.ends_on}</td>
                      <td className="px-4 py-4">
                        <Badge tone={year.is_active ? "green" : "gray"}>
                          {year.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {!year.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeleteYear(year.id)}
                            className="text-xs font-semibold text-danger hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Theme Settings */}
        {activeTab === "theme" && (
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">Theme Preferences</h3>
            <p className="text-sm text-muted">Choose your preferred visual design mode for Scholarly.</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`border rounded-xl p-4 text-left transition flex flex-col justify-between h-24 ${theme === "light" ? "border-primary ring-2 ring-primary/20 bg-primary-soft/10" : "border-outline hover:bg-surface-low"}`}
              >
                <span className="font-bold text-ink">Light Mode</span>
                <span className="text-xs text-muted">Default light theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`border rounded-xl p-4 text-left transition flex flex-col justify-between h-24 ${theme === "dark" ? "border-primary ring-2 ring-primary/20 bg-primary-soft/10" : "border-outline hover:bg-surface-low"}`}
              >
                <span className="font-bold text-ink">Dark Mode</span>
                <span className="text-xs text-muted">High contrast dark theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("glass")}
                className={`border rounded-xl p-4 text-left transition flex flex-col justify-between h-24 ${theme === "glass" ? "border-primary ring-2 ring-primary/20 bg-primary-soft/10" : "border-outline hover:bg-surface-low"}`}
              >
                <span className="font-bold text-ink">Glassmorphism</span>
                <span className="text-xs text-muted">Semi-transparent elements</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSchoolSubmit}
              disabled={isPending}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
            >
              {isPending ? "Applying..." : "Save Theme Preference"}
            </button>
          </div>
        )}

        {/* Tab 7: Role Management */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">Role & Account Management</h3>
            <p className="text-sm text-muted">View school staff members and update their system roles or status.</p>

            <div className="overflow-x-auto border border-outline/40 rounded-xl">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-low font-label text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Job Details</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.memberId} className="border-t border-outline/60 hover:bg-surface-low/50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{member.fullName}</p>
                        <p className="text-xs text-muted">{member.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.memberId, e.target.value)}
                          className="rounded border border-outline/60 px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="principal">Principal</option>
                          <option value="administrator">Administrator</option>
                          <option value="student_staff">Registrar</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={member.status}
                          onChange={(e) => handleStatusChange(member.memberId, e.target.value)}
                          className="rounded border border-outline/60 px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {member.department && `${member.department} • `}
                        {member.jobTitle ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
