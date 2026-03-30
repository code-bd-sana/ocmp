export interface TrainingListItem {
  _id: string;
  trainingName: string;
  firstIntervalDay: number | null;
  totalIntervals: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingListResponse {
  trainings: TrainingListItem[];
  totalData: number;
  totalPages: number;
}

export interface CreateTrainingInput {
  trainingName: string;
  intervalDays: string;
  standAloneId?: string;
}

export interface TrainingDetail {
  _id: string;
  trainingName: string;
  intervalDays: number[];
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTrainingInput {
  trainingName?: string;
  intervalDays?: string;
}
