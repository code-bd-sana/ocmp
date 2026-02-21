import crypto from 'crypto';
import mongoose from 'mongoose';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import { User, UserRole, ClientManagement, ClientStatus, IClientManagement } from '../../models';
import HashInfo from '../../utils/bcrypt/hash-info';
import SendEmail from '../../utils/email/send-email';
import { IClientLimitStatus } from './client-management.interface';
import {
  ActionInput,
  CreateClientInput,
  RequestJoinTeamInput,
  UpdateClientLimitInput,
  UpdateJoinRequestInput,
} from './client-management.validation';

/**
 * Service: Create a new client user and add to the TM's team with status APPROVED.
 * (When a TM creates a client directly, no pending stage — auto-approved.)
 *
 * @param {string} managerId - The Transport Manager's user ID (from req.user._id).
 * @param {CreateClientInput} data - { fullName, email }.
 * @returns {Promise<Partial<IClientManagement>>} - The updated/created manager document.
 */
const createClient = async (
  managerId: string,
  data: CreateClientInput
): Promise<Partial<IClientManagement>> => {
  const managerObjId = new mongoose.Types.ObjectId(managerId);

  // 1. Parallel checks: email taken? + manager's doc
  const [existingUser, managerDoc] = await Promise.all([
    User.findOne({ email: data.email }).select('_id').lean(),
    ClientManagement.findOne({ managerId: managerObjId }),
  ]);

  if (existingUser) throw new Error('A user already exists with this email');

  // Check limit (count active = pending + approved)
  const clientLimit = managerDoc?.clientLimit ?? 4;
  const activeClients =
    managerDoc?.clients.filter((c) => c.status !== ClientStatus.REVOKED).length ?? 0;
  if (activeClients >= clientLimit) {
    throw new Error(
      `Client limit reached. Maximum: ${clientLimit}. Current: ${activeClients}`
    );
  }

  // 2. Generate password + hash
  const plainPassword = crypto.randomBytes(5).toString('hex');
  const hashedPassword = await HashInfo(plainPassword);

  // 3. Create user
  const newUser = await User.create({
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
    role: UserRole.STANDALONE_USER,
    isEmailVerified: true,
    isActive: true,
  });

  // 4. Add client to manager's doc (upsert if doc doesn't exist yet)
  const clientEntry = {
    clientId: newUser._id as mongoose.Types.ObjectId,
    status: ClientStatus.APPROVED,
    requestedAt: new Date(),
    approvedAt: new Date(),
  };

  let updatedDoc: IClientManagement;
  if (managerDoc) {
    managerDoc.clients.push(clientEntry);
    updatedDoc = await managerDoc.save();
  } else {
    updatedDoc = await ClientManagement.create({
      managerId: managerObjId,
      clientLimit,
      clients: [clientEntry],
    });
  }

  // 5. Send email — fire and forget (don't block the response)
  await SendEmail({
    to: data.email,
    subject: 'Your account has been created',
    text: `Hello ${data.fullName}, your account has been created. Email: ${data.email} | Password: ${plainPassword}`,
    html: `
      <h3>Welcome, ${data.fullName}!</h3>
      <p>Your account has been created by your Transport Manager.</p>
      <p>You can log in using the following credentials:</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${data.email}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Password:</td><td style="padding: 8px; font-family: monospace; font-size: 16px;">${plainPassword}</td></tr>
      </table>
      <p>Please change your password after your first login.</p>
    `,
  }).catch((err) => console.error('[createClient] Email send failed:', err.message));

  return updatedDoc;
};

/**
 * Service: Client requests to join a Transport Manager's team.
 * Adds the client with status PENDING. Manager can approve/reject later.
 * clientId comes from the authenticated user's token (not from body/params).
 *
 * @param {string} clientId - The client's user ID (from req.user._id).
 * @param {RequestJoinTeamInput} data - { managerId }.
 * @returns {Promise<Partial<IClientManagement>>} - The updated/created manager document.
 */
