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
  TrainingRecordStatus,
  TrainingRecordsListResponse,
  UpdateTrainingRecordStatusInput,
} from "@/lib/training-records/training-records.types";

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

const getTrainingRecords = async (
  standAloneId?: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
    status?: TrainingRecordStatus;
  },
): Promise<IApiResponse<TrainingRecordsListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
      status: params?.status || undefined,
    });

    const response = await axios.get<IApiResponse<TrainingRecordsListResponse>>(
      `${base_url}/training-records/get-training-records`,
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

const updateTrainingRecordStatus = async (
  registerId: string,
  standAloneId: string | undefined,
  data: UpdateTrainingRecordStatusInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/training-records/update-record-status/${registerId}`
      : `${base_url}/training-records/update-record-status-by-manager/${registerId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse>(endpoint, data, {
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

export const TrainingRecordsAction = {
  getTrainingRecords,
  updateTrainingRecordStatus,
};
