"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const pieChartData = [
  { browser: "Chrome", visitors: 5824, fill: "hsl(var(--chart-1))" },
  { browser: "Safari", visitors: 2398, fill: "hsl(var(--chart-2))" },
  { browser: "Firefox", visitors: 1241, fill: "hsl(var(--chart-3))" },
  { browser: "Edge", visitors: 928, fill: "hsl(var(--chart-4))" },
  { browser: "Other", visitors: 612, fill: "hsl(var(--chart-5))" },
];

const barChartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
  { month: "Jul", desktop: 180, mobile: 220 },
  { month: "Aug", desktop: 165, mobile: 245 },
  { month: "Sep", desktop: 260, mobile: 170 },
  { month: "Oct", desktop: 340, mobile: 145 },
  { month: "Nov", desktop: 380, mobile: 130 },
  { month: "Dec", desktop: 420, mobile: 190 },
];

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: {
    label: "Desktop",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(213 93% 68%)",
  },
  Chrome: { label: "Chrome", color: "hsl(221 83% 53%)" },
  Safari: { label: "Safari", color: "hsl(142 76% 36%)" },
  Firefox: { label: "Firefox", color: "hsl(346 77% 49%)" },
  Edge: { label: "Edge", color: "hsl(271 76% 53%)" },
  Other: { label: "Other", color: "hsl(43 96% 56%)" },
} satisfies ChartConfig;

export default function Home() {
  return (
    <div className='space-y-6 p-4 md:p-6'>
      <h1 className='text-3xl font-bold tracking-tight'>Analytics Overview</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Browser Usage - Pie Chart */}
        <Card className='border-border/40 bg-gradient-to-b from-card to-card/90 shadow-xl flex flex-col'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-xl font-semibold tracking-tight'>
              Browser Distribution
            </CardTitle>
            <CardDescription>
              Last 30 days — Top browsers by visitors
            </CardDescription>
          </CardHeader>
          <CardContent className='pb-6 flex-1'>
            <ChartContainer
              config={chartConfig}
              className='mx-auto aspect-square max-h-[360px]'>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey='visitors'
                    nameKey='browser'
                    cx='50%'
                    cy='50%'
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Legend
                    iconType='circle'
                    layout='horizontal'
                    verticalAlign='bottom'
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Device Traffic - Bar Chart */}
        <Card className='border-border/40 bg-gradient-to-b from-card to-card/90 shadow-xl flex flex-col'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-xl font-semibold tracking-tight'>
              Traffic by Device — 2025
            </CardTitle>
            <CardDescription>
              Monthly desktop vs mobile sessions
            </CardDescription>
          </CardHeader>
          <CardContent className='pb-8 flex-1'>
            <ChartContainer
              config={chartConfig}
              className='min-h-[340px] w-full'>
              <BarChart
                accessibilityLayer
                data={barChartData}
                margin={{ top: 24, right: 12, left: 12, bottom: 12 }}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='4 4'
                  opacity={0.35}
                />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator='dashed'
                      labelFormatter={(v) => `${v} 2025`}
                    />
                  }
                />
                <Bar
                  dataKey='desktop'
                  fill='var(--color-desktop)'
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                />
                <Bar
                  dataKey='mobile'
                  fill='var(--color-mobile)'
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
