import axios from "axios";
import {
  CreateTrainingToolboxInput,
  TrainingToolboxRow,
  UpdateTrainingToolboxInput,
} from "@/lib/training-toolbox/training-toolbox.type";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";

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

export const TrainingToolboxAction = {
  /**
   * Create a training toolbox record
   */
  async createTrainingToolbox(
    data: CreateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.post<ToolboxResponse>(
        `${base_url}/training-toolbox/create-training-toolbox`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to create training toolbox"),
      };
    }
  },

  /**
   * Create training toolbox as standalone user
   */
  async createTrainingToolboxAsStandAlone(
    data: CreateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.post<ToolboxResponse>(
        `${base_url}/training-toolbox/create-stand-alone-training-toolbox`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to create training toolbox"),
      };
    }
  },

  /**
   * Get many training toolboxes for a client (with filtering)
   */
  async getTrainingToolboxes(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<ToolboxListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<ToolboxListResponse>(
        `${base_url}/training-toolbox/get-training-toolbox/many`,
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
        message: toErrorMessage(error, "Failed to fetch training toolboxes"),
      };
    }
  },

  /**
   * Get many training toolboxes as standalone user
   */
  async getTrainingToolboxesAsStandAlone(
    params?: SearchParams,
  ): Promise<ToolboxListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<ToolboxListResponse>(
        `${base_url}/training-toolbox/get-training-toolbox/many`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
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
   * Get a single training toolbox by ID
   */
  async getTrainingToolbox(
    toolboxId: string,
    standAloneId: string,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<ToolboxResponse>(
        `${base_url}/training-toolbox/get-training-toolbox/${toolboxId}/${standAloneId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch training toolbox"),
      };
    }
  },

  /**
   * Get single training toolbox as standalone user
   */
  async getTrainingToolboxAsStandAlone(
    toolboxId: string,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.get<ToolboxResponse>(
        `${base_url}/training-toolbox/get-training-toolbox/${toolboxId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch training toolbox"),
      };
    }
  },

  /**
   * Update a training toolbox
   */
  async updateTrainingToolbox(
    toolboxId: string,
    standAloneId: string,
    data: UpdateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.patch<ToolboxResponse>(
        `${base_url}/training-toolbox/update-training-toolbox/${toolboxId}/${standAloneId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to update training toolbox"),
      };
    }
  },

  /**
   * Update training toolbox as standalone user
   */
  async updateTrainingToolboxAsStandAlone(
    toolboxId: string,
    data: UpdateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.patch<ToolboxResponse>(
        `${base_url}/training-toolbox/update-training-toolbox/${toolboxId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to update training toolbox"),
      };
    }
  },

  /**
   * Delete a training toolbox
   */
  async deleteTrainingToolbox(
    toolboxId: string,
    standAloneId: string,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.delete<ToolboxResponse>(
        `${base_url}/training-toolbox/delete-training-toolbox/${toolboxId}/${standAloneId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to delete training toolbox"),
      };
    }
  },

  /**
   * Delete training toolbox as standalone user
   */
  async deleteTrainingToolboxAsStandAlone(
    toolboxId: string,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const response = await axios.delete<ToolboxResponse>(
        `${base_url}/training-toolbox/delete-training-toolbox/${toolboxId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to delete training toolbox"),
      };
    }
  },
};
