/**
 * Types for the Transport Manager Training page.
 */

export enum TransportManagerTrainingRenewalTracker {
  NO = "NO",
  RECOMMENDED = "RECOMMENDED",
}

/** Shape of a single transport-manager-training returned by backend */
export interface TransportManagerTrainingRow {
  _id: string;
  name: string;
  trainingCourse: string;
  unitTitle: string;
  completionDate: string;
  renewalTracker: TransportManagerTrainingRenewalTracker;
  nextDueDate?: string;
  attachments: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated response shape from GET /transport-manager-training/get-transport-manager-training/many */
export interface TransportManagerTrainingListResponse {
  transportManagerTrainings: TransportManagerTrainingRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /transport-manager-training/create-transport-manager-training */
export interface CreateTransportManagerTrainingInput {
  trainingCourse: string;
  unitTitle: string;
  completionDate: string;
  renewalTracker: TransportManagerTrainingRenewalTracker;
  nextDueDate?: string;
  attachments: string[];
}

/** Body for PATCH /transport-manager-training/update-transport-manager-training/:id */
export interface UpdateTransportManagerTrainingInput {
  trainingCourse?: string;
  unitTitle?: string;
  completionDate?: string;
  renewalTracker?: TransportManagerTrainingRenewalTracker;
  nextDueDate?: string;
  attachments?: string[];
}
