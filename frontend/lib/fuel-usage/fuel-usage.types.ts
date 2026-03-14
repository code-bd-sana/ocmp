export interface FuelUsageRow {
  _id: string;
  vehicleId: string;
  driverId: string;
  date: string; // ISO string
  adBlueUsed?: number;
  fuelUsed?: number;
  standAloneId?: string;
  createdBy: string;
  /** Populate by $lookup in getMany */
  driver?: {
    _id: string;
    fullName: string;
    licenseNumber?: string;
  };
  /** Populate by $lookup in getMany */
  vehicle?: {
    _id: string;
    vehicleRegId: string;
    vehicleType?: string;
    licensePlate?: string;
    status?: string;
  };
}

/** Paginated list response from GET */
export interface FuelUsageListResponse {
  fuelUsages: FuelUsageRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST */
export interface CreateFuelUsageBody {
  vehicleId: string;
  driverId: string;
  date: string; // ISO string
  adBlueUsed?: number;
  fuelUsed?: number;
  standAloneId?: string;
}

/** Body for PATCH */
export interface UpdateFuelUsageBody {
  vehicleId?: string;
  driverId?: string;
  date?: string; // ISO string
  adBlueUsed?: number;
  fuelUsed?: number;
  standAloneId?: string;
}

/** A driver with their Assigned Vehicles */
export interface DriverWithVehicles {
  _id: string;
  fullName: string;
  licenseNumber?: string;
  vehicles: {
    _id: string;
    vehicleRegId: string;
    vehicleType?: string;
    licensePlate?: string;
    status?: string;
  }[];
}
