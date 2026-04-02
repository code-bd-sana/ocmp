"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthAction } from '@/service/auth';
import { useState } from 'react';
import { toast } from 'sonner';

const Page = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
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
        setChangePasswordMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        toast.success(res.message || 'Password changed successfully');
      } else {
        const msg = res.message || 'Failed to change password';
        setChangePasswordMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
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
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {changePasswordMessage && (
              <p className="text-sm text-slate-700">{changePasswordMessage}</p>
            )}

            <Button
              className="bg-[#044192] hover:bg-[#044192]"
              onClick={handleChangePassword}
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;