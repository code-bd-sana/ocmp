/**
 * Type definition for fuel-usage.
 *
 * This type defines the structure of a single fuel-usage object.
 * @interface TFuelUsage
 */
export interface TFuelUsage {
  // Add fields as needed
  vehicleId: string;
  driverId: string;
  date: Date;
  adBlueUsed?: number;
  fuelUsed?: number;
  standAloneId?: string;
  createdBy: string;
}

