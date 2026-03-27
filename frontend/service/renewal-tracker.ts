import { AuthAction, IApiResponse } from "./auth";
import axios from "axios";
import { base_url } from "@/lib/utils";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";
import {
  CreateRenewalTrackerInput,
  RenewalTrackerRow,
  UpdateRenewalTrackerInput,
} from "@/lib/renewal-tracker/renewal-tracker.types";

interface RenewalTrackersListResponse {
  renewalTrackers: RenewalTrackerRow[];
  totalData: number;
  totalPages: number;
}

interface SearchParams {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}

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

  if (data.message && data.message !== "An unexpected error occurred") {
    return data.message;
  }

  return "Something went wrong";
}



export const RenewalTrackerAction = {
  /**
   * GET /api/v1/renewal-tracker/get-renewal-tracker/many
   */
  async getRenewalTrackers(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<IApiResponse<RenewalTrackersListResponse>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();

      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

      const response = await axios.get<IApiResponse<RenewalTrackersListResponse>>(
        `${base_url}/renewal-tracker/get-renewal-tracker/many`,
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
  },

  /**
   * GET /api/v1/renewal-tracker/get-renewal-tracker/:id
   */
  async getRenewalTracker(
    id: string,
    standAloneId: string,
  ): Promise<IApiResponse<RenewalTrackerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url =
        isStandaloneRole(userRole)
          ? `${base_url}/renewal-tracker/get-renewal-tracker/${id}`
          : `${base_url}/renewal-tracker/get-renewal-tracker/${id}/${standAloneId}`;

      const response = await axios.get<IApiResponse<RenewalTrackerRow>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<IApiResponse>(error)) {
        throw new Error(extractApiError(error.response?.data));
      }
      throw new Error("Something went wrong");
    }
  },

  /**
   * POST /api/v1/renewal-tracker/create-renewal-tracker
   */
  async createRenewalTracker(
    data: CreateRenewalTrackerInput,
  ): Promise<IApiResponse<RenewalTrackerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const isStandalone = isStandaloneRole(userRole);
      const endpoint = isStandalone
        ? `${base_url}/renewal-tracker/create-stand-alone-renewal-tracker`
        : `${base_url}/renewal-tracker/create-renewal-tracker`;

      // If standalone, remove standAloneId from body to satisfy .strict() Zod schema
      const standAloneBody = { ...data };
      delete (standAloneBody as { standAloneId?: string }).standAloneId;
      const body = isStandalone ? standAloneBody : data;

      const response = await axios.post<IApiResponse<RenewalTrackerRow>>(
        endpoint,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<IApiResponse>(error)) {
        throw new Error(extractApiError(error.response?.data));
      }
      throw new Error("Something went wrong");
    }
  },

  /**
   * PATCH /api/v1/renewal-tracker/update-renewal-tracker/:id/:standAloneId
   */
  async updateRenewalTracker(
    id: string,
    standAloneId: string,
    data: UpdateRenewalTrackerInput,
  ): Promise<IApiResponse<RenewalTrackerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url =
        isStandaloneRole(userRole)
          ? `${base_url}/renewal-tracker/update-renewal-tracker/${id}`
          : `${base_url}/renewal-tracker/update-renewal-tracker/${id}/${standAloneId}`;

      const response = await axios.patch<IApiResponse<RenewalTrackerRow>>(
        url,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<IApiResponse>(error)) {
        throw new Error(extractApiError(error.response?.data));
      }
      throw new Error("Something went wrong");
    }
  },

  /**
   * DELETE /api/v1/renewal-tracker/delete-renewal-tracker/:id/:standAloneId
   */
  async deleteRenewalTracker(
    id: string,
    standAloneId: string,
  ): Promise<IApiResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url =
        isStandaloneRole(userRole)
          ? `${base_url}/renewal-tracker/delete-renewal-tracker/${id}`
          : `${base_url}/renewal-tracker/delete-renewal-tracker/${id}/${standAloneId}`;

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
  },
};
