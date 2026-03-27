import axios from "axios";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";
import {
  CreateMaintenanceProviderCommunicationInput,
  CreateMeetingNoteInput,
  MaintenanceProviderCommunicationListResponse,
  MaintenanceProviderCommunicationRow,
  MeetingNoteListResponse,
  MeetingNoteRow,
  UpdateMaintenanceProviderCommunicationInput,
  UpdateMeetingNoteInput,
} from "@/lib/maintenance-meeting/maintenance-meeting.types";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

interface EntityResponse<T> {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: T;
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

export const MeetingNoteAction = {
  async createAsManager(
    data: CreateMeetingNoteInput,
  ): Promise<EntityResponse<MeetingNoteRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);
      const isStandalone = isStandaloneRole(userRole);
      const endpoint = isStandalone
        ? `${base_url}/meeting-note/create-as-standalone`
        : `${base_url}/meeting-note/create-as-manager`;

      const body = { ...data };
      if (isStandalone) {
        delete body.standAloneId;
      }

      const response = await axios.post<EntityResponse<MeetingNoteRow>>(
        endpoint,
        body,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to create meeting note"),
      };
    }
  },

  async getMany(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<EntityResponse<MeetingNoteListResponse>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

      const response = await axios.get<EntityResponse<MeetingNoteListResponse>>(
        `${base_url}/meeting-note/get-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: queryParams,
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch meeting notes"),
      };
    }
  },

  async getById(
    id: string,
    standAloneId: string,
  ): Promise<EntityResponse<MeetingNoteRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);
      const url = isStandaloneRole(userRole)
        ? `${base_url}/meeting-note/${id}`
        : `${base_url}/meeting-note/${id}/${standAloneId}`;

      const response = await axios.get<EntityResponse<MeetingNoteRow>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to fetch meeting note"),
      };
    }
  },

  async updateAsManager(
    id: string,
    standAloneId: string,
    data: UpdateMeetingNoteInput,
  ): Promise<EntityResponse<MeetingNoteRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);
      const url = isStandaloneRole(userRole)
        ? `${base_url}/meeting-note/update-as-standalone/${id}`
        : `${base_url}/meeting-note/update-as-manager/${id}/${standAloneId}`;

      const response = await axios.patch<EntityResponse<MeetingNoteRow>>(
        url,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to update meeting note"),
      };
    }
  },

  async deleteAsManager(
    id: string,
    standAloneId: string,
  ): Promise<EntityResponse<null>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);
      const url = isStandaloneRole(userRole)
        ? `${base_url}/meeting-note/${id}`
        : `${base_url}/meeting-note/${id}/${standAloneId}`;

      const response = await axios.delete<EntityResponse<null>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(error, "Failed to delete meeting note"),
      };
    }
  },
};

export const MaintenanceProviderCommunicationAction = {
  async createAsManager(
    data: CreateMaintenanceProviderCommunicationInput,
  ): Promise<EntityResponse<MaintenanceProviderCommunicationRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);
      const isStandalone = isStandaloneRole(userRole);
      const endpoint = isStandalone
        ? `${base_url}/maintenance-provider-communication/create-as-standalone`
        : `${base_url}/maintenance-provider-communication/create-as-manager`;

      const body = { ...data };
      if (isStandalone) {
        delete body.standAloneId;
      }

      const response = await axios.post<
        EntityResponse<MaintenanceProviderCommunicationRow>
      >(endpoint, body, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to create maintenance provider communication",
        ),
      };
    }
  },

  async getMany(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<EntityResponse<MaintenanceProviderCommunicationListResponse>> {
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
        EntityResponse<MaintenanceProviderCommunicationListResponse>
      >(`${base_url}/maintenance-provider-communication/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to fetch maintenance provider communications",
        ),
      };
    }
  },

  async getById(
    id: string,
    standAloneId: string,
  ): Promise<EntityResponse<MaintenanceProviderCommunicationRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);
      const url = isStandaloneRole(userRole)
        ? `${base_url}/maintenance-provider-communication/${id}`
        : `${base_url}/maintenance-provider-communication/${id}/${standAloneId}`;

      const response = await axios.get<
        EntityResponse<MaintenanceProviderCommunicationRow>
      >(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to fetch maintenance provider communication",
        ),
      };
    }
  },

  async updateAsManager(
    id: string,
    standAloneId: string,
    data: UpdateMaintenanceProviderCommunicationInput,
  ): Promise<EntityResponse<MaintenanceProviderCommunicationRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);
      const url = isStandaloneRole(userRole)
        ? `${base_url}/maintenance-provider-communication/update-as-standalone/${id}`
        : `${base_url}/maintenance-provider-communication/update-as-manager/${id}/${standAloneId}`;

      const response = await axios.patch<
        EntityResponse<MaintenanceProviderCommunicationRow>
      >(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to update maintenance provider communication",
        ),
      };
    }
  },

  async deleteAsManager(
    id: string,
    standAloneId: string,
  ): Promise<EntityResponse<null>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);
      const url = isStandaloneRole(userRole)
        ? `${base_url}/maintenance-provider-communication/${id}`
        : `${base_url}/maintenance-provider-communication/${id}/${standAloneId}`;

      const response = await axios.delete<EntityResponse<null>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to delete maintenance provider communication",
        ),
      };
    }
  },
};
