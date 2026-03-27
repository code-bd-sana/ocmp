import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListResponse,
  VehicleRow,
} from "@/lib/vehicles/vehicle.types";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

/**
 * Extract the most useful error message from a backend error response.
 */
function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  if (typeof data.error === "string" && data.error) return data.error;

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const msgs = (data.errors as { field?: string; message: string }[]).map(
        (e) => (e.field ? `${e.field}: ${e.message}` : e.message),
      );
      return msgs.join(", ");
    }
    if (typeof data.errors === "string") return data.errors;
  }

  if (data.message && data.message !== "An unexpected error occurred")
    return data.message;

  return "Something went wrong";
}

/**
 * GET /api/v1/vehicle/get-vehicle/many
 *
 * For STANDALONE_USER: No standAloneId parameter (gets their own vehicles)
 * For TRANSPORT_MANAGER: With standAloneId parameter (gets specific client's vehicles)
 */
const getVehicles = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<VehicleListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<VehicleListResponse>>(
      `${base_url}/vehicle/get-vehicle/many`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * GET /api/v1/vehicle/get-vehicle/:id
 *
 * For STANDALONE_USER: GET /api/v1/vehicle/get-vehicle/:id (only vehicle ID)
 * For TRANSPORT_MANAGER: GET /api/v1/vehicle/get-vehicle/:id/:standAloneId (both IDs)
 */
const getVehicle = async (
  vehicleId: string,
  standAloneId: string,
): Promise<IApiResponse<VehicleRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    // For standalone users, only use vehicleId; for transport managers, use both
    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/vehicle/get-vehicle/${vehicleId}`
        : `${base_url}/vehicle/get-vehicle/${vehicleId}/${standAloneId}`;

    const response = await axios.get<IApiResponse<VehicleRow>>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * POST /api/v1/vehicle/create-vehicle or /api/v1/vehicle/create-stand-alone-vehicle
 *
 * For STANDALONE_USER: POST /api/v1/vehicle/create-stand-alone-vehicle
 * For TRANSPORT_MANAGER: POST /api/v1/vehicle/create-vehicle (with standAloneId in body)
 */
const createVehicle = async (
  data: CreateVehicleInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint =
      isStandaloneRole(userRole)
        ? `${base_url}/vehicle/create-stand-alone-vehicle`
        : `${base_url}/vehicle/create-vehicle`;

    // SA endpoint uses .strict() — must not include standAloneId in body
    const { standAloneId: _standAloneId, ...saData } = data;
    const body = isStandaloneRole(userRole) ? saData : data;

    const response = await axios.post<IApiResponse>(endpoint, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * PATCH /api/v1/vehicle/update-vehicle/:id
 *
 * For STANDALONE_USER: PATCH /api/v1/vehicle/update-vehicle/:id (only vehicle ID)
 * For TRANSPORT_MANAGER: PATCH /api/v1/vehicle/update-vehicle/:vehicleId/:standAloneId (both IDs)
 */
const updateVehicle = async (
  vehicleId: string,
  standAloneId: string,
  data: UpdateVehicleInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/vehicle/update-vehicle/${vehicleId}`
        : `${base_url}/vehicle/update-vehicle/${vehicleId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse>(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * DELETE /api/v1/vehicle/delete-vehicle/:id
 *
 * For STANDALONE_USER: DELETE /api/v1/vehicle/delete-vehicle/:id (only vehicle ID)
 * For TRANSPORT_MANAGER: DELETE /api/v1/vehicle/delete-vehicle/:vehicleId/:standAloneId (both IDs)
 */
const deleteVehicle = async (
  vehicleId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/vehicle/delete-vehicle/${vehicleId}`
        : `${base_url}/vehicle/delete-vehicle/${vehicleId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

export const VehicleAction = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
