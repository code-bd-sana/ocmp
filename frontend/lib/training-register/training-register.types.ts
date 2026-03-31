export type TrainingRegisterStatus =
  | "Pending"
  | "Overdue"
  | "Upcoming"
  | "Completed";

export interface TrainingRegisterListItem {
  _id: string;
  participant?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  training?: {
    _id?: string;
    trainingName?: string;
  } | null;
  trainingInterval: number;
  trainingDate: string;
  status: TrainingRegisterStatus;
  standAloneId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingRegisterListResponse {
  registers: TrainingRegisterListItem[];
  totalData: number;
  totalPages: number;
}

export interface TrainingRegisterDetail {
  _id: string;
  participantId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  } | string | null;
  trainingId?: {
    _id?: string;
    trainingName?: string;
    intervalDays?: number[];
  } | string | null;
  trainingInterval: number;
  trainingDate: string;
  status: TrainingRegisterStatus;
  standAloneId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainingRegisterInput {
  participantId: string;
  trainingId: string;
  trainingInterval: number;
  trainingDate: string;
  standAloneId?: string;
}

export interface UpdateTrainingRegisterInput {
  participantId?: string;
  trainingId?: string;
  trainingInterval?: number;
  trainingDate?: string;
  status?: TrainingRegisterStatus;
}
