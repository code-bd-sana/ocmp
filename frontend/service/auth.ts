import { base_url } from "@/lib/utils";
import axios from "axios";
import Cookies from "js-cookie";

export interface IRegister {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}
export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginResponseData {
  token: string;
  user?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface IApiResponse<T = unknown> {
  success?: boolean;
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string | Record<string, string>;
  errors?: string | { field?: string; message: string }[];
}

export interface IVerifyEamil {
  email: string;
  token: string;
}
export interface IResendEmail {
  email: string;
}

export interface IResetForgetPassword {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const RegisterUser = async (data: IRegister): Promise<IApiResponse> => {
  console.log(data, "user data");

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/register`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

const LoginUser = async (
  data: ILogin,
): Promise<IApiResponse<ILoginResponseData>> => {
  try {
    const response = await axios.post<IApiResponse<ILoginResponseData>>(
      `${base_url}/auth/login`,
      data,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

const VerifyEmail = async (data: IVerifyEamil) => {
  try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/auth/verify-email`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

const ResendVerificationEmail = async (data: IResendEmail) => {
  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/resend-verification-email`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};
const ForgotPassword = async (data: IResendEmail) => {
  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/forget-password`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};
const ResetForgetPassword = async (data: IResetForgetPassword) => {
  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/reset-password`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

const ChangePassword = async (data: IChangePassword) => {
  const token = GetAuthToken();
  if (!token) throw new Error('No authentication token found');

  try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/auth/change-password`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

const GetAuthToken = (): string | null => {
  return Cookies.get("token") || null;
};
const SetAuthToken = (token: string): void => {
  const isSecureContext =
    typeof window !== "undefined" && window.location.protocol === "https:";

  Cookies.set("token", token, {
    path: "/",
    sameSite: "lax",
    secure: isSecureContext,
    expires: 7,
  });
};
const RemoveAuthToken = (): void => {
  Cookies.remove("token", { path: "/", sameSite: "lax" });
};
const LogOut = async (): Promise<IApiResponse> => {
  const token = GetAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/logout`,
      {}, // usually no body needed for logout
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    //  Remove token after successful logout
    Cookies.remove("token", { path: "/" });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};
// get user Profile
const myProfile = async () => {
  const token = await GetAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const response = await axios.get(
      `${base_url}/user/me`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};
const myRole = async () => {
  console.log(base_url, "this is base url!");
  const token = await GetAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const response = await myProfile();
    return response.data.role;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

export const AuthAction = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ResendVerificationEmail,
  ForgotPassword,
  ResetForgetPassword,
  ChangePassword,
  GetAuthToken,
  SetAuthToken,
  RemoveAuthToken,
  LogOut,
  myProfile,
  myRole,
};
