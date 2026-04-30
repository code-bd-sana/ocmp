"use client";

import { useEffect, useState } from "react";
import { getFleetUtilizationData, getSummaryData } from "./summary.utils";
import dynamic from "next/dynamic";
import { DashboardAction, IDashboardSummaryData } from "@/service/dashboard";
import { AuthAction } from "@/service/auth";

const FleetUtilizationChart = dynamic(
  () => import("../charts/FleetUtilizationChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <p>Loading chart...</p>
      </div>
    ),
  },
);

export default function DashboardSummary() {
  const [summary, setSummary] = useState<IDashboardSummaryData | undefined>(
    undefined,
  );
  const role = AuthAction.GetUserRole();

  useEffect(() => {
    let mounted = true;

    DashboardAction.getDashboardSummary()
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setSummary(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard summary:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summaryData = getSummaryData(role, summary);
  const fleetData = getFleetUtilizationData();

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Summary Cards Section */}
      <div className="bg-muted flex-1 p-6 md:max-w-2/4">
        <h2 className="mb-6 text-2xl font-semibold text-blue-900">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          {summaryData.map((item) => {
            return (
              <div
                key={item.title}
                style={{ backgroundColor: item.color }}
                className="flex flex-col items-start justify-center p-5 text-center"
              >
                <div className="mb-3">
                  <item.icon
                    className="h-10 w-10"
                    color="#1A1A1A"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="mb-2 text-start text-base font-semibold text-(--body-text) md:text-[20px]">
                  {item.title}
                </p>
                <p className="text-2xl font-bold text-blue-900 md:text-3xl">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Utilization Section */}
      <div
        className="bg-muted flex-1 p-6 md:max-w-2/4"
        suppressHydrationWarning
      >
        <h2 className="text-2xl font-semibold text-blue-900">
          Fleet Utilization
        </h2>
        <FleetUtilizationChart data={fleetData} />
      </div>
    </div>
  );
}
