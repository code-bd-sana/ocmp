import axios from "axios";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";
import {
  CreateTrainingInput,
  TrainingDetail,
  TrainingListResponse,
  UpdateTrainingInput,
} from "@/lib/training/training.types";

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

const getTrainings = async (
  standAloneId?: string,
  params?: { searchKey?: string; showPerPage?: number; pageNo?: number },
): Promise<IApiResponse<TrainingListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 100,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<TrainingListResponse>>(
      `${base_url}/training/get-trainings`,
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

const createTraining = async (data: CreateTrainingInput): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training/create-stand-alone-training`
      : `${base_url}/training/create-training`;

    const body = isStandaloneRole(userRole)
      ? {
          trainingName: data.trainingName,
          intervalDays: data.intervalDays,
        }
      : data;

    const response = await axios.post<IApiResponse>(endpoint, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

const getTrainingById = async (
  trainingId: string,
  standAloneId?: string,
): Promise<IApiResponse<TrainingDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const params = isStandaloneRole(userRole) ? {} : { standAloneId };

    const response = await axios.get<IApiResponse<TrainingDetail>>(
      `${base_url}/training/get-training/${trainingId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
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
  standAloneId: string | undefined,
  data: UpdateTrainingInput,
): Promise<IApiResponse<TrainingDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training/update-training/${trainingId}`
      : `${base_url}/training/update-training-by-manager/${trainingId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse<TrainingDetail>>(
      endpoint,
      data,
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
  standAloneId: string | undefined,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training/delete-training/${trainingId}`
      : `${base_url}/training/delete-training-by-manager/${trainingId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

export const TrainingAction = {
  getTrainings,
  createTraining,
  getTrainingById,
  updateTraining,
  deleteTraining,
};
