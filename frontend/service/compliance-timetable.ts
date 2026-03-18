import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  ComplianceTimetableListResponse,
  ComplianceTimetableRow,
  CreateComplianceTimetableInput,
  UpdateComplianceTimetableInput,
} from "@/lib/compliance-timetable/compliance-timetable.types";
import { UserAction } from "./user";

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

/**
 * Get the current user's role (cached or fresh fetch)
 */
let cachedUserRole: string | null = null;
export const getUserRole = async (): Promise<string | null> => {
  if (cachedUserRole) return cachedUserRole;
  try {
    const profileResp = await UserAction.getProfile();
    cachedUserRole = profileResp.data?.role || null;
    return cachedUserRole;
  } catch {
    return null;
  }
};

/**
 * GET /api/v1/compliance-timetable/get-all?standAloneId=...
 */
const getComplianceTimetables = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<ComplianceTimetableListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const queryParams =
      userRole === "STANDALONE_USER"
        ? {
            searchKey: params?.searchKey || undefined,
            showPerPage: params?.showPerPage || 10,
            pageNo: params?.pageNo || 1,
          }
        : {
            standAloneId,
            searchKey: params?.searchKey || undefined,
            showPerPage: params?.showPerPage || 10,
            pageNo: params?.pageNo || 1,
          };

    const response = await axios.get<
      IApiResponse<ComplianceTimetableListResponse>
    >(`${base_url}/compliance-timetable/get-all`, {
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

/**
 * GET /api/v1/compliance-timetable/:complianceTimetableId/:standAloneId
 */
const getComplianceTimetable = async (
  complianceTimetableId: string,
  standAloneId: string,
): Promise<IApiResponse<ComplianceTimetableRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/compliance-timetable/${complianceTimetableId}`
        : `${base_url}/compliance-timetable/${complianceTimetableId}/${standAloneId}`;

    const response = await axios.get<IApiResponse<ComplianceTimetableRow>>(
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

const createComplianceTimetable = async (
  data: CreateComplianceTimetableInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const endpoint =
      userRole === "STANDALONE_USER"
        ? `${base_url}/compliance-timetable/create-as-standalone`
        : `${base_url}/compliance-timetable/create-as-manager`;

    const response = await axios.post<IApiResponse>(endpoint, data, {
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

const updateComplianceTimetable = async (
  complianceTimetableId: string,
  standAloneId: string,
  data: UpdateComplianceTimetableInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/compliance-timetable/update-as-standalone/${complianceTimetableId}`
        : `${base_url}/compliance-timetable/update-as-manager/${complianceTimetableId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse>(url, data, {
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

const deleteComplianceTimetable = async (
  complianceTimetableId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const url =
      userRole === "STANDALONE_USER"
        ? `${base_url}/compliance-timetable/${complianceTimetableId}`
        : `${base_url}/compliance-timetable/${complianceTimetableId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(url, {
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

export const ComplianceTimetableAction = {
  getComplianceTimetables,
  getComplianceTimetable,
  createComplianceTimetable,
  updateComplianceTimetable,
  deleteComplianceTimetable,
};
