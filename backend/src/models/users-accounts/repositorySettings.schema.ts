import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a RepositorySettings document
export interface IRepositorySettings extends Document {
  vehicleList?: boolean;
  spotChecks?: boolean;
  driverDetailsLicenceAndDoc?: boolean;
  driverTachoGraphAndWTDInfringements?: boolean;
  trainingAndToolboxTalks?: boolean;
  renewalsTracker?: boolean;
  OCRSChecksAndRectification?: boolean;
  trafficCommissionerCommunicate?: boolean;
  transportManager?: boolean;
  selfServiceAndLogin?: boolean;
  Planner?: boolean;
  PG9sPG13FGClearanceInvesting?: boolean;
  contactLog?: boolean;
  GV79DAndMaintenanceProvider?: boolean;
  complianceTimetable?: boolean;
  auditsAndRecificationReports?: boolean;
  fuelUsage?: boolean;
  wheelREtorquePolicyAndMonitoring?: boolean;
  workingTimeDirective?: boolean;
  policyProcedureReviewTracker?: boolean;
  subcontractorDetails?: boolean;
  userId: mongoose.Types.ObjectId;
}

// Define the RepositorySettings schema
const RepositorySettingsSchema: Schema<IRepositorySettings> = new Schema(
  {
    vehicleList: {
      type: Boolean,
    },
    spotChecks: {
      type: Boolean,
    },
    driverDetailsLicenceAndDoc: {
      type: Boolean,
    },
    driverTachoGraphAndWTDInfringements: {
      type: Boolean,
    },
    trainingAndToolboxTalks: {
      type: Boolean,
    },
    renewalsTracker: {
      type: Boolean,
    },
    OCRSChecksAndRectification: {
      type: Boolean,
    },
    trafficCommissionerCommunicate: {
      type: Boolean,
    },
    transportManager: {
      type: Boolean,
    },
    selfServiceAndLogin: {
      type: Boolean,
    },
    Planner: {
      type: Boolean,
    },
    PG9sPG13FGClearanceInvesting: {
      type: Boolean,
    },
    contactLog: {
      type: Boolean,
    },
    GV79DAndMaintenanceProvider: {
      type: Boolean,
    },
    complianceTimetable: {
      type: Boolean,
    },
    auditsAndRecificationReports: {
      type: Boolean,
    },
    fuelUsage: {
      type: Boolean,
    },
    wheelREtorquePolicyAndMonitoring: {
      type: Boolean,
    },
    workingTimeDirective: {
      type: Boolean,
    },
    policyProcedureReviewTracker: {
      type: Boolean,
    },
    subcontractorDetails: {
      type: Boolean,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the RepositorySettings model
const RepositorySettings = mongoose.model<IRepositorySettings>(
  'RepositorySettings',
  RepositorySettingsSchema
);

// Export the RepositorySettings model
export default RepositorySettings;
