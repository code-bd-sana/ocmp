export type AttendanceType =
  | "Email"
  | "Phone Call"
  | "Physical Visit"
  | "Other";

export interface MeetingNoteRow {
  _id: string;
  meetingDate: string;
  attendance?: AttendanceType;
  keyDiscussionPoints?: string;
  discussion?: string;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingNoteListResponse {
  meetingNotes: MeetingNoteRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateMeetingNoteInput {
  meetingDate: string;
  attendance?: AttendanceType;
  keyDiscussionPoints?: string;
  discussion?: string;
  standAloneId?: string;
}

export interface UpdateMeetingNoteInput {
  meetingDate?: string;
  attendance?: AttendanceType;
  keyDiscussionPoints?: string;
  discussion?: string;
}

export type CommunicationType =
  | "Email"
  | "Phone Call"
  | "Physical Visit"
  | "Other";

export interface MaintenanceProviderCommunicationRow {
  _id: string;
  providerName: string;
  dateOfCommunication: string;
  type?: CommunicationType;
  details?: string;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceProviderCommunicationListResponse {
  maintenanceProviderCommunications: MaintenanceProviderCommunicationRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateMaintenanceProviderCommunicationInput {
  providerName: string;
  dateOfCommunication: string;
  type: CommunicationType;
  details?: string;
  standAloneId?: string;
}

export interface UpdateMaintenanceProviderCommunicationInput {
  providerName?: string;
  dateOfCommunication?: string;
  type?: CommunicationType;
  details?: string;
}
