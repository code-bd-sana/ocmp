import { ClientListResponse } from "@/lib/clients/client.types";
import {
  ManagerListResponse,
  JoinRequest,
  JoinRequestListResponse,
} from "@/lib/transport-manager/transport-manager-request.types";
import { base_url } from "@/lib/utils";
import axios from "axios";
import { AuthAction, IApiResponse } from "./auth";

export interface MyManagerAssignment {
  manager: {
    _id: string;
    fullName: string;
    email?: string;
  };
  clientStatus?: string;
  requestedAt?: string;
  approvedAt?: string;
}

export interface LeaveRequestItem {
  clientId: string;
  status: string;
  requestedAt?: string;
  approvedAt?: string;
  client: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface RemoveRequestItem {
  managerId: string;
  status: string;
  requestedAt?: string;
  approvedAt?: string;
  manager: {
    _id: string;
    fullName: string;
    email?: string;
  };
  reason?: string;
}

function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  // Service-layer errors: { error: "A user already exists..." }
  if (typeof data.error === "string" && data.error) return data.error;

  // Zod validation errors: { errors: [{ field, message }] }
  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const msgs = (data.errors as { field?: string; message: string }[]).map(
        (e) => (e.field ? `${e.field}: ${e.message}` : e.message),
      );
      return msgs.join(", ");
    }
    if (typeof data.errors === "string") return data.errors;
  }

  // Fallback to general message
  if (data.message && data.message !== "An unexpected error occurred")
    return data.message;

  return "Something went wrong";
}

const getTransportManager = async (params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<ClientListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<ClientListResponse>>(
      `${base_url}/client-management/managers`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          searchKey: params?.searchKey || undefined,
          showPerPage: params?.showPerPage || 10,
          pageNo: params?.pageNo || 1,
        },
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

/**
 * GET /api/v1/client-management/managers
 * Get list of active transport managers (for standalone users to select from)
 */
const getManagersList = async (params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<ManagerListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<unknown>>(
      `${base_url}/client-management/managers`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          searchKey: params?.searchKey || undefined,
          showPerPage: params?.showPerPage || 10,
          pageNo: params?.pageNo || 1,
        },
      },
    );
    const payload = response.data?.data;
    if (Array.isArray(payload)) {
      return {
        ...response.data,
        data: {
          data: payload,
          totalData: payload.length,
          totalPages: 1,
        },
      } as IApiResponse<ManagerListResponse>;
    }

    return response.data as IApiResponse<ManagerListResponse>;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * POST /api/v1/client-management/request-join-team
 * Standalone user sends join request to transport manager
 */
const sendJoinRequest = async (
  managerId: string,
): Promise<IApiResponse<JoinRequest>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.post<IApiResponse<JoinRequest>>(
      `${base_url}/client-management/request-join-team`,
      { managerId },
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

/**
 * GET /api/v1/client-management/join-requests
 * Transport manager gets all pending join requests from standalone users
 */
const getPendingJoinRequests = async (params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<JoinRequestListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<unknown>>(
      `${base_url}/client-management/join-requests`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          searchKey: params?.searchKey || undefined,
          showPerPage: params?.showPerPage || 10,
          pageNo: params?.pageNo || 1,
        },
      },
    );
    const payload = response.data?.data;
    if (Array.isArray(payload)) {
      return {
        ...response.data,
        data: {
          data: payload,
          totalData: payload.length,
          totalPages: 1,
        },
      } as IApiResponse<JoinRequestListResponse>;
    }

    return response.data as IApiResponse<JoinRequestListResponse>;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * PUT /api/v1/client-management/join-requests/:clientId
 * Transport manager approves or rejects a join request
 */
