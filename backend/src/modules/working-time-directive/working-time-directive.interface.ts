/**
 * WorkingTimeDirective Module — Type definitions.
 *
 * Used for both Transport Manager and Standalone User roles.
 * Fields mirror the WorkingTimeDirective Mongoose schema.
 */
export interface TWorkingTimeDirective {
  driverId: string;
  vehicleId: string;
  workingHours: number;
  restHours?: number;
  complianceStatus?: string;
  tachoReportAvailable?: boolean;
  standAloneId?: string;
  createdBy: string;
}
