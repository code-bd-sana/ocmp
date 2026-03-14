/* ────────── helpers ────────── */

import {
  CreateFuelUsageBody,
  DriverWithVehicles,
  FuelUsageListResponse,
  UpdateFuelUsageBody,
} from "@/lib/fuel-usage/fuel-usage.types";
import { AuthAction, IApiResponse } from "./auth";
import axios from "axios";
import { base_url } from "@/lib/utils";

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

/** CREATE fuel usage as Transport Manager */
const createFuelUsageAsManager = async (
  data: CreateFuelUsageBody,
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");
  try {
    const response = await axios.post<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/create-fuel-usage`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

/** CREATE fuel usage as Standalone User */
const createFuelUsageAsStandalone = async (
  data: CreateFuelUsageBody,
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");
  try {
    const response = await axios.post<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/create-stand-alone-fuel-usage`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

/** GET MANY */
const getFuelUsages = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/get-fuel-usages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          standAloneId,
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

/** GET Single by Id as Transport Manager*/
const getFuelUsage = async (
  id: string,
  standAloneId: string,
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/get-fuel-usage/${id}/${standAloneId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { id, standAloneId },
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

/** GET Single by Id as Standalone User*/
const getFuelUsageStandalone = async (
  id: string,
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/get-fuel-usage/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { id },
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

/** UPDATE fuel usage by Id as Transport Manager */
const updateFuelUsage = async (
  id: string,
  standAloneId: string,
  data: UpdateFuelUsageBody,
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/update-fuel-usage/${id}/${standAloneId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

/** UPDATE fuel usage by Id as Standalone User */
const updateFuelUsageAsStandalone = async (
  id: string,
  data: UpdateFuelUsageBody,
): Promise<IApiResponse<FuelUsageListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse<FuelUsageListResponse>>(
      `${base_url}/fuel-usage/update-fuel-usage/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

/** DELETE fuel usage by Id as Transport Manager */
const deleteFuelUsage = async (
  id: string,
  standAloneId: string,
): Promise<IApiResponse<void>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.delete<IApiResponse<void>>(
      `${base_url}/fuel-usage/delete-fuel-usage/${id}/${standAloneId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

/** DELETE fuel usage by Id as Standalone User */
const deleteFuelUsageAsStandalone = async (
  id: string,
): Promise<IApiResponse<void>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");
  try {
    const response = await axios.delete<IApiResponse<void>>(
      `${base_url}/fuel-usage/delete-fuel-usage/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

/* ────────── GET drivers with vehicles ────────── */

const getDriversWithVehicles = async (
  standAloneId: string,
): Promise<IApiResponse<DriverWithVehicles[]>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<DriverWithVehicles[]>>(
      `${base_url}/fuel-usage/get-drivers-with-vehicles`,
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

export const FuelUsageAction = {
  createFuelUsageAsManager,
  createFuelUsageAsStandalone,
  getFuelUsages,
  getFuelUsage,
  getFuelUsageStandalone,
  updateFuelUsage,
  updateFuelUsageAsStandalone,
  deleteFuelUsage,
  deleteFuelUsageAsStandalone,
  getDriversWithVehicles,
};
