export type AuditStatus = "In Progress" | "Completed" | "Pending";

export interface AuditRectificationReportRow {
  _id: string;
  auditDate?: string;
  title: string;
  type: string;
  auditDetails?: string;
  status?: AuditStatus;
  responsiblePerson?: string;
  finalizeDate?: string;
  attachments?: string[];
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditRectificationReportListResponse {
  AuditAndRecificationReports: AuditRectificationReportRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateAuditRectificationReportInput {
  title: string;
  type: string;
  standAloneId: string;
  auditDate?: string;
  auditDetails?: string;
  status?: AuditStatus;
  responsiblePerson?: string;
  finalizeDate?: string;
  attachments?: string[];
}

export interface UpdateAuditRectificationReportInput {
  auditDate?: string;
  title?: string;
  type?: string;
  auditDetails?: string;
  status?: AuditStatus;
  responsiblePerson?: string;
  finalizeDate?: string;
  attachments?: string[];
}
