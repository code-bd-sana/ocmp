/**
 * Training Records Module — Report / Aggregation interfaces.
 *
 * This module does NOT have its own model.  It queries across
 * TrainingRegister, Participant, and TrainingSheet to produce
 * grouped reports and allows updating register entry statuses.
 */

/** A single sub-entry inside a grouped training record */
export interface TTrainingRecordEntry {
  _id: string;
  trainingDate: string;
  status: string;
}

/** A single grouped record returned by the report API */
export interface TTrainingRecordGroup {
  participantId: string;
  participantName: string;
  trainingId: string;
  trainingName: string;
  trainingInterval: number;
  records: TTrainingRecordEntry[];
}

/** Query shape for the training records report */
export interface TTrainingRecordsQuery {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
  standAloneId?: string;
  status?: string;
}