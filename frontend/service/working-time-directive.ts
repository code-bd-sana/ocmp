import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { AuthAction } from "./auth";
import {
  CreateWorkingTimeDirectiveInput,
  DriverWithVehicles,
  UpdateWorkingTimeDirectiveInput,
  WorkingTimeDirectiveListResponse,
  WorkingTimeDirectiveRow,
} from "@/lib/working-time-directives/working-time-directive.types";
import axios from "axios";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

/* ────────── helpers ────────── */

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
  if (data.message && data.message !== "An unexpected error occurred")
    return data.message;
  return "Something went wrong";
}

/* ────────── GET many ────────── */

const getWorkingTimeDirectives = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<WorkingTimeDirectiveListResponse>> => {
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
      IApiResponse<WorkingTimeDirectiveListResponse>
    >(`${base_url}/working-time-directive/get-working-time-directives`, {
      headers: { Authorization: `Bearer ${token}` },
      params: queryParams,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/* ────────── GET single ────────── */

const getWorkingTimeDirective = async (
  workingTimeDirectiveId: string,
  standAloneId: string,
): Promise<IApiResponse<WorkingTimeDirectiveRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const url = isStandaloneRole(userRole)
      ? `${base_url}/working-time-directive/get-working-time-directive/${workingTimeDirectiveId}`
      : `${base_url}/working-time-directive/get-working-time-directive/${workingTimeDirectiveId}/${standAloneId}`;

    const response = await axios.get<IApiResponse<WorkingTimeDirectiveRow>>(
      url,
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

/* ────────── POST create (TM) ────────── */

const createWorkingTimeDirective = async (
  data: CreateWorkingTimeDirectiveInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/working-time-directive/create-stand-alone-working-time-directive`
      : `${base_url}/working-time-directive/create-working-time-directive`;

    const standAloneBody = { ...data };
    delete (standAloneBody as { standAloneId?: string }).standAloneId;
    const body = isStandaloneRole(userRole) ? standAloneBody : data;

    const response = await axios.post<IApiResponse>(
      endpoint,
      body,
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

/* ────────── PATCH update (TM) ────────── */

const updateWorkingTimeDirective = async (
  workingTimeDirectiveId: string,
  standAloneId: string,
  data: UpdateWorkingTimeDirectiveInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const url = isStandaloneRole(userRole)
      ? `${base_url}/working-time-directive/update-working-time-directive/${workingTimeDirectiveId}`
      : `${base_url}/working-time-directive/update-working-time-directive-by-manager/${workingTimeDirectiveId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse>(
      url,
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

/* ────────── DELETE (TM) ────────── */

const deleteWorkingTimeDirective = async (
  workingTimeDirectiveId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const url = isStandaloneRole(userRole)
      ? `${base_url}/working-time-directive/delete-working-time-directive/${workingTimeDirectiveId}`
      : `${base_url}/working-time-directive/delete-working-time-directive-by-manager/${workingTimeDirectiveId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(
      url,
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

/* ────────── GET drivers with vehicles ────────── */

const getDriversWithVehicles = async (
  standAloneId: string,
): Promise<IApiResponse<DriverWithVehicles[]>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {});

    const response = await axios.get<IApiResponse<DriverWithVehicles[]>>(
      `${base_url}/working-time-directive/get-drivers-with-vehicles`,
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

export const WorkingTimeDirectiveAction = {
  getWorkingTimeDirectives,
  getWorkingTimeDirective,
  createWorkingTimeDirective,
  updateWorkingTimeDirective,
  deleteWorkingTimeDirective,
  getDriversWithVehicles,
};
