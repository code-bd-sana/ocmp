import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  CreateSelfServiceInput,
  UpdateSelfServiceInput,
  SelfServiceListResponse,
  SelfServiceRow,
} from "@/lib/self-service/self-service.types";
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

const getSelfServices = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<SelfServiceListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<SelfServiceListResponse>>(
      `${base_url}/self-service/get-self-service/many`,
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

const getSelfService = async (
  selfServiceId: string,
  standAloneId: string,
): Promise<IApiResponse<SelfServiceRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const response = await axios.get<IApiResponse<SelfServiceRow>>(
      isStandaloneRole(userRole)
        ? `${base_url}/self-service/get-self-service/${selfServiceId}`
        : `${base_url}/self-service/get-self-service/${selfServiceId}/${standAloneId}`,
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

const createSelfService = async (
  data: CreateSelfServiceInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const payload = isStandaloneRole(userRole)
      ? {
          serviceName: data.serviceName,
          description: data.description,
          serviceLink: data.serviceLink,
        }
      : data;

    const response = await axios.post<IApiResponse>(
      isStandaloneRole(userRole)
        ? `${base_url}/self-service/create-stand-alone-self-service`
        : `${base_url}/self-service/create-self-service`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

const updateSelfService = async (
  selfServiceId: string,
  standAloneId: string,
  data: UpdateSelfServiceInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const response = await axios.patch<IApiResponse>(
      isStandaloneRole(userRole)
        ? `${base_url}/self-service/update-self-service/${selfServiceId}`
        : `${base_url}/self-service/update-self-service/${selfServiceId}/${standAloneId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

const deleteSelfService = async (
  selfServiceId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const response = await axios.delete<IApiResponse>(
      isStandaloneRole(userRole)
        ? `${base_url}/self-service/delete-self-service/${selfServiceId}`
        : `${base_url}/self-service/delete-self-service/${selfServiceId}/${standAloneId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

export const SelfServiceAction = {
  getSelfServices,
  getSelfService,
  createSelfService,
  updateSelfService,
  deleteSelfService,
};
