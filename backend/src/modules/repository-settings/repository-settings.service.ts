import mongoose from 'mongoose';
import { RepositorySettings, IRepositorySettings } from '../../models';
import { UpdateRepositorySettingsInput } from './repository-settings.validation';

/**
 * Default values for all 21 repository settings feature flags.
 * Used when creating initial settings for a new user.
 */
const DEFAULT_SETTINGS = {
  vehicleList: false,
  spotChecks: false,
  driverDetailsLicenceAndDoc: false,
  driverTachoGraphAndWTDInfringements: false,
  trainingAndToolboxTalks: false,
  renewalsTracker: false,
  OCRSChecksAndRectification: false,
  trafficCommissionerCommunicate: false,
  transportManager: false,
  selfServiceAndLogin: false,
  Planner: false,
  PG9sPG13FGClearanceInvesting: false,
  contactLog: false,
  GV79DAndMaintenanceProvider: false,
  complianceTimetable: false,
  auditsAndRectificationReports: false,
  fuelUsage: false,
  wheelRetorquePolicyAndMonitoring: false,
  workingTimeDirective: false,
  policyProcedureReviewTracker: false,
  subcontractorDetails: false,
};

/**
 * Service: Create default repository settings for a user.
 * Called automatically on register and when a manager creates a client.
 * All 21 flags are initialised to false.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<IRepositorySettings>} - The created settings document.
 */
const createDefaultSettings = async (
  userId: string
): Promise<IRepositorySettings> => {
  const existing = await RepositorySettings.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (existing) return existing as IRepositorySettings;

  return RepositorySettings.create({
    ...DEFAULT_SETTINGS,
    userId: new mongoose.Types.ObjectId(userId),
  });
};

/**
 * Service: Get repository settings for the authenticated user.
 * If settings don't exist yet, creates them with all flags false (safety net).
 *
 * @param {string} userId - The user's ID (from req.user._id).
 * @returns {Promise<IRepositorySettings>} - The settings document.
 */
const getRepositorySettings = async (
  userId: string
): Promise<IRepositorySettings> => {
  const userObjId = new mongoose.Types.ObjectId(userId);

  let settings = await RepositorySettings.findOne({ userId: userObjId }).lean();

  // Safety net — create if missing
  if (!settings) {
    settings = (
      await RepositorySettings.create({
        ...DEFAULT_SETTINGS,
        userId: userObjId,
      })
    ).toObject();
  }

  return settings as IRepositorySettings;
};

/**
 * Service: Update repository settings for the authenticated user.
 * Only the fields provided in the body will be updated (PATCH semantics).
 *
 * @param {string} userId - The user's ID (from req.user._id).
 * @param {UpdateRepositorySettingsInput} data - Partial object of boolean flags to update.
 * @returns {Promise<IRepositorySettings>} - The updated settings document.
 */
const updateRepositorySettings = async (
  userId: string,
  data: UpdateRepositorySettingsInput
): Promise<IRepositorySettings> => {
  const userObjId = new mongoose.Types.ObjectId(userId);

  const updated = await RepositorySettings.findOneAndUpdate(
    { userId: userObjId },
    { $set: data },
    { returnDocument: 'after' }
  ).lean();

  if (!updated) {
    throw new Error('Repository settings not found for this user');
  }

  return updated as IRepositorySettings;
};

// Export all service functions as a namespace
export const repositorySettingsServices = {
  createDefaultSettings,
  getRepositorySettings,
  updateRepositorySettings,
};