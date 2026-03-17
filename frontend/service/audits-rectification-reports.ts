import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  AuditRectificationReportListResponse,
  AuditRectificationReportRow,
  CreateAuditRectificationReportInput,
  UpdateAuditRectificationReportInput,
} from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

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

const getReports = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<AuditRectificationReportListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<
      IApiResponse<AuditRectificationReportListResponse>
    >(`${base_url}/audit-and-recification-report/get-all`, {
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

const getReport = async (
  reportId: string,
  standAloneId: string,
): Promise<IApiResponse<AuditRectificationReportRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<AuditRectificationReportRow>>(
      `${base_url}/audit-and-recification-report/get-by-id/${reportId}`,
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

const createReport = async (
  data: CreateAuditRectificationReportInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/audit-and-recification-report/create-as-tm`,
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

const updateReport = async (
  reportId: string,
  standAloneId: string,
  data: UpdateAuditRectificationReportInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/audit-and-recification-report/update-by-manager/${reportId}/${standAloneId}`,
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

const deleteReport = async (
  reportId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/audit-and-recification-report/delete-by-manager/${reportId}/${standAloneId}`,
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

export const AuditRectificationReportsAction = {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
};
