import axios from "axios";
import {
  CreateTrainingToolboxInput,
  TrainingToolboxRow,
  UpdateTrainingToolboxInput,
} from "@/lib/training-toolbox/training-toolbox.type";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";
import { UserAction } from "./user";

interface ToolboxResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: TrainingToolboxRow;
}

interface ToolboxListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    toolboxes: TrainingToolboxRow[];
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

export const TrainingToolboxAction = {
  /**
   * Create a training toolbox - role-aware routing and body filtering
   */
  async createTrainingToolbox(
    data: CreateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const userRole = await getUserRole();

      const endpoint =
        userRole === "STANDALONE_USER"
          ? `${base_url}/training-toolbox/create-stand-alone-training-toolbox`
          : `${base_url}/training-toolbox/create-training-toolbox`;

      // SA users: strip standAloneId from body (strict validation)
      const body =
        userRole === "STANDALONE_USER"
          ? Object.fromEntries(
              Object.entries(data).filter(([key]) => key !== "standAloneId"),
            )
          : data;

      const response = await axios.post<ToolboxResponse>(endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to create training toolbox"),
      };
    }
  },

  /**
   * Get many training toolboxes - role-aware routing for query params
   */
  async getTrainingToolboxes(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<ToolboxListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const userRole = await getUserRole();

      // SA users: no standAloneId in query params
      // TM users: include standAloneId in query params
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

      const response = await axios.get<ToolboxListResponse>(
        `${base_url}/training-toolbox/get-training-toolbox/many`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: queryParams,
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch training toolboxes"),
      };
    }
  },

  /**
   * Get a single training toolbox - role-aware routing
   */
  async getTrainingToolbox(
    toolboxId: string,
    standAloneId: string,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const userRole = await getUserRole();

      // TM: separate route with standAloneId in URL path
      // SA: separate route without standAloneId
      const url =
        userRole === "STANDALONE_USER"
          ? `${base_url}/training-toolbox/get-training-toolbox/${toolboxId}`
          : `${base_url}/training-toolbox/get-training-toolbox/${toolboxId}/${standAloneId}`;

      const response = await axios.get<ToolboxResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch training toolbox"),
      };
    }
  },

  /**
   * Update a training toolbox - role-aware routing
   */
  async updateTrainingToolbox(
    toolboxId: string,
    standAloneId: string,
    data: UpdateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const userRole = await getUserRole();

      // TM: separate route with standAloneId in URL path
      // SA: separate route without standAloneId
      const url =
        userRole === "STANDALONE_USER"
          ? `${base_url}/training-toolbox/update-training-toolbox/${toolboxId}`
          : `${base_url}/training-toolbox/update-training-toolbox/${toolboxId}/${standAloneId}`;

      const response = await axios.patch<ToolboxResponse>(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to update training toolbox"),
      };
    }
  },

  /**
   * Delete a training toolbox - role-aware routing
   */
  async deleteTrainingToolbox(
    toolboxId: string,
    standAloneId: string,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const userRole = await getUserRole();

      // TM: separate route with standAloneId in URL path
      // SA: separate route without standAloneId
      const url =
        userRole === "STANDALONE_USER"
          ? `${base_url}/training-toolbox/delete-training-toolbox/${toolboxId}`
          : `${base_url}/training-toolbox/delete-training-toolbox/${toolboxId}/${standAloneId}`;

      const response = await axios.delete<ToolboxResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to delete training toolbox"),
      };
    }
  },
};
