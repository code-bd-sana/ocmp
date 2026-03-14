export interface TrainingToolboxRow {
  _id: string;
  date: string;
  driverId: string;
  driverName: string;
  toolboxTitle: string;
  typeOfToolbox: string;
  deliveredBy: string;
  notes?: string;
  signed?: boolean;
  followUpNeeded?: boolean;
  followUpDate?: string;
  signOff?: boolean;
  attachments?: string[];
  standAloneId?: string;
  createdBy?: string;
}

export interface TrainingToolboxListResponse {
  toolboxes: TrainingToolboxRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateTrainingToolboxInput {
  date: string;
  driverId: string;
  toolboxTitle: string;
  typeOfToolbox: string;
  deliveredBy?: string;
  notes?: string;
  signed?: boolean;
  followUpNeeded?: boolean;
  followUpDate?: string;
  signOff?: boolean;
  attachments?: string[];
  standAloneId?: string;
}

export interface UpdateTrainingToolboxInput {
  date?: string;
  driverId?: string;
  toolboxTitle?: string;
  typeOfToolbox?: string;
  deliveredBy?: string;
  notes?: string;
  signed?: boolean;
  followUpNeeded?: boolean;
  followUpDate?: string;
  signOff?: boolean;
  attachments?: string[];
}
