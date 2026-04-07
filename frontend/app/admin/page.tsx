"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileCheck2, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

const adminStats = [
  {
    title: "Total Users",
    value: "--",
    description: "All registered accounts",
    icon: Users,
  },
  {
    title: "Approved Clients",
    value: "--",
    description: "Client profiles approved",
    icon: Building2,
  },
  {
    title: "Open Compliance Items",
    value: "--",
    description: "Pending compliance actions",
    icon: FileCheck2,
  },
  {
    title: "System Health",
    value: "Healthy",
    description: "Core services status",
    icon: ShieldCheck,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Super admin overview for users, clients, and compliance activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-muted-foreground text-xs">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/dashboard/users"
            className="text-primary hover:underline"
          >
            Manage users
          </Link>
          <Link
            href="/dashboard/repository-settings"
            className="text-primary hover:underline"
          >
            Repository settings
          </Link>
          <Link
            href="/dashboard/vehicles"
            className="text-primary hover:underline"
          >
            Vehicle management
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
