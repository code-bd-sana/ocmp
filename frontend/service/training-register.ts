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
  CreateTrainingRegisterInput,
  TrainingRegisterDetail,
  TrainingRegisterListResponse,
  UpdateTrainingRegisterInput,
} from "@/lib/training-register/training-register.types";

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

const getRegisters = async (
  standAloneId?: string,
  params?: { searchKey?: string; showPerPage?: number; pageNo?: number },
): Promise<IApiResponse<TrainingRegisterListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<TrainingRegisterListResponse>>(
      `${base_url}/training-register/get-registers`,
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

const getRegisterById = async (
  registerId: string,
  standAloneId?: string,
): Promise<IApiResponse<TrainingRegisterDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const params = isStandaloneRole(userRole) ? {} : { standAloneId };

    const response = await axios.get<IApiResponse<TrainingRegisterDetail>>(
      `${base_url}/training-register/get-register/${registerId}`,
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

const createRegister = async (
  data: CreateTrainingRegisterInput,
): Promise<IApiResponse<TrainingRegisterDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training-register/create-stand-alone-register`
      : `${base_url}/training-register/create-register`;

    const body = isStandaloneRole(userRole)
      ? {
          participantId: data.participantId,
          trainingId: data.trainingId,
          trainingInterval: data.trainingInterval,
          trainingDate: data.trainingDate,
        }
      : data;

    const response = await axios.post<IApiResponse<TrainingRegisterDetail>>(
      endpoint,
      body,
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

const updateRegister = async (
  registerId: string,
  standAloneId: string | undefined,
  data: UpdateTrainingRegisterInput,
): Promise<IApiResponse<TrainingRegisterDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training-register/update-register/${registerId}`
      : `${base_url}/training-register/update-register-by-manager/${registerId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse<TrainingRegisterDetail>>(
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

const deleteRegister = async (
  registerId: string,
  standAloneId: string | undefined,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training-register/delete-register/${registerId}`
      : `${base_url}/training-register/delete-register-by-manager/${registerId}/${standAloneId}`;

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

export const TrainingRegisterAction = {
  getRegisters,
  getRegisterById,
  createRegister,
  updateRegister,
  deleteRegister,
};
