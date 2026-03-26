import axios from "axios";
import {
  CreateTrainingToolboxInput,
  TrainingToolboxRow,
  UpdateTrainingToolboxInput,
} from "@/lib/training-toolbox/training-toolbox.type";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

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
  buildTrainingToolboxFormData(
    data: CreateTrainingToolboxInput | UpdateTrainingToolboxInput,
  ) {
    const formData = new FormData();

    if ("date" in data && data.date) formData.append("date", data.date);
    if ("driverId" in data && data.driverId)
      formData.append("driverId", data.driverId);
    if ("toolboxTitle" in data && data.toolboxTitle)
      formData.append("toolboxTitle", data.toolboxTitle);
    if ("typeOfToolbox" in data && data.typeOfToolbox) {
      formData.append("typeOfToolbox", data.typeOfToolbox);
    }
    if ("deliveredBy" in data && data.deliveredBy) {
      formData.append("deliveredBy", data.deliveredBy);
    }
    if ("notes" in data && data.notes) formData.append("notes", data.notes);

    if ("signed" in data && typeof data.signed === "boolean") {
      formData.append("signed", String(data.signed));
    }
    if ("followUpNeeded" in data && typeof data.followUpNeeded === "boolean") {
      formData.append("followUpNeeded", String(data.followUpNeeded));
    }
    if ("followUpDate" in data && data.followUpDate) {
      formData.append("followUpDate", data.followUpDate);
    }
    if ("signOff" in data && typeof data.signOff === "boolean") {
      formData.append("signOff", String(data.signOff));
    }

    if ("standAloneId" in data && data.standAloneId) {
      formData.append("standAloneId", data.standAloneId);
    }

    if ("removeAttachmentIds" in data && data.removeAttachmentIds?.length) {
      data.removeAttachmentIds.forEach((id) => {
        formData.append("removeAttachmentIds", id);
      });
    }

    if ("attachments" in data && data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    return formData;
  },

  /**
   * Create a training toolbox - role-aware routing and body filtering
   */
  async createTrainingToolbox(
    data: CreateTrainingToolboxInput,
  ): Promise<ToolboxResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const endpoint =
        isStandaloneRole(userRole)
          ? `${base_url}/training-toolbox/create-stand-alone-training-toolbox`
          : `${base_url}/training-toolbox/create-training-toolbox`;

      const formData = this.buildTrainingToolboxFormData(
        isStandaloneRole(userRole)
          ? {
              ...data,
              standAloneId: undefined,
            }
          : data,
      );

      const response = await axios.post<ToolboxResponse>(endpoint, formData, {
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
      const userRole = await getCurrentUserRole();

      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

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
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      // TM: separate route with standAloneId in URL path
      // SA: separate route without standAloneId
      const url =
        isStandaloneRole(userRole)
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
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      // TM: separate route with standAloneId in URL path
      // SA: separate route without standAloneId
      const url =
        isStandaloneRole(userRole)
          ? `${base_url}/training-toolbox/update-training-toolbox/${toolboxId}`
          : `${base_url}/training-toolbox/update-training-toolbox/${toolboxId}/${standAloneId}`;

      const formData = this.buildTrainingToolboxFormData(data);

      const response = await axios.patch<ToolboxResponse>(url, formData, {
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
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      // TM: separate route with standAloneId in URL path
      // SA: separate route without standAloneId
      const url =
        isStandaloneRole(userRole)
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
