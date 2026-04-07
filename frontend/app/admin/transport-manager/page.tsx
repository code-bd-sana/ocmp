"use client";

import Link from "next/link";

export default function AdminTransportManagerPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Transport Manager</h1>
      <p className="text-muted-foreground text-sm">
        Manage transport managers from this admin area.
      </p>
      <Link
        href="/dashboard/transport-managers"
        className="text-primary text-sm hover:underline"
      >
        Open current transport managers module
      </Link>
    </div>
  );
}
