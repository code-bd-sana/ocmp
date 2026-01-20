"use client";

// import FleetUtilizationChart from "../charts/FleetUtilizationChart";
import { getFleetUtilizationData, getSummaryData } from "./summary.utils";
import Image from "next/image";
import dynamic from "next/dynamic";

const FleetUtilizationChart = dynamic(
  () => import("../charts/FleetUtilizationChart"),
  {
    ssr: false,
    loading: () => (
      <div className='h-64 flex items-center justify-center'>
        <p>Loading chart...</p>
      </div>
    ),
  },
);

export default function DashboardSummary() {
  const summaryData = getSummaryData();
  const fleetData = getFleetUtilizationData();
  // images
  const iconImages: Record<string, string> = {
    "Total Vehicles": "/dashboard/truck.png",
    "Active Job": "/dashboard/Job.png",
    "Driver Online": "/dashboard/Driver.png",
    Alerts: "/dashboard/Alert.png",
  };

  return (
    <div className='flex flex-col lg:flex-row gap-6'>
      {/* Summary Cards Section */}
      <div className='bg-muted p-6 flex-1 md:max-w-2/3'>
        <h2 className='text-2xl font-semibold mb-6 text-blue-900'>Summary</h2>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {summaryData.map((item) => {
            const imagePath = iconImages[item.title];

            return (
              <div
                key={item.title}
                style={{ backgroundColor: item.color }}
                className='p-5 flex flex-col items-start justify-center text-center '>
                <div className='mb-3'>
                  {imagePath ? (
                    <Image
                      src={imagePath}
                      alt={item.title}
                      width={30}
                      height={30}
                      className='text-blue-900 w-7 h-7 md:w-9 md:h-9'
                    />
                  ) : (
                    // Fallback images
                    <item.icon className='w-8 h-8 text-blue-900' />
                  )}
                </div>
                <p className='text-base md:text-[20px] font-semibold text-(--body-text) mb-2'>
                  {item.title}
                </p>
                <p className='text-2xl md:text-3xl font-bold text-blue-900'>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Utilization Section */}
      <div
        className=' bg-muted p-6 flex-1 md:max-w-1/3'
        suppressHydrationWarning>
        <h2 className='text-2xl font-semibold text-blue-900'>
          Fleet Utilization
        </h2>
        <FleetUtilizationChart data={fleetData} />
      </div>
    </div>
  );
}
