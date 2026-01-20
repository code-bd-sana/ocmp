export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
}

// dashboard footer nav links
export const ALL_NAVIGATION_LINKS = [
  {
    id: "vehicle-list",
    label: "Vehicle List",
    href: "/dashboard/vehicle-list",
    enabled: false,
  },
  {
    id: "spot-checks",
    label: "Spot Checks",
    href: "/dashboard/spot-checks",
    enabled: false,
  },
  {
    id: "driver-details",
    label: "Driver details, license and WTD infringements",
    href: "/dashboard/driver-details",
    enabled: false,
  },
  {
    id: "driver-tachograph",
    label: "Driver tachograph and WTD infringements",
    href: "/dashboard/driver-tachograph",
    enabled: false,
  },
  {
    id: "training",
    label: "Training and Toolbox Talks",
    href: "/dashboard/training",
    enabled: false,
  },
  {
    id: "renewals",
    label: "Renewals Tracker",
    href: "/dashboard/renewals",
    enabled: false,
  },
  {
    id: "ocrs-checks",
    label: "OCRS checks and rectification action plans",
    href: "/dashboard/ocrs-checks",
    enabled: false,
  },
  {
    id: "traffic-commissioner",
    label: "Traffic Commissioner Communications",
    href: "/dashboard/traffic-commissioner",
    enabled: false,
  },
  {
    id: "transport-manager",
    label: "Transport Manager",
    href: "/dashboard/transport-manager",
    enabled: false,
  },
  {
    id: "self-service",
    label: "Self service and login",
    href: "/dashboard/self-service",
    enabled: false,
  },
  {
    id: "planner",
    label: "Planner",
    href: "/dashboard/planner",
    enabled: false,
  },

  {
    id: "pg9s",
    label: "PG9s PG13 FG Clearance Investigation and TC Reporting",
    href: "/dashboard/pg9s",
    enabled: false,
  },
  {
    id: "contact-log",
    label: "Contact log",
    href: "/dashboard/contact-log",
    enabled: false,
  },
  {
    id: "gv79",
    label: "GV79 and Maintenance Provider Communication and Meeting Agenda",
    href: "/dashboard/gv79",
    enabled: false,
  },
  {
    id: "compliance-timetable",
    label: "Compliance Timetable",
    href: "/dashboard/compliance-timetable",
    enabled: false,
  },
  {
    id: "audits-rectification-reports",
    label: "Audits and rectification Reports",
    href: "/dashboard/audits-rectification-reports",
    enabled: false,
  },
  {
    id: "fuel-usage",
    label: "Fuel Usage",
    href: "/dashboard/fuel-usage",
    enabled: false,
  },
  {
    id: "wheel-retorque-monitoring",
    label: "Wheel Re-torque and Monitoring",
    href: "/dashboard/wheel-retorque-monitoring",
    enabled: false,
  },
  {
    id: "working-time-directive",
    label: "Working Time Directive",
    href: "/dashboard/working-time-directive",
    enabled: false,
  },
  {
    id: "policy-review-tracker",
    label: "Policy Procedure Review Tracker",
    href: "/dashboard/policy-review-tracker",
    enabled: false,
  },
  {
    id: "subcontractor-details",
    label: "Subcontractor Details",
    href: "/dashboard/subcontractor-details",
    enabled: false,
  },
];

// export the types
export interface RepositorySettings {
  navigationLinks: NavigationLink[];
}
