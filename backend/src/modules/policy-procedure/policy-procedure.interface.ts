/**
 * PolicyProcedure Module — Type definitions.
 *
 * Used for both Transport Manager and Standalone User roles.
 * Fields mirror the PolicyProcedure Mongoose schema.
 */
export interface TPolicyProcedure {
  policyName: string;
  policyCategory: string;
  fileLocations: string[];
  versionNumber: number;
  effectiveDate: string;
  reviewFrequencyMonths?: number;
  lastReviewDate?: string;
  responsiblePerson: string;
  notesActionsNeeded?: string;
  nextReviewDue?: string;
  reviewStatus: string;
  type: string;
  standAloneId?: string;
  createdBy: string;
}