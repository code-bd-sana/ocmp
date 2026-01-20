import { LucideIcon } from "lucide-react";

/**
 * Represents a summary card component with key metrics and visual indicators
 *
 * @typedef {Object} SummaryCardData
 * @property {string} title - The display title of the summary card (e.g., "Total Revenue", "Active Users")
 * @property {number} value - The numerical value to display (e.g., 1500, 85.5)
 * @property {LucideIcon} icon - The Lucide React icon component to display alongside the title
 * @property {string} [color] - Optional CSS color string for customizing the icon or text color.
 *                              If not provided, a default color will be used.
 *                              Accepts any valid CSS color value (hex, rgb, hsl, named colors).
 */
export interface SummaryCardData {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
}

/**
 * Represents data for fleet utilization visualization (e.g., pie chart, donut chart)
 *
 * @typedef {Object} FleetUtilizationData
 * @property {string} name - The name/category of the fleet segment (e.g., "In Service", "Maintenance", "Idle")
 * @property {number} value - The numerical value representing utilization percentage or count
 * @property {string} color - The CSS color string for this segment in visualizations.
 *                            Should be a valid CSS color value (hex, rgb, hsl, named colors).
 */
export interface FleetUtilizationData {
  name: string;
  value: number;
  color: string;
}
