/**
 * OCRS Plan Types
 */

export interface DocumentItem {
  textDoc?: Array<{
    label: string;
    description: string;
  }>;
  attachments?: string[];
}

export interface OcrsPlanAttachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

export interface OcrsPlanRow {
  _id: string;
  roadWorthinessScore?: string;
  overallTrafficScore?: string;
  actionRequired?: string;
  attachments?: OcrsPlanAttachment[];
  documents?: DocumentItem[];
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOcrsPlanInput {
  roadWorthinessScore?: string;
  overallTrafficScore?: string;
  actionRequired?: string;
  attachments?: File[];
  documents?: DocumentItem[];
  standAloneId: string;
}

export interface CreateOcrsPlanAsStandAloneInput {
  roadWorthinessScore?: string;
  overallTrafficScore?: string;
  actionRequired?: string;
  attachments?: File[];
  documents?: DocumentItem[];
}

export interface UpdateOcrsPlanInput {
  roadWorthinessScore?: string;
  overallTrafficScore?: string;
  actionRequired?: string;
  attachments?: File[];
  removeAttachmentIds?: string[];
  documents?: DocumentItem[];
}

export interface UpdateOcrsPlanAsStandAloneInput {
  roadWorthinessScore?: string;
  overallTrafficScore?: string;
  actionRequired?: string;
  attachments?: File[];
  removeAttachmentIds?: string[];
  documents?: DocumentItem[];
}
