export type TrainingRecordStatus =
  | "Pending"
  | "Overdue"
  | "Upcoming"
  | "Completed";

export interface TrainingRecordEntry {
  _id: string;
  trainingDate: string;
  status: TrainingRecordStatus;
  createdAt?: string;
}

export interface TrainingRecordGroup {
  participantId: string;
  trainingId: string;
  trainingInterval: number;
  participantName: string;
  trainingName: string;
  records: TrainingRecordEntry[];
}

export interface TrainingRecordsListResponse {
  trainingRecords: TrainingRecordGroup[];
  totalData: number;
  totalPages: number;
}

export interface UpdateTrainingRecordStatusInput {
  status: TrainingRecordStatus;
}
