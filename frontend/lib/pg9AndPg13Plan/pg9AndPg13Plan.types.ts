export interface Pg9AndPg13PlanRow {
  _id: string;
  vehicleId: string;
  issueType: string;
  defectDescription?: string;
  clearanceStatus?: string;
  tcContactMade?: boolean;
  maintenanceProvider?: string;
  meetingDate?: string;
  notes?: string;
  followUp?: boolean;
  standAloneId?: string;
  createdBy: string;
}

export interface Pg9AndPg13PlanListResponse {
  pg9AndPg13Plans: Pg9AndPg13PlanRow[];
  totalData: number;
  totalPages: number;
}

export interface CreatePg9AndPg13PlanInput {
  vehicleId: string;
  issueType: string;
  defectDescription?: string;
  clearanceStatus?: string;
  tcContactMade?: boolean;
  maintenanceProvider?: string;
  meetingDate?: string;
  notes?: string;
  followUp?: boolean;
  standAloneId?: string;
}

export interface UpdatePg9AndPg13PlanInput {
  vehicleId?: string;
  issueType?: string;
  defectDescription?: string;
  clearanceStatus?: string;
  tcContactMade?: boolean;
  maintenanceProvider?: string;
  meetingDate?: string;
  notes?: string;
  followUp?: boolean;
  standAloneId?: string;
}
