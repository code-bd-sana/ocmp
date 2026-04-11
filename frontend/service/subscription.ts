import { base_url } from "@/lib/utils";
import axios from "axios";
import { AuthAction, IApiResponse } from "./auth";

export type SubscriptionPlanType = "FREE" | "PAID" | "CUSTOM";
export type ApplicableAccountType = "STANDALONE" | "TRANSPORT_MANAGER" | "BOTH";

export type SubscriptionPlan = {
  _id: string;
  name: string;
  planType: SubscriptionPlanType;
  applicableAccountType: ApplicableAccountType;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SubscriptionDuration = {
  _id: string;
  name: string;
  durationInDays: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SubscriptionPricing = {
  _id: string;
  subscriptionPlanId?: string;
  subscriptionDurationId?: string;
  subscriptionPlanName: string;
  subscriptionPlanType: SubscriptionPlanType;
  applicableAccountType: ApplicableAccountType;
  subscriptionName: string;
  subscriptionDuration: number;
  price: number;
  currency: string;
  isActive: boolean;
  subscriptionPlanStatus?: boolean;
  subscriptionDurationStatus?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RemainingSubscriptionInfo = {
  daysRemaining: number;
  expired: boolean;
  isLifetime: boolean;
  startDate?: string;
  endDate?: string;
  subscriptionId?: string;
  activePlan?: {
    subscriptionPlanId?: string;
    subscriptionDurationId?: string;
    subscriptionPricingId?: string;
    planName?: string;
    planType?: SubscriptionPlanType;
    accountType?: ApplicableAccountType;
    durationName?: string;
    durationInDays?: number;
    price?: number;
    currency?: string;
  };
};

export type CreatePaymentPayload = {
  subscriptionPricingId: string;
  coupon?: string;
};

export type CreatePaymentResponse = {
  sessionId?: string;
  checkoutUrl?: string;
};

export type CreateSubscriptionTrialPayload = {
  userId?: string;
  subscriptionPricingId?: string;
  subscriptionPlanId?: string;
  subscriptionDurationId?: string;
};

export type SubscriptionTrialEligibility = {
  eligible: boolean;
  reason: string;
  hasUsedTrial: boolean;
  isTrialEnabledByAdmin: boolean;
  hasActiveSubscription: boolean;
  trialDays: number;
};

export type SubscriptionCouponPricing = {
  _id: string;
  price: number;
  currency: string;
  planName?: string;
  duration?: string;
};

export type SubscriptionCoupon = {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  subscriptionPricings?: SubscriptionCouponPricing[];
  createdAt?: string;
  updatedAt?: string;
};

type PlanListPayload = {
  subscriptionPlans: SubscriptionPlan[];
  totalData: number;
  totalPages: number;
};

type DurationListPayload = {
  subscriptionDurations: SubscriptionDuration[];
  totalData: number;
  totalPages: number;
};

type PricingListPayload = {
  subscriptionPricings: SubscriptionPricing[];
  totalData: number;
  totalPages: number;
};

type CouponListPayload = {
  subscriptionCoupons: SubscriptionCoupon[];
  totalData: number;
  totalPages: number;
};

type CreatePlanPayload = {
  name: string;
  planType: SubscriptionPlanType;
  applicableAccountType: ApplicableAccountType;
  description?: string;
  isActive?: boolean;
};

type CreateDurationPayload = {
  name: string;
  durationInDays: number;
  isActive: boolean;
};

type UpdateDurationPayload = Partial<CreateDurationPayload>;

type CreatePricingPayload = {
  subscriptionPlanId: string;
  subscriptionDurationId: string;
  price: number;
  currency: string;
  isActive?: boolean;
};

type UpdatePricingPayload = Partial<CreatePricingPayload>;

type CreateCouponPayload = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive?: boolean;
  subscriptionPricings?: string[];
  users?: string[];
};

type UpdateCouponPayload = Partial<CreateCouponPayload>;

function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  if (typeof data.error === "string" && data.error) return data.error;

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const messages = data.errors.map((entry) =>
        entry.field ? `${entry.field}: ${entry.message}` : entry.message,
      );
      return messages.join(", ");
    }

    if (typeof data.errors === "string") return data.errors;
  }

  if (data.message) return data.message;

  return "Something went wrong";
}

function getAuthHeaders() {
  const token = AuthAction.GetAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  return { Authorization: `Bearer ${token}` };
}

