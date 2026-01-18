"use client";

import React from "react";
import { PieChart, Pie, Cell, PieLabelRenderProps } from "recharts";
import { ChartData } from "./charts.types";

interface FleetUtilizationChartProps {
  data: ChartData[];
  isAnimationActive?: boolean;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }

  const radius =
    (innerRadius as number) +
    ((outerRadius as number) - (innerRadius as number)) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill='white'
      textAnchor={x > ncx ? "start" : "end"}
      dominantBaseline='central'
      className='text-sm font-bold'>
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function FleetUtilizationChart({
  data,
  isAnimationActive = true,
}: FleetUtilizationChartProps) {
  return (
    <div
      className='w-full h-full md:-mt-4 flex flex-col md:flex-col lg:flex-row justify-between items-center'
      suppressHydrationWarning>
      <div className='h-42 sm:h-56 md:h-48 lg:h-52 flex justify-center'>
        <PieChart
          width={220}
          height={220}
          className='sm:w-70 sm:h-70 md:w-70 md:h-70'>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            fill='#8884d8'
            dataKey='value'
            isAnimationActive={isAnimationActive}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>

      {/* below chart */}
      <div className='flex flex-col justify-start gap-4 mt-10 md:mt-6 px-4'>
        {data.map((item) => (
          <div key={item.name} className='flex items-center gap-x-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: item.color }}
            />
            <span className='text-sm md:text-lg text-gray-700'>
              {item.name}
            </span>
            <span className='text-lg md:text-xl font-bold text-primary ml-1'>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