const requestJoinTeam = async (
  clientId: string,
  data: RequestJoinTeamInput
): Promise<Partial<IClientManagement>> => {
  const managerObjId = new mongoose.Types.ObjectId(data.managerId);
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  // Parallel checks: manager is TM? + client already in any team? + manager's doc
  const [manager, existingTeam, managerDoc] = await Promise.all([
    User.findById(data.managerId).select('role').lean(),
    ClientManagement.findOne({
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: {
            $in: [
              ClientStatus.PENDING,
              ClientStatus.APPROVED,
              ClientStatus.LEAVE_REQUESTED,
              ClientStatus.REMOVE_REQUESTED,
            ],
          },
        },
      },
    })
      .select('managerId')
      .lean(),
    ClientManagement.findOne({ managerId: managerObjId }),
  ]);

  if (!manager) throw new Error('Transport Manager not found');
  if (manager.role !== UserRole.TRANSPORT_MANAGER) {
    throw new Error('User is not a Transport Manager');
  }
  if (existingTeam) {
    throw new Error(
      'You are already assigned to a Transport Manager. Leave the current team first.'
    );
  }

  // Check limit
  const clientLimit = managerDoc?.clientLimit ?? 4;
  const activeClients =
    managerDoc?.clients.filter((c) => c.status !== ClientStatus.REVOKED).length ?? 0;
  if (activeClients >= clientLimit) {
    throw new Error(
      `This Transport Manager's team is full. Limit: ${clientLimit}`
    );
  }

  // Check if a REVOKED entry already exists for this client under this manager — reuse it
  let updatedDoc: IClientManagement;

  if (managerDoc) {
    const existingEntry = managerDoc.clients.find(
      (c) => c.clientId.toString() === clientId && c.status === ClientStatus.REVOKED
    );

    if (existingEntry) {
      // Reuse the existing entry — reset to PENDING
      existingEntry.status = ClientStatus.PENDING;
      existingEntry.requestedAt = new Date();
      existingEntry.approvedAt = undefined;
    } else {
      // First time joining this manager — push new entry
      managerDoc.clients.push({
        clientId: clientObjId,
        status: ClientStatus.PENDING as ClientStatus,
        requestedAt: new Date(),
      });
    }
    updatedDoc = await managerDoc.save();
  } else {
    updatedDoc = await ClientManagement.create({
      managerId: managerObjId,
      clientLimit: clientLimit,
      clients: [
        {
          clientId: clientObjId,
          status: ClientStatus.PENDING as ClientStatus,
          requestedAt: new Date(),
        },
      ],
    });
  }

  return updatedDoc;
};

/**
 * Service: Get all clients of a Transport Manager (with search & pagination).
 * Uses $unwind on embedded clients array → $lookup for user info → $facet for count + data.
 *
 * @param {string} managerId - The Transport Manager's user ID.
 * @param {SearchQueryInput} query - Pagination and search parameters.
 * @returns {Promise<{ data; totalData; totalPages }>} - Paginated client list.
 */
const getClientsByManagerId = async (
  managerId: string,
  query: SearchQueryInput
): Promise<{ data: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;

  // Build aggregation: match manager → unwind clients → filter active → lookup user info
  const basePipeline: mongoose.PipelineStage[] = [
    { $match: { managerId: new mongoose.Types.ObjectId(managerId) } },
    { $unwind: '$clients' },
    {
      $match: {
        'clients.status': { $ne: ClientStatus.REVOKED },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'clients.clientId',
        foreignField: '_id',
        as: 'clientInfo',
        pipeline: [
          {
            $project: {
              password: 0,
              resetToken: 0,
              resetTokenExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationTokenExpiry: 0,
            },
          },
        ],
      },
    },
    { $unwind: '$clientInfo' },
    {
      $project: {
        _id: 0,
        clientId: '$clients.clientId',
        status: '$clients.status',
        requestedAt: '$clients.requestedAt',
        approvedAt: '$clients.approvedAt',
        client: '$clientInfo',
      },
    },
  ];

  // Search filter on client fields
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { 'client.fullName': { $regex: searchKey, $options: 'i' } },
          { 'client.email': { $regex: searchKey, $options: 'i' } },
          { 'client.phone': { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  // Single $facet for count + paginated data
  const [result] = await ClientManagement.aggregate([
    ...basePipeline,
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: (pageNo - 1) * showPerPage }, { $limit: showPerPage }],
      },
    },
  ]);

  const totalData = result.metadata[0]?.total ?? 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { data: result.data, totalData, totalPages };
};

/**
 * Service: Get the Transport Manager of a client.
 * Searches across all manager documents for a matching clientId with active status.
 *
 * @param {string} clientId - The client's user ID.
 * @returns {Promise<any>} - The manager info with client's status detail.
 */
const getManagerByClientId = async (clientId: string): Promise<any> => {
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const assignment = await ClientManagement.findOne({
    clients: {
      $elemMatch: {
        clientId: clientObjId,
        status: {
          $in: [
            ClientStatus.PENDING,
            ClientStatus.APPROVED,
            ClientStatus.LEAVE_REQUESTED,
            ClientStatus.REMOVE_REQUESTED,
          ],
        },
      },
    },
  })
    .populate({
      path: 'managerId',
      select:
        '-password -resetToken -resetTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry',
    })
    .lean();

  if (!assignment) throw new Error('No Transport Manager assigned to this client');

  // Extract the specific client entry
  const clientEntry = assignment.clients.find(
    (c) => c.clientId.toString() === clientId
  );

  return {
    manager: assignment.managerId,
    clientStatus: clientEntry?.status,
    requestedAt: clientEntry?.requestedAt,
    approvedAt: clientEntry?.approvedAt,
  };
};

