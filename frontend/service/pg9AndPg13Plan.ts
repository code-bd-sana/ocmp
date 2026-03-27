import {
  CreatePg9AndPg13PlanInput,
  Pg9AndPg13PlanRow,
  UpdatePg9AndPg13PlanInput,
} from "@/lib/pg9AndPg13Plan/pg9AndPg13Plan.types";
import { AuthAction, IApiResponse } from "./auth";
import axios from "axios";
import { base_url } from "@/lib/utils";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

interface Pg9AndPg13PlanListResponse {
  pg9AndPg13Plans: Pg9AndPg13PlanRow[];
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

export const Pg9AndPg13PlanAction = {
  /**
   * GET /api/v1/pg9AndPg13Plan/get-pg9-and-pg13-plans
   */
  async getPg9AndPg13Plans(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<IApiResponse<Pg9AndPg13PlanListResponse>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();

      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

      const response = await axios.get<
        IApiResponse<Pg9AndPg13PlanListResponse>
      >(`${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plans`, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
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
   * GET /api/v1/pg9AndPg13Plan/get-pg9-and-pg13-plan/:planId/:standAloneId
   */
  async getPg9AndPg13Plan(
    planId: string,
    standAloneId: string,
  ): Promise<IApiResponse<Pg9AndPg13PlanRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plan/${planId}`
        : `${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plan/${planId}/${standAloneId}`;

      const response = await axios.get<IApiResponse<Pg9AndPg13PlanRow>>(url, {
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
   * POST /api/v1/pg9AndPg13Plan/create-pg9-and-pg13-plan
   */
  async createPg9AndPg13Plan(
    data: CreatePg9AndPg13PlanInput,
  ): Promise<IApiResponse<Pg9AndPg13PlanRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const isStandalone = isStandaloneRole(userRole);
      const endpoint = isStandalone
        ? `${base_url}/pg9AndPg13Plan/create-stand-alone-pg9-and-pg13-plan`
        : `${base_url}/pg9AndPg13Plan/create-pg9-and-pg13-plan`;

      // If standalone, remove standAloneId from body to satisfy .strict() Zod schema
      const body = { ...data };
      if (isStandalone) {
        delete body.standAloneId;
      }

      const response = await axios.post<IApiResponse<Pg9AndPg13PlanRow>>(
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
   * PATCH /api/v1/pg9AndPg13Plan/update-pg9-and-pg13-plan-by-manager/:planId/:standAloneId
   */
  async updatePg9AndPg13Plan(
    planId: string,
    standAloneId: string,
    data: UpdatePg9AndPg13PlanInput,
  ): Promise<IApiResponse<Pg9AndPg13PlanRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/pg9AndPg13Plan/update-pg9-and-pg13-plan/${planId}`
        : `${base_url}/pg9AndPg13Plan/update-pg9-and-pg13-plan-by-manager/${planId}/${standAloneId}`;

      const response = await axios.patch<IApiResponse<Pg9AndPg13PlanRow>>(
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
   * DELETE /api/v1/pg9AndPg13Plan/delete-pg9-and-pg13-plan-by-manager/:planId/:standAloneId
   */
  async deletePg9AndPg13Plan(
    planId: string,
    standAloneId: string,
  ): Promise<IApiResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/pg9AndPg13Plan/delete-pg9-and-pg13-plan/${planId}`
        : `${base_url}/pg9AndPg13Plan/delete-pg9-and-pg13-plan-by-manager/${planId}/${standAloneId}`;

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
