import { AuthAction, IApiResponse } from "./auth";
import axios from "axios";
import { base_url } from "@/lib/utils";
import {
  CreateWheelReTorqueInput,
  UpdateWheelReTorqueInput,
  WheelReTorqueRow,
} from "@/lib/wheel-retorque/wheel-retorque.types";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";

interface WheelRetorqueResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: WheelReTorqueRow;
}

interface WheelRetorqueListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    wheelRetorque: WheelReTorqueRow[];
    totalData: number;
    totalPages: number;
  };
}

interface BackendWheelRetorqueListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    wheelRetorquePolicyMonitorings: WheelReTorqueRow[];
    totalData: number;
    totalPages: number;
  };
}

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

function toErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<IApiResponse>(error)) {
    return extractApiError(error.response?.data);
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export const WheelRetorquePolicyAction = {
  /**
   * Create a new Wheel Retorque Policy Monitoring as Transport Manager
   */
  async createWheelRetorque(
    data: CreateWheelReTorqueInput,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, data.standAloneId);

      const endpoint = isStandaloneRole(userRole)
        ? `${base_url}/wheel-retorque-policy/create-stand-alone-wheel-retorque-policy-monitoring`
        : `${base_url}/wheel-retorque-policy/create-wheel-retorque-policy-monitoring`;

      const standAloneBody = { ...data };
      delete (standAloneBody as { standAloneId?: string }).standAloneId;
      const body = isStandaloneRole(userRole) ? standAloneBody : data;

      const response = await axios.post<WheelRetorqueResponse>(
        endpoint,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to create wheel retorque policy monitoring",
        ),
      };
    }
  },

  /**
   * Create a new Wheel Retorque Policy Monitoring as Standalone User
   */
  async createWheelRetorqueAsStandAlone(
    data: CreateWheelReTorqueInput,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.post<WheelRetorqueResponse>(
        `${base_url}/wheel-retorque-policy/create-stand-alone-wheel-retorque-policy-monitoring`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to create wheel retorque policy monitoring",
        ),
      };
    }
  },

  /**
   * Get many Wheel Retorque Policy Monitorings (for Transport Manager - with standAloneId)
   */
  async getWheelRetorques(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<WheelRetorqueListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      });

      const response = await axios.get<BackendWheelRetorqueListResponse>(
        `${base_url}/wheel-retorque-policy/get-wheel-retorque-policy-monitorings`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: queryParams,
        },
      );

      return {
        status: response.data.status,
        statusCode: response.data.statusCode,
        message: response.data.message,
        data: response.data.data
          ? {
              wheelRetorque:
                response.data.data.wheelRetorquePolicyMonitorings || [],
              totalData: response.data.data.totalData,
              totalPages: response.data.data.totalPages,
            }
          : undefined,
      };
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to fetch wheel retorque policy monitorings",
        ),
      };
    }
  },

  /**
   * Get many Wheel Retorque Policy Monitorings as Standalone User
   */
  async getWheelRetorqueAsStandAlone(
    params?: SearchParams,
  ): Promise<WheelRetorqueListResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get<BackendWheelRetorqueListResponse>(
        `${base_url}/wheel-retorque-policy/get-wheel-retorque-policy-monitorings`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      return {
        status: response.data.status,
        statusCode: response.data.statusCode,
        message: response.data.message,
        data: response.data.data
          ? {
              wheelRetorque:
                response.data.data.wheelRetorquePolicyMonitorings || [],
              totalData: response.data.data.totalData,
              totalPages: response.data.data.totalPages,
            }
          : undefined,
      };
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to fetch wheel retorque policy monitorings",
        ),
      };
    }
  },

  /**
   * Get a single Wheel Retorque Policy Monitoring by ID as Transport Manager
   */
  async getWheelRetorque(
    monitoringId: string,
    standAloneId: string,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/wheel-retorque-policy/get-wheel-retorque-policy-monitoring/${monitoringId}`
        : `${base_url}/wheel-retorque-policy/get-wheel-retorque-policy-monitoring/${monitoringId}/${standAloneId}`;

      const response = await axios.get<WheelRetorqueResponse>(
        url,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to fetch wheel retorque policy monitoring",
        ),
      };
    }
  },

  /**
   * Update a Wheel Retorque Policy Monitoring as Transport Manager
   */
  async updateWheelRetorque(
    monitoringId: string,
    standAloneId: string,
    data: UpdateWheelReTorqueInput,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/wheel-retorque-policy/update-wheel-retorque-policy-monitoring/${monitoringId}`
        : `${base_url}/wheel-retorque-policy/update-wheel-retorque-policy-monitoring-by-manager/${monitoringId}/${standAloneId}`;

      const response = await axios.patch<WheelRetorqueResponse>(
        url,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to update wheel retorque policy monitoring",
        ),
      };
    }
  },

  /**
   * Update Wheel Retorque Policy Monitoring as standalone user
   */
  async updateWheelRetorqueAsStandAlone(
    monitoringId: string,
    data: UpdateWheelReTorqueInput,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.patch<WheelRetorqueResponse>(
        `${base_url}/wheel-retorque-policy/update-wheel-retorque-policy-monitoring/${monitoringId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to update wheel retorque policy monitoring",
        ),
      };
    }
  },

  /**
   * Delete a Wheel Retorque Policy Monitoring as Transport Manager
   */
  async deleteWheelRetorque(
    monitoringId: string,
    standAloneId: string,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const userRole = await getCurrentUserRole();
      requireScopedClientId(userRole, standAloneId);

      const url = isStandaloneRole(userRole)
        ? `${base_url}/wheel-retorque-policy/delete-wheel-retorque-policy-monitoring/${monitoringId}`
        : `${base_url}/wheel-retorque-policy/delete-wheel-retorque-policy-monitoring-by-manager/${monitoringId}/${standAloneId}`;

      const response = await axios.delete<WheelRetorqueResponse>(
        url,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to delete wheel retorque policy monitoring",
        ),
      };
    }
  },

  /**
   * Delete Wheel Retorque Policy Monitoring as standalone user
   */
  async deleteWheelRetorqueAsStandAlone(
    monitoringId: string,
  ): Promise<WheelRetorqueResponse> {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.delete<WheelRetorqueResponse>(
        `${base_url}/wheel-retorque-policy/delete-wheel-retorque-policy-monitoring/${monitoringId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error: unknown) {
      return {
        status: false,
        message: toErrorMessage(
          error,
          "Failed to delete wheel retorque policy monitoring",
        ),
      };
    }
  },
};
