import { base_url } from "@/lib/utils";
import axios from "axios";
export interface IRegister {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

const RegisterUser = async (data: IRegister) => {
  console.log("hit");
  try {
    const response = await axios.post(`${base_url}/auth/register`, data);
    console.log(response, "Register success");

    if (response.data.status === 201) {
      window.location.href = "/signin";
    }
    return response;
  } catch (error: any) {
    // AxiosError handle korar proper way
    if (axios.isAxiosError(error)) {
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
      console.log("Headers:", error.response?.headers);
    } else {
      console.log(error, "Unknown error");
    }

    // Optional: user friendly message
    return {
      status: "error",
      message: error.response?.data?.error || "Something went wrong",
    };
  }
};

export const AuthAction = {
  RegisterUser,
};
