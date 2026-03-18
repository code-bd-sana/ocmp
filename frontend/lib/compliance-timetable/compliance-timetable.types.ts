export type ComplianceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ComplianceTimetableRow {
  _id: string;
  task: string;
  responsibleParty?: string;
  dueDate?: string;
  status?: ComplianceStatus;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceTimetableListResponse {
  complianceTimetables: ComplianceTimetableRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateComplianceTimetableInput {
  task: string;
  responsibleParty: string;
  standAloneId?: string;
  dueDate?: string;
  status?: ComplianceStatus;
}

export interface UpdateComplianceTimetableInput {
  task?: string;
  responsibleParty?: string;
  dueDate?: string;
  status?: ComplianceStatus;
}