const getSubscriptionPlans = async (params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<PlanListPayload>> => {
  try {
    const response = await axios.get<IApiResponse<PlanListPayload>>(
      `${base_url}/subscription-plan`,
      {
        headers: getAuthHeaders(),
        params: {
          searchKey: params?.searchKey || "",
          showPerPage: params?.showPerPage || 100,
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

const getSubscriptionDurations = async (): Promise<
  IApiResponse<DurationListPayload>
> => {
  try {
    const response = await axios.get<IApiResponse<DurationListPayload>>(
      `${base_url}/subscription-duration`,
      {
        headers: getAuthHeaders(),
        params: {
          showPerPage: 100,
          pageNo: 1,
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

const getSubscriptionPricings = async (): Promise<
  IApiResponse<PricingListPayload>
> => {
  try {
    const response = await axios.get<IApiResponse<PricingListPayload>>(
      `${base_url}/subscription-pricing`,
      {
        headers: getAuthHeaders(),
        params: {
          showPerPage: 100,
          pageNo: 1,
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

const createSubscriptionPlan = async (
  payload: CreatePlanPayload,
): Promise<IApiResponse<SubscriptionPlan>> => {
  try {
    const response = await axios.post<IApiResponse<SubscriptionPlan>>(
      `${base_url}/subscription-plan`,
      payload,
      { headers: getAuthHeaders() },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const updateSubscriptionPlan = async (
  id: string,
  payload: Partial<CreatePlanPayload>,
): Promise<IApiResponse<SubscriptionPlan>> => {
  try {
    // Backend validation expects id in request body for updates.
    const response = await axios.patch<IApiResponse<SubscriptionPlan>>(
      `${base_url}/subscription-plan/${id}`,
      { ...payload, id },
      { headers: getAuthHeaders() },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const deleteSubscriptionPlan = async (id: string): Promise<IApiResponse> => {
  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/subscription-plan/${id}`,
      {
        headers: getAuthHeaders(),
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

const createSubscriptionDuration = async (
  payload: CreateDurationPayload,
): Promise<IApiResponse<SubscriptionDuration>> => {
  try {
    const response = await axios.post<IApiResponse<SubscriptionDuration>>(
      `${base_url}/subscription-duration`,
      payload,
      { headers: getAuthHeaders() },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const updateSubscriptionDuration = async (
  id: string,
  payload: UpdateDurationPayload,
): Promise<IApiResponse<SubscriptionDuration>> => {
  try {
    const response = await axios.put<IApiResponse<SubscriptionDuration>>(
      `${base_url}/subscription-duration/${id}`,
      payload,
      { headers: getAuthHeaders() },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const deleteSubscriptionDuration = async (
  id: string,
): Promise<IApiResponse> => {
  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/subscription-duration/${id}`,
      {
        headers: getAuthHeaders(),
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

const createSubscriptionPricing = async (
  payload: CreatePricingPayload,
): Promise<IApiResponse<SubscriptionPricing>> => {
  try {
    const response = await axios.post<IApiResponse<SubscriptionPricing>>(
      `${base_url}/subscription-pricing`,
      payload,
      { headers: getAuthHeaders() },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const updateSubscriptionPricing = async (
  id: string,
  payload: UpdatePricingPayload,
): Promise<IApiResponse<SubscriptionPricing>> => {
  try {
    // Backend validation expects id in body for updates.
    const response = await axios.patch<IApiResponse<SubscriptionPricing>>(
      `${base_url}/subscription-pricing/${id}`,
      { ...payload, id },
      { headers: getAuthHeaders() },
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const deleteSubscriptionPricing = async (id: string): Promise<IApiResponse> => {
  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/subscription-pricing/${id}`,
      {
        headers: getAuthHeaders(),
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

const getSubscriptionRemainingDays = async (): Promise<
  IApiResponse<RemainingSubscriptionInfo>
> => {
  try {
    const response = await axios.get<IApiResponse<RemainingSubscriptionInfo>>(
      `${base_url}/subscription-remain/remaining`,
      {
        headers: getAuthHeaders(),
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

const createSubscriptionCheckout = async (
  payload: CreatePaymentPayload,
): Promise<IApiResponse<CreatePaymentResponse>> => {
  try {
    const response = await axios.post<IApiResponse<CreatePaymentResponse>>(
      `${base_url}/payment`,
      payload,
      {
        headers: getAuthHeaders(),
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

const createSubscriptionTrial = async (
  payload: CreateSubscriptionTrialPayload,
): Promise<IApiResponse> => {
  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/subscription-trial`,
      payload,
      {
        headers: getAuthHeaders(),
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

const getSubscriptionTrialEligibility = async (): Promise<
  IApiResponse<SubscriptionTrialEligibility>
> => {
  try {
    const response = await axios.get<
      IApiResponse<SubscriptionTrialEligibility>
    >(`${base_url}/subscription-trial/eligible`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }

    throw new Error("Something went wrong");
  }
};

const getSubscriptionCoupons = async (params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<CouponListPayload>> => {
  try {
    const response = await axios.get<IApiResponse<CouponListPayload>>(
      `${base_url}/subscription-coupon/many`,
      {
        headers: getAuthHeaders(),
        params: {
          searchKey: params?.searchKey || "",
          showPerPage: params?.showPerPage || 100,
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

const createSubscriptionCoupon = async (
  payload: CreateCouponPayload,
): Promise<IApiResponse<SubscriptionCoupon>> => {
  try {
    const response = await axios.post<IApiResponse<SubscriptionCoupon>>(
      `${base_url}/subscription-coupon`,
      payload,
      {
        headers: getAuthHeaders(),
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

const updateSubscriptionCoupon = async (
  id: string,
  payload: UpdateCouponPayload,
): Promise<IApiResponse<SubscriptionCoupon>> => {
  try {
    const response = await axios.patch<IApiResponse<SubscriptionCoupon>>(
      `${base_url}/subscription-coupon/${id}`,
      payload,
      {
        headers: getAuthHeaders(),
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

const deleteSubscriptionCoupon = async (id: string): Promise<IApiResponse> => {
  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/subscription-coupon/${id}`,
      {
        headers: getAuthHeaders(),
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

export const SubscriptionAction = {
  getSubscriptionPlans,
  getSubscriptionDurations,
  getSubscriptionPricings,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  createSubscriptionDuration,
  updateSubscriptionDuration,
  deleteSubscriptionDuration,
  createSubscriptionPricing,
  updateSubscriptionPricing,
  deleteSubscriptionPricing,
  getSubscriptionRemainingDays,
  createSubscriptionCheckout,
  createSubscriptionTrial,
  getSubscriptionTrialEligibility,
  getSubscriptionCoupons,
  createSubscriptionCoupon,
  updateSubscriptionCoupon,
  deleteSubscriptionCoupon,
};
