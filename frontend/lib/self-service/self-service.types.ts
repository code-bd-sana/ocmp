export interface SelfServiceRow {
  _id: string;
  serviceName: string;
  description?: string;
  serviceLink?: string;
  standAloneId?: string;
  createdBy?: string;
}

export interface SelfServiceListResponse {
  selfServices: SelfServiceRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateSelfServiceInput {
  serviceName: string;
  description?: string;
  serviceLink?: string;
  standAloneId?: string;
}

export interface UpdateSelfServiceInput {
  serviceName?: string;
  description?: string;
  serviceLink?: string;
}