/**
 * Service: Remove (revoke) a client from their Transport Manager's team.
 * Sets the client's status to REVOKED instead of deleting for audit trail.
 *
 * @param {string} clientId - The client's user ID.
 * @returns {Promise<{ modifiedCount: number }>} - Number of records updated.
 */
const removeClientFromManager = async (
  clientId: string
): Promise<{ modifiedCount: number }> => {
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const result = await ClientManagement.updateOne(
    {
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: {
            $in: [
              ClientStatus.PENDING,
              ClientStatus.APPROVED,
              ClientStatus.LEAVE_REQUESTED,
              ClientStatus.REMOVE_REQUESTED,
            ],
          },
        },
      },
    },
    { $set: { 'clients.$.status': ClientStatus.REVOKED } }
  );

  if (result.modifiedCount === 0) throw new Error('No active assignment found for this client');
  return { modifiedCount: result.modifiedCount };
};

/**
 * Service: Get client limit status for a Transport Manager.
 * Reads from the single manager document — counts active clients (pending + approved).
 *
 * @param {string} managerId - The Transport Manager's user ID.
 * @returns {Promise<IClientLimitStatus>} - The limit, current count, and remaining.
 */
const getClientLimit = async (managerId: string): Promise<IClientLimitStatus> => {
  const managerDoc = await ClientManagement.findOne({
    managerId: new mongoose.Types.ObjectId(managerId),
  })
    .select('clientLimit clients.status')
    .lean();

  const clientLimit = managerDoc?.clientLimit ?? 4;
  const currentClients =
    managerDoc?.clients.filter((c) => c.status !== ClientStatus.REVOKED).length ?? 0;

  return {
    clientLimit,
    currentClients,
    remaining: clientLimit - currentClients,
  };
};

/**
 * Service: Update client limit for a Transport Manager (Admin only).
 * Upserts — creates the document if the manager doesn't have one yet.
 *
 * @param {string} managerId - The Transport Manager's user ID.
 * @param {UpdateClientLimitInput} data - The new client limit.
 * @returns {Promise<{ clientLimit: number }>} - The updated limit.
 */
const updateClientLimit = async (
  managerId: string,
  data: UpdateClientLimitInput
): Promise<{ clientLimit: number }> => {
  await ClientManagement.updateOne(
    { managerId: new mongoose.Types.ObjectId(managerId) },
    { $set: { clientLimit: data.clientLimit } },
    { upsert: true }
  );

  return { clientLimit: data.clientLimit };
};

/**
 * Service: Get all pending join requests for a Transport Manager.
 * Unwinds the embedded clients array, filters by PENDING status, and lookups user info.
 *
 * @param {string} managerId - The Transport Manager's user ID (from req.user._id).
 * @returns {Promise<any[]>} - Array of pending requests with client info.
 */
const getPendingRequests = async (managerId: string): Promise<any[]> => {
  const [result] = await ClientManagement.aggregate([
    { $match: { managerId: new mongoose.Types.ObjectId(managerId) } },
    { $unwind: '$clients' },
    { $match: { 'clients.status': ClientStatus.PENDING } },
    {
      $lookup: {
        from: 'users',
        localField: 'clients.clientId',
        foreignField: '_id',
        as: 'clientInfo',
        pipeline: [
          {
            $project: {
              password: 0,
              resetToken: 0,
              resetTokenExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationTokenExpiry: 0,
            },
          },
        ],
      },
    },
    { $unwind: '$clientInfo' },
    {
      $group: {
        _id: null,
        requests: {
          $push: {
            clientId: '$clients.clientId',
            status: '$clients.status',
            requestedAt: '$clients.requestedAt',
            client: '$clientInfo',
          },
        },
      },
    },
    { $project: { _id: 0, requests: 1 } },
  ]);

  return result?.requests ?? [];
};

/**
 * Service: Approve or reject a pending join request.
 * Updates the client's status in the embedded array. If approved, sets approvedAt.
 *
 * @param {string} managerId - The Transport Manager's user ID (from req.user._id).
 * @param {string} clientId - The client's user ID (from URL param).
 * @param {UpdateJoinRequestInput} data - { status: "approved" | "revoked" }.
 * @returns {Promise<{ clientId: string; status: string }>} - Updated status.
 */
