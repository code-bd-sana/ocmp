/** Shape returned by the backend for a single working time directive */
export interface WorkingTimeDirectiveRow {
  _id: string;
  driverId: string;
  vehicleId: string;
  workingHours: number;
  restHours?: number;
  complianceStatus?: string;
  tachoReportAvailable?: boolean;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  /** Populated by $lookup in getMany */
  driver?: {
    _id: string;
    fullName: string;
    licenseNumber?: string;
  };
  /** Populated by $lookup in getMany */
  vehicle?: {
    _id: string;
    vehicleRegId: string;
    vehicleType?: string;
    licensePlate?: string;
    status?: string;
  };
}

/** Paginated list response from GET /get-working-time-directives */
export interface WorkingTimeDirectiveListResponse {
  workingTimeDirectives: WorkingTimeDirectiveRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /create-working-time-directive (TM) */
export interface CreateWorkingTimeDirectiveInput {
  driverId: string;
  vehicleId: string;
  workingHours: number;
  restHours?: number;
  complianceStatus?: string;
  tachoReportAvailable?: boolean;
  standAloneId: string;
}

/** Body for PATCH /update-working-time-directive-by-manager/:id/:standAloneId */
export interface UpdateWorkingTimeDirectiveInput {
  driverId?: string;
  vehicleId?: string;
  workingHours?: number;
  restHours?: number;
  complianceStatus?: string;
  tachoReportAvailable?: boolean;
}

/** A driver with their assigned vehicles (from get-drivers-with-vehicles) */
export interface DriverWithVehicles {
  _id: string;
  fullName: string;
  licenseNumber: string;
  vehicles: {
    _id: string;
    vehicleRegId: string;
    vehicleType: string;
    licensePlate: string;
    status: string;
  }[];
}
