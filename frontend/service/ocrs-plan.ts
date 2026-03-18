import { axiosInstance } from "@/lib/utils/axiosInstance";
import { base_url } from "@/lib/utils";
import {
  CreateOcrsPlanAsStandAloneInput,
  CreateOcrsPlanInput,
  OcrsPlanRow,
  UpdateOcrsPlanAsStandAloneInput,
  UpdateOcrsPlanInput,
} from "@/lib/ocrs-plan/ocrs-plan.types";

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
   * Create an ocrs plan as transport manager
   */
  async createOcrsPlan(data: CreateOcrsPlanInput): Promise<OcrsPlanResponse> {
    try {
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
      formData.append("standAloneId", data.standAloneId);

      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await axiosInstance.post(
        `${base_url}/ocrs-plan/create-ocrs-plan`,
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
          "Failed to create OCRS plan",
      };
    }
  },

  /**
   * Create an ocrs plan as standalone user
   */
  async createOcrsPlanAsStandAlone(
    data: CreateOcrsPlanAsStandAloneInput,
  ): Promise<OcrsPlanResponse> {
    try {
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

      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await axiosInstance.post(
        `${base_url}/ocrs-plan/create-stand-alone-ocrs-plan`,
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
          "Failed to create OCRS plan",
      };
    }
  },

  /**
   * Get all ocrs plans for a client (transport manager)
   */
  async getOcrsPlans(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<OcrsPlansListResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/ocrs-plan/get-ocrs-plan/many`,
        {
          params: {
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
          "Failed to fetch OCRS plans",
      };
    }
  },

  /**
   * Get all ocrs plans (standalone user)
   */
  async getOcrsPlansAsStandAlone(
    params?: SearchParams,
  ): Promise<OcrsPlansListResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/ocrs-plan/get-ocrs-plan/many`,
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
          "Failed to fetch OCRS plans",
      };
    }
  },

  /**
   * Get a single ocrs plan by ID (transport manager)
   */
  async getOcrsPlan(
    id: string,
    standAloneId: string,
  ): Promise<OcrsPlanResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/ocrs-plan/get-ocrs-plan/${id}/${standAloneId}`,
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
          "Failed to fetch OCRS plan",
      };
    }
  },

  /**
   * Get a single ocrs plan by ID (standalone user)
   */
  async getOcrsPlanAsStandAlone(id: string): Promise<OcrsPlanResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/ocrs-plan/get-ocrs-plan/${id}`,
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
          "Failed to fetch OCRS plan",
      };
    }
  },

  /**
   * Update an ocrs plan (transport manager)
   */
  async updateOcrsPlan(
    id: string,
    standAloneId: string,
    data: UpdateOcrsPlanInput,
  ): Promise<OcrsPlanResponse> {
    try {
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
        `${base_url}/ocrs-plan/update-ocrs-plan/${id}/${standAloneId}`,
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
          "Failed to update OCRS plan",
      };
    }
  },

  /**
   * Update an ocrs plan (standalone user)
   */
  async updateOcrsPlanAsStandAlone(
    id: string,
    data: UpdateOcrsPlanAsStandAloneInput,
  ): Promise<OcrsPlanResponse> {
    try {
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
        `${base_url}/ocrs-plan/update-ocrs-plan/${id}`,
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
          "Failed to update OCRS plan",
      };
    }
  },

  /**
   * Delete an ocrs plan (transport manager)
   */
  async deleteOcrsPlan(
    id: string,
    standAloneId: string,
  ): Promise<OcrsPlanResponse> {
    try {
      const response = await axiosInstance.delete(
        `${base_url}/ocrs-plan/delete-ocrs-plan/${id}/${standAloneId}`,
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
          "Failed to delete OCRS plan",
      };
    }
  },

  /**
   * Delete an ocrs plan (standalone user)
   */
  async deleteOcrsPlanAsStandAlone(id: string): Promise<OcrsPlanResponse> {
    try {
      const response = await axiosInstance.delete(
        `${base_url}/ocrs-plan/delete-ocrs-plan/${id}`,
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
          "Failed to delete OCRS plan",
      };
    }
  },
};
