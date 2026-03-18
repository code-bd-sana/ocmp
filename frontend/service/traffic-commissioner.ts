import {
  CreateTrafficCommissionerInput,
  UpdateTrafficCommissionerInput,
  trafficCommissionerRow,
} from "@/lib/traffic-commissioner/traffic-commissioner.type";
import { base_url } from "@/lib/utils";
import { axiosInstance } from "@/lib/utils/axiosInstance";
import { UserAction } from "./user";

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
      const userRole = await getUserRole();
      const endpoint =
        userRole === "STANDALONE_USER"
          ? `${base_url}/traffic-commissioner-communication/create-stand-alone-traffic-commissioner-communication`
          : `${base_url}/traffic-commissioner-communication/create-traffic-commissioner-communication`;

      const formData = new FormData();

      formData.append("type", data.type);
      formData.append("contactedPerson", data.contactedPerson);
      formData.append("reason", data.reason);
      formData.append("communicationDate", data.communicationDate);

      if (data.comments) formData.append("comments", data.comments);
      if (userRole !== "STANDALONE_USER" && data.standAloneId) {
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
      const userRole = await getUserRole();

      const response = await axiosInstance.get(
        `${base_url}/traffic-commissioner-communication/get-traffic-commissioner-communication/many`,
        {
          params:
            userRole === "STANDALONE_USER"
              ? {
                  ...params,
                }
              : {
                  standAloneId,
                  ...params,
                },
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
   * Get all traffic commissioner communications for standalone user
   */
  async getTrafficCommissionersAsStandAlone(
    params?: SearchParams,
  ): Promise<TrafficCommissionerListResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/traffic-commissioner-communication/get-traffic-commissioner-communication/many`,
        { params },
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
   * Get a single traffic commissioner communication by ID (transport manager)
   */
  async getTrafficCommissioner(
    id: string,
    standAloneId: string,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getUserRole();

      const endpoint =
        userRole === "STANDALONE_USER"
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
   * Get a single traffic commissioner communication by ID (standalone user)
   */

  async getTrafficCommissionerAsStandAlone(
    id: string,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/traffic-commissioner-communication/get-traffic-commissioner-communication/${id}`,
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
   * Update a traffic commissioner communication (transport manager)
   */
  async updateTrafficCommissioner(
    id: string,
    standAloneId: string,
    data: UpdateTrafficCommissionerInput,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getUserRole();

      const formData = new FormData();

      formData.append("type", data.type);
      formData.append("contactedPerson", data.contactedPerson);
      formData.append("reason", data.reason);
      formData.append("communicationDate", data.communicationDate);

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
        userRole === "STANDALONE_USER"
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
   * Update a traffic commissioner communication (standalone user)
   */
  async updateTrafficCommissionerAsStandAlone(
    id: string,
    data: UpdateTrafficCommissionerInput,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const formData = new FormData();

      formData.append("type", data.type);
      formData.append("contactedPerson", data.contactedPerson);
      formData.append("reason", data.reason);
      formData.append("communicationDate", data.communicationDate);

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
        `${base_url}/traffic-commissioner-communication/update-traffic-commissioner-communication/${id}`,
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
   * Delete a traffic commissioner communication (transport manager) */
  async deleteTrafficCommissioner(
    id: string,
    standAloneId: string,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const userRole = await getUserRole();

      const response = await axiosInstance.delete(
        userRole === "STANDALONE_USER"
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

  /**
   * Delete a traffic commissioner communication (standalone user)
   */
  async deleteTrafficCommissionerAsStandAlone(
    id: string,
  ): Promise<TrafficCommissionerResponse> {
    try {
      const response = await axiosInstance.delete(
        `${base_url}/traffic-commissioner-communication/delete-traffic-commissioner-communication/${id}`,
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
