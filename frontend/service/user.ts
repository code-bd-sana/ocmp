import { base_url } from "@/lib/utils";
import axios from "axios";
import { AuthAction } from "./auth";
import { IApiResponse } from "./auth";

export interface IUserProfile {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
}

export type UserListRoleFilter = "all" | "transport-manager" | "standalone";

export interface IGetAllUsersParams {
  role?: UserListRoleFilter;
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}

export interface IGetAllUsersItem {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string | null;
  assignedVehicle?: number;
}

export interface IGetAllUsersResponse {
  success: boolean;
  message: string;
  data: IGetAllUsersItem[];
  totalData: number;
  totalPages: number;
  currentPage: number;
}

function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  if (typeof data.error === "string" && data.error) return data.error;

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const messages = (data.errors as { field?: string; message: string }[])
        .map((item) => (item.field ? `${item.field}: ${item.message}` : item.message))
        .join(", ");

      if (messages) return messages;
    }

    if (typeof data.errors === "string") return data.errors;
  }

  if (data.message) return data.message;

  return "Something went wrong";
}

const getProfile = async (): Promise<IApiResponse<IUserProfile>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");
  const response = await axios.get<IApiResponse<IUserProfile>>(
    `${base_url}/user/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

const getAllUsers = async (
  params?: IGetAllUsersParams,
): Promise<IGetAllUsersResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IGetAllUsersResponse>(
      `${base_url}/user/get-all`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          role: params?.role ?? "all",
          searchKey: params?.searchKey || undefined,
          showPerPage: params?.showPerPage ?? 10,
          pageNo: params?.pageNo ?? 1,
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

export const UserAction = { getProfile, getAllUsers };
