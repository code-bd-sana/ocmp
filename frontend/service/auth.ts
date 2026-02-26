import { base_url } from "@/lib/utils";
import axios from "axios";
export interface IRegister {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const RegisterUser = async (data: IRegister) => {
  try {
    const response = await axios.post(`${base_url}/auth/register`);
    console.log(response, "Login success");
  } catch (error) {
    return error;
  }
};

export const authAction = {
  RegisterUser,
};
