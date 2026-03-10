export interface trafficCommissionerRow {
  _id: string;
  type: string;
  contactedPerson: string;
  reason: string;
  communicationDate: string;
  attachments?: string[];
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
  attachments?: string[];
  comments?: string;
  standAloneId?: string;
}

export interface UpdateTrafficCommissionerInput {
  type?: string;
  contactedPerson?: string;
  reason?: string;
  communicationDate?: string;
  attachments?: string[];
  comments?: string;
}
