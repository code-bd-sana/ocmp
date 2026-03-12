import {
  CreatePg9AndPg13PlanInput,
  Pg9AndPg13PlanRow,
  UpdatePg9AndPg13PlanInput,
} from "@/lib/pg9AndPg13Plan/pg9AndPg13Plan.types";
import { AuthAction, IApiResponse } from "./auth";
import axios from "axios";
import { base_url } from "@/lib/utils";

interface Pg9AndPg13PlanResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: Pg9AndPg13PlanRow;
}

interface Pg9AndPg13PlanListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    pg9pg13Plans: Pg9AndPg13PlanRow[];
    totalData: number;
    totalPages: number;
  };
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

function toErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<IApiResponse>(error)) {
    return extractApiError(error.response?.data);
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export const Pg9AndPg13PlanAction = {
  /**
   * Create a new PG9/PG13 plan as Transport Manager
   */

  async createPg9AndPg13Plan(
    data: CreatePg9AndPg13PlanInput,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.post<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/create-pg9-and-pg13-plan`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to create PG9/PG13 plan"),
      };
    }
  },

  /**
   * Create a new PG9/PG13 plan as Standalone User
   */
  async createPg9AndPg13PlanAsStandAlone(
    data: CreatePg9AndPg13PlanInput,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.post<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/create-stand-alone-pg9-and-pg13-plan`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to create PG9/PG13 plan"),
      };
    }
  },

  /**
   * Get many PG9/PG13 plans for a client (with filtering)
   */
  async getPg9AndPg13Plans(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<Pg9AndPg13PlanListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<Pg9AndPg13PlanListResponse>(
        `${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plans`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            standAloneId,
            searchKey: params?.searchKey || undefined,
            showPerPage: params?.showPerPage || 10,
            pageNo: params?.pageNo || 1,
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch PG9/PG13 plans"),
      };
    }
  },

  /**
   * Get many pg9 and pg13 plans as standalone user
   */
  async getPg9AndPg13PlansAsStandAlone(
    params?: SearchParams,
  ): Promise<Pg9AndPg13PlanListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<Pg9AndPg13PlanListResponse>(
        `${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plans`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch PG9/PG13 plans"),
      };
    }
  },

  /**
   * Get a single PG9/PG13 plan by ID as Transport Manager
   */
  async getPg9AndPg13Plan(
    planId: string,
    standAloneId: string,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plan/${planId}/${standAloneId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch PG9/PG13 plan"),
      };
    }
  },

  /**
   * Get single PG9/PG13 plan as standalone user
   */
  async getPg9AndPg13PlanAsStandAlone(
    planId: string,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/get-pg9-and-pg13-plan/${planId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch PG9/PG13 plan"),
      };
    }
  },

  /**
   * Update a PG9/PG13 plan as Transport Manager
   */
  async updatePg9AndPg13Plan(
    planId: string,
    standAloneId: string,
    data: UpdatePg9AndPg13PlanInput,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.patch<Pg9AndPg13PlanResponse>(
        `${base_url}//pg9AndPg13Plan/update-pg9-and-pg13-plan-by-manager/${planId}/${standAloneId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to update PG9/PG13 plan"),
      };
    }
  },

  /**
   * Update PG9/PG13 plan as standalone user
   */
  async updatePg9AndPg13PlanAsStandAlone(
    planId: string,
    data: UpdatePg9AndPg13PlanInput,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.patch<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/update-pg9-and-pg13-plan/${planId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to update PG9/PG13 plan"),
      };
    }
  },

  /**
   * Delete a PG9/PG13 plan as Transport Manager
   */
  async deletePg9AndPg13Plan(
    planId: string,
    standAloneId: string,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.delete<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/delete-pg9-and-pg13-plan-by-manager/${planId}/${standAloneId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to delete PG9/PG13 plan"),
      };
    }
  },

  /**
   * Delete PG9/PG13 Plan as standalone user
   */
  async deletePg9AndPg13PlanAsStandAlone(
    planId: string,
  ): Promise<Pg9AndPg13PlanResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.delete<Pg9AndPg13PlanResponse>(
        `${base_url}/pg9AndPg13Plan/delete-pg9-and-pg13-plan/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to delete PG9/PG13 plan"),
      };
    }
  },
};
