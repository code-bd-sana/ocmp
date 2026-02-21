import mongoose, { Document, Schema } from 'mongoose';

export enum ClientStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REVOKED = 'revoked',
  LEAVE_REQUESTED = 'leave_requested',
  REMOVE_REQUESTED = 'remove_requested',
}

export interface IClientEntry {
  clientId: mongoose.Types.ObjectId;
  status: ClientStatus;
  requestedAt: Date;
  approvedAt?: Date;
}

/** Interface representing a ClientManagement document (one document per Transport Manager) */
export interface IClientManagement extends Document {
  managerId: mongoose.Types.ObjectId;
  clientLimit: number;
  clients: IClientEntry[];
}

// Sub-schema for each client entry in the embedded array
const ClientEntrySchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } /* Client user in the manager's team */,
    status: {
      type: String,
      enum: Object.values(ClientStatus),
      default: ClientStatus.PENDING,
    } /* Current status: pending | approved | revoked | leave_requested | remove_requested */,
    requestedAt: {
      type: Date,
      default: Date.now,
    } /* When the client requested / was added */,
    approvedAt: {
      type: Date,
      default: null,
    } /* When the manager approved (null if pending/revoked) */,
  },
  { _id: false }
);

// Main schema — one document per Transport Manager
const ClientManagementSchema: Schema<IClientManagement> = new Schema(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    } /* Transport Manager — one document per manager */,
    clientLimit: {
      type: Number,
      default: 4,
    } /* Maximum number of active clients (pending + approved) */,
    clients: {
      type: [ClientEntrySchema],
      default: [],
    } /* Embedded array of client entries */,
  },
  { timestamps: true, versionKey: false }
);

// Index for efficient lookup of a client across all manager documents
ClientManagementSchema.index({ 'clients.clientId': 1 });

// Create the ClientManagement model
const ClientManagement = mongoose.model<IClientManagement>(
  'ClientManagement',
  ClientManagementSchema
);

// Export the ClientManagement model
export default ClientManagement;