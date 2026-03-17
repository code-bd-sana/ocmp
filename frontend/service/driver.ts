import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { AuthAction } from "./auth";
import { UserAction } from "./user";
import {
  CreateDriverInput,
  DriverListResponse,
  DriverRow,
  UpdateDriverInput,
} from "@/lib/drivers/driver.types";
import axios from "axios";

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
 * Get the current user's role (cached or fresh fetch)
 */
let cachedUserRole: string | null = null;
const getUserRole = async (): Promise<string | null> => {
  if (cachedUserRole) return cachedUserRole;
  try {
    const profileResp = await UserAction.getProfile();
    cachedUserRole = profileResp.data?.role || null;
    return cachedUserRole;
  } catch {
    return null;
  }
};

/**
 * GET /api/v1/driver/get-drivers
 *
 * For STANDALONE_USER: No standAloneId parameter (gets their own drivers)
 * For TRANSPORT_MANAGER: With standAloneId parameter (gets specific client's drivers)
 */
const getDrivers = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<DriverListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    // For standalone users, don't include standAloneId in query params
    const queryParams =
      userRole === "STANDALONE_USER"
        ? {
            searchKey: params?.searchKey || undefined,
            showPerPage: params?.showPerPage || 10,
            pageNo: params?.pageNo || 1,
          }
        : {
            standAloneId,
            searchKey: params?.searchKey || undefined,
            showPerPage: params?.showPerPage || 10,
            pageNo: params?.pageNo || 1,
          };

    const response = await axios.get<IApiResponse<DriverListResponse>>(
      `${base_url}/driver/get-drivers`,
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
 * GET /api/v1/driver/get-driver/:id
 *
 * For STANDALONE_USER: GET /api/v1/driver/get-driver/:id (only driver ID)
 * For TRANSPORT_MANAGER: GET /api/v1/driver/get-driver/:id/:standAloneId (both IDs)
 */
const getDriver = async (
  driverId: string,
  standAloneId: string,
): Promise<IApiResponse<DriverRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    // For standalone users, only use driverId; for transport managers, use both
    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/driver/get-driver/${driverId}`
        : `${base_url}/driver/get-driver/${driverId}/${standAloneId}`;

    const response = await axios.get<IApiResponse<DriverRow>>(url, {
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
 * POST /api/v1/driver/create-driver or /api/v1/driver/create-stand-alone-driver
 *
 * For STANDALONE_USER: POST /api/v1/driver/create-stand-alone-driver
 * For TRANSPORT_MANAGER: POST /api/v1/driver/create-driver (with standAloneId in body)
 */
const createDriver = async (data: CreateDriverInput): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const endpoint =
      userRole === "STANDALONE_USER"
        ? `${base_url}/driver/create-stand-alone-driver`
        : `${base_url}/driver/create-driver`;

    const formData = new FormData();

    formData.append("fullName", data.fullName);
    formData.append("licenseNumber", data.licenseNumber);
    formData.append("postCode", data.postCode);
    formData.append("niNumber", data.niNumber);
    formData.append("nextCheckDueDate", data.nextCheckDueDate);
    formData.append("points", String(data.points));
    formData.append("checkFrequencyDays", String(data.checkFrequencyDays));
    formData.append("employed", String(data.employed));

    // Only add standAloneId for transport managers
    if (userRole === "TRANSPORT_MANAGER" && data.standAloneId) {
      formData.append("standAloneId", data.standAloneId);
    }

    if (data.licenseExpiry)
      formData.append("licenseExpiry", data.licenseExpiry);
    if (data.licenseExpiryDTC)
      formData.append("licenseExpiryDTC", data.licenseExpiryDTC);
    if (data.cpcExpiry) formData.append("cpcExpiry", data.cpcExpiry);
    if (data.lastChecked) formData.append("lastChecked", data.lastChecked);
    if (data.checkStatus) formData.append("checkStatus", data.checkStatus);

    if (data.endorsementCodes?.length) {
      data.endorsementCodes.forEach((code) => {
        formData.append("endorsementCodes", code);
      });
    }

    if (data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await axios.post<IApiResponse>(endpoint, formData, {
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
 * PATCH /api/v1/driver/update-driver/:id
 *
 * For STANDALONE_USER: PATCH /api/v1/driver/update-driver/:id (only driver ID)
 * For TRANSPORT_MANAGER: PATCH /api/v1/driver/update-driver-by-manager/:driverId/:standAloneId (both IDs)
 */
const updateDriver = async (
  driverId: string,
  standAloneId: string,
  data: UpdateDriverInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/driver/update-driver/${driverId}`
        : `${base_url}/driver/update-driver-by-manager/${driverId}/${standAloneId}`;

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
 * DELETE /api/v1/driver/delete-driver/:id
 *
 * For STANDALONE_USER: DELETE /api/v1/driver/delete-driver/:id (only driver ID)
 * For TRANSPORT_MANAGER: DELETE /api/v1/driver/delete-driver-by-manager/:driverId/:standAloneId (both IDs)
 */
const deleteDriver = async (
  driverId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/driver/delete-driver/${driverId}`
        : `${base_url}/driver/delete-driver-by-manager/${driverId}/${standAloneId}`;

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

export const DriverAction = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
};
