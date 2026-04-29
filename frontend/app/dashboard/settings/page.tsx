"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthAction } from "@/service/auth";
import { UserAction } from "@/service/user";
import { Eye, EyeOff, Loader2, Users, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState<
    string | null
  >(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showInStandaloneUsersList, setShowInStandaloneUsersList] =
    useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await UserAction.getProfile();
        if (res.status && res.data) {
          setUserRole(res.data.role || null);
          setShowInStandaloneUsersList(
            res.data.showInStandaloneUsersList !== false,
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";
        toast.error(message);
      } finally {
        setProfileLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangePasswordLoading(true);
    setChangePasswordMessage(null);

    try {
      const res = await AuthAction.ChangePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (res.status) {
        setChangePasswordMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        toast.success(res.message || "Password changed successfully");
      } else {
        const msg = res.message || "Failed to change password";
        setChangePasswordMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";
      setChangePasswordMessage(message);
      toast.error(message);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleVisibilityToggle = async () => {
    const nextValue = !showInStandaloneUsersList;
    try {
      setVisibilitySaving(true);
      const res = await UserAction.updateProfile({
        showInStandaloneUsersList: nextValue,
      });

      if (res.status) {
        setShowInStandaloneUsersList(nextValue);
        toast.success(
          nextValue
            ? "You are now visible to standalone users"
            : "You are hidden from the standalone users list",
        );
      } else {
        toast.error(res.message || "Failed to update visibility");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update visibility",
      );
    } finally {
      setVisibilitySaving(false);
    }
  };

  const isTransportManager = userRole === "TRANSPORT_MANAGER";

  return (
    <div className="mx-auto max-w-4xl py-8">
      <Card className="rounded-none border-none shadow-none">
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <p className="text-sm text-slate-500">
              Update your account password securely.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {changePasswordMessage && (
              <p className="text-sm text-slate-700">{changePasswordMessage}</p>
            )}

            <Button
              className="bg-[#044192] hover:bg-[#044192]"
              onClick={handleChangePassword}
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isTransportManager && (
        <Card className="mt-8 rounded-none border border-slate-200 shadow-none">
          <CardContent className="space-y-4 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#044192]/10 p-2 text-[#044192]">
                <UsersRound size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  Standalone user visibility
                </h3>
                <p className="text-sm text-slate-500">
                  Control whether your account appears in the standalone users
                  list.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {showInStandaloneUsersList
                    ? "Visible to standalone users"
                    : "Hidden from standalone users"}
                </p>
                <p className="text-sm text-slate-500">
                  {profileLoading
                    ? "Loading current visibility..."
                    : "This preference is saved to your profile."}
                </p>
              </div>

              <Button
                type="button"
                onClick={handleVisibilityToggle}
                disabled={profileLoading || visibilitySaving}
                variant={showInStandaloneUsersList ? "default" : "outline"}
                className="min-w-44"
              >
                {visibilitySaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : showInStandaloneUsersList ? (
                  <>
                    <Users className="h-4 w-4" />
                    Hide from list
                  </>
                ) : (
                  <>
                    <UsersRound className="h-4 w-4" />
                    Show in list
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Page;
