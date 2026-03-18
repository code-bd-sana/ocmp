import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import { UserAction } from "./user";
import {
  AuditRectificationReportListResponse,
  AuditRectificationReportRow,
  CreateAuditRectificationReportInput,
  UpdateAuditRectificationReportInput,
} from "@/lib/audits-rectification-reports/audits-rectification-reports.types";

let cachedUserRole: string | null = null;
const getUserRole = async (): Promise<string | null> => {
  if (cachedUserRole) return cachedUserRole;

  try {
    const profileResp = await UserAction.getProfile();
    cachedUserRole = profileResp.data?.role || null;
    return cachedUserRole;
  } catch {
    return null;
  }
};

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
      IApiResponse<AuditRectificationReportListResponse>
    >(`${base_url}/audit-and-recification-report/get-all`, {
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

const getReport = async (
  reportId: string,
  standAloneId: string,
): Promise<IApiResponse<AuditRectificationReportRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getUserRole();

    const response = await axios.get<IApiResponse<AuditRectificationReportRow>>(
      `${base_url}/audit-and-recification-report/get-by-id/${reportId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params:
          userRole === "STANDALONE_USER"
            ? undefined
            : { standAloneId },
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
    const userRole = await getUserRole();
    const endpoint =
      userRole === "STANDALONE_USER"
        ? `${base_url}/audit-and-recification-report/create-stand-alone`
        : `${base_url}/audit-and-recification-report/create-as-tm`;

    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("type", data.type);

    if (userRole !== "STANDALONE_USER") {
      formData.append("standAloneId", data.standAloneId);
    }

    if (data.auditDate) formData.append("auditDate", data.auditDate);
    if (data.auditDetails) formData.append("auditDetails", data.auditDetails);
    if (data.status) formData.append("status", data.status);
    if (data.responsiblePerson) {
      formData.append("responsiblePerson", data.responsiblePerson);
    }
    if (data.finalizeDate) formData.append("finalizeDate", data.finalizeDate);

    if (data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await axios.post<IApiResponse>(
      endpoint,
      formData,
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
    const userRole = await getUserRole();

    const formData = new FormData();

    if (data.auditDate) formData.append("auditDate", data.auditDate);
    if (data.title) formData.append("title", data.title);
    if (data.type) formData.append("type", data.type);
    if (data.auditDetails) formData.append("auditDetails", data.auditDetails);
    if (data.status) formData.append("status", data.status);
    if (data.responsiblePerson) {
      formData.append("responsiblePerson", data.responsiblePerson);
    }
    if (data.finalizeDate) formData.append("finalizeDate", data.finalizeDate);

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

    const endpoint =
      userRole === "STANDALONE_USER"
        ? `${base_url}/audit-and-recification-report/update-by-standalone/${reportId}`
        : `${base_url}/audit-and-recification-report/update-by-manager/${reportId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse>(
      endpoint,
      formData,
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
    const userRole = await getUserRole();
    const endpoint =
      userRole === "STANDALONE_USER"
        ? `${base_url}/audit-and-recification-report/delete-by-standalone/${reportId}`
        : `${base_url}/audit-and-recification-report/delete-by-manager/${reportId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(
      endpoint,
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