const respondToJoinRequest = async (
  clientId: string,
  action: "APPROVED" | "REJECTED",
): Promise<IApiResponse<JoinRequest>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  const status = action === "APPROVED" ? "approved" : "revoked";

  try {
    const response = await axios.put<IApiResponse<JoinRequest>>(
      `${base_url}/client-management/join-requests/${clientId}`,
      { status },
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

/**
 * DELETE /api/v1/client-management/clients/:clientId/remove-manager
 * Standalone user cancels their join request (removes their manager assignment)
 */
const cancelJoinRequest = async (
  clientId: string,
): Promise<IApiResponse<void>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.delete<IApiResponse<void>>(
      `${base_url}/client-management/clients/${clientId}/remove-manager`,
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

/**
 * GET /api/v1/client-management/my-manager
 * Get the current manager of the authenticated standalone user
 */
const myManager = async (): Promise<
  IApiResponse<MyManagerAssignment | null>
> => {
  const token = AuthAction.GetAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const response = await axios.get<IApiResponse<MyManagerAssignment | null>>(
      `${base_url}/client-management/my-manager`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      if (error.response?.status === 404) {
        return {
          status: false,
          statusCode: 404,
          message: "No manager assigned",
          data: null,
        };
      }
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * PATCH /api/v1/client-management/request-remove/:clientId
 * Transport manager requests removing a standalone user from team.
 */
const requestRemoveClient = async (
  clientId: string,
  reason: string,
): Promise<IApiResponse<{ clientId: string; status: string }>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<
      IApiResponse<{ clientId: string; status: string }>
    >(
      `${base_url}/client-management/request-remove/${clientId}`,
      { reason },
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

/**
 * PATCH /api/v1/client-management/request-leave
 * Standalone user requests removing their transport manager from assignment.
 */
const requestLeaveManager = async (
  reason: string,
): Promise<IApiResponse<{ managerId: string; status: string }>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<
      IApiResponse<{ managerId: string; status: string }>
    >(
      `${base_url}/client-management/request-leave`,
      { reason },
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

/**
 * GET /api/v1/client-management/leave-requests
 * Transport manager gets standalone leave requests.
 */
const getLeaveRequests = async (): Promise<
  IApiResponse<LeaveRequestItem[]>
> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<unknown>>(
      `${base_url}/client-management/leave-requests`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const payload = response.data?.data;
    if (Array.isArray(payload)) {
      return {
        ...response.data,
        data: payload as LeaveRequestItem[],
      } as IApiResponse<LeaveRequestItem[]>;
    }

    return response.data as IApiResponse<LeaveRequestItem[]>;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * PATCH /api/v1/client-management/leave-requests/:clientId
 * Transport manager accepts/rejects standalone leave request.
 */
const respondToLeaveRequest = async (
  clientId: string,
  action: "accept" | "reject",
): Promise<
  IApiResponse<{ clientId: string; action: string; newStatus: string }>
> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<
      IApiResponse<{ clientId: string; action: string; newStatus: string }>
    >(
      `${base_url}/client-management/leave-requests/${clientId}`,
      { action },
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

/**
 * GET /api/v1/client-management/remove-request
 * Standalone user gets pending remove request initiated by manager.
 */
const getRemoveRequest = async (): Promise<
  IApiResponse<RemoveRequestItem | null>
> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<RemoveRequestItem | null>>(
      `${base_url}/client-management/remove-request`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      if (error.response?.status === 404) {
        return {
          status: false,
          statusCode: 404,
          message: "No remove request found",
          data: null,
        };
      }
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * PATCH /api/v1/client-management/remove-request
 * Standalone user accepts/rejects manager remove request.
 */
const respondToRemoveRequest = async (
  action: "accept" | "reject",
): Promise<
  IApiResponse<{ clientId: string; action: string; newStatus: string }>
> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<
      IApiResponse<{ clientId: string; action: string; newStatus: string }>
    >(
      `${base_url}/client-management/remove-request`,
      { action },
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

export const TransportManagerAction = {
  getTransportManager,
  getManagersList,
  sendJoinRequest,
  getPendingJoinRequests,
  respondToJoinRequest,
  cancelJoinRequest,
  myManager,
  requestRemoveClient,
  requestLeaveManager,
  getLeaveRequests,
  respondToLeaveRequest,
  getRemoveRequest,
  respondToRemoveRequest,
};