const updateJoinRequest = async (
  managerId: string,
  clientId: string,
  data: UpdateJoinRequestInput
): Promise<{ clientId: string; status: string }> => {
  const managerObjId = new mongoose.Types.ObjectId(managerId);
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  // Build the $set object — only set approvedAt if status is approved
  const updateFields: Record<string, any> = {
    'clients.$.status': data.status,
  };
  if (data.status === 'approved') {
    updateFields['clients.$.approvedAt'] = new Date();
  }

  const result = await ClientManagement.updateOne(
    {
      managerId: managerObjId,
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: ClientStatus.PENDING,
        },
      },
    },
    { $set: updateFields }
  );

  if (result.modifiedCount === 0) {
    throw new Error('No pending request found for this client');
  }

  return { clientId, status: data.status };
};

/**
 * Service: Get all active Transport Managers (id + name).
 * For standalone users to browse and select a manager to request joining.
 *
 * @returns {Promise<{ _id: string; fullName: string }[]>} - List of active managers.
 */
const getManagerList = async (): Promise<{ _id: any; fullName: string }[]> => {
  return User.find(
    { role: UserRole.TRANSPORT_MANAGER, isActive: true },
    { _id: 1, fullName: 1 }
  ).lean();
};

// ═══════════════════════════════════════════════════════════════
//  LEAVE REQUEST FLOW (Client → Manager)
//  Client requests to leave → Manager accepts/rejects
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Client requests to leave their Transport Manager's team.
 * Changes the client's status from APPROVED → LEAVE_REQUESTED.
 * clientId comes from the authenticated user's token.
 *
 * @param {string} clientId - The client's user ID (from req.user._id).
 * @returns {Promise<{ managerId: string; status: string }>} - Updated status info.
 */
const requestLeave = async (
  clientId: string
): Promise<{ managerId: string; status: string }> => {
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const result = await ClientManagement.findOneAndUpdate(
    {
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: ClientStatus.APPROVED,
        },
      },
    },
    { $set: { 'clients.$.status': ClientStatus.LEAVE_REQUESTED } },
    { returnDocument: 'after', projection: { managerId: 1 } }
  );

  if (!result) {
    throw new Error(
      'No approved assignment found. You must be an approved member to request leave.'
    );
  }

  return { managerId: result.managerId.toString(), status: ClientStatus.LEAVE_REQUESTED };
};

/**
 * Service: Get all leave requests for the authenticated Transport Manager.
 * Unwinds the embedded clients array, filters by LEAVE_REQUESTED status, and lookups user info.
 *
 * @param {string} managerId - The Transport Manager's user ID (from req.user._id).
 * @returns {Promise<any[]>} - Array of leave requests with client info.
 */
const getLeaveRequests = async (managerId: string): Promise<any[]> => {
  const [result] = await ClientManagement.aggregate([
    { $match: { managerId: new mongoose.Types.ObjectId(managerId) } },
    { $unwind: '$clients' },
    { $match: { 'clients.status': ClientStatus.LEAVE_REQUESTED } },
    {
      $lookup: {
        from: 'users',
        localField: 'clients.clientId',
        foreignField: '_id',
        as: 'clientInfo',
        pipeline: [
          {
            $project: {
              password: 0,
              resetToken: 0,
              resetTokenExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationTokenExpiry: 0,
            },
          },
        ],
      },
    },
    { $unwind: '$clientInfo' },
    {
      $group: {
        _id: null,
        requests: {
          $push: {
            clientId: '$clients.clientId',
            status: '$clients.status',
            requestedAt: '$clients.requestedAt',
            approvedAt: '$clients.approvedAt',
            client: '$clientInfo',
          },
        },
      },
    },
    { $project: { _id: 0, requests: 1 } },
  ]);

  return result?.requests ?? [];
};

/**
 * Service: Transport Manager accepts or rejects a client's leave request.
 * accept → status becomes REVOKED (client leaves the team).
 * reject → status goes back to APPROVED (client stays).
 *
 * @param {string} managerId - The Transport Manager's user ID (from req.user._id).
 * @param {string} clientId - The client's user ID (from URL param).
 * @param {ActionInput} data - { action: "accept" | "reject" }.
 * @returns {Promise<{ clientId: string; action: string; newStatus: string }>} - Result.
 */
