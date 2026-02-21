import { ClientStatus } from '../../models';

/**
 * Type definition for client-management.
 *
 * This type defines the structure of a single client-management object.
 * @interface TClientManagement
 */
export interface TClientManagement {
  managerId: string;
  clientLimit: number;
  clients: {
    clientId: string;
    status: ClientStatus;
    requestedAt: Date;
    approvedAt?: Date;
  }[];
}

/**
 * Interface representing the client limit status response.
 * @interface IClientLimitStatus
 */
export interface IClientLimitStatus {
  clientLimit: number;
  currentClients: number;
  remaining: number;
}