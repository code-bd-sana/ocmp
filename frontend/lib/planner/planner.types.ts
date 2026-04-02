export enum PlannerType {
  INSPECTIONS = "INSPECTIONS",
  MOT = "MOT",
  BRAKE_TEST = "BRAKE_TEST",
  SERVICE = "SERVICE",
  REPAIR = "REPAIR",
  TACHO_RECALIBRATION = "TACHO_RECALIBRATION",
  VED = "VED",
}

export enum PlannerStatus {
  SCHEDULED = "SCHEDULED",
  DUE = "DUE",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface PlannerRow {
  _id: string;
  vehicleId:
    | string
    | { _id: string; licensePlate?: string; vehicleRegId?: string };
  plannerType: PlannerType;
  plannerDate: string;
  PlannerStatus?: PlannerStatus;
  requestedDate?: string;
  requestedReason?: string;
  requestStatus?: RequestStatus;
  standAloneId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlannerListResponse {
  planners: PlannerRow[];
  totalData: number;
  totalPages: number;
}

export interface CreatePlannerInput {
  vehicleId: string;
  plannerType: PlannerType;
  plannerDate: string;
  standAloneId?: string;
  requestedDate?: string;
  requestedReason?: string;
}

export interface UpdatePlannerInput {
  plannerDate: string;
}

export interface RequestChangePlannerDateInput {
  requestedDate: string;
  requestedReason: string;
}
