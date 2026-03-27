export interface TrainingToolboxAttachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

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
  attachments?: TrainingToolboxAttachment[];
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
  attachments?: File[];
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
  attachments?: File[];
  removeAttachmentIds?: string[];
}
