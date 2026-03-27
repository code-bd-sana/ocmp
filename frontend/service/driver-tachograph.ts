import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { AuthAction } from "./auth";
import {
  CreateDriverTachographInput,
  DriverTachographListResponse,
  DriverTachographRow,
  DriverWithVehicles,
  UpdateDriverTachographInput,
} from "@/lib/driver-tachograph/tachograph.types";
import axios from "axios";
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

type DriverTachographListPayload = {
  tachographs?: DriverTachographRow[];
  driverTachographs?: DriverTachographRow[];
  totalData?: number;
  totalPages?: number;
};

function normalizeDriverTachographListResponse(
  raw: IApiResponse<DriverTachographListPayload>,
): IApiResponse<DriverTachographListResponse> {
  const rawData = raw.data;
  const normalizedTachographs = Array.isArray(rawData?.tachographs)
    ? rawData.tachographs
    : Array.isArray(rawData?.driverTachographs)
      ? rawData.driverTachographs
      : [];

  return {
    ...raw,
    data: {
      tachographs: normalizedTachographs,
      totalData: rawData?.totalData ?? 0,
      totalPages: rawData?.totalPages ?? 0,
    },
  };
}



/**
 * GET /api/v1/driver-tachograph/get-driver-tachograph/many
 * Fetches paginated driver tachographs - role-aware routing
 * For TM: standAloneId in query params required
 * For SA: standAloneId not used
 */
const getDriverTachographs = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<DriverTachographListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");
  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<DriverTachographListPayload>>(
      `${base_url}/driver-tachograph/get-driver-tachograph/many`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      },
    );

    return normalizeDriverTachographListResponse(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * GET /api/v1/driver-tachograph/get-driver-tachograph/:id
 * or /api/v1/driver-tachograph/get-driver-tachograph/:id/:standAloneId
 * Fetches a single driver tachograph - role-aware routing
 * For TM: uses /get-driver-tachograph/:id/:standAloneId
 * For SA: uses /get-driver-tachograph/:id
 */
const getDriverTachograph = async (
  tachographId: string,
  standAloneId: string,
): Promise<IApiResponse<DriverTachographRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    // TM: separate route with standAloneId in URL path
    // SA: separate route without standAloneId
    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/driver-tachograph/get-driver-tachograph/${tachographId}`
        : `${base_url}/driver-tachograph/get-driver-tachograph/${tachographId}/${standAloneId}`;

    const response = await axios.get<IApiResponse<DriverTachographRow>>(url, {
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
 * POST /api/v1/driver-tachograph/create-driver-tachograph
 * or /api/v1/driver-tachograph/create-stand-alone-driver-tachograph
 * Creates a new driver tachograph - role-aware routing and body filtering
 */
const createDriverTachograph = async (
  data: CreateDriverTachographInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint =
      isStandaloneRole(userRole)
        ? `${base_url}/driver-tachograph/create-stand-alone-driver-tachograph`
        : `${base_url}/driver-tachograph/create-driver-tachograph`;

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
 * PATCH /api/v1/driver-tachograph/update-driver-tachograph/:id
 * or /api/v1/driver-tachograph/update-driver-tachograph/:id/:standAloneId
 * Updates a driver tachograph - role-aware routing
 */
const updateDriverTachograph = async (
  tachographId: string,
  standAloneId: string,
  data: UpdateDriverTachographInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    // TM: separate route with standAloneId in URL path
    // SA: separate route without standAloneId
    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/driver-tachograph/update-driver-tachograph/${tachographId}`
        : `${base_url}/driver-tachograph/update-driver-tachograph/${tachographId}/${standAloneId}`;

    const updateBody = { ...data };
    delete updateBody.id;

    const response = await axios.patch<IApiResponse>(url, updateBody, {
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
 * DELETE /api/v1/driver-tachograph/delete-driver-tachograph/:id
 * or /api/v1/driver-tachograph/delete-driver-tachograph/:id/:standAloneId
 * Deletes a driver tachograph - role-aware routing
 */
const deleteDriverTachograph = async (
  tachographId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    // TM: separate route with standAloneId in URL path
    // SA: separate route without standAloneId
    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/driver-tachograph/delete-driver-tachograph/${tachographId}`
        : `${base_url}/driver-tachograph/delete-driver-tachograph/${tachographId}/${standAloneId}`;

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

/**
 * GET /api/v1/working-time-directive/get-drivers-with-vehicles?standAloneId=...
 * Fetches drivers and their assigned vehicles for a specific client.
 */
const getDriversWithVehicles = async (
  standAloneId: string,
): Promise<IApiResponse<DriverWithVehicles[]>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {});

    const response = await axios.get<IApiResponse<DriverWithVehicles[]>>(
      `${base_url}/working-time-directive/get-drivers-with-vehicles`,
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

export const DriverTachographAction = {
  getDriverTachographs,
  getDriverTachograph,
  createDriverTachograph,
  updateDriverTachograph,
  deleteDriverTachograph,
  getDriversWithVehicles,
};
