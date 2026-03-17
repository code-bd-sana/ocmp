import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  CreateSpotCheckInput,
  UpdateSpotCheckInput,
  SpotCheckListResponse,
  SpotCheckRow,
} from "@/lib/spot-checks/spot-check.types";
import { UserAction } from "./user";

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
 * GET /api/v1/spot-check/get-spot-check/many?standAloneId=...
 */
const getSpotChecks = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<SpotCheckListResponse>> => {
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

    const response = await axios.get<IApiResponse<SpotCheckListResponse>>(
      `${base_url}/spot-check/get-spot-check/many`,
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
 * GET /api/v1/spot-check/get-spot-check/:id?standAloneId=...
 */
const getSpotCheck = async (
  spotCheckId: string,
  standAloneId: string,
): Promise<IApiResponse<SpotCheckRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    // Backend route: /get-spot-check/:id with optional standAloneId query param for TM
    // SA users: no standAloneId in any form
    // TM users: standAloneId must be in query params (not URL path)
    const url = `${base_url}/spot-check/get-spot-check/${spotCheckId}`;
    const params =
      userRole === "STANDALONE_USER"
        ? {} // SA users should not send standAloneId
        : { standAloneId }; // TM users must send standAloneId in query

    const response = await axios.get<IApiResponse<SpotCheckRow>>(url, {
      headers: { Authorization: `Bearer ${token}` },
      params,
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
 * POST /api/v1/spot-check/create-spot-check
 */
const createSpotCheck = async (
  data: CreateSpotCheckInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();
    const endpoint =
      userRole === "STANDALONE_USER"
        ? `${base_url}/spot-check/create-stand-alone-spot-check`
        : `${base_url}/spot-check/create-spot-check`;

    // SA endpoint uses .strict() — must not include standAloneId in body
    const body =
      userRole === "STANDALONE_USER"
        ? Object.fromEntries(
            Object.entries(data).filter(([key]) => key !== "standAloneId"),
          )
        : data;

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
 * PATCH /api/v1/spot-check/update-spot-check/:id/:standAloneId
 */
const updateSpotCheck = async (
  spotCheckId: string,
  standAloneId: string,
  data: UpdateSpotCheckInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/spot-check/update-spot-check/${spotCheckId}`
        : `${base_url}/spot-check/update-spot-check/${spotCheckId}/${standAloneId}`;

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
 * DELETE /api/v1/spot-check/delete-spot-check/:id/:standAloneId
 */
const deleteSpotCheck = async (
  spotCheckId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/spot-check/delete-spot-check/${spotCheckId}`
        : `${base_url}/spot-check/delete-spot-check/${spotCheckId}/${standAloneId}`;

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

export const SpotCheckAction = {
  getSpotChecks,
  getSpotCheck,
  createSpotCheck,
  updateSpotCheck,
  deleteSpotCheck,
};
