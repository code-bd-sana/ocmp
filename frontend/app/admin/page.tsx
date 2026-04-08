"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardAction, ISuperAdminDashboardSummary } from "@/service/dashboard";
import { Truck, UserCheck, UserCog, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const [summary, setSummary] = useState<ISuperAdminDashboardSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await DashboardAction.getSuperAdminDashboard();

        if (!isMounted) return;

        if (response.success && response.data?.summary) {
          setSummary(response.data.summary);
          return;
        }

        toast.error(response.message || "Failed to load dashboard summary");
      } catch (error) {
        if (!isMounted) return;
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard summary";
        toast.error(message);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const adminStats = useMemo(
    () => [
      {
        title: "Total Users",
        value: summary?.totalUsers ?? "--",
        icon: Users,
        bg: "bg-[#FFE2E5]",
      },
      {
        title: "Transport Managers",
        value: summary?.totalManagers ?? "--",
        icon: UserCheck,
        bg: "bg-[#FFF4DE]",
      },
      {
        title: "Total Clients",
        value: summary?.totalClients ?? "--",
        icon: UserCog,
        bg: "bg-[#DCFCE7]",
      },
      {
        title: "Total Vehicles",
        value: summary?.totalVehicles ?? "--",
        icon: Truck,
        bg: "bg-[#F3E8FF]",
      },
    ],
    [summary],
  );

  return (
    <div className="bg-white">
      <h1 className="text-5xl leading-tight font-medium text-[#0d4b9f] mb-8 md:mb-15">
        Main Dashboard
      </h1>

      <Card className="rounded-sm border-none bg-[#f8f9fc] shadow-[0_6px_18px_rgba(13,75,159,0.08)]">
        <CardContent className="">
          <h2 className="text-4xl leading-tight font-medium text-[#0d4b9f] pb-5 md:pb-10">
            Summary
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {adminStats.map((item) => (
              <div
                key={item.title}
                className={`${item.bg} md:min-h-56 flex flex-col justify-center rounded-none px-4 py-5 md:px-5 md:py-6`}
              >
                <item.icon className="mb-5 h-8 w-8 text-[#0d4b9f]" strokeWidth={1.8} />
                <p className="mb-2 text-[18px] font-medium text-[#0d4b9f]">
                  {item.title}
                </p>
                <p className="text-[34px] leading-none font-bold text-[#0d4b9f]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
