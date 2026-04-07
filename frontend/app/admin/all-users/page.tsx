"use client";

import Link from "next/link";

export default function AdminAllUsersPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">All Users</h1>
      <p className="text-muted-foreground text-sm">
        Manage all users from this admin area.
      </p>
      <Link
        href="/dashboard/users"
        className="text-primary text-sm hover:underline"
      >
        Open current users module
      </Link>
    </div>
  );
}
