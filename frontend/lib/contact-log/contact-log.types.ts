export interface ContactLogRow {
  _id: string;
  date: string;
  contactMethod?: string;
  person: string;
  subject: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactLogListResponse {
  contactLogs: ContactLogRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateContactLogInput {
  date: string;
  person: string;
  subject: string;
  standAloneId?: string;
  contactMethod?: string;
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface UpdateContactLogInput {
  date?: string;
  contactMethod?: string;
  person?: string;
  subject?: string;
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}
