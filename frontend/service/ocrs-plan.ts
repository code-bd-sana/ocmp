import { axiosInstance } from "@/lib/utils/axiosInstance";
import { base_url } from "@/lib/utils";
import {
  CreateOcrsPlanInput,
  OcrsPlanRow,
  UpdateOcrsPlanInput,
} from "@/lib/ocrs-plan/ocrs-plan.types";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

interface OcrsPlanResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: OcrsPlanRow;
}

interface OcrsPlansListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    ocrsPlans: OcrsPlanRow[];
    totalData: number;
    totalPages: number;
  };
}

interface SearchParams {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}

export const OcrsPlanAction = {
  /**
   * Create an ocrs plan - role-aware routing and body filtering
   */
  async createOcrsPlan(data: CreateOcrsPlanInput): Promise<OcrsPlanResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const formData = new FormData();

      if (data.roadWorthinessScore) {
        formData.append("roadWorthinessScore", data.roadWorthinessScore);
      }
      if (data.overallTrafficScore) {
        formData.append("overallTrafficScore", data.overallTrafficScore);
      }
      if (data.actionRequired) {
        formData.append("actionRequired", data.actionRequired);
      }

      // Only add standAloneId for transport managers
      if (!isStandaloneRole(userRole) && data.standAloneId) {
        formData.append("standAloneId", data.standAloneId);
      }

      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const endpoint = isStandaloneRole(userRole)
        ? `${base_url}/ocrs-plan/create-stand-alone-ocrs-plan`
        : `${base_url}/ocrs-plan/create-ocrs-plan`;

      const response = await axiosInstance.post(endpoint, formData);
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
          "Failed to create OCRS plan",
      };
    }
  },

  /**
   * Get all ocrs plans - role-aware routing for query params
   */
  async getOcrsPlans(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<OcrsPlansListResponse> {
    try {
      const userRole = await getCurrentUserRole();

      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

      const response = await axiosInstance.get(
        `${base_url}/ocrs-plan/get-ocrs-plan/many`,
        { params: queryParams }
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
          "Failed to fetch OCRS plans",
      };
    }
  },

  /**
   * Get a single ocrs plan by ID - role-aware routing
   */
  async getOcrsPlan(
    id: string,
    standAloneId: string,
  ): Promise<OcrsPlanResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/ocrs-plan/get-ocrs-plan/${id}`
        : `${base_url}/ocrs-plan/get-ocrs-plan/${id}/${standAloneId}`;

      const response = await axiosInstance.get(url);
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
          "Failed to fetch OCRS plan",
      };
    }
  },

  /**
   * Update an ocrs plan - role-aware routing
   */
  async updateOcrsPlan(
    id: string,
    standAloneId: string,
    data: UpdateOcrsPlanInput,
  ): Promise<OcrsPlanResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const formData = new FormData();

      if (data.roadWorthinessScore) {
        formData.append("roadWorthinessScore", data.roadWorthinessScore);
      }
      if (data.overallTrafficScore) {
        formData.append("overallTrafficScore", data.overallTrafficScore);
      }
      if (data.actionRequired) {
        formData.append("actionRequired", data.actionRequired);
      }

      if (data.removeAttachmentIds?.length) {
        data.removeAttachmentIds.forEach((itemId) => {
          formData.append("removeAttachmentIds", itemId);
        });
      }

      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const url = isStandaloneRole(userRole)
        ? `${base_url}/ocrs-plan/update-ocrs-plan/${id}`
        : `${base_url}/ocrs-plan/update-ocrs-plan/${id}/${standAloneId}`;

      const response = await axiosInstance.patch(url, formData);
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
          "Failed to update OCRS plan",
      };
    }
  },

  /**
   * Delete an ocrs plan - role-aware routing
   */
  async deleteOcrsPlan(
    id: string,
    standAloneId: string,
  ): Promise<OcrsPlanResponse> {
    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/ocrs-plan/delete-ocrs-plan/${id}`
        : `${base_url}/ocrs-plan/delete-ocrs-plan/${id}/${standAloneId}`;

      const response = await axiosInstance.delete(url);
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
          "Failed to delete OCRS plan",
      };
    }
  },
};
