import axios from "axios";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";
import {
  CreatePlannerInput,
  PlannerListResponse,
  PlannerRow,
  RequestChangePlannerDateInput,
  UpdatePlannerInput,
} from "@/lib/planner/planner.types";

interface SearchParams {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
  hasDriver?: boolean;
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

export const PlannerAction = {
  async getPlanners(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<IApiResponse<PlannerListResponse>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();

      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 200,
        pageNo: params?.pageNo || 1,
        hasDriver: params?.hasDriver,
      });

      const response = await axios.get<IApiResponse<PlannerListResponse>>(
        `${base_url}/planner/get-planner/many`,
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

  async createPlanner(
    data: CreatePlannerInput,
  ): Promise<IApiResponse<PlannerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const endpoint = isStandaloneRole(userRole)
        ? `${base_url}/planner/create-planner-standalone`
        : `${base_url}/planner/create-planner`;

      const standaloneBody = { ...data };
      delete (standaloneBody as { standAloneId?: string }).standAloneId;

      const body = isStandaloneRole(userRole) ? standaloneBody : data;

      const response = await axios.post<IApiResponse<PlannerRow>>(
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

  async updatePlanner(
    id: string,
    standAloneId: string,
    data: UpdatePlannerInput,
  ): Promise<IApiResponse<PlannerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/planner/update-planner/${id}`
        : `${base_url}/planner/update-planner/${id}/${standAloneId}`;

      const response = await axios.patch<IApiResponse<PlannerRow>>(url, data, {
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

  async deletePlanner(id: string, standAloneId: string): Promise<IApiResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/planner/delete-planner/${id}`
        : `${base_url}/planner/delete-planner/${id}/${standAloneId}`;

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

  async requestChangePlannerDate(
    id: string,
    data: RequestChangePlannerDateInput,
  ): Promise<IApiResponse<PlannerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.post<IApiResponse<PlannerRow>>(
        `${base_url}/planner/request-change-planner-date/${id}`,
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

  async getRequestedPlanners(
    standAloneId: string,
  ): Promise<IApiResponse<PlannerRow[]>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get<IApiResponse<PlannerRow[]>>(
        `${base_url}/planner/get-planner/requests/${standAloneId}`,
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

  async approvePlannerRequest(id: string): Promise<IApiResponse<PlannerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.patch<IApiResponse<PlannerRow>>(
        `${base_url}/planner/request-approval/${id}`,
        {},
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

  async rejectPlannerRequest(id: string): Promise<IApiResponse<PlannerRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.patch<IApiResponse<PlannerRow>>(
        `${base_url}/planner/request-reject/${id}`,
        {},
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

  async bulkCreatePlanner(data: {
    vehicleId: string;
    plannerType: string;
    dates: string[];
    standAloneId?: string;
  }): Promise<IApiResponse<PlannerRow[]>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const endpoint = isStandaloneRole(userRole)
        ? `${base_url}/planner/bulk-create-planner-standalone`
        : `${base_url}/planner/bulk-create-planner`;

      const standaloneBody = { ...data };
      delete (standaloneBody as { standAloneId?: string }).standAloneId;

      const body = isStandaloneRole(userRole) ? standaloneBody : data;

      const response = await axios.post<IApiResponse<PlannerRow[]>>(
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
};
