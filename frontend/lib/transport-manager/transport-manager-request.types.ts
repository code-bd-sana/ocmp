/**
 * Types for Transport Manager Request/Invitation System
 */

/** Manager listed for standalone users to request joining */
export interface TransportManager {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

/** Paginated response for GET /managers */
export interface ManagerListResponse {
  data: TransportManager[];
  totalData: number;
  totalPages: number;
}

/** Join request status */
export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

/** A join/request made by standalone user to transport manager */
export interface JoinRequest {
  _id: string;
  clientId: string;
  managerId: string;
  status: JoinRequestStatus;
  client: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
  };
  manager?: {
    _id: string;
    fullName: string;
    email: string;
  };
  requestedAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Paginated response for GET /join-requests (TM getting pending requests) */
export interface JoinRequestListResponse {
  data: JoinRequest[];
  totalData: number;
  totalPages: number;
}

/** Check if user has pending request - response from check endpoint */
export interface PendingRequestCheckResponse {
  hasPendingRequest: boolean;
  pendingRequest?: JoinRequest;
}
