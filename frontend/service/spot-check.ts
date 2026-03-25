import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  CreateSpotCheckInput,
  UpdateSpotCheckInput,
  SpotCheckListResponse,
  SpotCheckRow,
} from "@/lib/spot-checks/spot-check.types";
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
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

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
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    // Backend route: /get-spot-check/:id with optional standAloneId query param for TM
    // SA users: no standAloneId in any form
    // TM users: standAloneId must be in query params (not URL path)
    const url = `${base_url}/spot-check/get-spot-check/${spotCheckId}`;
    const params = isStandaloneRole(userRole)
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
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint =
      isStandaloneRole(userRole)
        ? `${base_url}/spot-check/create-stand-alone-spot-check`
        : `${base_url}/spot-check/create-spot-check`;

    const formData = new FormData();

    formData.append("vehicleId", data.vehicleId);
    formData.append("issueDetails", data.issueDetails);

    if (!isStandaloneRole(userRole) && data.standAloneId) {
      formData.append("standAloneId", data.standAloneId);
    }

    if (data.reportedBy) formData.append("reportedBy", data.reportedBy);
    if (data.rectificationRequired) {
      formData.append("rectificationRequired", data.rectificationRequired);
    }
    if (data.actionTaken) formData.append("actionTaken", data.actionTaken);
    if (data.dateCompleted) formData.append("dateCompleted", data.dateCompleted);
    if (data.completedBy) formData.append("completedBy", data.completedBy);
    if (data.followUpNeeded) {
      formData.append("followUpNeeded", data.followUpNeeded);
    }
    if (data.notes) formData.append("notes", data.notes);

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
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const formData = new FormData();

    if (data.vehicleId) formData.append("vehicleId", data.vehicleId);
    if (data.issueDetails) formData.append("issueDetails", data.issueDetails);
    if (data.rectificationRequired) {
      formData.append("rectificationRequired", data.rectificationRequired);
    }
    if (data.actionTaken) formData.append("actionTaken", data.actionTaken);
    if (data.dateCompleted) formData.append("dateCompleted", data.dateCompleted);
    if (data.completedBy) formData.append("completedBy", data.completedBy);
    if (data.followUpNeeded) {
      formData.append("followUpNeeded", data.followUpNeeded);
    }
    if (data.notes) formData.append("notes", data.notes);

    if (data.removeAttachmentIds?.length) {
      data.removeAttachmentIds.forEach((id) => {
        formData.append("removeAttachmentIds", id);
      });
    }

    if (data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const url =
      isStandaloneRole(userRole)
        ? `${base_url}/spot-check/update-spot-check/${spotCheckId}`
        : `${base_url}/spot-check/update-spot-check/${spotCheckId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse>(url, formData, {
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
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const url =
      isStandaloneRole(userRole)
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
