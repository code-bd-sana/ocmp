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
  } catch (error) {
    console.log(error, "hi");
    return error;
  }
};

export const AuthAction = {
  RegisterUser,
};
