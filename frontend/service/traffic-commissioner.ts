import {
  CreateTrafficCommissionerInput,
  UpdateTrafficCommissionerInput,
  trafficCommissionerRow,
} from "@/lib/traffic-commissioner/traffic-commissioner.type";
import { base_url } from "@/lib/utils";
import { axiosInstance } from "@/lib/utils/axiosInstance";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

interface TrafficCommissionerResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: trafficCommissionerRow;
}

interface TrafficCommissionerListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    communications: trafficCommissionerRow[];
    totalData: number;
    totalPages: number;
  };
}

interface SearchParams {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}

export const TrafficCommissionerAction = {
  /**
   * Create a traffic commissioner communication
   */
  async createTrafficCommissioner(
    data: CreateTrafficCommissionerInput,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const endpoint =
        isStandaloneRole(userRole)
          ? `${base_url}/traffic-commissioner-communication/create-stand-alone-traffic-commissioner-communication`
          : `${base_url}/traffic-commissioner-communication/create-traffic-commissioner-communication`;

      const formData = new FormData();

      formData.append("type", data.type);
      formData.append("contactedPerson", data.contactedPerson);
      formData.append("reason", data.reason);
      formData.append("communicationDate", data.communicationDate);

      if (data.comments) formData.append("comments", data.comments);
      if (!isStandaloneRole(userRole) && data.standAloneId) {
        formData.append("standAloneId", data.standAloneId);
      }

      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await axiosInstance.post(
        endpoint,
        formData,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to create traffic commissioner communication",
      };
    }
  },

  /**
   * Get all traffic commissioner communications for a client
   */
  async getTrafficCommissioners(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<TrafficCommissionerListResponse> {
    try {
      const userRole = await getCurrentUserRole();
      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || undefined,
        pageNo: params?.pageNo || undefined,
      });

      const response = await axiosInstance.get(
        `${base_url}/traffic-commissioner-communication/get-traffic-commissioner-communication/many`,
        {
          params: queryParams,
        },
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch traffic commissioner communications",
      };
    }
  },

  /**
   * Get a single traffic commissioner communication by ID
   */
  async getTrafficCommissioner(
    id: string,
    standAloneId: string,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const endpoint =
        isStandaloneRole(userRole)
          ? `${base_url}/traffic-commissioner-communication/get-traffic-commissioner-communication/${id}`
          : `${base_url}/traffic-commissioner-communication/get-traffic-commissioner-communication/${id}/${standAloneId}`;

      const response = await axiosInstance.get(
        endpoint,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch traffic commissioner communication",
      };
    }
  },

  /**
   * Update a traffic commissioner communication
   */
  async updateTrafficCommissioner(
    id: string,
    standAloneId: string,
    data: UpdateTrafficCommissionerInput,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const formData = new FormData();

      if (data.type) formData.append("type", data.type);
      if (data.contactedPerson) {
        formData.append("contactedPerson", data.contactedPerson);
      }
      if (data.reason) formData.append("reason", data.reason);
      if (data.communicationDate) {
        formData.append("communicationDate", data.communicationDate);
      }

      if (data.comments) formData.append("comments", data.comments);

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

      const response = await axiosInstance.patch(
        isStandaloneRole(userRole)
          ? `${base_url}/traffic-commissioner-communication/update-traffic-commissioner-communication/${id}`
          : `${base_url}/traffic-commissioner-communication/update-traffic-commissioner-communication/${id}/${standAloneId}`,
        formData,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to update traffic commissioner communication",
      };
    }
  },

  /**
   * Delete a traffic commissioner communication
   */
  async deleteTrafficCommissioner(
    id: string,
    standAloneId: string,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const response = await axiosInstance.delete(
        isStandaloneRole(userRole)
          ? `${base_url}/traffic-commissioner-communication/delete-traffic-commissioner-communication/${id}`
          : `${base_url}/traffic-commissioner-communication/delete-traffic-commissioner-communication/${id}/${standAloneId}`,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete traffic commissioner communication",
      };
    }
  },

};
