import { base_url } from "@/lib/utils";
import {
  CreateSubContractorInput,
  SubContractorListResponse,
  SubContractorRow,
  UpdateSubContractorInput,
} from "@/lib/sub-contractors/sub-contractor.types";
import axios from "axios";
import { AuthAction, IApiResponse } from "./auth";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

interface SearchParams {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}

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

export const SubContractorAction = {
  async getSubContractors(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<IApiResponse<SubContractorListResponse>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

      const response = await axios.get<IApiResponse<SubContractorListResponse>>(
        `${base_url}/sub-contractor/get-sub-contractors`,
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
  },

  async getSubContractor(
    id: string,
    standAloneId: string,
  ): Promise<IApiResponse<SubContractorRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/sub-contractor/get-sub-contractor/${id}`
        : `${base_url}/sub-contractor/get-sub-contractor/${id}/${standAloneId}`;

      const response = await axios.get<IApiResponse<SubContractorRow>>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<IApiResponse>(error)) {
        throw new Error(extractApiError(error.response?.data));
      }
      throw new Error("Something went wrong");
    }
  },

  async createSubContractor(
    data: CreateSubContractorInput,
  ): Promise<IApiResponse<SubContractorRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const endpoint = isStandaloneRole(userRole)
        ? `${base_url}/sub-contractor/create-stand-alone-sub-contractor`
        : `${base_url}/sub-contractor/create-sub-contractor`;

      const standAloneBody = { ...data };
      delete (standAloneBody as { standAloneId?: string }).standAloneId;
      const body = isStandaloneRole(userRole) ? standAloneBody : data;

      const response = await axios.post<IApiResponse<SubContractorRow>>(
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
  },

  async updateSubContractor(
    id: string,
    standAloneId: string,
    data: UpdateSubContractorInput,
  ): Promise<IApiResponse<SubContractorRow>> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/sub-contractor/update-sub-contractor/${id}`
        : `${base_url}/sub-contractor/update-sub-contractor-by-manager/${id}/${standAloneId}`;

      const response = await axios.patch<IApiResponse<SubContractorRow>>(
        url,
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
  },

  async deleteSubContractor(
    id: string,
    standAloneId: string,
  ): Promise<IApiResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/sub-contractor/delete-sub-contractor/${id}`
        : `${base_url}/sub-contractor/delete-sub-contractor-by-manager/${id}/${standAloneId}`;

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
  },
};
