import { base_url } from "@/lib/utils";
import axios from "axios";
import { AuthAction, IApiResponse } from "./auth";

export interface ISuperAdminDashboardSummary {
  totalUsers: number;
  totalManagers: number;
  totalClients: number;
  totalVehicles: number;
}

export interface IUserOverviewItem {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface ITransportManagerOverviewItem {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  assignedVehicle: number;
}

export interface IClientOverviewItem {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface ISuperAdminDashboardData {
  summary: ISuperAdminDashboardSummary;
  userOverview: IUserOverviewItem[];
  transportManagerOverview: ITransportManagerOverviewItem[];
  clientOverview: IClientOverviewItem[];
}

export interface ISuperAdminDashboardResponse {
  success: boolean;
  message: string;
  data: ISuperAdminDashboardData;
}

export interface IDashboardSummaryData {
  totalClients: number;
  totalDrivers: number;
  totalVehicles: number;
  totalEvents: number;
  transportManagerName?: string;
}

export interface IDashboardSummaryResponse {
  success: boolean;
  message: string;
  data: IDashboardSummaryData;
}

function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  if (typeof data.error === "string" && data.error) return data.error;

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const messages = (data.errors as { field?: string; message: string }[])
        .map((item) =>
          item.field ? `${item.field}: ${item.message}` : item.message,
        )
        .join(", ");

      if (messages) return messages;
    }

    if (typeof data.errors === "string") return data.errors;
  }

  if (data.message) return data.message;

  return "Something went wrong";
}

const getSuperAdminDashboard =
  async (): Promise<ISuperAdminDashboardResponse> => {
    const token = AuthAction.GetAuthToken();
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get<ISuperAdminDashboardResponse>(
        `${base_url}/dashboard`,
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

const getDashboardSummary = async (): Promise<IDashboardSummaryResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IDashboardSummaryResponse>(
      `${base_url}/dashboard/summary`,
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

export const DashboardAction = {
  getSuperAdminDashboard,
  getDashboardSummary,
};
