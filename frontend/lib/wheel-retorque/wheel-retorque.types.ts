export interface WheelReTorqueRow {
  _id: string;
  vehicleId: string;
  dateChanged?: string;
  tyreSize?: string;
  tyreLocation?: string;
  reTorqueDue?: string;
  reTorqueCompleted?: string;
  technician?: string;
  standAloneId?: string;
  createdBy: string;
}

export interface WheelReTorqueListResponse {
  wheelReTorqueRecords: WheelReTorqueRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateWheelReTorqueInput {
  vehicleId: string;
  dateChanged?: string;
  tyreSize?: string;
  tyreLocation?: string;
  reTorqueDue?: string;
  reTorqueCompleted?: string;
  technician?: string;
  standAloneId?: string;
}

export interface UpdateWheelReTorqueInput {
  vehicleId?: string;
  dateChanged?: string;
  tyreSize?: string;
  tyreLocation?: string;
  reTorqueDue?: string;
  reTorqueCompleted?: string;
  technician?: string;
  standAloneId?: string;
}
