"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthAction } from "@/service/auth";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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

  return (
    <div className="mx-auto max-w-3xl py-8">
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
    </div>
  );
};

export default Page;
