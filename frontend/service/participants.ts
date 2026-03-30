import axios from "axios";
import { base_url } from "@/lib/utils";
import { AuthAction, IApiResponse } from "./auth";
import {
  buildRoleScopedQuery,
  getCurrentUserRole,
  isStandaloneRole,
  requireScopedClientId,
} from "./shared/role-scope";
import {
  CreateParticipantInput,
  CreateParticipantRoleInput,
  ParticipantDetail,
  ParticipantListResponse,
  ParticipantRoleItem,
  ParticipantRoleListResponse,
  UpdateParticipantInput,
  UpdateParticipantRoleInput,
} from "@/lib/participants/participants.types";

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

const getParticipants = async (
  standAloneId?: string,
  params?: { searchKey?: string; showPerPage?: number; pageNo?: number },
): Promise<IApiResponse<ParticipantListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<ParticipantListResponse>>(
      `${base_url}/participants/get-participants`,
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
};

const getParticipantById = async (
  participantId: string,
  standAloneId?: string,
): Promise<IApiResponse<ParticipantDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const queryParams = isStandaloneRole(userRole) ? {} : { standAloneId };

    const response = await axios.get<IApiResponse<ParticipantDetail>>(
      `${base_url}/participants/get-participant/${participantId}`,
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
};

const createParticipant = async (
  data: CreateParticipantInput,
): Promise<IApiResponse<ParticipantDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/participants/create-stand-alone-participant`
      : `${base_url}/participants/create-participant`;

    const payload = isStandaloneRole(userRole)
      ? {
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          employmentStatus: data.employmentStatus,
        }
      : data;

    const response = await axios.post<IApiResponse<ParticipantDetail>>(
      endpoint,
      payload,
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

const updateParticipant = async (
  participantId: string,
  standAloneId: string | undefined,
  data: UpdateParticipantInput,
): Promise<IApiResponse<ParticipantDetail>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/participants/update-participant/${participantId}`
      : `${base_url}/participants/update-participant-by-manager/${participantId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse<ParticipantDetail>>(
      endpoint,
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
};

const deleteParticipant = async (
  participantId: string,
  standAloneId: string | undefined,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/participants/delete-participant/${participantId}`
      : `${base_url}/participants/delete-participant-by-manager/${participantId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(endpoint, {
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

const getRoles = async (
  standAloneId?: string,
  params?: { searchKey?: string; showPerPage?: number; pageNo?: number },
): Promise<IApiResponse<ParticipantRoleListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();

    const queryParams = buildRoleScopedQuery(userRole, standAloneId, {
      searchKey: params?.searchKey || undefined,
      showPerPage: params?.showPerPage || 10,
      pageNo: params?.pageNo || 1,
    });

    const response = await axios.get<IApiResponse<ParticipantRoleListResponse>>(
      `${base_url}/participants/get-roles`,
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
};

const createRole = async (
  data: CreateParticipantRoleInput,
): Promise<IApiResponse<ParticipantRoleItem>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, data.standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/participants/create-stand-alone-role`
      : `${base_url}/participants/create-role`;

    const payload = isStandaloneRole(userRole)
      ? { roleName: data.roleName }
      : data;

    const response = await axios.post<IApiResponse<ParticipantRoleItem>>(
      endpoint,
      payload,
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

const updateRole = async (
  roleId: string,
  standAloneId: string | undefined,
  data: UpdateParticipantRoleInput,
): Promise<IApiResponse<ParticipantRoleItem>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/participants/update-role/${roleId}`
      : `${base_url}/participants/update-role-by-manager/${roleId}/${standAloneId}`;

    const response = await axios.patch<IApiResponse<ParticipantRoleItem>>(
      endpoint,
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
};

const deleteRole = async (
  roleId: string,
  standAloneId: string | undefined,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const userRole = await getCurrentUserRole();
    requireScopedClientId(userRole, standAloneId);

    const endpoint = isStandaloneRole(userRole)
      ? `${base_url}/participants/delete-role/${roleId}`
      : `${base_url}/participants/delete-role-by-manager/${roleId}/${standAloneId}`;

    const response = await axios.delete<IApiResponse>(endpoint, {
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

export const ParticipantAction = {
  getParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
