import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Repository-settings Validation Schemas and Types
 *
 * Defines Zod schemas for validating repository-settings update requests.
 * All 21 boolean feature flags are optional — send only the ones you want to change.
 */

/**
 * Zod schema for updating repository settings.
 * Body: any subset of the 21 boolean feature flags.
 * At least one field must be provided.
 */
const zodUpdateRepositorySettingsSchema = z
  .object({
    vehicleList: z.boolean({ message: 'vehicleList must be a boolean' }).optional(),
    spotChecks: z.boolean({ message: 'spotChecks must be a boolean' }).optional(),
    driverDetailsLicenceAndDoc: z.boolean({ message: 'driverDetailsLicenceAndDoc must be a boolean' }).optional(),
    driverTachoGraphAndWTDInfringements: z.boolean({ message: 'driverTachoGraphAndWTDInfringements must be a boolean' }).optional(),
    trainingAndToolboxTalks: z.boolean({ message: 'trainingAndToolboxTalks must be a boolean' }).optional(),
    renewalsTracker: z.boolean({ message: 'renewalsTracker must be a boolean' }).optional(),
    OCRSChecksAndRectification: z.boolean({ message: 'OCRSChecksAndRectification must be a boolean' }).optional(),
    trafficCommissionerCommunicate: z.boolean({ message: 'trafficCommissionerCommunicate must be a boolean' }).optional(),
    transportManager: z.boolean({ message: 'transportManager must be a boolean' }).optional(),
    selfServiceAndLogin: z.boolean({ message: 'selfServiceAndLogin must be a boolean' }).optional(),
    Planner: z.boolean({ message: 'Planner must be a boolean' }).optional(),
    PG9sPG13FGClearanceInvesting: z.boolean({ message: 'PG9sPG13FGClearanceInvesting must be a boolean' }).optional(),
    contactLog: z.boolean({ message: 'contactLog must be a boolean' }).optional(),
    GV79DAndMaintenanceProvider: z.boolean({ message: 'GV79DAndMaintenanceProvider must be a boolean' }).optional(),
    complianceTimetable: z.boolean({ message: 'complianceTimetable must be a boolean' }).optional(),
    auditsAndRectificationReports: z.boolean({ message: 'auditsAndRectificationReports must be a boolean' }).optional(),
    fuelUsage: z.boolean({ message: 'fuelUsage must be a boolean' }).optional(),
    wheelRetorquePolicyAndMonitoring: z.boolean({ message: 'wheelRetorquePolicyAndMonitoring must be a boolean' }).optional(),
    workingTimeDirective: z.boolean({ message: 'workingTimeDirective must be a boolean' }).optional(),
    policyProcedureReviewTracker: z.boolean({ message: 'policyProcedureReviewTracker must be a boolean' }).optional(),
    subcontractorDetails: z.boolean({ message: 'subcontractorDetails must be a boolean' }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one setting field must be provided',
  });

export type UpdateRepositorySettingsInput = z.infer<typeof zodUpdateRepositorySettingsSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateUpdateRepositorySettings = validateBody(zodUpdateRepositorySettingsSchema);