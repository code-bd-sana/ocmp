"use client";

interface StatsCardsProps {
  stats: {
    inspections: number;
    services: number;
    mots: number;
    brakeTests: number;
    all: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      label: "Inspections",
      value: stats.inspections,
      color: "blue",
      text: "#FFFFFF",
      subTitle: "#FFFFFF",
      background: "#5B8BF1",
    },
    {
      label: "Services",
      value: stats.services,
      color: "orange",
      text: "#FF9900",
      subTitle: "#044192",
      background: "#F6E2E1",
    },
    {
      label: "MOTs",
      value: stats.mots,
      color: "green",
      text: "#055117",
      subTitle: "#044192",
      background: "#D8E6E9",
    },
    {
      label: "Brake Tests",
      value: stats.brakeTests,
      color: "purple",
      text: "#B90012",
      subTitle: "#044192",
      background: "#E5D4FE",
    },
    {
      label: "Total Events",
      value: stats.all,
      color: "slate",
      text: "#5D0999",
      subTitle: "#044192",
      background: "#F5D7F3",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className={`group overflow-hidden bg-white shadow-sm transition-all hover:shadow-md`}
        >
          <div className={`p-6`} style={{ backgroundColor: stat.background }}>
            <p className="text-sm font-medium" style={{ color: stat.subTitle }}>
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold" style={{ color: stat.text }}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
