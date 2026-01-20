"use client";

import React from "react";
import { PieChart, Pie, Cell, PieLabelRenderProps } from "recharts";
import { ChartData } from "./charts.types";

/**
 * Props for the FleetUtilizationChart component
 *
 * @interface FleetUtilizationChartProps
 * @property {ChartData[]} data - Array of chart data objects containing name, value, and color for each pie segment
 * @property {boolean} [isAnimationActive=true] - Optional boolean to control whether pie chart animations are active
 */
interface FleetUtilizationChartProps {
  data: ChartData[];
  isAnimationActive?: boolean;
}

/**
 * Constant representing the radian value (π/180) used for angle conversions in the pie chart label positioning
 *
 * This is necessary because the recharts library uses degrees for angles,
 * but JavaScript's Math.cos() and Math.sin() functions expect radians.
 */
const RADIAN = Math.PI / 180;

/**
 * Renders a customized percentage label inside each pie chart segment
 *
 * @param {PieLabelRenderProps} props - Object containing pie chart label positioning properties
 * @param {number | undefined} props.cx - X-coordinate of the pie chart center
 * @param {number | undefined} props.cy - Y-coordinate of the pie chart center
 * @param {number | undefined} props.midAngle - Mid angle of the current pie segment in degrees
 * @param {number | undefined} props.innerRadius - Inner radius of the pie chart (for donut charts)
 * @param {number | undefined} props.outerRadius - Outer radius of the pie chart
 * @param {number | undefined} props.percent - Percentage value of the current segment (0-1 range)
 * @returns {JSX.Element | null} A text element displaying the percentage or null if coordinates are undefined
 */
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

  /**
   * Calculate the radius for label positioning - places the label halfway between inner and outer radius
   * This ensures labels appear centered within the pie segment thickness
   */
  const radius =
    (innerRadius as number) +
    ((outerRadius as number) - (innerRadius as number)) * 0.5;

  /**
   * Convert center coordinates to numbers for mathematical operations
   * Type assertion is safe here due to the null check above
   */
  const ncx = Number(cx);

  /**
   * Calculate the X-coordinate for the label using trigonometry:
   * x = centerX + radius * cos(-angle)
   * Negative angle is used because pie segments are drawn clockwise
   */
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);

  /**
   * Convert center Y coordinate to number
   */
  const ncy = Number(cy);

  /**
   * Calculate the Y-coordinate for the label using trigonometry:
   * y = centerY + radius * sin(-angle)
   */
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
