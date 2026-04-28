import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";

export interface IContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Service function to submit contact form data to the backend
 */
const submitContactForm = async (
  data: IContactFormData,
): Promise<IApiResponse> => {
  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/contact-form/submit`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string"
          ? apiError
          : "Failed to submit contact form",
      );
    }
    throw new Error("Something went wrong");
  }
};

export const ContactFormAction = {
  submitContactForm,
};
