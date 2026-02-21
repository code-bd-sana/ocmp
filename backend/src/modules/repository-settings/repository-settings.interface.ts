/**
 * Type definition for repository-settings.
 *
 * This type defines the structure of the repository settings fields.
 * All 21 boolean feature flags.
 */
export interface TRepositorySettings {
  vehicleList: boolean;
  spotChecks: boolean;
  driverDetailsLicenceAndDoc: boolean;
  driverTachoGraphAndWTDInfringements: boolean;
  trainingAndToolboxTalks: boolean;
  renewalsTracker: boolean;
  OCRSChecksAndRectification: boolean;
  trafficCommissionerCommunicate: boolean;
  transportManager: boolean;
  selfServiceAndLogin: boolean;
  Planner: boolean;
  PG9sPG13FGClearanceInvesting: boolean;
  contactLog: boolean;
  GV79DAndMaintenanceProvider: boolean;
  complianceTimetable: boolean;
  auditsAndRectificationReports: boolean;
  fuelUsage: boolean;
  wheelRetorquePolicyAndMonitoring: boolean;
  workingTimeDirective: boolean;
  policyProcedureReviewTracker: boolean;
  subcontractorDetails: boolean;
}