const handleLeaveRequest = async (
  managerId: string,
  clientId: string,
  data: ActionInput
): Promise<{ clientId: string; action: string; newStatus: string }> => {
  const managerObjId = new mongoose.Types.ObjectId(managerId);
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const newStatus =
    data.action === 'accept' ? ClientStatus.REVOKED : ClientStatus.APPROVED;

  const result = await ClientManagement.updateOne(
    {
      managerId: managerObjId,
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: ClientStatus.LEAVE_REQUESTED,
        },
      },
    },
    { $set: { 'clients.$.status': newStatus } }
  );

  if (result.modifiedCount === 0) {
    throw new Error('No leave request found for this client');
  }

  return { clientId, action: data.action, newStatus };
};

// ═══════════════════════════════════════════════════════════════
//  REMOVE REQUEST FLOW (Manager → Client)
//  Manager requests to remove → Client accepts/rejects
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Transport Manager requests to remove a client from their team.
 * Changes the client's status from APPROVED → REMOVE_REQUESTED.
 *
 * @param {string} managerId - The Transport Manager's user ID (from req.user._id).
 * @param {string} clientId - The client's user ID (from URL param).
 * @returns {Promise<{ clientId: string; status: string }>} - Updated status info.
 */
const requestRemove = async (
  managerId: string,
  clientId: string
): Promise<{ clientId: string; status: string }> => {
  const managerObjId = new mongoose.Types.ObjectId(managerId);
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const result = await ClientManagement.updateOne(
    {
      managerId: managerObjId,
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: ClientStatus.APPROVED,
        },
      },
    },
    { $set: { 'clients.$.status': ClientStatus.REMOVE_REQUESTED } }
  );

  if (result.modifiedCount === 0) {
    throw new Error(
      'No approved client found with this ID in your team'
    );
  }

  return { clientId, status: ClientStatus.REMOVE_REQUESTED };
};

/**
 * Service: Client checks if they have a pending remove request from their manager.
 * Searches across all manager documents for a matching clientId with REMOVE_REQUESTED status.
 *
 * @param {string} clientId - The client's user ID (from req.user._id).
 * @returns {Promise<any>} - Remove request info with manager details, or null.
 */
const getRemoveRequest = async (clientId: string): Promise<any> => {
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const [result] = await ClientManagement.aggregate([
    {
      $match: {
        clients: {
          $elemMatch: {
            clientId: clientObjId,
            status: ClientStatus.REMOVE_REQUESTED,
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'managerId',
        foreignField: '_id',
        as: 'managerInfo',
        pipeline: [
          {
            $project: {
              password: 0,
              resetToken: 0,
              resetTokenExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationTokenExpiry: 0,
            },
          },
        ],
      },
    },
    { $unwind: '$managerInfo' },
    { $unwind: '$clients' },
    {
      $match: {
        'clients.clientId': clientObjId,
        'clients.status': ClientStatus.REMOVE_REQUESTED,
      },
    },
    {
      $project: {
        _id: 0,
        managerId: 1,
        manager: '$managerInfo',
        status: '$clients.status',
        requestedAt: '$clients.requestedAt',
        approvedAt: '$clients.approvedAt',
      },
    },
  ]);

  return result ?? null;
};

/**
 * Service: Client accepts or rejects a remove request from their manager.
 * accept → status becomes REVOKED (client is removed from the team).
 * reject → status goes back to APPROVED (client stays).
 *
 * @param {string} clientId - The client's user ID (from req.user._id).
 * @param {ActionInput} data - { action: "accept" | "reject" }.
 * @returns {Promise<{ clientId: string; action: string; newStatus: string }>} - Result.
 */
const handleRemoveRequest = async (
  clientId: string,
  data: ActionInput
): Promise<{ clientId: string; action: string; newStatus: string }> => {
  const clientObjId = new mongoose.Types.ObjectId(clientId);

  const newStatus =
    data.action === 'accept' ? ClientStatus.REVOKED : ClientStatus.APPROVED;

  const result = await ClientManagement.updateOne(
    {
      clients: {
        $elemMatch: {
          clientId: clientObjId,
          status: ClientStatus.REMOVE_REQUESTED,
        },
      },
    },
    { $set: { 'clients.$.status': newStatus } }
  );

  if (result.modifiedCount === 0) {
    throw new Error('No remove request found for your account');
  }

  return { clientId, action: data.action, newStatus };
};

// Export all service functions as a namespace
export const clientManagementServices = {
  createClient,
  requestJoinTeam,
  getPendingRequests,
  updateJoinRequest,
  getClientsByManagerId,
  getManagerByClientId,
  getManagerList,
  removeClientFromManager,
  getClientLimit,
  updateClientLimit,
  requestLeave,
  getLeaveRequests,
  handleLeaveRequest,
  requestRemove,
  getRemoveRequest,
  handleRemoveRequest,
};