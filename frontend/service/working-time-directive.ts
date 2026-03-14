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
    const response = await axios.get<
      IApiResponse<WorkingTimeDirectiveListResponse>
    >(`${base_url}/working-time-directive/get-working-time-directives`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        standAloneId,
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      },
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
    const response = await axios.get<IApiResponse<WorkingTimeDirectiveRow>>(
      `${base_url}/working-time-directive/get-working-time-directive/${workingTimeDirectiveId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { standAloneId },
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
    const response = await axios.post<IApiResponse>(
      `${base_url}/working-time-directive/create-working-time-directive`,
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

/* ────────── PATCH update (TM) ────────── */

const updateWorkingTimeDirective = async (
  workingTimeDirectiveId: string,
  standAloneId: string,
  data: UpdateWorkingTimeDirectiveInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/working-time-directive/update-working-time-directive-by-manager/${workingTimeDirectiveId}/${standAloneId}`,
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
    const response = await axios.delete<IApiResponse>(
      `${base_url}/working-time-directive/delete-working-time-directive-by-manager/${workingTimeDirectiveId}/${standAloneId}`,
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
    const response = await axios.get<IApiResponse<DriverWithVehicles[]>>(
      `${base_url}/working-time-directive/get-drivers-with-vehicles`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { standAloneId },
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
