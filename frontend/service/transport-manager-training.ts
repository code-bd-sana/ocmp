import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  CreateTransportManagerTrainingInput,
  TransportManagerTrainingListResponse,
  TransportManagerTrainingRow,
  UpdateTransportManagerTrainingInput,
} from "@/lib/transport-manager-training/transport-manager-training.types";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  if (typeof data.error === "string" && data.error) return data.error;

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const messages = (
        data.errors as { field?: string; message: string }[]
      ).map((e) => (e.field ? `${e.field}: ${e.message}` : e.message));
      return messages.join(", ");
    }

    if (typeof data.errors === "string") return data.errors;
  }

  if (data.message && data.message !== "An unexpected error occurred") {
    return data.message;
  }

  return "Something went wrong";
}

const getTrainings = async (
  standAloneId: string,
  params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<TransportManagerTrainingListResponse>> => {
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
      IApiResponse<TransportManagerTrainingListResponse>
    >(
      `${base_url}/transport-manager-training/get-transport-manager-training/many`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const getTraining = async (
  trainingId: string,
  standAloneId: string,
): Promise<IApiResponse<TransportManagerTrainingRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/transport-manager-training/get-transport-manager-training/${trainingId}`
      : `${base_url}/transport-manager-training/get-transport-manager-training/${trainingId}/${standAloneId}`;

    const response = await axios.get<IApiResponse<TransportManagerTrainingRow>>(
      endpoint,
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
};

const createTraining = async (
  data: CreateTransportManagerTrainingInput & { standAloneId?: string },
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const formData = new FormData();

    formData.append("trainingCourse", data.trainingCourse);
    formData.append("unitTitle", data.unitTitle);
    formData.append("completionDate", data.completionDate);
    formData.append("renewalTracker", data.renewalTracker);
    if (!isStandaloneRole(userRole) && data.standAloneId) {
      formData.append("standAloneId", data.standAloneId);
    }

    if (data.nextDueDate) formData.append("nextDueDate", data.nextDueDate);

    if (data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await axios.post<IApiResponse>(
      isStandaloneRole(userRole)
        ? `${base_url}/transport-manager-training/create-stand-alone-transport-manager-training`
        : `${base_url}/transport-manager-training/create-transport-manager-training`,
      formData,
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
};

const updateTraining = async (
  trainingId: string,
  standAloneId: string,
  data: UpdateTransportManagerTrainingInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const formData = new FormData();

    if (data.trainingCourse) formData.append("trainingCourse", data.trainingCourse);
    if (data.unitTitle) formData.append("unitTitle", data.unitTitle);
    if (data.completionDate) formData.append("completionDate", data.completionDate);
    if (data.renewalTracker) formData.append("renewalTracker", data.renewalTracker);
    if (data.nextDueDate) formData.append("nextDueDate", data.nextDueDate);

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

    const response = await axios.patch<IApiResponse>(
      isStandaloneRole(userRole)
        ? `${base_url}/transport-manager-training/update-transport-manager-training/${trainingId}`
        : `${base_url}/transport-manager-training/update-transport-manager-training/${trainingId}/${standAloneId}`,
      formData,
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
};

const deleteTraining = async (
  trainingId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const response = await axios.delete<IApiResponse>(
      isStandaloneRole(userRole)
        ? `${base_url}/transport-manager-training/delete-transport-manager-training/${trainingId}`
        : `${base_url}/transport-manager-training/delete-transport-manager-training/${trainingId}/${standAloneId}`,
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
};

export const TransportManagerTrainingAction = {
  getTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
};
