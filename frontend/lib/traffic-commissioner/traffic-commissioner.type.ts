export interface TrafficCommissionerAttachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

export interface trafficCommissionerRow {
  _id: string;
  type: string;
  contactedPerson: string;
  reason: string;
  communicationDate: string;
  attachments?: TrafficCommissionerAttachment[];
  comments?: string;
  standAloneId?: string;
  createdBy?: string;
}

export interface trafficCommissionerListResponse {
  communications: trafficCommissionerRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateTrafficCommissionerInput {
  type: string;
  contactedPerson: string;
  reason: string;
  communicationDate: string;
  attachments?: File[];
  comments?: string;
  standAloneId?: string;
}

export interface UpdateTrafficCommissionerInput {
  type?: string;
  contactedPerson?: string;
  reason?: string;
  communicationDate?: string;
  attachments?: File[];
  removeAttachmentIds?: string[];
  comments?: string;
}
