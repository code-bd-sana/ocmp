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

export const UserAction = { getProfile };
