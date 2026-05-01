"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FleetItem {
  clientId: string;
  name: string;
  drivers: number;
  vehicles: number;
}

interface FleetUtilizationChartProps {
  data: FleetItem[];
  isAnimationActive?: boolean;
}

export default function FleetUtilizationChart({
  data,
  isAnimationActive = true,
}: FleetUtilizationChartProps) {
  const chartData = data.map((d) => ({
    name: d.name,
    drivers: d.drivers,
    vehicles: d.vehicles,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-md bg-white/50 text-sm text-gray-600">
        No chart data available yet
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center gap-6 md:gap-8"
      suppressHydrationWarning
    >
      <div className="h-82 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} domain={[0, "auto"]} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="drivers"
              name="Drivers"
              fill="#3b82f6"
              minPointSize={3}
              isAnimationActive={isAnimationActive}
            />
            <Bar
              dataKey="vehicles"
              name="Vehicles"
              fill="#10b981"
              minPointSize={3}
              isAnimationActive={isAnimationActive}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
